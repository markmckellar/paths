class Position
{
	constructor(x, y)
	{
	    this.x = x;
	    this.y = y;
	}

	static getAveragePostionFromPositionList(positionList)
	{
		var x = 0.0;
		var y = 0.0;
		for(var i=0;i<positionList.length;i++)
		{
			var p = positionList[i];
			x += p.getX();
			y += p.getY();
		}
		x = x / positionList.length;
		y = y / positionList.length;
		return(new Position(x,y));
	}
	
  getClientJson()
  {
	  var json = {};
	  json.x = this.getX();
	  json.y = this.getY();
	  return(json)
  }
		
  static getAveragePostionFromNodeList(nodelist)
  {
	var x = 0.0;
	var y = 0.0;
	for(var i=0;i<nodelist.length;i++)
	{
		var p = nodelist[i].position;
		x += p.getX();
		y += p.getY();
	}
	x = x / nodelist.length;
	y = y / nodelist.length;
	return(new Position(x,y));
  }
		
	static getPostionListFromNodeList(nodeList)
	{
		var positions = new Array();
		for (var i = 0; i < nodeList.length; i++)
		{
			positions.push(nodeList[i].position);
		}
		return(positions);
	}
	
	addTo(position)
	{
		this.setX(this.getX()+position.getX());
		this.setY(this.getY()+position.getY());
	}

	copyFrom(position)
	{
		this.setX(position.getX());
		this.setY(position.getY());
	}

	copyTo(position)
	{
		position.setX(this.getX());
		position.setY(this.getY());
	}
	
	setXY(x,y)
	{
		this.setX(x);
		this.setY(y);
	}

	setX(x)
	{
		this.x = x;
	}

	setY(y)
	{
		this.y = y;
	}

	getX()
	{
		return(this.x);
	}

	getY()
	{
		return(this.y);
	}
	
	clone()
	{
		return(new Position(this.getX(),this.getY()));
	}

	equals(position)
	{
		return( (this.getX()==position.getX()) && (this.getY()==position.getY()) ) ;
	}

	createByAdding(position)
	{
		return(new Position(this.getX() + position.getX(),this.getY()+position.getY()));
	}

	createBySubtracting(position)
	{
		return(new Position(this.getX()-position.getX(),this.getY()-position.getY()));
	}

	findClosestPostionOnLine(p1,p2)
	{
		  var A = this.getDeltaX(p1);
		  var B = this.getDeltaY(p1);
		  var C = p2.getDeltaX(p1);
		  var D = p2.getDeltaY(p1);
	
		  var dot = A * C + B * D;
		  var lengthSquared = C * C + D * D;
		  var param = -1;
		  if (lengthSquared != 0) //in case of 0 length line
		      param = dot / lengthSquared;
	
		  var xx, yy;
	
		  if (param < 0)
		  {
		    xx = p1.getX();
		    yy = p1.getY();
		  }
		  else if (param > 1) {
		    xx = p2.getX();
		    yy = p2.getY();
		  }
		  else {
		    xx = p1.getX() + param * C;
		    yy = p1.getY() + param * D;
		  }
	/*
		  var dx = x - xx;
		  var dy = y - yy;
		  return Math.sqrt(dx * dx + dy * dy);
		  */
		  return(new Position(xx,yy));
	}


	findClosestPointInList	(positionList)
	{
		var closetIndex = 0;
		var closetPoint = positionList[closetIndex];
		var distanceToClosest = this.getDistance(closetPoint);
		
		for(var i=0;i<positionList.length;i++)
		{
			var point = positionList[i];
			var distanceToPoint = this.getDistance(point);
			if(distanceToPoint<distanceToClosest)
			{
				closetIndex = i;
				closetPoint = point;
				distanceToClosest = distanceToPoint;
			}
		}
		return(
				{
					closetIndex:closetIndex,
					closetPoint:closetPoint,
					distanceToClosest:distanceToClosest
				}
				);
	}

	log	()
	{
		console.log(
				"Position"+
				":x="+this.getX()+
				":y="+this.getY()+
				""
		);
	}

	getDeltaY(position)
	{
		return(this.getY()-position.getY());
	}

	getDeltaX(position)
	{
		return(this.getX()-position.getX());
	}

	getDelta(position)
	{
		return(new Position(this.getDeltaX(position),this.getDeltaY(position)));
	}

	getDistance(position)
	{
		return (Math.sqrt(Math.pow(this.getDeltaX(position), 2) + Math.pow(this.getDeltaY(position), 2)));
	}

	getDistanceOnLinePointArray(positionOrg,distance)
	{
		var positionList = new Array();
		var modX = 0.0;
		var modY = 0.0;
	
		// what if they are top of each other?
		if (this.getDeltaX(positionOrg) == 0 && this.getDeltaY(positionOrg) == 0)
		{
			modX += Math.random() - 0.5;
			modY += Math.random() - 0.5;
		}
	
		var position = new Position(positionOrg.x + modX, positionOrg.y + modY);
	
		// this is when the slope is undefined (totally horizontal line)
		if (position.getX() == this.getX())
		{
			var p1 = new Position(position.getX(),position.getY()+distance);
			var p2 = new Position(position.getX(),position.getY()-distance);
			p1.distance = this.getDistance(p1)
			p2.distance = this.getDistance(p2)
	
			positionList.push(p1);
			positionList.push(p2);
			return(positionList);
		}
	
		// get the equation for the line m=slope b=y-intercept
		var m = this.getDeltaY(position) / this.getDeltaX(position);
		var b = this.getY() - (m * this.getX());
	
		var xPlus = position.getX() + distance / Math.sqrt(1 + (m * m));
		var xMinus = position.getX() - distance / Math.sqrt(1 + (m * m));
		var yPlus = xPlus * m + b;
		var yMinus = xMinus * m + b;
	
		var p1 = new Position(xPlus, yPlus);
		var p2 = new Position(xMinus, yMinus);
		p1.distance = this.getDistance(p1)
		p2.distance = this.getDistance(p2)
	
		positionList.push(p1);
		positionList.push(p2);
		return(positionList);
	}

	getDistancePostionList(positionList)
	{
		var distanceList = new Array();
		for(var i=0;i<positionList.length;i++)
		{
			var p = positionList[i];
			var d = this.getDistance(p);
			var position = new Position(p.getX(), p.getY());
			position.distance = d;
			distanceList.push(position);
		}
		return (distanceList);
	}

	getDistanceOnLinePointArrayClosest(position,distance)
	{
		var positionList = this.getDistanceOnLinePointArray(position,distance);
		var closest = null;
		for(var i=0;i<positionList.length;i++)
		{		
			var position = positionList[i];
			if(closest==null)
			{
				closest = position;
			}
			else if(position.distance < closest.distance)
			{
				closest = position;
			}
		}
		////console.log("closest="+CommontoString(closest)+" given distance="+distance+" position="+CommontoString(position)+" list="+CommontoString(positionList))
		return (closest);
	}

	getDistanceOnLinePointArrayFarthest(position,distance)
	{
		var positionList = this.getDistanceOnLinePointArray(position,distance);
		var farthest = null;
		for(var i=0;i<positionList.length;i++)
		{
			var position = positionList[i];
			if(farthest==null)
			{
				farthest = position;
			}
			else if(position.distance > farthest.distance)
			{
				farthest = position;
			}
		}
		return (farthest);
	}
}

//<js2node>
module.exports = Position;
console.log("Loading:Position");
//</js2node>
