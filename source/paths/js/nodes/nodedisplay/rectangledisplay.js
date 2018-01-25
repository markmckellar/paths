var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');

class RectangleDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}
	
	containsPosition(position,node)
	{
		return(
				(
						(node.position.getX()-this.displayInfo.width/2)<=position.getX() &&
						(node.position.getX()+this.displayInfo.width/2)>=position.getX() &&
						(node.position.getY()-this.displayInfo.height/2)<=position.getY() &&
						(node.position.getY()+this.displayInfo.height/2)>=position.getY()
				)
			);
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
	    //console.log(CommontoString(this.displayInfo));
	    canvasHolder.context.fillRect( 
	    		(node.position.getX()-this.displayInfo.width/2),
	    		(node.position.getY()-this.displayInfo.height/2),
	    		this.displayInfo.width,
	    		this.displayInfo.height);
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.borderColor);
	    canvasHolder.context.strokeRect( 
	    		(node.position.getX()-this.displayInfo.width/2), 
	    		(node.position.getY()-this.displayInfo.height/2), 
	    		this.displayInfo.width, 
	    		this.displayInfo.height);
	
	}
}
//<js2node>
module.exports = RectangleDisplay;
console.log("Loading:RectangleDisplay");
//</js2node>
