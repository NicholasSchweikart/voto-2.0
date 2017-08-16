const mySQL = require("./mySqlUtility");

/**
 * Saves a new message to the DB from the main voto website.
 * @param newMessage the message to save '{name,email,text}'
 * @param _cb callback(err, success)
 */
exports.addNewMessage = (newMessage, _cb) => {
  console.log("Attempting to add new message...");

  if (!newMessage.name || !newMessage.email || !newMessage.text) {
    _cb("failed one or more empty parameters");
    return;
  }

  const sql = "INSERT INTO collected_messages (email, name, message) VALUES (?, ?, ?)";
  const params = [newMessage.email, newMessage.name, newMessage.text];

  mySQL.query(sql, params, (err, data) => {
    if (err) {
      _cb(err);
    } else {
      _cb(null, data[0]);
    }
  });
};

/**
 * Saves a new email to our collected emails table.
 * @param email the email address to save. In plain text
 * @param _cb callback()
 */
exports.addEmail = (email, _cb) => {
  console.log("Attempting to add new email...");

  if (!email) {
    _cb("emptyEmail");
    return;
  }

  const sql = "INSERT INTO collected_emails (email) VALUES (?)";
  const parameters = [email];

  mySQL.query(sql, parameters, (err, data) => {
    if (err) {
      _cb(err);
    } else {
      _cb(null, data[0]);
    }
  });
};
