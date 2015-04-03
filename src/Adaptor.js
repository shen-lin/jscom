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
JSCOM.Adaptor.Type.INTRODUCE = "Introduce"; 

	
JSCOM.Adaptor.prototype.applyAdaptor = function(sAdaptorFn, oAdaptorType, targetFnItem) 
{	
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
		var augmentedInputs = adaptorFn.apply(thisAdaptorBefore, adaptorArguments);
		if (!augmentedInputs) {
			return originalFn.apply(thisComponent, arguments);
		}
		else {
			return originalFn.apply(thisComponent, augmentedInputs);
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
	var thisAdaptorAfter = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var thisComponent = this;
		var returnVal, exception;
		try {
			returnVal = originalFn.apply(thisComponent, arguments);
		} catch(error) {
			exception = error;
		}
		
		var adaptorArguments = [{
			args: arguments,
			returnVal: returnVal
		}];

		if (exception) {
			adaptorFn.apply(thisAdaptorAfter, adaptorArguments);
			throw exception;
		} else {
			return adaptorFn.apply(thisAdaptorAfter, adaptorArguments);
		}
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
	var thisAdaptorAfterReturn = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var thisComponent = this;
		var returnVal = originalFn.apply(thisComponent, arguments);
		var adaptorArguments = {
			args: arguments,
			returnVal: returnVal
		};
		var adaptorOutput = adaptorFn.apply(thisAdaptorAfterReturn, adaptorArguments);
		return adaptorOutput;
	}
	classObj.prototype[fnName] = newFn;	
};

/**
 * Only executed when an exception is thrown. The adaptor functions acts as exception handling process.
 */
JSCOM.Adaptor.prototype.applyAdaptorAfterThrow = function(adaptorFn, targetFnItem) 
{
	var classObj = targetFnItem.classObj;
	var className = targetFnItem.className;
	var fnName = targetFnItem.fnName;
	var thisAdaptorAfterThrow = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var thisComponent = this;
		var returnVal, exception;
		try {
			returnVal = originalFn.apply(thisComponent, arguments);
		} catch(error) {
			exception = error;
		}
		
		var adaptorArguments = [{
			args: arguments,
			returnVal: returnVal
		}];

		if (exception) {
			return adaptorFn.apply(thisAdaptorAfterThrow, adaptorArguments);
		} else {
			return returnVal;
		}
	}
	classObj.prototype[fnName] = newFn;
};

JSCOM.Adaptor.prototype.applyAdaptorAround = function(adaptorFn, targetFnItem) 
{
	var classObj = targetFnItem.classObj;
	var className = targetFnItem.className;
	var fnName = targetFnItem.fnName;
	var thisAdaptorAround = this;
	var originalFn = classObj.prototype[fnName];
	var newFn = function() {
		var thisComponent = this;
		var adaptorArguments = {
			args: arguments,
			originFn: originalFn
		};
		return adaptorFn.apply(thisAdaptorAround, adaptorArguments);
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