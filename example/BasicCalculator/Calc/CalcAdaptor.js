Calc.CalcAdaptor = function() 
{
	JSCOM.Adaptor.call(this);
};

Calc.CalcAdaptor.prototype = new JSCOM.Adaptor();
Calc.CalcAdaptor.prototype.constructor = Calc.CalcAdaptor;


Calc.CalcAdaptor.prototype.isInteger = function()
{
	var adaptorArg = arguments[0];
	var args = adaptorArg.args;
	
	JSCOM.LOGGER.debug("Validating numeric inputs");
	for (var i in args) {
		var arg = args[i];
		JSCOM.LOGGER.debug("Arg " + i + " " +arg);
		if (!this._isInteger(arg)) {
			JSCOM.LOGGER.debug("Arg " + i + " is not an integer: " + arg);
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