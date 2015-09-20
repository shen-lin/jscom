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


/*******************************************************
 * Test creating adaptor API
 *******************************************************/

var calcAdaptor = jscomRt.createAdaptor("Calc.CalcAdaptor", "MyAdaptor");
var emptyAdaptor = jscomRt.createAdaptor("Calc.EmptyAdaptor", "MyEmptyAdaptor");

describe("Create Adaptor", function() { 
	it("Access CalcAdaptor Metadata", function() { 
		should(calcAdaptor.id).equal("MyAdaptor");
	});
	it("Access EmptyAdaptor Metadata", function() { 
		should(emptyAdaptor.id).equal("MyEmptyAdaptor");
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
var sOriginalAddFn;
var sCurrentAddFn;
var oEmptyAdaptorError;
var calcComposite;

describe("Test Adaptors", function() { 
	before(function(){
		// Creating a composite of example calculator components...
		calcComposite = jscomRt.createRootComposite("TestAdaptorComposite");

		// Loading example component instances...
		var adder = calcComposite.createComponent("Calc.Adder", "TestAdaptorAdder");
		var subtractor = calcComposite.createComponent("Calc.Subtractor", "TestAdaptorSubtractor");
		var calculator = calcComposite.createComponent("Calc.Calculator", "TestAdaptorCalculator");

		// Binding example components to form the example system...
		calcComposite.bind("TestAdaptorCalculator", "TestAdaptorAdder", "Calc.IAdd");
		calcComposite.bind("TestAdaptorCalculator", "TestAdaptorSubtractor", "Calc.ISubtract");
		
		// Exposing example system interface...
		var bSucceed = calcComposite.exposeInterface("Calc.ICalculator", "ICalc");
		sCurrentAddFn = Calc.Calculator.prototype.add.toString();
		var bakAddFnName = JSCOM.String.format(JSCOM.FN_BAK, "add");
		sOriginalAddFn = Calc.Calculator.prototype[bakAddFnName].toString();
	});

	
	it("Initial add function without adaptor interception", function() {
		should(sCurrentAddFn).equal(sOriginalAddFn);
	}); 
	
	
	describe("Apply empty adaptor", function() { 
		before(function () { 
			var scope = {
				include: ["Calc.C*@add"],
				exclude: ["**@sub*"],
			};

			var oAdvices = [
				{id: "MyEmptyAdaptor", fn: "isInteger", type: JSCOM.Adaptor.Type.BEFORE},
				{id: "MyEmptyAdaptor", fn: "isWithinRange", type: JSCOM.Adaptor.Type.AFTER},
			];
			
			try {
				jscomRt.applyAdaptor("MyBadInjection", oAdvices, scope);
			} catch(error) {
				oEmptyAdaptorError = error;
			}
		});

		
		it("Catch exception when adaptor function is not found", function() { 
			var code = JSCOM.Error.IncompleteAdaptor.Code;
			var sRegExpr = new RegExp("/" + code + "/");
			should(code).match(sRegExpr);
		});
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
			sCurrentAddFn = Calc.Calculator.prototype.add.toString();
		});

		
		it("Test add function after adaptor interceptions", function() { 
			var index = sCurrentAddFn.indexOf("thisAdaptorAfter");
			should(index).be.above(0);
		});
		
		it("No error with adding two integers", function() {
			calcComposite.ICalc.add(5, 3, function(error, response){
				should(response).equal(8);
				done();
			});
		}); 

		it("Non-integer input caught by adaptor function: CalcAdaptor.isInteger", function() {
			calcComposite.ICalc.add(5, 'abc', function(error, response){
				should(response).match(/is not an integer/);
				done();
			});
		}); 
		
		it("Output > 100 caught by adaptor function: CalcAdaptor.isWithinRange", function() { 
			var caughtOutOfRangeErrorInInterceptedAddFn = function() {
				var output = iCalcIEP.add(5, 100);
			};
			(caughtOutOfRangeErrorInInterceptedAddFn).should.throw(/Result is greater than 100:/);
		}); 
	});
	
	/*
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
	*/
	
	
	/*******************************************************
	 * Test applying adaptor functions to components
	 *******************************************************/
	/*
	var calculatorCompInstance;
	var oInterfaceAdaptorAdvices;

	describe("Test component's adaptor metadata interface", function() { 

		before(function () { 
			// Access JSCOM runtime metadata API to retrieve component.
			calculatorCompInstance = jscomRt.getComponent("MyCalculator");
			oInterfaceAdaptorAdvices = calculatorCompInstance.getAdaptorAdvices("Calc.ICalculator");
		});
		
		it("Has advices on the add() method", function() {
			var oAdvice = oInterfaceAdaptorAdvices["add"];
			JSCOM.LOGGER.debug(oAdvice);
			should(oAdvice.length).equal(3);
			should(oAdvice[0].fn).equal("isInteger");
			should(oAdvice[1].fn).equal("isWithinRange");
			should(oAdvice[2].fn).equal("returnDefaultValue");
		}); 
		
		it("Has no advices on the subtract() method", function() { 
			var oAdvice = oInterfaceAdaptorAdvices["subtract"];
			should(oAdvice).equal(undefined);
		}); 
	});	
	*/
});


