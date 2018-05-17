var utils = require('../lib/utils_webdriver.js'),
	Q = require('q');

var selectors = {
	dataTable: {xpath: '//div[@class="container xd-container" and .//h2[text()="Pet Types"]]'},
	addButton: {xpath: '//button[contains(text(), "Add")]'},
	nameEditField: {xpath: '//input[@id="name"]'},
	saveButton: {xpath: '//button[text()="Save"]'},
	nameField: function (petType) {
		return {xpath: '//input[@name="pettype_name" and @ng-reflect-model="' + petType + '"]'};
	},
	deleteButton: function (petType) {
		return {xpath: '//tr[.//input[@name="pettype_name" and @ng-reflect-model="' + petType + '"]]//button[text()="Delete"]'};
	}
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function load () {
	return utils.waitElementVisible(selectors.dataTable, 5000);
}

function addPetType () {
	var testPet = 'test_pet_' + (new Date()).getTime();
	return utils.click(selectors.addButton)
		.then(function () {
			return utils.setText(selectors.nameEditField, testPet);
		})
		.then(function () {
			return utils.click(selectors.saveButton, 1000);
		})
		.then(load)
		.then(function () {
			return Q(testPet);
		});
}

function checkPetType (petType) {
	return utils.waitElementVisible(selectors.nameField(petType));
}

function deletePetType (petType) {
	return utils.click(selectors.deleteButton(petType)).then(load);
}

function checkDeletedPetType (petType) {
	return utils.waitElementNotExists(selectors.nameField(petType), 5000);
}

module.exports = {
	load: load,
	addPetType: addPetType,
	checkPetType: checkPetType,
	deletePetType: deletePetType,
	checkDeletedPetType: checkDeletedPetType
};