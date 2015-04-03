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

/*******************************************************
 * Creating component architecture
 *******************************************************/



/*******************************************************
 * Test creating adaptor API
 *******************************************************/

var calcAdaptor = jscomRt.createAdaptor("Calc.CalcAdaptor", "MyAdaptor");

describe("Create Adaptor", function() { 
	it("Access CalcAdaptor Metadata", function() { 
		should(calcAdaptor.id).equal("MyAdaptor");
	}); 
});


var invalidCreateAdaptorWithDuplicateID = function() {
	jscomRt.createAdaptor("Calc.CalcAdaptor", "MyAdaptor");
};

describe("Invalid adaptor creation with duplicate ID", function() { 
	it("Throw Error", function() { 
		(invalidCreateAdaptorWithDuplicateID).should.throw(/Adaptor instance already exists/);
	}); 
});


/*******************************************************
 * Test applying adaptor functions to components
 *******************************************************/
var iCalcIEP;
var sOriginalAddFn;
var sCurrentAddFn;

describe("Test Adaptors", function() { 
	
	before(function(){
		// Creating a composite of example calculator components...
		var calcComposite = jscomRt.createComposite("MyComposite");

		// Loading example component instances...
		var adder = calcComposite.createComponent("Calc.Adder", "MyAdder");
		var subtractor = calcComposite.createComponent("Calc.Subtractor", "MySubtractor");
		var calculator = calcComposite.createComponent("Calc.Calculator", "MyCalculator");

		// Binding example components to form the example system...
		calcComposite.bind(calculator, adder, "Calc.IAdd");
		calcComposite.bind(calculator, subtractor, "Calc.ISubtract");
		
		// Exposing example system interface...
		iCalcIEP = calcComposite.exposeInterface("Calc.ICalculator");
		
		sCurrentAddFn = iCalcIEP.add.toString();
		var bakAddFnName = JSCOM.String.format(JSCOM.FN_BAK, "add");
		sOriginalAddFn = Calc.Calculator.prototype[bakAddFnName].toString();
	});

	
	it("Initial add function without adaptor interception", function() { 
		should(sCurrentAddFn).equal(sOriginalAddFn);
	}); 
	
	describe("Initialize Adaptors", function() { 
		
		before(function () { 
			var scope = {
				include: ["Calc.C*@add"],
				exclude: ["**@sub*"],
			};

			var oAdvices = [
				{id: "MyAdaptor", fn: "isInteger", type: JSCOM.Adaptor.Type.BEFORE},
				{id: "MyAdaptor", fn: "isWithinRange", type: JSCOM.Adaptor.Type.AFTER},
			];
			jscomRt.applyAdaptor("MyInjection", oAdvices, scope);
			
			sCurrentAddFn = iCalcIEP.add.toString();
		});

		
		it("Test add function after adaptor interceptions", function() { 
			var index = sCurrentAddFn.indexOf("thisAdaptorAfter");
			should(index).be.above(0);
		}); 
		
		it("No error with adding two integers", function() { 
			var addTwoInt = iCalcIEP.add(5,3);
			should(addTwoInt).equal(8);
		}); 

		it("Non-integer input caught by adaptor function: CalcAdaptor.isInteger", function() {
			var caughtInvalidInputErrorInInterceptedAddFn = function() {
				var output = iCalcIEP.add(5,'abc');
			};
			(caughtInvalidInputErrorInInterceptedAddFn).should.throw(/is not an integer/);
		}); 
		
		it("Output > 100 caught by adaptor function: CalcAdaptor.isWithinRange", function() { 
			var caughtOutOfRangeErrorInInterceptedAddFn = function() {
				var output = iCalcIEP.add(5, 100);
			};
			(caughtOutOfRangeErrorInInterceptedAddFn).should.throw(/Result is greater than 100:/);
		}); 
	});
	
	
	describe("Modified Adaptor", function() { 
		var sUpdatedAddFn;
	
		before(function () { 
			var scope = {
				include: ["Calc.C*@add"],
				exclude: ["**@sub*"],
			};
			var oAdvices = [
				{id: "MyAdaptor", fn: "isInteger", type: JSCOM.Adaptor.Type.BEFORE},
				{id: "MyAdaptor", fn: "isWithinRange", type: JSCOM.Adaptor.Type.AFTER},
				{id: "MyAdaptor", fn: "returnDefaultValue", type: JSCOM.Adaptor.Type.AFTER_THROW},
			];
			jscomRt.applyAdaptor("MyInjection2", oAdvices, scope);
			
			sCurrentAddFn = iCalcIEP.add.toString();
			sUpdatedAddFn = JSCOM.Adaptor.prototype.applyAdaptorAfterThrow.toString();
		});
		
		it("Test add function after modifying adaptors", function() { 
			var index = sCurrentAddFn.indexOf("thisAdaptorAfterThrow");
			should(index).be.above(0);
		}); 
		
		it("No error with adding two integers: 5+3=8", function() { 
			var addTwoInt = iCalcIEP.add(5,3);
			should(addTwoInt).equal(8);
		}); 
		
		it("No error with adding two integers: 5+3=8", function() { 
			var addTwoInt = iCalcIEP.add(5,3);
			should(addTwoInt).equal(8);
		}); 
		
		it("Invalid input handled: Return default value 50 for 5+'abc'", function() { 
			var addTwoInt = iCalcIEP.add(5,'abc');
			should(addTwoInt).equal(50);
		}); 
		
		it("Out of range output handled: Return default value 50 for 5+100", function() { 
			var addTwoInt = iCalcIEP.add(5, 100);
			should(addTwoInt).equal(50);
		}); 

	});
});






 