JSCOM.Loader.declare({
	component: "Calc.Subtractor",
	extend: "JSCOM.Component"
});

// Expose interface ICalculator
Calc.Subtractor.interfaces = ["Calc.ISubtract"];

Calc.Subtractor.prototype.subtract = function(a, b, callback)
{
	var result = a - b;
	setImmediate(callback, null, result);
};