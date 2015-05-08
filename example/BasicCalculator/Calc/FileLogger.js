JSCOM.Loader.declare({
	component: "Calc.FileLogger",
	extend: "JSCOM.Component"
});

JSCOM.Loader.require('fs');

// Expose interface ICalculator
Calc.FileLogger.interfaces = ["Calc.ILog"];

Calc.FileLogger.prototype.log = function(record)
{
	var filepath = "test/Calculator.log";
	var fileContent = JSCOM.fs.readFileSync(filepath);
	fileContent = fileContent + record + "\n";
	fs.writeFile(filepath, fileContent);
	return "Log written to file";
};