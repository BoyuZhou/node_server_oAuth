


var mysql = require('mysql');

var database = module.exports;
var config = {
    host: '127.0.0.1',
    user: 'root',
    password: '123',
    port: '3306'
};

var pool = mysql.createPool(config);

pool.on('connection', function (connection) {
      connection.query('')
});

exports.generateAuthorCode = function (userId, clientId, redirectUri, callback) {
	pool.getConnection(function (err, connection) {
	connection.query('');
	connection.release();
})
}


