JSCOM.Loader.declare({
	component: "Calc.ConsoleLogger",
	extend: "JSCOM.Component"
});

// Expose interface ICalculator
Calc.ConsoleLogger.interfaces = ["Calc.ILog"];

Calc.ConsoleLogger.prototype.log = function(record)
{
	JSCOM.LOGGER.info(record);
	return "Log sent to console";
};