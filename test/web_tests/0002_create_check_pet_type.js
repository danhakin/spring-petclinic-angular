/////////////////////////////////////////
// TEST: Creates and checks a pet type //
/////////////////////////////////////////

var test = require('selenium-webdriver/testing'),
	tcname = '0002_create_check_pet_type';

test.describe(tcname, function () {
	var hooks = require('../lib/hooks.js'),
		home = require('../pages/home.js'),
		petTypesPage = require('../pages/pet_types.js');
	//shared variables for the test case
	var petType;

	this.timeout(240000);

	test.before(function () {
		//environment initialization
		return hooks.before();
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

  	test.it('2 Go to pet types page', function () {
  		return home.goToPetTypesPage();
  	});

  	test.it('3 Add pet type', function () {
  		return petTypesPage.addPetType()
  			.then(function (newPetType) {
  				petType = newPetType;
  			});
  	});

  	test.it('4 Check created pet type', function () {
  		return petTypesPage.checkPetType(petType);
  	});

  	test.it('5 Delete created pet type', function () {
  		return petTypesPage.deletePetType(petType);
  	});

  	test.it('6 Check deletion of created pet type', function () {
  		return petTypesPage.checkDeletedPetType(petType);
  	});
});