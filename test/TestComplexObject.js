// Load should.js
var should = require('should');

// Loading JSCOM runtime...
var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();
var jscomRt = JSCOM.getJSCOMRuntime();

// Test outcome scope
var TestComplexObject = {};

// Configure component repository
jscomRt.addComponentRepo('example', 'LifeCycle');
jscomRt.addComponentRepo('dist', 'JSCOM');
jscomRt.loadObjectSchema('example', 'ProductSchema');

TestComplexObject.componentRepo = jscomRt.getComponentRepo();

describe("Add multiple repositories", function() { 
	it("LifyCycle repo exists", function() {
		should(TestComplexObject.componentRepo)
			.have.property('LifeCycle', 'example');
	}); 
	it("JSCOM repo exists", function() {
		should(TestComplexObject.componentRepo)
			.have.property('JSCOM', 'dist');
	}); 
});


TestComplexObject.schemaMetadata = jscomRt.getSchemaMetadata("ProductSchema");

describe("Schema Metadata Query", function() { 
	it("Object type query", function() {
		should(TestComplexObject.schemaMetadata)
			.have.property('Product');
		should(TestComplexObject.schemaMetadata)
			.have.property('Category');
		should(TestComplexObject.schemaMetadata)
			.have.property('ProductDetail');
		should(TestComplexObject.schemaMetadata)
			.have.property('Supplier');	
	}); 

	it("Object relation query", function() {
		TestComplexObject.relatedObjects = jscomRt.getSchemaObjectRelation("ProductSchema", "Product");
		
		should(TestComplexObject.relatedObjects)
			.have.property('ProductSchema.Category', "collection");
		should(TestComplexObject.relatedObjects)
			.have.property('ProductSchema.ProductDetail', "single");	
		should(TestComplexObject.relatedObjects)
			.have.property('ProductSchema.Supplier', "single");		
		should(TestComplexObject.relatedObjects)
			.not.have.property('ProductSchema.Supplier', "collection");						
	}); 
});

// Creating a composite of example calculator components...
TestComplexObject.rootComposite = jscomRt.createRootComposite("TestComplexObjectComposite");

// Loading example component instances...
TestComplexObject.lifeCycleComponent = TestComplexObject.rootComposite
	.createComponent("LifeCycle.LifeCycleComponent", "LCComponent");

describe("Exec ILifeCycle function", function() { 
	it("Exec onInit", function() {
		var productData1 = TestComplexObject.lifeCycleComponent.productData1;
		var productData2 = TestComplexObject.lifeCycleComponent.productData2;
		var supplier = TestComplexObject.lifeCycleComponent.supplierData;
		should(productData1.id).equal(10000);
		should(productData1.name).equal("Necklace");
		should(productData2.id).equal(10001);
		should(productData2.name).equal("Ring");
		should(supplier.id).equal(10000);
		should(supplier.name).equal("SilverForge");
		should(supplier.product.id).equal(10000);
		should(supplier.product.name).equal("Necklace");
	}); 
});	