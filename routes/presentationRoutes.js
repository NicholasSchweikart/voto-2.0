/**
 * Media Upload routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require("express"),
  router = express.Router(),
  db = require("../bin/presentationsDB"),
  slidesDb = require("../bin/slidesDB"),
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

    req.user = user;

    // Continue on to the next route match.
    next();
  });

});

/**
 * @api {get} api/presentation/:presentationId Get a specific presentation
 * @apiName Request Presentation
 * @apiGroup Presentations
 * @apiPermission ALL
 *
 * @apiParam {Number} presentationId The unique ID of the presentation to retrieve.
 *
 * @apiSuccess (200) {json} presentation Presentation json data
 * @apiSuccessExample {json} The presentation data
 *    HTTP/1.1 200 OK
 *    [{
 *       "presentationId": 1,
 *        "userId": 1,
 *        "classId": 1,
 *        "title": "asdf",
 *        "isActive": 0,
 *        "totalSlides": 0,
 *        "useCount": 31,
 *        "description": "asdf",
 *        "isFavorite": 0,
 *        "dateLastUsed": "2018-01-10T02:17:49.000Z",
 *        "dateCreated": "2017-08-23T05:42:03.000Z"
 *   }
 *   ]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not allowed to get this presentation.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.get("/:presentationId", (req, res) => {

  if (!req.params.presentationId) {
    return res.status(500).json({error: "ERR_NO_PRES_ID"});
  }

  db.getPresentation( req.user.userId, req.params.presentationId, (err, presentation) => {
    if (err) {
      return res.status(500).json({error: err});
    }

    res.json(presentation);
  });
});

/**
 * @api {get} api/presentations/:presentationId/allSlides Get all slides for a presentation
 * @apiName Request Presentation Slides
 * @apiGroup Presentations
 * @apiPermission ADMIN ONLY
 *
 * @apiParam {Number} presentationId The unique ID of the presentation to retrieve slides for.
 *
 * @apiSuccess (200) {json} slides Array of slides
 * @apiSuccessExample {json} The user object and a new access token
 *    HTTP/1.1 200 OK
 *    [{
 *           "slideId": 5,
 *           "userId": 1,
 *           "classId": 1,
 *           "presentationId": 7,
 *           "imgFileName": "9e7f6fb9-adde-4459-bdc6-e5b17a3b1a42_viklander.jpg",
 *           "isActive": 0,
 *           "dateCreated": "2017-08-26T20:47:09.000Z",
 *           "question": null,
 *           "orderNumber": 0,
 *           "correctAnswer": null,
 *           "timeStamp": 1503776829
 *       },
 *        {
 *            "slideId": 6,
 *            "userId": 1,
 *            "classId": 1,
 *            "presentationId": 7,
 *            "imgFileName": "27305fbf-8631-47d9-98a2-7bb127a7ce53_viklander.jpg",
 *            "isActive": 0,
 *            "dateCreated": "2017-08-27T14:35:26.000Z",
 *            "question": null,
 *            "orderNumber": 0,
 *            "correctAnswer": null,
 *            "timeStamp": 1503840926
 *        }
 *   ]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not authorized.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.get("/:presentationId/allSlides", (req, res) => {

  db.getPresentationSlides(req.user.userId, req.params.presentationId,(err, slides) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.json(slides);
  });
});

/**
 * @api {post} /saveNewPresentation Request to save a new presentation
 * @apiPermission admin
 * @apiGroup Presentations
 * @apiName Save New Presentation
 * @apiParam {Number} presentationId Presentations unique ID.
 * @apiParam {Number} classId Presentations parent class.
 * @apiParam {String} title Presentations new title.
 * @apiParam {String} description Presentations quick description.
 * @apiParamExample {json} Request Example
 * {"classId":1, "title":"PHY 101", "description":"Physics..."}
 * @apiSuccess (200) {json} object The new Presentation.
 * @apiSuccessExample {json} The new presentation data
 *    HTTP/1.1 200 OK
 *    [{
 *      "presentationId:"1",
 *      "classId":"1",
 *      "title":"PHY 101",
 *      "description":"Physics...",
 *      "totalSlides":2,
 *      "useCount":0,
 *      "dateLastUsed": 201923943,
 *      "dateCreated": 2010210312
 *    }]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not authorized or resource not possible.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
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
 * @api {patch} api/presentations/ Update fields in a presentation
 * @apiPermission ADMIN ONLY
 * @apiGroup Presentations
 * @apiName Update Presentation
 * @apiParam {Number} presentationId Presentations unique ID.
 * @apiParam {String} title Presentations new title.
 * @apiParam {String} description Presentations quick description.
 * @apiParamExample {json} Request Example
 * {"presentationId":1, "title":"PHY 101", "description":"Physics..."}
 * @apiSuccess (200) {json} update The new Presentation.
 * @apiSuccessExample {json} The new presentation data
 *    HTTP/1.1 200 OK
 *    [{
 *      "presentationId:"1",
 *      "classId":"1",
 *      "title":"PHY 101",
 *      "description":"Physics...",
 *      "totalSlides":2,
 *      "useCount":0,
 *      "dateLastUsed": 201923943,
 *      "dateCreated": 2010210312
 *    }]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not authorized.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.patch("/", (req, res) => {

  db.updatePresentation(req.user.userId, req.body, (err, updatedPresentation) => {

    if (err) {
      console.log(`Updating presentation: ${err}`);
      return res.status(500).json({error: err});
    }

    return res.json(updatedPresentation);
  });
});

//TODO resolve with jay if we need this still.
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
 * @api {post} api/presentations/:presentationId/activate Activate a specific presentation
 * @apiName Activate Presentation
 * @apiGroup Presentations
 * @apiPermission ADMIN ONLY
 * @apiParam {Number} presentationId Presentations unique ID.
 *
 * @apiSuccess (200) {String} success Presentation Activated.
 * @apiSuccessExample {json} ACTIVATED This Presentation ID is now active.
 *    HTTP/1.1 200 OK
 *    ["ACTIVATED"]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not allowed to activate this presentation.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.post("/:presentationId/activate", (req, res) => {

  let presentationId = req.params.presentationId;

  db.togglePresentation(req.user.userId, presentationId, true, (err, activated) => {

      if (err) {
        return res.status(403).json({error: err});
      }

      // Set array for socket.io operations to happen without DB interaction.
      if (activated) {

        // Alert all sockets
        //socketAPI.emitSessionActivated(presentationId);

        // Alert the user that the operation was successful
        res.status(200).send("ACTIVATED");
      }
    });
});

/**
 * @api {post} api/presentations/:presentationId/activate De-Activate a specific presentation
 * @apiName De-Activate Presentation
 * @apiGroup Presentations
 * @apiPermission ADMIN ONLY
 * @apiParam {Number} presentationId Presentations unique ID.
 *
 * @apiSuccess (200) {String} DE_ACTIVATED Presentation Activated.
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
router.post("/:presentationId/de-activate", (req, res) => {

  let presentationId = req.params.presentationId;

  db.togglePresentation(req.user.userId, presentationId, false, (err, activated) => {

    if (err) {
      return res.status(403).json({error: err});
    }

    // Set array for socket.io operations to happen without DB interaction.
    if (activated) {

      // Alert all sockets
      //socketAPI.emitSessionActivated(presentationId);

      // Alert the user that the operation was successful
      res.status(200).send("DE_ACTIVATED");
    }
  });
});

/**
 * @api {delete} api/presentations/:presentationId Delete a specific presentation
 * @apiName Delete Presentation
 * @apiGroup Presentations
 * @apiPermission ADMIN ONLY
 * @apiParam {Number} presentationId Presentations unique ID.
 *
 * @apiSuccess (200) {String} SUCCESS Presentation has been deleted.
 * @apiSuccessExample {json} SUCCESS
 *    HTTP/1.1 200 OK
 *    ["SUCCESS"]
 *
 * @apiError (500) UN_AUTHORIZED This user ID is not allowed to delete this presentation.
 * @apiErrorExample {String} UN_AUTHORIZED
 * HTTP/1.1 500
 * [
 *  "UN_AUTHORIZED"
 * ]
 */
router.delete("/:presentationId", (req, res) => {

  db.deletePresentation(req.params.sessionId, req.user.userId, (err) => {
    if (err) {
      res.status(500).json({error: err});
      return;
    }

    res.status(200).send("SUCCESS");
  });
});

module.exports = router;
