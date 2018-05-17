var utilsApi = require('../lib/utils_api.js'),
	utils = require('../lib/utils.js'),
	clone = require('clone'),
	Q = require('q'),
	chalk = require('chalk');


/////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function createPetType () {
	var body = {name: 'test_pet_' + (new Date()).getTime()};
	return utilsApi.post(TEST_DATA.url.petTypes, body)
		.then(function (response) {
			var expected = {
				statusCode: 201,
				body: body
			};
			expect(response).property('body').property('id').a('number').above(0);
			if (DEBUG_CONSOLE) {
				console.log(chalk.magenta('Expected Response:\n') + JSON.stringify(expected, null, '\t'));
			}
			if (utils.compareJsons(response, expected, {strict: true})) {
				return Q.reject(new Error('Differences between expected and actual response. Please check execution log.'));
			}
			return Q(response.body);
		});
}

function checkPetType (petType) {
	return utilsApi.get(TEST_DATA.url.getPetType(petType.id))
		.then(function (response) {
			var expected = {
				statusCode: 200,
				body: petType
			};
			if (DEBUG_CONSOLE) {
				console.log(chalk.magenta('Expected Response:\n') + JSON.stringify(expected, null, '\t'));
			}
			if (utils.compareJsons(response, expected, {strict: true})) {
				return Q.reject(new Error('Differences between expected and actual response. Please check execution log.'));
			}
		});
}

function deletePetType (petType) {
	return utilsApi.delete(TEST_DATA.url.getPetType(petType.id))
		.then(function (response) {
			expect(response).property('statusCode').equal(204);
		});
}

function checkDeletedPetType (petType) {
	return utilsApi.get(TEST_DATA.url.getPetType(petType.id))
		.then(function (response) {
			//is ok, then it still exists
			return Q.reject(new Error('Pet type still exists with data:\n' + JSON.stringify(response.body, null, '\t')));
		}, function (errResponse) {
			expect(errResponse).property('statusCode').equal(404);
		});
}


module.exports = {
	createPetType: createPetType,
	checkPetType: checkPetType,
	deletePetType: deletePetType,
	checkDeletedPetType: checkDeletedPetType
};