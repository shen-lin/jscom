var unirest = require('unirest');


		unirest.get('http://localhost:3000/components')
		.end(function (response, error) {
			var res = response.body;
			console.log("???????????" + res);
		});	

		unirest.post('http://localhost:3000/close')
		.end(function (response) {
			var res = response.body;
			console.log("???????????" + res);
		});

		unirest.post('http://localhost:3000/component')
		.end(function (response) {
			var res = response.body;
			console.log("???????????" + res);
		});	

