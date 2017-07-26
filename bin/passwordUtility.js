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

//Testing - outputs should match.
// let pd = this.getSaltHashPassword('test');
// console.log(pd.passwordHash + '--' + pd.salt);
// let to = this.getPasswordHash('test', pd.salt);
// console.log(to);