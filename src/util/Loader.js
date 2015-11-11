/**
 * Loader for JSCOM entities
 * 
 * @module util
 * @class Loader
 * @static
 */
JSCOM.Loader = JSCOM.Loader || {};

/****************************************
 * API methods
 ****************************************/
JSCOM.Loader.declare = function(oDeclaration)
{	
	
	if (oDeclaration.component) {
		JSCOM.Loader._declareComponent(oDeclaration);
	}

	else if (oDeclaration.obj) {

	}
}; 


JSCOM.Loader._declareComponent = function(oDeclaration)
{	
	var sComponentClassName = oDeclaration.component;
	var sSuperComponentClassName = oDeclaration.extend;
	
	// Create the scope for the component namespace
	JSCOM.Loader._declare(sComponentClassName);

	// Load ancestors
	if (sSuperComponentClassName !== "JSCOM.Component" &&
		sSuperComponentClassName !== "JSCOM.Adaptor") {
		var sRootScopeName = JSCOM.Loader.getRootScopeName(sSuperComponentClassName);
		var sComponentRepo = JSCOM._jscomRt.getComponentRepo();
		var uri = sComponentRepo[sRootScopeName];
		JSCOM.Loader.loadEntity(uri, sSuperComponentClassName);
	}
	
	// Initialize constructor and inheritance
	var sStmt_1 = JSCOM.String.format("{0} = function() {{1}.call(this);};", 
		sComponentClassName, sSuperComponentClassName);
	var sStmt_2 = JSCOM.String.format("{0}.prototype = new {1}();", 
		sComponentClassName, sSuperComponentClassName);
	var sStmt_3 = JSCOM.String.format("{0}.prototype.constructor = {0};", 
		sComponentClassName);
	var sStmt_4 = JSCOM.String.format("{0}.parent = '{1}';", 
		sComponentClassName, sSuperComponentClassName);
		
	eval(sStmt_1);
	eval(sStmt_2);
	eval(sStmt_3);
	eval(sStmt_4);

	// Set interfaces, acquisitors, and objects lists.
	var oCurrentComponentScope = eval(sComponentClassName);
	oCurrentComponentScope.interfaces = oDeclaration.interfaces;
	oCurrentComponentScope.acquisitors = oDeclaration.acquisitors;
	oCurrentComponentScope.objects = oDeclaration.objects;
}; 


JSCOM.Loader._initComponentInterfaceSet = function(sClassName)
{
	var aInterfaces = JSCOM.Component.getInterfaces(sClassName);
	for (var i in aInterfaces)
	{
		var sInterfaceName = aInterfaces[i];
		this._loadRawInterface(sInterfaceName);
	}
};


JSCOM.Loader._loadRawInterface = function(sInterfaceName)
{
	// Skip interfaces that already added
	if (JSCOM._jscomRt._interfaceDefSet[sInterfaceName]) return;
	var sRootScopeName = JSCOM.Loader.getRootScopeName(sInterfaceName);
	var componentRepo = JSCOM._jscomRt.getComponentRepo();
	var uri = componentRepo[sRootScopeName];
	var interfaceRawContent = JSCOM.Loader.loadRawContent(uri, sInterfaceName);
	var oInterfaceDef = JSON.parse(interfaceRawContent);
	var oInterface = new JSCOM.Interface(sInterfaceName, oInterfaceDef);
	JSCOM._jscomRt._interfaceDefSet[sInterfaceName] = oInterface;
};


JSCOM.Loader._checkInterfaceMethods = function(sClassName)
{
	var aInterfaces = JSCOM.Component.getInterfaces(sClassName);
	var oPrototype = eval(sClassName + ".prototype");

	for (var i in aInterfaces) {
		var sInterfaceName = aInterfaces[i];
		var oInterface = JSCOM._jscomRt._interfaceDefSet[sInterfaceName];
		var oInterfaceDef = oInterface.definition;
		this._checkInterfaceMethod(sClassName, sInterfaceName, oInterfaceDef, oPrototype);
	}
};

JSCOM.Loader._checkInterfaceMethod = function(sClassName, sInterfaceName, oInterfaceDef, oPrototype)
{
	for (var sFnName in oInterfaceDef) {
		if (!oPrototype[sFnName]) {
			JSCOM.Error.throwError(JSCOM.Error.FunctionNotImplemented, 
				[sInterfaceName, sFnName, sClassName]);
		}
	}
};


JSCOM.Loader._backupInterfaceMethods = function(sClassName)
{	
	var oPrototype = eval(sClassName + ".prototype");
	var aInterfaces = JSCOM.Component.getInterfaces(sClassName);
	for (var i in aInterfaces)
	{
		var sInterfaceName = aInterfaces[i];
		var oInterface = JSCOM._jscomRt._interfaceDefSet[sInterfaceName];
		var oInterfaceDef = oInterface.definition;
		for (var fnName in oInterfaceDef) {
			var backupFnName = JSCOM.String.format(JSCOM.FN_BAK, fnName);
			oPrototype[backupFnName] = oPrototype[fnName];
		}
	}
};


/**
 * Require 3rd party libraries
 * @method require
 * @static
 */
JSCOM.Loader.require = function(libName) {
	JSCOM.LOGGER.info("Load third party library: " + libName);
	JSCOM[libName] = JSCOM[libName] || require(libName);
};

/****************************************
 * Private methods
 ****************************************/

/**
 * Convert package name to JS scopes if the scope doesn't exist yet. 
 * <p>@throws</p>
 * @method declare
 * @param  {string} sClassName Component class name
 * @static
 */ 
JSCOM.Loader._declare = function(sClassName)
{
	var pathTokens = sClassName.split(".");
	var incrementPath = "";
	for (var i = 0; i < pathTokens.length - 1; i++)
	{
		var tokenName = pathTokens[i];
		if (i == 0)
		{
			incrementPath = tokenName;
		}
		else 
		{
			incrementPath = incrementPath + "." + tokenName;
		}

		var expr = JSCOM.String.format("if(typeof({0}) === 'undefined') {0}= {};", incrementPath);
		eval(expr);
	}
};


/**
 * @param {string} className Component name with full namespace path.
 * @return {string} Root scope name in the input component name
 */ 
JSCOM.Loader.getRootScopeName = function(className)
{
	var aPaths = className.split(".");
	return aPaths[0];
};


/**
 * Load component or adaptor. 
 * <p>@throws JSCOM.EntityLoadingError</p>
 * @private
 * @param  {string} uri Base URI
 * @param  {string} className Full component name with namespace.
 * @static
 */ 
JSCOM.Loader.loadEntity = function(uri, className)
{	
	var componentUri = JSCOM.Loader.convertPackagePath(uri, className);

	try
	{	
		require(componentUri);
	}
	catch (error)
	{
		JSCOM.Error.throwError(JSCOM.Error.EntityLoadingError, [className], error);
	}
};



/**
 * Load raw source code content of the component JS file. 
 * <p>@throws</p>
 * @private
 * @param  {string} baseUri description
 * @param  {string} packagePath description
 * @return {string} Source code content of the loaded component.
 * @static
 */ 
JSCOM.Loader.loadRawContent = function(baseUri, packagePath)
{
	var uri = JSCOM.Loader.convertPackagePath(baseUri, packagePath);
	var rawContent = JSCOM.Loader.loadRawContentFromFile(uri);
	return rawContent;
};


JSCOM.Loader.convertPackagePath = function(baseUri, packagePath)
{
	var relativeUri = packagePath.replace(/\./g, JSCOM.URI_SEPARATOR);
	var baseUriLastChar = baseUri.substring(baseUri.length);
	var uri;
	
	if (baseUri === ".")
	{
		uri = JSCOM.String.format("{0}.js", relativeUri);
	}
	else if (baseUriLastChar === JSCOM.URI_SEPARATOR)
	{
		uri = JSCOM.String.format("{0}{1}.js", baseUri, relativeUri);
	}
	else {
		uri = JSCOM.String.format("{0}/{1}.js", baseUri, relativeUri);
	}

	return uri;
};



JSCOM.Loader.loadRawContentFromFile = function(uri)
{
	var rawComp = null;
	try
	{
		rawComp = JSCOM.fs.readFileSync(uri, JSCOM.ENCODE_UTF8);
	}
	catch (err)
	{
		JSCOM.LOGGER.error("Error loading file: " + uri);
	}
	
	return rawComp;
};



JSCOM.Loader.listRepo = function(uri, sPath)
{
	return JSCOM.Loader.listRepoFromFile(uri, sPath);
};

JSCOM.Loader.listRepoFromFile = function(uri, sPath)
{
	var sRepoPath = uri + sPath;
	return JSCOM.fs.readdirSync(sRepoPath);
}
