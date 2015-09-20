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
	this.compositeId = null;
	this._metadataSet = {};
};

/***********************
 * @property parent {string} Parent component class
 * @static
 * @see Property value initialized in JSCOM.Loader
 ***********************/
 
  
/***********************
 * Get the parent component class extends this component class
 * @method getParent
 * @return {string} Parent component class name
 ***********************/ 
JSCOM.Component.prototype.getParent = function()
{
	return this.constructor.parent;
};

/***********************
 * Get the id of the composite that contains this component instance
 * @method getCompositeId
 * @param {string} The id of the composite that contains this component instance
 ***********************/
JSCOM.Component.prototype.getCompositeId = function()
{
	return this.compositeId;
};

/**
 * 
 * @method use
 * @param {string} sInterfaceName Interface type of the acquisitor
 * @return {JSCOM}
 */
JSCOM.Component.prototype.use = function(sInterfaceName)
{
	// Get the entity bound to this component
	var aServiceProviders = this.getServiceProviders();
	var aFilterBindings = JSCOM._jscomRt._getBoundEntities(aServiceProviders, "interface", sInterfaceName);
	
	// If not found, try to get the entity bound to the composite that holds this component
	if (!aFilterBindings || aFilterBindings.length === 0) {
		 aServiceProviders = JSCOM._jscomRt._getBoundEntities(JSCOM._jscomRt._committedBindings, "source", this.compositeId);
		 aFilterBindings = JSCOM._jscomRt._getBoundEntities(aServiceProviders, "interface", sInterfaceName);
	}
	
	
	// Get service providers
	var aServiceProviders = [];
	for (var i in aFilterBindings) {
		var oBinding = aFilterBindings[i];
		var sServiceProviderId = oBinding.target;
		var oEntity = JSCOM._jscomRt.getEntityById(sServiceProviderId);
		
		if (oEntity instanceof JSCOM.Component) {
			aServiceProviders.push(oEntity);
		}
		else if (oEntity instanceof JSCOM.Composite) {
			var oInterfaceMap = oEntity.getInterfaces();
			var matchingShortName;
			for (var sShortName in oInterfaceMap) {
				var nextInterfaceName = oInterfaceMap[sShortName];
				if (nextInterfaceName === sInterfaceName) {
					matchingShortName = sShortName;
					break;
				}
			}
			
			if (!matchingShortName) {
				JSCOM.Error.throwError(JSCOM.Error.NoShortNameFound, sInterfaceName, oEntity.id);
			}
			
			aServiceProviders.push(oEntity[matchingShortName]);
		}
	}
	
	if (aServiceProviders.length === 1) {
		return aServiceProviders[0];
	} else if (aServiceProviders.length > 1) {
		return aServiceProviders;
	} else {
		// Throw exception if no binding found
		JSCOM.Error.throwError(JSCOM.Error.NoBindingFound, sInterfaceName, this.id);
	}
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
 
 
/***********************
 * Gets a list of acquisitors required by this component class.
 * @method getAcquisitors
 * @return {array} An array list of acquisitors required by this component class.
 * Each element in the array is a JSON object {name : {string}, type: {JSCOM.ACQUISITOR_SINGLE | JSCOM.ACQUISITOR_MULTIPLE}}  
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
 * @method getInterfaces Get all the interfaces provided by this component, 
 * including those inherited from this component's ancestry components.
 * @static
 ***********************/ 
JSCOM.Component.getInterfaces = function(sComponentName)
{
	var aComponentInterfaces = [];
	var sParentName = eval(sComponentName + ".parent");
	
	while(sParentName) {
		var aParentInterfaces = eval(sParentName + ".interfaces");
		if (aParentInterfaces) {
			aComponentInterfaces = aComponentInterfaces.concat(aParentInterfaces);
		}
		sParentName = eval(sParentName + ".parent");
	}
	
	var iComponentInterfaces = eval(sComponentName + ".interfaces");
	if (iComponentInterfaces) {
		aComponentInterfaces = aComponentInterfaces.concat(iComponentInterfaces);
	}
	
	return aComponentInterfaces;	
}



/***********************
 * @example Calc.Calculator.interfaces = ["Calc.ICalculator"];
 * @property interfaces
 * @static
 ***********************/ 
JSCOM.Component.prototype.getInterfaces = function()
{
	var sComponentName = this.className;
	return JSCOM.Component.getInterfaces(sComponentName);
};

/***********************
 * MetaInterface: Adaptor Information
 ***********************/

/**
 * @method getCustomMetadata
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
 * @method getCustomMetadata
 */
JSCOM.Component.prototype.getCustomMetadata = function()
{
	return this._metadataSet;
};

/***********************
 * MetaInterface: Binding Info
 ***********************/

/**
 * Get all the entities that have bound interfaces to this composite
 * @method getServiceProviders
 * @return 
 */  
JSCOM.Component.prototype.getServiceProviders = function()
{
	var sCompositeId = this.id;
	return JSCOM._jscomRt._getBoundEntities(JSCOM._jscomRt._committedBindings, "source", sCompositeId);
}

/**
 * Get all the entities that have bound acquisitors to this composite
 * @method getServiceConsumers
 * @return 
 */  
JSCOM.Component.prototype.getServiceConsumers = function()
{
	var sProviderId = this.id;
	return JSCOM._jscomRt._getBoundEntities(JSCOM._jscomRt._committedBindings, "target", sProviderId);
}