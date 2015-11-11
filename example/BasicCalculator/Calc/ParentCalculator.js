var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();

JSCOM.Loader.declare({
	component: "Calc.ParentCalculator",
	extend: "JSCOM.Component",
	interfaces: ["Calc.ICalculator"],
	acquisitors: [
		new JSCOM.Acquisitor("Calc.IAdd", JSCOM.ACQUISITOR_SINGLE)
	]
});


Calc.ParentCalculator.prototype.add = function(a, b, callback)
{	
	var oServiceProvider = this.use("Calc.IAdd");
	var that = this;
	
	oServiceProvider.add(a, b, function(error, response){
		var sum = response;
		JSCOM.execCallback(that, callback, null, sum);
	});
};

Calc.ParentCalculator.prototype.subtract = function(a, b, callback)
{
	JSCOM.Error.throwError(JSCOM.Error.NotImplemented);
};

Calc.ParentCalculator.prototype.log = function(operator, a, b, output, callback)
{
	JSCOM.Error.throwError(JSCOM.Error.NotImplemented);
};