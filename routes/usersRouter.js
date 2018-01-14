/**
 * Database operations routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require("express"),
  router = express.Router(),
  db = require("../bin/userDB"),
  jwt = require('jsonwebtoken'),
  serverConfig = require('../serverConfig');

/**
 * @api {post} api/users/createUser Add a new user to the system.
 * @apiName Create New User
 * @apiGroup User
 * @apiPermission ALL
 *
 * @apiParam {String} firstName The users first name.
 * @apiParam {String} lastName The users last name.
 * @apiParam {String} userName The users intended user name.
 * @apiParam {String} email The users email account.
 * @apiParam {String} password The users new password.
 * @apiParam {String} type The users type (S = Student, T = Teacher).
 *
 * @apiParamExample {json} Request Example
 * {"userName":"User123", "password":"password", "email":"t@t.com","type":"T", "firstName":"Bob", "lastName":"Villa"}
 *
 * @apiSuccess (201) {json} user The new user.
 * @apiSuccessExample {json} The user object and a new access token
 *    HTTP/1.1 200 OK
 *    [{
 *       "user": {
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
 * @apiError (500) USER_NAME_IN_USE This user name is already taken
 * @apiErrorExample {json} error
 * HTTP/1.1 500
 * [
 *  {"error":"USER_NAME_IN_USE"}
 * ]
 */
router.post("/createUser", (req, res) => {

  const newUser = req.body;

  db.createUser(newUser, (err, user) => {
    if (err) {
      console.log(`Failed creating new user: ${err}`);
      res.status(500).json({ error: err });
      return;
    }

    const { passwordHash, passwordSalt, ...response } = user;

    res.json(response);
  });
});

/**
 * POST to update a user password. Expecting body of {currentPassword:xxx, newPassword:xxx}
 */
router.post("/updatePassword", (req, res) => {
  //TODO integrate token auth

  db.changeUserPassword(req.session.userId, req.body.currentPassword, req, body.newPassword, (err) => {
    if (err) {
      res.status(500).json({ error: err });
    }
    res.json({ status: "success" });
  });
});

/**
 * @api {delete} api/users/ Remove a user from the system.
 * @apiName Delete User
 * @apiGroup User
 * @apiPermission ANY USER WITH TOKEN
 *
 * @apiHeader {String} Authorization Users access token.

 * @apiSuccess (200) {json} user The new user.
 * @apiSuccessExample {json} The user object and a new access token
 *    HTTP/1.1 200 OK
 *    ["success"]
 *
 * @apiError (500) USER_DOESNT_EXIST This user ID is invalid
 * @apiErrorExample {json} error
 * HTTP/1.1 500
 * [
 *  {"error":"USER_DOESNT_EXIST"}
 * ]
 */
router.delete("/", (req, res) => {
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

    db.deleteUser(user.userId, (err, deleted) => {

      if (err) {
        return res.status(403).json({ error: err });
      }
      if(deleted){
        res.status(200).send("success");
      }
    });
  });
});

router.post("/changeUserAuthorization/:authorizeId/:classId/:allowAccess", (req, res) => {

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

    db.authorizeUser(user.userId, req.params.authorizeId, req.params.classId, req.params.allowAccess, (err, success) => {
      if (err) {
        console.error(new Error(`authorization failure: ${err}`));
        return res.status(500).json({ error: err });
      }

      if (!success) {
        return res.status(500).json({ error: "ER_FAILED_TO_CHANGE_AUTHORIZATION" });
      }

      res.json({ status: "success"});
    });
  });
});

module.exports = router;
