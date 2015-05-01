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

JSCOM.require("fs"); 
 
 
/**
 * Creates a new composite instance. This constructor should
 * not be called outside JSCOM library classes. 
 *
 * @constructor
 * @private
 * @param  {string} id Composite ID
 * @param  {JSCOM.JSCOMRuntime} jscomRt JSCOM runtime instance
 * @pram   {boolean} Indicate the composite is root level or not
 */ 
JSCOM.Composite = function (id, jscomRt) {
	this.id = id;
	this.jscomRt = jscomRt;
	this._exposedInterfaces = {};
	this._exposedReceptacles = {};
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
	var composite = new JSCOM.Composite(id, this.jscomRt);
	var childItem = {
		id: id,
		type: JSCOM.COMPOSITE
	};
	
	// Attach newly create composite to its parent
	this.jscomRt._connectivity[this.id].push(childItem);
	// This composite doesn't have any children by default.
	this.jscomRt._connectivity[id] = [];

	return composite;
};

/**
 * Checks if the input composite ID already exists in JSCOM runtime.
 * @param  {string} id Composite ID
 */ 
JSCOM.Composite.prototype._isNewComposite = function(id)
{
	var isNewComposite = false;

	var childList = this.jscomRt.getChildrenList(this.id);
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
		var componentRepo = this.jscomRt.getComponentRepo();
		JSCOM.Loader.loadEntity(componentRepo, className);
	}
	// store loaded component paths
	this.jscomRt._componentClassNameSet.push(className);
	// instantiate component instance
	var compInstance = this._initComponentInstance(className, id);
	// load the interface definition exposed by this component type
	this._initComponentInterfaceSet(className);
	// check the interface methods are implemented in the component
	this._checkInterfaceMethods(compInstance);
	// backup interface methods to recover from AoP modification
	this._backupInterfaceMethods(compInstance);
	
	return compInstance;
};


JSCOM.Composite.prototype._checkInterfaceMethods = function(compInstance)
{
	var oInterfaceSet = compInstance.getInterfaceSet();
	for (var sInterfaceName in oInterfaceSet) {
		var oInterface = oInterfaceSet[sInterfaceName];
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
	compInstance.jscomRt = this.jscomRt;
	
	// setup runtime reflection data
	this.jscomRt._componentSet[id] = compInstance;	
	var childItem = {
		id: id, 
		type: JSCOM.COMPONENT
	};
	this.jscomRt._connectivity[this.id].push(childItem);  

	// return initialized component instance
	return compInstance;
};

JSCOM.Composite.prototype._backupInterfaceMethods = function(compInstance)
{	
	var interfaceSet = compInstance.getInterfaceSet();
	for (var i in interfaceSet)
	{
		var interfaceName = interfaceSet[i];
		var interfaceDef = this.jscomRt._interfaceDefSet[interfaceName];
		for (var fnName in interfaceDef) {
			var backupFnName = JSCOM.String.format(JSCOM.FN_BAK, fnName);
			compInstance.constructor.prototype[backupFnName] = compInstance.constructor.prototype[fnName];
		}
	}
};

JSCOM.Composite.prototype._isNewComponentClassType = function(className)
{
	var isNewComponentClassType = true;

	for (var i in this.jscomRt._componentClassNameSet)
	{
		var nextLoadedClassName = this.jscomRt._componentClassNameSet[i];
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
	var componentInstance = this.jscomRt._componentSet[id];
	if (componentInstance)
	{
		JSCOM.Error.throwError(JSCOM.Error.ComponentAlreadyExist, [id]);
	}
};



JSCOM.Composite.prototype._initComponentInterfaceSet = function(className)
{
	// load interfaces exposed by this component
	var getInterfacesStmt = JSCOM.String.format("{0}.interfaces", className);
	var interfaceSet = eval(getInterfacesStmt);
	for (var i in interfaceSet)
	{
		var interfaceName = interfaceSet[i];
		this._loadRawInterface(interfaceName);
	}
};



JSCOM.Composite.prototype._loadRawInterface = function(sInterfaceName)
{
	// Skip interfaces that already added
	if (this.jscomRt._interfaceDefSet[sInterfaceName]) return;
	
	var componentRepo = this.jscomRt.getComponentRepo();
	var interfaceRawContent = JSCOM.Loader.loadRawContent(componentRepo, sInterfaceName);
	var oInterfaceDef = JSON.parse(interfaceRawContent);
	var oInterface = new JSCOM.Interface(sInterfaceName, oInterfaceDef);
	this.jscomRt._interfaceDefSet[sInterfaceName] = oInterface;
};



/***********************
 * Expose API
 ***********************/

/**
 * Explicitly expose an interface of this composite instance's internal component instance 
 * to external entities. Interfaces of internal composites cannot be exposed. 
 * 
 * @method exposeInterface
 * @param  {string} sInterfaceName Interface name
 * @return {boolean} Found component for valid interface expose
 */ 
JSCOM.Composite.prototype.exposeInterface = function(sInterfaceName)
{
	// Only need to record metadata and setup event handling.
	var oComponent = this._exposeLoop(sInterfaceName, this._hasInterface);
	if (!oComponent) return false;
	
	// Creates functions of the exposed interface for the composite
	this._createInterfaceFunctions(sInterfaceName, oComponent);
	return true;
};


JSCOM.Composite.prototype._createInterfaceFunctions = function(sInterfaceName, oComponent)
{
	var oInterface = this.jscomRt._interfaceDefSet[sInterfaceName];
	var oInterfaceDef = oInterface.oInterfaceDef;

	var sChannelId = JSCOM.eventUri.ComponentInterfaceChannel;
	
	for (var sFnName in oInterfaceDef) {
		this[sFnName] = function() {
			// Publish events
		}
		/*
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


JSCOM.Composite.prototype._hasInterface = function(component, interfaceName)
{
	var compInterfaces = component.constructor.interfaces;
	if (!compInterfaces)
	{
		return false;
	}

	for (var i in compInterfaces)
	{
		var compInterface = compInterfaces[i];
		if (compInterface === interfaceName)
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
 * @param  {string} interfaceName Interface name
 * @return {boolean} Found component for valid acquisitor expose
 */ 
JSCOM.Composite.prototype.exposeAcquisitor = function(interfaceName)
{
	var component = this._exposeLoop(interfaceName, this._hasAcquisitor);
	if (!component) return false;
	
	
	
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
	var compositeChildrenList = this.jscomRt.getChildrenList(this.id);
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
		
		var nextComp = this.jscomRt._componentSet[childEntityId];
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
 * Bind the source entity's acquisitor to the target entity's interface.
 * <p>@throws JSCOM.Error.UndefinedAcquisitorType</p>
 *
 * @method bind
 * @param  {string} sSourceId Id of the source entity
 * @param  {string} sTargetId Id of the target entity
 * @param  {string} sInterfaceName Interface name
 * 
 */ 
JSCOM.Composite.prototype.bind = function(sSourceId, sTargetId, sInterfaceName)
{
	// Create event binding
	// register event handlers for the newly loaded component instance
	// JSCOM.EventBus._subscribeComponentInterfaceEvents.(compInstance);
	
	// validation
	var oEntities = this._validateBindingInputs(sSourceId, sTargetId, sInterfaceName);
	var oSource = oEntities.source;
	var oTarget = oEntities.target;
	
	// entity binding
	var acquisitor = oSource._acquisitorSet[sInterfaceName];
	if (acquisitor.type === JSCOM.ACQUISITOR_SINGLE)
	{
		this.jscomRt._recordUncommittedBindings(JSCOM.COMMIT_BINDING, JSCOM.ACQUISITOR_SINGLE, sSourceId, sTargetId, sInterfaceName);
		acquisitor.ref = oTarget;
	}
	else if (acquisitor.type === JSCOM.ACQUISITOR_MULTIPLE)
	{
		this.jscomRt._recordUncommittedBindings(JSCOM.COMMIT_BINDING, JSCOM.ACQUISITOR_MULTIPLE, sSourceId, sTargetId, sInterfaceName);

		if (!acquisitor.ref)
		{
			acquisitor.ref = [];
		}
		acquisitor.ref.push(oTarget);
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
	var acquisitor = oSource._acquisitorSet[sInterfaceName];
	if (acquisitor.type === JSCOM.ACQUISITOR_SINGLE)
	{
		this.jscomRt._recordUncommittedBindings(JSCOM.COMMIT_UNBINDING, JSCOM.ACQUISITOR_SINGLE, sSourceId, sTargetId, sInterfaceName);
		acquisitor.ref = null;
	}
	else if (acquisitor.type === JSCOM.ACQUISITOR_MULTIPLE)
	{
		this.jscomRt._recordUncommittedBindings(JSCOM.COMMIT_UNBINDING, JSCOM.ACQUISITOR_MULTIPLE, sSourceId, sTargetId, sInterfaceName);

		if (!acquisitor.ref) return;
		for (var i in acquisitor.ref)
		{
			if (oTarget.id === acquisitor.ref[i].id)
			{
				acquisitor.ref.slice(i, 1);
			}
		}
			
		if (acquisitor.ref.length === 0)
		{
			acquisitor.ref = null;
		}
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
	var aChildIds = this.jscomRt.getChildrenList(this.id);
	var oSourceChild, oTargetChild;
	for (var i in aChildIds) {
		var oChild = aChildIds[i];
		var sChildId = oChild.id;
		var sChildType = oChild.type;
		
		if (sChildId === sSourceId) {
			oSourceChild = this.jscomRt.getEntity(sChildId, sChildType);
		}
		if (sChildId === sTargetId) {
			oTargetChild = this.jscomRt.getEntity(sChildId, sChildType);
		}
		
		if (oSourceChild && oTargetChild) {
			break;
		}
	}
	
	if (!oSourceChild) {
		JSCOM.Error.throwError(JSCOM.Error.ChildNotExist, [sSourceId, this.id]);
	}
	
	if (!oTargetChild) {
		JSCOM.Error.throwError(JSCOM.Error.ChildNotExist, [sTargetId, this.id]);
	}
	
	return {
		source: oSourceChild,
		target: oTargetChild
	}
};

JSCOM.Composite.prototype._checkMatchingAcquisitor = function(oSource, sInterfaceName)
{
	var acquisitor = oSource._acquisitorSet[sInterfaceName];
	
	if (!acquisitor)
	{
		JSCOM.Error.throwError(JSCOM.Error.BindingFailureAcquisitor, [oSource.id, sInterfaceName]);
	}
};

JSCOM.Composite.prototype._checkMatchingInterface = function(oTarget, sInterfaceName)
{
	var hasInterface = false;
	var aTargetInterfaces = oTarget.getInterfaceSet();
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
