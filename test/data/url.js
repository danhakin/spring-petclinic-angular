var apiBase = 'http://localhost:9966/petclinic/api';

module.exports = {
	//web URLs
	home: 'http://localhost:4200/petclinic/',

	//api URLs
	owners: apiBase + '/owners',
	getOwner: function (id) {
		return apiBase + '/owners/' + id;
	},
	petTypes: apiBase + '/pettypes',
	getPetType: function (id) {
		return apiBase + '/pettypes/' + id;
	},
};