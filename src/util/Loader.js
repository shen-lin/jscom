/**
 * Loader for JSCOM entities
 * 
 * @module util
 * @class Loader
 * @static
 */
JSCOM.Loader = JSCOM.Loader || {};

/**
 * Load component or adaptor. 
 * @method loadEntity
 * @param  {string} componentRepo       description
 * @param  {string} className       description
 * @return {string}            Formatted string result.
 * @throw 
 * @static
 */ 
JSCOM.Loader.loadEntity = function(componentRepo, className)
{
	JSCOM.Loader.declare(className);
	
	// preloaded buildin entities
	var isBuildin = JSCOM.Loader.isBuildInType(className);
	if (isBuildin) return;
	
	try
	{	
		var rawContent = JSCOM.Loader.loadRawContent(componentRepo, className);
		eval(rawContent);
	}
	catch (error)
	{
		var errorMsg = JSCOM.String.format("Error loading component/adaptor from {0}:\n{1}", className, error);
		JSCOM.LOGGER.error(errorMsg);
	}
};

/**
 * Convert package name to URI path. 
 * @method declare
 * @param  {string} componentRepo       description
 * @param  {string} packageName       description
 * @return {string}            Formatted string result.
 * @throw 
 * @static
 */ 
JSCOM.Loader.declare = function(packageName)
{
	var pathTokens = packageName.split(".");
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