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

describe("Componnet Repository Configuration", function() { 
	it("Configuration Setter", function() { 
		should(componentRepo).have.property('protocol', JSCOM.URI_FILE);
		should(componentRepo).have.property('baseUri', 'example/BasicCalculator');
	}); 
});

// Creating a composite of example calculator components...
var calcComposite = jscomRt.createRootComposite("MyComposite");

// Loading example component instances...
var adder = calcComposite.createComponent("Calc.Adder", "MyAdder");
var subtractor = calcComposite.createComponent("Calc.Subtractor", "MySubtractor");
var calculator = calcComposite.createComponent("Calc.Calculator", "MyCalculator");

// Invoking add method on the loaded Adder component instance
var addOutput = adder.add(5, 5);

describe("Invoke Loaded Adder Component Instance", function() { 
	it("5 + 5", function() { 
		should(addOutput).equal(10);
	}); 
});

// Binding example components to form the example system...
calcComposite.bind("MyCalculator", "MyAdder", "Calc.IAdd");
calcComposite.bind("MyCalculator", "MySubtractor", "Calc.ISubtract");

// Exposing example system interface...
var succeed = calcComposite.exposeInterface("Calc.ICalculator");
describe("MyComposite Compose ICalculator interface", function() { 
	it("Expose ICalculator interface succeed", function() { 
		should(succeed).equal(true);
	}); 
});

// Invoking example system and printing output...
var compositeAddOutput;
var compositeSubOutput;

if (succeed) {
	compositeAddOutput = calcComposite.add(5,5);
	compositeSubOutput = calcComposite.subtract(5,3);
}

describe("Invoke Composed Calculator Component Instance", function() { 
	it("5 + 5", function() { 
		should(compositeAddOutput).equal(10);
	}); 

	it("5 - 3", function() { 
		should(compositeSubOutput).equal(2);
	}); 
});


// Listing composites in the runtime environment...
var compositeSet = jscomRt.getRootCompositeSet();

describe("[Meta Interface] Composite Set", function() { 
	it("Exist MyComposite", function() { 
		should(compositeSet).have.property('MyComposite');
	}); 
});


// Listing components in MyComposite...
var childrenList = jscomRt.getChildrenList("MyComposite");
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

// Test multiple Logger components to MyCalculator...
var consoleLogger = calcComposite.createComponent("Calc.ConsoleLogger", "MyConsoleLogger");
var fileLogger = calcComposite.createComponent("Calc.FileLogger", "MyFileLogger");
calcComposite.bind("MyCalculator", "MyConsoleLogger", "Calc.ILog");
calcComposite.bind("MyCalculator", "MyFileLogger", "Calc.ILog");
calcComposite.exposeInterface("Calc.ICalculator");
calcComposite.add(10,5);
calcComposite.subtract(20,3);


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

