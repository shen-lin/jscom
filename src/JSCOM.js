/**
 * Entry point for JSCOM. It defines JSCOM global variables and declares NodeJS module exports for JSCOM.
 * @module core
 * @class JSCOM
 */

var JSCOM = {};

exports.getJSCOM = function() {
	return JSCOM;
};

JSCOM._jscomRt = null;

JSCOM.getJSCOMRuntime = function() {
	if (JSCOM._jscomRt) {
		return JSCOM._jscomRt;
	}
	JSCOM._jscomRt = new JSCOM.JSCOMRuntime();
	return JSCOM._jscomRt;
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


// Build-in events and channels
JSCOM.eventUri = JSCOM.eventUri || {};
JSCOM.eventUri.SEPARATOR = "@";
JSCOM.eventUri.ComponentInterfaceChannel = "JSCOM.channel.ComponentInterface";
JSCOM.eventUri.EventIDFormat = "{0}.{1}.{2}.{3}"; // ComponentName.InstanceId.InterfaceName.FnName


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