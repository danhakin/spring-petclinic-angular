/////////////////////////////////////////
// TEST: Creates and checks a pet type //
/////////////////////////////////////////

var tcname = '0002_create_check_pet_type';

describe(tcname, function () {
	var hooks = require('../lib/hooks_api.js'),
      petTypesApi = require('../apis/pet_types.js');
  //shared variables
	var petType;

	this.timeout(240000);

	before(function () {
		//environment initialization
		hooks.before();
	});

	afterEach(function () {
		hooks.afterEach(this.currentTest, tcname);
	});

	after(function () {
		hooks.after(tcname);
	});

	it('1 Create pet type', function () {
		return petTypesApi.createPetType()
			.then(function (newPetType) {
				petType = newPetType;
			});
	});

	it('2 Check created pet type', function () {
		return petTypesApi.checkPetType(petType);
	});

  it('3 Delete created pet type', function () {
    return petTypesApi.deletePetType(petType);
  });

  it('4 Check deletion of created pet type', function () {
    return petTypesApi.checkDeletedPetType(petType);
  });
});