var express = require('express');

rest.RestService = function () 
{
	JSCOM.Component.call(this);
	this.restservice = express();
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
	
	this.restservice.post('/component', function(req, res) {
		res.type('text/plain');
		res.send('Component');
	});
	
	this.restservice.post('/composite', function(req, res) {
		res.type('text/plain');
		res.send('Composite');
	});
	
	this.restservice.get('/domain/:port', function(req, res) {
		var myComposite = compInstance.jscomRt.getComposite("RestComposite");
		var anotherRestService = myComposite.createComponent("rest.RestService", "AnotherRestService");
		anotherRestService.startServer(req.params.port);
		res.send('Domain: ' + req.params.port);
	});
	
	
	this.restservice.get('/test/:id', function(req, res, next) {
		console.log('Request URL:', req.originalUrl);
		next();
	}, function (req, res, next) {
		console.log('Request Type:', req.method);
		next();
	}, function (req, res, next) {
		res.send('Middleware Done');
	});
	
	this.restservice.listen(port);
};

rest.RestService.prototype.startServer = function(port)
{
	this.port = port;
	this.restservice.get('/', function(req, res) {
		res.send('Replied from ' + port);
	});
	
	this.restservice.listen(port);
};
