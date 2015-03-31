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
var dispatcherComposite = myComposite.createComposite("MyDispatcherComposite");
var calculatorComposite = myComposite.createComposite("MyCalculatorComposite");

var compositeSet = jscomRt.getCompositeSet();
describe("[Meta Interface] Composite Set", function() { 
	it("Only Exist MyComposite", function() { 
		should(compositeSet).have.property('MyComposite');
		should(compositeSet).not.have.property('MyDispatcherComposite');
		should(compositeSet).not.have.property('MyCalculatorComposite');
	}); 
});

var adderComposite = calculatorComposite.createComposite("MyAdderComposite");
var subtractorComposite = calculatorComposite.createComposite("MySubtractorComposite");

var myCompositeChildrenList = jscomRt.getChildrenList("MyComposite");
var calculatorCompositeChildrenList = jscomRt.getChildrenList("MyCalculatorComposite");
describe("[Meta Interface] Composite Children", function() { 
	it("MyComposite's Child MyDispatcherComposite", function() { 
		var obj = {
			id: 'MyDispatcherComposite',
			type: JSCOM.COMPOSITE
		};
		should(myCompositeChildrenList).containEql(obj);
	}); 

	it("MyComposite's Child MyCalculatorComposite", function() { 
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
var myDispatcher = dispatcherComposite.createComponent("Calc.CalculationDispatcher", "MyCalculationDispatcher");
var calculator = calculatorComposite.createComponent("Calc.Calculator", "MyCalculator");
var adder = adderComposite.createComponent("Calc.Adder", "MyAdder");
var subtractor = subtractorComposite.createComponent("Calc.Subtractor", "MySubtractor");

var dispatcherCompositeChildrenList = jscomRt.getChildrenList("MyDispatcherComposite");
var calculatorCompositeChildrenList = jscomRt.getChildrenList("MyCalculatorComposite");
var adderCompositeChildrenList = jscomRt.getChildrenList("MyAdderComposite");
var subtractorCompositeChildrenList = jscomRt.getChildrenList("MySubtractorComposite");

describe("[Meta Interface] Component Children", function() { 
	it("MyDispatcherComposite's Child MyCalculationDispatcher", function() { 
		var obj = {
			id: 'MyCalculationDispatcher',
			type: JSCOM.COMPONENT
		};
		should(dispatcherCompositeChildrenList).containEql(obj);		
	});

	it("MyCalculatorComposite's Child MyCalculator", function() { 
		var obj = {
			id: 'MyCalculator',
			type: JSCOM.COMPONENT
		};
		should(calculatorCompositeChildrenList).containEql(obj);		
	});

	it("MyAdderComposite's Child MyAdder", function() { 
		var obj = {
			id: 'MyAdder',
			type: JSCOM.COMPONENT
		};
		should(adderCompositeChildrenList).containEql(obj);		
	});

	it("MySubtractorComposite's Child MySubtractor", function() { 
		var obj = {
			id: 'MySubtractor',
			type: JSCOM.COMPONENT
		};
		should(subtractorCompositeChildrenList).containEql(obj);		
	});
});


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