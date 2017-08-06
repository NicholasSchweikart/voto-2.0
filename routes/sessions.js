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

    async.each(questions, (question, _cb) => {

        // Check if its a new question
        if (question.questionId === "") {

            //Upload img base64 to S3
            let newFileName = uuidv4();

            //TODO integrate amazon S3 upload here.
            let params = {
                Bucket: 'voto-question-images',
                Key: newFileName,
                Body: question.uri,
                ContentEncoding: 'base64',
                ContentType: 'image/jpeg'
            };

            s3.putObject(params, (err, data) => {

                if (err) {
                    console.error(new Error("uploading URI: " + err));
                    uploadErrors.push(question);
                    return _cb(null);
                }

                console.log("S3 Upload Success");

                question.imgFileName = newFileName;

                // Save the new question to DB
                db.saveNewQuestion(question, (err) => {
                    if (err) {
                        console.error(new Error("saving question to DB: " + err));
                        dbErrors.push(question);
                    }
                    _cb(null);
                });
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
        res.json({status: "success"});
    });

});

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
 * GET method to return all questions for a specific session. URL:"/sessionQuestions?sessionId=xxxx".
 */
router.get('/sessionQuestions', (req, res) => {

    if (!req.session.userId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
        return;
    }

    db.getSessionQuestions(req.query.sessionId, (err, questions) => {
        if (err) {
            res.status(500).json({error: err});
            return;
        }

        res.json(questions);
    });
});

/**
 * GET method to return a one time URL to view a question image slide. URL:"/sessionQuestions?sessionId=xxxx.ext".
 */
router.get('/questionImageURL', (req, res) => {

    if (!req.session.userId || !req.session.authorizedSessionId) {
        res.status(401).json({error: "ERR_NOT_LOGGED_IN_OR_AUTHORIZED"});
        return;
    }

    if (!req.query.imgFileName) {
        res.status(500).json({error: "ER_NO_FILENAME"});
    }

    let imgFileName = req.query.imgFileName;
    let params = {Bucket: 'voto-question-images', Key: imgFileName, Expires: 30};

    s3.getSignedUrl('getObject', params, (err, url) => {

        if (err) {
            console.error(new Error("generating signed image URL: " + err));
            return;
        }

        console.log("The URL is", url);
        res.json({url: url});
    });

});

module.exports = router;
