var Q = require('q'),
	utils = require('../lib/utils_webdriver.js'),
	ownersList = require('./owners_list.js'),
	petTypesPage = require('./pet_types.js');

var selectors = {
	header: {xpath: '//div[@class="navbar-header"]'},
	ownersDrop: {xpath: '//a[@class="dropdown-toggle" and text()="Owners"]'},
	allOwnersLink: {xpath: '//a[@routerLink="/owners"]'},
	petTypesLink: {xpath: '//a[@title="pettypes"]'}
};

//////////////////////
// PUBLIC FUNCTIONS //
//////////////////////

function go () {
	return driver.get(TEST_DATA.url.home)
		.then(function() {
			//wait for header to load
			return utils.waitElementVisible(selectors.header, 5000);
		})
		.then(function() {return Q();});
}

function goToOwnersList () {
	return utils.click(selectors.ownersDrop)
		.then(function () {
			return utils.click(selectors.allOwnersLink);
		})
		.then(function () {
			//wait for owners list to load
			return ownersList.load();
		});
}

function goToPetTypesPage () {
	return utils.click(selectors.petTypesLink)
		.then(function () {
			return petTypesPage.load();
		});
}


module.exports = {
	go: go,
	goToOwnersList: goToOwnersList,
	goToPetTypesPage: goToPetTypesPage
};