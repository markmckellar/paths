var MouseStatus = require('../../nodes/nodecanvas/mousestatus');
var Position = require('../../nodes/position/position');
var Common = require('../../common/common');

class NodeCanvasMouse
{
	constructor(nodeCanvas)
	{
		NodeCanvasMouse.createNodeCanvasMouse(this,nodeCanvas);
	}

	static createNodeCanvasMouse(nodeCanvasMouse,nodeCanvas)
	{
		nodeCanvasMouse.nodeCanvas = nodeCanvas;
		if(nodeCanvas.isVisable()) 
		{
			nodeCanvasMouse.offset = NodeCanvasMouse.getCanvasOffset(nodeCanvas.canvasHolder.canvas);
			nodeCanvasMouse.mouseStatus = new MouseStatus(false,new Position(0,0),new Position(0,0),null,null);
			nodeCanvasMouse.initCavansPointer();
			nodeCanvasMouse.nodeMouseMovment = {};
		}
	}
	
	static getCanvasOffset(obj)
	{
	    var offsetLeft = 0;
	    var offsetTop = 0;
	    do
	    {
	      if (!isNaN(obj.offsetLeft))
	      {
	          offsetLeft += obj.offsetLeft;
	      }
	      if (!isNaN(obj.offsetTop))
	      {
	          offsetTop += obj.offsetTop;
	      }   
	    }
	    while(obj = obj.offsetParent );
	    
	    return {left: offsetLeft, top: offsetTop};
	}

	pointerDownEvent(event)
	{
		var eventPosition = new Position(event.pageX-this.offset.left,event.pageY-this.offset.top);
		this.hideCurrentNodeInfo();
	
		this.mouseStatus.isDown = true;
		this.mouseStatus.startPosition = eventPosition;
		this.mouseStatus.position = eventPosition;
		if(this.mouseStatus.node!=null)
		{
			this.mouseStatus.node.isAnimated = true;
			this.mouseStatus.node.isSelected = false;
			this.mouseStatus.node = null;
		}
		
		var clickNode =  this.nodeCanvas.getNodeContainingPosition(eventPosition);
	
		var clickNode =  this.nodeCanvas.getNodeContainingPosition(eventPosition);
		if(clickNode!=null && clickNode!=this.mouseStatus.lastNode)
		{
			this.mouseStatus.node = clickNode;
			this.mouseStatus.nodeStartPosition = clickNode.position.clone();
			this.mouseStatus.node.isSelected = true;
			this.mouseStatus.offset = clickNode.position.getDelta(eventPosition);
			this.nodeCanvas.pointerDown(clickNode);
			
			this.showCurrentNodeInfo();
		}
		
		if(clickNode==null)
		{
			this.hideCurrentNodeInfo();
		}
		
		if(this.mouseStatus.lastNode)
		{
			this.hideCurrentNodeInfo();
			this.mouseStatus.lastNode.isSelected = false;
			this.mouseStatus.lastNode = null;
		}
	
	}
	
	showCurrentNodeInfo()
	{
		var htmlObject = document.getElementById("nodeinfo");
		if(htmlObject!=null)
		{
			htmlObject.style.left = this.mouseStatus.node.position.getX()+30+'px';
			htmlObject.style.top  = this.mouseStatus.node.position.getY()+'px';
			htmlObject.style.visibility = 'visible';
			$('#nodeinfo').html(this.mouseStatus.node.getNodeUiDisplay());
		}
		
		console.log("name:"+this.mouseStatus.node.name+"\n"+
				"	isSelected:"+this.mouseStatus.node.isSelected+"\n"+
				"	isSelected:"+this.mouseStatus.node.isAnimated+"\n"+
				"	position:"+Common.toString(this.mouseStatus.node.position)+"\n"+
				"	isSelected:"+this.mouseStatus.node.isSelected+
				"---------------------------------------------"+
			"");
	}
	
	hideCurrentNodeInfo()
	{
		var htmlObject = document.getElementById("nodeinfo");
		if(htmlObject!=null)
		{
			htmlObject.style.left = 0+'px';
			htmlObject.style.top  = 0+'px';
			htmlObject.style.visibility = 'hidden';
			$('#nodeinfo').html();
		}
	}
	
	pointerMoveEvent(event)
	{
		var eventPosition = new Position(event.pageX-this.offset.left,event.pageY-this.offset.top);
		if(this.mouseStatus.isDown)
		{
			this.hideCurrentNodeInfo();
	
			if(this.mouseStatus.node!=null)
			{
				this.mouseStatus.node.isAnimated = false;
				this.mouseStatus.position = eventPosition;
				var deltaPosition = this.mouseStatus.nodeStartPosition.getDelta(eventPosition);
				
				this.mouseStatus.node.position.setX(
						this.mouseStatus.nodeStartPosition.getX()-
						deltaPosition.getX()+
						this.mouseStatus.offset.getX());
				
				this.mouseStatus.node.position.setY(
						this.mouseStatus.nodeStartPosition.getY()-
						deltaPosition.getY()+
						this.mouseStatus.offset.getY());
				
				this.nodeCanvas.pointerMove(this.mouseStatus.node);
				
				if(!this.nodeMouseMovment.hasOwnProperty(this.mouseStatus.node.getNodeKey()))
				{
					this.nodeMouseMovment[this.mouseStatus.node.getNodeKey()] =
					{
							movePostionArray:new Array()
					}
				}
				this.nodeMouseMovment[this.mouseStatus.node.getNodeKey()].movePostionArray.push(this.mouseStatus.node.position.clone());
			}
		}
		else
		{
		}
	}
	
	pointerUpEvent(event)
	{
		if(this.mouseStatus.node!=null)
		{
			this.nodeCanvas.pointerUp(this.mouseStatus.node);
			this.mouseStatus.node.isAnimated = true;
			//this.mouseStatus.node.isSelected = false;
			this.mouseStatus.lastNode = this.mouseStatus.node;
	
			this.mouseStatus.node = null;
		}
		this.mouseStatus.isDown = false;
	}
	
	initCavansPointer()
	{
		var self = this;
		if(window.PointerEvent)
		{
			this.nodeCanvas.canvasHolder.canvas.addEventListener("pointerdown", function(event) { self.pointerDownEvent( event) }, false);
			this.nodeCanvas.canvasHolder.canvas.addEventListener("pointermove",function(event) { self.pointerMoveEvent( event) }, false);
			this.nodeCanvas.canvasHolder.canvas.addEventListener("pointerup",function(event) { self.pointerUpEvent( event) }, false);
	    }
	    else
	    {
	    	this.nodeCanvas.canvasHolder.canvas.addEventListener("mousedown",function(event) { self.pointerDownEvent( event) }, false);
	    	this.nodeCanvas.canvasHolder.canvas.addEventListener("mousemove",function(event) { self.pointerMoveEvent( event) }, false);
	    	this.nodeCanvas.canvasHolder.canvas.addEventListener("mouseup", function(event) { self.pointerUpEvent( event) }, false);
	    }  
	}
}

//<js2node>
module.exports = NodeCanvasMouse;
console.log("Loading:NodeCanvasMouse");
//</js2node>
