const express = require("express"),
  router = express.Router(),
  db = require("../bin/classesDB"),
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
 * GET retrieve all classes that a userId owns.
 */
router.get("/", (req, res) => {

  db.getAllClasses(req.user.userId, (err, classes)=>{
    if (err) {
      return res.status(500).json({error: err});
    }

    res.json({classes: classes});
  });
});