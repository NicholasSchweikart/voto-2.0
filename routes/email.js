const express = require('express'),
    router = express.Router(),
    db = require('../bin/emailDB');

router.post('/addMessage', (req,res)=>{

  let newMessage = req.body;
  console.log("New email from client: " + newMessage.name);
  console.log("Email: " + newMessage.email);
  console.log("Text: " + newMessage.text);

  db.addNewMessage(newMessage, (err) => {

    if (err) {
        console.error(new Error("adding new message: " + err));
        res.status(500).json({error:err});
        return;
    }

    res.json({status: 'success'});
  });
});

router.post('/addEmail', (req,res)=>{

    let data = req.body;
    console.log("Processing new email: " + data.email);

    db.addEmail(data.email, (err) => {

        if (err) {
            console.error(new Error("adding new email: " + err));
            res.status(500).json({error:err});
            return;
        }

        res.json({status:"success"});
    });
});

module.exports = router;
