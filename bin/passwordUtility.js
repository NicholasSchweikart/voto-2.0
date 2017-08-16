const crypto = require("crypto");

exports.getSaltHashPassword = (userPassword) => {
  const salt = crypto.randomBytes(8).toString("hex").slice(0, 16);
  const hash = crypto.createHmac("sha512", salt);
  hash.update(userPassword);
  const value = hash.digest("hex");
  return {
    salt,
    passwordHash: value,
  };
};

exports.getPasswordHash = (userPassword, salt) => {
  const hash = crypto.createHmac("sha512", salt);
  hash.update(userPassword);
  return hash.digest("hex");
};

// Testing - outputs should match.
// let pd = this.getSaltHashPassword('test');
// console.log(pd.passwordHash + '--' + pd.salt);
// let to = this.getPasswordHash('test', pd.salt);
// console.log(to);
