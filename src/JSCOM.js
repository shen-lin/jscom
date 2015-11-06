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

/**
 * Obtain the JSCOM runtime environment. A new JSCOM runtime 
 * environment is created if it doesn' exist yet.
 * @method getJSCOMRuntime
 * @static
 * @return {JSCOMRuntime}
 */
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

// Acquisitor Type
/**
 * @property {string} ACQUISITOR_SINGLE
 * @static
 * @description Indicate acquisitor type is single.
 */
JSCOM.ACQUISITOR_SINGLE = "ACQUISITOR_SINGLE";

/**
 * @property {string} ACQUISITOR_MULTIPLE
 * @static
 * @description Indicate acquisitor type is multiple.
 */
JSCOM.ACQUISITOR_MULTIPLE = "ACQUISITOR_MULTIPLE";

// Repository Configuration Paramters
/**
 * @property {string} URI_SEPARATOR
 * @static
 * @description URI Path separator charactor.
 */
JSCOM.URI_SEPARATOR = "/";
/**
 * @property {string} ENCODE_UTF8
 * @static
 * @description Encode "utf8"
 */
JSCOM.ENCODE_UTF8 = 'utf8';

// JSCOM Entity Types
/**
 * @property {string} COMPONENT
 * @static
 * @description JSCOM entity type is component
 */
JSCOM.COMPONENT = "COMPONENT";
/**
 * @property {string} COMPOSITE
 * @static
 * @description JSCOM entity type is composite
 */
JSCOM.COMPOSITE = "COMPOSITE";
/**
 * @property {string} ADAPTOR
 * @static
 * @description JSCOM entity type is adaptor
 */
JSCOM.ADAPTOR   = "ADAPTOR";

// JSCOM Templates
JSCOM.FN_SEPARATOR = "@";
JSCOM.FN_BAK = "_jscom_bak_{0}";


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

/**
 *
 * @property {log4js.logger} LOGGER
 * @static
 * @description A JSCOM wrapper for log4js logger. It can provide all the functions of
 * a log4js logger: setLevel, trace, debug, info, warn, error, fatal.
 */
JSCOM.LOGGER = JSCOM.log4js.getLogger('normal');
JSCOM.LOGGER.setLevel('DEBUG');



/**
 * This function is to trigger asynchronous type of callback on completion of
 * a function exposed by this component's interface. This function should be
 * used in the implementation of a component class.
 * @method execCallback
 * @static
 * @param {object} context The context that callback function is executed 
   (i.e. this refers to context in the callback function)
 * @param {function} callback The callback function to be executed
 * @param {error} error The first argument passed to the callback function
 * @param {object} response The second argument passed to the callback function 
 *
 */
JSCOM.execCallback = function(context, callback, error, response)
{
	if (typeof callback === "function") {
		setImmediate(callback.bind(context), error, response);	
	}
	// Original callback is replaced by a type AFTER adaptor.
	else {
		var originalCallbackFn = callback.originalCallbackFn;
		var adaptorFn = callback.adaptorFn;
		var adaptorRef = callback.adaptorRef;
		var componentRef = context;
		adaptorFn.apply(adaptorRef, [componentRef, originalCallbackFn, error, response]);
	}
}