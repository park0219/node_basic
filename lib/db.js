var mysql = require("mysql");
var db = mysql.createConnection({
    host: "192.168.0.148",
    user: "term",
    password: "1234",
    database: "opentutorials",
});
db.connect();
module.exports = db;