const express = require('express');
const router = express.Router();

const db = require('./../bin/databaseConnect');

router.post('/', function(req, res, next) {

  let data = req.body;
  console.log("Processing new email: " + data.email);

  db.addEmail(data.email, (err, data) => {

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
