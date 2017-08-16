/**
 * Media Upload routing file for Voto app system.
 * @type {*|createApplication}
 */
const express = require('express'),
    router = express.Router(),
    db = require('../bin/sessionDB'),
    userDb = require('../bin/userDB'),
    formidable = require('formidable'),
    fs = require('fs'),
    uuidv4 = require('uuid/v4'),
    path = require('path'),
    async = require('async'),
    AWS = require('aws-sdk');

AWS.config.region = "us-east-2";

const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

/**
 * POST to save a new session for a user.
 */
router.post('/saveNewSession', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    let newSession = req.body;

    db.saveNewSession(newSession, req.session.userId, (err, newSession) => {
        if (err) {
            console.error(new Error("saving new session: " + err));
            res.status(500).json({error: err});
        } else {
            res.json(newSession);
        }
    });
});

/**
 * POST to update an existing session. Refer to db.updateSession() for details.
 */
router.post('/updateSession', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    let sessionUpdate = req.body;

    db.updateSession(sessionUpdate, (err, updated) => {
        if (err) {
            console.error(new Error("Updating session: " + err));
            res.status(500).json({error: err});
        } else {
            res.json(updated);
        }
    });
});

/**
 * POST to save an array of new questions for a session.
 */
router.post('/saveSessionQuestions', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }
    let questions = req.body.questions;
    let uploadErrors = [];
    let dbErrors = [];
    let userId = req.session.userId;

    async.each(questions, (question, _cb) => {
        // Check if its a new question
        if (!question.questionId) {

                // Save the new question to DB
                db.saveNewQuestion(question,userId, (err) => {
                    if (err) {
                        console.error(new Error("saving question to DB: " + err));
                        dbErrors.push(question);
                    }
                    _cb(null);
                });

        } else {

            // Update the question in the DB
            db.updateQuestion(question, (err) => {
                if (err) {
                    console.error(new Error("updating question: " + err));
                    dbErrors.push(question);
                }
                _cb(null);
            });
        }

    }, () => {

        if (uploadErrors.length || dbErrors.length) {
            res.status(500).json({
                uploadErrors: uploadErrors,
                dbErrors:dbErrors
            });
            return;
        }

        console.log('saved successfully');
        res.json({questions: questions});
    });

});

/**
 * POST to put a specifc session into the active state.
 */
router.post("/activateSession", (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    db.activateSession(req.session.userId, req.body.sessionId, (err, activated) => {

        if (err || !activated) {
            res.status(500).json({error: err});
            return;
        }

        res.json({status: "activated"});
    });
});

/**
 * POST route to upload new media for a specific session. Under beta right now, but will at some point need to have
 * access to a sessionId.
 */
router.post('/accessSession', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    if (!req.body.sessionId) {
        res.status(401).json({error: "ERR_NO_SESSION_ID"});
        return;
    }

    let userId = req.session.userId,
        sessionId = req.body.sessionId;

    console.log('Authorizing userId %d for sessionId %d', userId, sessionId);

    //TODO check that session is active.
    userDb.isUserAuthorized(userId, sessionId, (err, yes) => {
        if (err) {
            console.error(new Error("authorizing user for session: " + err));
            res.status(500).json({error: err});
            return;
        }

        if (!yes) {
            console.error(new Error("authorizing user for session: " + err));
            res.status(401).json({error: err});
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
router.post('/uploadImageFile', (req, res) => {

    console.log('Attempting to receive new media uploads...');

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    // create an incoming form object
    let form = new formidable.IncomingForm();

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '../uploads');

    // every time a file has been uploaded successfully
    form.on('file', (field, file) => {

        let newFileName = uuidv4()+'_'+file.name;
        let fileStream = fs.createReadStream(file.path);
        fileStream.on('error', function(err) {
            console.error(new Error("file stream error: " + err));
        });

        let params = {
            Bucket:'voto-question-images',
            Key: newFileName,
            Body: fileStream
        };

        s3.putObject(params,(err, data)=> {

            if(err){
                console.error(new Error("uploading new image file: " + err));
                res.status(500).json({error:1});
                return;
            }

            console.log("S3 Upload Success");
            fs.unlink(file.path);

            //TODO generate signed URL for return.
            params = {Bucket: 'voto-question-images', Key: newFileName, Expires: 10*60}; //10 minutes

            s3.getSignedUrl('getObject', params, (err, url) => {

                if (err) {
                    console.error(new Error("generating signed image URL: " + err));
                    return;
                }

                console.log("The URL is", url);
                res.json({
                    url: url,
                    imgFileName: newFileName
                });
            });
        });
    });

    // log any errors that occur
    form.on('error', function (err) {
        console.error(new Error("file upload: " + err));
        res.status(500).send(err);
    });

    // parse the incoming request containing the form data
    form.parse(req);
});

/**
 * DELETE route to remove a question from the DB. URL: /deleteQuestion?questionId=x&imgFileName=x
 */
router.delete('/:questionId/image/:imgFileName', (req,res)=>{

    if (!req.session.userId) {
        res.status(401).json({error: "ER_NOT_LOGGED_IN"});
        return;
    }

    let removeImage = (imgFileName) => {

        let params = {
            Bucket:'voto-question-images',
            Key: imgFileName
        };
        s3.deleteObject(params, (err, data) => {
            if (err){
                console.error(new Error("ER_S3_DELETE"));
                res.status(500).json({error:"ER_S3_DELETE"});
                return;
            }

            res.json({status:"success"});
        });
    };


    if(req.params.questionId){

        // Delete this questionId from the DB.
        db.deleteQuestion(req.params.questionId, (err)=>{

            if(err){
                console.error(new Error(err));
                res.status(500).json({error:err});
                return;
            }

            if(req.params.imgFileName){
                removeImage(req.params.imgFileName);
            }else{
                res.json({status:"success"});
            }
        });

    }else if(req.params.imgFileName){
        removeImage(req.params.imgFileName);
    }

});

/**
 * DELETE route to remove a session from the DB. URL "/deleteSession?sessionId=xx"
 */
router.delete('/deleteSession', (req,res)=>{

    if (!req.session.userId) {
        res.status(401).json({error: "ER_NOT_LOGGED_IN"});
        return;
    }

    db.deleteSession(req.query.sessionId, req.session.userId, (err)=>{

        if(err){
            res.status(500).json({error:err});
            return;
        }

        res.json({status:"success"});
    });
});

/**
 * GET method to retrieve all sessions for a userId. no URL modification need because userId is in the cookie.
 */
router.get('/', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    db.getAllSessions(req.session.userId, (err, sessions) => {
        if (err) {
            res.status(500).json({error: err});
            return;
        }

        res.json({sessions: sessions});
    });
});

/**
 * GET method to retrieve all sessions for a userId. URL "/session?sessionId=xx"
 */
router.get('/session', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    if(!req.query.sessionId){
        res.status(500).json({error: "ERR_NO_SESSION_ID"});
        return;
    }

    db.getSession(req.query.sessionId, (err, sessions) => {

        if (err) {
            res.status(500).json({error: err});
            return;
        }

        res.json({session: sessions});
    });
});

/**
 * GET method to return all questions for a specific session. URL:"/sessionQuestions?sessionId=xxxx".
 */
router.get('/sessionQuestions/:sessionId', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    db.getSessionQuestions(req.params.sessionId, (err, questions) => {
        if (err) {
            res.status(500).json({error: err});
            return;
        }

        res.json(questions);
    });
});

/**
 * GET method to return a single question. URL:"/question?questionId=xxxx".
 */
router.get('/question', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    db.getQuestion(req.query.questionId, (err, question) => {
        if (err) {
            res.status(500).json({error: err});
            return;
        }

        res.json(question);
    });
});

/**
 * GET method to return a one time URL to view a question image slide. URL:"/sessionQuestions?sessionId=xxxx.ext".
 */
router.get('/questionImageURL', (req, res) => {

    // || !req.session.authorizedSessionId
    if (!req.session.userId ) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN_OR_AUTHORIZED"});
        return;
    }

    if (!req.query.imgFileName) {
        res.status(500).json({error: "ER_NO_FILENAME"});
    }

    let imgFileName = req.query.imgFileName;
    let params = {Bucket: 'voto-question-images', Key: imgFileName, Expires: 10*60};

    s3.getSignedUrl('getObject', params, (err, url) => {

        if (err) {
            console.error(new Error("generating signed image URL: " + err));
            return;
        }

        console.log("The URL is", url);
        res.json({
            url: url,
        });
    });

});

router.get('/activeSessions', (req,res)=>{



});

module.exports = router;
