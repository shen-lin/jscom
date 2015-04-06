var express = require('express');
var restservice = express();

rest.RestService = function () 
{
	JSCOM.Component.call(this);
	this.port;
};

rest.RestService.prototype = new JSCOM.Component();
rest.RestService.prototype.constructor = rest.RestService;

// Expose interface ICalculator
rest.RestService.interfaces = [];

rest.RestService.prototype.start = function(port)
{
	this.port = port;
	var compInstance = this;
	restservice.get('/', function(req, res) {
		res.type('text/plain');
		compInstance.transform();
		res.send('Server ' + compInstance.port);
	});
	
	restservice.listen(port);
};


rest.RestService.prototype.transform = function() 
{
	JSCOM.LOGGER.debug(this.jscomRt);
	var myComposite = this.jscomRt.createComposite("MyComposite");
	JSCOM.LOGGER.debug(this.jscomRt);
	
	restservice.get('/hello', function(req, res) {
		res.send('Hello');
	});
	
	var anotherRestService = myComposite.createComponent("rest.RestService", "AnotherRestService");
	
	anotherRestService.start(3001);
};