var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');
var Shape = require('../../nodes/shapes/shape');

class ArcDisplayShape extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
		this.pointList = new Array();
		this.shape = null;
		this.init();
		
	}
	
	init()
	{
		this.pointList.length = 0;
		this.angle = Math.abs(this.displayInfo.endAngle,this.displayInfo.startAngle);
		var angleInc = this.angle / this.displayInfo.curvePoints;
		
		this.pointList.push(new Position(0,0));
		for(var angle=this.displayInfo.startAngle;
			angle<=this.displayInfo.endAngle && angleInc>0;
			angle=angle+angleInc)
		{
			if( (angle+angleInc) > this.displayInfo.endAngle )
			{
				if(angle!=this.displayInfo.endAngle) angle = this.displayInfo.endAngle ;
			}
			var rads = angle * (Math.PI/180);
			this.pointList.push(
					new Position(
							this.displayInfo.radius*Math.cos(rads),
							this.displayInfo.radius*Math.sin(rads))
					);	
		}
		
		this.pointList.push(new Position(0,0));
		if(this.shape==null) this.shape = new Shape(this.pointList);
		else this.shape.initShape();
	}
	
	containsPosition(position,node)
	{
		var distance = node.position.getDistance(position);
		return(distance<=this.displayInfo.radius);
	}
	
	
	drawNodex(canvasHolder,node)
	{

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
	   /* 
	    canvasHolder.context.beginPath();
	    canvasHolder.context.arc(node.position.getX(),node.position.getY(),this.displayInfo.radius,0,Math.PI * 2, false);
	    canvasHolder.context.closePath();
	    canvasHolder.context.fill();
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	    */
	    canvasHolder.context.beginPath(); //Begins drawing the path. See link in "Edit" section
	    canvasHolder.context.moveTo(node.position.getX(),node.position.getY()); //Moves the beginning position to cx, cy (100, 75)
	    canvasHolder.context.arc(node.position.getX(),node.position.getY(),
	    		this.displayInfo.radius,
	    		this.toRadians(this.displayInfo.startAngle),
	    		this.toRadians(this.displayInfo.endAngle)); //	ctx.arc(cx, cy, radius, startAngle, endAngle, counterclockwise (optional));
	    canvasHolder.context.lineTo(node.position.getX(),node.position.getY()); //Draws lines from the ends of the arc to cx and cy
	    canvasHolder.context.closePath(); //Finishes drawing the path
	    canvasHolder.context.fill(); //Actually draws the shape (and fills)
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	}
	//this.displayInfo.endAngle,this.displayInfo.startAngle
	toRadians(deg)
	{
	    return deg * Math.PI / 180 //Converts degrees into radians
	}
}
//<js2node>
module.exports = ArcDisplayShape;
console.log("Loading:ArcDisplayShape");
//</js2node>
