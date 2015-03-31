// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/JSCOM.js');
var jscomRt = jscom.getJSCOMRuntime();
var JSCOM = jscom.getJSCOMGlobal();

// Configure component repository to be working dir
jscomRt.addComponentRepo(JSCOM.URI_FILE, 'example/BasicCalculator');

// Create a composite for each component
var myComposite = jscomRt.createComposite("MyComposite");

// Create components in the nested composites
var calculator = myComposite.createComponent("Calc.Calculator", "MyCalculator");
var adder = myComposite.createComponent("Calc.Adder", "MyAdder");
var subtractor = myComposite.createComponent("Calc.Subtractor", "MySubtractor");


// Test unsuccessful binding
try
{
	jscomRt.initTransaction();
	var iAdderIEP = myComposite.exposeInterface("Calc.IAdd");
	var iSubtractorIEP = myComposite.exposeInterface("Calc.ISubtract");
	myComposite.bind(calculator, iAdderIEP, "Calc.IAdd");
	myComposite.bind(calculator, iSubtractorIEP, "Calc.IBad");
	jscomRt.commit();
}
catch (error)
{
	jscomRt.rollback();
}


var calculator = jscomRt.getComponent("MyCalculator");
var calculatorAcquisitors = calculator.getAcquisitorSet();
var noAdderConnect = (calculatorAcquisitors['Calc.IAdd'].ref === null);
var noSubtractorConnect = (calculatorAcquisitors['Calc.ISubtract'].ref === null);

var myCompositeChildren = jscomRt.getChildrenList("MyComposite");


describe("[Meta Interface] Rollback Transaction", function() { 
	it("MyCalculator's IAdd Acquisitor", function() { 
		should(calculatorAcquisitors).have.property('Calc.IAdd');
	}); 

	it("No connect to MyAdder", function() { 
		should(noAdderConnect).equal(true);
	}); 

	it("MyCalculator's ISubtract Acquisitor", function() { 
		should(calculatorAcquisitors).have.property('Calc.ISubtract');
	}); 

	it("No connect to MySubtractor", function() { 
		should(noSubtractorConnect).equal(true);
	}); 
});



// Test successful binding
try
{
	jscomRt.initTransaction();
	var iAdderIEP = myComposite.exposeInterface("Calc.IAdd");
	var iSubtractorIEP = myComposite.exposeInterface("Calc.ISubtract");
	myComposite.bind(calculator, iAdderIEP, "Calc.IAdd");
	myComposite.bind(calculator, iSubtractorIEP, "Calc.ISubtract");
	jscomRt.commit();
}
catch (error)
{
	jscomRt.rollback();
}

var calculator = jscomRt.getComponent("MyCalculator");
var calculatorAcquisitors = calculator.getAcquisitorSet();

describe("[Meta Interface] Committed Component Graph", function() { 
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


var iCalcIEP = myComposite.exposeInterface("Calc.ICalculator");
var addOutput = iCalcIEP.add(10, 50);
var subOutput = iCalcIEP.subtract(10, 50);

describe("Validate Calculation", function() { 
	it("10 + 50", function() { 
		should(addOutput).equal(60);	
	});

	it("10 - 50", function() { 
		should(subOutput).equal(-40);	
	});
});