var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();

JSCOM.Loader.declare({
	component: "Calc.Subtractor",
	extend: "JSCOM.Component",
	interfaces: ["Calc.ISubtract"]
});


Calc.Subtractor.prototype.subtract = function(a, b, callback)
{
	var result = a - b;
	JSCOM.execCallback(this, callback, null, result);
};