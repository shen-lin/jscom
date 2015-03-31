// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/JSCOM.js');
var jscomRt = jscom.getJSCOMRuntime();
var JSCOM = jscom.getJSCOMGlobal();

// Configure component repository to be working dir
jscomRt.addComponentRepo(JSCOM.URI_FILE, 'example/BasicCalculator');

// Get component repository...
var componentRepo = jscomRt.getComponentRepo();

// Creating a composite of example calculator components...
var calcComposite = jscomRt.createComposite("MyComposite");

// Loading example component instances...
var adder = calcComposite.createComponent("Calc.Adder", "MyAdder");
var subtractor = calcComposite.createComponent("Calc.Subtractor", "MySubtractor");
var calculator = calcComposite.createComponent("Calc.Calculator", "MyCalculator");

var addOutput = adder.add(5, 5);
console.log(addOutput);
addOutput = adder.add(5, "abc");
console.log(addOutput);

var calcAdaptor = jscomRt.createAdaptor("Calc.CalcAdaptor", "MyAdaptor");

describe("Create Adaptor", function() { 
	it("Access CalcAdaptor Metadata", function() { 
		should(calcAdaptor.id).equal("MyAdaptor");
	}); 
});


// Binding example components to form the example system...
calcComposite.bind(calculator, adder, "Calc.IAdd");
calcComposite.bind(calculator, subtractor, "Calc.ISubtract");

// Exposing example system interface...
var iCalcIEP = calcComposite.exposeInterface("Calc.ICalculator");


var invalidCreateAdaptorWithDuplicateID = function() {
	jscomRt.createAdaptor("Calc.CalcAdaptor", "MyAdaptor");
};

describe("Invalid adaptor creation with duplicate ID", function() { 
	it("Throw Error", function() { 
		(invalidCreateAdaptorWithDuplicateID).should.throw(/Adaptor instance already exists/);
	}); 
});



var scope = {
	include: ["Calc.**@add"],
	exclude: ["**@sub*"],
};

jscomRt.injectAdaptor("MyInjection", "MyAdaptor", "isInteger", JSCOM.Adaptor.Type.BEFORE, scope);

var addTwoInt = iCalcIEP.add(5,3);

var caughtErrorInInterceptedAddFn = function() {
	iCalcIEP.add(5,'abc');
};

describe("Inject Adaptor", function() { 
	it("No error with adding two integers", function() { 
		should(addTwoInt).equal(8);
	}); 
	
	it("Non-integer input caught by adaptor function", function() { 
		(caughtErrorInInterceptedAddFn).should.throw(/is not an integer/);
	}); 
});


var changedScope = {
	include: [],
	exclude: [],
};
jscomRt.changeAdaptorScope("MyInjection", changedScope);

jscomRt.ejectAdaptor("MyInjection");