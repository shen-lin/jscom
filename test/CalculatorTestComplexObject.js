// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();
var jscomRt = JSCOM.getJSCOMRuntime();

// Test outcome scope
var CalculatorTestComplexObject = {};

// Configure component repository
jscomRt.addComponentRepo('example/BasicCalculator', 'Calc');
jscomRt.addComponentRepo('dist', 'JSCOM');

CalculatorTestComplexObject.componentRepo = jscomRt.getComponentRepo();

describe("Add multiple repositories", function() { 
	it("Calc repo exists", function() {
		should(CalculatorTestComplexObject.componentRepo)
			.have.property('Calc', 'example/BasicCalculator');
	}); 
	it("JSCOM repo exists", function() {
		should(CalculatorTestComplexObject.componentRepo)
			.have.property('JSCOM', 'dist');
	}); 
});

