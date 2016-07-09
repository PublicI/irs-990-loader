var models = require('../../models');

models.sync(function (err) {
	if (err) {
		throw err;
	}

	console.log('done');
});
