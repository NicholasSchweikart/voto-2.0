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

  var data = req.body;
  console.log("Processing new email: " + data.email);

  dataBase.addEmail(data.email, function(err, data) {

        if (err) {
            console.log(err)
            res.json({
                'error': err
            });
        } else {
            res.json(data);
        }
    });
});

module.exports = router;
