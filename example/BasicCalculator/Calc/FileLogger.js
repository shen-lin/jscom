Calc.FileLogger = function() 
{
	JSCOM.Component.call(this);
};

Calc.FileLogger.prototype = new JSCOM.Component();
Calc.FileLogger.prototype.constructor = Calc.FileLogger;

// Expose interface ICalculator
Calc.FileLogger.interfaces = ["Calc.ILog"];

var fs = require('fs');

Calc.FileLogger.prototype.log = function(record)
{
	var filepath = "test/Calculator.log";
	var fileContent = fs.readFileSync(filepath);
	fileContent = fileContent + record + "\n";
	fs.writeFile(filepath, fileContent);
	return "Log written to file";
};