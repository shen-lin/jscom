var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();

JSCOM.Loader.declare({
	component: "LifeCycle.LifeCycleComponent",
	extend: "JSCOM.Component"
});

LifeCycle.LifeCycleComponent.datatypes = ["LifeCycle.object.List"];

// Expose interface ICalculator
LifeCycle.LifeCycleComponent.interfaces = ["JSCOM.api.ILifeCycle"];


LifeCycle.LifeCycleComponent.prototype.data = null;

LifeCycle.LifeCycleComponent.prototype.onLoad = function()
{
	this.data = "Data";
};

LifeCycle.LifeCycleComponent.prototype.onExit = function()
{

};


LifeCycle.LifeCycleComponent.prototype.onError = function()
{

};
