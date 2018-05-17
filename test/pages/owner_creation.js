var Q = require('q'),
	_ = require('underscore'),
	clone = require('clone'),
	utils = require('../lib/utils_webdriver.js');

var selectors = {
	addOwnerButton: {xpath: '//button[@class="btn btn-default" and text()="Add Owner"]'},
	firstNameField: {xpath: '//input[@name="firstName"]'},
	lastNameField: {xpath: '//input[@name="lastName"]'},
	addressField: {xpath: '//input[@name="address"]'},
	cityField: {xpath: '//input[@name="city"]'},
	telephoneField: {xpath: '//input[@name="telephone"]'}
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function load () {
	return utils.waitElementVisible(selectors.firstNameField);
}

function createOwner (owner) {
	var newOwner = clone(owner);
	newOwner.surname += '_' + (new Date()).getTime();
	return utils.setText(selectors.firstNameField, newOwner.name)
		.then(function () {
			return utils.setText(selectors.lastNameField, newOwner.surname, 1000);
		})
		.then(function () {
			return utils.setText(selectors.addressField, newOwner.address, 1000);
		})
		.then(function () {
			return utils.setText(selectors.cityField, newOwner.city, 1000);
		})
		.then(function () {
			return utils.setText(selectors.telephoneField, newOwner.telephone, 1000);
		})
		.then(function () {
			return utils.click(selectors.addOwnerButton);
		})
		.then(function () {
			return Q(newOwner);
		});
}


module.exports = {
	load: load,
	createOwner: createOwner
};