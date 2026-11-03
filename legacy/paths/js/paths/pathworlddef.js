var CanvasDef = require('../nodes/nodecanvas/canvasdef');


class PathWorldDef extends CanvasDef
{
	constructor()
	{		
		super();
	}
	
	getPathParts()
	{
		throw "PathWorldDef.getPathParts not defined";
	}
	
	getPathDef()
	{
		throw "PathWorldDef.getPathDef not defined";
	}
	
	getWalkerJunctionRules()
	{
		throw "PathWorldDef.getWalkerJunctionRules not defined";
	}
}

//<js2node>
module.exports = PathWorldDef;
console.log("Loading:PathWorldDef");
//</js2node>
