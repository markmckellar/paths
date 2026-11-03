class BoundingBox
{
	constructor(pointList)
	{
		this.initDone = false;
		this.pointList = pointList;
		this.initBoundingBox();
	
	}
	
	
	containsPosition(position,node)
	{
		if(!this.initDone) this.initBoundingBox();
	
		return(
				(
						(this.xMin.getX()+node.position.getX())>=position.x &&
						(this.xMax.getX()+node.position.getX())<=position.x &&
						(this.yMin.getY()+node.position.getY())>=position.y &&
						(this.yMax.getY()+node.position.getY())<=position.y
				)
			);
	}
	
	initBoundingBox()
	{
		this.initDone = true;
		//this.pointList = pointList;
	
	
		this.xMin = null;
		this.xMax = null;
		this.yMin = null;
		this.yMax = null;
		//console.log("plist size="+pointList.length);
		for(var i=0;i<this.pointList.length;i++)
		{
			var p = this.pointList[i];
			if(this.xMin==null) this.xMin = p;
			if(this.xMax==null) this.xMax = p;
			if(this.yMin==null) this.yMin = p;
			if(this.yMax==null) this.yMax = p;
			
			if(p.getX()<this.xMin) this.xMin = p;
			if(p.getX()>this.xMax) this.xMax = p;
			if(p.getY()<this.yMin) this.yMin = p;
			if(p.getY()>this.yMax) this.yMax = p;
	
		}
		
		this.width = this.xMax.getX()-this.xMin.getX();
		this.height = this.yMax.getY()-this.yMin.getY();
	}
}




//<js2node>
module.exports = BoundingBox;
console.log("Loading:BoundingBox");
//</js2node>
