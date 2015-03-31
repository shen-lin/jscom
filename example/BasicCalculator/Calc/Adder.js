Calc.Adder = function() 
{
	JSCOM.Component.call(this);
};

Calc.Adder.prototype = new JSCOM.Component();
Calc.Adder.prototype.constructor = Calc.Adder;

// Expose interface ICalculator
Calc.Adder.interfaces = ["Calc.IAdd"];

Calc.Adder.prototype.add = function(a, b)
{
	var result = a + b;
	return result;
};