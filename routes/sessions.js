/**
 * Media Upload routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require("express"),
  router = express.Router(),
  db = require("../bin/sessionDB"),
  userDb = require("../bin/userDB"),
  formidable = require("formidable"),
  fs = require("fs"),
  uuidv4 = require("uuid/v4"),
  path = require("path"),
  async = require("async"),
  AWS = require("aws-sdk"),
  socketAPI = require("../socketAPI").api;

AWS.config.region = "us-east-2";

const s3 = new AWS.S3({
  signatureVersion: "v4",
});

/**
 * Preforms userId session authorization on all incoming requests.
 */
router.all('/*', (req, res, next) => {

  if (!req.session.userId) {
    res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
    return;
  }
  next();
});

/**
 * POST to save a new session for a user.
 */
router.post("/saveNewSession", (req, res) => {

  const newSession = req.body;

  db.saveNewSession(newSession, req.session.userId, (err, newSession) => {
    if (err) {
      console.error(new Error(`saving new session: ${err}`));
      res.status(500).json({error: err});
    } else {
      res.json(newSession);
    }
  });
});

/**
 * POST to update an existing session. Refer to db.updateSession() for details.
 */
router.post("/updateSession", (req, res) => {

  const sessionUpdate = req.body;

  db.updateSession(sessionUpdate, req.session.userId, (err, updated) => {
    if (err) {
      console.error(new Error(`Updating session: ${err}`));
      res.status(500).json({error: err});
    } else {
      res.json(updated);
    }
  });
});

/**
 * POST to save an array of new questions for a session.
 */
router.post("/saveSessionQuestions", (req, res) => {

  const questions = req.body.questions;
  const uploadErrors = [];
  const dbErrors = [];
  const userId = req.session.userId;

  async.each(questions, (question, _cb) => {
    // Check if its a new question
    if (!question.questionId) {
      // Save the new question to DB
      db.saveNewQuestion(question, userId, (err) => {
        if (err) {
          console.error(new Error(`saving question to DB: ${err}`));
          dbErrors.push(question);
        }
        _cb(null);
      });
    } else {
      // Update the question in the DB
      db.updateQuestion(question, userId, (err) => {
        if (err) {
          console.error(new Error(`updating question: ${err}`));
          dbErrors.push(question);
        }
        _cb(null);
      });
    }
  }, () => {
    if (uploadErrors.length || dbErrors.length) {
      res.status(500).json({
        uploadErrors,
        dbErrors,
      });
      return;
    }

    console.log("saved successfully");
    res.json({questions});
  });
});

/**
 * POST to put a specific session into the active state.
 */
router.post("/activateSession/:sessionId", (req, res) => {

    db.toggleSession(req.session.userId, req.params.sessionId, (err, activated) => {

      if (err) {
        res.status(500).json({error: err});
        return;
      }

      // Set cookie for socket.io operations to happen without DB interaction.
      if (activated == 1) {
        req.session.activeSessionId = req.params.sessionId;
        // Alert all sockets
        socketAPI.emitSessionActivated(req.params.sessionId);
        res.json({ status: "activated" });
      } else {
        socketAPI.emitSessionDeactivated(req.params.sessionId);
        res.json({ status: "deactivated" });
      }  
    });
});

/**
 * GET all the active sessions as of current.
 */
router.get("/active", (req, res) => {
  db.getActiveSessions(req.session.userId, (err, sessions) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json(sessions);
  })
});

/**
 * GET sets HTTP cookie to authorize a user for session access.
 * NOTE: this does not mean that a session is active, only that this user is allowed to join that sessions room,
 * and post votes once it is active.
 */
router.get("/accessSession/:sessionId", (req, res) => {

  if (!req.params.sessionId) {
    res.status(500).json({error: "ERR_NO_SESSION_ID"});
    return;
  }

  let userId = req.session.userId,
    sessionId = req.params.sessionId;

  console.log(`Authorizing userId [${userId}] for sessionId [${sessionId}]`);

  userDb.isUserAuthorized(userId, sessionId, (err, yes) => {
    if (err) {
      res.status(500).json({error: err});
    } else if (!yes) {
      res.status(401).json({error: err});
    } else {

      // Assign the session.authorizedSessionId to this session.
      req.session.authorizedSessionId = sessionId;
      res.json({status: "successfully authorized"});
    }
  });
});

/**
 * POST save a user response to a question in the DB.
 */
router.post('/saveResponse/:sessionId/:questionId', (req, res) => {

  db.saveResponse(req.session.userId, req.params.questionId, req.body, (err) => {

    if (err) {
      res.status(500).json({error: err});
    } else {

      res.json({status: "success"});

      db.getSessionOwner(req.params.sessionId, (err, teacherId) => {

        if (err) {
          console.error(new Error(`Owner lookup error: ${err}`))
        } else {
          // Alert the teacher through their private channel
          socketAPI.emitUserResponse(req.body, teacherId);
        }
      });
    }
  });
});

/**
 * POST activate a question in the DB for user access.
 */
router.post('/activateQuestion/:questionId', (req, res) => {

  db.activateQuestion(req.session.userId, req.params.questionId, (err, sessionId) => {
    if (err) {
      res.status(500).json({error: err});
    } else {
      res.json({status: "success"});

      // Alert the room to the new question
      socketAPI.emitNewQuestion(req.params.questionId, sessionId);
    }
  });
});

/**
 * POST activate a question in the DB for user access.
 */
router.post('/deactivateQuestion/:questionId', (req, res) => {

  db.deactivateQuestion(req.session.userId, req.params.questionId, (err, sessionId) => {
    if (err) {
      res.status(500).json({error: err});
    } else {
      res.json({status: "success"});

      // Alert the room to the new question
      socketAPI.emitNewQuestion(req.params.questionId, sessionId);
    }
  });
});

/**
 * POST route to upload new media for a specific session. Under beta right now, but will at some point need to have
 * access to a sessionId.
 */
router.post("/uploadImageFile", (req, res) => {

  // create an incoming form object
  const form = new formidable.IncomingForm();

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, "../uploads");

  // every time a file has been uploaded successfully
  form.on("file", (field, file) => {
    const newFileName = `${uuidv4()}_${file.name}`;
    const fileStream = fs.createReadStream(file.path);
    fileStream.on("error", (err) => {
      console.error(new Error(`file stream error: ${err}`));
    });

    let params = {
      Bucket: "voto-question-images",
      Key: newFileName,
      Body: fileStream,
    };

    s3.putObject(params, (err, data) => {
      if (err) {
        console.error(new Error(`uploading new image file: ${err}`));
        res.status(500).json({error: 1});
        return;
      }

      console.log("S3 Upload Success");
      fs.unlink(file.path);

      // TODO generate signed URL for return.
      params = {Bucket: "voto-question-images", Key: newFileName, Expires: 10 * 60}; // 10 minutes

      s3.getSignedUrl("getObject", params, (err, url) => {
        if (err) {
          console.error(new Error(`generating signed image URL: ${err}`));
          return;
        }

        console.log("The URL is", url);
        res.json({
          url,
          imgFileName: newFileName,
        });
      });
    });
  });

  // log any errors that occur
  form.on("error", (err) => {
    console.error(new Error(`file upload: ${err}`));
    res.status(500).send(err);
  });

  // parse the incoming request containing the form data
  form.parse(req);
});

/**
 * DELETE route to remove a question from the DB. URL: /deleteQuestion?questionId=x&imgFileName=x
 */
router.delete("/:questionId/image/:imgFileName", (req, res) => {

  console.log(`Deleting object ${req.params.imgFileName}`);

  const removeImage = (imgFileName) => {
    const params = {
      Bucket: "voto-question-images",
      Key: imgFileName,
    };
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error(new Error("ER_S3_DELETE"));
        res.status(500).json({error: "ER_S3_DELETE"});
        return;
      }

      res.json({status: "success"});
    });
  };


  if (req.params.questionId > 0) {
    // Delete this questionId from the DB.
    db.deleteQuestion(req.params.questionId, (err) => {
      if (err) {
        console.error(new Error(err));
        res.status(500).json({error: err});
        return;
      }

      if (req.params.imgFileName) {
        removeImage(req.params.imgFileName);
      } else {
        res.json({status: "success"});
      }
    });
  } else if (req.params.imgFileName) {
    removeImage(req.params.imgFileName);
  }
});

/**
 * DELETE route to remove a session from the DB. URL "/deleteSession?sessionId=xx"
 */
router.delete("/deleteSession/:sessionId", (req, res) => {

  db.deleteSession(req.params.sessionId, req.session.userId, (err) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json({status: "success"});
  });
});

/**
 * GET method to retrieve all sessions for a userId. no URL modification need because userId is in the cookie.
 */
router.get("/", (req, res) => {

  const _cb = (err, sessions) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }

    res.json({ sessions });
  }

  console.log(req.query);

  if (req.query.favorite) {
    db.getFavoriteSessions(req.session.userId, _cb); 
  } else if (req.query.recent) {
    db.getRecentSessions(req.session.userId, _cb);
  } else {
    db.getAllSessions(req.session.userId, _cb); 
  }
});

/**
 * GET method to retrieve all sessions for a userId. URL "/session?sessionId=xx"
 */
router.get("/session/:sessionId", (req, res) => {

  if (!req.params.sessionId) {
    res.status(500).json({error: "ERR_NO_SESSION_ID"});
    return;
  }

  db.getSession(req.params.sessionId, req.session.userId, (err, sessions) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json({session: sessions});
  });
});

/**
 * GET method to return all questions for a specific session. URL:"/sessionQuestions?sessionId=xxxx".
 */
router.get("/sessionQuestions/:sessionId", (req, res) => {

  db.getSessionQuestions(req.params.sessionId, req.session.userId, (err, questions) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json({questions});
  });
});

/**
 * GET method to return a single question. URL:"/question?questionId=xxxx".
 */
router.get("/question/:questionId", (req, res) => {

  db.getQuestion(req.session.userId, req.params.questionId, (err, question) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json({question});
  });
});

/**
 * GET method to return a one time URL to view a question image slide. URL:"/sessionQuestions?sessionId=xxxx.ext".
 */
router.get("/questionImageURL/:imgFileName", (req, res) => {

  if (!req.params.imgFileName) {
    res.status(500).json({error: "ER_NO_FILENAME"});
  }

  const imgFileName = req.params.imgFileName;
  const params = {Bucket: "voto-question-images", Key: imgFileName, Expires: 10 * 60};

  s3.getSignedUrl("getObject", params, (err, url) => {
    if (err) {
      console.error(new Error(`generating signed image URL: ${err}`));
      return;
    }

    console.log("The URL is", url);
    res.json({
      url,
    });
  });
});

/**
 * GET inital route to manually load all active session for a user.
 */
router.get("/getActiveSessions", (req, res) => {

});

module.exports = router;
