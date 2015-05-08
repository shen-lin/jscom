JSCOM.Loader.declare({
	component: "Calc.CalculationDispatcher",
	extend: "JSCOM.Component"
});

Calc.CalculationDispatcher.acquisitors = [
	{name: "Calc.ICalculator", type: JSCOM.ACQUISITOR_SINGLE}
];

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
