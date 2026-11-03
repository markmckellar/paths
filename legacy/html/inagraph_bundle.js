(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PathClient = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	
	static getTimeKey()
	{
		var uid = (new Date().getTime()).toString(36);
		return(uid);
	}

	static  jsonToURI(json){ return encodeURIComponent(JSON.stringify(json)); }

	static uriToJSON(urijson){ return JSON.parse(decodeURIComponent(urijson)); }

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
var Common = require('../../common/common');
var Position = require('../../nodes/position/position');


class Connector
{
	constructor(connectorFunction,connectorDisplay,name)
	{
		this.nodes = new Array();
		this.connectorFunction = connectorFunction;	
		this.connectorDisplay = connectorDisplay;	
		this.name = name;
		this.connectorKey = name+"#"+Common.getTimeKey();
		if(!name) console.trace("Connector passed in empty name");
	}
	
	getConnectorKey()
	{
		return(this.connectorKey);
	}

	getClientJson()
	{
		var json = {};
		json.connectorKey = this.getConnectorKey();
		json.connectorDisplay = this.connectorDisplay;
		json.connectorDefKey = this.connectorDefKey;
		json.nodes = new Array();
		for(var i=0;i<this.nodes.list;i++)
		{
			json.nodes.push(this.nodes[i].getNodeKey());
		}
		return(json);
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

},{"../../common/common":1,"../../nodes/position/position":21}],3:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class GroupConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(GroupConnector.processGroupSpringConnectorOneNodeToConnectedNodes,connectorDisplay,name);

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}
	
	static processGroupSpringConnectorOneNodeToConnectedNodes(connector,node,timestamp)
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

},{"../../common/common":1,"../../nodes/connector/connector":2,"../../nodes/position/position":21}],4:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class ShapeConnector extends Connector
{
	constructor(node,connectorDisplay,shape,anchorOffsetPoint,relaxedDistance,elasticityFactor,outsideRelaxedDistance,outsideElasticityFactor,name)
	{
		super(ShapeConnector.processShapeConnectorOneNodeToConnectedNodes,connectorDisplay,name);

		this.node = node;
		this.springAnchorPoint = node.position;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
		this.outsideRelaxedDistance = outsideRelaxedDistance;
		this.outsideElasticityFactor = outsideElasticityFactor;
		this.shape = shape;
	}
	
	static processShapeConnectorOneNodeToConnectedNodes(connector,node,timestamp)
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

},{"../../common/common":1,"../../nodes/connector/connector":2,"../../nodes/position/position":21}],5:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class SpringConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(SpringConnector.processSpringConnectorOneBeastieToConnectedNodes,connectorDisplay,name);
		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}

	static processSpringConnectorOneBeastieToConnectedNodes(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		////////////////////////var positionList = new Array();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,1.0);
	}
}

//<js2node>
module.exports = SpringConnector;
console.log("Loading:SpringConnector");
//</js2node>

},{"../../common/common":1,"../../nodes/connector/connector":2,"../../nodes/position/position":21}],6:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class  WallConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		//super(WallConnector.prototype.processWallSpringRepulseOneNode,connectorDisplay);
		super(WallConnector.processWallSpringRepulseOneNode,connectorDisplay,name);

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}

	static processWallSpringRepulseOneNode(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		if((node.position.getX()-node.width/2)<0)
		{
			node.position.setX(0+node.width/2);
		}
		if((node.position.getX()+node.width/2)>node.canvasHolder.getWidth())
		{
			node.position.setX(node.canvasHolder.getWidth()-node.width/2);	
		}
		if((node.position.getY()-node.height/2)<0)
		{
			node.position.setY(0+node.height/2);
		}
		if((node.position.getY()+node.height/2)>node.canvasHolder.getHeight())
		{
			node.position.setY(node.canvasHolder.getHeight()-node.height/2);
		}
		
		connector.calulateMovement(node,positionList,0);
	}
}

//<js2node>
module.exports = WallConnector;
console.log("Loading:WallConnector");
//</js2node>

},{"../../common/common":1,"../../nodes/connector/connector":2,"../../nodes/position/position":21}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"../../nodes/connectordisplay/connectordisplay":7}],9:[function(require,module,exports){
var Position = require('../nodes/position/position');
var CanvasHolder= require('../nodes/nodecanvas/canvasholder');
var Common = require('../common/common');

class Node
{
  constructor(name,position,canvasHolder,graphDataKey,infoData)
  {
		this.name = name;
		this.canvasHolder = canvasHolder;
		this.position = position;
		this.graphDataKey = graphDataKey;
		this.graphData = this.canvasHolder.getGraphData(this.graphDataKey);
		if(infoData==null)
		{
			console.log("info data was null : "+this.name);
			infoData = {};
		}
		else
		{
			
			//console.log("info data passed in for  : "+this.name +" infoData="+Common.toString(infoData));
			//console.log("info data passed in for  : "+this.name);
		}
		this.infoData = infoData;
		
		this.nodes = new Array();
		this.nodeMap = {};
		this.positionMoveList = new Array();
		this.connectors = new Array();
		this.isAnimated = true;
		this.isSelected = false;
		this.layer=0;

		
		//if(!this.infoData.nodeKey)
		if(!this.infoData.hasOwnProperty("nodeKey"))
		{
			console.log("making new nodeKey for : "+this.name);
			this.infoData.nodeKey =
			{
					key:Common.getTimeKey(),
					nodeId:"root",
			}
		}
		this.infoData.nodeKey.parentNodeKey = function(){return("");};
		
		this.connectorPosition = new Position(0,0);

		if(this.graphData.initGraphData!=null) this.graphData.initGraphData(this);		
  }

  
  getClientJson()
  {
	  var json = this.getNodeJson({});
	  
	  json.nodeTree = this.getClientJsonNodeTree();
	  
	  json.nodeMap = {};
	  var allNodesArray = this.getAllNodesArray(new Array());
	  for(var i=0;i<allNodesArray.length;i++)
	  {
		  var node = allNodesArray[i];
		  json.nodeMap[node.getNodeKey()] = node.getNodeJson({});
	  }
	  
	  json.connectorMap = {};
	  var allConnectorsArray = this.getAllConnectorsArray(new Array());	  
	  for(var i=0;i<allConnectorsArray.length;i++)
	  {
		  var connector = allConnectorsArray[i];
		  json.connectorMap[connector.getConnectorKey()] = connector.getClientJson({});
	  }

	  JSON.stringify(json);
	  return(json)
  }
  
  getNodeJson(json)
  {
	  json.name = this.name;
	  json.graphDataKey = this.graphDataKey;
	  json.infoData = this.infoData;
	  //json.infoData.nodeKey = this.getNodeKey();
	  json.position = this.position.getClientJson();
	  json.connectors = new Array();
	  for(var i=0;i<this.connectors.length;i++) json.connectors.push(this.connectors[i].getConnectorKey());

	  return(json);
  }
  
  getAllNodesArray(arrayOfNodes)
  {
	  for(var i=0;i<this.nodes.length;i++)
	  {
		  var node = this.nodes[i];
		  arrayOfNodes.push(node);
		  node.getAllNodesArray(arrayOfNodes);
	  }
	  return(arrayOfNodes);
  }
  
  getAllConnectorsArray(arrayOfConnectors)
  {
	  for(var i=0;i<this.nodes.length;i++)
	  {
		  var node = this.nodes[i];
		  for(var j=0;j<node.connectors.length;j++)
		  {
			  var connector = node.connectors[j];
			  arrayOfConnectors.push(connector);
		  }
		  node.getAllConnectorsArray(arrayOfConnectors);
	  }
	  return(arrayOfConnectors);
  }
  
    
  getClientJsonNodeTree()
  {
	  var json = {};
	  json.nodeKey = this.getNodeKey();

	  json.nodes = new Array();
	  for(var i=0;i<this.nodes.length;i++)
	  {
		  json.nodes.push(this.nodes[i].getClientJsonNodeTree());	  
	  }
	  JSON.stringify(json);
	  return(json)
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
      
      if(this.canvasHolder.isDrawable())
      {
    	  this.drawConnectors(); 
    	  this.drawNodes();
      }
      if(this.extraAnimation!=null) this.extraAnimation(timestamp);
      
      this.draw();
      this.debugFunction();
  }


	getNodeUiDisplay(node)
	{
		return(this.name);
	}
	
	getNodeKey()
	{
   	    //console.log("Node:getNodeKey:START:name="+this.name);
   	    //console.log("Node:getNodeKey:START:infoData="+Common.toString(this.infoData));

		//if(!this.nodeKey) console.log("XXXXXXXXXXX:"+this.name);
   	    //var key = this.nodeKey.parentNodeKey()+":"+this.nodeKey.nodeId+":"+this.nodeKey.ts.getTime();
   	    //console.log(".....getNodeKey:END:name="+this.name);
   	    var key = this.infoData.nodeKey.parentNodeKey()+":"+this.infoData.nodeKey.nodeId+"_"+this.infoData.nodeKey.key;
		return(key);
		
	}
	/*
	 * 		this.nodeKey = 
			{
				ts:new Date(),
				parentNodeKey:function(){return("root");},
				nodeId:-1,
			}
	 */
	
	doesNodeExist(nodeKey)
	{
		return( this.nodeMap.hasOwnProperty(nodeKey) );
	}
	
	getNode(nodeKey)
	{
		if(!this.doesNodeExist(nodeKey))
		{
			Object.keys(this.nodeMap).forEach(function (key)
					{
						console.log("key="+key)
					});
			throw "nodeKey does not exist : '"+nodeKey+"'";
		}
		return(this.nodeMap[nodeKey]);
	}
	
	getNodeListFromMap()
	{
		var nodeList = new Array();
		Object.keys(this.nodeMap).forEach(function (key)
		{
			nodeList.push(nodeMap[key]);
		});
		return(nodeList);
	}
	
	addNode(node)
	{
		this.nodes.push(node);
   	    //console.log("Node:addNode:parent.name="+this.name+ " toAdd.name="+node.name);
   	    //console.log(".....addNode:parent.name="+this.name+ " getNodeKey()="+this.getNodeKey());
		
		if(node.infoData.nodeKey.nodeId=="root") node.infoData.nodeKey.nodeId = this.nodes.length;
		var self = this;
		node.infoData.nodeKey.parentNodeKey = function(){ return(self.getNodeKey()); };
		
		//console.log(Common.toString(this.canvasHolder));

		node.canvasHolder = this.canvasHolder.clone(node.position);
		//console.log("addNode node.canvasHolder:"+CommontoString(node.canvasHolder));
		this.nodes.sort(function(a, b) {
	  	  return(a.layer-b.layer);
	  	});	
		
		this.nodeMap[node.getNodeKey()] = node;
   	    //console.log(".....addNode:ADDED:parent.name="+this.name+ " added.name="+node.name);
   	    //console.log(".....addNode:ADDED:parent.name="+this.name+ " getNodeKey()="+this.getNodeKey());

	}
	
	removeNode(node)
	{
		Common.removeItemFromArray(this.nodes,node);
		delete this.nodeMap[node.getNodeKey()];

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
		
		var newX = newPosition.getX() / this.positionMoveList.length;
		var newY = newPosition.getY() / this.positionMoveList.length;
		
		this.position.setX(newX);
		this.position.setY(newY);		
	}

}

//<js2node>
module.exports = Node;
console.log("Loading:Node");
//</js2node>

},{"../common/common":1,"../nodes/nodecanvas/canvasholder":11,"../nodes/position/position":21}],10:[function(require,module,exports){
class CanvasDef
{
	constructor()
	{		
	}
	
	getWorldDispaly()
	{
		throw "CanvasDef.getWorldDispaly not defined";
	}
	
	getWorldDefaults()
	{
		throw "CanvasDef.getWorldDefaults not defined";
	}
}

//<js2node>
module.exports = CanvasDef;
console.log("Loading:CanvasDef");
//</js2node>

},{}],11:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var Common = require('../../common/common');

class CanvasHolder
{
	constructor(canvasName,worldDef)
	{
		this.canvasName = canvasName;
		this.worldDef = worldDef;		
		this.origin = new Position(0,0);
		this.init(canvasName,worldDef);
	}
	
	init(canvasName,worldDef)
	{
		this.isCanvasVisable = true;
		this.isCanvasDrawable = true;
		this.canvas = document.getElementById(this.canvasName);			
		this.context = this.canvas.getContext('2d');
		/*if (typeof document !== 'undefined')
		{
			this.canvas = document.getElementById(this.canvasName);			
			this.context = this.canvas.getContext('2d');
		}*/
	}
	
	static createCanvasHolderFromClientJson(worldDef,json)
	{
	  var canvasHolder = new CanvasHolder(json.canavsName,worldDef);
	  return(canvasHolder);
	}
	  getClientJson()
	  {
		  var json = {};
		  
		  
		  json.canvasName = this.canvasName;
		  json.origin = this.origin;
		  json.width = this.getWidth();
		  json.height = this.getHeight();
		  json.worldDef = this.worldDef;
		  
		  JSON.stringify(json);
		  return(json)
	  }
	
	getConnector(connectorDefKey,name)
	{
		var connector = this.getConnectorDef(connectorDefKey)(this.worldDef,name);
		connector.connectorDefKey = connectorDefKey;
		return(connector);
	}
	
	getConnectorDef(connectorDefKey)
	{
		var connectorDef = this.worldDef.worldDisplay.connectorDefs["generic"];
		
		var foundConnectorDef = false;
		if(this.worldDef.worldDisplay.connectorDefs.hasOwnProperty(connectorDefKey))
		{
			connectorDef = this.worldDef.worldDisplay.connectorDefs[connectorDefKey];
			foundConnectorDef = true;
		}
		if(!foundConnectorDef) console.trace("CanvasHolder:getConnectorDef:connectorDefKey=\""+connectorDefKey+ "\" was not found using generic");
		connectorDef.connectorDefKey = connectorDefKey;
		return(connectorDef);
	}
	
	getConnectorDisplay(connectorDisplayKey)
	{
		var connectorDisplay = this.worldDef.worldDisplay.connectorDisplay["generic"];
		
		var foundConnectorDisplay = false;
		if(this.worldDef.worldDisplay.connectorDisplay.hasOwnProperty(connectorDisplayKey))
		{
			connectorDisplay = this.worldDef.worldDisplay.connectorDisplay[connectorDisplayKey];
			foundConnectorDisplay = true;
		}
		if(!foundConnectorDisplay) console.trace("CanvasHolder:getConnectorDisplay:connectorDisplayKey=\""+connectorDisplayKey+ "\" was not found using generic");
		connectorDisplay.connectorDisplayKey = connectorDisplayKey;
		return(connectorDisplay);
	}
	
	getGraphData(graphDataKey)
	{
		var graphData = this.worldDef.worldDisplay.nodeDisplay["generic"];	
		var foundGraphData = false;
		if(this.worldDef.worldDisplay.nodeDisplay.hasOwnProperty(graphDataKey))
		{
			graphData = this.worldDef.worldDisplay.nodeDisplay[graphDataKey];
			foundGraphData = true;
		}
		if(!foundGraphData) console.trace("CanvasHolder:getGraphData:graphDataKey=\""+graphDataKey+ "\" was not found using generic")
		//console.trace("CanvasHolder:getGraphData:graphDataKey=\""+graphDataKey+ "\" was not found using generic")
		//console.log("FOR:"+graphDataKey+Common.toString(graphData));
		//console.log("getGraphData:graphDataKey="+graphDataKey+":clone="+graphData.nodeDisplay.displayInfo.clone);

		//if(graphData.nodeDisplay.displayInfo.clone)
		if(graphData.nodeDisplayFunction)
		{
			//console.log("getGraphData:graphDataKey:FOUND A FUNCTION:"+graphDataKey);
			graphData = Object.create(graphData);
			graphData.nodeDisplay = graphData.nodeDisplayFunction();
			//console.log("CLONING:"+graphDataKey+Common.toString(graphData));
			//graphData.nodeDisplay.displayInfo = Object.create(graphData.nodeDisplay.displayInfo);
			//graphData.nodeDisplay.displayInfo  = JSON.parse(JSON.stringify(graphData.nodeDisplay.displayInfo));
			//graphData.nodeDisplay.displayInfo  = JSON.parse(JSON.stringify(graphData.nodeDisplay.displayInfo));
			//graphData = Object.create(graphData);
			//graphData.nodeDisplay.displayInfo.ts = new Date().getTime();


		}

		graphData.graphDataKey = graphDataKey;
		return(graphData);
	}
	
	clone(origin)
	{
		var canvasHolder = new CanvasHolder(this.canvasName,this.worldDef);
		canvasHolder.origin = origin;
		/*
		var canvasHolder = new Object();
		canvasHolder.origin = origin;
		
		canvasHolder.canvasName = this.canvasName;
		canvasHolder.canvas = this.canvas;
		canvasHolder.context = this.context;
		canvasHolder.isCanvasVisable = this.isCanvasVisable;
		canvasHolder.isCanvasDrawable = this.isCanvasDrawable;
		canvasHolder.isDrawable = this.isDrawable;
		canvasHolder.isVisable = this.isVisable;
		canvasHolder.getWidth = this.getWidth;
		canvasHolder.getHeight = this.getHeight;
		canvasHolder.worldDef = this.worldDef;
		canvasHolder.getGraphData = this.getGraphData;
		*/
		
		return(canvasHolder);
	}
	
	isDrawable()
	{
		return(this.isCanvasDrawable);
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

},{"../../common/common":1,"../../nodes/position/position":21}],12:[function(require,module,exports){
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var Common = require('../../common/common');


class CanvasHolderVirtual extends CanvasHolder
{
	constructor(canvasName,worldDef,width,height,origin)
	{
		super(canvasName,worldDef);
		this.width = width;
		this.height = height;
	}
	
	init(canvasName,worldDef)
	{
		this.canvas = null;
		this.context = null;
		this.isCanvasVisable = false;
		this.isCanvasDrawable = false;
	}

	clone(origin)
	{
		var canvasHolder = new CanvasHolderVirtual(this.canvasName,this.worldDef,this.width,this.height,origin);
		return(canvasHolder);
	}

	getWidth()
	{
		return(this.width);
	}

	getHeight()
	{
		return(this.height);
	}
}
//<js2node>
module.exports = CanvasHolderVirtual;
console.log("Loading:CanvasHolderVirtual");
//</js2node>

},{"../../common/common":1,"../../nodes/nodecanvas/canvasholder":11}],13:[function(require,module,exports){
class MouseStatus
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
module.exports = MouseStatus;
console.log("Loading:MouseStatus");
//</js2node>

},{}],14:[function(require,module,exports){
var Position = require('../position/position');
var Node = require('../node');
var Common = require('../../common/common');

class NodeCanvas extends Node
{
	  constructor(canvasHolder)
	  {
		  super(	canvasHolder.canvasName,
					new Position(0,0),
					canvasHolder,
					"generic",
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
			nodeCanvas.timeFactor = 1;
			nodeCanvas.worldUpdateQueueProcessed = new Array();

		}
	  
	  getWorldUpdatesProcessed(timeStamp,maxItems)
		{
			var worldUpdateArray = new Array();
			var first = null;
			for(var i=0;i<this.worldUpdateQueueProcessed.length &&
				worldUpdateArray.length<maxItems;i++)
			{
				var worldUpdate = this.worldUpdateQueueProcessed[i];

				if(worldUpdate.processTimestamp>timeStamp) 
				{
					worldUpdateArray.push(worldUpdate);
					/*
					console.log("      getWorldUpdatesProcessed"+
							":worldUpdate.processTimestamp="+worldUpdate.processTimestamp+
							":readyToBeProcessed="+worldUpdate.readyToBeProcessed(timeStamp)+
							":timeStamp="+timeStamp);
					*/
				}
			}
			/*
			console.log("getWorldUpdatesProcessed"+
					":timeStamp="+timeStamp+
					":maxItems="+maxItems+
					":found="+worldUpdateArray.length);
					*/
			return(worldUpdateArray);
		}
	
	  getWorldClientJson()
	  {
		  var json = {};
		  
		  json.nodeGraph = super.getClientJson();
		  json.canvasHolder = this.canvasHolder.getClientJson();
		  JSON.stringify(json);
		  return(json)
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
		if(this.canvasHolder.isDrawable())
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
		if(this.isVisable() && this.canvasHolder.isDrawable())
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

},{"../../common/common":1,"../node":9,"../position/position":21}],15:[function(require,module,exports){
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

},{"../../common/common":1,"../../nodes/nodecanvas/mousestatus":13,"../../nodes/position/position":21}],16:[function(require,module,exports){
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

},{"../../common/common":1,"../../nodes/nodedisplay/nodedisplay":18,"../../nodes/position/position":21,"../../nodes/shapes/shape":23}],17:[function(require,module,exports){
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

},{"../../common/common":1,"../../nodes/nodedisplay/nodedisplay":18,"../../nodes/position/position":21}],18:[function(require,module,exports){
var Common = require('../../common/common');
var Position = require('../../nodes/position/position');

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
	
	drawNode(canvasHolder,node)
	{
		this.drawPosition = new Position(
				Math.round(node.position.x),
				Math.round(node.position.y)
				);
	}
	
	containsPosition(postion,node)
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

},{"../../common/common":1,"../../nodes/position/position":21}],19:[function(require,module,exports){
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

},{"../../common/common":1,"../../nodes/nodedisplay/nodedisplay":18,"../../nodes/position/position":21}],20:[function(require,module,exports){
var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');
var Shape = require('../../nodes/shapes/shape');

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
module.exports = TriangleDisplay;
console.log("Loading:TriangleDisplay");
//</js2node>

},{"../../common/common":1,"../../nodes/nodedisplay/nodedisplay":18,"../../nodes/position/position":21,"../../nodes/shapes/shape":23}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"../../common/common":1,"../../nodes/position/position":21,"../../nodes/shapes/boundingbox":22}],24:[function(require,module,exports){
var Node = require('../nodes/node');
var Position = require('../nodes/position/position');
var Common = require('../common/common');
var ConnectorDisplayEmpty = require('../nodes/connectordisplay/connectordisplayempty');
var ShapeConnector = require('../nodes/connector/shapeconnector');
var ArcDisplayShape = require('../nodes/nodedisplay/arcdisplayshape');


class Junction extends Node
{
	constructor(name,position,canvasHolder,shapeList,graphDataKey,infoData,world)
	{
		super(name,position,canvasHolder,graphDataKey,infoData);
		this.pathArray = new Array();
		this.walkerObject = new Object();
		this.walkerTypeConnections = new Object();
		this.layer=1;
		this.world = world;
	}

	getClientJson()
	{
		var json = super.getClientJson();
		json.pathWorldTye = "junction";
		
		
		var walkerList = this.getWalkerArray();
		json.walkerList = new Array();
		
		for(var i=0;i<walkerList.length;i++)
		{
			json.walkerList.push(walkerList[i].getNodeKey());
		}
		
		return(json);
	}
	
	getCreateWalkerTypeConnection(walkerType)
	{
		if(!this.walkerTypeConnections.hasOwnProperty(walkerType))
		{
			var walkerGraphData = this.canvasHolder.getGraphData(walkerType);
			/***
			this.world.worldDisplay.walkerDisplayTypes["generic"];
			if(this.world.worldDisplay.walkerDisplayTypes.hasOwnProperty(walkerType))
			{
				walkerGraphData = this.world.worldDisplay.walkerDisplayTypes[walkerType];
			}*/
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
			var shapeNode = new Node(
						"shapeNode for "+this.name+" "+walkerType,
						this.position,
						this.canvasHolder,
						"junctionPieSlice",
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
					0.95,
					this.name+":"+walkerType+":"+shapeNode.name);
			this.walkerTypeConnections[walkerType].shapeNode = shapeNode;
			//this.nodes.push(shapeNode);
						
			this.addNode(shapeNode);
			this.shapeNode = shapeNode;
			//console.log("getCreateWalkerTypeConnection:GOT NEW:walker="+this.name+":walkerType="+walkerType+":ts="+shapeNode.graphData.nodeDisplay.displayInfo.ts);
			
		}
		var connection = this.walkerTypeConnections[walkerType];
		//console.log("getCreateWalkerTypeConnection:walker="+this.name+":walkerType="+walkerType+":ts="+connection.shapeNode.graphData.nodeDisplay.displayInfo.ts);
		
		return(connection);
	}
	
	getNodeUiDisplay(node)
	{
		return(
				"<ul>"+
				"<li> name : "+this.name+"</li>"+
				"<li> nodeKey.ts : "+this.infoData.nodeKey.key+"</li>"+
				"<li> nodeKey.nodeId : "+this.infoData.nodeKey.nodeId+"</li>"+
				"</ul>");
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
			
			var graphData = this.canvasHolder.getGraphData(walkerType);
			/*
			console.log("walkerType="+walkerType+
					":connector.nodes.length:"+connector.nodes.length+
					":percentOfWalkers:"+percentOfWalkers+
					":walkerAngle:"+walkerAngle+
					"graphData="+Common.toString(graphData)+
					"");
	*/
			//console.log(walkerType+":before:"+CommontoString(connector.shapeNode.graphData.nodeDisplay));
			//console.log("walker="+this.name+":walkerType="+walkerType+":ts="+connector.shapeNode.graphData.nodeDisplay.displayInfo.ts);
			
			connector.shapeNode.graphData.nodeDisplay.displayInfo.startAngle = angle;
			angle += walkerAngle;
			connector.shapeNode.graphData.nodeDisplay.displayInfo.endAngle = angle;
			connector.shapeNode.graphData.nodeDisplay.displayInfo.radius = radius;
			
			connector.shapeNode.graphData.nodeDisplay.displayInfo.fillColor = graphData.nodeDisplay.displayInfo.fillColor;
			//if(connector.shapeNode.graphData.nodeDisplay.displayInfo.fillColor)
			//connector.shapeNode.graphData.nodeDisplay.displayInfo.fillColor = 
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
		var connection = this.getCreateWalkerTypeConnection(walker.graphDataKey)
		//var connection = this.getCreateWalkerTypeConnection(walker.infoData.walkerTypeKey)
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

},{"../common/common":1,"../nodes/connector/shapeconnector":4,"../nodes/connectordisplay/connectordisplayempty":8,"../nodes/node":9,"../nodes/nodedisplay/arcdisplayshape":16,"../nodes/position/position":21}],25:[function(require,module,exports){
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
		super.drawConnector(canvasHolder,connector,node);

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

},{"../../common/common":1,"../../nodes/connectordisplay/connectordisplay":7,"../../nodes/nodedisplay/nodedisplay":18}],26:[function(require,module,exports){
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
		//console.log("---- "+node.name+" -----------------------------------------------");
		
		if(!node.hasOwnProperty("checkPositionInfo"))
		{
				//console.log("---- "+node.name+" "+node.getNodeKey()+" missing checkPositionInfo --");
				return(false);
		}

		
		var distance = node.checkPositionInfo.circlePosition.getDistance(position);
	
	
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
		super.drawNode(canvasHolder,node);
		//console.log("ZZZZZZZZZZZZZZ::::"+node.name);
	    var radiusAverage = 0;
	    for(var i=0;i<node.nodes.length;i++)
	    {
	     	var subNode = node.nodes[i];
	     	//console.log("            ZZZZZZZZZZZZZZ::::"+subNode.name);
	    	radiusAverage += subNode.graphData.nodeDisplay.displayInfo.radius;
	    }
	    if(radiusAverage!=0) radiusAverage = (radiusAverage / node.nodes.length);
	    radiusAverage += this.displayInfo.borderWidth*5;
	    
	    var junctionText = node.name;	    
	    var rectPadding = this.displayInfo.fontPixelHeight/2;
	    
	    canvasHolder.context.font=this.displayInfo.fontStyle+" "+this.displayInfo.fontPixelHeight+"px "+this.displayInfo.fontFace; 
	    canvasHolder.context.textAlign="center";
	    var textMetrics = this.metricsTextMutipleLines(
	    		canvasHolder.context,
	    		junctionText,
	    		this.displayInfo.fontPixelHeight,
	    		"\n");
	    
	    var totalWidth = Math.max(radiusAverage+rectPadding,textMetrics.width+rectPadding+rectPadding);
	    var totalHeight = 
	    	radiusAverage+
	    	this.displayInfo.borderWidth*2+
	    	node.graphData.textSpacer+
	    	textMetrics.height+rectPadding;
	    
	    node.width = totalWidth;
	    node.height = totalHeight;
	    
		if(!node.hasOwnProperty("checkPositionInfo"))
		{
			//console.log("**** "+node.name+" missing checkPositionInfo ---------------------");			
			node.checkPositionInfo = { makeItReal:"true", };
		}
		var x = node.position.getX();
		var y = node.position.getY();
		//x = this.drawPosition.getX();
		//y = this.drawPosition.getY();

	    //if(node.checkPositionInfo==null) node.checkPositionInfo = {};
	    node.checkPositionInfo.circlePosition = new Position(
	    		x,
	    		y-totalHeight/2.0+radiusAverage);
	    
	    node.connectorPosition.setY(-(totalHeight/2.0-radiusAverage));
	
	    
	    node.checkPositionInfo.textX = x-(textMetrics.width+rectPadding)/2.0;
	    node.checkPositionInfo.textY = node.checkPositionInfo.circlePosition.getY()+
	    	radiusAverage+
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
	
	    this.fillTextMutipleLines(
	    		canvasHolder.context,
	    		junctionText,
	    		x,
	    		node.checkPositionInfo.textY+rectPadding*2.0+this.displayInfo.borderWidth,
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
	  /*
	    console.log("name="+node.name+
	    		":selectFillColor="+this.displayInfo.selectFillColor+
	    		":fillColor="+this.displayInfo.fillColor+
	    		":X="+node.checkPositionInfo.circlePosition.getX()+
	    		":Y="+node.checkPositionInfo.circlePosition.getY()+
	    		":radius="+radiusAverage+
	    		""
	    		);
	    */
	    
	
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

},{"../../common/common":1,"../../nodes/nodedisplay/nodedisplay":18,"../../nodes/position/position":21}],27:[function(require,module,exports){
var Connector = require('../nodes/connector/connector');
var SpringConnector = require('../nodes/connector/springconnector');


class Path extends SpringConnector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
		this.walkerObject = new Object();
	}
	
	getClientJson()
	{
		var json = super.getClientJson();
		json.junctionStart = this.junctionStart.getNodeKey();
		json.junctionEnd = this.junctionEnd.getNodeKey();
		return(json);
	}
	
	setJunctions(junctionStart,junctionEnd)
	{
	    this.junctionStart = junctionStart;
		this.junctionEnd = junctionEnd;
		this.addNode(junctionStart);
		this.addNode(junctionEnd);		
	}
	
	getConnectorKey()
	{
		return(this.getPathKey());
	}
	
	getPathKey()
	{
		return(this.junctionStart.getNodeKey()+"#"+this.junctionEnd.getNodeKey());
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

},{"../nodes/connector/connector":2,"../nodes/connector/springconnector":5}],28:[function(require,module,exports){
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
	constructor(canvasHolder,worldDisplay)
	{
		super(canvasHolder);
		this.junctions = new Object();
		this.paths = new Object();
		this.walkers = new Object();
		this.worldUpdateQueue = new Array();
		this.worldUpdateQueue.isInNeedOfSorting = false
		
		this.junctionSpacer = canvasHolder.getConnector("junctionSpacer",canvasHolder.canvasName+":junctionSpacer"),
		this.worldWall = canvasHolder.getConnector("worldWall",canvasHolder.canvasName+":worldWall"),
		
		//this.junctionSpacer = junctionSpacer;
		//this.worldWall = worldWall;
		this.worldDisplay = worldDisplay;
		this.lastDate = "";
		this.checkTimestamp = "";
		this.nodeCanvasMouse = new NodeCanvasMouse(this);
		this.fillStyle = worldDisplay.worldBackgroundColor;
	}
	
	static fillPathWorldFromClientJson(world,json)
	{		
		//console.log("PathWolrd:fillPathWorldFromClientJson");
		//console.log("PathWolrd:fillPathWorldFromClientJson:worldName="+this.name);
		world.infoData.nodeKey.key = json.infoData.nodeKey.key;
		world.infoData.nodeKey.nodeId = json.infoData.nodeKey.nodeId;
		
		var junctionKeyMap = {};
		Object.keys(json.junctions).forEach(function (key)
		{
			var junctionJson = json.junctions[key];
			var junction = world.getCreateJunction(junctionJson.name,junctionJson.infoData);
			junction.position.x = junctionJson.position.x;
			junction.position.y = junctionJson.position.y;
			junctionKeyMap[key] = junction;
		});
		
		Object.keys(json.paths).forEach(function (key)
		{
			var pathJson = json.paths[key];
			var path = world.getCreatePath(
					junctionKeyMap[pathJson.junctionStart],
					junctionKeyMap[pathJson.junctionEnd],
					pathJson);
		});
				
		Object.keys(json.walkers).forEach(function (key)
		{
			var walkerJson = json.walkers[key];
			var walker = world.getCreateWalker(walkerJson.name,walkerJson.infoData);
			walker.position.x = walkerJson.position.x;
			walker.position.y = walkerJson.position.y;	
			walker.setCurrentJunction(junctionKeyMap[walkerJson.currentJunction]);
		});
	}
	
	  xgetNodeJson(json)
	  {
		  json.name = this.name;
		  json.graphDataKey = this.graphDataKey;
		  json.infoData = this.infoData;
		  //json.infoData.nodeKey = this.getNodeKey();
		  json.position = this.position.getClientJson();
		  json.connectors = new Array();
		  for(var i=0;i<this.connectors.length;i++) json.connectors.push(this.connectors[i].getConnectorKey());

		  return(json);
	  }

	
	static createPathWorldFromClientJson(canvasHolder,worldDef,json)
	{
		var pathWorld = new PathWorld(canvasHolder,worldDef);
		
		Object.keys(json.junctions).forEach(function (key)
		{
			var junctionJson = json.junctions[key];
			var junction = pathWorld.getCreateJunction(junctionJson.name,junctionJson.infoData);
			junction.position.x = junctionJson.position.x;
			junction.position.y = junctionJson.position.y;
		});
		
		Object.keys(json.walkers).forEach(function (key)
				{
					var walkerJson = json.walkers[key];
					var walker = pathWorld.getCreateWalker(walkerJson.name,walkerJson.infoData);
					walker.position.x = walkerJson.position.x;
					walker.position.y = walkerJson.position.y;
				});
		//json.junctions = {};
		//json.walkers = {};
		//json.paths = {};
		
		/*
		var isWalkerNew = this.isWalkerNew(worldUpdate.walkerName);
		var isJunctionNew = this.isJunctionNew(worldUpdate.junctionName);
		var walker = this.getCreateWalker(worldUpdate.walkerName,worldUpdate.walkerInfo);
		var junction = this.getCreateJunction(worldUpdate.junctionName,worldUpdate.junctionInfo);		
		var currentJunction = walker.getCurrentJunction();
		*/	
		//var worldDisplay = sdfsd;
		//var worldWall = sfsd;
		//var junctionSpacer = xxx
		return(pathWorld);
	}
	
	drawCanvas(timestamp)
	{
		super.drawCanvas(timestamp);
		this.pathWolrdExtraAnimation(timestamp);
	}
	
	getWorldClientJson()
	{
		var json = {};
		
		json.junctions = {};
		var junctionList = this.getJunctionList();
		for(var i=0;i<junctionList.length;i++)
		{
			var junction = junctionList[i];
			json.junctions[junction.getNodeKey()] = junction.getClientJson();
		}
		
		
		json.walkers = {};
		var walkerList = this.getWalkerList();
		for(var i=0;i<walkerList.length;i++)
		{
			var walker = walkerList[i];
			json.walkers[walker.getNodeKey()] = walker.getClientJson();
		}
		
		json.paths = {};
		var pathList = this.getPathList();
		for(var i=0;i<pathList.length;i++)
		{
			var path = pathList[i];
			json.paths[path.getConnectorKey()] = path.getClientJson();
		}
		
  	   json.canvasHolder = this.canvasHolder.getClientJson();
  	   json.infoData = this.infoData;	
  	   return(json);
	}
	
	pathWolrdExtraAnimation(timestamp)
	{
		this.prepareWorldUpdateQueue();

		var localCheckTimestamp = this.animationExecTime*this.timeFactor + this.startTime.getTime();
		var checkDate = new Date(localCheckTimestamp);

		if(this.lastDate==null) this.lastDate=="";
		
		if(this.lastDate!=checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate))
		{
			this.lastDate = checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate);
			if(this.isAnimated && this.canvasHolder.isDrawable()) $('#world_date').html(this.lastDate);
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
			walker.processWalkerRules(this);
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
		var connectorDisplayObject = this.canvasHolder.getConnectorDisplay(pathInfo.pathTypeKey);
		
		var path = null;
		var pathKey = this.getPathKey(junctionStart,junctionEnd);
		if(!this.paths.hasOwnProperty(pathKey))
		{
			var p = this.canvasHolder.getConnector("path",pathKey);
			p.setJunctions(junctionStart,junctionEnd);
			this.paths[pathKey] = p;
		}
		var path = this.paths[pathKey];
		return(path);
	}
	
	getWalkerList()
	{
		var walkerList = new Array();
		var walkers = this.walkers;
		Object.keys(this.walkers).forEach(function (key)
		{
			walkerList.push(walkers[key]);
		});
		return(walkerList);
	}

	getPathList()
	{
		var pathList = new Array();
		var paths = this.paths;
		Object.keys(this.paths).forEach(function (key)
		{
			pathList.push(paths[key]);
		});
		return(pathList);
	}

	getJunctionList()
	{
		var junctionList = new Array();
		var junctions = this.junctions;
		Object.keys(this.junctions).forEach(function (key)
		{
			junctionList.push(junctions[key]);
		});
		return(junctionList);
	}
	
	/*
	getJuntionGraphData(junctionInfo)
	{
		var junctionGraphData = this.worldDisplay.junctionTypes["generic"];
	
		if(this.worldDisplay.junctionTypes.hasOwnProperty(junctionInfo.junctionTypeKey))
		{
			junctionGraphData = this.worldDisplay.junctionTypes[junctionInfo.junctionTypeKey];
	
		}
		return(junctionGraphData);
	}
	*/
	getCreateJunction(name,junctionInfo)
	{
		//var junctionGraphData = this.getJuntionGraphData(junctionInfo);
		if(!this.junctions.hasOwnProperty(name))
		{
			//console.log("PathWorld:getCreateJunction:type="+junctionInfo.junctionTypeKey);

			var startPosition = this.getStartPositionJunction();
			this.junctions[name] = new Junction(
				name,
				new Position(startPosition.getX(),startPosition.getY()),
				this.canvasHolder,
				new Array(),
				junctionInfo.junctionTypeKey,
				junctionInfo,
				this);
			var j = this.junctions[name];
			//console.log("pathWorld getCreateJunction inner name:"+j.name)	
			this.addNode(j);
			this.worldWall.addNode(j);
			this.junctionSpacer.addNode(j);
		}
		var junction = this.junctions[name];
	
		return(junction);
	}
	
	/*
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
	*/
	getCreateWalker(walkerName,walkerInfo)
	{
		//var walkerGraphData = this.getWalkerGraphData(walkerInfo);
		
		if(!this.walkers.hasOwnProperty(walkerName))
		{
			//console.log("PathWorld:getCreateWalker:type="+walkerInfo.walkerTypeKey);

			var startPosition = this.getStartPositionWalker();
			this.walkers[walkerName] = new Walker(
					walkerName,
					new Position(startPosition.getX(),startPosition.getY()),
					this.canvasHolder,
					new Array(),
					walkerInfo.walkerTypeKey,
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
		if(worldUpdate!=null) worldUpdate = this.processWorldUpdate(worldUpdate);
		return(worldUpdate);
	}
	
	processWorldUpdate(worldUpdate)
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
					{junctionName:teleportPath.teleportName,junctionTypeKey:"genericJunction"});
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
		this.worldUpdateQueueProcessed.push(worldUpdate);
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
		return(junction.getNodeKey());
	}
	
	getPathKey(junctionStart,junctionEnd)
	{
		return(this.getJunctionKey(junctionStart)+"#"+this.getJunctionKey(junctionEnd));
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

},{"../common/common":1,"../nodes/nodecanvas/nodecanvas":14,"../nodes/nodecanvas/nodecanvasmouse":15,"../nodes/position/position":21,"../paths/junction":24,"../paths/path":27,"../paths/walker":30}],29:[function(require,module,exports){
var CanvasDef = require('../nodes/nodecanvas/canvasdef');


class PathWorldDef extends CanvasDef
{
	constructor()
	{		
		super();
	}
	
	getPathParts()
	{
		throw "PathWorldDef.getPathParts not defined";
	}
	
	getPathDef()
	{
		throw "PathWorldDef.getPathDef not defined";
	}
	
	getWalkerJunctionRules()
	{
		throw "PathWorldDef.getWalkerJunctionRules not defined";
	}
}

//<js2node>
module.exports = PathWorldDef;
console.log("Loading:PathWorldDef");
//</js2node>

},{"../nodes/nodecanvas/canvasdef":10}],30:[function(require,module,exports){
var Node = require('../nodes/node');
var Common = require('../common/common');

class Walker extends Node
{
	constructor(name,position,canvasHolder,shapeList,graphDataKey,infoData)
	{
		super(name,position,canvasHolder,graphDataKey,infoData);
		Walker.initWalker(this,name,position,shapeList,graphDataKey,infoData);
	}
	
	static initWalker(walker,name,position,shapeList,graphDataKey,infoData)
	{
		walker.junctionArray = new Array();
		walker.layer=2;
		if(!walker.graphData.walkerJunctionRules) walker.graphData.walkerJunctionRules = new Object();
		if(!walker.graphData.walkerJunctionRules.junctionExits)
			walker.graphData.walkerJunctionRules.junctionExits = new Array();
	}
	
	getClientJson()
	{
		var json = super.getClientJson();
		json.pathWorldTye = "walker";
		json.currentJunction = this.getCurrentJunction().getNodeKey();
		return(json);
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
		//////////////value += "<li>remove at:"+(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds)+"</li>";
		//value += "<li>checkTime:"+world.checkTimestamp+"</li>";
		/////////value += "<li>diff:"+(world.checkTimestamp-(this.lastUpdateTimeStamp+exit.exitAfterMiliSeconds))+"</li>";
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

},{"../common/common":1,"../nodes/node":9}],31:[function(require,module,exports){
////////////////////////////////////////////
// WorldUpdate
//////////////////////////////////////////////
class WorldUpdate
{
	constructor(junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo)
	{
		WorldUpdate.createWorldUpdate(this,junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo);
	}
	
	static createWorldUpdateFromJson(json)
	{
		var worldUpdate = new WorldUpdate(
				json.junctionName,
				json.walkerName,
				json.processTimestamp,
				json.walkerInfo,
				json.junctionInfo,
				json.pathInfo);
		return(worldUpdate);
	}
		
	static createWorldUpdate(worldUpdate,junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo)
	{
		worldUpdate.junctionName = junctionName;
		worldUpdate.walkerName = walkerName;
		worldUpdate.processTimestamp = processTimestamp;
		worldUpdate.walkerInfo = walkerInfo;
		worldUpdate.junctionInfo = junctionInfo;
		worldUpdate.pathInfo = pathInfo;
		worldUpdate.updateType = "junction";

	}
	
	readyToBeProcessed (timestamp)
	{
		return( (this.processTimestamp<=timestamp) );
		//return(  (this.getDate().getTime()<=timestamp)  );
	}
	
	xgetDate()
	{
		return(new Date(this.processTimestamp*1000));
	}
}

//<js2node>
module.exports = WorldUpdate;
console.log("Loading:WorldUpdate");
//</js2node>

},{}],32:[function(require,module,exports){
var PathWorldDef = require('../../paths/pathworlddef');
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var PathWorld = require('../../paths/pathworld');
var WorldUpdate = require('../../paths/worldupdate');
var Path = require('../../paths/path');
var Common = require('../../common/common');
var CircleDisplay = require('../../nodes/nodedisplay/circledisplay');
var ConnectorDisplayEmpty = require('../../nodes/connectordisplay/connectordisplayempty');
var GroupConnector = require('../../nodes/connector/groupconnector');
var WallConnector = require('../../nodes/connector/wallconnector');
var JunctionConnector = require('../../paths/nodedisplay/junctionconnector');
var JunctionDisplay = require('../../paths/nodedisplay/junctiondisplay');
var RectangleDisplay = require('../../nodes/nodedisplay/rectangledisplay');
var TriangleDisplay = require('../../nodes/nodedisplay/triangledisplay');
var ArcDisplayShape = require('../../nodes/nodedisplay/arcdisplayshape');

//var InitInaGraph = require('../../pathsexp/inagraph/initinagraph');




class InaGraphPathWorldDef extends PathWorldDef
{

	constructor()
	{
		super();
		this.init();
	}
	
	init()
	{
		this.worldDefaults =
		{
				junctionRadiusDefault:15,
				walkerRadiusDefault:15*0.3,
				relaxedDistanceDefault:8.5*10,
				elasticityFactorDefualt:0.025,
				port:3000,
		};
		
		this.pathParts =
		{
			start:["Accessioning","Anatomic pathology lab"],
			normalEnd:["RNA lab","Medical services","Lab director sign off","Reporting","Result mailed/ Sample returned"],
			tumorFailRequeue:["Insufficient tumor","Canceled","Reporting","Extra Tisue","YES requeue"],
			tumorFailCS:["Insufficient tumor","Canceled","Reporting","Extra Tisue","NO cancel sample","Customer Service"],
			rnaFailRequeue:["Insufficient RNA","Canceled","Reporting","Extra Tisue","YES requeue"],
			rnaFailCS:["Insufficient RNA","Canceled","Reporting","Extra Tisue","NO hold","Customer Service"],
		};

		
		this.pathDefs =
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
			
	    this.junctionExits = 
	    [
	        {exitJunction:"Result mailed/ Sample returned",exitAfterMiliSeconds:60*60*24*1000},
	    ];
		
		this.worldDisplay =
		{	
			junctionRadiusDefault:this.worldDefaults.junctionRadiusDefault,
			walkerRadiusDefault:this.worldDefaults.walkerRadiusDefault,
			relaxedDistanceDefault:this.worldDefaults.relaxedDistanceDefault,
			elasticityFactorDefualt:this.worldDefaults.elasticityFactorDefualt,
			
		    worldBackgroundColor:"e0e0f0ff",
		
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
			connectorDefs:
			{
				generic:
					function(worldDef,name) 
					{
						return(
								new GroupConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*2.5,
										worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				junctionSpacer:
					function(worldDef,name) 
					{
						return(
								new GroupConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*2.5,
										worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				worldWall:
					function(worldDef,name)
					{
						return(
								new WallConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*0.75,
										1-worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				path:
					function(worldDef,name)
					{
						return(
							new Path(new JunctionConnector(
									{lineColor:"0000a0ff",lineWidth:5}),
								null,
								null,
								worldDef.worldDefaults.relaxedDistanceDefault*1.25,
								1-worldDef.worldDefaults.elasticityFactorDefualt,
								name)
						);
				}
				
			},
		    connectorDisplay:
			{
				generic:
				{
					connectorDisplay: new JunctionConnector(
					{
						lineColor:"0000a0ff",lineWidth:5
					}),					
				},
			},
			nodeDisplay:
			{
				generic:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,							
				},
				genericJunction:
				{			
					//initGraphData:InaGraphPathWorldDef.initJunctionDisplay,
					initGraphData:this.initJunctionDisplay,
					nodeDisplay:{displayInfo:{clone:false}}
				},
				nodeGeneric:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				junctionPieSlice:
				{
					
					nodeDisplayFunction:function()
						{
							return(new ArcDisplayShape(
								{
									fillColor:"00000000",
									borderColor:"000000ff",
									selectFillColor:"00ff007f",selectBorderColor:"000000ff",
									borderWidth:1,
									radius:25,
									curvePoints:16,
									startAngle:0,
									endAngle:320,
									width:25,
									height:25,
									ts:new Date().getTime(),
									clone:true
								}))
								},
					nodeDisplay:new ArcDisplayShape(
					{
						fillColor:"00000000",
						borderColor:"000000ff",
						selectFillColor:"00ff007f",selectBorderColor:"000000ff",
						borderWidth:1,
						radius:25,
						curvePoints:16,
						startAngle:0,
						endAngle:320,
						width:25,
						height:25,
						clone:true
					}),
				},
				tumorFailRQSuccess:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"FFA500ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								//radius:walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				normal:
				{
					nodeDisplay:new RectangleDisplay(
							{
								fillColor:"ff2020ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false							
							}),
					walkerJunctionRules:this.junctionExits,
				},
				rnaFailRQSucess:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"00A5FFff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,		
				},
				tumorFailCancel:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"A5FF00ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				testing:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"A5FF00ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault*3,
								width:(this.worldDefaults.walkerRadiusDefault*3)*2,
								height:(this.worldDefaults.walkerRadiusDefault*3)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
			},
		};
		
	}
	
	getPathParts()
	{
		return(this.pathParts);
	}
	
	getPathDef()
	{
		return(this.pathDefs);
	}
	
	getWorldDispaly()
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
	
	//static initJunctionDisplay(node)
	initJunctionDisplay(node)
	{
		console.log("inside initJunctionDisplay for name="+node.name);
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
					clone:false
				});
		//node.graphData.nodeDisplay.clone=false;
		node.graphData.textSpacer = 5;
		//node.graphData.radius = this.worldDefaults.junctionRadiusDefault*3;
		node.graphData.radius = 15;
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
					for(var k=0;k<this.pathParts[pathName].length;k++)
					{
						//console.log("               junction="+pathParts[pathName][k]);
						pathArray.push(this.pathParts[pathName][k]);
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
		var pathArray = this.getPathArray();
		
		var now = new Date().getTime();
		//now = Math.floor(now/1000);
		//now = now/1000;
		//var lastTime = now;
		
		for(var i=0;i<pathArray.length;i++)
		{
			var lastTime = now;
			var pd = pathArray[i];
			//console.log("Start of worldUpdate:"+CommontoString(pd));
			
			var startSpacer = Math.floor(Math.random()*360000)-0;
			if( (lastTime+startSpacer) < now) startSpacer = 0;
			for(var j=0;j<pd.path.length;j++)
			{
				var spacer = Math.floor(Math.random()*8000)+1000;
				lastTime += spacer;
				
				//console.log("adding : pathName="+pd.pathDef.pathDefName+" junction="+pd.path[j]);
	
				var worldUpdate = new WorldUpdate(
						pd.path[j],
						pd.pathDef.pathDefName+"."+i,
						lastTime+startSpacer,
						{
							waklerName:pd.pathDef.pathDefName+"."+i,
							walkerTypeKey:pd.pathDef.pathDefName
						},
						{
							junctionName:pd.path[j],
							junctionTypeKey:"genericJunction"
						},
						{
							pathTypeKey:"generic"
						},
						{
							status:"In Progress"
						}); // 23-JAN-17 06.35.14 AM
				console.log("adding : pathName="+pd.pathDef.pathDefName+" junction="+pd.path[j]+" ts="+worldUpdate.processTimestamp);

				world.addToWorldUpdateQueue(worldUpdate);
			}
		}
	}
}

//<js2node>
module.exports = InaGraphPathWorldDef;
console.log("Loading:InaGraphPathWorldDef");
//</js2node>
},{"../../common/common":1,"../../nodes/connector/groupconnector":3,"../../nodes/connector/wallconnector":6,"../../nodes/connectordisplay/connectordisplayempty":8,"../../nodes/nodecanvas/canvasholder":11,"../../nodes/nodedisplay/arcdisplayshape":16,"../../nodes/nodedisplay/circledisplay":17,"../../nodes/nodedisplay/rectangledisplay":19,"../../nodes/nodedisplay/triangledisplay":20,"../../paths/nodedisplay/junctionconnector":25,"../../paths/nodedisplay/junctiondisplay":26,"../../paths/path":27,"../../paths/pathworld":28,"../../paths/pathworlddef":29,"../../paths/worldupdate":31}],33:[function(require,module,exports){
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var CanvasHolderVirtual = require('../../nodes/nodecanvas/canvasholdervirtual');
var Position = require('../../nodes/position/position');
var PathWorld = require('../../paths/pathworld');
var WorldUpdate = require('../../paths/worldupdate');
var InaGraphPathWorldDef = require('../../pathsexp/inagraph/inagraphpathworlddef');
var Common = require('../../common/common');
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');

class PathClient
{
	constructor(canvasHolder)
	{
		this.canvasName = canvasHolder.canvasName;
		this.canvasHolder = canvasHolder;
		this.worldDisplay = this.canvasHolder.worldDef.getWorldDispaly();	
		this.world = new PathWorld(
				this.canvasHolder,		
				this.worldDisplay);
		this.world.timeFactor = 1.0;
		this.world.startTime = new Date();
		this.lastTimeDelta = -1;

		var firstItem = this.world.peekAtNextWorldUpdate();
		if(firstItem!=null)
		{
			var firstDate = firstItem.getDate();
			this.world.startTime = firstDate;
		}
	}
	
	static getExports()
	{
		return(
				{
					CanvasHolder:CanvasHolder,
					CanvasHolderVirtual:CanvasHolderVirtual,
					Position:Position,
					PathWorld:PathWorld,
					WorldUpdate:WorldUpdate,
					InaGraphPathWorldDef:InaGraphPathWorldDef,
					Common:Common,
				}
				);
	}
	
	startAnimation()
	{
			this.doDraw();
			var self = this;
			setInterval(function(){ self.doDraw(); },250);		
	}
	
	doDraw()
	{
		if(this.lastTimeDelta<0) this.getData();
		else
		{
			this.getDelta(this.lastTimeDelta);
			this.pushUserMovments();
		}
	}    				
	
	pushUserMovments()
	{
		//console.log("pushUserMovments...");
		var nodeMouseMovment = this.world.nodeCanvasMouse.nodeMouseMovment;
		var self = this;
		Object.keys(nodeMouseMovment).forEach(function (key)
		{
			var movePosition = Position.getAveragePostionFromPositionList(nodeMouseMovment[key].movePostionArray);
			nodeMouseMovment[key].movePostionArray.length = 0;
			delete nodeMouseMovment[key];
			
			var moveMessage = 
			{
				nodeKey:key,
				movePosition
			};
			self.sendServerJson(
				"/paths/"+self.canvasName+"/movenode/",
				moveMessage);
			console.log("movements for : "+key);
		});
	}
	
	sendServerJson(url,json)
	{
		var encodedJson = Common.jsonToURI(json);
		fetch(url+encodedJson).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				console.log("sent json to "+url);
	    			});  	
	 }
	
	getDelta(deltaTime)
	{
		var url = "/paths/"+this.canvasName+"/delta/"+deltaTime+"/"+10;
		var self = this;
		fetch(url).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				for(var i=0;i<data.length;i++)
	    				{
	    					var  oneData = data[i];
	    					if(oneData.updateType== "junction")
							{
	    						self.world.addToWorldUpdateQueue(WorldUpdate.createWorldUpdateFromJson(oneData));
	
	    					}
	    					else if(oneData.updateType=="move")
	    					{
	    						console.log("move:"+Common.toString(oneData));
	    						if(self.world.doesNodeExist(oneData.nodeKey))
	    						{
	    							var node = self.world.getNode(oneData.nodeKey);
	    							if(!node.isSelected) node.position.setXY(oneData.movePosition.x,oneData.movePosition.y);
	    						}
	    					}
	    					self.lastTimeDelta = oneData.processTimestamp;
	    				}
	    			});  	
	 }
	
	getData()
	{
		var url = "/paths/"+this.canvasName;
		var self = this;
		fetch(url).then((resp) => resp.json()).then(
	  				function(data)
	  				{
	    				PathWorld.fillPathWorldFromClientJson(self.world,data);
	    			});
		this.lastTimeDelta = 0;	
	}
}

//<js2node>
module.exports = PathClient;
console.log("Loading:PathClient");
//</js2node>
},{"../../common/common":1,"../../nodes/nodecanvas/canvasholder":11,"../../nodes/nodecanvas/canvasholdervirtual":12,"../../nodes/position/position":21,"../../paths/pathworld":28,"../../paths/worldupdate":31,"../../pathsexp/inagraph/inagraphpathworlddef":32}]},{},[33])(33)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uL2NvbW1vbi9jb21tb24uanMiLCIuLi8uLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yLmpzIiwiLi4vLi4vbm9kZXMvY29ubmVjdG9yL2dyb3VwY29ubmVjdG9yLmpzIiwiLi4vLi4vbm9kZXMvY29ubmVjdG9yL3NoYXBlY29ubmVjdG9yLmpzIiwiLi4vLi4vbm9kZXMvY29ubmVjdG9yL3NwcmluZ2Nvbm5lY3Rvci5qcyIsIi4uLy4uL25vZGVzL2Nvbm5lY3Rvci93YWxsY29ubmVjdG9yLmpzIiwiLi4vLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5LmpzIiwiLi4vLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5ZW1wdHkuanMiLCIuLi8uLi9ub2Rlcy9ub2RlLmpzIiwiLi4vLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNkZWYuanMiLCIuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlci5qcyIsIi4uLy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVydmlydHVhbC5qcyIsIi4uLy4uL25vZGVzL25vZGVjYW52YXMvbW91c2VzdGF0dXMuanMiLCIuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXMuanMiLCIuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXNtb3VzZS5qcyIsIi4uLy4uL25vZGVzL25vZGVkaXNwbGF5L2FyY2Rpc3BsYXlzaGFwZS5qcyIsIi4uLy4uL25vZGVzL25vZGVkaXNwbGF5L2NpcmNsZWRpc3BsYXkuanMiLCIuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS9ub2RlZGlzcGxheS5qcyIsIi4uLy4uL25vZGVzL25vZGVkaXNwbGF5L3JlY3RhbmdsZWRpc3BsYXkuanMiLCIuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS90cmlhbmdsZWRpc3BsYXkuanMiLCIuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbi5qcyIsIi4uLy4uL25vZGVzL3NoYXBlcy9ib3VuZGluZ2JveC5qcyIsIi4uLy4uL25vZGVzL3NoYXBlcy9zaGFwZS5qcyIsIi4uLy4uL3BhdGhzL2p1bmN0aW9uLmpzIiwiLi4vLi4vcGF0aHMvbm9kZWRpc3BsYXkvanVuY3Rpb25jb25uZWN0b3IuanMiLCIuLi8uLi9wYXRocy9ub2RlZGlzcGxheS9qdW5jdGlvbmRpc3BsYXkuanMiLCIuLi8uLi9wYXRocy9wYXRoLmpzIiwiLi4vLi4vcGF0aHMvcGF0aHdvcmxkLmpzIiwiLi4vLi4vcGF0aHMvcGF0aHdvcmxkZGVmLmpzIiwiLi4vLi4vcGF0aHMvd2Fsa2VyLmpzIiwiLi4vLi4vcGF0aHMvd29ybGR1cGRhdGUuanMiLCIuLi9pbmFncmFwaC9pbmFncmFwaHBhdGh3b3JsZGRlZi5qcyIsInBhdGhjbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBDb21tb25cbntcblx0Y29uc3RydWN0b3IodmFsdWVzKVxuXHR7XG5cdFx0dGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG5cdFx0Y29uc29sZS5sb2coXCIxMDFcIik7XG5cdH1cblx0XG5cdHN0YXRpYyBpbmhlcml0c0Zyb20oY2hpbGQsIHBhcmVudClcblx0e1xuXHQgICAgY2hpbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcblx0fVxuXHRcblx0c3RhdGljIGdldFRpbWVLZXkoKVxuXHR7XG5cdFx0dmFyIHVpZCA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSkudG9TdHJpbmcoMzYpO1xuXHRcdHJldHVybih1aWQpO1xuXHR9XG5cblx0c3RhdGljICBqc29uVG9VUkkoanNvbil7IHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoanNvbikpOyB9XG5cblx0c3RhdGljIHVyaVRvSlNPTih1cmlqc29uKXsgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlVVJJQ29tcG9uZW50KHVyaWpzb24pKTsgfVxuXG5cdHN0YXRpYyBzdHJpbmdpZnlDb21tb24ob2JqLCByZXBsYWNlciwgc3BhY2VzLCBjeWNsZVJlcGxhY2VyKVxuXHR7XG5cdCAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgdGhpcy5zZXJpYWxpemVyQ29tbW9uKHJlcGxhY2VyLCBjeWNsZVJlcGxhY2VyKSwgc3BhY2VzKVxuXHR9XG5cblx0c3RhdGljIGdldERheU9mV2VlayhkYXRlKVxuXHR7ICAgXG5cdCAgICByZXR1cm4gW1wiU3VuZGF5XCIsXCJNb25kYXlcIixcIlR1ZXNkYXlcIixcIldlZG5lc2RheVwiLFwiVGh1cnNkYXlcIixcIkZyaWRheVwiLFwiU2F0dXJkYXlcIl1bIGRhdGUuZ2V0RGF5KCkgXTtcblx0fTtcblx0XG5cdHRlc3QodGVzdClcblx0e1xuXHRcdGNvbnNvbGUubG9nKFwiQ29tbW9uOnRlc3Q6XCIrdGVzdCk7XG5cdH1cblxuXHRzdGF0aWMgc2VyaWFsaXplckNvbW1vbihyZXBsYWNlciwgY3ljbGVSZXBsYWNlcilcblx0e1xuXHQgIHZhciBzdGFjayA9IFtdLCBrZXlzID0gW11cblxuXHQgIGlmIChjeWNsZVJlcGxhY2VyID09IG51bGwpIGN5Y2xlUmVwbGFjZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG5cdCAgICBpZiAoc3RhY2tbMF0gPT09IHZhbHVlKSByZXR1cm4gXCJbQ2lyY3VsYXIgfl1cIlxuXHQgICAgcmV0dXJuIFwiW0NpcmN1bGFyIH4uXCIgKyBrZXlzLnNsaWNlKDAsIHN0YWNrLmluZGV4T2YodmFsdWUpKS5qb2luKFwiLlwiKSArIFwiXVwiXG5cdCAgfVxuXG5cdCAgcmV0dXJuIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcblx0ICAgIGlmIChzdGFjay5sZW5ndGggPiAwKSB7XG5cdCAgICAgIHZhciB0aGlzUG9zID0gc3RhY2suaW5kZXhPZih0aGlzKVxuXHQgICAgICB+dGhpc1BvcyA/IHN0YWNrLnNwbGljZSh0aGlzUG9zICsgMSkgOiBzdGFjay5wdXNoKHRoaXMpXG5cdCAgICAgIH50aGlzUG9zID8ga2V5cy5zcGxpY2UodGhpc1BvcywgSW5maW5pdHksIGtleSkgOiBrZXlzLnB1c2goa2V5KVxuXHQgICAgICBpZiAofnN0YWNrLmluZGV4T2YodmFsdWUpKSB2YWx1ZSA9IGN5Y2xlUmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKVxuXHQgICAgfVxuXHQgICAgZWxzZSBzdGFjay5wdXNoKHZhbHVlKVxuXG5cdCAgICByZXR1cm4gcmVwbGFjZXIgPT0gbnVsbCA/IHZhbHVlIDogcmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKVxuXHQgIH1cblx0fVxuXG5cdHN0YXRpYyBnZXRDb2xvckZyb21TdHJpbmcoY29sb3JTdHJpbmcpXG5cdHtcblx0XHR2YXIgdHJhbnNwYXJlbmN5ID0gMS4wO1xuXHRcdGlmKGNvbG9yU3RyaW5nLmxlbmd0aD09Nilcblx0XHR7XG5cdFx0XHRjb2xvclN0cmluZyArPSBcImZmXCI7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciBjb2xvciA9IFwicmdiYShcIitcblx0XHRcdFx0cGFyc2VJbnQoY29sb3JTdHJpbmcuc3Vic3RyaW5nKDAsMiksIDE2KStcIixcIitcblx0XHRcdFx0cGFyc2VJbnQoY29sb3JTdHJpbmcuc3Vic3RyaW5nKDIsNCksIDE2KStcIixcIitcblx0XHRcdFx0cGFyc2VJbnQoY29sb3JTdHJpbmcuc3Vic3RyaW5nKDQsNiksIDE2KStcIixcIitcblx0XHRcdFx0cGFyc2VJbnQoY29sb3JTdHJpbmcuc3Vic3RyaW5nKDYsOCksIDE2KS8yNTUuMCtcIilcIjtcblx0XHRcblx0XHRyZXR1cm4oY29sb3IpO1xuXHR9XG5cblx0c3RhdGljIGxvZ0luc2VydEFycmF5KGFycmF5LHByaW50VmFsdWVGdW5jdGlvbilcblx0e1xuXHRcdGZvcih2YXIgaT0wO2k8YXJyYXkubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhcImk9XCIrcHJpbnRWYWx1ZUZ1bmN0aW9uKGFycmF5W2ldKSk7XG5cdFx0fVxuXHR9XHRcblx0XG5cdHN0YXRpYyBpbnNlcnRJbnRvQXJyYXkodG9JbnNlcnQsYXJyYXkscG9zaXRpb24pXG5cdHtcblx0XHRhcnJheS5zcGxpY2UocG9zaXRpb24sMCx0b0luc2VydCk7XG5cdH1cdFxuXHRcblx0c3RhdGljIHNodWZmbGVBcnJheShhcnJheSlcblx0e1xuXHQgICAgZm9yICh2YXIgaSA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcblx0ICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuXHQgICAgICAgIHZhciB0ZW1wID0gYXJyYXlbaV07XG5cdCAgICAgICAgYXJyYXlbaV0gPSBhcnJheVtqXTtcblx0ICAgICAgICBhcnJheVtqXSA9IHRlbXA7XG5cdCAgICB9XG5cdCAgICByZXR1cm4gYXJyYXk7XG5cdH1cblxuXHRzdGF0aWMgcmVtb3ZlSXRlbUZyb21BcnJheShhcnJheSxpdGVtKVxuXHR7XG5cdFx0dmFyIGluZGV4ID0gYXJyYXkuaW5kZXhPZihpdGVtKTtcblx0XHRpZiAoaW5kZXggPiAtMSlcblx0XHR7XG5cdFx0ICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG5cdFx0fVxuXHR9XG5cdFxuXHRzdGF0aWMgdG9TdHJpbmcob2JqZWN0KVxuXHR7XG5cdFx0cmV0dXJuKEpTT04uc3RyaW5naWZ5KG9iamVjdCkpO1xuXHR9XG59XG5cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gQ29tbW9uO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkNvbW1vblwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG5cblxuY2xhc3MgQ29ubmVjdG9yXG57XG5cdGNvbnN0cnVjdG9yKGNvbm5lY3RvckZ1bmN0aW9uLGNvbm5lY3RvckRpc3BsYXksbmFtZSlcblx0e1xuXHRcdHRoaXMubm9kZXMgPSBuZXcgQXJyYXkoKTtcblx0XHR0aGlzLmNvbm5lY3RvckZ1bmN0aW9uID0gY29ubmVjdG9yRnVuY3Rpb247XHRcblx0XHR0aGlzLmNvbm5lY3RvckRpc3BsYXkgPSBjb25uZWN0b3JEaXNwbGF5O1x0XG5cdFx0dGhpcy5uYW1lID0gbmFtZTtcblx0XHR0aGlzLmNvbm5lY3RvcktleSA9IG5hbWUrXCIjXCIrQ29tbW9uLmdldFRpbWVLZXkoKTtcblx0XHRpZighbmFtZSkgY29uc29sZS50cmFjZShcIkNvbm5lY3RvciBwYXNzZWQgaW4gZW1wdHkgbmFtZVwiKTtcblx0fVxuXHRcblx0Z2V0Q29ubmVjdG9yS2V5KClcblx0e1xuXHRcdHJldHVybih0aGlzLmNvbm5lY3RvcktleSk7XG5cdH1cblxuXHRnZXRDbGllbnRKc29uKClcblx0e1xuXHRcdHZhciBqc29uID0ge307XG5cdFx0anNvbi5jb25uZWN0b3JLZXkgPSB0aGlzLmdldENvbm5lY3RvcktleSgpO1xuXHRcdGpzb24uY29ubmVjdG9yRGlzcGxheSA9IHRoaXMuY29ubmVjdG9yRGlzcGxheTtcblx0XHRqc29uLmNvbm5lY3RvckRlZktleSA9IHRoaXMuY29ubmVjdG9yRGVmS2V5O1xuXHRcdGpzb24ubm9kZXMgPSBuZXcgQXJyYXkoKTtcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGlzdDtpKyspXG5cdFx0e1xuXHRcdFx0anNvbi5ub2Rlcy5wdXNoKHRoaXMubm9kZXNbaV0uZ2V0Tm9kZUtleSgpKTtcblx0XHR9XG5cdFx0cmV0dXJuKGpzb24pO1xuXHR9XG5cdFxuXHRleGVjdXRlQ29ubmVjdG9yRnVuY3Rpb24odGltZXN0YW1wLG5vZGUpXG5cdHtcblx0XHR0aGlzLmNvbm5lY3RvckZ1bmN0aW9uKHRoaXMsbm9kZSx0aW1lc3RhbXApXG5cdH1cblxuXHRjb250YWluc1Bvc3Rpb24ocG9zaXRpb24pXG5cdHtcblx0XHRjb25zb2xlLmxvZyhcIk5vZGU6Y29udGFpbnNQb3N0aW9uOlwiK3RoaXMubmFtZStcIjpkZWZhdWx0LCB3aWxsIGFsd2F5cyBmYWlsXCIpO1xuXHRcdHJldHVybihmYWxzZSk7XG5cdH1cblxuXHRhZGROb2RlTGlzdChub2RlTGlzdClcblx0e1xuXHRcdGZvcih2YXIgaT0wO2k8bm9kZUxpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR0aGlzLmFkZE5vZGUobm9kZUxpc3RbaV0pO1xuXHRcdH1cblx0fVxuXG5cdGFkZE5vZGUobm9kZSlcblx0e1xuXHRcdHRoaXMubm9kZXMucHVzaChub2RlKTtcblx0XHRub2RlLmNvbm5lY3RvcnMucHVzaCh0aGlzKTtcblx0fVxuXG5cdHJlbW92ZU5vZGUobm9kZSlcblx0e1xuXHRcdC8vIGNvbnNvbGUubG9nKFwiQ29ubmVjdG9yIHJlbW92ZU5vZGUgYmVmb3JlOlwiK1xuXHRcdC8vIFwibm9kZT1cIitub2RlLm5hbWUrXG5cdFx0Ly8gXCI6dGhpcy5ub2Rlcz1cIit0aGlzLm5vZGVzLmxlbmd0aCtcblx0XHQvLyBcIjpub2RlLmNvbm5lY3RvcnM9XCIrbm9kZS5jb25uZWN0b3JzLmxlbmd0aCtcblx0XHQvLyBcIlwiKTtcblx0XHRDb21tb24ucmVtb3ZlSXRlbUZyb21BcnJheSh0aGlzLm5vZGVzLG5vZGUpO1xuXHRcdENvbW1vbi5yZW1vdmVJdGVtRnJvbUFycmF5KG5vZGUuY29ubmVjdG9ycyx0aGlzKTtcblx0XHRcblx0XHQvLyBjb25zb2xlLmxvZyhcIkNvbm5lY3RvciByZW1vdmVOb2RlIGFmdGVyIDpcIitcblx0XHQvLyBcIm5vZGU9XCIrbm9kZS5uYW1lK1xuXHRcdC8vIFwiOnRoaXMubm9kZXM9XCIrdGhpcy5ub2Rlcy5sZW5ndGgrXG5cdFx0Ly8gXCI6bm9kZS5jb25uZWN0b3JzPVwiK25vZGUuY29ubmVjdG9ycy5sZW5ndGgrXG5cdFx0Ly8gXCJcIik7XG5cdH1cblxuXHRpbml0UHJvY2Vzc29yKClcblx0e1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHRpZiAodGhpcy5zcHJpbmdBbmNob3JQb2ludCAhPSBudWxsKVxuXHRcdHtcblx0XHRcdGlmICh0aGlzLmFuY2hvck9mZnNldFBvaW50ID09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRwb3NpdGlvbkxpc3QucHVzaCh0aGlzLnNwcmluZ0FuY2hvclBvaW50LmNyZWF0ZUJ5QWRkaW5nKHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuKHBvc2l0aW9uTGlzdCk7XG5cdH1cblxuXHRjYWx1bGF0ZU1vdmVtZW50RXhwKG5vZGUscG9zaXRpb25MaXN0LHJhbmRvbVN0cmVuZ3RoRmFjdG9yLHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yKVxuXHR7XG5cdFx0aWYgKHBvc2l0aW9uTGlzdC5sZW5ndGg+MClcblx0XHR7XG5cdFx0XHQvLyBsb29rIGF0IGVhY2ggcG9zaXRpb24gYW5kIG1ha2UgYSBuZXcgbGlzdCBvZiBwb3NpdGlvbnMgdGhlXG5cdFx0XHQvLyBcInJlbGF4ZWRcIiBkaXN0YW5jZSBhd2F5XG5cdFx0XHR2YXIgYW5pbWF0ZUxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHRcdHZhciB4ID0gMC4wO1xuXHRcdFx0dmFyIHkgPSAwLjA7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHBvc2l0aW9uTGlzdC5sZW5ndGg7aSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXG5cdFx0XHRcdFx0XHRwb3NpdGlvbkxpc3RbaV0sXG5cdFx0XHRcdFx0XHRyZWxheGVkRGlzdGFuY2UrKHJhbmRvbVN0cmVuZ3RoRmFjdG9yLzItcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdHggKz0gcG9zaXRpb24uZ2V0WCgpKyhyYW5kb21TdHJlbmd0aEZhY3Rvci8yLXJhbmRvbVN0cmVuZ3RoRmFjdG9yKk1hdGgucmFuZG9tKCkpO1xuXHRcdFx0XHR5ICs9IHBvc2l0aW9uLmdldFkoKSsocmFuZG9tU3RyZW5ndGhGYWN0b3IvMi1yYW5kb21TdHJlbmd0aEZhY3RvcipNYXRoLnJhbmRvbSgpKTtcdFx0XG5cdFx0XHRcdGFuaW1hdGVMaXN0LnB1c2gocG9zaXRpb24pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBmaW5kIHRoZSBhdmVyYWdlIFwicmVsYXhlZFwiIHBvc2l0aW9uXG5cdFx0XHR2YXIgYXZlcmFnZVBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHggLyBwb3NpdGlvbkxpc3QubGVuZ3RoLHkgLyBwb3NpdGlvbkxpc3QubGVuZ3RoKTtcblx0XHRcdHZhciBkaXN0YW5jZVRvQXZlcmFnZVBvc2l0aW9uID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShhdmVyYWdlUG9zaXRpb24pO1xuXG5cdFx0XHQvLyB0YWtlIHRoZSBhdmVyYWdlIHBvc2l0aW9uIGFuZCBtb3ZlIHRvd2FyZHMgaXQgYmFzZWQgdXBvbiB0aGVcblx0XHRcdC8vIGVsYXN0aWNpdHkgZmFjdG9yXG5cdFx0XHR2YXIgbW92ZVBvc2l0aW9uID0gYXZlcmFnZVBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXG5cdFx0XHRcdFx0bm9kZS5wb3NpdGlvbixcblx0XHRcdFx0XHRkaXN0YW5jZVRvQXZlcmFnZVBvc2l0aW9uICogZWxhc3RpY2l0eUZhY3RvclxuXHRcdFx0XHRcdCk7XG5cblx0XHRcdC8vIGFkZCB0aGlzIHBvc2l0aW9uIHRvIHRoZSBsaXN0IG9mIHBvaW50cyB0aGlzIG5vZGUgbmVlZHMgdG8gbW92ZVxuXHRcdFx0Ly8gdG9cblx0XHRcdG5vZGUucG9zaXRpb25Nb3ZlTGlzdC5wdXNoKG1vdmVQb3NpdGlvbik7XG5cdFx0fVxuXHR9XG5cblx0Y2FsdWxhdGVNb3ZlbWVudChub2RlLHBvc2l0aW9uTGlzdCxyYW5kb21TdHJlbmd0aEZhY3Rvcilcblx0e1xuXHRcdGlmIChwb3NpdGlvbkxpc3QubGVuZ3RoPjApXG5cdFx0e1xuXHRcdFx0Ly8gbG9vayBhdCBlYWNoIHBvc2l0aW9uIGFuZCBtYWtlIGEgbmV3IGxpc3Qgb2YgcG9zaXRpb25zIHRoZVxuXHRcdFx0Ly8gXCJyZWxheGVkXCIgZGlzdGFuY2UgYXdheVxuXHRcdFx0dmFyIGFuaW1hdGVMaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0XHR2YXIgeCA9IDAuMDtcblx0XHRcdHZhciB5ID0gMC4wO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTxwb3NpdGlvbkxpc3QubGVuZ3RoO2krKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHBvc2l0aW9uID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXlDbG9zZXN0KFxuXHRcdFx0XHRcdFx0cG9zaXRpb25MaXN0W2ldLFxuXHRcdFx0XHRcdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UrcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0eCArPSBwb3NpdGlvbi5nZXRYKCk7XG5cdFx0XHRcdHkgKz0gcG9zaXRpb24uZ2V0WSgpO1x0XHRcblx0XHRcdFx0YW5pbWF0ZUxpc3QucHVzaChwb3NpdGlvbik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGZpbmQgdGhlIGF2ZXJhZ2UgXCJyZWxheGVkXCIgcG9zaXRpb25cblx0XHRcdHZhciBhdmVyYWdlUG9zaXRpb24gPSBuZXcgUG9zaXRpb24oeCAvIHBvc2l0aW9uTGlzdC5sZW5ndGgseSAvIHBvc2l0aW9uTGlzdC5sZW5ndGgpO1xuXHRcdFx0dmFyIGRpc3RhbmNlVG9BdmVyYWdlUG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGF2ZXJhZ2VQb3NpdGlvbik7XG5cblx0XHRcdC8vIHRha2UgdGhlIGF2ZXJhZ2UgcG9zaXRpb24gYW5kIG1vdmUgdG93YXJkcyBpdCBiYXNlZCB1cG9uIHRoZVxuXHRcdFx0Ly8gZWxhc3RpY2l0eSBmYWN0b3Jcblx0XHRcdHZhciBtb3ZlUG9zaXRpb24gPSBhdmVyYWdlUG9zaXRpb24uZ2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5Q2xvc2VzdChcblx0XHRcdFx0XHRub2RlLnBvc2l0aW9uLFxuXHRcdFx0XHRcdGRpc3RhbmNlVG9BdmVyYWdlUG9zaXRpb24gKiB0aGlzLmVsYXN0aWNpdHlGYWN0b3Jcblx0XHRcdFx0XHQpO1xuXG5cdFx0XHQvLyBhZGQgdGhpcyBwb3NpdGlvbiB0byB0aGUgbGlzdCBvZiBwb2ludHMgdGhpcyBub2RlIG5lZWRzIHRvIG1vdmVcblx0XHRcdC8vIHRvXG5cdFx0XHRub2RlLnBvc2l0aW9uTW92ZUxpc3QucHVzaChtb3ZlUG9zaXRpb24pO1xuXHRcdH1cblx0fVxufVxuXG4vLyA8anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdG9yO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkNvbm5lY3RvclwiKTtcbi8vIDwvanMybm9kZT5cbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yL2Nvbm5lY3RvcicpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcblxuY2xhc3MgR3JvdXBDb25uZWN0b3IgZXh0ZW5kcyBDb25uZWN0b3Jcbntcblx0Y29uc3RydWN0b3IoY29ubmVjdG9yRGlzcGxheSxzcHJpbmdBbmNob3JQb2ludCxhbmNob3JPZmZzZXRQb2ludCxyZWxheGVkRGlzdGFuY2UsZWxhc3RpY2l0eUZhY3RvcixuYW1lKVxuXHR7XG5cdFx0c3VwZXIoR3JvdXBDb25uZWN0b3IucHJvY2Vzc0dyb3VwU3ByaW5nQ29ubmVjdG9yT25lTm9kZVRvQ29ubmVjdGVkTm9kZXMsY29ubmVjdG9yRGlzcGxheSxuYW1lKTtcblxuXHRcdHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQgPSBzcHJpbmdBbmNob3JQb2ludDtcblx0XHR0aGlzLmFuY2hvck9mZnNldFBvaW50ID0gYW5jaG9yT2Zmc2V0UG9pbnQ7XG5cdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UgPSByZWxheGVkRGlzdGFuY2U7XG5cdFx0dGhpcy5lbGFzdGljaXR5RmFjdG9yID0gZWxhc3RpY2l0eUZhY3Rvcjtcblx0fVxuXHRcblx0c3RhdGljIHByb2Nlc3NHcm91cFNwcmluZ0Nvbm5lY3Rvck9uZU5vZGVUb0Nvbm5lY3RlZE5vZGVzKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcblx0e1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xuXHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGIgPSBjb25uZWN0b3Iubm9kZXNbaV07XG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xuXHRcdFx0aWYgKGIgIT0gbm9kZSAmJiBkaXN0YW5jZTxjb25uZWN0b3IucmVsYXhlZERpc3RhbmNlKSBwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcdFx0XG5cdFx0fVxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xuXHR9XG5cblx0cHJvY2Vzc1dhbGxTcHJpbmdSZXB1bHNlT25lTm9kZShjb25uZWN0b3Isbm9kZSx0aW1lc3RhbXApXG5cdHtcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcblx0XHRmb3IodmFyIGk9MDtpPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBiID0gY29ubmVjdG9yLm5vZGVzW2ldO1xuXHRcdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShiLnBvc2l0aW9uKTtcblx0XHRcdGlmIChiICE9IG5vZGUgJiYgZGlzdGFuY2U8Y29ubmVjdG9yLnJlbGF4ZWREaXN0YW5jZSkgcG9zaXRpb25MaXN0LnB1c2goYi5wb3NpdGlvbik7XHRcdFxuXHRcdH1cblx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudChub2RlLHBvc2l0aW9uTGlzdCwwKTtcblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBHcm91cENvbm5lY3RvcjtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpHcm91cENvbm5lY3RvclwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBDb25uZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyBTaGFwZUNvbm5lY3RvciBleHRlbmRzIENvbm5lY3Rvclxue1xuXHRjb25zdHJ1Y3Rvcihub2RlLGNvbm5lY3RvckRpc3BsYXksc2hhcGUsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3Isb3V0c2lkZVJlbGF4ZWREaXN0YW5jZSxvdXRzaWRlRWxhc3RpY2l0eUZhY3RvcixuYW1lKVxuXHR7XG5cdFx0c3VwZXIoU2hhcGVDb25uZWN0b3IucHJvY2Vzc1NoYXBlQ29ubmVjdG9yT25lTm9kZVRvQ29ubmVjdGVkTm9kZXMsY29ubmVjdG9yRGlzcGxheSxuYW1lKTtcblxuXHRcdHRoaXMubm9kZSA9IG5vZGU7XG5cdFx0dGhpcy5zcHJpbmdBbmNob3JQb2ludCA9IG5vZGUucG9zaXRpb247XG5cdFx0dGhpcy5hbmNob3JPZmZzZXRQb2ludCA9IGFuY2hvck9mZnNldFBvaW50O1xuXHRcdHRoaXMucmVsYXhlZERpc3RhbmNlID0gcmVsYXhlZERpc3RhbmNlO1xuXHRcdHRoaXMuZWxhc3RpY2l0eUZhY3RvciA9IGVsYXN0aWNpdHlGYWN0b3I7XG5cdFx0dGhpcy5vdXRzaWRlUmVsYXhlZERpc3RhbmNlID0gb3V0c2lkZVJlbGF4ZWREaXN0YW5jZTtcblx0XHR0aGlzLm91dHNpZGVFbGFzdGljaXR5RmFjdG9yID0gb3V0c2lkZUVsYXN0aWNpdHlGYWN0b3I7XG5cdFx0dGhpcy5zaGFwZSA9IHNoYXBlO1xuXHR9XG5cdFxuXHRzdGF0aWMgcHJvY2Vzc1NoYXBlQ29ubmVjdG9yT25lTm9kZVRvQ29ubmVjdGVkTm9kZXMoY29ubmVjdG9yLG5vZGUsdGltZXN0YW1wKVxuXHR7XG5cdC8vXHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gbmV3IEFycmF5KCk7XG5cdFxuXHRcdFxuXHRcdGlmKCF0aGlzLnNoYXBlLmNvbnRhaW5zUG9zaXRpb24obm9kZS5wb3NpdGlvbix0aGlzLm5vZGUpKVxuXHRcdHtcblx0XHRcdC8qKioqKioqKioqKipcblx0XHRcdHZhciBvblNoYXBlTGluZVBvc2l0aW9uID0gdGhpcy5zaGFwZS5maW5kQ2xvc2VzdFBvaW50SW5TaGFwZUZyb21TdGFydGluZ1BvaW50KG5vZGUucG9zaXRpb24sdGhpcy5ub2RlKTtcblx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKG9uU2hhcGVMaW5lUG9zaXRpb24pO1xuXHRcdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnRFeHAobm9kZSxwb3NpdGlvbkxpc3QsMC4wLHRoaXMub3V0c2lkZVJlbGF4ZWREaXN0YW5jZSx0aGlzLm91dHNpZGVFbGFzdGljaXR5RmFjdG9yKTtcblx0XHRcdCoqKioqKioqKioqKioqKiovXG5cdFx0XHR2YXIgYXZlcmFnZVBvaW50VHJhbnNmb3JtZWQgPSB0aGlzLnNoYXBlLmdldEF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkKHRoaXMubm9kZSlcblx0XHRcdC8vcG9zaXRpb25MaXN0LnB1c2godGhpcy5ub2RlLnBvc2l0aW9uKTtcblx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKGF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkKTtcblx0XHRcdFxuXHRcdFx0dmFyIG91dHNpZGVSZWxheERpc3RhbmNlID0gdGhpcy5vdXRzaWRlUmVsYXhlZERpc3RhbmNlO1xuXHRcdFx0dmFyIG91dHNpZGVFbGFzdGljaXR5RmFjdG9yID0gdGhpcy5vdXRzaWRlRWxhc3RpY2l0eUZhY3Rvcjtcblx0XHRcdG91dHNpZGVFbGFzdGljaXR5RmFjdG9yID0gMC4wMjU7XG5cdFx0XHRpZihkaXN0YW5jZT5vdXRzaWRlUmVsYXhEaXN0YW5jZSoxLjI1KSBcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJpdHMgb3V0c2lkZSEhOm5vZGU9XCIrbm9kZS5uYW1lK1wiIGRpc3RhbmNlPVwiK2Rpc3RhbmNlKTtcblx0XHRcdFx0b3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IgPSAwLjAxO1xuXHRcdFx0fVxuXHRcdFx0XHQgXG5cdFx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudEV4cChcblx0XHRcdFx0bm9kZSxcblx0XHRcdFx0cG9zaXRpb25MaXN0LFxuXHRcdFx0XHQwLjAsXG5cdFx0XHRcdG91dHNpZGVSZWxheERpc3RhbmNlLFxuXHRcdFx0XHRvdXRzaWRlRWxhc3RpY2l0eUZhY3Rvcik7XG5cdFxuXHRcdFx0Ly9jb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudEV4cChub2RlLHBvc2l0aW9uTGlzdCwwLjAsMC4wLDAuNSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR2YXIgc2hhcGVBcmVhID0gdGhpcy5zaGFwZS5nZXRTaGFwZUFyZWEoKTtcblx0XHRcdHZhciBtaW5BcmVhUGVyTm9kZSA9IHNoYXBlQXJlYSAvIGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7XG5cdFx0XHQvL3ZhciBzcGFjaW5nID0gbWluQXJlYVBlck5vZGUvMjsvL01hdGguc3FydChtaW5BcmVhUGVyTm9kZSk7XG5cdFx0XHR2YXIgc3BhY2luZyA9IE1hdGguc3FydChtaW5BcmVhUGVyTm9kZSkqMS4wMTsvLyoyLjM7XG5cdFx0XHRpZihzcGFjaW5nPT0wKSBzcGFjaW5nID0gMTtcblx0XHRcdC8vdmFyIHNwYWNpbmcgPSBNYXRoLnNxcnQobWluQXJlYVBlck5vZGUpKjEuMztcblx0XHRcdC8qXG5cdFx0XHRpZihub2RlLmlzU2VsZWN0ZWQpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwibm9kZSBuYW1lOlwiK25vZGUubmFtZSk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiXHRzaGFwZUFyZWE6XCIrc2hhcGVBcmVhKTtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJcdG1pbkFyZWFQZXJOb2RlOlwiK21pbkFyZWFQZXJOb2RlKTtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJcdHNwYWNpbmc6XCIrc3BhY2luZyk7XG5cdFx0XHR9XG5cdFx0XHQqL1xuXHRcblx0XHRcdHRoaXMucmVsYXhlZERpc3RhbmNlID0gc3BhY2luZztcblx0XHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBiID0gY29ubmVjdG9yLm5vZGVzW2ldO1xuXHRcdFx0XHRcblx0XHRcdFx0Lypcblx0XHRcdFx0aWYobm9kZS5pc1NlbGVjdGVkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGQgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xuXHRcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIlx0Y2hlY2tpbmc6XCIrYi5uYW1lK1wiIGRpc3RhbmNlPVwiK2QpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmKGIgIT0gbm9kZSAmJiB0aGlzLnNoYXBlLmNvbnRhaW5zUG9zaXRpb24oYi5wb3NpdGlvbix0aGlzLm5vZGUpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShiLnBvc2l0aW9uKTtcblx0XHRcdFx0XHRpZiAoZGlzdGFuY2U8c3BhY2luZylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vaWYobm9kZS5pc1NlbGVjdGVkKSBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcblx0XG5cdFx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudEV4cChub2RlLHBvc2l0aW9uTGlzdCwwLjAsdGhpcy5yZWxheGVkRGlzdGFuY2UsdGhpcy5lbGFzdGljaXR5RmFjdG9yKTtcblx0XHRcdC8vIG1vdmUgaXQgdG8gYSBuZXcgc3BhY2luZyBkaXN0YW5jZSAoc3RpbGwgaW4gdGhlIHNoYXBlKVxuXHRcdH1cblx0XHRcblx0XHQvL2Nvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xuXHRcblx0XHQvL2lmKHNoYXBlLmNvbnRhaW5zUG9zaXRpb24oKSlcblx0XHQvLyBpZiBpdCBpcyBub3QgaW5zaWRlIHRoZSBzaGFwZSBtb3ZlIGludG8gdGhlIHNoYXBlIGZhc3QgYXMgcG9zc2libGVcblx0XHQvLyAgICAgICAgLi55b3UgY2FuIGN5Y2xlIHRocm91Z2ggdGhlIHNpZGVzIGFuZCBmaW5kIHRoZSBjbG9zZXQgaW50ZXJzZWN0aW9uIHBvaW50LlxuXHRcdC8vICAgICAgICAuLnRoaXMgY2FuIHByb2JhYmx5IGJlIG9wdGltaXplZCBieSBsb29raW5nIGF0IGVhY2ggcG9pbnQgZmlyc3Rcblx0XHQvLyBpZiBpdCBpcyBpbnNpZGUgdGhlIHNoYXBlIHRoZW4gOlxuXHRcdC8vICAgICAgICAuLmZpbmQgaGUgYXZlcmFnZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBwb2ludHMgKG9ubHkgY2hlY2sgdGhvc2Ugc28gY2xvc2U/IT8hP19cblx0XHQvLyAgICAgICAgaWYgaXRzIGRpc3RhbmNlIGlzIGdyZWF0IHRoYW4gdGhlIGF2ZXJhZ2UgdGhlbiBtb3ZlIGF3YXkgZm9yIHRoZSBDT04gb2YgdGhlIHNhbXBsaW5nXG5cdFx0Ly8gICAgICAgIGlmIHRoZSBkaXN0YW5jZSBpcyBsZXNzIHRoYW4gdGhlIGF2ZXJhZ2UgaGVuIG1vdmUgdG93YXJkcyB0aGUgQ09NIG9mIHRoZSBzYW1wbGluZ1xuXHRcdC8vICAgICAgLi50aGUgYXZlcmFnZSBzcGFjZSBiZSBhYmxlIHRvIHRvIGJlIGNhbGN1bGF0ZWQgXG5cdFx0Ly9cblx0XHQvLyAgICAgIGZ1bmN0aW9uIHRvIGZpbmQgdGhlIGF2ZXJhZ2UgZGlzdGFuY2UgYmV0d2VlbiBhIGxpc3Qgb2YgcG9pbnRzXG5cdFx0Ly8vICAgICBpZiB5b3UgbG9vayBhdCB0aGUgYXJlYSB5b3Ugc2hvdWxkIGJlIGFibGUgdG8gZGl2ZSBpdCBieSB0aGUgc2l6ZSBvIHRoZSBzYW1wbGluZ1xuXHRcdC8vICAgICAgdG8gZ2V0IHRoaXMgYXZlcmFnZS4uLi5cblx0XHQvL1x0XHRpZiB3ZSBsaW1pdGVkIGl0IHRvIGEgcGUgc2xpY2UgaXQgaXMgZWFzeS4uLiBhIHNsaWNlIG9mIHRoZSBwaWUncyBhcmVhIGlzIGVhc3kgdG8gY2FsY3VsYXRlXG5cdFx0Ly9cblx0XHQvL1x0XHRmb3IgYSBjbG9zZWQgbGlzdCBvZiBwb2x5Z29ucyBpdCBpcyBhIHN1bSBvZiB0cmlhbmdsZXMuLi4gc2hvdWxkIGNpcmNsZXNcblx0XHQvLyBcdFx0YmUgYSBzcGVjaWFsIGNhc2U/XG5cdFx0Lypcblx0XHRmb3IodmFyIGk9MDtpPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBiID0gY29ubmVjdG9yLm5vZGVzW2ldO1xuXHRcdFx0aWYgKGIgIT0gbm9kZSAmJiBkaXN0YW5jZTxjb25uZWN0b3IucmVsYXhlZERpc3RhbmNlKVxuXHRcdFx0e1xuXHRcdFx0XHRwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcdFx0XG5cdFx0XHR9XG5cdFxuXHRcdFx0XG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xuXHRcdFx0aWYgKGIgIT0gbm9kZSAmJiBkaXN0YW5jZTxjb25uZWN0b3IucmVsYXhlZERpc3RhbmNlKSBwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcdFx0XG5cdFx0fVxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xuXHRcdCovXG5cdH1cblxuXHRwcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcblx0e1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xuXHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGIgPSBjb25uZWN0b3Iubm9kZXNbaV07XG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xuXHRcdFx0aWYgKGIgIT0gbm9kZSAmJiBkaXN0YW5jZTxjb25uZWN0b3IucmVsYXhlZERpc3RhbmNlKSBwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcdFx0XG5cdFx0fVxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlQ29ubmVjdG9yO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlNoYXBlQ29ubmVjdG9yXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2Nvbm5lY3Rvci9jb25uZWN0b3InKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIFNwcmluZ0Nvbm5lY3RvciBleHRlbmRzIENvbm5lY3Rvclxue1xuXHRjb25zdHJ1Y3Rvcihjb25uZWN0b3JEaXNwbGF5LHNwcmluZ0FuY2hvclBvaW50LGFuY2hvck9mZnNldFBvaW50LHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yLG5hbWUpXG5cdHtcblx0XHRzdXBlcihTcHJpbmdDb25uZWN0b3IucHJvY2Vzc1NwcmluZ0Nvbm5lY3Rvck9uZUJlYXN0aWVUb0Nvbm5lY3RlZE5vZGVzLGNvbm5lY3RvckRpc3BsYXksbmFtZSk7XG5cdFx0dGhpcy5zcHJpbmdBbmNob3JQb2ludCA9IHNwcmluZ0FuY2hvclBvaW50O1xuXHRcdHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQgPSBhbmNob3JPZmZzZXRQb2ludDtcblx0XHR0aGlzLnJlbGF4ZWREaXN0YW5jZSA9IHJlbGF4ZWREaXN0YW5jZTtcblx0XHR0aGlzLmVsYXN0aWNpdHlGYWN0b3IgPSBlbGFzdGljaXR5RmFjdG9yO1xuXHR9XG5cblx0c3RhdGljIHByb2Nlc3NTcHJpbmdDb25uZWN0b3JPbmVCZWFzdGllVG9Db25uZWN0ZWROb2Rlcyhjb25uZWN0b3Isbm9kZSx0aW1lc3RhbXApXG5cdHtcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy92YXIgcG9zaXRpb25MaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0Zm9yKHZhciBpPTA7aTxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgYiA9IGNvbm5lY3Rvci5ub2Rlc1tpXTtcblx0XHRcdHZhciBkaXN0YW5jZSA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XG5cdFx0XHRpZiAoYiAhPSBub2RlKSBwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcdFx0XG5cdFx0fVxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDEuMCk7XG5cdH1cbn1cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gU3ByaW5nQ29ubmVjdG9yO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlNwcmluZ0Nvbm5lY3RvclwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBDb25uZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyAgV2FsbENvbm5lY3RvciBleHRlbmRzIENvbm5lY3Rvclxue1xuXHRjb25zdHJ1Y3Rvcihjb25uZWN0b3JEaXNwbGF5LHNwcmluZ0FuY2hvclBvaW50LGFuY2hvck9mZnNldFBvaW50LHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yLG5hbWUpXG5cdHtcblx0XHQvL3N1cGVyKFdhbGxDb25uZWN0b3IucHJvdG90eXBlLnByb2Nlc3NXYWxsU3ByaW5nUmVwdWxzZU9uZU5vZGUsY29ubmVjdG9yRGlzcGxheSk7XG5cdFx0c3VwZXIoV2FsbENvbm5lY3Rvci5wcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlLGNvbm5lY3RvckRpc3BsYXksbmFtZSk7XG5cblx0XHR0aGlzLnNwcmluZ0FuY2hvclBvaW50ID0gc3ByaW5nQW5jaG9yUG9pbnQ7XG5cdFx0dGhpcy5hbmNob3JPZmZzZXRQb2ludCA9IGFuY2hvck9mZnNldFBvaW50O1xuXHRcdHRoaXMucmVsYXhlZERpc3RhbmNlID0gcmVsYXhlZERpc3RhbmNlO1xuXHRcdHRoaXMuZWxhc3RpY2l0eUZhY3RvciA9IGVsYXN0aWNpdHlGYWN0b3I7XG5cdH1cblxuXHRzdGF0aWMgcHJvY2Vzc1dhbGxTcHJpbmdSZXB1bHNlT25lTm9kZShjb25uZWN0b3Isbm9kZSx0aW1lc3RhbXApXG5cdHtcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gY29ubmVjdG9yLmluaXRQcm9jZXNzb3IoKTtcblx0XHRpZigobm9kZS5wb3NpdGlvbi5nZXRYKCktbm9kZS53aWR0aC8yKTwwKVxuXHRcdHtcblx0XHRcdG5vZGUucG9zaXRpb24uc2V0WCgwK25vZGUud2lkdGgvMik7XG5cdFx0fVxuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFgoKStub2RlLndpZHRoLzIpPm5vZGUuY2FudmFzSG9sZGVyLmdldFdpZHRoKCkpXG5cdFx0e1xuXHRcdFx0bm9kZS5wb3NpdGlvbi5zZXRYKG5vZGUuY2FudmFzSG9sZGVyLmdldFdpZHRoKCktbm9kZS53aWR0aC8yKTtcdFxuXHRcdH1cblx0XHRpZigobm9kZS5wb3NpdGlvbi5nZXRZKCktbm9kZS5oZWlnaHQvMik8MClcblx0XHR7XG5cdFx0XHRub2RlLnBvc2l0aW9uLnNldFkoMCtub2RlLmhlaWdodC8yKTtcblx0XHR9XG5cdFx0aWYoKG5vZGUucG9zaXRpb24uZ2V0WSgpK25vZGUuaGVpZ2h0LzIpPm5vZGUuY2FudmFzSG9sZGVyLmdldEhlaWdodCgpKVxuXHRcdHtcblx0XHRcdG5vZGUucG9zaXRpb24uc2V0WShub2RlLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKS1ub2RlLmhlaWdodC8yKTtcblx0XHR9XG5cdFx0XG5cdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMCk7XG5cdH1cbn1cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gV2FsbENvbm5lY3RvcjtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpXYWxsQ29ubmVjdG9yXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJjbGFzcyBDb25uZWN0b3JEaXNwbGF5XG57XG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxuXHR7XG5cdFx0Q29ubmVjdG9yRGlzcGxheS5jcmVhdGVDb25uZWN0b3JEaXNwbGF5KHRoaXMsZGlzcGxheUluZm8pO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZUNvbm5lY3RvckRpc3BsYXkoY29ubmVjdG9yRGlzcGxheSxkaXNwbGF5SW5mbylcblx0e1xuXHRcdGNvbm5lY3RvckRpc3BsYXkuZGlzcGxheUluZm8gPSBkaXNwbGF5SW5mbztcblx0fVxuXG5cdGRyYXdDb25uZWN0b3IoY2FudmFzSG9sZGVyLGNvbm5lY3Rvcixub2RlKVxuXHR7XG5cdH1cblxuXHRjb250YWluc1Bvc3Rpb24ocG9zaXRpb24sY29ubmVjdG9yKVxuXHR7XG5cdFx0cmV0dXJuKGZhbHNlKTtcblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3JEaXNwbGF5O1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkNvbm5lY3RvckRpc3BsYXlcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBDb25uZWN0b3JEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5Jyk7XG5cbmNsYXNzIENvbm5lY3RvckRpc3BsYXlFbXB0eSBleHRlbmRzIENvbm5lY3RvckRpc3BsYXlcbntcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pIFxuXHR7XG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xuXHR9XG5cblx0ZHJhd0Nvbm5lY3RvcihjYW52YXNIb2xkZXIsY29ubmVjdG9yLG5vZGUpXG5cdHtcblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gQ29ubmVjdG9yRGlzcGxheUVtcHR5O1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkNvbm5lY3RvckRpc3BsYXlFbXB0eVwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBDYW52YXNIb2xkZXI9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVyJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyBOb2RlXG57XG4gIGNvbnN0cnVjdG9yKG5hbWUscG9zaXRpb24sY2FudmFzSG9sZGVyLGdyYXBoRGF0YUtleSxpbmZvRGF0YSlcbiAge1xuXHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0dGhpcy5jYW52YXNIb2xkZXIgPSBjYW52YXNIb2xkZXI7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdHRoaXMuZ3JhcGhEYXRhS2V5ID0gZ3JhcGhEYXRhS2V5O1xuXHRcdHRoaXMuZ3JhcGhEYXRhID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0R3JhcGhEYXRhKHRoaXMuZ3JhcGhEYXRhS2V5KTtcblx0XHRpZihpbmZvRGF0YT09bnVsbClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhcImluZm8gZGF0YSB3YXMgbnVsbCA6IFwiK3RoaXMubmFtZSk7XG5cdFx0XHRpbmZvRGF0YSA9IHt9O1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiaW5mbyBkYXRhIHBhc3NlZCBpbiBmb3IgIDogXCIrdGhpcy5uYW1lICtcIiBpbmZvRGF0YT1cIitDb21tb24udG9TdHJpbmcoaW5mb0RhdGEpKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJpbmZvIGRhdGEgcGFzc2VkIGluIGZvciAgOiBcIit0aGlzLm5hbWUpO1xuXHRcdH1cblx0XHR0aGlzLmluZm9EYXRhID0gaW5mb0RhdGE7XG5cdFx0XG5cdFx0dGhpcy5ub2RlcyA9IG5ldyBBcnJheSgpO1xuXHRcdHRoaXMubm9kZU1hcCA9IHt9O1xuXHRcdHRoaXMucG9zaXRpb25Nb3ZlTGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcdHRoaXMuY29ubmVjdG9ycyA9IG5ldyBBcnJheSgpO1xuXHRcdHRoaXMuaXNBbmltYXRlZCA9IHRydWU7XG5cdFx0dGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XG5cdFx0dGhpcy5sYXllcj0wO1xuXG5cdFx0XG5cdFx0Ly9pZighdGhpcy5pbmZvRGF0YS5ub2RlS2V5KVxuXHRcdGlmKCF0aGlzLmluZm9EYXRhLmhhc093blByb3BlcnR5KFwibm9kZUtleVwiKSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhcIm1ha2luZyBuZXcgbm9kZUtleSBmb3IgOiBcIit0aGlzLm5hbWUpO1xuXHRcdFx0dGhpcy5pbmZvRGF0YS5ub2RlS2V5ID1cblx0XHRcdHtcblx0XHRcdFx0XHRrZXk6Q29tbW9uLmdldFRpbWVLZXkoKSxcblx0XHRcdFx0XHRub2RlSWQ6XCJyb290XCIsXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuaW5mb0RhdGEubm9kZUtleS5wYXJlbnROb2RlS2V5ID0gZnVuY3Rpb24oKXtyZXR1cm4oXCJcIik7fTtcblx0XHRcblx0XHR0aGlzLmNvbm5lY3RvclBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKDAsMCk7XG5cblx0XHRpZih0aGlzLmdyYXBoRGF0YS5pbml0R3JhcGhEYXRhIT1udWxsKSB0aGlzLmdyYXBoRGF0YS5pbml0R3JhcGhEYXRhKHRoaXMpO1x0XHRcbiAgfVxuXG4gIFxuICBnZXRDbGllbnRKc29uKClcbiAge1xuXHQgIHZhciBqc29uID0gdGhpcy5nZXROb2RlSnNvbih7fSk7XG5cdCAgXG5cdCAganNvbi5ub2RlVHJlZSA9IHRoaXMuZ2V0Q2xpZW50SnNvbk5vZGVUcmVlKCk7XG5cdCAgXG5cdCAganNvbi5ub2RlTWFwID0ge307XG5cdCAgdmFyIGFsbE5vZGVzQXJyYXkgPSB0aGlzLmdldEFsbE5vZGVzQXJyYXkobmV3IEFycmF5KCkpO1xuXHQgIGZvcih2YXIgaT0wO2k8YWxsTm9kZXNBcnJheS5sZW5ndGg7aSsrKVxuXHQgIHtcblx0XHQgIHZhciBub2RlID0gYWxsTm9kZXNBcnJheVtpXTtcblx0XHQgIGpzb24ubm9kZU1hcFtub2RlLmdldE5vZGVLZXkoKV0gPSBub2RlLmdldE5vZGVKc29uKHt9KTtcblx0ICB9XG5cdCAgXG5cdCAganNvbi5jb25uZWN0b3JNYXAgPSB7fTtcblx0ICB2YXIgYWxsQ29ubmVjdG9yc0FycmF5ID0gdGhpcy5nZXRBbGxDb25uZWN0b3JzQXJyYXkobmV3IEFycmF5KCkpO1x0ICBcblx0ICBmb3IodmFyIGk9MDtpPGFsbENvbm5lY3RvcnNBcnJheS5sZW5ndGg7aSsrKVxuXHQgIHtcblx0XHQgIHZhciBjb25uZWN0b3IgPSBhbGxDb25uZWN0b3JzQXJyYXlbaV07XG5cdFx0ICBqc29uLmNvbm5lY3Rvck1hcFtjb25uZWN0b3IuZ2V0Q29ubmVjdG9yS2V5KCldID0gY29ubmVjdG9yLmdldENsaWVudEpzb24oe30pO1xuXHQgIH1cblxuXHQgIEpTT04uc3RyaW5naWZ5KGpzb24pO1xuXHQgIHJldHVybihqc29uKVxuICB9XG4gIFxuICBnZXROb2RlSnNvbihqc29uKVxuICB7XG5cdCAganNvbi5uYW1lID0gdGhpcy5uYW1lO1xuXHQgIGpzb24uZ3JhcGhEYXRhS2V5ID0gdGhpcy5ncmFwaERhdGFLZXk7XG5cdCAganNvbi5pbmZvRGF0YSA9IHRoaXMuaW5mb0RhdGE7XG5cdCAgLy9qc29uLmluZm9EYXRhLm5vZGVLZXkgPSB0aGlzLmdldE5vZGVLZXkoKTtcblx0ICBqc29uLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5nZXRDbGllbnRKc29uKCk7XG5cdCAganNvbi5jb25uZWN0b3JzID0gbmV3IEFycmF5KCk7XG5cdCAgZm9yKHZhciBpPTA7aTx0aGlzLmNvbm5lY3RvcnMubGVuZ3RoO2krKykganNvbi5jb25uZWN0b3JzLnB1c2godGhpcy5jb25uZWN0b3JzW2ldLmdldENvbm5lY3RvcktleSgpKTtcblxuXHQgIHJldHVybihqc29uKTtcbiAgfVxuICBcbiAgZ2V0QWxsTm9kZXNBcnJheShhcnJheU9mTm9kZXMpXG4gIHtcblx0ICBmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGVuZ3RoO2krKylcblx0ICB7XG5cdFx0ICB2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XG5cdFx0ICBhcnJheU9mTm9kZXMucHVzaChub2RlKTtcblx0XHQgIG5vZGUuZ2V0QWxsTm9kZXNBcnJheShhcnJheU9mTm9kZXMpO1xuXHQgIH1cblx0ICByZXR1cm4oYXJyYXlPZk5vZGVzKTtcbiAgfVxuICBcbiAgZ2V0QWxsQ29ubmVjdG9yc0FycmF5KGFycmF5T2ZDb25uZWN0b3JzKVxuICB7XG5cdCAgZm9yKHZhciBpPTA7aTx0aGlzLm5vZGVzLmxlbmd0aDtpKyspXG5cdCAge1xuXHRcdCAgdmFyIG5vZGUgPSB0aGlzLm5vZGVzW2ldO1xuXHRcdCAgZm9yKHZhciBqPTA7ajxub2RlLmNvbm5lY3RvcnMubGVuZ3RoO2orKylcblx0XHQgIHtcblx0XHRcdCAgdmFyIGNvbm5lY3RvciA9IG5vZGUuY29ubmVjdG9yc1tqXTtcblx0XHRcdCAgYXJyYXlPZkNvbm5lY3RvcnMucHVzaChjb25uZWN0b3IpO1xuXHRcdCAgfVxuXHRcdCAgbm9kZS5nZXRBbGxDb25uZWN0b3JzQXJyYXkoYXJyYXlPZkNvbm5lY3RvcnMpO1xuXHQgIH1cblx0ICByZXR1cm4oYXJyYXlPZkNvbm5lY3RvcnMpO1xuICB9XG4gIFxuICAgIFxuICBnZXRDbGllbnRKc29uTm9kZVRyZWUoKVxuICB7XG5cdCAgdmFyIGpzb24gPSB7fTtcblx0ICBqc29uLm5vZGVLZXkgPSB0aGlzLmdldE5vZGVLZXkoKTtcblxuXHQgIGpzb24ubm9kZXMgPSBuZXcgQXJyYXkoKTtcblx0ICBmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGVuZ3RoO2krKylcblx0ICB7XG5cdFx0ICBqc29uLm5vZGVzLnB1c2godGhpcy5ub2Rlc1tpXS5nZXRDbGllbnRKc29uTm9kZVRyZWUoKSk7XHQgIFxuXHQgIH1cblx0ICBKU09OLnN0cmluZ2lmeShqc29uKTtcblx0ICByZXR1cm4oanNvbilcbiAgfVxuICBcbiAgXG4gIGRyYXdDYW52YXModGltZXN0YW1wKVxuICB7XG4gIFx0dGhpcy5zZXRBbmltYXRpb25UaW1lcygpO1xuXG4gIFx0dGhpcy5jbGVhckNhbnZhcygpO1xuICBcdFxuICAgICAgZm9yKHZhciBpPTA7aTx0aGlzLm5vZGVzLmxlbmd0aDtpKyspXG4gICAgICB7XG4gICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGVzW2ldO1xuICAgICAgICAgIGlmKHRoaXMuaXNBbmltYXRlZCkgbm9kZS5hbmltYXRlQ2FsY3VsYXRlKHRpbWVzdGFtcCk7XG4gICAgICB9XG5cbiAgICAgIGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxuICAgICAge1xuICAgICAgXHR2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XG4gICAgICBcdGlmKHRoaXMuaXNBbmltYXRlZCkgIG5vZGUuYW5pbWF0ZUZpbmFsaXplKHRpbWVzdGFtcCk7XG4gICAgICBcdG5vZGUuZHJhd0NhbnZhcyh0aW1lc3RhbXApO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZih0aGlzLmNhbnZhc0hvbGRlci5pc0RyYXdhYmxlKCkpXG4gICAgICB7XG4gICAgXHQgIHRoaXMuZHJhd0Nvbm5lY3RvcnMoKTsgXG4gICAgXHQgIHRoaXMuZHJhd05vZGVzKCk7XG4gICAgICB9XG4gICAgICBpZih0aGlzLmV4dHJhQW5pbWF0aW9uIT1udWxsKSB0aGlzLmV4dHJhQW5pbWF0aW9uKHRpbWVzdGFtcCk7XG4gICAgICBcbiAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgdGhpcy5kZWJ1Z0Z1bmN0aW9uKCk7XG4gIH1cblxuXG5cdGdldE5vZGVVaURpc3BsYXkobm9kZSlcblx0e1xuXHRcdHJldHVybih0aGlzLm5hbWUpO1xuXHR9XG5cdFxuXHRnZXROb2RlS2V5KClcblx0e1xuICAgXHQgICAgLy9jb25zb2xlLmxvZyhcIk5vZGU6Z2V0Tm9kZUtleTpTVEFSVDpuYW1lPVwiK3RoaXMubmFtZSk7XG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiTm9kZTpnZXROb2RlS2V5OlNUQVJUOmluZm9EYXRhPVwiK0NvbW1vbi50b1N0cmluZyh0aGlzLmluZm9EYXRhKSk7XG5cblx0XHQvL2lmKCF0aGlzLm5vZGVLZXkpIGNvbnNvbGUubG9nKFwiWFhYWFhYWFhYWFg6XCIrdGhpcy5uYW1lKTtcbiAgIFx0ICAgIC8vdmFyIGtleSA9IHRoaXMubm9kZUtleS5wYXJlbnROb2RlS2V5KCkrXCI6XCIrdGhpcy5ub2RlS2V5Lm5vZGVJZCtcIjpcIit0aGlzLm5vZGVLZXkudHMuZ2V0VGltZSgpO1xuICAgXHQgICAgLy9jb25zb2xlLmxvZyhcIi4uLi4uZ2V0Tm9kZUtleTpFTkQ6bmFtZT1cIit0aGlzLm5hbWUpO1xuICAgXHQgICAgdmFyIGtleSA9IHRoaXMuaW5mb0RhdGEubm9kZUtleS5wYXJlbnROb2RlS2V5KCkrXCI6XCIrdGhpcy5pbmZvRGF0YS5ub2RlS2V5Lm5vZGVJZCtcIl9cIit0aGlzLmluZm9EYXRhLm5vZGVLZXkua2V5O1xuXHRcdHJldHVybihrZXkpO1xuXHRcdFxuXHR9XG5cdC8qXG5cdCAqIFx0XHR0aGlzLm5vZGVLZXkgPSBcblx0XHRcdHtcblx0XHRcdFx0dHM6bmV3IERhdGUoKSxcblx0XHRcdFx0cGFyZW50Tm9kZUtleTpmdW5jdGlvbigpe3JldHVybihcInJvb3RcIik7fSxcblx0XHRcdFx0bm9kZUlkOi0xLFxuXHRcdFx0fVxuXHQgKi9cblx0XG5cdGRvZXNOb2RlRXhpc3Qobm9kZUtleSlcblx0e1xuXHRcdHJldHVybiggdGhpcy5ub2RlTWFwLmhhc093blByb3BlcnR5KG5vZGVLZXkpICk7XG5cdH1cblx0XG5cdGdldE5vZGUobm9kZUtleSlcblx0e1xuXHRcdGlmKCF0aGlzLmRvZXNOb2RlRXhpc3Qobm9kZUtleSkpXG5cdFx0e1xuXHRcdFx0T2JqZWN0LmtleXModGhpcy5ub2RlTWFwKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJrZXk9XCIra2V5KVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0dGhyb3cgXCJub2RlS2V5IGRvZXMgbm90IGV4aXN0IDogJ1wiK25vZGVLZXkrXCInXCI7XG5cdFx0fVxuXHRcdHJldHVybih0aGlzLm5vZGVNYXBbbm9kZUtleV0pO1xuXHR9XG5cdFxuXHRnZXROb2RlTGlzdEZyb21NYXAoKVxuXHR7XG5cdFx0dmFyIG5vZGVMaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0T2JqZWN0LmtleXModGhpcy5ub2RlTWFwKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0bm9kZUxpc3QucHVzaChub2RlTWFwW2tleV0pO1xuXHRcdH0pO1xuXHRcdHJldHVybihub2RlTGlzdCk7XG5cdH1cblx0XG5cdGFkZE5vZGUobm9kZSlcblx0e1xuXHRcdHRoaXMubm9kZXMucHVzaChub2RlKTtcbiAgIFx0ICAgIC8vY29uc29sZS5sb2coXCJOb2RlOmFkZE5vZGU6cGFyZW50Lm5hbWU9XCIrdGhpcy5uYW1lKyBcIiB0b0FkZC5uYW1lPVwiK25vZGUubmFtZSk7XG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiLi4uLi5hZGROb2RlOnBhcmVudC5uYW1lPVwiK3RoaXMubmFtZSsgXCIgZ2V0Tm9kZUtleSgpPVwiK3RoaXMuZ2V0Tm9kZUtleSgpKTtcblx0XHRcblx0XHRpZihub2RlLmluZm9EYXRhLm5vZGVLZXkubm9kZUlkPT1cInJvb3RcIikgbm9kZS5pbmZvRGF0YS5ub2RlS2V5Lm5vZGVJZCA9IHRoaXMubm9kZXMubGVuZ3RoO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRub2RlLmluZm9EYXRhLm5vZGVLZXkucGFyZW50Tm9kZUtleSA9IGZ1bmN0aW9uKCl7IHJldHVybihzZWxmLmdldE5vZGVLZXkoKSk7IH07XG5cdFx0XG5cdFx0Ly9jb25zb2xlLmxvZyhDb21tb24udG9TdHJpbmcodGhpcy5jYW52YXNIb2xkZXIpKTtcblxuXHRcdG5vZGUuY2FudmFzSG9sZGVyID0gdGhpcy5jYW52YXNIb2xkZXIuY2xvbmUobm9kZS5wb3NpdGlvbik7XG5cdFx0Ly9jb25zb2xlLmxvZyhcImFkZE5vZGUgbm9kZS5jYW52YXNIb2xkZXI6XCIrQ29tbW9udG9TdHJpbmcobm9kZS5jYW52YXNIb2xkZXIpKTtcblx0XHR0aGlzLm5vZGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHQgIFx0ICByZXR1cm4oYS5sYXllci1iLmxheWVyKTtcblx0ICBcdH0pO1x0XG5cdFx0XG5cdFx0dGhpcy5ub2RlTWFwW25vZGUuZ2V0Tm9kZUtleSgpXSA9IG5vZGU7XG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiLi4uLi5hZGROb2RlOkFEREVEOnBhcmVudC5uYW1lPVwiK3RoaXMubmFtZSsgXCIgYWRkZWQubmFtZT1cIitub2RlLm5hbWUpO1xuICAgXHQgICAgLy9jb25zb2xlLmxvZyhcIi4uLi4uYWRkTm9kZTpBRERFRDpwYXJlbnQubmFtZT1cIit0aGlzLm5hbWUrIFwiIGdldE5vZGVLZXkoKT1cIit0aGlzLmdldE5vZGVLZXkoKSk7XG5cblx0fVxuXHRcblx0cmVtb3ZlTm9kZShub2RlKVxuXHR7XG5cdFx0Q29tbW9uLnJlbW92ZUl0ZW1Gcm9tQXJyYXkodGhpcy5ub2Rlcyxub2RlKTtcblx0XHRkZWxldGUgdGhpcy5ub2RlTWFwW25vZGUuZ2V0Tm9kZUtleSgpXTtcblxuXHR9XG5cdFxuXHRjbGVhckNhbnZhcyh0aW1lc3RhbXApXG5cdHtcblx0fVxuXHRcblx0ZHJhdygpXG5cdHtcblx0fVxuXHRcblx0XG5cdGRyYXdDb25uZWN0b3JzKHRpbWVzdGFtcClcblx0e1xuXHRcdGlmKHRoaXMuaXNWaXNhYmxlKSBcblx0XHR7XG5cdFx0ICAgIGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxuXHRcdCAgICB7XG5cdFx0ICAgIFx0dmFyIG5vZGUgPSB0aGlzLm5vZGVzW2ldO1xuXHRcdCAgICBcdGZvcih2YXIgaj0wO2o8bm9kZS5jb25uZWN0b3JzLmxlbmd0aDtqKyspXG5cdFx0ICAgIFx0e1xuXHRcdCAgICBcdFx0dmFyIGNvbm5lY3RvciA9IG5vZGUuY29ubmVjdG9yc1tqXTtcblx0XHQgICAgXHRcdGNvbm5lY3Rvci5jb25uZWN0b3JEaXNwbGF5LmRyYXdDb25uZWN0b3IodGhpcy5jYW52YXNIb2xkZXIsY29ubmVjdG9yLG5vZGUpO1xuXHRcdCAgICAgICAgfVxuXHRcdCAgICB9XG5cdFx0fVxuXHR9XG5cdFxuXHRkcmF3Tm9kZXModGltZXN0YW1wKVxuXHR7XG5cdFx0aWYodGhpcy5pc1Zpc2FibGUpIFxuXHRcdHtcblx0XHQgICBcdGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxuXHRcdCAgIFx0e1xuXHRcdCAgIFx0XHR2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07IFxuXHRcdCAgIFx0XHRpZih0aGlzLmlzVmlzYWJsZSkgbm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZHJhd05vZGUodGhpcy5jYW52YXNIb2xkZXIsbm9kZSk7XG5cdFx0ICAgXHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRzZXRBbmltYXRpb25UaW1lcyh0aW1lc3RhbXApXG5cdHtcblx0fVxuXHRcblx0ZGVidWdGdW5jdGlvbigpXG5cdHtcblx0fVxuXHRcblx0Z2V0Tm9kZUNvbnRhaW5pbmdQb3NpdGlvbihwb3NpdGlvbilcblx0e1xuXHRcdHZhciBmb3VuZE5vZGUgPSBudWxsO1xuXHRcblx0ICAgIGZvciAodmFyIGk9dGhpcy5ub2Rlcy5sZW5ndGgtMTtpPj0wO2ktLSlcblx0ICAgIHtcblx0ICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XG5cdCAgICAgICAgaWYobm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuY29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKSlcblx0ICAgICAgICB7XG5cdCAgICAgICAgXHRmb3VuZE5vZGUgPSBub2RlO1xuXHQgICAgICAgIFx0YnJlYWs7XG5cdCAgICAgICAgfVxuXHQgICAgfVxuXHQgICAgcmV0dXJuKGZvdW5kTm9kZSk7XG5cdH1cblx0XG5cdFxuXHRcblx0YW5pbWF0ZUNhbGN1bGF0ZSh0aW1lc3RhbXApXG5cdHtcblx0XHRpZih0aGlzLmlzQW5pbWF0ZWQpXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbm5lY3RvcnMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBjb25uZWN0b3IgPSB0aGlzLmNvbm5lY3RvcnNbaV07XG5cdFx0XHRcdGNvbm5lY3Rvci5leGVjdXRlQ29ubmVjdG9yRnVuY3Rpb24odGltZXN0YW1wLHRoaXMpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRhbmltYXRlRmluYWxpemUodGltZXN0YW1wKVxuXHR7XG5cdFx0Ly9pZih0aGlzLmlzQW5pbWF0ZWQpXG5cdFx0e1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbm5lY3RvcnMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuc2V0TmV3UG9zaXRpb24oKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5sZW5ndGggPSAwO1xuXHRcblx0XHR9XG5cdH1cblx0XG5cdGNvbnRhaW5zUG9zdGlvbihwb3NpdGlvbilcblx0e1xuXHRcdHJldHVybihcblx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0KHRoaXMucG9zaXRpb24uZ2V0WCgpLXRoaXMud2lkdGgvMik8PXBvc2l0aW9uLmdldFgoKSAmJlxuXHRcdFx0XHRcdFx0KHRoaXMucG9zaXRpb24uZ2V0WCgpK3RoaXMud2lkdGgvMik+PXBvc2l0aW9uLmdldFgoKSAmJlxuXHRcdFx0XHRcdFx0KHRoaXMucG9zaXRpb24uZ2V0WSgpLXRoaXMuaGVpZ2h0LzIpPD1wb3NpdGlvbi5nZXRZKCkgJiZcblx0XHRcdFx0XHRcdCh0aGlzLnBvc2l0aW9uLmdldFkoKSt0aGlzLmhlaWdodC8yKT49cG9zaXRpb24uZ2V0WSgpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdH1cblx0XG5cdHNldE5ld1Bvc2l0aW9uKClcblx0e1xuXHRcdGlmKHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5sZW5ndGg9PTApICB0aGlzLnBvc2l0aW9uTW92ZUxpc3QucHVzaCh0aGlzLnBvc2l0aW9uKTtcdFxuXHRcdHZhciBuZXdQb3NpdGlvbiA9IG5ldyBQb3NpdGlvbigwLDApO1xuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb3NpdGlvbk1vdmVMaXN0Lmxlbmd0aDsgaSsrKVxuXHQgICAge1xuXHQgICAgICAgIHZhciBvbmVQb3NpdGlvbiA9ICB0aGlzLnBvc2l0aW9uTW92ZUxpc3RbaV07XG5cdCAgICAgICAgbmV3UG9zaXRpb24uc2V0WChuZXdQb3NpdGlvbi5nZXRYKCkrb25lUG9zaXRpb24uZ2V0WCgpKTtcblx0ICAgICAgICBuZXdQb3NpdGlvbi5zZXRZKG5ld1Bvc2l0aW9uLmdldFkoKStvbmVQb3NpdGlvbi5nZXRZKCkpO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgbmV3WCA9IG5ld1Bvc2l0aW9uLmdldFgoKSAvIHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5sZW5ndGg7XG5cdFx0dmFyIG5ld1kgPSBuZXdQb3NpdGlvbi5nZXRZKCkgLyB0aGlzLnBvc2l0aW9uTW92ZUxpc3QubGVuZ3RoO1xuXHRcdFxuXHRcdHRoaXMucG9zaXRpb24uc2V0WChuZXdYKTtcblx0XHR0aGlzLnBvc2l0aW9uLnNldFkobmV3WSk7XHRcdFxuXHR9XG5cbn1cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gTm9kZTtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJjbGFzcyBDYW52YXNEZWZcbntcblx0Y29uc3RydWN0b3IoKVxuXHR7XHRcdFxuXHR9XG5cdFxuXHRnZXRXb3JsZERpc3BhbHkoKVxuXHR7XG5cdFx0dGhyb3cgXCJDYW52YXNEZWYuZ2V0V29ybGREaXNwYWx5IG5vdCBkZWZpbmVkXCI7XG5cdH1cblx0XG5cdGdldFdvcmxkRGVmYXVsdHMoKVxuXHR7XG5cdFx0dGhyb3cgXCJDYW52YXNEZWYuZ2V0V29ybGREZWZhdWx0cyBub3QgZGVmaW5lZFwiO1xuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0RlZjtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpDYW52YXNEZWZcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyBDYW52YXNIb2xkZXJcbntcblx0Y29uc3RydWN0b3IoY2FudmFzTmFtZSx3b3JsZERlZilcblx0e1xuXHRcdHRoaXMuY2FudmFzTmFtZSA9IGNhbnZhc05hbWU7XG5cdFx0dGhpcy53b3JsZERlZiA9IHdvcmxkRGVmO1x0XHRcblx0XHR0aGlzLm9yaWdpbiA9IG5ldyBQb3NpdGlvbigwLDApO1xuXHRcdHRoaXMuaW5pdChjYW52YXNOYW1lLHdvcmxkRGVmKTtcblx0fVxuXHRcblx0aW5pdChjYW52YXNOYW1lLHdvcmxkRGVmKVxuXHR7XG5cdFx0dGhpcy5pc0NhbnZhc1Zpc2FibGUgPSB0cnVlO1xuXHRcdHRoaXMuaXNDYW52YXNEcmF3YWJsZSA9IHRydWU7XG5cdFx0dGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNhbnZhc05hbWUpO1x0XHRcdFxuXHRcdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0LyppZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJylcblx0XHR7XG5cdFx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY2FudmFzTmFtZSk7XHRcdFx0XG5cdFx0XHR0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdH0qL1xuXHR9XG5cdFxuXHRzdGF0aWMgY3JlYXRlQ2FudmFzSG9sZGVyRnJvbUNsaWVudEpzb24od29ybGREZWYsanNvbilcblx0e1xuXHQgIHZhciBjYW52YXNIb2xkZXIgPSBuZXcgQ2FudmFzSG9sZGVyKGpzb24uY2FuYXZzTmFtZSx3b3JsZERlZik7XG5cdCAgcmV0dXJuKGNhbnZhc0hvbGRlcik7XG5cdH1cblx0ICBnZXRDbGllbnRKc29uKClcblx0ICB7XG5cdFx0ICB2YXIganNvbiA9IHt9O1xuXHRcdCAgXG5cdFx0ICBcblx0XHQgIGpzb24uY2FudmFzTmFtZSA9IHRoaXMuY2FudmFzTmFtZTtcblx0XHQgIGpzb24ub3JpZ2luID0gdGhpcy5vcmlnaW47XG5cdFx0ICBqc29uLndpZHRoID0gdGhpcy5nZXRXaWR0aCgpO1xuXHRcdCAganNvbi5oZWlnaHQgPSB0aGlzLmdldEhlaWdodCgpO1xuXHRcdCAganNvbi53b3JsZERlZiA9IHRoaXMud29ybGREZWY7XG5cdFx0ICBcblx0XHQgIEpTT04uc3RyaW5naWZ5KGpzb24pO1xuXHRcdCAgcmV0dXJuKGpzb24pXG5cdCAgfVxuXHRcblx0Z2V0Q29ubmVjdG9yKGNvbm5lY3RvckRlZktleSxuYW1lKVxuXHR7XG5cdFx0dmFyIGNvbm5lY3RvciA9IHRoaXMuZ2V0Q29ubmVjdG9yRGVmKGNvbm5lY3RvckRlZktleSkodGhpcy53b3JsZERlZixuYW1lKTtcblx0XHRjb25uZWN0b3IuY29ubmVjdG9yRGVmS2V5ID0gY29ubmVjdG9yRGVmS2V5O1xuXHRcdHJldHVybihjb25uZWN0b3IpO1xuXHR9XG5cdFxuXHRnZXRDb25uZWN0b3JEZWYoY29ubmVjdG9yRGVmS2V5KVxuXHR7XG5cdFx0dmFyIGNvbm5lY3RvckRlZiA9IHRoaXMud29ybGREZWYud29ybGREaXNwbGF5LmNvbm5lY3RvckRlZnNbXCJnZW5lcmljXCJdO1xuXHRcdFxuXHRcdHZhciBmb3VuZENvbm5lY3RvckRlZiA9IGZhbHNlO1xuXHRcdGlmKHRoaXMud29ybGREZWYud29ybGREaXNwbGF5LmNvbm5lY3RvckRlZnMuaGFzT3duUHJvcGVydHkoY29ubmVjdG9yRGVmS2V5KSlcblx0XHR7XG5cdFx0XHRjb25uZWN0b3JEZWYgPSB0aGlzLndvcmxkRGVmLndvcmxkRGlzcGxheS5jb25uZWN0b3JEZWZzW2Nvbm5lY3RvckRlZktleV07XG5cdFx0XHRmb3VuZENvbm5lY3RvckRlZiA9IHRydWU7XG5cdFx0fVxuXHRcdGlmKCFmb3VuZENvbm5lY3RvckRlZikgY29uc29sZS50cmFjZShcIkNhbnZhc0hvbGRlcjpnZXRDb25uZWN0b3JEZWY6Y29ubmVjdG9yRGVmS2V5PVxcXCJcIitjb25uZWN0b3JEZWZLZXkrIFwiXFxcIiB3YXMgbm90IGZvdW5kIHVzaW5nIGdlbmVyaWNcIik7XG5cdFx0Y29ubmVjdG9yRGVmLmNvbm5lY3RvckRlZktleSA9IGNvbm5lY3RvckRlZktleTtcblx0XHRyZXR1cm4oY29ubmVjdG9yRGVmKTtcblx0fVxuXHRcblx0Z2V0Q29ubmVjdG9yRGlzcGxheShjb25uZWN0b3JEaXNwbGF5S2V5KVxuXHR7XG5cdFx0dmFyIGNvbm5lY3RvckRpc3BsYXkgPSB0aGlzLndvcmxkRGVmLndvcmxkRGlzcGxheS5jb25uZWN0b3JEaXNwbGF5W1wiZ2VuZXJpY1wiXTtcblx0XHRcblx0XHR2YXIgZm91bmRDb25uZWN0b3JEaXNwbGF5ID0gZmFsc2U7XG5cdFx0aWYodGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkuY29ubmVjdG9yRGlzcGxheS5oYXNPd25Qcm9wZXJ0eShjb25uZWN0b3JEaXNwbGF5S2V5KSlcblx0XHR7XG5cdFx0XHRjb25uZWN0b3JEaXNwbGF5ID0gdGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkuY29ubmVjdG9yRGlzcGxheVtjb25uZWN0b3JEaXNwbGF5S2V5XTtcblx0XHRcdGZvdW5kQ29ubmVjdG9yRGlzcGxheSA9IHRydWU7XG5cdFx0fVxuXHRcdGlmKCFmb3VuZENvbm5lY3RvckRpc3BsYXkpIGNvbnNvbGUudHJhY2UoXCJDYW52YXNIb2xkZXI6Z2V0Q29ubmVjdG9yRGlzcGxheTpjb25uZWN0b3JEaXNwbGF5S2V5PVxcXCJcIitjb25uZWN0b3JEaXNwbGF5S2V5KyBcIlxcXCIgd2FzIG5vdCBmb3VuZCB1c2luZyBnZW5lcmljXCIpO1xuXHRcdGNvbm5lY3RvckRpc3BsYXkuY29ubmVjdG9yRGlzcGxheUtleSA9IGNvbm5lY3RvckRpc3BsYXlLZXk7XG5cdFx0cmV0dXJuKGNvbm5lY3RvckRpc3BsYXkpO1xuXHR9XG5cdFxuXHRnZXRHcmFwaERhdGEoZ3JhcGhEYXRhS2V5KVxuXHR7XG5cdFx0dmFyIGdyYXBoRGF0YSA9IHRoaXMud29ybGREZWYud29ybGREaXNwbGF5Lm5vZGVEaXNwbGF5W1wiZ2VuZXJpY1wiXTtcdFxuXHRcdHZhciBmb3VuZEdyYXBoRGF0YSA9IGZhbHNlO1xuXHRcdGlmKHRoaXMud29ybGREZWYud29ybGREaXNwbGF5Lm5vZGVEaXNwbGF5Lmhhc093blByb3BlcnR5KGdyYXBoRGF0YUtleSkpXG5cdFx0e1xuXHRcdFx0Z3JhcGhEYXRhID0gdGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkubm9kZURpc3BsYXlbZ3JhcGhEYXRhS2V5XTtcblx0XHRcdGZvdW5kR3JhcGhEYXRhID0gdHJ1ZTtcblx0XHR9XG5cdFx0aWYoIWZvdW5kR3JhcGhEYXRhKSBjb25zb2xlLnRyYWNlKFwiQ2FudmFzSG9sZGVyOmdldEdyYXBoRGF0YTpncmFwaERhdGFLZXk9XFxcIlwiK2dyYXBoRGF0YUtleSsgXCJcXFwiIHdhcyBub3QgZm91bmQgdXNpbmcgZ2VuZXJpY1wiKVxuXHRcdC8vY29uc29sZS50cmFjZShcIkNhbnZhc0hvbGRlcjpnZXRHcmFwaERhdGE6Z3JhcGhEYXRhS2V5PVxcXCJcIitncmFwaERhdGFLZXkrIFwiXFxcIiB3YXMgbm90IGZvdW5kIHVzaW5nIGdlbmVyaWNcIilcblx0XHQvL2NvbnNvbGUubG9nKFwiRk9SOlwiK2dyYXBoRGF0YUtleStDb21tb24udG9TdHJpbmcoZ3JhcGhEYXRhKSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcImdldEdyYXBoRGF0YTpncmFwaERhdGFLZXk9XCIrZ3JhcGhEYXRhS2V5K1wiOmNsb25lPVwiK2dyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5jbG9uZSk7XG5cblx0XHQvL2lmKGdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5jbG9uZSlcblx0XHRpZihncmFwaERhdGEubm9kZURpc3BsYXlGdW5jdGlvbilcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0R3JhcGhEYXRhOmdyYXBoRGF0YUtleTpGT1VORCBBIEZVTkNUSU9OOlwiK2dyYXBoRGF0YUtleSk7XG5cdFx0XHRncmFwaERhdGEgPSBPYmplY3QuY3JlYXRlKGdyYXBoRGF0YSk7XG5cdFx0XHRncmFwaERhdGEubm9kZURpc3BsYXkgPSBncmFwaERhdGEubm9kZURpc3BsYXlGdW5jdGlvbigpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIkNMT05JTkc6XCIrZ3JhcGhEYXRhS2V5K0NvbW1vbi50b1N0cmluZyhncmFwaERhdGEpKTtcblx0XHRcdC8vZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvID0gT2JqZWN0LmNyZWF0ZShncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8pO1xuXHRcdFx0Ly9ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8gID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8pKTtcblx0XHRcdC8vZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvICA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvKSk7XG5cdFx0XHQvL2dyYXBoRGF0YSA9IE9iamVjdC5jcmVhdGUoZ3JhcGhEYXRhKTtcblx0XHRcdC8vZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLnRzID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cblxuXHRcdH1cblxuXHRcdGdyYXBoRGF0YS5ncmFwaERhdGFLZXkgPSBncmFwaERhdGFLZXk7XG5cdFx0cmV0dXJuKGdyYXBoRGF0YSk7XG5cdH1cblx0XG5cdGNsb25lKG9yaWdpbilcblx0e1xuXHRcdHZhciBjYW52YXNIb2xkZXIgPSBuZXcgQ2FudmFzSG9sZGVyKHRoaXMuY2FudmFzTmFtZSx0aGlzLndvcmxkRGVmKTtcblx0XHRjYW52YXNIb2xkZXIub3JpZ2luID0gb3JpZ2luO1xuXHRcdC8qXG5cdFx0dmFyIGNhbnZhc0hvbGRlciA9IG5ldyBPYmplY3QoKTtcblx0XHRjYW52YXNIb2xkZXIub3JpZ2luID0gb3JpZ2luO1xuXHRcdFxuXHRcdGNhbnZhc0hvbGRlci5jYW52YXNOYW1lID0gdGhpcy5jYW52YXNOYW1lO1xuXHRcdGNhbnZhc0hvbGRlci5jYW52YXMgPSB0aGlzLmNhbnZhcztcblx0XHRjYW52YXNIb2xkZXIuY29udGV4dCA9IHRoaXMuY29udGV4dDtcblx0XHRjYW52YXNIb2xkZXIuaXNDYW52YXNWaXNhYmxlID0gdGhpcy5pc0NhbnZhc1Zpc2FibGU7XG5cdFx0Y2FudmFzSG9sZGVyLmlzQ2FudmFzRHJhd2FibGUgPSB0aGlzLmlzQ2FudmFzRHJhd2FibGU7XG5cdFx0Y2FudmFzSG9sZGVyLmlzRHJhd2FibGUgPSB0aGlzLmlzRHJhd2FibGU7XG5cdFx0Y2FudmFzSG9sZGVyLmlzVmlzYWJsZSA9IHRoaXMuaXNWaXNhYmxlO1xuXHRcdGNhbnZhc0hvbGRlci5nZXRXaWR0aCA9IHRoaXMuZ2V0V2lkdGg7XG5cdFx0Y2FudmFzSG9sZGVyLmdldEhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0O1xuXHRcdGNhbnZhc0hvbGRlci53b3JsZERlZiA9IHRoaXMud29ybGREZWY7XG5cdFx0Y2FudmFzSG9sZGVyLmdldEdyYXBoRGF0YSA9IHRoaXMuZ2V0R3JhcGhEYXRhO1xuXHRcdCovXG5cdFx0XG5cdFx0cmV0dXJuKGNhbnZhc0hvbGRlcik7XG5cdH1cblx0XG5cdGlzRHJhd2FibGUoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMuaXNDYW52YXNEcmF3YWJsZSk7XG5cdH1cblx0XG5cdGlzVmlzYWJsZSgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5pc0NhbnZhc1Zpc2FibGUpO1xuXHR9XG5cdFxuXHRnZXRXaWR0aCgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5jYW52YXMud2lkdGgpO1xuXHR9XG5cdFxuXHRnZXRIZWlnaHQoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMuY2FudmFzLmhlaWdodCk7XG5cdH1cbn1cblxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNIb2xkZXI7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q2FudmFzSG9sZGVyXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgQ2FudmFzSG9sZGVyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXInKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cblxuY2xhc3MgQ2FudmFzSG9sZGVyVmlydHVhbCBleHRlbmRzIENhbnZhc0hvbGRlclxue1xuXHRjb25zdHJ1Y3RvcihjYW52YXNOYW1lLHdvcmxkRGVmLHdpZHRoLGhlaWdodCxvcmlnaW4pXG5cdHtcblx0XHRzdXBlcihjYW52YXNOYW1lLHdvcmxkRGVmKTtcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cdH1cblx0XG5cdGluaXQoY2FudmFzTmFtZSx3b3JsZERlZilcblx0e1xuXHRcdHRoaXMuY2FudmFzID0gbnVsbDtcblx0XHR0aGlzLmNvbnRleHQgPSBudWxsO1xuXHRcdHRoaXMuaXNDYW52YXNWaXNhYmxlID0gZmFsc2U7XG5cdFx0dGhpcy5pc0NhbnZhc0RyYXdhYmxlID0gZmFsc2U7XG5cdH1cblxuXHRjbG9uZShvcmlnaW4pXG5cdHtcblx0XHR2YXIgY2FudmFzSG9sZGVyID0gbmV3IENhbnZhc0hvbGRlclZpcnR1YWwodGhpcy5jYW52YXNOYW1lLHRoaXMud29ybGREZWYsdGhpcy53aWR0aCx0aGlzLmhlaWdodCxvcmlnaW4pO1xuXHRcdHJldHVybihjYW52YXNIb2xkZXIpO1xuXHR9XG5cblx0Z2V0V2lkdGgoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMud2lkdGgpO1xuXHR9XG5cblx0Z2V0SGVpZ2h0KClcblx0e1xuXHRcdHJldHVybih0aGlzLmhlaWdodCk7XG5cdH1cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0hvbGRlclZpcnR1YWw7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q2FudmFzSG9sZGVyVmlydHVhbFwiKTtcbi8vPC9qczJub2RlPlxuIiwiY2xhc3MgTW91c2VTdGF0dXNcbntcblx0Y29uc3RydWN0b3IoaXNEb3duLHN0YXJ0UG9zaXRpb24scG9zaXRpb24sbm9kZSxub2RlU3RhcnRQb3NpdGlvbilcblx0e1xuXHRcdHRoaXMuaXNEb3duID0gaXNEb3duO1xuXHRcdHRoaXMuc3RhcnRQb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb247XG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdHRoaXMubm9kZSA9IG5vZGU7XG5cdFx0dGhpcy5ub2RlU3RhcnRQb3NpdGlvbiA9IG5vZGVTdGFydFBvc2l0aW9uO1xuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZVN0YXR1cztcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpNb3VzZVN0YXR1c1wiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBOb2RlID0gcmVxdWlyZSgnLi4vbm9kZScpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcblxuY2xhc3MgTm9kZUNhbnZhcyBleHRlbmRzIE5vZGVcbntcblx0ICBjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIpXG5cdCAge1xuXHRcdCAgc3VwZXIoXHRjYW52YXNIb2xkZXIuY2FudmFzTmFtZSxcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oMCwwKSxcblx0XHRcdFx0XHRjYW52YXNIb2xkZXIsXG5cdFx0XHRcdFx0XCJnZW5lcmljXCIsXG5cdFx0XHRcdFx0bnVsbCk7XG5cdFx0ICBOb2RlQ2FudmFzLmluaXROb2RlQ2FudmFzKHRoaXMsY2FudmFzSG9sZGVyKTtcblx0XHQgIFxuXHQgIH1cblx0ICBcblx0ICBzdGF0aWMgaW5pdE5vZGVDYW52YXMobm9kZUNhbnZhcyxjYW52YXNIb2xkZXIpXG5cdCAge1xuXHRcdFx0bm9kZUNhbnZhcy5leHRyYUFuaW1hdGlvbiA9IG51bGw7XG5cdFx0XHRub2RlQ2FudmFzLmNhbnZhc0hvbGRlciA9IGNhbnZhc0hvbGRlcjtcblx0XHRcdG5vZGVDYW52YXMuc3RhcnRBbmltYXRpb25UaW1lU3RhbXAgPSBudWxsO1xuXHRcdFx0bm9kZUNhbnZhcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wID0gbnVsbDtcblx0XHRcdG5vZGVDYW52YXMuc3RhcnRBbmltYXRpb25EYXRlID0gbnVsbDtcblx0XHRcdG5vZGVDYW52YXMuYW5pbWF0aW9uRXhlY1RpbWUgPSAwO1xuXHRcdFx0bm9kZUNhbnZhcy50aW1lRmFjdG9yID0gMTtcblx0XHRcdG5vZGVDYW52YXMud29ybGRVcGRhdGVRdWV1ZVByb2Nlc3NlZCA9IG5ldyBBcnJheSgpO1xuXG5cdFx0fVxuXHQgIFxuXHQgIGdldFdvcmxkVXBkYXRlc1Byb2Nlc3NlZCh0aW1lU3RhbXAsbWF4SXRlbXMpXG5cdFx0e1xuXHRcdFx0dmFyIHdvcmxkVXBkYXRlQXJyYXkgPSBuZXcgQXJyYXkoKTtcblx0XHRcdHZhciBmaXJzdCA9IG51bGw7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHRoaXMud29ybGRVcGRhdGVRdWV1ZVByb2Nlc3NlZC5sZW5ndGggJiZcblx0XHRcdFx0d29ybGRVcGRhdGVBcnJheS5sZW5ndGg8bWF4SXRlbXM7aSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgd29ybGRVcGRhdGUgPSB0aGlzLndvcmxkVXBkYXRlUXVldWVQcm9jZXNzZWRbaV07XG5cblx0XHRcdFx0aWYod29ybGRVcGRhdGUucHJvY2Vzc1RpbWVzdGFtcD50aW1lU3RhbXApIFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d29ybGRVcGRhdGVBcnJheS5wdXNoKHdvcmxkVXBkYXRlKTtcblx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiICAgICAgZ2V0V29ybGRVcGRhdGVzUHJvY2Vzc2VkXCIrXG5cdFx0XHRcdFx0XHRcdFwiOndvcmxkVXBkYXRlLnByb2Nlc3NUaW1lc3RhbXA9XCIrd29ybGRVcGRhdGUucHJvY2Vzc1RpbWVzdGFtcCtcblx0XHRcdFx0XHRcdFx0XCI6cmVhZHlUb0JlUHJvY2Vzc2VkPVwiK3dvcmxkVXBkYXRlLnJlYWR5VG9CZVByb2Nlc3NlZCh0aW1lU3RhbXApK1xuXHRcdFx0XHRcdFx0XHRcIjp0aW1lU3RhbXA9XCIrdGltZVN0YW1wKTtcblx0XHRcdFx0XHQqL1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvKlxuXHRcdFx0Y29uc29sZS5sb2coXCJnZXRXb3JsZFVwZGF0ZXNQcm9jZXNzZWRcIitcblx0XHRcdFx0XHRcIjp0aW1lU3RhbXA9XCIrdGltZVN0YW1wK1xuXHRcdFx0XHRcdFwiOm1heEl0ZW1zPVwiK21heEl0ZW1zK1xuXHRcdFx0XHRcdFwiOmZvdW5kPVwiK3dvcmxkVXBkYXRlQXJyYXkubGVuZ3RoKTtcblx0XHRcdFx0XHQqL1xuXHRcdFx0cmV0dXJuKHdvcmxkVXBkYXRlQXJyYXkpO1xuXHRcdH1cblx0XG5cdCAgZ2V0V29ybGRDbGllbnRKc29uKClcblx0ICB7XG5cdFx0ICB2YXIganNvbiA9IHt9O1xuXHRcdCAgXG5cdFx0ICBqc29uLm5vZGVHcmFwaCA9IHN1cGVyLmdldENsaWVudEpzb24oKTtcblx0XHQgIGpzb24uY2FudmFzSG9sZGVyID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0Q2xpZW50SnNvbigpO1xuXHRcdCAgSlNPTi5zdHJpbmdpZnkoanNvbik7XG5cdFx0ICByZXR1cm4oanNvbilcblx0ICB9XG5cdFxuXHRpc1Zpc2FibGUoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMuY2FudmFzSG9sZGVyLmlzVmlzYWJsZSgpKVxuXHR9XG5cdFxuXHRwb2ludGVyVXAobm9kZSlcblx0e1xuXHRcdC8vY29uc29sZS5sb2coXCJOb2RlQ2FudmFzLnBvaW50ZXJVcDpcIitub2RlLm5hbWUpXG5cdH1cblx0XG5cdHBvaW50ZXJNb3ZlKG5vZGUpXG5cdHtcblx0XHQvL2NvbnNvbGUubG9nKFwiTm9kZUNhbnZhcy5wb2ludGVyTW92ZTpcIitub2RlLm5hbWUpXG5cdH1cblx0XG5cdHBvaW50ZXJEb3duKG5vZGUpXG5cdHtcblx0XHQvL2NvbnNvbGUubG9nKFwiTm9kZUNhbnZhcy5wb2ludGVyRG93bjpcIitub2RlLm5hbWUpXG5cdH1cblx0XG5cdHBhdXNlKClcblx0e1xuXHRcdHRoaXMuaXNBbmltYXRlZCA9IGZhbHNlO1xuXHR9XG5cdFxuXHRwbGF5KClcblx0e1xuXHRcdHRoaXMuaXNBbmltYXRlZCA9IHRydWU7XG5cdCAgICB0aGlzLmRyYXcoKTtcblx0fVxuXHRkcmF3KClcblx0e1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRpZih0aGlzLmNhbnZhc0hvbGRlci5pc0RyYXdhYmxlKCkpXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24odGltZXN0YW1wKSB7IHNlbGYuZHJhd0NhbnZhcyh0aW1lc3RhbXApIH0sIGZhbHNlKTtcblx0fVxuXHRcblx0XG5cdHNldEFuaW1hdGlvblRpbWVzKHRpbWVzdGFtcClcblx0e1xuXHRcdGlmKHRoaXMuc3RhcnRBbmltYXRpb25UaW1lU3RhbXA9PW51bGwpIHRoaXMuc3RhcnRBbmltYXRpb25UaW1lU3RhbXAgPSB0aW1lc3RhbXArMDtcblx0XHRpZih0aGlzLnN0YXJ0QW5pbWF0aW9uRGF0ZT09bnVsbCkgdGhpcy5zdGFydEFuaW1hdGlvbkRhdGUgPSBuZXcgRGF0ZSgpO1xuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuXHRcdGlmKHRoaXMubGFzdEFuaW1hdGlvblRpbWVTdGFtcD09bnVsbCkgdGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wID0gbm93O1xuXHRcblx0XHRpZih0aGlzLmlzQW5pbWF0ZWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5hbmltYXRpb25FeGVjVGltZSArPSBub3cuZ2V0VGltZSgpLXRoaXMubGFzdEFuaW1hdGlvblRpbWVTdGFtcC5nZXRUaW1lKCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwibm93PVwiK25vdytcblx0XHRcdC8vXHRcIiBsYXN0QW5pbWF0aW9uVGltZVN0YW1wPVwiK3RoaXMubGFzdEFuaW1hdGlvblRpbWVTdGFtcCtcblx0XHRcdC8vXHRcIiBhbmltYXRpb25FeGVjVGltZT1cIit0aGlzLmFuaW1hdGlvbkV4ZWNUaW1lK1xuXHRcdFx0Ly9cdFwiXCIpO1xuXHRcdH1cblx0XHR0aGlzLmxhc3RBbmltYXRpb25UaW1lU3RhbXAgPSBub3c7XG5cdFxuXHR9XG5cdFxuXHRcblx0Y2xlYXJDYW52YXModGltZXN0YW1wKVxuXHR7XG5cdFx0aWYodGhpcy5pc1Zpc2FibGUoKSAmJiB0aGlzLmNhbnZhc0hvbGRlci5pc0RyYXdhYmxlKCkpXG5cdFx0e1xuXHRcdFx0dGhpcy5jYW52YXNIb2xkZXIuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXNIb2xkZXIuZ2V0V2lkdGgoKSwgdGhpcy5jYW52YXNIb2xkZXIuY2FudmFzLmhlaWdodCk7XG5cdFx0XHR0aGlzLmNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5maWxsU3R5bGUpXG5cdFx0XHR0aGlzLmNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzSG9sZGVyLmdldFdpZHRoKCksIHRoaXMuY2FudmFzSG9sZGVyLmdldEhlaWdodCgpKTtcblx0XHR9XG5cdH1cbn1cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gTm9kZUNhbnZhcztcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlQ2FudmFzXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgTW91c2VTdGF0dXMgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL21vdXNlc3RhdHVzJyk7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcblxuY2xhc3MgTm9kZUNhbnZhc01vdXNlXG57XG5cdGNvbnN0cnVjdG9yKG5vZGVDYW52YXMpXG5cdHtcblx0XHROb2RlQ2FudmFzTW91c2UuY3JlYXRlTm9kZUNhbnZhc01vdXNlKHRoaXMsbm9kZUNhbnZhcyk7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlTm9kZUNhbnZhc01vdXNlKG5vZGVDYW52YXNNb3VzZSxub2RlQ2FudmFzKVxuXHR7XG5cdFx0bm9kZUNhbnZhc01vdXNlLm5vZGVDYW52YXMgPSBub2RlQ2FudmFzO1xuXHRcdGlmKG5vZGVDYW52YXMuaXNWaXNhYmxlKCkpIFxuXHRcdHtcblx0XHRcdG5vZGVDYW52YXNNb3VzZS5vZmZzZXQgPSBOb2RlQ2FudmFzTW91c2UuZ2V0Q2FudmFzT2Zmc2V0KG5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcyk7XG5cdFx0XHRub2RlQ2FudmFzTW91c2UubW91c2VTdGF0dXMgPSBuZXcgTW91c2VTdGF0dXMoZmFsc2UsbmV3IFBvc2l0aW9uKDAsMCksbmV3IFBvc2l0aW9uKDAsMCksbnVsbCxudWxsKTtcblx0XHRcdG5vZGVDYW52YXNNb3VzZS5pbml0Q2F2YW5zUG9pbnRlcigpO1xuXHRcdFx0bm9kZUNhbnZhc01vdXNlLm5vZGVNb3VzZU1vdm1lbnQgPSB7fTtcblx0XHR9XG5cdH1cblx0XG5cdHN0YXRpYyBnZXRDYW52YXNPZmZzZXQob2JqKVxuXHR7XG5cdCAgICB2YXIgb2Zmc2V0TGVmdCA9IDA7XG5cdCAgICB2YXIgb2Zmc2V0VG9wID0gMDtcblx0ICAgIGRvXG5cdCAgICB7XG5cdCAgICAgIGlmICghaXNOYU4ob2JqLm9mZnNldExlZnQpKVxuXHQgICAgICB7XG5cdCAgICAgICAgICBvZmZzZXRMZWZ0ICs9IG9iai5vZmZzZXRMZWZ0O1xuXHQgICAgICB9XG5cdCAgICAgIGlmICghaXNOYU4ob2JqLm9mZnNldFRvcCkpXG5cdCAgICAgIHtcblx0ICAgICAgICAgIG9mZnNldFRvcCArPSBvYmoub2Zmc2V0VG9wO1xuXHQgICAgICB9ICAgXG5cdCAgICB9XG5cdCAgICB3aGlsZShvYmogPSBvYmoub2Zmc2V0UGFyZW50ICk7XG5cdCAgICBcblx0ICAgIHJldHVybiB7bGVmdDogb2Zmc2V0TGVmdCwgdG9wOiBvZmZzZXRUb3B9O1xuXHR9XG5cblx0cG9pbnRlckRvd25FdmVudChldmVudClcblx0e1xuXHRcdHZhciBldmVudFBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKGV2ZW50LnBhZ2VYLXRoaXMub2Zmc2V0LmxlZnQsZXZlbnQucGFnZVktdGhpcy5vZmZzZXQudG9wKTtcblx0XHR0aGlzLmhpZGVDdXJyZW50Tm9kZUluZm8oKTtcblx0XG5cdFx0dGhpcy5tb3VzZVN0YXR1cy5pc0Rvd24gPSB0cnVlO1xuXHRcdHRoaXMubW91c2VTdGF0dXMuc3RhcnRQb3NpdGlvbiA9IGV2ZW50UG9zaXRpb247XG5cdFx0dGhpcy5tb3VzZVN0YXR1cy5wb3NpdGlvbiA9IGV2ZW50UG9zaXRpb247XG5cdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5ub2RlIT1udWxsKVxuXHRcdHtcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5pc0FuaW1hdGVkID0gdHJ1ZTtcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUgPSBudWxsO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgY2xpY2tOb2RlID0gIHRoaXMubm9kZUNhbnZhcy5nZXROb2RlQ29udGFpbmluZ1Bvc2l0aW9uKGV2ZW50UG9zaXRpb24pO1xuXHRcblx0XHR2YXIgY2xpY2tOb2RlID0gIHRoaXMubm9kZUNhbnZhcy5nZXROb2RlQ29udGFpbmluZ1Bvc2l0aW9uKGV2ZW50UG9zaXRpb24pO1xuXHRcdGlmKGNsaWNrTm9kZSE9bnVsbCAmJiBjbGlja05vZGUhPXRoaXMubW91c2VTdGF0dXMubGFzdE5vZGUpXG5cdFx0e1xuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlID0gY2xpY2tOb2RlO1xuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlU3RhcnRQb3NpdGlvbiA9IGNsaWNrTm9kZS5wb3NpdGlvbi5jbG9uZSgpO1xuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzU2VsZWN0ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5vZmZzZXQgPSBjbGlja05vZGUucG9zaXRpb24uZ2V0RGVsdGEoZXZlbnRQb3NpdGlvbik7XG5cdFx0XHR0aGlzLm5vZGVDYW52YXMucG9pbnRlckRvd24oY2xpY2tOb2RlKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5zaG93Q3VycmVudE5vZGVJbmZvKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKGNsaWNrTm9kZT09bnVsbClcblx0XHR7XG5cdFx0XHR0aGlzLmhpZGVDdXJyZW50Tm9kZUluZm8oKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5sYXN0Tm9kZSlcblx0XHR7XG5cdFx0XHR0aGlzLmhpZGVDdXJyZW50Tm9kZUluZm8oKTtcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubGFzdE5vZGUuaXNTZWxlY3RlZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5sYXN0Tm9kZSA9IG51bGw7XG5cdFx0fVxuXHRcblx0fVxuXHRcblx0c2hvd0N1cnJlbnROb2RlSW5mbygpXG5cdHtcblx0XHR2YXIgaHRtbE9iamVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm9kZWluZm9cIik7XG5cdFx0aWYoaHRtbE9iamVjdCE9bnVsbClcblx0XHR7XG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLmxlZnQgPSB0aGlzLm1vdXNlU3RhdHVzLm5vZGUucG9zaXRpb24uZ2V0WCgpKzMwKydweCc7XG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLnRvcCAgPSB0aGlzLm1vdXNlU3RhdHVzLm5vZGUucG9zaXRpb24uZ2V0WSgpKydweCc7XG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG5cdFx0XHQkKCcjbm9kZWluZm8nKS5odG1sKHRoaXMubW91c2VTdGF0dXMubm9kZS5nZXROb2RlVWlEaXNwbGF5KCkpO1xuXHRcdH1cblx0XHRcblx0XHRjb25zb2xlLmxvZyhcIm5hbWU6XCIrdGhpcy5tb3VzZVN0YXR1cy5ub2RlLm5hbWUrXCJcXG5cIitcblx0XHRcdFx0XCJcdGlzU2VsZWN0ZWQ6XCIrdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzU2VsZWN0ZWQrXCJcXG5cIitcblx0XHRcdFx0XCJcdGlzU2VsZWN0ZWQ6XCIrdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzQW5pbWF0ZWQrXCJcXG5cIitcblx0XHRcdFx0XCJcdHBvc2l0aW9uOlwiK0NvbW1vbi50b1N0cmluZyh0aGlzLm1vdXNlU3RhdHVzLm5vZGUucG9zaXRpb24pK1wiXFxuXCIrXG5cdFx0XHRcdFwiXHRpc1NlbGVjdGVkOlwiK3RoaXMubW91c2VTdGF0dXMubm9kZS5pc1NlbGVjdGVkK1xuXHRcdFx0XHRcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiK1xuXHRcdFx0XCJcIik7XG5cdH1cblx0XG5cdGhpZGVDdXJyZW50Tm9kZUluZm8oKVxuXHR7XG5cdFx0dmFyIGh0bWxPYmplY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vZGVpbmZvXCIpO1xuXHRcdGlmKGh0bWxPYmplY3QhPW51bGwpXG5cdFx0e1xuXHRcdFx0aHRtbE9iamVjdC5zdHlsZS5sZWZ0ID0gMCsncHgnO1xuXHRcdFx0aHRtbE9iamVjdC5zdHlsZS50b3AgID0gMCsncHgnO1xuXHRcdFx0aHRtbE9iamVjdC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG5cdFx0XHQkKCcjbm9kZWluZm8nKS5odG1sKCk7XG5cdFx0fVxuXHR9XG5cdFxuXHRwb2ludGVyTW92ZUV2ZW50KGV2ZW50KVxuXHR7XG5cdFx0dmFyIGV2ZW50UG9zaXRpb24gPSBuZXcgUG9zaXRpb24oZXZlbnQucGFnZVgtdGhpcy5vZmZzZXQubGVmdCxldmVudC5wYWdlWS10aGlzLm9mZnNldC50b3ApO1xuXHRcdGlmKHRoaXMubW91c2VTdGF0dXMuaXNEb3duKVxuXHRcdHtcblx0XHRcdHRoaXMuaGlkZUN1cnJlbnROb2RlSW5mbygpO1xuXHRcblx0XHRcdGlmKHRoaXMubW91c2VTdGF0dXMubm9kZSE9bnVsbClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzQW5pbWF0ZWQgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5wb3NpdGlvbiA9IGV2ZW50UG9zaXRpb247XG5cdFx0XHRcdHZhciBkZWx0YVBvc2l0aW9uID0gdGhpcy5tb3VzZVN0YXR1cy5ub2RlU3RhcnRQb3NpdGlvbi5nZXREZWx0YShldmVudFBvc2l0aW9uKTtcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5zZXRYKFxuXHRcdFx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlU3RhcnRQb3NpdGlvbi5nZXRYKCktXG5cdFx0XHRcdFx0XHRkZWx0YVBvc2l0aW9uLmdldFgoKStcblx0XHRcdFx0XHRcdHRoaXMubW91c2VTdGF0dXMub2Zmc2V0LmdldFgoKSk7XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUucG9zaXRpb24uc2V0WShcblx0XHRcdFx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZVN0YXJ0UG9zaXRpb24uZ2V0WSgpLVxuXHRcdFx0XHRcdFx0ZGVsdGFQb3NpdGlvbi5nZXRZKCkrXG5cdFx0XHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm9mZnNldC5nZXRZKCkpO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5ub2RlQ2FudmFzLnBvaW50ZXJNb3ZlKHRoaXMubW91c2VTdGF0dXMubm9kZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZighdGhpcy5ub2RlTW91c2VNb3ZtZW50Lmhhc093blByb3BlcnR5KHRoaXMubW91c2VTdGF0dXMubm9kZS5nZXROb2RlS2V5KCkpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5ub2RlTW91c2VNb3ZtZW50W3RoaXMubW91c2VTdGF0dXMubm9kZS5nZXROb2RlS2V5KCldID1cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdG1vdmVQb3N0aW9uQXJyYXk6bmV3IEFycmF5KClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5ub2RlTW91c2VNb3ZtZW50W3RoaXMubW91c2VTdGF0dXMubm9kZS5nZXROb2RlS2V5KCldLm1vdmVQb3N0aW9uQXJyYXkucHVzaCh0aGlzLm1vdXNlU3RhdHVzLm5vZGUucG9zaXRpb24uY2xvbmUoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0fVxuXHR9XG5cdFxuXHRwb2ludGVyVXBFdmVudChldmVudClcblx0e1xuXHRcdGlmKHRoaXMubW91c2VTdGF0dXMubm9kZSE9bnVsbClcblx0XHR7XG5cdFx0XHR0aGlzLm5vZGVDYW52YXMucG9pbnRlclVwKHRoaXMubW91c2VTdGF0dXMubm9kZSk7XG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNBbmltYXRlZCA9IHRydWU7XG5cdFx0XHQvL3RoaXMubW91c2VTdGF0dXMubm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLmxhc3ROb2RlID0gdGhpcy5tb3VzZVN0YXR1cy5ub2RlO1xuXHRcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZSA9IG51bGw7XG5cdFx0fVxuXHRcdHRoaXMubW91c2VTdGF0dXMuaXNEb3duID0gZmFsc2U7XG5cdH1cblx0XG5cdGluaXRDYXZhbnNQb2ludGVyKClcblx0e1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRpZih3aW5kb3cuUG9pbnRlckV2ZW50KVxuXHRcdHtcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5jYW52YXNIb2xkZXIuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCBmdW5jdGlvbihldmVudCkgeyBzZWxmLnBvaW50ZXJEb3duRXZlbnQoIGV2ZW50KSB9LCBmYWxzZSk7XG5cdFx0XHR0aGlzLm5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIixmdW5jdGlvbihldmVudCkgeyBzZWxmLnBvaW50ZXJNb3ZlRXZlbnQoIGV2ZW50KSB9LCBmYWxzZSk7XG5cdFx0XHR0aGlzLm5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcnVwXCIsZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyVXBFdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcblx0ICAgIH1cblx0ICAgIGVsc2Vcblx0ICAgIHtcblx0ICAgIFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlckRvd25FdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcblx0ICAgIFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlck1vdmVFdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcblx0ICAgIFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyVXBFdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcblx0ICAgIH0gIFxuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IE5vZGVDYW52YXNNb3VzZTtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlQ2FudmFzTW91c2VcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgTm9kZURpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS9ub2RlZGlzcGxheScpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcbnZhciBTaGFwZSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3NoYXBlcy9zaGFwZScpO1xuXG5jbGFzcyBBcmNEaXNwbGF5U2hhcGUgZXh0ZW5kcyBOb2RlRGlzcGxheVxue1xuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcblx0e1xuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcblx0XHR0aGlzLnBvaW50TGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcdHRoaXMuc2hhcGUgPSBudWxsO1xuXHRcdHRoaXMuaW5pdCgpO1xuXHRcdFxuXHR9XG5cdFxuXHRpbml0KClcblx0e1xuXHRcdHRoaXMucG9pbnRMaXN0Lmxlbmd0aCA9IDA7XG5cdFx0dGhpcy5hbmdsZSA9IE1hdGguYWJzKHRoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUsdGhpcy5kaXNwbGF5SW5mby5zdGFydEFuZ2xlKTtcblx0XHR2YXIgYW5nbGVJbmMgPSB0aGlzLmFuZ2xlIC8gdGhpcy5kaXNwbGF5SW5mby5jdXJ2ZVBvaW50cztcblx0XHRcblx0XHR0aGlzLnBvaW50TGlzdC5wdXNoKG5ldyBQb3NpdGlvbigwLDApKTtcblx0XHRmb3IodmFyIGFuZ2xlPXRoaXMuZGlzcGxheUluZm8uc3RhcnRBbmdsZTtcblx0XHRcdGFuZ2xlPD10aGlzLmRpc3BsYXlJbmZvLmVuZEFuZ2xlICYmIGFuZ2xlSW5jPjA7XG5cdFx0XHRhbmdsZT1hbmdsZSthbmdsZUluYylcblx0XHR7XG5cdFx0XHRpZiggKGFuZ2xlK2FuZ2xlSW5jKSA+IHRoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUgKVxuXHRcdFx0e1xuXHRcdFx0XHRpZihhbmdsZSE9dGhpcy5kaXNwbGF5SW5mby5lbmRBbmdsZSkgYW5nbGUgPSB0aGlzLmRpc3BsYXlJbmZvLmVuZEFuZ2xlIDtcblx0XHRcdH1cblx0XHRcdHZhciByYWRzID0gYW5nbGUgKiAoTWF0aC5QSS8xODApO1xuXHRcdFx0dGhpcy5wb2ludExpc3QucHVzaChcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oXG5cdFx0XHRcdFx0XHRcdHRoaXMuZGlzcGxheUluZm8ucmFkaXVzKk1hdGguY29zKHJhZHMpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLmRpc3BsYXlJbmZvLnJhZGl1cypNYXRoLnNpbihyYWRzKSlcblx0XHRcdFx0XHQpO1x0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMucG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKDAsMCkpO1xuXHRcdGlmKHRoaXMuc2hhcGU9PW51bGwpIHRoaXMuc2hhcGUgPSBuZXcgU2hhcGUodGhpcy5wb2ludExpc3QpO1xuXHRcdGVsc2UgdGhpcy5zaGFwZS5pbml0U2hhcGUoKTtcblx0fVxuXHRcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxuXHR7XG5cdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShwb3NpdGlvbik7XG5cdFx0cmV0dXJuKGRpc3RhbmNlPD10aGlzLmRpc3BsYXlJbmZvLnJhZGl1cyk7XG5cdH1cblx0XG5cdFxuXHRkcmF3Tm9kZXgoY2FudmFzSG9sZGVyLG5vZGUpXG5cdHtcblxuXHR9XG5cdFxuXHRkcmF3Tm9kZShjYW52YXNIb2xkZXIsbm9kZSlcblx0e1xuXHRcdHN1cGVyLmRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKTtcblxuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0RmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0Qm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgICAgZWxzZVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uZmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uYm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgICAvKiBcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYXJjKG5vZGUucG9zaXRpb24uZ2V0WCgpLG5vZGUucG9zaXRpb24uZ2V0WSgpLHRoaXMuZGlzcGxheUluZm8ucmFkaXVzLDAsTWF0aC5QSSAqIDIsIGZhbHNlKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmNsb3NlUGF0aCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aDtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xuXHQgICAgKi9cblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpOyAvL0JlZ2lucyBkcmF3aW5nIHRoZSBwYXRoLiBTZWUgbGluayBpbiBcIkVkaXRcIiBzZWN0aW9uXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5tb3ZlVG8obm9kZS5wb3NpdGlvbi5nZXRYKCksbm9kZS5wb3NpdGlvbi5nZXRZKCkpOyAvL01vdmVzIHRoZSBiZWdpbm5pbmcgcG9zaXRpb24gdG8gY3gsIGN5ICgxMDAsIDc1KVxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYXJjKG5vZGUucG9zaXRpb24uZ2V0WCgpLG5vZGUucG9zaXRpb24uZ2V0WSgpLFxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8ucmFkaXVzLFxuXHQgICAgXHRcdHRoaXMudG9SYWRpYW5zKHRoaXMuZGlzcGxheUluZm8uc3RhcnRBbmdsZSksXG5cdCAgICBcdFx0dGhpcy50b1JhZGlhbnModGhpcy5kaXNwbGF5SW5mby5lbmRBbmdsZSkpOyAvL1x0Y3R4LmFyYyhjeCwgY3ksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNvdW50ZXJjbG9ja3dpc2UgKG9wdGlvbmFsKSk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lVG8obm9kZS5wb3NpdGlvbi5nZXRYKCksbm9kZS5wb3NpdGlvbi5nZXRZKCkpOyAvL0RyYXdzIGxpbmVzIGZyb20gdGhlIGVuZHMgb2YgdGhlIGFyYyB0byBjeCBhbmQgY3lcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmNsb3NlUGF0aCgpOyAvL0ZpbmlzaGVzIGRyYXdpbmcgdGhlIHBhdGhcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGwoKTsgLy9BY3R1YWxseSBkcmF3cyB0aGUgc2hhcGUgKGFuZCBmaWxscylcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcblx0fVxuXHQvL3RoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUsdGhpcy5kaXNwbGF5SW5mby5zdGFydEFuZ2xlXG5cdHRvUmFkaWFucyhkZWcpXG5cdHtcblx0ICAgIHJldHVybiBkZWcgKiBNYXRoLlBJIC8gMTgwIC8vQ29udmVydHMgZGVncmVlcyBpbnRvIHJhZGlhbnNcblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gQXJjRGlzcGxheVNoYXBlO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkFyY0Rpc3BsYXlTaGFwZVwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBOb2RlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L25vZGVkaXNwbGF5Jyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5cbmNsYXNzIENpcmNsZURpc3BsYXkgZXh0ZW5kcyBOb2RlRGlzcGxheVxue1xuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcblx0e1xuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcblx0fVxuXHRcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxuXHR7XG5cdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShwb3NpdGlvbik7XG5cdFx0cmV0dXJuKGRpc3RhbmNlPD10aGlzLmRpc3BsYXlJbmZvLnJhZGl1cyk7XG5cdH1cblx0XG5cdFxuXHRkcmF3Tm9kZShjYW52YXNIb2xkZXIsbm9kZSlcblx0e1xuXHRcdHN1cGVyLmRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKTtcblxuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0RmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0Qm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgICAgZWxzZVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uZmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uYm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgICAgXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5iZWdpblBhdGgoKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmFyYyhub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKSx0aGlzLmRpc3BsYXlJbmZvLnJhZGl1cywwLE1hdGguUEkgKiAyLCBmYWxzZSk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5jbG9zZVBhdGgoKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGwoKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlRGlzcGxheTtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpDaXJjbGVEaXNwbGF5XCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcblxuY2xhc3MgTm9kZURpc3BsYXlcbntcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXG5cdHtcblx0XHROb2RlRGlzcGxheS5jcmVhdGVOb2RlRGlzcGxheSh0aGlzLGRpc3BsYXlJbmZvKTtcblx0fVxuXHRcblx0c3RhdGljIGNyZWF0ZU5vZGVEaXNwbGF5KG5vZGVEaXNwbGF5LGRpc3BsYXlJbmZvKVxuXHR7XG5cdFx0bm9kZURpc3BsYXkuZGlzcGxheUluZm8gPSBkaXNwbGF5SW5mbztcblx0fVxuXHRcblx0ZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpXG5cdHtcblx0XHR0aGlzLmRyYXdQb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihcblx0XHRcdFx0TWF0aC5yb3VuZChub2RlLnBvc2l0aW9uLngpLFxuXHRcdFx0XHRNYXRoLnJvdW5kKG5vZGUucG9zaXRpb24ueSlcblx0XHRcdFx0KTtcblx0fVxuXHRcblx0Y29udGFpbnNQb3NpdGlvbihwb3N0aW9uLG5vZGUpXG5cdHtcblx0fVxuXHRcblx0ZmlsbFRleHRNdXRpcGxlTGluZXMoY29udGV4dCx0ZXh0LHgseSxsaW5lSGVpZ2h0LHNwbGl0Q2hhcilcblx0e1xuXHRcdHZhciBsaW5lcyA9IHRleHQuc3BsaXQoc3BsaXRDaGFyKTtcblx0ICAgIHZhciBsaW5lID0gJyc7XG5cdFxuXHQgICAgZm9yKHZhciBuID0gMDsgbiA8IGxpbmVzLmxlbmd0aDsgbisrKVxuXHQgICAge1xuXHQgICAgICB2YXIgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQobGluZXNbbl0pO1xuXHQgICAgICBjb250ZXh0LmZpbGxUZXh0KGxpbmVzW25dLCB4LCB5KTtcblx0ICAgICAgeSA9IHkrbGluZUhlaWdodDsgXG5cdCAgICB9XG5cdCAgICBjb250ZXh0LmZpbGxUZXh0KGxpbmUsIHgsIHkpO1xuXHQgfVxuXHRcblx0bWV0cmljc1RleHRNdXRpcGxlTGluZXMoY29udGV4dCx0ZXh0LGxpbmVIZWlnaHQsc3BsaXRDaGFyKVxuXHR7XG5cdFx0dmFyIGxpbmVzID0gdGV4dC5zcGxpdChzcGxpdENoYXIpO1xuXHQgICAgdmFyIGxpbmUgPSAnJztcblx0ICAgIHZhciBtYXhXaWR0aCA9IDA7XG5cdCAgICB2YXIgdG90YWxIZWlnaHQgPSAwO1xuXHQgICAgZm9yKHZhciBuID0gMDsgbiA8IGxpbmVzLmxlbmd0aDsgbisrKVxuXHQgICAge1xuXHQgICAgICB2YXIgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQobGluZXNbbl0pO1xuXHQgICAgICBpZihtZXRyaWNzLndpZHRoPm1heFdpZHRoKSBtYXhXaWR0aCA9IG1ldHJpY3Mud2lkdGg7XG5cdCAgICAgIHRvdGFsSGVpZ2h0ID0gdG90YWxIZWlnaHQgKyBsaW5lSGVpZ2h0O1xuXHQgICAgfVxuXHQgICAgcmV0dXJuKHt3aWR0aDptYXhXaWR0aCxoZWlnaHQ6dG90YWxIZWlnaHR9KTtcblx0IH1cblx0XG5cdHJvdW5kZWRSZWN0KGNvbnRleHQseCx5LHcsaCxyLGJvcmRlcldpdGRoLGJvcmRlckNvbG9yLHJlY3RDb2xvcilcblx0e1xuXHRcdCAgaWYgKHcgPCAyICogcikgciA9IHcgLyAyO1xuXHRcdCAgaWYgKGggPCAyICogcikgciA9IGggLyAyO1xuXHRcdCAgY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHQgIGNvbnRleHQubW92ZVRvKHgrciwgeSk7XG5cdFx0ICBjb250ZXh0LmFyY1RvKHgrdywgeSwgICB4K3csIHkraCwgcik7XG5cdFx0ICBjb250ZXh0LmFyY1RvKHgrdywgeStoLCB4LCAgIHkraCwgcik7XG5cdFx0ICBjb250ZXh0LmFyY1RvKHgsICAgeStoLCB4LCAgIHksICAgcik7XG5cdFx0ICBjb250ZXh0LmFyY1RvKHgsICAgeSwgICB4K3csIHksICAgcik7XG5cdFx0ICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuXHRcdC8qXG5cdCAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHQgICAgY29udGV4dC5tb3ZlVG8oeCwgeSk7XG5cdCAgICBjb250ZXh0LmxpbmVUbyh4ICsgd2lkdGggLSBjb3JuZXJSYWRpdXMsIHkpO1xuXHQgICAgY29udGV4dC5hcmNUbyh4ICsgd2lkdGgsIHksIHggKyB3aWR0aCwgeSArIGNvcm5lclJhZGl1cywgY29ybmVyUmFkaXVzKTtcblx0ICAgIGNvbnRleHQubGluZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCk7XG5cdCAgICovIFxuXHQgICAgY29udGV4dC5saW5lV2lkdGggPSBib3JkZXJXaXRkaDtcblx0ICAgIGNvbnRleHQuZmlsbFN0eWxlID0gcmVjdENvbG9yO1xuXHQgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGJvcmRlckNvbG9yO1xuXHQgICAgXG5cdCAgICBjb250ZXh0LnN0cm9rZSgpO1xuXHQgICAgY29udGV4dC5maWxsKCk7XG5cdFxuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBOb2RlRGlzcGxheTtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpOb2RlRGlzcGxheVwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBOb2RlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L25vZGVkaXNwbGF5Jyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyBSZWN0YW5nbGVEaXNwbGF5IGV4dGVuZHMgTm9kZURpc3BsYXlcbntcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXG5cdHtcblx0XHRzdXBlcihkaXNwbGF5SW5mbyk7XG5cdH1cblx0XG5cdGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSlcblx0e1xuXHRcdHJldHVybihcblx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0KG5vZGUucG9zaXRpb24uZ2V0WCgpLXRoaXMuZGlzcGxheUluZm8ud2lkdGgvMik8PXBvc2l0aW9uLmdldFgoKSAmJlxuXHRcdFx0XHRcdFx0KG5vZGUucG9zaXRpb24uZ2V0WCgpK3RoaXMuZGlzcGxheUluZm8ud2lkdGgvMik+PXBvc2l0aW9uLmdldFgoKSAmJlxuXHRcdFx0XHRcdFx0KG5vZGUucG9zaXRpb24uZ2V0WSgpLXRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpPD1wb3NpdGlvbi5nZXRZKCkgJiZcblx0XHRcdFx0XHRcdChub2RlLnBvc2l0aW9uLmdldFkoKSt0aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKT49cG9zaXRpb24uZ2V0WSgpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdH1cblx0XG5cdFxuXHRkcmF3Tm9kZShjYW52YXNIb2xkZXIsbm9kZSlcblx0e1xuXHRcdHN1cGVyLmRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKTtcblxuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0RmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0Qm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgICAgZWxzZVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uZmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uYm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgICAgLy9jb25zb2xlLmxvZyhDb21tb250b1N0cmluZyh0aGlzLmRpc3BsYXlJbmZvKSk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5maWxsUmVjdCggXG5cdCAgICBcdFx0KG5vZGUucG9zaXRpb24uZ2V0WCgpLXRoaXMuZGlzcGxheUluZm8ud2lkdGgvMiksXG5cdCAgICBcdFx0KG5vZGUucG9zaXRpb24uZ2V0WSgpLXRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpLFxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8ud2lkdGgsXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby5oZWlnaHQpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aDtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmJvcmRlckNvbG9yKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVJlY3QoIFxuXHQgICAgXHRcdChub2RlLnBvc2l0aW9uLmdldFgoKS10aGlzLmRpc3BsYXlJbmZvLndpZHRoLzIpLCBcblx0ICAgIFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCktdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMiksIFxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8ud2lkdGgsIFxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8uaGVpZ2h0KTtcblx0XG5cdH1cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IFJlY3RhbmdsZURpc3BsYXk7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6UmVjdGFuZ2xlRGlzcGxheVwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBOb2RlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L25vZGVkaXNwbGF5Jyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xudmFyIFNoYXBlID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvc2hhcGVzL3NoYXBlJyk7XG5cbmNsYXNzIFRyaWFuZ2xlRGlzcGxheSBleHRlbmRzIE5vZGVEaXNwbGF5XG57XG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxuXHR7XG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xuXHRcdFxuXHRcdHZhciBwb2ludExpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHRcblx0XHRwb2ludExpc3QucHVzaChuZXcgUG9zaXRpb24oMCwtKHRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpKSk7XG5cdFx0cG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKHRoaXMuZGlzcGxheUluZm8ud2lkdGgvMix0aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKSk7XG5cdFx0cG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKC0odGhpcy5kaXNwbGF5SW5mby53aWR0aC8yKSx0aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKSk7XG5cdFx0cG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKDAsLSh0aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKSkpO1xuXHRcblx0XHR0aGlzLnBvaW50TGlzdCA9IHBvaW50TGlzdDtcblx0XHR0aGlzLnNoYXBlID0gbmV3IFNoYXBlKHBvaW50TGlzdClcblx0fVxuXHRcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMuc2hhcGUuY29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKSk7XG5cdH1cblx0XG5cdFxuXHRkcmF3Tm9kZShjYW52YXNIb2xkZXIsbm9kZSlcblx0e1xuXHRcdHN1cGVyLmRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKTtcblx0XHR0aGlzLnNoYXBlLmRyYXdTaGFwZShjYW52YXNIb2xkZXIsbm9kZSx0aGlzLmRpc3BsYXlJbmZvKTtcblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gVHJpYW5nbGVEaXNwbGF5O1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlRyaWFuZ2xlRGlzcGxheVwiKTtcbi8vPC9qczJub2RlPlxuIiwiY2xhc3MgUG9zaXRpb25cbntcblx0Y29uc3RydWN0b3IoeCwgeSlcblx0e1xuXHQgICAgdGhpcy54ID0geDtcblx0ICAgIHRoaXMueSA9IHk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0QXZlcmFnZVBvc3Rpb25Gcm9tUG9zaXRpb25MaXN0KHBvc2l0aW9uTGlzdClcblx0e1xuXHRcdHZhciB4ID0gMC4wO1xuXHRcdHZhciB5ID0gMC4wO1xuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIHAgPSBwb3NpdGlvbkxpc3RbaV07XG5cdFx0XHR4ICs9IHAuZ2V0WCgpO1xuXHRcdFx0eSArPSBwLmdldFkoKTtcblx0XHR9XG5cdFx0eCA9IHggLyBwb3NpdGlvbkxpc3QubGVuZ3RoO1xuXHRcdHkgPSB5IC8gcG9zaXRpb25MaXN0Lmxlbmd0aDtcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHgseSkpO1xuXHR9XG5cdFxuICBnZXRDbGllbnRKc29uKClcbiAge1xuXHQgIHZhciBqc29uID0ge307XG5cdCAganNvbi54ID0gdGhpcy5nZXRYKCk7XG5cdCAganNvbi55ID0gdGhpcy5nZXRZKCk7XG5cdCAgcmV0dXJuKGpzb24pXG4gIH1cblx0XHRcbiAgc3RhdGljIGdldEF2ZXJhZ2VQb3N0aW9uRnJvbU5vZGVMaXN0KG5vZGVsaXN0KVxuICB7XG5cdHZhciB4ID0gMC4wO1xuXHR2YXIgeSA9IDAuMDtcblx0Zm9yKHZhciBpPTA7aTxub2RlbGlzdC5sZW5ndGg7aSsrKVxuXHR7XG5cdFx0dmFyIHAgPSBub2RlbGlzdFtpXS5wb3NpdGlvbjtcblx0XHR4ICs9IHAuZ2V0WCgpO1xuXHRcdHkgKz0gcC5nZXRZKCk7XG5cdH1cblx0eCA9IHggLyBub2RlbGlzdC5sZW5ndGg7XG5cdHkgPSB5IC8gbm9kZWxpc3QubGVuZ3RoO1xuXHRyZXR1cm4obmV3IFBvc2l0aW9uKHgseSkpO1xuICB9XG5cdFx0XG5cdHN0YXRpYyBnZXRQb3N0aW9uTGlzdEZyb21Ob2RlTGlzdChub2RlTGlzdClcblx0e1xuXHRcdHZhciBwb3NpdGlvbnMgPSBuZXcgQXJyYXkoKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVMaXN0Lmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdHBvc2l0aW9ucy5wdXNoKG5vZGVMaXN0W2ldLnBvc2l0aW9uKTtcblx0XHR9XG5cdFx0cmV0dXJuKHBvc2l0aW9ucyk7XG5cdH1cblxuXHRjb3B5RnJvbShwb3NpdGlvbilcblx0e1xuXHRcdHRoaXMuc2V0WChwb3NpdGlvbi5nZXRYKCkpO1xuXHRcdHRoaXMuc2V0WShwb3NpdGlvbi5nZXRZKCkpO1xuXHR9XG5cblx0Y29weVRvKHBvc2l0aW9uKVxuXHR7XG5cdFx0cG9zaXRpb24uc2V0WCh0aGlzLmdldFgoKSk7XG5cdFx0cG9zaXRpb24uc2V0WSh0aGlzLmdldFkoKSk7XG5cdH1cblx0XG5cdHNldFhZKHgseSlcblx0e1xuXHRcdHRoaXMuc2V0WCh4KTtcblx0XHR0aGlzLnNldFkoeSk7XG5cdH1cblxuXHRzZXRYKHgpXG5cdHtcblx0XHR0aGlzLnggPSB4O1xuXHR9XG5cblx0c2V0WSh5KVxuXHR7XG5cdFx0dGhpcy55ID0geTtcblx0fVxuXG5cdGdldFgoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMueCk7XG5cdH1cblxuXHRnZXRZKClcblx0e1xuXHRcdHJldHVybih0aGlzLnkpO1xuXHR9XG5cdFxuXHRjbG9uZSgpXG5cdHtcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuZ2V0WCgpLHRoaXMuZ2V0WSgpKSk7XG5cdH1cblxuXHRlcXVhbHMocG9zaXRpb24pXG5cdHtcblx0XHRyZXR1cm4oICh0aGlzLmdldFgoKT09cG9zaXRpb24uZ2V0WCgpKSAmJiAodGhpcy5nZXRZKCk9PXBvc2l0aW9uLmdldFkoKSkgKSA7XG5cdH1cblxuXHRjcmVhdGVCeUFkZGluZyhwb3NpdGlvbilcblx0e1xuXHRcdHJldHVybihuZXcgUG9zaXRpb24odGhpcy5nZXRYKCkgKyBwb3NpdGlvbi5nZXRYKCksdGhpcy5nZXRZKCkrcG9zaXRpb24uZ2V0WSgpKSk7XG5cdH1cblxuXHRjcmVhdGVCeVN1YnRyYWN0aW5nKHBvc2l0aW9uKVxuXHR7XG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih0aGlzLmdldFgoKS1wb3NpdGlvbi5nZXRYKCksdGhpcy5nZXRZKCktcG9zaXRpb24uZ2V0WSgpKSk7XG5cdH1cblxuXHRmaW5kQ2xvc2VzdFBvc3Rpb25PbkxpbmUocDEscDIpXG5cdHtcblx0XHQgIHZhciBBID0gdGhpcy5nZXREZWx0YVgocDEpO1xuXHRcdCAgdmFyIEIgPSB0aGlzLmdldERlbHRhWShwMSk7XG5cdFx0ICB2YXIgQyA9IHAyLmdldERlbHRhWChwMSk7XG5cdFx0ICB2YXIgRCA9IHAyLmdldERlbHRhWShwMSk7XG5cdFxuXHRcdCAgdmFyIGRvdCA9IEEgKiBDICsgQiAqIEQ7XG5cdFx0ICB2YXIgbGVuZ3RoU3F1YXJlZCA9IEMgKiBDICsgRCAqIEQ7XG5cdFx0ICB2YXIgcGFyYW0gPSAtMTtcblx0XHQgIGlmIChsZW5ndGhTcXVhcmVkICE9IDApIC8vaW4gY2FzZSBvZiAwIGxlbmd0aCBsaW5lXG5cdFx0ICAgICAgcGFyYW0gPSBkb3QgLyBsZW5ndGhTcXVhcmVkO1xuXHRcblx0XHQgIHZhciB4eCwgeXk7XG5cdFxuXHRcdCAgaWYgKHBhcmFtIDwgMClcblx0XHQgIHtcblx0XHQgICAgeHggPSBwMS5nZXRYKCk7XG5cdFx0ICAgIHl5ID0gcDEuZ2V0WSgpO1xuXHRcdCAgfVxuXHRcdCAgZWxzZSBpZiAocGFyYW0gPiAxKSB7XG5cdFx0ICAgIHh4ID0gcDIuZ2V0WCgpO1xuXHRcdCAgICB5eSA9IHAyLmdldFkoKTtcblx0XHQgIH1cblx0XHQgIGVsc2Uge1xuXHRcdCAgICB4eCA9IHAxLmdldFgoKSArIHBhcmFtICogQztcblx0XHQgICAgeXkgPSBwMS5nZXRZKCkgKyBwYXJhbSAqIEQ7XG5cdFx0ICB9XG5cdC8qXG5cdFx0ICB2YXIgZHggPSB4IC0geHg7XG5cdFx0ICB2YXIgZHkgPSB5IC0geXk7XG5cdFx0ICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcblx0XHQgICovXG5cdFx0ICByZXR1cm4obmV3IFBvc2l0aW9uKHh4LHl5KSk7XG5cdH1cblxuXG5cdGZpbmRDbG9zZXN0UG9pbnRJbkxpc3RcdChwb3NpdGlvbkxpc3QpXG5cdHtcblx0XHR2YXIgY2xvc2V0SW5kZXggPSAwO1xuXHRcdHZhciBjbG9zZXRQb2ludCA9IHBvc2l0aW9uTGlzdFtjbG9zZXRJbmRleF07XG5cdFx0dmFyIGRpc3RhbmNlVG9DbG9zZXN0ID0gdGhpcy5nZXREaXN0YW5jZShjbG9zZXRQb2ludCk7XG5cdFx0XG5cdFx0Zm9yKHZhciBpPTA7aTxwb3NpdGlvbkxpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgcG9pbnQgPSBwb3NpdGlvbkxpc3RbaV07XG5cdFx0XHR2YXIgZGlzdGFuY2VUb1BvaW50ID0gdGhpcy5nZXREaXN0YW5jZShwb2ludCk7XG5cdFx0XHRpZihkaXN0YW5jZVRvUG9pbnQ8ZGlzdGFuY2VUb0Nsb3Nlc3QpXG5cdFx0XHR7XG5cdFx0XHRcdGNsb3NldEluZGV4ID0gaTtcblx0XHRcdFx0Y2xvc2V0UG9pbnQgPSBwb2ludDtcblx0XHRcdFx0ZGlzdGFuY2VUb0Nsb3Nlc3QgPSBkaXN0YW5jZVRvUG9pbnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNsb3NldEluZGV4OmNsb3NldEluZGV4LFxuXHRcdFx0XHRcdGNsb3NldFBvaW50OmNsb3NldFBvaW50LFxuXHRcdFx0XHRcdGRpc3RhbmNlVG9DbG9zZXN0OmRpc3RhbmNlVG9DbG9zZXN0XG5cdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0fVxuXG5cdGxvZ1x0KClcblx0e1xuXHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0XHRcIlBvc2l0aW9uXCIrXG5cdFx0XHRcdFwiOng9XCIrdGhpcy5nZXRYKCkrXG5cdFx0XHRcdFwiOnk9XCIrdGhpcy5nZXRZKCkrXG5cdFx0XHRcdFwiXCJcblx0XHQpO1xuXHR9XG5cblx0Z2V0RGVsdGFZKHBvc2l0aW9uKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMuZ2V0WSgpLXBvc2l0aW9uLmdldFkoKSk7XG5cdH1cblxuXHRnZXREZWx0YVgocG9zaXRpb24pXG5cdHtcblx0XHRyZXR1cm4odGhpcy5nZXRYKCktcG9zaXRpb24uZ2V0WCgpKTtcblx0fVxuXG5cdGdldERlbHRhKHBvc2l0aW9uKVxuXHR7XG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih0aGlzLmdldERlbHRhWChwb3NpdGlvbiksdGhpcy5nZXREZWx0YVkocG9zaXRpb24pKSk7XG5cdH1cblxuXHRnZXREaXN0YW5jZShwb3NpdGlvbilcblx0e1xuXHRcdHJldHVybiAoTWF0aC5zcXJ0KE1hdGgucG93KHRoaXMuZ2V0RGVsdGFYKHBvc2l0aW9uKSwgMikgKyBNYXRoLnBvdyh0aGlzLmdldERlbHRhWShwb3NpdGlvbiksIDIpKSk7XG5cdH1cblxuXHRnZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXkocG9zaXRpb25PcmcsZGlzdGFuY2UpXG5cdHtcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0dmFyIG1vZFggPSAwLjA7XG5cdFx0dmFyIG1vZFkgPSAwLjA7XG5cdFxuXHRcdC8vIHdoYXQgaWYgdGhleSBhcmUgdG9wIG9mIGVhY2ggb3RoZXI/XG5cdFx0aWYgKHRoaXMuZ2V0RGVsdGFYKHBvc2l0aW9uT3JnKSA9PSAwICYmIHRoaXMuZ2V0RGVsdGFZKHBvc2l0aW9uT3JnKSA9PSAwKVxuXHRcdHtcblx0XHRcdG1vZFggKz0gTWF0aC5yYW5kb20oKSAtIDAuNTtcblx0XHRcdG1vZFkgKz0gTWF0aC5yYW5kb20oKSAtIDAuNTtcblx0XHR9XG5cdFxuXHRcdHZhciBwb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihwb3NpdGlvbk9yZy54ICsgbW9kWCwgcG9zaXRpb25PcmcueSArIG1vZFkpO1xuXHRcblx0XHQvLyB0aGlzIGlzIHdoZW4gdGhlIHNsb3BlIGlzIHVuZGVmaW5lZCAodG90YWxseSBob3Jpem9udGFsIGxpbmUpXG5cdFx0aWYgKHBvc2l0aW9uLmdldFgoKSA9PSB0aGlzLmdldFgoKSlcblx0XHR7XG5cdFx0XHR2YXIgcDEgPSBuZXcgUG9zaXRpb24ocG9zaXRpb24uZ2V0WCgpLHBvc2l0aW9uLmdldFkoKStkaXN0YW5jZSk7XG5cdFx0XHR2YXIgcDIgPSBuZXcgUG9zaXRpb24ocG9zaXRpb24uZ2V0WCgpLHBvc2l0aW9uLmdldFkoKS1kaXN0YW5jZSk7XG5cdFx0XHRwMS5kaXN0YW5jZSA9IHRoaXMuZ2V0RGlzdGFuY2UocDEpXG5cdFx0XHRwMi5kaXN0YW5jZSA9IHRoaXMuZ2V0RGlzdGFuY2UocDIpXG5cdFxuXHRcdFx0cG9zaXRpb25MaXN0LnB1c2gocDEpO1xuXHRcdFx0cG9zaXRpb25MaXN0LnB1c2gocDIpO1xuXHRcdFx0cmV0dXJuKHBvc2l0aW9uTGlzdCk7XG5cdFx0fVxuXHRcblx0XHQvLyBnZXQgdGhlIGVxdWF0aW9uIGZvciB0aGUgbGluZSBtPXNsb3BlIGI9eS1pbnRlcmNlcHRcblx0XHR2YXIgbSA9IHRoaXMuZ2V0RGVsdGFZKHBvc2l0aW9uKSAvIHRoaXMuZ2V0RGVsdGFYKHBvc2l0aW9uKTtcblx0XHR2YXIgYiA9IHRoaXMuZ2V0WSgpIC0gKG0gKiB0aGlzLmdldFgoKSk7XG5cdFxuXHRcdHZhciB4UGx1cyA9IHBvc2l0aW9uLmdldFgoKSArIGRpc3RhbmNlIC8gTWF0aC5zcXJ0KDEgKyAobSAqIG0pKTtcblx0XHR2YXIgeE1pbnVzID0gcG9zaXRpb24uZ2V0WCgpIC0gZGlzdGFuY2UgLyBNYXRoLnNxcnQoMSArIChtICogbSkpO1xuXHRcdHZhciB5UGx1cyA9IHhQbHVzICogbSArIGI7XG5cdFx0dmFyIHlNaW51cyA9IHhNaW51cyAqIG0gKyBiO1xuXHRcblx0XHR2YXIgcDEgPSBuZXcgUG9zaXRpb24oeFBsdXMsIHlQbHVzKTtcblx0XHR2YXIgcDIgPSBuZXcgUG9zaXRpb24oeE1pbnVzLCB5TWludXMpO1xuXHRcdHAxLmRpc3RhbmNlID0gdGhpcy5nZXREaXN0YW5jZShwMSlcblx0XHRwMi5kaXN0YW5jZSA9IHRoaXMuZ2V0RGlzdGFuY2UocDIpXG5cdFxuXHRcdHBvc2l0aW9uTGlzdC5wdXNoKHAxKTtcblx0XHRwb3NpdGlvbkxpc3QucHVzaChwMik7XG5cdFx0cmV0dXJuKHBvc2l0aW9uTGlzdCk7XG5cdH1cblxuXHRnZXREaXN0YW5jZVBvc3Rpb25MaXN0KHBvc2l0aW9uTGlzdClcblx0e1xuXHRcdHZhciBkaXN0YW5jZUxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHRmb3IodmFyIGk9MDtpPHBvc2l0aW9uTGlzdC5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBwID0gcG9zaXRpb25MaXN0W2ldO1xuXHRcdFx0dmFyIGQgPSB0aGlzLmdldERpc3RhbmNlKHApO1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHAuZ2V0WCgpLCBwLmdldFkoKSk7XG5cdFx0XHRwb3NpdGlvbi5kaXN0YW5jZSA9IGQ7XG5cdFx0XHRkaXN0YW5jZUxpc3QucHVzaChwb3NpdGlvbik7XG5cdFx0fVxuXHRcdHJldHVybiAoZGlzdGFuY2VMaXN0KTtcblx0fVxuXG5cdGdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QocG9zaXRpb24sZGlzdGFuY2UpXG5cdHtcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gdGhpcy5nZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXkocG9zaXRpb24sZGlzdGFuY2UpO1xuXHRcdHZhciBjbG9zZXN0ID0gbnVsbDtcblx0XHRmb3IodmFyIGk9MDtpPHBvc2l0aW9uTGlzdC5sZW5ndGg7aSsrKVxuXHRcdHtcdFx0XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkxpc3RbaV07XG5cdFx0XHRpZihjbG9zZXN0PT1udWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRjbG9zZXN0ID0gcG9zaXRpb247XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKHBvc2l0aW9uLmRpc3RhbmNlIDwgY2xvc2VzdC5kaXN0YW5jZSlcblx0XHRcdHtcblx0XHRcdFx0Y2xvc2VzdCA9IHBvc2l0aW9uO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLy8vY29uc29sZS5sb2coXCJjbG9zZXN0PVwiK0NvbW1vbnRvU3RyaW5nKGNsb3Nlc3QpK1wiIGdpdmVuIGRpc3RhbmNlPVwiK2Rpc3RhbmNlK1wiIHBvc2l0aW9uPVwiK0NvbW1vbnRvU3RyaW5nKHBvc2l0aW9uKStcIiBsaXN0PVwiK0NvbW1vbnRvU3RyaW5nKHBvc2l0aW9uTGlzdCkpXG5cdFx0cmV0dXJuIChjbG9zZXN0KTtcblx0fVxuXG5cdGdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUZhcnRoZXN0KHBvc2l0aW9uLGRpc3RhbmNlKVxuXHR7XG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IHRoaXMuZ2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5KHBvc2l0aW9uLGRpc3RhbmNlKTtcblx0XHR2YXIgZmFydGhlc3QgPSBudWxsO1xuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIHBvc2l0aW9uID0gcG9zaXRpb25MaXN0W2ldO1xuXHRcdFx0aWYoZmFydGhlc3Q9PW51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGZhcnRoZXN0ID0gcG9zaXRpb247XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKHBvc2l0aW9uLmRpc3RhbmNlID4gZmFydGhlc3QuZGlzdGFuY2UpXG5cdFx0XHR7XG5cdFx0XHRcdGZhcnRoZXN0ID0gcG9zaXRpb247XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAoZmFydGhlc3QpO1xuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IFBvc2l0aW9uO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlBvc2l0aW9uXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJjbGFzcyBCb3VuZGluZ0JveFxue1xuXHRjb25zdHJ1Y3Rvcihwb2ludExpc3QpXG5cdHtcblx0XHR0aGlzLmluaXREb25lID0gZmFsc2U7XG5cdFx0dGhpcy5wb2ludExpc3QgPSBwb2ludExpc3Q7XG5cdFx0dGhpcy5pbml0Qm91bmRpbmdCb3goKTtcblx0XG5cdH1cblx0XG5cdFxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXG5cdHtcblx0XHRpZighdGhpcy5pbml0RG9uZSkgdGhpcy5pbml0Qm91bmRpbmdCb3goKTtcblx0XG5cdFx0cmV0dXJuKFxuXHRcdFx0XHQoXG5cdFx0XHRcdFx0XHQodGhpcy54TWluLmdldFgoKStub2RlLnBvc2l0aW9uLmdldFgoKSk+PXBvc2l0aW9uLnggJiZcblx0XHRcdFx0XHRcdCh0aGlzLnhNYXguZ2V0WCgpK25vZGUucG9zaXRpb24uZ2V0WCgpKTw9cG9zaXRpb24ueCAmJlxuXHRcdFx0XHRcdFx0KHRoaXMueU1pbi5nZXRZKCkrbm9kZS5wb3NpdGlvbi5nZXRZKCkpPj1wb3NpdGlvbi55ICYmXG5cdFx0XHRcdFx0XHQodGhpcy55TWF4LmdldFkoKStub2RlLnBvc2l0aW9uLmdldFkoKSk8PXBvc2l0aW9uLnlcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0fVxuXHRcblx0aW5pdEJvdW5kaW5nQm94KClcblx0e1xuXHRcdHRoaXMuaW5pdERvbmUgPSB0cnVlO1xuXHRcdC8vdGhpcy5wb2ludExpc3QgPSBwb2ludExpc3Q7XG5cdFxuXHRcblx0XHR0aGlzLnhNaW4gPSBudWxsO1xuXHRcdHRoaXMueE1heCA9IG51bGw7XG5cdFx0dGhpcy55TWluID0gbnVsbDtcblx0XHR0aGlzLnlNYXggPSBudWxsO1xuXHRcdC8vY29uc29sZS5sb2coXCJwbGlzdCBzaXplPVwiK3BvaW50TGlzdC5sZW5ndGgpO1xuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5wb2ludExpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgcCA9IHRoaXMucG9pbnRMaXN0W2ldO1xuXHRcdFx0aWYodGhpcy54TWluPT1udWxsKSB0aGlzLnhNaW4gPSBwO1xuXHRcdFx0aWYodGhpcy54TWF4PT1udWxsKSB0aGlzLnhNYXggPSBwO1xuXHRcdFx0aWYodGhpcy55TWluPT1udWxsKSB0aGlzLnlNaW4gPSBwO1xuXHRcdFx0aWYodGhpcy55TWF4PT1udWxsKSB0aGlzLnlNYXggPSBwO1xuXHRcdFx0XG5cdFx0XHRpZihwLmdldFgoKTx0aGlzLnhNaW4pIHRoaXMueE1pbiA9IHA7XG5cdFx0XHRpZihwLmdldFgoKT50aGlzLnhNYXgpIHRoaXMueE1heCA9IHA7XG5cdFx0XHRpZihwLmdldFkoKTx0aGlzLnlNaW4pIHRoaXMueU1pbiA9IHA7XG5cdFx0XHRpZihwLmdldFkoKT50aGlzLnlNYXgpIHRoaXMueU1heCA9IHA7XG5cdFxuXHRcdH1cblx0XHRcblx0XHR0aGlzLndpZHRoID0gdGhpcy54TWF4LmdldFgoKS10aGlzLnhNaW4uZ2V0WCgpO1xuXHRcdHRoaXMuaGVpZ2h0ID0gdGhpcy55TWF4LmdldFkoKS10aGlzLnlNaW4uZ2V0WSgpO1xuXHR9XG59XG5cblxuXG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IEJvdW5kaW5nQm94O1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkJvdW5kaW5nQm94XCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIEJvdW5kaW5nQm94ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvc2hhcGVzL2JvdW5kaW5nYm94Jyk7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcblxuY2xhc3MgU2hhcGVcbntcblx0Y29uc3RydWN0b3IocG9pbnRMaXN0KVxuXHR7XG5cdFx0dGhpcy5wb2ludExpc3QgPSBwb2ludExpc3Q7XG5cdFx0dGhpcy5hdmVyYWdlUG9pbnQgPSBuZXcgUG9zaXRpb24oMCwwKTtcblx0XHR0aGlzLmJvdW5kaW5nQm94ID0gbmV3IEJvdW5kaW5nQm94KHBvaW50TGlzdCk7XG5cdFx0dGhpcy5pbml0U2hhcGUoKTtcblx0fVxuXHRcblx0aW5pdFNoYXBlKClcblx0e1xuXHRcdGlmKCF0aGlzLnBvaW50TGlzdFt0aGlzLnBvaW50TGlzdC5sZW5ndGgtMV0uZXF1YWxzKHRoaXMucG9pbnRMaXN0WzBdKSkgXG5cdFx0XHR0aGlzLnBvaW50TGlzdC5wdXNoKHRoaXMucG9pbnRMaXN0WzBdLmNsb25lKCkpO1xuXHRcdFxuXHRcdFxuXHRcdFBvc2l0aW9uLmdldEF2ZXJhZ2VQb3N0aW9uRnJvbVBvc2l0aW9uTGlzdCh0aGlzLnBvaW50TGlzdCkuY29weVRvKHRoaXMuYXZlcmFnZVBvaW50KTtcblx0XHRcblx0XHR0aGlzLmRyYXdDZW50ZXJEb3QgPSBmYWxzZTtcblx0XHQvKlxuXHRcdGZvcih2YXIgaT0wO2k8cG9pbnRMaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coXCJpPVwiK2krXCIgXCIrQ29tbW9udG9TdHJpbmcocG9pbnRMaXN0W2ldKSk7XG5cdFx0fVxuXHRcdCovXG5cdFx0XG5cdH1cblx0XG5cdGRyYXdTaGFwZShjYW52YXNIb2xkZXIsbm9kZSxkaXNwbGF5SW5mbylcblx0e1xuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcik7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyhkaXNwbGF5SW5mby5zZWxlY3RCb3JkZXJDb2xvcik7XG5cdCAgICB9XG5cdCAgICBlbHNlXG5cdCAgICB7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcoZGlzcGxheUluZm8uZmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLmJvcmRlckNvbG9yKTtcblx0ICAgIH1cblx0ICAgIFxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdCAgICBmb3IodmFyIGk9MDtpPHRoaXMucG9pbnRMaXN0Lmxlbmd0aDtpKyspXG5cdCAgICB7ICAgXHRcblx0XHRcdHZhciBwb2ludCA9IHRoaXMucG9pbnRMaXN0W2ldLmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pO1xuXHQgICAgXHRpZihpPT0wKSBjYW52YXNIb2xkZXIuY29udGV4dC5tb3ZlVG8ocG9pbnQuZ2V0WCgpLHBvaW50LmdldFkoKSk7XG5cdCAgICBcdGVsc2UgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVRvKHBvaW50LmdldFgoKSxwb2ludC5nZXRZKCkpO1xuXHQgICAgfVxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuY2xvc2VQYXRoKCk7XG5cdCAgICBcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGwoKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IGRpc3BsYXlJbmZvLmJvcmRlcldpZHRoO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlKCk7XG5cdCAgICBcblx0ICAgIGlmKHRoaXMuZHJhd0NlbnRlckRvdClcblx0ICAgIHtcblx0ICAgIFx0dmFyIGF2ZXJhZ2VUcmFucyA9IHRoaXMuZ2V0QXZlcmFnZVBvaW50VHJhbnNmb3JtZWQobm9kZSk7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcoXCIwMDAwMDBmZlwiKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmFyYyhub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKSwyLDAsTWF0aC5QSSAqIDIsIGZhbHNlKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuY2xvc2VQYXRoKCk7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGwoKTtcblx0XHR9XG5cdH1cblx0XG5cdGdldEF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkKG5vZGUpXG5cdHtcblx0ICAgIHZhciBhdmVyYWdlUG9pbnRUcmFuc2Zvcm1lZCA9IHRoaXMuYXZlcmFnZVBvaW50LmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pO1xuXHQgICAgcmV0dXJuKGF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkKTtcblx0fVxuXHRcblx0Ly9mdW5jdGlvbiBwb2x5Z29uQXJlYShYLCBZLCBudW1Qb2ludHMpIFxuXHRcblx0Z2V0U2hhcGVBcmVhKClcblx0eyBcblx0ICB2YXIgYXJlYSA9IDA7ICAgICAgICAgLy8gQWNjdW11bGF0ZXMgYXJlYSBpbiB0aGUgbG9vcFxuXHQgIHZhciBqID0gdGhpcy5wb2ludExpc3QubGVuZ3RoLTE7ICAvLyBUaGUgbGFzdCB2ZXJ0ZXggaXMgdGhlICdwcmV2aW91cycgb25lIHRvIHRoZSBmaXJzdFxuXHRcblx0ICBmb3IgKHZhciBpPTA7IGk8dGhpcy5wb2ludExpc3QubGVuZ3RoOyBpKyspXG5cdCAgeyBcblx0XHQgIGFyZWEgPSBhcmVhICsgKHRoaXMucG9pbnRMaXN0W2pdLmdldFgoKSt0aGlzLnBvaW50TGlzdFtpXS5nZXRYKCkpICpcblx0XHQgIFx0KHRoaXMucG9pbnRMaXN0W2pdLmdldFkoKS10aGlzLnBvaW50TGlzdFtpXS5nZXRZKCkpOyBcblx0ICAgICAgaiA9IGk7ICAvL2ogaXMgcHJldmlvdXMgdmVydGV4IHRvIGlcblx0ICB9XG5cdCAgaWYoYXJlYTwwKSBhcmVhID0gYXJlYSAqIC0xO1xuXHQgIHJldHVybihhcmVhLzIpO1xuXHR9XG5cdFxuXHRcblx0Z2V0U2hhcGVBcmVhMigpXG5cdHsgXG5cdFx0dmFyIGFyZWEgPSAwOyAvLyBBY2N1bXVsYXRlcyBhcmVhIGluIHRoZSBsb29wXG5cdFx0dmFyIGogPSB0aGlzLnBvaW50TGlzdC5sZW5ndGgtMTsgLy8gVGhlIGxhc3QgdmVydGV4IGlzIHRoZSAncHJldmlvdXMnIG9uZSB0byB0aGUgZmlyc3Rcblx0XHRmb3IgKGk9MDtpPHRoaXMucG9pbnRMaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0YXJlYSA9IGFyZWEgKyAodGhpcy5wb2ludExpc3Rbal0uZ2V0WCgpK3RoaXMucG9pbnRMaXN0W2ldLmdldFgoKSkgKlxuXHRcdFx0XHQodGhpcy5wb2ludExpc3Rbal0uZ2V0WSgpK3RoaXMucG9pbnRMaXN0W2ldLmdldFkoKSk7IFxuXHRcdFx0aiA9IGk7IC8vaiBpcyBwcmV2aW91cyB2ZXJ0ZXggdG8gaVxuXHRcdFx0XG5cdFx0XHRjb25zb2xlLmxvZyhcIlhYWFhYWFhYWFhYOmk9XCIraStcIiBhcmVhPVwiK2FyZWEpO1xuXHRcblx0XHR9XG5cdFx0cmV0dXJuKGFyZWEpO1xuXHR9XG5cdFxuXHRmaW5kQ2xvc2VzdFBvaW50SW5TaGFwZUZyb21TdGFydGluZ1BvaW50KHN0YXJ0aW5nUG9zaXRpb24sbm9kZSlcblx0e1xuXHRcdHZhciBsb29rRnJvbVBvc2l0aW9uID0gc3RhcnRpbmdQb3NpdGlvbi5jcmVhdGVCeVN1YnRyYWN0aW5nKG5vZGUucG9zaXRpb24pO1xuXHRcdHZhciBjbG9zZXN0SW5mbyA9IGxvb2tGcm9tUG9zaXRpb24uZmluZENsb3Nlc3RQb2ludEluTGlzdCh0aGlzLnBvaW50TGlzdCk7XG5cdFxuXHRcdHZhciBlbmRPZkxpc3QgPSB0aGlzLnBvaW50TGlzdC5sZW5ndGgtMTtcblx0XHRpZih0aGlzLnBvaW50TGlzdFswXS5lcXVhbHModGhpcy5wb2ludExpc3RbZW5kT2ZMaXN0XSkpIGVuZE9mTGlzdCA9IGVuZE9mTGlzdCAtIDE7XG5cdFx0XHRcblx0XHR2YXIgY2xvc2VzdFBvaW50ID0gY2xvc2VzdEluZm8uY2xvc2V0UG9pbnQ7XG5cdFx0dmFyIHAxSW5kZXggPSBjbG9zZXN0SW5mby5jbG9zZXRJbmRleC0xO1xuXHRcdHZhciBwMkluZGV4ID0gY2xvc2VzdEluZm8uY2xvc2V0SW5kZXgrMTtcblx0XHRpZihjbG9zZXN0SW5mby5jbG9zZXRJbmRleD09MCkgcDFJbmRleCA9IGVuZE9mTGlzdDtcblx0XHRpZihjbG9zZXN0SW5mby5jbG9zZXRJbmRleD09ZW5kT2ZMaXN0KSBwMkluZGV4ID0gMDtcblx0XHRcblx0XHR2YXIgcDEgPSB0aGlzLnBvaW50TGlzdFtwMUluZGV4XTtcblx0XHR2YXIgcDIgPSB0aGlzLnBvaW50TGlzdFtwMkluZGV4XTtcblx0XHRcblx0XHRcblx0XHR2YXIgZGlzdGFuY2VUb0Nsb3Nlc3QgPSBjbG9zZXN0SW5mby5kaXN0YW5jZVRvQ2xvc2VzdDtcblx0XHR2YXIgcDFMaW5lUG9pbnQgPSBsb29rRnJvbVBvc2l0aW9uLmZpbmRDbG9zZXN0UG9zdGlvbk9uTGluZShjbG9zZXN0UG9pbnQscDEpO1xuXHRcdHZhciBwMkxpbmVQb2ludCA9IGxvb2tGcm9tUG9zaXRpb24uZmluZENsb3Nlc3RQb3N0aW9uT25MaW5lKGNsb3Nlc3RQb2ludCxwMik7XG5cdFx0dmFyIHAxRGlzdGFuY2UgPSBsb29rRnJvbVBvc2l0aW9uLmdldERpc3RhbmNlKHAxTGluZVBvaW50KTtcblx0XHR2YXIgcDJEaXN0YW5jZSA9IGxvb2tGcm9tUG9zaXRpb24uZ2V0RGlzdGFuY2UocDJMaW5lUG9pbnQpO1xuXHRcdFxuXHRcdHZhciBmaW5hbFBvaW50ID0gY2xvc2VzdFBvaW50O1xuXHRcdHZhciBmaW5hbERpc3RhbmNlID0gZGlzdGFuY2VUb0Nsb3Nlc3Q7XG5cdFx0aWYoZGlzdGFuY2VUb0Nsb3Nlc3Q8cDFEaXN0YW5jZSAmJiBkaXN0YW5jZVRvQ2xvc2VzdDxwMkRpc3RhbmNlKVxuXHRcdHtcblx0XHRcdGZpbmFsUG9pbnQgPSBjbG9zZXRQb2ludDtcblx0XHRcdGZpbmFsRGlzdGFuY2UgPSBkaXN0YW5jZVRvQ2xvc2VzdDtcblx0XHR9XG5cdFx0ZWxzZSBpZihwMURpc3RhbmNlPHAyRGlzdGFuY2UpXG5cdFx0e1xuXHRcdFx0ZmluYWxQb2ludCA9IHAxTGluZVBvaW50O1xuXHRcdFx0ZmluYWxEaXN0YW5jZSA9IHAxRGlzdGFuY2U7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRmaW5hbFBvaW50ID0gcDJMaW5lUG9pbnQ7XG5cdFx0XHRmaW5hbERpc3RhbmNlID0gcDJEaXN0YW5jZTtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIGZpbmFsUG9pbnRUcmFuc2xhdGVkID0gZmluYWxQb2ludC5jcmVhdGVCeUFkZGluZyhub2RlLnBvc2l0aW9uKTtcblx0XHRcblx0XHQvKlxuXHRcdGNvbnNvbGUubG9nKENvbW1vbnRvU3RyaW5nKGNsb3Nlc3RJbmZvKSk7XG5cdCAgICBjb25zb2xlLmxvZyhcInN0YXJ0aW5nUG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcoc3RhcnRpbmdQb3NpdGlvbikpO1xuXHRcdGNvbnNvbGUubG9nKFwibG9va0Zyb21Qb3NpdGlvbj1cIitDb21tb250b1N0cmluZyhsb29rRnJvbVBvc2l0aW9uKSk7XG5cdFx0Y29uc29sZS5sb2coXCJub2RlLnBvc2l0aW9uPVwiK0NvbW1vbnRvU3RyaW5nKG5vZGUucG9zaXRpb24pKTtcblx0XHRjb25zb2xlLmxvZyhcInRoaXMucG9pbnRMaXN0Lmxlbmd0aD1cIit0aGlzLnBvaW50TGlzdC5sZW5ndGgpO1xuXHRcdGNvbnNvbGUubG9nKFwiY2xvc2VzdEluZm8uY2xvc2V0SW5kZXg9XCIrY2xvc2VzdEluZm8uY2xvc2V0SW5kZXgpO1xuXHRcdGNvbnNvbGUubG9nKFwiZW5kT2ZMaXN0PVwiK2VuZE9mTGlzdCk7XG5cdFx0Y29uc29sZS5sb2coXCJwMUluZGV4PVwiK3AxSW5kZXgpO1xuXHRcdGNvbnNvbGUubG9nKFwicDJJbmRleD1cIitwMkluZGV4KTtcblx0XHRjb25zb2xlLmxvZyhcImNsb3Nlc3RJbmZvLmNsb3NldEluZGV4PVwiK2Nsb3Nlc3RJbmZvLmNsb3NldEluZGV4KTtcblx0XHRjb25zb2xlLmxvZyhcInAxOlwiK0NvbW1vbnRvU3RyaW5nKHAxKSk7XG5cdFx0Y29uc29sZS5sb2coXCJwMjpcIitDb21tb250b1N0cmluZyhwMikpO1xuXHRcblx0XHRjb25zb2xlLmxvZyhcImZpbmFsRGlzdGFuY2U9XCIrZmluYWxEaXN0YW5jZSk7XG5cdFx0Y29uc29sZS5sb2coXCJmaW5hbFBvaW50PVwiK0NvbW1vbnRvU3RyaW5nKGZpbmFsUG9pbnQpKTtcblx0XHRjb25zb2xlLmxvZyhcImZpbmFsUG9pbnRUcmFuc2xhdGVkdD1cIitDb21tb250b1N0cmluZyhmaW5hbFBvaW50VHJhbnNsYXRlZCkpO1xuXHRcdGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcblx0XHQqL1xuXHRcblx0XHRyZXR1cm4oZmluYWxQb2ludFRyYW5zbGF0ZWQpO1xuXHR9XG5cdFxuXHRcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxuXHR7XG5cdFx0aWYodGhpcy5ib3VuZGluZ0JveC5jb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpKSByZXR1cm4gZmFsc2U7XG5cdFx0XG5cdFx0dmFyIGk7XG5cdFx0dmFyIGo7XG5cdFx0dmFyIGMgPSBmYWxzZTtcblx0XHRmb3IoaT0wLGo9dGhpcy5wb2ludExpc3QubGVuZ3RoLTE7aTwgdGhpcy5wb2ludExpc3QubGVuZ3RoO2o9aSsrKVxuXHRcdHtcblx0XHRcdC8vXG5cdFx0XHR2YXIgcGkgPSB0aGlzLnBvaW50TGlzdFtpXS5jcmVhdGVCeUFkZGluZyhub2RlLnBvc2l0aW9uKTtcblx0XHRcdHZhciBwaiA9IHRoaXMucG9pbnRMaXN0W2pdLmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pO1xuXHRcdFx0ICBcblx0XHRcdGlmIChcblx0XHRcdFx0KChwaS5nZXRZKCk+cG9zaXRpb24uZ2V0WSgpKSAhPSAocGouZ2V0WSgpPnBvc2l0aW9uLmdldFkoKSkpICYmXG5cdFx0XHRcdFx0KHBvc2l0aW9uLmdldFgoKSA8IChwai5nZXRYKCktcGkuZ2V0WCgpKSAqXG5cdFx0XHRcdFx0KHBvc2l0aW9uLmdldFkoKS1waS5nZXRZKCkpIC9cblx0XHRcdFx0XHQocGouZ2V0WSgpLXBpLmdldFkoKSkgK1xuXHRcdFx0XHRcdHBpLmdldFgoKSkgKVxuXHRcdFx0XHRjID0gIWM7XG5cdFx0fVxuXHRcdHJldHVybiBjO1xuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZTtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpTaGFwZVwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlJyk7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jb21tb24nKTtcbnZhciBDb25uZWN0b3JEaXNwbGF5RW1wdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXllbXB0eScpO1xudmFyIFNoYXBlQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vbm9kZXMvY29ubmVjdG9yL3NoYXBlY29ubmVjdG9yJyk7XG52YXIgQXJjRGlzcGxheVNoYXBlID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWRpc3BsYXkvYXJjZGlzcGxheXNoYXBlJyk7XG5cblxuY2xhc3MgSnVuY3Rpb24gZXh0ZW5kcyBOb2RlXG57XG5cdGNvbnN0cnVjdG9yKG5hbWUscG9zaXRpb24sY2FudmFzSG9sZGVyLHNoYXBlTGlzdCxncmFwaERhdGFLZXksaW5mb0RhdGEsd29ybGQpXG5cdHtcblx0XHRzdXBlcihuYW1lLHBvc2l0aW9uLGNhbnZhc0hvbGRlcixncmFwaERhdGFLZXksaW5mb0RhdGEpO1xuXHRcdHRoaXMucGF0aEFycmF5ID0gbmV3IEFycmF5KCk7XG5cdFx0dGhpcy53YWxrZXJPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdFx0dGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnMgPSBuZXcgT2JqZWN0KCk7XG5cdFx0dGhpcy5sYXllcj0xO1xuXHRcdHRoaXMud29ybGQgPSB3b3JsZDtcblx0fVxuXG5cdGdldENsaWVudEpzb24oKVxuXHR7XG5cdFx0dmFyIGpzb24gPSBzdXBlci5nZXRDbGllbnRKc29uKCk7XG5cdFx0anNvbi5wYXRoV29ybGRUeWUgPSBcImp1bmN0aW9uXCI7XG5cdFx0XG5cdFx0XG5cdFx0dmFyIHdhbGtlckxpc3QgPSB0aGlzLmdldFdhbGtlckFycmF5KCk7XG5cdFx0anNvbi53YWxrZXJMaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0XG5cdFx0Zm9yKHZhciBpPTA7aTx3YWxrZXJMaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0anNvbi53YWxrZXJMaXN0LnB1c2god2Fsa2VyTGlzdFtpXS5nZXROb2RlS2V5KCkpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4oanNvbik7XG5cdH1cblx0XG5cdGdldENyZWF0ZVdhbGtlclR5cGVDb25uZWN0aW9uKHdhbGtlclR5cGUpXG5cdHtcblx0XHRpZighdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnMuaGFzT3duUHJvcGVydHkod2Fsa2VyVHlwZSkpXG5cdFx0e1xuXHRcdFx0dmFyIHdhbGtlckdyYXBoRGF0YSA9IHRoaXMuY2FudmFzSG9sZGVyLmdldEdyYXBoRGF0YSh3YWxrZXJUeXBlKTtcblx0XHRcdC8qKipcblx0XHRcdHRoaXMud29ybGQud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlc1tcImdlbmVyaWNcIl07XG5cdFx0XHRpZih0aGlzLndvcmxkLndvcmxkRGlzcGxheS53YWxrZXJEaXNwbGF5VHlwZXMuaGFzT3duUHJvcGVydHkod2Fsa2VyVHlwZSkpXG5cdFx0XHR7XG5cdFx0XHRcdHdhbGtlckdyYXBoRGF0YSA9IHRoaXMud29ybGQud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlc1t3YWxrZXJUeXBlXTtcblx0XHRcdH0qL1xuXHRcdFx0Lypcblx0XHRcdGNvbnNvbGUubG9nKFwiYWRkaW5nIFwiK3dhbGtlclR5cGUrXG5cdFx0XHRcdFx0XCIgdGhpcy5jb25uZWN0b3JQb3NpdGlvbj1cIitDb21tb250b1N0cmluZyh0aGlzLmNvbm5lY3RvclBvc2l0aW9uKStcblx0XHRcdFx0XHRcIiB0aGlzLnBvc2l0aW9uPVwiK0NvbW1vbnRvU3RyaW5nKHRoaXMucG9zaXRpb24pK1x0XHRcblx0XHRcdFx0XHRcIlwiKTtcblx0XHRcdFx0XHQqL1xuXHRcdFx0Lypcblx0XHRcdGNvbnNvbGUubG9nKFwibmQgPVwiK0NvbW1vbnRvU3RyaW5nKHdhbGtlckdyYXBoRGF0YSkrXG5cdFx0XHRcdFx0XCJcIik7XG5cdFx0XHRcdFx0Ki9cblx0XHRcdHZhciBzaGFwZU5vZGUgPSBuZXcgTm9kZShcblx0XHRcdFx0XHRcdFwic2hhcGVOb2RlIGZvciBcIit0aGlzLm5hbWUrXCIgXCIrd2Fsa2VyVHlwZSxcblx0XHRcdFx0XHRcdHRoaXMucG9zaXRpb24sXG5cdFx0XHRcdFx0XHR0aGlzLmNhbnZhc0hvbGRlcixcblx0XHRcdFx0XHRcdFwianVuY3Rpb25QaWVTbGljZVwiLFxuXHRcdFx0XHRcdFx0bmV3IE9iamVjdCgpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFxuXHRcdFx0XG5cdFx0XHRzaGFwZU5vZGUubGF5ZXI9MTA7XG5cdFx0XHRzaGFwZU5vZGUuZGVidWdGdW5jdGlvbigpXG5cdFx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCJkZWJ1Z0Z1bmN0aW9uOlwiK3RoaXMubmFtZSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdID0gbmV3IFNoYXBlQ29ubmVjdG9yKFxuXHRcdFx0XHRcdHNoYXBlTm9kZSxcblx0XHRcdFx0XHRuZXcgQ29ubmVjdG9yRGlzcGxheUVtcHR5KCksXG5cdFx0XHRcdFx0c2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5zaGFwZSxcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oMCwwKSxcblx0XHRcdFx0XHQxMCxcblx0XHRcdFx0XHQwLjUsXG5cdFx0XHRcdFx0MC4wLFxuXHRcdFx0XHRcdDAuOTUsXG5cdFx0XHRcdFx0dGhpcy5uYW1lK1wiOlwiK3dhbGtlclR5cGUrXCI6XCIrc2hhcGVOb2RlLm5hbWUpO1xuXHRcdFx0dGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV0uc2hhcGVOb2RlID0gc2hhcGVOb2RlO1xuXHRcdFx0Ly90aGlzLm5vZGVzLnB1c2goc2hhcGVOb2RlKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0dGhpcy5hZGROb2RlKHNoYXBlTm9kZSk7XG5cdFx0XHR0aGlzLnNoYXBlTm9kZSA9IHNoYXBlTm9kZTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJnZXRDcmVhdGVXYWxrZXJUeXBlQ29ubmVjdGlvbjpHT1QgTkVXOndhbGtlcj1cIit0aGlzLm5hbWUrXCI6d2Fsa2VyVHlwZT1cIit3YWxrZXJUeXBlK1wiOnRzPVwiK3NoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8udHMpO1xuXHRcdFx0XG5cdFx0fVxuXHRcdHZhciBjb25uZWN0aW9uID0gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV07XG5cdFx0Ly9jb25zb2xlLmxvZyhcImdldENyZWF0ZVdhbGtlclR5cGVDb25uZWN0aW9uOndhbGtlcj1cIit0aGlzLm5hbWUrXCI6d2Fsa2VyVHlwZT1cIit3YWxrZXJUeXBlK1wiOnRzPVwiK2Nvbm5lY3Rpb24uc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby50cyk7XG5cdFx0XG5cdFx0cmV0dXJuKGNvbm5lY3Rpb24pO1xuXHR9XG5cdFxuXHRnZXROb2RlVWlEaXNwbGF5KG5vZGUpXG5cdHtcblx0XHRyZXR1cm4oXG5cdFx0XHRcdFwiPHVsPlwiK1xuXHRcdFx0XHRcIjxsaT4gbmFtZSA6IFwiK3RoaXMubmFtZStcIjwvbGk+XCIrXG5cdFx0XHRcdFwiPGxpPiBub2RlS2V5LnRzIDogXCIrdGhpcy5pbmZvRGF0YS5ub2RlS2V5LmtleStcIjwvbGk+XCIrXG5cdFx0XHRcdFwiPGxpPiBub2RlS2V5Lm5vZGVJZCA6IFwiK3RoaXMuaW5mb0RhdGEubm9kZUtleS5ub2RlSWQrXCI8L2xpPlwiK1xuXHRcdFx0XHRcIjwvdWw+XCIpO1xuXHR9XG5cdFxuXHRnZXRXYWxrZXJLZXlzU29ydGVkKG5vZGUpXG5cdHtcblx0XHR2YXIgd2Fsa2VyVHlwZUtleXMgPSBuZXcgQXJyYXkoKVxuXHRcdHZhciB0b3RhbFdhbGtlcnMgPSAwO1xuXHRcdGZvciAodmFyIHdhbGtlclR5cGUgaW4gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnMpXG5cdFx0e1xuXHRcdFx0d2Fsa2VyVHlwZUtleXMucHVzaCh3YWxrZXJUeXBlKTtcblx0XHRcdHZhciBjb25uZWN0b3IgPSB0aGlzLndhbGtlclR5cGVDb25uZWN0aW9uc1t3YWxrZXJUeXBlXTtcblx0XHRcdHRvdGFsV2Fsa2VycyArPSBjb25uZWN0b3Iubm9kZXMubGVuZ3RoO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyh3YWxrZXJUeXBlK1wiOnRvdGFsV2Fsa2Vycz1cIit0b3RhbFdhbGtlcnMrXCI6Zm9yIGNvbmVjdG9yPVwiK2Nvbm5lY3Rvci5ub2Rlcy5sZW5ndGgpO1xuXHRcblx0XHR9XG5cdFx0d2Fsa2VyVHlwZUtleXMuc29ydCgpO1xuXHRcdHJldHVybih3YWxrZXJUeXBlS2V5cyk7XG5cdH1cblx0XG5cdGdldFdhbGtlckFycmF5VG9GaXgoKVxuXHR7XG5cdFx0dmFyIHdhbGtlckFycmF5ID0gdGhpcy53YWxrZXJPYmplY3QudmFsdWVzKCk7XG5cdFx0cmV0dXJuKHdhbGtlckFycmF5KTtcblx0fVxuXHRcblx0Z2V0V2Fsa2VyQXJyYXkoKVxuXHR7XG5cdFx0Ly8gdGhpcyBpcyBTTE9XLi4gd2h5IGRvZXMgdGhlIGFib3ZlIG5vdCB3b3JrPyE/IT8hXG5cdFx0dmFyIHdhbGtlckFycmF5ID0gbmV3IEFycmF5KCk7XG5cdFx0dmFyIHdhbGtlclR5cGVLZXlzID0gdGhpcy5nZXRXYWxrZXJLZXlzU29ydGVkKCk7XG5cdFx0Zm9yICh2YXIgaT0wO2k8d2Fsa2VyVHlwZUtleXMubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgd2Fsa2VyVHlwZSA9IHdhbGtlclR5cGVLZXlzW2ldO1xuXHRcdFx0dmFyIGNvbm5lY3RvciA9IHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdO1xuXHRcdFx0Zm9yKHZhciBqPTA7ajxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2orKylcblx0XHRcdHtcblx0XHRcdFx0d2Fsa2VyQXJyYXkucHVzaChjb25uZWN0b3Iubm9kZXNbal0pO1xuXHRcblx0XHRcdH1cblx0XHR9XG5cdFxuXHRcdHJldHVybih3YWxrZXJBcnJheSk7XG5cdH1cblx0XG5cdGFkanVzdHdhbGtlclR5cGVDb25uZWN0aW9ucygpXG5cdHtcblx0XHR2YXIgd2Fsa2VyVHlwZUtleXMgPSB0aGlzLmdldFdhbGtlcktleXNTb3J0ZWQoKTtcblx0XHR2YXIgdG90YWxXYWxrZXJzID0gdGhpcy5nZXRXYWxrZXJBcnJheSgpLmxlbmd0aDtcblx0Ly9jb25zb2xlLmxvZyhcIndhbGVrckNvdW50PVwiK3RvdGFsV2Fsa2Vycyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIndhbGtlckNvdW50YWxrZXJDb3VudD1cIit0aGlzLndhbGtlck9iamVjdCk7XG5cdFx0Lypcblx0XHRuZXcgQXJyYXkoKVxuXHRcdHZhciB0b3RhbFdhbGtlcnMgPSAwO1xuXHRcdGZvciAodmFyIHdhbGtlclR5cGUgaW4gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnMpXG5cdFx0e1xuXHRcdFx0d2Fsa2VyVHlwZUtleXMucHVzaCh3YWxrZXJUeXBlKTtcblx0XHRcdHZhciBjb25uZWN0b3IgPSB0aGlzLndhbGtlclR5cGVDb25uZWN0aW9uc1t3YWxrZXJUeXBlXTtcblx0XHRcdHRvdGFsV2Fsa2VycyArPSBjb25uZWN0b3Iubm9kZXMubGVuZ3RoO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyh3YWxrZXJUeXBlK1wiOnRvdGFsV2Fsa2Vycz1cIit0b3RhbFdhbGtlcnMrXCI6Zm9yIGNvbmVjdG9yPVwiK2Nvbm5lY3Rvci5ub2Rlcy5sZW5ndGgpO1xuXHRcblx0XHR9XG5cdFx0d2Fsa2VyVHlwZUtleXMuc29ydCgpOyovXG5cdFx0dmFyIGFuZ2xlID0gMDtcblx0XHQvLyBhcmVhID0gcGkgcl4yXG5cdFx0Ly8gc28uLi4gaWYgd2UgaGF2ZSAxMCBub2Rlcy4uLlxuXHRcdC8vIGFuZCBhIG5vZGUgdGFrZXMgXCIxMDAgYXJlYVwiIHBlciBub2RlIChhIDEwWDEwIGFyZWEpXG5cdFx0Ly8gMTAgbm9kZXMgYW5kIDEwMGFyZWFeMlxuXHRcdC8vIHNxcnQoYXJlYS9waSkgPSByXG5cdFx0Ly8gc3FydCggKGFyZWEqbnVtYmVyTm9kZXMqYXJlYVBlck5vZGUpL1BJICkgPSBSXG5cdFx0dmFyIHdhbGtlckFyZWEgPSAyNTtcblx0XHQvL3ZhciByYWRpdXMgPSBNYXRoLnNxcnQoIHRvdGFsV2Fsa2Vycy9NYXRoLlBJICkqNDtcblx0XHR2YXIgcmFkaXVzID0gTWF0aC5zcXJ0KCB0b3RhbFdhbGtlcnMqd2Fsa2VyQXJlYSkgLyBNYXRoLlBJO1xuXHRcdFxuXHRcdGZvcih2YXIgaT0wO2k8d2Fsa2VyVHlwZUtleXMubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgd2Fsa2VyVHlwZSA9IHdhbGtlclR5cGVLZXlzW2ldO1xuXHRcdFx0dmFyIGNvbm5lY3RvciA9IHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdO1xuXHRcdFx0dmFyIHBlcmNlbnRPZldhbGtlcnMgPSBjb25uZWN0b3Iubm9kZXMubGVuZ3RoL3RvdGFsV2Fsa2Vycztcblx0XHRcdHZhciB3YWxrZXJBbmdsZSA9IHBlcmNlbnRPZldhbGtlcnMgKiAzNjA7XG5cdFx0XHRcblx0XHRcdHZhciBncmFwaERhdGEgPSB0aGlzLmNhbnZhc0hvbGRlci5nZXRHcmFwaERhdGEod2Fsa2VyVHlwZSk7XG5cdFx0XHQvKlxuXHRcdFx0Y29uc29sZS5sb2coXCJ3YWxrZXJUeXBlPVwiK3dhbGtlclR5cGUrXG5cdFx0XHRcdFx0XCI6Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDpcIitjb25uZWN0b3Iubm9kZXMubGVuZ3RoK1xuXHRcdFx0XHRcdFwiOnBlcmNlbnRPZldhbGtlcnM6XCIrcGVyY2VudE9mV2Fsa2Vycytcblx0XHRcdFx0XHRcIjp3YWxrZXJBbmdsZTpcIit3YWxrZXJBbmdsZStcblx0XHRcdFx0XHRcImdyYXBoRGF0YT1cIitDb21tb24udG9TdHJpbmcoZ3JhcGhEYXRhKStcblx0XHRcdFx0XHRcIlwiKTtcblx0Ki9cblx0XHRcdC8vY29uc29sZS5sb2cod2Fsa2VyVHlwZStcIjpiZWZvcmU6XCIrQ29tbW9udG9TdHJpbmcoY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkpKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJ3YWxrZXI9XCIrdGhpcy5uYW1lK1wiOndhbGtlclR5cGU9XCIrd2Fsa2VyVHlwZStcIjp0cz1cIitjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby50cyk7XG5cdFx0XHRcblx0XHRcdGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLnN0YXJ0QW5nbGUgPSBhbmdsZTtcblx0XHRcdGFuZ2xlICs9IHdhbGtlckFuZ2xlO1xuXHRcdFx0Y29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8uZW5kQW5nbGUgPSBhbmdsZTtcblx0XHRcdGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLnJhZGl1cyA9IHJhZGl1cztcblx0XHRcdFxuXHRcdFx0Y29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8uZmlsbENvbG9yID0gZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLmZpbGxDb2xvcjtcblx0XHRcdC8vaWYoY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8uZmlsbENvbG9yKVxuXHRcdFx0Ly9jb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5maWxsQ29sb3IgPSBcblx0XHRcdC8vLy8vLy8vY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkgPSBuZXcgQXJjRGlzcGxheVNoYXBlKGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvKVxuXHRcdFx0Y29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuaW5pdCgpO1xuXHRcdFx0Ly8vLy8vLy8vY29ubmVjdG9yLnNoYXBlID0gY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuc2hhcGU7XG5cdFx0XHRcblx0XHRcdC8vY29uc29sZS5sb2cod2Fsa2VyVHlwZStcIjphZnRlcjpcIitDb21tb250b1N0cmluZyhjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XG5cdFx0fVxuXHR9XG5cdFxuXHRhZGRXYWxrZXIod2Fsa2VyKVxuXHR7XG5cdFx0dGhpcy53YWxrZXJPYmplY3Rbd2Fsa2VyXSA9IHdhbGtlcjtcblx0XHR2YXIgY29ubmVjdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb24od2Fsa2VyLmdyYXBoRGF0YUtleSlcblx0XHQvL3ZhciBjb25uZWN0aW9uID0gdGhpcy5nZXRDcmVhdGVXYWxrZXJUeXBlQ29ubmVjdGlvbih3YWxrZXIuaW5mb0RhdGEud2Fsa2VyVHlwZUtleSlcblx0XHRjb25uZWN0aW9uLmFkZE5vZGUod2Fsa2VyKTtcblx0XHRcblx0XHR0aGlzLmFkanVzdHdhbGtlclR5cGVDb25uZWN0aW9ucygpO1xuXHR9XG5cdFxuXHRyZW1vdmVXYWxrZXIod2Fsa2VyKVxuXHR7XG5cdFx0dmFyIGNvbm5lY3Rpb24gPSB0aGlzLmdldENyZWF0ZVdhbGtlclR5cGVDb25uZWN0aW9uKHdhbGtlci5pbmZvRGF0YS53YWxrZXJUeXBlS2V5KTtcblx0XHRkZWxldGUgdGhpcy53YWxrZXJPYmplY3Rbd2Fsa2VyXTsgXG5cdFx0Y29ubmVjdGlvbi5yZW1vdmVOb2RlKHdhbGtlcik7XHRcblx0XHR0aGlzLmFkanVzdHdhbGtlclR5cGVDb25uZWN0aW9ucygpO1xuXHR9XG5cdFxuXHRsb2coKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXCJqdW5jdGlvbiBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcykpO1xuXHR9XG5cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IEp1bmN0aW9uO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkp1bmN0aW9uXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgQ29ubmVjdG9yRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2Nvbm5lY3RvcmRpc3BsYXkvY29ubmVjdG9yZGlzcGxheScpO1xudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIEp1bmN0aW9uQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yRGlzcGxheVxue1xuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcblx0e1xuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcblx0fVxuXHRcblx0ZHJhd0Nvbm5lY3RvcihjYW52YXNIb2xkZXIsY29ubmVjdG9yLG5vZGUpXG5cdHtcblx0XHRzdXBlci5kcmF3Q29ubmVjdG9yKGNhbnZhc0hvbGRlcixjb25uZWN0b3Isbm9kZSk7XG5cblx0XHRmb3IodmFyIGo9MDtqPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aisrKVxuXHRcdHtcblx0XHRcdHZhciBub2RlSiA9IGNvbm5lY3Rvci5ub2Rlc1tqXTtcdFx0XG5cdFx0XHR2YXIgcCA9IG5vZGUucG9zaXRpb24uY3JlYXRlQnlBZGRpbmcobm9kZS5jb25uZWN0b3JQb3NpdGlvbik7XG5cdFx0XHR2YXIgcGogPSBub2RlSi5wb3NpdGlvbi5jcmVhdGVCeUFkZGluZyhub2RlSi5jb25uZWN0b3JQb3NpdGlvbik7XG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5saW5lV2lkdGggPSA1O1xuXHRcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKFwiMDAwMDAwZmZcIik7XG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0Lm1vdmVUbyhwLmdldFgoKSxwLmdldFkoKSk7XG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5saW5lVG8ocGouZ2V0WCgpLHBqLmdldFkoKSk7XG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcblx0XHR9XG5cdH1cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IEp1bmN0aW9uQ29ubmVjdG9yO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkp1bmN0aW9uQ29ubmVjdG9yXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIEp1bmN0aW9uRGlzcGxheSBleHRlbmRzIE5vZGVEaXNwbGF5XG57XG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxuXHR7XG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xuXHRcdHRoaXMuY2hlY2tQb3NpdGlvbkluZm8gPSB7fTtcblx0fVxuXHRcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxuXHR7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIi0tLS0gXCIrbm9kZS5uYW1lK1wiIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xuXHRcdFxuXHRcdGlmKCFub2RlLmhhc093blByb3BlcnR5KFwiY2hlY2tQb3NpdGlvbkluZm9cIikpXG5cdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiLS0tLSBcIitub2RlLm5hbWUrXCIgXCIrbm9kZS5nZXROb2RlS2V5KCkrXCIgbWlzc2luZyBjaGVja1Bvc2l0aW9uSW5mbyAtLVwiKTtcblx0XHRcdFx0cmV0dXJuKGZhbHNlKTtcblx0XHR9XG5cblx0XHRcblx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uLmdldERpc3RhbmNlKHBvc2l0aW9uKTtcblx0XG5cdFxuXHRcdHJldHVybihcblx0XHRcdFx0KGRpc3RhbmNlPD1ub2RlLmdyYXBoRGF0YS5yYWRpdXMpIHx8XG5cdFx0XHRcdChcblx0XHRcdFx0XHRcdChub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRYPD1wb3NpdGlvbi5nZXRYKCkpICYmXG5cdFx0XHRcdFx0XHQobm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0WCtub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRXaWR0aCk+PXBvc2l0aW9uLmdldFgoKSAmJlxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFk8PXBvc2l0aW9uLmdldFkoKSkgJiZcblx0XHRcdFx0XHRcdChub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRZK25vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dEhlaWdodCk+PXBvc2l0aW9uLmdldFkoKVxuXHRcdFx0XHQpXG5cdFx0XHRcdCk7XG5cdH1cblx0XG5cdFxuXHRkcmF3Tm9kZShjYW52YXNIb2xkZXIsbm9kZSlcblx0e1xuXHRcdHN1cGVyLmRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiWlpaWlpaWlpaWlpaWlo6Ojo6XCIrbm9kZS5uYW1lKTtcblx0ICAgIHZhciByYWRpdXNBdmVyYWdlID0gMDtcblx0ICAgIGZvcih2YXIgaT0wO2k8bm9kZS5ub2Rlcy5sZW5ndGg7aSsrKVxuXHQgICAge1xuXHQgICAgIFx0dmFyIHN1Yk5vZGUgPSBub2RlLm5vZGVzW2ldO1xuXHQgICAgIFx0Ly9jb25zb2xlLmxvZyhcIiAgICAgICAgICAgIFpaWlpaWlpaWlpaWlpaOjo6OlwiK3N1Yk5vZGUubmFtZSk7XG5cdCAgICBcdHJhZGl1c0F2ZXJhZ2UgKz0gc3ViTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8ucmFkaXVzO1xuXHQgICAgfVxuXHQgICAgaWYocmFkaXVzQXZlcmFnZSE9MCkgcmFkaXVzQXZlcmFnZSA9IChyYWRpdXNBdmVyYWdlIC8gbm9kZS5ub2Rlcy5sZW5ndGgpO1xuXHQgICAgcmFkaXVzQXZlcmFnZSArPSB0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoKjU7XG5cdCAgICBcblx0ICAgIHZhciBqdW5jdGlvblRleHQgPSBub2RlLm5hbWU7XHQgICAgXG5cdCAgICB2YXIgcmVjdFBhZGRpbmcgPSB0aGlzLmRpc3BsYXlJbmZvLmZvbnRQaXhlbEhlaWdodC8yO1xuXHQgICAgXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5mb250PXRoaXMuZGlzcGxheUluZm8uZm9udFN0eWxlK1wiIFwiK3RoaXMuZGlzcGxheUluZm8uZm9udFBpeGVsSGVpZ2h0K1wicHggXCIrdGhpcy5kaXNwbGF5SW5mby5mb250RmFjZTsgXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC50ZXh0QWxpZ249XCJjZW50ZXJcIjtcblx0ICAgIHZhciB0ZXh0TWV0cmljcyA9IHRoaXMubWV0cmljc1RleHRNdXRpcGxlTGluZXMoXG5cdCAgICBcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQsXG5cdCAgICBcdFx0anVuY3Rpb25UZXh0LFxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8uZm9udFBpeGVsSGVpZ2h0LFxuXHQgICAgXHRcdFwiXFxuXCIpO1xuXHQgICAgXG5cdCAgICB2YXIgdG90YWxXaWR0aCA9IE1hdGgubWF4KHJhZGl1c0F2ZXJhZ2UrcmVjdFBhZGRpbmcsdGV4dE1ldHJpY3Mud2lkdGgrcmVjdFBhZGRpbmcrcmVjdFBhZGRpbmcpO1xuXHQgICAgdmFyIHRvdGFsSGVpZ2h0ID0gXG5cdCAgICBcdHJhZGl1c0F2ZXJhZ2UrXG5cdCAgICBcdHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGgqMitcblx0ICAgIFx0bm9kZS5ncmFwaERhdGEudGV4dFNwYWNlcitcblx0ICAgIFx0dGV4dE1ldHJpY3MuaGVpZ2h0K3JlY3RQYWRkaW5nO1xuXHQgICAgXG5cdCAgICBub2RlLndpZHRoID0gdG90YWxXaWR0aDtcblx0ICAgIG5vZGUuaGVpZ2h0ID0gdG90YWxIZWlnaHQ7XG5cdCAgICBcblx0XHRpZighbm9kZS5oYXNPd25Qcm9wZXJ0eShcImNoZWNrUG9zaXRpb25JbmZvXCIpKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coXCIqKioqIFwiK25vZGUubmFtZStcIiBtaXNzaW5nIGNoZWNrUG9zaXRpb25JbmZvIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcdFx0XHRcblx0XHRcdG5vZGUuY2hlY2tQb3NpdGlvbkluZm8gPSB7IG1ha2VJdFJlYWw6XCJ0cnVlXCIsIH07XG5cdFx0fVxuXHRcdHZhciB4ID0gbm9kZS5wb3NpdGlvbi5nZXRYKCk7XG5cdFx0dmFyIHkgPSBub2RlLnBvc2l0aW9uLmdldFkoKTtcblx0XHQvL3ggPSB0aGlzLmRyYXdQb3NpdGlvbi5nZXRYKCk7XG5cdFx0Ly95ID0gdGhpcy5kcmF3UG9zaXRpb24uZ2V0WSgpO1xuXG5cdCAgICAvL2lmKG5vZGUuY2hlY2tQb3NpdGlvbkluZm89PW51bGwpIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8gPSB7fTtcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24gPSBuZXcgUG9zaXRpb24oXG5cdCAgICBcdFx0eCxcblx0ICAgIFx0XHR5LXRvdGFsSGVpZ2h0LzIuMCtyYWRpdXNBdmVyYWdlKTtcblx0ICAgIFxuXHQgICAgbm9kZS5jb25uZWN0b3JQb3NpdGlvbi5zZXRZKC0odG90YWxIZWlnaHQvMi4wLXJhZGl1c0F2ZXJhZ2UpKTtcblx0XG5cdCAgICBcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFggPSB4LSh0ZXh0TWV0cmljcy53aWR0aCtyZWN0UGFkZGluZykvMi4wO1xuXHQgICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0WSA9IG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0WSgpK1xuXHQgICAgXHRyYWRpdXNBdmVyYWdlK1xuXHQgICAgXHR0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoK1xuXHQgICAgXHRub2RlLmdyYXBoRGF0YS50ZXh0U3BhY2VyO1xuXHQgICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0V2lkdGggPSB0ZXh0TWV0cmljcy53aWR0aCtyZWN0UGFkZGluZztcblx0ICAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dEhlaWdodCA9IHRleHRNZXRyaWNzLmhlaWdodCtyZWN0UGFkZGluZztcblx0XG5cdCAgICBcblx0ICAgIHRoaXMucm91bmRlZFJlY3QoXG5cdCAgICBcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQsXG5cdCBcdFx0ICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0WCxcblx0IFx0XHQgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRZLFxuXHQgXHRcdCAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFdpZHRoLFxuXHQgXHRcdCAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dEhlaWdodCxcblx0IFx0XHQgICB0aGlzLmRpc3BsYXlJbmZvLmZvbnRQaXhlbEhlaWdodC8zLFxuXHQgXHRcdCAgIHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGgsXG5cdCBcdFx0ICAgQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnJlY3RCb3JkZXJDb2xvciksXG5cdCBcdFx0ICAgQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnJlY3RGaWxsQ29sb3IpICk7XG5cdCAgICBcblx0ICAgIFxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlPUNvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5mb250Q29sb3IpO1xuXHRcblx0ICAgIHRoaXMuZmlsbFRleHRNdXRpcGxlTGluZXMoXG5cdCAgICBcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQsXG5cdCAgICBcdFx0anVuY3Rpb25UZXh0LFxuXHQgICAgXHRcdHgsXG5cdCAgICBcdFx0bm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0WStyZWN0UGFkZGluZyoyLjArdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aCxcblx0ICAgIFx0XHR0aGlzLmRpc3BsYXlJbmZvLmZvbnRQaXhlbEhlaWdodCxcblx0ICAgIFx0XHRcIlxcblwiKTtcblx0ICBcblx0ICBcblx0ICAgIGlmKG5vZGUuaXNTZWxlY3RlZClcblx0ICAgIHtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcik7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLnNlbGVjdEJvcmRlckNvbG9yKTtcblx0ICAgIH1cblx0ICAgIGVsc2Vcblx0ICAgIHtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmZpbGxDb2xvcik7XG5cdCAgICAgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uYm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgIC8qXG5cdCAgICBjb25zb2xlLmxvZyhcIm5hbWU9XCIrbm9kZS5uYW1lK1xuXHQgICAgXHRcdFwiOnNlbGVjdEZpbGxDb2xvcj1cIit0aGlzLmRpc3BsYXlJbmZvLnNlbGVjdEZpbGxDb2xvcitcblx0ICAgIFx0XHRcIjpmaWxsQ29sb3I9XCIrdGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IrXG5cdCAgICBcdFx0XCI6WD1cIitub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uLmdldFgoKStcblx0ICAgIFx0XHRcIjpZPVwiK25vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0WSgpK1xuXHQgICAgXHRcdFwiOnJhZGl1cz1cIityYWRpdXNBdmVyYWdlK1xuXHQgICAgXHRcdFwiXCJcblx0ICAgIFx0XHQpO1xuXHQgICAgKi9cblx0ICAgIFxuXHRcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYXJjKFxuXHRcdFx0XHRub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uLmdldFgoKSxcblx0XHRcdFx0bm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbi5nZXRZKCksXG5cdFx0XHRcdHJhZGl1c0F2ZXJhZ2UsLy9ub2RlLmdyYXBoRGF0YS5yYWRpdXMsXG5cdFx0XHRcdDAsXG5cdFx0XHRcdE1hdGguUEkgKiAyLCBmYWxzZSk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5jbG9zZVBhdGgoKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGwoKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcblx0XG5cdFxuXHQgICAgZm9yKHZhciBpPTA7aTxub2RlLm5vZGVzLmxlbmd0aDtpKyspXG5cdCAgICB7XG5cdCAgICAgXHR2YXIgc3ViTm9kZSA9IG5vZGUubm9kZXNbaV07XG5cdCAgICAgXHRzdWJOb2RlLnBvc2l0aW9uID0gbm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbjtcblx0ICAgIFx0c3ViTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZHJhd05vZGUobm9kZS5jYW52YXNIb2xkZXIsc3ViTm9kZSk7XG5cdCAgICB9XG5cdFxuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBKdW5jdGlvbkRpc3BsYXk7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6SnVuY3Rpb25EaXNwbGF5XCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vbm9kZXMvY29ubmVjdG9yL2Nvbm5lY3RvcicpO1xudmFyIFNwcmluZ0Nvbm5lY3RvciA9IHJlcXVpcmUoJy4uL25vZGVzL2Nvbm5lY3Rvci9zcHJpbmdjb25uZWN0b3InKTtcblxuXG5jbGFzcyBQYXRoIGV4dGVuZHMgU3ByaW5nQ29ubmVjdG9yXG57XG5cdGNvbnN0cnVjdG9yKGNvbm5lY3RvckRpc3BsYXksc3ByaW5nQW5jaG9yUG9pbnQsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IsbmFtZSlcblx0e1xuXHRcdHN1cGVyKGNvbm5lY3RvckRpc3BsYXksc3ByaW5nQW5jaG9yUG9pbnQsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IsbmFtZSlcblx0XHR0aGlzLndhbGtlck9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0fVxuXHRcblx0Z2V0Q2xpZW50SnNvbigpXG5cdHtcblx0XHR2YXIganNvbiA9IHN1cGVyLmdldENsaWVudEpzb24oKTtcblx0XHRqc29uLmp1bmN0aW9uU3RhcnQgPSB0aGlzLmp1bmN0aW9uU3RhcnQuZ2V0Tm9kZUtleSgpO1xuXHRcdGpzb24uanVuY3Rpb25FbmQgPSB0aGlzLmp1bmN0aW9uRW5kLmdldE5vZGVLZXkoKTtcblx0XHRyZXR1cm4oanNvbik7XG5cdH1cblx0XG5cdHNldEp1bmN0aW9ucyhqdW5jdGlvblN0YXJ0LGp1bmN0aW9uRW5kKVxuXHR7XG5cdCAgICB0aGlzLmp1bmN0aW9uU3RhcnQgPSBqdW5jdGlvblN0YXJ0O1xuXHRcdHRoaXMuanVuY3Rpb25FbmQgPSBqdW5jdGlvbkVuZDtcblx0XHR0aGlzLmFkZE5vZGUoanVuY3Rpb25TdGFydCk7XG5cdFx0dGhpcy5hZGROb2RlKGp1bmN0aW9uRW5kKTtcdFx0XG5cdH1cblx0XG5cdGdldENvbm5lY3RvcktleSgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5nZXRQYXRoS2V5KCkpO1xuXHR9XG5cdFxuXHRnZXRQYXRoS2V5KClcblx0e1xuXHRcdHJldHVybih0aGlzLmp1bmN0aW9uU3RhcnQuZ2V0Tm9kZUtleSgpK1wiI1wiK3RoaXMuanVuY3Rpb25FbmQuZ2V0Tm9kZUtleSgpKTtcblx0fVxuXHRcblx0bG9nKClcblx0e1xuXHRcdGNvbnNvbGUubG9nKFwicGF0aCBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcykpO1xuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBQYXRoO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlBhdGhcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBOb2RlID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWNhbnZhcy9ub2RlY2FudmFzJyk7XG52YXIgTm9kZUNhbnZhcyA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVjYW52YXMvbm9kZWNhbnZhcycpO1xudmFyIE5vZGVDYW52YXNNb3VzZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVjYW52YXMvbm9kZWNhbnZhc21vdXNlJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2NvbW1vbicpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBQYXRoID0gcmVxdWlyZSgnLi4vcGF0aHMvcGF0aCcpO1xudmFyIFdhbGtlciA9IHJlcXVpcmUoJy4uL3BhdGhzL3dhbGtlcicpO1xudmFyIEp1bmN0aW9uID0gcmVxdWlyZSgnLi4vcGF0aHMvanVuY3Rpb24nKTtcblxuY2xhc3MgUGF0aFdvcmxkIGV4dGVuZHMgTm9kZUNhbnZhc1xue1xuXHRjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIsd29ybGREaXNwbGF5KVxuXHR7XG5cdFx0c3VwZXIoY2FudmFzSG9sZGVyKTtcblx0XHR0aGlzLmp1bmN0aW9ucyA9IG5ldyBPYmplY3QoKTtcblx0XHR0aGlzLnBhdGhzID0gbmV3IE9iamVjdCgpO1xuXHRcdHRoaXMud2Fsa2VycyA9IG5ldyBPYmplY3QoKTtcblx0XHR0aGlzLndvcmxkVXBkYXRlUXVldWUgPSBuZXcgQXJyYXkoKTtcblx0XHR0aGlzLndvcmxkVXBkYXRlUXVldWUuaXNJbk5lZWRPZlNvcnRpbmcgPSBmYWxzZVxuXHRcdFxuXHRcdHRoaXMuanVuY3Rpb25TcGFjZXIgPSBjYW52YXNIb2xkZXIuZ2V0Q29ubmVjdG9yKFwianVuY3Rpb25TcGFjZXJcIixjYW52YXNIb2xkZXIuY2FudmFzTmFtZStcIjpqdW5jdGlvblNwYWNlclwiKSxcblx0XHR0aGlzLndvcmxkV2FsbCA9IGNhbnZhc0hvbGRlci5nZXRDb25uZWN0b3IoXCJ3b3JsZFdhbGxcIixjYW52YXNIb2xkZXIuY2FudmFzTmFtZStcIjp3b3JsZFdhbGxcIiksXG5cdFx0XG5cdFx0Ly90aGlzLmp1bmN0aW9uU3BhY2VyID0ganVuY3Rpb25TcGFjZXI7XG5cdFx0Ly90aGlzLndvcmxkV2FsbCA9IHdvcmxkV2FsbDtcblx0XHR0aGlzLndvcmxkRGlzcGxheSA9IHdvcmxkRGlzcGxheTtcblx0XHR0aGlzLmxhc3REYXRlID0gXCJcIjtcblx0XHR0aGlzLmNoZWNrVGltZXN0YW1wID0gXCJcIjtcblx0XHR0aGlzLm5vZGVDYW52YXNNb3VzZSA9IG5ldyBOb2RlQ2FudmFzTW91c2UodGhpcyk7XG5cdFx0dGhpcy5maWxsU3R5bGUgPSB3b3JsZERpc3BsYXkud29ybGRCYWNrZ3JvdW5kQ29sb3I7XG5cdH1cblx0XG5cdHN0YXRpYyBmaWxsUGF0aFdvcmxkRnJvbUNsaWVudEpzb24od29ybGQsanNvbilcblx0e1x0XHRcblx0XHQvL2NvbnNvbGUubG9nKFwiUGF0aFdvbHJkOmZpbGxQYXRoV29ybGRGcm9tQ2xpZW50SnNvblwiKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiUGF0aFdvbHJkOmZpbGxQYXRoV29ybGRGcm9tQ2xpZW50SnNvbjp3b3JsZE5hbWU9XCIrdGhpcy5uYW1lKTtcblx0XHR3b3JsZC5pbmZvRGF0YS5ub2RlS2V5LmtleSA9IGpzb24uaW5mb0RhdGEubm9kZUtleS5rZXk7XG5cdFx0d29ybGQuaW5mb0RhdGEubm9kZUtleS5ub2RlSWQgPSBqc29uLmluZm9EYXRhLm5vZGVLZXkubm9kZUlkO1xuXHRcdFxuXHRcdHZhciBqdW5jdGlvbktleU1hcCA9IHt9O1xuXHRcdE9iamVjdC5rZXlzKGpzb24uanVuY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0dmFyIGp1bmN0aW9uSnNvbiA9IGpzb24uanVuY3Rpb25zW2tleV07XG5cdFx0XHR2YXIganVuY3Rpb24gPSB3b3JsZC5nZXRDcmVhdGVKdW5jdGlvbihqdW5jdGlvbkpzb24ubmFtZSxqdW5jdGlvbkpzb24uaW5mb0RhdGEpO1xuXHRcdFx0anVuY3Rpb24ucG9zaXRpb24ueCA9IGp1bmN0aW9uSnNvbi5wb3NpdGlvbi54O1xuXHRcdFx0anVuY3Rpb24ucG9zaXRpb24ueSA9IGp1bmN0aW9uSnNvbi5wb3NpdGlvbi55O1xuXHRcdFx0anVuY3Rpb25LZXlNYXBba2V5XSA9IGp1bmN0aW9uO1xuXHRcdH0pO1xuXHRcdFxuXHRcdE9iamVjdC5rZXlzKGpzb24ucGF0aHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHR7XG5cdFx0XHR2YXIgcGF0aEpzb24gPSBqc29uLnBhdGhzW2tleV07XG5cdFx0XHR2YXIgcGF0aCA9IHdvcmxkLmdldENyZWF0ZVBhdGgoXG5cdFx0XHRcdFx0anVuY3Rpb25LZXlNYXBbcGF0aEpzb24uanVuY3Rpb25TdGFydF0sXG5cdFx0XHRcdFx0anVuY3Rpb25LZXlNYXBbcGF0aEpzb24uanVuY3Rpb25FbmRdLFxuXHRcdFx0XHRcdHBhdGhKc29uKTtcblx0XHR9KTtcblx0XHRcdFx0XG5cdFx0T2JqZWN0LmtleXMoanNvbi53YWxrZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0dmFyIHdhbGtlckpzb24gPSBqc29uLndhbGtlcnNba2V5XTtcblx0XHRcdHZhciB3YWxrZXIgPSB3b3JsZC5nZXRDcmVhdGVXYWxrZXIod2Fsa2VySnNvbi5uYW1lLHdhbGtlckpzb24uaW5mb0RhdGEpO1xuXHRcdFx0d2Fsa2VyLnBvc2l0aW9uLnggPSB3YWxrZXJKc29uLnBvc2l0aW9uLng7XG5cdFx0XHR3YWxrZXIucG9zaXRpb24ueSA9IHdhbGtlckpzb24ucG9zaXRpb24ueTtcdFxuXHRcdFx0d2Fsa2VyLnNldEN1cnJlbnRKdW5jdGlvbihqdW5jdGlvbktleU1hcFt3YWxrZXJKc29uLmN1cnJlbnRKdW5jdGlvbl0pO1xuXHRcdH0pO1xuXHR9XG5cdFxuXHQgIHhnZXROb2RlSnNvbihqc29uKVxuXHQgIHtcblx0XHQgIGpzb24ubmFtZSA9IHRoaXMubmFtZTtcblx0XHQgIGpzb24uZ3JhcGhEYXRhS2V5ID0gdGhpcy5ncmFwaERhdGFLZXk7XG5cdFx0ICBqc29uLmluZm9EYXRhID0gdGhpcy5pbmZvRGF0YTtcblx0XHQgIC8vanNvbi5pbmZvRGF0YS5ub2RlS2V5ID0gdGhpcy5nZXROb2RlS2V5KCk7XG5cdFx0ICBqc29uLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5nZXRDbGllbnRKc29uKCk7XG5cdFx0ICBqc29uLmNvbm5lY3RvcnMgPSBuZXcgQXJyYXkoKTtcblx0XHQgIGZvcih2YXIgaT0wO2k8dGhpcy5jb25uZWN0b3JzLmxlbmd0aDtpKyspIGpzb24uY29ubmVjdG9ycy5wdXNoKHRoaXMuY29ubmVjdG9yc1tpXS5nZXRDb25uZWN0b3JLZXkoKSk7XG5cblx0XHQgIHJldHVybihqc29uKTtcblx0ICB9XG5cblx0XG5cdHN0YXRpYyBjcmVhdGVQYXRoV29ybGRGcm9tQ2xpZW50SnNvbihjYW52YXNIb2xkZXIsd29ybGREZWYsanNvbilcblx0e1xuXHRcdHZhciBwYXRoV29ybGQgPSBuZXcgUGF0aFdvcmxkKGNhbnZhc0hvbGRlcix3b3JsZERlZik7XG5cdFx0XG5cdFx0T2JqZWN0LmtleXMoanNvbi5qdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHR7XG5cdFx0XHR2YXIganVuY3Rpb25Kc29uID0ganNvbi5qdW5jdGlvbnNba2V5XTtcblx0XHRcdHZhciBqdW5jdGlvbiA9IHBhdGhXb3JsZC5nZXRDcmVhdGVKdW5jdGlvbihqdW5jdGlvbkpzb24ubmFtZSxqdW5jdGlvbkpzb24uaW5mb0RhdGEpO1xuXHRcdFx0anVuY3Rpb24ucG9zaXRpb24ueCA9IGp1bmN0aW9uSnNvbi5wb3NpdGlvbi54O1xuXHRcdFx0anVuY3Rpb24ucG9zaXRpb24ueSA9IGp1bmN0aW9uSnNvbi5wb3NpdGlvbi55O1xuXHRcdH0pO1xuXHRcdFxuXHRcdE9iamVjdC5rZXlzKGpzb24ud2Fsa2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIHdhbGtlckpzb24gPSBqc29uLndhbGtlcnNba2V5XTtcblx0XHRcdFx0XHR2YXIgd2Fsa2VyID0gcGF0aFdvcmxkLmdldENyZWF0ZVdhbGtlcih3YWxrZXJKc29uLm5hbWUsd2Fsa2VySnNvbi5pbmZvRGF0YSk7XG5cdFx0XHRcdFx0d2Fsa2VyLnBvc2l0aW9uLnggPSB3YWxrZXJKc29uLnBvc2l0aW9uLng7XG5cdFx0XHRcdFx0d2Fsa2VyLnBvc2l0aW9uLnkgPSB3YWxrZXJKc29uLnBvc2l0aW9uLnk7XG5cdFx0XHRcdH0pO1xuXHRcdC8vanNvbi5qdW5jdGlvbnMgPSB7fTtcblx0XHQvL2pzb24ud2Fsa2VycyA9IHt9O1xuXHRcdC8vanNvbi5wYXRocyA9IHt9O1xuXHRcdFxuXHRcdC8qXG5cdFx0dmFyIGlzV2Fsa2VyTmV3ID0gdGhpcy5pc1dhbGtlck5ldyh3b3JsZFVwZGF0ZS53YWxrZXJOYW1lKTtcblx0XHR2YXIgaXNKdW5jdGlvbk5ldyA9IHRoaXMuaXNKdW5jdGlvbk5ldyh3b3JsZFVwZGF0ZS5qdW5jdGlvbk5hbWUpO1xuXHRcdHZhciB3YWxrZXIgPSB0aGlzLmdldENyZWF0ZVdhbGtlcih3b3JsZFVwZGF0ZS53YWxrZXJOYW1lLHdvcmxkVXBkYXRlLndhbGtlckluZm8pO1xuXHRcdHZhciBqdW5jdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlSnVuY3Rpb24od29ybGRVcGRhdGUuanVuY3Rpb25OYW1lLHdvcmxkVXBkYXRlLmp1bmN0aW9uSW5mbyk7XHRcdFxuXHRcdHZhciBjdXJyZW50SnVuY3Rpb24gPSB3YWxrZXIuZ2V0Q3VycmVudEp1bmN0aW9uKCk7XG5cdFx0Ki9cdFxuXHRcdC8vdmFyIHdvcmxkRGlzcGxheSA9IHNkZnNkO1xuXHRcdC8vdmFyIHdvcmxkV2FsbCA9IHNmc2Q7XG5cdFx0Ly92YXIganVuY3Rpb25TcGFjZXIgPSB4eHhcblx0XHRyZXR1cm4ocGF0aFdvcmxkKTtcblx0fVxuXHRcblx0ZHJhd0NhbnZhcyh0aW1lc3RhbXApXG5cdHtcblx0XHRzdXBlci5kcmF3Q2FudmFzKHRpbWVzdGFtcCk7XG5cdFx0dGhpcy5wYXRoV29scmRFeHRyYUFuaW1hdGlvbih0aW1lc3RhbXApO1xuXHR9XG5cdFxuXHRnZXRXb3JsZENsaWVudEpzb24oKVxuXHR7XG5cdFx0dmFyIGpzb24gPSB7fTtcblx0XHRcblx0XHRqc29uLmp1bmN0aW9ucyA9IHt9O1xuXHRcdHZhciBqdW5jdGlvbkxpc3QgPSB0aGlzLmdldEp1bmN0aW9uTGlzdCgpO1xuXHRcdGZvcih2YXIgaT0wO2k8anVuY3Rpb25MaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGp1bmN0aW9uID0ganVuY3Rpb25MaXN0W2ldO1xuXHRcdFx0anNvbi5qdW5jdGlvbnNbanVuY3Rpb24uZ2V0Tm9kZUtleSgpXSA9IGp1bmN0aW9uLmdldENsaWVudEpzb24oKTtcblx0XHR9XG5cdFx0XG5cdFx0XG5cdFx0anNvbi53YWxrZXJzID0ge307XG5cdFx0dmFyIHdhbGtlckxpc3QgPSB0aGlzLmdldFdhbGtlckxpc3QoKTtcblx0XHRmb3IodmFyIGk9MDtpPHdhbGtlckxpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgd2Fsa2VyID0gd2Fsa2VyTGlzdFtpXTtcblx0XHRcdGpzb24ud2Fsa2Vyc1t3YWxrZXIuZ2V0Tm9kZUtleSgpXSA9IHdhbGtlci5nZXRDbGllbnRKc29uKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGpzb24ucGF0aHMgPSB7fTtcblx0XHR2YXIgcGF0aExpc3QgPSB0aGlzLmdldFBhdGhMaXN0KCk7XG5cdFx0Zm9yKHZhciBpPTA7aTxwYXRoTGlzdC5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBwYXRoID0gcGF0aExpc3RbaV07XG5cdFx0XHRqc29uLnBhdGhzW3BhdGguZ2V0Q29ubmVjdG9yS2V5KCldID0gcGF0aC5nZXRDbGllbnRKc29uKCk7XG5cdFx0fVxuXHRcdFxuICBcdCAgIGpzb24uY2FudmFzSG9sZGVyID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0Q2xpZW50SnNvbigpO1xuICBcdCAgIGpzb24uaW5mb0RhdGEgPSB0aGlzLmluZm9EYXRhO1x0XG4gIFx0ICAgcmV0dXJuKGpzb24pO1xuXHR9XG5cdFxuXHRwYXRoV29scmRFeHRyYUFuaW1hdGlvbih0aW1lc3RhbXApXG5cdHtcblx0XHR0aGlzLnByZXBhcmVXb3JsZFVwZGF0ZVF1ZXVlKCk7XG5cblx0XHR2YXIgbG9jYWxDaGVja1RpbWVzdGFtcCA9IHRoaXMuYW5pbWF0aW9uRXhlY1RpbWUqdGhpcy50aW1lRmFjdG9yICsgdGhpcy5zdGFydFRpbWUuZ2V0VGltZSgpO1xuXHRcdHZhciBjaGVja0RhdGUgPSBuZXcgRGF0ZShsb2NhbENoZWNrVGltZXN0YW1wKTtcblxuXHRcdGlmKHRoaXMubGFzdERhdGU9PW51bGwpIHRoaXMubGFzdERhdGU9PVwiXCI7XG5cdFx0XG5cdFx0aWYodGhpcy5sYXN0RGF0ZSE9Y2hlY2tEYXRlLnRvTG9jYWxlU3RyaW5nKCkrXCIgXCIrQ29tbW9uLmdldERheU9mV2VlayhjaGVja0RhdGUpKVxuXHRcdHtcblx0XHRcdHRoaXMubGFzdERhdGUgPSBjaGVja0RhdGUudG9Mb2NhbGVTdHJpbmcoKStcIiBcIitDb21tb24uZ2V0RGF5T2ZXZWVrKGNoZWNrRGF0ZSk7XG5cdFx0XHRpZih0aGlzLmlzQW5pbWF0ZWQgJiYgdGhpcy5jYW52YXNIb2xkZXIuaXNEcmF3YWJsZSgpKSAkKCcjd29ybGRfZGF0ZScpLmh0bWwodGhpcy5sYXN0RGF0ZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuY2hlY2tUaW1lc3RhbXAgPSBsb2NhbENoZWNrVGltZXN0YW1wO1xuXHRcdGlmKHRoaXMuaXNBbmltYXRlZCkgd2hpbGUodGhpcy5pc05leHRXb3JsZFVwZGF0ZVJlYWR5KGxvY2FsQ2hlY2tUaW1lc3RhbXApKVxuXHRcdHtcblx0XHRcdHZhciBwcm9jY2VzZWQgPSB0aGlzLnByb2Nlc3NXb3JsZFVwZGF0ZVF1ZXVlKCk7XG5cdFx0XHRpZihwcm9jY2VzZWQhPW51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUocHJvY2Nlc2VkLnByb2Nlc3NUaW1lc3RhbXAqMTAwMCswKjEwMDApOy8vcHJvY2Nlc2VkLmdldERhdGUoKTtcblx0XHRcdH1cblx0XHR9XHRcblx0XHRcblx0XHQvLyBwcm9jZXNzIHRoZSB3YWxrZXJzIHJ1bGVzXG5cdFx0Zm9yICh2YXIgd2Fsa2VyS2V5IGluIHRoaXMud2Fsa2Vycylcblx0XHR7XG5cdFx0XHR2YXIgd2Fsa2VyID0gdGhpcy53YWxrZXJzW3dhbGtlcktleV07XG5cdFx0XHR3YWxrZXIucHJvY2Vzc1dhbGtlclJ1bGVzKHRoaXMpO1xuXHRcdH1cblx0fVxuXG5cdFxuXHRcblx0XG5cdGxvZygpXG5cdHtcblx0XHRjb25zb2xlLmxvZyhcInBhdGhXb3JsZCBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcy53b3JsZERpc3BsYXkpKTtcblx0fVxuXHRcblx0XG5cdGlzV2Fsa2VyTmV3KHdhbGtlck5hbWUpXG5cdHtcblx0XHRyZXR1cm4oIXRoaXMud2Fsa2Vycy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJOYW1lKSk7XG5cdH1cblx0XG5cdGlzSnVuY3Rpb25OZXcoanVuY3Rpb25OYW1lKVxuXHR7XG5cdFx0cmV0dXJuKCF0aGlzLmp1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShqdW5jdGlvbk5hbWUpKTtcblx0fVxuXHRcblx0aXNOZXh0V29ybGRVcGRhdGVSZWFkeSh0aW1lc3RhbXApXG5cdHtcblx0XHR2YXIgcmVhZHkgPSBmYWxzZTtcblx0XHRpZih0aGlzLndvcmxkVXBkYXRlUXVldWUubGVuZ3RoPjApXG5cdFx0e1xuXHRcdFx0cmVhZHkgPSB0aGlzLndvcmxkVXBkYXRlUXVldWVbMF0ucmVhZHlUb0JlUHJvY2Vzc2VkKHRpbWVzdGFtcCk7XG5cdFx0fVxuXHRcdHJldHVybihyZWFkeSk7XG5cdH1cblx0XG5cdHBlZWtBdE5leHRXb3JsZFVwZGF0ZSgpXG5cdHtcblx0XHR2YXIgd29ybGRVcGRhdGUgPSBudWxsO1xuXHRcdGlmKHRoaXMud29ybGRVcGRhdGVRdWV1ZS5sZW5ndGg+MClcblx0XHR7XG5cdFx0XHR3b3JsZFVwZGF0ZSA9IHRoaXMud29ybGRVcGRhdGVRdWV1ZVswXTtcblx0XHR9XG5cdFx0cmV0dXJuKHdvcmxkVXBkYXRlKTtcblx0fVxuXHRcblx0Z2V0Q3JlYXRlUGF0aChqdW5jdGlvblN0YXJ0LGp1bmN0aW9uRW5kLHBhdGhJbmZvKVxuXHR7XG5cdFx0dmFyIGNvbm5lY3RvckRpc3BsYXlPYmplY3QgPSB0aGlzLmNhbnZhc0hvbGRlci5nZXRDb25uZWN0b3JEaXNwbGF5KHBhdGhJbmZvLnBhdGhUeXBlS2V5KTtcblx0XHRcblx0XHR2YXIgcGF0aCA9IG51bGw7XG5cdFx0dmFyIHBhdGhLZXkgPSB0aGlzLmdldFBhdGhLZXkoanVuY3Rpb25TdGFydCxqdW5jdGlvbkVuZCk7XG5cdFx0aWYoIXRoaXMucGF0aHMuaGFzT3duUHJvcGVydHkocGF0aEtleSkpXG5cdFx0e1xuXHRcdFx0dmFyIHAgPSB0aGlzLmNhbnZhc0hvbGRlci5nZXRDb25uZWN0b3IoXCJwYXRoXCIscGF0aEtleSk7XG5cdFx0XHRwLnNldEp1bmN0aW9ucyhqdW5jdGlvblN0YXJ0LGp1bmN0aW9uRW5kKTtcblx0XHRcdHRoaXMucGF0aHNbcGF0aEtleV0gPSBwO1xuXHRcdH1cblx0XHR2YXIgcGF0aCA9IHRoaXMucGF0aHNbcGF0aEtleV07XG5cdFx0cmV0dXJuKHBhdGgpO1xuXHR9XG5cdFxuXHRnZXRXYWxrZXJMaXN0KClcblx0e1xuXHRcdHZhciB3YWxrZXJMaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0dmFyIHdhbGtlcnMgPSB0aGlzLndhbGtlcnM7XG5cdFx0T2JqZWN0LmtleXModGhpcy53YWxrZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0d2Fsa2VyTGlzdC5wdXNoKHdhbGtlcnNba2V5XSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuKHdhbGtlckxpc3QpO1xuXHR9XG5cblx0Z2V0UGF0aExpc3QoKVxuXHR7XG5cdFx0dmFyIHBhdGhMaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0dmFyIHBhdGhzID0gdGhpcy5wYXRocztcblx0XHRPYmplY3Qua2V5cyh0aGlzLnBhdGhzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0cGF0aExpc3QucHVzaChwYXRoc1trZXldKTtcblx0XHR9KTtcblx0XHRyZXR1cm4ocGF0aExpc3QpO1xuXHR9XG5cblx0Z2V0SnVuY3Rpb25MaXN0KClcblx0e1xuXHRcdHZhciBqdW5jdGlvbkxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHR2YXIganVuY3Rpb25zID0gdGhpcy5qdW5jdGlvbnM7XG5cdFx0T2JqZWN0LmtleXModGhpcy5qdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHR7XG5cdFx0XHRqdW5jdGlvbkxpc3QucHVzaChqdW5jdGlvbnNba2V5XSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuKGp1bmN0aW9uTGlzdCk7XG5cdH1cblx0XG5cdC8qXG5cdGdldEp1bnRpb25HcmFwaERhdGEoanVuY3Rpb25JbmZvKVxuXHR7XG5cdFx0dmFyIGp1bmN0aW9uR3JhcGhEYXRhID0gdGhpcy53b3JsZERpc3BsYXkuanVuY3Rpb25UeXBlc1tcImdlbmVyaWNcIl07XG5cdFxuXHRcdGlmKHRoaXMud29ybGREaXNwbGF5Lmp1bmN0aW9uVHlwZXMuaGFzT3duUHJvcGVydHkoanVuY3Rpb25JbmZvLmp1bmN0aW9uVHlwZUtleSkpXG5cdFx0e1xuXHRcdFx0anVuY3Rpb25HcmFwaERhdGEgPSB0aGlzLndvcmxkRGlzcGxheS5qdW5jdGlvblR5cGVzW2p1bmN0aW9uSW5mby5qdW5jdGlvblR5cGVLZXldO1xuXHRcblx0XHR9XG5cdFx0cmV0dXJuKGp1bmN0aW9uR3JhcGhEYXRhKTtcblx0fVxuXHQqL1xuXHRnZXRDcmVhdGVKdW5jdGlvbihuYW1lLGp1bmN0aW9uSW5mbylcblx0e1xuXHRcdC8vdmFyIGp1bmN0aW9uR3JhcGhEYXRhID0gdGhpcy5nZXRKdW50aW9uR3JhcGhEYXRhKGp1bmN0aW9uSW5mbyk7XG5cdFx0aWYoIXRoaXMuanVuY3Rpb25zLmhhc093blByb3BlcnR5KG5hbWUpKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coXCJQYXRoV29ybGQ6Z2V0Q3JlYXRlSnVuY3Rpb246dHlwZT1cIitqdW5jdGlvbkluZm8uanVuY3Rpb25UeXBlS2V5KTtcblxuXHRcdFx0dmFyIHN0YXJ0UG9zaXRpb24gPSB0aGlzLmdldFN0YXJ0UG9zaXRpb25KdW5jdGlvbigpO1xuXHRcdFx0dGhpcy5qdW5jdGlvbnNbbmFtZV0gPSBuZXcgSnVuY3Rpb24oXG5cdFx0XHRcdG5hbWUsXG5cdFx0XHRcdG5ldyBQb3NpdGlvbihzdGFydFBvc2l0aW9uLmdldFgoKSxzdGFydFBvc2l0aW9uLmdldFkoKSksXG5cdFx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLFxuXHRcdFx0XHRuZXcgQXJyYXkoKSxcblx0XHRcdFx0anVuY3Rpb25JbmZvLmp1bmN0aW9uVHlwZUtleSxcblx0XHRcdFx0anVuY3Rpb25JbmZvLFxuXHRcdFx0XHR0aGlzKTtcblx0XHRcdHZhciBqID0gdGhpcy5qdW5jdGlvbnNbbmFtZV07XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwicGF0aFdvcmxkIGdldENyZWF0ZUp1bmN0aW9uIGlubmVyIG5hbWU6XCIrai5uYW1lKVx0XG5cdFx0XHR0aGlzLmFkZE5vZGUoaik7XG5cdFx0XHR0aGlzLndvcmxkV2FsbC5hZGROb2RlKGopO1xuXHRcdFx0dGhpcy5qdW5jdGlvblNwYWNlci5hZGROb2RlKGopO1xuXHRcdH1cblx0XHR2YXIganVuY3Rpb24gPSB0aGlzLmp1bmN0aW9uc1tuYW1lXTtcblx0XG5cdFx0cmV0dXJuKGp1bmN0aW9uKTtcblx0fVxuXHRcblx0Lypcblx0Z2V0V2Fsa2VyR3JhcGhEYXRhKHdhbGtlckluZm8pXG5cdHtcblx0XHR2YXIgd2Fsa2VyR3JhcGhEYXRhID0gdGhpcy53b3JsZERpc3BsYXkud2Fsa2VyRGlzcGxheVR5cGVzW1wiZ2VuZXJpY1wiXTtcblx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0V2Fsa2VyR3JhcGhEYXRhOmxvb2tpbmcgdXA6XCIrQ29tbW9udG9TdHJpbmcod2Fsa2VySW5mbykpO1xuXHRcdGlmKHRoaXMud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlcy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJJbmZvLndhbGtlclR5cGVLZXkpKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coXCIgICAgIGdldFdhbGtlckdyYXBoRGF0YTpmb3VuZDpcIitDb21tb250b1N0cmluZyh3YWxrZXJJbmZvLndhbGtlclR5cGVLZXkpKTtcblx0XHRcdHdhbGtlckdyYXBoRGF0YSA9IHRoaXMud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlc1t3YWxrZXJJbmZvLndhbGtlclR5cGVLZXldO1xuXHRcdH1cblx0XHRyZXR1cm4od2Fsa2VyR3JhcGhEYXRhKTtcblx0fVxuXHQqL1xuXHRnZXRDcmVhdGVXYWxrZXIod2Fsa2VyTmFtZSx3YWxrZXJJbmZvKVxuXHR7XG5cdFx0Ly92YXIgd2Fsa2VyR3JhcGhEYXRhID0gdGhpcy5nZXRXYWxrZXJHcmFwaERhdGEod2Fsa2VySW5mbyk7XG5cdFx0XG5cdFx0aWYoIXRoaXMud2Fsa2Vycy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJOYW1lKSlcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiUGF0aFdvcmxkOmdldENyZWF0ZVdhbGtlcjp0eXBlPVwiK3dhbGtlckluZm8ud2Fsa2VyVHlwZUtleSk7XG5cblx0XHRcdHZhciBzdGFydFBvc2l0aW9uID0gdGhpcy5nZXRTdGFydFBvc2l0aW9uV2Fsa2VyKCk7XG5cdFx0XHR0aGlzLndhbGtlcnNbd2Fsa2VyTmFtZV0gPSBuZXcgV2Fsa2VyKFxuXHRcdFx0XHRcdHdhbGtlck5hbWUsXG5cdFx0XHRcdFx0bmV3IFBvc2l0aW9uKHN0YXJ0UG9zaXRpb24uZ2V0WCgpLHN0YXJ0UG9zaXRpb24uZ2V0WSgpKSxcblx0XHRcdFx0XHR0aGlzLmNhbnZhc0hvbGRlcixcblx0XHRcdFx0XHRuZXcgQXJyYXkoKSxcblx0XHRcdFx0XHR3YWxrZXJJbmZvLndhbGtlclR5cGVLZXksXG5cdFx0XHRcdFx0d2Fsa2VySW5mbyk7XG5cdFx0XHR2YXIgdyA9IHRoaXMud2Fsa2Vyc1t3YWxrZXJOYW1lXTtcblx0XHRcdHRoaXMuYWRkTm9kZSh3KTtcblx0XHRcdHRoaXMud29ybGRXYWxsLmFkZE5vZGUodyk7XG5cdFx0XHQvL3RoaXMuanVuY3Rpb25TcGFjZXIuYWRkTm9kZShqKTtcblx0XHR9XG5cdFx0dmFyIHdhbGtlciA9IHRoaXMud2Fsa2Vyc1t3YWxrZXJOYW1lXTsgXG5cdFx0cmV0dXJuKHdhbGtlcik7XG5cdH1cblx0XG5cdHJlbW92ZVdhbGtlcih3YWxrZXIpXG5cdHtcblx0XHQvL2NvbnNvbGUubG9nKFwiUGF0aFdvcmxkLnJlbW92ZVdhbGtlcjpcIit3YWxrZXIubmFtZStcIiBhdCBcIit3YWxrZXIuZ2V0Q3VycmVudEp1bmN0aW9uKCkubmFtZSk7XG5cdFx0aWYod2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpKVx0d2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpLnJlbW92ZVdhbGtlcih3YWxrZXIpO1xuXHRcdHRoaXMucmVtb3ZlTm9kZSh3YWxrZXIpO1xuXHRcdHRoaXMud29ybGRXYWxsLnJlbW92ZU5vZGUod2Fsa2VyKTtcblx0XHRkZWxldGUgdGhpcy53YWxrZXJzW3dhbGtlci5uYW1lXTtcblx0fVxuXHRcblx0Z2V0VGVsZXBvcnRQYXRoKHN0YXJ0SnVuY3Rpb24sZW5kSnVuY3Rpb24pXG5cdHtcblx0XHR2YXIgc3RhcnRKdW5jdGlvbk5hbWUgPSBcIlwiO1xuXHRcdHZhciBlbmRKdW5jdGlvbk5hbWUgPSBcIlwiO1xuXHRcdGlmKHN0YXJ0SnVuY3Rpb24hPW51bGwpIHN0YXJ0SnVuY3Rpb25OYW1lID0gc3RhcnRKdW5jdGlvbi5uYW1lO1xuXHRcdGlmKGVuZEp1bmN0aW9uIT1udWxsKSBlbmRKdW5jdGlvbk5hbWUgPSBlbmRKdW5jdGlvbi5uYW1lO1xuXHRcdHZhciB0ZWxlcG9ydFBhdGhSZXR1cm4gPSBudWxsO1xuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy53b3JsZERpc3BsYXkudGVsZXBvcnRQYXRocy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciB0ZWxlcG9ydFBhdGggPSB0aGlzLndvcmxkRGlzcGxheS50ZWxlcG9ydFBhdGhzW2ldO1xuXHRcdFx0dmFyIHN0YXJ0SnVuY3Rpb25SZWdFeHAgPSBuZXcgUmVnRXhwKHRlbGVwb3J0UGF0aC5zdGFydEp1bmN0aW9uKTtcblx0XHRcdHZhciBlbmRKdW5jdGlvblJlZ0V4cCA9IG5ldyBSZWdFeHAodGVsZXBvcnRQYXRoLmVuZEp1bmN0aW9uKTtcblx0XHRcdGlmKFxuXHRcdFx0XHRcdHN0YXJ0SnVuY3Rpb25SZWdFeHAudGVzdChzdGFydEp1bmN0aW9uTmFtZSkgJiZcblx0XHRcdFx0XHRlbmRKdW5jdGlvblJlZ0V4cC50ZXN0KGVuZEp1bmN0aW9uTmFtZSkgJiZcblx0XHRcdFx0XHRzdGFydEp1bmN0aW9uTmFtZSE9ZW5kSnVuY3Rpb25OYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR0ZWxlcG9ydFBhdGhSZXR1cm4gPSB0ZWxlcG9ydFBhdGg7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4odGVsZXBvcnRQYXRoUmV0dXJuKTtcblx0fVxuXHRcblx0Z2V0RW5kUG9pbnRNb2Qoc3RhcnRKdW5jdGlvbixlbmRKdW5jdGlvbilcblx0e1xuXHRcdHZhciBzdGFydEp1bmN0aW9uTmFtZSA9IFwiXCI7XG5cdFx0dmFyIGVuZEp1bmN0aW9uTmFtZSA9IFwiXCI7XG5cdFx0aWYoc3RhcnRKdW5jdGlvbiE9bnVsbCkgc3RhcnRKdW5jdGlvbk5hbWUgPSBzdGFydEp1bmN0aW9uLm5hbWU7XG5cdFx0aWYoZW5kSnVuY3Rpb24hPW51bGwpIGVuZEp1bmN0aW9uTmFtZSA9IGVuZEp1bmN0aW9uLm5hbWU7XG5cdFx0dmFyIGVuZFBvaW50UmV0dXJuID0gbnVsbDtcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMud29ybGREaXNwbGF5LmVuZFBvaW50TW9kcy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBlbmRQb2ludCA9IHRoaXMud29ybGREaXNwbGF5LmVuZFBvaW50TW9kc1tpXTtcblx0XHRcdHZhciBzdGFydEp1bmN0aW9uUmVnRXhwID0gbmV3IFJlZ0V4cChlbmRQb2ludC5zdGFydEp1bmN0aW9uKTtcblx0XHRcdHZhciBlbmRKdW5jdGlvblJlZ0V4cCA9IG5ldyBSZWdFeHAoZW5kUG9pbnQuZW5kSnVuY3Rpb24pO1xuXHRcdFx0aWYoXG5cdFx0XHRcdFx0c3RhcnRKdW5jdGlvblJlZ0V4cC50ZXN0KHN0YXJ0SnVuY3Rpb25OYW1lKSAmJlxuXHRcdFx0XHRcdGVuZEp1bmN0aW9uUmVnRXhwLnRlc3QoZW5kSnVuY3Rpb25OYW1lKSAmJlxuXHRcdFx0XHRcdHN0YXJ0SnVuY3Rpb25OYW1lIT1lbmRKdW5jdGlvbk5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdGVuZFBvaW50UmV0dXJuID0gZW5kUG9pbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4oZW5kUG9pbnRSZXR1cm4pO1xuXHR9XG5cdFxuXHRwcm9jZXNzV29ybGRVcGRhdGVRdWV1ZSgpXG5cdHtcblx0XHR2YXIgd29ybGRVcGRhdGUgPSB0aGlzLmdldE5leHRGcm9tV29ybGRVcGRhdGUoKTtcblx0XHRpZih3b3JsZFVwZGF0ZSE9bnVsbCkgd29ybGRVcGRhdGUgPSB0aGlzLnByb2Nlc3NXb3JsZFVwZGF0ZSh3b3JsZFVwZGF0ZSk7XG5cdFx0cmV0dXJuKHdvcmxkVXBkYXRlKTtcblx0fVxuXHRcblx0cHJvY2Vzc1dvcmxkVXBkYXRlKHdvcmxkVXBkYXRlKVxuXHR7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInByb2Nlc3NXb3JsZFVwZGF0ZVF1ZXVlOndvcmxkVXBkYXRlPVwiK0NvbW1vbnRvU3RyaW5nKHdvcmxkVXBkYXRlKSk7XHRcdFxuXHRcdHZhciBpc1dhbGtlck5ldyA9IHRoaXMuaXNXYWxrZXJOZXcod29ybGRVcGRhdGUud2Fsa2VyTmFtZSk7XG5cdFx0dmFyIGlzSnVuY3Rpb25OZXcgPSB0aGlzLmlzSnVuY3Rpb25OZXcod29ybGRVcGRhdGUuanVuY3Rpb25OYW1lKTtcblx0XHR2YXIgd2Fsa2VyID0gdGhpcy5nZXRDcmVhdGVXYWxrZXIod29ybGRVcGRhdGUud2Fsa2VyTmFtZSx3b3JsZFVwZGF0ZS53YWxrZXJJbmZvKTtcblx0XHR2YXIganVuY3Rpb24gPSB0aGlzLmdldENyZWF0ZUp1bmN0aW9uKHdvcmxkVXBkYXRlLmp1bmN0aW9uTmFtZSx3b3JsZFVwZGF0ZS5qdW5jdGlvbkluZm8pO1x0XHRcblx0XHR2YXIgY3VycmVudEp1bmN0aW9uID0gd2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpO1x0XG5cdFx0XG5cdFx0dmFyIGVuZFBvaW50TW9kID0gdGhpcy5nZXRFbmRQb2ludE1vZChjdXJyZW50SnVuY3Rpb24sanVuY3Rpb24pO1x0XHRcblx0XHRpZihlbmRQb2ludE1vZCE9bnVsbClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhcIkJlZm9yZSBnZXRFbmRQb2ludE1vZCEgbmFtZT1cIitlbmRQb2ludE1vZC5lbmRQb2ludE1vZE5hbWUrXCIgc3RhcnQ9XCIrY3VycmVudEp1bmN0aW9uLm5hbWUrXG5cdFx0XHRcdFx0XCIgZW5kPVwiK2p1bmN0aW9uLm5hbWUrXCIgd2Fsa2VyTmFtZTpcIit3b3JsZFVwZGF0ZS53YWxrZXJOYW1lK1xuXHRcdFx0XHRcdFwiIHdvcmxkVXBkYXRlPVwiK0NvbW1vbnRvU3RyaW5nKHdvcmxkVXBkYXRlKSk7XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0aXNKdW5jdGlvbk5ldyA9IHRoaXMuaXNKdW5jdGlvbk5ldyhlbmRQb2ludE1vZC5lbmRQb2ludE1vZE5hbWUpO1xuXHRcdFx0d29ybGRVcGRhdGUuanVuY3Rpb25JbmZvLmp1bmN0aW9uTmFtZSA9IGVuZFBvaW50TW9kLmVuZFBvaW50TW9kTmFtZTtcblx0XHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uTmFtZSA9IGVuZFBvaW50TW9kLmVuZFBvaW50TW9kTmFtZTtcblx0XHRcdGp1bmN0aW9uID0gdGhpcy5nZXRDcmVhdGVKdW5jdGlvbihlbmRQb2ludE1vZC5lbmRQb2ludE1vZE5hbWUsd29ybGRVcGRhdGUuanVuY3Rpb25JbmZvKTtcblx0XHRcdGNvbnNvbGUubG9nKFwiLi4uYWZ0ZXIgZ2V0RW5kUG9pbnRNb2QhIG5hbWU9XCIrZW5kUG9pbnRNb2QuZW5kUG9pbnRNb2ROYW1lK1wiIHN0YXJ0PVwiK2N1cnJlbnRKdW5jdGlvbi5uYW1lK1xuXHRcdFx0XHRcdFwiIGVuZD1cIitqdW5jdGlvbi5uYW1lK1wiIHdhbGtlck5hbWU6XCIrd29ybGRVcGRhdGUud2Fsa2VyTmFtZStcblx0XHRcdFx0XHRcIiB3b3JsZFVwZGF0ZT1cIitDb21tb250b1N0cmluZyh3b3JsZFVwZGF0ZSkpO1xuXHRcdFx0Ly93YWxrZXIuc2V0Q3VycmVudEp1bmN0aW9uKGN1cnJlbnRKdW5jdGlvbik7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciB0ZWxlcG9ydFBhdGggPSB0aGlzLmdldFRlbGVwb3J0UGF0aChjdXJyZW50SnVuY3Rpb24sanVuY3Rpb24pO1xuXHRcdGlmKHRlbGVwb3J0UGF0aCE9bnVsbClcblx0XHR7XHR2YXIgY2puYW1lID0gXCJudWxsXCI7XG5cdFx0XHRpZihjdXJyZW50SnVuY3Rpb24hPW51bGwpIGNqbmFtZSA9IGN1cnJlbnRKdW5jdGlvbi5uYW1lOyBcblx0XHRcdC8vY29uc29sZS5sb2coXCJUZWxlcG9ydCBQYXRoISBuYW1lPVwiK3RlbGVwb3J0UGF0aC50ZWxlcG9ydE5hbWUrXCIgc3RhcnQ9XCIrY2puYW1lK1wiIGVuZD1cIitqdW5jdGlvbi5uYW1lKTtcblx0XHRcdFxuXHRcdFx0Y3VycmVudEp1bmN0aW9uID0gdGhpcy5nZXRDcmVhdGVKdW5jdGlvbih0ZWxlcG9ydFBhdGgudGVsZXBvcnROYW1lLFxuXHRcdFx0XHRcdHtqdW5jdGlvbk5hbWU6dGVsZXBvcnRQYXRoLnRlbGVwb3J0TmFtZSxqdW5jdGlvblR5cGVLZXk6XCJnZW5lcmljSnVuY3Rpb25cIn0pO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIi4uLmFmdGVyIFRlbGVwb3J0IFBhdGghIG5hbWU9XCIrdGVsZXBvcnRQYXRoLnRlbGVwb3J0TmFtZStcIiBzdGFydD1cIitjdXJyZW50SnVuY3Rpb24ubmFtZStcIiBlbmQ9XCIranVuY3Rpb24ubmFtZSk7XG5cdFx0XHR3YWxrZXIuc2V0Q3VycmVudEp1bmN0aW9uKGN1cnJlbnRKdW5jdGlvbik7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKGN1cnJlbnRKdW5jdGlvbiE9bnVsbClcblx0XHR7XG5cdFx0XHR0aGlzLmdldENyZWF0ZVBhdGgoY3VycmVudEp1bmN0aW9uLGp1bmN0aW9uLHdvcmxkVXBkYXRlLnBhdGhJbmZvKTtcblx0XHRcdC8vd2Fsa2VyLnNldEN1cnJlbnRKdW5jdGlvbihqdW5jdGlvbik7XG5cdFx0fVxuXHRcdFxuXHRcdHdhbGtlci5zZXRDdXJyZW50SnVuY3Rpb24oanVuY3Rpb24pO1xuXHRcdHdhbGtlci5sYXN0VXBkYXRlVGltZVN0YW1wID0gdGhpcy5jaGVja1RpbWVzdGFtcDtcblx0XHRpZihpc0p1bmN0aW9uTmV3KVxuXHRcdHtcblx0XHRcdGlmKHRoaXMuanVuY3Rpb25zLmxlbmd0aD09MClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5qdW5jdGlvbi5wb3NpdGlvbi5zZXRYKDApO1xuXHRcdFx0XHR0aGlzLmp1bmN0aW9uLnBvc2l0aW9uLnNldFkoMCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKGN1cnJlbnRKdW5jdGlvbj09bnVsbClcblx0XHRcdHtcblx0XHRcdFx0anVuY3Rpb24ucG9zaXRpb24uc2V0WCh0aGlzLndvcmxkRGlzcGxheS5yZWxheGVkRGlzdGFuY2VEZWZhdWx0KTtcblx0XHRcdFx0anVuY3Rpb24ucG9zaXRpb24uc2V0WSh0aGlzLndvcmxkRGlzcGxheS5yZWxheGVkRGlzdGFuY2VEZWZhdWx0KTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0anVuY3Rpb24ucG9zaXRpb24uc2V0WCggY3VycmVudEp1bmN0aW9uLnBvc2l0aW9uLmdldFgoKSt0aGlzLndvcmxkRGlzcGxheS5qdW5jdGlvblJhZGl1c0RlZmF1bHQqKE1hdGgucmFuZG9tKCkpICk7XG5cdFx0XHRcdGp1bmN0aW9uLnBvc2l0aW9uLnNldFkoIGN1cnJlbnRKdW5jdGlvbi5wb3NpdGlvbi5nZXRZKCkrdGhpcy53b3JsZERpc3BsYXkuanVuY3Rpb25SYWRpdXNEZWZhdWx0KihNYXRoLnJhbmRvbSgpKSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihpc1dhbGtlck5ldylcblx0XHR7XG5cdFx0XHR3YWxrZXIucG9zaXRpb24uc2V0WCgganVuY3Rpb24ucG9zaXRpb24uZ2V0WCgpICk7XG5cdFx0XHR3YWxrZXIucG9zaXRpb24uc2V0WSgganVuY3Rpb24ucG9zaXRpb24uZ2V0WSgpICk7XG5cdFx0fVxuXHRcdHRoaXMud29ybGRVcGRhdGVRdWV1ZVByb2Nlc3NlZC5wdXNoKHdvcmxkVXBkYXRlKTtcblx0XHRyZXR1cm4od29ybGRVcGRhdGUpO1xuXHR9XG5cdFxuXHRcblx0XG5cdGFkZFRvV29ybGRVcGRhdGVRdWV1ZSh3b3JsZFVwZGF0ZSlcblx0e1xuXHRcdHRoaXMud29ybGRVcGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZyA9IHRydWU7XG5cdFx0dGhpcy53b3JsZFVwZGF0ZVF1ZXVlLnB1c2god29ybGRVcGRhdGUpO1xuXHR9XHRcblx0XG5cdHByZXBhcmVXb3JsZFVwZGF0ZVF1ZXVlKClcblx0e1xuXHRcdC8vY29uc29sZS5sb2coXCJwcmVwYXJlV29ybGRVcGRhdGVRdWV1ZTppc0luTmVlZE9mU29ydGluZz1cIit0aGlzLndvcmxkVXBkYXRlUXVldWUuaXNJbk5lZWRPZlNvcnRpbmcpO1xuXHRcdGlmKHRoaXMud29ybGRVcGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZylcblx0XHR7XG5cdFx0XHR0aGlzLndvcmxkVXBkYXRlUXVldWUuc29ydChcblx0XHRcdFx0ZnVuY3Rpb24oYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybihhLnByb2Nlc3NUaW1lc3RhbXAtYi5wcm9jZXNzVGltZXN0YW1wKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHRcdFx0dGhpcy53b3JsZFVwZGF0ZVF1ZXVlLmlzSW5OZWVkT2ZTb3J0aW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdFxuXHRnZXROZXh0RnJvbVdvcmxkVXBkYXRlKHdvcmxkVXBkYXRlKVxuXHR7XG5cdFx0dmFyIHdvcmxkVXBkYXRlID0gbnVsbDtcblx0XHRpZih0aGlzLndvcmxkVXBkYXRlUXVldWUubGVuZ3RoPjApXG5cdFx0e1xuXHRcdFx0d29ybGRVcGRhdGUgPSB0aGlzLndvcmxkVXBkYXRlUXVldWVbMF07XG5cdFx0XHR0aGlzLndvcmxkVXBkYXRlUXVldWUuc2hpZnQoKTtcblx0XHR9XG5cdFx0cmV0dXJuKHdvcmxkVXBkYXRlKTtcblx0fVxuXHRcblx0Z2V0V2Fsa2VyS2V5KHdhbGtlcilcblx0e1xuXHRcdHJldHVybih3YWxrZXIubmFtZSk7XG5cdH1cblx0XG5cdGdldEp1bmN0aW9uS2V5KGp1bmN0aW9uKVxuXHR7XG5cdFx0cmV0dXJuKGp1bmN0aW9uLmdldE5vZGVLZXkoKSk7XG5cdH1cblx0XG5cdGdldFBhdGhLZXkoanVuY3Rpb25TdGFydCxqdW5jdGlvbkVuZClcblx0e1xuXHRcdHJldHVybih0aGlzLmdldEp1bmN0aW9uS2V5KGp1bmN0aW9uU3RhcnQpK1wiI1wiK3RoaXMuZ2V0SnVuY3Rpb25LZXkoanVuY3Rpb25FbmQpKTtcblx0fVxuXHRcblx0Z2V0U3RhcnRQb3NpdGlvbldhbGtlcigpXG5cdHtcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuY2FudmFzSG9sZGVyLmdldFdpZHRoKCkvMix0aGlzLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKS8yKSk7XG5cdH1cblx0XG5cdGdldFN0YXJ0UG9zaXRpb25KdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuY2FudmFzSG9sZGVyLmdldFdpZHRoKCkvMix0aGlzLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKS8yKSk7XG5cdH1cblxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gUGF0aFdvcmxkO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlBhdGhXb3JsZFwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIENhbnZhc0RlZiA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzZGVmJyk7XG5cblxuY2xhc3MgUGF0aFdvcmxkRGVmIGV4dGVuZHMgQ2FudmFzRGVmXG57XG5cdGNvbnN0cnVjdG9yKClcblx0e1x0XHRcblx0XHRzdXBlcigpO1xuXHR9XG5cdFxuXHRnZXRQYXRoUGFydHMoKVxuXHR7XG5cdFx0dGhyb3cgXCJQYXRoV29ybGREZWYuZ2V0UGF0aFBhcnRzIG5vdCBkZWZpbmVkXCI7XG5cdH1cblx0XG5cdGdldFBhdGhEZWYoKVxuXHR7XG5cdFx0dGhyb3cgXCJQYXRoV29ybGREZWYuZ2V0UGF0aERlZiBub3QgZGVmaW5lZFwiO1xuXHR9XG5cdFxuXHRnZXRXYWxrZXJKdW5jdGlvblJ1bGVzKClcblx0e1xuXHRcdHRocm93IFwiUGF0aFdvcmxkRGVmLmdldFdhbGtlckp1bmN0aW9uUnVsZXMgbm90IGRlZmluZWRcIjtcblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBQYXRoV29ybGREZWY7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6UGF0aFdvcmxkRGVmXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgTm9kZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGUnKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIFdhbGtlciBleHRlbmRzIE5vZGVcbntcblx0Y29uc3RydWN0b3IobmFtZSxwb3NpdGlvbixjYW52YXNIb2xkZXIsc2hhcGVMaXN0LGdyYXBoRGF0YUtleSxpbmZvRGF0YSlcblx0e1xuXHRcdHN1cGVyKG5hbWUscG9zaXRpb24sY2FudmFzSG9sZGVyLGdyYXBoRGF0YUtleSxpbmZvRGF0YSk7XG5cdFx0V2Fsa2VyLmluaXRXYWxrZXIodGhpcyxuYW1lLHBvc2l0aW9uLHNoYXBlTGlzdCxncmFwaERhdGFLZXksaW5mb0RhdGEpO1xuXHR9XG5cdFxuXHRzdGF0aWMgaW5pdFdhbGtlcih3YWxrZXIsbmFtZSxwb3NpdGlvbixzaGFwZUxpc3QsZ3JhcGhEYXRhS2V5LGluZm9EYXRhKVxuXHR7XG5cdFx0d2Fsa2VyLmp1bmN0aW9uQXJyYXkgPSBuZXcgQXJyYXkoKTtcblx0XHR3YWxrZXIubGF5ZXI9Mjtcblx0XHRpZighd2Fsa2VyLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzKSB3YWxrZXIuZ3JhcGhEYXRhLndhbGtlckp1bmN0aW9uUnVsZXMgPSBuZXcgT2JqZWN0KCk7XG5cdFx0aWYoIXdhbGtlci5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzKVxuXHRcdFx0d2Fsa2VyLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHMgPSBuZXcgQXJyYXkoKTtcblx0fVxuXHRcblx0Z2V0Q2xpZW50SnNvbigpXG5cdHtcblx0XHR2YXIganNvbiA9IHN1cGVyLmdldENsaWVudEpzb24oKTtcblx0XHRqc29uLnBhdGhXb3JsZFR5ZSA9IFwid2Fsa2VyXCI7XG5cdFx0anNvbi5jdXJyZW50SnVuY3Rpb24gPSB0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpLmdldE5vZGVLZXkoKTtcblx0XHRyZXR1cm4oanNvbik7XG5cdH1cblxuXHRcblx0Z2V0Tm9kZVVpRGlzcGxheShub2RlKVxuXHR7XG5cdFx0dmFyIHZhbHVlID0gdGhpcy5uYW1lO1xuXHRcblx0XHR2YWx1ZSArPSBcIjxsaT50eXBlOlwiK3RoaXMuaW5mb0RhdGEud2Fsa2VyVHlwZUtleStcIjwvbGk+XCI7XG5cdFx0dmFsdWUgKz0gXCI8bGk+Y3VycmVudEo6XCIrdGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5uYW1lK1wiPC9saT5cIjtcblx0XHRcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZ3JhcGhEYXRhLndhbGtlckp1bmN0aW9uUnVsZXMuanVuY3Rpb25FeGl0cy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBleGl0ID0gdGhpcy5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzW2ldO1xuXHRcblx0XHRcdHZhciB0aW1lVG9SZW1vdmUgPSAoXG5cdFx0XHRcdFx0KHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKVxuXHRcdFx0XHRcdDxcblx0XHRcdFx0XHR3b3JsZC5jaGVja1RpbWVzdGFtcCk7XG5cdFxuXHRcdFx0dmFsdWUgKz0gXCI8bGk+ZXhpdEp1bmN0aW9uOmk9XCIraStcIiBcIitleGl0LmV4aXRKdW5jdGlvbitcblx0XHRcdFx0XCIgYXQgZXhpdDpcIisoZXhpdC5leGl0SnVuY3Rpb249PXRoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkubmFtZSkrXG5cdFx0XHRcdFwiIHRpbWVUb1JlbW92ZTpcIit0aW1lVG9SZW1vdmUrXG5cdFx0XHRcdFwiPC9saT5cIjtcblx0XHR9XG5cdFx0Ly8vLy8vLy8vLy8vLy92YWx1ZSArPSBcIjxsaT5yZW1vdmUgYXQ6XCIrKHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKStcIjwvbGk+XCI7XG5cdFx0Ly92YWx1ZSArPSBcIjxsaT5jaGVja1RpbWU6XCIrd29ybGQuY2hlY2tUaW1lc3RhbXArXCI8L2xpPlwiO1xuXHRcdC8vLy8vLy8vL3ZhbHVlICs9IFwiPGxpPmRpZmY6XCIrKHdvcmxkLmNoZWNrVGltZXN0YW1wLSh0aGlzLmxhc3RVcGRhdGVUaW1lU3RhbXArZXhpdC5leGl0QWZ0ZXJNaWxpU2Vjb25kcykpK1wiPC9saT5cIjtcblx0XHRyZXR1cm4odmFsdWUpO1xuXHR9XG5cdFxuXHRcblx0cHJvY2Vzc1dhbGtlclJ1bGVzKHdvcmxkKVxuXHR7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInc6XCIrdGhpcy5uYW1lK1wiIGN1cnJlbnRKdW5jdGlvbj1cIit0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpLm5hbWUpO1xuXHRcdFxuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzLmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGV4aXQgPSB0aGlzLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHNbaV07XG5cdFx0XHRpZihleGl0LmV4aXRKdW5jdGlvbj09dGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5uYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgdGltZVRvUmVtb3ZlID0gKFxuXHRcdFx0XHRcdFx0KHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKVxuXHRcdFx0XHRcdFx0PFxuXHRcdFx0XHRcdFx0d29ybGQuY2hlY2tUaW1lc3RhbXApO1xuXHRcdFx0XHRcblx0XHRcblx0XHRcdFx0aWYodGltZVRvUmVtb3ZlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJUSU1FIFRPIEVYSVQgdzpcIit0aGlzLm5hbWUrXG5cdFx0XHRcdFx0XHRcdFwiIGN1cnJlbnRKdW5jdGlvbj1cIit0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpLm5hbWUrXG5cdFx0XHRcdFx0XHRcdFwiIGV4aXQ6XCIrZXhpdC5leGl0SnVuY3Rpb24rXG5cdFx0XHRcdFx0XHRcdFwiIHR5cGU6XCIrQ29tbW9udG9TdHJpbmcodGhpcy5pbmZvRGF0YS53YWxrZXJUeXBlS2V5KStcblx0XHRcdFx0XHRcdFx0XCIgaW5mb0RhdGE6XCIrQ29tbW9udG9TdHJpbmcodGhpcy5pbmZvRGF0YSkpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHR3b3JsZC5yZW1vdmVXYWxrZXIodGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly9jb25zb2xlLmxvZyhcInc6XCIrdGhpcy5uYW1lK1wiIGp1bmN0aW9uOlwiK3RoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkpO1xuXHR9XG5cdFxuXHRzZXRDdXJyZW50SnVuY3Rpb24oanVuY3Rpb24pXG5cdHtcblx0XHRpZih0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpIT1udWxsKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coXCJnZXRDdXJyZW50SnVuY3Rpb24oKS5yZW1vdmVXYWxrZXIgXCIpO1xuXHRcdFx0dGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5yZW1vdmVXYWxrZXIodGhpcyk7XG5cdFx0fVxuXHRcdHRoaXMuanVuY3Rpb25BcnJheS5wdXNoKGp1bmN0aW9uKTtcblx0XHRqdW5jdGlvbi5hZGRXYWxrZXIodGhpcyk7XG5cdH1cblx0XG5cdGdldEN1cnJlbnRKdW5jdGlvbigpXG5cdHtcblx0XHRpZih0aGlzLmp1bmN0aW9uQXJyYXkubGVuZ3RoPT0wKSByZXR1cm4obnVsbCk7XG5cdFx0cmV0dXJuKHRoaXMuanVuY3Rpb25BcnJheVt0aGlzLmp1bmN0aW9uQXJyYXkubGVuZ3RoIC0gMV0pO1xuXHR9XG5cdFxuXHRsb2coKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXCJ3YWxrZXIgbG9nOlwiK0NvbW1vbnRvU3RyaW5nKHRoaXMpKTtcblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa2VyO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOldhbGtlclwiKTtcbi8vPC9qczJub2RlPlxuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdvcmxkVXBkYXRlXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5jbGFzcyBXb3JsZFVwZGF0ZVxue1xuXHRjb25zdHJ1Y3RvcihqdW5jdGlvbk5hbWUsd2Fsa2VyTmFtZSxwcm9jZXNzVGltZXN0YW1wLHdhbGtlckluZm8sanVuY3Rpb25JbmZvLHBhdGhJbmZvKVxuXHR7XG5cdFx0V29ybGRVcGRhdGUuY3JlYXRlV29ybGRVcGRhdGUodGhpcyxqdW5jdGlvbk5hbWUsd2Fsa2VyTmFtZSxwcm9jZXNzVGltZXN0YW1wLHdhbGtlckluZm8sanVuY3Rpb25JbmZvLHBhdGhJbmZvKTtcblx0fVxuXHRcblx0c3RhdGljIGNyZWF0ZVdvcmxkVXBkYXRlRnJvbUpzb24oanNvbilcblx0e1xuXHRcdHZhciB3b3JsZFVwZGF0ZSA9IG5ldyBXb3JsZFVwZGF0ZShcblx0XHRcdFx0anNvbi5qdW5jdGlvbk5hbWUsXG5cdFx0XHRcdGpzb24ud2Fsa2VyTmFtZSxcblx0XHRcdFx0anNvbi5wcm9jZXNzVGltZXN0YW1wLFxuXHRcdFx0XHRqc29uLndhbGtlckluZm8sXG5cdFx0XHRcdGpzb24uanVuY3Rpb25JbmZvLFxuXHRcdFx0XHRqc29uLnBhdGhJbmZvKTtcblx0XHRyZXR1cm4od29ybGRVcGRhdGUpO1xuXHR9XG5cdFx0XG5cdHN0YXRpYyBjcmVhdGVXb3JsZFVwZGF0ZSh3b3JsZFVwZGF0ZSxqdW5jdGlvbk5hbWUsd2Fsa2VyTmFtZSxwcm9jZXNzVGltZXN0YW1wLHdhbGtlckluZm8sanVuY3Rpb25JbmZvLHBhdGhJbmZvKVxuXHR7XG5cdFx0d29ybGRVcGRhdGUuanVuY3Rpb25OYW1lID0ganVuY3Rpb25OYW1lO1xuXHRcdHdvcmxkVXBkYXRlLndhbGtlck5hbWUgPSB3YWxrZXJOYW1lO1xuXHRcdHdvcmxkVXBkYXRlLnByb2Nlc3NUaW1lc3RhbXAgPSBwcm9jZXNzVGltZXN0YW1wO1xuXHRcdHdvcmxkVXBkYXRlLndhbGtlckluZm8gPSB3YWxrZXJJbmZvO1xuXHRcdHdvcmxkVXBkYXRlLmp1bmN0aW9uSW5mbyA9IGp1bmN0aW9uSW5mbztcblx0XHR3b3JsZFVwZGF0ZS5wYXRoSW5mbyA9IHBhdGhJbmZvO1xuXHRcdHdvcmxkVXBkYXRlLnVwZGF0ZVR5cGUgPSBcImp1bmN0aW9uXCI7XG5cblx0fVxuXHRcblx0cmVhZHlUb0JlUHJvY2Vzc2VkICh0aW1lc3RhbXApXG5cdHtcblx0XHRyZXR1cm4oICh0aGlzLnByb2Nlc3NUaW1lc3RhbXA8PXRpbWVzdGFtcCkgKTtcblx0XHQvL3JldHVybiggICh0aGlzLmdldERhdGUoKS5nZXRUaW1lKCk8PXRpbWVzdGFtcCkgICk7XG5cdH1cblx0XG5cdHhnZXREYXRlKClcblx0e1xuXHRcdHJldHVybihuZXcgRGF0ZSh0aGlzLnByb2Nlc3NUaW1lc3RhbXAqMTAwMCkpO1xuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkVXBkYXRlO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOldvcmxkVXBkYXRlXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUGF0aFdvcmxkRGVmID0gcmVxdWlyZSgnLi4vLi4vcGF0aHMvcGF0aHdvcmxkZGVmJyk7XG52YXIgQ2FudmFzSG9sZGVyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXInKTtcbnZhciBQYXRoV29ybGQgPSByZXF1aXJlKCcuLi8uLi9wYXRocy9wYXRod29ybGQnKTtcbnZhciBXb3JsZFVwZGF0ZSA9IHJlcXVpcmUoJy4uLy4uL3BhdGhzL3dvcmxkdXBkYXRlJyk7XG52YXIgUGF0aCA9IHJlcXVpcmUoJy4uLy4uL3BhdGhzL3BhdGgnKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG52YXIgQ2lyY2xlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L2NpcmNsZWRpc3BsYXknKTtcbnZhciBDb25uZWN0b3JEaXNwbGF5RW1wdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXllbXB0eScpO1xudmFyIEdyb3VwQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yL2dyb3VwY29ubmVjdG9yJyk7XG52YXIgV2FsbENvbm5lY3RvciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2Nvbm5lY3Rvci93YWxsY29ubmVjdG9yJyk7XG52YXIgSnVuY3Rpb25Db25uZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9wYXRocy9ub2RlZGlzcGxheS9qdW5jdGlvbmNvbm5lY3RvcicpO1xudmFyIEp1bmN0aW9uRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL3BhdGhzL25vZGVkaXNwbGF5L2p1bmN0aW9uZGlzcGxheScpO1xudmFyIFJlY3RhbmdsZURpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS9yZWN0YW5nbGVkaXNwbGF5Jyk7XG52YXIgVHJpYW5nbGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvdHJpYW5nbGVkaXNwbGF5Jyk7XG52YXIgQXJjRGlzcGxheVNoYXBlID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvYXJjZGlzcGxheXNoYXBlJyk7XG5cbi8vdmFyIEluaXRJbmFHcmFwaCA9IHJlcXVpcmUoJy4uLy4uL3BhdGhzZXhwL2luYWdyYXBoL2luaXRpbmFncmFwaCcpO1xuXG5cblxuXG5jbGFzcyBJbmFHcmFwaFBhdGhXb3JsZERlZiBleHRlbmRzIFBhdGhXb3JsZERlZlxue1xuXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblx0XG5cdGluaXQoKVxuXHR7XG5cdFx0dGhpcy53b3JsZERlZmF1bHRzID1cblx0XHR7XG5cdFx0XHRcdGp1bmN0aW9uUmFkaXVzRGVmYXVsdDoxNSxcblx0XHRcdFx0d2Fsa2VyUmFkaXVzRGVmYXVsdDoxNSowLjMsXG5cdFx0XHRcdHJlbGF4ZWREaXN0YW5jZURlZmF1bHQ6OC41KjEwLFxuXHRcdFx0XHRlbGFzdGljaXR5RmFjdG9yRGVmdWFsdDowLjAyNSxcblx0XHRcdFx0cG9ydDozMDAwLFxuXHRcdH07XG5cdFx0XG5cdFx0dGhpcy5wYXRoUGFydHMgPVxuXHRcdHtcblx0XHRcdHN0YXJ0OltcIkFjY2Vzc2lvbmluZ1wiLFwiQW5hdG9taWMgcGF0aG9sb2d5IGxhYlwiXSxcblx0XHRcdG5vcm1hbEVuZDpbXCJSTkEgbGFiXCIsXCJNZWRpY2FsIHNlcnZpY2VzXCIsXCJMYWIgZGlyZWN0b3Igc2lnbiBvZmZcIixcIlJlcG9ydGluZ1wiLFwiUmVzdWx0IG1haWxlZC8gU2FtcGxlIHJldHVybmVkXCJdLFxuXHRcdFx0dHVtb3JGYWlsUmVxdWV1ZTpbXCJJbnN1ZmZpY2llbnQgdHVtb3JcIixcIkNhbmNlbGVkXCIsXCJSZXBvcnRpbmdcIixcIkV4dHJhIFRpc3VlXCIsXCJZRVMgcmVxdWV1ZVwiXSxcblx0XHRcdHR1bW9yRmFpbENTOltcIkluc3VmZmljaWVudCB0dW1vclwiLFwiQ2FuY2VsZWRcIixcIlJlcG9ydGluZ1wiLFwiRXh0cmEgVGlzdWVcIixcIk5PIGNhbmNlbCBzYW1wbGVcIixcIkN1c3RvbWVyIFNlcnZpY2VcIl0sXG5cdFx0XHRybmFGYWlsUmVxdWV1ZTpbXCJJbnN1ZmZpY2llbnQgUk5BXCIsXCJDYW5jZWxlZFwiLFwiUmVwb3J0aW5nXCIsXCJFeHRyYSBUaXN1ZVwiLFwiWUVTIHJlcXVldWVcIl0sXG5cdFx0XHRybmFGYWlsQ1M6W1wiSW5zdWZmaWNpZW50IFJOQVwiLFwiQ2FuY2VsZWRcIixcIlJlcG9ydGluZ1wiLFwiRXh0cmEgVGlzdWVcIixcIk5PIGhvbGRcIixcIkN1c3RvbWVyIFNlcnZpY2VcIl0sXG5cdFx0fTtcblxuXHRcdFxuXHRcdHRoaXMucGF0aERlZnMgPVxuXHRcdFtcblx0XHRcdHtcblx0XHRcdFx0cGF0aERlZk5hbWU6XCJub3JtYWxcIixudW1iZXJOb2RlczoxMDAsbm9kZVNoYXBlOlwiY2lyY2xlXCIsbm9kZUNvbG9yOlwiZmYwMDAwXCIsXG5cdFx0XHRcdHBhdGg6W1wic3RhcnRcIixcIm5vcm1hbEVuZFwiXVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cGF0aERlZk5hbWU6XCJ0dW1vckZhaWxSUVN1Y2Nlc3NcIixudW1iZXJOb2RlczoyMCxub2RlU2hhcGU6XCJjaXJjbGVcIixub2RlQ29sb3I6XCJmZjAwMDBcIixcblx0XHRcdFx0cGF0aDpbXCJzdGFydFwiLFwidHVtb3JGYWlsUmVxdWV1ZVwiLFwibm9ybWFsRW5kXCJdXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRwYXRoRGVmTmFtZTpcInJuYUZhaWxSUVN1Y2Vzc1wiLG51bWJlck5vZGVzOjIwLG5vZGVTaGFwZTpcImNpcmNsZVwiLG5vZGVDb2xvcjpcImZmMDAwMFwiLFxuXHRcdFx0XHRwYXRoOltcInN0YXJ0XCIsXCJybmFGYWlsUmVxdWV1ZVwiLFwibm9ybWFsRW5kXCJdXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRwYXRoRGVmTmFtZTpcInR1bW9yRmFpbENhbmNlbFwiLG51bWJlck5vZGVzOjIwLG5vZGVTaGFwZTpcImNpcmNsZVwiLG5vZGVDb2xvcjpcImZmMDAwMFwiLFxuXHRcdFx0XHRwYXRoOltcInN0YXJ0XCIsXCJ0dW1vckZhaWxDU1wiXVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0cGF0aERlZk5hbWU6XCJ0dW1vckZhaWxDYW5jZWxcIixudW1iZXJOb2RlczoyMCxub2RlU2hhcGU6XCJjaXJjbGVcIixub2RlQ29sb3I6XCJmZjAwMDBcIixcblx0XHRcdFx0cGF0aDpbXCJzdGFydFwiLFwicm5hRmFpbENTXCJdXG5cdFx0XHR9LFxuXHRcdF07XG5cdFx0XHRcblx0ICAgIHRoaXMuanVuY3Rpb25FeGl0cyA9IFxuXHQgICAgW1xuXHQgICAgICAgIHtleGl0SnVuY3Rpb246XCJSZXN1bHQgbWFpbGVkLyBTYW1wbGUgcmV0dXJuZWRcIixleGl0QWZ0ZXJNaWxpU2Vjb25kczo2MCo2MCoyNCoxMDAwfSxcblx0ICAgIF07XG5cdFx0XG5cdFx0dGhpcy53b3JsZERpc3BsYXkgPVxuXHRcdHtcdFxuXHRcdFx0anVuY3Rpb25SYWRpdXNEZWZhdWx0OnRoaXMud29ybGREZWZhdWx0cy5qdW5jdGlvblJhZGl1c0RlZmF1bHQsXG5cdFx0XHR3YWxrZXJSYWRpdXNEZWZhdWx0OnRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LFxuXHRcdFx0cmVsYXhlZERpc3RhbmNlRGVmYXVsdDp0aGlzLndvcmxkRGVmYXVsdHMucmVsYXhlZERpc3RhbmNlRGVmYXVsdCxcblx0XHRcdGVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0OnRoaXMud29ybGREZWZhdWx0cy5lbGFzdGljaXR5RmFjdG9yRGVmdWFsdCxcblx0XHRcdFxuXHRcdCAgICB3b3JsZEJhY2tncm91bmRDb2xvcjpcImUwZTBmMGZmXCIsXG5cdFx0XG5cdFx0ICAgIHRlbGVwb3J0UGF0aHM6XG5cdFx0XHRcdFtcblx0XHRcdFx0XHQvLyBUZWxlcG9ydCBQYXRoISBuYW1lPVJlcXVldWUgdG8gTVMgc3RhcnQ9RFQxIGVuZD1NUy9JbiBQcm9ncmVzc1xuXHRcdFx0XHRcdHt0ZWxlcG9ydE5hbWU6XCJSZXF1ZXVlIHRvIE1TL0luIFByb2dyZXNzXCIsc3RhcnRKdW5jdGlvbjpcIl4oKD8hRFQxfE1TLip8U2lnbmluZykuKSokXCIsZW5kSnVuY3Rpb246XCJNUy9JbiBQcm9ncmVzc1wifSxcblx0XHRcdFx0XHR7dGVsZXBvcnROYW1lOlwiUmVxdWV1ZSB0byBNU1wiLHN0YXJ0SnVuY3Rpb246XCJeKCg/IURUMXxNUy4qfFNpZ25pbmcpLikqJFwiLGVuZEp1bmN0aW9uOlwiTVNcIn0sXG5cdFx0XHRcdFx0e3RlbGVwb3J0TmFtZTpcIlJlcXVldWUgdG8gRFQxXCIsc3RhcnRKdW5jdGlvbjpcIl4oKD8hQ1N8TVMuKikuKSokXCIsZW5kSnVuY3Rpb246XCJEVDFcIn0sXG5cdFx0XHRcdFx0e3RlbGVwb3J0TmFtZTpcIlJlcXVldWUgdG8gTVJQLVBhY2thZ2luZ1wiLHN0YXJ0SnVuY3Rpb246XCJeKCg/IVNpZ25pbmd8Q2FuY2xlZCkuKSokXCIsZW5kSnVuY3Rpb246XCJNUlAtUGFja2FnaW5nXCJ9LFxuXHRcdFx0XHRcdHt0ZWxlcG9ydE5hbWU6XCJSZXF1ZXVlIHRvIFNpZ25pbmdcIixzdGFydEp1bmN0aW9uOlwiXigoPyFNU3xQYWNrYWdpbmd8TVJQLVBhY2thZ2luZykuKSokXCIsZW5kSnVuY3Rpb246XCJTaWduaW5nXCJ9LFxuXHRcdFx0XHRcdHt0ZWxlcG9ydE5hbWU6XCJUZXN0IGNhbmNlbGVkXCIsc3RhcnRKdW5jdGlvbjpcIl4oKD8hQ2FuY2VsZWR8LipQYWNrYWdpbmcuKikuKSokXCIsZW5kSnVuY3Rpb246XCJDYW5jZWxlZFwifSxcdFxuXHRcdFx0XHRdLFxuXHRcdFx0ZW5kUG9pbnRNb2RzOlxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0e2VuZFBvaW50TW9kTmFtZTpcIk1SUC1UZXN0IFJlcG9ydGVkXCIsc3RhcnRKdW5jdGlvbjpcIk1SUC1QYWNrYWdpbmdcIixlbmRKdW5jdGlvbjpcIlRlc3QgUmVwb3J0ZWRcIn0sXHRcdFxuXHRcdFx0XHRcdC8ve2VuZFBvaW50TW9kTmFtZTpcIk5FVy1UZXN0IFJlcG9ydGVkXCIsc3RhcnRKdW5jdGlvbjpcIi4qXCIsZW5kSnVuY3Rpb246XCJUZXN0IFJlcG9ydGVkXCJ9LFx0XHRcblx0XHRcdFx0XSxcblx0XHRcdGNvbm5lY3RvckRlZnM6XG5cdFx0XHR7XG5cdFx0XHRcdGdlbmVyaWM6XG5cdFx0XHRcdFx0ZnVuY3Rpb24od29ybGREZWYsbmFtZSkgXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuKFxuXHRcdFx0XHRcdFx0XHRcdG5ldyBHcm91cENvbm5lY3Rvcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IENvbm5lY3RvckRpc3BsYXlFbXB0eSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQqMi41LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLmVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lKVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0anVuY3Rpb25TcGFjZXI6XG5cdFx0XHRcdFx0ZnVuY3Rpb24od29ybGREZWYsbmFtZSkgXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuKFxuXHRcdFx0XHRcdFx0XHRcdG5ldyBHcm91cENvbm5lY3Rvcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IENvbm5lY3RvckRpc3BsYXlFbXB0eSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQqMi41LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLmVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lKVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0d29ybGRXYWxsOlxuXHRcdFx0XHRcdGZ1bmN0aW9uKHdvcmxkRGVmLG5hbWUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuKFxuXHRcdFx0XHRcdFx0XHRcdG5ldyBXYWxsQ29ubmVjdG9yKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuZXcgQ29ubmVjdG9yRGlzcGxheUVtcHR5KCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHdvcmxkRGVmLndvcmxkRGVmYXVsdHMucmVsYXhlZERpc3RhbmNlRGVmYXVsdCowLjc1LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQxLXdvcmxkRGVmLndvcmxkRGVmYXVsdHMuZWxhc3RpY2l0eUZhY3RvckRlZnVhbHQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5hbWUpXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRwYXRoOlxuXHRcdFx0XHRcdGZ1bmN0aW9uKHdvcmxkRGVmLG5hbWUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuKFxuXHRcdFx0XHRcdFx0XHRuZXcgUGF0aChuZXcgSnVuY3Rpb25Db25uZWN0b3IoXG5cdFx0XHRcdFx0XHRcdFx0XHR7bGluZUNvbG9yOlwiMDAwMGEwZmZcIixsaW5lV2lkdGg6NX0pLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQqMS4yNSxcblx0XHRcdFx0XHRcdFx0XHQxLXdvcmxkRGVmLndvcmxkRGVmYXVsdHMuZWxhc3RpY2l0eUZhY3RvckRlZnVhbHQsXG5cdFx0XHRcdFx0XHRcdFx0bmFtZSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHR9LFxuXHRcdCAgICBjb25uZWN0b3JEaXNwbGF5OlxuXHRcdFx0e1xuXHRcdFx0XHRnZW5lcmljOlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29ubmVjdG9yRGlzcGxheTogbmV3IEp1bmN0aW9uQ29ubmVjdG9yKFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxpbmVDb2xvcjpcIjAwMDBhMGZmXCIsbGluZVdpZHRoOjVcblx0XHRcdFx0XHR9KSxcdFx0XHRcdFx0XG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0bm9kZURpc3BsYXk6XG5cdFx0XHR7XG5cdFx0XHRcdGdlbmVyaWM6XG5cdFx0XHRcdHtcblx0XHRcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgVHJpYW5nbGVEaXNwbGF5KFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiZmZmZmZmZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcblx0XHRcdFx0XHRcdFx0XHRyYWRpdXM6dGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSxcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0Y2xvbmU6ZmFsc2Vcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0d2Fsa2VySnVuY3Rpb25SdWxlczp0aGlzLmp1bmN0aW9uRXhpdHMsXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2VuZXJpY0p1bmN0aW9uOlxuXHRcdFx0XHR7XHRcdFx0XG5cdFx0XHRcdFx0Ly9pbml0R3JhcGhEYXRhOkluYUdyYXBoUGF0aFdvcmxkRGVmLmluaXRKdW5jdGlvbkRpc3BsYXksXG5cdFx0XHRcdFx0aW5pdEdyYXBoRGF0YTp0aGlzLmluaXRKdW5jdGlvbkRpc3BsYXksXG5cdFx0XHRcdFx0bm9kZURpc3BsYXk6e2Rpc3BsYXlJbmZvOntjbG9uZTpmYWxzZX19XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vZGVHZW5lcmljOlxuXHRcdFx0XHR7XG5cdFx0XG5cdFx0XHRcdFx0bm9kZURpc3BsYXk6bmV3IFRyaWFuZ2xlRGlzcGxheShcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcImZmZmZmZmZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjIwZmYyMGZmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXG5cdFx0XHRcdFx0XHRcdFx0cmFkaXVzOnRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUsXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxuXHRcdFx0XHRcdFx0XHRcdGNsb25lOmZhbHNlXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6dGhpcy5qdW5jdGlvbkV4aXRzLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRqdW5jdGlvblBpZVNsaWNlOlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bm9kZURpc3BsYXlGdW5jdGlvbjpmdW5jdGlvbigpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHJldHVybihuZXcgQXJjRGlzcGxheVNoYXBlKFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcIjAwMDAwMDAwXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCIwMGZmMDA3ZlwiLHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXG5cdFx0XHRcdFx0XHRcdFx0XHRyYWRpdXM6MjUsXG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJ2ZVBvaW50czoxNixcblx0XHRcdFx0XHRcdFx0XHRcdHN0YXJ0QW5nbGU6MCxcblx0XHRcdFx0XHRcdFx0XHRcdGVuZEFuZ2xlOjMyMCxcblx0XHRcdFx0XHRcdFx0XHRcdHdpZHRoOjI1LFxuXHRcdFx0XHRcdFx0XHRcdFx0aGVpZ2h0OjI1LFxuXHRcdFx0XHRcdFx0XHRcdFx0dHM6bmV3IERhdGUoKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRjbG9uZTp0cnVlXG5cdFx0XHRcdFx0XHRcdFx0fSkpXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgQXJjRGlzcGxheVNoYXBlKFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcIjAwMDAwMDAwXCIsXG5cdFx0XHRcdFx0XHRib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXG5cdFx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCIwMGZmMDA3ZlwiLHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXG5cdFx0XHRcdFx0XHRyYWRpdXM6MjUsXG5cdFx0XHRcdFx0XHRjdXJ2ZVBvaW50czoxNixcblx0XHRcdFx0XHRcdHN0YXJ0QW5nbGU6MCxcblx0XHRcdFx0XHRcdGVuZEFuZ2xlOjMyMCxcblx0XHRcdFx0XHRcdHdpZHRoOjI1LFxuXHRcdFx0XHRcdFx0aGVpZ2h0OjI1LFxuXHRcdFx0XHRcdFx0Y2xvbmU6dHJ1ZVxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0dW1vckZhaWxSUVN1Y2Nlc3M6XG5cdFx0XHRcdHtcblx0XHRcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgVHJpYW5nbGVEaXNwbGF5KFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiRkZBNTAwZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcblx0XHRcdFx0XHRcdFx0XHQvL3JhZGl1czp3YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUsXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxuXHRcdFx0XHRcdFx0XHRcdGNsb25lOmZhbHNlXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6dGhpcy5qdW5jdGlvbkV4aXRzLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRub3JtYWw6XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgUmVjdGFuZ2xlRGlzcGxheShcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcImZmMjAyMGZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjIwZmYyMGZmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxuXHRcdFx0XHRcdFx0XHRcdGNsb25lOmZhbHNlXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0d2Fsa2VySnVuY3Rpb25SdWxlczp0aGlzLmp1bmN0aW9uRXhpdHMsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJuYUZhaWxSUVN1Y2Vzczpcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBDaXJjbGVEaXNwbGF5KFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiMDBBNUZGZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcblx0XHRcdFx0XHRcdFx0XHRyYWRpdXM6dGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSxcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0Y2xvbmU6ZmFsc2Vcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0d2Fsa2VySnVuY3Rpb25SdWxlczp0aGlzLmp1bmN0aW9uRXhpdHMsXHRcdFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0dW1vckZhaWxDYW5jZWw6XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgQ2lyY2xlRGlzcGxheShcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcIkE1RkYwMGZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjIwZmYyMGZmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXG5cdFx0XHRcdFx0XHRcdFx0cmFkaXVzOnRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUsXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxuXHRcdFx0XHRcdFx0XHRcdGNsb25lOmZhbHNlXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6dGhpcy5qdW5jdGlvbkV4aXRzLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0ZXN0aW5nOlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bm9kZURpc3BsYXk6bmV3IENpcmNsZURpc3BsYXkoXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRmaWxsQ29sb3I6XCJBNUZGMDBmZlwiLGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCIyMGZmMjBmZlwiLHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxuXHRcdFx0XHRcdFx0XHRcdHJhZGl1czp0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdCozLFxuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdCozKSoyLFxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQqMykqMixcblx0XHRcdFx0XHRcdFx0XHRjbG9uZTpmYWxzZVxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOnRoaXMuanVuY3Rpb25FeGl0cyxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0fTtcblx0XHRcblx0fVxuXHRcblx0Z2V0UGF0aFBhcnRzKClcblx0e1xuXHRcdHJldHVybih0aGlzLnBhdGhQYXJ0cyk7XG5cdH1cblx0XG5cdGdldFBhdGhEZWYoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMucGF0aERlZnMpO1xuXHR9XG5cdFxuXHRnZXRXb3JsZERpc3BhbHkoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMud29ybGREaXNwbGF5KTtcblx0fVxuXHRcblx0Z2V0V2Fsa2VySnVuY3Rpb25SdWxlcygpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5qdW5jdGlvbkV4aXRzKTtcbiAgIFx0fVxuXHRcblx0Z2V0V29ybGREZWZhdWx0cygpXG5cdHtcblxuXHRcdHJldHVybih0aGlzLndvcmxkRGVmYXVsdHMpO1xuXHR9XG5cdFxuXHQvL3N0YXRpYyBpbml0SnVuY3Rpb25EaXNwbGF5KG5vZGUpXG5cdGluaXRKdW5jdGlvbkRpc3BsYXkobm9kZSlcblx0e1xuXHRcdGNvbnNvbGUubG9nKFwiaW5zaWRlIGluaXRKdW5jdGlvbkRpc3BsYXkgZm9yIG5hbWU9XCIrbm9kZS5uYW1lKTtcblx0XHRub2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheSA9IG5ldyBKdW5jdGlvbkRpc3BsYXkoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmaWxsQ29sb3I6XCJhMGEwZmZmZlwiLFxuXHRcdFx0XHRcdGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCJmZmZmMDBmZlwiLFxuXHRcdFx0XHRcdHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcblx0XHRcdFx0XHRib3JkZXJXaWR0aDoyLFxuXHRcdFx0XHRcdGZvbnRTdHlsZTpcImJvbGRcIixcblx0XHRcdFx0XHRmb250UGl4ZWxIZWlnaHQ6MTUsXG5cdFx0XHRcdFx0Zm9udEZhY2U6XCJBcmlhbFwiLFxuXHRcdFx0XHRcdHJlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXG5cdFx0XHRcdFx0cmVjdEZpbGxDb2xvcjpcImZmZmZmZmZmXCIsXG5cdFx0XHRcdFx0Zm9udENvbG9yOlwiMDAwMGZmZmZcIixcblx0XHRcdFx0XHRjbG9uZTpmYWxzZVxuXHRcdFx0XHR9KTtcblx0XHQvL25vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmNsb25lPWZhbHNlO1xuXHRcdG5vZGUuZ3JhcGhEYXRhLnRleHRTcGFjZXIgPSA1O1xuXHRcdC8vbm9kZS5ncmFwaERhdGEucmFkaXVzID0gdGhpcy53b3JsZERlZmF1bHRzLmp1bmN0aW9uUmFkaXVzRGVmYXVsdCozO1xuXHRcdG5vZGUuZ3JhcGhEYXRhLnJhZGl1cyA9IDE1O1xuXHRcdG5vZGUuZ3JhcGhEYXRhLndpZHRoID0gbm9kZS5ncmFwaERhdGEucmFkaXVzKjI7XG5cdFx0bm9kZS5ncmFwaERhdGEuaGVpZ2h0ID0gbm9kZS5ncmFwaERhdGEucmFkaXVzKjI7XG5cdFx0aWYobm9kZS5ncmFwaERhdGEubm9kZXM9PW51bGwpIG5vZGUuZ3JhcGhEYXRhLm5vZGVzID0gbmV3IEFycmF5KCk7XG5cdH1cblx0XG5cdFxuXHRnZXRQYXRoQXJyYXkoKVxuXHR7XG5cdFx0dmFyIGFsbFBhdGhBcnJheSA9IFtdO1xuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5wYXRoRGVmcy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBwYXRoRGVmID0gdGhpcy5wYXRoRGVmc1tpXTsgXG5cdFx0XHRmb3IodmFyIG5vZGVMb29wPTA7bm9kZUxvb3A8cGF0aERlZi5udW1iZXJOb2Rlcztub2RlTG9vcCsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcGF0aEFycmF5ID0gW107XG5cdFx0XHRcdGZvcih2YXIgaj0wO2o8cGF0aERlZi5wYXRoLmxlbmd0aDtqKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgcGF0aE5hbWUgPSBwYXRoRGVmLnBhdGhbal07XG5cdFx0XHRcdFx0dmFyIHBhdGhEZWZOYW1lID0gcGF0aERlZi5wYXRoRGVmTmFtZTtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiICAgZG9pbmcgcGF0aERlZk5hbWU9XCIrcGF0aERlZk5hbWUrXCIgcGF0aE5hbWU9XCIrcGF0aE5hbWUpO1xuXHRcdFx0XHRcdGZvcih2YXIgaz0wO2s8dGhpcy5wYXRoUGFydHNbcGF0aE5hbWVdLmxlbmd0aDtrKyspXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIiAgICAgICAgICAgICAgIGp1bmN0aW9uPVwiK3BhdGhQYXJ0c1twYXRoTmFtZV1ba10pO1xuXHRcdFx0XHRcdFx0cGF0aEFycmF5LnB1c2godGhpcy5wYXRoUGFydHNbcGF0aE5hbWVdW2tdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YWxsUGF0aEFycmF5LnB1c2goXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwYXRoRGVmOnBhdGhEZWYsXG5cdFx0XHRcdFx0cGF0aDpwYXRoQXJyYXlcblx0XHRcdFx0fSk7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCIjXCIraStcIiBwYXRoQXJyYXkgc2l6ZT1cIitwYXRoQXJyYXkubGVuZ3RoK1wiIG5hbWU9XCIrcGF0aERlZi5wYXRoRGVmTmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vQ29tbW9uc2h1ZmZsZUFycmF5KGFsbFBhdGhBcnJheSk7XG5cdFx0cmV0dXJuKGFsbFBhdGhBcnJheSk7XG5cdH1cblx0XG5cdGluaXRDdXN0b21Ob2Rlcyh3b3JsZClcblx0e1xuXHRcdHZhciBwYXRoQXJyYXkgPSB0aGlzLmdldFBhdGhBcnJheSgpO1xuXHRcdFxuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHQvL25vdyA9IE1hdGguZmxvb3Iobm93LzEwMDApO1xuXHRcdC8vbm93ID0gbm93LzEwMDA7XG5cdFx0Ly92YXIgbGFzdFRpbWUgPSBub3c7XG5cdFx0XG5cdFx0Zm9yKHZhciBpPTA7aTxwYXRoQXJyYXkubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgbGFzdFRpbWUgPSBub3c7XG5cdFx0XHR2YXIgcGQgPSBwYXRoQXJyYXlbaV07XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiU3RhcnQgb2Ygd29ybGRVcGRhdGU6XCIrQ29tbW9udG9TdHJpbmcocGQpKTtcblx0XHRcdFxuXHRcdFx0dmFyIHN0YXJ0U3BhY2VyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjM2MDAwMCktMDtcblx0XHRcdGlmKCAobGFzdFRpbWUrc3RhcnRTcGFjZXIpIDwgbm93KSBzdGFydFNwYWNlciA9IDA7XG5cdFx0XHRmb3IodmFyIGo9MDtqPHBkLnBhdGgubGVuZ3RoO2orKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHNwYWNlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSo4MDAwKSsxMDAwO1xuXHRcdFx0XHRsYXN0VGltZSArPSBzcGFjZXI7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiYWRkaW5nIDogcGF0aE5hbWU9XCIrcGQucGF0aERlZi5wYXRoRGVmTmFtZStcIiBqdW5jdGlvbj1cIitwZC5wYXRoW2pdKTtcblx0XG5cdFx0XHRcdHZhciB3b3JsZFVwZGF0ZSA9IG5ldyBXb3JsZFVwZGF0ZShcblx0XHRcdFx0XHRcdHBkLnBhdGhbal0sXG5cdFx0XHRcdFx0XHRwZC5wYXRoRGVmLnBhdGhEZWZOYW1lK1wiLlwiK2ksXG5cdFx0XHRcdFx0XHRsYXN0VGltZStzdGFydFNwYWNlcixcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0d2FrbGVyTmFtZTpwZC5wYXRoRGVmLnBhdGhEZWZOYW1lK1wiLlwiK2ksXG5cdFx0XHRcdFx0XHRcdHdhbGtlclR5cGVLZXk6cGQucGF0aERlZi5wYXRoRGVmTmFtZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0anVuY3Rpb25OYW1lOnBkLnBhdGhbal0sXG5cdFx0XHRcdFx0XHRcdGp1bmN0aW9uVHlwZUtleTpcImdlbmVyaWNKdW5jdGlvblwiXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRwYXRoVHlwZUtleTpcImdlbmVyaWNcIlxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c3RhdHVzOlwiSW4gUHJvZ3Jlc3NcIlxuXHRcdFx0XHRcdFx0fSk7IC8vIDIzLUpBTi0xNyAwNi4zNS4xNCBBTVxuXHRcdFx0XHRjb25zb2xlLmxvZyhcImFkZGluZyA6IHBhdGhOYW1lPVwiK3BkLnBhdGhEZWYucGF0aERlZk5hbWUrXCIganVuY3Rpb249XCIrcGQucGF0aFtqXStcIiB0cz1cIit3b3JsZFVwZGF0ZS5wcm9jZXNzVGltZXN0YW1wKTtcblxuXHRcdFx0XHR3b3JsZC5hZGRUb1dvcmxkVXBkYXRlUXVldWUod29ybGRVcGRhdGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBJbmFHcmFwaFBhdGhXb3JsZERlZjtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpJbmFHcmFwaFBhdGhXb3JsZERlZlwiKTtcbi8vPC9qczJub2RlPiIsInZhciBDYW52YXNIb2xkZXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcicpO1xudmFyIENhbnZhc0hvbGRlclZpcnR1YWwgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcnZpcnR1YWwnKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgUGF0aFdvcmxkID0gcmVxdWlyZSgnLi4vLi4vcGF0aHMvcGF0aHdvcmxkJyk7XG52YXIgV29ybGRVcGRhdGUgPSByZXF1aXJlKCcuLi8uLi9wYXRocy93b3JsZHVwZGF0ZScpO1xudmFyIEluYUdyYXBoUGF0aFdvcmxkRGVmID0gcmVxdWlyZSgnLi4vLi4vcGF0aHNleHAvaW5hZ3JhcGgvaW5hZ3JhcGhwYXRod29ybGRkZWYnKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG52YXIgQ2FudmFzSG9sZGVyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXInKTtcblxuY2xhc3MgUGF0aENsaWVudFxue1xuXHRjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIpXG5cdHtcblx0XHR0aGlzLmNhbnZhc05hbWUgPSBjYW52YXNIb2xkZXIuY2FudmFzTmFtZTtcblx0XHR0aGlzLmNhbnZhc0hvbGRlciA9IGNhbnZhc0hvbGRlcjtcblx0XHR0aGlzLndvcmxkRGlzcGxheSA9IHRoaXMuY2FudmFzSG9sZGVyLndvcmxkRGVmLmdldFdvcmxkRGlzcGFseSgpO1x0XG5cdFx0dGhpcy53b3JsZCA9IG5ldyBQYXRoV29ybGQoXG5cdFx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLFx0XHRcblx0XHRcdFx0dGhpcy53b3JsZERpc3BsYXkpO1xuXHRcdHRoaXMud29ybGQudGltZUZhY3RvciA9IDEuMDtcblx0XHR0aGlzLndvcmxkLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cdFx0dGhpcy5sYXN0VGltZURlbHRhID0gLTE7XG5cblx0XHR2YXIgZmlyc3RJdGVtID0gdGhpcy53b3JsZC5wZWVrQXROZXh0V29ybGRVcGRhdGUoKTtcblx0XHRpZihmaXJzdEl0ZW0hPW51bGwpXG5cdFx0e1xuXHRcdFx0dmFyIGZpcnN0RGF0ZSA9IGZpcnN0SXRlbS5nZXREYXRlKCk7XG5cdFx0XHR0aGlzLndvcmxkLnN0YXJ0VGltZSA9IGZpcnN0RGF0ZTtcblx0XHR9XG5cdH1cblx0XG5cdHN0YXRpYyBnZXRFeHBvcnRzKClcblx0e1xuXHRcdHJldHVybihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdENhbnZhc0hvbGRlcjpDYW52YXNIb2xkZXIsXG5cdFx0XHRcdFx0Q2FudmFzSG9sZGVyVmlydHVhbDpDYW52YXNIb2xkZXJWaXJ0dWFsLFxuXHRcdFx0XHRcdFBvc2l0aW9uOlBvc2l0aW9uLFxuXHRcdFx0XHRcdFBhdGhXb3JsZDpQYXRoV29ybGQsXG5cdFx0XHRcdFx0V29ybGRVcGRhdGU6V29ybGRVcGRhdGUsXG5cdFx0XHRcdFx0SW5hR3JhcGhQYXRoV29ybGREZWY6SW5hR3JhcGhQYXRoV29ybGREZWYsXG5cdFx0XHRcdFx0Q29tbW9uOkNvbW1vbixcblx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHR9XG5cdFxuXHRzdGFydEFuaW1hdGlvbigpXG5cdHtcblx0XHRcdHRoaXMuZG9EcmF3KCk7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpeyBzZWxmLmRvRHJhdygpOyB9LDI1MCk7XHRcdFxuXHR9XG5cdFxuXHRkb0RyYXcoKVxuXHR7XG5cdFx0aWYodGhpcy5sYXN0VGltZURlbHRhPDApIHRoaXMuZ2V0RGF0YSgpO1xuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmdldERlbHRhKHRoaXMubGFzdFRpbWVEZWx0YSk7XG5cdFx0XHR0aGlzLnB1c2hVc2VyTW92bWVudHMoKTtcblx0XHR9XG5cdH0gICAgXHRcdFx0XHRcblx0XG5cdHB1c2hVc2VyTW92bWVudHMoKVxuXHR7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInB1c2hVc2VyTW92bWVudHMuLi5cIik7XG5cdFx0dmFyIG5vZGVNb3VzZU1vdm1lbnQgPSB0aGlzLndvcmxkLm5vZGVDYW52YXNNb3VzZS5ub2RlTW91c2VNb3ZtZW50O1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRPYmplY3Qua2V5cyhub2RlTW91c2VNb3ZtZW50KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0dmFyIG1vdmVQb3NpdGlvbiA9IFBvc2l0aW9uLmdldEF2ZXJhZ2VQb3N0aW9uRnJvbVBvc2l0aW9uTGlzdChub2RlTW91c2VNb3ZtZW50W2tleV0ubW92ZVBvc3Rpb25BcnJheSk7XG5cdFx0XHRub2RlTW91c2VNb3ZtZW50W2tleV0ubW92ZVBvc3Rpb25BcnJheS5sZW5ndGggPSAwO1xuXHRcdFx0ZGVsZXRlIG5vZGVNb3VzZU1vdm1lbnRba2V5XTtcblx0XHRcdFxuXHRcdFx0dmFyIG1vdmVNZXNzYWdlID0gXG5cdFx0XHR7XG5cdFx0XHRcdG5vZGVLZXk6a2V5LFxuXHRcdFx0XHRtb3ZlUG9zaXRpb25cblx0XHRcdH07XG5cdFx0XHRzZWxmLnNlbmRTZXJ2ZXJKc29uKFxuXHRcdFx0XHRcIi9wYXRocy9cIitzZWxmLmNhbnZhc05hbWUrXCIvbW92ZW5vZGUvXCIsXG5cdFx0XHRcdG1vdmVNZXNzYWdlKTtcblx0XHRcdGNvbnNvbGUubG9nKFwibW92ZW1lbnRzIGZvciA6IFwiK2tleSk7XG5cdFx0fSk7XG5cdH1cblx0XG5cdHNlbmRTZXJ2ZXJKc29uKHVybCxqc29uKVxuXHR7XG5cdFx0dmFyIGVuY29kZWRKc29uID0gQ29tbW9uLmpzb25Ub1VSSShqc29uKTtcblx0XHRmZXRjaCh1cmwrZW5jb2RlZEpzb24pLnRoZW4oKHJlc3ApID0+IHJlc3AuanNvbigpKS50aGVuKFxuXHQgIFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSlcblx0ICBcdFx0XHRcdHtcblx0ICAgIFx0XHRcdFx0Y29uc29sZS5sb2coXCJzZW50IGpzb24gdG8gXCIrdXJsKTtcblx0ICAgIFx0XHRcdH0pOyAgXHRcblx0IH1cblx0XG5cdGdldERlbHRhKGRlbHRhVGltZSlcblx0e1xuXHRcdHZhciB1cmwgPSBcIi9wYXRocy9cIit0aGlzLmNhbnZhc05hbWUrXCIvZGVsdGEvXCIrZGVsdGFUaW1lK1wiL1wiKzEwO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRmZXRjaCh1cmwpLnRoZW4oKHJlc3ApID0+IHJlc3AuanNvbigpKS50aGVuKFxuXHQgIFx0XHRcdFx0ZnVuY3Rpb24oZGF0YSlcblx0ICBcdFx0XHRcdHtcblx0ICAgIFx0XHRcdFx0Zm9yKHZhciBpPTA7aTxkYXRhLmxlbmd0aDtpKyspXG5cdCAgICBcdFx0XHRcdHtcblx0ICAgIFx0XHRcdFx0XHR2YXIgIG9uZURhdGEgPSBkYXRhW2ldO1xuXHQgICAgXHRcdFx0XHRcdGlmKG9uZURhdGEudXBkYXRlVHlwZT09IFwianVuY3Rpb25cIilcblx0XHRcdFx0XHRcdFx0e1xuXHQgICAgXHRcdFx0XHRcdFx0c2VsZi53b3JsZC5hZGRUb1dvcmxkVXBkYXRlUXVldWUoV29ybGRVcGRhdGUuY3JlYXRlV29ybGRVcGRhdGVGcm9tSnNvbihvbmVEYXRhKSk7XG5cdFxuXHQgICAgXHRcdFx0XHRcdH1cblx0ICAgIFx0XHRcdFx0XHRlbHNlIGlmKG9uZURhdGEudXBkYXRlVHlwZT09XCJtb3ZlXCIpXG5cdCAgICBcdFx0XHRcdFx0e1xuXHQgICAgXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJtb3ZlOlwiK0NvbW1vbi50b1N0cmluZyhvbmVEYXRhKSk7XG5cdCAgICBcdFx0XHRcdFx0XHRpZihzZWxmLndvcmxkLmRvZXNOb2RlRXhpc3Qob25lRGF0YS5ub2RlS2V5KSlcblx0ICAgIFx0XHRcdFx0XHRcdHtcblx0ICAgIFx0XHRcdFx0XHRcdFx0dmFyIG5vZGUgPSBzZWxmLndvcmxkLmdldE5vZGUob25lRGF0YS5ub2RlS2V5KTtcblx0ICAgIFx0XHRcdFx0XHRcdFx0aWYoIW5vZGUuaXNTZWxlY3RlZCkgbm9kZS5wb3NpdGlvbi5zZXRYWShvbmVEYXRhLm1vdmVQb3NpdGlvbi54LG9uZURhdGEubW92ZVBvc2l0aW9uLnkpO1xuXHQgICAgXHRcdFx0XHRcdFx0fVxuXHQgICAgXHRcdFx0XHRcdH1cblx0ICAgIFx0XHRcdFx0XHRzZWxmLmxhc3RUaW1lRGVsdGEgPSBvbmVEYXRhLnByb2Nlc3NUaW1lc3RhbXA7XG5cdCAgICBcdFx0XHRcdH1cblx0ICAgIFx0XHRcdH0pOyAgXHRcblx0IH1cblx0XG5cdGdldERhdGEoKVxuXHR7XG5cdFx0dmFyIHVybCA9IFwiL3BhdGhzL1wiK3RoaXMuY2FudmFzTmFtZTtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0ZmV0Y2godXJsKS50aGVuKChyZXNwKSA9PiByZXNwLmpzb24oKSkudGhlbihcblx0ICBcdFx0XHRcdGZ1bmN0aW9uKGRhdGEpXG5cdCAgXHRcdFx0XHR7XG5cdCAgICBcdFx0XHRcdFBhdGhXb3JsZC5maWxsUGF0aFdvcmxkRnJvbUNsaWVudEpzb24oc2VsZi53b3JsZCxkYXRhKTtcblx0ICAgIFx0XHRcdH0pO1xuXHRcdHRoaXMubGFzdFRpbWVEZWx0YSA9IDA7XHRcblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBQYXRoQ2xpZW50O1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlBhdGhDbGllbnRcIik7XG4vLzwvanMybm9kZT4iXX0=
