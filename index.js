var path = require('path');
var url = require('url');
var express = require('express');
var routes = require('./routes');
var middlewares = require('./lib/middlewares');

var app = express();
app.use(middlewares);
require('./routes')(app);

app.listen(3000, function () {
	console.log('server is start');
});