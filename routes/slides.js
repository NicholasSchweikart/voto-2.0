const express = require("express"),
  router = express.Router(),
  db = require("../bin/slidesDB"),
  userDb = require("../bin/userDB"),
  formidable = require("formidable"),
  fs = require("fs"),
  uuidv4 = require("uuid/v4"),
  path = require("path"),
  async = require("async"),
  socketAPI = require("../socketAPI").api,
  jwt = require('jsonwebtoken'),
  serverConfig = require('../serverConfig');

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
 * @api {post} api/slides/:slideId/activate Activate a specific slide
 * @apiName Activate Slide
 * @apiGroup Slides
 * @apiPermission ADMIN ONLY
 * @apiParam {Number} slideId Slides' unique ID.
 *
 * @apiSuccess (200) {String} ACTIVATED Slide Activated.
 * @apiSuccessExample {String} ACTIVATED
 *    HTTP/1.1 200 OK
 *    ["ACTIVATED"]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not allowed to modify this presentation.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.post("/:slideId/activate", (req, res) => {

  let slideId = req.params.slideId;

  db.toggleSlide(req.user.userId, slideId, true, (err, activeSlideId) => {

    if (err) {
      return res.status(500).json({error: err});
    }

    // Set array for socket.io operations to happen without DB interaction.
    if (activeSlideId) {

      //TODO Alert all sockets

      // Alert the user that the operation was successful
      res.status(200).send("ACTIVATED");
    }
  });
});

/**
 * @api {post} api/slides/:slideId/de-activate De-Activate a specific slide
 * @apiName De-Activate Slide
 * @apiGroup Slides
 * @apiPermission ADMIN ONLY
 * @apiParam {Number} slideId Slides' unique ID.
 *
 * @apiSuccess (200) {String} DE_ACTIVATED Slide De-Activated.
 * @apiSuccessExample {String} DE_ACTIVATED
 *    HTTP/1.1 200 OK
 *    ["DE_ACTIVATED"]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not allowed to modify this presentation.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.post("/:slideId/de-activate", (req, res) => {

  let slideId = req.params.slideId;

  db.toggleSlide(req.user.userId, slideId, false, (err, deactiveSlideId) => {

    if (err) {
      return res.status(500).json({error: err});
    }

    // Set array for socket.io operations to happen without DB interaction.
    if (deactiveSlideId) {

      //TODO Alert all sockets

      // Alert the user that the operation was successful
      res.status(200).send("DE_ACTIVATED");
    }
  });
});

/**
 * @api {get} api/slides/:slideId Get a specific slide
 * @apiName Get Slide
 * @apiGroup Slides
 * @apiPermission ALL
 *
 * @apiParam {Number} slideId The unique ID of the slide to retrieve.
 *
 * @apiSuccess (200) {json} object Slide json data
 * @apiSuccessExample {json} The slide object and a new access token
 *    HTTP/1.1 200 OK
 *    [{
 *        "slideId": 1,
 *        "userId": 1,
 *        "classId": 1,
 *        "presentationId": 1,
 *        "imgFileName": "9e7f6fb9-adde-4459-bdc6-e5b17a3b1a42_example.jpg",
 *        "isActive": 0,
 *        "dateCreated": "2017-08-23T05:42:03.000Z"
 *   }
 *   ]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not authorized.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.get("/slide/:slideId", (req, res) => {

  db.getSlide(req.user.userId, req.params.slideId, (err, slide) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json({question: slide});
  });
});

router.post('/saveResponse/:sessionId/:questionId', (req, res) => {

  db.saveResponse(req.user.userId, req.params.questionId, req.body, (err) => {

    if (err) {
      res.status(500).json({error: err});
    } else {

      res.json({status: "success"});

      db.getPresentationOwner(req.params.sessionId, (err, teacherId) => {

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
 * @api {delete} api/slides/:slideId/ De-Activate a specific slide
 * @apiName De-Activate Slide
 * @apiGroup Slides
 * @apiPermission ADMIN ONLY
 * @apiParam {Number} slideId Slides' unique ID.
 *
 * @apiSuccess (200) {String} DE_ACTIVATED Slide De-Activated.
 * @apiSuccessExample {String} DE_ACTIVATED
 *    HTTP/1.1 200 OK
 *    ["DE_ACTIVATED"]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not allowed to modify this presentation.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.delete("/:slideId/image/:imgFileName", (req, res) => {

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


  if (req.params.slideId > 0) {

    // Delete this questionId from the DB.
    db.deleteSlide(req.params.slideId, (err) => {
      if (err) {
        console.log(`Error on delete: ${err}`);
        return res.status(500).json({error: err});
      }

      if (req.params.imgFileName) {
        removeImage(req.params.imgFileName);
        return;
      }

      res.json({status: "success"});
    });
  } else if (req.params.imgFileName) {

    removeImage(req.params.imgFileName);
  }
});

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
    res.json({url});
  });
});

module.exports = router;