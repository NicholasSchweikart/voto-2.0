const mySQL = require("./mySqlUtility");

/**
 * Saves a new session in the DB for a user.
 * @param newSession the sessions object to save: '{title:"here"}'
 * @param userId the userId for this session
 * @param _cb callback function
 */
exports.saveNewSession = (newSession, userId, _cb) => {
  console.log(`Attempting to save a session for USER: ${userId}`);

  if (
    !newSession ||
    !newSession.title ||
    !newSession.className ||
    !newSession.description
  ) {
    _cb("failed one or more empty session parameters");
    return;
  }

  const sql = "CALL save_new_session(?, ?, ?, ?)";
  const params = [
    userId,
    newSession.title,
    newSession.className,
    newSession.description
  ];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err.code);
    } else {
      if (data.length === 0) {
        _cb("ER_FAILED_TO_SAVE_SESSION");
      }
      _cb(null, data[0]);
    }
  });
};

/**
 * Updates a sessions that already exists.
 * @param sessionUpdate '{updateArray:["title":"","group":"","totalQuestions":"","sessionId":""]}'
 * @param userId the id for the user to authorize this transaction
 * @param _cb callback
 */
exports.updateSession = (sessionUpdate, userId, _cb) => {
  console.log(sessionUpdate);

  if (!sessionUpdate) {
    _cb("failed one or more empty session parameters");
    return;
  }

  console.log(
    "Attempting to update sessionId [%d] for userId [%d]",
    sessionUpdate.sessionId,
    userId
  );

  const sql = "CALL update_session(?,?,?,?,?,?)";
  const params = [
    userId,
    sessionUpdate.sessionId,
    sessionUpdate.className,
    sessionUpdate.title,
    sessionUpdate.totalQuestions,
    sessionUpdate.description
  ];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err.code);
    } else {
      if (data.length === 0) {
        _cb("SOMETHING WHEN WRONG ON UPDATE");
      }

      _cb(null, data[0]);
    }
  });
};

/**
 * Returns an array of all sessions associated with a user.
 * @param userId the userId to get sessions for
 * @param _cb callback
 */
exports.getAllSessions = (userId, _cb) => {
  if (!userId) {
    _cb("failed one or more empty session parameters");
    return;
  }

  console.log(`Retrieving all sessions for user: ${userId}`);

  const sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp, UNIX_TIMESTAMP(dateLastUsed) as timeStampLast FROM sessions WHERE userId = ? ORDER BY timeStamp DESC";
  const params = [userId];

  mySQL.query(sql, params, (err, sessions) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (sessions.length === 0) {
      _cb("No Sessions for this ID");
      return;
    }

    // Return the records.
    _cb(null, sessions);
  });
};

/**
 * Returns the active sessions
 * @param userId the id of the user to query against
 * @param _cb callback
 */
exports.getActiveSessions = (userId, _cb) => {
  console.log(`Retrieving all active sessions for userId [${userId}]`);

  const sql = `SELECT
    sessions.sessionId,
    sessions.title,
    sessions.className,
    sessions.description,
    sessions.userId,
    sessions.isActive,
    users.firstName,
    users.lastName
    FROM votodb.authorized_users
    INNER JOIN votodb.sessions
    ON authorized_users.sessionId = sessions.sessionId
    INNER JOIN votodb.users
    ON users.userId = sessions.userId
    WHERE authorized_users.userId = ? AND sessions.isActive = 1;`;

  mySQL.query(sql, [userId], (err, sessions) => {
    if (err) {
      _cb(err.code);
      return;
    }

    _cb(null, sessions);
  });
};

/**
 * Returns a single session associated with a sessionId.
 * @param sessionId the sessionId to get
 * @param userId the id of the user for authorization
 * @param _cb callback
 */
exports.getSession = (sessionId, userId, _cb) => {
  if (!sessionId) {
    _cb("ER_NO_SESSION_ID");
    return;
  }

  console.log("Retrieving sessionId: [%d]", sessionId);

  const sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp FROM sessions WHERE sessionId = ? AND userId = ?";
  const params = [sessionId, userId];

  mySQL.query(sql, params, (err, session) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (session.length === 0) {
      _cb("No Session for this sessionId");
      return;
    }

    // Return the records.
    _cb(null, session);
  });
};

/**
 * Deletes a single session associated with a sessionId.
 * @param sessionId the sessionId to delete
 * @param userId the userId for the owner of the session
 * @param _cb callback
 */
exports.deleteSession = (userId, sessionId, _cb) => {
  if (!sessionId || !userId) {
    _cb("ER_NO_SESSION_OR_USER_ID");
    return;
  }

  console.log("Retrieving sessionId [%d] for userId [%d]", sessionId, userId);

  const sql = "DELETE FROM sessions WHERE sessionId = ? AND userId = ?";
  const params = [sessionId, userId];

  mySQL.query(sql, params, err => {
    if (err) {
      _cb(err.code);
      return;
    }

    // Return the records.
    _cb(null, "DELETE_SUCCESSFUL");
  });
};

/**
 * Saves a question to the DB for a session.
 * @param question the question data to save '{sessionId, imgFileName, question, correctAnswer}'
 * @param userId the userId for the session owner
 * @param _cb callback
 */
exports.saveNewQuestion = (question, userId, _cb) => {
  if (!question || !userId) {
    _cb("ER_NO_USER_ID_OR_QUESTION");
    return;
  }

  console.log(
    "Saving question for sessionId [%d] userId [%d] ",
    question.sessionId,
    userId
  );

  const sql = "CALL save_new_question(?,?,?,?,?,?)";
  const params = [
    userId,
    question.sessionId,
    question.imgFileName,
    question.question,
    question.orderNumber,
    question.correctAnswer
  ];

  mySQL.query(sql, params, (err, row) => {
    if (err) {
      _cb(err.code);
      return;
    }

    _cb(null, row);
  });
};

/**
 * Saves a question to the DB for a session.
 * @param question the question data to save '{sessionId, imgFileName, question, correctAnswer}'
 * @param userId the user id for authorization
 * @param _cb callback
 */
exports.updateQuestion = (question, userId, _cb) => {
  if (!question) {
    _cb("failed need question obj");
    return;
  }

  console.log(`Updating questionId: ${question.questionId}`);

  const sql = "CALL update_question(?,?,?,?,?,?,?)";
  const params = [
    userId,
    question.sessionId,
    question.questionId,
    question.imgFileName,
    question.question,
    question.orderNumber,
    question.correctAnswer
  ];

  mySQL.query(sql, params, (err, status) => {
    if (err) {
      _cb(err.code);
      return;
    }

    _cb(null, status);
  });
};

/**
 * Removes a question from the data base.
 * @param questionId the question ID to delete
 * @param _cb callback()
 */
exports.deleteQuestion = (questionId, _cb) => {
  if (!questionId) {
    _cb("ER_NEED_QUESTION_ID");
    return;
  }

  console.log(`Deleting questionId %d${questionId}`);

  const sql = "DELETE FROM questions WHERE questionId = ?";
  const params = [questionId];

  mySQL.query(sql, params, (err, status) => {
    if (err) {
      _cb(err.code);
      return;
    }

    _cb(null, status);
  });
};

/**
 * Activates a session in the DB.
 * @param userId the owners userId for authorization.
 * @param sessionId the session to activate.
 * @param newState the new state to put the session in. Active = true
 * @param _cb callback(err)
 */
exports.toggleSession = (userId, sessionId, newState, _cb) => {

  if (!userId || !sessionId) {
    _cb("ER_NEED_SESSION_AND_USER_IDS");
    return;
  }

  console.log(`Toggling sessionId ${sessionId} -> ${newState}`);

  const sql = "call toggle_session(?, ?, ?)";
  const params = [userId, sessionId, newState];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (data[0][0].failure) {
      return _cb("ERR_NOT_FOUND");
    }

    return _cb(null, true);
  });
};

/**
 * Activates a question in the DB for a session. Returns the sessionId of the deactivated question for
 * socket.io alert purposes.
 * @param userId user ID for authorization.
 * @param questionId the question to activate.
 * @param _cb callback(err, sessionId)
 */
exports.activateQuestion = (userId, questionId, _cb) => {

  if (!userId || !questionId) {
    _cb("ER_NEED_QUESTION_AND_USER_IDS");
    return;
  }

  console.log("Activating questionId %d", questionId);

  const sql = "CALL activate_question(?,?)";
  const params = [userId, questionId];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (data[0][0].failure) {
      return _cb('ER_NOT_ACTIVATED');
    }

    if (data[0][0].session_id) {
      return _cb(null, data[0][0].session_id);
    }
  });
};

/**
 * De-Activates a question in the DB for a session. Returns the sessionId of the deactivated question for
 * socket.io alert purposes.
 * @param userId user ID for authorization.
 * @param questionId the question to deactivate.
 * @param _cb callback(err, sessionId)
 */
exports.deactivateQuestion = (userId, questionId, _cb) => {

  if (!userId || !questionId) {
    _cb("ER_NEED_QUESTION_AND_USER_IDS");
    return;
  }

  console.log("de-activating questionId %d", questionId);

  const sql = "CALL de_activate_question(?,?)";
  const params = [userId, questionId];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (data[0][0].failure) {
      return _cb('ER_NOT_DE_ACTIVATED');
    }

    if (data[0][0].session_id) {
      return _cb(null, data[0][0].session_id);
    }
  });
};

/**
 * Gets all questions associated with a sessionId.
 * @param sessionId id of the session to get questions for.
 * @param userId the user id to authorize this action
 * @param _cb callback
 */
exports.getSessionQuestions = (sessionId, userId, _cb) => {

  if (!sessionId || !userId) {
    _cb("ER_NO_SESSION_OR_USER_ID");
    return;
  }

  console.log(`userId [${userId}] retrieving all questions for sessionId [${sessionId}]`);

  const sql = "CALL get_session_questions(?,?)";
  const params = [userId, sessionId];

  mySQL.query(sql, params, (err, questions) => {

    if (err) {
      return _cb(err.code);
    }

    if (questions[0][0] && questions[0][0].unauthorized) {
      _cb("ER_NOT_AUTHORIZED");
      return;
    }

    // Return the questions
    _cb(null, questions[0]);
  });
};

/**
 * Get a question associated with a questionId.
 * @param questionId id of the question to get.
 * @param userId id of the user for authorization.
 * @param _cb callback(err, question)
 */
exports.getQuestion = (userId, questionId, _cb) => {

  if (!questionId || !userId) {
    _cb("ER_NO_QUESTION_OR_ID");
    return;
  }

  console.log(`userId [${userId}] retrieving questionId [${questionId}]`);

  const sql = "CALL get_question(?,?)";
  const params = [userId, questionId];

  mySQL.query(sql, params, (err, questions) => {
    if (err) {
      return _cb(err.code);
    }

    if (questions[0].length === 0) {
      _cb("ER_CANT_GET_QUESTION");
      return;
    }

    // Return the
    _cb(null, questions[0]);
  });
};

/**
 * Gets the userId associated with a sessionId.
 * @param sessionId id of the question to get.
 * @param _cb callback(err,userId)
 */
exports.getSessionOwner = (sessionId, _cb) => {

  if (!sessionId) {
    _cb("ER_NO_QUESTION_OR_ID");
    return;
  }

  console.log(`getting owner for sessionId [${sessionId}]`);

  const sql = "SELECT userId FROM votodb.sessions WHERE sessionId = ?";
  const params = [sessionId];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data.length === 0) {
      _cb("ER_CANT_GET_USER_ID");
      return;
    }

    // Return the userId
    _cb(null, data[0].userId);
  });
};

/**
 * Get a question associated with a questionId.
 * @param response response object '{questionId:xx,answer:xx}'.
 * @param userId id of the user for authorization.
 * @param questionId the id of the question to save the response for.
 * @param _cb callback
 */
exports.saveResponse = (userId, questionId, response, _cb) => {

  if (!userId || !response) {
    _cb("ER_NO_USER_ID_OR_RESPONSE");
    return;
  }

  console.log(`userId [${userId}] saving response [${JSON.stringify(response)}]`);

  const sql = "CALL save_response(?,?,?)";
  const params = [userId, questionId, response.answer];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      return _cb(err.code);
    }

    if (data[0][0].failure) {
      _cb("ER_SAVING_RESPONSE");
      return;
    }

    _cb(null, true);
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


