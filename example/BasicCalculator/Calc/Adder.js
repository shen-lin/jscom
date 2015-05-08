JSCOM.Loader.declare({
	component: "Calc.Adder",
	extend: "JSCOM.Component"
});

// Expose interface ICalculator
Calc.Adder.interfaces = ["Calc.IAdd"];

Calc.Adder.prototype.add = function(a, b)
{
	var result = a + b;
	return result;
};