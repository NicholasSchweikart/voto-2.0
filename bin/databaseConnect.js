/**
 * Provides a robust and secure interface to the MySql data base,
 * while implementing a user privelage type functionality. Basicaly,
 * by requiring this file, an app thread will only have access to the
 * database for end user/admin specific actions.
 */

var mysql = require('mysql');

var pool = mysql.createPool({
     connectionLimit : 10, //IMPORTANT
     host     : 'localhost',
     user     : 'root',
     password : 'votouser',
     database : 'voto',
     debug    :  false
 });

// exports.getEmails = (_cb) => {
//   var sql = "SELECT * FROM emails";
//
//   QUERY(sql, null, (err, data) => {
//     if (!err) {
//       if (data.length == 0) {
//         _cb('', null);
//       } else {
//         _cb('', data[0]);
//       }
//     } else {
//       _cb(err);
//     }
//
//     return;
//   })
// }

exports.addNewMessage = (user, _cb) => {
  var sql = "INSERT INTO emailMessages (name, email, text) VALUES (?, ?, ?)";
  var params = [user.name, user.email, user.text];

  QUERY(sql, params, (err, data) => {
    if (!err) {
      if (data.length == 0) {
        _cb('', null);
      } else {
        _cb('', data[0])
      }
    }

    if (err) {
      _cb(err);
      return;
    }
  })
}

exports.addEmail = (email, _cb) => {
    var sql = "INSERT INTO emails (email) VALUES (?)";
    var parameters = [email];

    QUERY(sql, parameters, (err, data) => {

        if(!err) {
            if(data.length == 0)
                _cb("", null);
            else
                _cb("", data[0]);
        }

        if(err) {
            _cb(err);
            return;
        }
    });
};

function QUERY(queryString, parametersArray, callback) {
    pool.getConnection(function(err, connection) {

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

            if (err)
            {
                 callback(err);
                 return;
            };
        });

        connection.on('error', function(err) {

            callback(err);
            return;
        });

    });
};
