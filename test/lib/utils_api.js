var _ = require('underscore'),
	chalk = require('chalk'),
	rp = require('request-promise'),
	Q = require('q');

///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

//converts a full response into statusCode, headers and body
function formatResponse (response) {
	var formattedResponse = {
		statusCode: response.statusCode,
		headers: response.headers,
		body: response.body
	};
	if (DEBUG_CONSOLE) {
		console.log(chalk.cyan('Response:\n') + JSON.stringify(formattedResponse, null, '\t'));
	}
	return formattedResponse;
}

//changes error message in case [object Object] appears
function formatError (error) {
	if (DEBUG_CONSOLE && error.response) {
		var errorToLog = {
			statusCode: error.response.statusCode,
			headers: error.response.headers,
			body: error.response.body
		};
		console.log(chalk.red('Error response:\n') + JSON.stringify(errorToLog, null, '\t'));
	}
	if (error.message.indexOf("[object Object]") > -1) {
		error.message = error.statusCode + " - " + JSON.stringify(error.error);
	}
	throw error;
}

function logRequest (opt, query) {
	if (DEBUG_CONSOLE) {
		console.log(chalk.green('Method + URI: ') + opt.method + " " + opt.uri);
		if (!_.isEmpty(query)) {
			console.log(chalk.green('Request Querystring:\n') + JSON.stringify(query, null, '\t'));
		}
		if (opt.headers) {
			console.log(chalk.green('Request Headers:\n') + JSON.stringify(opt.headers, null, '\t'));
		}
		if (opt.body) {
			console.log(chalk.green('Request Body:\n') + JSON.stringify(opt.body, null, '\t'));
		}
	}
}

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

/*
/  GET request
/  @params
/     uri     - api uri
/     options - additional request params
/  @returns
/     parsed response json
*/
function getRq (uri, options) {
	var opt = options ? clone(options, false, 2) : {};
	if (!opt.headers) {opt.headers = {};}
	//if options.cache = true, don't send no-cache header
	if (opt.cache) {delete opt.cache;}
	else {opt.headers['Cache-Control'] = 'no-cache';}
	opt.json = true; //json response
	opt.method = 'GET';
	opt.uri = uri;
	opt.resolveWithFullResponse = true;
	logRequest(opt);
	//request
	return rp(opt).then(formatResponse, formatError);
}

/*
/  POST request
/  @params
/     uri     - api uri
/     body    - body to send [javascript object]
/     options - additional request params
/  @returns
/     parsed response json
*/
function postRq (uri, body, options) {
	var opt = options ? clone(options, false, 2) : {};
	opt.body = body;
	opt.json = true; //json response/request
	opt.method = 'POST';
	opt.uri = uri;
	opt.resolveWithFullResponse = true;
	logRequest(opt);
	//request
	return rp(opt).then(formatResponse, formatError);
}

/*
/  DELETE request
/  @params
/     uri      - api uri
/    options   - additional request params
/  @returns
/     parsed response json
*/
function deleteRq (uri, options) {
	var opt = options ? clone(options, false, 2) : {};
	opt.json = true; //json response
	opt.method = 'DELETE';
	opt.uri = uri;
	opt.resolveWithFullResponse = true;
	logRequest(opt);
	//request
	return rp(opt).then(formatResponse, formatError);
}


module.exports = {
	get: getRq,
	post: postRq,
	delete: deleteRq
};