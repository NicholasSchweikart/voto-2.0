/**
 * Database operations routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require('express'),
    router = express.Router(),
    db = require('./../bin/databaseConnect');

/**
 * Creates a new user in the voto system. Post json {firstName:xxx, lastName:xxx, userName:xxx, password:xxx}
 * @ voto.io/database/createUser
 */
router.post('/createUser',function(req,res){

    let newUser = req.body;
    db.createUser(newUser,(err,user)=>{
        if(err){
            console.log("Error creating new user: " + err);
            res.json({error:err});
        }else{
            res.json({user:user});
        }
    });
});

module.exports = router;
