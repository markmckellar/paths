var Position = require('../position/position');
var Node = require('../node');
var Common = require('../../common/common');

class NodeCanvas extends Node
{
	  constructor(canvasHolder)
	  {
		  super(	canvasHolder.canvasName,
					new Position(0,0),
					canvasHolder,
					"generic",
					null);
		  NodeCanvas.initNodeCanvas(this,canvasHolder);
		  
	  }
	  
	  static initNodeCanvas(nodeCanvas,canvasHolder)
	  {
			nodeCanvas.extraAnimation = null;
			nodeCanvas.canvasHolder = canvasHolder;
			nodeCanvas.startAnimationTimeStamp = null;
			nodeCanvas.lastAnimationTimeStamp = null;
			nodeCanvas.startAnimationDate = null;
			nodeCanvas.animationExecTime = 0;
			nodeCanvas.timeFactor = 1;
			nodeCanvas.worldUpdateQueueProcessed = new Array();

		}
	  
	  getWorldUpdatesProcessed(timeStamp,maxItems)
		{
			var worldUpdateArray = new Array();
			var first = null;
			for(var i=0;i<this.worldUpdateQueueProcessed.length &&
				worldUpdateArray.length<maxItems;i++)
			{
				var worldUpdate = this.worldUpdateQueueProcessed[i];

				if(worldUpdate.processTimestamp>timeStamp) 
				{
					worldUpdateArray.push(worldUpdate);
					/*
					console.log("      getWorldUpdatesProcessed"+
							":worldUpdate.processTimestamp="+worldUpdate.processTimestamp+
							":readyToBeProcessed="+worldUpdate.readyToBeProcessed(timeStamp)+
							":timeStamp="+timeStamp);
					*/
				}
			}
			/*
			console.log("getWorldUpdatesProcessed"+
					":timeStamp="+timeStamp+
					":maxItems="+maxItems+
					":found="+worldUpdateArray.length);
					*/
			return(worldUpdateArray);
		}
	
	  getWorldClientJson()
	  {
		  var json = {};
		  
		  json.nodeGraph = super.getClientJson();
		  json.canvasHolder = this.canvasHolder.getClientJson();
		  JSON.stringify(json);
		  return(json)
	  }
	
	isVisable()
	{
		return(this.canvasHolder.isVisable())
	}
	
	pointerUp(node)
	{
		//console.log("NodeCanvas.pointerUp:"+node.name)
	}
	
	pointerMove(node)
	{
		//console.log("NodeCanvas.pointerMove:"+node.name)
	}
	
	pointerDown(node)
	{
		//console.log("NodeCanvas.pointerDown:"+node.name)
	}
	
	pause()
	{
		this.isAnimated = false;
	}
	
	play()
	{
		this.isAnimated = true;
	    this.draw();
	}
	draw()
	{
		var self = this;
		if(this.canvasHolder.isDrawable())
			requestAnimationFrame(function(timestamp) { self.drawCanvas(timestamp) }, false);
	}
	
	
	setAnimationTimes(timestamp)
	{
		if(this.startAnimationTimeStamp==null) this.startAnimationTimeStamp = timestamp+0;
		if(this.startAnimationDate==null) this.startAnimationDate = new Date();
		var now = new Date();
		if(this.lastAnimationTimeStamp==null) this.lastAnimationTimeStamp = now;
	
		if(this.isAnimated)
		{
			this.animationExecTime += now.getTime()-this.lastAnimationTimeStamp.getTime();
			//console.log("now="+now+
			//	" lastAnimationTimeStamp="+this.lastAnimationTimeStamp+
			//	" animationExecTime="+this.animationExecTime+
			//	"");
		}
		this.lastAnimationTimeStamp = now;
	
	}
	
	
	clearCanvas(timestamp)
	{
		if(this.isVisable() && this.canvasHolder.isDrawable())
		{
			this.canvasHolder.context.clearRect(0, 0, this.canvasHolder.getWidth(), this.canvasHolder.canvas.height);
			this.canvasHolder.context.fillStyle = Common.getColorFromString(this.fillStyle)
			this.canvasHolder.context.fillRect(0, 0, this.canvasHolder.getWidth(), this.canvasHolder.getHeight());
		}
	}
}

//<js2node>
module.exports = NodeCanvas;
console.log("Loading:NodeCanvas");
//</js2node>
