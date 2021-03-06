/**
 * JSCOM runtime environment. It provides reflective API functions to querying
 * the component framework within the JSCOM runtime environment. A JSCOM runtime
 * instance should be obtained by calling JSCOM.getJSCOMRuntime().
 * @module core
 * @class JSCOMRuntime
 */

JSCOM.JSCOMRuntime = function () {
	/* Composite and Component metadata */
	this._componentRepoSet = null;  // component repository
	this._rootCompositeSet = {};     // root level composites
	this._compositeSet = {};     // non-root level composites
	this._componentSet = {};     // loaded component instances
	this._connectivity = {};          // runtime composite and component hierarchical graph 
	this._componentClassNameSet = [];   // loaded component class types
	// Loaded interface definitions. 
	// Key is full interface name with namespace in string format. 
	// Value is an instance of JSCOM.Interface object
	this._interfaceDefSet = {};       
	
	/* Adaptor metadata */
	this._adaptorSet = {}; // loaded adaptors
	this._adaptorClassNameSet = []; // loaded adaptor class types
	this._componentInjectionMetadata = {}; // access in Component.js
	this._injectionInfo = {}; // access in Component.js
	
	/* Binding metadata */
	this._startTrans = false;
	this._uncommittedBindings = [];
	this._committedBindings = []; 

	/* Metadata of objects. Key is the namespace of object in schema */
	this._objectSchemas = {};
	/* A map of each object and related objects*/ 
	this._objectRelations = {};
};

/***********************
 * Get Entity API
 ***********************/

/**
 * Get an existing entity resides in the JSCOM runtime environment.
 * @method getEntity
 * @param {string} sId Id of the entity
 * @param {string} sType Type of the entity
 * @return {Component | Composite} Component instance or composite instance.

 	Null value is returned if no entity found.
 */ 
JSCOM.JSCOMRuntime.prototype.getEntity = function(sId, sType)
{
	if (sType === JSCOM.COMPONENT) {
		return this.getComponent(sId);
	} 
	else if (sType === JSCOM.COMPOSITE) {
		return this.getComposite(sId);
	}
	return null;
};

/**
 * Get an existing entity resides in the JSCOM runtime environment.
 * @method getEntityById
 * @param {string} sId Id of the entity
 * @return {Component | Composite} Component instance or composite instance.

 	Null value is returned if no entity found.
 */ 
JSCOM.JSCOMRuntime.prototype.getEntityById = function(sId)
{
	var oEntity = this.getComponent(sId);
	if (oEntity) {
		return oEntity;
	}
	else {
		oEntity = this.getComposite(sId);
	}
	return oEntity;
};

/***********************
 * Root Composite Access API
 ***********************/
 
/**
 * Creates a root composite instance within JSCOM runtime.
 * @method createRootComposite
 * @param  {string} sId Id of the composite instance to be created
 * @return {Composite} Instance of the created root composite.
 */ 
JSCOM.JSCOMRuntime.prototype.createRootComposite = function(sId)
{
	var composite = new JSCOM.Composite(sId, this);
	this._rootCompositeSet[sId] = composite;
	this._connectivity[sId] = [];
	return composite;
};


/**
 * Get a root composite instance by Id.
 * @method getRootComposite
 * @param  {string} sId Composite Id used to query
 * @return {Composite} Root composite instance
 */ 
JSCOM.JSCOMRuntime.prototype.getRootComposite = function(sId)
{
	return this._rootCompositeSet[sId];
};

/**
 * Get all the root composites with JSCOM runtime.
 * @method getRootCompositeSet
 * @return {map} The set of root composites as a map. Key is composite id.
 */ 
JSCOM.JSCOMRuntime.prototype.getRootCompositeSet = function()
{
	return this._rootCompositeSet;
};

/***********************
 * Composite Access API
 ***********************/
 

/**
 * Get a composite instance by Id, including root-level composites.
 * @method getComposite
 * @param  {string} sId Composite Id
 * @return {Composite} Composite instance
 */ 
JSCOM.JSCOMRuntime.prototype.getComposite = function(sId)
{
	var rootComposite = this.getRootComposite(sId);
	
	if (rootComposite) {
		return rootComposite;
	} 
	else {
		return this._compositeSet[sId];
	}
};



/***********************
 * Adaptor API 
 ***********************/
 
/**
 * Create an adaptor instance.
 * @method createAdaptor
 * @param {string} className Adaptor class name
 * @param {string} id Adaptor instance id
 */  
JSCOM.JSCOMRuntime.prototype.createAdaptor = function(className, id) 
{
	// Check duplicate ID
	this._isNewAdaptorInstance(id);
	// Check component class is new
	var isNewAdaptor = this._isNewAdaptorType(className);
	// load adaptor into runtime
	if (isNewAdaptor) {
		var sRootScopeName = JSCOM.Loader.getRootScopeName(className);
		var componentRepo = this.getComponentRepo();
		var uri = componentRepo[sRootScopeName];
		JSCOM.Loader.loadEntity(uri, className);		
	}
	// store loaded adaptors
	this._adaptorClassNameSet.push(className);
	// instantiate adaptor instance
	var adaptorInstance = this._initAdaptorInstance(className, id);
	return adaptorInstance;
};




/**
 * Apply adaptor to functions in component classes.
 *
 * @method applyAdaptor
 * @param sId {string} Id of the injection
 * @param oAdvices {array} Indicating the location of this adaptor method in the ordered list of applied adaptor methods. E.g.
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
 * @return {array} Functions that have been affected by the advices.	
 */
JSCOM.JSCOMRuntime.prototype.applyAdaptor = function(sId, oAdvices, oScope)
{
	var functions = this._findMatchingFunctions(oScope);
	this._applyAdaptorToComponents(sId, functions, oAdvices);
	this._storeAdaptorMetadata(sId, functions, oAdvices);
	return functions;
};


JSCOM.JSCOMRuntime.prototype._storeAdaptorMetadata = function(sId, functions, oAdvices) 
{
	for (var i in functions) {
		var targetFnItem = functions[i];
		var className = targetFnItem.className;
		var fnName = targetFnItem.fnName;
		// 1) componentClassName@fnName -> injection id
		var classFnName = JSCOM.String.format("{0}{1}{2}", className, JSCOM.FN_SEPARATOR, fnName);
		this._componentInjectionMetadata[classFnName] = sId; 
		// 2) injection id -> advices
		this._injectionInfo[sId] = oAdvices;
	}	
};

JSCOM.JSCOMRuntime.prototype._applyAdaptorToComponents = function(sId, functions, oAdvices) 
{	
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
	var interfaceSet = JSCOM.Component.getInterfaces(className);
	
	for (var i in interfaceSet) {
		var interfaceName = interfaceSet[i];
		var oInterface = this._interfaceDefSet[interfaceName];
		var oInterfaceDef = oInterface.definition;
		for (var fnName in oInterfaceDef) {
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
		JSCOM.Error.throwError(JSCOM.Error.AdaptorAlreadyExist, [id]);
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
 * @method getChildEntityList
 * @param {string} Id of the composite
 * @return {array} Child components and composites stored in an array. Each array element is a JSON
 * 				   object with data structure {id: sEntityId, type: [JSCOM.COMPONENT|JSCOM.COMPOSITE]}.
 */
JSCOM.JSCOMRuntime.prototype.getChildEntityList = function(sId)
{
	return this._connectivity[sId];
};



/***********************
 * Component Access API
 ***********************/

/**
 * Get component instance by component id
 * @method getComponent
 * @param {string} id Component Id
 * @return {Component} Component instance
 */
JSCOM.JSCOMRuntime.prototype.getComponent = function(id)
{
	return this._componentSet[id];
};


/***********************
 * Object Model Access API
 ***********************/
 /**
  * Load object schema and instantiate the objects defined in the schema
  * @method loadObjectSchema
  * @param {string} schemaUri Namespace of this schema
  * @return {boolean} If the component repository is added successfully
  */ 
JSCOM.JSCOMRuntime.prototype.loadObjectSchema = function(baseUri, schemaUri)
{
	// store the schema
	var bHasSchema = this._objectSchemas[schemaUri];
	if (bHasSchema) {
		return;
	}

	// load schema file
	var sSchemaContent = JSCOM.Loader.loadRawContent(baseUri, schemaUri);
	var oSchema = JSON.parse(sSchemaContent);
	this._objectSchemas[schemaUri] = oSchema;

	// instantiate objects in the schema
	for (var sObjectName in oSchema) {
		var oObjectModel = oSchema[sObjectName];
		this._initObjectModel(schemaUri, sObjectName, oObjectModel);
		this._buildObjectRelations(schemaUri, sObjectName, oObjectModel, oSchema);
	}
};

/**
 * Builds a map from each object type in the schema onto the related
 * object types.
 */
JSCOM.JSCOMRuntime.prototype._buildObjectRelations = 
	function(namespace, objectName, objectModel, oSchema)
{
	var oRelatedObjects = {};
	var sObjectFullName = namespace + "." + objectName;
	var oProperties = objectModel.properties;
	for (var sPropertyName in oProperties) {
		var oPropertyInfo = oProperties[sPropertyName];

		if (oPropertyInfo.type && oSchema[oPropertyInfo.type]) {
			var sRelatedObjectFullName = namespace + "." + oPropertyInfo.type;
			oRelatedObjects[sRelatedObjectFullName] = "single";
		}
		else if (oPropertyInfo.type && 
			oPropertyInfo.type === "collection" && 
			oPropertyInfo.itemType &&
			oSchema[oPropertyInfo.itemType]) 
		{
			var sRelatedObjectFullName = namespace + "." + oPropertyInfo.itemType;
			oRelatedObjects[sRelatedObjectFullName] = "collection";
		}
	}

	this._objectRelations[sObjectFullName] = oRelatedObjects;
};	

/**
 * Creates object class for the object types in the schema.
 */
JSCOM.JSCOMRuntime.prototype._initObjectModel = 
	function(namespace, objectName, objectModel)
{

	if (!JSCOM.objects[namespace]) {
		JSCOM.Loader.declareScope("JSCOM.objects." + namespace + "." + objectName);
	}

	var objectClassScope = eval("JSCOM.objects." + namespace);
	objectClassScope[objectName] = function() {
		var i = 0;
		var oObjectModelInstance = this;

		for (var sPropertyName in objectModel.properties) {
			var oProperty = objectModel.properties[sPropertyName];
			var sPropertyType = oProperty.type;

			var getter = function() {
				var sInvokedPropertyName = this;
		    	return oObjectModelInstance["_" + sInvokedPropertyName]; 
		    };

			var setter = function(value) { 
				var sInvokedPropertyName = this;
				var oInvokedProperty = objectModel.properties[sInvokedPropertyName];
				var sInvokedPropertyType = oInvokedProperty.type;
				// validate input value type
				// ...
				
				// set value
			    oObjectModelInstance["_" + sInvokedPropertyName] = value;
			}

			Object.defineProperty(oObjectModelInstance, sPropertyName, {
			    get: getter.bind(sPropertyName),
			    set: setter.bind(sPropertyName)
			});

			oObjectModelInstance[sPropertyName] = arguments[i];
			i++;
		}
	};
};

/**
 * Get object definition in a given schema
 * @method getObjectMetadata
 * @param {string} schemaUri Fullname of the schema.
 * @return {object} Object definition metadata
 */ 
JSCOM.JSCOMRuntime.prototype.getSchemaMetadata = 
	function(schemaUri)
{
	return this._objectSchemas[schemaUri];
}


/**
 * Get all the related objects of the input object.
 * @method getSchemaObjectRelation
 * @param {string} schemaUri Fullname of the schema.
 * @param {string} objectName Object class name.
 * @return {object} A map of related objects 
 */ 
JSCOM.JSCOMRuntime.prototype.getSchemaObjectRelation = 
	function(schemaUri, objectName)
{
	var sObjectFullName = schemaUri + "." + objectName;
	return this._objectRelations[sObjectFullName];
}


/***********************
 * Component Repository Access API
 ***********************/

/**
 * Create component repository
 * @method addComponentRepo
 * @param {string} baseUri Base URI of the component repository
 * @param {string} rootScopeName The first-level name on the component's namespace.
 	E.g. If components from the repository has pattern "JSCOM.**.MyComponent", 
 	rootScopeName should be set to "JSCOM".
 	It is used to identify the repository when loading a component.
 * @return {boolean} If the component repository is added successfully
 */ 
JSCOM.JSCOMRuntime.prototype.addComponentRepo = function(baseUri, rootScopeName)
{
	if (!this._componentRepoSet) {
		this._componentRepoSet = {};
	}
	this._componentRepoSet[rootScopeName] = baseUri;
	return true;
};

/**
 * Remove component repository. Set component repository to null.
 * @method removeComponentRepo
 */ 
JSCOM.JSCOMRuntime.prototype.removeComponentRepo = function()
{
	this._componentRepoSet = null;
};

/**
 * Get component repository configuration information.
 * @method getComponentRepo
 * @return {object} Component repository set as key value pairs.
 */ 
JSCOM.JSCOMRuntime.prototype.getComponentRepo = function()
{
	return this._componentRepoSet;
};

/**
 * List the folders and components in the component repository. 
 * @method listRepoComponents
 * @param sRootScopeName {string} Identify the component repository to query.
 * @param sRepoPath {string} Repository path. Use "/" as the root path to start component
   	repository exploration.
 * @return {array} A list of string items. Each item is the name of folders or 
 	component names in the repository
 */
JSCOM.JSCOMRuntime.prototype.listRepoComponents = function(sRootScopeName, sRepoPath)
{
	var sUri = this._componentRepoSet[sRootScopeName];
	return JSCOM.Loader.listRepo(sUri, sRepoPath);
};


/***********************
 * Transactional Configuration API 
 ***********************/
 
/**
 * Start transactional phase of bindings and unbindings.
 * @method initTransaction
 */ 
JSCOM.JSCOMRuntime.prototype.initTransaction = function()
{
	if (this._startTrans)
	{
		JSCOM.Error.throwError(JSCOM.Error.TransactionAlreadyStarted);
	}
	else {
		this._startTrans = true;
	}
};

/**
 * Commit the bindings and unbindings of a transactional phase.
 * @method commit
 * @throws JSCOM.Error.NotTransactionStarted
 */ 
JSCOM.JSCOMRuntime.prototype.commit = function()
{
	if (this._startTrans)
	{
		this._startTrans = false;
		this._commitBindings();
		this._removeUncommittedBindings();
	}
	else {
		JSCOM.Error.throwError(JSCOM.Error.NotTransactionStarted);
	}
};


/**
 * Commit the bindings and unbindings of a transactional phase.
 * @method rollback
 * @throws JSCOM.Error.NotTransactionStarted
 */ 
JSCOM.JSCOMRuntime.prototype.rollback = function()
{
	if (this._startTrans)
	{
		this._revertUncommittedBindings();
		this._removeUncommittedBindings();
		this._startTrans = false;
	} 
	else {
		JSCOM.Error.throwError(JSCOM.Error.NotTransactionStarted);
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
	}

	else if (uncommittedBindingUnit.commitType === JSCOM.COMMIT_BINDING && 
		uncommittedBindingUnit.acquisitorType === JSCOM.ACQUISITOR_MULTIPLE)
	{
		var sourceComp = this._componentSet[uncommittedBindingUnit.sourceCompId];
		var targetComp = this._componentSet[uncommittedBindingUnit.targetCompId];
	}
	else if (uncommittedBindingUnit.commitType === JSCOM.COMMIT_UNBINDING &&
		uncommittedBindingUnit.acquisitorType === JSCOM.ACQUISITOR_SINGLE)
	{
		var sourceComp = this._componentSet[uncommittedBindingUnit.sourceCompId];
		var targetComp = this._componentSet[uncommittedBindingUnit.targetCompId];
	}
	else if (uncommittedBindingUnit.commitType === JSCOM.COMMIT_UNBINDING &&
		uncommittedBindingUnit.acquisitorType === JSCOM.ACQUISITOR_MULTIPLE)
	{
		var sourceComp = this._componentSet[uncommittedBindingUnit.sourceCompId];
		var targetComp = this._componentSet[uncommittedBindingUnit.targetCompId];
	}
};

JSCOM.JSCOMRuntime.prototype._recordBinding = function(commitType, acquisitorType, sourceCompId, targetCompId, interfaceName)
{
	if (this._startTrans) 
	{
		this._recordUncommittedBinding(commitType, acquisitorType, 
			sourceCompId, targetCompId, interfaceName);
	}
	else 
	{
		this._recordCommittedBinding(commitType, acquisitorType, 
			sourceCompId, targetCompId, interfaceName);
	}
};

JSCOM.JSCOMRuntime.prototype._recordCommittedBinding = function(commitType, acquisitorType, sourceCompId, targetCompId, interfaceName)
{
	if (commitType === JSCOM.COMMIT_BINDING) {
		var record = {
			source: sourceCompId,
			target: targetCompId,
			interface: interfaceName,
			type: acquisitorType
		};
		this._committedBindings.push(record);
	}
	else if (commitType === JSCOM.COMMIT_UNBINDING) {
		for (var i in this._committedBindings) {
			var record = this._committedBindings[i];
			if (record.source === sourceCompId && 
				record.target === targetCompId &&
				record.interface === interfaceName &&
				record.type === acquisitorType) 
			{
				this._committedBindings.splice(i, 1);	
			}
		}
	}
};

JSCOM.JSCOMRuntime.prototype._recordUncommittedBinding = function(commitType, acquisitorType, sourceCompId, targetCompId, interfaceName)
{
	if(!this._startTrans) return;
	
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

JSCOM.JSCOMRuntime.prototype._commitBindings = function()
{
	for (var i in this._uncommittedBindings) {
		var oUncommittedBidningUnit = this._uncommittedBindings[i];
		var commitType = oUncommittedBidningUnit.commitType;
		var acquisitorType = oUncommittedBidningUnit.acquisitorType;
		var sourceCompId = oUncommittedBidningUnit.sourceCompId;
		var targetCompId = oUncommittedBidningUnit.targetCompId;
		var interfaceName = oUncommittedBidningUnit.interfaceName;

		this._recordBinding(commitType, acquisitorType, sourceCompId, targetCompId, interfaceName);
	}
};

/**
 * Filter the input bindings that contain the matching property and value.
 * @param {array} aBindings
 * @param {string} sSearchProperty
 * @param {string} sSearchValue
 * @return {array}
 */ 
JSCOM.JSCOMRuntime.prototype._getBoundEntities = function(aBindings, sSearchProperty, sSearchValue)
{
	var aBoundEntities = [];
	for (var i in aBindings) {
		var record = aBindings[i];
		if (sSearchValue === record[sSearchProperty]) {
			aBoundEntities.push(record);
		}
	}
	return aBoundEntities;
};



/***********************
 * Get interface detail for a give interface name.
 * @method getInterface
 * @param {string} sInterfaceName Name of interface
 * @return {Interface} Interface details.
 ***********************/ 
JSCOM.JSCOMRuntime.prototype.getInterface = function(sInterfaceName)
{
	var oInterface = this._interfaceDefSet[sInterfaceName];
	return oInterface;
};