JSCOM.Loader.declare({
	component: "Calc.Adder",
	extend: "JSCOM.Component"
});

// Expose interface ICalculator
Calc.Adder.interfaces = ["Calc.IAdd"];

Calc.Adder.prototype.add = function(a, b, callback)
{
	console.log(a);
	console.log(b);
	console.log(callback);
	var result = a + b;
	setImmediate(callback, null, result);
};