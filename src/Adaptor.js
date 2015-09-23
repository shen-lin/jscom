/**
 * Adaptor can be used to modify the behaviour of existing interface methods.
 * 
 * @module core
 * @class Adaptor
 *
 */

 
JSCOM.Adaptor = function()
{
	this.id = null;
};

JSCOM.Adaptor.Type = {};
JSCOM.Adaptor.Type.BEFORE = "Before";
JSCOM.Adaptor.Type.AFTER = "After";
JSCOM.Adaptor.Type.AFTER_RETURN = "AfterReturn";
JSCOM.Adaptor.Type.AFTER_THROW = "AfterThrow";
JSCOM.Adaptor.Type.AROUND = "Around";
JSCOM.Adaptor.Type.INTRODUCE = "Introduce"; 

	
JSCOM.Adaptor.prototype.applyAdaptor = function(sAdaptorFn, oAdaptorType, targetFnItem) 
{	
	var adaptorFn = this[sAdaptorFn];
	if (!adaptorFn) {
		JSCOM.Error.throwError(JSCOM.Error.IncompleteAdaptor, [this.id, sAdaptorFn]);
	}
	
	if (oAdaptorType === JSCOM.Adaptor.Type.BEFORE) 
	{
		return this.applyAdaptorBefore(adaptorFn, targetFnItem);
	}
	else if (oAdaptorType === JSCOM.Adaptor.Type.AFTER) 
	{
		return this.applyAdaptorAfter(adaptorFn, targetFnItem);
	}
	else if (oAdaptorType === JSCOM.Adaptor.Type.INTRODUCE) 
	{
		return this.applyAdaptorIntroduce(adaptorFn, targetFnItem);
	}
};


JSCOM.Adaptor.prototype.applyAdaptorBefore = function(adaptorFn, targetFnItem) 
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
			returnVal: null
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
JSCOM.Adaptor.prototype.applyAdaptorAfter = function(adaptorFn, targetFnItem) 
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
		
		var args = []
		for (var i = 0; i < arguments.length - 1; i++) {
			args.push(arguments[i]);
		}
		args[arguments.length - 1] = lastArg;
		originalFn.apply(thisComponent, args);
	}
	classObj.prototype[fnName] = newFn;
};



JSCOM.Adaptor.prototype.applyAdaptorIntroduce = function(adaptorFn, targetFnItem) 
{
	var classObj = targetFnItem.classObj;
	var className = targetFnItem.className;
	var fnName = targetFnItem.fnName;
	var thisAdaptorIntroduce = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var thisComponent = this;
		var adaptorArguments = {
			args: arguments
		};
		return adaptorFn.apply(thisAdaptorIntroduce, adaptorArguments);
	}
	classObj.prototype[fnName] = newFn;		
};