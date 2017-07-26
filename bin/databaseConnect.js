/**
* Provides a robust and secure interface to the MySql data base,
* while implementing a user privelage type functionality. Basicaly,
* by requiring this file, an app thread will only have access to the
* database for end user/admin specific actions.
*/

const mysql = require('mysql');
const passwordUtil = require('./passwordUtility.js');

let pool = mysql.createPool({
    connectionLimit : 10, //IMPORTANT
    host     : 'localhost',
    user     : 'root',
    password : 'votouser',
    database : 'voto',
    debug    :  false
});

/**
 * Adds a new user to the data base if possible.
 * @param firstName users first name
 * @param lastName users last name
 * @param password users selected password
 * @param _cb callback
 */
exports.createUser = (firstName,lastName,password, _cb) => {
    console.log('Attempting to create user...');

    // Sanatize inputs preemptive;
    if(firstName === "")
        _cb('ERR: must provide first name');
    if(lastName === "")
        _cb('ERR: must provide last name');
    if(password === "")
        _cb('ERR: must provide password');

    let passwordData = passwordUtil.getSaltHashPassword(password);

    let sql = "INSERT INTO users (firstName, lastName, password_salt, password_hash ) VALUES(?,?,?,?)";
    let params = [firstName, lastName, passwordData.salt, passwordData.passwordHash];

    QUERY(sql, params, (err, data) => {

        if (err) {
            _cb(err);
        }

        _cb(null, data[0]);
    });
};

/**
 * Attempts to login a user with the provided credentials.
 * @param userName the users name
 * @param password the users password
 * @param _cb callback
 */
exports.loginUser = (userName,password, _cb) => {
    console.log('Attempting login...');

    if(userName === "" || password === "")
        _cb('ERR: provide credentials');

    let sql = "SELECT ? FROM users WHERE id_user = ?";
    let params = [userName];

    QUERY(sql, params, (err, data) => {

        if (err)
            _cb(err);

        console.log('Login Result:' + data[0]);

        let user = data[0];
        let thisHash = passwordUtil.getPasswordHash(password, user.salt);

        if(thisHash === user.passwordHash)
            _cb(null, user);
        else
            _cb('passwordWrong');
    });
};

exports.addNewMessage = (user, _cb) => {
    let sql = "INSERT INTO emailMessages (name, email, text) VALUES (?, ?, ?)";
    let params = [user.name, user.email, user.text];

    if(params.name === "" || params.email === "" || params.text === ""){
        _cb("failed empty parameters");
    }

    QUERY(sql, params, (err, data) => {

        if (err) {
            _cb(err);
        }

        _cb(null, data[0]);
    });
};

exports.addEmail = (email, _cb) => {
    let sql = "INSERT INTO emails (email) VALUES (?)";
    let parameters = [email];

    if(parameters.email === ""){
        _cb("emptyEmail");
    }

    QUERY(sql, parameters, (err, data) => {

        if(err)
            _cb(err);

        _cb("", data[0]);
    });
};

function QUERY(queryString, parametersArray, callback) {
    pool.getConnection(function(err, connection) {

        if (err)
        {
            connection.release();
            callback(err);
            return;
        }

        connection.query(queryString, parametersArray, function(err,data){

            connection.release();
            if(!err)
            {
                callback(null, data);
            }

            if (err)
            {
                callback(err);
            }
        });

        connection.on('error', function(err) {

            callback(err);
        });

    });
}
