/**
 * Entry point for JSCOM. It defines JSCOM global variables and declares NodeJS module exports for JSCOM.
 * @module core
 * @class JSCOM
 */

var JSCOM = {};

exports.getJSCOMRuntime = function() {
	var jscomRt =  new JSCOM.JSCOMRuntime();
	return jscomRt;
};

exports.getJSCOMGlobal = function() {
	return JSCOM;
};


// Commit Type
JSCOM.COMMIT_BINDING  = "COMMIT_BINDING";
JSCOM.COMMIT_UNBINDING  = "COMMIT_UNBINDING";

// Acquisitor Types
JSCOM.ACQUISITOR_SINGLE = "RECEPTACLE_SINGLE";
JSCOM.ACQUISITOR_MULTIPLE = "RECEPTACLE_MULTIPLE";

// Repository Configuration Paramters
JSCOM.URI_SEPARATOR = "/";
JSCOM.URI_FILE = "file";
JSCOM.URI_HTTP = "http";
JSCOM.ENCODE_UTF8 = 'utf8';

// JSCOM Entity Types
JSCOM.COMPONENT = "COMPONENT";
JSCOM.COMPOSITE = "COMPOSITE";
JSCOM.ADAPTOR   = "ADAPTOR";

// JSCOM Templates
JSCOM.FN_SEPARATOR = "@";
JSCOM.FN_BAK = "_jscom_bak_{0}";
JSCOM.GLOBAL_EVENTID_SEPARATOR = "_";


// JSCOM Logger
JSCOM.log4js = JSCOM.log4js || require('log4js');
JSCOM.log4js.configure({
	appenders: [
		{ type: 'console' },
		{
		  type: 'file', 
		  filename: 'logs/JSCOM.log', 
		  maxLogSize: 1024,
		  backups: 1,
		  category: 'normal' 
		}
	]
});

JSCOM.LOGGER = JSCOM.log4js.getLogger('normal');
JSCOM.LOGGER.setLevel('DEBUG');

// require 3rd party libraries
JSCOM.require = function(libName) {
	JSCOM.LOGGER.info("Load third party library: " + libName);
	JSCOM[libName] = JSCOM[libName] || require(libName);
};
