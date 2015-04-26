// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/jscom.js');
var jscomRt = jscom.getJSCOMRuntime();
var JSCOM = jscom.getJSCOMGlobal();

// Configure component repository to be working dir
// jscomRt.addComponentRepo(JSCOM.URI_FILE, 'example/RestCompPoC');

// Get component repository...
var componentRepo = jscomRt.getComponentRepo();

// Creating a composite of example calculator components...
var restComposite = jscomRt.createComposite("RestComposite");

// Loading example component instances...
var restService = restComposite.createComponent("JSCOM.components.rest.RestServer", "MyRestServer");
restService.port = 3000;
restService.start();

var unirest = require('unirest');

var initResponse;
var closeConfirm;
var afterCloseResponse;

unirest.get('http://localhost:3000/components')
.end(function (response, error) {
	initResponse = response.body;
});	

unirest.post('http://localhost:3000/close')
.end(function (response) {
	var closeConfirm = response.body;
});

unirest.post('http://localhost:3000/component')
.end(function (response) {
	var afterCloseResponse = response.body;
});	
	
describe("REST API", function() { 
	it("Create component", function() { 
		should(initResponse).equal("components");
	});

	it("Close connection", function() { 
		should(closeConfirm).equal("Connection Closed");
		should(afterCloseResponse).equal("components");
	});	
});


