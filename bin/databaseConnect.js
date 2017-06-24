/**
 * Provides a robust and secure interface to the MySql data base,
 * while implementing a user privelage type functionality. Basicaly,
 * by requiring this file, an app thread will only have access to the
 * database for end user/admin specific actions.
 */

var mysql = require('mysql');

var pool = mysql.createPool({
     connectionLimit : 10, //important
     host     : 'localhost',
     user     : 'root',
     password : 'votouser',
     database : 'voto',
     debug    :  false
 });


exports.getUser = function(request,callback)
{
    var sql = "SELECT * FROM gyms WHERE user_name= ? AND password= ?";
    var parameters = [request.username, request.password]

    QUERY(sql, parameters, function(err, data){

        if(!err)
        {
            if(data.length == 0)
                callback("", null);
            else
                callback("", data[0]);
        }

        if(err)
        {
            callback(err);
            return;
        }

    });
};

exports.addEmail = function(email,callback)
{
    var sql = "INSERT INTO emails (email) VALUES ?";
    var parameters = [email];

    QUERY(sql, parameters, function(err, data){

        if(!err)
        {
            if(data.length == 0)
                callback("", null);
            else
                callback("", data[0]);
        }

        if(err)
        {
            callback(err);
            return;
        }

    });
};

function QUERY(queryString, parametersArray, callback)
{
    // Query and get thisGym from the gyms table.
    pool.getConnection(function(err,connection){

        if (err)
        {
             connection.release();

             callback(err);
             return;
        };

        connection.query(queryString, parametersArray, function(err,data){

            connection.release();
            if(!err)
            {
                callback("", data);
            };

        });

        connection.on('error', function(err) {

            callback(err);
            return;
        });

    });
};
