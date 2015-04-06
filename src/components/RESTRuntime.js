/**
 * 
 * @module preload
 * @class RESTRuntime
 */
JSCOM.preload = JSCOM.preload || {};
JSCOM.preload.rest = JSCOM.preload.rest || {};

JSCOM.preload.rest.RESTRuntime = function () 
{
	JSCOM.Component.call(this);
};

JSCOM.preload.rest.RESTRuntime.prototype = new JSCOM.Component();
JSCOM.preload.rest.RESTRuntime.prototype.constructor = JSCOM.RESTRuntime;

// Expose interface ICalculator
JSCOM.preload.rest.RESTRuntime.interfaces = [];

