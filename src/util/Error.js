/**
 * Exception handling utilities
 * 
 * @module util
 * @class Error
 * @static
 */

JSCOM.Error = {
	CompositeAlreadyExist: {
		code: 100,
		desc: "Composite {0} already exists"
	},
	FunctionNotImplemented: {
		code: 101,
		desc: "Interface {0}, Function {1} is not implemented in Component {2}"
	},
	ComponentAlreadyExist: {
		code: 102,
		desc: "Component {0} already exists"
	},
	DuplicateInterfacesWithinComposite: {
		code: 103,
		desc: "Duplicate component interfaces are found within composite {1}"
	},
	UndefinedAcquisitorType: {
		code: 104,
		desc: "Undefined Acquisitor Type: {0}"
	},
	ChildNotExist: {
		code: 105,
		desc: "Entity {0} does not exist in composite {1}"
	},
	BindingFailureAcquisitor: {
		code: 106,
		desc: "Binding Failure: Component {0} does not have acquisitor {1}"
	},
	BindingFailureInterface: {
		code: 107,
		desc: "Binding Failure: Component {0} does not have interface {1}"
	},
	EntityLoadingError: {
		code: 108,
		desc: "Error loading component/adaptor from {0}"
	},
	TransactionAlreadyStarted: {
		code: 109,
		desc: "A transactional phase already started. No nested transaction allowed."
	},
	NotTransactionStarted: {
		code: 110,
		desc: "No transactional phase need to be committed."
	},
	NotImplemented: {
		code: 111,
		desc: "Not Implemented"
	},
};



/**
 * Throw an JSCOM error. 
 * @method throwError
 * @param  {object} oError JSCOM.Error property
 * @param  {array} args Optional arguments to be formatted into the error description (0:n).
 * @return {error} Error object
 * @static
 */ 
JSCOM.Error.throwError = function(oError, args)
{
	var formatArgs = [oError.desc];
	if (args) {
		var formatArgs = formatArgs.concat(args);
	}
	var sErrorMsg = JSCOM.String.format.apply(JSCOM.String.format, formatArgs);
	
	throw new Error(sErrorMsg);
};