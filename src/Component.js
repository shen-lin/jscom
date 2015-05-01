/**
 * Component is the primary entity in JSCOM. A component represents
 * a reusable module in a software system constructed by using JSCOM.
 * A component interacts with other components or composites through
 * acquisitors and interfaces. An interface defines the services this component
 * provides to other components / composites. An acquisitor defines the
 * the services this component requires from others.
 * A component always resides within a composite instance. A component should not
 * be created by calling the constructor. Use JSCOM.Composite.createComponent() method
 * to create a new component instance.
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
 * @example Calc.Calculator.interfaces = ["Calc.ICalculator"];
 * @property interfaces
 * @static
 ***********************/


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
 * MetaInterface: Adaptor Information
 ***********************/

 /**
  * @function getCustomMetadata
  */
JSCOM.Component.prototype.getAdaptorAdvices = function(interfaceName)
{
	var oInterfaceAdvices = {};
	var interfaceDef = this.jscomRt._interfaceDefSet[interfaceName];
	for (var fnName in interfaceDef) {
		var classFnName = JSCOM.String.format("{0}{1}{2}", this.className, JSCOM.FN_SEPARATOR, fnName);
		var sInjectionId = this.jscomRt._componentInjectionMetadata[classFnName];
		var oAdvices = this.jscomRt._injectionInfo[sInjectionId];
		oInterfaceAdvices[fnName] = oAdvices;
	}
	return oInterfaceAdvices;
};


/***********************
 * MetaInterface: Metadata
 ***********************/

/**
 * @function getCustomMetadata
 */
JSCOM.Component.prototype.getCustomMetadata = function()
{
	return this._metadataSet;
};
