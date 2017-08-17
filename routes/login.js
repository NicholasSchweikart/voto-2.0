/**
 * Login router file for Voto system.
 * @type {*|createApplication}
 */
const express = require("express"),
  router = express.Router(),
  db = require("../bin/userDB");

/**
 * Handles login for the entire API. Please post a json login object @ voto.io/database/login
 * Form {userName:xxxx, password:xxxx}
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

    req.session.userId = user.userId;
    req.session.authorizedSessionId = null;

    const { passwordHash, passwordSalt, ...response } = user;

    res.json(response);
  });
});

/**
 * POST logs a user out of the system by destroying there session.
 */
router.post("/logout", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "ER_NOT_LOGGED_IN" });
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      console.error(new Error(`logout failure: ${err}`));
      res.status(500).json({ error: err });
    } else {
      res.json({ status: "success" });
    }
  });
});

module.exports = router;
