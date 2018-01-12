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
    return _cb("must provide all new user credentials");
  }

  // Get the hash and salt for the provided password
  const passwordData = passwordUtil.getSaltHashPassword(newUser.password);

  const sql = "CALL create_user(?,?,?,?,?,?,?)";

  const params = [
    newUser.firstName,
    newUser.lastName,
    newUser.userName,
    passwordData.salt,
    passwordData.passwordHash,
    newUser.type,
    newUser.email,
  ];

  mySQL.query(sql, params, (err, user) => {

    if (err) {
      return _cb(err);
    }

    if (user[0][0]["USER_NAME_IN_USE"]) {
      return _cb("USER_NAME_IN_USE");
    }

    // Return the new user to the caller
    return _cb(null, user[0][0]);
  });
};

/**
 * Deletes a userId from the data base.
 * @param userId the id of the user to remove
 * @param _cb callback
 */
exports.deleteUser = (userId, _cb) => {

  if (!userId) {
    _cb("ER_NO_USER_ID");
    return;
  }
  console.log("Deleting userId [%d]", userId);
  const sql = "CALL delete_user(?)";
  const params = [userId];

  mySQL.query(sql, params, (err,deleted) => {
    if (err) {
      return _cb(err);
    }
    if(deleted[0][0]["USER_DOESNT_EXIST"]) {
      return _cb("USER_DOESNT_EXIST");
    }
      console.log("Deleted userId [%d]", userId);
      _cb(null, true);
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

  const sql = "CALL get_user(?)";
  const params = [userName];

  mySQL.query(sql, params, (err, user) => {

    if (err) {
      return _cb(err.code);
    }

    if (user.length === 0) { //TODO fix error code gen
      return _cb("No user found with this name!");
    }

    user = user[0][0];
    const thisHash = passwordUtil.getPasswordHash(password, user.passwordSalt);

    if (thisHash === user.passwordHash) {
      return _cb(null, user);
    }

    return _cb("ERR_LOGIN_FAILED");
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
 * Retrieves all classes a user is authorized for.
 * @param userId the userId for the check
 * @param _cb callback(err, sessions) sessions = [sessionIDs]
 */
exports.getAuthorizedClasses = (userId, _cb) => {
  if (!userId) {
    _cb("ER_NEED_SESSION_AND_USER_IDS");
    return;
  }

  console.log(`Getting all authorized sessions for userId: ${userId}`);

  const sql = "CALL get_users_authorized_classes(?)";
  const params = [userId];

  mySQL.query(sql, params, (err, classes) => {
    if (err) {
      return _cb(err.code);
    }

    // Create the array of classIds that are valid.
    const authorizedClassIds = [];
    classes.map((row) => {
      authorizedIds.push(row.classId);
    });

    return _cb(null, authorizedIds);
  });
};

/**
 * Determines if a user is authorized to join the channel for a presentation.
 * @param userId the userId for the check
 * @param presentationId ID for presentation to check
 * @param _cb callback(err, yes) yes = true if authorized
 */
exports.canUserJoinPresentationChannel = (userId, presentationId, _cb) => {
  if (!userId || !presentationId) {
    return _cb("ER_NEED_ALL_IDS");
  }

  const sql = "CALL can_user_access_presentation(?,?)";
  const params = [userId, presentationId];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if(data.length === 0){
      return _cb("PERMISSION_DENIED");
    }

    return _cb(null, true);
  });
};