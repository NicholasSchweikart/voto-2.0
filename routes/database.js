var express = require('express');
var router = express.Router();

const dataBase = require('./../bin/databaseConnect');

/* GET users listing. */
router.post('/', function(req, res, next) {

  dataBase.addEmail(req, function(err, data) {

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
