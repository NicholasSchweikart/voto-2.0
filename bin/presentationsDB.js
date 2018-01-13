const mySQL = require("./mySqlUtility");

/**
 * Saves a new presentation in the DB for a user.
 * @param userId the userId for the owner of this presentation
 * @param newPresentation the presentation fields to save
 * @param _cb callback
 */
exports.saveNewPresentation = (userId, newPresentation, _cb) => {
  console.log(`Attempting to create a presentation for userId: ${userId}`);

  if (
    !newPresentation ||
    !newPresentation.classId ||
    !newPresentation.title ||
    !newPresentation.description
  ) {
    return _cb("failed one or more empty session parameters");
  }

  const sql = "CALL save_new_presentation(?, ?, ?, ?)";
  const params = [
    userId,
    newPresentation.classId,
    newPresentation.title,
    newPresentation.description
  ];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data.length === 0) {
      return _cb("ER_FAILED_TO_CREATE_PRESENTATION");
    }
    _cb(null, data[0]);
  });
};

/**
 * Updates a presentation that already exists.
 * @param presentationUpdate all fields and their changes
 * @param userId the userid for the owner of this presentation
 * @param _cb callback
 */
exports.updatePresentation = (userId, presentationUpdate, _cb) => {

  if (!presentationUpdate) {
    return _cb("failed one or more empty session parameters");
  }

  console.log(`Updating presentationId ${presentationUpdate.presentationId} for userId ${userId}`);

  const sql = "CALL update_presentation(?,?,?,?)";
  const params = [
    userId,
    presentationUpdate.presentationId,
    presentationUpdate.title,
    presentationUpdate.description
  ];

  mySQL.query(sql, params, (err, presentation) => {
    if (err) {
      return _cb(err.code);
    }

    if (presentation[0][0]["UN_AUTHORIZED"]) {
      return _cb("UN_AUTHORIZED");
    }

    return _cb(null, presentation[0][0]);
  });
};

/**
 * Returns a single presentation associated with a presentationId.
 * @param presentationId the sessionId to get
 * @param userId the id of the user for authorization
 * @param _cb callback
 */
exports.getPresentation = (userId, presentationId, _cb) => {
  if (!presentationId) {
    return _cb("ER_NO_USER_ID");
  }

  console.log(`Retrieving presentationId: ${presentationId}`);

  const sql = "CALL get_presentation(?,?)";
  const params = [userId, presentationId];

  mySQL.query(sql, params, (err, presentation) => {
    if (err) {
      return _cb(err.code);
    }

    // Return the records.
    _cb(null, presentation[0][0]);
  });
};

/**
 * Deletes a single session associated with a sessionId.
 * @param userId the userId of the presentation owner
 * @param presenationId the presentationId to delete
 * @param _cb callback
 */
exports.deletePresentation = (userId, presenationId, _cb) => {
  //TODO finish
};

/**
 * Activates a session in the DB.
 * @param userId the owners userId for authorization.
 * @param presentationId the session to activate.
 * @param newState the new state to put the session in. Active = true
 * @param _cb callback(err)
 */
exports.togglePresentation = (userId, presentationId, newState, _cb) => {

  if (!userId || !presentationId) {
    _cb("ER_NEED_SESSION_AND_USER_IDS");
    return;
  }

  console.log(`Toggling presentationId ${presentationId} -> ${newState}`);

  const sql = "call change_presentation_activation(?, ?, ?)";
  const params = [userId, presentationId, newState];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data[0][0]["UN_AUTHORIZED"]) {
      return _cb("UN_AUTHORIZED");
    }

    return _cb(null, true);
  });
};

/**
 * Gets all slides associated with a presentation.
 * @param userId id of the owning user
 * @param presentationId id of the presentation
 * @param _cb callback
 */
exports.getPresentationSlides = (userId, presentationId, _cb) => {

  if (!userId || !presentationId) {
    _cb("ER_NO_SESSION_OR_USER_ID");
    return;
  }

  console.log(`Retrieving all slides for presentationId ${presentationId}`);

  const sql = "CALL get_presentation_slides(?,?)";
  const params = [userId, presentationId];

  mySQL.query(sql, params, (err, slides) => {

    if (err) {
      return _cb(err.code);
    }

    if (slides[0][0]["NOT_AUTHORIZED"]) {
      return _cb("NOT_AUTHORIZED");
    }

    // Return the questions
    _cb(null, slides[0]);
  });
};

/**
 * Gets a users favorite sessions from the DB.
 * @param userId the user ID to get sessions for.
 * @param _cb callback(err, sessions[])
 */
exports.getFavoriteSessions = (userId, _cb) => {
  if (!userId) {
    _cb("failed one or more empty session parameters");
    return;
  }

  console.log(`Retrieving favorite sessions for user: ${userId}`);

  const sql = `SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp, UNIX_TIMESTAMP(dateLastUsed) as timeStampLast 
               FROM sessions 
               WHERE userId = ? and isFavorite = 1 
               ORDER BY timeStamp DESC`;
  const params = [userId];

  mySQL.query(sql, params, (err, sessions) => {
    if (err) {
      _cb(err.code);
      return;
    }

    // Return the records.
    _cb(null, sessions);
  });
};

/**
 * Gets the most recent sessions for a user.
 * @param userId the user ID to get sessions for.
 * @param _cb callback(err, sessions)
 */
exports.getRecentSessions = (userId, _cb) => {
  if (!userId) {
    _cb("failed one or more empty session parameters");
    return;
  }

  console.log(`Retrieving recent sessions for user: ${userId}`);

  const sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp, UNIX_TIMESTAMP(dateLastUsed) as timeStampLast FROM sessions WHERE userId = ? ORDER BY timeStampLast DESC LIMIT 5";
  const params = [userId];

  mySQL.query(sql, params, (err, sessions) => {
    if (err) {
      _cb(err.code);
      return;
    }

    // Return the records.
    _cb(null, sessions);
  });
};


