JSCOM.Loader.declare({
	component: "Calc.Adder",
	extend: "JSCOM.Component"
});

// Expose interface ICalculator
Calc.Adder.interfaces = ["Calc.IAdd"];

Calc.Adder.prototype.add = function(a, b, callback)
{
	var result = a + b;
	setImmediate(callback, null, result);
};