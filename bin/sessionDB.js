const mySQL = require("./mySqlUtility");

/**
 * Saves a new session in the DB for a user.
 * @param newSession the sessions object to save: '{title:"here"}'
 * @param userId the userId for this session
 * @param _cb callback function
 */
exports.saveNewSession = (newSession, userId, _cb) => {

  console.log(`Attempting to save a session for USER: ${userId}`);

  if (!newSession || !newSession.title || !newSession.className || !newSession.description) {
    _cb("failed one or more empty session parameters");
    return;
  }

  const sql = "CALL save_new_session(?, ?, ?, ?)";
  const params = [userId, newSession.title, newSession.className, newSession.description];

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

  console.log("Attempting to update sessionId [%d] for userId [%d]", sessionUpdate.sessionId, userId);

  const sql = "CALL update_session(?,?,?,?,?,?)";
  const params = [
    userId,
    sessionUpdate.sessionId,
    sessionUpdate.className,
    sessionUpdate.title,
    sessionUpdate.totalQuestions,
    sessionUpdate.description,
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

  const sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp FROM sessions WHERE userId = ? ORDER BY timeStamp DESC";
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

  mySQL.query(sql, params, (err, sessions) => {
    if (err) {
      _cb(err.code);
      return;
    }

    if (sessions.length === 0) {
      _cb("No Sessions for this sessionId");
      return;
    }

    // Return the records.
    _cb(null, sessions);
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

  mySQL.query(sql, params, (err) => {
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

  console.log("Saving question for sessionId [%d] userId [%d] ", question.sessionId, userId);

  const sql = "CALL save_new_question(?,?,?,?,?,?)";
  const params = [
    userId,
    question.sessionId,
    question.imgFileName,
    question.question,
    question.orderNumber,
    question.correctAnswer,
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

  const sql = "CALL update_question(?,?,?,?,?,?,?,?)";
  const params = [
    userId,
    question.sessionId,
    question.questionId,
    question.imgFileName,
    question.question,
    question.orderNumber,
    question.correctAnswer,
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

exports.activateSession = (userId, sessionId, _cb) => {
  if (!userId || !sessionId) {
    _cb("ER_NEED_SESSION_AND_USER_IDS");
    return;
  }

  console.log("Activating sessionId %d", sessionId);

  const sql = "UPDATE sessions SET isActive = true WHERE userId = ? AND sessionId = ?";
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
 * Gets all questions associated with a sessionId.
 * @param sessionId id of the session to get questions for.
 * @param _cb callback
 */
exports.getSessionQuestions = (sessionId, _cb) => {
  if (!sessionId) {
    _cb("ER_NO_SESSION_ID");
    return;
  }

  console.log(`Retrieving all questions for sessionId: ${sessionId}`);

  const sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp FROM questions WHERE sessionId = ? ORDER BY orderNumber ASC";
  const params = [sessionId];

  mySQL.query(sql, params, (err, questions) => {
    if (err) {
      return _cb(err.code);
    }

    // if(questions.length === 0){
    //     _cb("ER_NO_QUESTIONS_FOR_SESSION_ID");
    //     return;
    // }

    // Return the
    _cb(null, questions);
  });
};

/**
 * Get a question associated with a questionId.
 * @param questionId id of the question to get.
 * @param _cb callback
 */
exports.getQuestion = (questionId, _cb) => {
  if (!questionId) {
    _cb("ER_NO_QUESTION_ID");
    return;
  }

  console.log(`Retrieving questionId: ${questionId}`);

  const sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp FROM questions WHERE questionId = ?";
  const params = [questionId];

  mySQL.query(sql, params, (err, questions) => {
    if (err) {
      return _cb(err.code);
    }

    // if(questions.length === 0){
    //     _cb("ER_NO_QUESTIONS_FOR_SESSION_ID");
    //     return;
    // }

    // Return the
    _cb(null, questions);
  });
};
