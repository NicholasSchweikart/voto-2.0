var express = require('express');
var router = express.Router();

const db = require('./../bin/databaseConnect');

router.post('/', function(req, res, next) {

  var data = req.body;
  console.log("Processing new email: " + data.email);

  db.addEmail(data.email, function(err, data) {

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
