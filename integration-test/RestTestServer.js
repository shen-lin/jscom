// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/jscom.js');
var JSCOM = jscom.getJSCOM();
var jscomRt = JSCOM.getJSCOMRuntime();

// Configure component repository to be working dir
jscomRt.addComponentRepo(JSCOM.URI_FILE, 'example/RestCompPoC');

// Get component repository...
var componentRepo = jscomRt.getComponentRepo();

// Creating a composite of example calculator components...
var rootComposite = jscomRt.createRootComposite("ComplexTestComposite");
var restComposite = rootComposite.createComposite("RestComposite");

// Loading example component instances...
var restService = restComposite.createComponent("JSCOM.components.rest.RestServer", "MyRestServer");
restService.port = 3000;
restService.start();