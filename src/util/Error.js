/**
 * Exception handling utilities
 * 
 * @module util
 * @class Error
 * @static
 */

JSCOM.Error = {
	CompositeAlreadyExist: {
		code: "CompositeAlreadyExist",
		desc: "Composite {0} already exists"
	},
	FunctionNotImplemented: {
		code: "FunctionNotImplemented",
		desc: "Interface {0}, Function {1} is not implemented in Component {2}"
	},
	ComponentAlreadyExist: {
		code: "ComponentAlreadyExist",
		desc: "Component {0} already exists"
	},
	DuplicateInterfacesWithinComposite: {
		code: "DuplicateInterfacesWithinComposite",
		desc: "Duplicate component interfaces are found within composite {1}"
	},
	UndefinedAcquisitorType: {
		code: "UndefinedAcquisitorType",
		desc: "Undefined Acquisitor Type: {0}"
	},
	ChildEntityNotExist: {
		code: "ChildEntityNotExist",
		desc: "Entity {0} does not exist in composite {1}"
	},
	BindingFailureAcquisitor: {
		code: "BindingFailureAcquisitor",
		desc: "Binding Failure: Component {0} does not have acquisitor {1}"
	},
	BindingFailureInterface: {
		code: "BindingFailureInterface",
		desc: "Binding Failure: Component {0} does not have interface {1}"
	},
	EntityLoadingError: {
		code: "EntityLoadingError",
		desc: "Error loading component/adaptor from {0}"
	},
	TransactionAlreadyStarted: {
		code: "TransactionAlreadyStarted",
		desc: "A transactional phase already started. No nested transaction allowed."
	},
	NotTransactionStarted: {
		code: "NotTransactionStarted",
		desc: "No transactional phase need to be committed."
	},
	NotImplemented: {
		code: "NotImplemented",
		desc: "Not Implemented"
	},
	ExposeInterfaceFailure: {
		code: "ExposeInterfaceFailure",
		desc: "Short name {0} has been used for an exposed interface of composite {1}"		
	},
	NoShortNameFound: {
		code: "NoShortNameFound",
		desc: "No short name found for interface {0} in composite {1}"			
	},
	NoBindingFound: {
		code: "NoBindingFound",
		desc: "No entity found to provide interface {0} for the acquiring component {1}"
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
	sErrorMsg = oError.code + ": " + sErrorMsg;
	throw new Error(sErrorMsg);
};
