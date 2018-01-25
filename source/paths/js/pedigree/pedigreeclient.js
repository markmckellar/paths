var CanvasHolder = require('../nodes/nodecanvas/canvasholder');
var CanvasHolderVirtual = require('../nodes/nodecanvas/canvasholdervirtual');
var Position = require('../nodes/position/position');
var PedigreeCanvas = require('../pedigree/pedigreecanvas');
//var WorldUpdate = GenericPedigreeDefrequire('../../paths/worldupdate');
////////////////var GenericPedigreeDef = require('../pedigree/genericpedigreedef');
var Common = require('../common/common');
var CanvasHolder = require('../nodes/nodecanvas/canvasholder');

class PedigreeClient
{
	constructor(canvasHolder)
	{
		this.canvasName = canvasHolder.canvasName;
		this.canvasHolder = canvasHolder;
		this.worldDisplay = this.canvasHolder.worldDef.getWorldDispaly();	
		this.world = new PedigreeCanvas(
				this.canvasHolder,		
				this.worldDisplay);
		this.world.timeFactor = 1.0;
		this.world.startTime = new Date();
		this.lastTimeDelta = -1;

		/*
		var firstItem = this.world.peekAtNextWorldUpdate();
		if(firstItem!=null)
		{
			var firstDate = firstItem.getDate();
			this.world.startTime = firstDate;
		}
		*/
	}
	
	static getExports()
	{
		return(
				{
					CanvasHolder:CanvasHolder,
					CanvasHolderVirtual:CanvasHolderVirtual,
					Position:Position,
					PedigreeCanvas:PedigreeCanvas,
					//WorldUpdate:WorldUpdate,
					//InaGraphPedigreeCanvasDef:InaGraphPedigreeCanvasDef,
					Common:Common,
				}
				);
	}
	
	startAnimation()
	{
			this.doDraw();
			var self = this;
			setInterval(function(){ self.doDraw(); },250);		
	}
	
	doDraw()
	{
		if(this.lastTimeDelta<0) this.getData();
		else
		{
			this.getDelta(this.lastTimeDelta);
			this.pushUserMovments();
		}
	}    				
	
	pushUserMovments()
	{
		//console.log("pushUserMovments...");
		var nodeMouseMovment = this.world.nodeCanvasMouse.nodeMouseMovment;
		var self = this;
		Object.keys(nodeMouseMovment).forEach(function (key)
		{
			var movePosition = Position.getAveragePostionFromPositionList(nodeMouseMovment[key].movePostionArray);
			nodeMouseMovment[key].movePostionArray.length = 0;
			delete nodeMouseMovment[key];
			
			var moveMessage = 
			{
				nodeKey:key,
				movePosition
			};
			self.sendServerJson(
				"/paths/"+self.canvasName+"/movenode/",
				moveMessage);
			console.log("movements for : "+key);
		});
	}
	
	sendServerJson(url,json)
	{
		var encodedJson = Common.jsonToURI(json);
		fetch(url+encodedJson).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				console.log("sent json to "+url);
	    			});  	
	 }
	
	getDelta(deltaTime)
	{
		var url = "/paths/"+this.canvasName+"/delta/"+deltaTime+"/"+10;
		var self = this;
		fetch(url).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				for(var i=0;i<data.length;i++)
	    				{
	    					var  oneData = data[i];
	    					if(oneData.updateType== "junction")
							{
	    						self.world.addToWorldUpdateQueue(WorldUpdate.createWorldUpdateFromJson(oneData));
	
	    					}
	    					else if(oneData.updateType=="move")
	    					{
	    						console.log("move:"+Common.toString(oneData));
	    						if(self.world.doesNodeExist(oneData.nodeKey))
	    						{
	    							var node = self.world.getNode(oneData.nodeKey);
	    							if(!node.isSelected) node.position.setXY(oneData.movePosition.x,oneData.movePosition.y);
	    						}
	    					}
	    					self.lastTimeDelta = oneData.processTimestamp;
	    				}
	    			});  	
	 }
	
	getData()
	{
		var url = "/paths/"+this.canvasName;
		var self = this;
		fetch(url).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				PedigreeCanvas.fillPedigreeCanvasFromClientJson(self.world,data);
	    			});
		this.lastTimeDelta = 0;	
	}
}

//<js2node>
module.exports = PedigreeClient;
console.log("Loading:PedigreeClient");
//</js2node>