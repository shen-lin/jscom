var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();

JSCOM.Loader.declare({
	component: "LifeCycle.LifeCycleComponent",
	extend: "JSCOM.Component",
	interfaces: ["JSCOM.api.ILifeCycle"]
});


LifeCycle.LifeCycleComponent.prototype.productData1 = null;
LifeCycle.LifeCycleComponent.prototype.productData2 = null;
LifeCycle.LifeCycleComponent.prototype.supplierData = null;

LifeCycle.LifeCycleComponent.prototype.onInit = function()
{
	this.productData1 = new JSCOM.objects.ProductSchema.Product(10000, "Necklace");
	this.productData2 = new JSCOM.objects.ProductSchema.Product(10001, "Ring");
	this.supplierData = new JSCOM.objects.ProductSchema.Supplier(10000, 
		"SilverForge", this.productData1);
};

LifeCycle.LifeCycleComponent.prototype.onDelete = function()
{
	this.data = null;
};


LifeCycle.LifeCycleComponent.prototype.onError = function()
{

};
