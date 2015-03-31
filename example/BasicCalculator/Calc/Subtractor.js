Calc.Subtractor = function () 
{
	JSCOM.Component.call(this);
};

Calc.Subtractor.prototype = new JSCOM.Component();
Calc.Subtractor.prototype.constructor = Calc.Subtractor;

// Expose interface ICalculator
Calc.Subtractor.interfaces = ["Calc.ISubtract"];

Calc.Subtractor.prototype.subtract = function(a, b)
{
	return a - b;
};