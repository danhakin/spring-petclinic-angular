var utilsApi = require('../lib/utils_api.js'),
	utils = require('../lib/utils.js'),
	clone = require('clone'),
	Q = require('q'),
	chalk = require('chalk');

///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

//get all owners
function getOwners () {
	return utilsApi.get(TEST_DATA.url.owners)
		.then(function (response) {
			expect(response).property('statusCode').equal(200);
			expect(response).property('body').a('array');
			return Q(response.body);
		});
}

//return an id for a new owner
function getNewOwnerId () {
	return getOwners().then(function (owners) {
		if (owners.length === 0) {return Q(1);}
		//if there were any owners already, return last id + 1
		return owners[owners.length - 1].id + 1;
	});
}


//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function createOwner (owner) {
	var newOwner = clone(owner);
	newOwner.surname += '_' + (new Date()).getTime();
	var body = {
		address: newOwner.address,
		city: newOwner.city,
		firstName: newOwner.name,
		lastName: newOwner.surname,
		telephone: newOwner.telephone
	};
	if (newOwner.pets) {body.pets = newOwner.pets;}
	//get id for new owner
	return getNewOwnerId()
		.then(function (newOwnerId) {
			body.id = newOwner.id = newOwnerId;
			return utilsApi.post(TEST_DATA.url.owners, body);
		})
		.then(function (response) {
			var expected = {
				statusCode: 201,
				body: body
			};
			if (!newOwner.pets) {expected.body.pets = newOwner.pets = [];}
			if (DEBUG_CONSOLE) {
				console.log(chalk.magenta('Expected Response:\n') + JSON.stringify(expected, null, '\t'));
			}
			if (utils.compareJsons(response, expected, {strict: true})) {
				return Q.reject(new Error('Differences between expected and actual response. Please check execution log.'));
			}
			//sometimes the assigned id is not the previous one, so we get it again
			return getNewOwnerId();
		})
		.then(function (actualOwnerId) {
			newOwner.id = actualOwnerId - 1;
			return Q(newOwner);
		});
}

function checkOwner (owner) {
	return utilsApi.get(TEST_DATA.url.getOwner(owner.id))
		.then(function (response) {
			var expected = {
				statusCode: 200,
				body: {
					id: owner.id,
					address: owner.address,
					city: owner.city,
					firstName: owner.name,
					lastName: owner.surname,
					telephone: owner.telephone,
					pets: owner.pets
				}
			};
			if (DEBUG_CONSOLE) {
				console.log(chalk.magenta('Expected Response:\n') + JSON.stringify(expected, null, '\t'));
			}
			if (utils.compareJsons(response, expected, {strict: true})) {
				return Q.reject(new Error('Differences between expected and actual response. Please check execution log.'));
			}
		});
}

function deleteOwner (owner) {
	return utilsApi.delete(TEST_DATA.url.getOwner(owner.id))
		.then(function (response) {
			expect(response).property('statusCode').equal(204);
		});
}

function checkDeletedOwner (owner) {
	return utilsApi.get(TEST_DATA.url.getOwner(owner.id))
		.then(function (response) {
			//is ok, then it still exists
			return Q.reject(new Error('Owner still exists with data:\n' + JSON.stringify(response.body, null, '\t')));
		}, function (errResponse) {
			expect(errResponse).property('statusCode').equal(404);
		});
}


module.exports = {
	createOwner: createOwner,
	checkOwner: checkOwner,
	deleteOwner: deleteOwner,
	checkDeletedOwner: checkDeletedOwner
};