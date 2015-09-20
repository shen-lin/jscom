// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/jscom.js');
var JSCOM = jscom.getJSCOM();
var jscomRt = JSCOM.getJSCOMRuntime();

// Configure component repository to be working dir
jscomRt.addComponentRepo(JSCOM.URI_FILE, 'example/BasicCalculator');

// Get component repository...
var componentRepo = jscomRt.getComponentRepo();

describe("Component Repository Configuration", function() { 
	it("Configuration Setter", function() { 
		should(componentRepo).have.property('protocol', JSCOM.URI_FILE);
		should(componentRepo).have.property('baseUri', 'example/BasicCalculator');
	}); 
});

var aRootRepoFiles = jscomRt.listRepoComponents("/");
var aCalcRepoFiles = jscomRt.listRepoComponents("/Calc");

describe("Component Repository Exploration", function() { 
	it("Explore repo root path", function() { 
		should(aRootRepoFiles).containEql("Calc");
	}); 
	it("Explore repo root path", function() { 
		should(aCalcRepoFiles).containEql("Adder.js");
	}); 
});




// Creating a composite of example calculator components...
var calcComposite = jscomRt.createRootComposite("MyComposite");

// Loading example component instances...
var adder = calcComposite.createComponent("Calc.Adder", "MyAdder");
var subtractor = calcComposite.createComponent("Calc.Subtractor", "MySubtractor");
var calculator = calcComposite.createComponent("Calc.Calculator", "MyCalculator");

// Invoking add method on the loaded Adder component instance

describe("Directly Invoke Component Interfaces", function() { 
	it("Adder: 5 + 5", function(done) { 
		adder.add(5, 5, function(error, response){
			should(response).equal(10);
			done();
		});
	}); 
	
	it("Subtractor: 5 - 1", function(done) { 
		subtractor.subtract(5, 1, function(error, response){
			should(response).equal(4);
			done();
		});
	}); 	
});

// Exposing example system interface...
var exposeIAdderSucceed = calcComposite.exposeInterface("Calc.IAdd", "IAdd");
var exposeISubtractSucceed = calcComposite.exposeInterface("Calc.ISubtract", "ISub");
var exposeICalculatorSucceed = calcComposite.exposeInterface("Calc.ICalculator", "ICalc");

var oExposedInterfaceMap = calcComposite.getInterfaces();

describe("MyComposite Expose interfaces", function() { 
	it("Expose IAdder interface succeed", function() { 
		should(exposeIAdderSucceed).equal(true);
	}); 
	
	it("Expose ISubtract interface succeed", function() { 
		should(exposeISubtractSucceed).equal(true);
	});
	
	it("Expose ICalculator interface succeed", function() { 
		should(exposeICalculatorSucceed).equal(true);
	}); 
	
	it("[Meta Interface] Query exposed interfaces ", function() { 
		should(oExposedInterfaceMap).have.property("IAdd");
		should(oExposedInterfaceMap).have.property("ISub");
		should(oExposedInterfaceMap).have.property("ICalc");
	}); 
	
	
	it("Invoke exposed IAdder: 5 + 5", function(done) { 
		calcComposite.IAdd.add(5, 5, function(error, response){
			should(response).equal(10);
			done();
		});
	}); 
	
	it("Invoke exposed ISubtract: 5 - 1", function(done) { 
		calcComposite.ISub.subtract(5, 1, function(error, response){
			should(response).equal(4);
			done();
		});
	});
});


// Binding example components to form the example system...
calcComposite.bind("MyCalculator", "MyAdder", "Calc.IAdd");
calcComposite.bind("MyCalculator", "MySubtractor", "Calc.ISubtract");

// Listing composites in the runtime environment...
var compositeSet = jscomRt.getRootCompositeSet();

describe("[Meta Interface] Composite Set", function() { 
	it("Exist MyComposite", function() { 
		should(compositeSet).have.property('MyComposite');
	}); 
});


// Listing components in MyComposite...
var childrenList = jscomRt.getChildEntityList("MyComposite");
describe("[Meta Interface] Children Entity List in MyComposite", function() { 
	it("Exist MyAdder", function() { 
		var obj = {
			id: 'MyAdder',
			type: JSCOM.COMPONENT
		};
		should(childrenList).containEql(obj);
	}); 

	it("Exist MySubtractor", function() { 
		var obj = {
			id: 'MySubtractor',
			type: JSCOM.COMPONENT
		};
		should(childrenList).containEql(obj);
	}); 

	it("Exist MyCalculator", function() { 
		var obj = {
			id: 'MyCalculator',
			type: JSCOM.COMPONENT
		};
		should(childrenList).containEql(obj);
	}); 
});

// Listing acquisitor of component MyCalculator...
var calculator = jscomRt.getComponent("MyCalculator");
var calculatorAcquisitors = calculator.getAcquisitors();
var oCalculatorProviders = calculator.getServiceProviders();

describe("[Meta Interface] Runtime Component Graph", function() { 
	it("MyCalculator's IAdd Acquisitor", function() { 
		var acquisitorIAdd = {
			name: "Calc.IAdd",
			type: JSCOM.ACQUISITOR_SINGLE
		};
		should(calculatorAcquisitors).containEql(acquisitorIAdd);
	}); 
	it("MyCalculator's ISubtract Acquisitor", function() { 
		var acquisitorISubtract = {
			name: "Calc.ISubtract",
			type: JSCOM.ACQUISITOR_SINGLE
		};
		should(calculatorAcquisitors).containEql(acquisitorISubtract);
	}); 
	it("Connects to MyAdder", function() { 
		var bindingTarget = {
			source: "MyCalculator",
			target: "MyAdder",
			interface: "Calc.IAdd",
			type: JSCOM.ACQUISITOR_SINGLE
		};
		should(oCalculatorProviders).containEql(bindingTarget);
	}); 
	it("Connects to MySubtractor", function() { 
		var bindingTarget = {
			source: "MyCalculator",
			target: "MySubtractor",
			interface: "Calc.ISubtract",
			type: JSCOM.ACQUISITOR_SINGLE
		};
		should(oCalculatorProviders).containEql(bindingTarget);		
	}); 
});

// Listing interfaces of component MyCalculator...
var calculator = jscomRt.getComponent("MyCalculator");
var calculatorInterfaces = calculator.getInterfaces();

describe("[Meta Interface] Get Interfaces", function() { 
	it("MyCalculator: Calc.ICalculator", function() { 
		should(calculatorInterfaces).containEql('Calc.ICalculator');
	}); 
});



// Invoking example system and printing output...
describe("Invoke MyComposite Exposed interfaces", function() { 
	it("Invoke exposed IAdder: 5 + 5", function(done) { 
		calcComposite.ICalc.add(5, 5, function(error, response){
			should(response).equal(10);
			done();
		});
	}); 
	
	it("Invoke exposed ISubtract: 5 - 1", function(done) { 
		calcComposite.ICalc.subtract(5, 1, function(error, response){
			should(response).equal(4);
			done();
		});
	});
});



// Test multiple Logger components to MyCalculator...
var consoleLogger = calcComposite.createComponent("Calc.ConsoleLogger", "MyConsoleLogger");
var fileLogger = calcComposite.createComponent("Calc.FileLogger", "MyFileLogger");
calcComposite.bind("MyCalculator", "MyConsoleLogger", "Calc.ILog");
calcComposite.bind("MyCalculator", "MyFileLogger", "Calc.ILog");


// Test binding failure...
var invalidBind = function() {
	calcComposite.bind("MyCalculator", "MyConsoleLogger", "Calc.IBad");
};

describe("Invalid Component Binding", function() { 
	it("Throw Error", function() { 
		var regexp = new RegExp(JSCOM.Error.BindingFailureAcquisitor.code);
		(invalidBind).should.throw(regexp);
	}); 
});


describe("Invoke MyComposite Exposed ILog interfaces", function() { 
	it("ILog test 1", function(done) { 
		calcComposite.ICalc.log("+", "5", "5", "10", function(error, response){
			should(response).equal("Log sent to console");
			done();
		});
	}); 
	
	it("ILog test 2", function(done) { 
		calcComposite.ICalc.log("-", "5", "1", "4", function(error, response){
			should(response).equal("Log sent to console");
			done();
		});
	}); 	
});
