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
	var sComponentClassName = oDeclaration.component;
	var sSuperComponentClassName = oDeclaration.extend;
	
	JSCOM.Loader._declare(sComponentClassName);
	
	// Load ancestors
	var bIsBuildInParent = JSCOM.Loader.isBuildInType(sSuperComponentClassName);
	if (!bIsBuildInParent) {
		var sComponentRepo = JSCOM._jscomRt.getComponentRepo();
		JSCOM.Loader.loadEntity(sComponentRepo, sSuperComponentClassName);
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
 * Convert package name to URI path. 
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
 * Load component or adaptor. 
 * <p>@throws JSCOM.EntityLoadingError</p>
 * @private
 * @param  {string} componentRepo description
 * @param  {string} className description
 * @static
 */ 
JSCOM.Loader.loadEntity = function(componentRepo, className)
{
	// skip preloaded build-in entities
	var isBuildin = JSCOM.Loader.isBuildInType(className);
	if (isBuildin) return;
	
	try
	{	
		var rawContent = JSCOM.Loader.loadRawContent(componentRepo, className);
		eval(rawContent);
	}
	catch (error)
	{
		JSCOM.Error.throwError(JSCOM.Error.EntityLoadingError, [className]);
	}
};



/**
 * Load raw source code content of the component JS file. 
 * <p>@throws</p>
 * @private
 * @param  {string} componentRepo description
 * @param  {string} packagePath description
 * @return {string} Source code content of the loaded component.
 * @static
 */ 
JSCOM.Loader.loadRawContent = function(componentRepo, packagePath)
{
	var protocol = componentRepo.protocol;
	var baseUri = componentRepo.baseUri;

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
	
	var rawContent = null;
	if (protocol === JSCOM.URI_FILE)
	{
		rawContent = JSCOM.Loader.loadRawContentFromFile(uri);
	}	
	else if (protocol === JSCOM.URI_HTTP)
	{
		rawContent = JSCOM.Loader.loadRawContentFromHttp(uri);
	}
	return rawContent;
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


JSCOM.Loader.loadRawContentFromHttp = function(uri)
{
	throw new Error("Not Implemented");
};


JSCOM.Loader.isBuildInType = function(className)
{
	return JSCOM.String.startWith(className, "JSCOM");	
};