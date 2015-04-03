Calc.CalcAdaptor = function() 
{
	JSCOM.Adaptor.call(this);
};

Calc.CalcAdaptor.prototype = new JSCOM.Adaptor();
Calc.CalcAdaptor.prototype.constructor = Calc.CalcAdaptor;


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
	
	for (var i in args) {
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