JSCOM.Loader.declare({
	component: "Calc.ConsoleLogger",
	extend: "JSCOM.Component"
});

// Expose interface ICalculator
Calc.ConsoleLogger.interfaces = ["Calc.ILog"];

Calc.ConsoleLogger.prototype.log = function(record, callback)
{
	// JSCOM.LOGGER.info(record);
	var returnMsg = "Log sent to console";
	JSCOM.execCallback(this, callback, null, returnMsg);
};