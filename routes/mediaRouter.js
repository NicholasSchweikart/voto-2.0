const express = require("express"),
  router = express.Router(),
  formidable = require("formidable"),
  fs = require("fs"),
  uuidv4 = require("uuid/v4"),
  path = require("path"),
  jwt = require('jsonwebtoken'),
  serverConfig = require('../serverConfig'),
  AWS = require("aws-sdk");

AWS.config.region = "us-east-2";

const s3 = new AWS.S3({
  signatureVersion: "v4",
});

/**
 * Preforms token authorization on all incoming requests.
 */
router.all('/*', (req, res, next) => {

  let token = req.body.authorization || req.headers['authorization'];

  if (!token) {
    res.status(401).json({error: "ERR_NOT_LOGGED_IN"});
    return;
  }

  jwt.verify(token,serverConfig.secret,(err, user) =>{

    if(err){
      console.log(`decode err: ${err}`);
      return res.json({success:false, msg: "failed to decode token"});
    }

    console.log(`user = ${JSON.stringify(user)}`);
    req.user = user;

    // Continue on to the next route match.
    next();
  });
});

router.post("/uploadImageFile", (req, res) => {

  // create an incoming form object
  const form = new formidable.IncomingForm();

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, "../uploads");

  // every time a file has been uploaded successfully
  form.on("file", (field, file) => {

    const newFileName = `${uuidv4()}_${file.name}`;
    const fileStream = fs.createReadStream(file.path);

    fileStream.on("error", (err) => {
      console.error(new Error(`file stream error: ${err}`));
    });

    let params = {
      Bucket: "voto-question-images",
      Key: newFileName,
      Body: fileStream,
    };

    s3.putObject(params, (err, data) => {
      if (err) {
        console.error(new Error(`uploading new image file: ${err}`));
        res.status(500).json({error: 1});
        return;
      }

      console.log("S3 Upload Success");
      fs.unlink(file.path);

      params = {Bucket: "voto-question-images", Key: newFileName, Expires: 10 * 60}; // 10 minutes

      s3.getSignedUrl("getObject", params, (err, url) => {
        if (err) {
          console.error(new Error(`generating signed image URL: ${err}`));
          return;
        }

        console.log("The URL is", url);
        res.json({
          url,
          imgFileName: newFileName,
        });
      });
    });
  });

  // log any errors that occur
  form.on("error", (err) => {
    console.error(new Error(`file upload: ${err}`));
    res.status(500).send(err);
  });

  // parse the incoming request containing the form data
  form.parse(req);
});

/**
 * @api {delete} api/media/:imgFileName/ De-Activate a specific slide
 * @apiName Delete Slide Image
 * @apiGroup Media
 * @apiPermission ADMIN ONLY
 * @apiParam {String} imgFileName File to remove from S3.
 *
 * @apiSuccess (200) {String} SUCCESS Slide Image Removed.
 * @apiSuccessExample {String} SUCCESS
 *    HTTP/1.1 200 OK
 *    ["SUCCESS"]
 *
 * @apiError (500) ER_S3_DELETE Error deleting resource.
 * @apiErrorExample {String} ER_S3_DELETE
 * HTTP/1.1 500
 * [
 *  "ER_S3_DELETE"
 * ]
 */
router.delete("/:imgFileName", (req, res) => {

  console.log(`Deleting media object ${req.params.imgFileName}`);
  if(!req.params.imgFileName){
    return res.status(500).send("MISSING_FILE_NAME");
  }

  const params = {
    Bucket: "voto-question-images",
    Key: req.params.imgFileName,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.log("ER_S3_DELETE");
      res.status(500).send("ER_S3_DELETE");
      return;
    }
    res.status(200).send("SUCCESS");
  });
});