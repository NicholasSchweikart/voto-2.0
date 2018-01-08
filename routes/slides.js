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
 * POST to put a specific slide into the active state.
 */
router.post("/activateSlide/:slideId", (req, res) => {

  let slideId = req.params.presentationId;

  db.toggleSlide(req.user.userId, slideId, true, (err, activated) => {

    if (err) {
      return res.status(500).json({error: err});
    }

    // Set array for socket.io operations to happen without DB interaction.
    if (activated) {

      //TODO Alert all sockets

      // Alert the user that the operation was successful
      res.json({ status: "activated"});
    }
  });
});

/**
 * POST to put a specific slide into the active state.
 */
router.post("/de-activateSlide/:slideId", (req, res) => {

  let slideId = req.params.presentationId;

  db.toggleSlide(req.user.userId, slideId, false, (err, activated) => {

    if (err) {
      return res.status(500).json({error: err});
    }

    // Set array for socket.io operations to happen without DB interaction.
    if (activated) {

      //TODO Alert all sockets

      // Alert the user that the operation was successful
      res.json({ status: "activated"});
    }
  });
});

/**
 * GET method to return a single slide.
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

/**
 * POST save a user response to a question in the DB.
 */
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