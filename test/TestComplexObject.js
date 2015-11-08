// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();
var jscomRt = JSCOM.getJSCOMRuntime();

// Test outcome scope
var TestComplexObject = {};

// Configure component repository
jscomRt.addComponentRepo('example', 'LifeCycle');
jscomRt.addComponentRepo('dist', 'JSCOM');

TestComplexObject.componentRepo = jscomRt.getComponentRepo();

describe("Add multiple repositories", function() { 
	it("LifyCycle repo exists", function() {
		should(TestComplexObject.componentRepo)
			.have.property('LifeCycle', 'example');
	}); 
	it("JSCOM repo exists", function() {
		should(TestComplexObject.componentRepo)
			.have.property('JSCOM', 'dist');
	}); 
});

// Creating a composite of example calculator components...
TestComplexObject.rootComposite = jscomRt.createRootComposite("TestComplexObjectComposite");

// Loading example component instances...
TestComplexObject.lifeCycleComponent = TestComplexObject.rootComposite
	.createComponent("LifeCycle.LifeCycleComponent", "LCComponent");

describe("Exec ILifeCycle function", function() { 
	it("Exec onLoad", function() {
		should(TestComplexObject.lifeCycleComponent.data)
			.equal("Data");
	}); 
});	