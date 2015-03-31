Calc.CalculationDispatcher = function () 
{
	JSCOM.Component.call(this);
	// Requires interface of ICalculate
	this.calcAcquisitor = new JSCOM.Acquisitor(this, "Calc.ICalculator", JSCOM.ACQUISITOR_SINGLE);
};

Calc.CalculationDispatcher.prototype = new JSCOM.Component();
Calc.CalculationDispatcher.prototype.constructor = Calc.CalculationDispatcher;

// Expose interface ICalculator
Calc.CalculationDispatcher.interfaces = ["Calc.IDispatch"];

Calc.CalculationDispatcher.prototype.dispatch = function()
{
	for (var i = 0; i < 10; i++)
	{
		var a = Math.round(Math.random() * 100);
		var b = Math.round(Math.random() * 100);
		var result = this.calcAcquisitor.ref.add(a, b);
		var logMsg = JSCOM.String.format("{0}+{1}={2}", a, b, result);
		JSCOM.LOGGER.info(logMsg);
	}
};
