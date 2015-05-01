// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/jscom.js');
var jscomRt = jscom.getJSCOMRuntime();
var JSCOM = jscom.getJSCOMGlobal();

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
calcComposite.bind(calculator, adder, "Calc.IAdd");
calcComposite.bind(calculator, subtractor, "Calc.ISubtract");

// Exposing example system interface...
calcComposite.exposeInterface("Calc.ICalculator");

// Invoking example system and printing output...
addOutput = calcComposite.add(5,5);
subOutput = calcComposite.subtract(5,3);


describe("Invoke Composed Calculator Component Instance", function() { 
	it("5 + 5", function() { 
		should(addOutput).equal(10);
	}); 

	it("5 - 3", function() { 
		should(subOutput).equal(2);
	}); 
});


// Listing composites in the runtime environment...
var compositeSet = jscomRt.getCompositeSet();

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
var calculatorAcquisitors = calculator.getAcquisitorSet();

describe("[Meta Interface] Runtime Component Graph", function() { 
	it("MyCalculator's IAdd Acquisitor", function() { 
		should(calculatorAcquisitors).have.property('Calc.IAdd');
	}); 

	it("Connects to MyAdder", function() { 
		should(calculatorAcquisitors['Calc.IAdd'].ref.id).equal('MyAdder');
	}); 

	it("MyCalculator's ISubtract Acquisitor", function() { 
		should(calculatorAcquisitors).have.property('Calc.ISubtract');
	}); 

	it("Connects to MySubtractor", function() { 
		should(calculatorAcquisitors['Calc.ISubtract'].ref.id).equal('MySubtractor');
	}); 
});

// Listing interfaces of component MyCalculator...
var calculator = jscomRt.getComponent("MyCalculator");
var calculatorInterfaces = calculator.getInterfaceSet();

describe("[Meta Interface] Get Interfaces", function() { 
	it("MyCalculator: Calc.ICalculator", function() { 
		should(calculatorInterfaces).containEql('Calc.ICalculator');
	}); 
});

// Test multiple Logger components to MyCalculator...
var consoleLogger = calcComposite.createComponent("Calc.ConsoleLogger", "MyConsoleLogger");
var fileLogger = calcComposite.createComponent("Calc.FileLogger", "MyFileLogger");
calcComposite.bind(calculator, consoleLogger, "Calc.ILog");
calcComposite.bind(calculator, fileLogger, "Calc.ILog");
var iCalcIEP = calcComposite.exposeInterface("Calc.ICalculator");
iCalcIEP.add(10,5);
iCalcIEP.subtract(20,3);


// Test binding failure...
var invalidBind = function() {
	calcComposite.bind(calculator, consoleLogger, "Calc.IBad");
};

describe("Invalid Component Binding", function() { 
	it("Throw Error", function() { 
		(invalidBind).should.throw(/^Binding Failure/);
	}); 
});

