const mySQL = require("./mySqlUtility"),
  passwordUtil = require("./passwordUtility");

/**
 * Adds a new user to the data base if possible.
 * @param newUser user object from post request
 * @param _cb callback
 */
exports.createUser = (newUser, _cb) => {
  console.log("Attempting to create user...");

  // Sanitize inputs preemptive;
  if (!newUser.firstName || !newUser.lastName || !newUser.password || !newUser.userName) {
    _cb("must provide all new user credentials");
    return;
  }

  // Get the hash and salt for the provided password
  const passwordData = passwordUtil.getSaltHashPassword(newUser.password);

  const sql = "INSERT INTO users (firstName, lastName, userName, passwordSalt, passwordHash ) VALUES(?,?,?,?,?)";
  const params = [newUser.firstName, newUser.lastName, newUser.userName, passwordData.salt, passwordData.passwordHash];

  mySQL.query(sql, params, (err) => {
    if (err) {
      _cb(err);
    } else {
      _cb(null, "user created");
    }
  });
};

/**
 * Deletes a userId from the data base.
 * @param userId the id of the user to remove
 * @param _cb callback
 */
exports.deleteUser = (userId, _cb) => {
  console.log("Deleting userId [%d]", userId);

  if (!userId) {
    _cb("ER_NO_USER_ID");
    return;
  }

  const sql = "DELETE FROM users WHERE userId = ?";
  const params = [userId];

  mySQL.query(sql, params, (err) => {
    if (err) {
      _cb(err);
    } else {
      _cb(null, "USER_DELETED");
    }
  });
};

/**
 * Attempts to login a user with the provided credentials.
 * @param userName the users name
 * @param password the users password
 * @param _cb callback
 */
exports.loginUser = (userName, password, _cb) => {
  console.log(`Attempting login FOR: ${userName} PASSWORD: ${password}`);

  if (!userName || !password) {
    _cb("ER_LOGIN_FAILED");
    return;
  }

  const sql = "SELECT * FROM users WHERE userName = ?";
  const params = [userName];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (data.length === 0) {
      _cb("No user found with this name!");
      return;
    }

    const user = data[0];
    const thisHash = passwordUtil.getPasswordHash(password, user.passwordSalt);

    if (thisHash === user.passwordHash) {
      _cb(null, user);
    } else {
      _cb("ERR_LOGIN_FAILED");
    }
  });
};

/**
 * Changes a users password for login.
 * @param userId the users userId
 * @param currentPassword the current password for login
 * @param newPassword the new password
 * @param _cb callback
 */
exports.changeUserPassword = (userId, currentPassword, newPassword, _cb) => {
  if (!userId || !currentPassword || !newPassword) {
    return _cb("ER_EMPTY_FIELDS");
  }

  console.log("Changing password for userId [%d] from %s -> %s", userId, currentPassword, newPassword);

  const sql = "SELECT * FROM users WHERE userId = ?";
  const params = [userId];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (data.length === 0) {
      _cb("ER_NO_USER");
      return;
    }

    const user = data[0];
    const thisHash = passwordUtil.getPasswordHash(currentPassword, user.passwordSalt);

    if (thisHash === user.passwordHash) {
      // User has double authenticated themselves, go ahead and change password.
      // Get the hash and salt for the provided password
      const passwordData = passwordUtil.getSaltHashPassword(newPassword);

      mySQL.query("UPDATE users SET passwordSalt = ?, passwordHash = ? WHERE userId = ?",
        [passwordData.salt, passwordData.passwordHash, userId],
        (err) => {
          if (err) {
            _cb("ER_FAILED_TO_SAVE_NEW_PASSWORD");
            return;
          }

          _cb("SUCCESS");
        });
    } else {
      _cb("ERR_LOGIN_FAILED");
    }
  });
};

/**
 * Determines if a userId is authorized to access an active session.
 * @param userId the userId for the check
 * @param sessionId the sessionId for the check
 * @param _cb callback(err, yes) yes = true if authorised
 */
exports.isUserAuthorized = (userId, sessionId, _cb) => {
  if (!userId || !sessionId) {
    _cb("ER_NEED_SESSION_AND_USER_IDS");
    return;
  }

  console.log("Checking authorization for userId %d on sessionId %d", userId, sessionId);

  const sql = "SELECT * FROM authorized_users WHERE userId = ? AND sessionId=?";
  const params = [userId, sessionId];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (data.length === 0) {
      return _cb(null, false);
    }

    return _cb(null, true);
  });
};

/**
 * Saves a users response to a session question.
 * @param userResponse the response to save
 * @param userId the userId associated with the response
 * @param _cb callback(err, success)
 */
exports.saveUserResponse = (userResponse, userId, _cb) => {
  console.log(`Attempting to save a vote for USER: ${userId}`);

  if (!userResponse || !userResponse.answer) {
    _cb("failed one or more empty userResponse parameters");
    return;
  }

  const sql = "INSERT INTO user_responses (userId, title) VALUES (?, ?)";
  const params = [userId, newSession.title];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err);
    } else {
      _cb(null, data[0]);
    }
  });
};

