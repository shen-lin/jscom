/**
 * String utilities
 * 
 * @module util
 * @class String
 * @static
 */

JSCOM.String = {};


/**
 * JSCOM.string.format("{0} + {1} = {2}", 5, 5, 10); 
 * @method format
 * @param  {string} tmpl       description
 * @param  {[type]} data       description
 * @return {string}            Formatted string result.
 * @static
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


/**
 *  
 * @method matchRegExpr
 * @param  {string} s Input string      	
 * @param  {string} regexpr Regular expression for JSCOM adaptor scope 
 * @return {boolean} 
 * @static
 */ 
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


JSCOM.String.startWith = function(s, expr)
{
	return s.indexOf(expr) === 0;
};

JSCOM.String.endWith = function(s, expr)
{
	var index = s.indexOf(expr);
	return s.substring(index, s.length) === expr;
};

// Test Color expr: accepts rgb(0-255, 0-255, 0-255) or rgba(0-255, 0-255, 0-255, 0-255)

var colorValueRange = "([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
var colorValueExpr = "[\\s]*" + colorValueRange + "[\\s]*";
var alphaValueRange = "([0]|[1]|0\\.[0-9]+)";
var alphaValueExpr = "[\\s]*" + alphaValueRange + "[\\s]*";
var rgbColorValueExpr = colorValueExpr + "," + colorValueExpr + "," + colorValueExpr;
var rgbaColorValueExpr = colorValueExpr + "," + colorValueExpr + "," + colorValueExpr + "," + alphaValueExpr;
var rgbRegExpr = "[\\s]*rgb\\(" + rgbColorValueExpr + "\\)[\\s]*";
var rgbaRegExpr = "[\\s]*rgba\\(" + rgbaColorValueExpr + "\\)[\\s]*";

var input = "  rgb(10, 5, 10) ";
var result = input.match(rgbRegExpr);
var input = "  rgba( 10,  100,   200 ,0.00  )  ";
var result = input.match(rgbaRegExpr);




