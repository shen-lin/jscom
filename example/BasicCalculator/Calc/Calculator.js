JSCOM.Loader.declare({
	component: "Calc.Calculator",
	extend: "Calc.ParentCalculator"
});


Calc.Calculator.acquisitors = [
	{name: "Calc.ISubtract", type: JSCOM.ACQUISITOR_SINGLE}, 
	{name: "Calc.ILog", type: JSCOM.ACQUISITOR_MULTIPLE}
];

Calc.Calculator.prototype.subtract = function(a, b, callback)
{
	var oServiceProvider = this.use("Calc.ISubtract");
	oServiceProvider.subtract(a, b, function(error, response){
		var sub = response;
		setImmediate(callback, null, sub);
	});
};

Calc.Calculator.prototype.log = function(operator, a, b, output, callback)
{
	var logMsg = JSCOM.String.format("[{0}] {1} {2} {3} = {4}", "Calculator", a, operator, b, output);
	var aServiceProviders = this.use("Calc.ILog");
	
	for (var i in aServiceProviders) {
		var oServiceProvider = aServiceProviders[i];
		oServiceProvider.log(logMsg, function(error, response){
			var msgFromLogger = response;
			setImmediate(callback, null, msgFromLogger);
		});
	}
}