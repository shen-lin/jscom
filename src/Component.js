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

