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
 * @property parent {string}
 * @description Name of the parent component class
 * @static
 * @see Property value initialized in JSCOM.Loader
 ***********************/
 
  
/***********************
 * Get the direct parent component class name extended by this component class
 * @method getParent
 * @return {string} Name of the parent component class
 ***********************/ 
JSCOM.Component.prototype.getParent = function()
{
	return this.constructor.parent;
};

/***********************
 * Get the id of the composite that contains this component instance
 * @method getCompositeId
 * @return {string} Id of the composite that contains this component instance
 ***********************/
JSCOM.Component.prototype.getCompositeId = function()
{
	return this.compositeId;
};

/**
 * This method is used in a component implementation. It is called to obtain 
 * the service providers (i.e. referece to the Components/Composites that 
 * are bound to this component instance).
 *
 * @method use
 * @param {string} sInterfaceName Interface name of the acquisitor
 * @return {array | JSCOM.Component} An array of service providers
 * are returned if the acquisitor is of type JSCOM.ACQUISITOR_MULTIPLE, and there are
 * multiple service providers bound to the acquisitor. A component instance is returned
 * if the acquisitor is of type JSCOM.ACQUISITOR_SINGLE
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
				JSCOM.Error.throwError(JSCOM.Error.NoShortNameFound, [sInterfaceName, oEntity.id]);
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
 * Get a list of acquisitors of this component class.
 * @method getAcquisitors
 * @return {array} An array list of acquisitors required by this component class.
 * Each element in the array is of type JSCOM.Acquisitor.
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



/***********************
 * Gets the acquisitor of this component class that match the input interface name.
 * @method getAcquisitor
 * @param {string} sInterfaceName Name of the interface type.
 * @return {Acquisitor} Null value is returned if no matching acquisitor is found.
 ***********************/
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
 * Get all the interfaces provided by this component, including 
 * those inherited from this component's ancestry components.
 * @method getInterfaces
 * @static
 * @param {string} sComponentName Name of component class
 * @return {array} Interface names of the component. Each item in the array has type {string}.
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
 * Get a list of interface names exposed by this component class.
 * @method getInterfaces
 * @return {array}
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
 * Get the adaptor advices that have been applied to the input interface name.
 * @method getAdaptorAdvices
 * @param {string} interfaceName Name of interface
 * @return {map} Key is name of an interface function, type string. 

    Value is the advices applied to the interface function. E.g.

	var aAdvices = [
		{id: "MyEmptyAdaptor", fn: "isInteger", type: JSCOM.Adaptor.Type.BEFORE},
		{id: "MyEmptyAdaptor", fn: "isWithinRange", type: JSCOM.Adaptor.Type.AFTER},
	];
 */
JSCOM.Component.prototype.getAdaptorAdvices = function(interfaceName)
{
	var oInterfaceAdvices = {};
	var oInterface = JSCOM._jscomRt._interfaceDefSet[interfaceName];
	var oInterfaceDef = oInterface.definition;
	for (var fnName in oInterfaceDef) {
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
 * Get custom data associated with this component instance.
 * @method getCustomMetadata
 * @return {map} Key is of type string. Value is of type object.
 */
JSCOM.Component.prototype.getCustomMetadata = function()
{
	return this._metadataSet;
};

/***********************
 * MetaInterface: Binding Info
 ***********************/

/**
 * Get all the entities that are bound to the acquisitors of this component instance.
 * @method getServiceProviders
 * @return {array} A list of service providers bound to this component instance.
 	Each item in the array is a binding information with type JSON object E.g.
	component instance "MyAdder" provides interface "Calc.IAdd" to component 
	instance "MyCalculator". So "MyAdder" is service provider of "MyCalculator".

	var oServiceProvider = {
		source: "MyCalculator",
		target: "MyAdder",
		interface: "Calc.IAdd",
		type: JSCOM.ACQUISITOR_SINGLE
	}
 */  
JSCOM.Component.prototype.getServiceProviders = function()
{
	var sComponentId = this.id;
	return JSCOM._jscomRt._getBoundEntities(JSCOM._jscomRt._committedBindings, "source", sComponentId);
}

/**
 * Get all the entities that have bound to the interfaces of this component instance.
 * @method getServiceConsumers
 * @return {array} A list of service consumers bound to this component instance.
	Each item in the array is a binding information with type JSON object E.g. 
	component instance "MyAdder" provides interface "Calc.IAdd" to component 
	instance "MyCalculator". So "MyCalculator" is service consumer of "MyAdder".

	var oServiceConsumer = {
		source: "MyCalculator",
		target: "MyAdder",
		interface: "Calc.IAdd",
		type: JSCOM.ACQUISITOR_SINGLE
	}
 */  
JSCOM.Component.prototype.getServiceConsumers = function()
{
	var sProviderId = this.id;
	return JSCOM._jscomRt._getBoundEntities(JSCOM._jscomRt._committedBindings, "target", sProviderId);
}