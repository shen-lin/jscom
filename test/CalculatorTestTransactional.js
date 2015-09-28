var CalculatorTestTransactional = {};

// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/jscom.js');
var JSCOM = jscom.getJSCOM();
var jscomRt = JSCOM.getJSCOMRuntime();

// Configure component repository to be working dir
jscomRt.addComponentRepo(JSCOM.URI_FILE, 'example/BasicCalculator');

// Create a composite for each component
CalculatorTestTransactional.myComposite = jscomRt.createRootComposite("TestTransactionComposite");

// Create components in the nested composites
CalculatorTestTransactional.calculator = CalculatorTestTransactional.myComposite.createComponent("Calc.Calculator", "TestTransactionCalculator");
CalculatorTestTransactional.adder = CalculatorTestTransactional.myComposite.createComponent("Calc.Adder", "TestTransactionAdder");
CalculatorTestTransactional.subtractor = CalculatorTestTransactional.myComposite.createComponent("Calc.Subtractor", "TestTransactionSubtractor");


// Test unsuccessful binding
CalculatorTestTransactional.commitError; 
try
{
	jscomRt.initTransaction();
	CalculatorTestTransactional.myComposite.exposeInterface("Calc.IAdd", "IAdd");
	CalculatorTestTransactional.myComposite.exposeInterface("Calc.ISubtract", "ISub");
	CalculatorTestTransactional.myComposite.bind("TestTransactionCalculator", "TestTransactionAdder", "Calc.IAdd");
	CalculatorTestTransactional.myComposite.bind("TestTransactionCalculator", "TestTransactionSubtractor", "Calc.IBad");
	jscomRt.commit();
}
catch (error)
{
	CalculatorTestTransactional.commitError = error;
	jscomRt.rollback();
}

CalculatorTestTransactional.calculator = jscomRt.getComponent("TestTransactionCalculator");
CalculatorTestTransactional.calculatorAcquisitors = CalculatorTestTransactional.calculator.getAcquisitors();
CalculatorTestTransactional.calculatorServiceProviders = CalculatorTestTransactional.calculator.getServiceProviders();
CalculatorTestTransactional.noAdderConnect = CalculatorTestTransactional.calculatorServiceProviders.length === 0;
CalculatorTestTransactional.noSubtractorConnect = CalculatorTestTransactional.calculatorServiceProviders.length === 0;
CalculatorTestTransactional.compositeChildren = jscomRt.getChildEntityList("TestTransactionComposite");


describe("[Meta Interface] Rollback Transaction", function() { 
	it("Expected binding error reported", function() {
		should(CalculatorTestTransactional.commitError.toString()).match(/BindingFailureAcquisitor/);
	}); 	

	it("Calculator has IAdd Acquisitor", function() { 
		var obj = {
			name: "Calc.IAdd",
			type: JSCOM.ACQUISITOR_SINGLE,
		};
		should(CalculatorTestTransactional.calculatorAcquisitors).containEql(obj);
	}); 

	it("No connect to Adder", function() { 
		should(CalculatorTestTransactional.noAdderConnect).equal(true);
	}); 

	it("Calculator has ISubtract Acquisitor", function() { 
		var obj = {
			name: "Calc.ISubtract",
			type: JSCOM.ACQUISITOR_SINGLE,
		};
		should(CalculatorTestTransactional.calculatorAcquisitors).containEql(obj);
	}); 

	it("No connect to Subtractor", function() { 
		should(CalculatorTestTransactional.noSubtractorConnect).equal(true);
	}); 
});



// Test successful binding
CalculatorTestTransactional.noCommitError;
try
{
	jscomRt.initTransaction();
	CalculatorTestTransactional.myComposite.exposeInterface("Calc.ICalculator");
	CalculatorTestTransactional.myComposite.bind("TestTransactionCalculator", "TestTransactionAdder", "Calc.IAdd");
	CalculatorTestTransactional.myComposite.bind("TestTransactionCalculator", "TestTransactionSubtractor", "Calc.ISubtract");
	jscomRt.commit();
}
catch (error)
{
	CalculatorTestTransactional.noCommitError = error;
	jscomRt.rollback();
}

CalculatorTestTransactional.successCalculator = jscomRt.getComponent("TestTransactionCalculator");
CalculatorTestTransactional.successCalculatorAcquisitors = CalculatorTestTransactional.successCalculator.getAcquisitors();
CalculatorTestTransactional.successCalculatorServiceProviders = CalculatorTestTransactional.successCalculator.getServiceProviders();
CalculatorTestTransactional.successAdderConnect = CalculatorTestTransactional.successCalculatorServiceProviders.length === 0;
CalculatorTestTransactional.successSubtractorConnect = CalculatorTestTransactional.successCalculatorServiceProviders.length === 0;

describe("[Meta Interface] Committed Component Graph", function() { 
	it("No error during transactional binding", function() {
		should(CalculatorTestTransactional.noCommitError).equal(undefined);
	}); 
	
	it("Calculator has IAdd Acquisitor", function() { 
		var obj = {
			name: "Calc.IAdd",
			type: JSCOM.ACQUISITOR_SINGLE,
		};
		should(CalculatorTestTransactional.successCalculatorAcquisitors).containEql(obj);
	}); 

	it("Connects to Adder", function() { 
		should(CalculatorTestTransactional.successAdderConnect).equal(true);
	}); 

	it("Calculator has ISubtract Acquisitor", function() { 
		var obj = {
			name: "Calc.ISubtract",
			type: JSCOM.ACQUISITOR_SINGLE,
		};
		should(CalculatorTestTransactional.successCalculatorAcquisitors).containEql(obj);
	}); 

	it("Connects to Subtractor", function() { 
		should(CalculatorTestTransactional.successSubtractorConnect).equal(true);
	}); 
});


describe("Validate Calculation After Transactional Binding", function(done) { 
	it("10 + 50", function() { 
		CalculatorTestTransactional.myComposite.IAdd.add(10, 50, function(error, response){
			should(response).equal(60);
			done();
		});
	});

	it("10 - 50", function() { 
		CalculatorTestTransactional.myComposite.ISub.subtract(10, 50, function(error, response){
			should(response).equal(-40);
			done();
		});
	});
});