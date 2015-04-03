JSCOM.String = {};

/**
 * JSCOM.string.format("{0} + {1} = {2}", 5, 5, 10);
 */
JSCOM.String.format = function()
{
	if( arguments.length == 0 ) return null;
	if( arguments.length == 1 ) return arguments[0];
	
    var template = arguments[0];
	for(var i = 1; i < arguments.length; i++) {
        var regex = new RegExp('\\{' + (i - 1) + '\\}','gm');
        template = template.replace(regex, arguments[i]);
    }
    return template;	
};


JSCOM.String.isEmpty = function(str)
{
	var exists = jade.utils.JSObj.exists(str);
	if (!exists) return true;
	return str.length == 0;
};


JSCOM.String.toObject = function(str)
{
	return JSON.parse(str);
};

JSCOM.String.toString = function(obj)
{
	return JSON.stringify(obj);
};


JSCOM.String.matchRegExpr = function(s, regexpr) {
	regexpr = regexpr.replace(/\./g, "\\\.");
	regexpr = regexpr.replace(/\*\*/g, "~~");
	regexpr = regexpr.replace(/\*/g, "[a-zA-Z]*");
	regexpr = regexpr.replace(/~~/g, "([a-zA-Z]|\.)*");
	regexpr = regexpr.replace(/\?/g, "[a-zA-Z]");
	var result = s.match(regexpr);
	if (result) {
		return result[0] === s;
	}
	else {
		return false;
	}
} 


// Test Color expr: accepts rgb(0-255, 0-255, 0-255) or rgba(0-255, 0-255, 0-255, 0-255)
var colorValueRange = "([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
var colorValueExpr = "[\\s]*" + colorValueRange + "[\\s]*";
var rgbColorValueExpr = colorValueExpr + "," + colorValueExpr + "," + colorValueExpr;
var rgbaColorValueExpr = colorValueExpr + "," + colorValueExpr + "," + colorValueExpr + "," + colorValueExpr;
var rgbRegExpr = "[\\s]*rgb\\(" + rgbColorValueExpr + "\\)[\\s]*";
var rgbaRegExpr = "[\\s]*rgba\\(" + rgbaColorValueExpr + "\\)[\\s]*";

var input = "  rgb(10, 5, 10) ";
var result = input.match(rgbRegExpr);
var input = "  rgba( 10,  100,   200 ,258  )  ";
var result = input.match(rgbaRegExpr);