// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/JSCOM.js');
var jscomRt = jscom.getJSCOMRuntime();
var JSCOM = jscom.getJSCOMGlobal();

var matchDir = JSCOM.String.matchRegExpr("org.Calc.Adder@add", "org.**@add");
var matchChars = JSCOM.String.matchRegExpr("org.Calc.Adder@add", "**.Adder@a*");
var matchChar1 = JSCOM.String.matchRegExpr("org.Calc.Adder@addd", "org.**@ad?");
var matchChar2 = JSCOM.String.matchRegExpr("org.Calc.Adder@add", "org.**@a?d");

describe("Adaptor Pointcut Pattern Matching", function() { 
	it("Match any directory", function() { 
		should(matchDir).equal(true);
	}); 
	
	it("Match multiple characters", function() { 
		should(matchChars).equal(true);
	}); 
	
	
	it("Match one character", function() { 
		should(matchChar1).equal(false);
		should(matchChar2).equal(true);
	}); 
});