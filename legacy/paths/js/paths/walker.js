var Node = require('../nodes/node');
var Common = require('../common/common');

class Walker extends Node
{
	constructor(name,position,canvasHolder,shapeList,graphDataKey,infoData)
	{
		super(name,position,canvasHolder,graphDataKey,infoData);
		Walker.initWalker(this,name,position,shapeList,graphDataKey,infoData);
	}
	
	static initWalker(walker,name,position,shapeList,graphDataKey,infoData)
	{
		walker.junctionArray = new Array();
		walker.layer=2;
		if(!walker.graphData.walkerJunctionRules) walker.graphData.walkerJunctionRules = new Object();
		if(!walker.graphData.walkerJunctionRules.junctionExits)
			walker.graphData.walkerJunctionRules.junctionExits = new Array();
	}
	
	getClientJson()
	{
		var json = super.getClientJson();
		json.pathWorldTye = "walker";
		json.currentJunction = this.getCurrentJunction().getNodeKey();
		return(json);
	}

	
	getNodeUiDisplay(node)
	{
		var value = this.name;
	
		value += "<li>type:"+this.infoData.walkerTypeKey+"</li>";
		value += "<li>currentJ:"+this.getCurrentJunction().name+"</li>";
		
		for(var i=0;i<this.graphData.walkerJunctionRules.junctionExits.length;i++)
		{
			var exit = this.graphData.walkerJunctionRules.junctionExits[i];
	
			var timeToRemove = (
					(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)
					<
					world.checkTimestamp);
	
			value += "<li>exitJunction:i="+i+" "+exit.exitJunction+
				" at exit:"+(exit.exitJunction==this.getCurrentJunction().name)+
				" timeToRemove:"+timeToRemove+
				"</li>";
		}
		//////////////value += "<li>remove at:"+(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)+"</li>";
		//value += "<li>checkTime:"+world.checkTimestamp+"</li>";
		/////////value += "<li>diff:"+(world.checkTimestamp-(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds))+"</li>";
		return(value);
	}
	
	
	processWalkerRules(world)
	{
		//console.log("w:"+this.name+" currentJunction="+this.getCurrentJunction().name);
		
		for(var i=0;i<this.graphData.walkerJunctionRules.junctionExits.length;i++)
		{
			var exit = this.graphData.walkerJunctionRules.junctionExits[i];
			if(exit.exitJunction==this.getCurrentJunction().name)
			{
				var timeToRemove = (
						(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)
						<
						world.checkTimestamp);
				
		
				if(timeToRemove)
				{
					
					console.log("TIME TO EXIT w:"+this.name+
							" currentJunction="+this.getCurrentJunction().name+
							" exit:"+exit.exitJunction+
							" type:"+CommontoString(this.infoData.walkerTypeKey)+
							" infoData:"+CommontoString(this.infoData));
							
					world.removeWalker(this);
				}
			}
		}
		//console.log("w:"+this.name+" junction:"+this.getCurrentJunction());
	}
	
	setCurrentJunction(junction)
	{
		if(this.getCurrentJunction()!=null)
		{
			//console.log("getCurrentJunction().removeWalker ");
			this.getCurrentJunction().removeWalker(this);
		}
		this.junctionArray.push(junction);
		junction.addWalker(this);
	}
	
	getCurrentJunction()
	{
		if(this.junctionArray.length==0) return(null);
		return(this.junctionArray[this.junctionArray.length - 1]);
	}
	
	log()
	{
		console.log("walker log:"+CommontoString(this));
	}
}
//<js2node>
module.exports = Walker;
console.log("Loading:Walker");
//</js2node>
