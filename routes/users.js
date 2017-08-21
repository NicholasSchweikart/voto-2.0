/**
 * Database operations routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require("express"),
  router = express.Router(),
  db = require("../bin/userDB");

/**
 * Creates a new user in the voto system. Post json {firstName:xxx, lastName:xxx, userName:xxx, password:xxx}
 * @ voto.io/database/createUser
 */
router.post("/createUser", (req, res) => {

  const newUser = req.body;
  db.createUser(newUser, (err, user) => {
    if (err) {
      console.error(new Error(`creating new user: ${err}`));
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
  if (!req.session.userId) {
    res.status(401).json({ error: "ER_NOT_LOGGED_IN" });
    return;
  }

  db.changeUserPassword(req.session.userId, req.body.currentPassword, req, body.newPassword, (err) => {
    if (err) {
      res.status(500).json({ error: err });
    }
    res.json({ status: "success" });
  });
});

/**
 * DELETE to delete a user from the system.
 */
router.delete("/", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "ER_NOT_LOGGED_IN" });
    return;
  }

  db.deleteUser(req.session.userId, (err) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        console.error(new Error(`logout failure: ${err}`));
        res.status(500).json({ error: err });
      } else {
        res.json({ status: "successful delete" });
      }
    });
  });
});

router.post('/authorizeUser/:authorizeId/:sessionId', (req, res) => {

  if (!req.session.userId) {
    res.status(401).json({ error: "ER_NOT_LOGGED_IN" });
    return;
  }

  db.authorizeUser(req.session.userId, req.params.authorizeId, req.params.sessionId,(err, authorized)=>{

    if (err) {
      console.error(new Error(`authorization failure: ${err}`));
      res.status(500).json({ error: err });
    } else if(!authorized){
      res.status(500).json({ error: "ER_FAILED_TO_AUTHORIZE" });
    }else{
      res.json({ status: "successful authorization" });
    }
  });

});

router.post('/de_authorizeUser/:de_authorizeId/:sessionId', (req, res) => {

  if (!req.session.userId) {
    res.status(401).json({ error: "ER_NOT_LOGGED_IN" });
    return;
  }

  db.deauthorizeUser(req.session.userId, req.params.de_authorizeId, req.params.sessionId,(err, status)=>{

    if (err) {
      console.error(new Error(`de-authorization failure: ${err}`));
      res.status(500).json({ error: err });
    } else{
      res.json({ status: status });
    }
  });

});

module.exports = router;
