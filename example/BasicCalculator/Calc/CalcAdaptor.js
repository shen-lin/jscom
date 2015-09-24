JSCOM.Loader.declare({
	component: "Calc.CalcAdaptor",
	extend: "JSCOM.Adaptor"
});



Calc.CalcAdaptor.prototype.returnIncrementedValue = function(context, callback, error, response)
{
	if (error) {
		JSCOM.execCallback(context, callback, error, 50);
	}
	else {
		var incrementedValue = response;
		if (response > 50) {
			incrementedValue = response + 1;
		}
		JSCOM.execCallback(context, callback, error, incrementedValue);	
	}
};


Calc.CalcAdaptor.prototype.isWithinRange = function(context, callback, error, response)
{	
	if (response > 100) {
		var oError = new Error("Result is greater than 100: " + response);
		JSCOM.execCallback(context, callback, oError, null);
	}
	else {
		JSCOM.execCallback(context, callback, error, response);
	}
};



Calc.CalcAdaptor.prototype.isInteger = function(adaptorArg)
{
	var args = adaptorArg.args;
	
	var callback = args[args.length - 1];
	var error;
	
	for (var i = 0; i < args.length - 1; i++) {
		var arg = args[i];
		if (!this._isInteger(arg)) {
			throw new Error("Arg " + i + " is not an integer: " + arg);
		}
	}
};


Calc.CalcAdaptor.prototype.newAdd = function(adaptorArg)
{
	var componentContext = adaptorArg.context;
	var args = adaptorArg.args; // original arguments
	var a = args[0];
	var b = args[1] - 1;
	var callback = args[2];
	
	var oServiceProvider = componentContext.use("Calc.IAdd");
	oServiceProvider.add(a, b, function(error, response)
	{
		JSCOM.execCallback(componentContext, callback, null, response);
	});
};

Calc.CalcAdaptor.prototype._isInteger = function(value)
{
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
};