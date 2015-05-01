/**
 * 
 * @module core
 * @class Acquisitor
 * @constructor
 */

JSCOM.Acquisitor = function(componentRef, interfaceName, type)
{
	this.componentRef = componentRef;
	this.interfaceName = interfaceName;
	this.componentRef._acquisitorSet[interfaceName] = this;
	this.type = type;
	this.ref = null;
};