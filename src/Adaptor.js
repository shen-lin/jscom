/**
 * Adaptor can be used to modify the behaviour of existing interface methods.
 * Adaptor class should be extended to implement concrete adaptor instances.
 * An adaptor instance should be created by calling the createAdaptor function
 * on the JSCOMRuntime instance.
 * 
 * @module core
 * @class Adaptor
 *
 */

 
JSCOM.Adaptor = function()
{
	this.id = null;
};

/**
 * @property {object} Type
 * @static
 * @description A set of adaptor types
 */
JSCOM.Adaptor.Type = {};
/**
 * @property {string} Type.BEFORE
 * @static
 * @description Adaptor type to be executed before target function
 */
JSCOM.Adaptor.Type.BEFORE = "Before";
/**
 * @property {string} Type.AFTER
 * @static
 * @description Adaptor type to be executed after target function
 */
JSCOM.Adaptor.Type.AFTER = "After";
/**
 * @property {string} Type.INTRODUCE
 * @static
 * @description Adaptor type to replace the original function
 */
JSCOM.Adaptor.Type.INTRODUCE = "Introduce"; 

/**
 * This method is called in JSCOMRuntime, not exposed as API.
 * @private
 * @method applyAdaptor
 * @param {string} adaptorFnName Name of the function implemented in the adaptor class
 * @param {string} adaptorType Type of the adaptor
 * @param {object} targetFnItem Detailed information about component class 
 				   and function to be modified by adaptor:
 		@param {object} targetFnItem.classObj Component class object 
 		@param {string} targetFnItem.className Name of component class to be modified by adaptor function
 		@param {string} targetFnItem.fnName Name of function to be modified by adaptor function
 */	
JSCOM.Adaptor.prototype.applyAdaptor = function(adaptorFnName, adaptorType, targetFnItem) 
{	
	var adaptorFn = this[adaptorFnName];
	if (!adaptorFn) {
		JSCOM.Error.throwError(JSCOM.Error.IncompleteAdaptor, [this.id, adaptorFnName]);
	}
	
	if (adaptorType === JSCOM.Adaptor.Type.BEFORE) 
	{
		this._applyAdaptorBefore(adaptorFn, targetFnItem);
	}
	else if (adaptorType === JSCOM.Adaptor.Type.AFTER) 
	{
		this._applyAdaptorAfter(adaptorFn, targetFnItem);
	}
	else if (adaptorType === JSCOM.Adaptor.Type.INTRODUCE) 
	{
		this._applyAdaptorIntroduce(adaptorFn, targetFnItem);
	}
};


JSCOM.Adaptor.prototype._applyAdaptorBefore = function(adaptorFn, targetFnItem) 
{
	var classObj = targetFnItem.classObj;
	var className = targetFnItem.className;
	var fnName = targetFnItem.fnName;
	var thisAdaptorBefore = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var thisComponent = this;
		var adaptorArguments = [{
			args: arguments,
			returnVal: null,
			context: thisComponent
		}];
		// Require callback function always presented in the last index of arguments
		var originalCallbackFn = arguments[arguments.length - 1];
		var augmentedInputs;
		try {
			augmentedInputs	= adaptorFn.apply(thisAdaptorBefore, adaptorArguments);
			if (!augmentedInputs) {
				originalFn.apply(thisComponent, arguments);
			}
			else {
				originalFn.apply(thisComponent, augmentedInputs);
			}
		}
		catch(error) {
			JSCOM.execCallback(thisComponent, originalCallbackFn, error, null);
		}
	};
	
	classObj.prototype[fnName] = newFn;
};

/**
 * Crosscutting function is always executed, before exiting the control flow of
 * the original function (I.e. before return / exception handling).
 */
JSCOM.Adaptor.prototype._applyAdaptorAfter = function(adaptorFn, targetFnItem) 
{
	var classObj = targetFnItem.classObj;
	var className = targetFnItem.className;
	var fnName = targetFnItem.fnName;
	var thisAdaptorAfter = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var thisComponent = this;
		var returnVal, exception;
		
		// Call adaptor function after executing the original function
		// Doing so by passing adaptor function as the callback function to original function.
		var originalCallbackFn = arguments[arguments.length - 1];
		var lastArg = {
			originalCallbackFn: originalCallbackFn,
			adaptorFn: adaptorFn,
			adaptorRef: thisAdaptorAfter
		};
		
		var args = [];
		for (var i = 0; i < arguments.length - 1; i++) {
			args.push(arguments[i]);
		}
		args[arguments.length - 1] = lastArg;
		originalFn.apply(thisComponent, args);
	}
	classObj.prototype[fnName] = newFn;
};



JSCOM.Adaptor.prototype._applyAdaptorIntroduce = function(adaptorFn, targetFnItem) 
{
	var classObj = targetFnItem.classObj;
	var className = targetFnItem.className;
	var fnName = targetFnItem.fnName;
	var thisAdaptorIntroduce = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var thisComponent = this;
		var adaptorArguments = [{
			args: arguments,
			returnVal: null,
			context: thisComponent
		}];
		adaptorFn.apply(thisAdaptorIntroduce, adaptorArguments);
	}
	classObj.prototype[fnName] = newFn;		
};