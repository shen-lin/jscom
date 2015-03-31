JSCOM.fs = JSCOM.fs || require("fs")

JSCOM.Loader = {};

JSCOM.Loader.loadComponent = function(componentRepo, packageName)
{
	JSCOM.Loader.buildPackagePath(packageName);
	try
	{	
		var rawContent = JSCOM.Loader.loadRawContent(componentRepo, packageName);
		eval(rawContent);
	}
	catch (error)
	{
		var errorMsg = JSCOM.String.format("Error loading component/adaptor from {0}:\n{1}", packageName, error);
		JSCOM.LOGGER.error(errorMsg);
	}
};


JSCOM.Loader.buildPackagePath = function(packageName)
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
		JSCOM.LOGGER.error("Error loading " + "file" + " " + uri);
	}
	
	return rawComp;
};


JSCOM.Loader.loadRawContentFromHttp = function(uri)
{
	throw new Error("Not Implemented");
};