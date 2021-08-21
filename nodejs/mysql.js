//ALTER USER 'term'@'%' IDENTIFIED WITH mysql_native_password BY '1234';

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '192.168.0.148',
    user: 'term',
    password: '1234',
    database: 'opentutorials'
});

connection.connect();

connection.query('SELECT * FROM topic', function(error, results, fields) {
    if(error) {
        console.log(error);
    }
    console.log(results);
});

connection.end();