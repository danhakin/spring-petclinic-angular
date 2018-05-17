var Q = require('q'),
	utils = require('../lib/utils_webdriver.js'),
	ownerCreation = require('./owner_creation.js'),
	ownerDetail = require('./owner_detail.js');

var selectors = {
	ownersList: {xpath: '//table[@class="table table-striped"]'},
	addOwnerButton: {xpath: '//button[@class="btn btn-default" and text()="Add Owner"]'},
	ownerLink: function (fullName) {
		return {xpath: '//a[contains(@href, "owners") and text()="' + fullName + '"]'};
	}
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function load () {
	return utils.waitElementVisible(selectors.ownersList);
}

function createOwner (owner) {
	return utils.click(selectors.addOwnerButton)
		.then(ownerCreation.load)
		.then(function () {
			return ownerCreation.createOwner(owner);
		})
		.then(function (newOwner) {
			return load().then(function () {
				return Q(newOwner);
			});
		});
}

function checkOwner (owner) {
	return utils.click(selectors.ownerLink(owner.name + ' ' + owner.surname))
		.then(ownerDetail.load)
		.then(function () {
			return ownerDetail.checkData(owner);
		});
}

module.exports = {
	load: load,
	createOwner: createOwner,
	checkOwner: checkOwner
};