/**
 * Media Upload routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require('express'),
    router = express.Router(),
    db = require('../bin/sessionDB'),
    formidable = require('formidable'),
    fs = require('fs'),
    uuidv4 = require('uuid/v4'),
    path = require('path'),
    async = require('async'),
    AWS = require('aws-sdk'),
    zlib = require('zlib');

AWS.config.loadFromPath('./../bin/awsConfig.json');

const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

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

    db.activateSession(req.session.userId, req.body.sessionId, (err, activated) => {

        if(err || !activated){
            res.status(500).json({error:err});
            return;
        }

        res.json({status:"activated"});
    });
});

/**
 * POST route to upload new media for a specific session. Under beta right now, but will at some point need to have
 * access to a sessionId.
 */
router.post('/accessSession', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error:"ERR_NOT_LOGGED_IN"});
        return;
    }

    if(!req.body.sessionId){
        res.status(401).json({error:"ERR_NO_SESSION_ID"});
        return;
    }

    let userId = req.session.userId,
        sessionId = req.body.sessionId;

    console.log('Authorizing userId %d for sessionId %d', userId, sessionId);
    //TODO check that session is active.
    db.isUserAuthorized(userId,sessionId,(err,yes)=>{
        if (err) {
            console.error(new Error("authorizing user for session: " + err));
            res.status(500).json({error:err});
            return;
        }

        if(!yes){
            console.error(new Error("authorizing user for session: " + err));
            res.status(401).json({error:err});
            return;
        }

        req.session.authorizedSessionId = sessionId;
        res.json({status: "successfully authorized"});
    })
});

/**
 * POST route to upload new media for a specific session. Under beta right now, but will at some point need to have
 * access to a sessionId.
 */
router.post('/uploadImageFiles', (req, res) => {

    console.log('Attempting to receive new media uploads...');

    //TODO Ensure that a user is logged in if they are uploading.
    // if(!req.session.userId){
    //     // Not Logged In
    // }else if(!req.session.sessionId){
    //     // No Session Available
    // }else{
    //     // We good to go
    // }

    // create an incoming form object
    let form = new formidable.IncomingForm();
    let filePaths = [];

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '../uploads');

    // every time a file has been uploaded successfully
    form.on('file',  (field, file)=>{
        let newFileName = uuidv4()+'_'+file.name;

        //TODO integrate amazon S3 upload here.
        let params = {
            Bucket:'voto-question-images',
            Key: newFileName,
            Body: file
        };

        s3.putObject(params,(err, data)=> {

            if(err){
                console.error(new Error("generating signed image URL: " + err));
                return;
            }
            filePaths.push(newFileName);
            console.log("S3 Return data %s", data);
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

/**
 * GET method to return a one time URL to view a question image slide. URL:"/sessionQuestions?sessionId=xxxx.ext".
 */
router.get('/questionImageURL', (req, res)=>{

    if (!req.session.userId || !req.session.authorizedSessionId) {
        res.status(401).json({error:"ERR_NOT_LOGGED_IN_OR_AUTHORIZED"});
        return;
    }

    if(!req.query.imgFileName){
        res.status(500).json({error:"ER_NO_FILENAME"});
    }

    let imgFileName = req.query.imgFileName;
    let params = {Bucket:'voto-question-images', Key:imgFileName, Expires:30};

    s3.getSignedUrl('getObject', params,(err, url)=> {

        if(err){
            console.error(new Error("generating signed image URL: " + err));
            return;
        }

        console.log("The URL is", url);
        res.json({url:url});
    });

});

module.exports = router;
