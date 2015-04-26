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