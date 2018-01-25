var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var CanvasHolderVirtual = require('../../nodes/nodecanvas/canvasholdervirtual');
var Position = require('../../nodes/position/position');
var PathWorld = require('../../paths/pathworld');
var WorldUpdate = require('../../paths/worldupdate');
var InaGraphPathWorldDef = require('../../pathsexp/inagraph/inagraphpathworlddef');
var Common = require('../../common/common');


class InitInaGraph
{
	constructor(canvasHolder)
	{
		canvasHolder.worldDef = new InaGraphPathWorldDef()
		this.worldDef = canvasHolder.worldDef;
		this.worldDisplay = this.worldDef.getWorldDispaly();
		
		this.world = new PathWorld(
				canvasHolder,
				//this.worldDisplay.junctionSpacer,
				//this.worldDisplay.worldWall,
				//canvasHolder.getConnector("junctionSpacer",canvasHolder.canvasName+":junctionSpacer"),
				//canvasHolder.getConnector("worldWall",canvasHolder.canvasName+":worldWall"),
				this.worldDisplay);
		
		//this.worldDef.initCustomNodes(this.world);
		
		this.world.timeFactor = 1.0;
		this.world.startTime = new Date();
		var firstItem = this.world.peekAtNextWorldUpdate();
		if(firstItem!=null)
		{
			var firstDate = firstItem.getDate();
			this.world.startTime = firstDate;
			//60*60/0.5; // 2.0 for the denominator is a nice visual time)
		}
		console.log("init of InitInaGraph done");
	}
	
	static getCommon()
	{
		return(Common);
	}
	
	static getPosition()
	{
		return(Position);
	}
	
	static fillPathWorldFromClientJson(world,json)
	{
		PathWorld.fillPathWorldFromClientJson(world,json);
	}
	
	static createPathWorldFromClientJson(canvasHolder,worldDef,json)
	{
		return(PathWorld.createPathWorldFromClientJson(canvasHolder,worldDef,json));
	}
	
	static addToWorldUpdateQueue(world,json)
	{
		world.addToWorldUpdateQueue(WorldUpdate.createWorldUpdateFromJson(json));
	}
	
	static getHtmlCanvasHolder(canvasName,worldDef)
	{
		return(new CanvasHolder(canvasName,worldDef));
	}
	
	static getVirtualCanvasHolder(canvasName,worldDef,width,height,origin)
	{
		return(new CanvasHolderVirtual(canvasName,worldDef,width,height,new Position()));
	}
}

//<js2node>
module.exports = InitInaGraph;
console.log("Loading:InitInaGraph");
//</js2node>
