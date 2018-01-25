var CanvasDef = require('../nodes/nodecanvas/canvasdef');


class PedigreeCanvasDef extends CanvasDef
{
	constructor()
	{		
		super();
	}
	
	getPathParts()
	{
		throw "PedigreeCanvasDef.getPathParts not defined";
	}
	
	getPathDef()
	{
		throw "PedigreeCanvasDef.getPathDef not defined";
	}
	
	getWalkerJunctionRules()
	{
		throw "PedigreeCanvasDef.getWalkerJunctionRules not defined";
	}
}

//<js2node>
module.exports = PedigreeCanvasDef;
console.log("Loading:PedigreeCanvasDef");
//</js2node>
