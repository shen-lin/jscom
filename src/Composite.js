/**
 * Composite serves as the container for a set of components. 
 * It allows this set of enclosed components to be hidden from a higher-level
 * of abstraction. Do not call the Composite constructor to create new composite
 * instances outside JSCOM. Instead, call JSCOMRuntime.createRootComposite() to
 * create root level composite instances; and call Composite.createComposite() 
 * to create a child composite of this composite instance.
 * 
 * @module core
 * @class Composite
 *
 */

JSCOM.Loader.require("fs"); 
 
 
/**
 * Creates a new composite instance. This constructor should
 * not be called outside JSCOM library classes. 
 *
 * @constructor
 * @private
 * @param  {string} id Composite ID
 * @pram   {boolean} Indicate the composite is root level or not
 */ 
JSCOM.Composite = function (id) {
	this.id = id;
	this._acquisitorSet = [];
	this._interfaceMap = {};
};

/***********************
 * Child Composite API
 ***********************/

/**
 * Creates a child composite instance of this composite instance.
 * @method createComposite
 * @param  {string} id Composite ID
 * @return {JSCOM.Composite} Created composite instance
 */ 
JSCOM.Composite.prototype.createComposite = function(id)
{
	// Check duplicate ID
	this._isNewComposite(id);
	
	// Create composite within this parent composite
	var composite = new JSCOM.Composite(id);
	var childItem = {
		id: id,
		type: JSCOM.COMPOSITE
	};
	
	// Attach newly create composite to its parent
	JSCOM._jscomRt._connectivity[this.id].push(childItem);
	// This composite doesn't have any children by default.
	JSCOM._jscomRt._connectivity[id] = [];

	return composite;
};

/**
 * Checks if the input composite ID already exists in JSCOM runtime.
 * @param  {string} id Composite ID
 */ 
JSCOM.Composite.prototype._isNewComposite = function(id)
{
	var isNewComposite = false;

	var childList = JSCOM._jscomRt.getChildrenList(this.id);
	for (var i in childList)
	{
		var nextEntity = childList[i];
		if (nextEntity.id === id)
		{
			isNewComposite = true;
			break;
		}
	}

	if (isNewComposite)
	{
		JSCOM.Error.throwError(JSCOM.Error.CompositeAlreadyExist, [id]);
	}
}


/***********************
 * Component API
 ***********************/

/**
 * Creates a component instance inside this composite instance.
 * <p>@throws FunctionNotImplemented</p>
 * @method createComponent
 * @param  {string} className Component class name
 * @param {string} id Component ID
 */ 
JSCOM.Composite.prototype.createComponent = function(className, id)
{
	// Check duplicate ID
	this._isNewComponentInstance(id);
	// Check component class is new
	var isNewComponent = this._isNewComponentClassType(className);
	// load component into runtime
	if (isNewComponent) {
		var componentRepo = JSCOM._jscomRt.getComponentRepo();
		JSCOM.Loader.loadEntity(componentRepo, className);
	}
	// store loaded component paths
	JSCOM._jscomRt._componentClassNameSet.push(className);
	// instantiate component instance
	var compInstance = this._initComponentInstance(className, id);
	// load the interface definition exposed by this component type
	this._initComponentInterfaceSet(compInstance);
	// check the interface methods are implemented in the component
	this._checkInterfaceMethods(compInstance);
	// backup interface methods to recover from AoP modification
	this._backupInterfaceMethods(compInstance);
	
	return compInstance;
};


JSCOM.Composite.prototype._checkInterfaceMethods = function(compInstance)
{
	var aInterfaces = compInstance.getInterfaces();
	for (var i in aInterfaces) {
		var sInterfaceName = aInterfaces[i];
		var oInterface = JSCOM._jscomRt._interfaceDefSet[sInterfaceName];
		var oInterfaceDef = oInterface.oInterfaceDef;
		for (var sFnName in oInterfaceDef) {
			if (!compInstance[sFnName]) {
				JSCOM.Error.throwError(JSCOM.Error.FunctionNotImplemented, [sInterfaceName, sFnName, compInstance.id]);
			}
		}
	}
};

/**
 * Initializes a component instance.
 * @param  {string} className Component class name
 * @param {string} id Component ID
 */ 
JSCOM.Composite.prototype._initComponentInstance = function(className, id)
{
	// initialize component instance
	var newCompStmt = JSCOM.String.format("new {0}()", className);
	var compInstance = eval(newCompStmt);
	compInstance.id = id;
	compInstance.className = className;
	
	// setup runtime reflection data
	JSCOM._jscomRt._componentSet[id] = compInstance;	
	var childItem = {
		id: id, 
		type: JSCOM.COMPONENT
	};
	JSCOM._jscomRt._connectivity[this.id].push(childItem);  

	// return initialized component instance
	return compInstance;
};

JSCOM.Composite.prototype._backupInterfaceMethods = function(compInstance)
{	
	var aInterfaces = compInstance.getInterfaces();
	for (var i in aInterfaces)
	{
		var sInterfaceName = aInterfaces[i];
		var oInterface = JSCOM._jscomRt._interfaceDefSet[sInterfaceName];
		var oInterfaceDef = oInterface.oInterfaceDef;
		for (var fnName in oInterfaceDef) {
			var backupFnName = JSCOM.String.format(JSCOM.FN_BAK, fnName);
			compInstance.constructor.prototype[backupFnName] = compInstance.constructor.prototype[fnName];
		}
	}
};

JSCOM.Composite.prototype._isNewComponentClassType = function(className)
{
	var isNewComponentClassType = true;

	for (var i in JSCOM._jscomRt._componentClassNameSet)
	{
		var nextLoadedClassName = JSCOM._jscomRt._componentClassNameSet[i];
		if (nextLoadedClassName === className)
		{
			isNewComponentClassType = false;
			break;
		}
	}

	return isNewComponentClassType;
};


JSCOM.Composite.prototype._isNewComponentInstance = function(id)
{
	var componentInstance = JSCOM._jscomRt._componentSet[id];
	if (componentInstance)
	{
		JSCOM.Error.throwError(JSCOM.Error.ComponentAlreadyExist, [id]);
	}
};



JSCOM.Composite.prototype._initComponentInterfaceSet = function(compInstance)
{
	var aInterfaces = compInstance.getInterfaces();
	for (var i in aInterfaces)
	{
		var sInterfaceName = aInterfaces[i];
		this._loadRawInterface(sInterfaceName);
	}
};



JSCOM.Composite.prototype._loadRawInterface = function(sInterfaceName)
{
	// Skip interfaces that already added
	if (JSCOM._jscomRt._interfaceDefSet[sInterfaceName]) return;
	
	var componentRepo = JSCOM._jscomRt.getComponentRepo();
	var interfaceRawContent = JSCOM.Loader.loadRawContent(componentRepo, sInterfaceName);
	var oInterfaceDef = JSON.parse(interfaceRawContent);
	var oInterface = new JSCOM.Interface(sInterfaceName, oInterfaceDef);
	JSCOM._jscomRt._interfaceDefSet[sInterfaceName] = oInterface;
};



/***********************
 * Expose API
 ***********************/
/**
 * Get interfaces exposed by this composite
 * 
 * @method getInterfaceMap
 * @return {object} A map of interfaces exposed by the composite. 
 * Key is the short name used for invoking the interface method.
 * Value is interface name.
 */ 
JSCOM.Composite.prototype.getInterfaceMap = function()
{
	return this._interfaceMap;
};

/**
 * Get acquisitors exposed by this composite
 * 
 * @method getAcquisitors
 * @return {array} An array of acquisitors
 */ 
JSCOM.Composite.prototype.getAcquisitors = function()
{
	return this._acquisitorSet;
};

/**
 * Explicitly expose an interface of this composite instance's internal component instance 
 * to external entities. Interfaces of internal composites cannot be exposed. 
 * 
 * @method exposeInterface
 * @param {string} sInterfaceName Interface name
 * @param {string} sShortName A short name for the interface. It serves as namespace for methods within this interface.
 * @return {boolean} Found component for valid interface expose
 */ 
JSCOM.Composite.prototype.exposeInterface = function(sInterfaceName, sShortName)
{
	if (this._interfaceMap[sShortName]) {
		JSCOM.Error.throwError(JSCOM.Error.ExposeInterfaceFailure, sShortName, this.id);
	}
	
	// Find the component within this composite, and this component has 
	// the interface to be exposed
	var oComponent = this._exposeLoop(sInterfaceName, this._hasInterface);
	if (!oComponent) return false;
	
	// Creates functions of the exposed interface for the composite
	this._createInterfaceFunctions(sInterfaceName, oComponent, sShortName);
	
	// Add interface to this composite's interface set
	this._interfaceMap[sShortName] = sInterfaceName;
	return true;
};


JSCOM.Composite.prototype._createInterfaceFunctions = function(sInterfaceName, oComponent, sShortName)
{
	var oInterface = JSCOM._jscomRt._interfaceDefSet[sInterfaceName];
	var oInterfaceDef = oInterface.oInterfaceDef;

	for (var sFnName in oInterfaceDef) {
		this._createInterfaceFunction(oComponent, sFnName, sInterfaceName, oInterfaceDef, sShortName);
		 
		/*
		var sChannelId = JSCOM.eventUri.ComponentInterfaceChannel;
		var sEventId = JSCOM.String.format(
			JSCOM.eventUri.EventIDFormat, 
			oComponent.className, 
			oComponent.id, 
			sInterfaceName,
			sFnName);
		
		if (!oComponent[sFnName]) {
			throw "Function " + sFnName + " of Interface " + sInterfaceName + " is not implemented in Component " + oComponent.id;
		}
		var fnInterfaceFunction = oComponent[sFnName].bind(oComponent);
		JSCOM.EventBus.subscribeLocal(sChannelId, sEventId, fnInterfaceFunction);
		*/
	}
};

JSCOM.Composite.prototype._createInterfaceFunction = function(oComponent, sFnName, sInterfaceName, oInterfaceDef, sShortName)
{
	var sComponentId = oComponent.id;
	
	var fnProcedureTemplate = "var oComponent = JSCOM._jscomRt._componentSet['{0}'];\n";
	fnProcedureTemplate += "oComponent.{1}.apply(oComponent, arguments)";
	var fnProcedureStmt = JSCOM.String.format(fnProcedureTemplate, sComponentId, sFnName);
	
	var createExposeFnTemplate = "this['{0}']['{1}'] = function() {\n{2}\n}";
	var createExposeFnStmt = JSCOM.String.format(createExposeFnTemplate, sShortName, sFnName, fnProcedureStmt);
	
	var createInterfaceScopeTemplate = "this['{0}'] = this['{1}'] || {};\n";
	var createInterfaceScopeStmt = JSCOM.String.format(createInterfaceScopeTemplate, sShortName, sShortName);
	
	var stmt = createInterfaceScopeStmt + createExposeFnStmt;
	JSCOM.LOGGER.debug(stmt);
	eval(stmt);
}

JSCOM.Composite.prototype._hasInterface = function(oComponent, sInterfaceName)
{
	var aCompInterfaces = oComponent.getInterfaces();
	if (!aCompInterfaces)
	{
		return false;
	}

	for (var i in aCompInterfaces)
	{
		var sCompInterface = aCompInterfaces[i];
		if (sCompInterface === sInterfaceName)
		{
			return true;
		}
	}

	return false;
};

/**
 * Explicitly expose an acquisitor of this composite instance's internal component instance 
 * to external entities. Acquisitors of internal composites cannot be exposed. 
 * 
 * @method exposeAcquisitor
 * @param  {string} sInterfaceName Interface name
 * @return {boolean} Found component for valid acquisitor expose
 */ 
JSCOM.Composite.prototype.exposeAcquisitor = function(sInterfaceName)
{
	var component = this._exposeLoop(sInterfaceName, this._hasAcquisitor);
	if (!component) return false;
	
	// Creates functions of the exposed acuisitor for the composite
	// this._createAcquisitorFunctions(sInterfaceName, oComponent);
	
	var oAcquisitorDef = component.getAcquisitor(sInterfaceName);
	this._acquisitorSet.push(oAcquisitorDef);
	
	return true;
};





JSCOM.Composite.prototype._hasAcquisitor = function(component, interfaceName)
{
	var acquisitorSet = component.getAcquisitorSet();
	if (!acquisitorSet)
	{
		return false;
	}

	for (var i in acquisitorSet)
	{
		var acquisitor = acquisitorSet[i];
		if (acquisitor.interfaceName === interfaceName)
		{
			return true;
		}
	}

	return false;
};

/**
 * A common looping function for both exposeInterface and exposeAcquisitor.
 * <p>@throws JSCOM.Error.DuplicateInterfacesWithinComposite</p>
 * @param  {string} sInterfaceName Interface name
 * @param  {function} fnExposeFunction
 * @return {oComponent} Found component with the given interface/acquisitor.
 */ 
JSCOM.Composite.prototype._exposeLoop = function(sInterfaceName, fnExposeFunction)
{
	var compositeChildrenList = JSCOM._jscomRt.getChildrenList(this.id);
	var aComponents = []; // count the number of components found with the matching interface 
	for(var i in compositeChildrenList) {
		var childEntity = compositeChildrenList[i];
		var childEntityId = childEntity.id;

		// Skip internal composites
		var childEntityType = childEntity.type;
		if (childEntityType === JSCOM.COMPOSITE)
		{
			continue;
		}
		
		var nextComp = JSCOM._jscomRt._componentSet[childEntityId];
		var exists = fnExposeFunction(nextComp, sInterfaceName);

		if (exists)
		{
			aComponents.push(nextComp);
		}
	}

	if (aComponents.length === 0) {
		return null;
	}
	else if (aComponents.length === 1) {
		return aComponents[0];
	} 
	else {
		JSCOM.Error.throwError(JSCOM.Error.DuplicateInterfacesWithinComposite, [this.id]);
	}
};



/***********************
 * Binding API 
 ***********************/
 
/**
 * Get all the entities that have bound interfaces to this composite
 * @method getServiceProviders
 * @return 
 */  
JSCOM.Composite.prototype.getServiceProviders = function()
{
	var sCompositeId = this.id;
	return JSCOM._jscomRt._getServiceProviders(sCompositeId);
}

/**
 * Get all the entities that have bound acquisitors to this composite
 * @method getServiceConsumers
 * @return 
 */  
JSCOM.Composite.prototype.getServiceConsumers = function()
{
	var sProviderId = this.id;
	return JSCOM._jscomRt._getServiceConsumers(sProviderId);
}


/**
 * Bind the source entity's acquisitor to the target entity's interface.
 * <p>@throws JSCOM.Error.UndefinedAcquisitorType</p>
 * <p>@throws JSCOM.Error.UndefinedInterfaceType</p>
 * @method bind
 * @param  {string} sSourceId Id of the source entity
 * @param  {string} sTargetId Id of the target entity
 * @param  {string} sInterfaceName Interface name
 * 
 */ 
JSCOM.Composite.prototype.bind = function(sSourceId, sTargetId, sInterfaceName)
{	
	// validation
	var oEntities = this._validateBindingInputs(sSourceId, sTargetId, sInterfaceName);
	// TODO: check single acquisitor is not bound to any other entity
	
	var oSource = oEntities.source;
	var oTarget = oEntities.target;

	var acquisitor = oSource.getAcquisitor(sInterfaceName);	
	// Create event binding
	// register event handlers for the newly loaded component instance
	// JSCOM.EventBus._subscribeComponentInterfaceEvents.(compInstance);	
			
	// record entity binding
	if (acquisitor.type === JSCOM.ACQUISITOR_SINGLE)
	{
		JSCOM._jscomRt._recordBinding(JSCOM.COMMIT_BINDING, JSCOM.ACQUISITOR_SINGLE, sSourceId, sTargetId, sInterfaceName);
	}
	else if (acquisitor.type === JSCOM.ACQUISITOR_MULTIPLE)
	{
		JSCOM._jscomRt._recordBinding(JSCOM.COMMIT_BINDING, JSCOM.ACQUISITOR_MULTIPLE, sSourceId, sTargetId, sInterfaceName);
	}
	else {
		JSCOM.Error.throwError(JSCOM.Error.UndefinedAcquisitorType, [acquisitor.type]);
	}
};


/**
 * Unind the source entity's acquisitor from the target entity's interface.
 * <p>@throws JSCOM.Error.UndefinedAcquisitorType</p>
 *
 * @method unbind
 * @param  {string} sSourceId Id of the source entity
 * @param  {string} sTargetId Id of the target entity
 * @param  {string} sInterfaceName Interface name
 * 
 */ 
JSCOM.Composite.prototype.unbind = function(sSourceId, sTargetId, sInterfaceName)
{
	// validation
	var oEntities = this._validateBindingInputs(sSourceId, sTargetId, sInterfaceName);
	var oSource = oEntities.source;
	var oTarget = oEntities.target;
	
	// Component unbinding
	if (acquisitor.type === JSCOM.ACQUISITOR_SINGLE)
	{
		JSCOM._jscomRt._recordBinding(JSCOM.COMMIT_UNBINDING, JSCOM.ACQUISITOR_SINGLE, sSourceId, sTargetId, sInterfaceName);
	}
	else if (acquisitor.type === JSCOM.ACQUISITOR_MULTIPLE)
	{
		JSCOM._jscomRt._recordBinding(JSCOM.COMMIT_UNBINDING, JSCOM.ACQUISITOR_MULTIPLE, sSourceId, sTargetId, sInterfaceName);
	}
	else {
		JSCOM.Error.throwError(JSCOM.Error.UndefinedAcquisitorType, [acquisitor.type]);
	}
};

// Check if the source entity is within this composite
// Check if the acquisitor of the sourece has matching interfaceName
// Check if the target entity is within this composite 
// Check if the target entity exposes the interface
JSCOM.Composite.prototype._validateBindingInputs = function(sSourceId, sTargetId, sInterfaceName)
{
	var oEntities = this._checkInputAreChildren(sSourceId, sTargetId);
	var oSource = oEntities.source;
	var oTarget = oEntities.target;
	this._checkMatchingAcquisitor(oSource, sInterfaceName);
	this._checkMatchingInterface(oTarget, sInterfaceName);
	return oEntities;
};




JSCOM.Composite.prototype._checkInputAreChildren = function(sSourceId, sTargetId)
{
	var aChildIds = JSCOM._jscomRt.getChildrenList(this.id);
	var oSourceChild, oTargetChild;
	for (var i in aChildIds) {
		var oChild = aChildIds[i];
		var sChildId = oChild.id;
		var sChildType = oChild.type;
		
		if (sChildId === sSourceId) {
			oSourceChild = JSCOM._jscomRt.getEntity(sChildId, sChildType);
		}
		if (sChildId === sTargetId) {
			oTargetChild = JSCOM._jscomRt.getEntity(sChildId, sChildType);
		}
		
		if (oSourceChild && oTargetChild) {
			break;
		}
	}
	
	if (!oSourceChild) {
		JSCOM.Error.throwError(JSCOM.Error.ChildEntityNotExist, [sSourceId, this.id]);
	}
	
	if (!oTargetChild) {
		JSCOM.Error.throwError(JSCOM.Error.ChildEntityNotExist, [sTargetId, this.id]);
	}
	
	return {
		source: oSourceChild,
		target: oTargetChild
	}
};

JSCOM.Composite.prototype._checkMatchingAcquisitor = function(oSource, sInterfaceName)
{
	var hasAcquisitor = false;
	var aAcquisitors = oSource.getAcquisitors();
	for (var i in aAcquisitors) {
		var oNextAcquisitor = aAcquisitors[i];
		var sNextAcquisitor = oNextAcquisitor.name;
		if (sNextAcquisitor === sInterfaceName) {
			hasAcquisitor = true;
			break;
		}
	}
	
	if (!hasAcquisitor)
	{
		JSCOM.Error.throwError(JSCOM.Error.BindingFailureAcquisitor, [oSource.id, sInterfaceName]);
	}
};

JSCOM.Composite.prototype._checkMatchingInterface = function(oTarget, sInterfaceName)
{
	var hasInterface = false;
	var aTargetInterfaces = oTarget.getInterfaces();
	for (var i in aTargetInterfaces)
	{
		var sNextInterface = aTargetInterfaces[i];
		if (sNextInterface === sInterfaceName)
		{
			hasInterface = true;
			break;
		}
	}

	if (!hasInterface)
	{
		JSCOM.Error.throwError(JSCOM.Error.BindingFailureInterface, [oTarget.id, sInterfaceName]);
	}
};
