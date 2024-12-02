const development = "http://localhost:5000/";
const production = "";
const currentUrl = process.env.NODE_ENV ? development : production;

module.exports = currentUrl;
