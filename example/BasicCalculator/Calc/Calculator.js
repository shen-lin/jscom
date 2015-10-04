JSCOM.Loader.declare({
	component: "Calc.Calculator",
	extend: "Calc.ParentCalculator"
});


Calc.Calculator.acquisitors = [
	new JSCOM.Acquisitor("Calc.ISubtract", JSCOM.ACQUISITOR_SINGLE), 
	new JSCOM.Acquisitor("Calc.ILog", JSCOM.ACQUISITOR_MULTIPLE)
];

Calc.Calculator.prototype.subtract = function(a, b, callback)
{
	var oServiceProvider = this.use("Calc.ISubtract");
	var that = this;
	oServiceProvider.subtract(a, b, function(error, response){
		var sub = response;
		JSCOM.execCallback(that, callback, null, sub);
	});
};

Calc.Calculator.prototype.log = function(operator, a, b, output, callback)
{
	var logMsg = JSCOM.String.format("[{0}] {1} {2} {3} = {4}", "Calculator", a, operator, b, output);
	var aServiceProviders = this.use("Calc.ILog");
	var that = this;
	
	for (var i in aServiceProviders) {
		var oServiceProvider = aServiceProviders[i];
		oServiceProvider.log(logMsg, function(error, response){
			var msgFromLogger = response;
			JSCOM.execCallback(that, callback, null, msgFromLogger);
		});
	}
}