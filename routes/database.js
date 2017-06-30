var express = require('express');
var router = express.Router();

const dataBase = require('./../bin/databaseConnect');

// Example of sending in an email post via ajax
// $.ajax({
//     url: http://voto.io/database,
//     dataType: "json",
//     data:{
//         email: hello@voto.io
//     },
//     success: function(data){
//
//         }
// });
/* POST new email*/
router.post('/', function(req, res, next) {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');

  var data = req.body;
  console.log("Processing new email: " + data.email);

  dataBase.addEmail(data.email, function(err, data) {

        if (err) {
            console.log(err)
            res.json({
                'error': err
            });
        } else {
            res.json({status:"success"});
        }
    });
});

module.exports = router;
