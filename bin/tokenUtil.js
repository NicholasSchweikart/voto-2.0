const jwt = require('jsonwebtoken'),
  serverConfig = require('../serverConfig');

exports.v = (token) => {
  return new Promise((resolve, reject) => {

    jwt.verify(token, serverConfig.secret, (err, user) => {

      if (err) {
        console.log(`decode err: ${err}`);
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
};

exports.generateToken = (payload) =>{

  let token = jwt.sign(payload,serverConfig.secret,{expiresIn:60*60*24});
  return Promise.resolve(token);
};
