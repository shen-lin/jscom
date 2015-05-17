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

/*
// CalculatorComposite binding
var iAdderIEP = adderComposite.exposeInterface("Calc.IAdd");
var iSubtractorIEP = subtractorComposite.exposeInterface("Calc.ISubtract");
calculatorComposite.bind(calculator, iAdderIEP, "Calc.IAdd");
calculatorComposite.bind(calculator, iSubtractorIEP, "Calc.ISubtract");
var iCalcIEP = calculatorComposite.exposeInterface("Calc.ICalculator");
var addOutput = iCalcIEP.add(10, 50);
var subOutput = iCalcIEP.subtract(10, 50);

describe("Calculation", function() { 
	it("10 + 50", function() { 
		should(addOutput).equal(60);	
	});

	it("10 - 50", function() { 
		should(subOutput).equal(-40);	
	});
});


// MyComposite binding
var iCalcAEP = dispatcherComposite.exposeAcquisitor("Calc.ICalculator");
myComposite.bind(iCalcAEP, iCalcIEP, "Calc.ICalculator");
var iDispatchIEP = dispatcherComposite.exposeInterface("Calc.IDispatch");
iDispatchIEP.dispatch();


// Disconnect bindings
dispatcherComposite.unbind(iCalcAEP, iCalcIEP, "Calc.ICalculator");
var iDispatchIEP = dispatcherComposite.exposeInterface("Calc.IDispatch");

var invalidInvokeAfterUnbinding = function() {
	iDispatchIEP.dispatch();
};


describe("Invalid Invoke on unbound acquisitor", function() { 
	it("Throw Error", function() { 
		(invalidInvokeAfterUnbinding).should.throw(/^Cannot call method/);
	}); 
});

*/