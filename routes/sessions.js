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
  socketAPI = require("../socketAPI").api,
  jwt = require('jsonwebtoken'),
  serverConfig = require('../serverConfig');

AWS.config.region = "us-east-2";

const s3 = new AWS.S3({
  signatureVersion: "v4",
});

/**
 * Preforms token authorization on all incoming requests.
 */
router.all('/*', (req, res, next) => {

  let token = req.body.authorization || req.headers['authorization'];

  if (!token) {
    res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
    return;
  }

  jwt.verify(token,serverConfig.secret,(err, user) =>{

    if(err){
      console.log(`decode err: ${err}`);
      return res.json({success:false, msg: "failed to decode token"});
    }

    console.log(`user = ${JSON.stringify(user)}`);
    req.user = user;

    // Continue on to the next route match.
    next();
  });

});

/**
 * POST to save a new session for a user.
 */
router.post("/saveNewPresentation", (req, res) => {

  const newPresentation = req.body;
  //TODO alert jay he needs to provide a class ID now.
  db.saveNewPresentation(newPresentation, req.user.userId, req.body.classId, (err, newSession) => {
    if (err) {
      console.error(new Error(`saving new session: ${err}`));
      res.status(500).json({error: err});
    } else {
      res.json(newSession);
    }
  });
});

/**
 * POST to update an existing session. Refer to db.updatePresentation() for details.
 */
router.post("/updatePresentation", (req, res) => {

  const presenationUpdate = req.body;

  db.updatePresentation(presenationUpdate, req.user.userId, (err, updated) => {
    if (err) {
      console.error(new Error(`Updating presentation: ${err}`));
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
  const userId = req.user.userId;

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
      db.updateSlide(question, userId, (err) => {
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
 * POST to put a specific presentation into the active state.
 */
router.post("/activatePresentation/:presentationId", (req, res) => {

  let presentationId = req.params.presentationId;

  db.togglePresentation(req.user.userId, presentationId, true, (err, activated) => {

      if (err) {
        res.status(500).json({error: err});
        return;
      }

      // Set array for socket.io operations to happen without DB interaction.
      if (activated) {

        // Alert all sockets
        socketAPI.emitSessionActivated(presentationId);

        // Alert the user that the operation was successful
        res.json({ status: "activated"});
      }
    });
});

router.post("/de-activateSession/:sessionId", (req, res) => {

  let presentationId = req.params.presentationId;

  db.togglePresentation(req.user.userId, presentationId, false, (err, activated) => {

    if (err) {
      res.status(500).json({error: err});
      return;
    }

    // Set array for socket.io operations to happen without DB interaction.
    if (activated) {

      // Alert all sockets
      socketAPI.emitSessionActivated(presentationId);

      // Alert the user that the operation was successful
      res.json({ status: "de-activated"});
    }
  });
});

/**
 * GET all the active sessions as of current.
 */
router.get("/active", (req, res) => {
  db.getActiveSessions(req.user.userId, (err, sessions) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json(sessions);
  })
});

/**
 * POST save a user response to a question in the DB.
 */
router.post('/saveResponse/:sessionId/:questionId', (req, res) => {

  db.saveResponse(req.user.userId, req.params.questionId, req.body, (err) => {

    if (err) {
      res.status(500).json({error: err});
    } else {

      res.json({status: "success"});

      db.getSessionOwner(req.params.sessionId, (err, teacherId) => {

        if (err) {
          console.error(new Error(`Owner lookup error: ${err}`))
        } else {
          // Alert the teacher through their private channel
          socketAPI.emitUserResponse({...req.body, userId: req.user.userId}, teacherId);
        }
      });
    }
  });
});

/**
 * POST activate a question in the DB for user access.
 */
router.post('/activateQuestion/:questionId', (req, res) => {

  db.activateQuestion(req.user.userId, req.params.questionId, (err, sessionId) => {
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

  db.deactivateQuestion(req.user.userId, req.params.questionId, (err, sessionId) => {
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

  db.deleteSession(req.params.sessionId, req.user.userId, (err) => {
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
  };

  let userId = req.user.userId;
  console.log(`userID: ${userId}`);
  if (req.query.favorite) {
    db.getFavoriteSessions(userId, _cb);
  } else if (req.query.recent) {
    db.getRecentSessions(userId, _cb);
  } else {
    db.getAllPresentations(userId, _cb);
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

  db.getSession(req.params.sessionId, req.user.userId, (err, sessions) => {
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

  db.getSessionQuestions(req.params.sessionId, req.user.userId, (err, questions) => {
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

  db.getQuestion(req.user.userId, req.params.questionId, (err, question) => {
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
