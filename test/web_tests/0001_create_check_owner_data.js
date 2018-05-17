/////////////////////////////////////////
// TEST: Creates and checks owner data //
/////////////////////////////////////////

var test = require('selenium-webdriver/testing'),
	tcname = '0001_create_check_owner_data';

test.describe(tcname, function () {
	var hooks = require('../lib/hooks.js'),
		home = require('../pages/home.js'),
		ownersList = require('../pages/owners_list.js');
	//shared variables for the test case
	var owner;

	this.timeout(240000);

	test.before(function () {
		//environment initialization
		return hooks.before().then(function () {
			//data initialization
			owner = require(TEST_DATA.owners + '01_regularOwner.js');
		});
	});

	test.afterEach(function () {
		return hooks.afterEach(this.currentTest, tcname);
	});

	test.after(function () {
		return hooks.after(tcname);
	});

	test.it('1 Access main site', function () {
		return home.go();
	});

	test.it('2 Go to owners list page', function () {
		return home.goToOwnersList();
	});

	test.it('3 Create owner', function () {
		return ownersList.createOwner(owner)
			.then(function (newOwner) {
				owner = newOwner;
			});
	});

	test.it('4 Check owner data', function () {
		return ownersList.checkOwner(owner);
	});
});