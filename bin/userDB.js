const mySQL = require('./mySqlUtility'),
passwordUtil = require('./passwordUtility');

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

    mySQL.query(sql, params, (err) => {

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

    mySQL.query(sql, params, (err, data) => {

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

    console.log('Checking authorization for userId %d on sessionId %d', userId, sessionId);

    let sql = "SELECT * FROM authorized_users WHERE userId = ? AND sessionId=?";
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
 * Saves a users response to a session question.
 * @param userResponse the response to save
 * @param userId the userId associated with the response
 * @param _cb callback(err, success)
 */
exports.saveUserResponse = (userResponse, userId, _cb) => {

    console.log('Attempting to save a vote for USER: ' + userId);

    if (!userResponse || !userResponse.answer) {
        _cb("failed one or more empty userResponse parameters");
        return;
    }

    let sql = "INSERT INTO user_responses (userId, title) VALUES (?, ?)";
    let params = [userId, newSession.title];

    mySQL.query(sql, params, (err, data) => {

        if (err) {
            _cb(err);
        } else {
            _cb(null, data[0]);
        }
    });
};




