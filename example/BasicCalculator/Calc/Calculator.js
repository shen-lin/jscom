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
	this.acquisite("Calc.ISubtract").subtract(a, b, function(error, response){
		var sub = response;
		setImmediate(callback, null, sub);
	});
};

Calc.Calculator.prototype.log = function(operator, a, b, output, callback)
{
	var logMsg = JSCOM.String.format("[{0}] {1} {2} {3} = {4}", "Calculator", a, operator, b, output);
	this.acquisite("Calc.ILog").log(logMsg);
}