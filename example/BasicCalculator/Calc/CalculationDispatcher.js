JSCOM.Loader.declare({
	component: "Calc.CalculationDispatcher",
	extend: "JSCOM.Component"
});

Calc.CalculationDispatcher.acquisitors = [
	new JSCOM.Acquisitor("Calc.ICalculator", JSCOM.ACQUISITOR_SINGLE)
];

// Expose interface ICalculator
Calc.CalculationDispatcher.interfaces = ["Calc.IDispatch"];

Calc.CalculationDispatcher.prototype.dispatch = function(callback)
{
	for (var i = 0; i < 10; i++)
	{
		var a = Math.round(Math.random() * 100);
		var b = Math.round(Math.random() * 100);
		var oServiceProvider = this.use("Calc.ICalculator");
		oServiceProvider.add(a, b, function(error, response) {
			var result = response;
			var logMsg = JSCOM.String.format("Result is: {0}", result);
		});
	}
};
