var Q = require('q'),
	_ = require('underscore'),
	clone = require('clone'),
	utils = require('../lib/utils_webdriver.js');

var selectors = {
	dataTable: {xpath: '//div[@class="container xd-container" and .//h2[text()="Owner Information"]]'},
	nameField: {xpath: '//tr[./th[text()="Name"]]/td'},
	addressField: {xpath: '//tr[./th[text()="Address"]]/td'},
	cityField: {xpath: '//tr[./th[text()="City"]]/td'},
	telephoneField: {xpath: '//tr[./th[text()="Telephone"]]/td'}
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function load () {
	return utils.waitElementVisible(selectors.dataTable);
}

function checkData (owner) {
	return utils.checkText(selectors.nameField, owner.name + ' ' + owner.surname, 'Name')
		.then(function () {
			return utils.checkText(selectors.addressField, owner.address, 'Address', 1000);
		})
		.then(function () {
			return utils.checkText(selectors.cityField, owner.city, 'City', 1000);
		})
		.then(function () {
			return utils.checkText(selectors.telephoneField, owner.telephone, 'Telephone', 1000);
		});
}

module.exports = {
	load: load,
	checkData: checkData
};