var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');


class CircleDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}
	
	containsPosition(position,node)
	{
		var distance = node.position.getDistance(position);
		return(distance<=this.displayInfo.radius);
	}
	
	
	drawNode(canvasHolder,node)
	{
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
module.exports = CircleDisplay;
console.log("Loading:CircleDisplay");
//</js2node>
