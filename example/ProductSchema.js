{
	"Product" : {
		"type" : "entity",
		"key" : "id",
		"properties" : {
			"id" : {
				"type" : "int",
				"nullable" : "false"
			},
			"name" : {
				"type" : "string",
				"nullable" : "false"
			},
			"description" : {
				"type" : "string"
			},
			"price" : {
				"type" : "double",
				"nullable" : "false"
			},
			"categories" : {
				"type" : "collection",
				"itemType" : "Category"
			},
			"supplier" : {
				"type" : "Supplier"
			},
			"productDetail" : {
				"type" : "ProductDetail"
			}
		}
	},

	"Category" : {
		"type" : "entity",
		"key" : "id",
		"properties" : {
			"id" : {
				"type" : "int",
				"nullable" : "false"
			},
			"name" : {
				"type" : "string",
				"nullable" : "false"
			},
			"products" : {
				"type" : "collection",
				"itemType" : "Product"
			}
		}
	},

	"ProductDetail" : {
		"type" : "entity",
		"key" : "productId",
		"properties" : {
			"productId" : {
				"type" : "int",
				"nullable" : "false"
			},
			"details" : {
				"type" : "string"
			},
			"product" : {
				"type" : "Product"
			}
		}
	},

	"Supplier" : {
		"type" : "entity",
		"key" : "id",
		"properties" : {
			"id" : {
				"type" : "int",
				"nullable" : "false"
			},
			"name" : {
				"type" : "string"
			},
			"product" : {
				"type" : "Product"
			}
		}
	}
}