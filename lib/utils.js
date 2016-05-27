


var clone = require('clone');
var parseUrl = require('url').parse;
var formatUrl = require('url').format;

var utils = module.exports = exports = clone(require('zby-utils'));

utils.addQueryParamsToUrl = function (url, params) {
	var info = parseUrl(url, true);
	for (var i in params) {
      info.query[i] = params[i];
	}
	delete info.search;
	return formatUrl(info);
};

utils.defaultNumber = function (n, d) {
	n = Number(n);
	return n > 0 ? n : d;
};

utils.createApiError = function (code, msg) {
	var err = new Error(msg);
	err.error_code = code;
	err.error_massage = msg;
	return err;
};

utils.missingParameterError = function (name) {
	return utils.createApiError('MISSING_PARAMETER', 'no' + name);
};
utils.redirectUriNotMatchError = function (url) {
	return utils.createApiError()
};
utils.invalidParameterError = function (name) {
	return utils.createApiError('INVALID_PARAMETER','parameter');
};
utils.outOfRateLimitError = function () {
	return utils.createApiError('out of time');
};

