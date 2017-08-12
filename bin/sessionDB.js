const mySQL = require('./mySqlUtility');

/**
 * Saves a new session in the DB for a user.
 * @param newSession the sessions object to save: '{title:"here"}'
 * @param userId the userId for this session
 * @param _cb callback function
 */
exports.saveNewSession = (newSession, userId, _cb) => {

    console.log('Attempting to save a session for USER: ' + userId);

    if (!newSession || !newSession.title || !newSession.className || !newSession.description) {
        _cb("failed one or more empty session parameters");
        return;
    }

    let sql = "INSERT INTO sessions (userId, title, className, description) VALUES (?, ?, ?, ?)";
    let params = [userId, newSession.title, newSession.className, newSession.description];

    mySQL.query(sql, params, (err, data) => {

        if (err) {
            _cb(err.code);
        } else {

            let sql2 = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp from sessions WHERE sessionId = ?";
            let params2 = [data.insertId];

            mySQL.query(sql2, params2, (err, data) => {

              if (err) {
                _cb(err.code);
              } else {
                if (data.length === 0) {
                  _cb('SOMETHING WHEN WRONG ON INSERT');
                }

              _cb(null, data[0]);
            }
          });
        }
    });
};

/**
 * Updates a sessions that already exists.
 * @param sessionUpdate '{updateArray:["title":"","group":"","totalQuestions":"","sessionId":""]}'
 * @param _cb callback
 */
exports.updateSession = (sessionUpdate, _cb) =>{

    console.log(sessionUpdate);

    if (!sessionUpdate) {
        _cb("failed one or more empty session parameters");
        return;
    }

    console.log('Attempting to update sessionId: ' + sessionUpdate.sessionId);

    let sql = "UPDATE sessions SET className = ?, title = ?, totalQuestions = ?, description = ? WHERE sessionID = ?";
    let params = [
      sessionUpdate.className,
      sessionUpdate.title,
      //(!sessionUpdate.group ? '' : sessionUpdate.group),
      sessionUpdate.totalQuestions,
      sessionUpdate.description,
      sessionUpdate.sessionId,
    ];//sessionUpdate.updateArray;
    console.log(params);

    mySQL.query(sql, params, (err) => {

        if (err) {
            _cb(err.code);
        } else {

          let sql2 = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp from sessions WHERE sessionId = ?";
          let params2 = [sessionUpdate.sessionId];

          mySQL.query(sql2, params2, (err, data) => {

            if (err) {
              _cb(err.code);
            } else {
              if (data.length === 0) {
                _cb('SOMETHING WHEN WRONG ON UPDATE');
              }

            _cb(null, data[0]);
            }
          })
        }
    });
};

/**
 * Returns an array of all sessions associated with a user.
 * @param userId the userId to get sessions for
 * @param _cb callback
 */
exports.getAllSessions = (userId, _cb) =>{

    if (!userId) {
        _cb("failed one or more empty session parameters");
        return;
    }

    console.log('Retrieving all sessions for user: ' + userId);

    let sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp FROM sessions WHERE userId = ? ORDER BY timeStamp DESC";
    let params = [userId];

    mySQL.query(sql, params, (err, sessions) => {

        if (err) {
            _cb(err.code);
            return;
        }

        if(sessions.length === 0){
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
 * @param _cb callback
 */
exports.getSession = (sessionId, _cb) =>{

    if (!sessionId) {
        _cb("ER_NO_SESSION_ID");
        return;
    }

    console.log('Retrieving sessionId: [%d]', sessionId);

    let sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp FROM sessions WHERE sessionId = ? ";
    let params = [sessionId];

    mySQL.query(sql, params, (err, sessions) => {

        if (err) {
            _cb(err.code);
            return;
        }

        if(sessions.length === 0){
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
 * @param _cb callback
 */
exports.deleteSession = (sessionId, _cb) => {

    if (!sessionId) {
        _cb("ER_NO_SESSION_ID");
        return;
    }

    console.log('Retrieving sessionId: [%d]', sessionId);

    let sql = "DELETE FROM sessions WHERE sessionId = ? ";
    let params = [sessionId];

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
 * @param _cb callback
 */
exports.saveNewQuestion = (question, _cb) =>{

    if (!question) {
        _cb("failed need newQuestion obj");
        return;
    }

    console.log('Saving question for sessionId: ' + question.sessionId);

    let sql = "INSERT INTO questions (sessionId, imgFileName, question, orderNum, correctAnswer) VALUES (?, ?, ?, ?, ?)";
    let params = [
        question.sessionId,
        question.imgFileName,
        question.question,
        question.orderNum,
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
 * Saves a question to the DB for a session.
 * @param question the question data to save '{sessionId, imgFileName, question, correctAnswer}'
 * @param _cb callback
 */
exports.updateQuestion = (question, _cb) =>{

    if (!question) {
        _cb("failed need question obj");
        return;
    }

    console.log('Updating questionId: ' + question.questionId);

    let sql = "UPDATE questions SET imgFileName = ?, question = ?, orderNum = ?, correctAnswer = ? WHERE questionId = ?";
    let params = [
        question.imgFileName,
        question.question,
        question.orderNum,
        question.correctAnswer,
        question.questionId,
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
exports.deleteQuestion = (questionId, _cb) =>{ 

    if (!questionId) {
        _cb("ER_NEED_QUESTION_ID");
        return;
    }

    console.log('Deleting questionId %d' + questionId);

    let sql = "DELETE FROM questions WHERE questionId = ?";
    let params = [questionId];

    mySQL.query(sql, params, (err, status) => {

        if (err) {
            _cb(err.code);
            return;
        }

        _cb(null, status);
    });
};

exports.activateSession = (userId,sessionId, _cb) =>{

    if (!userId || !sessionId) {
        _cb("ER_NEED_SESSION_AND_USER_IDS");
        return;
    }

    console.log('Activating sessionId %d', sessionId);

    let sql = "UPDATE sessions SET isActive = true WHERE userId = ? AND sessionId = ?";
    let params = [userId,sessionId];

    mySQL.query(sql, params, (err, data) => {

        if (err) {
            _cb(err.code);
            return;
        }

        if(data.length ===0){
            return _cb(null, false)
        }

        return _cb(null, true);
    });
};

/**
 * Gets all questions associated with a sessionId.
 * @param sessionId id of the session to get questions for.
 * @param _cb callback
 */
exports.getSessionQuestions = (sessionId, _cb) =>{

    if (!sessionId) {
        _cb("ER_NO_SESSION_ID");
        return;
    }

    console.log('Retrieving all questions for sessionId: ' + sessionId);

    let sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp FROM questions WHERE sessionId = ? ORDER BY orderNumber DESC";
    let params = [sessionId];

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
exports.getQuestion = (questionId, _cb) =>{

    if (!questionId) {
        _cb("ER_NO_QUESTION_ID");
        return;
    }

    console.log('Retrieving questionId: ' + questionId);

    let sql = "SELECT *, UNIX_TIMESTAMP(dateCreated) as timeStamp FROM questions WHERE questionId = ?";
    let params = [questionId];

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
