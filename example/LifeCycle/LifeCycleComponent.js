var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();

JSCOM.Loader.declare({
	component: "LifeCycle.LifeCycleComponent",
	extend: "JSCOM.Component",
	interfaces: ["JSCOM.api.ILifeCycle"]
});


LifeCycle.LifeCycleComponent.prototype.data = null;

LifeCycle.LifeCycleComponent.prototype.onInit = function()
{
	this.data = new JSCOM.objects.Product.Product(10000, "Necklace");
};

LifeCycle.LifeCycleComponent.prototype.onDelete = function()
{
	this.data = null;
};


LifeCycle.LifeCycleComponent.prototype.onError = function()
{

};
