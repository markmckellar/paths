var Position = require('../../nodes/position/position');
var BoundingBox = require('../../nodes/shapes/boundingbox');
var Position = require('../../nodes/position/position');
var Common = require('../../common/common');

class Shape
{
	constructor(pointList)
	{
		this.pointList = pointList;
		this.averagePoint = new Position(0,0);
		this.boundingBox = new BoundingBox(pointList);
		this.initShape();
	}
	
	initShape()
	{
		if(!this.pointList[this.pointList.length-1].equals(this.pointList[0])) 
			this.pointList.push(this.pointList[0].clone());
		
		
		Position.getAveragePostionFromPositionList(this.pointList).copyTo(this.averagePoint);
		
		this.drawCenterDot = false;
		/*
		for(var i=0;i<pointList.length;i++)
		{
			console.log("i="+i+" "+CommontoString(pointList[i]));
		}
		*/
		
	}
	
	drawShape(canvasHolder,node,displayInfo)
	{
	    if(node.isSelected)
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(displayInfo.selectFillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(displayInfo.selectBorderColor);
	    }
	    else
	    {
	    	canvasHolder.context.fillStyle = Common.getColorFromString(displayInfo.fillColor);
	    	canvasHolder.context.strokeStyle = Common.getColorFromString(displayInfo.borderColor);
	    }
	    
	    canvasHolder.context.beginPath();
	    for(var i=0;i<this.pointList.length;i++)
	    {   	
			var point = this.pointList[i].createByAdding(node.position);
	    	if(i==0) canvasHolder.context.moveTo(point.getX(),point.getY());
	    	else canvasHolder.context.lineTo(point.getX(),point.getY());
	    }
	    canvasHolder.context.closePath();
	    
	    canvasHolder.context.fill();
	    canvasHolder.context.lineWidth = displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	    
	    if(this.drawCenterDot)
	    {
	    	var averageTrans = this.getAveragePointTransformed(node);
	    	canvasHolder.context.fillStyle = Common.getColorFromString("000000ff");
	    	canvasHolder.context.beginPath();
	    	canvasHolder.context.arc(node.position.getX(),node.position.getY(),2,0,Math.PI * 2, false);
	    	canvasHolder.context.closePath();
	    	canvasHolder.context.fill();
		}
	}
	
	getAveragePointTransformed(node)
	{
	    var averagePointTransformed = this.averagePoint.createByAdding(node.position);
	    return(averagePointTransformed);
	}
	
	//function polygonArea(X, Y, numPoints) 
	
	getShapeArea()
	{ 
	  var area = 0;         // Accumulates area in the loop
	  var j = this.pointList.length-1;  // The last vertex is the 'previous' one to the first
	
	  for (var i=0; i<this.pointList.length; i++)
	  { 
		  area = area + (this.pointList[j].getX()+this.pointList[i].getX()) *
		  	(this.pointList[j].getY()-this.pointList[i].getY()); 
	      j = i;  //j is previous vertex to i
	  }
	  if(area<0) area = area * -1;
	  return(area/2);
	}
	
	
	getShapeArea2()
	{ 
		var area = 0; // Accumulates area in the loop
		var j = this.pointList.length-1; // The last vertex is the 'previous' one to the first
		for (i=0;i<this.pointList.length;i++)
		{
			area = area + (this.pointList[j].getX()+this.pointList[i].getX()) *
				(this.pointList[j].getY()+this.pointList[i].getY()); 
			j = i; //j is previous vertex to i
			
			console.log("XXXXXXXXXXX:i="+i+" area="+area);
	
		}
		return(area);
	}
	
	findClosestPointInShapeFromStartingPoint(startingPosition,node)
	{
		var lookFromPosition = startingPosition.createBySubtracting(node.position);
		var closestInfo = lookFromPosition.findClosestPointInList(this.pointList);
	
		var endOfList = this.pointList.length-1;
		if(this.pointList[0].equals(this.pointList[endOfList])) endOfList = endOfList - 1;
			
		var closestPoint = closestInfo.closetPoint;
		var p1Index = closestInfo.closetIndex-1;
		var p2Index = closestInfo.closetIndex+1;
		if(closestInfo.closetIndex==0) p1Index = endOfList;
		if(closestInfo.closetIndex==endOfList) p2Index = 0;
		
		var p1 = this.pointList[p1Index];
		var p2 = this.pointList[p2Index];
		
		
		var distanceToClosest = closestInfo.distanceToClosest;
		var p1LinePoint = lookFromPosition.findClosestPostionOnLine(closestPoint,p1);
		var p2LinePoint = lookFromPosition.findClosestPostionOnLine(closestPoint,p2);
		var p1Distance = lookFromPosition.getDistance(p1LinePoint);
		var p2Distance = lookFromPosition.getDistance(p2LinePoint);
		
		var finalPoint = closestPoint;
		var finalDistance = distanceToClosest;
		if(distanceToClosest<p1Distance && distanceToClosest<p2Distance)
		{
			finalPoint = closetPoint;
			finalDistance = distanceToClosest;
		}
		else if(p1Distance<p2Distance)
		{
			finalPoint = p1LinePoint;
			finalDistance = p1Distance;
		}
		else
		{
			finalPoint = p2LinePoint;
			finalDistance = p2Distance;
		}
		
		var finalPointTranslated = finalPoint.createByAdding(node.position);
		
		/*
		console.log(CommontoString(closestInfo));
	    console.log("startingPosition="+CommontoString(startingPosition));
		console.log("lookFromPosition="+CommontoString(lookFromPosition));
		console.log("node.position="+CommontoString(node.position));
		console.log("this.pointList.length="+this.pointList.length);
		console.log("closestInfo.closetIndex="+closestInfo.closetIndex);
		console.log("endOfList="+endOfList);
		console.log("p1Index="+p1Index);
		console.log("p2Index="+p2Index);
		console.log("closestInfo.closetIndex="+closestInfo.closetIndex);
		console.log("p1:"+CommontoString(p1));
		console.log("p2:"+CommontoString(p2));
	
		console.log("finalDistance="+finalDistance);
		console.log("finalPoint="+CommontoString(finalPoint));
		console.log("finalPointTranslatedt="+CommontoString(finalPointTranslated));
		console.log("-------------------------------------------------------------------");
		*/
	
		return(finalPointTranslated);
	}
	
	
	containsPosition(position,node)
	{
		if(this.boundingBox.containsPosition(position,node)) return false;
		
		var i;
		var j;
		var c = false;
		for(i=0,j=this.pointList.length-1;i< this.pointList.length;j=i++)
		{
			//
			var pi = this.pointList[i].createByAdding(node.position);
			var pj = this.pointList[j].createByAdding(node.position);
			  
			if (
				((pi.getY()>position.getY()) != (pj.getY()>position.getY())) &&
					(position.getX() < (pj.getX()-pi.getX()) *
					(position.getY()-pi.getY()) /
					(pj.getY()-pi.getY()) +
					pi.getX()) )
				c = !c;
		}
		return c;
	}
}
//<js2node>
module.exports = Shape;
console.log("Loading:Shape");
//</js2node>
