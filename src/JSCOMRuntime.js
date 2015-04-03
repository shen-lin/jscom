JSCOM.JSCOMRuntime = function () {
	this._componentRepo = null;  // component repository
	this._compositeSet = {};     // root-level composites
	this._componentSet = {};     // loaded component instances
	this._connectivity = {};          // runtime composite and component hierarchical graph 
	this._componentClassNameSet = [];   // loaded component class types
	this._interfaceDefSet = {};       // loaded interface definitions, accessed in Composite.js

	this._adaptorSet = {}; // loaded adaptors
	this._adaptorClassNameSet = []; // loaded adaptor class types
	this._startTrans = false;
	this._uncommittedBindings = [];
};


/***********************
 * Composite Access API
 ***********************/
JSCOM.JSCOMRuntime.prototype.createComposite = function(id)
{
	var composite =  new JSCOM.Composite(id, this);
	this._compositeSet[id] = composite;
	this._connectivity[id] = [];
	return composite;
};

JSCOM.JSCOMRuntime.prototype.getComposite = function(id)
{
	return this._compositeSet[id];
};

JSCOM.JSCOMRuntime.prototype.getCompositeSet = function()
{
	return this._compositeSet;
};

/***********************
 * Adaptor API 
 ***********************/
 
/**
 * @param 
 */  
JSCOM.JSCOMRuntime.prototype.createAdaptor = function(className, id) 
{
	// Check duplicate ID
	this._isNewAdaptorInstance(id);
	// Check component class is new
	var isNewAdaptor = this._isNewAdaptorType(className);
	// load adaptor into runtime
	if (isNewAdaptor) {
		var componentRepo = this.getComponentRepo();
		JSCOM.Loader.loadComponent(componentRepo, className);		
	}
	// store loaded adaptor paths
	this._adaptorClassNameSet.push(className);
	// instantiate adaptor instance
	var adaptorInstance = this._initAdaptorInstance(className, id);
	return adaptorInstance;
};


/**
 * @param sId {string} Id of the injection
 * @param oAdvices {array} Indicating the location of this adaptor function in the ordered list of applied adaptor functions. E.g.
	[
		{id: adaptorId, fn: adaptorFn_1, type: JSCOM.Adaptor.Type.BEFORE}, 
		{id: adaptorId, fn: adaptorFn_2, type: JSCOM.Adaptor.Type.AFTER}, 
		{id: adaptorId, fn: adaptorFn_3, type: JSCOM.Adaptor.Type.BEFORE} 
	]
	
 * @param oScope {object} A JSON object with data structure:  
	{
		include: [{string}...],
		exclude: [{string}...],
	}
	 
	Each string in the array is a regular expression that describe the component classes that should be 
	included / excluded for this adaptor injection. The regular expression contains the following characters for 
	pattern matching:
	 
	'*' Match zero or more characters 
	'**' Match zero or more directories 
	'?' Match a single character
 */
JSCOM.JSCOMRuntime.prototype.applyAdaptor = function(sId, oAdvices, oScope)
{
	var functions = this._findMatchingFunctions(oScope);
	
	for (var i in functions) {
		var targetFnItem = functions[i];
		// restore backup function
		this._restoreBackupFunction(targetFnItem);
		// apply cross-cutting functions in sequence
		for (var i in oAdvices) {
			var oAdvice = oAdvices[i];
			var sAdaptorId = oAdvice.id;
			var sAdaptorFn = oAdvice.fn;
			var oAdaptorType = oAdvice.type;
			var adaptorInstance = this._adaptorSet[sAdaptorId];
			adaptorInstance.applyAdaptor(sAdaptorFn, oAdaptorType, targetFnItem);
		}
	}
};

JSCOM.JSCOMRuntime.prototype._restoreBackupFunction = function(fnItem)
{
	var classObj = fnItem.classObj;
	var fnName = fnItem.fnName;
	var backupFnName = JSCOM.String.format(JSCOM.FN_BAK, fnName);
	classObj.prototype[fnName] = classObj.prototype[backupFnName];
};

JSCOM.JSCOMRuntime.prototype._findMatchingFunctions = function(scope)
{
	var targetFnList = [];
	for (var i in this._componentClassNameSet) {
		var className = this._componentClassNameSet[i];
		var matchFnList = this._findMatchingFunctionsForClass(scope, className);
		targetFnList = targetFnList.concat(matchFnList);
	}
	return targetFnList;
};



JSCOM.JSCOMRuntime.prototype._findMatchingFunctionsForClass = function(scope, className)
{
	var fnList = [];
	// load interfaces exposed by this component
	var oComponentClass = eval(className);
	var interfaceSet = oComponentClass.interfaces;
	
	for (var i in interfaceSet) {
		var interfaceName = interfaceSet[i];
		var interfaceDef = this._interfaceDefSet[interfaceName];
		for (var fnName in interfaceDef) {
			var classFnPath = className + "@" + fnName;
			var isMatchingFn = this._isMatchingFunction(scope, classFnPath);
			if (isMatchingFn) {
				var fnItem = {
					className: className,
					classObj: oComponentClass,
					fnName: fnName
				};
				fnList.push(fnItem);
			}
		}
	}
	
	return fnList;
};


JSCOM.JSCOMRuntime.prototype._isMatchingFunction = function(scope, classFnPath) {
	var includeList = scope.include;
	var excludeList = scope.exclude;
	
	for (var i in excludeList) {
		var excludePattern = excludeList[i];
		var isExcluded = JSCOM.String.matchRegExpr(classFnPath, excludePattern);
		if (isExcluded) {
			return false;
		}
	}
	
	for (var i in includeList) {
		var includePattern = includeList[i];
		var isIncluded = JSCOM.String.matchRegExpr(classFnPath, includePattern);
		if (isIncluded) {
			return true;
		}
	}
	return false;
};



JSCOM.JSCOMRuntime.prototype._isNewAdaptorInstance = function(id)
{
	var adaptorInstance = this._adaptorSet[id];
	if (adaptorInstance)
	{
		var errorMsg = JSCOM.String.format("Adaptor instance already exists: ID={0}", id);
		throw new Error(errorMsg);
	}
};

JSCOM.JSCOMRuntime.prototype._isNewAdaptorType = function(className) 
{
	var isNewAdaptorType = true;

	for (var i in this._adaptorClassNameSet)
	{
		var nextLoadedClassName = this._adaptorClassNameSet[i];
		if (nextLoadedClassName === className)
		{
			isNewAdaptorType = false;
			break;
		}
	}

	return isNewAdaptorType;
};


JSCOM.JSCOMRuntime.prototype._initAdaptorInstance = function(className, id)
{
	// initialize component instance
	var newAdaptorStmt = JSCOM.String.format("new {0}()", className);
	var adaptorInstance = eval(newAdaptorStmt);
	adaptorInstance.id = id;
	this._adaptorSet[id] = adaptorInstance;

	// return initialized adaptor instance
	return adaptorInstance;
};

/**
 * Return the components and composites in the given composite.
 */
JSCOM.JSCOMRuntime.prototype.getChildrenList = function(id)
{
	return this._connectivity[id];
};



/***********************
 * Component Access API
 ***********************/

JSCOM.JSCOMRuntime.prototype.getComponent = function(id)
{
	return this._componentSet[id];
};



/***********************
 * Component Repository Access API
 ***********************/
JSCOM.JSCOMRuntime.prototype.addComponentRepo = function(protocol, baseUri)
{
	this._componentRepo = {
		protocol: protocol,
		baseUri: baseUri
	};

	return this._componentRepo;
};

JSCOM.JSCOMRuntime.prototype.removeComponentRepo = function()
{
	this._componentRepo = null;
};

JSCOM.JSCOMRuntime.prototype.getComponentRepo = function()
{
	return this._componentRepo;
};




/***********************
 * Transactional Configuration API 
 ***********************/
JSCOM.JSCOMRuntime.prototype.initTransaction = function()
{
	if (this._startTrans)
	{
		var errorMsg = JSCOM.String.format("Transactional Configuration Already Started. No Nested Transaction Allowed.");
		throw new Error(errorMsg);
	}
	else {
		this._startTrans = true;
	}
};


JSCOM.JSCOMRuntime.prototype.commit = function()
{
	if (this._startTrans)
	{
		this._startTrans = false;
		this._removeUncommittedBindings();
	}
	else {
		var errorMsg = JSCOM.String.format("No Transactional Configuration Started.");
		throw new Error(errorMsg);
	}
};



JSCOM.JSCOMRuntime.prototype.rollback = function()
{
	if (this._startTrans)
	{
		this._revertUncommittedBindings();
		this._startTrans = false;
	} 
	else {
		var errorMsg = JSCOM.String.format("No Transactional Configuration Started.");
		throw new Error(errorMsg);
	}
};


JSCOM.JSCOMRuntime.prototype._revertUncommittedBindings = function()
{
	for (var i in this._uncommittedBindings)
	{
		var uncommittedBindingUnit = this._uncommittedBindings[i];
		this._revertUncommittedBinding(uncommittedBindingUnit);
	}
};

JSCOM.JSCOMRuntime.prototype._revertUncommittedBinding = function(uncommittedBindingUnit)
{
	if (uncommittedBindingUnit.commitType === JSCOM.COMMIT_BINDING && 
		uncommittedBindingUnit.acquisitorType === JSCOM.ACQUISITOR_SINGLE)
	{
		var sourceComp = this._componentSet[uncommittedBindingUnit.sourceCompId];
		var acquisitor = sourceComp._acquisitorSet[uncommittedBindingUnit.interfaceName];
		acquisitor.ref = null;
	}

	else if (uncommittedBindingUnit.commitType === JSCOM.COMMIT_BINDING && 
		uncommittedBindingUnit.acquisitorType === JSCOM.ACQUISITOR_MULTIPLE)
	{
		var sourceComp = this._componentSet[uncommittedBindingUnit.sourceCompId];
		var targetComp = this._componentSet[uncommittedBindingUnit.targetCompId];
		var acquisitor = sourceComp._acquisitorSet[uncommittedBindingUnit.interfaceName];
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
	else if (uncommittedBindingUnit.commitType === JSCOM.COMMIT_UNBINDING &&
		uncommittedBindingUnit.acquisitorType === JSCOM.ACQUISITOR_SINGLE)
	{
		var sourceComp = this._componentSet[uncommittedBindingUnit.sourceCompId];
		var targetComp = this._componentSet[uncommittedBindingUnit.targetCompId];
		var acquisitor = sourceComp._acquisitorSet[interfaceName];
		acquisitor.ref = targetComp;
	}
	else if (uncommittedBindingUnit.commitType === JSCOM.COMMIT_UNBINDING &&
		uncommittedBindingUnit.acquisitorType === JSCOM.ACQUISITOR_MULTIPLE)
	{
		var sourceComp = this._componentSet[uncommittedBindingUnit.sourceCompId];
		var targetComp = this._componentSet[uncommittedBindingUnit.targetCompId];
		var acquisitor = sourceComp._acquisitorSet[interfaceName];
		if (!acquisitor.ref)
		{
			acquisitor.ref = [];
		}
		acquisitor.ref.push(targetComp);
	}
};

JSCOM.JSCOMRuntime.prototype._recordUncommittedBindings = function(commitType, acquisitorType, sourceCompId, targetCompId, interfaceName)
{
	var uncommittedBindingUnit = {
		commitType: commitType, 
		acquisitorType: acquisitorType,
		sourceCompId: sourceCompId,
		targetCompId: targetCompId,
		interfaceName: interfaceName		
	};

	this._uncommittedBindings.push(uncommittedBindingUnit);
};




JSCOM.JSCOMRuntime.prototype._removeUncommittedBindings = function()
{
	this._uncommittedBindings = [];
};
