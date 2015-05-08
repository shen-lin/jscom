/**
 * JSCOM underlying PubSub layer for both local and remote interactions
 * between components.
 *
 * @module util
 * @class EventBus
 * @static
 */
JSCOM.EventBus = JSCOM.EventBus || {};

JSCOM.Loader.require("events");

JSCOM.EventBus.local = new JSCOM.events.EventEmitter();
JSCOM.EventBus.remote = null;

/**
 * Publish a local JSCOM event, based on NodeJS events mechanism.
 * @method publishLocal
 * @param  {string} sChannelId Message channel Id 
 * @param  {string} sEventId   Event Id
 * @param  {object} oData      Message carried by the event
 * @static
 */ 
JSCOM.EventBus.publishLocal = function(sChannelId, sEventId, oData) 
{
	var sCombinedEventId = JSCOM.EventBus._getCombinedEventId(sChannelId, sEventId);
	JSCOM.EventBus.local.emit(sCombinedEventId, oData);
};


/**
 * Subscribe to a local JSCOM event publisher, based on NodeJS events mechanism. 
 * @method subscribeLocal
 * @param  {string} sChannelId   Message channel Id 
 * @param  {string} sEventId     Event Id
 * @param  {function} fnHandler  Handler function that is used to consume the subscribed event.
 * @static
 */ 
JSCOM.EventBus.subscribeLocal = function(sChannelId, sEventId, fnHandler) 
{
	var sCombinedEventId = JSCOM.EventBus._getCombinedEventId(sChannelId, sEventId);
	JSCOM.EventBus.local.on(sCombinedEventId, fnHandler);
};


/**
 * Unsubscribe from a local JSCOM event listener, based on NodeJS events mechanism. 
 * @method unsubscribeLocal
 * @param  {string} sChannelId   Message channel Id 
 * @param  {string} sEventId     Event Id
 * @static
 */ 
JSCOM.EventBus.unsubscribeLocal = function(sChannelId, sEventId) 
{
	var sCombinedEventId = JSCOM.EventBus._getCombinedEventId(sChannelId, sEventId);
	JSCOM.EventBus.local.removeAllListeners(sCombinedEventId);
};

JSCOM.EventBus._subscribeComponentInterfaceEvents = function(compInstance)
{
	var oInterfaceSet = compInstance.getInterfaceSet();
	for (var sInterfaceName in oInterfaceSet) {
		var oInterface = oInterfaceSet[sInterfaceName];
		var sChannelId = JSCOM.eventUri.ComponentInterfaceChannel;
		var oInterfaceDef = oInterface.oInterfaceDef;
		for (var sFnName in oInterfaceDef) {
			var sEventId = JSCOM.String.format(
				JSCOM.eventUri.EventIDFormat, 
				compInstance.className, 
				compInstance.id, 
				sInterfaceName,
				sFnName);
			
			if (!compInstance[sFnName]) {
				throw "Function " + sFnName + " of Interface " + sInterfaceName + " is not implemented in Component " + compInstance.id;
			}
			var fnInterfaceFunction = compInstance[sFnName].bind(compInstance);
			JSCOM.EventBus.subscribeLocal(sChannelId, sEventId, fnInterfaceFunction);
			
			// TODO: subscribe remote
		}
	}
};



/**
 * Publish a remote JSCOM event, by using an external message/event broker. This function
 * needs to be overwritten with custom implementation. <div> @throws "Not Implemented"</div> 
 * 
 * @method publishRemote
 * @param  {string} sChannelId Message channel Id 
 * @param  {string} sEventId   Event Id
 * @param  {object} oData      Message carried by the event
 * @static
 */
JSCOM.EventBus.publishRemote = function(sChannelId, sEventId, oData) 
{
	JSCOM.Error.throwError(JSCOM.Error.NotImplemented);
};


/**
 * Subscribe to a remote JSCOM event, by using an external message/event broker. This function
 * needs to be overwritten with custom implementation. <div>@throws "Not Implemented"</div> 
 * 
 * @method subscribeRemote
 * @param  {string} sChannelId Message channel Id 
 * @param  {string} sEventId   Event Id
 * @param  {function} fnHandler Event handler function
 * @static
 */
JSCOM.EventBus.subscribeRemote = function(sChannelId, sEventId, fnHandler) 
{
	JSCOM.Error.throwError(JSCOM.Error.NotImplemented);	
};


/**
 * Unsubscribe from a remote JSCOM event publisher, by using an external message/event broker. This function
 * needs to be overwritten with custom implementation. 
 * <p>@throws "Not Implemented"</p> 
 * 
 * @method unsubscribeRemote
 * @param  {string} sChannelId Message channel Id 
 * @param  {string} sEventId   Event Id
 * @static
 */
JSCOM.EventBus.unsubscribeRemote = function(sChannelId, sEventId) 
{
	JSCOM.Error.throwError(JSCOM.Error.NotImplemented);	
};

/**
 * Generate a global event Id from the channel id and the event id. 
 * @method getCombinedEventId
 * @param  {string} sChannelId   Message channel Id 
 * @param  {string} sEventId     Event Id
 * @static
 */ 
JSCOM.EventBus.getCombinedEventId = function(sChannelId, sEventId) 
{
	var sCombinedEventId = sEventId + JSCOM.eventUri.SEPARATOR + sChannelId;
	return sCombinedEventId;
};