JSCOM.Loader.declare({
	component: "Calc.ParentCalculator",
	extend: "JSCOM.Component"
});

Calc.ParentCalculator.interfaces = ["Calc.ICalculator"];
Calc.ParentCalculator.acquisitors = [
	{name: "Calc.IAdd", type: JSCOM.ACQUISITOR_SINGLE}
];

Calc.ParentCalculator.prototype.add = function(a, b)
{
	var output = this.acquisite("Calc.IAdd").add(a, b);
	return output;
};

Calc.ParentCalculator.prototype.subtract = function(a, b)
{
	throw "NotImplemented";
};

Calc.ParentCalculator.prototype.log = function(operator, a, b, output)
{
	throw "NotImplemented";
};