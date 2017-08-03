/**
 * Media Upload routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require('express'),
    router = express.Router(),
    db = require('./../bin/databaseConnect'),
    formidable = require('formidable'),
    fs = require('fs'),
    uuidv4 = require('uuid/v4'),
    path = require('path'),
    async = require('async');

router.post('/saveNewSession', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error:"ERR_NOT_LOGGED_IN"});
        return;
    }

    let newSession = req.body;

    db.saveNewSession(newSession, req.session.userId, (err, sessionId) => {
        if (err) {
            console.error(new Error("saving new session: " + err));
            res.status(500).json({error:err});
        } else {
            res.json({sessionId: sessionId});
        }
    });
});

/**
 * POST to update an existing session. Refer to db.updateSession() for details.
 */
router.post('/updateSession', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error:"ERR_NOT_LOGGED_IN"});
        return;
    }

    let sessionUpdate = req.body;

    db.updateSession(sessionUpdate, (err) => {
        if (err) {
            console.error(new Error("saving new session: " + err));
            res.status(500).json({error:err});
        } else {
            res.json({status: "success"});
        }
    });
});

/**
 * POST to save an array of new questions for a session.
 */
router.post('/saveSessionQuestions', (req, res)=>{

   if(!req.session.userId){
       res.status(401).json({error:"ERR_NOT_LOGGED_IN"});
       return;
   }

    let questions = req.body.questions;
    async.each(questions, (question, _cb)=>{

        db.saveNewQuestion(question,(err)=>{
           if(err){
               _cb(err);
               return;
           }

            question.saved = true;
            _cb(null);
        });
    }, (err)=>{

        if(err){
            res.status(500).json({error:err});
            return;
        }

        console.log('saved successfully');
        res.json({questions:questions});
    });

});


router.post("/activateSession", (req, res)=>{
    if (!req.session.userId) {
        res.status(401).json({error:"ERR_NOT_LOGGED_IN"});
        return;
    }

    db.activateSession();
});

/**
 * POST route to upload new media for a specific session. Under beta right now, but will at some point need to have
 * access to a sessionId.
 */
router.post('/uploadMedia', (req, res) => {

    console.log('Attempting to receive new media uploads...');

    // Ensure that a user is logged in if they are uploading.
    // if(!req.session.userId){
    //     // Not Logged In
    // }else if(!req.session.sessionId){
    //     // No Session Available
    // }else{
    //     // We good to go
    // }

    // create an incoming form object
    let form = new formidable.IncomingForm();
    let uploaded = 0, filePaths = [];

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '../uploads');

    // every time a file has been uploaded successfully
    form.on('file',  (field, file)=>{
        let newFileName = uuidv4()+'_'+file.name;
        let newPathName = path.join(form.uploadDir, newFileName);

        filePaths.push(newFileName);

        // Rename file to a UUID to avoid collions in file system, also append extension.
        fs.rename(file.path, newPathName, (err)=>{
            if(err)
                console.error(new Error("file rename: " + err));
        });
    });

    // log any errors that occur
    form.on('error', function (err) {
        console.error(new Error("file upload: " + err));
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function () {
        console.log(filePaths.length +" Uploads successful");
        res.send({"filePaths":filePaths});
        filePaths = [];
    });

    // parse the incoming request containing the form data
    form.parse(req);

});

/**
 * GET method to retrieve all sessions for a userId. no URL modification need because userId is in the cookie.
 */
router.get('/', (req, res)=>{

    if (!req.session.userId) {
        res.status(401).json({error:"ERR_NOT_LOGGED_IN"});
        return;
    }

    db.getAllSessions(req.session.userId, (err,sessions)=>{
        if(err) {
            res.status(500).json({error:err});
            return;
        }

        res.json({sessions:sessions});
    });
});

/**
 * GET method to return all questions for a specific session. URL:"/sessionQuestions?sessionId=xxxx".
 */
router.get('/sessionQuestions', (req, res)=>{

    if (!req.session.userId) {
        res.status(401).json({error:"ERR_NOT_LOGGED_IN"});
        return;
    }

    db.getSessionQuestions(req.query.sessionId, (err,questions)=>{
        if(err){
            res.status(500).json({error:err});
            return;
        }

        res.json(questions);
    });
});

module.exports = router;
