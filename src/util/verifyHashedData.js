const bcrypt = require("bcrypt");

const verifyHashedData = (unhashed, hashedData) => {
  return bcrypt.compare(unhashed, hashedData);
};

module.exports = verifyHashedData;
