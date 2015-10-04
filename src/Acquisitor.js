/**
 * An acquisitor defines services required by a component class. 
 * The acquisitor of a component indicates that the component class
 * require certain functionality to be provided by another 
 * component class' interface. 
 * 
 * 
 * @class Acquisitor
 * @constructor
 * @param {string} name Name of interface required by the acquisitor
 * @param {string} type Acquisitor type
 * @module core
 */
JSCOM.Acquisitor = function(name, type)
{
	this.name = name;
	this.type = type;
};