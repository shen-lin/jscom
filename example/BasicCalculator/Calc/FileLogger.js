JSCOM.Loader.declare({
	component: "Calc.FileLogger",
	extend: "JSCOM.Component"
});

JSCOM.Loader.require('fs');

// Expose interface ICalculator
Calc.FileLogger.interfaces = ["Calc.ILog"];

Calc.FileLogger.prototype.log = function(record, callback)
{
	var filepath = "test/Calculator.log";
	var fileContent = JSCOM.fs.readFileSync(filepath);
	fileContent = fileContent + record + "\n";
	fs.writeFile(filepath, fileContent);
	
	var returnMsg = "Log sent to file";
	setImmediate(callback, null, returnMsg);
};