class CanvasDef
{
	constructor()
	{		
	}
	
	getWorldDispaly()
	{
		throw "CanvasDef.getWorldDispaly not defined";
	}
	
	getWorldDefaults()
	{
		throw "CanvasDef.getWorldDefaults not defined";
	}
}

//<js2node>
module.exports = CanvasDef;
console.log("Loading:CanvasDef");
//</js2node>
