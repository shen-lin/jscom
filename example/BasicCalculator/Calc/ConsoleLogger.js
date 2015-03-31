Calc.ConsoleLogger = function() 
{
	JSCOM.Component.call(this);
};

Calc.ConsoleLogger.prototype = new JSCOM.Component();
Calc.ConsoleLogger.prototype.constructor = Calc.ConsoleLogger;

// Expose interface ICalculator
Calc.ConsoleLogger.interfaces = ["Calc.ILog"];

Calc.ConsoleLogger.prototype.log = function(record)
{
	JSCOM.LOGGER.info(record);
	return "Log sent to console";
};