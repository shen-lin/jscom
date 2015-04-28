/**
 * JSCOM underlying PubSub layer for both local and remote interactions
 * between components.
 *
 * @module util
 * @class EventBus
 * @static
 */
JSCOM.EventBus = JSCOM.EventBus || {};

JSCOM.require("events");

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
 * Subscribe to a local JSCOM event, based on NodeJS events mechanism. 
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
	throw "Not Implemented";
};


/**
 * Subscribe to a remote JSCOM event, by using an external message/event broker. This function
 * needs to be overwritten with custom implementation. <div>@throws "Not Implemented"</div> 
 * 
 * @method subscribeRemote
 * @param  {string} sChannelId Message channel Id 
 * @param  {string} sEventId   Event Id
 * @param  {object} oData      Message carried by the event
 * @static
 */
JSCOM.EventBus.subscribeRemote = function(sChannelId, sEventId, fnHandler) 
{
	throw "Not Implemented";	
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
	var sCombinedEventId = sChannelId + JSCOM.GLOBAL_EVENTID_SEPARATOR + sEventId;
	return sCombinedEventId;
};