JSCOM.Loader.declare({
	component: "Calc.ParentCalculator",
	extend: "JSCOM.Component"
});

Calc.ParentCalculator.interfaces = ["Calc.ICalculator"];
Calc.ParentCalculator.acquisitors = [
	{name: "Calc.IAdd", type: JSCOM.ACQUISITOR_SINGLE}
];

Calc.ParentCalculator.prototype.add = function(a, b, callback)
{	
	var oServiceProvider = this.use("Calc.IAdd");
	var that = this;
	
	oServiceProvider.add(a, b, function(error, response){
		var sum = response;
		that.execCallback(callback, null, sum);
	});
};

Calc.ParentCalculator.prototype.subtract = function(a, b, callback)
{
	JSCOM.Error.throwError(JSCOM.Error.NotImplemented);
};

Calc.ParentCalculator.prototype.log = function(operator, a, b, output, callback)
{
	JSCOM.Error.throwError(JSCOM.Error.NotImplemented);
};