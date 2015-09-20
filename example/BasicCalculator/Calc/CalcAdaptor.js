JSCOM.Loader.declare({
	component: "Calc.CalcAdaptor",
	extend: "JSCOM.Adaptor"
});



Calc.CalcAdaptor.prototype.returnDefaultValue = function()
{
	return 50;
};


Calc.CalcAdaptor.prototype.isWithinRange = function()
{
	var adaptorArg = arguments[0];
	var args = adaptorArg.args;
	var returnVal = adaptorArg.returnVal;
	if (returnVal > 100) {
		throw new Error("Result is greater than 100: " + returnVal);
	}
	else {
		return returnVal;
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
			error = new Error("Arg " + i + " is not an integer: " + arg);
			break;
		}
	}
	
	if (error) {
		setImmediate(callback, error, null);
	}
};

Calc.CalcAdaptor.prototype._isInteger = function(value)
{
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
};