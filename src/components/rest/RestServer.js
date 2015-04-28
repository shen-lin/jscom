/**
 * 
 * @module components.rest
 * @class RestServer
 */
JSCOM.Loader.declare("JSCOM.components.rest.RestServer");

JSCOM.require('express');
JSCOM.require('http');


JSCOM.components.rest.RestServer = function () 
{
	JSCOM.Component.call(this);
	this.restapp = JSCOM.express();
	this.server = JSCOM.http.createServer(this.restapp);
	this.port = null;
	this.init();
};

JSCOM.components.rest.RestServer.prototype = new JSCOM.Component();
JSCOM.components.rest.RestServer.prototype.constructor = JSCOM.components.rest.RestServer;


JSCOM.components.rest.RestServer.interfaces = [];

JSCOM.components.rest.RestServer.prototype.init = function()
{
	var _this = this;
	
	this.restapp.get('/components', function(req, res) {
		res.send('components');
	});
	
	this.restapp.get('/composites', function(req, res) {
		res.send('composites');
	});
	
	this.restapp.get('/close', function(req, res) {
		_this.stop();
		res.send('Closing Connection');
	});
};


JSCOM.components.rest.RestServer.prototype.start = function()
{
	this.server.listen(this.port);
};

JSCOM.components.rest.RestServer.prototype.stop = function()
{
	this.server.close(function(){
		console.log("Close");
	});
};