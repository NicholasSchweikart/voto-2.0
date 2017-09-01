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
  if (
    !newUser.firstName ||
    !newUser.lastName ||
    !newUser.password ||
    !newUser.userName ||
    !newUser.type ||
    !newUser.email
  ) {
    _cb("must provide all new user credentials");
    return;
  }

  // Get the hash and salt for the provided password
  const passwordData = passwordUtil.getSaltHashPassword(newUser.password);

  const sql =
    "INSERT INTO users (firstName, lastName, userName, passwordSalt, passwordHash, email, type ) VALUES(?,?,?,?,?,?,?)";
  const params = [
    newUser.firstName,
    newUser.lastName,
    newUser.userName,
    passwordData.salt,
    passwordData.passwordHash,
    newUser.email,
    newUser.type,
  ];

  mySQL.query(sql, params, (err) => {
    if (err) {
      _cb(err);
    } else {
      const returnSql = "SELECT * FROM users where userName=?";
      const returnParams = [newUser.userName];

      mySQL.query(returnSql, returnParams, (err2, users) => {
        if (err2) {
          _cb(err2.code);
          return;
        }

        if (users.length === 0) {
          _cb("Something when wrong on fetching user from table!");
          return;
        }

        _cb(null, users[0]);
      });
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

  console.log(
    "Changing password for userId [%d] from %s -> %s",
    userId,
    currentPassword,
    newPassword,
  );

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
    const thisHash = passwordUtil.getPasswordHash(
      currentPassword,
      user.passwordSalt,
    );

    if (thisHash === user.passwordHash) {
      // User has double authenticated themselves, go ahead and change password.
      // Get the hash and salt for the provided password
      const passwordData = passwordUtil.getSaltHashPassword(newPassword);

      mySQL.query(
        "UPDATE users SET passwordSalt = ?, passwordHash = ? WHERE userId = ?",
        [passwordData.salt, passwordData.passwordHash, userId],
        (err) => {
          if (err) {
            _cb("ER_FAILED_TO_SAVE_NEW_PASSWORD");
            return;
          }

          _cb("SUCCESS");
        },
      );
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

  console.log(
    "Checking authorization for userId %d on sessionId %d",
    userId,
    sessionId,
  );

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
 * Authorizes a specific userId to access a sessionId when it is active
 * @param authorizeId the userId to authorize
 * @param userId the userId to authorize this transaction
 * @param sessionId the sessionId of the session to authorize for this user
 * @param _cb callback
 */
exports.authorizeUser = (userId, authorizeId, sessionId, _cb) => {
  if (!authorizeId || !userId || !sessionId) {
    _cb("ER_EMPTY_PARAMETERS");
    return;
  }

  console.log(`userId [${userId}] is authorizing userId [${authorizeId}] for sessionId [${sessionId}]`);
  const sql = "CALL authorize_user(?, ?, ?)";
  const params = [userId, authorizeId, sessionId];

  mySQL.query(sql, params, (err, rows) => {
    if (err) {
      _cb(err.code);
      return;
    }

    // NOTE data will be returned in a RowDataPacket so double index the array
    return _cb(null, rows[0][0].success);
  });
};

/**
 * de-authorizes a specific userId to access a sessionId when it is active
 * @param de_authorizeId the userId to authorize
 * @param userId the userId to authorize this transaction
 * @param sessionId the sessionId of the session to authorize for this user
 * @param _cb callback
 */
exports.deauthorizeUser = (userId, de_authorizeId, sessionId, _cb) => {
  if (!de_authorizeId || !userId || !sessionId) {
    _cb("ER_EMPTY_PARAMETERS");
    return;
  }

  console.log(`userId [${userId}] is de-authorizing userId [${de_authorizeId}] for sessionId [${sessionId}]`);
  const sql = "CALL de_authorize_user(?, ?, ?)";
  const params = [userId, de_authorizeId, sessionId];

  mySQL.query(sql, params, (err, rows) => {
    if (err) {
      _cb(err.code);
      return;
    }

    // NOTE data will be returned in a RowDataPacket so double index the array
    if (rows[0][0].success === 0) {
      _cb("ER_NOT_AUTHORIZED");
      return;
    }

    return _cb(null, rows[0][0].success);
  });
};

