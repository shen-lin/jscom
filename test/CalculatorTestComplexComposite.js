// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('../dist/jscom.js');
var JSCOM = jscom.getJSCOM();
var jscomRt = JSCOM.getJSCOMRuntime();

// Configure component repository to be working dir
jscomRt.addComponentRepo(JSCOM.URI_FILE, 'example/BasicCalculator');

// Create a composite for each component
var myComposite = jscomRt.createRootComposite("ComplexTestComposite");
var dispatcherComposite1 = myComposite.createComposite("MyDispatcherComposite1");
var dispatcherComposite2 = myComposite.createComposite("MyDispatcherComposite2");
var calculatorComposite = myComposite.createComposite("MyCalculatorComposite");

var rootCompositeSet = jscomRt.getRootCompositeSet();
describe("[Meta Interface] Composite Set", function() { 
	it("Only Exist ComplexTestComposite", function() { 
		should(rootCompositeSet).have.property('ComplexTestComposite');
		should(rootCompositeSet).not.have.property('MyDispatcherComposite1');
		should(rootCompositeSet).not.have.property('MyDispatcherComposite2');
		should(rootCompositeSet).not.have.property('MyCalculatorComposite');
	}); 
});


var adderComposite = calculatorComposite.createComposite("MyAdderComposite");
var subtractorComposite = calculatorComposite.createComposite("MySubtractorComposite");

var myCompositeChildrenList = jscomRt.getChildEntityList("ComplexTestComposite");
var calculatorCompositeChildrenList = jscomRt.getChildEntityList("MyCalculatorComposite");

describe("[Meta Interface] Query children of a composite", function() { 
	it("ComplexTestComposite's Child MyDispatcherComposite1", function() { 
		var obj = {
			id: 'MyDispatcherComposite1',
			type: JSCOM.COMPOSITE
		};
		should(myCompositeChildrenList).containEql(obj);
	}); 

	it("ComplexTestComposite's Child MyDispatcherComposite2", function() { 
		var obj = {
			id: 'MyDispatcherComposite2',
			type: JSCOM.COMPOSITE
		};
		should(myCompositeChildrenList).containEql(obj);
	}); 
	
	it("ComplexTestComposite's Child MyCalculatorComposite", function() { 
		var obj = {
			id: 'MyCalculatorComposite',
			type: JSCOM.COMPOSITE
		};
		should(myCompositeChildrenList).containEql(obj);
	}); 

	it("MyCalculatorComposite's Child MyAdderComposite", function() { 
		var obj = {
			id: 'MyAdderComposite',
			type: JSCOM.COMPOSITE
		};
		should(calculatorCompositeChildrenList).containEql(obj);
	}); 

	it("MyCalculatorComposite's Child MySubtractorComposite", function() { 
		var obj = {
			id: 'MySubtractorComposite',
			type: JSCOM.COMPOSITE
		};
		should(calculatorCompositeChildrenList).containEql(obj);
	}); 
});


// Create components in the nested composites
var myDispatcher1 = dispatcherComposite1.createComponent("Calc.CalculationDispatcher", "MyCalculationDispatcher1");
var myDispatcher2 = dispatcherComposite2.createComponent("Calc.CalculationDispatcher", "MyCalculationDispatcher2");
var calculatorInCalculatorTestComplex = calculatorComposite.createComponent("Calc.Calculator", "MyCalculatorInCalculatorTestComplex");
var adderInCalculatorTestComplex = adderComposite.createComponent("Calc.Adder", "MyAdderInCalculatorTestComplex");
var subtractorInCalculatorTestComplex = subtractorComposite.createComponent("Calc.Subtractor", "MySubtractorInCalculatorTestComplex");

var dispatcherComposite1ChildrenList = jscomRt.getChildEntityList("MyDispatcherComposite1");
var dispatcherComposite2ChildrenList = jscomRt.getChildEntityList("MyDispatcherComposite2");
var calculatorCompositeChildrenList = jscomRt.getChildEntityList("MyCalculatorComposite");
var adderCompositeChildrenList = jscomRt.getChildEntityList("MyAdderComposite");
var subtractorCompositeChildrenList = jscomRt.getChildEntityList("MySubtractorComposite");

describe("[Meta Interface] Component Children", function() { 
	it("MyDispatcherComposite1's Child MyCalculationDispatcher1", function() { 
		var obj = {
			id: 'MyCalculationDispatcher1',
			type: JSCOM.COMPONENT
		};
		should(dispatcherComposite1ChildrenList).containEql(obj);		
	});
	
	it("MyDispatcherComposite2's Child MyCalculationDispatcher2", function() { 
		var obj = {
			id: 'MyCalculationDispatcher2',
			type: JSCOM.COMPONENT
		};
		should(dispatcherComposite2ChildrenList).containEql(obj);		
	});
	
	it("MyCalculatorComposite's Child MyCalculatorInCalculatorTestComplex", function() { 
		var obj = {
			id: 'MyCalculatorInCalculatorTestComplex',
			type: JSCOM.COMPONENT
		};
		should(calculatorCompositeChildrenList).containEql(obj);		
	});

	it("MyAdderComposite's Child MyAdderInCalculatorTestComplex", function() { 
		var obj = {
			id: 'MyAdderInCalculatorTestComplex',
			type: JSCOM.COMPONENT
		};
		should(adderCompositeChildrenList).containEql(obj);		
	});

	it("MySubtractorComposite's Child MySubtractorInCalculatorTestComplex", function() { 
		var obj = {
			id: 'MySubtractorInCalculatorTestComplex',
			type: JSCOM.COMPONENT
		};
		should(subtractorCompositeChildrenList).containEql(obj);		
	});
});


// CalculatorComposite binding
adderComposite.exposeInterface("Calc.IAdd", "IAdd");
subtractorComposite.exposeInterface("Calc.ISubtract", "ISub");
calculatorComposite.exposeInterface("Calc.ICalculator", "ICalc");

calculatorComposite.bind("MyCalculatorInCalculatorTestComplex", "MyAdderComposite", "Calc.IAdd");
calculatorComposite.bind("MyCalculatorInCalculatorTestComplex", "MySubtractorComposite", "Calc.ISubtract");


describe("Invoking ICalculator interfaces exposed by MyCalculatorComposite", function() { 
	it("5 + 5", function(done) { 
		calculatorComposite.ICalc.add(5, 5, function(error, response){
			should(response).equal(10);
			done();
		});
	}); 
	
	it("5 - 1", function(done) { 
		calculatorComposite.ICalc.subtract(5, 1, function(error, response){
			should(response).equal(4);
			done();
		});
	}); 	
});



// Binding in root composite
dispatcherComposite1.exposeAcquisitor("Calc.ICalculator");
dispatcherComposite1.exposeInterface("Calc.IDispatch", "IDispatch");
myComposite.bind("MyDispatcherComposite1", "MyCalculatorComposite", "Calc.ICalculator");
dispatcherComposite1.IDispatch.dispatch();

dispatcherComposite2.exposeAcquisitor("Calc.ICalculator");
dispatcherComposite2.exposeInterface("Calc.IDispatch", "IDispatch");
myComposite.bind("MyDispatcherComposite2", "MyCalculatorComposite", "Calc.ICalculator");
dispatcherComposite2.IDispatch.dispatch();


// Disconnect bindings
myComposite.unbind("MyDispatcherComposite1", "MyCalculatorComposite", "Calc.ICalculator");


var invalidInvokeAfterUnbinding = function() {
	dispatcherComposite1.IDispatch.dispatch();
};

describe("Invalid Invoke on unbound acquisitor", function() { 
	it("Throw Error", function() { 
		var regexp = new RegExp(JSCOM.Error.NoBindingFound.code);
		(invalidInvokeAfterUnbinding).should.throw(regexp);
	}); 
});
