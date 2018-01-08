/**
 * Media Upload routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require("express"),
  router = express.Router(),
  db = require("../bin/presentationsDB"),
  slidesDb = require("../bin/slidesDB"),
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

  db.saveNewPresentation(req.user.userId, req.body, (err, newSession) => {
    if (err) {
      console.error(new Error(`saving new session: ${err}`));
      return res.status(500).json({error: err});
    }
    return res.json(newSession);
  });
});

/**
 * POST to update an existing session. Refer to db.updatePresentation() for details.
 */
router.post("/updatePresentation", (req, res) => {

  db.updatePresentation(req.user.userId, req.body, (err, updated) => {
    if (err) {
      console.error(new Error(`Updating presentation: ${err}`));
      return res.status(500).json({error: err});
    }
    return res.json(updated);
  });
});

/**
 * POST to save an array of new questions for a session.
 */
router.post("/savePresentationSlides", (req, res) => {

  const slides = req.body.slides;
  const uploadErrors = [];
  const dbErrors = [];
  const userId = req.user.userId;

  async.each(slides, (slide, _cb) => {

    // Check if its a new slide
    if (!slide.slideId) {

      // Save the new question to DB
      slidesDb.saveNewSlide(userId, slide, (err) => {
        if (err) {
          console.error(new Error(`Saving slide to DB: ${err}`));
          dbErrors.push(slide);
        }
        _cb(null);
      });
    } else {

      // Update the question in the DB
      slidesDb.updateSlide(userId, slide, (err) => {
        if (err) {
          console.error(new Error(`Updating slide: ${err}`));
          dbErrors.push(slide);
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
    res.json({questions: slides});
  });
});

/**
 * POST to put a specific presentation into the active state.
 */
router.post("/activatePresentation/:presentationId", (req, res) => {

  let presentationId = req.params.presentationId;

  db.togglePresentation(req.user.userId, presentationId, true, (err, activated) => {

      if (err) {
        return res.status(500).json({error: err});
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

/**
 * POST to put a specific presentation into the in active state.
 */
router.post("/de-activateSession/:presentationId", (req, res) => {

  let presentationId = req.params.presentationId;

  db.togglePresentation(req.user.userId, presentationId, false, (err, activated) => {

    if (err) {
      res.status(500).json({error: err});
      return;
    }

    // Set array for socket.io operations to happen without DB interaction.
    if (activated) {

      // Alert all sockets
      socketAPI.emitSessionActivated(presentationId); //TODO change to deactivated

      // Alert the user that the operation was successful
      res.json({ status: "de-activated"});
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
 * DELETE route to remove a question from the DB. URL: /deleteSlide?questionId=x&imgFileName=x
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
    db.deleteSlide(req.params.questionId, (err) => {
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
 * DELETE route to remove a session from the DB. URL "/deletePresentation?sessionId=xx"
 */
router.delete("/deletePresentation/:sessionId", (req, res) => {

  db.deletePresentation(req.params.sessionId, req.user.userId, (err) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json({status: "success"});
  });
});

/**
 * GET method to retrieve a specific presentation for a userId. URL "/presentation/xx"
 */
router.get("/:presentationId", (req, res) => {

  if (!req.params.presentationId) {
    return res.status(500).json({error: "ERR_NO_PRES_ID"});
  }

  db.getPresentation( req.user.userId, req.params.presentationId, (err, presentation) => {
    if (err) {
      return res.status(500).json({error: err});
    }

    res.json({session: presentation});
  });
});

/**
 * GET method to return all slides for a specific session. URL:"/sessionQuestions?sessionId=xxxx".
 */
router.get("/:presentationId/allSlides", (req, res) => {

  db.getPresentationSlides(req.params.presentationId, req.user.userId, (err, slides) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json({slides});
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

module.exports = router;
