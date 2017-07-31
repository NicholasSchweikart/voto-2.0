/**
* Provides a robust and secure interface to the MySql data base,
* while implementing a user privilege type functionality. Basically,
* by requiring this file, an app thread will only have access to the
* database for end user/admin specific actions.
*/

const mysql = require('mysql'),
    passwordUtil = require('./passwordUtility.js');

let pool = mysql.createPool({
    connectionLimit : 10,       //Max number of simultaneous connections
    host     : 'localhost',     // Use DB on local interface
    user     : 'voto',          // Operate as the voto user
    password : 'votouser',
    database : 'votodb',          // Only use the voto DB
    debug    :  false
});

/**
 * Adds a new user to the data base if possible.
 * @param newUser user object from post request
 * @param _cb callback
 */
exports.createUser = (newUser, _cb) => {

    console.log('Attempting to create user...');

    // Sanitize inputs preemptive;
    if( !newUser.firstName || !newUser.lastName || !newUser.password || !newUser.userName){
        _cb('must provide all new user credentials');
    }
    else{

        // Get the hash and salt for the provided password
        let passwordData = passwordUtil.getSaltHashPassword(newUser.password);

        let sql = "INSERT INTO users (firstName, lastName, userName, passwordSalt, passwordHash ) VALUES(?,?,?,?,?)";
        let params = [newUser.firstName, newUser.lastName, newUser.userName, passwordData.salt, passwordData.passwordHash];

        query(sql, params, (err) => {

            if (err) {
                _cb(err);
            }else{
                _cb(null, "user created");
            }
        });
    }
};

/**
 * Attempts to login a user with the provided credentials.
 * @param userName the users name
 * @param password the users password
 * @param _cb callback
 */
exports.loginUser = (userName, password, _cb) => {

    console.log('Attempting login FOR: ' + userName + ' PASSWORD: ' + password);

    if( !userName || !password ){
        _cb('must provide all credentials');
    }else{

        let sql = "SELECT * FROM users WHERE userName = ?";
        let params = [userName];

        query(sql, params, (err, data) => {

            if (data.length === 0) {
              _cb('No user found with this name!');
              return;
            }

            if (err){
                _cb(err);
            }else{
                console.log('Login Result:' + data[0].userName);

                let user = data[0];
                let thisHash = passwordUtil.getPasswordHash(password, user.passwordSalt);

                if(thisHash === user.passwordHash){
                    _cb(null, user);
                } else{
                    _cb('wrong password provided');
                }
            }
        });
    }
};

exports.saveNewSession = (newSession, userId, _cb) => {

    console.log('Attempting to save a session for USER: ' + userId);

    if( !newSession || !newSession.title ){
        _cb("failed one or more empty session parameters");
    }else{

        let sql = "INSERT INTO sessions (userId, title) VALUES (?, ?)";
        let params = [userId, newSession.title];

        query(sql, params, (err, data) => {

            if (err) {
                _cb(err);
            }else{
                // Return the ID of the new session to the user.
                _cb(null, data.insertId);
            }
        });
    }
};

exports.saveVote = (userResponse, userId, _cb) => {

    console.log('Attempting to save a vote for USER: ' + userId);

    if( !userResponse || !userResponse.answer ){
        _cb("failed one or more empty userResponse parameters");
    }else{

        let sql = "INSERT INTO user_responses (userId, title) VALUES (?, ?)";
        let params = [userId, newSession.title];

        query(sql, params, (err, data) => {

            if (err) {
                _cb(err);
            }else{
                _cb(null, data[0]);
            }
        });
    }
};

exports.addNewMessage = (newMessage, _cb) => {

    console.log('Attempting to add new message...');

    if( !newMessage.name || !newMessage.email || !newMessage.text ){
        _cb("failed one or more empty parameters");
    }else{

        let sql = "INSERT INTO collected_messages (email, name, message) VALUES (?, ?, ?)";
        let params = [newMessage.email, newMessage.name, newMessage.text];

        query(sql, params, (err, data) => {

            if (err) {
                _cb(err);
            }else{
                _cb(null, data[0]);
            }
        });
    }
};

exports.addEmail = (email, _cb) => {

    console.log('Attempting to add new email...');

    if( !email ){
        _cb("emptyEmail");
    }else{

        let sql = "INSERT INTO collected_emails (email) VALUES (?)";
        let parameters = [email];

        query(sql, parameters, (err, data) => {

            if(err){
                _cb(err);
            }else{
                _cb(null, data[0]);
            }
        });
    }
};

/**
 * Performs an SQL query on the DB using a connection from the pool.
 * @param queryString the SQL query to perform
 * @param parametersArray the parameters to insert into the values() expression
 * @param callback the callback to call on err or success
 */
function query(queryString, parametersArray, callback) {
    pool.getConnection(function(err, connection) {

        if (err)
        {
            connection.release();
            callback(err);
        }else{

            connection.query(queryString, parametersArray, function(err,data){

                connection.release();
                if(!err)
                {
                    callback(null, data);
                }else{
                    callback(err);
                }
            });

            connection.on('error', function(err) {
                callback(err);
            });
        }
    });
}
