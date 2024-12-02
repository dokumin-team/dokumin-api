const generateOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit OTP
  return otp;
};

module.exports = generateOTP;
