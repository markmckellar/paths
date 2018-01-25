var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');
var Shape = require('../../nodes/shapes/shape');

class CircleDisplayShape extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
		
		var pointList = new Array();
	
		var angleInc = 360 / this.displayInfo.curvePoints;
		for(var angle=0;angle<=360;angle=angle+angleInc)
		{
			var rads = angle * (Math.PI/180);
			pointList.push(
					new Position(
							this.displayInfo.radius*Math.cos(rads),
							this.displayInfo.radius*Math.sin(rads))
					);	
		}
		
		this.pointList = pointList;
		this.shape = new Shape(pointList)
	}
	
	
	containsPosition(position,node)
	{
		var distance = node.position.getDistance(position);
		return(distance<=this.displayInfo.radius);
	}
	
	
	drawNodex(canvasHolder,node)
	{

		this.shape.drawShape(canvasHolder,node,this.displayInfo);
	}
	
	drawNode(canvasHolder,node)
	{
		//super.drawConnector(canvasHolder,node);
		super.drawNode(canvasHolder,node);


	    if(node.isSelected)
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.selectFillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.selectBorderColor);
	    }
	    else
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(this.displayInfo.fillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.borderColor);
	    }
	    
	    canvasHolder.context.beginPath();
	    canvasHolder.context.arc(node.position.getX(),node.position.getY(),this.displayInfo.radius,0,Math.PI * 2, false);
	    canvasHolder.context.closePath();
	    canvasHolder.context.fill();
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	}
}
//<js2node>
module.exports = CircleDisplayShape;
console.log("Loading:CircleDisplayShape");
//</js2node>
