Calc.Calculator = function () 
{
	JSCOM.Component.call(this);

	// Requires interface of IAdd
	this.addAcquisitor = new JSCOM.Acquisitor(this, "Calc.IAdd", JSCOM.ACQUISITOR_SINGLE);
	// Requires interface of ISubtract
	this.subtractAcquisitor = new JSCOM.Acquisitor(this, "Calc.ISubtract", JSCOM.ACQUISITOR_SINGLE);
	// Requires interface of ISubtract
	this.logAcquisitor = new JSCOM.Acquisitor(this, "Calc.ILog", JSCOM.ACQUISITOR_MULTIPLE);
};

Calc.Calculator.prototype = new JSCOM.Component();
Calc.Calculator.prototype.constructor = Calc.Calculator;

// Expose interface ICalculator
Calc.Calculator.interfaces = ["Calc.ICalculator"];

Calc.Calculator.prototype.add = function(a, b)
{
	var output = this.addAcquisitor.ref.add(a, b);
	this.log("+", a, b, output);
	return output;
};

Calc.Calculator.prototype.subtract = function(a, b)
{
	var output = this.subtractAcquisitor.ref.subtract(a, b);
	this.log("-", a, b, output);
	return output;
};

Calc.Calculator.prototype.log = function(operator, a, b, output)
{
	for (var i in this.logAcquisitor.ref)
	{
		var nextRef = this.logAcquisitor.ref[i];
		var record = JSCOM.String.format("[{0}] {1} {2} {3} = {4}", "Calculator", a, operator, b, output);
		var msg = nextRef.log(record);
		JSCOM.LOGGER.info(msg);
	}
}