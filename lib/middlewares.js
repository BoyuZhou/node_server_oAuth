

var path = require('path');
var parseUrl = require('url').parse;
var redis = require('redis');
var bodyparser = require('body-parser');
var connect = require('connect');
var multipart = require('connect-multiparty');
var utils = require('./utils');
var database = require('./database');


//
exports.ensureLogin = function (req, res, next) {
     req.loginUserId = 'glen';
     next();
}

var postBody = connect();
postBody.use(bodyparser.json());
postBody.use(bodyparser.unlencoded({extend: true}));
postBody.use(multipart());
exports.postBody = postBody;

exports.extendAPIoutput = function (req, res, next) {

  function output (data) {
  	var type = path.extname(parseUrl(req.url).pathname);
  	if (!type) type = "." + req.accepts(['json']);
  	return res.json(data);
  }

  res.apiSuccess = function (data) {
  	output({
  		status: 'OK',
        result: data
    });
  };

  res.apiError = function (err) {
  	output({
  		status: 'Error',
  		error_code: err.error_code || 'UNKOWN',
  		error_massage: err.error_massage || err.toString()
  	});
  };
  
  next();
}


exports.apiErrorHandle = function (err, req, res, next) {
	console.log((err && err.stack) || err.toString());

	if (typeof res.apiError === 'function') {
        return res.apiError(err);
	}

	next();
};

exports.verifyAccessToken = function (req, res, next) {
	var accessToken = (req.body && req.body.access_token) || req.query.access_token;
	var source = (req.body && req.body.sourse) || req.query.sourse;

	if (!accessToken) return next(utils.missingParameterError('access_token'));
	if (!sourse) return next(utils.missingParameterError('source'));

	database.getAccessTokenInfo(accessToken, function (err, tokenInfo) {
		if (err) return next(err);

		if (sourse !== tokenInfo.clientId) {
           return next(utils.invalidParameterError('sourse'));
		}

		req.accessTokenInfo = tokenInfo;

		next();
	});
};






//redis
var redisClient = redis.createClient();

exports.generateRateLimiter = function (getKey, limit) {
	return function (req, res, next) {
		var sourse = (req.body && req.body,sourse) || req.query.sourse;
		var key = getKey(sourse);

		redisClient.incr(key, function (err, ret) {
			if(err) return next(err);
			if(ret > limit) return next(utils.outOfRateLimitError());

			next();
		});
	};
};