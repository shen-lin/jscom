/**
 * 
 * @module core
 * @class Interface
 * @constructor
 */

/**
 * An interface defines a service provided by a component class. 
 * 
 * @class Interface
 * @constructor
 * @param {string} name Name of interface
 * @param {object} definition Interface definition
 * @module core
 */ 

JSCOM.Interface = function(name, definition)
{
	this.name = name;
	this.definition = definition;
};