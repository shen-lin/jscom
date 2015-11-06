var CalculatorTestTransactional = {};

// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('dist/jscom.js');
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
		var bHasAcquisitor = false;
		for (var i in CalculatorTestTransactional.calculatorAcquisitors) {
			var oAcquisitor = CalculatorTestTransactional.calculatorAcquisitors[i];
			if (oAcquisitor.name === "Calc.IAdd" && 
				oAcquisitor.type === JSCOM.ACQUISITOR_SINGLE) 
			{
				bHasAcquisitor = true;
				break;
			}	
		}
		should(bHasAcquisitor).equal(true);		
	}); 

	it("No connect to Adder", function() { 
		should(CalculatorTestTransactional.noAdderConnect).equal(true);
	}); 

	it("Calculator has ISubtract Acquisitor", function() {
		var bHasAcquisitor = false;
		for (var i in CalculatorTestTransactional.calculatorAcquisitors) {
			var oAcquisitor = CalculatorTestTransactional.calculatorAcquisitors[i];
			if (oAcquisitor.name === "Calc.ISubtract" && 
				oAcquisitor.type === JSCOM.ACQUISITOR_SINGLE) 
			{
				bHasAcquisitor = true;
				break;
			}	
		}
		should(bHasAcquisitor).equal(true);			
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

describe("[Meta Interface] Committed Component Graph", function() { 
	it("No error during transactional binding", function() {
		should(CalculatorTestTransactional.noCommitError).equal(undefined);
	}); 
	
	it("Calculator has IAdd Acquisitor", function() { 
 		var bHasAcquisitor = false;
		for (var i in CalculatorTestTransactional.successCalculatorAcquisitors) {
			var oAcquisitor = CalculatorTestTransactional.successCalculatorAcquisitors[i];
			if (oAcquisitor.name === "Calc.IAdd" && 
				oAcquisitor.type === JSCOM.ACQUISITOR_SINGLE) 
			{
				bHasAcquisitor = true;
				break;
			}	
		}
		should(bHasAcquisitor).equal(true);
	}); 

	it("Connects to Adder", function() {
		var obj = {
			source: "TestTransactionCalculator",
			target: "TestTransactionAdder",
			interface: "Calc.IAdd",
			type: JSCOM.ACQUISITOR_SINGLE
		};
		should(CalculatorTestTransactional.successCalculatorServiceProviders).containEql(obj);
	}); 

	it("Calculator has ISubtract Acquisitor", function() {
 		var bHasAcquisitor = false;
		for (var i in CalculatorTestTransactional.successCalculatorAcquisitors) {
			var oAcquisitor = CalculatorTestTransactional.successCalculatorAcquisitors[i];
			if (oAcquisitor.name === "Calc.ISubtract" && 
				oAcquisitor.type === JSCOM.ACQUISITOR_SINGLE) 
			{
				bHasAcquisitor = true;
				break;
			}	
		}
	}); 

	it("Connects to Subtractor", function() {
		var obj = {
			source: "TestTransactionCalculator",
			target: "TestTransactionSubtractor",
			interface: "Calc.ISubtract",
			type: JSCOM.ACQUISITOR_SINGLE
		};
		should(CalculatorTestTransactional.successCalculatorServiceProviders).containEql(obj);
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