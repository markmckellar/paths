var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');
var Shape = require('../../nodes/shapes/shape');

class RectangleDisplayShape extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
		
		var pointList = new Array();
		/*
		pointList.push(new Position(this.displayInfo.width/2,0));
		pointList.push(new Position(this.displayInfo.width,this.displayInfo.height));
		pointList.push(new Position(0,this.displayInfo.height));
		pointList.push(new Position(this.displayInfo.width/2,0));
		*/
		
		pointList.push(new Position(-(this.displayInfo.width/2),-(this.displayInfo.height/2)));
		pointList.push(new Position((this.displayInfo.width/2),-(this.displayInfo.height/2)));
		pointList.push(new Position((this.displayInfo.width/2),(this.displayInfo.height/2)));
		pointList.push(new Position(-(this.displayInfo.width/2),(this.displayInfo.height/2)));	
		pointList.push(new Position(-(this.displayInfo.width/2),-(this.displayInfo.height/2)));
	
		this.pointList = pointList;
		this.shape = new Shape(pointList)
	}
	
	containsPosition(position,node)
	{
		return(this.shape.containsPosition(position,node));
	}
	
	
	drawNode(canvasHolder,node)
	{
		super.drawNode(canvasHolder,node);
		this.shape.drawShape(canvasHolder,node,this.displayInfo);
	}
}
//<js2node>
module.exports = RectangleDisplayShape;
console.log("Loading:RectangleDisplayShape");
//</js2node>
