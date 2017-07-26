const express = require('express');
const router = express.Router();
const db = require('./../bin/databaseConnect');


router.post('/login',function(req,res,next){

    let password = req.body.password;
    let userName = req.body.userName;

    db.loginUser(userName,password,(err,user)=>{
        if(err)
            res.json(err);
        res.json(user);
    });
});

router.post('/createUser',function(req,res,next){

    let newUser = req.body;
    db.createUser(newUser.firstName,newUser.lastName,newUser.password,(err,user)=>{
        if(err)
            res.json(err);
        res.json(user);
    });
});


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

router.post('/testlogin', (req,res)=>{
    console.log('test loging');
    req.session.key = req.body.email;
    res.end('done');
});

router.get('/test', (req,res)=>{
    if(req.session.key){
        res.send('yay!');
    } else{
        res.send('booo');
    }
});

module.exports = router;
