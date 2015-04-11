/**
 * 
 * @module components.rest
 * @class RestServer
 */

var express = require('express');
JSCOM.express = JSCOM.express || express();

JSCOM.Loader.declare("JSCOM.components.rest.RestServer");

JSCOM.components.rest.RestServer = function () 
{
	JSCOM.Component.call(this);
	this.restservice = JSCOM.express;
	this.port = null;
	this.init();
};

JSCOM.components.rest.RestServer.prototype = new JSCOM.Component();
JSCOM.components.rest.RestServer.prototype.constructor = JSCOM.components.rest.RestServer;


JSCOM.components.rest.RestServer.interfaces = [];

JSCOM.components.rest.RestServer.prototype.init = function()
{
	this.restservice.get('/components', function(req, res) {
		
		res.send('components');
	});
	
	this.restservice.get('/composites', function(req, res) {
		
		res.send('composites');
	});
};


JSCOM.components.rest.RestServer.prototype.start = function()
{
	this.restservice.listen(this.port);
};