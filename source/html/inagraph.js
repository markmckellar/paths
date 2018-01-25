(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
class Common
{
	constructor(values)
	{
		this.values = values;
		console.log("101");
	}
	
	static inheritsFrom(child, parent)
	{
	    child.prototype = Object.create(parent.prototype);
	}


	static stringifyCommon(obj, replacer, spaces, cycleReplacer)
	{
	  return JSON.stringify(obj, this.serializerCommon(replacer, cycleReplacer), spaces)
	}

	static getDayOfWeek(date)
	{   
	    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][ date.getDay() ];
	};
	
	test(test)
	{
		console.log("Common:test:"+test);
	}

	static serializerCommon(replacer, cycleReplacer)
	{
	  var stack = [], keys = []

	  if (cycleReplacer == null) cycleReplacer = function(key, value) {
	    if (stack[0] === value) return "[Circular ~]"
	    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
	  }

	  return function(key, value) {
	    if (stack.length > 0) {
	      var thisPos = stack.indexOf(this)
	      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
	      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
	      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
	    }
	    else stack.push(value)

	    return replacer == null ? value : replacer.call(this, key, value)
	  }
	}

	static getColorFromString(colorString)
	{
		var transparency = 1.0;
		if(colorString.length==6)
		{
			colorString += "ff";
		}
		
		var color = "rgba("+
				parseInt(colorString.substring(0,2), 16)+","+
				parseInt(colorString.substring(2,4), 16)+","+
				parseInt(colorString.substring(4,6), 16)+","+
				parseInt(colorString.substring(6,8), 16)/255.0+")";
		
		return(color);
	}

	static logInsertArray(array,printValueFunction)
	{
		for(var i=0;i<array.length;i++)
		{
			console.log("i="+printValueFunction(array[i]));
		}
	}	
	
	static insertIntoArray(toInsert,array,position)
	{
		array.splice(position,0,toInsert);
	}	
	
	static shuffleArray(array)
	{
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}

	static removeItemFromArray(array,item)
	{
		var index = array.indexOf(item);
		if (index > -1)
		{
		    array.splice(index, 1);
		}
	}
	
	static toString(object)
	{
		return(JSON.stringify(object));
	}
}


//<js2node>
module.exports = Common;
console.log("Loading:Common");
//</js2node>

},{}],2:[function(require,module,exports){
var Position = require('../position/position');

class Connector
{
	constructor(connectorFunction,connectorDisplay)
	{
		Connector.createConnector(this,connectorFunction,connectorDisplay);
	}

	static createConnector(connector,connectorFunction,connectorDisplay)
	{
		connector.nodes = new Array();
		connector.connectorFunction = connectorFunction;	
		connector.connectorDisplay = connectorDisplay;	
	}

	executeConnectorFunction(timestamp,node)
	{
		this.connectorFunction(this,node,timestamp)
	}

	containsPostion(position)
	{
		console.log("Node:containsPostion:"+this.name+":default, will always fail");
		return(false);
	}

	addNodeList(nodeList)
	{
		for(var i=0;i<nodeList.length;i++)
		{
			this.addNode(nodeList[i]);
		}
	}

	addNode(node)
	{
		this.nodes.push(node);
		node.connectors.push(this);
	}

	removeNode(node)
	{
		// console.log("Connector removeNode before:"+
		// "node="+node.name+
		// ":this.nodes="+this.nodes.length+
		// ":node.connectors="+node.connectors.length+
		// "");
		Common.removeItemFromArray(this.nodes,node);
		Common.removeItemFromArray(node.connectors,this);
		
		// console.log("Connector removeNode after :"+
		// "node="+node.name+
		// ":this.nodes="+this.nodes.length+
		// ":node.connectors="+node.connectors.length+
		// "");
	}

	initProcessor()
	{
		var positionList = new Array();
		if (this.springAnchorPoint != null)
		{
			if (this.anchorOffsetPoint == null)
			{
				positionList.push(this.springAnchorPoint);
			}
			else
			{
				positionList.push(this.springAnchorPoint.createByAdding(this.anchorOffsetPoint));
			}
		}
		return(positionList);
	}

	calulateMovementExp(node,positionList,randomStrengthFactor,relaxedDistance,elasticityFactor)
	{
		if (positionList.length>0)
		{
			// look at each position and make a new list of positions the
			// "relaxed" distance away
			var animateList = new Array();
			var x = 0.0;
			var y = 0.0;
			for(var i=0;i<positionList.length;i++)
			{
				var position = node.position.getDistanceOnLinePointArrayClosest(
						positionList[i],
						relaxedDistance+(randomStrengthFactor/2-randomStrengthFactor*Math.random())
						);
				x += position.getX()+(randomStrengthFactor/2-randomStrengthFactor*Math.random());
				y += position.getY()+(randomStrengthFactor/2-randomStrengthFactor*Math.random());		
				animateList.push(position);
			}

			// find the average "relaxed" position
			var averagePosition = new Position(x / positionList.length,y / positionList.length);
			var distanceToAveragePosition = node.position.getDistance(averagePosition);

			// take the average position and move towards it based upon the
			// elasticity factor
			var movePosition = averagePosition.getDistanceOnLinePointArrayClosest(
					node.position,
					distanceToAveragePosition * elasticityFactor
					);

			// add this position to the list of points this node needs to move
			// to
			node.positionMoveList.push(movePosition);
		}
	}

	calulateMovement(node,positionList,randomStrengthFactor)
	{
		if (positionList.length>0)
		{
			// look at each position and make a new list of positions the
			// "relaxed" distance away
			var animateList = new Array();
			var x = 0.0;
			var y = 0.0;
			for(var i=0;i<positionList.length;i++)
			{
				var position = node.position.getDistanceOnLinePointArrayClosest(
						positionList[i],
						this.relaxedDistance+randomStrengthFactor*Math.random()
						);
				x += position.getX();
				y += position.getY();		
				animateList.push(position);
			}

			// find the average "relaxed" position
			var averagePosition = new Position(x / positionList.length,y / positionList.length);
			var distanceToAveragePosition = node.position.getDistance(averagePosition);

			// take the average position and move towards it based upon the
			// elasticity factor
			var movePosition = averagePosition.getDistanceOnLinePointArrayClosest(
					node.position,
					distanceToAveragePosition * this.elasticityFactor
					);

			// add this position to the list of points this node needs to move
			// to
			node.positionMoveList.push(movePosition);
		}
	}
}

// <js2node>
module.exports = Connector;
console.log("Loading:Connector");
// </js2node>

},{"../position/position":17}],3:[function(require,module,exports){
var Connector = require('../connector/connector');

class GroupConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor)
	{
		super();

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
		Connector.createConnector(this,this.processGroupSpringConnectorOneNodeToConnectedNodes,connectorDisplay);
	}
	
	processGroupSpringConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
	}

	processWallSpringRepulseOneNode(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
	}
}

//<js2node>
module.exports = GroupConnector;
console.log("Loading:GroupConnector");
//</js2node>

},{"../connector/connector":2}],4:[function(require,module,exports){
var Connector = require('../connector/connector');

class ShapeConnector extends Connector
{
	constructor(node,connectorDisplay,shape,anchorOffsetPoint,relaxedDistance,elasticityFactor,outsideRelaxedDistance,outsideElasticityFactor)
	{
		super();

		this.node = node;
		this.springAnchorPoint = node.position;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
		this.outsideRelaxedDistance = outsideRelaxedDistance;
		this.outsideElasticityFactor = outsideElasticityFactor;
		this.shape = shape;
		//////////console.log("CREATE:"+shape);
		Connector.createConnector(this,ShapeConnector.prototype.processShapeConnectorOneNodeToConnectedNodes,connectorDisplay);
	}
	
	processShapeConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
	//	var positionList = connector.initProcessor();
		var positionList = new Array();
	
		
		if(!this.shape.containsPosition(node.position,this.node))
		{
			/************
			var onShapeLinePosition = this.shape.findClosestPointInShapeFromStartingPoint(node.position,this.node);
			positionList.push(onShapeLinePosition);
			connector.calulateMovementExp(node,positionList,0.0,this.outsideRelaxedDistance,this.outsideElasticityFactor);
			****************/
			var averagePointTransformed = this.shape.getAveragePointTransformed(this.node)
			//positionList.push(this.node.position);
			positionList.push(averagePointTransformed);
			
			var outsideRelaxDistance = this.outsideRelaxedDistance;
			var outsideElasticityFactor = this.outsideElasticityFactor;
			outsideElasticityFactor = 0.025;
			if(distance>outsideRelaxDistance*1.25) 
			{
				console.log("its outside!!:node="+node.name+" distance="+distance);
				outsideElasticityFactor = 0.01;
			}
				 
			connector.calulateMovementExp(
				node,
				positionList,
				0.0,
				outsideRelaxDistance,
				outsideElasticityFactor);
	
			//connector.calulateMovementExp(node,positionList,0.0,0.0,0.5);
		}
		else
		{
			var shapeArea = this.shape.getShapeArea();
			var minAreaPerNode = shapeArea / connector.nodes.length;
			//var spacing = minAreaPerNode/2;//Math.sqrt(minAreaPerNode);
			var spacing = Math.sqrt(minAreaPerNode)*1.01;//*2.3;
			if(spacing==0) spacing = 1;
			//var spacing = Math.sqrt(minAreaPerNode)*1.3;
			/*
			if(node.isSelected)
			{
				console.log("node name:"+node.name);
				console.log("	shapeArea:"+shapeArea);
				console.log("	minAreaPerNode:"+minAreaPerNode);
				console.log("	spacing:"+spacing);
			}
			*/
	
			this.relaxedDistance = spacing;
			for(var i=0;i<connector.nodes.length;i++)
			{
				var b = connector.nodes[i];
				
				/*
				if(node.isSelected)
				{
					var d = node.position.getDistance(b.position);
	
					console.log("	checking:"+b.name+" distance="+d);
				}
				*/
				if(b != node && this.shape.containsPosition(b.position,this.node))
				{
					var distance = node.position.getDistance(b.position);
					if (distance<spacing)
					{
						positionList.push(b.position);
					}
				}
			}
			//if(node.isSelected) console.log("---------------------------------------------------");
	
			connector.calulateMovementExp(node,positionList,0.0,this.relaxedDistance,this.elasticityFactor);
			// move it to a new spacing distance (still in the shape)
		}
		
		//connector.calulateMovement(node,positionList,0);
	
		//if(shape.containsPosition())
		// if it is not inside the shape move into the shape fast as possible
		//        ..you can cycle through the sides and find the closet intersection point.
		//        ..this can probably be optimized by looking at each point first
		// if it is inside the shape then :
		//        ..find he average distance between the points (only check those so close?!?!?_
		//        if its distance is great than the average then move away for the CON of the sampling
		//        if the distance is less than the average hen move towards the COM of the sampling
		//      ..the average space be able to to be calculated 
		//
		//      function to find the average distance between a list of points
		///     if you look at the area you should be able to dive it by the size o the sampling
		//      to get this average....
		//		if we limited it to a pe slice it is easy... a slice of the pie's area is easy to calculate
		//
		//		for a closed list of polygons it is a sum of triangles... should circles
		// 		be a special case?
		/*
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			if (b != node && distance<connector.relaxedDistance)
			{
				positionList.push(b.position);		
			}
	
			
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
		*/
	}

	processWallSpringRepulseOneNode(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
	}
}

//<js2node>
module.exports = ShapeConnector;
console.log("Loading:ShapeConnector");
//</js2node>

},{"../connector/connector":2}],5:[function(require,module,exports){
var Connector = require('../connector/connector');

class  WallConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor)
	{
		super();

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
		Connector.createConnector(this,WallConnector.prototype.processWallSpringRepulseOneNode,connectorDisplay);
	}

	processWallSpringRepulseOneNode(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		if((node.position.getX()-node.width/2)<0)
		{
			node.position.setX(0+node.width/2);
		}
		if((node.position.getX()+node.width/2)>world.canvasHolder.getWidth())
		{
			node.position.setX(world.canvasHolder.getWidth()-node.width/2);	
		}
		if((node.position.getY()-node.height/2)<0)
		{
			node.position.setY(0+node.height/2);
		}
		if((node.position.getY()+node.height/2)>world.canvasHolder.getHeight())
		{
			node.position.setY(world.canvasHolder.getHeight()-node.height/2);
		}
		
		connector.calulateMovement(node,positionList,0);
	}
}

//<js2node>
module.exports = WallConnector;
console.log("Loading:WallConnector");
//</js2node>

},{"../connector/connector":2}],6:[function(require,module,exports){
class ConnectorDisplay
{
	constructor(displayInfo)
	{
		ConnectorDisplay.createConnectorDisplay(this,displayInfo);
	}

	static createConnectorDisplay(connectorDisplay,displayInfo)
	{
		connectorDisplay.displayInfo = displayInfo;
	}

	drawConnector(canvasHolder,connector,node)
	{
	}

	containsPostion(position,connector)
	{
		return(false);
	}
}

//<js2node>
module.exports = ConnectorDisplay;
console.log("Loading:ConnectorDisplay");
//</js2node>

},{}],7:[function(require,module,exports){
var ConnectorDisplay = require('../../nodes/connectordisplay/connectordisplay');

class ConnectorDisplayEmpty extends ConnectorDisplay
{
	constructor(displayInfo) 
	{
		super(displayInfo);
	}

	drawConnector(canvasHolder,connector,node)
	{
	}
}
//<js2node>
module.exports = ConnectorDisplayEmpty;
console.log("Loading:ConnectorDisplayEmpty");
//</js2node>

},{"../../nodes/connectordisplay/connectordisplay":6}],8:[function(require,module,exports){
var Position = require('../nodes/position/position');
var CanvasHolder= require('../nodes/nodecanvas/canvasholder');

class Node
{
  constructor(name,position,offset,canvasHolder,graphData,infoData)
  {
	  Node.initNode(this,name,position,offset,canvasHolder,graphData,infoData);
  }
  
  static initNode(node,name,position,offset,canvasHolder,graphData,infoData)
  {
		if(graphData==null) graphData = new Object();
		
		node.name = name;
		node.canvasHolder = canvasHolder;
		node.position = position;
		node.graphData = graphData;
		node.infoData = infoData;
		node.offset = offset;
		
		node.nodes = new Array();
		node.positionMoveList = new Array();
		node.connectors = new Array();
		node.isAnimated = true;
		node.isSelected = false;
		node.layer=0;
		
		node.connectorPosition = new Position(0,0);

		if(node.graphData.initGraphData!=null) node.graphData.initGraphData(node);		
  }
  
  drawCanvas(timestamp)
  {
  	this.setAnimationTimes();

  	this.clearCanvas();
  	
      for(var i=0;i<this.nodes.length;i++)
      {
          var node = this.nodes[i];
          if(this.isAnimated) node.animateCalculate(timestamp);
      }

      for(var i=0;i<this.nodes.length;i++)
      {
      	var node = this.nodes[i];
      	if(this.isAnimated)  node.animateFinalize(timestamp);
      	node.drawCanvas(timestamp);
      }
      
      this.drawConnectors(); 
      this.drawNodes();

      if(this.extraAnimation!=null) this.extraAnimation(timestamp);
      
      this.draw();
      this.debugFunction();
  }


	getNodeUiDisplay(node)
	{
		return(this.name);
	}
	addNode(node)
	{
		this.nodes.push(node);
		node.canvasHolder = this.canvasHolder.clone(node.position);
		//console.log("addNode node.canvasHolder:"+CommontoString(node.canvasHolder));
		this.nodes.sort(function(a, b) {
	  	  return(a.layer-b.layer);
	  	});	
	}
	
	removeNode(node)
	{
		CommonremoveItemFromArray(this.nodes,node);
	
	}
	
	clearCanvas(timestamp)
	{
	}
	
	draw()
	{
	}
	
	
	drawConnectors(timestamp)
	{
		if(this.isVisable) 
		{
		    for(var i=0;i<this.nodes.length;i++)
		    {
		    	var node = this.nodes[i];
		    	for(var j=0;j<node.connectors.length;j++)
		    	{
		    		var connector = node.connectors[j];
		    		connector.connectorDisplay.drawConnector(this.canvasHolder,connector,node);
		        }
		    }
		}
	}
	
	drawNodes(timestamp)
	{
		if(this.isVisable) 
		{
		   	for(var i=0;i<this.nodes.length;i++)
		   	{
		   		var node = this.nodes[i]; 
		   		if(this.isVisable) node.graphData.nodeDisplay.drawNode(this.canvasHolder,node);
		   	}
		}
	}
	
	setAnimationTimes(timestamp)
	{
	}
	
	debugFunction()
	{
	}
	
	getNodeContainingPosition(position)
	{
		var foundNode = null;
	
	    for (var i=this.nodes.length-1;i>=0;i--)
	    {
	        var node = this.nodes[i];
	        if(node.graphData.nodeDisplay.containsPosition(position,node))
	        {
	        	foundNode = node;
	        	break;
	        }
	    }
	    return(foundNode);
	}
	
	
	
	animateCalculate(timestamp)
	{
		if(this.isAnimated)
		{
			for (var i = 0; i < this.connectors.length; i++)
			{
				var connector = this.connectors[i];
				connector.executeConnectorFunction(timestamp,this)
			}
		}
	}
	
	animateFinalize(timestamp)
	{
		//if(this.isAnimated)
		{
			for (var i = 0; i < this.connectors.length; i++)
			{
				this.setNewPosition();
			}
			this.positionMoveList.length = 0;
	
		}
	}
	
	containsPostion(position)
	{
		return(
				(
						(this.position.getX()-this.width/2)<=position.getX() &&
						(this.position.getX()+this.width/2)>=position.getX() &&
						(this.position.getY()-this.height/2)<=position.getY() &&
						(this.position.getY()+this.height/2)>=position.getY()
				)
			);
	}
	
	setNewPosition()
	{
		if(this.positionMoveList.length==0)  this.positionMoveList.push(this.position);	
		var newPosition = new Position(0,0);
		
		for (var i = 0; i < this.positionMoveList.length; i++)
	    {
	        var onePosition =  this.positionMoveList[i];
	        newPosition.setX(newPosition.getX()+onePosition.getX());
	        newPosition.setY(newPosition.getY()+onePosition.getY());
		}
	
		this.position.setX(newPosition.getX() / this.positionMoveList.length);
		this.position.setY(newPosition.getY() / this.positionMoveList.length);	
	}

}

//<js2node>
module.exports = Node;
console.log("Loading:Node");
//</js2node>

},{"../nodes/nodecanvas/canvasholder":9,"../nodes/position/position":17}],9:[function(require,module,exports){
var Position = require('../position/position');

class CanvasHolder
{
	constructor(canvasName)
	{
		this.canvasName = canvasName;
		this.canvas = document.getElementById(canvasName);
		this.context = this.canvas.getContext('2d');
		this.origin = new Position(0,0);
		this.isCanvasVisable = true;
	}
	
	clone(origin)
	{
		var canvasHolder = new Object();
		canvasHolder.canvasName = this.canvasName;
		canvasHolder.canvas = this.canvas;
		canvasHolder.context = this.context;
		canvasHolder.origin = origin;
		canvasHolder.isCanvasVisable = this.isCanvasVisable;
		return(canvasHolder);
	}
	
	isVisable()
	{
		return(this.isCanvasVisable);
	}
	
	getWidth()
	{
		return(this.canvas.width);
	}
	
	getHeight()
	{
		return(this.canvas.height);
	}
}


//<js2node>
module.exports = CanvasHolder;
console.log("Loading:CanvasHolder");
//</js2node>

},{"../position/position":17}],10:[function(require,module,exports){
class MoueStatus
{
	constructor(isDown,startPosition,position,node,nodeStartPosition)
	{
		this.isDown = isDown;
		this.startPosition = startPosition;
		this.position = position;
		this.node = node;
		this.nodeStartPosition = nodeStartPosition;
	}
}
//<js2node>
module.exports = MoueStatus;
console.log("Loading:MoueStatus");
//</js2node>

},{}],11:[function(require,module,exports){
var Position = require('../position/position');
var Node = require('../node');

class NodeCanvas extends Node
{
	  constructor(canvasHolder)
	  {
		  super(	canvasHolder.canvasName,
					new Position(0,0),
					new Position(0,0),
					canvasHolder,
					null,
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
			nodeCanvas.timeFactor = 0.01;
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
		if(this.isVisable())
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

},{"../node":8,"../position/position":17}],12:[function(require,module,exports){
var MouseStatus = require('../nodecanvas/mousestatus');
var Position = require('../position/position');

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
			nodeCanvasMouse.mouseStatus = new MoueStatus(false,new Position(0,0),new Position(0,0),null,null);
			nodeCanvasMouse.initCavansPointer();
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

},{"../nodecanvas/mousestatus":10,"../position/position":17}],13:[function(require,module,exports){
var NodeDisplay = require('../nodedisplay/nodedisplay');
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

},{"../../common/common":1,"../nodedisplay/nodedisplay":14}],14:[function(require,module,exports){
class NodeDisplay
{
	constructor(displayInfo)
	{
		NodeDisplay.createNodeDisplay(this,displayInfo);
	}
	
	static createNodeDisplay(nodeDisplay,displayInfo)
	{
		nodeDisplay.displayInfo = displayInfo;
	}
	
	drawNode (canvasHolder,node)
	{
	   
	}
	
	containsPosition (postion,node)
	{
	}
	
	fillTextMutipleLines(context,text,x,y,lineHeight,splitChar)
	{
		var lines = text.split(splitChar);
	    var line = '';
	
	    for(var n = 0; n < lines.length; n++)
	    {
	      var metrics = context.measureText(lines[n]);
	      context.fillText(lines[n], x, y);
	      y = y+lineHeight; 
	    }
	    context.fillText(line, x, y);
	 }
	
	metricsTextMutipleLines(context,text,lineHeight,splitChar)
	{
		var lines = text.split(splitChar);
	    var line = '';
	    var maxWidth = 0;
	    var totalHeight = 0;
	    for(var n = 0; n < lines.length; n++)
	    {
	      var metrics = context.measureText(lines[n]);
	      if(metrics.width>maxWidth) maxWidth = metrics.width;
	      totalHeight = totalHeight + lineHeight;
	    }
	    return({width:maxWidth,height:totalHeight});
	 }
	
	roundedRect(context,x,y,w,h,r,borderWitdh,borderColor,rectColor)
	{
		  if (w < 2 * r) r = w / 2;
		  if (h < 2 * r) r = h / 2;
		  context.beginPath();
		  context.moveTo(x+r, y);
		  context.arcTo(x+w, y,   x+w, y+h, r);
		  context.arcTo(x+w, y+h, x,   y+h, r);
		  context.arcTo(x,   y+h, x,   y,   r);
		  context.arcTo(x,   y,   x+w, y,   r);
		  context.closePath();
		/*
	    context.beginPath();
	    context.moveTo(x, y);
	    context.lineTo(x + width - cornerRadius, y);
	    context.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
	    context.lineTo(x + width, y + height);
	   */ 
	    context.lineWidth = borderWitdh;
	    context.fillStyle = rectColor;
	    context.strokeStyle = borderColor;
	    
	    context.stroke();
	    context.fill();
	
	}
}
//<js2node>
module.exports = NodeDisplay;
console.log("Loading:NodeDisplay");
//</js2node>

},{}],15:[function(require,module,exports){
var NodeDisplay = require('../nodedisplay/nodedisplay');
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

},{"../../common/common":1,"../nodedisplay/nodedisplay":14}],16:[function(require,module,exports){
var Position = require('../position/position');
var NodeDisplay = require('../nodedisplay/nodedisplay');
var Common = require('../../common/common');
var Shape = require('../shapes/shape');

class TriangleDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
		
		var pointList = new Array();
		
		pointList.push(new Position(0,-(this.displayInfo.height/2)));
		pointList.push(new Position(this.displayInfo.width/2,this.displayInfo.height/2));
		pointList.push(new Position(-(this.displayInfo.width/2),this.displayInfo.height/2));
		pointList.push(new Position(0,-(this.displayInfo.height/2)));
	
		this.pointList = pointList;
		this.shape = new Shape(pointList,new Position(0,0))
	}
	
	containsPosition(position,node)
	{
		return(this.shape.containsPosition(position,node));
	}
	
	
	drawNode(canvasHolder,node)
	{
		this.shape.drawShape(canvasHolder,node,this.displayInfo);
	}
}
//<js2node>
module.exports = TriangleDisplay;
console.log("Loading:TriangleDisplay");
//</js2node>

},{"../../common/common":1,"../nodedisplay/nodedisplay":14,"../position/position":17,"../shapes/shape":19}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
class BoundingBox
{
	constructor(pointList,offset)
	{
		this.initDone = false;
		this.pointList = pointList;
		this.offset = offset;
		this.initBoundingBox();
	
	}
	
	
	containsPosition(position,node)
	{
		if(!this.initDone) this.initBoundingBox();
	
		return(
				(
						(this.xMin.getX()+node.position.getX()+this.offset.getX())>=position.x &&
						(this.xMax.getX()+node.position.getX()+this.offset.getX())<=position.x &&
						(this.yMin.getY()+node.position.getY()+this.offset.getY())>=position.y &&
						(this.yMax.getY()+node.position.getY()+this.offset.getY())<=position.y
				)
			);
	}
	
	initBoundingBox()
	{
		this.initDone = true;
		//this.pointList = pointList;
		//this.offset = offset;
	
	
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

},{}],19:[function(require,module,exports){
var Position = require('../position/position');
var BoundingBox = require('../shapes/boundingbox');
var Position = require('../position/position');

class Shape
{
	constructor(pointList,offset)
	{
		this.pointList = pointList;
		this.offset = offset;
		this.averagePoint = new Position(0,0);
		this.boundingBox = new BoundingBox(pointList,offset);
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
			var point = this.pointList[i].createByAdding(node.position).createByAdding(this.offset);
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
	    var averagePointTransformed = this.averagePoint.createByAdding(node.position).createByAdding(this.offset);
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
		var lookFromPosition = startingPosition.createBySubtracting(node.position).createBySubtracting(this.offset)
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
		
		var finalPointTranslated = finalPoint.createByAdding(node.position).createByAdding(this.offset);
		
		/*
		console.log(CommontoString(closestInfo));
	    console.log("startingPosition="+CommontoString(startingPosition));
		console.log("lookFromPosition="+CommontoString(lookFromPosition));
		console.log("node.position="+CommontoString(node.position));
		console.log("this.offset="+CommontoString(this.offset));
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
			var pi = this.pointList[i].createByAdding(node.position).createByAdding(this.offset);
			var pj = this.pointList[j].createByAdding(node.position).createByAdding(this.offset);
			  
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

},{"../position/position":17,"../shapes/boundingbox":18}],20:[function(require,module,exports){
var Node = require('../nodes/node');
var Position = require('../nodes/position/position');
var Common = require('../common/common');
var ConnectorDisplayEmpty = require('../nodes/connectordisplay/connectordisplayempty');
var ShapeConnector = require('../nodes/connector/shapeconnector');

class Junction extends Node
{
	constructor(name,position,offset,shapeList,graphData,infoData)
	{
		super(name,position,offset,shapeList,graphData,infoData);
		Junction.initJunction(this,name,position,offset,shapeList,graphData,infoData);
	}
	
	static initJunction(junction,name,position,offset,shapeList,graphData,infoData)
	{
		junction.pathArray = new Array();
		junction.walkerObject = new Object();
		junction.walkerTypeConnections = new Object();
		junction.layer=1;
	}

	
	getCreateWalkerTypeConnection(walkerType)
	{
		if(!this.walkerTypeConnections.hasOwnProperty(walkerType))
		{
			var walkerGraphData = worldDisplay.walkerDisplayTypes["generic"];
			if(worldDisplay.walkerDisplayTypes.hasOwnProperty(walkerType))
			{
				walkerGraphData = worldDisplay.walkerDisplayTypes[walkerType];
			}
			/*
			console.log("adding "+walkerType+
					" this.connectorPosition="+CommontoString(this.connectorPosition)+
					" this.position="+CommontoString(this.position)+		
					"");
					*/
			/*
			console.log("nd ="+CommontoString(walkerGraphData)+
					"");
					*/
			var shapeNode = 
				new Node("shapeNode for "+this.name+" "+walkerType,
						this.position,
						this.connectorPosition,
						world.canvasHolder,
				{
					nodeDisplay:new ArcDisplayShape(
					{
						fillColor:walkerGraphData.nodeDisplay.displayInfo.fillColor,
						borderColor:"000000ff",
						selectFillColor:"00ff007f",selectBorderColor:"000000ff",
						borderWidth:1,
						radius:25,
						curvePoints:16,
						startAngle:0,
						endAngle:320,
						width:25,
						height:25,
					}),
				},
				new Object()
				);
			shapeNode.layer=10;
			shapeNode.debugFunction()
			{
				//console.log("debugFunction:"+this.name);
			}
			
			this.walkerTypeConnections[walkerType] = new ShapeConnector(
					shapeNode,
					new ConnectorDisplayEmpty(),
					shapeNode.graphData.nodeDisplay.shape,
					new Position(0,0),
					10,
					0.5,
					0.0,
					0.95);
			this.walkerTypeConnections[walkerType].shapeNode = shapeNode;
			this.nodes.push(shapeNode);
			this.shapeNode = shapeNode;
			
		}
		var connection = this.walkerTypeConnections[walkerType];
		return(connection);
	}
	
	getNodeUiDisplay(node)
	{
		return(this.name+" : "+this.getWalkerArray().length);
	}
	
	getWalkerKeysSorted(node)
	{
		var walkerTypeKeys = new Array()
		var totalWalkers = 0;
		for (var walkerType in this.walkerTypeConnections)
		{
			walkerTypeKeys.push(walkerType);
			var connector = this.walkerTypeConnections[walkerType];
			totalWalkers += connector.nodes.length;
			//console.log(walkerType+":totalWalkers="+totalWalkers+":for conector="+connector.nodes.length);
	
		}
		walkerTypeKeys.sort();
		return(walkerTypeKeys);
	}
	
	getWalkerArrayToFix()
	{
		var walkerArray = this.walkerObject.values();
		return(walkerArray);
	}
	
	getWalkerArray()
	{
		// this is SLOW.. why does the above not work?!?!?!
		var walkerArray = new Array();
		var walkerTypeKeys = this.getWalkerKeysSorted();
		for (var i=0;i<walkerTypeKeys.length;i++)
		{
			var walkerType = walkerTypeKeys[i];
			var connector = this.walkerTypeConnections[walkerType];
			for(var j=0;j<connector.nodes.length;j++)
			{
				walkerArray.push(connector.nodes[j]);
	
			}
		}
	
		return(walkerArray);
	}
	
	adjustwalkerTypeConnections()
	{
		var walkerTypeKeys = this.getWalkerKeysSorted();
		var totalWalkers = this.getWalkerArray().length;
	//console.log("walekrCount="+totalWalkers);
		//console.log("walkerCountalkerCount="+this.walkerObject);
		/*
		new Array()
		var totalWalkers = 0;
		for (var walkerType in this.walkerTypeConnections)
		{
			walkerTypeKeys.push(walkerType);
			var connector = this.walkerTypeConnections[walkerType];
			totalWalkers += connector.nodes.length;
			//console.log(walkerType+":totalWalkers="+totalWalkers+":for conector="+connector.nodes.length);
	
		}
		walkerTypeKeys.sort();*/
		var angle = 0;
		// area = pi r^2
		// so... if we have 10 nodes...
		// and a node takes "100 area" per node (a 10X10 area)
		// 10 nodes and 100area^2
		// sqrt(area/pi) = r
		// sqrt( (area*numberNodes*areaPerNode)/PI ) = R
		var walkerArea = 25;
		//var radius = Math.sqrt( totalWalkers/Math.PI )*4;
		var radius = Math.sqrt( totalWalkers*walkerArea) / Math.PI;
		
		for(var i=0;i<walkerTypeKeys.length;i++)
		{
			var walkerType = walkerTypeKeys[i];
			var connector = this.walkerTypeConnections[walkerType];
			var percentOfWalkers = connector.nodes.length/totalWalkers;
			var walkerAngle = percentOfWalkers * 360;
			/*
			console.log(walkerType+
					":connector.nodes.length:"+connector.nodes.length+
					":percentOfWalkers:"+percentOfWalkers+
					":walkerAngle:"+walkerAngle+
	
					"");
	*/
			//console.log(walkerType+":before:"+CommontoString(connector.shapeNode.graphData.nodeDisplay));
			connector.shapeNode.graphData.nodeDisplay.displayInfo.startAngle = angle;
			angle += walkerAngle;
			connector.shapeNode.graphData.nodeDisplay.displayInfo.endAngle = angle;
			connector.shapeNode.graphData.nodeDisplay.displayInfo.radius = radius;
			////////connector.shapeNode.graphData.nodeDisplay = new ArcDisplayShape(connector.shapeNode.graphData.nodeDisplay.displayInfo)
			connector.shapeNode.graphData.nodeDisplay.init();
			/////////connector.shape = connector.shapeNode.graphData.nodeDisplay.shape;
			
			//console.log(walkerType+":after:"+CommontoString(connector.shapeNode.graphData.nodeDisplay));
			//console.log("----------------------------------------------");
		}
	}
	
	addWalker(walker)
	{
		this.walkerObject[walker] = walker;
		var connection = this.getCreateWalkerTypeConnection(walker.infoData.walkerTypeKey)
		connection.addNode(walker);
		
		this.adjustwalkerTypeConnections();
	}
	
	removeWalker(walker)
	{
		var connection = this.getCreateWalkerTypeConnection(walker.infoData.walkerTypeKey);
		delete this.walkerObject[walker]; 
		connection.removeNode(walker);	
		this.adjustwalkerTypeConnections();
	}
	
	log()
	{
		console.log("junction log:"+CommontoString(this));
	}

}
//<js2node>
module.exports = Junction;
console.log("Loading:Junction");
//</js2node>

},{"../common/common":1,"../nodes/connector/shapeconnector":4,"../nodes/connectordisplay/connectordisplayempty":7,"../nodes/node":8,"../nodes/position/position":17}],21:[function(require,module,exports){
var ConnectorDisplay = require('../../nodes/connectordisplay/connectordisplay');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');

class JunctionConnector extends ConnectorDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}
	
	drawConnector(canvasHolder,connector,node)
	{
		for(var j=0;j<connector.nodes.length;j++)
		{
			var nodeJ = connector.nodes[j];		
			var p = node.position.createByAdding(node.connectorPosition);
			var pj = nodeJ.position.createByAdding(nodeJ.connectorPosition);
			canvasHolder.context.lineWidth = 5;
			canvasHolder.context.strokeStyle = Common.getColorFromString("000000ff");
			canvasHolder.context.beginPath();
			canvasHolder.context.moveTo(p.getX(),p.getY());
			canvasHolder.context.lineTo(pj.getX(),pj.getY());
			canvasHolder.context.stroke();
		}
	}
}
//<js2node>
module.exports = JunctionConnector;
console.log("Loading:JunctionConnector");
//</js2node>

},{"../../common/common":1,"../../nodes/connectordisplay/connectordisplay":6,"../../nodes/nodedisplay/nodedisplay":14}],22:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');

class JunctionDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
		this.checkPositionInfo = {};
	}
	
	containsPosition(position,node)
	{
		var distance = node.checkPositionInfo.circlePosition.getDistance(position);
	
		//console.log("---- "+node.name+" -----------------------------------------------");
	
		return(
				(distance<=node.graphData.radius) ||
				(
						(node.checkPositionInfo.textX<=position.getX()) &&
						(node.checkPositionInfo.textX+node.checkPositionInfo.textWidth)>=position.getX() &&
						(node.checkPositionInfo.textY<=position.getY()) &&
						(node.checkPositionInfo.textY+node.checkPositionInfo.textHeight)>=position.getY()
				)
				);
	}
	
	
	drawNode(canvasHolder,node)
	{
	    var radiusAverage = 0;
	    for(var i=0;i<node.nodes.length;i++)
	    {
	     	var subNode = node.nodes[i];
	     	//console.log("ZZZZZZZZZZZZZZ::::"+CommontoString(subNode.graphData.nodeDisplay.displayInfo.radius));
	    	radiusAverage += subNode.graphData.nodeDisplay.displayInfo.radius;
	    }
	    radiusAverage = (radiusAverage / node.nodes.length)+this.displayInfo.borderWidth*5;
	
	    
	    
	    var junctionText = node.name;
	    
	    var rectPadding = this.displayInfo.fontPixelHeight/2;
	    
	    canvasHolder.context.font=this.displayInfo.fontStyle+" "+this.displayInfo.fontPixelHeight+"px "+this.displayInfo.fontFace; 
	    canvasHolder.context.textAlign="center";
	    var textMetrics = this.metricsTextMutipleLines(
	    		canvasHolder.context,
	    		junctionText,
	    		this.displayInfo.fontPixelHeight,
	    		"\n");
	    
	    var totalWidth = Math.max(/*node.graphData.radius*/radiusAverage+rectPadding,textMetrics.width+rectPadding+rectPadding);
	    var totalHeight = /*node.graphData.radius*2*/
	    	radiusAverage+
	    	this.displayInfo.borderWidth*2+
	    	node.graphData.textSpacer+
	    	textMetrics.height+rectPadding;
	    
	    node.width = totalWidth;
	    node.height = totalHeight;
	    
	    if(node.checkPositionInfo==null) node.checkPositionInfo = {};
	    node.checkPositionInfo.circlePosition = new Position(
	    		node.position.getX(),
	    		node.position.getY()-totalHeight/2+/*node.graphData.radius*/radiusAverage);
	    
		//node.connectorPosition = new Position(0,
		//		-(totalHeight/2-node.graphData.radius));
	    node.connectorPosition.setY(-(totalHeight/2-/*node.graphData.radius*/radiusAverage));
	    //node.shapeNode.position.copyFrom(node.checkPositionInfo.circlePosition);
	    
	
	    
	    node.checkPositionInfo.textX = node.position.getX()-(textMetrics.width+rectPadding)/2;
	    node.checkPositionInfo.textY = node.checkPositionInfo.circlePosition.getY()+
	    	/*node.graphData.radius*/radiusAverage+
	    	this.displayInfo.borderWidth+
	    	node.graphData.textSpacer;
	    node.checkPositionInfo.textWidth = textMetrics.width+rectPadding;
	    node.checkPositionInfo.textHeight = textMetrics.height+rectPadding;
	
	    
	    this.roundedRect(
	    		canvasHolder.context,
	 		   node.checkPositionInfo.textX,
	 		   node.checkPositionInfo.textY,
	 		   node.checkPositionInfo.textWidth,
	 		   node.checkPositionInfo.textHeight,
	 		   this.displayInfo.fontPixelHeight/3,
	 		   this.displayInfo.borderWidth,
	 		   Common.getColorFromString(this.displayInfo.rectBorderColor),
	 		   Common.getColorFromString(this.displayInfo.rectFillColor) );
	    
	    
	    canvasHolder.context.fillStyle=Common.getColorFromString(this.displayInfo.fontColor);
	
	    //context.fillText(text,node.position.getX(),node.position.getY()+node.graphData.radius+15);
	    this.fillTextMutipleLines(
	    		canvasHolder.context,
	    		junctionText,
	    		node.position.getX(),
	    		node.checkPositionInfo.textY+rectPadding*2+this.displayInfo.borderWidth,
	    		this.displayInfo.fontPixelHeight,
	    		"\n");
	    
	  
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
	    canvasHolder.context.arc(
				node.checkPositionInfo.circlePosition.getX(),
				node.checkPositionInfo.circlePosition.getY(),
				radiusAverage,//node.graphData.radius,
				0,
				Math.PI * 2, false);
	    canvasHolder.context.closePath();
	    canvasHolder.context.fill();
	    canvasHolder.context.lineWidth = this.displayInfo.borderWidth;
	    canvasHolder.context.stroke();
	
	
	    for(var i=0;i<node.nodes.length;i++)
	    {
	     	var subNode = node.nodes[i];
	     	subNode.position = node.checkPositionInfo.circlePosition;    	
	    	subNode.graphData.nodeDisplay.drawNode(node.canvasHolder,subNode);
	    }
	
	}
}
//<js2node>
module.exports = JunctionDisplay;
console.log("Loading:JunctionDisplay");
//</js2node>

},{"../../common/common":1,"../../nodes/nodedisplay/nodedisplay":14,"../../nodes/position/position":17}],23:[function(require,module,exports){
var Connector = require('../nodes/connector/connector');

class Path extends Connector
{
	constructor(junctionStart,junctionEnd,connectorDisplay,world)
	{
		super(null,connectorDisplay);
		Path.createPath(this,junctionStart,junctionEnd,connectorDisplay,world);
	}
	
	static createPath(path,junctionStart,junctionEnd,connectorDisplay,wolrd)
	{
		path.connectorDisplay = connectorDisplay;
		path.junctionStart = junctionStart;
		path.junctionEnd = junctionEnd;
		path.springAnchorPoint = null;
		path.anchorOffsetPoint = null;
		path.relaxedDistance = world.worldDisplay.relaxedDistanceDefault;
		path.elasticityFactor = world.worldDisplay.elasticityFactorDefualt;
		path.walkerObject = new Object();
		SpringConnector.createSpringConnector(path,
				path.connectorDisplay,
				path.springAnchorPoint,
				path.anchorOffsetPoint,
				path.relaxedDistance,
				path.elasticityFactor);
		path.addNode(junctionStart);
		path.addNode(junctionEnd);
	}
	
	getPathKey()
	{
		return(junctionStart.name+":"+junctionEnd.name);
	}
	
	log()
	{
		console.log("path log:"+CommontoString(this));
	}
}
//<js2node>
module.exports = Path;
console.log("Loading:Path");
//</js2node>

},{"../nodes/connector/connector":2}],24:[function(require,module,exports){
var Node = require('../nodes/nodecanvas/nodecanvas');
var NodeCanvas = require('../nodes/nodecanvas/nodecanvas');
var NodeCanvasMouse = require('../nodes/nodecanvas/nodecanvasmouse');
var Common = require('../common/common');
var Position = require('../nodes/position/position');
var Path = require('../paths/path');
var Walker = require('../paths/walker');
var Junction = require('../paths/junction');

class PathWorld extends NodeCanvas
{
	constructor(canvasHolder,junctionSpacer,worldWall,worldDisplay)
	{
		super(canvasHolder);
		PathWorld.initPathWorld(this,canvasHolder,junctionSpacer,worldWall,worldDisplay);
	}
	
	static initPathWorld(pathWorld,canvasHolder,junctionSpacer,worldWall,worldDisplay)
	{
		pathWorld.junctions = new Object();
		pathWorld.paths = new Object();
		pathWorld.walkers = new Object();
		pathWorld.worldUpdateQueue = new Array();
		pathWorld.worldUpdateQueue.isInNeedOfSorting = false
		pathWorld.junctionSpacer = junctionSpacer;
		pathWorld.worldWall = worldWall;
		pathWorld.worldDisplay = worldDisplay;
		pathWorld.lastDate = "";
		this.checkTimestamp = "";
		pathWorld.nodeCanvasMouse = new NodeCanvasMouse(pathWorld);
		pathWorld.fillStyle = worldDisplay.worldBackgroundColor;

	}
	
	drawCanvas(timestamp)
	{
		super.drawCanvas(timestamp);
		this.pathWolrdExtraAnimation(timestamp);
	}
	
	pathWolrdExtraAnimation(timestamp)
	{
		world.prepareWorldUpdateQueue();

		var localCheckTimestamp = this.animationExecTime*this.timeFactor + this.startTime.getTime();
		var checkDate = new Date(localCheckTimestamp);

		if(this.lastDate==null) this.lastDate=="";
		
		if(this.lastDate!=checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate))
		{
			this.lastDate = checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate);
			if(this.isAnimated) $('#world_date').html(this.lastDate);
		}
		
		this.checkTimestamp = localCheckTimestamp;
		if(this.isAnimated) while(this.isNextWorldUpdateReady(localCheckTimestamp))
		{
			var proccesed = this.processWorldUpdateQueue();
			if(proccesed!=null)
			{
				var date = new Date(proccesed.processTimestamp*1000+0*1000);//proccesed.getDate();
			}
		}	
		
		// process the walkers rules
		for (var walkerKey in this.walkers)
		{
			var walker = this.walkers[walkerKey];
			walker.processWalkerRules(world);
		}
	}

	
	
	
	log()
	{
		console.log("pathWorld log:"+CommontoString(this.worldDisplay));
	}
	
	
	isWalkerNew(walkerName)
	{
		return(!this.walkers.hasOwnProperty(walkerName));
	}
	
	isJunctionNew(junctionName)
	{
		return(!this.junctions.hasOwnProperty(junctionName));
	}
	
	isNextWorldUpdateReady(timestamp)
	{
		var ready = false;
		if(this.worldUpdateQueue.length>0)
		{
			ready = this.worldUpdateQueue[0].readyToBeProcessed(timestamp);
		}
		return(ready);
	}
	
	peekAtNextWorldUpdate()
	{
		var worldUpdate = null;
		if(this.worldUpdateQueue.length>0)
		{
			worldUpdate = this.worldUpdateQueue[0];
		}
		return(worldUpdate);
	}
	
	getCreatePath(junctionStart,junctionEnd,pathInfo)
	{
		var connectorDisplay = this.worldDisplay.pathTypes["generic"].connectorDisplay;
		if(this.worldDisplay.pathTypes.hasOwnProperty(pathInfo.pathTypeKey))
		{
			connectorDisplay = this.worldDisplay.pathTypes[pathInfo.pathTypeKey].connectorDisplay;
		}
		
		var path = null;
		var pathKey = this.getPathKey(junctionStart,junctionEnd);
		if(!this.paths.hasOwnProperty(pathKey))
		{
			this.paths[pathKey] = new Path(junctionStart,junctionEnd,connectorDisplay,this);
			var p = this.paths[pathKey];
		}
		var path = this.paths[pathKey];
		return(path);
	}
	
	getJuntionGraphData(junctionInfo)
	{
		var junctionGraphData = this.worldDisplay.junctionTypes["generic"];
	
		if(this.worldDisplay.junctionTypes.hasOwnProperty(junctionInfo.junctionTypeKey))
		{
			junctionGraphData = this.worldDisplay.junctionTypes[junctionInfo.junctionTypeKey];
	
		}
		return(junctionGraphData);
	}
	
	getCreateJunction(name,junctionInfo)
	{
		var junctionGraphData = this.getJuntionGraphData(junctionInfo);
		
		if(!this.junctions.hasOwnProperty(name))
		{
		//	console.log("getCreateJunction:New Junction:"+
		//			"name="+name+
		//			":junctionInfo="+CommontoString(junctionInfo));
			var startPosition = this.getStartPositionJunction();
			this.junctions[name] = new Junction(name,
					new Position(startPosition.getX(),startPosition.getY()),
							new Position(0,0),
							new Array(),
							junctionGraphData,
							junctionInfo);
			var j = this.junctions[name];
			//console.log("pathWorld getCreateJunction inner name:"+j.name)	
			this.addNode(j);
			this.worldWall.addNode(j);
			this.junctionSpacer.addNode(j);
		}
		var junction = this.junctions[name];
	
		return(junction);
	}
	
	getWalkerGraphData(walkerInfo)
	{
		var walkerGraphData = this.worldDisplay.walkerDisplayTypes["generic"];
		//console.log("getWalkerGraphData:looking up:"+CommontoString(walkerInfo));
		if(this.worldDisplay.walkerDisplayTypes.hasOwnProperty(walkerInfo.walkerTypeKey))
		{
			//console.log("     getWalkerGraphData:found:"+CommontoString(walkerInfo.walkerTypeKey));
			walkerGraphData = this.worldDisplay.walkerDisplayTypes[walkerInfo.walkerTypeKey];
		}
		return(walkerGraphData);
	}
	getCreateWalker(walkerName,walkerInfo)
	{
		var walkerGraphData = this.getWalkerGraphData(walkerInfo);
		
		if(!this.walkers.hasOwnProperty(walkerName))
		{
			var startPosition = this.getStartPositionWalker();
			this.walkers[walkerName] = new Walker(walkerName,
					new Position(startPosition.getX(),startPosition.getY()),
					new Position(0,0),
					new Array(),
					walkerGraphData,
					walkerInfo);
			var w = this.walkers[walkerName];
			this.addNode(w);
			this.worldWall.addNode(w);
			//this.junctionSpacer.addNode(j);
		}
		var walker = this.walkers[walkerName]; 
		return(walker);
	}
	
	removeWalker(walker)
	{
		//console.log("PathWorld.removeWalker:"+walker.name+" at "+walker.getCurrentJunction().name);
		if(walker.getCurrentJunction())	walker.getCurrentJunction().removeWalker(walker);
		this.removeNode(walker);
		this.worldWall.removeNode(walker);
		delete this.walkers[walker.name];
	}
	
	getTeleportPath(startJunction,endJunction)
	{
		var startJunctionName = "";
		var endJunctionName = "";
		if(startJunction!=null) startJunctionName = startJunction.name;
		if(endJunction!=null) endJunctionName = endJunction.name;
		var teleportPathReturn = null;
		for(var i=0;i<this.worldDisplay.teleportPaths.length;i++)
		{
			var teleportPath = this.worldDisplay.teleportPaths[i];
			var startJunctionRegExp = new RegExp(teleportPath.startJunction);
			var endJunctionRegExp = new RegExp(teleportPath.endJunction);
			if(
					startJunctionRegExp.test(startJunctionName) &&
					endJunctionRegExp.test(endJunctionName) &&
					startJunctionName!=endJunctionName)
			{
				teleportPathReturn = teleportPath;
				break;
			}
		}
		return(teleportPathReturn);
	}
	
	getEndPointMod(startJunction,endJunction)
	{
		var startJunctionName = "";
		var endJunctionName = "";
		if(startJunction!=null) startJunctionName = startJunction.name;
		if(endJunction!=null) endJunctionName = endJunction.name;
		var endPointReturn = null;
		for(var i=0;i<this.worldDisplay.endPointMods.length;i++)
		{
			var endPoint = this.worldDisplay.endPointMods[i];
			var startJunctionRegExp = new RegExp(endPoint.startJunction);
			var endJunctionRegExp = new RegExp(endPoint.endJunction);
			if(
					startJunctionRegExp.test(startJunctionName) &&
					endJunctionRegExp.test(endJunctionName) &&
					startJunctionName!=endJunctionName)
			{
				endPointReturn = endPoint;
				break;
			}
		}
		return(endPointReturn);
	}
	processWorldUpdateQueue()
	{
		var worldUpdate = this.getNextFromWorldUpdate();
		if(worldUpdate!=null)
		{
			//console.log("processWorldUpdateQueue:worldUpdate="+CommontoString(worldUpdate));
			
			var isWalkerNew = this.isWalkerNew(worldUpdate.walkerName);
			var isJunctionNew = this.isJunctionNew(worldUpdate.junctionName);
			var walker = this.getCreateWalker(worldUpdate.walkerName,worldUpdate.walkerInfo);
			var junction = this.getCreateJunction(worldUpdate.junctionName,worldUpdate.junctionInfo);		
			var currentJunction = walker.getCurrentJunction();	
			
			var endPointMod = this.getEndPointMod(currentJunction,junction);		
			if(endPointMod!=null)
			{
				console.log("Before getEndPointMod! name="+endPointMod.endPointModName+" start="+currentJunction.name+
						" end="+junction.name+" walkerName:"+worldUpdate.walkerName+
						" worldUpdate="+CommontoString(worldUpdate));
				
				
				isJunctionNew = this.isJunctionNew(endPointMod.endPointModName);
				worldUpdate.junctionInfo.junctionName = endPointMod.endPointModName;
				worldUpdate.junctionName = endPointMod.endPointModName;
				junction = this.getCreateJunction(endPointMod.endPointModName,worldUpdate.junctionInfo);
				console.log("...after getEndPointMod! name="+endPointMod.endPointModName+" start="+currentJunction.name+
						" end="+junction.name+" walkerName:"+worldUpdate.walkerName+
						" worldUpdate="+CommontoString(worldUpdate));
				//walker.setCurrentJunction(currentJunction);
			}
			
			var teleportPath = this.getTeleportPath(currentJunction,junction);
			if(teleportPath!=null)
			{	var cjname = "null";
				if(currentJunction!=null) cjname = currentJunction.name; 
				//console.log("Teleport Path! name="+teleportPath.teleportName+" start="+cjname+" end="+junction.name);
				
				currentJunction = this.getCreateJunction(teleportPath.teleportName,
						{junctionName:teleportPath.teleportName,junctionTypeKey:"generic"});
				//console.log("...after Teleport Path! name="+teleportPath.teleportName+" start="+currentJunction.name+" end="+junction.name);
				walker.setCurrentJunction(currentJunction);
			}
			
			if(currentJunction!=null)
			{
				this.getCreatePath(currentJunction,junction,worldUpdate.pathInfo);
				//walker.setCurrentJunction(junction);
			}
			
			walker.setCurrentJunction(junction);
			walker.lastUpdateTimeStamp = this.checkTimestamp;
			if(isJunctionNew)
			{
				if(this.junctions.length==0)
				{
					this.junction.position.setX(0);
					this.junction.position.setY(0);
				}
				else if(currentJunction==null)
				{
					junction.position.setX(this.worldDisplay.relaxedDistanceDefault);
					junction.position.setY(this.worldDisplay.relaxedDistanceDefault);
				}
				else
				{
					junction.position.setX( currentJunction.position.getX()+this.worldDisplay.junctionRadiusDefault*(Math.random()) );
					junction.position.setY( currentJunction.position.getY()+this.worldDisplay.junctionRadiusDefault*(Math.random()) );
				}
			}
			if(isWalkerNew)
			{
				walker.position.setX( junction.position.getX() );
				walker.position.setY( junction.position.getY() );
			}
		}
		return(worldUpdate);
	}
	
	addToWorldUpdateQueue(worldUpdate)
	{
		this.worldUpdateQueue.isInNeedOfSorting = true;
		this.worldUpdateQueue.push(worldUpdate);
	}	
	
	prepareWorldUpdateQueue()
	{
		//console.log("prepareWorldUpdateQueue:isInNeedOfSorting="+this.worldUpdateQueue.isInNeedOfSorting);
		if(this.worldUpdateQueue.isInNeedOfSorting)
		{
			this.worldUpdateQueue.sort(
				function(a, b)
				{
					return(a.processTimestamp-b.processTimestamp);
				}
				);
			this.worldUpdateQueue.isInNeedOfSorting = false;
		}
	}
	
	getNextFromWorldUpdate(worldUpdate)
	{
		var worldUpdate = null;
		if(this.worldUpdateQueue.length>0)
		{
			worldUpdate = this.worldUpdateQueue[0];
			this.worldUpdateQueue.shift();
		}
		return(worldUpdate);
	}
	
	getWalkerKey(walker)
	{
		return(walker.name);
	}
	
	getJunctionKey(junction)
	{
		//console.log("pathWorld getJunctionKey junction:"+junction.name);
	
		return(junction.name);
	}
	
	getPathKey(junctionStart,junctionEnd)
	{
		//console.log("pathWorld getPathKey junctionStart:"+junctionStart.name);
		//console.log("pathWorld getPathKey junctionEnd:"+junctionEnd.name);
		return(this.getJunctionKey(junctionStart)+":"+this.getJunctionKey(junctionEnd));
	}
	
	getStartPositionWalker()
	{
		return(new Position(this.canvasHolder.getWidth()/2,this.canvasHolder.getHeight()/2));
	}
	
	getStartPositionJunction()
	{
		return(new Position(this.canvasHolder.getWidth()/2,this.canvasHolder.getHeight()/2));
	}

}
//<js2node>
module.exports = PathWorld;
console.log("Loading:PathWorld");
//</js2node>

},{"../common/common":1,"../nodes/nodecanvas/nodecanvas":11,"../nodes/nodecanvas/nodecanvasmouse":12,"../nodes/position/position":17,"../paths/junction":20,"../paths/path":23,"../paths/walker":26}],25:[function(require,module,exports){
class PathWorldDef
{
	getPathParts()
	{
		throw "PathWolrdDef.getPathParts not defined";
	}
	
	getPathDef()
	{
		throw "PathWolrdDef.getPathDef not defined";
	}
	
	getWolrdDisplay()
	{
		throw "PathWolrdDef.getWolrdDisplay not defined";
	}
	
	getWalkerJunctionRules()
	{
		throw "PathWolrdDef.getWalkerJunctionRules not defined";
	}
	
	getWorldDefaults()
	{
		throw "PathWolrdDef.getWorldDefaults not defined";
	}
}

//<js2node>
module.exports = PathWorldDef;
console.log("PathWorldDef");
//</js2node>

},{}],26:[function(require,module,exports){
var Node = require('../nodes/node');
var Common = require('../common/common');

class Walker extends Node
{
	constructor(name,position,offset,shapeList,graphData,infoData)
	{
		super(name,position,offset,shapeList,graphData,infoData);
		Walker.initWalker(this,name,position,offset,shapeList,graphData,infoData);
	}
	
	static initWalker(walker,name,position,offset,shapeList,graphData,infoData)
	{
		walker.junctionArray = new Array();
		walker.layer=2;
		if(!walker.graphData.walkerJunctionRules) walker.graphData.walkerJunctionRules = new Object();
		if(!walker.graphData.walkerJunctionRules.junctionExits)
			walker.graphData.walkerJunctionRules.junctionExits = new Array();
	}

	
	getNodeUiDisplay(node)
	{
		var value = this.name;
	
		value += "<li>type:"+this.infoData.walkerTypeKey+"</li>";
		value += "<li>currentJ:"+this.getCurrentJunction().name+"</li>";
		
		for(var i=0;i<this.graphData.walkerJunctionRules.junctionExits.length;i++)
		{
			var exit = this.graphData.walkerJunctionRules.junctionExits[i];
	
			var timeToRemove = (
					(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)
					<
					world.checkTimestamp);
	
			value += "<li>exitJunction:i="+i+" "+exit.exitJunction+
				" at exit:"+(exit.exitJunction==this.getCurrentJunction().name)+
				" timeToRemove:"+timeToRemove+
				"</li>";
		}
		value += "<li>remove at:"+(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)+"</li>";
		value += "<li>checkTime:"+world.checkTimestamp+"</li>";
		value += "<li>diff:"+(world.checkTimestamp-(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds))+"</li>";
		return(value);
	}
	
	
	processWalkerRules(world)
	{
		//console.log("w:"+this.name+" currentJunction="+this.getCurrentJunction().name);
		
		for(var i=0;i<this.graphData.walkerJunctionRules.junctionExits.length;i++)
		{
			var exit = this.graphData.walkerJunctionRules.junctionExits[i];
			if(exit.exitJunction==this.getCurrentJunction().name)
			{
				var timeToRemove = (
						(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)
						<
						world.checkTimestamp);
				
		
				if(timeToRemove)
				{
					
					console.log("TIME TO EXIT w:"+this.name+
							" currentJunction="+this.getCurrentJunction().name+
							" exit:"+exit.exitJunction+
							" type:"+CommontoString(this.infoData.walkerTypeKey)+
							" infoData:"+CommontoString(this.infoData));
							
					world.removeWalker(this);
				}
			}
		}
		//console.log("w:"+this.name+" junction:"+this.getCurrentJunction());
	}
	
	setCurrentJunction(junction)
	{
		if(this.getCurrentJunction()!=null)
		{
			//console.log("getCurrentJunction().removeWalker ");
			this.getCurrentJunction().removeWalker(this);
		}
		this.junctionArray.push(junction);
		junction.addWalker(this);
	}
	
	getCurrentJunction()
	{
		if(this.junctionArray.length==0) return(null);
		return(this.junctionArray[this.junctionArray.length - 1]);
	}
	
	log()
	{
		console.log("walker log:"+CommontoString(this));
	}
}
//<js2node>
module.exports = Walker;
console.log("Loading:Walker");
//</js2node>

},{"../common/common":1,"../nodes/node":8}],27:[function(require,module,exports){
////////////////////////////////////////////
// WorldUpdate
//////////////////////////////////////////////
class WorldUpdate
{
	constructor(junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo)
	{
	
		WorldUpdate.createWorldUpdate(this,junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo);
	}
		
	static createWorldUpdate(worldUpdate,junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo)
	{
		worldUpdate.junctionName = junctionName;
		worldUpdate.walkerName = walkerName;
		worldUpdate.processTimestamp = processTimestamp;
		worldUpdate.walkerInfo = walkerInfo;
		worldUpdate.junctionInfo = junctionInfo;
		worldUpdate.pathInfo = pathInfo;
	}
	
	readyToBeProcessed (timestamp)
	{
		//return( (this.processTimestamp<=timestamp) );
		return(  (this.getDate().getTime()<=timestamp)  );
	}
	
	getDate()
	{
		return(new Date(this.processTimestamp*1000));
	}
}

//<js2node>
module.exports = WorldUpdate;
console.log("Loading:WorldUpdate");
//</js2node>

},{}],28:[function(require,module,exports){
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var PathWorld = require('../../paths/pathworld');
var InaGraphPathWorldDef = require('../../pathsexp/inagraph/inagraphpathworlddef');


function initInaGraphx(canvasName)
{
	var worldDef = new InaGraphPathWorldDef();
	var worldDisplay = worldDef.getWorldDefaults();
	
	world = new PathWorld(
			new CanvasHolder(canvasName),
			worldDisplay.junctionSpacer,
			worldDisplay.worldWall,
			worldDisplay);
	
	initCustomNodes(world);
	
	var firstItem = world.peekAtNextWorldUpdate();
	if(firstItem!=null)
	{
		var firstDate = firstItem.getDate();
		world.startTime = firstDate;
		world.timeFactor = 10.0;//60*60/0.5; // 2.0 for the denominator is a nice visual time)
	}
	console.log("init of "+canvasName+" done");
}

exports.initInaGraph = initInaGraph;


},{"../../nodes/nodecanvas/canvasholder":9,"../../paths/pathworld":24,"../../pathsexp/inagraph/inagraphpathworlddef":29}],29:[function(require,module,exports){
var PathWorldDef = require('../../paths/pathworlddef');
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var PathWorld = require('../../paths/pathworld');
var WorldUpdate = require('../../paths/worldupdate');
var Common = require('../../common/common');
var CircleDisplay = require('../../nodes/nodedisplay/circledisplay');
var ConnectorDisplayEmpty = require('../../nodes/connectordisplay/connectordisplayempty');
var GroupConnector = require('../../nodes/connector/groupconnector');
var WallConnector = require('../../nodes/connector/wallconnector');
var JunctionConnector = require('../../paths/nodedisplay/junctionconnector');
var JunctionDisplay = require('../../paths/nodedisplay/junctiondisplay');
var RectangleDisplay = require('../../nodes/nodedisplay/rectangledisplay');
var TriangleDisplay = require('../../nodes/nodedisplay/triangledisplay');

class InaGraphPathWorldDef extends PathWorldDef
{
	getPathParts()
	{
		return(this.pathParts);
	}
	
	getPathDef()
	{
		return(this.pathDefs);
	}
	
	getWolrdDisplay()
	{
		return(this.worldDisplay);
	}
	
	getWalkerJunctionRules()
	{
		return(this.junctionExits);
   	}
	
	getWorldDefaults()
	{

		return(this.worldDefaults);
	}
	
	static initJunctionDisplay(node)
	{
		node.graphData.nodeDisplay = new JunctionDisplay(
				{
					fillColor:"a0a0ffff",
					borderColor:"000000ff",
					selectFillColor:"ffff00ff",
					selectBorderColor:"0000ffff",
					borderWidth:2,
					fontStyle:"bold",
					fontPixelHeight:15,
					fontFace:"Arial",
					rectBorderColor:"0000ffff",
					rectFillColor:"ffffffff",
					fontColor:"0000ffff",
				});
		
		node.graphData.textSpacer = 5;
		node.graphData.radius = world.worldDisplay.junctionRadiusDefault*3;
		node.graphData.width = node.graphData.radius*2;
		node.graphData.height = node.graphData.radius*2;
		if(node.graphData.nodes==null) node.graphData.nodes = new Array();
	}
	
	
	getPathArray()
	{
		var allPathArray = [];
		for(var i=0;i<this.pathDefs.length;i++)
		{
			var pathDef = this.pathDefs[i]; 
			for(var nodeLoop=0;nodeLoop<pathDef.numberNodes;nodeLoop++)
			{
				var pathArray = [];
				for(var j=0;j<pathDef.path.length;j++)
				{
					var pathName = pathDef.path[j];
					var pathDefName = pathDef.pathDefName;
					//console.log("   doing pathDefName="+pathDefName+" pathName="+pathName);
					for(var k=0;k<pathParts[pathName].length;k++)
					{
						//console.log("               junction="+pathParts[pathName][k]);
						pathArray.push(pathParts[pathName][k]);
					}
				}
				allPathArray.push(
				{
					pathDef:pathDef,
					path:pathArray
				});
				//console.log("#"+i+" pathArray size="+pathArray.length+" name="+pathDef.pathDefName);
			}
		}
		//CommonshuffleArray(allPathArray);
		return(allPathArray);
	}
	
	initCustomNodes(world)
	{
		var pathArray = getPathArray();
		
		var now = new Date();
		//now = Math.floor(now/1000);
		now = now/1000;
		var lastTime = now;
		
		for(var i=0;i<pathArray.length;i++)
		{
			var pd = pathArray[i];
			//console.log("Start of worldUpdate:"+CommontoString(pd));
			
			var startSpacer = Math.floor(Math.random()*20)-10;
	
			for(var j=0;j<pd.path.length;j++)
			{
				var spacer = Math.floor(Math.random()*2)+1;
				lastTime+= +spacer;
				
				//console.log("adding : pathName="+pd.pathDef.pathDefName+" junction="+pd.path[j]);
	
				
				world.addToWorldUpdateQueue(
					new WorldUpdate(
							pd.path[j],
							pd.pathDef.pathDefName+"."+i,
							lastTime+startSpacer,
							{
								waklerName:pd.pathDef.pathDefName+"."+i,
								walkerTypeKey:pd.pathDef.pathDefName
							},
							{
								junctionName:pd.path[j],
								junctionTypeKey:"generic"
							},
							{
								pathTypeKey:"generic"
							},
							{
								status:"In Progress"
							})); // 23-JAN-17 06.35.14 AM
			}
		}
	}
}
	var worldDefaults =
	{
			junctionRadiusDefault:15,
			walkerRadiusDefault:15*0.3,
			relaxedDistanceDefault:5*10,
			elasticityFactorDefualt:0.1,
	};
	
	var pathDefs =
	[
		{
			pathDefName:"normal",numberNodes:100,nodeShape:"circle",nodeColor:"ff0000",
			path:["start","normalEnd"]
		},
		{
			pathDefName:"tumorFailRQSuccess",numberNodes:20,nodeShape:"circle",nodeColor:"ff0000",
			path:["start","tumorFailRequeue","normalEnd"]
		},
		{
			pathDefName:"rnaFailRQSucess",numberNodes:20,nodeShape:"circle",nodeColor:"ff0000",
			path:["start","rnaFailRequeue","normalEnd"]
		},
		{
			pathDefName:"tumorFailCancel",numberNodes:20,nodeShape:"circle",nodeColor:"ff0000",
			path:["start","tumorFailCS"]
		},
		{
			pathDefName:"tumorFailCancel",numberNodes:20,nodeShape:"circle",nodeColor:"ff0000",
			path:["start","rnaFailCS"]
		},
	];
		
    var junctionExits = 
    [
        {exitJunction:"Result mailed/ Sample returned",exitAfterMiliSeconds:60*60*24*1000},
    ];
	
	var worldDisplay =
	{	
		junctionRadiusDefault:worldDefaults.junctionRadiusDefault,
		walkerRadiusDefault:worldDefaults.walkerRadiusDefault,
		relaxedDistanceDefault:worldDefaults.relaxedDistanceDefault,
		elasticityFactorDefualt:worldDefaults.elasticityFactorDefualt,
		
		junctionSpacer:new GroupConnector(new ConnectorDisplayEmpty(),null,null,
				worldDefaults.relaxedDistanceDefault*2.5,worldDefaults.elasticityFactorDefualt),
		worldWall:new WallConnector(new ConnectorDisplayEmpty(),null,null,
				worldDefaults.relaxedDistanceDefault*0.75,1-worldDefaults.elasticityFactorDefualt),
		
	    worldBackgroundColor:"e0e0f0ff",
	
		pathTypes:
		{
			generic:
			{
				connectorDisplay: new JunctionConnector(
				{
					lineColor:"0000a0ff",lineWidth:5
				}),					
			},
		},
		junctionTypes:
		{
			"generic":
			{			
				initGraphData:InaGraphPathWorldDef.initJunctionDisplay,
			},
		},
		teleportPaths:
		[
			// Teleport Path! name=Requeue to MS start=DT1 end=MS/In Progress
			{teleportName:"Requeue to MS/In Progress",startJunction:"^((?!DT1|MS.*|Signing).)*$",endJunction:"MS/In Progress"},
			{teleportName:"Requeue to MS",startJunction:"^((?!DT1|MS.*|Signing).)*$",endJunction:"MS"},
			{teleportName:"Requeue to DT1",startJunction:"^((?!CS|MS.*).)*$",endJunction:"DT1"},
			{teleportName:"Requeue to MRP-Packaging",startJunction:"^((?!Signing|Cancled).)*$",endJunction:"MRP-Packaging"},
			{teleportName:"Requeue to Signing",startJunction:"^((?!MS|Packaging|MRP-Packaging).)*$",endJunction:"Signing"},
			{teleportName:"Test canceled",startJunction:"^((?!Canceled|.*Packaging.*).)*$",endJunction:"Canceled"},	
		],
		endPointMods:
		[
			{endPointModName:"MRP-Test Reported",startJunction:"MRP-Packaging",endJunction:"Test Reported"},		
			//{endPointModName:"NEW-Test Reported",startJunction:".*",endJunction:"Test Reported"},		
		],
	
		walkerDisplayTypes:
		{
			generic:
			{
	
				nodeDisplay:new TriangleDisplay(
						{
							fillColor:"ffffffff",borderColor:"000000ff",
							selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
							borderWidth:1,
							radius:worldDefaults.walkerRadiusDefault/1.25,
							width:(worldDefaults.walkerRadiusDefault/1.25)*2,
							height:(worldDefaults.walkerRadiusDefault/1.25)*2,
						}),
				walkerJunctionRules:junctionExits,
			},
			tumorFailRQSuccess:
			{
	
				nodeDisplay:new TriangleDisplay(
						{
							fillColor:"FFA500ff",borderColor:"000000ff",
							selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
							borderWidth:1,
							//radius:walkerRadiusDefault/1.25,
							width:(worldDefaults.walkerRadiusDefault/1.25)*2,
							height:(worldDefaults.walkerRadiusDefault/1.25)*2,
						}),
				walkerJunctionRules:junctionExits,
			},
			normal:
			{
				nodeDisplay:new RectangleDisplay(
						{
							fillColor:"ff2020ff",borderColor:"000000ff",
							selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
							borderWidth:1,
							width:(worldDefaults.walkerRadiusDefault/1.25)*2,
							height:(worldDefaults.walkerRadiusDefault/1.25)*2,
						
						}),
				walkerJunctionRules:junctionExits,
			},
			rnaFailRQSucess:
			{
				nodeDisplay:new CircleDisplay(
						{
							fillColor:"00A5FFff",borderColor:"000000ff",
							selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
							borderWidth:1,
							radius:worldDefaults.walkerRadiusDefault/1.25,
							width:(worldDefaults.walkerRadiusDefault/1.25)*2,
							height:(worldDefaults.walkerRadiusDefault/1.25)*2,
						
						}),
				walkerJunctionRules:junctionExits,		
			},
			tumorFailCancel:
			{
				nodeDisplay:new CircleDisplay(
						{
							fillColor:"A5FF00ff",borderColor:"000000ff",
							selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
							borderWidth:1,
							radius:worldDefaults.walkerRadiusDefault/1.25,
							width:(worldDefaults.walkerRadiusDefault/1.25)*2,
							height:(worldDefaults.walkerRadiusDefault/1.25)*2,
						}),
				walkerJunctionRules:junctionExits,
			},
		},
	};
	
	var pathParts =
	{
		start:["Accessioning","Anatomic pathology lab"],
		normalEnd:["RNA lab","Medical services","Lab director sign off","Reporting","Result mailed/ Sample returned"],
		tumorFailRequeue:["Insufficient tumor","Canceled","Reporting","Extra Tisue","YES requeue"],
		tumorFailCS:["Insufficient tumor","Canceled","Reporting","Extra Tisue","NO cancel sample","Customer Service"],
		rnaFailRequeue:["Insufficient RNA","Canceled","Reporting","Extra Tisue","YES requeue"],
		rnaFailCS:["Insufficient RNA","Canceled","Reporting","Extra Tisue","NO hold","Customer Service"],
	};
//}

//<js2node>
module.exports = InaGraphPathWorldDef;
console.log("InaGraphPathWorldDef");
//</js2node>
},{"../../common/common":1,"../../nodes/connector/groupconnector":3,"../../nodes/connector/wallconnector":5,"../../nodes/connectordisplay/connectordisplayempty":7,"../../nodes/nodecanvas/canvasholder":9,"../../nodes/nodedisplay/circledisplay":13,"../../nodes/nodedisplay/rectangledisplay":15,"../../nodes/nodedisplay/triangledisplay":16,"../../paths/nodedisplay/junctionconnector":21,"../../paths/nodedisplay/junctiondisplay":22,"../../paths/pathworld":24,"../../paths/pathworlddef":25,"../../paths/worldupdate":27}]},{},[28])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uL2NvbW1vbi9jb21tb24uanMiLCIuLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yLmpzIiwiLi4vbm9kZXMvY29ubmVjdG9yL2dyb3VwY29ubmVjdG9yLmpzIiwiLi4vbm9kZXMvY29ubmVjdG9yL3NoYXBlY29ubmVjdG9yLmpzIiwiLi4vbm9kZXMvY29ubmVjdG9yL3dhbGxjb25uZWN0b3IuanMiLCIuLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXkuanMiLCIuLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXllbXB0eS5qcyIsIi4uL25vZGVzL25vZGUuanMiLCIuLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlci5qcyIsIi4uL25vZGVzL25vZGVjYW52YXMvbW91c2VzdGF0dXMuanMiLCIuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXMuanMiLCIuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXNtb3VzZS5qcyIsIi4uL25vZGVzL25vZGVkaXNwbGF5L2NpcmNsZWRpc3BsYXkuanMiLCIuLi9ub2Rlcy9ub2RlZGlzcGxheS9ub2RlZGlzcGxheS5qcyIsIi4uL25vZGVzL25vZGVkaXNwbGF5L3JlY3RhbmdsZWRpc3BsYXkuanMiLCIuLi9ub2Rlcy9ub2RlZGlzcGxheS90cmlhbmdsZWRpc3BsYXkuanMiLCIuLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbi5qcyIsIi4uL25vZGVzL3NoYXBlcy9ib3VuZGluZ2JveC5qcyIsIi4uL25vZGVzL3NoYXBlcy9zaGFwZS5qcyIsIi4uL3BhdGhzL2p1bmN0aW9uLmpzIiwiLi4vcGF0aHMvbm9kZWRpc3BsYXkvanVuY3Rpb25jb25uZWN0b3IuanMiLCIuLi9wYXRocy9ub2RlZGlzcGxheS9qdW5jdGlvbmRpc3BsYXkuanMiLCIuLi9wYXRocy9wYXRoLmpzIiwiLi4vcGF0aHMvcGF0aHdvcmxkLmpzIiwiLi4vcGF0aHMvcGF0aHdvcmxkZGVmLmpzIiwiLi4vcGF0aHMvd2Fsa2VyLmpzIiwiLi4vcGF0aHMvd29ybGR1cGRhdGUuanMiLCJpbmFncmFwaC9pbmFncmFwaC5qcyIsImluYWdyYXBoL2luYWdyYXBocGF0aHdvcmxkZGVmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIENvbW1vblxyXG57XHJcblx0Y29uc3RydWN0b3IodmFsdWVzKVxyXG5cdHtcclxuXHRcdHRoaXMudmFsdWVzID0gdmFsdWVzO1xyXG5cdFx0Y29uc29sZS5sb2coXCIxMDFcIik7XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBpbmhlcml0c0Zyb20oY2hpbGQsIHBhcmVudClcclxuXHR7XHJcblx0ICAgIGNoaWxkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XHJcblx0fVxyXG5cclxuXHJcblx0c3RhdGljIHN0cmluZ2lmeUNvbW1vbihvYmosIHJlcGxhY2VyLCBzcGFjZXMsIGN5Y2xlUmVwbGFjZXIpXHJcblx0e1xyXG5cdCAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgdGhpcy5zZXJpYWxpemVyQ29tbW9uKHJlcGxhY2VyLCBjeWNsZVJlcGxhY2VyKSwgc3BhY2VzKVxyXG5cdH1cclxuXHJcblx0c3RhdGljIGdldERheU9mV2VlayhkYXRlKVxyXG5cdHsgICBcclxuXHQgICAgcmV0dXJuIFtcIlN1bmRheVwiLFwiTW9uZGF5XCIsXCJUdWVzZGF5XCIsXCJXZWRuZXNkYXlcIixcIlRodXJzZGF5XCIsXCJGcmlkYXlcIixcIlNhdHVyZGF5XCJdWyBkYXRlLmdldERheSgpIF07XHJcblx0fTtcclxuXHRcclxuXHR0ZXN0KHRlc3QpXHJcblx0e1xyXG5cdFx0Y29uc29sZS5sb2coXCJDb21tb246dGVzdDpcIit0ZXN0KTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBzZXJpYWxpemVyQ29tbW9uKHJlcGxhY2VyLCBjeWNsZVJlcGxhY2VyKVxyXG5cdHtcclxuXHQgIHZhciBzdGFjayA9IFtdLCBrZXlzID0gW11cclxuXHJcblx0ICBpZiAoY3ljbGVSZXBsYWNlciA9PSBudWxsKSBjeWNsZVJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG5cdCAgICBpZiAoc3RhY2tbMF0gPT09IHZhbHVlKSByZXR1cm4gXCJbQ2lyY3VsYXIgfl1cIlxyXG5cdCAgICByZXR1cm4gXCJbQ2lyY3VsYXIgfi5cIiArIGtleXMuc2xpY2UoMCwgc3RhY2suaW5kZXhPZih2YWx1ZSkpLmpvaW4oXCIuXCIpICsgXCJdXCJcclxuXHQgIH1cclxuXHJcblx0ICByZXR1cm4gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG5cdCAgICBpZiAoc3RhY2subGVuZ3RoID4gMCkge1xyXG5cdCAgICAgIHZhciB0aGlzUG9zID0gc3RhY2suaW5kZXhPZih0aGlzKVxyXG5cdCAgICAgIH50aGlzUG9zID8gc3RhY2suc3BsaWNlKHRoaXNQb3MgKyAxKSA6IHN0YWNrLnB1c2godGhpcylcclxuXHQgICAgICB+dGhpc1BvcyA/IGtleXMuc3BsaWNlKHRoaXNQb3MsIEluZmluaXR5LCBrZXkpIDoga2V5cy5wdXNoKGtleSlcclxuXHQgICAgICBpZiAofnN0YWNrLmluZGV4T2YodmFsdWUpKSB2YWx1ZSA9IGN5Y2xlUmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKVxyXG5cdCAgICB9XHJcblx0ICAgIGVsc2Ugc3RhY2sucHVzaCh2YWx1ZSlcclxuXHJcblx0ICAgIHJldHVybiByZXBsYWNlciA9PSBudWxsID8gdmFsdWUgOiByZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpXHJcblx0ICB9XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgZ2V0Q29sb3JGcm9tU3RyaW5nKGNvbG9yU3RyaW5nKVxyXG5cdHtcclxuXHRcdHZhciB0cmFuc3BhcmVuY3kgPSAxLjA7XHJcblx0XHRpZihjb2xvclN0cmluZy5sZW5ndGg9PTYpXHJcblx0XHR7XHJcblx0XHRcdGNvbG9yU3RyaW5nICs9IFwiZmZcIjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGNvbG9yID0gXCJyZ2JhKFwiK1xyXG5cdFx0XHRcdHBhcnNlSW50KGNvbG9yU3RyaW5nLnN1YnN0cmluZygwLDIpLCAxNikrXCIsXCIrXHJcblx0XHRcdFx0cGFyc2VJbnQoY29sb3JTdHJpbmcuc3Vic3RyaW5nKDIsNCksIDE2KStcIixcIitcclxuXHRcdFx0XHRwYXJzZUludChjb2xvclN0cmluZy5zdWJzdHJpbmcoNCw2KSwgMTYpK1wiLFwiK1xyXG5cdFx0XHRcdHBhcnNlSW50KGNvbG9yU3RyaW5nLnN1YnN0cmluZyg2LDgpLCAxNikvMjU1LjArXCIpXCI7XHJcblx0XHRcclxuXHRcdHJldHVybihjb2xvcik7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbG9nSW5zZXJ0QXJyYXkoYXJyYXkscHJpbnRWYWx1ZUZ1bmN0aW9uKVxyXG5cdHtcclxuXHRcdGZvcih2YXIgaT0wO2k8YXJyYXkubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJpPVwiK3ByaW50VmFsdWVGdW5jdGlvbihhcnJheVtpXSkpO1xyXG5cdFx0fVxyXG5cdH1cdFxyXG5cdFxyXG5cdHN0YXRpYyBpbnNlcnRJbnRvQXJyYXkodG9JbnNlcnQsYXJyYXkscG9zaXRpb24pXHJcblx0e1xyXG5cdFx0YXJyYXkuc3BsaWNlKHBvc2l0aW9uLDAsdG9JbnNlcnQpO1xyXG5cdH1cdFxyXG5cdFxyXG5cdHN0YXRpYyBzaHVmZmxlQXJyYXkoYXJyYXkpXHJcblx0e1xyXG5cdCAgICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xyXG5cdCAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcclxuXHQgICAgICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XHJcblx0ICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xyXG5cdCAgICAgICAgYXJyYXlbal0gPSB0ZW1wO1xyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiBhcnJheTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyByZW1vdmVJdGVtRnJvbUFycmF5KGFycmF5LGl0ZW0pXHJcblx0e1xyXG5cdFx0dmFyIGluZGV4ID0gYXJyYXkuaW5kZXhPZihpdGVtKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKVxyXG5cdFx0e1xyXG5cdFx0ICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyB0b1N0cmluZyhvYmplY3QpXHJcblx0e1xyXG5cdFx0cmV0dXJuKEpTT04uc3RyaW5naWZ5KG9iamVjdCkpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gQ29tbW9uO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q29tbW9uXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vcG9zaXRpb24vcG9zaXRpb24nKTtcclxuXHJcbmNsYXNzIENvbm5lY3RvclxyXG57XHJcblx0Y29uc3RydWN0b3IoY29ubmVjdG9yRnVuY3Rpb24sY29ubmVjdG9yRGlzcGxheSlcclxuXHR7XHJcblx0XHRDb25uZWN0b3IuY3JlYXRlQ29ubmVjdG9yKHRoaXMsY29ubmVjdG9yRnVuY3Rpb24sY29ubmVjdG9yRGlzcGxheSk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgY3JlYXRlQ29ubmVjdG9yKGNvbm5lY3Rvcixjb25uZWN0b3JGdW5jdGlvbixjb25uZWN0b3JEaXNwbGF5KVxyXG5cdHtcclxuXHRcdGNvbm5lY3Rvci5ub2RlcyA9IG5ldyBBcnJheSgpO1xyXG5cdFx0Y29ubmVjdG9yLmNvbm5lY3RvckZ1bmN0aW9uID0gY29ubmVjdG9yRnVuY3Rpb247XHRcclxuXHRcdGNvbm5lY3Rvci5jb25uZWN0b3JEaXNwbGF5ID0gY29ubmVjdG9yRGlzcGxheTtcdFxyXG5cdH1cclxuXHJcblx0ZXhlY3V0ZUNvbm5lY3RvckZ1bmN0aW9uKHRpbWVzdGFtcCxub2RlKVxyXG5cdHtcclxuXHRcdHRoaXMuY29ubmVjdG9yRnVuY3Rpb24odGhpcyxub2RlLHRpbWVzdGFtcClcclxuXHR9XHJcblxyXG5cdGNvbnRhaW5zUG9zdGlvbihwb3NpdGlvbilcclxuXHR7XHJcblx0XHRjb25zb2xlLmxvZyhcIk5vZGU6Y29udGFpbnNQb3N0aW9uOlwiK3RoaXMubmFtZStcIjpkZWZhdWx0LCB3aWxsIGFsd2F5cyBmYWlsXCIpO1xyXG5cdFx0cmV0dXJuKGZhbHNlKTtcclxuXHR9XHJcblxyXG5cdGFkZE5vZGVMaXN0KG5vZGVMaXN0KVxyXG5cdHtcclxuXHRcdGZvcih2YXIgaT0wO2k8bm9kZUxpc3QubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5hZGROb2RlKG5vZGVMaXN0W2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFkZE5vZGUobm9kZSlcclxuXHR7XHJcblx0XHR0aGlzLm5vZGVzLnB1c2gobm9kZSk7XHJcblx0XHRub2RlLmNvbm5lY3RvcnMucHVzaCh0aGlzKTtcclxuXHR9XHJcblxyXG5cdHJlbW92ZU5vZGUobm9kZSlcclxuXHR7XHJcblx0XHQvLyBjb25zb2xlLmxvZyhcIkNvbm5lY3RvciByZW1vdmVOb2RlIGJlZm9yZTpcIitcclxuXHRcdC8vIFwibm9kZT1cIitub2RlLm5hbWUrXHJcblx0XHQvLyBcIjp0aGlzLm5vZGVzPVwiK3RoaXMubm9kZXMubGVuZ3RoK1xyXG5cdFx0Ly8gXCI6bm9kZS5jb25uZWN0b3JzPVwiK25vZGUuY29ubmVjdG9ycy5sZW5ndGgrXHJcblx0XHQvLyBcIlwiKTtcclxuXHRcdENvbW1vbi5yZW1vdmVJdGVtRnJvbUFycmF5KHRoaXMubm9kZXMsbm9kZSk7XHJcblx0XHRDb21tb24ucmVtb3ZlSXRlbUZyb21BcnJheShub2RlLmNvbm5lY3RvcnMsdGhpcyk7XHJcblx0XHRcclxuXHRcdC8vIGNvbnNvbGUubG9nKFwiQ29ubmVjdG9yIHJlbW92ZU5vZGUgYWZ0ZXIgOlwiK1xyXG5cdFx0Ly8gXCJub2RlPVwiK25vZGUubmFtZStcclxuXHRcdC8vIFwiOnRoaXMubm9kZXM9XCIrdGhpcy5ub2Rlcy5sZW5ndGgrXHJcblx0XHQvLyBcIjpub2RlLmNvbm5lY3RvcnM9XCIrbm9kZS5jb25uZWN0b3JzLmxlbmd0aCtcclxuXHRcdC8vIFwiXCIpO1xyXG5cdH1cclxuXHJcblx0aW5pdFByb2Nlc3NvcigpXHJcblx0e1xyXG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0aWYgKHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQgIT0gbnVsbClcclxuXHRcdHtcclxuXHRcdFx0aWYgKHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQgPT0gbnVsbClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQuY3JlYXRlQnlBZGRpbmcodGhpcy5hbmNob3JPZmZzZXRQb2ludCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ocG9zaXRpb25MaXN0KTtcclxuXHR9XHJcblxyXG5cdGNhbHVsYXRlTW92ZW1lbnRFeHAobm9kZSxwb3NpdGlvbkxpc3QscmFuZG9tU3RyZW5ndGhGYWN0b3IscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IpXHJcblx0e1xyXG5cdFx0aWYgKHBvc2l0aW9uTGlzdC5sZW5ndGg+MClcclxuXHRcdHtcclxuXHRcdFx0Ly8gbG9vayBhdCBlYWNoIHBvc2l0aW9uIGFuZCBtYWtlIGEgbmV3IGxpc3Qgb2YgcG9zaXRpb25zIHRoZVxyXG5cdFx0XHQvLyBcInJlbGF4ZWRcIiBkaXN0YW5jZSBhd2F5XHJcblx0XHRcdHZhciBhbmltYXRlTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0XHR2YXIgeCA9IDAuMDtcclxuXHRcdFx0dmFyIHkgPSAwLjA7XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uTGlzdFtpXSxcclxuXHRcdFx0XHRcdFx0cmVsYXhlZERpc3RhbmNlKyhyYW5kb21TdHJlbmd0aEZhY3Rvci8yLXJhbmRvbVN0cmVuZ3RoRmFjdG9yKk1hdGgucmFuZG9tKCkpXHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0eCArPSBwb3NpdGlvbi5nZXRYKCkrKHJhbmRvbVN0cmVuZ3RoRmFjdG9yLzItcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKSk7XHJcblx0XHRcdFx0eSArPSBwb3NpdGlvbi5nZXRZKCkrKHJhbmRvbVN0cmVuZ3RoRmFjdG9yLzItcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKSk7XHRcdFxyXG5cdFx0XHRcdGFuaW1hdGVMaXN0LnB1c2gocG9zaXRpb24pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBmaW5kIHRoZSBhdmVyYWdlIFwicmVsYXhlZFwiIHBvc2l0aW9uXHJcblx0XHRcdHZhciBhdmVyYWdlUG9zaXRpb24gPSBuZXcgUG9zaXRpb24oeCAvIHBvc2l0aW9uTGlzdC5sZW5ndGgseSAvIHBvc2l0aW9uTGlzdC5sZW5ndGgpO1xyXG5cdFx0XHR2YXIgZGlzdGFuY2VUb0F2ZXJhZ2VQb3NpdGlvbiA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYXZlcmFnZVBvc2l0aW9uKTtcclxuXHJcblx0XHRcdC8vIHRha2UgdGhlIGF2ZXJhZ2UgcG9zaXRpb24gYW5kIG1vdmUgdG93YXJkcyBpdCBiYXNlZCB1cG9uIHRoZVxyXG5cdFx0XHQvLyBlbGFzdGljaXR5IGZhY3RvclxyXG5cdFx0XHR2YXIgbW92ZVBvc2l0aW9uID0gYXZlcmFnZVBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXHJcblx0XHRcdFx0XHRub2RlLnBvc2l0aW9uLFxyXG5cdFx0XHRcdFx0ZGlzdGFuY2VUb0F2ZXJhZ2VQb3NpdGlvbiAqIGVsYXN0aWNpdHlGYWN0b3JcclxuXHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHQvLyBhZGQgdGhpcyBwb3NpdGlvbiB0byB0aGUgbGlzdCBvZiBwb2ludHMgdGhpcyBub2RlIG5lZWRzIHRvIG1vdmVcclxuXHRcdFx0Ly8gdG9cclxuXHRcdFx0bm9kZS5wb3NpdGlvbk1vdmVMaXN0LnB1c2gobW92ZVBvc2l0aW9uKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QscmFuZG9tU3RyZW5ndGhGYWN0b3IpXHJcblx0e1xyXG5cdFx0aWYgKHBvc2l0aW9uTGlzdC5sZW5ndGg+MClcclxuXHRcdHtcclxuXHRcdFx0Ly8gbG9vayBhdCBlYWNoIHBvc2l0aW9uIGFuZCBtYWtlIGEgbmV3IGxpc3Qgb2YgcG9zaXRpb25zIHRoZVxyXG5cdFx0XHQvLyBcInJlbGF4ZWRcIiBkaXN0YW5jZSBhd2F5XHJcblx0XHRcdHZhciBhbmltYXRlTGlzdCA9IG5ldyBBcnJheSgpO1xyXG5cdFx0XHR2YXIgeCA9IDAuMDtcclxuXHRcdFx0dmFyIHkgPSAwLjA7XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uTGlzdFtpXSxcclxuXHRcdFx0XHRcdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UrcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKVxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdHggKz0gcG9zaXRpb24uZ2V0WCgpO1xyXG5cdFx0XHRcdHkgKz0gcG9zaXRpb24uZ2V0WSgpO1x0XHRcclxuXHRcdFx0XHRhbmltYXRlTGlzdC5wdXNoKHBvc2l0aW9uKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gZmluZCB0aGUgYXZlcmFnZSBcInJlbGF4ZWRcIiBwb3NpdGlvblxyXG5cdFx0XHR2YXIgYXZlcmFnZVBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHggLyBwb3NpdGlvbkxpc3QubGVuZ3RoLHkgLyBwb3NpdGlvbkxpc3QubGVuZ3RoKTtcclxuXHRcdFx0dmFyIGRpc3RhbmNlVG9BdmVyYWdlUG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGF2ZXJhZ2VQb3NpdGlvbik7XHJcblxyXG5cdFx0XHQvLyB0YWtlIHRoZSBhdmVyYWdlIHBvc2l0aW9uIGFuZCBtb3ZlIHRvd2FyZHMgaXQgYmFzZWQgdXBvbiB0aGVcclxuXHRcdFx0Ly8gZWxhc3RpY2l0eSBmYWN0b3JcclxuXHRcdFx0dmFyIG1vdmVQb3NpdGlvbiA9IGF2ZXJhZ2VQb3NpdGlvbi5nZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXlDbG9zZXN0KFxyXG5cdFx0XHRcdFx0bm9kZS5wb3NpdGlvbixcclxuXHRcdFx0XHRcdGRpc3RhbmNlVG9BdmVyYWdlUG9zaXRpb24gKiB0aGlzLmVsYXN0aWNpdHlGYWN0b3JcclxuXHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHQvLyBhZGQgdGhpcyBwb3NpdGlvbiB0byB0aGUgbGlzdCBvZiBwb2ludHMgdGhpcyBub2RlIG5lZWRzIHRvIG1vdmVcclxuXHRcdFx0Ly8gdG9cclxuXHRcdFx0bm9kZS5wb3NpdGlvbk1vdmVMaXN0LnB1c2gobW92ZVBvc2l0aW9uKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8vIDxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvcjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkNvbm5lY3RvclwiKTtcclxuLy8gPC9qczJub2RlPlxyXG4iLCJ2YXIgQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vY29ubmVjdG9yL2Nvbm5lY3RvcicpO1xyXG5cclxuY2xhc3MgR3JvdXBDb25uZWN0b3IgZXh0ZW5kcyBDb25uZWN0b3Jcclxue1xyXG5cdGNvbnN0cnVjdG9yKGNvbm5lY3RvckRpc3BsYXksc3ByaW5nQW5jaG9yUG9pbnQsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IpXHJcblx0e1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLnNwcmluZ0FuY2hvclBvaW50ID0gc3ByaW5nQW5jaG9yUG9pbnQ7XHJcblx0XHR0aGlzLmFuY2hvck9mZnNldFBvaW50ID0gYW5jaG9yT2Zmc2V0UG9pbnQ7XHJcblx0XHR0aGlzLnJlbGF4ZWREaXN0YW5jZSA9IHJlbGF4ZWREaXN0YW5jZTtcclxuXHRcdHRoaXMuZWxhc3RpY2l0eUZhY3RvciA9IGVsYXN0aWNpdHlGYWN0b3I7XHJcblx0XHRDb25uZWN0b3IuY3JlYXRlQ29ubmVjdG9yKHRoaXMsdGhpcy5wcm9jZXNzR3JvdXBTcHJpbmdDb25uZWN0b3JPbmVOb2RlVG9Db25uZWN0ZWROb2Rlcyxjb25uZWN0b3JEaXNwbGF5KTtcclxuXHR9XHJcblx0XHJcblx0cHJvY2Vzc0dyb3VwU3ByaW5nQ29ubmVjdG9yT25lTm9kZVRvQ29ubmVjdGVkTm9kZXMoY29ubmVjdG9yLG5vZGUsdGltZXN0YW1wKVxyXG5cdHtcclxuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xyXG5cdFx0Zm9yKHZhciBpPTA7aTxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGIgPSBjb25uZWN0b3Iubm9kZXNbaV07XHJcblx0XHRcdHZhciBkaXN0YW5jZSA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XHJcblx0XHRcdGlmIChiICE9IG5vZGUgJiYgZGlzdGFuY2U8Y29ubmVjdG9yLnJlbGF4ZWREaXN0YW5jZSkgcG9zaXRpb25MaXN0LnB1c2goYi5wb3NpdGlvbik7XHRcdFxyXG5cdFx0fVxyXG5cdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMCk7XHJcblx0fVxyXG5cclxuXHRwcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcclxuXHR7XHJcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBiID0gY29ubmVjdG9yLm5vZGVzW2ldO1xyXG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xyXG5cdFx0XHRpZiAoYiAhPSBub2RlICYmIGRpc3RhbmNlPGNvbm5lY3Rvci5yZWxheGVkRGlzdGFuY2UpIHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcclxuXHRcdH1cclxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBHcm91cENvbm5lY3RvcjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkdyb3VwQ29ubmVjdG9yXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4uL2Nvbm5lY3Rvci9jb25uZWN0b3InKTtcclxuXHJcbmNsYXNzIFNoYXBlQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yXHJcbntcclxuXHRjb25zdHJ1Y3Rvcihub2RlLGNvbm5lY3RvckRpc3BsYXksc2hhcGUsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3Isb3V0c2lkZVJlbGF4ZWREaXN0YW5jZSxvdXRzaWRlRWxhc3RpY2l0eUZhY3RvcilcclxuXHR7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMubm9kZSA9IG5vZGU7XHJcblx0XHR0aGlzLnNwcmluZ0FuY2hvclBvaW50ID0gbm9kZS5wb3NpdGlvbjtcclxuXHRcdHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQgPSBhbmNob3JPZmZzZXRQb2ludDtcclxuXHRcdHRoaXMucmVsYXhlZERpc3RhbmNlID0gcmVsYXhlZERpc3RhbmNlO1xyXG5cdFx0dGhpcy5lbGFzdGljaXR5RmFjdG9yID0gZWxhc3RpY2l0eUZhY3RvcjtcclxuXHRcdHRoaXMub3V0c2lkZVJlbGF4ZWREaXN0YW5jZSA9IG91dHNpZGVSZWxheGVkRGlzdGFuY2U7XHJcblx0XHR0aGlzLm91dHNpZGVFbGFzdGljaXR5RmFjdG9yID0gb3V0c2lkZUVsYXN0aWNpdHlGYWN0b3I7XHJcblx0XHR0aGlzLnNoYXBlID0gc2hhcGU7XHJcblx0XHQvLy8vLy8vLy8vY29uc29sZS5sb2coXCJDUkVBVEU6XCIrc2hhcGUpO1xyXG5cdFx0Q29ubmVjdG9yLmNyZWF0ZUNvbm5lY3Rvcih0aGlzLFNoYXBlQ29ubmVjdG9yLnByb3RvdHlwZS5wcm9jZXNzU2hhcGVDb25uZWN0b3JPbmVOb2RlVG9Db25uZWN0ZWROb2Rlcyxjb25uZWN0b3JEaXNwbGF5KTtcclxuXHR9XHJcblx0XHJcblx0cHJvY2Vzc1NoYXBlQ29ubmVjdG9yT25lTm9kZVRvQ29ubmVjdGVkTm9kZXMoY29ubmVjdG9yLG5vZGUsdGltZXN0YW1wKVxyXG5cdHtcclxuXHQvL1x0dmFyIHBvc2l0aW9uTGlzdCA9IGNvbm5lY3Rvci5pbml0UHJvY2Vzc29yKCk7XHJcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gbmV3IEFycmF5KCk7XHJcblx0XHJcblx0XHRcclxuXHRcdGlmKCF0aGlzLnNoYXBlLmNvbnRhaW5zUG9zaXRpb24obm9kZS5wb3NpdGlvbix0aGlzLm5vZGUpKVxyXG5cdFx0e1xyXG5cdFx0XHQvKioqKioqKioqKioqXHJcblx0XHRcdHZhciBvblNoYXBlTGluZVBvc2l0aW9uID0gdGhpcy5zaGFwZS5maW5kQ2xvc2VzdFBvaW50SW5TaGFwZUZyb21TdGFydGluZ1BvaW50KG5vZGUucG9zaXRpb24sdGhpcy5ub2RlKTtcclxuXHRcdFx0cG9zaXRpb25MaXN0LnB1c2gob25TaGFwZUxpbmVQb3NpdGlvbik7XHJcblx0XHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50RXhwKG5vZGUscG9zaXRpb25MaXN0LDAuMCx0aGlzLm91dHNpZGVSZWxheGVkRGlzdGFuY2UsdGhpcy5vdXRzaWRlRWxhc3RpY2l0eUZhY3Rvcik7XHJcblx0XHRcdCoqKioqKioqKioqKioqKiovXHJcblx0XHRcdHZhciBhdmVyYWdlUG9pbnRUcmFuc2Zvcm1lZCA9IHRoaXMuc2hhcGUuZ2V0QXZlcmFnZVBvaW50VHJhbnNmb3JtZWQodGhpcy5ub2RlKVxyXG5cdFx0XHQvL3Bvc2l0aW9uTGlzdC5wdXNoKHRoaXMubm9kZS5wb3NpdGlvbik7XHJcblx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKGF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBvdXRzaWRlUmVsYXhEaXN0YW5jZSA9IHRoaXMub3V0c2lkZVJlbGF4ZWREaXN0YW5jZTtcclxuXHRcdFx0dmFyIG91dHNpZGVFbGFzdGljaXR5RmFjdG9yID0gdGhpcy5vdXRzaWRlRWxhc3RpY2l0eUZhY3RvcjtcclxuXHRcdFx0b3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IgPSAwLjAyNTtcclxuXHRcdFx0aWYoZGlzdGFuY2U+b3V0c2lkZVJlbGF4RGlzdGFuY2UqMS4yNSkgXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIml0cyBvdXRzaWRlISE6bm9kZT1cIitub2RlLm5hbWUrXCIgZGlzdGFuY2U9XCIrZGlzdGFuY2UpO1xyXG5cdFx0XHRcdG91dHNpZGVFbGFzdGljaXR5RmFjdG9yID0gMC4wMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcdCBcclxuXHRcdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnRFeHAoXHJcblx0XHRcdFx0bm9kZSxcclxuXHRcdFx0XHRwb3NpdGlvbkxpc3QsXHJcblx0XHRcdFx0MC4wLFxyXG5cdFx0XHRcdG91dHNpZGVSZWxheERpc3RhbmNlLFxyXG5cdFx0XHRcdG91dHNpZGVFbGFzdGljaXR5RmFjdG9yKTtcclxuXHRcclxuXHRcdFx0Ly9jb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudEV4cChub2RlLHBvc2l0aW9uTGlzdCwwLjAsMC4wLDAuNSk7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHZhciBzaGFwZUFyZWEgPSB0aGlzLnNoYXBlLmdldFNoYXBlQXJlYSgpO1xyXG5cdFx0XHR2YXIgbWluQXJlYVBlck5vZGUgPSBzaGFwZUFyZWEgLyBjb25uZWN0b3Iubm9kZXMubGVuZ3RoO1xyXG5cdFx0XHQvL3ZhciBzcGFjaW5nID0gbWluQXJlYVBlck5vZGUvMjsvL01hdGguc3FydChtaW5BcmVhUGVyTm9kZSk7XHJcblx0XHRcdHZhciBzcGFjaW5nID0gTWF0aC5zcXJ0KG1pbkFyZWFQZXJOb2RlKSoxLjAxOy8vKjIuMztcclxuXHRcdFx0aWYoc3BhY2luZz09MCkgc3BhY2luZyA9IDE7XHJcblx0XHRcdC8vdmFyIHNwYWNpbmcgPSBNYXRoLnNxcnQobWluQXJlYVBlck5vZGUpKjEuMztcclxuXHRcdFx0LypcclxuXHRcdFx0aWYobm9kZS5pc1NlbGVjdGVkKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coXCJub2RlIG5hbWU6XCIrbm9kZS5uYW1lKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlx0c2hhcGVBcmVhOlwiK3NoYXBlQXJlYSk7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coXCJcdG1pbkFyZWFQZXJOb2RlOlwiK21pbkFyZWFQZXJOb2RlKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlx0c3BhY2luZzpcIitzcGFjaW5nKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQqL1xyXG5cdFxyXG5cdFx0XHR0aGlzLnJlbGF4ZWREaXN0YW5jZSA9IHNwYWNpbmc7XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgYiA9IGNvbm5lY3Rvci5ub2Rlc1tpXTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvKlxyXG5cdFx0XHRcdGlmKG5vZGUuaXNTZWxlY3RlZClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR2YXIgZCA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XHJcblx0XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIlx0Y2hlY2tpbmc6XCIrYi5uYW1lK1wiIGRpc3RhbmNlPVwiK2QpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQqL1xyXG5cdFx0XHRcdGlmKGIgIT0gbm9kZSAmJiB0aGlzLnNoYXBlLmNvbnRhaW5zUG9zaXRpb24oYi5wb3NpdGlvbix0aGlzLm5vZGUpKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZhciBkaXN0YW5jZSA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XHJcblx0XHRcdFx0XHRpZiAoZGlzdGFuY2U8c3BhY2luZylcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0cG9zaXRpb25MaXN0LnB1c2goYi5wb3NpdGlvbik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vaWYobm9kZS5pc1NlbGVjdGVkKSBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcclxuXHRcclxuXHRcdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnRFeHAobm9kZSxwb3NpdGlvbkxpc3QsMC4wLHRoaXMucmVsYXhlZERpc3RhbmNlLHRoaXMuZWxhc3RpY2l0eUZhY3Rvcik7XHJcblx0XHRcdC8vIG1vdmUgaXQgdG8gYSBuZXcgc3BhY2luZyBkaXN0YW5jZSAoc3RpbGwgaW4gdGhlIHNoYXBlKVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvL2Nvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xyXG5cdFxyXG5cdFx0Ly9pZihzaGFwZS5jb250YWluc1Bvc2l0aW9uKCkpXHJcblx0XHQvLyBpZiBpdCBpcyBub3QgaW5zaWRlIHRoZSBzaGFwZSBtb3ZlIGludG8gdGhlIHNoYXBlIGZhc3QgYXMgcG9zc2libGVcclxuXHRcdC8vICAgICAgICAuLnlvdSBjYW4gY3ljbGUgdGhyb3VnaCB0aGUgc2lkZXMgYW5kIGZpbmQgdGhlIGNsb3NldCBpbnRlcnNlY3Rpb24gcG9pbnQuXHJcblx0XHQvLyAgICAgICAgLi50aGlzIGNhbiBwcm9iYWJseSBiZSBvcHRpbWl6ZWQgYnkgbG9va2luZyBhdCBlYWNoIHBvaW50IGZpcnN0XHJcblx0XHQvLyBpZiBpdCBpcyBpbnNpZGUgdGhlIHNoYXBlIHRoZW4gOlxyXG5cdFx0Ly8gICAgICAgIC4uZmluZCBoZSBhdmVyYWdlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHBvaW50cyAob25seSBjaGVjayB0aG9zZSBzbyBjbG9zZT8hPyE/X1xyXG5cdFx0Ly8gICAgICAgIGlmIGl0cyBkaXN0YW5jZSBpcyBncmVhdCB0aGFuIHRoZSBhdmVyYWdlIHRoZW4gbW92ZSBhd2F5IGZvciB0aGUgQ09OIG9mIHRoZSBzYW1wbGluZ1xyXG5cdFx0Ly8gICAgICAgIGlmIHRoZSBkaXN0YW5jZSBpcyBsZXNzIHRoYW4gdGhlIGF2ZXJhZ2UgaGVuIG1vdmUgdG93YXJkcyB0aGUgQ09NIG9mIHRoZSBzYW1wbGluZ1xyXG5cdFx0Ly8gICAgICAuLnRoZSBhdmVyYWdlIHNwYWNlIGJlIGFibGUgdG8gdG8gYmUgY2FsY3VsYXRlZCBcclxuXHRcdC8vXHJcblx0XHQvLyAgICAgIGZ1bmN0aW9uIHRvIGZpbmQgdGhlIGF2ZXJhZ2UgZGlzdGFuY2UgYmV0d2VlbiBhIGxpc3Qgb2YgcG9pbnRzXHJcblx0XHQvLy8gICAgIGlmIHlvdSBsb29rIGF0IHRoZSBhcmVhIHlvdSBzaG91bGQgYmUgYWJsZSB0byBkaXZlIGl0IGJ5IHRoZSBzaXplIG8gdGhlIHNhbXBsaW5nXHJcblx0XHQvLyAgICAgIHRvIGdldCB0aGlzIGF2ZXJhZ2UuLi4uXHJcblx0XHQvL1x0XHRpZiB3ZSBsaW1pdGVkIGl0IHRvIGEgcGUgc2xpY2UgaXQgaXMgZWFzeS4uLiBhIHNsaWNlIG9mIHRoZSBwaWUncyBhcmVhIGlzIGVhc3kgdG8gY2FsY3VsYXRlXHJcblx0XHQvL1xyXG5cdFx0Ly9cdFx0Zm9yIGEgY2xvc2VkIGxpc3Qgb2YgcG9seWdvbnMgaXQgaXMgYSBzdW0gb2YgdHJpYW5nbGVzLi4uIHNob3VsZCBjaXJjbGVzXHJcblx0XHQvLyBcdFx0YmUgYSBzcGVjaWFsIGNhc2U/XHJcblx0XHQvKlxyXG5cdFx0Zm9yKHZhciBpPTA7aTxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGIgPSBjb25uZWN0b3Iubm9kZXNbaV07XHJcblx0XHRcdGlmIChiICE9IG5vZGUgJiYgZGlzdGFuY2U8Y29ubmVjdG9yLnJlbGF4ZWREaXN0YW5jZSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcclxuXHRcdFx0fVxyXG5cdFxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShiLnBvc2l0aW9uKTtcclxuXHRcdFx0aWYgKGIgIT0gbm9kZSAmJiBkaXN0YW5jZTxjb25uZWN0b3IucmVsYXhlZERpc3RhbmNlKSBwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcdFx0XHJcblx0XHR9XHJcblx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudChub2RlLHBvc2l0aW9uTGlzdCwwKTtcclxuXHRcdCovXHJcblx0fVxyXG5cclxuXHRwcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcclxuXHR7XHJcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBiID0gY29ubmVjdG9yLm5vZGVzW2ldO1xyXG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xyXG5cdFx0XHRpZiAoYiAhPSBub2RlICYmIGRpc3RhbmNlPGNvbm5lY3Rvci5yZWxheGVkRGlzdGFuY2UpIHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcclxuXHRcdH1cclxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZUNvbm5lY3RvcjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOlNoYXBlQ29ubmVjdG9yXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4uL2Nvbm5lY3Rvci9jb25uZWN0b3InKTtcclxuXHJcbmNsYXNzICBXYWxsQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yXHJcbntcclxuXHRjb25zdHJ1Y3Rvcihjb25uZWN0b3JEaXNwbGF5LHNwcmluZ0FuY2hvclBvaW50LGFuY2hvck9mZnNldFBvaW50LHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yKVxyXG5cdHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5zcHJpbmdBbmNob3JQb2ludCA9IHNwcmluZ0FuY2hvclBvaW50O1xyXG5cdFx0dGhpcy5hbmNob3JPZmZzZXRQb2ludCA9IGFuY2hvck9mZnNldFBvaW50O1xyXG5cdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UgPSByZWxheGVkRGlzdGFuY2U7XHJcblx0XHR0aGlzLmVsYXN0aWNpdHlGYWN0b3IgPSBlbGFzdGljaXR5RmFjdG9yO1xyXG5cdFx0Q29ubmVjdG9yLmNyZWF0ZUNvbm5lY3Rvcih0aGlzLFdhbGxDb25uZWN0b3IucHJvdG90eXBlLnByb2Nlc3NXYWxsU3ByaW5nUmVwdWxzZU9uZU5vZGUsY29ubmVjdG9yRGlzcGxheSk7XHJcblx0fVxyXG5cclxuXHRwcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcclxuXHR7XHJcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcclxuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFgoKS1ub2RlLndpZHRoLzIpPDApXHJcblx0XHR7XHJcblx0XHRcdG5vZGUucG9zaXRpb24uc2V0WCgwK25vZGUud2lkdGgvMik7XHJcblx0XHR9XHJcblx0XHRpZigobm9kZS5wb3NpdGlvbi5nZXRYKCkrbm9kZS53aWR0aC8yKT53b3JsZC5jYW52YXNIb2xkZXIuZ2V0V2lkdGgoKSlcclxuXHRcdHtcclxuXHRcdFx0bm9kZS5wb3NpdGlvbi5zZXRYKHdvcmxkLmNhbnZhc0hvbGRlci5nZXRXaWR0aCgpLW5vZGUud2lkdGgvMik7XHRcclxuXHRcdH1cclxuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFkoKS1ub2RlLmhlaWdodC8yKTwwKVxyXG5cdFx0e1xyXG5cdFx0XHRub2RlLnBvc2l0aW9uLnNldFkoMCtub2RlLmhlaWdodC8yKTtcclxuXHRcdH1cclxuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFkoKStub2RlLmhlaWdodC8yKT53b3JsZC5jYW52YXNIb2xkZXIuZ2V0SGVpZ2h0KCkpXHJcblx0XHR7XHJcblx0XHRcdG5vZGUucG9zaXRpb24uc2V0WSh3b3JsZC5jYW52YXNIb2xkZXIuZ2V0SGVpZ2h0KCktbm9kZS5oZWlnaHQvMik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBXYWxsQ29ubmVjdG9yO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6V2FsbENvbm5lY3RvclwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsImNsYXNzIENvbm5lY3RvckRpc3BsYXlcclxue1xyXG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxyXG5cdHtcclxuXHRcdENvbm5lY3RvckRpc3BsYXkuY3JlYXRlQ29ubmVjdG9yRGlzcGxheSh0aGlzLGRpc3BsYXlJbmZvKTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBjcmVhdGVDb25uZWN0b3JEaXNwbGF5KGNvbm5lY3RvckRpc3BsYXksZGlzcGxheUluZm8pXHJcblx0e1xyXG5cdFx0Y29ubmVjdG9yRGlzcGxheS5kaXNwbGF5SW5mbyA9IGRpc3BsYXlJbmZvO1xyXG5cdH1cclxuXHJcblx0ZHJhd0Nvbm5lY3RvcihjYW52YXNIb2xkZXIsY29ubmVjdG9yLG5vZGUpXHJcblx0e1xyXG5cdH1cclxuXHJcblx0Y29udGFpbnNQb3N0aW9uKHBvc2l0aW9uLGNvbm5lY3RvcilcclxuXHR7XHJcblx0XHRyZXR1cm4oZmFsc2UpO1xyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3JEaXNwbGF5O1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q29ubmVjdG9yRGlzcGxheVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBDb25uZWN0b3JEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5Jyk7XHJcblxyXG5jbGFzcyBDb25uZWN0b3JEaXNwbGF5RW1wdHkgZXh0ZW5kcyBDb25uZWN0b3JEaXNwbGF5XHJcbntcclxuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbykgXHJcblx0e1xyXG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xyXG5cdH1cclxuXHJcblx0ZHJhd0Nvbm5lY3RvcihjYW52YXNIb2xkZXIsY29ubmVjdG9yLG5vZGUpXHJcblx0e1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvckRpc3BsYXlFbXB0eTtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkNvbm5lY3RvckRpc3BsYXlFbXB0eVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcbnZhciBDYW52YXNIb2xkZXI9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVyJyk7XHJcblxyXG5jbGFzcyBOb2RlXHJcbntcclxuICBjb25zdHJ1Y3RvcihuYW1lLHBvc2l0aW9uLG9mZnNldCxjYW52YXNIb2xkZXIsZ3JhcGhEYXRhLGluZm9EYXRhKVxyXG4gIHtcclxuXHQgIE5vZGUuaW5pdE5vZGUodGhpcyxuYW1lLHBvc2l0aW9uLG9mZnNldCxjYW52YXNIb2xkZXIsZ3JhcGhEYXRhLGluZm9EYXRhKTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGluaXROb2RlKG5vZGUsbmFtZSxwb3NpdGlvbixvZmZzZXQsY2FudmFzSG9sZGVyLGdyYXBoRGF0YSxpbmZvRGF0YSlcclxuICB7XHJcblx0XHRpZihncmFwaERhdGE9PW51bGwpIGdyYXBoRGF0YSA9IG5ldyBPYmplY3QoKTtcclxuXHRcdFxyXG5cdFx0bm9kZS5uYW1lID0gbmFtZTtcclxuXHRcdG5vZGUuY2FudmFzSG9sZGVyID0gY2FudmFzSG9sZGVyO1xyXG5cdFx0bm9kZS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFx0bm9kZS5ncmFwaERhdGEgPSBncmFwaERhdGE7XHJcblx0XHRub2RlLmluZm9EYXRhID0gaW5mb0RhdGE7XHJcblx0XHRub2RlLm9mZnNldCA9IG9mZnNldDtcclxuXHRcdFxyXG5cdFx0bm9kZS5ub2RlcyA9IG5ldyBBcnJheSgpO1xyXG5cdFx0bm9kZS5wb3NpdGlvbk1vdmVMaXN0ID0gbmV3IEFycmF5KCk7XHJcblx0XHRub2RlLmNvbm5lY3RvcnMgPSBuZXcgQXJyYXkoKTtcclxuXHRcdG5vZGUuaXNBbmltYXRlZCA9IHRydWU7XHJcblx0XHRub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuXHRcdG5vZGUubGF5ZXI9MDtcclxuXHRcdFxyXG5cdFx0bm9kZS5jb25uZWN0b3JQb3NpdGlvbiA9IG5ldyBQb3NpdGlvbigwLDApO1xyXG5cclxuXHRcdGlmKG5vZGUuZ3JhcGhEYXRhLmluaXRHcmFwaERhdGEhPW51bGwpIG5vZGUuZ3JhcGhEYXRhLmluaXRHcmFwaERhdGEobm9kZSk7XHRcdFxyXG4gIH1cclxuICBcclxuICBkcmF3Q2FudmFzKHRpbWVzdGFtcClcclxuICB7XHJcbiAgXHR0aGlzLnNldEFuaW1hdGlvblRpbWVzKCk7XHJcblxyXG4gIFx0dGhpcy5jbGVhckNhbnZhcygpO1xyXG4gIFx0XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxyXG4gICAgICB7XHJcbiAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XHJcbiAgICAgICAgICBpZih0aGlzLmlzQW5pbWF0ZWQpIG5vZGUuYW5pbWF0ZUNhbGN1bGF0ZSh0aW1lc3RhbXApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGVuZ3RoO2krKylcclxuICAgICAge1xyXG4gICAgICBcdHZhciBub2RlID0gdGhpcy5ub2Rlc1tpXTtcclxuICAgICAgXHRpZih0aGlzLmlzQW5pbWF0ZWQpICBub2RlLmFuaW1hdGVGaW5hbGl6ZSh0aW1lc3RhbXApO1xyXG4gICAgICBcdG5vZGUuZHJhd0NhbnZhcyh0aW1lc3RhbXApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmRyYXdDb25uZWN0b3JzKCk7IFxyXG4gICAgICB0aGlzLmRyYXdOb2RlcygpO1xyXG5cclxuICAgICAgaWYodGhpcy5leHRyYUFuaW1hdGlvbiE9bnVsbCkgdGhpcy5leHRyYUFuaW1hdGlvbih0aW1lc3RhbXApO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5kcmF3KCk7XHJcbiAgICAgIHRoaXMuZGVidWdGdW5jdGlvbigpO1xyXG4gIH1cclxuXHJcblxyXG5cdGdldE5vZGVVaURpc3BsYXkobm9kZSlcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5uYW1lKTtcclxuXHR9XHJcblx0YWRkTm9kZShub2RlKVxyXG5cdHtcclxuXHRcdHRoaXMubm9kZXMucHVzaChub2RlKTtcclxuXHRcdG5vZGUuY2FudmFzSG9sZGVyID0gdGhpcy5jYW52YXNIb2xkZXIuY2xvbmUobm9kZS5wb3NpdGlvbik7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiYWRkTm9kZSBub2RlLmNhbnZhc0hvbGRlcjpcIitDb21tb250b1N0cmluZyhub2RlLmNhbnZhc0hvbGRlcikpO1xyXG5cdFx0dGhpcy5ub2Rlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuXHQgIFx0ICByZXR1cm4oYS5sYXllci1iLmxheWVyKTtcclxuXHQgIFx0fSk7XHRcclxuXHR9XHJcblx0XHJcblx0cmVtb3ZlTm9kZShub2RlKVxyXG5cdHtcclxuXHRcdENvbW1vbnJlbW92ZUl0ZW1Gcm9tQXJyYXkodGhpcy5ub2Rlcyxub2RlKTtcclxuXHRcclxuXHR9XHJcblx0XHJcblx0Y2xlYXJDYW52YXModGltZXN0YW1wKVxyXG5cdHtcclxuXHR9XHJcblx0XHJcblx0ZHJhdygpXHJcblx0e1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRkcmF3Q29ubmVjdG9ycyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0aWYodGhpcy5pc1Zpc2FibGUpIFxyXG5cdFx0e1xyXG5cdFx0ICAgIGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxyXG5cdFx0ICAgIHtcclxuXHRcdCAgICBcdHZhciBub2RlID0gdGhpcy5ub2Rlc1tpXTtcclxuXHRcdCAgICBcdGZvcih2YXIgaj0wO2o8bm9kZS5jb25uZWN0b3JzLmxlbmd0aDtqKyspXHJcblx0XHQgICAgXHR7XHJcblx0XHQgICAgXHRcdHZhciBjb25uZWN0b3IgPSBub2RlLmNvbm5lY3RvcnNbal07XHJcblx0XHQgICAgXHRcdGNvbm5lY3Rvci5jb25uZWN0b3JEaXNwbGF5LmRyYXdDb25uZWN0b3IodGhpcy5jYW52YXNIb2xkZXIsY29ubmVjdG9yLG5vZGUpO1xyXG5cdFx0ICAgICAgICB9XHJcblx0XHQgICAgfVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRkcmF3Tm9kZXModGltZXN0YW1wKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMuaXNWaXNhYmxlKSBcclxuXHRcdHtcclxuXHRcdCAgIFx0Zm9yKHZhciBpPTA7aTx0aGlzLm5vZGVzLmxlbmd0aDtpKyspXHJcblx0XHQgICBcdHtcclxuXHRcdCAgIFx0XHR2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07IFxyXG5cdFx0ICAgXHRcdGlmKHRoaXMuaXNWaXNhYmxlKSBub2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kcmF3Tm9kZSh0aGlzLmNhbnZhc0hvbGRlcixub2RlKTtcclxuXHRcdCAgIFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzZXRBbmltYXRpb25UaW1lcyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdH1cclxuXHRcclxuXHRkZWJ1Z0Z1bmN0aW9uKClcclxuXHR7XHJcblx0fVxyXG5cdFxyXG5cdGdldE5vZGVDb250YWluaW5nUG9zaXRpb24ocG9zaXRpb24pXHJcblx0e1xyXG5cdFx0dmFyIGZvdW5kTm9kZSA9IG51bGw7XHJcblx0XHJcblx0ICAgIGZvciAodmFyIGk9dGhpcy5ub2Rlcy5sZW5ndGgtMTtpPj0wO2ktLSlcclxuXHQgICAge1xyXG5cdCAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGVzW2ldO1xyXG5cdCAgICAgICAgaWYobm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuY29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKSlcclxuXHQgICAgICAgIHtcclxuXHQgICAgICAgIFx0Zm91bmROb2RlID0gbm9kZTtcclxuXHQgICAgICAgIFx0YnJlYWs7XHJcblx0ICAgICAgICB9XHJcblx0ICAgIH1cclxuXHQgICAgcmV0dXJuKGZvdW5kTm9kZSk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdFxyXG5cdGFuaW1hdGVDYWxjdWxhdGUodGltZXN0YW1wKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMuaXNBbmltYXRlZClcclxuXHRcdHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbm5lY3RvcnMubGVuZ3RoOyBpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgY29ubmVjdG9yID0gdGhpcy5jb25uZWN0b3JzW2ldO1xyXG5cdFx0XHRcdGNvbm5lY3Rvci5leGVjdXRlQ29ubmVjdG9yRnVuY3Rpb24odGltZXN0YW1wLHRoaXMpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YW5pbWF0ZUZpbmFsaXplKHRpbWVzdGFtcClcclxuXHR7XHJcblx0XHQvL2lmKHRoaXMuaXNBbmltYXRlZClcclxuXHRcdHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbm5lY3RvcnMubGVuZ3RoOyBpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLnNldE5ld1Bvc2l0aW9uKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5wb3NpdGlvbk1vdmVMaXN0Lmxlbmd0aCA9IDA7XHJcblx0XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNvbnRhaW5zUG9zdGlvbihwb3NpdGlvbilcclxuXHR7XHJcblx0XHRyZXR1cm4oXHJcblx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0XHQodGhpcy5wb3NpdGlvbi5nZXRYKCktdGhpcy53aWR0aC8yKTw9cG9zaXRpb24uZ2V0WCgpICYmXHJcblx0XHRcdFx0XHRcdCh0aGlzLnBvc2l0aW9uLmdldFgoKSt0aGlzLndpZHRoLzIpPj1wb3NpdGlvbi5nZXRYKCkgJiZcclxuXHRcdFx0XHRcdFx0KHRoaXMucG9zaXRpb24uZ2V0WSgpLXRoaXMuaGVpZ2h0LzIpPD1wb3NpdGlvbi5nZXRZKCkgJiZcclxuXHRcdFx0XHRcdFx0KHRoaXMucG9zaXRpb24uZ2V0WSgpK3RoaXMuaGVpZ2h0LzIpPj1wb3NpdGlvbi5nZXRZKClcclxuXHRcdFx0XHQpXHJcblx0XHRcdCk7XHJcblx0fVxyXG5cdFxyXG5cdHNldE5ld1Bvc2l0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLnBvc2l0aW9uTW92ZUxpc3QubGVuZ3RoPT0wKSAgdGhpcy5wb3NpdGlvbk1vdmVMaXN0LnB1c2godGhpcy5wb3NpdGlvbik7XHRcclxuXHRcdHZhciBuZXdQb3NpdGlvbiA9IG5ldyBQb3NpdGlvbigwLDApO1xyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5sZW5ndGg7IGkrKylcclxuXHQgICAge1xyXG5cdCAgICAgICAgdmFyIG9uZVBvc2l0aW9uID0gIHRoaXMucG9zaXRpb25Nb3ZlTGlzdFtpXTtcclxuXHQgICAgICAgIG5ld1Bvc2l0aW9uLnNldFgobmV3UG9zaXRpb24uZ2V0WCgpK29uZVBvc2l0aW9uLmdldFgoKSk7XHJcblx0ICAgICAgICBuZXdQb3NpdGlvbi5zZXRZKG5ld1Bvc2l0aW9uLmdldFkoKStvbmVQb3NpdGlvbi5nZXRZKCkpO1xyXG5cdFx0fVxyXG5cdFxyXG5cdFx0dGhpcy5wb3NpdGlvbi5zZXRYKG5ld1Bvc2l0aW9uLmdldFgoKSAvIHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5sZW5ndGgpO1xyXG5cdFx0dGhpcy5wb3NpdGlvbi5zZXRZKG5ld1Bvc2l0aW9uLmdldFkoKSAvIHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5sZW5ndGgpO1x0XHJcblx0fVxyXG5cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBOb2RlO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Tm9kZVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcblxyXG5jbGFzcyBDYW52YXNIb2xkZXJcclxue1xyXG5cdGNvbnN0cnVjdG9yKGNhbnZhc05hbWUpXHJcblx0e1xyXG5cdFx0dGhpcy5jYW52YXNOYW1lID0gY2FudmFzTmFtZTtcclxuXHRcdHRoaXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzTmFtZSk7XHJcblx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cdFx0dGhpcy5vcmlnaW4gPSBuZXcgUG9zaXRpb24oMCwwKTtcclxuXHRcdHRoaXMuaXNDYW52YXNWaXNhYmxlID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0Y2xvbmUob3JpZ2luKVxyXG5cdHtcclxuXHRcdHZhciBjYW52YXNIb2xkZXIgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRjYW52YXNIb2xkZXIuY2FudmFzTmFtZSA9IHRoaXMuY2FudmFzTmFtZTtcclxuXHRcdGNhbnZhc0hvbGRlci5jYW52YXMgPSB0aGlzLmNhbnZhcztcclxuXHRcdGNhbnZhc0hvbGRlci5jb250ZXh0ID0gdGhpcy5jb250ZXh0O1xyXG5cdFx0Y2FudmFzSG9sZGVyLm9yaWdpbiA9IG9yaWdpbjtcclxuXHRcdGNhbnZhc0hvbGRlci5pc0NhbnZhc1Zpc2FibGUgPSB0aGlzLmlzQ2FudmFzVmlzYWJsZTtcclxuXHRcdHJldHVybihjYW52YXNIb2xkZXIpO1xyXG5cdH1cclxuXHRcclxuXHRpc1Zpc2FibGUoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmlzQ2FudmFzVmlzYWJsZSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFdpZHRoKClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5jYW52YXMud2lkdGgpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRIZWlnaHQoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzSG9sZGVyO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q2FudmFzSG9sZGVyXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwiY2xhc3MgTW91ZVN0YXR1c1xyXG57XHJcblx0Y29uc3RydWN0b3IoaXNEb3duLHN0YXJ0UG9zaXRpb24scG9zaXRpb24sbm9kZSxub2RlU3RhcnRQb3NpdGlvbilcclxuXHR7XHJcblx0XHR0aGlzLmlzRG93biA9IGlzRG93bjtcclxuXHRcdHRoaXMuc3RhcnRQb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XHJcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblx0XHR0aGlzLm5vZGUgPSBub2RlO1xyXG5cdFx0dGhpcy5ub2RlU3RhcnRQb3NpdGlvbiA9IG5vZGVTdGFydFBvc2l0aW9uO1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdWVTdGF0dXM7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpNb3VlU3RhdHVzXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vcG9zaXRpb24vcG9zaXRpb24nKTtcclxudmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2RlJyk7XHJcblxyXG5jbGFzcyBOb2RlQ2FudmFzIGV4dGVuZHMgTm9kZVxyXG57XHJcblx0ICBjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIpXHJcblx0ICB7XHJcblx0XHQgIHN1cGVyKFx0Y2FudmFzSG9sZGVyLmNhbnZhc05hbWUsXHJcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oMCwwKSxcclxuXHRcdFx0XHRcdG5ldyBQb3NpdGlvbigwLDApLFxyXG5cdFx0XHRcdFx0Y2FudmFzSG9sZGVyLFxyXG5cdFx0XHRcdFx0bnVsbCxcclxuXHRcdFx0XHRcdG51bGwpO1xyXG5cdFx0ICBOb2RlQ2FudmFzLmluaXROb2RlQ2FudmFzKHRoaXMsY2FudmFzSG9sZGVyKTtcclxuXHRcdCAgXHJcblx0ICB9XHJcblx0ICBcclxuXHQgIHN0YXRpYyBpbml0Tm9kZUNhbnZhcyhub2RlQ2FudmFzLGNhbnZhc0hvbGRlcilcclxuXHQgIHtcclxuXHRcdFx0bm9kZUNhbnZhcy5leHRyYUFuaW1hdGlvbiA9IG51bGw7XHJcblx0XHRcdG5vZGVDYW52YXMuY2FudmFzSG9sZGVyID0gY2FudmFzSG9sZGVyO1xyXG5cdFx0XHRub2RlQ2FudmFzLnN0YXJ0QW5pbWF0aW9uVGltZVN0YW1wID0gbnVsbDtcclxuXHRcdFx0bm9kZUNhbnZhcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wID0gbnVsbDtcclxuXHRcdFx0bm9kZUNhbnZhcy5zdGFydEFuaW1hdGlvbkRhdGUgPSBudWxsO1xyXG5cdFx0XHRub2RlQ2FudmFzLmFuaW1hdGlvbkV4ZWNUaW1lID0gMDtcclxuXHRcdFx0bm9kZUNhbnZhcy50aW1lRmFjdG9yID0gMTtcclxuXHRcdH1cclxuXHRcclxuXHRcclxuXHRpc1Zpc2FibGUoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmNhbnZhc0hvbGRlci5pc1Zpc2FibGUoKSlcclxuXHR9XHJcblx0XHJcblx0cG9pbnRlclVwKG5vZGUpXHJcblx0e1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcIk5vZGVDYW52YXMucG9pbnRlclVwOlwiK25vZGUubmFtZSlcclxuXHR9XHJcblx0XHJcblx0cG9pbnRlck1vdmUobm9kZSlcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiTm9kZUNhbnZhcy5wb2ludGVyTW92ZTpcIitub2RlLm5hbWUpXHJcblx0fVxyXG5cdFxyXG5cdHBvaW50ZXJEb3duKG5vZGUpXHJcblx0e1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcIk5vZGVDYW52YXMucG9pbnRlckRvd246XCIrbm9kZS5uYW1lKVxyXG5cdH1cclxuXHRcclxuXHRwYXVzZSgpXHJcblx0e1xyXG5cdFx0dGhpcy5pc0FuaW1hdGVkID0gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdHBsYXkoKVxyXG5cdHtcclxuXHRcdHRoaXMuaXNBbmltYXRlZCA9IHRydWU7XHJcblx0ICAgIHRoaXMuZHJhdygpO1xyXG5cdH1cclxuXHRkcmF3KClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0ICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApIHsgc2VsZi5kcmF3Q2FudmFzKHRpbWVzdGFtcCkgfSwgZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRzZXRBbmltYXRpb25UaW1lcyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0aWYodGhpcy5zdGFydEFuaW1hdGlvblRpbWVTdGFtcD09bnVsbCkgdGhpcy5zdGFydEFuaW1hdGlvblRpbWVTdGFtcCA9IHRpbWVzdGFtcCswO1xyXG5cdFx0aWYodGhpcy5zdGFydEFuaW1hdGlvbkRhdGU9PW51bGwpIHRoaXMuc3RhcnRBbmltYXRpb25EYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0aWYodGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wPT1udWxsKSB0aGlzLmxhc3RBbmltYXRpb25UaW1lU3RhbXAgPSBub3c7XHJcblx0XHJcblx0XHRpZih0aGlzLmlzQW5pbWF0ZWQpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuYW5pbWF0aW9uRXhlY1RpbWUgKz0gbm93LmdldFRpbWUoKS10aGlzLmxhc3RBbmltYXRpb25UaW1lU3RhbXAuZ2V0VGltZSgpO1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwibm93PVwiK25vdytcclxuXHRcdFx0Ly9cdFwiIGxhc3RBbmltYXRpb25UaW1lU3RhbXA9XCIrdGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wK1xyXG5cdFx0XHQvL1x0XCIgYW5pbWF0aW9uRXhlY1RpbWU9XCIrdGhpcy5hbmltYXRpb25FeGVjVGltZStcclxuXHRcdFx0Ly9cdFwiXCIpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wID0gbm93O1xyXG5cdFxyXG5cdH1cclxuXHRcclxuXHRcclxuXHRjbGVhckNhbnZhcyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0aWYodGhpcy5pc1Zpc2FibGUoKSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5jYW52YXNIb2xkZXIuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXNIb2xkZXIuZ2V0V2lkdGgoKSwgdGhpcy5jYW52YXNIb2xkZXIuY2FudmFzLmhlaWdodCk7XHJcblx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmZpbGxTdHlsZSlcclxuXHRcdFx0dGhpcy5jYW52YXNIb2xkZXIuY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhc0hvbGRlci5nZXRXaWR0aCgpLCB0aGlzLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IE5vZGVDYW52YXM7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlQ2FudmFzXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIE1vdXNlU3RhdHVzID0gcmVxdWlyZSgnLi4vbm9kZWNhbnZhcy9tb3VzZXN0YXR1cycpO1xyXG52YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG5cclxuY2xhc3MgTm9kZUNhbnZhc01vdXNlXHJcbntcclxuXHRjb25zdHJ1Y3Rvcihub2RlQ2FudmFzKVxyXG5cdHtcclxuXHRcdE5vZGVDYW52YXNNb3VzZS5jcmVhdGVOb2RlQ2FudmFzTW91c2UodGhpcyxub2RlQ2FudmFzKTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBjcmVhdGVOb2RlQ2FudmFzTW91c2Uobm9kZUNhbnZhc01vdXNlLG5vZGVDYW52YXMpXHJcblx0e1xyXG5cdFx0bm9kZUNhbnZhc01vdXNlLm5vZGVDYW52YXMgPSBub2RlQ2FudmFzO1xyXG5cdFx0aWYobm9kZUNhbnZhcy5pc1Zpc2FibGUoKSkgXHJcblx0XHR7XHJcblx0XHRcdG5vZGVDYW52YXNNb3VzZS5vZmZzZXQgPSBOb2RlQ2FudmFzTW91c2UuZ2V0Q2FudmFzT2Zmc2V0KG5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcyk7XHJcblx0XHRcdG5vZGVDYW52YXNNb3VzZS5tb3VzZVN0YXR1cyA9IG5ldyBNb3VlU3RhdHVzKGZhbHNlLG5ldyBQb3NpdGlvbigwLDApLG5ldyBQb3NpdGlvbigwLDApLG51bGwsbnVsbCk7XHJcblx0XHRcdG5vZGVDYW52YXNNb3VzZS5pbml0Q2F2YW5zUG9pbnRlcigpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgZ2V0Q2FudmFzT2Zmc2V0KG9iailcclxuXHR7XHJcblx0ICAgIHZhciBvZmZzZXRMZWZ0ID0gMDtcclxuXHQgICAgdmFyIG9mZnNldFRvcCA9IDA7XHJcblx0ICAgIGRvXHJcblx0ICAgIHtcclxuXHQgICAgICBpZiAoIWlzTmFOKG9iai5vZmZzZXRMZWZ0KSlcclxuXHQgICAgICB7XHJcblx0ICAgICAgICAgIG9mZnNldExlZnQgKz0gb2JqLm9mZnNldExlZnQ7XHJcblx0ICAgICAgfVxyXG5cdCAgICAgIGlmICghaXNOYU4ob2JqLm9mZnNldFRvcCkpXHJcblx0ICAgICAge1xyXG5cdCAgICAgICAgICBvZmZzZXRUb3AgKz0gb2JqLm9mZnNldFRvcDtcclxuXHQgICAgICB9ICAgXHJcblx0ICAgIH1cclxuXHQgICAgd2hpbGUob2JqID0gb2JqLm9mZnNldFBhcmVudCApO1xyXG5cdCAgICBcclxuXHQgICAgcmV0dXJuIHtsZWZ0OiBvZmZzZXRMZWZ0LCB0b3A6IG9mZnNldFRvcH07XHJcblx0fVxyXG5cclxuXHRwb2ludGVyRG93bkV2ZW50KGV2ZW50KVxyXG5cdHtcclxuXHRcdHZhciBldmVudFBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKGV2ZW50LnBhZ2VYLXRoaXMub2Zmc2V0LmxlZnQsZXZlbnQucGFnZVktdGhpcy5vZmZzZXQudG9wKTtcclxuXHRcdHRoaXMuaGlkZUN1cnJlbnROb2RlSW5mbygpO1xyXG5cdFxyXG5cdFx0dGhpcy5tb3VzZVN0YXR1cy5pc0Rvd24gPSB0cnVlO1xyXG5cdFx0dGhpcy5tb3VzZVN0YXR1cy5zdGFydFBvc2l0aW9uID0gZXZlbnRQb3NpdGlvbjtcclxuXHRcdHRoaXMubW91c2VTdGF0dXMucG9zaXRpb24gPSBldmVudFBvc2l0aW9uO1xyXG5cdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5ub2RlIT1udWxsKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNBbmltYXRlZCA9IHRydWU7XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZSA9IG51bGw7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBjbGlja05vZGUgPSAgdGhpcy5ub2RlQ2FudmFzLmdldE5vZGVDb250YWluaW5nUG9zaXRpb24oZXZlbnRQb3NpdGlvbik7XHJcblx0XHJcblx0XHR2YXIgY2xpY2tOb2RlID0gIHRoaXMubm9kZUNhbnZhcy5nZXROb2RlQ29udGFpbmluZ1Bvc2l0aW9uKGV2ZW50UG9zaXRpb24pO1xyXG5cdFx0aWYoY2xpY2tOb2RlIT1udWxsICYmIGNsaWNrTm9kZSE9dGhpcy5tb3VzZVN0YXR1cy5sYXN0Tm9kZSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlID0gY2xpY2tOb2RlO1xyXG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGVTdGFydFBvc2l0aW9uID0gY2xpY2tOb2RlLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5pc1NlbGVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5vZmZzZXQgPSBjbGlja05vZGUucG9zaXRpb24uZ2V0RGVsdGEoZXZlbnRQb3NpdGlvbik7XHJcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5wb2ludGVyRG93bihjbGlja05vZGUpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zaG93Q3VycmVudE5vZGVJbmZvKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKGNsaWNrTm9kZT09bnVsbClcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5oaWRlQ3VycmVudE5vZGVJbmZvKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRoaXMubW91c2VTdGF0dXMubGFzdE5vZGUpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuaGlkZUN1cnJlbnROb2RlSW5mbygpO1xyXG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLmxhc3ROb2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5sYXN0Tm9kZSA9IG51bGw7XHJcblx0XHR9XHJcblx0XHJcblx0fVxyXG5cdFxyXG5cdHNob3dDdXJyZW50Tm9kZUluZm8oKVxyXG5cdHtcclxuXHRcdHZhciBodG1sT2JqZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJub2RlaW5mb1wiKTtcclxuXHRcdGlmKGh0bWxPYmplY3QhPW51bGwpXHJcblx0XHR7XHJcblx0XHRcdGh0bWxPYmplY3Quc3R5bGUubGVmdCA9IHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5nZXRYKCkrMzArJ3B4JztcclxuXHRcdFx0aHRtbE9iamVjdC5zdHlsZS50b3AgID0gdGhpcy5tb3VzZVN0YXR1cy5ub2RlLnBvc2l0aW9uLmdldFkoKSsncHgnO1xyXG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcblx0XHRcdCQoJyNub2RlaW5mbycpLmh0bWwodGhpcy5tb3VzZVN0YXR1cy5ub2RlLmdldE5vZGVVaURpc3BsYXkoKSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGNvbnNvbGUubG9nKFwibmFtZTpcIit0aGlzLm1vdXNlU3RhdHVzLm5vZGUubmFtZStcIlxcblwiK1xyXG5cdFx0XHRcdFwiXHRpc1NlbGVjdGVkOlwiK3RoaXMubW91c2VTdGF0dXMubm9kZS5pc1NlbGVjdGVkK1wiXFxuXCIrXHJcblx0XHRcdFx0XCJcdGlzU2VsZWN0ZWQ6XCIrdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzQW5pbWF0ZWQrXCJcXG5cIitcclxuXHRcdFx0XHRcIlx0cG9zaXRpb246XCIrQ29tbW9uLnRvU3RyaW5nKHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbikrXCJcXG5cIitcclxuXHRcdFx0XHRcIlx0aXNTZWxlY3RlZDpcIit0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNTZWxlY3RlZCtcclxuXHRcdFx0XHRcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiK1xyXG5cdFx0XHRcIlwiKTtcclxuXHR9XHJcblx0XHJcblx0aGlkZUN1cnJlbnROb2RlSW5mbygpXHJcblx0e1xyXG5cdFx0dmFyIGh0bWxPYmplY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vZGVpbmZvXCIpO1xyXG5cdFx0aWYoaHRtbE9iamVjdCE9bnVsbClcclxuXHRcdHtcclxuXHRcdFx0aHRtbE9iamVjdC5zdHlsZS5sZWZ0ID0gMCsncHgnO1xyXG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLnRvcCAgPSAwKydweCc7XHJcblx0XHRcdGh0bWxPYmplY3Quc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG5cdFx0XHQkKCcjbm9kZWluZm8nKS5odG1sKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHBvaW50ZXJNb3ZlRXZlbnQoZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIGV2ZW50UG9zaXRpb24gPSBuZXcgUG9zaXRpb24oZXZlbnQucGFnZVgtdGhpcy5vZmZzZXQubGVmdCxldmVudC5wYWdlWS10aGlzLm9mZnNldC50b3ApO1xyXG5cdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5pc0Rvd24pXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuaGlkZUN1cnJlbnROb2RlSW5mbygpO1xyXG5cdFxyXG5cdFx0XHRpZih0aGlzLm1vdXNlU3RhdHVzLm5vZGUhPW51bGwpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNBbmltYXRlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMubW91c2VTdGF0dXMucG9zaXRpb24gPSBldmVudFBvc2l0aW9uO1xyXG5cdFx0XHRcdHZhciBkZWx0YVBvc2l0aW9uID0gdGhpcy5tb3VzZVN0YXR1cy5ub2RlU3RhcnRQb3NpdGlvbi5nZXREZWx0YShldmVudFBvc2l0aW9uKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUucG9zaXRpb24uc2V0WChcclxuXHRcdFx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlU3RhcnRQb3NpdGlvbi5nZXRYKCktXHJcblx0XHRcdFx0XHRcdGRlbHRhUG9zaXRpb24uZ2V0WCgpK1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm9mZnNldC5nZXRYKCkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5zZXRZKFxyXG5cdFx0XHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGVTdGFydFBvc2l0aW9uLmdldFkoKS1cclxuXHRcdFx0XHRcdFx0ZGVsdGFQb3NpdGlvbi5nZXRZKCkrXHJcblx0XHRcdFx0XHRcdHRoaXMubW91c2VTdGF0dXMub2Zmc2V0LmdldFkoKSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5ub2RlQ2FudmFzLnBvaW50ZXJNb3ZlKHRoaXMubW91c2VTdGF0dXMubm9kZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cG9pbnRlclVwRXZlbnQoZXZlbnQpXHJcblx0e1xyXG5cdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5ub2RlIT1udWxsKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm5vZGVDYW52YXMucG9pbnRlclVwKHRoaXMubW91c2VTdGF0dXMubm9kZSk7XHJcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5pc0FuaW1hdGVkID0gdHJ1ZTtcclxuXHRcdFx0Ly90aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLmxhc3ROb2RlID0gdGhpcy5tb3VzZVN0YXR1cy5ub2RlO1xyXG5cdFxyXG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUgPSBudWxsO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5tb3VzZVN0YXR1cy5pc0Rvd24gPSBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0aW5pdENhdmFuc1BvaW50ZXIoKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdGlmKHdpbmRvdy5Qb2ludGVyRXZlbnQpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5jYW52YXNIb2xkZXIuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCBmdW5jdGlvbihldmVudCkgeyBzZWxmLnBvaW50ZXJEb3duRXZlbnQoIGV2ZW50KSB9LCBmYWxzZSk7XHJcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5jYW52YXNIb2xkZXIuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlck1vdmVFdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcclxuXHRcdFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJ1cFwiLGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlclVwRXZlbnQoIGV2ZW50KSB9LCBmYWxzZSk7XHJcblx0ICAgIH1cclxuXHQgICAgZWxzZVxyXG5cdCAgICB7XHJcblx0ICAgIFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlckRvd25FdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcclxuXHQgICAgXHR0aGlzLm5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyTW92ZUV2ZW50KCBldmVudCkgfSwgZmFsc2UpO1xyXG5cdCAgICBcdHRoaXMubm9kZUNhbnZhcy5jYW52YXNIb2xkZXIuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlclVwRXZlbnQoIGV2ZW50KSB9LCBmYWxzZSk7XHJcblx0ICAgIH0gIFxyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBOb2RlQ2FudmFzTW91c2U7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlQ2FudmFzTW91c2VcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgTm9kZURpc3BsYXkgPSByZXF1aXJlKCcuLi9ub2RlZGlzcGxheS9ub2RlZGlzcGxheScpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG5cclxuY2xhc3MgQ2lyY2xlRGlzcGxheSBleHRlbmRzIE5vZGVEaXNwbGF5XHJcbntcclxuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcclxuXHR7XHJcblx0XHRzdXBlcihkaXNwbGF5SW5mbyk7XHJcblx0fVxyXG5cdFxyXG5cdGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSlcclxuXHR7XHJcblx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKHBvc2l0aW9uKTtcclxuXHRcdHJldHVybihkaXN0YW5jZTw9dGhpcy5kaXNwbGF5SW5mby5yYWRpdXMpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRkcmF3Tm9kZShjYW52YXNIb2xkZXIsbm9kZSlcclxuXHR7XHJcblx0ICAgIGlmKG5vZGUuaXNTZWxlY3RlZClcclxuXHQgICAge1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RGaWxsQ29sb3IpO1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnNlbGVjdEJvcmRlckNvbG9yKTtcclxuXHQgICAgfVxyXG5cdCAgICBlbHNlXHJcblx0ICAgIHtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uZmlsbENvbG9yKTtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5ib3JkZXJDb2xvcik7XHJcblx0ICAgIH1cclxuXHQgICAgXHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5hcmMobm9kZS5wb3NpdGlvbi5nZXRYKCksbm9kZS5wb3NpdGlvbi5nZXRZKCksdGhpcy5kaXNwbGF5SW5mby5yYWRpdXMsMCxNYXRoLlBJICogMiwgZmFsc2UpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lV2lkdGggPSB0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcclxuXHR9XHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGVEaXNwbGF5O1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q2lyY2xlRGlzcGxheVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsImNsYXNzIE5vZGVEaXNwbGF5XHJcbntcclxuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcclxuXHR7XHJcblx0XHROb2RlRGlzcGxheS5jcmVhdGVOb2RlRGlzcGxheSh0aGlzLGRpc3BsYXlJbmZvKTtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGNyZWF0ZU5vZGVEaXNwbGF5KG5vZGVEaXNwbGF5LGRpc3BsYXlJbmZvKVxyXG5cdHtcclxuXHRcdG5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvID0gZGlzcGxheUluZm87XHJcblx0fVxyXG5cdFxyXG5cdGRyYXdOb2RlIChjYW52YXNIb2xkZXIsbm9kZSlcclxuXHR7XHJcblx0ICAgXHJcblx0fVxyXG5cdFxyXG5cdGNvbnRhaW5zUG9zaXRpb24gKHBvc3Rpb24sbm9kZSlcclxuXHR7XHJcblx0fVxyXG5cdFxyXG5cdGZpbGxUZXh0TXV0aXBsZUxpbmVzKGNvbnRleHQsdGV4dCx4LHksbGluZUhlaWdodCxzcGxpdENoYXIpXHJcblx0e1xyXG5cdFx0dmFyIGxpbmVzID0gdGV4dC5zcGxpdChzcGxpdENoYXIpO1xyXG5cdCAgICB2YXIgbGluZSA9ICcnO1xyXG5cdFxyXG5cdCAgICBmb3IodmFyIG4gPSAwOyBuIDwgbGluZXMubGVuZ3RoOyBuKyspXHJcblx0ICAgIHtcclxuXHQgICAgICB2YXIgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQobGluZXNbbl0pO1xyXG5cdCAgICAgIGNvbnRleHQuZmlsbFRleHQobGluZXNbbl0sIHgsIHkpO1xyXG5cdCAgICAgIHkgPSB5K2xpbmVIZWlnaHQ7IFxyXG5cdCAgICB9XHJcblx0ICAgIGNvbnRleHQuZmlsbFRleHQobGluZSwgeCwgeSk7XHJcblx0IH1cclxuXHRcclxuXHRtZXRyaWNzVGV4dE11dGlwbGVMaW5lcyhjb250ZXh0LHRleHQsbGluZUhlaWdodCxzcGxpdENoYXIpXHJcblx0e1xyXG5cdFx0dmFyIGxpbmVzID0gdGV4dC5zcGxpdChzcGxpdENoYXIpO1xyXG5cdCAgICB2YXIgbGluZSA9ICcnO1xyXG5cdCAgICB2YXIgbWF4V2lkdGggPSAwO1xyXG5cdCAgICB2YXIgdG90YWxIZWlnaHQgPSAwO1xyXG5cdCAgICBmb3IodmFyIG4gPSAwOyBuIDwgbGluZXMubGVuZ3RoOyBuKyspXHJcblx0ICAgIHtcclxuXHQgICAgICB2YXIgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQobGluZXNbbl0pO1xyXG5cdCAgICAgIGlmKG1ldHJpY3Mud2lkdGg+bWF4V2lkdGgpIG1heFdpZHRoID0gbWV0cmljcy53aWR0aDtcclxuXHQgICAgICB0b3RhbEhlaWdodCA9IHRvdGFsSGVpZ2h0ICsgbGluZUhlaWdodDtcclxuXHQgICAgfVxyXG5cdCAgICByZXR1cm4oe3dpZHRoOm1heFdpZHRoLGhlaWdodDp0b3RhbEhlaWdodH0pO1xyXG5cdCB9XHJcblx0XHJcblx0cm91bmRlZFJlY3QoY29udGV4dCx4LHksdyxoLHIsYm9yZGVyV2l0ZGgsYm9yZGVyQ29sb3IscmVjdENvbG9yKVxyXG5cdHtcclxuXHRcdCAgaWYgKHcgPCAyICogcikgciA9IHcgLyAyO1xyXG5cdFx0ICBpZiAoaCA8IDIgKiByKSByID0gaCAvIDI7XHJcblx0XHQgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0XHQgIGNvbnRleHQubW92ZVRvKHgrciwgeSk7XHJcblx0XHQgIGNvbnRleHQuYXJjVG8oeCt3LCB5LCAgIHgrdywgeStoLCByKTtcclxuXHRcdCAgY29udGV4dC5hcmNUbyh4K3csIHkraCwgeCwgICB5K2gsIHIpO1xyXG5cdFx0ICBjb250ZXh0LmFyY1RvKHgsICAgeStoLCB4LCAgIHksICAgcik7XHJcblx0XHQgIGNvbnRleHQuYXJjVG8oeCwgICB5LCAgIHgrdywgeSwgICByKTtcclxuXHRcdCAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHRcdC8qXHJcblx0ICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0ICAgIGNvbnRleHQubW92ZVRvKHgsIHkpO1xyXG5cdCAgICBjb250ZXh0LmxpbmVUbyh4ICsgd2lkdGggLSBjb3JuZXJSYWRpdXMsIHkpO1xyXG5cdCAgICBjb250ZXh0LmFyY1RvKHggKyB3aWR0aCwgeSwgeCArIHdpZHRoLCB5ICsgY29ybmVyUmFkaXVzLCBjb3JuZXJSYWRpdXMpO1xyXG5cdCAgICBjb250ZXh0LmxpbmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQpO1xyXG5cdCAgICovIFxyXG5cdCAgICBjb250ZXh0LmxpbmVXaWR0aCA9IGJvcmRlcldpdGRoO1xyXG5cdCAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHJlY3RDb2xvcjtcclxuXHQgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGJvcmRlckNvbG9yO1xyXG5cdCAgICBcclxuXHQgICAgY29udGV4dC5zdHJva2UoKTtcclxuXHQgICAgY29udGV4dC5maWxsKCk7XHJcblx0XHJcblx0fVxyXG59XHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gTm9kZURpc3BsYXk7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlRGlzcGxheVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBOb2RlRGlzcGxheSA9IHJlcXVpcmUoJy4uL25vZGVkaXNwbGF5L25vZGVkaXNwbGF5Jyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XHJcblxyXG5jbGFzcyBSZWN0YW5nbGVEaXNwbGF5IGV4dGVuZHMgTm9kZURpc3BsYXlcclxue1xyXG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxyXG5cdHtcclxuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcclxuXHR9XHJcblx0XHJcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxyXG5cdHtcclxuXHRcdHJldHVybihcclxuXHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdChub2RlLnBvc2l0aW9uLmdldFgoKS10aGlzLmRpc3BsYXlJbmZvLndpZHRoLzIpPD1wb3NpdGlvbi5nZXRYKCkgJiZcclxuXHRcdFx0XHRcdFx0KG5vZGUucG9zaXRpb24uZ2V0WCgpK3RoaXMuZGlzcGxheUluZm8ud2lkdGgvMik+PXBvc2l0aW9uLmdldFgoKSAmJlxyXG5cdFx0XHRcdFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCktdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMik8PXBvc2l0aW9uLmdldFkoKSAmJlxyXG5cdFx0XHRcdFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCkrdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMik+PXBvc2l0aW9uLmdldFkoKVxyXG5cdFx0XHRcdClcclxuXHRcdFx0KTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0ZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpXHJcblx0e1xyXG5cdCAgICBpZihub2RlLmlzU2VsZWN0ZWQpXHJcblx0ICAgIHtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0RmlsbENvbG9yKTtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RCb3JkZXJDb2xvcik7XHJcblx0ICAgIH1cclxuXHQgICAgZWxzZVxyXG5cdCAgICB7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uYm9yZGVyQ29sb3IpO1xyXG5cdCAgICB9XHJcblx0ICAgIC8vY29uc29sZS5sb2coQ29tbW9udG9TdHJpbmcodGhpcy5kaXNwbGF5SW5mbykpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5maWxsUmVjdCggXHJcblx0ICAgIFx0XHQobm9kZS5wb3NpdGlvbi5nZXRYKCktdGhpcy5kaXNwbGF5SW5mby53aWR0aC8yKSxcclxuXHQgICAgXHRcdChub2RlLnBvc2l0aW9uLmdldFkoKS10aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKSxcclxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8ud2lkdGgsXHJcblx0ICAgIFx0XHR0aGlzLmRpc3BsYXlJbmZvLmhlaWdodCk7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmJvcmRlckNvbG9yKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlUmVjdCggXHJcblx0ICAgIFx0XHQobm9kZS5wb3NpdGlvbi5nZXRYKCktdGhpcy5kaXNwbGF5SW5mby53aWR0aC8yKSwgXHJcblx0ICAgIFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCktdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMiksIFxyXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby53aWR0aCwgXHJcblx0ICAgIFx0XHR0aGlzLmRpc3BsYXlJbmZvLmhlaWdodCk7XHJcblx0XHJcblx0fVxyXG59XHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gUmVjdGFuZ2xlRGlzcGxheTtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOlJlY3RhbmdsZURpc3BsYXlcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgTm9kZURpc3BsYXkgPSByZXF1aXJlKCcuLi9ub2RlZGlzcGxheS9ub2RlZGlzcGxheScpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG52YXIgU2hhcGUgPSByZXF1aXJlKCcuLi9zaGFwZXMvc2hhcGUnKTtcclxuXHJcbmNsYXNzIFRyaWFuZ2xlRGlzcGxheSBleHRlbmRzIE5vZGVEaXNwbGF5XHJcbntcclxuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcclxuXHR7XHJcblx0XHRzdXBlcihkaXNwbGF5SW5mbyk7XHJcblx0XHRcclxuXHRcdHZhciBwb2ludExpc3QgPSBuZXcgQXJyYXkoKTtcclxuXHRcdFxyXG5cdFx0cG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKDAsLSh0aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKSkpO1xyXG5cdFx0cG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKHRoaXMuZGlzcGxheUluZm8ud2lkdGgvMix0aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKSk7XHJcblx0XHRwb2ludExpc3QucHVzaChuZXcgUG9zaXRpb24oLSh0aGlzLmRpc3BsYXlJbmZvLndpZHRoLzIpLHRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpKTtcclxuXHRcdHBvaW50TGlzdC5wdXNoKG5ldyBQb3NpdGlvbigwLC0odGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMikpKTtcclxuXHRcclxuXHRcdHRoaXMucG9pbnRMaXN0ID0gcG9pbnRMaXN0O1xyXG5cdFx0dGhpcy5zaGFwZSA9IG5ldyBTaGFwZShwb2ludExpc3QsbmV3IFBvc2l0aW9uKDAsMCkpXHJcblx0fVxyXG5cdFxyXG5cdGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSlcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5zaGFwZS5jb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0ZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpXHJcblx0e1xyXG5cdFx0dGhpcy5zaGFwZS5kcmF3U2hhcGUoY2FudmFzSG9sZGVyLG5vZGUsdGhpcy5kaXNwbGF5SW5mbyk7XHJcblx0fVxyXG59XHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gVHJpYW5nbGVEaXNwbGF5O1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6VHJpYW5nbGVEaXNwbGF5XCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwiY2xhc3MgUG9zaXRpb25cclxue1xyXG5cdGNvbnN0cnVjdG9yKHgsIHkpXHJcblx0e1xyXG5cdCAgICB0aGlzLnggPSB4O1xyXG5cdCAgICB0aGlzLnkgPSB5O1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGdldEF2ZXJhZ2VQb3N0aW9uRnJvbVBvc2l0aW9uTGlzdChwb3NpdGlvbkxpc3QpXHJcblx0e1xyXG5cdFx0dmFyIHggPSAwLjA7XHJcblx0XHR2YXIgeSA9IDAuMDtcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBwID0gcG9zaXRpb25MaXN0W2ldO1xyXG5cdFx0XHR4ICs9IHAuZ2V0WCgpO1xyXG5cdFx0XHR5ICs9IHAuZ2V0WSgpO1xyXG5cdFx0fVxyXG5cdFx0eCA9IHggLyBwb3NpdGlvbkxpc3QubGVuZ3RoO1xyXG5cdFx0eSA9IHkgLyBwb3NpdGlvbkxpc3QubGVuZ3RoO1xyXG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih4LHkpKTtcclxuXHR9XHJcblx0XHRcclxuXHRzdGF0aWMgZ2V0QXZlcmFnZVBvc3Rpb25Gcm9tTm9kZUxpc3Qobm9kZWxpc3QpXHJcblx0e1xyXG5cdFx0dmFyIHggPSAwLjA7XHJcblx0XHR2YXIgeSA9IDAuMDtcclxuXHRcdGZvcih2YXIgaT0wO2k8bm9kZWxpc3QubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHAgPSBub2RlbGlzdFtpXS5wb3NpdGlvbjtcclxuXHRcdFx0eCArPSBwLmdldFgoKTtcclxuXHRcdFx0eSArPSBwLmdldFkoKTtcclxuXHRcdH1cclxuXHRcdHggPSB4IC8gbm9kZWxpc3QubGVuZ3RoO1xyXG5cdFx0eSA9IHkgLyBub2RlbGlzdC5sZW5ndGg7XHJcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHgseSkpO1xyXG5cdH1cclxuXHRcdFxyXG5cdHN0YXRpYyBnZXRQb3N0aW9uTGlzdEZyb21Ob2RlTGlzdChub2RlTGlzdClcclxuXHR7XHJcblx0XHR2YXIgcG9zaXRpb25zID0gbmV3IEFycmF5KCk7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVMaXN0Lmxlbmd0aDsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRwb3NpdGlvbnMucHVzaChub2RlTGlzdFtpXS5wb3NpdGlvbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ocG9zaXRpb25zKTtcclxuXHR9XHJcblxyXG5cdGNvcHlGcm9tKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHRoaXMuc2V0WChwb3NpdGlvbi5nZXRYKCkpO1xyXG5cdFx0dGhpcy5zZXRZKHBvc2l0aW9uLmdldFkoKSk7XHJcblx0fVxyXG5cclxuXHRjb3B5VG8ocG9zaXRpb24pXHJcblx0e1xyXG5cdFx0cG9zaXRpb24uc2V0WCh0aGlzLmdldFgoKSk7XHJcblx0XHRwb3NpdGlvbi5zZXRZKHRoaXMuZ2V0WSgpKTtcclxuXHR9XHJcblxyXG5cdHNldFgoeClcclxuXHR7XHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdH1cclxuXHJcblx0c2V0WSh5KVxyXG5cdHtcclxuXHRcdHRoaXMueSA9IHk7XHJcblx0fVxyXG5cclxuXHRnZXRYKClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy54KTtcclxuXHR9XHJcblxyXG5cdGdldFkoKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLnkpO1xyXG5cdH1cclxuXHRcclxuXHRjbG9uZSgpXHJcblx0e1xyXG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih0aGlzLmdldFgoKSx0aGlzLmdldFkoKSkpO1xyXG5cdH1cclxuXHJcblx0ZXF1YWxzKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybiggKHRoaXMuZ2V0WCgpPT1wb3NpdGlvbi5nZXRYKCkpICYmICh0aGlzLmdldFkoKT09cG9zaXRpb24uZ2V0WSgpKSApIDtcclxuXHR9XHJcblxyXG5cdGNyZWF0ZUJ5QWRkaW5nKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybihuZXcgUG9zaXRpb24odGhpcy5nZXRYKCkgKyBwb3NpdGlvbi5nZXRYKCksdGhpcy5nZXRZKCkrcG9zaXRpb24uZ2V0WSgpKSk7XHJcblx0fVxyXG5cclxuXHRjcmVhdGVCeVN1YnRyYWN0aW5nKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybihuZXcgUG9zaXRpb24odGhpcy5nZXRYKCktcG9zaXRpb24uZ2V0WCgpLHRoaXMuZ2V0WSgpLXBvc2l0aW9uLmdldFkoKSkpO1xyXG5cdH1cclxuXHJcblx0ZmluZENsb3Nlc3RQb3N0aW9uT25MaW5lKHAxLHAyKVxyXG5cdHtcclxuXHRcdCAgdmFyIEEgPSB0aGlzLmdldERlbHRhWChwMSk7XHJcblx0XHQgIHZhciBCID0gdGhpcy5nZXREZWx0YVkocDEpO1xyXG5cdFx0ICB2YXIgQyA9IHAyLmdldERlbHRhWChwMSk7XHJcblx0XHQgIHZhciBEID0gcDIuZ2V0RGVsdGFZKHAxKTtcclxuXHRcclxuXHRcdCAgdmFyIGRvdCA9IEEgKiBDICsgQiAqIEQ7XHJcblx0XHQgIHZhciBsZW5ndGhTcXVhcmVkID0gQyAqIEMgKyBEICogRDtcclxuXHRcdCAgdmFyIHBhcmFtID0gLTE7XHJcblx0XHQgIGlmIChsZW5ndGhTcXVhcmVkICE9IDApIC8vaW4gY2FzZSBvZiAwIGxlbmd0aCBsaW5lXHJcblx0XHQgICAgICBwYXJhbSA9IGRvdCAvIGxlbmd0aFNxdWFyZWQ7XHJcblx0XHJcblx0XHQgIHZhciB4eCwgeXk7XHJcblx0XHJcblx0XHQgIGlmIChwYXJhbSA8IDApXHJcblx0XHQgIHtcclxuXHRcdCAgICB4eCA9IHAxLmdldFgoKTtcclxuXHRcdCAgICB5eSA9IHAxLmdldFkoKTtcclxuXHRcdCAgfVxyXG5cdFx0ICBlbHNlIGlmIChwYXJhbSA+IDEpIHtcclxuXHRcdCAgICB4eCA9IHAyLmdldFgoKTtcclxuXHRcdCAgICB5eSA9IHAyLmdldFkoKTtcclxuXHRcdCAgfVxyXG5cdFx0ICBlbHNlIHtcclxuXHRcdCAgICB4eCA9IHAxLmdldFgoKSArIHBhcmFtICogQztcclxuXHRcdCAgICB5eSA9IHAxLmdldFkoKSArIHBhcmFtICogRDtcclxuXHRcdCAgfVxyXG5cdC8qXHJcblx0XHQgIHZhciBkeCA9IHggLSB4eDtcclxuXHRcdCAgdmFyIGR5ID0geSAtIHl5O1xyXG5cdFx0ICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcclxuXHRcdCAgKi9cclxuXHRcdCAgcmV0dXJuKG5ldyBQb3NpdGlvbih4eCx5eSkpO1xyXG5cdH1cclxuXHJcblxyXG5cdGZpbmRDbG9zZXN0UG9pbnRJbkxpc3RcdChwb3NpdGlvbkxpc3QpXHJcblx0e1xyXG5cdFx0dmFyIGNsb3NldEluZGV4ID0gMDtcclxuXHRcdHZhciBjbG9zZXRQb2ludCA9IHBvc2l0aW9uTGlzdFtjbG9zZXRJbmRleF07XHJcblx0XHR2YXIgZGlzdGFuY2VUb0Nsb3Nlc3QgPSB0aGlzLmdldERpc3RhbmNlKGNsb3NldFBvaW50KTtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTxwb3NpdGlvbkxpc3QubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHBvaW50ID0gcG9zaXRpb25MaXN0W2ldO1xyXG5cdFx0XHR2YXIgZGlzdGFuY2VUb1BvaW50ID0gdGhpcy5nZXREaXN0YW5jZShwb2ludCk7XHJcblx0XHRcdGlmKGRpc3RhbmNlVG9Qb2ludDxkaXN0YW5jZVRvQ2xvc2VzdClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNsb3NldEluZGV4ID0gaTtcclxuXHRcdFx0XHRjbG9zZXRQb2ludCA9IHBvaW50O1xyXG5cdFx0XHRcdGRpc3RhbmNlVG9DbG9zZXN0ID0gZGlzdGFuY2VUb1BvaW50O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4oXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y2xvc2V0SW5kZXg6Y2xvc2V0SW5kZXgsXHJcblx0XHRcdFx0XHRjbG9zZXRQb2ludDpjbG9zZXRQb2ludCxcclxuXHRcdFx0XHRcdGRpc3RhbmNlVG9DbG9zZXN0OmRpc3RhbmNlVG9DbG9zZXN0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCk7XHJcblx0fVxyXG5cclxuXHRsb2dcdCgpXHJcblx0e1xyXG5cdFx0Y29uc29sZS5sb2coXHJcblx0XHRcdFx0XCJQb3NpdGlvblwiK1xyXG5cdFx0XHRcdFwiOng9XCIrdGhpcy5nZXRYKCkrXHJcblx0XHRcdFx0XCI6eT1cIit0aGlzLmdldFkoKStcclxuXHRcdFx0XHRcIlwiXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0Z2V0RGVsdGFZKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmdldFkoKS1wb3NpdGlvbi5nZXRZKCkpO1xyXG5cdH1cclxuXHJcblx0Z2V0RGVsdGFYKHBvc2l0aW9uKVxyXG5cdHtcclxuXHRcdHJldHVybih0aGlzLmdldFgoKS1wb3NpdGlvbi5nZXRYKCkpO1xyXG5cdH1cclxuXHJcblx0Z2V0RGVsdGEocG9zaXRpb24pXHJcblx0e1xyXG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih0aGlzLmdldERlbHRhWChwb3NpdGlvbiksdGhpcy5nZXREZWx0YVkocG9zaXRpb24pKSk7XHJcblx0fVxyXG5cclxuXHRnZXREaXN0YW5jZShwb3NpdGlvbilcclxuXHR7XHJcblx0XHRyZXR1cm4gKE1hdGguc3FydChNYXRoLnBvdyh0aGlzLmdldERlbHRhWChwb3NpdGlvbiksIDIpICsgTWF0aC5wb3codGhpcy5nZXREZWx0YVkocG9zaXRpb24pLCAyKSkpO1xyXG5cdH1cclxuXHJcblx0Z2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5KHBvc2l0aW9uT3JnLGRpc3RhbmNlKVxyXG5cdHtcclxuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHZhciBtb2RYID0gMC4wO1xyXG5cdFx0dmFyIG1vZFkgPSAwLjA7XHJcblx0XHJcblx0XHQvLyB3aGF0IGlmIHRoZXkgYXJlIHRvcCBvZiBlYWNoIG90aGVyP1xyXG5cdFx0aWYgKHRoaXMuZ2V0RGVsdGFYKHBvc2l0aW9uT3JnKSA9PSAwICYmIHRoaXMuZ2V0RGVsdGFZKHBvc2l0aW9uT3JnKSA9PSAwKVxyXG5cdFx0e1xyXG5cdFx0XHRtb2RYICs9IE1hdGgucmFuZG9tKCkgLSAwLjU7XHJcblx0XHRcdG1vZFkgKz0gTWF0aC5yYW5kb20oKSAtIDAuNTtcclxuXHRcdH1cclxuXHRcclxuXHRcdHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihwb3NpdGlvbk9yZy54ICsgbW9kWCwgcG9zaXRpb25PcmcueSArIG1vZFkpO1xyXG5cdFxyXG5cdFx0Ly8gdGhpcyBpcyB3aGVuIHRoZSBzbG9wZSBpcyB1bmRlZmluZWQgKHRvdGFsbHkgaG9yaXpvbnRhbCBsaW5lKVxyXG5cdFx0aWYgKHBvc2l0aW9uLmdldFgoKSA9PSB0aGlzLmdldFgoKSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHAxID0gbmV3IFBvc2l0aW9uKHBvc2l0aW9uLmdldFgoKSxwb3NpdGlvbi5nZXRZKCkrZGlzdGFuY2UpO1xyXG5cdFx0XHR2YXIgcDIgPSBuZXcgUG9zaXRpb24ocG9zaXRpb24uZ2V0WCgpLHBvc2l0aW9uLmdldFkoKS1kaXN0YW5jZSk7XHJcblx0XHRcdHAxLmRpc3RhbmNlID0gdGhpcy5nZXREaXN0YW5jZShwMSlcclxuXHRcdFx0cDIuZGlzdGFuY2UgPSB0aGlzLmdldERpc3RhbmNlKHAyKVxyXG5cdFxyXG5cdFx0XHRwb3NpdGlvbkxpc3QucHVzaChwMSk7XHJcblx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKHAyKTtcclxuXHRcdFx0cmV0dXJuKHBvc2l0aW9uTGlzdCk7XHJcblx0XHR9XHJcblx0XHJcblx0XHQvLyBnZXQgdGhlIGVxdWF0aW9uIGZvciB0aGUgbGluZSBtPXNsb3BlIGI9eS1pbnRlcmNlcHRcclxuXHRcdHZhciBtID0gdGhpcy5nZXREZWx0YVkocG9zaXRpb24pIC8gdGhpcy5nZXREZWx0YVgocG9zaXRpb24pO1xyXG5cdFx0dmFyIGIgPSB0aGlzLmdldFkoKSAtIChtICogdGhpcy5nZXRYKCkpO1xyXG5cdFxyXG5cdFx0dmFyIHhQbHVzID0gcG9zaXRpb24uZ2V0WCgpICsgZGlzdGFuY2UgLyBNYXRoLnNxcnQoMSArIChtICogbSkpO1xyXG5cdFx0dmFyIHhNaW51cyA9IHBvc2l0aW9uLmdldFgoKSAtIGRpc3RhbmNlIC8gTWF0aC5zcXJ0KDEgKyAobSAqIG0pKTtcclxuXHRcdHZhciB5UGx1cyA9IHhQbHVzICogbSArIGI7XHJcblx0XHR2YXIgeU1pbnVzID0geE1pbnVzICogbSArIGI7XHJcblx0XHJcblx0XHR2YXIgcDEgPSBuZXcgUG9zaXRpb24oeFBsdXMsIHlQbHVzKTtcclxuXHRcdHZhciBwMiA9IG5ldyBQb3NpdGlvbih4TWludXMsIHlNaW51cyk7XHJcblx0XHRwMS5kaXN0YW5jZSA9IHRoaXMuZ2V0RGlzdGFuY2UocDEpXHJcblx0XHRwMi5kaXN0YW5jZSA9IHRoaXMuZ2V0RGlzdGFuY2UocDIpXHJcblx0XHJcblx0XHRwb3NpdGlvbkxpc3QucHVzaChwMSk7XHJcblx0XHRwb3NpdGlvbkxpc3QucHVzaChwMik7XHJcblx0XHRyZXR1cm4ocG9zaXRpb25MaXN0KTtcclxuXHR9XHJcblxyXG5cdGdldERpc3RhbmNlUG9zdGlvbkxpc3QocG9zaXRpb25MaXN0KVxyXG5cdHtcclxuXHRcdHZhciBkaXN0YW5jZUxpc3QgPSBuZXcgQXJyYXkoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBwID0gcG9zaXRpb25MaXN0W2ldO1xyXG5cdFx0XHR2YXIgZCA9IHRoaXMuZ2V0RGlzdGFuY2UocCk7XHJcblx0XHRcdHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihwLmdldFgoKSwgcC5nZXRZKCkpO1xyXG5cdFx0XHRwb3NpdGlvbi5kaXN0YW5jZSA9IGQ7XHJcblx0XHRcdGRpc3RhbmNlTGlzdC5wdXNoKHBvc2l0aW9uKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAoZGlzdGFuY2VMaXN0KTtcclxuXHR9XHJcblxyXG5cdGdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QocG9zaXRpb24sZGlzdGFuY2UpXHJcblx0e1xyXG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IHRoaXMuZ2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5KHBvc2l0aW9uLGRpc3RhbmNlKTtcclxuXHRcdHZhciBjbG9zZXN0ID0gbnVsbDtcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHRcdFxyXG5cdFx0XHR2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkxpc3RbaV07XHJcblx0XHRcdGlmKGNsb3Nlc3Q9PW51bGwpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjbG9zZXN0ID0gcG9zaXRpb247XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZihwb3NpdGlvbi5kaXN0YW5jZSA8IGNsb3Nlc3QuZGlzdGFuY2UpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjbG9zZXN0ID0gcG9zaXRpb247XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vLy9jb25zb2xlLmxvZyhcImNsb3Nlc3Q9XCIrQ29tbW9udG9TdHJpbmcoY2xvc2VzdCkrXCIgZ2l2ZW4gZGlzdGFuY2U9XCIrZGlzdGFuY2UrXCIgcG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcocG9zaXRpb24pK1wiIGxpc3Q9XCIrQ29tbW9udG9TdHJpbmcocG9zaXRpb25MaXN0KSlcclxuXHRcdHJldHVybiAoY2xvc2VzdCk7XHJcblx0fVxyXG5cclxuXHRnZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXlGYXJ0aGVzdChwb3NpdGlvbixkaXN0YW5jZSlcclxuXHR7XHJcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gdGhpcy5nZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXkocG9zaXRpb24sZGlzdGFuY2UpO1xyXG5cdFx0dmFyIGZhcnRoZXN0ID0gbnVsbDtcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBwb3NpdGlvbiA9IHBvc2l0aW9uTGlzdFtpXTtcclxuXHRcdFx0aWYoZmFydGhlc3Q9PW51bGwpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRmYXJ0aGVzdCA9IHBvc2l0aW9uO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYocG9zaXRpb24uZGlzdGFuY2UgPiBmYXJ0aGVzdC5kaXN0YW5jZSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGZhcnRoZXN0ID0gcG9zaXRpb247XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiAoZmFydGhlc3QpO1xyXG5cdH1cclxufVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBQb3NpdGlvbjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOlBvc2l0aW9uXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwiY2xhc3MgQm91bmRpbmdCb3hcclxue1xyXG5cdGNvbnN0cnVjdG9yKHBvaW50TGlzdCxvZmZzZXQpXHJcblx0e1xyXG5cdFx0dGhpcy5pbml0RG9uZSA9IGZhbHNlO1xyXG5cdFx0dGhpcy5wb2ludExpc3QgPSBwb2ludExpc3Q7XHJcblx0XHR0aGlzLm9mZnNldCA9IG9mZnNldDtcclxuXHRcdHRoaXMuaW5pdEJvdW5kaW5nQm94KCk7XHJcblx0XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSlcclxuXHR7XHJcblx0XHRpZighdGhpcy5pbml0RG9uZSkgdGhpcy5pbml0Qm91bmRpbmdCb3goKTtcclxuXHRcclxuXHRcdHJldHVybihcclxuXHRcdFx0XHQoXHJcblx0XHRcdFx0XHRcdCh0aGlzLnhNaW4uZ2V0WCgpK25vZGUucG9zaXRpb24uZ2V0WCgpK3RoaXMub2Zmc2V0LmdldFgoKSk+PXBvc2l0aW9uLnggJiZcclxuXHRcdFx0XHRcdFx0KHRoaXMueE1heC5nZXRYKCkrbm9kZS5wb3NpdGlvbi5nZXRYKCkrdGhpcy5vZmZzZXQuZ2V0WCgpKTw9cG9zaXRpb24ueCAmJlxyXG5cdFx0XHRcdFx0XHQodGhpcy55TWluLmdldFkoKStub2RlLnBvc2l0aW9uLmdldFkoKSt0aGlzLm9mZnNldC5nZXRZKCkpPj1wb3NpdGlvbi55ICYmXHJcblx0XHRcdFx0XHRcdCh0aGlzLnlNYXguZ2V0WSgpK25vZGUucG9zaXRpb24uZ2V0WSgpK3RoaXMub2Zmc2V0LmdldFkoKSk8PXBvc2l0aW9uLnlcclxuXHRcdFx0XHQpXHJcblx0XHRcdCk7XHJcblx0fVxyXG5cdFxyXG5cdGluaXRCb3VuZGluZ0JveCgpXHJcblx0e1xyXG5cdFx0dGhpcy5pbml0RG9uZSA9IHRydWU7XHJcblx0XHQvL3RoaXMucG9pbnRMaXN0ID0gcG9pbnRMaXN0O1xyXG5cdFx0Ly90aGlzLm9mZnNldCA9IG9mZnNldDtcclxuXHRcclxuXHRcclxuXHRcdHRoaXMueE1pbiA9IG51bGw7XHJcblx0XHR0aGlzLnhNYXggPSBudWxsO1xyXG5cdFx0dGhpcy55TWluID0gbnVsbDtcclxuXHRcdHRoaXMueU1heCA9IG51bGw7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwicGxpc3Qgc2l6ZT1cIitwb2ludExpc3QubGVuZ3RoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5wb2ludExpc3QubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHAgPSB0aGlzLnBvaW50TGlzdFtpXTtcclxuXHRcdFx0aWYodGhpcy54TWluPT1udWxsKSB0aGlzLnhNaW4gPSBwO1xyXG5cdFx0XHRpZih0aGlzLnhNYXg9PW51bGwpIHRoaXMueE1heCA9IHA7XHJcblx0XHRcdGlmKHRoaXMueU1pbj09bnVsbCkgdGhpcy55TWluID0gcDtcclxuXHRcdFx0aWYodGhpcy55TWF4PT1udWxsKSB0aGlzLnlNYXggPSBwO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYocC5nZXRYKCk8dGhpcy54TWluKSB0aGlzLnhNaW4gPSBwO1xyXG5cdFx0XHRpZihwLmdldFgoKT50aGlzLnhNYXgpIHRoaXMueE1heCA9IHA7XHJcblx0XHRcdGlmKHAuZ2V0WSgpPHRoaXMueU1pbikgdGhpcy55TWluID0gcDtcclxuXHRcdFx0aWYocC5nZXRZKCk+dGhpcy55TWF4KSB0aGlzLnlNYXggPSBwO1xyXG5cdFxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLndpZHRoID0gdGhpcy54TWF4LmdldFgoKS10aGlzLnhNaW4uZ2V0WCgpO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSB0aGlzLnlNYXguZ2V0WSgpLXRoaXMueU1pbi5nZXRZKCk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvdW5kaW5nQm94O1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Qm91bmRpbmdCb3hcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgQm91bmRpbmdCb3ggPSByZXF1aXJlKCcuLi9zaGFwZXMvYm91bmRpbmdib3gnKTtcclxudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vcG9zaXRpb24vcG9zaXRpb24nKTtcclxuXHJcbmNsYXNzIFNoYXBlXHJcbntcclxuXHRjb25zdHJ1Y3Rvcihwb2ludExpc3Qsb2Zmc2V0KVxyXG5cdHtcclxuXHRcdHRoaXMucG9pbnRMaXN0ID0gcG9pbnRMaXN0O1xyXG5cdFx0dGhpcy5vZmZzZXQgPSBvZmZzZXQ7XHJcblx0XHR0aGlzLmF2ZXJhZ2VQb2ludCA9IG5ldyBQb3NpdGlvbigwLDApO1xyXG5cdFx0dGhpcy5ib3VuZGluZ0JveCA9IG5ldyBCb3VuZGluZ0JveChwb2ludExpc3Qsb2Zmc2V0KTtcclxuXHRcdHRoaXMuaW5pdFNoYXBlKCk7XHJcblx0fVxyXG5cdFxyXG5cdGluaXRTaGFwZSgpXHJcblx0e1xyXG5cdFx0aWYoIXRoaXMucG9pbnRMaXN0W3RoaXMucG9pbnRMaXN0Lmxlbmd0aC0xXS5lcXVhbHModGhpcy5wb2ludExpc3RbMF0pKSBcclxuXHRcdFx0dGhpcy5wb2ludExpc3QucHVzaCh0aGlzLnBvaW50TGlzdFswXS5jbG9uZSgpKTtcclxuXHRcdFxyXG5cdFx0XHJcblx0XHRQb3NpdGlvbi5nZXRBdmVyYWdlUG9zdGlvbkZyb21Qb3NpdGlvbkxpc3QodGhpcy5wb2ludExpc3QpLmNvcHlUbyh0aGlzLmF2ZXJhZ2VQb2ludCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZHJhd0NlbnRlckRvdCA9IGZhbHNlO1xyXG5cdFx0LypcclxuXHRcdGZvcih2YXIgaT0wO2k8cG9pbnRMaXN0Lmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiaT1cIitpK1wiIFwiK0NvbW1vbnRvU3RyaW5nKHBvaW50TGlzdFtpXSkpO1xyXG5cdFx0fVxyXG5cdFx0Ki9cclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHRkcmF3U2hhcGUoY2FudmFzSG9sZGVyLG5vZGUsZGlzcGxheUluZm8pXHJcblx0e1xyXG5cdCAgICBpZihub2RlLmlzU2VsZWN0ZWQpXHJcblx0ICAgIHtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLnNlbGVjdEJvcmRlckNvbG9yKTtcclxuXHQgICAgfVxyXG5cdCAgICBlbHNlXHJcblx0ICAgIHtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLmZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLmJvcmRlckNvbG9yKTtcclxuXHQgICAgfVxyXG5cdCAgICBcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0ICAgIGZvcih2YXIgaT0wO2k8dGhpcy5wb2ludExpc3QubGVuZ3RoO2krKylcclxuXHQgICAgeyAgIFx0XHJcblx0XHRcdHZhciBwb2ludCA9IHRoaXMucG9pbnRMaXN0W2ldLmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pLmNyZWF0ZUJ5QWRkaW5nKHRoaXMub2Zmc2V0KTtcclxuXHQgICAgXHRpZihpPT0wKSBjYW52YXNIb2xkZXIuY29udGV4dC5tb3ZlVG8ocG9pbnQuZ2V0WCgpLHBvaW50LmdldFkoKSk7XHJcblx0ICAgIFx0ZWxzZSBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lVG8ocG9pbnQuZ2V0WCgpLHBvaW50LmdldFkoKSk7XHJcblx0ICAgIH1cclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblx0ICAgIFxyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5maWxsKCk7XHJcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IGRpc3BsYXlJbmZvLmJvcmRlcldpZHRoO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcclxuXHQgICAgXHJcblx0ICAgIGlmKHRoaXMuZHJhd0NlbnRlckRvdClcclxuXHQgICAge1xyXG5cdCAgICBcdHZhciBhdmVyYWdlVHJhbnMgPSB0aGlzLmdldEF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkKG5vZGUpO1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcoXCIwMDAwMDBmZlwiKTtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5iZWdpblBhdGgoKTtcclxuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5hcmMobm9kZS5wb3NpdGlvbi5nZXRYKCksbm9kZS5wb3NpdGlvbi5nZXRZKCksMiwwLE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRnZXRBdmVyYWdlUG9pbnRUcmFuc2Zvcm1lZChub2RlKVxyXG5cdHtcclxuXHQgICAgdmFyIGF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkID0gdGhpcy5hdmVyYWdlUG9pbnQuY3JlYXRlQnlBZGRpbmcobm9kZS5wb3NpdGlvbikuY3JlYXRlQnlBZGRpbmcodGhpcy5vZmZzZXQpO1xyXG5cdCAgICByZXR1cm4oYXZlcmFnZVBvaW50VHJhbnNmb3JtZWQpO1xyXG5cdH1cclxuXHRcclxuXHQvL2Z1bmN0aW9uIHBvbHlnb25BcmVhKFgsIFksIG51bVBvaW50cykgXHJcblx0XHJcblx0Z2V0U2hhcGVBcmVhKClcclxuXHR7IFxyXG5cdCAgdmFyIGFyZWEgPSAwOyAgICAgICAgIC8vIEFjY3VtdWxhdGVzIGFyZWEgaW4gdGhlIGxvb3BcclxuXHQgIHZhciBqID0gdGhpcy5wb2ludExpc3QubGVuZ3RoLTE7ICAvLyBUaGUgbGFzdCB2ZXJ0ZXggaXMgdGhlICdwcmV2aW91cycgb25lIHRvIHRoZSBmaXJzdFxyXG5cdFxyXG5cdCAgZm9yICh2YXIgaT0wOyBpPHRoaXMucG9pbnRMaXN0Lmxlbmd0aDsgaSsrKVxyXG5cdCAgeyBcclxuXHRcdCAgYXJlYSA9IGFyZWEgKyAodGhpcy5wb2ludExpc3Rbal0uZ2V0WCgpK3RoaXMucG9pbnRMaXN0W2ldLmdldFgoKSkgKlxyXG5cdFx0ICBcdCh0aGlzLnBvaW50TGlzdFtqXS5nZXRZKCktdGhpcy5wb2ludExpc3RbaV0uZ2V0WSgpKTsgXHJcblx0ICAgICAgaiA9IGk7ICAvL2ogaXMgcHJldmlvdXMgdmVydGV4IHRvIGlcclxuXHQgIH1cclxuXHQgIGlmKGFyZWE8MCkgYXJlYSA9IGFyZWEgKiAtMTtcclxuXHQgIHJldHVybihhcmVhLzIpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRnZXRTaGFwZUFyZWEyKClcclxuXHR7IFxyXG5cdFx0dmFyIGFyZWEgPSAwOyAvLyBBY2N1bXVsYXRlcyBhcmVhIGluIHRoZSBsb29wXHJcblx0XHR2YXIgaiA9IHRoaXMucG9pbnRMaXN0Lmxlbmd0aC0xOyAvLyBUaGUgbGFzdCB2ZXJ0ZXggaXMgdGhlICdwcmV2aW91cycgb25lIHRvIHRoZSBmaXJzdFxyXG5cdFx0Zm9yIChpPTA7aTx0aGlzLnBvaW50TGlzdC5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRhcmVhID0gYXJlYSArICh0aGlzLnBvaW50TGlzdFtqXS5nZXRYKCkrdGhpcy5wb2ludExpc3RbaV0uZ2V0WCgpKSAqXHJcblx0XHRcdFx0KHRoaXMucG9pbnRMaXN0W2pdLmdldFkoKSt0aGlzLnBvaW50TGlzdFtpXS5nZXRZKCkpOyBcclxuXHRcdFx0aiA9IGk7IC8vaiBpcyBwcmV2aW91cyB2ZXJ0ZXggdG8gaVxyXG5cdFx0XHRcclxuXHRcdFx0Y29uc29sZS5sb2coXCJYWFhYWFhYWFhYWDppPVwiK2krXCIgYXJlYT1cIithcmVhKTtcclxuXHRcclxuXHRcdH1cclxuXHRcdHJldHVybihhcmVhKTtcclxuXHR9XHJcblx0XHJcblx0ZmluZENsb3Nlc3RQb2ludEluU2hhcGVGcm9tU3RhcnRpbmdQb2ludChzdGFydGluZ1Bvc2l0aW9uLG5vZGUpXHJcblx0e1xyXG5cdFx0dmFyIGxvb2tGcm9tUG9zaXRpb24gPSBzdGFydGluZ1Bvc2l0aW9uLmNyZWF0ZUJ5U3VidHJhY3Rpbmcobm9kZS5wb3NpdGlvbikuY3JlYXRlQnlTdWJ0cmFjdGluZyh0aGlzLm9mZnNldClcclxuXHRcdHZhciBjbG9zZXN0SW5mbyA9IGxvb2tGcm9tUG9zaXRpb24uZmluZENsb3Nlc3RQb2ludEluTGlzdCh0aGlzLnBvaW50TGlzdCk7XHJcblx0XHJcblx0XHR2YXIgZW5kT2ZMaXN0ID0gdGhpcy5wb2ludExpc3QubGVuZ3RoLTE7XHJcblx0XHRpZih0aGlzLnBvaW50TGlzdFswXS5lcXVhbHModGhpcy5wb2ludExpc3RbZW5kT2ZMaXN0XSkpIGVuZE9mTGlzdCA9IGVuZE9mTGlzdCAtIDE7XHJcblx0XHRcdFxyXG5cdFx0dmFyIGNsb3Nlc3RQb2ludCA9IGNsb3Nlc3RJbmZvLmNsb3NldFBvaW50O1xyXG5cdFx0dmFyIHAxSW5kZXggPSBjbG9zZXN0SW5mby5jbG9zZXRJbmRleC0xO1xyXG5cdFx0dmFyIHAySW5kZXggPSBjbG9zZXN0SW5mby5jbG9zZXRJbmRleCsxO1xyXG5cdFx0aWYoY2xvc2VzdEluZm8uY2xvc2V0SW5kZXg9PTApIHAxSW5kZXggPSBlbmRPZkxpc3Q7XHJcblx0XHRpZihjbG9zZXN0SW5mby5jbG9zZXRJbmRleD09ZW5kT2ZMaXN0KSBwMkluZGV4ID0gMDtcclxuXHRcdFxyXG5cdFx0dmFyIHAxID0gdGhpcy5wb2ludExpc3RbcDFJbmRleF07XHJcblx0XHR2YXIgcDIgPSB0aGlzLnBvaW50TGlzdFtwMkluZGV4XTtcclxuXHRcdFxyXG5cdFx0XHJcblx0XHR2YXIgZGlzdGFuY2VUb0Nsb3Nlc3QgPSBjbG9zZXN0SW5mby5kaXN0YW5jZVRvQ2xvc2VzdDtcclxuXHRcdHZhciBwMUxpbmVQb2ludCA9IGxvb2tGcm9tUG9zaXRpb24uZmluZENsb3Nlc3RQb3N0aW9uT25MaW5lKGNsb3Nlc3RQb2ludCxwMSk7XHJcblx0XHR2YXIgcDJMaW5lUG9pbnQgPSBsb29rRnJvbVBvc2l0aW9uLmZpbmRDbG9zZXN0UG9zdGlvbk9uTGluZShjbG9zZXN0UG9pbnQscDIpO1xyXG5cdFx0dmFyIHAxRGlzdGFuY2UgPSBsb29rRnJvbVBvc2l0aW9uLmdldERpc3RhbmNlKHAxTGluZVBvaW50KTtcclxuXHRcdHZhciBwMkRpc3RhbmNlID0gbG9va0Zyb21Qb3NpdGlvbi5nZXREaXN0YW5jZShwMkxpbmVQb2ludCk7XHJcblx0XHRcclxuXHRcdHZhciBmaW5hbFBvaW50ID0gY2xvc2VzdFBvaW50O1xyXG5cdFx0dmFyIGZpbmFsRGlzdGFuY2UgPSBkaXN0YW5jZVRvQ2xvc2VzdDtcclxuXHRcdGlmKGRpc3RhbmNlVG9DbG9zZXN0PHAxRGlzdGFuY2UgJiYgZGlzdGFuY2VUb0Nsb3Nlc3Q8cDJEaXN0YW5jZSlcclxuXHRcdHtcclxuXHRcdFx0ZmluYWxQb2ludCA9IGNsb3NldFBvaW50O1xyXG5cdFx0XHRmaW5hbERpc3RhbmNlID0gZGlzdGFuY2VUb0Nsb3Nlc3Q7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmKHAxRGlzdGFuY2U8cDJEaXN0YW5jZSlcclxuXHRcdHtcclxuXHRcdFx0ZmluYWxQb2ludCA9IHAxTGluZVBvaW50O1xyXG5cdFx0XHRmaW5hbERpc3RhbmNlID0gcDFEaXN0YW5jZTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0ZmluYWxQb2ludCA9IHAyTGluZVBvaW50O1xyXG5cdFx0XHRmaW5hbERpc3RhbmNlID0gcDJEaXN0YW5jZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGZpbmFsUG9pbnRUcmFuc2xhdGVkID0gZmluYWxQb2ludC5jcmVhdGVCeUFkZGluZyhub2RlLnBvc2l0aW9uKS5jcmVhdGVCeUFkZGluZyh0aGlzLm9mZnNldCk7XHJcblx0XHRcclxuXHRcdC8qXHJcblx0XHRjb25zb2xlLmxvZyhDb21tb250b1N0cmluZyhjbG9zZXN0SW5mbykpO1xyXG5cdCAgICBjb25zb2xlLmxvZyhcInN0YXJ0aW5nUG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcoc3RhcnRpbmdQb3NpdGlvbikpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJsb29rRnJvbVBvc2l0aW9uPVwiK0NvbW1vbnRvU3RyaW5nKGxvb2tGcm9tUG9zaXRpb24pKTtcclxuXHRcdGNvbnNvbGUubG9nKFwibm9kZS5wb3NpdGlvbj1cIitDb21tb250b1N0cmluZyhub2RlLnBvc2l0aW9uKSk7XHJcblx0XHRjb25zb2xlLmxvZyhcInRoaXMub2Zmc2V0PVwiK0NvbW1vbnRvU3RyaW5nKHRoaXMub2Zmc2V0KSk7XHJcblx0XHRjb25zb2xlLmxvZyhcInRoaXMucG9pbnRMaXN0Lmxlbmd0aD1cIit0aGlzLnBvaW50TGlzdC5sZW5ndGgpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJjbG9zZXN0SW5mby5jbG9zZXRJbmRleD1cIitjbG9zZXN0SW5mby5jbG9zZXRJbmRleCk7XHJcblx0XHRjb25zb2xlLmxvZyhcImVuZE9mTGlzdD1cIitlbmRPZkxpc3QpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJwMUluZGV4PVwiK3AxSW5kZXgpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJwMkluZGV4PVwiK3AySW5kZXgpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJjbG9zZXN0SW5mby5jbG9zZXRJbmRleD1cIitjbG9zZXN0SW5mby5jbG9zZXRJbmRleCk7XHJcblx0XHRjb25zb2xlLmxvZyhcInAxOlwiK0NvbW1vbnRvU3RyaW5nKHAxKSk7XHJcblx0XHRjb25zb2xlLmxvZyhcInAyOlwiK0NvbW1vbnRvU3RyaW5nKHAyKSk7XHJcblx0XHJcblx0XHRjb25zb2xlLmxvZyhcImZpbmFsRGlzdGFuY2U9XCIrZmluYWxEaXN0YW5jZSk7XHJcblx0XHRjb25zb2xlLmxvZyhcImZpbmFsUG9pbnQ9XCIrQ29tbW9udG9TdHJpbmcoZmluYWxQb2ludCkpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJmaW5hbFBvaW50VHJhbnNsYXRlZHQ9XCIrQ29tbW9udG9TdHJpbmcoZmluYWxQb2ludFRyYW5zbGF0ZWQpKTtcclxuXHRcdGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcclxuXHRcdCovXHJcblx0XHJcblx0XHRyZXR1cm4oZmluYWxQb2ludFRyYW5zbGF0ZWQpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXHJcblx0e1xyXG5cdFx0aWYodGhpcy5ib3VuZGluZ0JveC5jb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpKSByZXR1cm4gZmFsc2U7XHJcblx0XHRcclxuXHRcdHZhciBpO1xyXG5cdFx0dmFyIGo7XHJcblx0XHR2YXIgYyA9IGZhbHNlO1xyXG5cdFx0Zm9yKGk9MCxqPXRoaXMucG9pbnRMaXN0Lmxlbmd0aC0xO2k8IHRoaXMucG9pbnRMaXN0Lmxlbmd0aDtqPWkrKylcclxuXHRcdHtcclxuXHRcdFx0Ly9cclxuXHRcdFx0dmFyIHBpID0gdGhpcy5wb2ludExpc3RbaV0uY3JlYXRlQnlBZGRpbmcobm9kZS5wb3NpdGlvbikuY3JlYXRlQnlBZGRpbmcodGhpcy5vZmZzZXQpO1xyXG5cdFx0XHR2YXIgcGogPSB0aGlzLnBvaW50TGlzdFtqXS5jcmVhdGVCeUFkZGluZyhub2RlLnBvc2l0aW9uKS5jcmVhdGVCeUFkZGluZyh0aGlzLm9mZnNldCk7XHJcblx0XHRcdCAgXHJcblx0XHRcdGlmIChcclxuXHRcdFx0XHQoKHBpLmdldFkoKT5wb3NpdGlvbi5nZXRZKCkpICE9IChwai5nZXRZKCk+cG9zaXRpb24uZ2V0WSgpKSkgJiZcclxuXHRcdFx0XHRcdChwb3NpdGlvbi5nZXRYKCkgPCAocGouZ2V0WCgpLXBpLmdldFgoKSkgKlxyXG5cdFx0XHRcdFx0KHBvc2l0aW9uLmdldFkoKS1waS5nZXRZKCkpIC9cclxuXHRcdFx0XHRcdChwai5nZXRZKCktcGkuZ2V0WSgpKSArXHJcblx0XHRcdFx0XHRwaS5nZXRYKCkpIClcclxuXHRcdFx0XHRjID0gIWM7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYztcclxuXHR9XHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZTtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOlNoYXBlXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlJyk7XHJcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XHJcbnZhciBDb25uZWN0b3JEaXNwbGF5RW1wdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXllbXB0eScpO1xyXG52YXIgU2hhcGVDb25uZWN0b3IgPSByZXF1aXJlKCcuLi9ub2Rlcy9jb25uZWN0b3Ivc2hhcGVjb25uZWN0b3InKTtcclxuXHJcbmNsYXNzIEp1bmN0aW9uIGV4dGVuZHMgTm9kZVxyXG57XHJcblx0Y29uc3RydWN0b3IobmFtZSxwb3NpdGlvbixvZmZzZXQsc2hhcGVMaXN0LGdyYXBoRGF0YSxpbmZvRGF0YSlcclxuXHR7XHJcblx0XHRzdXBlcihuYW1lLHBvc2l0aW9uLG9mZnNldCxzaGFwZUxpc3QsZ3JhcGhEYXRhLGluZm9EYXRhKTtcclxuXHRcdEp1bmN0aW9uLmluaXRKdW5jdGlvbih0aGlzLG5hbWUscG9zaXRpb24sb2Zmc2V0LHNoYXBlTGlzdCxncmFwaERhdGEsaW5mb0RhdGEpO1xyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgaW5pdEp1bmN0aW9uKGp1bmN0aW9uLG5hbWUscG9zaXRpb24sb2Zmc2V0LHNoYXBlTGlzdCxncmFwaERhdGEsaW5mb0RhdGEpXHJcblx0e1xyXG5cdFx0anVuY3Rpb24ucGF0aEFycmF5ID0gbmV3IEFycmF5KCk7XHJcblx0XHRqdW5jdGlvbi53YWxrZXJPYmplY3QgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRqdW5jdGlvbi53YWxrZXJUeXBlQ29ubmVjdGlvbnMgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRqdW5jdGlvbi5sYXllcj0xO1xyXG5cdH1cclxuXHJcblx0XHJcblx0Z2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb24od2Fsa2VyVHlwZSlcclxuXHR7XHJcblx0XHRpZighdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnMuaGFzT3duUHJvcGVydHkod2Fsa2VyVHlwZSkpXHJcblx0XHR7XHJcblx0XHRcdHZhciB3YWxrZXJHcmFwaERhdGEgPSB3b3JsZERpc3BsYXkud2Fsa2VyRGlzcGxheVR5cGVzW1wiZ2VuZXJpY1wiXTtcclxuXHRcdFx0aWYod29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlcy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJUeXBlKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHdhbGtlckdyYXBoRGF0YSA9IHdvcmxkRGlzcGxheS53YWxrZXJEaXNwbGF5VHlwZXNbd2Fsa2VyVHlwZV07XHJcblx0XHRcdH1cclxuXHRcdFx0LypcclxuXHRcdFx0Y29uc29sZS5sb2coXCJhZGRpbmcgXCIrd2Fsa2VyVHlwZStcclxuXHRcdFx0XHRcdFwiIHRoaXMuY29ubmVjdG9yUG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcodGhpcy5jb25uZWN0b3JQb3NpdGlvbikrXHJcblx0XHRcdFx0XHRcIiB0aGlzLnBvc2l0aW9uPVwiK0NvbW1vbnRvU3RyaW5nKHRoaXMucG9zaXRpb24pK1x0XHRcclxuXHRcdFx0XHRcdFwiXCIpO1xyXG5cdFx0XHRcdFx0Ki9cclxuXHRcdFx0LypcclxuXHRcdFx0Y29uc29sZS5sb2coXCJuZCA9XCIrQ29tbW9udG9TdHJpbmcod2Fsa2VyR3JhcGhEYXRhKStcclxuXHRcdFx0XHRcdFwiXCIpO1xyXG5cdFx0XHRcdFx0Ki9cclxuXHRcdFx0dmFyIHNoYXBlTm9kZSA9IFxyXG5cdFx0XHRcdG5ldyBOb2RlKFwic2hhcGVOb2RlIGZvciBcIit0aGlzLm5hbWUrXCIgXCIrd2Fsa2VyVHlwZSxcclxuXHRcdFx0XHRcdFx0dGhpcy5wb3NpdGlvbixcclxuXHRcdFx0XHRcdFx0dGhpcy5jb25uZWN0b3JQb3NpdGlvbixcclxuXHRcdFx0XHRcdFx0d29ybGQuY2FudmFzSG9sZGVyLFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBBcmNEaXNwbGF5U2hhcGUoXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGZpbGxDb2xvcjp3YWxrZXJHcmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8uZmlsbENvbG9yLFxyXG5cdFx0XHRcdFx0XHRib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXHJcblx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjAwZmYwMDdmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxyXG5cdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxyXG5cdFx0XHRcdFx0XHRyYWRpdXM6MjUsXHJcblx0XHRcdFx0XHRcdGN1cnZlUG9pbnRzOjE2LFxyXG5cdFx0XHRcdFx0XHRzdGFydEFuZ2xlOjAsXHJcblx0XHRcdFx0XHRcdGVuZEFuZ2xlOjMyMCxcclxuXHRcdFx0XHRcdFx0d2lkdGg6MjUsXHJcblx0XHRcdFx0XHRcdGhlaWdodDoyNSxcclxuXHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0bmV3IE9iamVjdCgpXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0c2hhcGVOb2RlLmxheWVyPTEwO1xyXG5cdFx0XHRzaGFwZU5vZGUuZGVidWdGdW5jdGlvbigpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiZGVidWdGdW5jdGlvbjpcIit0aGlzLm5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLndhbGtlclR5cGVDb25uZWN0aW9uc1t3YWxrZXJUeXBlXSA9IG5ldyBTaGFwZUNvbm5lY3RvcihcclxuXHRcdFx0XHRcdHNoYXBlTm9kZSxcclxuXHRcdFx0XHRcdG5ldyBDb25uZWN0b3JEaXNwbGF5RW1wdHkoKSxcclxuXHRcdFx0XHRcdHNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuc2hhcGUsXHJcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oMCwwKSxcclxuXHRcdFx0XHRcdDEwLFxyXG5cdFx0XHRcdFx0MC41LFxyXG5cdFx0XHRcdFx0MC4wLFxyXG5cdFx0XHRcdFx0MC45NSk7XHJcblx0XHRcdHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdLnNoYXBlTm9kZSA9IHNoYXBlTm9kZTtcclxuXHRcdFx0dGhpcy5ub2Rlcy5wdXNoKHNoYXBlTm9kZSk7XHJcblx0XHRcdHRoaXMuc2hhcGVOb2RlID0gc2hhcGVOb2RlO1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHRcdHZhciBjb25uZWN0aW9uID0gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV07XHJcblx0XHRyZXR1cm4oY29ubmVjdGlvbik7XHJcblx0fVxyXG5cdFxyXG5cdGdldE5vZGVVaURpc3BsYXkobm9kZSlcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5uYW1lK1wiIDogXCIrdGhpcy5nZXRXYWxrZXJBcnJheSgpLmxlbmd0aCk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFdhbGtlcktleXNTb3J0ZWQobm9kZSlcclxuXHR7XHJcblx0XHR2YXIgd2Fsa2VyVHlwZUtleXMgPSBuZXcgQXJyYXkoKVxyXG5cdFx0dmFyIHRvdGFsV2Fsa2VycyA9IDA7XHJcblx0XHRmb3IgKHZhciB3YWxrZXJUeXBlIGluIHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zKVxyXG5cdFx0e1xyXG5cdFx0XHR3YWxrZXJUeXBlS2V5cy5wdXNoKHdhbGtlclR5cGUpO1xyXG5cdFx0XHR2YXIgY29ubmVjdG9yID0gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV07XHJcblx0XHRcdHRvdGFsV2Fsa2VycyArPSBjb25uZWN0b3Iubm9kZXMubGVuZ3RoO1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKHdhbGtlclR5cGUrXCI6dG90YWxXYWxrZXJzPVwiK3RvdGFsV2Fsa2VycytcIjpmb3IgY29uZWN0b3I9XCIrY29ubmVjdG9yLm5vZGVzLmxlbmd0aCk7XHJcblx0XHJcblx0XHR9XHJcblx0XHR3YWxrZXJUeXBlS2V5cy5zb3J0KCk7XHJcblx0XHRyZXR1cm4od2Fsa2VyVHlwZUtleXMpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRXYWxrZXJBcnJheVRvRml4KClcclxuXHR7XHJcblx0XHR2YXIgd2Fsa2VyQXJyYXkgPSB0aGlzLndhbGtlck9iamVjdC52YWx1ZXMoKTtcclxuXHRcdHJldHVybih3YWxrZXJBcnJheSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFdhbGtlckFycmF5KClcclxuXHR7XHJcblx0XHQvLyB0aGlzIGlzIFNMT1cuLiB3aHkgZG9lcyB0aGUgYWJvdmUgbm90IHdvcms/IT8hPyFcclxuXHRcdHZhciB3YWxrZXJBcnJheSA9IG5ldyBBcnJheSgpO1xyXG5cdFx0dmFyIHdhbGtlclR5cGVLZXlzID0gdGhpcy5nZXRXYWxrZXJLZXlzU29ydGVkKCk7XHJcblx0XHRmb3IgKHZhciBpPTA7aTx3YWxrZXJUeXBlS2V5cy5sZW5ndGg7aSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgd2Fsa2VyVHlwZSA9IHdhbGtlclR5cGVLZXlzW2ldO1xyXG5cdFx0XHR2YXIgY29ubmVjdG9yID0gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV07XHJcblx0XHRcdGZvcih2YXIgaj0wO2o8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtqKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHR3YWxrZXJBcnJheS5wdXNoKGNvbm5lY3Rvci5ub2Rlc1tqXSk7XHJcblx0XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcclxuXHRcdHJldHVybih3YWxrZXJBcnJheSk7XHJcblx0fVxyXG5cdFxyXG5cdGFkanVzdHdhbGtlclR5cGVDb25uZWN0aW9ucygpXHJcblx0e1xyXG5cdFx0dmFyIHdhbGtlclR5cGVLZXlzID0gdGhpcy5nZXRXYWxrZXJLZXlzU29ydGVkKCk7XHJcblx0XHR2YXIgdG90YWxXYWxrZXJzID0gdGhpcy5nZXRXYWxrZXJBcnJheSgpLmxlbmd0aDtcclxuXHQvL2NvbnNvbGUubG9nKFwid2FsZWtyQ291bnQ9XCIrdG90YWxXYWxrZXJzKTtcclxuXHRcdC8vY29uc29sZS5sb2coXCJ3YWxrZXJDb3VudGFsa2VyQ291bnQ9XCIrdGhpcy53YWxrZXJPYmplY3QpO1xyXG5cdFx0LypcclxuXHRcdG5ldyBBcnJheSgpXHJcblx0XHR2YXIgdG90YWxXYWxrZXJzID0gMDtcclxuXHRcdGZvciAodmFyIHdhbGtlclR5cGUgaW4gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnMpXHJcblx0XHR7XHJcblx0XHRcdHdhbGtlclR5cGVLZXlzLnB1c2god2Fsa2VyVHlwZSk7XHJcblx0XHRcdHZhciBjb25uZWN0b3IgPSB0aGlzLndhbGtlclR5cGVDb25uZWN0aW9uc1t3YWxrZXJUeXBlXTtcclxuXHRcdFx0dG90YWxXYWxrZXJzICs9IGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7XHJcblx0XHRcdC8vY29uc29sZS5sb2cod2Fsa2VyVHlwZStcIjp0b3RhbFdhbGtlcnM9XCIrdG90YWxXYWxrZXJzK1wiOmZvciBjb25lY3Rvcj1cIitjb25uZWN0b3Iubm9kZXMubGVuZ3RoKTtcclxuXHRcclxuXHRcdH1cclxuXHRcdHdhbGtlclR5cGVLZXlzLnNvcnQoKTsqL1xyXG5cdFx0dmFyIGFuZ2xlID0gMDtcclxuXHRcdC8vIGFyZWEgPSBwaSByXjJcclxuXHRcdC8vIHNvLi4uIGlmIHdlIGhhdmUgMTAgbm9kZXMuLi5cclxuXHRcdC8vIGFuZCBhIG5vZGUgdGFrZXMgXCIxMDAgYXJlYVwiIHBlciBub2RlIChhIDEwWDEwIGFyZWEpXHJcblx0XHQvLyAxMCBub2RlcyBhbmQgMTAwYXJlYV4yXHJcblx0XHQvLyBzcXJ0KGFyZWEvcGkpID0gclxyXG5cdFx0Ly8gc3FydCggKGFyZWEqbnVtYmVyTm9kZXMqYXJlYVBlck5vZGUpL1BJICkgPSBSXHJcblx0XHR2YXIgd2Fsa2VyQXJlYSA9IDI1O1xyXG5cdFx0Ly92YXIgcmFkaXVzID0gTWF0aC5zcXJ0KCB0b3RhbFdhbGtlcnMvTWF0aC5QSSApKjQ7XHJcblx0XHR2YXIgcmFkaXVzID0gTWF0aC5zcXJ0KCB0b3RhbFdhbGtlcnMqd2Fsa2VyQXJlYSkgLyBNYXRoLlBJO1xyXG5cdFx0XHJcblx0XHRmb3IodmFyIGk9MDtpPHdhbGtlclR5cGVLZXlzLmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciB3YWxrZXJUeXBlID0gd2Fsa2VyVHlwZUtleXNbaV07XHJcblx0XHRcdHZhciBjb25uZWN0b3IgPSB0aGlzLndhbGtlclR5cGVDb25uZWN0aW9uc1t3YWxrZXJUeXBlXTtcclxuXHRcdFx0dmFyIHBlcmNlbnRPZldhbGtlcnMgPSBjb25uZWN0b3Iubm9kZXMubGVuZ3RoL3RvdGFsV2Fsa2VycztcclxuXHRcdFx0dmFyIHdhbGtlckFuZ2xlID0gcGVyY2VudE9mV2Fsa2VycyAqIDM2MDtcclxuXHRcdFx0LypcclxuXHRcdFx0Y29uc29sZS5sb2cod2Fsa2VyVHlwZStcclxuXHRcdFx0XHRcdFwiOmNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg6XCIrY29ubmVjdG9yLm5vZGVzLmxlbmd0aCtcclxuXHRcdFx0XHRcdFwiOnBlcmNlbnRPZldhbGtlcnM6XCIrcGVyY2VudE9mV2Fsa2VycytcclxuXHRcdFx0XHRcdFwiOndhbGtlckFuZ2xlOlwiK3dhbGtlckFuZ2xlK1xyXG5cdFxyXG5cdFx0XHRcdFx0XCJcIik7XHJcblx0Ki9cclxuXHRcdFx0Ly9jb25zb2xlLmxvZyh3YWxrZXJUeXBlK1wiOmJlZm9yZTpcIitDb21tb250b1N0cmluZyhjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheSkpO1xyXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5zdGFydEFuZ2xlID0gYW5nbGU7XHJcblx0XHRcdGFuZ2xlICs9IHdhbGtlckFuZ2xlO1xyXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5lbmRBbmdsZSA9IGFuZ2xlO1xyXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5yYWRpdXMgPSByYWRpdXM7XHJcblx0XHRcdC8vLy8vLy8vY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkgPSBuZXcgQXJjRGlzcGxheVNoYXBlKGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvKVxyXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5pbml0KCk7XHJcblx0XHRcdC8vLy8vLy8vL2Nvbm5lY3Rvci5zaGFwZSA9IGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LnNoYXBlO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyh3YWxrZXJUeXBlK1wiOmFmdGVyOlwiK0NvbW1vbnRvU3RyaW5nKGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5KSk7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhZGRXYWxrZXIod2Fsa2VyKVxyXG5cdHtcclxuXHRcdHRoaXMud2Fsa2VyT2JqZWN0W3dhbGtlcl0gPSB3YWxrZXI7XHJcblx0XHR2YXIgY29ubmVjdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb24od2Fsa2VyLmluZm9EYXRhLndhbGtlclR5cGVLZXkpXHJcblx0XHRjb25uZWN0aW9uLmFkZE5vZGUod2Fsa2VyKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5hZGp1c3R3YWxrZXJUeXBlQ29ubmVjdGlvbnMoKTtcclxuXHR9XHJcblx0XHJcblx0cmVtb3ZlV2Fsa2VyKHdhbGtlcilcclxuXHR7XHJcblx0XHR2YXIgY29ubmVjdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb24od2Fsa2VyLmluZm9EYXRhLndhbGtlclR5cGVLZXkpO1xyXG5cdFx0ZGVsZXRlIHRoaXMud2Fsa2VyT2JqZWN0W3dhbGtlcl07IFxyXG5cdFx0Y29ubmVjdGlvbi5yZW1vdmVOb2RlKHdhbGtlcik7XHRcclxuXHRcdHRoaXMuYWRqdXN0d2Fsa2VyVHlwZUNvbm5lY3Rpb25zKCk7XHJcblx0fVxyXG5cdFxyXG5cdGxvZygpXHJcblx0e1xyXG5cdFx0Y29uc29sZS5sb2coXCJqdW5jdGlvbiBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcykpO1xyXG5cdH1cclxuXHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBKdW5jdGlvbjtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkp1bmN0aW9uXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIENvbm5lY3RvckRpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXknKTtcclxudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxuXHJcbmNsYXNzIEp1bmN0aW9uQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yRGlzcGxheVxyXG57XHJcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXHJcblx0e1xyXG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xyXG5cdH1cclxuXHRcclxuXHRkcmF3Q29ubmVjdG9yKGNhbnZhc0hvbGRlcixjb25uZWN0b3Isbm9kZSlcclxuXHR7XHJcblx0XHRmb3IodmFyIGo9MDtqPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aisrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgbm9kZUogPSBjb25uZWN0b3Iubm9kZXNbal07XHRcdFxyXG5cdFx0XHR2YXIgcCA9IG5vZGUucG9zaXRpb24uY3JlYXRlQnlBZGRpbmcobm9kZS5jb25uZWN0b3JQb3NpdGlvbik7XHJcblx0XHRcdHZhciBwaiA9IG5vZGVKLnBvc2l0aW9uLmNyZWF0ZUJ5QWRkaW5nKG5vZGVKLmNvbm5lY3RvclBvc2l0aW9uKTtcclxuXHRcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gNTtcclxuXHRcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKFwiMDAwMDAwZmZcIik7XHJcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5tb3ZlVG8ocC5nZXRYKCkscC5nZXRZKCkpO1xyXG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5saW5lVG8ocGouZ2V0WCgpLHBqLmdldFkoKSk7XHJcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IEp1bmN0aW9uQ29ubmVjdG9yO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6SnVuY3Rpb25Db25uZWN0b3JcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xyXG52YXIgTm9kZURpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS9ub2RlZGlzcGxheScpO1xyXG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xyXG5cclxuY2xhc3MgSnVuY3Rpb25EaXNwbGF5IGV4dGVuZHMgTm9kZURpc3BsYXlcclxue1xyXG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxyXG5cdHtcclxuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcclxuXHRcdHRoaXMuY2hlY2tQb3NpdGlvbkluZm8gPSB7fTtcclxuXHR9XHJcblx0XHJcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxyXG5cdHtcclxuXHRcdHZhciBkaXN0YW5jZSA9IG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0RGlzdGFuY2UocG9zaXRpb24pO1xyXG5cdFxyXG5cdFx0Ly9jb25zb2xlLmxvZyhcIi0tLS0gXCIrbm9kZS5uYW1lK1wiIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xyXG5cdFxyXG5cdFx0cmV0dXJuKFxyXG5cdFx0XHRcdChkaXN0YW5jZTw9bm9kZS5ncmFwaERhdGEucmFkaXVzKSB8fFxyXG5cdFx0XHRcdChcclxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFg8PXBvc2l0aW9uLmdldFgoKSkgJiZcclxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFgrbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0V2lkdGgpPj1wb3NpdGlvbi5nZXRYKCkgJiZcclxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFk8PXBvc2l0aW9uLmdldFkoKSkgJiZcclxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFkrbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0SGVpZ2h0KT49cG9zaXRpb24uZ2V0WSgpXHJcblx0XHRcdFx0KVxyXG5cdFx0XHRcdCk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxyXG5cdHtcclxuXHQgICAgdmFyIHJhZGl1c0F2ZXJhZ2UgPSAwO1xyXG5cdCAgICBmb3IodmFyIGk9MDtpPG5vZGUubm9kZXMubGVuZ3RoO2krKylcclxuXHQgICAge1xyXG5cdCAgICAgXHR2YXIgc3ViTm9kZSA9IG5vZGUubm9kZXNbaV07XHJcblx0ICAgICBcdC8vY29uc29sZS5sb2coXCJaWlpaWlpaWlpaWlpaWjo6OjpcIitDb21tb250b1N0cmluZyhzdWJOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5yYWRpdXMpKTtcclxuXHQgICAgXHRyYWRpdXNBdmVyYWdlICs9IHN1Yk5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLnJhZGl1cztcclxuXHQgICAgfVxyXG5cdCAgICByYWRpdXNBdmVyYWdlID0gKHJhZGl1c0F2ZXJhZ2UgLyBub2RlLm5vZGVzLmxlbmd0aCkrdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aCo1O1xyXG5cdFxyXG5cdCAgICBcclxuXHQgICAgXHJcblx0ICAgIHZhciBqdW5jdGlvblRleHQgPSBub2RlLm5hbWU7XHJcblx0ICAgIFxyXG5cdCAgICB2YXIgcmVjdFBhZGRpbmcgPSB0aGlzLmRpc3BsYXlJbmZvLmZvbnRQaXhlbEhlaWdodC8yO1xyXG5cdCAgICBcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZm9udD10aGlzLmRpc3BsYXlJbmZvLmZvbnRTdHlsZStcIiBcIit0aGlzLmRpc3BsYXlJbmZvLmZvbnRQaXhlbEhlaWdodCtcInB4IFwiK3RoaXMuZGlzcGxheUluZm8uZm9udEZhY2U7IFxyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC50ZXh0QWxpZ249XCJjZW50ZXJcIjtcclxuXHQgICAgdmFyIHRleHRNZXRyaWNzID0gdGhpcy5tZXRyaWNzVGV4dE11dGlwbGVMaW5lcyhcclxuXHQgICAgXHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LFxyXG5cdCAgICBcdFx0anVuY3Rpb25UZXh0LFxyXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby5mb250UGl4ZWxIZWlnaHQsXHJcblx0ICAgIFx0XHRcIlxcblwiKTtcclxuXHQgICAgXHJcblx0ICAgIHZhciB0b3RhbFdpZHRoID0gTWF0aC5tYXgoLypub2RlLmdyYXBoRGF0YS5yYWRpdXMqL3JhZGl1c0F2ZXJhZ2UrcmVjdFBhZGRpbmcsdGV4dE1ldHJpY3Mud2lkdGgrcmVjdFBhZGRpbmcrcmVjdFBhZGRpbmcpO1xyXG5cdCAgICB2YXIgdG90YWxIZWlnaHQgPSAvKm5vZGUuZ3JhcGhEYXRhLnJhZGl1cyoyKi9cclxuXHQgICAgXHRyYWRpdXNBdmVyYWdlK1xyXG5cdCAgICBcdHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGgqMitcclxuXHQgICAgXHRub2RlLmdyYXBoRGF0YS50ZXh0U3BhY2VyK1xyXG5cdCAgICBcdHRleHRNZXRyaWNzLmhlaWdodCtyZWN0UGFkZGluZztcclxuXHQgICAgXHJcblx0ICAgIG5vZGUud2lkdGggPSB0b3RhbFdpZHRoO1xyXG5cdCAgICBub2RlLmhlaWdodCA9IHRvdGFsSGVpZ2h0O1xyXG5cdCAgICBcclxuXHQgICAgaWYobm9kZS5jaGVja1Bvc2l0aW9uSW5mbz09bnVsbCkgbm9kZS5jaGVja1Bvc2l0aW9uSW5mbyA9IHt9O1xyXG5cdCAgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKFxyXG5cdCAgICBcdFx0bm9kZS5wb3NpdGlvbi5nZXRYKCksXHJcblx0ICAgIFx0XHRub2RlLnBvc2l0aW9uLmdldFkoKS10b3RhbEhlaWdodC8yKy8qbm9kZS5ncmFwaERhdGEucmFkaXVzKi9yYWRpdXNBdmVyYWdlKTtcclxuXHQgICAgXHJcblx0XHQvL25vZGUuY29ubmVjdG9yUG9zaXRpb24gPSBuZXcgUG9zaXRpb24oMCxcclxuXHRcdC8vXHRcdC0odG90YWxIZWlnaHQvMi1ub2RlLmdyYXBoRGF0YS5yYWRpdXMpKTtcclxuXHQgICAgbm9kZS5jb25uZWN0b3JQb3NpdGlvbi5zZXRZKC0odG90YWxIZWlnaHQvMi0vKm5vZGUuZ3JhcGhEYXRhLnJhZGl1cyovcmFkaXVzQXZlcmFnZSkpO1xyXG5cdCAgICAvL25vZGUuc2hhcGVOb2RlLnBvc2l0aW9uLmNvcHlGcm9tKG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24pO1xyXG5cdCAgICBcclxuXHRcclxuXHQgICAgXHJcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFggPSBub2RlLnBvc2l0aW9uLmdldFgoKS0odGV4dE1ldHJpY3Mud2lkdGgrcmVjdFBhZGRpbmcpLzI7XHJcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFkgPSBub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uLmdldFkoKStcclxuXHQgICAgXHQvKm5vZGUuZ3JhcGhEYXRhLnJhZGl1cyovcmFkaXVzQXZlcmFnZStcclxuXHQgICAgXHR0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoK1xyXG5cdCAgICBcdG5vZGUuZ3JhcGhEYXRhLnRleHRTcGFjZXI7XHJcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFdpZHRoID0gdGV4dE1ldHJpY3Mud2lkdGgrcmVjdFBhZGRpbmc7XHJcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dEhlaWdodCA9IHRleHRNZXRyaWNzLmhlaWdodCtyZWN0UGFkZGluZztcclxuXHRcclxuXHQgICAgXHJcblx0ICAgIHRoaXMucm91bmRlZFJlY3QoXHJcblx0ICAgIFx0XHRjYW52YXNIb2xkZXIuY29udGV4dCxcclxuXHQgXHRcdCAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFgsXHJcblx0IFx0XHQgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRZLFxyXG5cdCBcdFx0ICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0V2lkdGgsXHJcblx0IFx0XHQgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRIZWlnaHQsXHJcblx0IFx0XHQgICB0aGlzLmRpc3BsYXlJbmZvLmZvbnRQaXhlbEhlaWdodC8zLFxyXG5cdCBcdFx0ICAgdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aCxcclxuXHQgXHRcdCAgIENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5yZWN0Qm9yZGVyQ29sb3IpLFxyXG5cdCBcdFx0ICAgQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnJlY3RGaWxsQ29sb3IpICk7XHJcblx0ICAgIFxyXG5cdCAgICBcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlPUNvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5mb250Q29sb3IpO1xyXG5cdFxyXG5cdCAgICAvL2NvbnRleHQuZmlsbFRleHQodGV4dCxub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKStub2RlLmdyYXBoRGF0YS5yYWRpdXMrMTUpO1xyXG5cdCAgICB0aGlzLmZpbGxUZXh0TXV0aXBsZUxpbmVzKFxyXG5cdCAgICBcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQsXHJcblx0ICAgIFx0XHRqdW5jdGlvblRleHQsXHJcblx0ICAgIFx0XHRub2RlLnBvc2l0aW9uLmdldFgoKSxcclxuXHQgICAgXHRcdG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFkrcmVjdFBhZGRpbmcqMit0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoLFxyXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby5mb250UGl4ZWxIZWlnaHQsXHJcblx0ICAgIFx0XHRcIlxcblwiKTtcclxuXHQgICAgXHJcblx0ICBcclxuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxyXG5cdCAgICB7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcik7XHJcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0Qm9yZGVyQ29sb3IpO1xyXG5cdCAgICB9XHJcblx0ICAgIGVsc2VcclxuXHQgICAge1xyXG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IpO1xyXG5cdCAgICAgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uYm9yZGVyQ29sb3IpO1xyXG5cdCAgICB9XHJcblx0ICBcclxuXHQgICAgXHJcblx0ICAgIFxyXG5cdFxyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5iZWdpblBhdGgoKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYXJjKFxyXG5cdFx0XHRcdG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0WCgpLFxyXG5cdFx0XHRcdG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0WSgpLFxyXG5cdFx0XHRcdHJhZGl1c0F2ZXJhZ2UsLy9ub2RlLmdyYXBoRGF0YS5yYWRpdXMsXHJcblx0XHRcdFx0MCxcclxuXHRcdFx0XHRNYXRoLlBJICogMiwgZmFsc2UpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lV2lkdGggPSB0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoO1xyXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcclxuXHRcclxuXHRcclxuXHQgICAgZm9yKHZhciBpPTA7aTxub2RlLm5vZGVzLmxlbmd0aDtpKyspXHJcblx0ICAgIHtcclxuXHQgICAgIFx0dmFyIHN1Yk5vZGUgPSBub2RlLm5vZGVzW2ldO1xyXG5cdCAgICAgXHRzdWJOb2RlLnBvc2l0aW9uID0gbm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbjsgICAgXHRcclxuXHQgICAgXHRzdWJOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kcmF3Tm9kZShub2RlLmNhbnZhc0hvbGRlcixzdWJOb2RlKTtcclxuXHQgICAgfVxyXG5cdFxyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IEp1bmN0aW9uRGlzcGxheTtcclxuY29uc29sZS5sb2coXCJMb2FkaW5nOkp1bmN0aW9uRGlzcGxheVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBDb25uZWN0b3IgPSByZXF1aXJlKCcuLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yJyk7XHJcblxyXG5jbGFzcyBQYXRoIGV4dGVuZHMgQ29ubmVjdG9yXHJcbntcclxuXHRjb25zdHJ1Y3RvcihqdW5jdGlvblN0YXJ0LEp1bmN0aW9uRW5kLGNvbm5lY3RvckRpc3BsYXksd29ybGQpXHJcblx0e1xyXG5cdFx0c3VwZXIobnVsbCxjb25uZWN0b3JEaXNwbGF5KTtcclxuXHRcdFBhdGguY3JlYXRlUGF0aCh0aGlzLGp1bmN0aW9uU3RhcnQsSnVuY3Rpb25FbmQsY29ubmVjdG9yRGlzcGxheSx3b3JsZCk7XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBjcmVhdGVQYXRoKHBhdGgsanVuY3Rpb25TdGFydCxKdW5jdGlvbkVuZCxjb25uZWN0b3JEaXNwbGF5LHdvbHJkKVxyXG5cdHtcclxuXHRcdHBhdGguY29ubmVjdG9yRGlzcGxheSA9IGNvbm5lY3RvckRpc3BsYXk7XHJcblx0XHRwYXRoLmp1bmN0aW9uU3RhcnQgPSBqdW5jdGlvblN0YXJ0O1xyXG5cdFx0cGF0aC5KdW5jdGlvbkVuZCA9IEp1bmN0aW9uRW5kO1xyXG5cdFx0cGF0aC5zcHJpbmdBbmNob3JQb2ludCA9IG51bGw7XHJcblx0XHRwYXRoLmFuY2hvck9mZnNldFBvaW50ID0gbnVsbDtcclxuXHRcdHBhdGgucmVsYXhlZERpc3RhbmNlID0gd29ybGQud29ybGREaXNwbGF5LnJlbGF4ZWREaXN0YW5jZURlZmF1bHQ7XHJcblx0XHRwYXRoLmVsYXN0aWNpdHlGYWN0b3IgPSB3b3JsZC53b3JsZERpc3BsYXkuZWxhc3RpY2l0eUZhY3RvckRlZnVhbHQ7XHJcblx0XHRwYXRoLndhbGtlck9iamVjdCA9IG5ldyBPYmplY3QoKTtcclxuXHRcdFNwcmluZ0Nvbm5lY3Rvci5jcmVhdGVTcHJpbmdDb25uZWN0b3IocGF0aCxcclxuXHRcdFx0XHRwYXRoLmNvbm5lY3RvckRpc3BsYXksXHJcblx0XHRcdFx0cGF0aC5zcHJpbmdBbmNob3JQb2ludCxcclxuXHRcdFx0XHRwYXRoLmFuY2hvck9mZnNldFBvaW50LFxyXG5cdFx0XHRcdHBhdGgucmVsYXhlZERpc3RhbmNlLFxyXG5cdFx0XHRcdHBhdGguZWxhc3RpY2l0eUZhY3Rvcik7XHJcblx0XHRwYXRoLmFkZE5vZGUoanVuY3Rpb25TdGFydCk7XHJcblx0XHRwYXRoLmFkZE5vZGUoSnVuY3Rpb25FbmQpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRQYXRoS2V5KClcclxuXHR7XHJcblx0XHRyZXR1cm4oanVuY3Rpb25TdGFydC5uYW1lK1wiOlwiK2p1bmN0aW9uRW5kLm5hbWUpO1xyXG5cdH1cclxuXHRcclxuXHRsb2coKVxyXG5cdHtcclxuXHRcdGNvbnNvbGUubG9nKFwicGF0aCBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcykpO1xyXG5cdH1cclxufVxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGg7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpQYXRoXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwidmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXMnKTtcclxudmFyIE5vZGVDYW52YXMgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXMnKTtcclxudmFyIE5vZGVDYW52YXNNb3VzZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVjYW52YXMvbm9kZWNhbnZhc21vdXNlJyk7XHJcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XHJcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XHJcbnZhciBQYXRoID0gcmVxdWlyZSgnLi4vcGF0aHMvcGF0aCcpO1xyXG52YXIgV2Fsa2VyID0gcmVxdWlyZSgnLi4vcGF0aHMvd2Fsa2VyJyk7XHJcbnZhciBKdW5jdGlvbiA9IHJlcXVpcmUoJy4uL3BhdGhzL2p1bmN0aW9uJyk7XHJcblxyXG5jbGFzcyBQYXRoV29ybGQgZXh0ZW5kcyBOb2RlQ2FudmFzXHJcbntcclxuXHRjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIsanVuY3Rpb25TcGFjZXIsd29ybGRXYWxsLHdvcmxkRGlzcGxheSlcclxuXHR7XHJcblx0XHRzdXBlcihjYW52YXNIb2xkZXIpO1xyXG5cdFx0UGF0aFdvcmxkLmluaXRQYXRoV29ybGQodGhpcyxjYW52YXNIb2xkZXIsanVuY3Rpb25TcGFjZXIsd29ybGRXYWxsLHdvcmxkRGlzcGxheSk7XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBpbml0UGF0aFdvcmxkKHBhdGhXb3JsZCxjYW52YXNIb2xkZXIsanVuY3Rpb25TcGFjZXIsd29ybGRXYWxsLHdvcmxkRGlzcGxheSlcclxuXHR7XHJcblx0XHRwYXRoV29ybGQuanVuY3Rpb25zID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0cGF0aFdvcmxkLnBhdGhzID0gbmV3IE9iamVjdCgpO1xyXG5cdFx0cGF0aFdvcmxkLndhbGtlcnMgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRwYXRoV29ybGQud29ybGRVcGRhdGVRdWV1ZSA9IG5ldyBBcnJheSgpO1xyXG5cdFx0cGF0aFdvcmxkLndvcmxkVXBkYXRlUXVldWUuaXNJbk5lZWRPZlNvcnRpbmcgPSBmYWxzZVxyXG5cdFx0cGF0aFdvcmxkLmp1bmN0aW9uU3BhY2VyID0ganVuY3Rpb25TcGFjZXI7XHJcblx0XHRwYXRoV29ybGQud29ybGRXYWxsID0gd29ybGRXYWxsO1xyXG5cdFx0cGF0aFdvcmxkLndvcmxkRGlzcGxheSA9IHdvcmxkRGlzcGxheTtcclxuXHRcdHBhdGhXb3JsZC5sYXN0RGF0ZSA9IFwiXCI7XHJcblx0XHR0aGlzLmNoZWNrVGltZXN0YW1wID0gXCJcIjtcclxuXHRcdHBhdGhXb3JsZC5ub2RlQ2FudmFzTW91c2UgPSBuZXcgTm9kZUNhbnZhc01vdXNlKHBhdGhXb3JsZCk7XHJcblx0XHRwYXRoV29ybGQuZmlsbFN0eWxlID0gd29ybGREaXNwbGF5LndvcmxkQmFja2dyb3VuZENvbG9yO1xyXG5cclxuXHR9XHJcblx0XHJcblx0ZHJhd0NhbnZhcyh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0c3VwZXIuZHJhd0NhbnZhcyh0aW1lc3RhbXApO1xyXG5cdFx0dGhpcy5wYXRoV29scmRFeHRyYUFuaW1hdGlvbih0aW1lc3RhbXApO1xyXG5cdH1cclxuXHRcclxuXHRwYXRoV29scmRFeHRyYUFuaW1hdGlvbih0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0d29ybGQucHJlcGFyZVdvcmxkVXBkYXRlUXVldWUoKTtcclxuXHJcblx0XHR2YXIgbG9jYWxDaGVja1RpbWVzdGFtcCA9IHRoaXMuYW5pbWF0aW9uRXhlY1RpbWUqdGhpcy50aW1lRmFjdG9yICsgdGhpcy5zdGFydFRpbWUuZ2V0VGltZSgpO1xyXG5cdFx0dmFyIGNoZWNrRGF0ZSA9IG5ldyBEYXRlKGxvY2FsQ2hlY2tUaW1lc3RhbXApO1xyXG5cclxuXHRcdGlmKHRoaXMubGFzdERhdGU9PW51bGwpIHRoaXMubGFzdERhdGU9PVwiXCI7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMubGFzdERhdGUhPWNoZWNrRGF0ZS50b0xvY2FsZVN0cmluZygpK1wiIFwiK0NvbW1vbi5nZXREYXlPZldlZWsoY2hlY2tEYXRlKSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5sYXN0RGF0ZSA9IGNoZWNrRGF0ZS50b0xvY2FsZVN0cmluZygpK1wiIFwiK0NvbW1vbi5nZXREYXlPZldlZWsoY2hlY2tEYXRlKTtcclxuXHRcdFx0aWYodGhpcy5pc0FuaW1hdGVkKSAkKCcjd29ybGRfZGF0ZScpLmh0bWwodGhpcy5sYXN0RGF0ZSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuY2hlY2tUaW1lc3RhbXAgPSBsb2NhbENoZWNrVGltZXN0YW1wO1xyXG5cdFx0aWYodGhpcy5pc0FuaW1hdGVkKSB3aGlsZSh0aGlzLmlzTmV4dFdvcmxkVXBkYXRlUmVhZHkobG9jYWxDaGVja1RpbWVzdGFtcCkpXHJcblx0XHR7XHJcblx0XHRcdHZhciBwcm9jY2VzZWQgPSB0aGlzLnByb2Nlc3NXb3JsZFVwZGF0ZVF1ZXVlKCk7XHJcblx0XHRcdGlmKHByb2NjZXNlZCE9bnVsbClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUocHJvY2Nlc2VkLnByb2Nlc3NUaW1lc3RhbXAqMTAwMCswKjEwMDApOy8vcHJvY2Nlc2VkLmdldERhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVx0XHJcblx0XHRcclxuXHRcdC8vIHByb2Nlc3MgdGhlIHdhbGtlcnMgcnVsZXNcclxuXHRcdGZvciAodmFyIHdhbGtlcktleSBpbiB0aGlzLndhbGtlcnMpXHJcblx0XHR7XHJcblx0XHRcdHZhciB3YWxrZXIgPSB0aGlzLndhbGtlcnNbd2Fsa2VyS2V5XTtcclxuXHRcdFx0d2Fsa2VyLnByb2Nlc3NXYWxrZXJSdWxlcyh3b3JsZCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRcclxuXHRcclxuXHRcclxuXHRsb2coKVxyXG5cdHtcclxuXHRcdGNvbnNvbGUubG9nKFwicGF0aFdvcmxkIGxvZzpcIitDb21tb250b1N0cmluZyh0aGlzLndvcmxkRGlzcGxheSkpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHRpc1dhbGtlck5ldyh3YWxrZXJOYW1lKVxyXG5cdHtcclxuXHRcdHJldHVybighdGhpcy53YWxrZXJzLmhhc093blByb3BlcnR5KHdhbGtlck5hbWUpKTtcclxuXHR9XHJcblx0XHJcblx0aXNKdW5jdGlvbk5ldyhqdW5jdGlvbk5hbWUpXHJcblx0e1xyXG5cdFx0cmV0dXJuKCF0aGlzLmp1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShqdW5jdGlvbk5hbWUpKTtcclxuXHR9XHJcblx0XHJcblx0aXNOZXh0V29ybGRVcGRhdGVSZWFkeSh0aW1lc3RhbXApXHJcblx0e1xyXG5cdFx0dmFyIHJlYWR5ID0gZmFsc2U7XHJcblx0XHRpZih0aGlzLndvcmxkVXBkYXRlUXVldWUubGVuZ3RoPjApXHJcblx0XHR7XHJcblx0XHRcdHJlYWR5ID0gdGhpcy53b3JsZFVwZGF0ZVF1ZXVlWzBdLnJlYWR5VG9CZVByb2Nlc3NlZCh0aW1lc3RhbXApO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuKHJlYWR5KTtcclxuXHR9XHJcblx0XHJcblx0cGVla0F0TmV4dFdvcmxkVXBkYXRlKClcclxuXHR7XHJcblx0XHR2YXIgd29ybGRVcGRhdGUgPSBudWxsO1xyXG5cdFx0aWYodGhpcy53b3JsZFVwZGF0ZVF1ZXVlLmxlbmd0aD4wKVxyXG5cdFx0e1xyXG5cdFx0XHR3b3JsZFVwZGF0ZSA9IHRoaXMud29ybGRVcGRhdGVRdWV1ZVswXTtcclxuXHRcdH1cclxuXHRcdHJldHVybih3b3JsZFVwZGF0ZSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldENyZWF0ZVBhdGgoanVuY3Rpb25TdGFydCxqdW5jdGlvbkVuZCxwYXRoSW5mbylcclxuXHR7XHJcblx0XHR2YXIgY29ubmVjdG9yRGlzcGxheSA9IHRoaXMud29ybGREaXNwbGF5LnBhdGhUeXBlc1tcImdlbmVyaWNcIl0uY29ubmVjdG9yRGlzcGxheTtcclxuXHRcdGlmKHRoaXMud29ybGREaXNwbGF5LnBhdGhUeXBlcy5oYXNPd25Qcm9wZXJ0eShwYXRoSW5mby5wYXRoVHlwZUtleSkpXHJcblx0XHR7XHJcblx0XHRcdGNvbm5lY3RvckRpc3BsYXkgPSB0aGlzLndvcmxkRGlzcGxheS5wYXRoVHlwZXNbcGF0aEluZm8ucGF0aFR5cGVLZXldLmNvbm5lY3RvckRpc3BsYXk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBwYXRoID0gbnVsbDtcclxuXHRcdHZhciBwYXRoS2V5ID0gdGhpcy5nZXRQYXRoS2V5KGp1bmN0aW9uU3RhcnQsanVuY3Rpb25FbmQpO1xyXG5cdFx0aWYoIXRoaXMucGF0aHMuaGFzT3duUHJvcGVydHkocGF0aEtleSkpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMucGF0aHNbcGF0aEtleV0gPSBuZXcgUGF0aChqdW5jdGlvblN0YXJ0LGp1bmN0aW9uRW5kLGNvbm5lY3RvckRpc3BsYXksdGhpcyk7XHJcblx0XHRcdHZhciBwID0gdGhpcy5wYXRoc1twYXRoS2V5XTtcclxuXHRcdH1cclxuXHRcdHZhciBwYXRoID0gdGhpcy5wYXRoc1twYXRoS2V5XTtcclxuXHRcdHJldHVybihwYXRoKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0SnVudGlvbkdyYXBoRGF0YShqdW5jdGlvbkluZm8pXHJcblx0e1xyXG5cdFx0dmFyIGp1bmN0aW9uR3JhcGhEYXRhID0gdGhpcy53b3JsZERpc3BsYXkuanVuY3Rpb25UeXBlc1tcImdlbmVyaWNcIl07XHJcblx0XHJcblx0XHRpZih0aGlzLndvcmxkRGlzcGxheS5qdW5jdGlvblR5cGVzLmhhc093blByb3BlcnR5KGp1bmN0aW9uSW5mby5qdW5jdGlvblR5cGVLZXkpKVxyXG5cdFx0e1xyXG5cdFx0XHRqdW5jdGlvbkdyYXBoRGF0YSA9IHRoaXMud29ybGREaXNwbGF5Lmp1bmN0aW9uVHlwZXNbanVuY3Rpb25JbmZvLmp1bmN0aW9uVHlwZUtleV07XHJcblx0XHJcblx0XHR9XHJcblx0XHRyZXR1cm4oanVuY3Rpb25HcmFwaERhdGEpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRDcmVhdGVKdW5jdGlvbihuYW1lLGp1bmN0aW9uSW5mbylcclxuXHR7XHJcblx0XHR2YXIganVuY3Rpb25HcmFwaERhdGEgPSB0aGlzLmdldEp1bnRpb25HcmFwaERhdGEoanVuY3Rpb25JbmZvKTtcclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMuanVuY3Rpb25zLmhhc093blByb3BlcnR5KG5hbWUpKVxyXG5cdFx0e1xyXG5cdFx0Ly9cdGNvbnNvbGUubG9nKFwiZ2V0Q3JlYXRlSnVuY3Rpb246TmV3IEp1bmN0aW9uOlwiK1xyXG5cdFx0Ly9cdFx0XHRcIm5hbWU9XCIrbmFtZStcclxuXHRcdC8vXHRcdFx0XCI6anVuY3Rpb25JbmZvPVwiK0NvbW1vbnRvU3RyaW5nKGp1bmN0aW9uSW5mbykpO1xyXG5cdFx0XHR2YXIgc3RhcnRQb3NpdGlvbiA9IHRoaXMuZ2V0U3RhcnRQb3NpdGlvbkp1bmN0aW9uKCk7XHJcblx0XHRcdHRoaXMuanVuY3Rpb25zW25hbWVdID0gbmV3IEp1bmN0aW9uKG5hbWUsXHJcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oc3RhcnRQb3NpdGlvbi5nZXRYKCksc3RhcnRQb3NpdGlvbi5nZXRZKCkpLFxyXG5cdFx0XHRcdFx0XHRcdG5ldyBQb3NpdGlvbigwLDApLFxyXG5cdFx0XHRcdFx0XHRcdG5ldyBBcnJheSgpLFxyXG5cdFx0XHRcdFx0XHRcdGp1bmN0aW9uR3JhcGhEYXRhLFxyXG5cdFx0XHRcdFx0XHRcdGp1bmN0aW9uSW5mbyk7XHJcblx0XHRcdHZhciBqID0gdGhpcy5qdW5jdGlvbnNbbmFtZV07XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJwYXRoV29ybGQgZ2V0Q3JlYXRlSnVuY3Rpb24gaW5uZXIgbmFtZTpcIitqLm5hbWUpXHRcclxuXHRcdFx0dGhpcy5hZGROb2RlKGopO1xyXG5cdFx0XHR0aGlzLndvcmxkV2FsbC5hZGROb2RlKGopO1xyXG5cdFx0XHR0aGlzLmp1bmN0aW9uU3BhY2VyLmFkZE5vZGUoaik7XHJcblx0XHR9XHJcblx0XHR2YXIganVuY3Rpb24gPSB0aGlzLmp1bmN0aW9uc1tuYW1lXTtcclxuXHRcclxuXHRcdHJldHVybihqdW5jdGlvbik7XHJcblx0fVxyXG5cdFxyXG5cdGdldFdhbGtlckdyYXBoRGF0YSh3YWxrZXJJbmZvKVxyXG5cdHtcclxuXHRcdHZhciB3YWxrZXJHcmFwaERhdGEgPSB0aGlzLndvcmxkRGlzcGxheS53YWxrZXJEaXNwbGF5VHlwZXNbXCJnZW5lcmljXCJdO1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcImdldFdhbGtlckdyYXBoRGF0YTpsb29raW5nIHVwOlwiK0NvbW1vbnRvU3RyaW5nKHdhbGtlckluZm8pKTtcclxuXHRcdGlmKHRoaXMud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlcy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJJbmZvLndhbGtlclR5cGVLZXkpKVxyXG5cdFx0e1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiICAgICBnZXRXYWxrZXJHcmFwaERhdGE6Zm91bmQ6XCIrQ29tbW9udG9TdHJpbmcod2Fsa2VySW5mby53YWxrZXJUeXBlS2V5KSk7XHJcblx0XHRcdHdhbGtlckdyYXBoRGF0YSA9IHRoaXMud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlc1t3YWxrZXJJbmZvLndhbGtlclR5cGVLZXldO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuKHdhbGtlckdyYXBoRGF0YSk7XHJcblx0fVxyXG5cdGdldENyZWF0ZVdhbGtlcih3YWxrZXJOYW1lLHdhbGtlckluZm8pXHJcblx0e1xyXG5cdFx0dmFyIHdhbGtlckdyYXBoRGF0YSA9IHRoaXMuZ2V0V2Fsa2VyR3JhcGhEYXRhKHdhbGtlckluZm8pO1xyXG5cdFx0XHJcblx0XHRpZighdGhpcy53YWxrZXJzLmhhc093blByb3BlcnR5KHdhbGtlck5hbWUpKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgc3RhcnRQb3NpdGlvbiA9IHRoaXMuZ2V0U3RhcnRQb3NpdGlvbldhbGtlcigpO1xyXG5cdFx0XHR0aGlzLndhbGtlcnNbd2Fsa2VyTmFtZV0gPSBuZXcgV2Fsa2VyKHdhbGtlck5hbWUsXHJcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oc3RhcnRQb3NpdGlvbi5nZXRYKCksc3RhcnRQb3NpdGlvbi5nZXRZKCkpLFxyXG5cdFx0XHRcdFx0bmV3IFBvc2l0aW9uKDAsMCksXHJcblx0XHRcdFx0XHRuZXcgQXJyYXkoKSxcclxuXHRcdFx0XHRcdHdhbGtlckdyYXBoRGF0YSxcclxuXHRcdFx0XHRcdHdhbGtlckluZm8pO1xyXG5cdFx0XHR2YXIgdyA9IHRoaXMud2Fsa2Vyc1t3YWxrZXJOYW1lXTtcclxuXHRcdFx0dGhpcy5hZGROb2RlKHcpO1xyXG5cdFx0XHR0aGlzLndvcmxkV2FsbC5hZGROb2RlKHcpO1xyXG5cdFx0XHQvL3RoaXMuanVuY3Rpb25TcGFjZXIuYWRkTm9kZShqKTtcclxuXHRcdH1cclxuXHRcdHZhciB3YWxrZXIgPSB0aGlzLndhbGtlcnNbd2Fsa2VyTmFtZV07IFxyXG5cdFx0cmV0dXJuKHdhbGtlcik7XHJcblx0fVxyXG5cdFxyXG5cdHJlbW92ZVdhbGtlcih3YWxrZXIpXHJcblx0e1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcIlBhdGhXb3JsZC5yZW1vdmVXYWxrZXI6XCIrd2Fsa2VyLm5hbWUrXCIgYXQgXCIrd2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpLm5hbWUpO1xyXG5cdFx0aWYod2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpKVx0d2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpLnJlbW92ZVdhbGtlcih3YWxrZXIpO1xyXG5cdFx0dGhpcy5yZW1vdmVOb2RlKHdhbGtlcik7XHJcblx0XHR0aGlzLndvcmxkV2FsbC5yZW1vdmVOb2RlKHdhbGtlcik7XHJcblx0XHRkZWxldGUgdGhpcy53YWxrZXJzW3dhbGtlci5uYW1lXTtcclxuXHR9XHJcblx0XHJcblx0Z2V0VGVsZXBvcnRQYXRoKHN0YXJ0SnVuY3Rpb24sZW5kSnVuY3Rpb24pXHJcblx0e1xyXG5cdFx0dmFyIHN0YXJ0SnVuY3Rpb25OYW1lID0gXCJcIjtcclxuXHRcdHZhciBlbmRKdW5jdGlvbk5hbWUgPSBcIlwiO1xyXG5cdFx0aWYoc3RhcnRKdW5jdGlvbiE9bnVsbCkgc3RhcnRKdW5jdGlvbk5hbWUgPSBzdGFydEp1bmN0aW9uLm5hbWU7XHJcblx0XHRpZihlbmRKdW5jdGlvbiE9bnVsbCkgZW5kSnVuY3Rpb25OYW1lID0gZW5kSnVuY3Rpb24ubmFtZTtcclxuXHRcdHZhciB0ZWxlcG9ydFBhdGhSZXR1cm4gPSBudWxsO1xyXG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLndvcmxkRGlzcGxheS50ZWxlcG9ydFBhdGhzLmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciB0ZWxlcG9ydFBhdGggPSB0aGlzLndvcmxkRGlzcGxheS50ZWxlcG9ydFBhdGhzW2ldO1xyXG5cdFx0XHR2YXIgc3RhcnRKdW5jdGlvblJlZ0V4cCA9IG5ldyBSZWdFeHAodGVsZXBvcnRQYXRoLnN0YXJ0SnVuY3Rpb24pO1xyXG5cdFx0XHR2YXIgZW5kSnVuY3Rpb25SZWdFeHAgPSBuZXcgUmVnRXhwKHRlbGVwb3J0UGF0aC5lbmRKdW5jdGlvbik7XHJcblx0XHRcdGlmKFxyXG5cdFx0XHRcdFx0c3RhcnRKdW5jdGlvblJlZ0V4cC50ZXN0KHN0YXJ0SnVuY3Rpb25OYW1lKSAmJlxyXG5cdFx0XHRcdFx0ZW5kSnVuY3Rpb25SZWdFeHAudGVzdChlbmRKdW5jdGlvbk5hbWUpICYmXHJcblx0XHRcdFx0XHRzdGFydEp1bmN0aW9uTmFtZSE9ZW5kSnVuY3Rpb25OYW1lKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGVsZXBvcnRQYXRoUmV0dXJuID0gdGVsZXBvcnRQYXRoO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4odGVsZXBvcnRQYXRoUmV0dXJuKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0RW5kUG9pbnRNb2Qoc3RhcnRKdW5jdGlvbixlbmRKdW5jdGlvbilcclxuXHR7XHJcblx0XHR2YXIgc3RhcnRKdW5jdGlvbk5hbWUgPSBcIlwiO1xyXG5cdFx0dmFyIGVuZEp1bmN0aW9uTmFtZSA9IFwiXCI7XHJcblx0XHRpZihzdGFydEp1bmN0aW9uIT1udWxsKSBzdGFydEp1bmN0aW9uTmFtZSA9IHN0YXJ0SnVuY3Rpb24ubmFtZTtcclxuXHRcdGlmKGVuZEp1bmN0aW9uIT1udWxsKSBlbmRKdW5jdGlvbk5hbWUgPSBlbmRKdW5jdGlvbi5uYW1lO1xyXG5cdFx0dmFyIGVuZFBvaW50UmV0dXJuID0gbnVsbDtcclxuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy53b3JsZERpc3BsYXkuZW5kUG9pbnRNb2RzLmxlbmd0aDtpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBlbmRQb2ludCA9IHRoaXMud29ybGREaXNwbGF5LmVuZFBvaW50TW9kc1tpXTtcclxuXHRcdFx0dmFyIHN0YXJ0SnVuY3Rpb25SZWdFeHAgPSBuZXcgUmVnRXhwKGVuZFBvaW50LnN0YXJ0SnVuY3Rpb24pO1xyXG5cdFx0XHR2YXIgZW5kSnVuY3Rpb25SZWdFeHAgPSBuZXcgUmVnRXhwKGVuZFBvaW50LmVuZEp1bmN0aW9uKTtcclxuXHRcdFx0aWYoXHJcblx0XHRcdFx0XHRzdGFydEp1bmN0aW9uUmVnRXhwLnRlc3Qoc3RhcnRKdW5jdGlvbk5hbWUpICYmXHJcblx0XHRcdFx0XHRlbmRKdW5jdGlvblJlZ0V4cC50ZXN0KGVuZEp1bmN0aW9uTmFtZSkgJiZcclxuXHRcdFx0XHRcdHN0YXJ0SnVuY3Rpb25OYW1lIT1lbmRKdW5jdGlvbk5hbWUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRlbmRQb2ludFJldHVybiA9IGVuZFBvaW50O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4oZW5kUG9pbnRSZXR1cm4pO1xyXG5cdH1cclxuXHRwcm9jZXNzV29ybGRVcGRhdGVRdWV1ZSgpXHJcblx0e1xyXG5cdFx0dmFyIHdvcmxkVXBkYXRlID0gdGhpcy5nZXROZXh0RnJvbVdvcmxkVXBkYXRlKCk7XHJcblx0XHRpZih3b3JsZFVwZGF0ZSE9bnVsbClcclxuXHRcdHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcInByb2Nlc3NXb3JsZFVwZGF0ZVF1ZXVlOndvcmxkVXBkYXRlPVwiK0NvbW1vbnRvU3RyaW5nKHdvcmxkVXBkYXRlKSk7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgaXNXYWxrZXJOZXcgPSB0aGlzLmlzV2Fsa2VyTmV3KHdvcmxkVXBkYXRlLndhbGtlck5hbWUpO1xyXG5cdFx0XHR2YXIgaXNKdW5jdGlvbk5ldyA9IHRoaXMuaXNKdW5jdGlvbk5ldyh3b3JsZFVwZGF0ZS5qdW5jdGlvbk5hbWUpO1xyXG5cdFx0XHR2YXIgd2Fsa2VyID0gdGhpcy5nZXRDcmVhdGVXYWxrZXIod29ybGRVcGRhdGUud2Fsa2VyTmFtZSx3b3JsZFVwZGF0ZS53YWxrZXJJbmZvKTtcclxuXHRcdFx0dmFyIGp1bmN0aW9uID0gdGhpcy5nZXRDcmVhdGVKdW5jdGlvbih3b3JsZFVwZGF0ZS5qdW5jdGlvbk5hbWUsd29ybGRVcGRhdGUuanVuY3Rpb25JbmZvKTtcdFx0XHJcblx0XHRcdHZhciBjdXJyZW50SnVuY3Rpb24gPSB3YWxrZXIuZ2V0Q3VycmVudEp1bmN0aW9uKCk7XHRcclxuXHRcdFx0XHJcblx0XHRcdHZhciBlbmRQb2ludE1vZCA9IHRoaXMuZ2V0RW5kUG9pbnRNb2QoY3VycmVudEp1bmN0aW9uLGp1bmN0aW9uKTtcdFx0XHJcblx0XHRcdGlmKGVuZFBvaW50TW9kIT1udWxsKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coXCJCZWZvcmUgZ2V0RW5kUG9pbnRNb2QhIG5hbWU9XCIrZW5kUG9pbnRNb2QuZW5kUG9pbnRNb2ROYW1lK1wiIHN0YXJ0PVwiK2N1cnJlbnRKdW5jdGlvbi5uYW1lK1xyXG5cdFx0XHRcdFx0XHRcIiBlbmQ9XCIranVuY3Rpb24ubmFtZStcIiB3YWxrZXJOYW1lOlwiK3dvcmxkVXBkYXRlLndhbGtlck5hbWUrXHJcblx0XHRcdFx0XHRcdFwiIHdvcmxkVXBkYXRlPVwiK0NvbW1vbnRvU3RyaW5nKHdvcmxkVXBkYXRlKSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aXNKdW5jdGlvbk5ldyA9IHRoaXMuaXNKdW5jdGlvbk5ldyhlbmRQb2ludE1vZC5lbmRQb2ludE1vZE5hbWUpO1xyXG5cdFx0XHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uSW5mby5qdW5jdGlvbk5hbWUgPSBlbmRQb2ludE1vZC5lbmRQb2ludE1vZE5hbWU7XHJcblx0XHRcdFx0d29ybGRVcGRhdGUuanVuY3Rpb25OYW1lID0gZW5kUG9pbnRNb2QuZW5kUG9pbnRNb2ROYW1lO1xyXG5cdFx0XHRcdGp1bmN0aW9uID0gdGhpcy5nZXRDcmVhdGVKdW5jdGlvbihlbmRQb2ludE1vZC5lbmRQb2ludE1vZE5hbWUsd29ybGRVcGRhdGUuanVuY3Rpb25JbmZvKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIi4uLmFmdGVyIGdldEVuZFBvaW50TW9kISBuYW1lPVwiK2VuZFBvaW50TW9kLmVuZFBvaW50TW9kTmFtZStcIiBzdGFydD1cIitjdXJyZW50SnVuY3Rpb24ubmFtZStcclxuXHRcdFx0XHRcdFx0XCIgZW5kPVwiK2p1bmN0aW9uLm5hbWUrXCIgd2Fsa2VyTmFtZTpcIit3b3JsZFVwZGF0ZS53YWxrZXJOYW1lK1xyXG5cdFx0XHRcdFx0XHRcIiB3b3JsZFVwZGF0ZT1cIitDb21tb250b1N0cmluZyh3b3JsZFVwZGF0ZSkpO1xyXG5cdFx0XHRcdC8vd2Fsa2VyLnNldEN1cnJlbnRKdW5jdGlvbihjdXJyZW50SnVuY3Rpb24pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgdGVsZXBvcnRQYXRoID0gdGhpcy5nZXRUZWxlcG9ydFBhdGgoY3VycmVudEp1bmN0aW9uLGp1bmN0aW9uKTtcclxuXHRcdFx0aWYodGVsZXBvcnRQYXRoIT1udWxsKVxyXG5cdFx0XHR7XHR2YXIgY2puYW1lID0gXCJudWxsXCI7XHJcblx0XHRcdFx0aWYoY3VycmVudEp1bmN0aW9uIT1udWxsKSBjam5hbWUgPSBjdXJyZW50SnVuY3Rpb24ubmFtZTsgXHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIlRlbGVwb3J0IFBhdGghIG5hbWU9XCIrdGVsZXBvcnRQYXRoLnRlbGVwb3J0TmFtZStcIiBzdGFydD1cIitjam5hbWUrXCIgZW5kPVwiK2p1bmN0aW9uLm5hbWUpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGN1cnJlbnRKdW5jdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlSnVuY3Rpb24odGVsZXBvcnRQYXRoLnRlbGVwb3J0TmFtZSxcclxuXHRcdFx0XHRcdFx0e2p1bmN0aW9uTmFtZTp0ZWxlcG9ydFBhdGgudGVsZXBvcnROYW1lLGp1bmN0aW9uVHlwZUtleTpcImdlbmVyaWNcIn0pO1xyXG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCIuLi5hZnRlciBUZWxlcG9ydCBQYXRoISBuYW1lPVwiK3RlbGVwb3J0UGF0aC50ZWxlcG9ydE5hbWUrXCIgc3RhcnQ9XCIrY3VycmVudEp1bmN0aW9uLm5hbWUrXCIgZW5kPVwiK2p1bmN0aW9uLm5hbWUpO1xyXG5cdFx0XHRcdHdhbGtlci5zZXRDdXJyZW50SnVuY3Rpb24oY3VycmVudEp1bmN0aW9uKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoY3VycmVudEp1bmN0aW9uIT1udWxsKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy5nZXRDcmVhdGVQYXRoKGN1cnJlbnRKdW5jdGlvbixqdW5jdGlvbix3b3JsZFVwZGF0ZS5wYXRoSW5mbyk7XHJcblx0XHRcdFx0Ly93YWxrZXIuc2V0Q3VycmVudEp1bmN0aW9uKGp1bmN0aW9uKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0d2Fsa2VyLnNldEN1cnJlbnRKdW5jdGlvbihqdW5jdGlvbik7XHJcblx0XHRcdHdhbGtlci5sYXN0VXBkYXRlVGltZVN0YW1wID0gdGhpcy5jaGVja1RpbWVzdGFtcDtcclxuXHRcdFx0aWYoaXNKdW5jdGlvbk5ldylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmKHRoaXMuanVuY3Rpb25zLmxlbmd0aD09MClcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR0aGlzLmp1bmN0aW9uLnBvc2l0aW9uLnNldFgoMCk7XHJcblx0XHRcdFx0XHR0aGlzLmp1bmN0aW9uLnBvc2l0aW9uLnNldFkoMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgaWYoY3VycmVudEp1bmN0aW9uPT1udWxsKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGp1bmN0aW9uLnBvc2l0aW9uLnNldFgodGhpcy53b3JsZERpc3BsYXkucmVsYXhlZERpc3RhbmNlRGVmYXVsdCk7XHJcblx0XHRcdFx0XHRqdW5jdGlvbi5wb3NpdGlvbi5zZXRZKHRoaXMud29ybGREaXNwbGF5LnJlbGF4ZWREaXN0YW5jZURlZmF1bHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0anVuY3Rpb24ucG9zaXRpb24uc2V0WCggY3VycmVudEp1bmN0aW9uLnBvc2l0aW9uLmdldFgoKSt0aGlzLndvcmxkRGlzcGxheS5qdW5jdGlvblJhZGl1c0RlZmF1bHQqKE1hdGgucmFuZG9tKCkpICk7XHJcblx0XHRcdFx0XHRqdW5jdGlvbi5wb3NpdGlvbi5zZXRZKCBjdXJyZW50SnVuY3Rpb24ucG9zaXRpb24uZ2V0WSgpK3RoaXMud29ybGREaXNwbGF5Lmp1bmN0aW9uUmFkaXVzRGVmYXVsdCooTWF0aC5yYW5kb20oKSkgKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoaXNXYWxrZXJOZXcpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR3YWxrZXIucG9zaXRpb24uc2V0WCgganVuY3Rpb24ucG9zaXRpb24uZ2V0WCgpICk7XHJcblx0XHRcdFx0d2Fsa2VyLnBvc2l0aW9uLnNldFkoIGp1bmN0aW9uLnBvc2l0aW9uLmdldFkoKSApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4od29ybGRVcGRhdGUpO1xyXG5cdH1cclxuXHRcclxuXHRhZGRUb1dvcmxkVXBkYXRlUXVldWUod29ybGRVcGRhdGUpXHJcblx0e1xyXG5cdFx0dGhpcy53b3JsZFVwZGF0ZVF1ZXVlLmlzSW5OZWVkT2ZTb3J0aW5nID0gdHJ1ZTtcclxuXHRcdHRoaXMud29ybGRVcGRhdGVRdWV1ZS5wdXNoKHdvcmxkVXBkYXRlKTtcclxuXHR9XHRcclxuXHRcclxuXHRwcmVwYXJlV29ybGRVcGRhdGVRdWV1ZSgpXHJcblx0e1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcInByZXBhcmVXb3JsZFVwZGF0ZVF1ZXVlOmlzSW5OZWVkT2ZTb3J0aW5nPVwiK3RoaXMud29ybGRVcGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZyk7XHJcblx0XHRpZih0aGlzLndvcmxkVXBkYXRlUXVldWUuaXNJbk5lZWRPZlNvcnRpbmcpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMud29ybGRVcGRhdGVRdWV1ZS5zb3J0KFxyXG5cdFx0XHRcdGZ1bmN0aW9uKGEsIGIpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0dXJuKGEucHJvY2Vzc1RpbWVzdGFtcC1iLnByb2Nlc3NUaW1lc3RhbXApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR0aGlzLndvcmxkVXBkYXRlUXVldWUuaXNJbk5lZWRPZlNvcnRpbmcgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Z2V0TmV4dEZyb21Xb3JsZFVwZGF0ZSh3b3JsZFVwZGF0ZSlcclxuXHR7XHJcblx0XHR2YXIgd29ybGRVcGRhdGUgPSBudWxsO1xyXG5cdFx0aWYodGhpcy53b3JsZFVwZGF0ZVF1ZXVlLmxlbmd0aD4wKVxyXG5cdFx0e1xyXG5cdFx0XHR3b3JsZFVwZGF0ZSA9IHRoaXMud29ybGRVcGRhdGVRdWV1ZVswXTtcclxuXHRcdFx0dGhpcy53b3JsZFVwZGF0ZVF1ZXVlLnNoaWZ0KCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4od29ybGRVcGRhdGUpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRXYWxrZXJLZXkod2Fsa2VyKVxyXG5cdHtcclxuXHRcdHJldHVybih3YWxrZXIubmFtZSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldEp1bmN0aW9uS2V5KGp1bmN0aW9uKVxyXG5cdHtcclxuXHRcdC8vY29uc29sZS5sb2coXCJwYXRoV29ybGQgZ2V0SnVuY3Rpb25LZXkganVuY3Rpb246XCIranVuY3Rpb24ubmFtZSk7XHJcblx0XHJcblx0XHRyZXR1cm4oanVuY3Rpb24ubmFtZSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFBhdGhLZXkoanVuY3Rpb25TdGFydCxqdW5jdGlvbkVuZClcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwicGF0aFdvcmxkIGdldFBhdGhLZXkganVuY3Rpb25TdGFydDpcIitqdW5jdGlvblN0YXJ0Lm5hbWUpO1xyXG5cdFx0Ly9jb25zb2xlLmxvZyhcInBhdGhXb3JsZCBnZXRQYXRoS2V5IGp1bmN0aW9uRW5kOlwiK2p1bmN0aW9uRW5kLm5hbWUpO1xyXG5cdFx0cmV0dXJuKHRoaXMuZ2V0SnVuY3Rpb25LZXkoanVuY3Rpb25TdGFydCkrXCI6XCIrdGhpcy5nZXRKdW5jdGlvbktleShqdW5jdGlvbkVuZCkpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRTdGFydFBvc2l0aW9uV2Fsa2VyKClcclxuXHR7XHJcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuY2FudmFzSG9sZGVyLmdldFdpZHRoKCkvMix0aGlzLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKS8yKSk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFN0YXJ0UG9zaXRpb25KdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih0aGlzLmNhbnZhc0hvbGRlci5nZXRXaWR0aCgpLzIsdGhpcy5jYW52YXNIb2xkZXIuZ2V0SGVpZ2h0KCkvMikpO1xyXG5cdH1cclxuXHJcbn1cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXRoV29ybGQ7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpQYXRoV29ybGRcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJjbGFzcyBQYXRoV29ybGREZWZcclxue1xyXG5cdGdldFBhdGhQYXJ0cygpXHJcblx0e1xyXG5cdFx0dGhyb3cgXCJQYXRoV29scmREZWYuZ2V0UGF0aFBhcnRzIG5vdCBkZWZpbmVkXCI7XHJcblx0fVxyXG5cdFxyXG5cdGdldFBhdGhEZWYoKVxyXG5cdHtcclxuXHRcdHRocm93IFwiUGF0aFdvbHJkRGVmLmdldFBhdGhEZWYgbm90IGRlZmluZWRcIjtcclxuXHR9XHJcblx0XHJcblx0Z2V0V29scmREaXNwbGF5KClcclxuXHR7XHJcblx0XHR0aHJvdyBcIlBhdGhXb2xyZERlZi5nZXRXb2xyZERpc3BsYXkgbm90IGRlZmluZWRcIjtcclxuXHR9XHJcblx0XHJcblx0Z2V0V2Fsa2VySnVuY3Rpb25SdWxlcygpXHJcblx0e1xyXG5cdFx0dGhyb3cgXCJQYXRoV29scmREZWYuZ2V0V2Fsa2VySnVuY3Rpb25SdWxlcyBub3QgZGVmaW5lZFwiO1xyXG5cdH1cclxuXHRcclxuXHRnZXRXb3JsZERlZmF1bHRzKClcclxuXHR7XHJcblx0XHR0aHJvdyBcIlBhdGhXb2xyZERlZi5nZXRXb3JsZERlZmF1bHRzIG5vdCBkZWZpbmVkXCI7XHJcblx0fVxyXG59XHJcblxyXG4vLzxqczJub2RlPlxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhXb3JsZERlZjtcclxuY29uc29sZS5sb2coXCJQYXRoV29ybGREZWZcIik7XHJcbi8vPC9qczJub2RlPlxyXG4iLCJ2YXIgTm9kZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGUnKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jb21tb24nKTtcclxuXHJcbmNsYXNzIFdhbGtlciBleHRlbmRzIE5vZGVcclxue1xyXG5cdGNvbnN0cnVjdG9yKG5hbWUscG9zaXRpb24sb2Zmc2V0LHNoYXBlTGlzdCxncmFwaERhdGEsaW5mb0RhdGEpXHJcblx0e1xyXG5cdFx0c3VwZXIobmFtZSxwb3NpdGlvbixvZmZzZXQsc2hhcGVMaXN0LGdyYXBoRGF0YSxpbmZvRGF0YSk7XHJcblx0XHRXYWxrZXIuaW5pdFdhbGtlcih0aGlzLG5hbWUscG9zaXRpb24sb2Zmc2V0LHNoYXBlTGlzdCxncmFwaERhdGEsaW5mb0RhdGEpO1xyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgaW5pdFdhbGtlcih3YWxrZXIsbmFtZSxwb3NpdGlvbixvZmZzZXQsc2hhcGVMaXN0LGdyYXBoRGF0YSxpbmZvRGF0YSlcclxuXHR7XHJcblx0XHR3YWxrZXIuanVuY3Rpb25BcnJheSA9IG5ldyBBcnJheSgpO1xyXG5cdFx0d2Fsa2VyLmxheWVyPTI7XHJcblx0XHRpZighd2Fsa2VyLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzKSB3YWxrZXIuZ3JhcGhEYXRhLndhbGtlckp1bmN0aW9uUnVsZXMgPSBuZXcgT2JqZWN0KCk7XHJcblx0XHRpZighd2Fsa2VyLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHMpXHJcblx0XHRcdHdhbGtlci5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzID0gbmV3IEFycmF5KCk7XHJcblx0fVxyXG5cclxuXHRcclxuXHRnZXROb2RlVWlEaXNwbGF5KG5vZGUpXHJcblx0e1xyXG5cdFx0dmFyIHZhbHVlID0gdGhpcy5uYW1lO1xyXG5cdFxyXG5cdFx0dmFsdWUgKz0gXCI8bGk+dHlwZTpcIit0aGlzLmluZm9EYXRhLndhbGtlclR5cGVLZXkrXCI8L2xpPlwiO1xyXG5cdFx0dmFsdWUgKz0gXCI8bGk+Y3VycmVudEo6XCIrdGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5uYW1lK1wiPC9saT5cIjtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGV4aXQgPSB0aGlzLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHNbaV07XHJcblx0XHJcblx0XHRcdHZhciB0aW1lVG9SZW1vdmUgPSAoXHJcblx0XHRcdFx0XHQodGhpcy5sYXN0VXBkYXRlVGltZVN0YW1wK2V4aXQuZXhpdEFmdGVyTWlsaVNlY29uZHMpXHJcblx0XHRcdFx0XHQ8XHJcblx0XHRcdFx0XHR3b3JsZC5jaGVja1RpbWVzdGFtcCk7XHJcblx0XHJcblx0XHRcdHZhbHVlICs9IFwiPGxpPmV4aXRKdW5jdGlvbjppPVwiK2krXCIgXCIrZXhpdC5leGl0SnVuY3Rpb24rXHJcblx0XHRcdFx0XCIgYXQgZXhpdDpcIisoZXhpdC5leGl0SnVuY3Rpb249PXRoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkubmFtZSkrXHJcblx0XHRcdFx0XCIgdGltZVRvUmVtb3ZlOlwiK3RpbWVUb1JlbW92ZStcclxuXHRcdFx0XHRcIjwvbGk+XCI7XHJcblx0XHR9XHJcblx0XHR2YWx1ZSArPSBcIjxsaT5yZW1vdmUgYXQ6XCIrKHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKStcIjwvbGk+XCI7XHJcblx0XHR2YWx1ZSArPSBcIjxsaT5jaGVja1RpbWU6XCIrd29ybGQuY2hlY2tUaW1lc3RhbXArXCI8L2xpPlwiO1xyXG5cdFx0dmFsdWUgKz0gXCI8bGk+ZGlmZjpcIisod29ybGQuY2hlY2tUaW1lc3RhbXAtKHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKSkrXCI8L2xpPlwiO1xyXG5cdFx0cmV0dXJuKHZhbHVlKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0cHJvY2Vzc1dhbGtlclJ1bGVzKHdvcmxkKVxyXG5cdHtcclxuXHRcdC8vY29uc29sZS5sb2coXCJ3OlwiK3RoaXMubmFtZStcIiBjdXJyZW50SnVuY3Rpb249XCIrdGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5uYW1lKTtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGV4aXQgPSB0aGlzLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHNbaV07XHJcblx0XHRcdGlmKGV4aXQuZXhpdEp1bmN0aW9uPT10aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpLm5hbWUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgdGltZVRvUmVtb3ZlID0gKFxyXG5cdFx0XHRcdFx0XHQodGhpcy5sYXN0VXBkYXRlVGltZVN0YW1wK2V4aXQuZXhpdEFmdGVyTWlsaVNlY29uZHMpXHJcblx0XHRcdFx0XHRcdDxcclxuXHRcdFx0XHRcdFx0d29ybGQuY2hlY2tUaW1lc3RhbXApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHJcblx0XHRcdFx0aWYodGltZVRvUmVtb3ZlKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJUSU1FIFRPIEVYSVQgdzpcIit0aGlzLm5hbWUrXHJcblx0XHRcdFx0XHRcdFx0XCIgY3VycmVudEp1bmN0aW9uPVwiK3RoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkubmFtZStcclxuXHRcdFx0XHRcdFx0XHRcIiBleGl0OlwiK2V4aXQuZXhpdEp1bmN0aW9uK1xyXG5cdFx0XHRcdFx0XHRcdFwiIHR5cGU6XCIrQ29tbW9udG9TdHJpbmcodGhpcy5pbmZvRGF0YS53YWxrZXJUeXBlS2V5KStcclxuXHRcdFx0XHRcdFx0XHRcIiBpbmZvRGF0YTpcIitDb21tb250b1N0cmluZyh0aGlzLmluZm9EYXRhKSk7XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR3b3JsZC5yZW1vdmVXYWxrZXIodGhpcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL2NvbnNvbGUubG9nKFwidzpcIit0aGlzLm5hbWUrXCIganVuY3Rpb246XCIrdGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKSk7XHJcblx0fVxyXG5cdFxyXG5cdHNldEN1cnJlbnRKdW5jdGlvbihqdW5jdGlvbilcclxuXHR7XHJcblx0XHRpZih0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpIT1udWxsKVxyXG5cdFx0e1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0Q3VycmVudEp1bmN0aW9uKCkucmVtb3ZlV2Fsa2VyIFwiKTtcclxuXHRcdFx0dGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5yZW1vdmVXYWxrZXIodGhpcyk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmp1bmN0aW9uQXJyYXkucHVzaChqdW5jdGlvbik7XHJcblx0XHRqdW5jdGlvbi5hZGRXYWxrZXIodGhpcyk7XHJcblx0fVxyXG5cdFxyXG5cdGdldEN1cnJlbnRKdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYodGhpcy5qdW5jdGlvbkFycmF5Lmxlbmd0aD09MCkgcmV0dXJuKG51bGwpO1xyXG5cdFx0cmV0dXJuKHRoaXMuanVuY3Rpb25BcnJheVt0aGlzLmp1bmN0aW9uQXJyYXkubGVuZ3RoIC0gMV0pO1xyXG5cdH1cclxuXHRcclxuXHRsb2coKVxyXG5cdHtcclxuXHRcdGNvbnNvbGUubG9nKFwid2Fsa2VyIGxvZzpcIitDb21tb250b1N0cmluZyh0aGlzKSk7XHJcblx0fVxyXG59XHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gV2Fsa2VyO1xyXG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6V2Fsa2VyXCIpO1xyXG4vLzwvanMybm9kZT5cclxuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8gV29ybGRVcGRhdGVcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5jbGFzcyBXb3JsZFVwZGF0ZVxyXG57XHJcblx0Y29uc3RydWN0b3IoanVuY3Rpb25OYW1lLHdhbGtlck5hbWUscHJvY2Vzc1RpbWVzdGFtcCx3YWxrZXJJbmZvLGp1bmN0aW9uSW5mbyxwYXRoSW5mbylcclxuXHR7XHJcblx0XHJcblx0XHRXb3JsZFVwZGF0ZS5jcmVhdGVXb3JsZFVwZGF0ZSh0aGlzLGp1bmN0aW9uTmFtZSx3YWxrZXJOYW1lLHByb2Nlc3NUaW1lc3RhbXAsd2Fsa2VySW5mbyxqdW5jdGlvbkluZm8scGF0aEluZm8pO1xyXG5cdH1cclxuXHRcdFxyXG5cdHN0YXRpYyBjcmVhdGVXb3JsZFVwZGF0ZSh3b3JsZFVwZGF0ZSxqdW5jdGlvbk5hbWUsd2Fsa2VyTmFtZSxwcm9jZXNzVGltZXN0YW1wLHdhbGtlckluZm8sanVuY3Rpb25JbmZvLHBhdGhJbmZvKVxyXG5cdHtcclxuXHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uTmFtZSA9IGp1bmN0aW9uTmFtZTtcclxuXHRcdHdvcmxkVXBkYXRlLndhbGtlck5hbWUgPSB3YWxrZXJOYW1lO1xyXG5cdFx0d29ybGRVcGRhdGUucHJvY2Vzc1RpbWVzdGFtcCA9IHByb2Nlc3NUaW1lc3RhbXA7XHJcblx0XHR3b3JsZFVwZGF0ZS53YWxrZXJJbmZvID0gd2Fsa2VySW5mbztcclxuXHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uSW5mbyA9IGp1bmN0aW9uSW5mbztcclxuXHRcdHdvcmxkVXBkYXRlLnBhdGhJbmZvID0gcGF0aEluZm87XHJcblx0fVxyXG5cdFxyXG5cdHJlYWR5VG9CZVByb2Nlc3NlZCAodGltZXN0YW1wKVxyXG5cdHtcclxuXHRcdC8vcmV0dXJuKCAodGhpcy5wcm9jZXNzVGltZXN0YW1wPD10aW1lc3RhbXApICk7XHJcblx0XHRyZXR1cm4oICAodGhpcy5nZXREYXRlKCkuZ2V0VGltZSgpPD10aW1lc3RhbXApICApO1xyXG5cdH1cclxuXHRcclxuXHRnZXREYXRlKClcclxuXHR7XHJcblx0XHRyZXR1cm4obmV3IERhdGUodGhpcy5wcm9jZXNzVGltZXN0YW1wKjEwMDApKTtcclxuXHR9XHJcbn1cclxuXHJcbi8vPGpzMm5vZGU+XHJcbm1vZHVsZS5leHBvcnRzID0gV29ybGRVcGRhdGU7XHJcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpXb3JsZFVwZGF0ZVwiKTtcclxuLy88L2pzMm5vZGU+XHJcbiIsInZhciBDYW52YXNIb2xkZXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcicpO1xyXG52YXIgUGF0aFdvcmxkID0gcmVxdWlyZSgnLi4vLi4vcGF0aHMvcGF0aHdvcmxkJyk7XHJcbnZhciBJbmFHcmFwaFBhdGhXb3JsZERlZiA9IHJlcXVpcmUoJy4uLy4uL3BhdGhzZXhwL2luYWdyYXBoL2luYWdyYXBocGF0aHdvcmxkZGVmJyk7XHJcblxyXG5cclxuZnVuY3Rpb24gaW5pdEluYUdyYXBoeChjYW52YXNOYW1lKVxyXG57XHJcblx0dmFyIHdvcmxkRGVmID0gbmV3IEluYUdyYXBoUGF0aFdvcmxkRGVmKCk7XHJcblx0dmFyIHdvcmxkRGlzcGxheSA9IHdvcmxkRGVmLmdldFdvcmxkRGVmYXVsdHMoKTtcclxuXHRcclxuXHR3b3JsZCA9IG5ldyBQYXRoV29ybGQoXHJcblx0XHRcdG5ldyBDYW52YXNIb2xkZXIoY2FudmFzTmFtZSksXHJcblx0XHRcdHdvcmxkRGlzcGxheS5qdW5jdGlvblNwYWNlcixcclxuXHRcdFx0d29ybGREaXNwbGF5LndvcmxkV2FsbCxcclxuXHRcdFx0d29ybGREaXNwbGF5KTtcclxuXHRcclxuXHRpbml0Q3VzdG9tTm9kZXMod29ybGQpO1xyXG5cdFxyXG5cdHZhciBmaXJzdEl0ZW0gPSB3b3JsZC5wZWVrQXROZXh0V29ybGRVcGRhdGUoKTtcclxuXHRpZihmaXJzdEl0ZW0hPW51bGwpXHJcblx0e1xyXG5cdFx0dmFyIGZpcnN0RGF0ZSA9IGZpcnN0SXRlbS5nZXREYXRlKCk7XHJcblx0XHR3b3JsZC5zdGFydFRpbWUgPSBmaXJzdERhdGU7XHJcblx0XHR3b3JsZC50aW1lRmFjdG9yID0gMTAuMDsvLzYwKjYwLzAuNTsgLy8gMi4wIGZvciB0aGUgZGVub21pbmF0b3IgaXMgYSBuaWNlIHZpc3VhbCB0aW1lKVxyXG5cdH1cclxuXHRjb25zb2xlLmxvZyhcImluaXQgb2YgXCIrY2FudmFzTmFtZStcIiBkb25lXCIpO1xyXG59XHJcblxyXG5leHBvcnRzLmluaXRJbmFHcmFwaCA9IGluaXRJbmFHcmFwaDtcclxuXHJcbiIsInZhciBQYXRoV29ybGREZWYgPSByZXF1aXJlKCcuLi8uLi9wYXRocy9wYXRod29ybGRkZWYnKTtcclxudmFyIENhbnZhc0hvbGRlciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVyJyk7XHJcbnZhciBQYXRoV29ybGQgPSByZXF1aXJlKCcuLi8uLi9wYXRocy9wYXRod29ybGQnKTtcclxudmFyIFdvcmxkVXBkYXRlID0gcmVxdWlyZSgnLi4vLi4vcGF0aHMvd29ybGR1cGRhdGUnKTtcclxudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcclxudmFyIENpcmNsZURpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS9jaXJjbGVkaXNwbGF5Jyk7XHJcbnZhciBDb25uZWN0b3JEaXNwbGF5RW1wdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXllbXB0eScpO1xyXG52YXIgR3JvdXBDb25uZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3IvZ3JvdXBjb25uZWN0b3InKTtcclxudmFyIFdhbGxDb25uZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3Ivd2FsbGNvbm5lY3RvcicpO1xyXG52YXIgSnVuY3Rpb25Db25uZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9wYXRocy9ub2RlZGlzcGxheS9qdW5jdGlvbmNvbm5lY3RvcicpO1xyXG52YXIgSnVuY3Rpb25EaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vcGF0aHMvbm9kZWRpc3BsYXkvanVuY3Rpb25kaXNwbGF5Jyk7XHJcbnZhciBSZWN0YW5nbGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvcmVjdGFuZ2xlZGlzcGxheScpO1xyXG52YXIgVHJpYW5nbGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvdHJpYW5nbGVkaXNwbGF5Jyk7XHJcblxyXG5jbGFzcyBJbmFHcmFwaFBhdGhXb3JsZERlZiBleHRlbmRzIFBhdGhXb3JsZERlZlxyXG57XHJcblx0Z2V0UGF0aFBhcnRzKClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5wYXRoUGFydHMpO1xyXG5cdH1cclxuXHRcclxuXHRnZXRQYXRoRGVmKClcclxuXHR7XHJcblx0XHRyZXR1cm4odGhpcy5wYXRoRGVmcyk7XHJcblx0fVxyXG5cdFxyXG5cdGdldFdvbHJkRGlzcGxheSgpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHRoaXMud29ybGREaXNwbGF5KTtcclxuXHR9XHJcblx0XHJcblx0Z2V0V2Fsa2VySnVuY3Rpb25SdWxlcygpXHJcblx0e1xyXG5cdFx0cmV0dXJuKHRoaXMuanVuY3Rpb25FeGl0cyk7XHJcbiAgIFx0fVxyXG5cdFxyXG5cdGdldFdvcmxkRGVmYXVsdHMoKVxyXG5cdHtcclxuXHJcblx0XHRyZXR1cm4odGhpcy53b3JsZERlZmF1bHRzKTtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIGluaXRKdW5jdGlvbkRpc3BsYXkobm9kZSlcclxuXHR7XHJcblx0XHRub2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheSA9IG5ldyBKdW5jdGlvbkRpc3BsYXkoXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0ZmlsbENvbG9yOlwiYTBhMGZmZmZcIixcclxuXHRcdFx0XHRcdGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcclxuXHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcImZmZmYwMGZmXCIsXHJcblx0XHRcdFx0XHRzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXHJcblx0XHRcdFx0XHRib3JkZXJXaWR0aDoyLFxyXG5cdFx0XHRcdFx0Zm9udFN0eWxlOlwiYm9sZFwiLFxyXG5cdFx0XHRcdFx0Zm9udFBpeGVsSGVpZ2h0OjE1LFxyXG5cdFx0XHRcdFx0Zm9udEZhY2U6XCJBcmlhbFwiLFxyXG5cdFx0XHRcdFx0cmVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcclxuXHRcdFx0XHRcdHJlY3RGaWxsQ29sb3I6XCJmZmZmZmZmZlwiLFxyXG5cdFx0XHRcdFx0Zm9udENvbG9yOlwiMDAwMGZmZmZcIixcclxuXHRcdFx0XHR9KTtcclxuXHRcdFxyXG5cdFx0bm9kZS5ncmFwaERhdGEudGV4dFNwYWNlciA9IDU7XHJcblx0XHRub2RlLmdyYXBoRGF0YS5yYWRpdXMgPSB3b3JsZC53b3JsZERpc3BsYXkuanVuY3Rpb25SYWRpdXNEZWZhdWx0KjM7XHJcblx0XHRub2RlLmdyYXBoRGF0YS53aWR0aCA9IG5vZGUuZ3JhcGhEYXRhLnJhZGl1cyoyO1xyXG5cdFx0bm9kZS5ncmFwaERhdGEuaGVpZ2h0ID0gbm9kZS5ncmFwaERhdGEucmFkaXVzKjI7XHJcblx0XHRpZihub2RlLmdyYXBoRGF0YS5ub2Rlcz09bnVsbCkgbm9kZS5ncmFwaERhdGEubm9kZXMgPSBuZXcgQXJyYXkoKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0Z2V0UGF0aEFycmF5KClcclxuXHR7XHJcblx0XHR2YXIgYWxsUGF0aEFycmF5ID0gW107XHJcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMucGF0aERlZnMubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHBhdGhEZWYgPSB0aGlzLnBhdGhEZWZzW2ldOyBcclxuXHRcdFx0Zm9yKHZhciBub2RlTG9vcD0wO25vZGVMb29wPHBhdGhEZWYubnVtYmVyTm9kZXM7bm9kZUxvb3ArKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBwYXRoQXJyYXkgPSBbXTtcclxuXHRcdFx0XHRmb3IodmFyIGo9MDtqPHBhdGhEZWYucGF0aC5sZW5ndGg7aisrKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZhciBwYXRoTmFtZSA9IHBhdGhEZWYucGF0aFtqXTtcclxuXHRcdFx0XHRcdHZhciBwYXRoRGVmTmFtZSA9IHBhdGhEZWYucGF0aERlZk5hbWU7XHJcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiICAgZG9pbmcgcGF0aERlZk5hbWU9XCIrcGF0aERlZk5hbWUrXCIgcGF0aE5hbWU9XCIrcGF0aE5hbWUpO1xyXG5cdFx0XHRcdFx0Zm9yKHZhciBrPTA7azxwYXRoUGFydHNbcGF0aE5hbWVdLmxlbmd0aDtrKyspXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCIgICAgICAgICAgICAgICBqdW5jdGlvbj1cIitwYXRoUGFydHNbcGF0aE5hbWVdW2tdKTtcclxuXHRcdFx0XHRcdFx0cGF0aEFycmF5LnB1c2gocGF0aFBhcnRzW3BhdGhOYW1lXVtrXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGFsbFBhdGhBcnJheS5wdXNoKFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHBhdGhEZWY6cGF0aERlZixcclxuXHRcdFx0XHRcdHBhdGg6cGF0aEFycmF5XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIiNcIitpK1wiIHBhdGhBcnJheSBzaXplPVwiK3BhdGhBcnJheS5sZW5ndGgrXCIgbmFtZT1cIitwYXRoRGVmLnBhdGhEZWZOYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9Db21tb25zaHVmZmxlQXJyYXkoYWxsUGF0aEFycmF5KTtcclxuXHRcdHJldHVybihhbGxQYXRoQXJyYXkpO1xyXG5cdH1cclxuXHRcclxuXHRpbml0Q3VzdG9tTm9kZXMod29ybGQpXHJcblx0e1xyXG5cdFx0dmFyIHBhdGhBcnJheSA9IGdldFBhdGhBcnJheSgpO1xyXG5cdFx0XHJcblx0XHR2YXIgbm93ID0gbmV3IERhdGUoKTtcclxuXHRcdC8vbm93ID0gTWF0aC5mbG9vcihub3cvMTAwMCk7XHJcblx0XHRub3cgPSBub3cvMTAwMDtcclxuXHRcdHZhciBsYXN0VGltZSA9IG5vdztcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpPTA7aTxwYXRoQXJyYXkubGVuZ3RoO2krKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHBkID0gcGF0aEFycmF5W2ldO1xyXG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiU3RhcnQgb2Ygd29ybGRVcGRhdGU6XCIrQ29tbW9udG9TdHJpbmcocGQpKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBzdGFydFNwYWNlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoyMCktMTA7XHJcblx0XHJcblx0XHRcdGZvcih2YXIgaj0wO2o8cGQucGF0aC5sZW5ndGg7aisrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHNwYWNlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoyKSsxO1xyXG5cdFx0XHRcdGxhc3RUaW1lKz0gK3NwYWNlcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiYWRkaW5nIDogcGF0aE5hbWU9XCIrcGQucGF0aERlZi5wYXRoRGVmTmFtZStcIiBqdW5jdGlvbj1cIitwZC5wYXRoW2pdKTtcclxuXHRcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR3b3JsZC5hZGRUb1dvcmxkVXBkYXRlUXVldWUoXHJcblx0XHRcdFx0XHRuZXcgV29ybGRVcGRhdGUoXHJcblx0XHRcdFx0XHRcdFx0cGQucGF0aFtqXSxcclxuXHRcdFx0XHRcdFx0XHRwZC5wYXRoRGVmLnBhdGhEZWZOYW1lK1wiLlwiK2ksXHJcblx0XHRcdFx0XHRcdFx0bGFzdFRpbWUrc3RhcnRTcGFjZXIsXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0d2FrbGVyTmFtZTpwZC5wYXRoRGVmLnBhdGhEZWZOYW1lK1wiLlwiK2ksXHJcblx0XHRcdFx0XHRcdFx0XHR3YWxrZXJUeXBlS2V5OnBkLnBhdGhEZWYucGF0aERlZk5hbWVcclxuXHRcdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGp1bmN0aW9uTmFtZTpwZC5wYXRoW2pdLFxyXG5cdFx0XHRcdFx0XHRcdFx0anVuY3Rpb25UeXBlS2V5OlwiZ2VuZXJpY1wiXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRwYXRoVHlwZUtleTpcImdlbmVyaWNcIlxyXG5cdFx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0c3RhdHVzOlwiSW4gUHJvZ3Jlc3NcIlxyXG5cdFx0XHRcdFx0XHRcdH0pKTsgLy8gMjMtSkFOLTE3IDA2LjM1LjE0IEFNXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHR2YXIgd29ybGREZWZhdWx0cyA9XHJcblx0e1xyXG5cdFx0XHRqdW5jdGlvblJhZGl1c0RlZmF1bHQ6MTUsXHJcblx0XHRcdHdhbGtlclJhZGl1c0RlZmF1bHQ6MTUqMC4zLFxyXG5cdFx0XHRyZWxheGVkRGlzdGFuY2VEZWZhdWx0OjUqMTAsXHJcblx0XHRcdGVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0OjAuMSxcclxuXHR9O1xyXG5cdFxyXG5cdHZhciBwYXRoRGVmcyA9XHJcblx0W1xyXG5cdFx0e1xyXG5cdFx0XHRwYXRoRGVmTmFtZTpcIm5vcm1hbFwiLG51bWJlck5vZGVzOjEwMCxub2RlU2hhcGU6XCJjaXJjbGVcIixub2RlQ29sb3I6XCJmZjAwMDBcIixcclxuXHRcdFx0cGF0aDpbXCJzdGFydFwiLFwibm9ybWFsRW5kXCJdXHJcblx0XHR9LFxyXG5cdFx0e1xyXG5cdFx0XHRwYXRoRGVmTmFtZTpcInR1bW9yRmFpbFJRU3VjY2Vzc1wiLG51bWJlck5vZGVzOjIwLG5vZGVTaGFwZTpcImNpcmNsZVwiLG5vZGVDb2xvcjpcImZmMDAwMFwiLFxyXG5cdFx0XHRwYXRoOltcInN0YXJ0XCIsXCJ0dW1vckZhaWxSZXF1ZXVlXCIsXCJub3JtYWxFbmRcIl1cclxuXHRcdH0sXHJcblx0XHR7XHJcblx0XHRcdHBhdGhEZWZOYW1lOlwicm5hRmFpbFJRU3VjZXNzXCIsbnVtYmVyTm9kZXM6MjAsbm9kZVNoYXBlOlwiY2lyY2xlXCIsbm9kZUNvbG9yOlwiZmYwMDAwXCIsXHJcblx0XHRcdHBhdGg6W1wic3RhcnRcIixcInJuYUZhaWxSZXF1ZXVlXCIsXCJub3JtYWxFbmRcIl1cclxuXHRcdH0sXHJcblx0XHR7XHJcblx0XHRcdHBhdGhEZWZOYW1lOlwidHVtb3JGYWlsQ2FuY2VsXCIsbnVtYmVyTm9kZXM6MjAsbm9kZVNoYXBlOlwiY2lyY2xlXCIsbm9kZUNvbG9yOlwiZmYwMDAwXCIsXHJcblx0XHRcdHBhdGg6W1wic3RhcnRcIixcInR1bW9yRmFpbENTXCJdXHJcblx0XHR9LFxyXG5cdFx0e1xyXG5cdFx0XHRwYXRoRGVmTmFtZTpcInR1bW9yRmFpbENhbmNlbFwiLG51bWJlck5vZGVzOjIwLG5vZGVTaGFwZTpcImNpcmNsZVwiLG5vZGVDb2xvcjpcImZmMDAwMFwiLFxyXG5cdFx0XHRwYXRoOltcInN0YXJ0XCIsXCJybmFGYWlsQ1NcIl1cclxuXHRcdH0sXHJcblx0XTtcclxuXHRcdFxyXG4gICAgdmFyIGp1bmN0aW9uRXhpdHMgPSBcclxuICAgIFtcclxuICAgICAgICB7ZXhpdEp1bmN0aW9uOlwiUmVzdWx0IG1haWxlZC8gU2FtcGxlIHJldHVybmVkXCIsZXhpdEFmdGVyTWlsaVNlY29uZHM6NjAqNjAqMjQqMTAwMH0sXHJcbiAgICBdO1xyXG5cdFxyXG5cdHZhciB3b3JsZERpc3BsYXkgPVxyXG5cdHtcdFxyXG5cdFx0anVuY3Rpb25SYWRpdXNEZWZhdWx0OndvcmxkRGVmYXVsdHMuanVuY3Rpb25SYWRpdXNEZWZhdWx0LFxyXG5cdFx0d2Fsa2VyUmFkaXVzRGVmYXVsdDp3b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQsXHJcblx0XHRyZWxheGVkRGlzdGFuY2VEZWZhdWx0OndvcmxkRGVmYXVsdHMucmVsYXhlZERpc3RhbmNlRGVmYXVsdCxcclxuXHRcdGVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0OndvcmxkRGVmYXVsdHMuZWxhc3RpY2l0eUZhY3RvckRlZnVhbHQsXHJcblx0XHRcclxuXHRcdGp1bmN0aW9uU3BhY2VyOm5ldyBHcm91cENvbm5lY3RvcihuZXcgQ29ubmVjdG9yRGlzcGxheUVtcHR5KCksbnVsbCxudWxsLFxyXG5cdFx0XHRcdHdvcmxkRGVmYXVsdHMucmVsYXhlZERpc3RhbmNlRGVmYXVsdCoyLjUsd29ybGREZWZhdWx0cy5lbGFzdGljaXR5RmFjdG9yRGVmdWFsdCksXHJcblx0XHR3b3JsZFdhbGw6bmV3IFdhbGxDb25uZWN0b3IobmV3IENvbm5lY3RvckRpc3BsYXlFbXB0eSgpLG51bGwsbnVsbCxcclxuXHRcdFx0XHR3b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQqMC43NSwxLXdvcmxkRGVmYXVsdHMuZWxhc3RpY2l0eUZhY3RvckRlZnVhbHQpLFxyXG5cdFx0XHJcblx0ICAgIHdvcmxkQmFja2dyb3VuZENvbG9yOlwiZTBlMGYwZmZcIixcclxuXHRcclxuXHRcdHBhdGhUeXBlczpcclxuXHRcdHtcclxuXHRcdFx0Z2VuZXJpYzpcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNvbm5lY3RvckRpc3BsYXk6IG5ldyBKdW5jdGlvbkNvbm5lY3RvcihcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsaW5lQ29sb3I6XCIwMDAwYTBmZlwiLGxpbmVXaWR0aDo1XHJcblx0XHRcdFx0fSksXHRcdFx0XHRcdFxyXG5cdFx0XHR9LFxyXG5cdFx0fSxcclxuXHRcdGp1bmN0aW9uVHlwZXM6XHJcblx0XHR7XHJcblx0XHRcdFwiZ2VuZXJpY1wiOlxyXG5cdFx0XHR7XHRcdFx0XHJcblx0XHRcdFx0aW5pdEdyYXBoRGF0YTpJbmFHcmFwaFBhdGhXb3JsZERlZi5pbml0SnVuY3Rpb25EaXNwbGF5LFxyXG5cdFx0XHR9LFxyXG5cdFx0fSxcclxuXHRcdHRlbGVwb3J0UGF0aHM6XHJcblx0XHRbXHJcblx0XHRcdC8vIFRlbGVwb3J0IFBhdGghIG5hbWU9UmVxdWV1ZSB0byBNUyBzdGFydD1EVDEgZW5kPU1TL0luIFByb2dyZXNzXHJcblx0XHRcdHt0ZWxlcG9ydE5hbWU6XCJSZXF1ZXVlIHRvIE1TL0luIFByb2dyZXNzXCIsc3RhcnRKdW5jdGlvbjpcIl4oKD8hRFQxfE1TLip8U2lnbmluZykuKSokXCIsZW5kSnVuY3Rpb246XCJNUy9JbiBQcm9ncmVzc1wifSxcclxuXHRcdFx0e3RlbGVwb3J0TmFtZTpcIlJlcXVldWUgdG8gTVNcIixzdGFydEp1bmN0aW9uOlwiXigoPyFEVDF8TVMuKnxTaWduaW5nKS4pKiRcIixlbmRKdW5jdGlvbjpcIk1TXCJ9LFxyXG5cdFx0XHR7dGVsZXBvcnROYW1lOlwiUmVxdWV1ZSB0byBEVDFcIixzdGFydEp1bmN0aW9uOlwiXigoPyFDU3xNUy4qKS4pKiRcIixlbmRKdW5jdGlvbjpcIkRUMVwifSxcclxuXHRcdFx0e3RlbGVwb3J0TmFtZTpcIlJlcXVldWUgdG8gTVJQLVBhY2thZ2luZ1wiLHN0YXJ0SnVuY3Rpb246XCJeKCg/IVNpZ25pbmd8Q2FuY2xlZCkuKSokXCIsZW5kSnVuY3Rpb246XCJNUlAtUGFja2FnaW5nXCJ9LFxyXG5cdFx0XHR7dGVsZXBvcnROYW1lOlwiUmVxdWV1ZSB0byBTaWduaW5nXCIsc3RhcnRKdW5jdGlvbjpcIl4oKD8hTVN8UGFja2FnaW5nfE1SUC1QYWNrYWdpbmcpLikqJFwiLGVuZEp1bmN0aW9uOlwiU2lnbmluZ1wifSxcclxuXHRcdFx0e3RlbGVwb3J0TmFtZTpcIlRlc3QgY2FuY2VsZWRcIixzdGFydEp1bmN0aW9uOlwiXigoPyFDYW5jZWxlZHwuKlBhY2thZ2luZy4qKS4pKiRcIixlbmRKdW5jdGlvbjpcIkNhbmNlbGVkXCJ9LFx0XHJcblx0XHRdLFxyXG5cdFx0ZW5kUG9pbnRNb2RzOlxyXG5cdFx0W1xyXG5cdFx0XHR7ZW5kUG9pbnRNb2ROYW1lOlwiTVJQLVRlc3QgUmVwb3J0ZWRcIixzdGFydEp1bmN0aW9uOlwiTVJQLVBhY2thZ2luZ1wiLGVuZEp1bmN0aW9uOlwiVGVzdCBSZXBvcnRlZFwifSxcdFx0XHJcblx0XHRcdC8ve2VuZFBvaW50TW9kTmFtZTpcIk5FVy1UZXN0IFJlcG9ydGVkXCIsc3RhcnRKdW5jdGlvbjpcIi4qXCIsZW5kSnVuY3Rpb246XCJUZXN0IFJlcG9ydGVkXCJ9LFx0XHRcclxuXHRcdF0sXHJcblx0XHJcblx0XHR3YWxrZXJEaXNwbGF5VHlwZXM6XHJcblx0XHR7XHJcblx0XHRcdGdlbmVyaWM6XHJcblx0XHRcdHtcclxuXHRcclxuXHRcdFx0XHRub2RlRGlzcGxheTpuZXcgVHJpYW5nbGVEaXNwbGF5KFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiZmZmZmZmZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXHJcblx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcclxuXHRcdFx0XHRcdFx0XHRyYWRpdXM6d29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUsXHJcblx0XHRcdFx0XHRcdFx0d2lkdGg6KHdvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxyXG5cdFx0XHRcdFx0XHRcdGhlaWdodDood29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXHJcblx0XHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6anVuY3Rpb25FeGl0cyxcclxuXHRcdFx0fSxcclxuXHRcdFx0dHVtb3JGYWlsUlFTdWNjZXNzOlxyXG5cdFx0XHR7XHJcblx0XHJcblx0XHRcdFx0bm9kZURpc3BsYXk6bmV3IFRyaWFuZ2xlRGlzcGxheShcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcIkZGQTUwMGZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjIwZmYyMGZmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxyXG5cdFx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXHJcblx0XHRcdFx0XHRcdFx0Ly9yYWRpdXM6d2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1LFxyXG5cdFx0XHRcdFx0XHRcdHdpZHRoOih3b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcclxuXHRcdFx0XHRcdFx0XHRoZWlnaHQ6KHdvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxyXG5cdFx0XHRcdFx0XHR9KSxcclxuXHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOmp1bmN0aW9uRXhpdHMsXHJcblx0XHRcdH0sXHJcblx0XHRcdG5vcm1hbDpcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBSZWN0YW5nbGVEaXNwbGF5KFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiZmYyMDIwZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXHJcblx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcclxuXHRcdFx0XHRcdFx0XHR3aWR0aDood29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXHJcblx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih3b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6anVuY3Rpb25FeGl0cyxcclxuXHRcdFx0fSxcclxuXHRcdFx0cm5hRmFpbFJRU3VjZXNzOlxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bm9kZURpc3BsYXk6bmV3IENpcmNsZURpc3BsYXkoXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRmaWxsQ29sb3I6XCIwMEE1RkZmZlwiLGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcclxuXHRcdFx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCIyMGZmMjBmZlwiLHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcclxuXHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxyXG5cdFx0XHRcdFx0XHRcdHJhZGl1czp3b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSxcclxuXHRcdFx0XHRcdFx0XHR3aWR0aDood29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXHJcblx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih3b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6anVuY3Rpb25FeGl0cyxcdFx0XHJcblx0XHRcdH0sXHJcblx0XHRcdHR1bW9yRmFpbENhbmNlbDpcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBDaXJjbGVEaXNwbGF5KFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiQTVGRjAwZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXHJcblx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcclxuXHRcdFx0XHRcdFx0XHRyYWRpdXM6d29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUsXHJcblx0XHRcdFx0XHRcdFx0d2lkdGg6KHdvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxyXG5cdFx0XHRcdFx0XHRcdGhlaWdodDood29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXHJcblx0XHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6anVuY3Rpb25FeGl0cyxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0fTtcclxuXHRcclxuXHR2YXIgcGF0aFBhcnRzID1cclxuXHR7XHJcblx0XHRzdGFydDpbXCJBY2Nlc3Npb25pbmdcIixcIkFuYXRvbWljIHBhdGhvbG9neSBsYWJcIl0sXHJcblx0XHRub3JtYWxFbmQ6W1wiUk5BIGxhYlwiLFwiTWVkaWNhbCBzZXJ2aWNlc1wiLFwiTGFiIGRpcmVjdG9yIHNpZ24gb2ZmXCIsXCJSZXBvcnRpbmdcIixcIlJlc3VsdCBtYWlsZWQvIFNhbXBsZSByZXR1cm5lZFwiXSxcclxuXHRcdHR1bW9yRmFpbFJlcXVldWU6W1wiSW5zdWZmaWNpZW50IHR1bW9yXCIsXCJDYW5jZWxlZFwiLFwiUmVwb3J0aW5nXCIsXCJFeHRyYSBUaXN1ZVwiLFwiWUVTIHJlcXVldWVcIl0sXHJcblx0XHR0dW1vckZhaWxDUzpbXCJJbnN1ZmZpY2llbnQgdHVtb3JcIixcIkNhbmNlbGVkXCIsXCJSZXBvcnRpbmdcIixcIkV4dHJhIFRpc3VlXCIsXCJOTyBjYW5jZWwgc2FtcGxlXCIsXCJDdXN0b21lciBTZXJ2aWNlXCJdLFxyXG5cdFx0cm5hRmFpbFJlcXVldWU6W1wiSW5zdWZmaWNpZW50IFJOQVwiLFwiQ2FuY2VsZWRcIixcIlJlcG9ydGluZ1wiLFwiRXh0cmEgVGlzdWVcIixcIllFUyByZXF1ZXVlXCJdLFxyXG5cdFx0cm5hRmFpbENTOltcIkluc3VmZmljaWVudCBSTkFcIixcIkNhbmNlbGVkXCIsXCJSZXBvcnRpbmdcIixcIkV4dHJhIFRpc3VlXCIsXCJOTyBob2xkXCIsXCJDdXN0b21lciBTZXJ2aWNlXCJdLFxyXG5cdH07XHJcbi8vfVxyXG5cclxuLy88anMybm9kZT5cclxubW9kdWxlLmV4cG9ydHMgPSBJbmFHcmFwaFBhdGhXb3JsZERlZjtcclxuY29uc29sZS5sb2coXCJJbmFHcmFwaFBhdGhXb3JsZERlZlwiKTtcclxuLy88L2pzMm5vZGU+Il19
