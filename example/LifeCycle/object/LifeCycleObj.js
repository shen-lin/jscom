var jscom = require('dist/jscom.js');
var JSCOM = jscom.getJSCOM();

JSCOM.Loader.declare({
	obj: "LifeCycle.object.LifeCycleObj"
	properties: {
		a : {type: "int"},
		b : {type: "int"}
	} 
});