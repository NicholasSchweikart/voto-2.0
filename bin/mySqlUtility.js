const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10, // Max number of simultaneous connections
  host: process.env.VOTO_MYSQL_SERVER_URL, // Use DB on local interface
  user: "voto", // Operate as the voto user
  password: process.env.VOTO_MYSQL_PASSWORD,
  database: "votodb", // Only use the voto DB
  debug: false,
});

/**
 * Performs an SQL query on the DB using a connection from the pool.
 * @param queryString the SQL query to perform
 * @param parametersArray the parameters to insert into the values() expression
 * @param callback the callback to call on err or success
 */
exports.query = (queryString, parametersArray, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      callback(err);
    } else {
      connection.query(queryString, parametersArray, (err, data) => {
        connection.release();
        if (!err) {
          callback(null, data);
        } else {
          callback(err);
        }
      });

      connection.on("error", (err) => {
        callback(err);
      });
    }
  });
};
