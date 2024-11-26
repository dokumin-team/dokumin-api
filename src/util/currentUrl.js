// Setting URL Server

const development = "http://localhost:5000/";
// const production = "https://api-dokumin-production.up.railway.app/";
const currentUrl = process.env.NODE_ENV ? development : development;

module.exports = currentUrl;
