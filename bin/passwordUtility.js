const crypto = require("crypto");

exports.getSaltHashPassword = (userPassword) => {
    let salt =  crypto.randomBytes(8).toString('hex').slice(0,16);
    let hash = crypto.createHmac('sha512',salt);
    hash.update(userPassword);
    let value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    }
};

exports.getPasswordHash = (userPassword, salt)=>{
    let hash = crypto.createHmac('sha512',salt);
    hash.update(userPassword);
    return hash.digest('hex');
};
