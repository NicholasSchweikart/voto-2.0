/**
 * Login router file for Voto system.
 * @type {*|createApplication}
 */
const express = require("express"),
  router = express.Router(),
  db = require("../bin/userDB"),
  jwt = require('jsonwebtoken'),
  serverConfig = require('../serverConfig');

/**
 * @api {post} api/login Login as a specific user
 * @apiName Login User
 * @apiGroup Login
 * @apiPermission ALL
 *
 * @apiParam {String} userName Users unique name.
 * @apiParam {String} password Users account password.
 *
 * @apiParamExample {json} Request Example
 * {"userName":"User123", "password":"password"}
 *
 * @apiSuccess {String} success Login worked.
 * @apiSuccessExample {json} The user object and a new access token
 *    HTTP/1.1 200 OK
 *    [{
 *   "user": {
 *       "userId": 1,
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "userName": "User123",
 *       "creationDate": "2017-08-23T03:35:50.000Z",
 *       "type": "T",
 *       "email": "teacher@teacher.com"
 *   },
 *   "token": "eyJhbGciOiJ...."
 * }]
 */
router.post("/", (req, res) => {

  const password = req.body.password;
  const userName = req.body.userName;

  db.loginUser(userName, password, (err, user) => {

    if (err) {
      console.error(new Error(`failed to login: ${err}`));
      res.status(401).json({ error: err });
      return;
    }

    // Assign the session.authorizedSessionId to this session.
    const { passwordHash, passwordSalt, ...response } = user;

    // Create and send token
    jwt.sign(response,serverConfig.secret,{expiresIn:60*60*24}, (err, token)=>{
      if(err)
        res.status(500).json({error: err});
      else
        res.json({user:response,token:token});
    });

    //TODO we dont need these anymore, offload to DB transaction in the socket.
    // db.getAuthorizedClasses(user.userId, (err, authorizedSessions) => {
    //
    //   if (err) {
    //     res.status(500).json({error: err});
    //   }else {
    //
    //     // Assign the session.authorizedSessionId to this session.
    //     const { passwordHash, passwordSalt, ...response } = user;
    //
    //     // Create and send token
    //     jwt.sign(response,serverConfig.secret,{expiresIn:60*60*24}, (err, token)=>{
    //       if(err)
    //         res.status(500).json({error: err});
    //       else
    //         res.json({user:response,token:token});
    //     });
    //   }
    // });
  });
});

/**
 * POST logs a user out of the system by destroying there session.
 */
router.post("/logout", (req, res) => {
  if (!req.user.userId) {
    res.status(401).json({ error: "ER_NOT_LOGGED_IN" });
  }
});

module.exports = router;
