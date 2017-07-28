/**
 * Login router file for Voto system.
 * @type {*|createApplication}
 */
const express = require('express'),
    router = express.Router(),
    db = require('./../bin/databaseConnect');

/**
 * Handles login for the entire API. Please post a json login object @ voto.io/database/login
 * Form {userName:xxxx, password:xxxx}
 */
router.post('/',(req,res)=>{

    let password = req.body.password;
    let userName = req.body.userName;

    db.loginUser(userName, password,(err,user)=>{

        if(err){
            console.log("Error on login: " + err);
            res.json({error:err});
        }else {
            req.session.userId = user.userId;
            res.json({status:"logged in"});
        }
    });
});

/**
 * Handles login for the entire API. Please post a json login object @ voto.io/database/login
 * Form {userName:xxxx, password:xxxx}
 */
router.post('/logout',(req,res)=>{

    if(!req.session.userId){
        res.json({error:"Error can't logout someone who isnt logged in!"});
    }else {
        req.session.destroy((err)=>{
            if(err) {
                console.log("logout error:" + err);
                res.json({error:err});
            }else{
                res.json({status: "success"});
            }
        });
    }

});

/**
 * Test POST method to verify that a session is active.
 */
router.post('/testSession', (req,res)=>{

    if(req.session.userId){
        console.log('Session Good For: ' + req.session.userId);
        res.json({status:"session good!"});
    } else{
        res.json({error:'sorry no session'});
    }
});

module.exports = router;