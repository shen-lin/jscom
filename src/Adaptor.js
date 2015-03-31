/***********************
 * @class JSCOM.Adaptor
 * @author Shen Lin
 ***********************/

 
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
JSCOM.Adaptor.Type.Introduce = "Introduce"; 

	
JSCOM.Adaptor.prototype.applyAdaptor = function(sAdaptorFn, oAdaptorType, targetFnItem) 
{
	JSCOM.LOGGER.debug("[Adaptor Fn] " + targetFnItem.className + " "+ targetFnItem.fnName);
	
	var adaptorFn = this[sAdaptorFn];
	
	if (oAdaptorType === JSCOM.Adaptor.Type.BEFORE) 
	{
		return this.applyAdaptorBefore(adaptorFn, targetFnItem);
	}
	else if (oAdaptorType === JSCOM.Adaptor.Type.AFTER) 
	{
		return this.applyAdaptorAfter(adaptorFn, targetFnItem);
	}
	else if (oAdaptorType === JSCOM.Adaptor.Type.AFTER_RETURN) 
	{
		return this.applyAdaptorAfterReturn(adaptorFn, targetFnItem);
	}
	else if (oAdaptorType === JSCOM.Adaptor.Type.AFTER_THROW) 
	{
		return this.applyAdaptorAfterThrow(adaptorFn, targetFnItem);
	}
	else if (oAdaptorType === JSCOM.Adaptor.Type.AROUND) 
	{
		return this.applyAdaptorAround(adaptorFn, targetFnItem);
	}
	else if (oAdaptorType === JSCOM.Adaptor.Type.Introduce) 
	{
		return this.applyAdaptorIntroduce(adaptorFn, targetFnItem);
	}
};


JSCOM.Adaptor.prototype.applyAdaptorBefore = function(adaptorFn, targetFnItem) 
{
	var classObj = targetFnItem.classObj;
	var className = targetFnItem.className;
	var fnName = targetFnItem.fnName;
	var thisAdaptor = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var adaptorArguments = [{
			args: arguments,
			returnVal: null
		}];
		var augmentedInputs = adaptorFn.apply(thisAdaptor, adaptorArguments);
		if (!augmentedInputs) {
			return originalFn.apply(this, arguments);
		}
		else {
			return originalFn.apply(this, augmentedInputs);
		}
	}
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
	var thisAdaptor = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var output = originalFn.apply(this, arguments);
		var adaptorArguments = {
			inputs: arguments,
			output: output
		};
		var adaptorOutput = adaptorFn.apply(thisAdaptor, adaptorArguments);
		return adaptorOutput;
	}
	classObj.prototype[fnName] = newFn;
};

/**
 * Execution depends on the success of the original function. If the original function
 * throws exception. The crosscutting function is not executed.
 */
JSCOM.Adaptor.prototype.applyAdaptorAfterReturn = function(adaptorFn, targetFnItem) 
{
	var classObj = targetFnItem.classObj;
	var className = targetFnItem.className;
	var fnName = targetFnItem.fnName;
	var thisAdaptor = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var output = originalFn.apply(this, arguments);
		var adaptorArguments = {
			inputs: arguments,
			output: output
		};
		var adaptorOutput = adaptorFn.apply(thisAdaptor, adaptorArguments);
		return adaptorOutput;
	}
	classObj.prototype[fnName] = newFn;	
};

JSCOM.Adaptor.prototype.applyAdaptorAfterThrow = function(adaptorFn, targetFnItem) 
{
	
};

JSCOM.Adaptor.prototype.applyAdaptorAround = function(adaptorFn, targetFnItem) 
{
	
};

JSCOM.Adaptor.prototype.applyAdaptorIntroduce = function(adaptorFn, targetFnItem) 
{
	
};