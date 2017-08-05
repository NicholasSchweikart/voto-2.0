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
          })
        }
    });
};

/**
 * Updates a sessions that already exists.
 * @param sessionUpdate '{updateArray:["title":"","group":"","totalQuestions":"","sessionId":""]}'
 * @param _cb callback
 */
exports.updateSession = (sessionUpdate, _cb) =>{

    if (!sessionUpdate) {
        _cb("failed one or more empty session parameters");
        return;
    }

    console.log('Attempting to update sessionId: ' + sessionUpdate.sessionId);

    let sql = "UPDATE sessions SET title = ?, group = ?, totalQuestions = ? WHERE sessionID = ?";
    let params = sessionUpdate.updateArray;

    mySQL.query(sql, params, (err) => {

        if (err) {
            _cb(err.code);
        } else {
            // Return the ID of the new session to the user.
            _cb(null, "success");
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
 * Gets all questions associated with a sessionId. //TODO add order column
 * @param sessionId id of the session to get questions for.
 * @param _cb callback
 */
exports.getSessionQuestions = (sessionId, _cb) =>{

    if (!sessionId) {
        _cb("ER_NO_SESSION_ID");
        return;
    }

    console.log('Retrieving all questions for sessionId: ' + sessionId);

    let sql = "SELECT * FROM questions WHERE sessionID = ?";
    let params = [sessionId];

    mySQL.query(sql, params, (err, questions) => {

        if (err) {
            _cb(err.code);
            return;
        }

        // if(questions.length === 0){
        //     _cb("ER_NO_QUESTIONS_FOR_SESSION_ID");
        //     return;
        // }

        // Return the
        _cb(null, questions);

    });
};
