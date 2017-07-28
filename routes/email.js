const express = require('express'),
    router = express.Router(),
    db = require('./../bin/databaseConnect');

router.post('/addMessage', (req,res)=>{

  let newMessage = req.body;
  console.log("New email from client: " + newMessage.name);
  console.log("Email: " + newMessage.email);
  console.log("Text: " + newMessage.text);

  db.addNewMessage(newMessage, (err, data) => {
    if (err) {
      console.log("Error adding new message: " + err);
      res.json({
        error: err,
      });
    } else {
      res.json({status: 'success'});
    }
  });
});

router.post('/addEmail', (req,res)=>{

    let data = req.body;
    console.log("Processing new email: " + data.email);

    db.addEmail(data.email, (err) => {

        if (err) {
            console.log("Error adding new email: " + err);
            res.json({'error': err});
        } else {
            res.json({status:"success"});
        }
    });
});

module.exports = router;
