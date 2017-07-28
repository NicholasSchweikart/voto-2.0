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

        db.saveNewSession(newSession, req.session.userId, (err) => {
            if (err) {
                console.error(new Error("saving new session: " + err));
                res.json({error: err});
            } else {
                res.json({status: "success"});
            }
        });
    }
});

router.post('/uploadMedia', (req, res) => {

    console.log('Attempting to receive new media uploads...');

    // create an incoming form object
    let form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '../uploads');

    // every time a file has been uploaded successfully
    form.on('file',  (field, file)=>{

        fs.rename(file.path, path.join(form.uploadDir, uuidv4()+'_'+file.name), (err)=>{
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
        console.log("Upload successful");
        res.send('success');
    });

    // parse the incoming request containing the form data
    form.parse(req);

});

module.exports = router;