/**
 * Provides a robust and secure interface to the MySql data base,
 * while implementing a user privilege type functionality. Basically,
 * by requiring this file, an app thread will only have access to the
 * database for end user/admin specific actions.
 */

const mysql = require('mysql'),
    passwordUtil = require('./passwordUtility.js');

let pool = mysql.createPool({
    connectionLimit: 10,       //Max number of simultaneous connections
    host: 'localhost',     // Use DB on local interface
    user: 'voto',          // Operate as the voto user
    password: 'votouser',
    database: 'votodb',          // Only use the voto DB
    debug: false
});

/**
 * Adds a new user to the data base if possible.
 * @param newUser user object from post request
 * @param _cb callback
 */
exports.createUser = (newUser, _cb) => {

    console.log('Attempting to create user...');

    // Sanitize inputs preemptive;
    if (!newUser.firstName || !newUser.lastName || !newUser.password || !newUser.userName) {
        _cb('must provide all new user credentials');
        return;
    }

    // Get the hash and salt for the provided password
    let passwordData = passwordUtil.getSaltHashPassword(newUser.password);

    let sql = "INSERT INTO users (firstName, lastName, userName, passwordSalt, passwordHash ) VALUES(?,?,?,?,?)";
    let params = [newUser.firstName, newUser.lastName, newUser.userName, passwordData.salt, passwordData.passwordHash];

    query(sql, params, (err) => {

        if (err) {
            _cb(err);
        } else {
            _cb(null, "user created");
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

    console.log('Attempting login FOR: ' + userName + ' PASSWORD: ' + password);

    if (!userName || !password) {
        _cb('ER_LOGIN_FAILED');
        return;
    }

    let sql = "SELECT * FROM users WHERE userName = ?";
    let params = [userName];

    query(sql, params, (err, data) => {

        if (err) {
            _cb(err.code);
            return;
        }

        if (data.length === 0) {
            _cb('No user found with this name!');
            return;
        }

        let user = data[0];
        let thisHash = passwordUtil.getPasswordHash(password, user.passwordSalt);

        if (thisHash === user.passwordHash) {
            _cb(null, user);
        } else {
            _cb('ERR_LOGIN_FAILED');
        }

    });

};

/**
 * Saves a new session in the DB for a user.
 * @param newSession the sessions object to save: '{title:"here"}'
 * @param userId the userId for this session
 * @param _cb callback function
 */
exports.saveNewSession = (newSession, userId, _cb) => {

    console.log('Attempting to save a session for USER: ' + userId);

    if (!newSession || !newSession.title) {
        _cb("failed one or more empty session parameters");
        return;
    }

    let sql = "INSERT INTO sessions (userId, title) VALUES (?, ?)";
    let params = [userId, newSession.title];

    query(sql, params, (err, data) => {

        if (err) {
            _cb(err.code);
        } else {
            // Return the ID of the new session to the user.
            _cb(null, data.insertId);
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

    query(sql, params, (err) => {

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

    query(sql, params, (err, sessions) => {

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

    let sql = "SELECT * FROM questions WHERE sessionID = ?";
    let params = [sessionId];

    query(sql, params, (err, questions) => {

        if (err) {
            _cb(err.code);
            return;
        }

        if(questions.length === 0){
            _cb("ER_NO_QUESTIONS_FOR_SESSIONID");
            return;
        }

        // Return the
        _cb(null, questions);

    });
};

exports.saveNewQuestion = (question, _cb) =>{

    if (!question) {
        _cb("failed need newQuestion obj");
        return;
    }

    console.log('Saving question for sessionId: ' + question.sessionId);

    let sql = "INSERT INTO questions (sessionId, imgFilePath, question, correctAnswer) VALUES (?, ?, ?, ?)";
    let params = [question.sessionId, question.imgFilePath, question.question, question.correctAnswer];

    query(sql, params, (err, status) => {

        if (err) {
            _cb(err.code);
            return;
        }

        _cb(null, status);
    });
};

exports.saveVote = (userResponse, userId, _cb) => {

    console.log('Attempting to save a vote for USER: ' + userId);

    if (!userResponse || !userResponse.answer) {
        _cb("failed one or more empty userResponse parameters");
        return;
    }

    let sql = "INSERT INTO user_responses (userId, title) VALUES (?, ?)";
    let params = [userId, newSession.title];

    query(sql, params, (err, data) => {

        if (err) {
            _cb(err);
        } else {
            _cb(null, data[0]);
        }
    });

};

exports.addNewMessage = (newMessage, _cb) => {

    console.log('Attempting to add new message...');

    if (!newMessage.name || !newMessage.email || !newMessage.text) {
        _cb("failed one or more empty parameters");
        return;
    }

    let sql = "INSERT INTO collected_messages (email, name, message) VALUES (?, ?, ?)";
    let params = [newMessage.email, newMessage.name, newMessage.text];

    query(sql, params, (err, data) => {

        if (err) {
            _cb(err);
        } else {
            _cb(null, data[0]);
        }
    });

};

exports.addEmail = (email, _cb) => {

    console.log('Attempting to add new email...');

    if (!email) {
        _cb("emptyEmail");
        return;
    }

    let sql = "INSERT INTO collected_emails (email) VALUES (?)";
    let parameters = [email];

    query(sql, parameters, (err, data) => {

        if (err) {
            _cb(err);
        } else {
            _cb(null, data[0]);
        }
    });

};

/**
 * Performs an SQL query on the DB using a connection from the pool.
 * @param queryString the SQL query to perform
 * @param parametersArray the parameters to insert into the values() expression
 * @param callback the callback to call on err or success
 */
function query(queryString, parametersArray, callback) {
    pool.getConnection(function (err, connection) {

        if (err) {
            connection.release();
            callback(err);
        } else {

            connection.query(queryString, parametersArray, function (err, data) {

                connection.release();
                if (!err) {
                    callback(null, data);
                } else {
                    callback(err);
                }
            });

            connection.on('error', function (err) {
                callback(err);
            });
        }
    });
}
