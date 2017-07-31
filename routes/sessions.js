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
    path = require('path');

router.post('/saveNewSession', (req, res) => {

    if (!req.session.userId) {
        res.json({error: "not logged in!"});
    } else {
        let newSession = req.body;

        db.saveNewSession(newSession, req.session.userId, (err, sessionId) => {
            if (err) {
                console.error(new Error("saving new session: " + err));
                res.json({error: err});
            } else {
                res.json({sessionId: sessionId});
            }
        });
    }
});

router.post('/updateTitle', (req, res)=>{
   if(req.session.userId){
       res.json({error: "not logged in!"});
   } else{

   }
});

router.post('/updateGroup', (req, res)=>{
    if(req.session.userId){
        res.json({error: "not logged in!"});
    } else{

    }
});

router.post('/deleteSession', (req, res)=>{
    if(req.session.userId){
        res.json({error: "not logged in!"});
    } else{

    }
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
        fs.rename(file.path, newName, (err)=>{
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

router.get('/allSessions', (req, res)=>{
    if(req.session.userId){
        res.json({error: "not logged in!"});
    } else{

    }
});

module.exports = router;