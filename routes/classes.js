const express = require("express"),
  router = express.Router(),
  db = require("../bin/classesDB"),
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
 * @api {get} api/classes Get all classes for a user
 * @apiName Request all user classes
 * @apiGroup Classes
 * @apiPermission ALL
 *
 * @apiHeader {String} Authorization Users access token.
 *
 * @apiSuccess (200) {json} classes Array of class data
 * @apiSuccessExample {json} The user object and a new access token
 *    HTTP/1.1 200 OK
 *    [
 *    {
 *   "classes": [
 *       {
 *           "classId": 1,
 *           "userId": 1,
 *           "className": "English 101",
 *           "totalPresentations": 7,
 *           "dateCreated": "2018-01-10T02:46:49.000Z",
 *           "description": null,
 *           "timeStamp": 1515548809
 *       },
 *       {
 *            "classId": 2,
 *           "userId": 1,
 *           "className": "Stats 101",
 *           "totalPresentations": 3,
 *            "dateCreated": "2018-01-10T02:46:49.000Z",
 *            "description": null,
 *            "timeStamp": 1515548809
 *        }
 *    ]
 *     }
 *    ]
 */
router.get("/", (req, res) => {

  db.getAllClasses(req.user.userId, (err, classes)=>{
    if (err) {
      return res.status(500).json({error: err});
    }

    res.json({classes: classes});
  });
});

module.exports = router;