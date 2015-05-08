/**
 * Component is the primary entity in JSCOM. A component represents
 * a reusable module in a software system constructed by using JSCOM.
 * Component can be extended to implement a custom component classes.
 * 
 * A component interacts with other components or composites through
 * acquisitors and interfaces. An interface defines the services this component
 * provides to other components / composites. An acquisitor defines the
 * the services this component requires from others.
 * 
 * A component always resides within a composite instance. 
 * An instance of a component class can be created by calling
 * JSCOM.Composite.createComponent() method. A component instance should not
 * be created by calling the constructor method of Component or 
 * any classes that inherits Component. 
 * 
 * @module core
 * @class Component
 */

JSCOM.Component = function () 
{
	this.id = null;
	this.className = null;
	this._metadataSet = {};
};

/***********************
 * @property parent {string} Parent component class
 * @static
 ***********************/
JSCOM.Component.prototype.getParent = function()
{
	return this.constructor.parent;
};


/***********************
 * @example 
 * Calc.Calculator.acquisitors = [
 * 		{name: "Calc.IAdd", type: JSCOM.ACQUISITOR_SINGLE}, 
 * 		{name: "Calc.ISubtract", type: JSCOM.ACQUISITOR_SINGLE}
 * ];
 * @property acquisitors
 * @static
 ***********************/
JSCOM.Component.prototype.getAcquisitors = function()
{
	var aComponentAcquisitors = [];
	
	var sParentName = this.getParent();
	
	while(sParentName) {
		var aParentAcquisitors = eval(sParentName + ".acquisitors");
		if (aParentAcquisitors) {
			aComponentAcquisitors = aComponentAcquisitors.concat(aParentAcquisitors);
		}
		sParentName = eval(sParentName + ".parent");
	}
	
	if (this.constructor.acquisitors) {
		aComponentAcquisitors = aComponentAcquisitors.concat(this.constructor.acquisitors);
	}
	
	return aComponentAcquisitors;
};

JSCOM.Component.prototype.getAcquisitor = function(sInterfaceName)
{
	var aAcquisitors = this.getAcquisitors();
	for (var i in aAcquisitors) {
		var oAcquisitor = aAcquisitors[i];
		var sName = oAcquisitor.name;
		if (sName === sInterfaceName) {
			return oAcquisitor;
		}
	}
	return null;
};

/***********************
 * @example Calc.Calculator.interfaces = ["Calc.ICalculator"];
 * @property interfaces
 * @static
 ***********************/ 
JSCOM.Component.prototype.getInterfaces = function()
{
	var aComponentInterfaces = [];
	
	var sParentName = this.getParent();
	
	while(sParentName) {
		var aParentInterfaces = eval(sParentName + ".interfaces");
		if (aParentInterfaces) {
			aComponentInterfaces = aComponentInterfaces.concat(aParentInterfaces);
		}
		sParentName = eval(sParentName + ".parent");
	}
	
	if (this.constructor.interfaces) {
		aComponentInterfaces = aComponentInterfaces.concat(this.constructor.interfaces);
	}
	
	return aComponentInterfaces;
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
	var interfaceDef = JSCOM._jscomRt._interfaceDefSet[interfaceName];
	for (var fnName in interfaceDef) {
		var classFnName = JSCOM.String.format("{0}{1}{2}", this.className, JSCOM.FN_SEPARATOR, fnName);
		var sInjectionId = JSCOM._jscomRt._componentInjectionMetadata[classFnName];
		var oAdvices = JSCOM._jscomRt._injectionInfo[sInjectionId];
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
