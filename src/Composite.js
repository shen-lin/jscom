/**
 * Composite serves as the container for a set of components. 
 * It allows this set of enclosed components to be hidden from a higher-level
 * of abstraction.
 *
 * @module core
 * @class Composite
 */


JSCOM.Composite = function (id, jscomRt) {
	this.id = id;
	this.jscomRt = jscomRt;
};

/***********************
 * Child Composite API
 ***********************/

JSCOM.Composite.prototype.createComposite = function(id)
{
	// Check duplicate ID
	this._isNewComposite(id);
	
	// Create composite within this parent composite
	var composite =  new JSCOM.Composite(id, this.jscomRt);
	var childItem = {
		id: id,
		type: JSCOM.COMPOSITE
	};
	this.jscomRt._connectivity[this.id].push(childItem);
	this.jscomRt._connectivity[id] = [];

	return composite;
};

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
		var errorMsg = JSCOM.String.format("Composite {0} already exists", id);
		throw new Error(errorMsg);
	}
}


/***********************
 * Component API
 ***********************/


JSCOM.Composite.prototype.createComponent = function(className, id)
{
	// Check duplicate ID
	this._isNewComponentInstance(id);
	// Check component class is new
	var isNewComponent = this._isNewComponentClassType(className);
	// load component into runtime
	if (isNewComponent) {
		var componentRepo = this.jscomRt.getComponentRepo();
		JSCOM.Loader.loadComponent(componentRepo, className);
	}
	// store loaded component paths
	this.jscomRt._componentClassNameSet.push(className);
	// instantiate component instance
	var compInstance = this._initComponentInstance(className, id);
	// load the interface definition exposed by this component type
	this._initComponentInterfaceSet(className);
	// backup interface methods to recover from AoP modification
	this._backupInterfaceMethods(compInstance);
	
	return compInstance;
};


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
		var errorMsg = JSCOM.String.format("Component instance already exists: ID={0}", id);
		throw new Error(errorMsg);
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



JSCOM.Composite.prototype._loadRawInterface = function(interfaceName)
{
	var componentRepo = this.jscomRt.getComponentRepo();
	var interfaceRawContent = JSCOM.Loader.loadRawContent(componentRepo, interfaceName);
	var interfaceDef = JSON.parse(interfaceRawContent);
	this.jscomRt._interfaceDefSet[interfaceName] = interfaceDef;
};



/***********************
 * Expose API
 ***********************/

JSCOM.Composite.prototype.exposeInterface = function(interfaceName)
{
	var component = this._exposeLoop(interfaceName, this._hasInterface);
	return component;
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


JSCOM.Composite.prototype.exposeAcquisitor = function(interfaceName)
{
	var component = this._exposeLoop(interfaceName, this._hasAcquisitor);
	return component;
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


JSCOM.Composite.prototype._exposeLoop = function(interfaceName, exposeFunction)
{
	var compositeChildrenList = this.jscomRt.getChildrenList(this.id);
	
	for(var i in compositeChildrenList) {
		var childEntity = compositeChildrenList[i];
		var childEntityId = childEntity.id;
		var childEntityType = childEntity.type;

		if (childEntityType === JSCOM.COMPOSITE)
		{
			continue;
		}

		var nextComp = this.jscomRt._componentSet[childEntityId];
		var exists = exposeFunction(nextComp, interfaceName);

		if (exists)
		{
			return nextComp;
		}
	}

	return null;	
};



/***********************
 * Binding API 
 ***********************/

JSCOM.Composite.prototype.bind = function(sourceComp, targetComp, interfaceName)
{
	// Check if the acquisitor of the soureceComp has matching interfaceName
	this._checkMatchingAcquisitor(sourceComp, interfaceName);

	// Check if the targetComp exposes the interface
	this._checkMatchingInterface(targetComp, interfaceName);

	// Component binding
	var acquisitor = sourceComp._acquisitorSet[interfaceName];
	if (acquisitor.type === JSCOM.ACQUISITOR_SINGLE)
	{
		this.jscomRt._recordUncommittedBindings(JSCOM.COMMIT_BINDING, JSCOM.ACQUISITOR_SINGLE, sourceComp.id, targetComp.id, interfaceName);
		acquisitor.ref = targetComp;
	}
	else if (acquisitor.type === JSCOM.ACQUISITOR_MULTIPLE)
	{
		this.jscomRt._recordUncommittedBindings(JSCOM.COMMIT_BINDING, JSCOM.ACQUISITOR_MULTIPLE, sourceComp.id, targetComp.id, interfaceName);

		if (!acquisitor.ref)
		{
			acquisitor.ref = [];
		}
		acquisitor.ref.push(targetComp);
	}
	else {
		var errorMsg = JSCOM.String.format("Undefined Acquisitor Type: {0}", acquisitor.type);
		throw new Error(errorMsg);
	}
	
};



JSCOM.Composite.prototype.unbind = function(sourceComp, targetComp, interfaceName)
{
	
	// Check if the acquisitor of the soureceComp has matching interfaceName
	this._checkMatchingAcquisitor(sourceComp, interfaceName);

	// Check if the targetComp exposes the interface
	this._checkMatchingInterface(targetComp, interfaceName);

	// Component unbinding
	var acquisitor = sourceComp._acquisitorSet[interfaceName];
	if (acquisitor.type === JSCOM.ACQUISITOR_SINGLE)
	{
		this.jscomRt._recordUncommittedBindings(JSCOM.COMMIT_UNBINDING, JSCOM.ACQUISITOR_SINGLE, sourceComp.id, targetComp.id, interfaceName);
		acquisitor.ref = null;
	}
	else if (acquisitor.type === JSCOM.ACQUISITOR_MULTIPLE)
	{
		this.jscomRt._recordUncommittedBindings(JSCOM.COMMIT_UNBINDING, JSCOM.ACQUISITOR_MULTIPLE, sourceComp.id, targetComp.id, interfaceName);

		if (!acquisitor.ref) return;
		for (var i in acquisitor.ref)
		{
			if (targetComp.id === acquisitor.ref[i].id)
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
		var errorMsg = JSCOM.String.format("Undefined Acquisitor Type: {0}", acquisitor.type);
		throw new Error(errorMsg);
	}
};

JSCOM.Composite.prototype._checkMatchingAcquisitor = function(sourceComp, interfaceName)
{
	var acquisitor = sourceComp._acquisitorSet[interfaceName];
	
	if (!acquisitor)
	{
		var errorMsg = JSCOM.String.format("Binding Failure: Component {0} does not have acquisitor {1}", sourceComp.id, interfaceName);
		throw new Error(errorMsg);
	}
};

JSCOM.Composite.prototype._checkMatchingInterface = function(targetComp, interfaceName)
{
	var hasInterface = false;
	var targetCompInterfaces = targetComp.getInterfaceSet();
	for (var i in targetCompInterfaces)
	{
		var nextInterface = targetCompInterfaces[i];
		if (nextInterface === interfaceName)
		{
			hasInterface = true;
			break;
		}
	}

	if (!hasInterface)
	{
		var errorMsg = JSCOM.String.format("Binding Failure: Component {0} does not have interface {1}", targetComp.id, interfaceName);
		throw new Error(errorMsg);
	}
};
