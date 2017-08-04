const AWS = require('aws-sdk');

AWS.config.loadFromPath('./awsConfig.json');

const s3 = new AWS.S3();

exports.getSignedURL(resourceId, bucket, (err, url)=>{

    s3.getSignedUrl('getObject', params, function (err, url) {
        console.log("The URL is", url);
    });
});


