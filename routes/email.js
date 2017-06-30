var express = require('express');
var router = express.Router();

const db = require('./../bin/databaseConnect');

router.post('/', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');

  var data = req.body;
  console.log("New email from client: " + data.name);
  console.log("Email: " + data.email);
  console.log("Text: " + data.text);

  db.addNewMessage(data, (err, data) => {
    if (err) {
      console.log(err);
      res.json({
        error: err,
      });
    } else {
      res.json({
        status: 'sucess',
      })
    }
  });
});

module.exports = router;
