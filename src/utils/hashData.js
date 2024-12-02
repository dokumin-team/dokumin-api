const bcrypt = require("bcrypt");

const hashData = (data, saltRounds = 10) => {
  return bcrypt.hash(data, saltRounds);
};

module.exports = hashData;
