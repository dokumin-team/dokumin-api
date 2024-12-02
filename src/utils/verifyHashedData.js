const bcrypt = require("bcrypt");

const verifyHashedData = async (unhashed, hashedData) => {
  if (!unhashed || !hashedData) {
    throw new Error("Missing data for hash comparison.");
  }
  return bcrypt.compare(unhashed, hashedData);
};


module.exports = verifyHashedData;
