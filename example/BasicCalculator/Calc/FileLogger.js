var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();

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
	var bExists = JSCOM.fs.existsSync(filepath); 
	if (!bExists) {
		JSCOM.fs.writeFileSync(filepath, "");
	}
	
	var fileContent = JSCOM.fs.readFileSync(filepath);
	fileContent = fileContent + record + "\n";
	JSCOM.fs.writeFile(filepath, fileContent);
	
	var returnMsg = "Log sent to file";
	JSCOM.execCallback(this, callback, null, returnMsg);
};