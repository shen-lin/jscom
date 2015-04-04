/**
 * Component is the primary entity in JSCOM. A component represents
 * a reusable module in a software system constructed by using JSCOM.
 * A component interacts with other components or composites through
 * acquisitors and interfaces. An interface defines the services this component
 * provides to other components / composites. An acquisitor defines the
 * the services this component requires from others.
 * 
 * @module core
 * @class Component
 */

JSCOM.Component = function () {
	this.id = null;
	this.className = null;
	this.jscomRt = null;
	this._metadataSet = {};
	this._acquisitorSet = {};
};


/***********************
 * MetaInterface: Acquisitor Access API
 ***********************/

JSCOM.Component.prototype.getAcquisitorSet = function()
{
	return this._acquisitorSet;
};


/***********************
 * MetaInterface: Interfaces Access API
 ***********************/

JSCOM.Component.prototype.getInterfaceSet = function()
{
	return this.constructor.interfaces;
};

/***********************
 * MetaInterface: Metadata
 ***********************/

JSCOM.Component.prototype.getMetadata = function()
{
	return this._metadataSet;
};

