/////////////////////////////////////////
// TEST: Creates and checks owner data //
/////////////////////////////////////////

var tcname = '0001_create_check_owner_data';

describe(tcname, function () {
	var hooks = require('../lib/hooks_api.js'),
      ownersApi = require('../apis/owners.js');
  //shared variables
	var owner;

	this.timeout(240000);

	before(function () {
		//environment initialization
		hooks.before();
		//data initialization
		owner = require(TEST_DATA.owners + '01_regularOwner.js');
	});

	afterEach(function () {
		hooks.afterEach(this.currentTest, tcname);
	});

	after(function () {
		hooks.after(tcname);
	});

	it('1 Create owner', function () {
		return ownersApi.createOwner(owner)
			.then(function (newOwner) {
				owner = newOwner;
			});
	});

	it('2 Check owner data', function () {
		return ownersApi.checkOwner(owner);
	});

  it('3 Delete created owner', function () {
    return ownersApi.deleteOwner(owner);
  });

  it('4 Check deletion of created owner', function () {
    return ownersApi.checkDeletedOwner(owner);
  });
});