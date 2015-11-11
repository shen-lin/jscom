var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();

JSCOM.Loader.declare({
	component: "Calc.Adder",
	extend: "JSCOM.Component",
	interfaces: ["Calc.IAdd"]
});


Calc.Adder.prototype.add = function(a, b, callback)
{
	var result = a + b;
	JSCOM.execCallback(this, callback, null, result);
};