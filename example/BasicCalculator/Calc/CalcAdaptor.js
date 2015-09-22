JSCOM.Loader.declare({
	component: "Calc.CalcAdaptor",
	extend: "JSCOM.Adaptor"
});



Calc.CalcAdaptor.prototype.returnIncrementedValue = function(context, callback, error, response)
{
	var incrementedValue;
	
	if (response > 100) {
		incrementedValue = response + 50;
	}
	
	setImmediate(callback.bind(context), error, incrementedValue);
};


Calc.CalcAdaptor.prototype.isWithinRange = function(context, callback, error, response)
{	
	JSCOM.LOGGER.info(callback);
	if (response > 100) {
		var oError = new Error("Result is greater than 100: " + response);
		setImmediate(callback.bind(context), oError, null);
	}
	else {
		setImmediate(callback.bind(context), error, response);
	}
};



Calc.CalcAdaptor.prototype.isInteger = function()
{
	var adaptorArg = arguments[0];
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

Calc.CalcAdaptor.prototype._isInteger = function(value)
{
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
};