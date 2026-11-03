(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GenericPedigreeClient = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var Person = require('../pedigree/person');
var Junction = require('../paths/junction');

class PedigreeCanvas extends NodeCanvas
{
	constructor(canvasHolder,worldDisplay)
	{
		super(canvasHolder);
		this.person = new Array();
		//this.personSpacer = canvasHolder.getConnector("personSpacer",canvasHolder.canvasName+":personSpacer"),
		this.worldWall = canvasHolder.getConnector("worldWall",canvasHolder.canvasName+":worldWall"),
		
		this.updateQueue = new Array();
		this.updateQueue.isInNeedOfSorting = false

		//this.junctionSpacer = junctionSpacer;
		//this.worldWall = worldWall;
		this.worldDisplay = worldDisplay;
		this.lastDate = "";
		this.checkTimestamp = "";
		this.nodeCanvasMouse = new NodeCanvasMouse(this);
		this.fillStyle = worldDisplay.worldBackgroundColor;
	}
	
	static fillPedigreeCanvasFromClientJson(world,json)
	{		
		//console.log("PathWolrd:fillPedigreeCanvasFromClientJson");
		//console.log("PathWolrd:fillPedigreeCanvasFromClientJson:worldName="+this.name);
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

	
	static createPedigreeCanvasFromClientJson(canvasHolder,worldDef,json)
	{
		var pathWorld = new PedigreeCanvas(canvasHolder,worldDef);
		
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
		this.pedigreeExtraAnimation(timestamp);
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
	
	pedigreeExtraAnimation(timestamp)
	{
		this.prepareUpdateQueue();

		var localCheckTimestamp = this.animationExecTime*this.timeFactor + this.startTime.getTime();
		var checkDate = new Date(localCheckTimestamp);

		if(this.lastDate==null) this.lastDate=="";
		
		if(this.lastDate!=checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate))
		{
			this.lastDate = checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate);
			if(this.isAnimated && this.canvasHolder.isDrawable()) $('#world_date').html(this.lastDate);
		}
		
		this.checkTimestamp = localCheckTimestamp;
		if(this.isAnimated) while(this.isNextUpdateReady(localCheckTimestamp))
		{
			var proccesed = this.processUpdateQueue();
			if(proccesed!=null)
			{
				var date = new Date(proccesed.processTimestamp*1000+0*1000);//proccesed.getDate();
			}
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
	
	isNextUpdateReady(timestamp)
	{
		var ready = false;
		if(this.updateQueue.length>0)
		{
			ready = this.updateQueue[0].readyToBeProcessed(timestamp);
		}
		return(ready);
	}
	
	peekAtNextUpdate()
	{
		var update = null;
		if(this.updateQueue.length>0)
		{
			worldUpdate = this.updateQueue[0];
		}
		return(update);
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
			//console.log("PedigreeCanvas:getCreateJunction:type="+junctionInfo.junctionTypeKey);

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
			//console.log("PedigreeCanvas:getCreateWalker:type="+walkerInfo.walkerTypeKey);

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
		//console.log("PedigreeCanvas.removeWalker:"+walker.name+" at "+walker.getCurrentJunction().name);
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
	
	processUpdateQueue()
	{
		var update = this.getNextFromUpdateQueue();
		if(update!=null) worldUpdate = this.processUpdate(update);
		return(worldUpdate);
	}
	
	processUpdate(update)
	{
		console.log("processUpdateQueue:update="+CommontoString(update));		
		this.updateQueueProcessed.push(update);
		return(update);
	}
	
	
	
	addToUpdateQueue(update)
	{
		this.updateQueue.isInNeedOfSorting = true;
		this.updateQueue.push(update);
	}	
	
	prepareUpdateQueue()
	{
		//console.log("prepareUpdateQueue:isInNeedOfSorting="+this.updateQueue.isInNeedOfSorting);
		if(this.updateQueue.isInNeedOfSorting)
		{
			this.updateQueue.sort(
				function(a, b)
				{
					return(a.processTimestamp-b.processTimestamp);
				}
				);
			this.updateQueue.isInNeedOfSorting = false;
		}
	}
	
	getNextFromUpdate()
	{
		var update = null;
		if(this.worldQueue.length>0)
		{
			update = this.updateQueue[0];
			this.updateQueue.shift();
		}
		return(update);
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
module.exports = PedigreeCanvas;
console.log("Loading:PedigreeCanvas");
//</js2node>

},{"../common/common":1,"../nodes/nodecanvas/nodecanvas":14,"../nodes/nodecanvas/nodecanvasmouse":15,"../nodes/position/position":21,"../paths/junction":24,"../paths/path":27,"../pedigree/person":31}],29:[function(require,module,exports){
var CanvasHolder = require('../nodes/nodecanvas/canvasholder');
var CanvasHolderVirtual = require('../nodes/nodecanvas/canvasholdervirtual');
var Position = require('../nodes/position/position');
var PedigreeCanvas = require('../pedigree/pedigreecanvas');
//var WorldUpdate = GenericPedigreeDefrequire('../../paths/worldupdate');
////////////////var GenericPedigreeDef = require('../pedigree/genericpedigreedef');
var Common = require('../common/common');
var CanvasHolder = require('../nodes/nodecanvas/canvasholder');

class PedigreeClient
{
	constructor(canvasHolder)
	{
		this.canvasName = canvasHolder.canvasName;
		this.canvasHolder = canvasHolder;
		this.worldDisplay = this.canvasHolder.worldDef.getWorldDispaly();	
		this.world = new PedigreeCanvas(
				this.canvasHolder,		
				this.worldDisplay);
		this.world.timeFactor = 1.0;
		this.world.startTime = new Date();
		this.lastTimeDelta = -1;

		/*
		var firstItem = this.world.peekAtNextWorldUpdate();
		if(firstItem!=null)
		{
			var firstDate = firstItem.getDate();
			this.world.startTime = firstDate;
		}
		*/
	}
	
	static getExports()
	{
		return(
				{
					CanvasHolder:CanvasHolder,
					CanvasHolderVirtual:CanvasHolderVirtual,
					Position:Position,
					PedigreeCanvas:PedigreeCanvas,
					//WorldUpdate:WorldUpdate,
					//InaGraphPedigreeCanvasDef:InaGraphPedigreeCanvasDef,
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
	    				PedigreeCanvas.fillPedigreeCanvasFromClientJson(self.world,data);
	    			});
		this.lastTimeDelta = 0;	
	}
}

//<js2node>
module.exports = PedigreeClient;
console.log("Loading:PedigreeClient");
//</js2node>
},{"../common/common":1,"../nodes/nodecanvas/canvasholder":11,"../nodes/nodecanvas/canvasholdervirtual":12,"../nodes/position/position":21,"../pedigree/pedigreecanvas":28}],30:[function(require,module,exports){
var CanvasDef = require('../nodes/nodecanvas/canvasdef');


class PedigreeCanvasDef extends CanvasDef
{
	constructor()
	{		
		super();
	}
	
	getPathParts()
	{
		throw "PedigreeCanvasDef.getPathParts not defined";
	}
	
	getPathDef()
	{
		throw "PedigreeCanvasDef.getPathDef not defined";
	}
	
	getWalkerJunctionRules()
	{
		throw "PedigreeCanvasDef.getWalkerJunctionRules not defined";
	}
}

//<js2node>
module.exports = PedigreeCanvasDef;
console.log("Loading:PedigreeCanvasDef");
//</js2node>

},{"../nodes/nodecanvas/canvasdef":10}],31:[function(require,module,exports){
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

},{"../common/common":1,"../nodes/node":9}],32:[function(require,module,exports){
var Connector = require('../nodes/connector/connector');
var SpringConnector = require('../nodes/connector/springconnector');


class PersonConnector extends SpringConnector
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
module.exports = PersonConnector;
console.log("Loading:PersonConnector");
//</js2node>

},{"../nodes/connector/connector":2,"../nodes/connector/springconnector":5}],33:[function(require,module,exports){
var CanvasHolder = require('../nodes/nodecanvas/canvasholder');
var CanvasHolderVirtual = require('../nodes/nodecanvas/canvasholdervirtual');
var Position = require('../nodes/position/position');
var PedigreeCanvas = require('../pedigree/pedigreecanvas');
var PedigreeClient = require('../pedigree/pedigreeclient');
var GenericPedigreeDef = require('../pedigreeexp/genericpedigreedef');
//var WorldUpdate = GenericPedigreeDefrequire('../../paths/worldupdate');
////////////////var GenericPedigreeDef = require('../pedigree/genericpedigreedef');
var Common = require('../common/common');
var CanvasHolder = require('../nodes/nodecanvas/canvasholder');

class GenericPedigreeClient extends PedigreeClient
{
	constructor(canvasHolder)
	{
		super(canvasHolder);
	}
	
	static getExports()
	{	var toExport = super.getExports();
		toExport.GenericPedigreeDef = GenericPedigreeDef;
		return(toExport);
	}
}

//<js2node>
module.exports = GenericPedigreeClient;
console.log("Loading:GenericPedigreeClient");
//</js2node>
},{"../common/common":1,"../nodes/nodecanvas/canvasholder":11,"../nodes/nodecanvas/canvasholdervirtual":12,"../nodes/position/position":21,"../pedigree/pedigreecanvas":28,"../pedigree/pedigreeclient":29,"../pedigreeexp/genericpedigreedef":34}],34:[function(require,module,exports){
var PathWorldDef = require('../pedigree/pedigreedef');
var CanvasHolder = require('../nodes/nodecanvas/canvasholder');
var PedigreeDef = require('../pedigree/pedigreedef');
//var WorldUpdate = require('../pedigree/worldupdate');
var Person = require('../pedigree/person');
var Common = require('../common/common');
var CircleDisplay = require('../nodes/nodedisplay/circledisplay');
var ConnectorDisplayEmpty = require('../nodes/connectordisplay/connectordisplayempty');
var GroupConnector = require('../nodes/connector/groupconnector');
var WallConnector = require('../nodes/connector/wallconnector');
var JunctionConnector = require('../paths/nodedisplay/junctionconnector');
var JunctionDisplay = require('../paths/nodedisplay/junctiondisplay');
var RectangleDisplay = require('../nodes/nodedisplay/rectangledisplay');
var TriangleDisplay = require('../nodes/nodedisplay/triangledisplay');
var ArcDisplayShape = require('../nodes/nodedisplay/arcdisplayshape');
var PersonConnector = require('../pedigree/personconnector');

//var InitInaGraph = require('../pathsexp/inagraph/initinagraph');




class GenericPedigreeDef extends PedigreeDef
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
		
		this.pedigree =
		{
				backgroundColor:"e0e0f0ff",
		}
		
		this.worldDisplay =
		{	
			junctionRadiusDefault:this.worldDefaults.junctionRadiusDefault,
			walkerRadiusDefault:this.worldDefaults.walkerRadiusDefault,
			relaxedDistanceDefault:this.worldDefaults.relaxedDistanceDefault,
			elasticityFactorDefualt:this.worldDefaults.elasticityFactorDefualt,
			
		    worldBackgroundColor:"e0e0f0ff",
		
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
		    	/*
			
				generic:
				{
					connectorDisplay: new PersonConnector(
					{
						lineColor:"0000a0ff",lineWidth:5
					}),					
				},
				*/
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
		
	getWorldDispaly()
	{
		return(this.worldDisplay);
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
}

//<js2node>
module.exports = GenericPedigreeDef;
console.log("Loading:GenericPedigreeDef");
//</js2node>
},{"../common/common":1,"../nodes/connector/groupconnector":3,"../nodes/connector/wallconnector":6,"../nodes/connectordisplay/connectordisplayempty":8,"../nodes/nodecanvas/canvasholder":11,"../nodes/nodedisplay/arcdisplayshape":16,"../nodes/nodedisplay/circledisplay":17,"../nodes/nodedisplay/rectangledisplay":19,"../nodes/nodedisplay/triangledisplay":20,"../paths/nodedisplay/junctionconnector":25,"../paths/nodedisplay/junctiondisplay":26,"../pedigree/pedigreedef":30,"../pedigree/person":31,"../pedigree/personconnector":32}]},{},[33])(33)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uL2NvbW1vbi9jb21tb24uanMiLCIuLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yLmpzIiwiLi4vbm9kZXMvY29ubmVjdG9yL2dyb3VwY29ubmVjdG9yLmpzIiwiLi4vbm9kZXMvY29ubmVjdG9yL3NoYXBlY29ubmVjdG9yLmpzIiwiLi4vbm9kZXMvY29ubmVjdG9yL3NwcmluZ2Nvbm5lY3Rvci5qcyIsIi4uL25vZGVzL2Nvbm5lY3Rvci93YWxsY29ubmVjdG9yLmpzIiwiLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5LmpzIiwiLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5ZW1wdHkuanMiLCIuLi9ub2Rlcy9ub2RlLmpzIiwiLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNkZWYuanMiLCIuLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlci5qcyIsIi4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzaG9sZGVydmlydHVhbC5qcyIsIi4uL25vZGVzL25vZGVjYW52YXMvbW91c2VzdGF0dXMuanMiLCIuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXMuanMiLCIuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXNtb3VzZS5qcyIsIi4uL25vZGVzL25vZGVkaXNwbGF5L2FyY2Rpc3BsYXlzaGFwZS5qcyIsIi4uL25vZGVzL25vZGVkaXNwbGF5L2NpcmNsZWRpc3BsYXkuanMiLCIuLi9ub2Rlcy9ub2RlZGlzcGxheS9ub2RlZGlzcGxheS5qcyIsIi4uL25vZGVzL25vZGVkaXNwbGF5L3JlY3RhbmdsZWRpc3BsYXkuanMiLCIuLi9ub2Rlcy9ub2RlZGlzcGxheS90cmlhbmdsZWRpc3BsYXkuanMiLCIuLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbi5qcyIsIi4uL25vZGVzL3NoYXBlcy9ib3VuZGluZ2JveC5qcyIsIi4uL25vZGVzL3NoYXBlcy9zaGFwZS5qcyIsIi4uL3BhdGhzL2p1bmN0aW9uLmpzIiwiLi4vcGF0aHMvbm9kZWRpc3BsYXkvanVuY3Rpb25jb25uZWN0b3IuanMiLCIuLi9wYXRocy9ub2RlZGlzcGxheS9qdW5jdGlvbmRpc3BsYXkuanMiLCIuLi9wYXRocy9wYXRoLmpzIiwiLi4vcGVkaWdyZWUvcGVkaWdyZWVjYW52YXMuanMiLCIuLi9wZWRpZ3JlZS9wZWRpZ3JlZWNsaWVudC5qcyIsIi4uL3BlZGlncmVlL3BlZGlncmVlZGVmLmpzIiwiLi4vcGVkaWdyZWUvcGVyc29uLmpzIiwiLi4vcGVkaWdyZWUvcGVyc29uY29ubmVjdG9yLmpzIiwiZ2VuZXJpY3BlZGlncmVlY2xpZW50LmpzIiwiZ2VuZXJpY3BlZGlncmVlZGVmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25lQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIENvbW1vblxue1xuXHRjb25zdHJ1Y3Rvcih2YWx1ZXMpXG5cdHtcblx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlcztcblx0XHRjb25zb2xlLmxvZyhcIjEwMVwiKTtcblx0fVxuXHRcblx0c3RhdGljIGluaGVyaXRzRnJvbShjaGlsZCwgcGFyZW50KVxuXHR7XG5cdCAgICBjaGlsZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudC5wcm90b3R5cGUpO1xuXHR9XG5cdFxuXHRzdGF0aWMgZ2V0VGltZUtleSgpXG5cdHtcblx0XHR2YXIgdWlkID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKS50b1N0cmluZygzNik7XG5cdFx0cmV0dXJuKHVpZCk7XG5cdH1cblxuXHRzdGF0aWMgIGpzb25Ub1VSSShqc29uKXsgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShqc29uKSk7IH1cblxuXHRzdGF0aWMgdXJpVG9KU09OKHVyaWpzb24peyByZXR1cm4gSlNPTi5wYXJzZShkZWNvZGVVUklDb21wb25lbnQodXJpanNvbikpOyB9XG5cblx0c3RhdGljIHN0cmluZ2lmeUNvbW1vbihvYmosIHJlcGxhY2VyLCBzcGFjZXMsIGN5Y2xlUmVwbGFjZXIpXG5cdHtcblx0ICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqLCB0aGlzLnNlcmlhbGl6ZXJDb21tb24ocmVwbGFjZXIsIGN5Y2xlUmVwbGFjZXIpLCBzcGFjZXMpXG5cdH1cblxuXHRzdGF0aWMgZ2V0RGF5T2ZXZWVrKGRhdGUpXG5cdHsgICBcblx0ICAgIHJldHVybiBbXCJTdW5kYXlcIixcIk1vbmRheVwiLFwiVHVlc2RheVwiLFwiV2VkbmVzZGF5XCIsXCJUaHVyc2RheVwiLFwiRnJpZGF5XCIsXCJTYXR1cmRheVwiXVsgZGF0ZS5nZXREYXkoKSBdO1xuXHR9O1xuXHRcblx0dGVzdCh0ZXN0KVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXCJDb21tb246dGVzdDpcIit0ZXN0KTtcblx0fVxuXG5cdHN0YXRpYyBzZXJpYWxpemVyQ29tbW9uKHJlcGxhY2VyLCBjeWNsZVJlcGxhY2VyKVxuXHR7XG5cdCAgdmFyIHN0YWNrID0gW10sIGtleXMgPSBbXVxuXG5cdCAgaWYgKGN5Y2xlUmVwbGFjZXIgPT0gbnVsbCkgY3ljbGVSZXBsYWNlciA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcblx0ICAgIGlmIChzdGFja1swXSA9PT0gdmFsdWUpIHJldHVybiBcIltDaXJjdWxhciB+XVwiXG5cdCAgICByZXR1cm4gXCJbQ2lyY3VsYXIgfi5cIiArIGtleXMuc2xpY2UoMCwgc3RhY2suaW5kZXhPZih2YWx1ZSkpLmpvaW4oXCIuXCIpICsgXCJdXCJcblx0ICB9XG5cblx0ICByZXR1cm4gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuXHQgICAgaWYgKHN0YWNrLmxlbmd0aCA+IDApIHtcblx0ICAgICAgdmFyIHRoaXNQb3MgPSBzdGFjay5pbmRleE9mKHRoaXMpXG5cdCAgICAgIH50aGlzUG9zID8gc3RhY2suc3BsaWNlKHRoaXNQb3MgKyAxKSA6IHN0YWNrLnB1c2godGhpcylcblx0ICAgICAgfnRoaXNQb3MgPyBrZXlzLnNwbGljZSh0aGlzUG9zLCBJbmZpbml0eSwga2V5KSA6IGtleXMucHVzaChrZXkpXG5cdCAgICAgIGlmICh+c3RhY2suaW5kZXhPZih2YWx1ZSkpIHZhbHVlID0gY3ljbGVSZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpXG5cdCAgICB9XG5cdCAgICBlbHNlIHN0YWNrLnB1c2godmFsdWUpXG5cblx0ICAgIHJldHVybiByZXBsYWNlciA9PSBudWxsID8gdmFsdWUgOiByZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpXG5cdCAgfVxuXHR9XG5cblx0c3RhdGljIGdldENvbG9yRnJvbVN0cmluZyhjb2xvclN0cmluZylcblx0e1xuXHRcdHZhciB0cmFuc3BhcmVuY3kgPSAxLjA7XG5cdFx0aWYoY29sb3JTdHJpbmcubGVuZ3RoPT02KVxuXHRcdHtcblx0XHRcdGNvbG9yU3RyaW5nICs9IFwiZmZcIjtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIGNvbG9yID0gXCJyZ2JhKFwiK1xuXHRcdFx0XHRwYXJzZUludChjb2xvclN0cmluZy5zdWJzdHJpbmcoMCwyKSwgMTYpK1wiLFwiK1xuXHRcdFx0XHRwYXJzZUludChjb2xvclN0cmluZy5zdWJzdHJpbmcoMiw0KSwgMTYpK1wiLFwiK1xuXHRcdFx0XHRwYXJzZUludChjb2xvclN0cmluZy5zdWJzdHJpbmcoNCw2KSwgMTYpK1wiLFwiK1xuXHRcdFx0XHRwYXJzZUludChjb2xvclN0cmluZy5zdWJzdHJpbmcoNiw4KSwgMTYpLzI1NS4wK1wiKVwiO1xuXHRcdFxuXHRcdHJldHVybihjb2xvcik7XG5cdH1cblxuXHRzdGF0aWMgbG9nSW5zZXJ0QXJyYXkoYXJyYXkscHJpbnRWYWx1ZUZ1bmN0aW9uKVxuXHR7XG5cdFx0Zm9yKHZhciBpPTA7aTxhcnJheS5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKFwiaT1cIitwcmludFZhbHVlRnVuY3Rpb24oYXJyYXlbaV0pKTtcblx0XHR9XG5cdH1cdFxuXHRcblx0c3RhdGljIGluc2VydEludG9BcnJheSh0b0luc2VydCxhcnJheSxwb3NpdGlvbilcblx0e1xuXHRcdGFycmF5LnNwbGljZShwb3NpdGlvbiwwLHRvSW5zZXJ0KTtcblx0fVx0XG5cdFxuXHRzdGF0aWMgc2h1ZmZsZUFycmF5KGFycmF5KVxuXHR7XG5cdCAgICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuXHQgICAgICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG5cdCAgICAgICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcblx0ICAgICAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuXHQgICAgICAgIGFycmF5W2pdID0gdGVtcDtcblx0ICAgIH1cblx0ICAgIHJldHVybiBhcnJheTtcblx0fVxuXG5cdHN0YXRpYyByZW1vdmVJdGVtRnJvbUFycmF5KGFycmF5LGl0ZW0pXG5cdHtcblx0XHR2YXIgaW5kZXggPSBhcnJheS5pbmRleE9mKGl0ZW0pO1xuXHRcdGlmIChpbmRleCA+IC0xKVxuXHRcdHtcblx0XHQgICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcblx0XHR9XG5cdH1cblx0XG5cdHN0YXRpYyB0b1N0cmluZyhvYmplY3QpXG5cdHtcblx0XHRyZXR1cm4oSlNPTi5zdHJpbmdpZnkob2JqZWN0KSk7XG5cdH1cbn1cblxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBDb21tb247XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q29tbW9uXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcblxuXG5jbGFzcyBDb25uZWN0b3Jcbntcblx0Y29uc3RydWN0b3IoY29ubmVjdG9yRnVuY3Rpb24sY29ubmVjdG9yRGlzcGxheSxuYW1lKVxuXHR7XG5cdFx0dGhpcy5ub2RlcyA9IG5ldyBBcnJheSgpO1xuXHRcdHRoaXMuY29ubmVjdG9yRnVuY3Rpb24gPSBjb25uZWN0b3JGdW5jdGlvbjtcdFxuXHRcdHRoaXMuY29ubmVjdG9yRGlzcGxheSA9IGNvbm5lY3RvckRpc3BsYXk7XHRcblx0XHR0aGlzLm5hbWUgPSBuYW1lO1xuXHRcdHRoaXMuY29ubmVjdG9yS2V5ID0gbmFtZStcIiNcIitDb21tb24uZ2V0VGltZUtleSgpO1xuXHRcdGlmKCFuYW1lKSBjb25zb2xlLnRyYWNlKFwiQ29ubmVjdG9yIHBhc3NlZCBpbiBlbXB0eSBuYW1lXCIpO1xuXHR9XG5cdFxuXHRnZXRDb25uZWN0b3JLZXkoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMuY29ubmVjdG9yS2V5KTtcblx0fVxuXG5cdGdldENsaWVudEpzb24oKVxuXHR7XG5cdFx0dmFyIGpzb24gPSB7fTtcblx0XHRqc29uLmNvbm5lY3RvcktleSA9IHRoaXMuZ2V0Q29ubmVjdG9yS2V5KCk7XG5cdFx0anNvbi5jb25uZWN0b3JEaXNwbGF5ID0gdGhpcy5jb25uZWN0b3JEaXNwbGF5O1xuXHRcdGpzb24uY29ubmVjdG9yRGVmS2V5ID0gdGhpcy5jb25uZWN0b3JEZWZLZXk7XG5cdFx0anNvbi5ub2RlcyA9IG5ldyBBcnJheSgpO1xuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5saXN0O2krKylcblx0XHR7XG5cdFx0XHRqc29uLm5vZGVzLnB1c2godGhpcy5ub2Rlc1tpXS5nZXROb2RlS2V5KCkpO1xuXHRcdH1cblx0XHRyZXR1cm4oanNvbik7XG5cdH1cblx0XG5cdGV4ZWN1dGVDb25uZWN0b3JGdW5jdGlvbih0aW1lc3RhbXAsbm9kZSlcblx0e1xuXHRcdHRoaXMuY29ubmVjdG9yRnVuY3Rpb24odGhpcyxub2RlLHRpbWVzdGFtcClcblx0fVxuXG5cdGNvbnRhaW5zUG9zdGlvbihwb3NpdGlvbilcblx0e1xuXHRcdGNvbnNvbGUubG9nKFwiTm9kZTpjb250YWluc1Bvc3Rpb246XCIrdGhpcy5uYW1lK1wiOmRlZmF1bHQsIHdpbGwgYWx3YXlzIGZhaWxcIik7XG5cdFx0cmV0dXJuKGZhbHNlKTtcblx0fVxuXG5cdGFkZE5vZGVMaXN0KG5vZGVMaXN0KVxuXHR7XG5cdFx0Zm9yKHZhciBpPTA7aTxub2RlTGlzdC5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHRoaXMuYWRkTm9kZShub2RlTGlzdFtpXSk7XG5cdFx0fVxuXHR9XG5cblx0YWRkTm9kZShub2RlKVxuXHR7XG5cdFx0dGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xuXHRcdG5vZGUuY29ubmVjdG9ycy5wdXNoKHRoaXMpO1xuXHR9XG5cblx0cmVtb3ZlTm9kZShub2RlKVxuXHR7XG5cdFx0Ly8gY29uc29sZS5sb2coXCJDb25uZWN0b3IgcmVtb3ZlTm9kZSBiZWZvcmU6XCIrXG5cdFx0Ly8gXCJub2RlPVwiK25vZGUubmFtZStcblx0XHQvLyBcIjp0aGlzLm5vZGVzPVwiK3RoaXMubm9kZXMubGVuZ3RoK1xuXHRcdC8vIFwiOm5vZGUuY29ubmVjdG9ycz1cIitub2RlLmNvbm5lY3RvcnMubGVuZ3RoK1xuXHRcdC8vIFwiXCIpO1xuXHRcdENvbW1vbi5yZW1vdmVJdGVtRnJvbUFycmF5KHRoaXMubm9kZXMsbm9kZSk7XG5cdFx0Q29tbW9uLnJlbW92ZUl0ZW1Gcm9tQXJyYXkobm9kZS5jb25uZWN0b3JzLHRoaXMpO1xuXHRcdFxuXHRcdC8vIGNvbnNvbGUubG9nKFwiQ29ubmVjdG9yIHJlbW92ZU5vZGUgYWZ0ZXIgOlwiK1xuXHRcdC8vIFwibm9kZT1cIitub2RlLm5hbWUrXG5cdFx0Ly8gXCI6dGhpcy5ub2Rlcz1cIit0aGlzLm5vZGVzLmxlbmd0aCtcblx0XHQvLyBcIjpub2RlLmNvbm5lY3RvcnM9XCIrbm9kZS5jb25uZWN0b3JzLmxlbmd0aCtcblx0XHQvLyBcIlwiKTtcblx0fVxuXG5cdGluaXRQcm9jZXNzb3IoKVxuXHR7XG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcdGlmICh0aGlzLnNwcmluZ0FuY2hvclBvaW50ICE9IG51bGwpXG5cdFx0e1xuXHRcdFx0aWYgKHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cG9zaXRpb25MaXN0LnB1c2godGhpcy5zcHJpbmdBbmNob3JQb2ludCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQuY3JlYXRlQnlBZGRpbmcodGhpcy5hbmNob3JPZmZzZXRQb2ludCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ocG9zaXRpb25MaXN0KTtcblx0fVxuXG5cdGNhbHVsYXRlTW92ZW1lbnRFeHAobm9kZSxwb3NpdGlvbkxpc3QscmFuZG9tU3RyZW5ndGhGYWN0b3IscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IpXG5cdHtcblx0XHRpZiAocG9zaXRpb25MaXN0Lmxlbmd0aD4wKVxuXHRcdHtcblx0XHRcdC8vIGxvb2sgYXQgZWFjaCBwb3NpdGlvbiBhbmQgbWFrZSBhIG5ldyBsaXN0IG9mIHBvc2l0aW9ucyB0aGVcblx0XHRcdC8vIFwicmVsYXhlZFwiIGRpc3RhbmNlIGF3YXlcblx0XHRcdHZhciBhbmltYXRlTGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcdFx0dmFyIHggPSAwLjA7XG5cdFx0XHR2YXIgeSA9IDAuMDtcblx0XHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5Q2xvc2VzdChcblx0XHRcdFx0XHRcdHBvc2l0aW9uTGlzdFtpXSxcblx0XHRcdFx0XHRcdHJlbGF4ZWREaXN0YW5jZSsocmFuZG9tU3RyZW5ndGhGYWN0b3IvMi1yYW5kb21TdHJlbmd0aEZhY3RvcipNYXRoLnJhbmRvbSgpKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0eCArPSBwb3NpdGlvbi5nZXRYKCkrKHJhbmRvbVN0cmVuZ3RoRmFjdG9yLzItcmFuZG9tU3RyZW5ndGhGYWN0b3IqTWF0aC5yYW5kb20oKSk7XG5cdFx0XHRcdHkgKz0gcG9zaXRpb24uZ2V0WSgpKyhyYW5kb21TdHJlbmd0aEZhY3Rvci8yLXJhbmRvbVN0cmVuZ3RoRmFjdG9yKk1hdGgucmFuZG9tKCkpO1x0XHRcblx0XHRcdFx0YW5pbWF0ZUxpc3QucHVzaChwb3NpdGlvbik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGZpbmQgdGhlIGF2ZXJhZ2UgXCJyZWxheGVkXCIgcG9zaXRpb25cblx0XHRcdHZhciBhdmVyYWdlUG9zaXRpb24gPSBuZXcgUG9zaXRpb24oeCAvIHBvc2l0aW9uTGlzdC5sZW5ndGgseSAvIHBvc2l0aW9uTGlzdC5sZW5ndGgpO1xuXHRcdFx0dmFyIGRpc3RhbmNlVG9BdmVyYWdlUG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGF2ZXJhZ2VQb3NpdGlvbik7XG5cblx0XHRcdC8vIHRha2UgdGhlIGF2ZXJhZ2UgcG9zaXRpb24gYW5kIG1vdmUgdG93YXJkcyBpdCBiYXNlZCB1cG9uIHRoZVxuXHRcdFx0Ly8gZWxhc3RpY2l0eSBmYWN0b3Jcblx0XHRcdHZhciBtb3ZlUG9zaXRpb24gPSBhdmVyYWdlUG9zaXRpb24uZ2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5Q2xvc2VzdChcblx0XHRcdFx0XHRub2RlLnBvc2l0aW9uLFxuXHRcdFx0XHRcdGRpc3RhbmNlVG9BdmVyYWdlUG9zaXRpb24gKiBlbGFzdGljaXR5RmFjdG9yXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0Ly8gYWRkIHRoaXMgcG9zaXRpb24gdG8gdGhlIGxpc3Qgb2YgcG9pbnRzIHRoaXMgbm9kZSBuZWVkcyB0byBtb3ZlXG5cdFx0XHQvLyB0b1xuXHRcdFx0bm9kZS5wb3NpdGlvbk1vdmVMaXN0LnB1c2gobW92ZVBvc2l0aW9uKTtcblx0XHR9XG5cdH1cblxuXHRjYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LHJhbmRvbVN0cmVuZ3RoRmFjdG9yKVxuXHR7XG5cdFx0aWYgKHBvc2l0aW9uTGlzdC5sZW5ndGg+MClcblx0XHR7XG5cdFx0XHQvLyBsb29rIGF0IGVhY2ggcG9zaXRpb24gYW5kIG1ha2UgYSBuZXcgbGlzdCBvZiBwb3NpdGlvbnMgdGhlXG5cdFx0XHQvLyBcInJlbGF4ZWRcIiBkaXN0YW5jZSBhd2F5XG5cdFx0XHR2YXIgYW5pbWF0ZUxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHRcdHZhciB4ID0gMC4wO1xuXHRcdFx0dmFyIHkgPSAwLjA7XG5cdFx0XHRmb3IodmFyIGk9MDtpPHBvc2l0aW9uTGlzdC5sZW5ndGg7aSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcG9zaXRpb24gPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheUNsb3Nlc3QoXG5cdFx0XHRcdFx0XHRwb3NpdGlvbkxpc3RbaV0sXG5cdFx0XHRcdFx0XHR0aGlzLnJlbGF4ZWREaXN0YW5jZStyYW5kb21TdHJlbmd0aEZhY3RvcipNYXRoLnJhbmRvbSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHR4ICs9IHBvc2l0aW9uLmdldFgoKTtcblx0XHRcdFx0eSArPSBwb3NpdGlvbi5nZXRZKCk7XHRcdFxuXHRcdFx0XHRhbmltYXRlTGlzdC5wdXNoKHBvc2l0aW9uKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZmluZCB0aGUgYXZlcmFnZSBcInJlbGF4ZWRcIiBwb3NpdGlvblxuXHRcdFx0dmFyIGF2ZXJhZ2VQb3NpdGlvbiA9IG5ldyBQb3NpdGlvbih4IC8gcG9zaXRpb25MaXN0Lmxlbmd0aCx5IC8gcG9zaXRpb25MaXN0Lmxlbmd0aCk7XG5cdFx0XHR2YXIgZGlzdGFuY2VUb0F2ZXJhZ2VQb3NpdGlvbiA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYXZlcmFnZVBvc2l0aW9uKTtcblxuXHRcdFx0Ly8gdGFrZSB0aGUgYXZlcmFnZSBwb3NpdGlvbiBhbmQgbW92ZSB0b3dhcmRzIGl0IGJhc2VkIHVwb24gdGhlXG5cdFx0XHQvLyBlbGFzdGljaXR5IGZhY3RvclxuXHRcdFx0dmFyIG1vdmVQb3NpdGlvbiA9IGF2ZXJhZ2VQb3NpdGlvbi5nZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXlDbG9zZXN0KFxuXHRcdFx0XHRcdG5vZGUucG9zaXRpb24sXG5cdFx0XHRcdFx0ZGlzdGFuY2VUb0F2ZXJhZ2VQb3NpdGlvbiAqIHRoaXMuZWxhc3RpY2l0eUZhY3RvclxuXHRcdFx0XHRcdCk7XG5cblx0XHRcdC8vIGFkZCB0aGlzIHBvc2l0aW9uIHRvIHRoZSBsaXN0IG9mIHBvaW50cyB0aGlzIG5vZGUgbmVlZHMgdG8gbW92ZVxuXHRcdFx0Ly8gdG9cblx0XHRcdG5vZGUucG9zaXRpb25Nb3ZlTGlzdC5wdXNoKG1vdmVQb3NpdGlvbik7XG5cdFx0fVxuXHR9XG59XG5cbi8vIDxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3I7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q29ubmVjdG9yXCIpO1xuLy8gPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBDb25uZWN0b3IgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyBHcm91cENvbm5lY3RvciBleHRlbmRzIENvbm5lY3Rvclxue1xuXHRjb25zdHJ1Y3Rvcihjb25uZWN0b3JEaXNwbGF5LHNwcmluZ0FuY2hvclBvaW50LGFuY2hvck9mZnNldFBvaW50LHJlbGF4ZWREaXN0YW5jZSxlbGFzdGljaXR5RmFjdG9yLG5hbWUpXG5cdHtcblx0XHRzdXBlcihHcm91cENvbm5lY3Rvci5wcm9jZXNzR3JvdXBTcHJpbmdDb25uZWN0b3JPbmVOb2RlVG9Db25uZWN0ZWROb2Rlcyxjb25uZWN0b3JEaXNwbGF5LG5hbWUpO1xuXG5cdFx0dGhpcy5zcHJpbmdBbmNob3JQb2ludCA9IHNwcmluZ0FuY2hvclBvaW50O1xuXHRcdHRoaXMuYW5jaG9yT2Zmc2V0UG9pbnQgPSBhbmNob3JPZmZzZXRQb2ludDtcblx0XHR0aGlzLnJlbGF4ZWREaXN0YW5jZSA9IHJlbGF4ZWREaXN0YW5jZTtcblx0XHR0aGlzLmVsYXN0aWNpdHlGYWN0b3IgPSBlbGFzdGljaXR5RmFjdG9yO1xuXHR9XG5cdFxuXHRzdGF0aWMgcHJvY2Vzc0dyb3VwU3ByaW5nQ29ubmVjdG9yT25lTm9kZVRvQ29ubmVjdGVkTm9kZXMoY29ubmVjdG9yLG5vZGUsdGltZXN0YW1wKVxuXHR7XG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IGNvbm5lY3Rvci5pbml0UHJvY2Vzc29yKCk7XG5cdFx0Zm9yKHZhciBpPTA7aTxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgYiA9IGNvbm5lY3Rvci5ub2Rlc1tpXTtcblx0XHRcdHZhciBkaXN0YW5jZSA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XG5cdFx0XHRpZiAoYiAhPSBub2RlICYmIGRpc3RhbmNlPGNvbm5lY3Rvci5yZWxheGVkRGlzdGFuY2UpIHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcblx0XHR9XG5cdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMCk7XG5cdH1cblxuXHRwcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcblx0e1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xuXHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGIgPSBjb25uZWN0b3Iubm9kZXNbaV07XG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xuXHRcdFx0aWYgKGIgIT0gbm9kZSAmJiBkaXN0YW5jZTxjb25uZWN0b3IucmVsYXhlZERpc3RhbmNlKSBwb3NpdGlvbkxpc3QucHVzaChiLnBvc2l0aW9uKTtcdFx0XG5cdFx0fVxuXHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50KG5vZGUscG9zaXRpb25MaXN0LDApO1xuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwQ29ubmVjdG9yO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkdyb3VwQ29ubmVjdG9yXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2Nvbm5lY3Rvci9jb25uZWN0b3InKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIFNoYXBlQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yXG57XG5cdGNvbnN0cnVjdG9yKG5vZGUsY29ubmVjdG9yRGlzcGxheSxzaGFwZSxhbmNob3JPZmZzZXRQb2ludCxyZWxheGVkRGlzdGFuY2UsZWxhc3RpY2l0eUZhY3RvcixvdXRzaWRlUmVsYXhlZERpc3RhbmNlLG91dHNpZGVFbGFzdGljaXR5RmFjdG9yLG5hbWUpXG5cdHtcblx0XHRzdXBlcihTaGFwZUNvbm5lY3Rvci5wcm9jZXNzU2hhcGVDb25uZWN0b3JPbmVOb2RlVG9Db25uZWN0ZWROb2Rlcyxjb25uZWN0b3JEaXNwbGF5LG5hbWUpO1xuXG5cdFx0dGhpcy5ub2RlID0gbm9kZTtcblx0XHR0aGlzLnNwcmluZ0FuY2hvclBvaW50ID0gbm9kZS5wb3NpdGlvbjtcblx0XHR0aGlzLmFuY2hvck9mZnNldFBvaW50ID0gYW5jaG9yT2Zmc2V0UG9pbnQ7XG5cdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UgPSByZWxheGVkRGlzdGFuY2U7XG5cdFx0dGhpcy5lbGFzdGljaXR5RmFjdG9yID0gZWxhc3RpY2l0eUZhY3Rvcjtcblx0XHR0aGlzLm91dHNpZGVSZWxheGVkRGlzdGFuY2UgPSBvdXRzaWRlUmVsYXhlZERpc3RhbmNlO1xuXHRcdHRoaXMub3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IgPSBvdXRzaWRlRWxhc3RpY2l0eUZhY3Rvcjtcblx0XHR0aGlzLnNoYXBlID0gc2hhcGU7XG5cdH1cblx0XG5cdHN0YXRpYyBwcm9jZXNzU2hhcGVDb25uZWN0b3JPbmVOb2RlVG9Db25uZWN0ZWROb2Rlcyhjb25uZWN0b3Isbm9kZSx0aW1lc3RhbXApXG5cdHtcblx0Ly9cdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XG5cdFx0XG5cdFx0aWYoIXRoaXMuc2hhcGUuY29udGFpbnNQb3NpdGlvbihub2RlLnBvc2l0aW9uLHRoaXMubm9kZSkpXG5cdFx0e1xuXHRcdFx0LyoqKioqKioqKioqKlxuXHRcdFx0dmFyIG9uU2hhcGVMaW5lUG9zaXRpb24gPSB0aGlzLnNoYXBlLmZpbmRDbG9zZXN0UG9pbnRJblNoYXBlRnJvbVN0YXJ0aW5nUG9pbnQobm9kZS5wb3NpdGlvbix0aGlzLm5vZGUpO1xuXHRcdFx0cG9zaXRpb25MaXN0LnB1c2gob25TaGFwZUxpbmVQb3NpdGlvbik7XG5cdFx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudEV4cChub2RlLHBvc2l0aW9uTGlzdCwwLjAsdGhpcy5vdXRzaWRlUmVsYXhlZERpc3RhbmNlLHRoaXMub3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IpO1xuXHRcdFx0KioqKioqKioqKioqKioqKi9cblx0XHRcdHZhciBhdmVyYWdlUG9pbnRUcmFuc2Zvcm1lZCA9IHRoaXMuc2hhcGUuZ2V0QXZlcmFnZVBvaW50VHJhbnNmb3JtZWQodGhpcy5ub2RlKVxuXHRcdFx0Ly9wb3NpdGlvbkxpc3QucHVzaCh0aGlzLm5vZGUucG9zaXRpb24pO1xuXHRcdFx0cG9zaXRpb25MaXN0LnB1c2goYXZlcmFnZVBvaW50VHJhbnNmb3JtZWQpO1xuXHRcdFx0XG5cdFx0XHR2YXIgb3V0c2lkZVJlbGF4RGlzdGFuY2UgPSB0aGlzLm91dHNpZGVSZWxheGVkRGlzdGFuY2U7XG5cdFx0XHR2YXIgb3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IgPSB0aGlzLm91dHNpZGVFbGFzdGljaXR5RmFjdG9yO1xuXHRcdFx0b3V0c2lkZUVsYXN0aWNpdHlGYWN0b3IgPSAwLjAyNTtcblx0XHRcdGlmKGRpc3RhbmNlPm91dHNpZGVSZWxheERpc3RhbmNlKjEuMjUpIFxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIml0cyBvdXRzaWRlISE6bm9kZT1cIitub2RlLm5hbWUrXCIgZGlzdGFuY2U9XCIrZGlzdGFuY2UpO1xuXHRcdFx0XHRvdXRzaWRlRWxhc3RpY2l0eUZhY3RvciA9IDAuMDE7XG5cdFx0XHR9XG5cdFx0XHRcdCBcblx0XHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50RXhwKFxuXHRcdFx0XHRub2RlLFxuXHRcdFx0XHRwb3NpdGlvbkxpc3QsXG5cdFx0XHRcdDAuMCxcblx0XHRcdFx0b3V0c2lkZVJlbGF4RGlzdGFuY2UsXG5cdFx0XHRcdG91dHNpZGVFbGFzdGljaXR5RmFjdG9yKTtcblx0XG5cdFx0XHQvL2Nvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50RXhwKG5vZGUscG9zaXRpb25MaXN0LDAuMCwwLjAsMC41KTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHZhciBzaGFwZUFyZWEgPSB0aGlzLnNoYXBlLmdldFNoYXBlQXJlYSgpO1xuXHRcdFx0dmFyIG1pbkFyZWFQZXJOb2RlID0gc2hhcGVBcmVhIC8gY29ubmVjdG9yLm5vZGVzLmxlbmd0aDtcblx0XHRcdC8vdmFyIHNwYWNpbmcgPSBtaW5BcmVhUGVyTm9kZS8yOy8vTWF0aC5zcXJ0KG1pbkFyZWFQZXJOb2RlKTtcblx0XHRcdHZhciBzcGFjaW5nID0gTWF0aC5zcXJ0KG1pbkFyZWFQZXJOb2RlKSoxLjAxOy8vKjIuMztcblx0XHRcdGlmKHNwYWNpbmc9PTApIHNwYWNpbmcgPSAxO1xuXHRcdFx0Ly92YXIgc3BhY2luZyA9IE1hdGguc3FydChtaW5BcmVhUGVyTm9kZSkqMS4zO1xuXHRcdFx0Lypcblx0XHRcdGlmKG5vZGUuaXNTZWxlY3RlZClcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJub2RlIG5hbWU6XCIrbm9kZS5uYW1lKTtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJcdHNoYXBlQXJlYTpcIitzaGFwZUFyZWEpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlx0bWluQXJlYVBlck5vZGU6XCIrbWluQXJlYVBlck5vZGUpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlx0c3BhY2luZzpcIitzcGFjaW5nKTtcblx0XHRcdH1cblx0XHRcdCovXG5cdFxuXHRcdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UgPSBzcGFjaW5nO1xuXHRcdFx0Zm9yKHZhciBpPTA7aTxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2krKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGIgPSBjb25uZWN0b3Iubm9kZXNbaV07XG5cdFx0XHRcdFxuXHRcdFx0XHQvKlxuXHRcdFx0XHRpZihub2RlLmlzU2VsZWN0ZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgZCA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XG5cdFxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiXHRjaGVja2luZzpcIitiLm5hbWUrXCIgZGlzdGFuY2U9XCIrZCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ki9cblx0XHRcdFx0aWYoYiAhPSBub2RlICYmIHRoaXMuc2hhcGUuY29udGFpbnNQb3NpdGlvbihiLnBvc2l0aW9uLHRoaXMubm9kZSkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKGIucG9zaXRpb24pO1xuXHRcdFx0XHRcdGlmIChkaXN0YW5jZTxzcGFjaW5nKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly9pZihub2RlLmlzU2VsZWN0ZWQpIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xuXHRcblx0XHRcdGNvbm5lY3Rvci5jYWx1bGF0ZU1vdmVtZW50RXhwKG5vZGUscG9zaXRpb25MaXN0LDAuMCx0aGlzLnJlbGF4ZWREaXN0YW5jZSx0aGlzLmVsYXN0aWNpdHlGYWN0b3IpO1xuXHRcdFx0Ly8gbW92ZSBpdCB0byBhIG5ldyBzcGFjaW5nIGRpc3RhbmNlIChzdGlsbCBpbiB0aGUgc2hhcGUpXG5cdFx0fVxuXHRcdFxuXHRcdC8vY29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMCk7XG5cdFxuXHRcdC8vaWYoc2hhcGUuY29udGFpbnNQb3NpdGlvbigpKVxuXHRcdC8vIGlmIGl0IGlzIG5vdCBpbnNpZGUgdGhlIHNoYXBlIG1vdmUgaW50byB0aGUgc2hhcGUgZmFzdCBhcyBwb3NzaWJsZVxuXHRcdC8vICAgICAgICAuLnlvdSBjYW4gY3ljbGUgdGhyb3VnaCB0aGUgc2lkZXMgYW5kIGZpbmQgdGhlIGNsb3NldCBpbnRlcnNlY3Rpb24gcG9pbnQuXG5cdFx0Ly8gICAgICAgIC4udGhpcyBjYW4gcHJvYmFibHkgYmUgb3B0aW1pemVkIGJ5IGxvb2tpbmcgYXQgZWFjaCBwb2ludCBmaXJzdFxuXHRcdC8vIGlmIGl0IGlzIGluc2lkZSB0aGUgc2hhcGUgdGhlbiA6XG5cdFx0Ly8gICAgICAgIC4uZmluZCBoZSBhdmVyYWdlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHBvaW50cyAob25seSBjaGVjayB0aG9zZSBzbyBjbG9zZT8hPyE/X1xuXHRcdC8vICAgICAgICBpZiBpdHMgZGlzdGFuY2UgaXMgZ3JlYXQgdGhhbiB0aGUgYXZlcmFnZSB0aGVuIG1vdmUgYXdheSBmb3IgdGhlIENPTiBvZiB0aGUgc2FtcGxpbmdcblx0XHQvLyAgICAgICAgaWYgdGhlIGRpc3RhbmNlIGlzIGxlc3MgdGhhbiB0aGUgYXZlcmFnZSBoZW4gbW92ZSB0b3dhcmRzIHRoZSBDT00gb2YgdGhlIHNhbXBsaW5nXG5cdFx0Ly8gICAgICAuLnRoZSBhdmVyYWdlIHNwYWNlIGJlIGFibGUgdG8gdG8gYmUgY2FsY3VsYXRlZCBcblx0XHQvL1xuXHRcdC8vICAgICAgZnVuY3Rpb24gdG8gZmluZCB0aGUgYXZlcmFnZSBkaXN0YW5jZSBiZXR3ZWVuIGEgbGlzdCBvZiBwb2ludHNcblx0XHQvLy8gICAgIGlmIHlvdSBsb29rIGF0IHRoZSBhcmVhIHlvdSBzaG91bGQgYmUgYWJsZSB0byBkaXZlIGl0IGJ5IHRoZSBzaXplIG8gdGhlIHNhbXBsaW5nXG5cdFx0Ly8gICAgICB0byBnZXQgdGhpcyBhdmVyYWdlLi4uLlxuXHRcdC8vXHRcdGlmIHdlIGxpbWl0ZWQgaXQgdG8gYSBwZSBzbGljZSBpdCBpcyBlYXN5Li4uIGEgc2xpY2Ugb2YgdGhlIHBpZSdzIGFyZWEgaXMgZWFzeSB0byBjYWxjdWxhdGVcblx0XHQvL1xuXHRcdC8vXHRcdGZvciBhIGNsb3NlZCBsaXN0IG9mIHBvbHlnb25zIGl0IGlzIGEgc3VtIG9mIHRyaWFuZ2xlcy4uLiBzaG91bGQgY2lyY2xlc1xuXHRcdC8vIFx0XHRiZSBhIHNwZWNpYWwgY2FzZT9cblx0XHQvKlxuXHRcdGZvcih2YXIgaT0wO2k8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGIgPSBjb25uZWN0b3Iubm9kZXNbaV07XG5cdFx0XHRpZiAoYiAhPSBub2RlICYmIGRpc3RhbmNlPGNvbm5lY3Rvci5yZWxheGVkRGlzdGFuY2UpXG5cdFx0XHR7XG5cdFx0XHRcdHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcblx0XHRcdH1cblx0XG5cdFx0XHRcblx0XHRcdHZhciBkaXN0YW5jZSA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XG5cdFx0XHRpZiAoYiAhPSBub2RlICYmIGRpc3RhbmNlPGNvbm5lY3Rvci5yZWxheGVkRGlzdGFuY2UpIHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcblx0XHR9XG5cdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMCk7XG5cdFx0Ki9cblx0fVxuXG5cdHByb2Nlc3NXYWxsU3ByaW5nUmVwdWxzZU9uZU5vZGUoY29ubmVjdG9yLG5vZGUsdGltZXN0YW1wKVxuXHR7XG5cdFx0dmFyIHBvc2l0aW9uTGlzdCA9IGNvbm5lY3Rvci5pbml0UHJvY2Vzc29yKCk7XG5cdFx0Zm9yKHZhciBpPTA7aTxjb25uZWN0b3Iubm9kZXMubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgYiA9IGNvbm5lY3Rvci5ub2Rlc1tpXTtcblx0XHRcdHZhciBkaXN0YW5jZSA9IG5vZGUucG9zaXRpb24uZ2V0RGlzdGFuY2UoYi5wb3NpdGlvbik7XG5cdFx0XHRpZiAoYiAhPSBub2RlICYmIGRpc3RhbmNlPGNvbm5lY3Rvci5yZWxheGVkRGlzdGFuY2UpIHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcblx0XHR9XG5cdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMCk7XG5cdH1cbn1cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gU2hhcGVDb25uZWN0b3I7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6U2hhcGVDb25uZWN0b3JcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yL2Nvbm5lY3RvcicpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcblxuY2xhc3MgU3ByaW5nQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yXG57XG5cdGNvbnN0cnVjdG9yKGNvbm5lY3RvckRpc3BsYXksc3ByaW5nQW5jaG9yUG9pbnQsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IsbmFtZSlcblx0e1xuXHRcdHN1cGVyKFNwcmluZ0Nvbm5lY3Rvci5wcm9jZXNzU3ByaW5nQ29ubmVjdG9yT25lQmVhc3RpZVRvQ29ubmVjdGVkTm9kZXMsY29ubmVjdG9yRGlzcGxheSxuYW1lKTtcblx0XHR0aGlzLnNwcmluZ0FuY2hvclBvaW50ID0gc3ByaW5nQW5jaG9yUG9pbnQ7XG5cdFx0dGhpcy5hbmNob3JPZmZzZXRQb2ludCA9IGFuY2hvck9mZnNldFBvaW50O1xuXHRcdHRoaXMucmVsYXhlZERpc3RhbmNlID0gcmVsYXhlZERpc3RhbmNlO1xuXHRcdHRoaXMuZWxhc3RpY2l0eUZhY3RvciA9IGVsYXN0aWNpdHlGYWN0b3I7XG5cdH1cblxuXHRzdGF0aWMgcHJvY2Vzc1NwcmluZ0Nvbm5lY3Rvck9uZUJlYXN0aWVUb0Nvbm5lY3RlZE5vZGVzKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcblx0e1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL3ZhciBwb3NpdGlvbkxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHRmb3IodmFyIGk9MDtpPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBiID0gY29ubmVjdG9yLm5vZGVzW2ldO1xuXHRcdFx0dmFyIGRpc3RhbmNlID0gbm9kZS5wb3NpdGlvbi5nZXREaXN0YW5jZShiLnBvc2l0aW9uKTtcblx0XHRcdGlmIChiICE9IG5vZGUpIHBvc2l0aW9uTGlzdC5wdXNoKGIucG9zaXRpb24pO1x0XHRcblx0XHR9XG5cdFx0Y29ubmVjdG9yLmNhbHVsYXRlTW92ZW1lbnQobm9kZSxwb3NpdGlvbkxpc3QsMS4wKTtcblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBTcHJpbmdDb25uZWN0b3I7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6U3ByaW5nQ29ubmVjdG9yXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2Nvbm5lY3Rvci9jb25uZWN0b3InKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzICBXYWxsQ29ubmVjdG9yIGV4dGVuZHMgQ29ubmVjdG9yXG57XG5cdGNvbnN0cnVjdG9yKGNvbm5lY3RvckRpc3BsYXksc3ByaW5nQW5jaG9yUG9pbnQsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IsbmFtZSlcblx0e1xuXHRcdC8vc3VwZXIoV2FsbENvbm5lY3Rvci5wcm90b3R5cGUucHJvY2Vzc1dhbGxTcHJpbmdSZXB1bHNlT25lTm9kZSxjb25uZWN0b3JEaXNwbGF5KTtcblx0XHRzdXBlcihXYWxsQ29ubmVjdG9yLnByb2Nlc3NXYWxsU3ByaW5nUmVwdWxzZU9uZU5vZGUsY29ubmVjdG9yRGlzcGxheSxuYW1lKTtcblxuXHRcdHRoaXMuc3ByaW5nQW5jaG9yUG9pbnQgPSBzcHJpbmdBbmNob3JQb2ludDtcblx0XHR0aGlzLmFuY2hvck9mZnNldFBvaW50ID0gYW5jaG9yT2Zmc2V0UG9pbnQ7XG5cdFx0dGhpcy5yZWxheGVkRGlzdGFuY2UgPSByZWxheGVkRGlzdGFuY2U7XG5cdFx0dGhpcy5lbGFzdGljaXR5RmFjdG9yID0gZWxhc3RpY2l0eUZhY3Rvcjtcblx0fVxuXG5cdHN0YXRpYyBwcm9jZXNzV2FsbFNwcmluZ1JlcHVsc2VPbmVOb2RlKGNvbm5lY3Rvcixub2RlLHRpbWVzdGFtcClcblx0e1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBjb25uZWN0b3IuaW5pdFByb2Nlc3NvcigpO1xuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFgoKS1ub2RlLndpZHRoLzIpPDApXG5cdFx0e1xuXHRcdFx0bm9kZS5wb3NpdGlvbi5zZXRYKDArbm9kZS53aWR0aC8yKTtcblx0XHR9XG5cdFx0aWYoKG5vZGUucG9zaXRpb24uZ2V0WCgpK25vZGUud2lkdGgvMik+bm9kZS5jYW52YXNIb2xkZXIuZ2V0V2lkdGgoKSlcblx0XHR7XG5cdFx0XHRub2RlLnBvc2l0aW9uLnNldFgobm9kZS5jYW52YXNIb2xkZXIuZ2V0V2lkdGgoKS1ub2RlLndpZHRoLzIpO1x0XG5cdFx0fVxuXHRcdGlmKChub2RlLnBvc2l0aW9uLmdldFkoKS1ub2RlLmhlaWdodC8yKTwwKVxuXHRcdHtcblx0XHRcdG5vZGUucG9zaXRpb24uc2V0WSgwK25vZGUuaGVpZ2h0LzIpO1xuXHRcdH1cblx0XHRpZigobm9kZS5wb3NpdGlvbi5nZXRZKCkrbm9kZS5oZWlnaHQvMik+bm9kZS5jYW52YXNIb2xkZXIuZ2V0SGVpZ2h0KCkpXG5cdFx0e1xuXHRcdFx0bm9kZS5wb3NpdGlvbi5zZXRZKG5vZGUuY2FudmFzSG9sZGVyLmdldEhlaWdodCgpLW5vZGUuaGVpZ2h0LzIpO1xuXHRcdH1cblx0XHRcblx0XHRjb25uZWN0b3IuY2FsdWxhdGVNb3ZlbWVudChub2RlLHBvc2l0aW9uTGlzdCwwKTtcblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBXYWxsQ29ubmVjdG9yO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOldhbGxDb25uZWN0b3JcIik7XG4vLzwvanMybm9kZT5cbiIsImNsYXNzIENvbm5lY3RvckRpc3BsYXlcbntcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXG5cdHtcblx0XHRDb25uZWN0b3JEaXNwbGF5LmNyZWF0ZUNvbm5lY3RvckRpc3BsYXkodGhpcyxkaXNwbGF5SW5mbyk7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlQ29ubmVjdG9yRGlzcGxheShjb25uZWN0b3JEaXNwbGF5LGRpc3BsYXlJbmZvKVxuXHR7XG5cdFx0Y29ubmVjdG9yRGlzcGxheS5kaXNwbGF5SW5mbyA9IGRpc3BsYXlJbmZvO1xuXHR9XG5cblx0ZHJhd0Nvbm5lY3RvcihjYW52YXNIb2xkZXIsY29ubmVjdG9yLG5vZGUpXG5cdHtcblx0fVxuXG5cdGNvbnRhaW5zUG9zdGlvbihwb3NpdGlvbixjb25uZWN0b3IpXG5cdHtcblx0XHRyZXR1cm4oZmFsc2UpO1xuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IENvbm5lY3RvckRpc3BsYXk7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q29ubmVjdG9yRGlzcGxheVwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIENvbm5lY3RvckRpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9jb25uZWN0b3JkaXNwbGF5L2Nvbm5lY3RvcmRpc3BsYXknKTtcblxuY2xhc3MgQ29ubmVjdG9yRGlzcGxheUVtcHR5IGV4dGVuZHMgQ29ubmVjdG9yRGlzcGxheVxue1xuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbykgXG5cdHtcblx0XHRzdXBlcihkaXNwbGF5SW5mbyk7XG5cdH1cblxuXHRkcmF3Q29ubmVjdG9yKGNhbnZhc0hvbGRlcixjb25uZWN0b3Isbm9kZSlcblx0e1xuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBDb25uZWN0b3JEaXNwbGF5RW1wdHk7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Q29ubmVjdG9yRGlzcGxheUVtcHR5XCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIENhbnZhc0hvbGRlcj0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXInKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIE5vZGVcbntcbiAgY29uc3RydWN0b3IobmFtZSxwb3NpdGlvbixjYW52YXNIb2xkZXIsZ3JhcGhEYXRhS2V5LGluZm9EYXRhKVxuICB7XG5cdFx0dGhpcy5uYW1lID0gbmFtZTtcblx0XHR0aGlzLmNhbnZhc0hvbGRlciA9IGNhbnZhc0hvbGRlcjtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy5ncmFwaERhdGFLZXkgPSBncmFwaERhdGFLZXk7XG5cdFx0dGhpcy5ncmFwaERhdGEgPSB0aGlzLmNhbnZhc0hvbGRlci5nZXRHcmFwaERhdGEodGhpcy5ncmFwaERhdGFLZXkpO1xuXHRcdGlmKGluZm9EYXRhPT1udWxsKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKFwiaW5mbyBkYXRhIHdhcyBudWxsIDogXCIrdGhpcy5uYW1lKTtcblx0XHRcdGluZm9EYXRhID0ge307XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRcblx0XHRcdC8vY29uc29sZS5sb2coXCJpbmZvIGRhdGEgcGFzc2VkIGluIGZvciAgOiBcIit0aGlzLm5hbWUgK1wiIGluZm9EYXRhPVwiK0NvbW1vbi50b1N0cmluZyhpbmZvRGF0YSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImluZm8gZGF0YSBwYXNzZWQgaW4gZm9yICA6IFwiK3RoaXMubmFtZSk7XG5cdFx0fVxuXHRcdHRoaXMuaW5mb0RhdGEgPSBpbmZvRGF0YTtcblx0XHRcblx0XHR0aGlzLm5vZGVzID0gbmV3IEFycmF5KCk7XG5cdFx0dGhpcy5ub2RlTWFwID0ge307XG5cdFx0dGhpcy5wb3NpdGlvbk1vdmVMaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0dGhpcy5jb25uZWN0b3JzID0gbmV3IEFycmF5KCk7XG5cdFx0dGhpcy5pc0FuaW1hdGVkID0gdHJ1ZTtcblx0XHR0aGlzLmlzU2VsZWN0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmxheWVyPTA7XG5cblx0XHRcblx0XHQvL2lmKCF0aGlzLmluZm9EYXRhLm5vZGVLZXkpXG5cdFx0aWYoIXRoaXMuaW5mb0RhdGEuaGFzT3duUHJvcGVydHkoXCJub2RlS2V5XCIpKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKFwibWFraW5nIG5ldyBub2RlS2V5IGZvciA6IFwiK3RoaXMubmFtZSk7XG5cdFx0XHR0aGlzLmluZm9EYXRhLm5vZGVLZXkgPVxuXHRcdFx0e1xuXHRcdFx0XHRcdGtleTpDb21tb24uZ2V0VGltZUtleSgpLFxuXHRcdFx0XHRcdG5vZGVJZDpcInJvb3RcIixcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5pbmZvRGF0YS5ub2RlS2V5LnBhcmVudE5vZGVLZXkgPSBmdW5jdGlvbigpe3JldHVybihcIlwiKTt9O1xuXHRcdFxuXHRcdHRoaXMuY29ubmVjdG9yUG9zaXRpb24gPSBuZXcgUG9zaXRpb24oMCwwKTtcblxuXHRcdGlmKHRoaXMuZ3JhcGhEYXRhLmluaXRHcmFwaERhdGEhPW51bGwpIHRoaXMuZ3JhcGhEYXRhLmluaXRHcmFwaERhdGEodGhpcyk7XHRcdFxuICB9XG5cbiAgXG4gIGdldENsaWVudEpzb24oKVxuICB7XG5cdCAgdmFyIGpzb24gPSB0aGlzLmdldE5vZGVKc29uKHt9KTtcblx0ICBcblx0ICBqc29uLm5vZGVUcmVlID0gdGhpcy5nZXRDbGllbnRKc29uTm9kZVRyZWUoKTtcblx0ICBcblx0ICBqc29uLm5vZGVNYXAgPSB7fTtcblx0ICB2YXIgYWxsTm9kZXNBcnJheSA9IHRoaXMuZ2V0QWxsTm9kZXNBcnJheShuZXcgQXJyYXkoKSk7XG5cdCAgZm9yKHZhciBpPTA7aTxhbGxOb2Rlc0FycmF5Lmxlbmd0aDtpKyspXG5cdCAge1xuXHRcdCAgdmFyIG5vZGUgPSBhbGxOb2Rlc0FycmF5W2ldO1xuXHRcdCAganNvbi5ub2RlTWFwW25vZGUuZ2V0Tm9kZUtleSgpXSA9IG5vZGUuZ2V0Tm9kZUpzb24oe30pO1xuXHQgIH1cblx0ICBcblx0ICBqc29uLmNvbm5lY3Rvck1hcCA9IHt9O1xuXHQgIHZhciBhbGxDb25uZWN0b3JzQXJyYXkgPSB0aGlzLmdldEFsbENvbm5lY3RvcnNBcnJheShuZXcgQXJyYXkoKSk7XHQgIFxuXHQgIGZvcih2YXIgaT0wO2k8YWxsQ29ubmVjdG9yc0FycmF5Lmxlbmd0aDtpKyspXG5cdCAge1xuXHRcdCAgdmFyIGNvbm5lY3RvciA9IGFsbENvbm5lY3RvcnNBcnJheVtpXTtcblx0XHQgIGpzb24uY29ubmVjdG9yTWFwW2Nvbm5lY3Rvci5nZXRDb25uZWN0b3JLZXkoKV0gPSBjb25uZWN0b3IuZ2V0Q2xpZW50SnNvbih7fSk7XG5cdCAgfVxuXG5cdCAgSlNPTi5zdHJpbmdpZnkoanNvbik7XG5cdCAgcmV0dXJuKGpzb24pXG4gIH1cbiAgXG4gIGdldE5vZGVKc29uKGpzb24pXG4gIHtcblx0ICBqc29uLm5hbWUgPSB0aGlzLm5hbWU7XG5cdCAganNvbi5ncmFwaERhdGFLZXkgPSB0aGlzLmdyYXBoRGF0YUtleTtcblx0ICBqc29uLmluZm9EYXRhID0gdGhpcy5pbmZvRGF0YTtcblx0ICAvL2pzb24uaW5mb0RhdGEubm9kZUtleSA9IHRoaXMuZ2V0Tm9kZUtleSgpO1xuXHQgIGpzb24ucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uLmdldENsaWVudEpzb24oKTtcblx0ICBqc29uLmNvbm5lY3RvcnMgPSBuZXcgQXJyYXkoKTtcblx0ICBmb3IodmFyIGk9MDtpPHRoaXMuY29ubmVjdG9ycy5sZW5ndGg7aSsrKSBqc29uLmNvbm5lY3RvcnMucHVzaCh0aGlzLmNvbm5lY3RvcnNbaV0uZ2V0Q29ubmVjdG9yS2V5KCkpO1xuXG5cdCAgcmV0dXJuKGpzb24pO1xuICB9XG4gIFxuICBnZXRBbGxOb2Rlc0FycmF5KGFycmF5T2ZOb2RlcylcbiAge1xuXHQgIGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxuXHQgIHtcblx0XHQgIHZhciBub2RlID0gdGhpcy5ub2Rlc1tpXTtcblx0XHQgIGFycmF5T2ZOb2Rlcy5wdXNoKG5vZGUpO1xuXHRcdCAgbm9kZS5nZXRBbGxOb2Rlc0FycmF5KGFycmF5T2ZOb2Rlcyk7XG5cdCAgfVxuXHQgIHJldHVybihhcnJheU9mTm9kZXMpO1xuICB9XG4gIFxuICBnZXRBbGxDb25uZWN0b3JzQXJyYXkoYXJyYXlPZkNvbm5lY3RvcnMpXG4gIHtcblx0ICBmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGVuZ3RoO2krKylcblx0ICB7XG5cdFx0ICB2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XG5cdFx0ICBmb3IodmFyIGo9MDtqPG5vZGUuY29ubmVjdG9ycy5sZW5ndGg7aisrKVxuXHRcdCAge1xuXHRcdFx0ICB2YXIgY29ubmVjdG9yID0gbm9kZS5jb25uZWN0b3JzW2pdO1xuXHRcdFx0ICBhcnJheU9mQ29ubmVjdG9ycy5wdXNoKGNvbm5lY3Rvcik7XG5cdFx0ICB9XG5cdFx0ICBub2RlLmdldEFsbENvbm5lY3RvcnNBcnJheShhcnJheU9mQ29ubmVjdG9ycyk7XG5cdCAgfVxuXHQgIHJldHVybihhcnJheU9mQ29ubmVjdG9ycyk7XG4gIH1cbiAgXG4gICAgXG4gIGdldENsaWVudEpzb25Ob2RlVHJlZSgpXG4gIHtcblx0ICB2YXIganNvbiA9IHt9O1xuXHQgIGpzb24ubm9kZUtleSA9IHRoaXMuZ2V0Tm9kZUtleSgpO1xuXG5cdCAganNvbi5ub2RlcyA9IG5ldyBBcnJheSgpO1xuXHQgIGZvcih2YXIgaT0wO2k8dGhpcy5ub2Rlcy5sZW5ndGg7aSsrKVxuXHQgIHtcblx0XHQgIGpzb24ubm9kZXMucHVzaCh0aGlzLm5vZGVzW2ldLmdldENsaWVudEpzb25Ob2RlVHJlZSgpKTtcdCAgXG5cdCAgfVxuXHQgIEpTT04uc3RyaW5naWZ5KGpzb24pO1xuXHQgIHJldHVybihqc29uKVxuICB9XG4gIFxuICBcbiAgZHJhd0NhbnZhcyh0aW1lc3RhbXApXG4gIHtcbiAgXHR0aGlzLnNldEFuaW1hdGlvblRpbWVzKCk7XG5cbiAgXHR0aGlzLmNsZWFyQ2FudmFzKCk7XG4gIFx0XG4gICAgICBmb3IodmFyIGk9MDtpPHRoaXMubm9kZXMubGVuZ3RoO2krKylcbiAgICAgIHtcbiAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XG4gICAgICAgICAgaWYodGhpcy5pc0FuaW1hdGVkKSBub2RlLmFuaW1hdGVDYWxjdWxhdGUodGltZXN0YW1wKTtcbiAgICAgIH1cblxuICAgICAgZm9yKHZhciBpPTA7aTx0aGlzLm5vZGVzLmxlbmd0aDtpKyspXG4gICAgICB7XG4gICAgICBcdHZhciBub2RlID0gdGhpcy5ub2Rlc1tpXTtcbiAgICAgIFx0aWYodGhpcy5pc0FuaW1hdGVkKSAgbm9kZS5hbmltYXRlRmluYWxpemUodGltZXN0YW1wKTtcbiAgICAgIFx0bm9kZS5kcmF3Q2FudmFzKHRpbWVzdGFtcCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKHRoaXMuY2FudmFzSG9sZGVyLmlzRHJhd2FibGUoKSlcbiAgICAgIHtcbiAgICBcdCAgdGhpcy5kcmF3Q29ubmVjdG9ycygpOyBcbiAgICBcdCAgdGhpcy5kcmF3Tm9kZXMoKTtcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuZXh0cmFBbmltYXRpb24hPW51bGwpIHRoaXMuZXh0cmFBbmltYXRpb24odGltZXN0YW1wKTtcbiAgICAgIFxuICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICB0aGlzLmRlYnVnRnVuY3Rpb24oKTtcbiAgfVxuXG5cblx0Z2V0Tm9kZVVpRGlzcGxheShub2RlKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMubmFtZSk7XG5cdH1cblx0XG5cdGdldE5vZGVLZXkoKVxuXHR7XG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiTm9kZTpnZXROb2RlS2V5OlNUQVJUOm5hbWU9XCIrdGhpcy5uYW1lKTtcbiAgIFx0ICAgIC8vY29uc29sZS5sb2coXCJOb2RlOmdldE5vZGVLZXk6U1RBUlQ6aW5mb0RhdGE9XCIrQ29tbW9uLnRvU3RyaW5nKHRoaXMuaW5mb0RhdGEpKTtcblxuXHRcdC8vaWYoIXRoaXMubm9kZUtleSkgY29uc29sZS5sb2coXCJYWFhYWFhYWFhYWDpcIit0aGlzLm5hbWUpO1xuICAgXHQgICAgLy92YXIga2V5ID0gdGhpcy5ub2RlS2V5LnBhcmVudE5vZGVLZXkoKStcIjpcIit0aGlzLm5vZGVLZXkubm9kZUlkK1wiOlwiK3RoaXMubm9kZUtleS50cy5nZXRUaW1lKCk7XG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiLi4uLi5nZXROb2RlS2V5OkVORDpuYW1lPVwiK3RoaXMubmFtZSk7XG4gICBcdCAgICB2YXIga2V5ID0gdGhpcy5pbmZvRGF0YS5ub2RlS2V5LnBhcmVudE5vZGVLZXkoKStcIjpcIit0aGlzLmluZm9EYXRhLm5vZGVLZXkubm9kZUlkK1wiX1wiK3RoaXMuaW5mb0RhdGEubm9kZUtleS5rZXk7XG5cdFx0cmV0dXJuKGtleSk7XG5cdFx0XG5cdH1cblx0Lypcblx0ICogXHRcdHRoaXMubm9kZUtleSA9IFxuXHRcdFx0e1xuXHRcdFx0XHR0czpuZXcgRGF0ZSgpLFxuXHRcdFx0XHRwYXJlbnROb2RlS2V5OmZ1bmN0aW9uKCl7cmV0dXJuKFwicm9vdFwiKTt9LFxuXHRcdFx0XHRub2RlSWQ6LTEsXG5cdFx0XHR9XG5cdCAqL1xuXHRcblx0ZG9lc05vZGVFeGlzdChub2RlS2V5KVxuXHR7XG5cdFx0cmV0dXJuKCB0aGlzLm5vZGVNYXAuaGFzT3duUHJvcGVydHkobm9kZUtleSkgKTtcblx0fVxuXHRcblx0Z2V0Tm9kZShub2RlS2V5KVxuXHR7XG5cdFx0aWYoIXRoaXMuZG9lc05vZGVFeGlzdChub2RlS2V5KSlcblx0XHR7XG5cdFx0XHRPYmplY3Qua2V5cyh0aGlzLm5vZGVNYXApLmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImtleT1cIitrZXkpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR0aHJvdyBcIm5vZGVLZXkgZG9lcyBub3QgZXhpc3QgOiAnXCIrbm9kZUtleStcIidcIjtcblx0XHR9XG5cdFx0cmV0dXJuKHRoaXMubm9kZU1hcFtub2RlS2V5XSk7XG5cdH1cblx0XG5cdGdldE5vZGVMaXN0RnJvbU1hcCgpXG5cdHtcblx0XHR2YXIgbm9kZUxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHRPYmplY3Qua2V5cyh0aGlzLm5vZGVNYXApLmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHR7XG5cdFx0XHRub2RlTGlzdC5wdXNoKG5vZGVNYXBba2V5XSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuKG5vZGVMaXN0KTtcblx0fVxuXHRcblx0YWRkTm9kZShub2RlKVxuXHR7XG5cdFx0dGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xuICAgXHQgICAgLy9jb25zb2xlLmxvZyhcIk5vZGU6YWRkTm9kZTpwYXJlbnQubmFtZT1cIit0aGlzLm5hbWUrIFwiIHRvQWRkLm5hbWU9XCIrbm9kZS5uYW1lKTtcbiAgIFx0ICAgIC8vY29uc29sZS5sb2coXCIuLi4uLmFkZE5vZGU6cGFyZW50Lm5hbWU9XCIrdGhpcy5uYW1lKyBcIiBnZXROb2RlS2V5KCk9XCIrdGhpcy5nZXROb2RlS2V5KCkpO1xuXHRcdFxuXHRcdGlmKG5vZGUuaW5mb0RhdGEubm9kZUtleS5ub2RlSWQ9PVwicm9vdFwiKSBub2RlLmluZm9EYXRhLm5vZGVLZXkubm9kZUlkID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdG5vZGUuaW5mb0RhdGEubm9kZUtleS5wYXJlbnROb2RlS2V5ID0gZnVuY3Rpb24oKXsgcmV0dXJuKHNlbGYuZ2V0Tm9kZUtleSgpKTsgfTtcblx0XHRcblx0XHQvL2NvbnNvbGUubG9nKENvbW1vbi50b1N0cmluZyh0aGlzLmNhbnZhc0hvbGRlcikpO1xuXG5cdFx0bm9kZS5jYW52YXNIb2xkZXIgPSB0aGlzLmNhbnZhc0hvbGRlci5jbG9uZShub2RlLnBvc2l0aW9uKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiYWRkTm9kZSBub2RlLmNhbnZhc0hvbGRlcjpcIitDb21tb250b1N0cmluZyhub2RlLmNhbnZhc0hvbGRlcikpO1xuXHRcdHRoaXMubm9kZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdCAgXHQgIHJldHVybihhLmxheWVyLWIubGF5ZXIpO1xuXHQgIFx0fSk7XHRcblx0XHRcblx0XHR0aGlzLm5vZGVNYXBbbm9kZS5nZXROb2RlS2V5KCldID0gbm9kZTtcbiAgIFx0ICAgIC8vY29uc29sZS5sb2coXCIuLi4uLmFkZE5vZGU6QURERUQ6cGFyZW50Lm5hbWU9XCIrdGhpcy5uYW1lKyBcIiBhZGRlZC5uYW1lPVwiK25vZGUubmFtZSk7XG4gICBcdCAgICAvL2NvbnNvbGUubG9nKFwiLi4uLi5hZGROb2RlOkFEREVEOnBhcmVudC5uYW1lPVwiK3RoaXMubmFtZSsgXCIgZ2V0Tm9kZUtleSgpPVwiK3RoaXMuZ2V0Tm9kZUtleSgpKTtcblxuXHR9XG5cdFxuXHRyZW1vdmVOb2RlKG5vZGUpXG5cdHtcblx0XHRDb21tb24ucmVtb3ZlSXRlbUZyb21BcnJheSh0aGlzLm5vZGVzLG5vZGUpO1xuXHRcdGRlbGV0ZSB0aGlzLm5vZGVNYXBbbm9kZS5nZXROb2RlS2V5KCldO1xuXG5cdH1cblx0XG5cdGNsZWFyQ2FudmFzKHRpbWVzdGFtcClcblx0e1xuXHR9XG5cdFxuXHRkcmF3KClcblx0e1xuXHR9XG5cdFxuXHRcblx0ZHJhd0Nvbm5lY3RvcnModGltZXN0YW1wKVxuXHR7XG5cdFx0aWYodGhpcy5pc1Zpc2FibGUpIFxuXHRcdHtcblx0XHQgICAgZm9yKHZhciBpPTA7aTx0aGlzLm5vZGVzLmxlbmd0aDtpKyspXG5cdFx0ICAgIHtcblx0XHQgICAgXHR2YXIgbm9kZSA9IHRoaXMubm9kZXNbaV07XG5cdFx0ICAgIFx0Zm9yKHZhciBqPTA7ajxub2RlLmNvbm5lY3RvcnMubGVuZ3RoO2orKylcblx0XHQgICAgXHR7XG5cdFx0ICAgIFx0XHR2YXIgY29ubmVjdG9yID0gbm9kZS5jb25uZWN0b3JzW2pdO1xuXHRcdCAgICBcdFx0Y29ubmVjdG9yLmNvbm5lY3RvckRpc3BsYXkuZHJhd0Nvbm5lY3Rvcih0aGlzLmNhbnZhc0hvbGRlcixjb25uZWN0b3Isbm9kZSk7XG5cdFx0ICAgICAgICB9XG5cdFx0ICAgIH1cblx0XHR9XG5cdH1cblx0XG5cdGRyYXdOb2Rlcyh0aW1lc3RhbXApXG5cdHtcblx0XHRpZih0aGlzLmlzVmlzYWJsZSkgXG5cdFx0e1xuXHRcdCAgIFx0Zm9yKHZhciBpPTA7aTx0aGlzLm5vZGVzLmxlbmd0aDtpKyspXG5cdFx0ICAgXHR7XG5cdFx0ICAgXHRcdHZhciBub2RlID0gdGhpcy5ub2Rlc1tpXTsgXG5cdFx0ICAgXHRcdGlmKHRoaXMuaXNWaXNhYmxlKSBub2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kcmF3Tm9kZSh0aGlzLmNhbnZhc0hvbGRlcixub2RlKTtcblx0XHQgICBcdH1cblx0XHR9XG5cdH1cblx0XG5cdHNldEFuaW1hdGlvblRpbWVzKHRpbWVzdGFtcClcblx0e1xuXHR9XG5cdFxuXHRkZWJ1Z0Z1bmN0aW9uKClcblx0e1xuXHR9XG5cdFxuXHRnZXROb2RlQ29udGFpbmluZ1Bvc2l0aW9uKHBvc2l0aW9uKVxuXHR7XG5cdFx0dmFyIGZvdW5kTm9kZSA9IG51bGw7XG5cdFxuXHQgICAgZm9yICh2YXIgaT10aGlzLm5vZGVzLmxlbmd0aC0xO2k+PTA7aS0tKVxuXHQgICAge1xuXHQgICAgICAgIHZhciBub2RlID0gdGhpcy5ub2Rlc1tpXTtcblx0ICAgICAgICBpZihub2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5jb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpKVxuXHQgICAgICAgIHtcblx0ICAgICAgICBcdGZvdW5kTm9kZSA9IG5vZGU7XG5cdCAgICAgICAgXHRicmVhaztcblx0ICAgICAgICB9XG5cdCAgICB9XG5cdCAgICByZXR1cm4oZm91bmROb2RlKTtcblx0fVxuXHRcblx0XG5cdFxuXHRhbmltYXRlQ2FsY3VsYXRlKHRpbWVzdGFtcClcblx0e1xuXHRcdGlmKHRoaXMuaXNBbmltYXRlZClcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29ubmVjdG9ycy5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIGNvbm5lY3RvciA9IHRoaXMuY29ubmVjdG9yc1tpXTtcblx0XHRcdFx0Y29ubmVjdG9yLmV4ZWN1dGVDb25uZWN0b3JGdW5jdGlvbih0aW1lc3RhbXAsdGhpcylcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdGFuaW1hdGVGaW5hbGl6ZSh0aW1lc3RhbXApXG5cdHtcblx0XHQvL2lmKHRoaXMuaXNBbmltYXRlZClcblx0XHR7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29ubmVjdG9ycy5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5zZXROZXdQb3NpdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5wb3NpdGlvbk1vdmVMaXN0Lmxlbmd0aCA9IDA7XG5cdFxuXHRcdH1cblx0fVxuXHRcblx0Y29udGFpbnNQb3N0aW9uKHBvc2l0aW9uKVxuXHR7XG5cdFx0cmV0dXJuKFxuXHRcdFx0XHQoXG5cdFx0XHRcdFx0XHQodGhpcy5wb3NpdGlvbi5nZXRYKCktdGhpcy53aWR0aC8yKTw9cG9zaXRpb24uZ2V0WCgpICYmXG5cdFx0XHRcdFx0XHQodGhpcy5wb3NpdGlvbi5nZXRYKCkrdGhpcy53aWR0aC8yKT49cG9zaXRpb24uZ2V0WCgpICYmXG5cdFx0XHRcdFx0XHQodGhpcy5wb3NpdGlvbi5nZXRZKCktdGhpcy5oZWlnaHQvMik8PXBvc2l0aW9uLmdldFkoKSAmJlxuXHRcdFx0XHRcdFx0KHRoaXMucG9zaXRpb24uZ2V0WSgpK3RoaXMuaGVpZ2h0LzIpPj1wb3NpdGlvbi5nZXRZKClcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0fVxuXHRcblx0c2V0TmV3UG9zaXRpb24oKVxuXHR7XG5cdFx0aWYodGhpcy5wb3NpdGlvbk1vdmVMaXN0Lmxlbmd0aD09MCkgIHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5wdXNoKHRoaXMucG9zaXRpb24pO1x0XG5cdFx0dmFyIG5ld1Bvc2l0aW9uID0gbmV3IFBvc2l0aW9uKDAsMCk7XG5cdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvc2l0aW9uTW92ZUxpc3QubGVuZ3RoOyBpKyspXG5cdCAgICB7XG5cdCAgICAgICAgdmFyIG9uZVBvc2l0aW9uID0gIHRoaXMucG9zaXRpb25Nb3ZlTGlzdFtpXTtcblx0ICAgICAgICBuZXdQb3NpdGlvbi5zZXRYKG5ld1Bvc2l0aW9uLmdldFgoKStvbmVQb3NpdGlvbi5nZXRYKCkpO1xuXHQgICAgICAgIG5ld1Bvc2l0aW9uLnNldFkobmV3UG9zaXRpb24uZ2V0WSgpK29uZVBvc2l0aW9uLmdldFkoKSk7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciBuZXdYID0gbmV3UG9zaXRpb24uZ2V0WCgpIC8gdGhpcy5wb3NpdGlvbk1vdmVMaXN0Lmxlbmd0aDtcblx0XHR2YXIgbmV3WSA9IG5ld1Bvc2l0aW9uLmdldFkoKSAvIHRoaXMucG9zaXRpb25Nb3ZlTGlzdC5sZW5ndGg7XG5cdFx0XG5cdFx0dGhpcy5wb3NpdGlvbi5zZXRYKG5ld1gpO1xuXHRcdHRoaXMucG9zaXRpb24uc2V0WShuZXdZKTtcdFx0XG5cdH1cblxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBOb2RlO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOk5vZGVcIik7XG4vLzwvanMybm9kZT5cbiIsImNsYXNzIENhbnZhc0RlZlxue1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcdFx0XG5cdH1cblx0XG5cdGdldFdvcmxkRGlzcGFseSgpXG5cdHtcblx0XHR0aHJvdyBcIkNhbnZhc0RlZi5nZXRXb3JsZERpc3BhbHkgbm90IGRlZmluZWRcIjtcblx0fVxuXHRcblx0Z2V0V29ybGREZWZhdWx0cygpXG5cdHtcblx0XHR0aHJvdyBcIkNhbnZhc0RlZi5nZXRXb3JsZERlZmF1bHRzIG5vdCBkZWZpbmVkXCI7XG5cdH1cbn1cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRGVmO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkNhbnZhc0RlZlwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIENhbnZhc0hvbGRlclxue1xuXHRjb25zdHJ1Y3RvcihjYW52YXNOYW1lLHdvcmxkRGVmKVxuXHR7XG5cdFx0dGhpcy5jYW52YXNOYW1lID0gY2FudmFzTmFtZTtcblx0XHR0aGlzLndvcmxkRGVmID0gd29ybGREZWY7XHRcdFxuXHRcdHRoaXMub3JpZ2luID0gbmV3IFBvc2l0aW9uKDAsMCk7XG5cdFx0dGhpcy5pbml0KGNhbnZhc05hbWUsd29ybGREZWYpO1xuXHR9XG5cdFxuXHRpbml0KGNhbnZhc05hbWUsd29ybGREZWYpXG5cdHtcblx0XHR0aGlzLmlzQ2FudmFzVmlzYWJsZSA9IHRydWU7XG5cdFx0dGhpcy5pc0NhbnZhc0RyYXdhYmxlID0gdHJ1ZTtcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY2FudmFzTmFtZSk7XHRcdFx0XG5cdFx0dGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHQvKmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKVxuXHRcdHtcblx0XHRcdHRoaXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jYW52YXNOYW1lKTtcdFx0XHRcblx0XHRcdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0fSovXG5cdH1cblx0XG5cdHN0YXRpYyBjcmVhdGVDYW52YXNIb2xkZXJGcm9tQ2xpZW50SnNvbih3b3JsZERlZixqc29uKVxuXHR7XG5cdCAgdmFyIGNhbnZhc0hvbGRlciA9IG5ldyBDYW52YXNIb2xkZXIoanNvbi5jYW5hdnNOYW1lLHdvcmxkRGVmKTtcblx0ICByZXR1cm4oY2FudmFzSG9sZGVyKTtcblx0fVxuXHQgIGdldENsaWVudEpzb24oKVxuXHQgIHtcblx0XHQgIHZhciBqc29uID0ge307XG5cdFx0ICBcblx0XHQgIFxuXHRcdCAganNvbi5jYW52YXNOYW1lID0gdGhpcy5jYW52YXNOYW1lO1xuXHRcdCAganNvbi5vcmlnaW4gPSB0aGlzLm9yaWdpbjtcblx0XHQgIGpzb24ud2lkdGggPSB0aGlzLmdldFdpZHRoKCk7XG5cdFx0ICBqc29uLmhlaWdodCA9IHRoaXMuZ2V0SGVpZ2h0KCk7XG5cdFx0ICBqc29uLndvcmxkRGVmID0gdGhpcy53b3JsZERlZjtcblx0XHQgIFxuXHRcdCAgSlNPTi5zdHJpbmdpZnkoanNvbik7XG5cdFx0ICByZXR1cm4oanNvbilcblx0ICB9XG5cdFxuXHRnZXRDb25uZWN0b3IoY29ubmVjdG9yRGVmS2V5LG5hbWUpXG5cdHtcblx0XHR2YXIgY29ubmVjdG9yID0gdGhpcy5nZXRDb25uZWN0b3JEZWYoY29ubmVjdG9yRGVmS2V5KSh0aGlzLndvcmxkRGVmLG5hbWUpO1xuXHRcdGNvbm5lY3Rvci5jb25uZWN0b3JEZWZLZXkgPSBjb25uZWN0b3JEZWZLZXk7XG5cdFx0cmV0dXJuKGNvbm5lY3Rvcik7XG5cdH1cblx0XG5cdGdldENvbm5lY3RvckRlZihjb25uZWN0b3JEZWZLZXkpXG5cdHtcblx0XHR2YXIgY29ubmVjdG9yRGVmID0gdGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkuY29ubmVjdG9yRGVmc1tcImdlbmVyaWNcIl07XG5cdFx0XG5cdFx0dmFyIGZvdW5kQ29ubmVjdG9yRGVmID0gZmFsc2U7XG5cdFx0aWYodGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkuY29ubmVjdG9yRGVmcy5oYXNPd25Qcm9wZXJ0eShjb25uZWN0b3JEZWZLZXkpKVxuXHRcdHtcblx0XHRcdGNvbm5lY3RvckRlZiA9IHRoaXMud29ybGREZWYud29ybGREaXNwbGF5LmNvbm5lY3RvckRlZnNbY29ubmVjdG9yRGVmS2V5XTtcblx0XHRcdGZvdW5kQ29ubmVjdG9yRGVmID0gdHJ1ZTtcblx0XHR9XG5cdFx0aWYoIWZvdW5kQ29ubmVjdG9yRGVmKSBjb25zb2xlLnRyYWNlKFwiQ2FudmFzSG9sZGVyOmdldENvbm5lY3RvckRlZjpjb25uZWN0b3JEZWZLZXk9XFxcIlwiK2Nvbm5lY3RvckRlZktleSsgXCJcXFwiIHdhcyBub3QgZm91bmQgdXNpbmcgZ2VuZXJpY1wiKTtcblx0XHRjb25uZWN0b3JEZWYuY29ubmVjdG9yRGVmS2V5ID0gY29ubmVjdG9yRGVmS2V5O1xuXHRcdHJldHVybihjb25uZWN0b3JEZWYpO1xuXHR9XG5cdFxuXHRnZXRDb25uZWN0b3JEaXNwbGF5KGNvbm5lY3RvckRpc3BsYXlLZXkpXG5cdHtcblx0XHR2YXIgY29ubmVjdG9yRGlzcGxheSA9IHRoaXMud29ybGREZWYud29ybGREaXNwbGF5LmNvbm5lY3RvckRpc3BsYXlbXCJnZW5lcmljXCJdO1xuXHRcdFxuXHRcdHZhciBmb3VuZENvbm5lY3RvckRpc3BsYXkgPSBmYWxzZTtcblx0XHRpZih0aGlzLndvcmxkRGVmLndvcmxkRGlzcGxheS5jb25uZWN0b3JEaXNwbGF5Lmhhc093blByb3BlcnR5KGNvbm5lY3RvckRpc3BsYXlLZXkpKVxuXHRcdHtcblx0XHRcdGNvbm5lY3RvckRpc3BsYXkgPSB0aGlzLndvcmxkRGVmLndvcmxkRGlzcGxheS5jb25uZWN0b3JEaXNwbGF5W2Nvbm5lY3RvckRpc3BsYXlLZXldO1xuXHRcdFx0Zm91bmRDb25uZWN0b3JEaXNwbGF5ID0gdHJ1ZTtcblx0XHR9XG5cdFx0aWYoIWZvdW5kQ29ubmVjdG9yRGlzcGxheSkgY29uc29sZS50cmFjZShcIkNhbnZhc0hvbGRlcjpnZXRDb25uZWN0b3JEaXNwbGF5OmNvbm5lY3RvckRpc3BsYXlLZXk9XFxcIlwiK2Nvbm5lY3RvckRpc3BsYXlLZXkrIFwiXFxcIiB3YXMgbm90IGZvdW5kIHVzaW5nIGdlbmVyaWNcIik7XG5cdFx0Y29ubmVjdG9yRGlzcGxheS5jb25uZWN0b3JEaXNwbGF5S2V5ID0gY29ubmVjdG9yRGlzcGxheUtleTtcblx0XHRyZXR1cm4oY29ubmVjdG9yRGlzcGxheSk7XG5cdH1cblx0XG5cdGdldEdyYXBoRGF0YShncmFwaERhdGFLZXkpXG5cdHtcblx0XHR2YXIgZ3JhcGhEYXRhID0gdGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkubm9kZURpc3BsYXlbXCJnZW5lcmljXCJdO1x0XG5cdFx0dmFyIGZvdW5kR3JhcGhEYXRhID0gZmFsc2U7XG5cdFx0aWYodGhpcy53b3JsZERlZi53b3JsZERpc3BsYXkubm9kZURpc3BsYXkuaGFzT3duUHJvcGVydHkoZ3JhcGhEYXRhS2V5KSlcblx0XHR7XG5cdFx0XHRncmFwaERhdGEgPSB0aGlzLndvcmxkRGVmLndvcmxkRGlzcGxheS5ub2RlRGlzcGxheVtncmFwaERhdGFLZXldO1xuXHRcdFx0Zm91bmRHcmFwaERhdGEgPSB0cnVlO1xuXHRcdH1cblx0XHRpZighZm91bmRHcmFwaERhdGEpIGNvbnNvbGUudHJhY2UoXCJDYW52YXNIb2xkZXI6Z2V0R3JhcGhEYXRhOmdyYXBoRGF0YUtleT1cXFwiXCIrZ3JhcGhEYXRhS2V5KyBcIlxcXCIgd2FzIG5vdCBmb3VuZCB1c2luZyBnZW5lcmljXCIpXG5cdFx0Ly9jb25zb2xlLnRyYWNlKFwiQ2FudmFzSG9sZGVyOmdldEdyYXBoRGF0YTpncmFwaERhdGFLZXk9XFxcIlwiK2dyYXBoRGF0YUtleSsgXCJcXFwiIHdhcyBub3QgZm91bmQgdXNpbmcgZ2VuZXJpY1wiKVxuXHRcdC8vY29uc29sZS5sb2coXCJGT1I6XCIrZ3JhcGhEYXRhS2V5K0NvbW1vbi50b1N0cmluZyhncmFwaERhdGEpKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0R3JhcGhEYXRhOmdyYXBoRGF0YUtleT1cIitncmFwaERhdGFLZXkrXCI6Y2xvbmU9XCIrZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLmNsb25lKTtcblxuXHRcdC8vaWYoZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLmNsb25lKVxuXHRcdGlmKGdyYXBoRGF0YS5ub2RlRGlzcGxheUZ1bmN0aW9uKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coXCJnZXRHcmFwaERhdGE6Z3JhcGhEYXRhS2V5OkZPVU5EIEEgRlVOQ1RJT046XCIrZ3JhcGhEYXRhS2V5KTtcblx0XHRcdGdyYXBoRGF0YSA9IE9iamVjdC5jcmVhdGUoZ3JhcGhEYXRhKTtcblx0XHRcdGdyYXBoRGF0YS5ub2RlRGlzcGxheSA9IGdyYXBoRGF0YS5ub2RlRGlzcGxheUZ1bmN0aW9uKCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiQ0xPTklORzpcIitncmFwaERhdGFLZXkrQ29tbW9uLnRvU3RyaW5nKGdyYXBoRGF0YSkpO1xuXHRcdFx0Ly9ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8gPSBPYmplY3QuY3JlYXRlKGdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mbyk7XG5cdFx0XHQvL2dyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mbyAgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mbykpO1xuXHRcdFx0Ly9ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8gID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8pKTtcblx0XHRcdC8vZ3JhcGhEYXRhID0gT2JqZWN0LmNyZWF0ZShncmFwaERhdGEpO1xuXHRcdFx0Ly9ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8udHMgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuXG5cdFx0fVxuXG5cdFx0Z3JhcGhEYXRhLmdyYXBoRGF0YUtleSA9IGdyYXBoRGF0YUtleTtcblx0XHRyZXR1cm4oZ3JhcGhEYXRhKTtcblx0fVxuXHRcblx0Y2xvbmUob3JpZ2luKVxuXHR7XG5cdFx0dmFyIGNhbnZhc0hvbGRlciA9IG5ldyBDYW52YXNIb2xkZXIodGhpcy5jYW52YXNOYW1lLHRoaXMud29ybGREZWYpO1xuXHRcdGNhbnZhc0hvbGRlci5vcmlnaW4gPSBvcmlnaW47XG5cdFx0Lypcblx0XHR2YXIgY2FudmFzSG9sZGVyID0gbmV3IE9iamVjdCgpO1xuXHRcdGNhbnZhc0hvbGRlci5vcmlnaW4gPSBvcmlnaW47XG5cdFx0XG5cdFx0Y2FudmFzSG9sZGVyLmNhbnZhc05hbWUgPSB0aGlzLmNhbnZhc05hbWU7XG5cdFx0Y2FudmFzSG9sZGVyLmNhbnZhcyA9IHRoaXMuY2FudmFzO1xuXHRcdGNhbnZhc0hvbGRlci5jb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuXHRcdGNhbnZhc0hvbGRlci5pc0NhbnZhc1Zpc2FibGUgPSB0aGlzLmlzQ2FudmFzVmlzYWJsZTtcblx0XHRjYW52YXNIb2xkZXIuaXNDYW52YXNEcmF3YWJsZSA9IHRoaXMuaXNDYW52YXNEcmF3YWJsZTtcblx0XHRjYW52YXNIb2xkZXIuaXNEcmF3YWJsZSA9IHRoaXMuaXNEcmF3YWJsZTtcblx0XHRjYW52YXNIb2xkZXIuaXNWaXNhYmxlID0gdGhpcy5pc1Zpc2FibGU7XG5cdFx0Y2FudmFzSG9sZGVyLmdldFdpZHRoID0gdGhpcy5nZXRXaWR0aDtcblx0XHRjYW52YXNIb2xkZXIuZ2V0SGVpZ2h0ID0gdGhpcy5nZXRIZWlnaHQ7XG5cdFx0Y2FudmFzSG9sZGVyLndvcmxkRGVmID0gdGhpcy53b3JsZERlZjtcblx0XHRjYW52YXNIb2xkZXIuZ2V0R3JhcGhEYXRhID0gdGhpcy5nZXRHcmFwaERhdGE7XG5cdFx0Ki9cblx0XHRcblx0XHRyZXR1cm4oY2FudmFzSG9sZGVyKTtcblx0fVxuXHRcblx0aXNEcmF3YWJsZSgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5pc0NhbnZhc0RyYXdhYmxlKTtcblx0fVxuXHRcblx0aXNWaXNhYmxlKClcblx0e1xuXHRcdHJldHVybih0aGlzLmlzQ2FudmFzVmlzYWJsZSk7XG5cdH1cblx0XG5cdGdldFdpZHRoKClcblx0e1xuXHRcdHJldHVybih0aGlzLmNhbnZhcy53aWR0aCk7XG5cdH1cblx0XG5cdGdldEhlaWdodCgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5jYW52YXMuaGVpZ2h0KTtcblx0fVxufVxuXG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0hvbGRlcjtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpDYW52YXNIb2xkZXJcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBDYW52YXNIb2xkZXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcicpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcblxuXG5jbGFzcyBDYW52YXNIb2xkZXJWaXJ0dWFsIGV4dGVuZHMgQ2FudmFzSG9sZGVyXG57XG5cdGNvbnN0cnVjdG9yKGNhbnZhc05hbWUsd29ybGREZWYsd2lkdGgsaGVpZ2h0LG9yaWdpbilcblx0e1xuXHRcdHN1cGVyKGNhbnZhc05hbWUsd29ybGREZWYpO1xuXHRcdHRoaXMud2lkdGggPSB3aWR0aDtcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodDtcblx0fVxuXHRcblx0aW5pdChjYW52YXNOYW1lLHdvcmxkRGVmKVxuXHR7XG5cdFx0dGhpcy5jYW52YXMgPSBudWxsO1xuXHRcdHRoaXMuY29udGV4dCA9IG51bGw7XG5cdFx0dGhpcy5pc0NhbnZhc1Zpc2FibGUgPSBmYWxzZTtcblx0XHR0aGlzLmlzQ2FudmFzRHJhd2FibGUgPSBmYWxzZTtcblx0fVxuXG5cdGNsb25lKG9yaWdpbilcblx0e1xuXHRcdHZhciBjYW52YXNIb2xkZXIgPSBuZXcgQ2FudmFzSG9sZGVyVmlydHVhbCh0aGlzLmNhbnZhc05hbWUsdGhpcy53b3JsZERlZix0aGlzLndpZHRoLHRoaXMuaGVpZ2h0LG9yaWdpbik7XG5cdFx0cmV0dXJuKGNhbnZhc0hvbGRlcik7XG5cdH1cblxuXHRnZXRXaWR0aCgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy53aWR0aCk7XG5cdH1cblxuXHRnZXRIZWlnaHQoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMuaGVpZ2h0KTtcblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzSG9sZGVyVmlydHVhbDtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpDYW52YXNIb2xkZXJWaXJ0dWFsXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJjbGFzcyBNb3VzZVN0YXR1c1xue1xuXHRjb25zdHJ1Y3Rvcihpc0Rvd24sc3RhcnRQb3NpdGlvbixwb3NpdGlvbixub2RlLG5vZGVTdGFydFBvc2l0aW9uKVxuXHR7XG5cdFx0dGhpcy5pc0Rvd24gPSBpc0Rvd247XG5cdFx0dGhpcy5zdGFydFBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy5ub2RlID0gbm9kZTtcblx0XHR0aGlzLm5vZGVTdGFydFBvc2l0aW9uID0gbm9kZVN0YXJ0UG9zaXRpb247XG5cdH1cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlU3RhdHVzO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOk1vdXNlU3RhdHVzXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2RlJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyBOb2RlQ2FudmFzIGV4dGVuZHMgTm9kZVxue1xuXHQgIGNvbnN0cnVjdG9yKGNhbnZhc0hvbGRlcilcblx0ICB7XG5cdFx0ICBzdXBlcihcdGNhbnZhc0hvbGRlci5jYW52YXNOYW1lLFxuXHRcdFx0XHRcdG5ldyBQb3NpdGlvbigwLDApLFxuXHRcdFx0XHRcdGNhbnZhc0hvbGRlcixcblx0XHRcdFx0XHRcImdlbmVyaWNcIixcblx0XHRcdFx0XHRudWxsKTtcblx0XHQgIE5vZGVDYW52YXMuaW5pdE5vZGVDYW52YXModGhpcyxjYW52YXNIb2xkZXIpO1xuXHRcdCAgXG5cdCAgfVxuXHQgIFxuXHQgIHN0YXRpYyBpbml0Tm9kZUNhbnZhcyhub2RlQ2FudmFzLGNhbnZhc0hvbGRlcilcblx0ICB7XG5cdFx0XHRub2RlQ2FudmFzLmV4dHJhQW5pbWF0aW9uID0gbnVsbDtcblx0XHRcdG5vZGVDYW52YXMuY2FudmFzSG9sZGVyID0gY2FudmFzSG9sZGVyO1xuXHRcdFx0bm9kZUNhbnZhcy5zdGFydEFuaW1hdGlvblRpbWVTdGFtcCA9IG51bGw7XG5cdFx0XHRub2RlQ2FudmFzLmxhc3RBbmltYXRpb25UaW1lU3RhbXAgPSBudWxsO1xuXHRcdFx0bm9kZUNhbnZhcy5zdGFydEFuaW1hdGlvbkRhdGUgPSBudWxsO1xuXHRcdFx0bm9kZUNhbnZhcy5hbmltYXRpb25FeGVjVGltZSA9IDA7XG5cdFx0XHRub2RlQ2FudmFzLnRpbWVGYWN0b3IgPSAxO1xuXHRcdFx0bm9kZUNhbnZhcy53b3JsZFVwZGF0ZVF1ZXVlUHJvY2Vzc2VkID0gbmV3IEFycmF5KCk7XG5cblx0XHR9XG5cdCAgXG5cdCAgZ2V0V29ybGRVcGRhdGVzUHJvY2Vzc2VkKHRpbWVTdGFtcCxtYXhJdGVtcylcblx0XHR7XG5cdFx0XHR2YXIgd29ybGRVcGRhdGVBcnJheSA9IG5ldyBBcnJheSgpO1xuXHRcdFx0dmFyIGZpcnN0ID0gbnVsbDtcblx0XHRcdGZvcih2YXIgaT0wO2k8dGhpcy53b3JsZFVwZGF0ZVF1ZXVlUHJvY2Vzc2VkLmxlbmd0aCAmJlxuXHRcdFx0XHR3b3JsZFVwZGF0ZUFycmF5Lmxlbmd0aDxtYXhJdGVtcztpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciB3b3JsZFVwZGF0ZSA9IHRoaXMud29ybGRVcGRhdGVRdWV1ZVByb2Nlc3NlZFtpXTtcblxuXHRcdFx0XHRpZih3b3JsZFVwZGF0ZS5wcm9jZXNzVGltZXN0YW1wPnRpbWVTdGFtcCkgXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR3b3JsZFVwZGF0ZUFycmF5LnB1c2god29ybGRVcGRhdGUpO1xuXHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCIgICAgICBnZXRXb3JsZFVwZGF0ZXNQcm9jZXNzZWRcIitcblx0XHRcdFx0XHRcdFx0XCI6d29ybGRVcGRhdGUucHJvY2Vzc1RpbWVzdGFtcD1cIit3b3JsZFVwZGF0ZS5wcm9jZXNzVGltZXN0YW1wK1xuXHRcdFx0XHRcdFx0XHRcIjpyZWFkeVRvQmVQcm9jZXNzZWQ9XCIrd29ybGRVcGRhdGUucmVhZHlUb0JlUHJvY2Vzc2VkKHRpbWVTdGFtcCkrXG5cdFx0XHRcdFx0XHRcdFwiOnRpbWVTdGFtcD1cIit0aW1lU3RhbXApO1xuXHRcdFx0XHRcdCovXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8qXG5cdFx0XHRjb25zb2xlLmxvZyhcImdldFdvcmxkVXBkYXRlc1Byb2Nlc3NlZFwiK1xuXHRcdFx0XHRcdFwiOnRpbWVTdGFtcD1cIit0aW1lU3RhbXArXG5cdFx0XHRcdFx0XCI6bWF4SXRlbXM9XCIrbWF4SXRlbXMrXG5cdFx0XHRcdFx0XCI6Zm91bmQ9XCIrd29ybGRVcGRhdGVBcnJheS5sZW5ndGgpO1xuXHRcdFx0XHRcdCovXG5cdFx0XHRyZXR1cm4od29ybGRVcGRhdGVBcnJheSk7XG5cdFx0fVxuXHRcblx0ICBnZXRXb3JsZENsaWVudEpzb24oKVxuXHQgIHtcblx0XHQgIHZhciBqc29uID0ge307XG5cdFx0ICBcblx0XHQgIGpzb24ubm9kZUdyYXBoID0gc3VwZXIuZ2V0Q2xpZW50SnNvbigpO1xuXHRcdCAganNvbi5jYW52YXNIb2xkZXIgPSB0aGlzLmNhbnZhc0hvbGRlci5nZXRDbGllbnRKc29uKCk7XG5cdFx0ICBKU09OLnN0cmluZ2lmeShqc29uKTtcblx0XHQgIHJldHVybihqc29uKVxuXHQgIH1cblx0XG5cdGlzVmlzYWJsZSgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5jYW52YXNIb2xkZXIuaXNWaXNhYmxlKCkpXG5cdH1cblx0XG5cdHBvaW50ZXJVcChub2RlKVxuXHR7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIk5vZGVDYW52YXMucG9pbnRlclVwOlwiK25vZGUubmFtZSlcblx0fVxuXHRcblx0cG9pbnRlck1vdmUobm9kZSlcblx0e1xuXHRcdC8vY29uc29sZS5sb2coXCJOb2RlQ2FudmFzLnBvaW50ZXJNb3ZlOlwiK25vZGUubmFtZSlcblx0fVxuXHRcblx0cG9pbnRlckRvd24obm9kZSlcblx0e1xuXHRcdC8vY29uc29sZS5sb2coXCJOb2RlQ2FudmFzLnBvaW50ZXJEb3duOlwiK25vZGUubmFtZSlcblx0fVxuXHRcblx0cGF1c2UoKVxuXHR7XG5cdFx0dGhpcy5pc0FuaW1hdGVkID0gZmFsc2U7XG5cdH1cblx0XG5cdHBsYXkoKVxuXHR7XG5cdFx0dGhpcy5pc0FuaW1hdGVkID0gdHJ1ZTtcblx0ICAgIHRoaXMuZHJhdygpO1xuXHR9XG5cdGRyYXcoKVxuXHR7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdGlmKHRoaXMuY2FudmFzSG9sZGVyLmlzRHJhd2FibGUoKSlcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbih0aW1lc3RhbXApIHsgc2VsZi5kcmF3Q2FudmFzKHRpbWVzdGFtcCkgfSwgZmFsc2UpO1xuXHR9XG5cdFxuXHRcblx0c2V0QW5pbWF0aW9uVGltZXModGltZXN0YW1wKVxuXHR7XG5cdFx0aWYodGhpcy5zdGFydEFuaW1hdGlvblRpbWVTdGFtcD09bnVsbCkgdGhpcy5zdGFydEFuaW1hdGlvblRpbWVTdGFtcCA9IHRpbWVzdGFtcCswO1xuXHRcdGlmKHRoaXMuc3RhcnRBbmltYXRpb25EYXRlPT1udWxsKSB0aGlzLnN0YXJ0QW5pbWF0aW9uRGF0ZSA9IG5ldyBEYXRlKCk7XG5cdFx0dmFyIG5vdyA9IG5ldyBEYXRlKCk7XG5cdFx0aWYodGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wPT1udWxsKSB0aGlzLmxhc3RBbmltYXRpb25UaW1lU3RhbXAgPSBub3c7XG5cdFxuXHRcdGlmKHRoaXMuaXNBbmltYXRlZClcblx0XHR7XG5cdFx0XHR0aGlzLmFuaW1hdGlvbkV4ZWNUaW1lICs9IG5vdy5nZXRUaW1lKCktdGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wLmdldFRpbWUoKTtcblx0XHRcdC8vY29uc29sZS5sb2coXCJub3c9XCIrbm93K1xuXHRcdFx0Ly9cdFwiIGxhc3RBbmltYXRpb25UaW1lU3RhbXA9XCIrdGhpcy5sYXN0QW5pbWF0aW9uVGltZVN0YW1wK1xuXHRcdFx0Ly9cdFwiIGFuaW1hdGlvbkV4ZWNUaW1lPVwiK3RoaXMuYW5pbWF0aW9uRXhlY1RpbWUrXG5cdFx0XHQvL1x0XCJcIik7XG5cdFx0fVxuXHRcdHRoaXMubGFzdEFuaW1hdGlvblRpbWVTdGFtcCA9IG5vdztcblx0XG5cdH1cblx0XG5cdFxuXHRjbGVhckNhbnZhcyh0aW1lc3RhbXApXG5cdHtcblx0XHRpZih0aGlzLmlzVmlzYWJsZSgpICYmIHRoaXMuY2FudmFzSG9sZGVyLmlzRHJhd2FibGUoKSlcblx0XHR7XG5cdFx0XHR0aGlzLmNhbnZhc0hvbGRlci5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhc0hvbGRlci5nZXRXaWR0aCgpLCB0aGlzLmNhbnZhc0hvbGRlci5jYW52YXMuaGVpZ2h0KTtcblx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmZpbGxTdHlsZSlcblx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXNIb2xkZXIuZ2V0V2lkdGgoKSwgdGhpcy5jYW52YXNIb2xkZXIuZ2V0SGVpZ2h0KCkpO1xuXHRcdH1cblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBOb2RlQ2FudmFzO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOk5vZGVDYW52YXNcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBNb3VzZVN0YXR1cyA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVjYW52YXMvbW91c2VzdGF0dXMnKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyBOb2RlQ2FudmFzTW91c2Vcbntcblx0Y29uc3RydWN0b3Iobm9kZUNhbnZhcylcblx0e1xuXHRcdE5vZGVDYW52YXNNb3VzZS5jcmVhdGVOb2RlQ2FudmFzTW91c2UodGhpcyxub2RlQ2FudmFzKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGVOb2RlQ2FudmFzTW91c2Uobm9kZUNhbnZhc01vdXNlLG5vZGVDYW52YXMpXG5cdHtcblx0XHRub2RlQ2FudmFzTW91c2Uubm9kZUNhbnZhcyA9IG5vZGVDYW52YXM7XG5cdFx0aWYobm9kZUNhbnZhcy5pc1Zpc2FibGUoKSkgXG5cdFx0e1xuXHRcdFx0bm9kZUNhbnZhc01vdXNlLm9mZnNldCA9IE5vZGVDYW52YXNNb3VzZS5nZXRDYW52YXNPZmZzZXQobm9kZUNhbnZhcy5jYW52YXNIb2xkZXIuY2FudmFzKTtcblx0XHRcdG5vZGVDYW52YXNNb3VzZS5tb3VzZVN0YXR1cyA9IG5ldyBNb3VzZVN0YXR1cyhmYWxzZSxuZXcgUG9zaXRpb24oMCwwKSxuZXcgUG9zaXRpb24oMCwwKSxudWxsLG51bGwpO1xuXHRcdFx0bm9kZUNhbnZhc01vdXNlLmluaXRDYXZhbnNQb2ludGVyKCk7XG5cdFx0XHRub2RlQ2FudmFzTW91c2Uubm9kZU1vdXNlTW92bWVudCA9IHt9O1xuXHRcdH1cblx0fVxuXHRcblx0c3RhdGljIGdldENhbnZhc09mZnNldChvYmopXG5cdHtcblx0ICAgIHZhciBvZmZzZXRMZWZ0ID0gMDtcblx0ICAgIHZhciBvZmZzZXRUb3AgPSAwO1xuXHQgICAgZG9cblx0ICAgIHtcblx0ICAgICAgaWYgKCFpc05hTihvYmoub2Zmc2V0TGVmdCkpXG5cdCAgICAgIHtcblx0ICAgICAgICAgIG9mZnNldExlZnQgKz0gb2JqLm9mZnNldExlZnQ7XG5cdCAgICAgIH1cblx0ICAgICAgaWYgKCFpc05hTihvYmoub2Zmc2V0VG9wKSlcblx0ICAgICAge1xuXHQgICAgICAgICAgb2Zmc2V0VG9wICs9IG9iai5vZmZzZXRUb3A7XG5cdCAgICAgIH0gICBcblx0ICAgIH1cblx0ICAgIHdoaWxlKG9iaiA9IG9iai5vZmZzZXRQYXJlbnQgKTtcblx0ICAgIFxuXHQgICAgcmV0dXJuIHtsZWZ0OiBvZmZzZXRMZWZ0LCB0b3A6IG9mZnNldFRvcH07XG5cdH1cblxuXHRwb2ludGVyRG93bkV2ZW50KGV2ZW50KVxuXHR7XG5cdFx0dmFyIGV2ZW50UG9zaXRpb24gPSBuZXcgUG9zaXRpb24oZXZlbnQucGFnZVgtdGhpcy5vZmZzZXQubGVmdCxldmVudC5wYWdlWS10aGlzLm9mZnNldC50b3ApO1xuXHRcdHRoaXMuaGlkZUN1cnJlbnROb2RlSW5mbygpO1xuXHRcblx0XHR0aGlzLm1vdXNlU3RhdHVzLmlzRG93biA9IHRydWU7XG5cdFx0dGhpcy5tb3VzZVN0YXR1cy5zdGFydFBvc2l0aW9uID0gZXZlbnRQb3NpdGlvbjtcblx0XHR0aGlzLm1vdXNlU3RhdHVzLnBvc2l0aW9uID0gZXZlbnRQb3NpdGlvbjtcblx0XHRpZih0aGlzLm1vdXNlU3RhdHVzLm5vZGUhPW51bGwpXG5cdFx0e1xuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzQW5pbWF0ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZSA9IG51bGw7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciBjbGlja05vZGUgPSAgdGhpcy5ub2RlQ2FudmFzLmdldE5vZGVDb250YWluaW5nUG9zaXRpb24oZXZlbnRQb3NpdGlvbik7XG5cdFxuXHRcdHZhciBjbGlja05vZGUgPSAgdGhpcy5ub2RlQ2FudmFzLmdldE5vZGVDb250YWluaW5nUG9zaXRpb24oZXZlbnRQb3NpdGlvbik7XG5cdFx0aWYoY2xpY2tOb2RlIT1udWxsICYmIGNsaWNrTm9kZSE9dGhpcy5tb3VzZVN0YXR1cy5sYXN0Tm9kZSlcblx0XHR7XG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUgPSBjbGlja05vZGU7XG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGVTdGFydFBvc2l0aW9uID0gY2xpY2tOb2RlLnBvc2l0aW9uLmNsb25lKCk7XG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNTZWxlY3RlZCA9IHRydWU7XG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm9mZnNldCA9IGNsaWNrTm9kZS5wb3NpdGlvbi5nZXREZWx0YShldmVudFBvc2l0aW9uKTtcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5wb2ludGVyRG93bihjbGlja05vZGUpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLnNob3dDdXJyZW50Tm9kZUluZm8oKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYoY2xpY2tOb2RlPT1udWxsKVxuXHRcdHtcblx0XHRcdHRoaXMuaGlkZUN1cnJlbnROb2RlSW5mbygpO1xuXHRcdH1cblx0XHRcblx0XHRpZih0aGlzLm1vdXNlU3RhdHVzLmxhc3ROb2RlKVxuXHRcdHtcblx0XHRcdHRoaXMuaGlkZUN1cnJlbnROb2RlSW5mbygpO1xuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5sYXN0Tm9kZS5pc1NlbGVjdGVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLm1vdXNlU3RhdHVzLmxhc3ROb2RlID0gbnVsbDtcblx0XHR9XG5cdFxuXHR9XG5cdFxuXHRzaG93Q3VycmVudE5vZGVJbmZvKClcblx0e1xuXHRcdHZhciBodG1sT2JqZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJub2RlaW5mb1wiKTtcblx0XHRpZihodG1sT2JqZWN0IT1udWxsKVxuXHRcdHtcblx0XHRcdGh0bWxPYmplY3Quc3R5bGUubGVmdCA9IHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5nZXRYKCkrMzArJ3B4Jztcblx0XHRcdGh0bWxPYmplY3Quc3R5bGUudG9wICA9IHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5nZXRZKCkrJ3B4Jztcblx0XHRcdGh0bWxPYmplY3Quc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblx0XHRcdCQoJyNub2RlaW5mbycpLmh0bWwodGhpcy5tb3VzZVN0YXR1cy5ub2RlLmdldE5vZGVVaURpc3BsYXkoKSk7XG5cdFx0fVxuXHRcdFxuXHRcdGNvbnNvbGUubG9nKFwibmFtZTpcIit0aGlzLm1vdXNlU3RhdHVzLm5vZGUubmFtZStcIlxcblwiK1xuXHRcdFx0XHRcIlx0aXNTZWxlY3RlZDpcIit0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNTZWxlY3RlZCtcIlxcblwiK1xuXHRcdFx0XHRcIlx0aXNTZWxlY3RlZDpcIit0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNBbmltYXRlZCtcIlxcblwiK1xuXHRcdFx0XHRcIlx0cG9zaXRpb246XCIrQ29tbW9uLnRvU3RyaW5nKHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbikrXCJcXG5cIitcblx0XHRcdFx0XCJcdGlzU2VsZWN0ZWQ6XCIrdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzU2VsZWN0ZWQrXG5cdFx0XHRcdFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIrXG5cdFx0XHRcIlwiKTtcblx0fVxuXHRcblx0aGlkZUN1cnJlbnROb2RlSW5mbygpXG5cdHtcblx0XHR2YXIgaHRtbE9iamVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm9kZWluZm9cIik7XG5cdFx0aWYoaHRtbE9iamVjdCE9bnVsbClcblx0XHR7XG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLmxlZnQgPSAwKydweCc7XG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLnRvcCAgPSAwKydweCc7XG5cdFx0XHRodG1sT2JqZWN0LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblx0XHRcdCQoJyNub2RlaW5mbycpLmh0bWwoKTtcblx0XHR9XG5cdH1cblx0XG5cdHBvaW50ZXJNb3ZlRXZlbnQoZXZlbnQpXG5cdHtcblx0XHR2YXIgZXZlbnRQb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihldmVudC5wYWdlWC10aGlzLm9mZnNldC5sZWZ0LGV2ZW50LnBhZ2VZLXRoaXMub2Zmc2V0LnRvcCk7XG5cdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5pc0Rvd24pXG5cdFx0e1xuXHRcdFx0dGhpcy5oaWRlQ3VycmVudE5vZGVJbmZvKCk7XG5cdFxuXHRcdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5ub2RlIT1udWxsKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGUuaXNBbmltYXRlZCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLnBvc2l0aW9uID0gZXZlbnRQb3NpdGlvbjtcblx0XHRcdFx0dmFyIGRlbHRhUG9zaXRpb24gPSB0aGlzLm1vdXNlU3RhdHVzLm5vZGVTdGFydFBvc2l0aW9uLmdldERlbHRhKGV2ZW50UG9zaXRpb24pO1xuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlLnBvc2l0aW9uLnNldFgoXG5cdFx0XHRcdFx0XHR0aGlzLm1vdXNlU3RhdHVzLm5vZGVTdGFydFBvc2l0aW9uLmdldFgoKS1cblx0XHRcdFx0XHRcdGRlbHRhUG9zaXRpb24uZ2V0WCgpK1xuXHRcdFx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5vZmZzZXQuZ2V0WCgpKTtcblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5zZXRZKFxuXHRcdFx0XHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlU3RhcnRQb3NpdGlvbi5nZXRZKCktXG5cdFx0XHRcdFx0XHRkZWx0YVBvc2l0aW9uLmdldFkoKStcblx0XHRcdFx0XHRcdHRoaXMubW91c2VTdGF0dXMub2Zmc2V0LmdldFkoKSk7XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLm5vZGVDYW52YXMucG9pbnRlck1vdmUodGhpcy5tb3VzZVN0YXR1cy5ub2RlKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKCF0aGlzLm5vZGVNb3VzZU1vdm1lbnQuaGFzT3duUHJvcGVydHkodGhpcy5tb3VzZVN0YXR1cy5ub2RlLmdldE5vZGVLZXkoKSkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aGlzLm5vZGVNb3VzZU1vdm1lbnRbdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmdldE5vZGVLZXkoKV0gPVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bW92ZVBvc3Rpb25BcnJheTpuZXcgQXJyYXkoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLm5vZGVNb3VzZU1vdm1lbnRbdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmdldE5vZGVLZXkoKV0ubW92ZVBvc3Rpb25BcnJheS5wdXNoKHRoaXMubW91c2VTdGF0dXMubm9kZS5wb3NpdGlvbi5jbG9uZSgpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHR9XG5cdH1cblx0XG5cdHBvaW50ZXJVcEV2ZW50KGV2ZW50KVxuXHR7XG5cdFx0aWYodGhpcy5tb3VzZVN0YXR1cy5ub2RlIT1udWxsKVxuXHRcdHtcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5wb2ludGVyVXAodGhpcy5tb3VzZVN0YXR1cy5ub2RlKTtcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubm9kZS5pc0FuaW1hdGVkID0gdHJ1ZTtcblx0XHRcdC8vdGhpcy5tb3VzZVN0YXR1cy5ub2RlLmlzU2VsZWN0ZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMubW91c2VTdGF0dXMubGFzdE5vZGUgPSB0aGlzLm1vdXNlU3RhdHVzLm5vZGU7XG5cdFxuXHRcdFx0dGhpcy5tb3VzZVN0YXR1cy5ub2RlID0gbnVsbDtcblx0XHR9XG5cdFx0dGhpcy5tb3VzZVN0YXR1cy5pc0Rvd24gPSBmYWxzZTtcblx0fVxuXHRcblx0aW5pdENhdmFuc1BvaW50ZXIoKVxuXHR7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdGlmKHdpbmRvdy5Qb2ludGVyRXZlbnQpXG5cdFx0e1xuXHRcdFx0dGhpcy5ub2RlQ2FudmFzLmNhbnZhc0hvbGRlci5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlckRvd25FdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5jYW52YXNIb2xkZXIuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYucG9pbnRlck1vdmVFdmVudCggZXZlbnQpIH0sIGZhbHNlKTtcblx0XHRcdHRoaXMubm9kZUNhbnZhcy5jYW52YXNIb2xkZXIuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVydXBcIixmdW5jdGlvbihldmVudCkgeyBzZWxmLnBvaW50ZXJVcEV2ZW50KCBldmVudCkgfSwgZmFsc2UpO1xuXHQgICAgfVxuXHQgICAgZWxzZVxuXHQgICAge1xuXHQgICAgXHR0aGlzLm5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyRG93bkV2ZW50KCBldmVudCkgfSwgZmFsc2UpO1xuXHQgICAgXHR0aGlzLm5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5wb2ludGVyTW92ZUV2ZW50KCBldmVudCkgfSwgZmFsc2UpO1xuXHQgICAgXHR0aGlzLm5vZGVDYW52YXMuY2FudmFzSG9sZGVyLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbihldmVudCkgeyBzZWxmLnBvaW50ZXJVcEV2ZW50KCBldmVudCkgfSwgZmFsc2UpO1xuXHQgICAgfSAgXG5cdH1cbn1cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gTm9kZUNhbnZhc01vdXNlO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOk5vZGVDYW52YXNNb3VzZVwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvcG9zaXRpb24vcG9zaXRpb24nKTtcbnZhciBOb2RlRGlzcGxheSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL25vZGVkaXNwbGF5L25vZGVkaXNwbGF5Jyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xudmFyIFNoYXBlID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvc2hhcGVzL3NoYXBlJyk7XG5cbmNsYXNzIEFyY0Rpc3BsYXlTaGFwZSBleHRlbmRzIE5vZGVEaXNwbGF5XG57XG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxuXHR7XG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xuXHRcdHRoaXMucG9pbnRMaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0dGhpcy5zaGFwZSA9IG51bGw7XG5cdFx0dGhpcy5pbml0KCk7XG5cdFx0XG5cdH1cblx0XG5cdGluaXQoKVxuXHR7XG5cdFx0dGhpcy5wb2ludExpc3QubGVuZ3RoID0gMDtcblx0XHR0aGlzLmFuZ2xlID0gTWF0aC5hYnModGhpcy5kaXNwbGF5SW5mby5lbmRBbmdsZSx0aGlzLmRpc3BsYXlJbmZvLnN0YXJ0QW5nbGUpO1xuXHRcdHZhciBhbmdsZUluYyA9IHRoaXMuYW5nbGUgLyB0aGlzLmRpc3BsYXlJbmZvLmN1cnZlUG9pbnRzO1xuXHRcdFxuXHRcdHRoaXMucG9pbnRMaXN0LnB1c2gobmV3IFBvc2l0aW9uKDAsMCkpO1xuXHRcdGZvcih2YXIgYW5nbGU9dGhpcy5kaXNwbGF5SW5mby5zdGFydEFuZ2xlO1xuXHRcdFx0YW5nbGU8PXRoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUgJiYgYW5nbGVJbmM+MDtcblx0XHRcdGFuZ2xlPWFuZ2xlK2FuZ2xlSW5jKVxuXHRcdHtcblx0XHRcdGlmKCAoYW5nbGUrYW5nbGVJbmMpID4gdGhpcy5kaXNwbGF5SW5mby5lbmRBbmdsZSApXG5cdFx0XHR7XG5cdFx0XHRcdGlmKGFuZ2xlIT10aGlzLmRpc3BsYXlJbmZvLmVuZEFuZ2xlKSBhbmdsZSA9IHRoaXMuZGlzcGxheUluZm8uZW5kQW5nbGUgO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHJhZHMgPSBhbmdsZSAqIChNYXRoLlBJLzE4MCk7XG5cdFx0XHR0aGlzLnBvaW50TGlzdC5wdXNoKFxuXHRcdFx0XHRcdG5ldyBQb3NpdGlvbihcblx0XHRcdFx0XHRcdFx0dGhpcy5kaXNwbGF5SW5mby5yYWRpdXMqTWF0aC5jb3MocmFkcyksXG5cdFx0XHRcdFx0XHRcdHRoaXMuZGlzcGxheUluZm8ucmFkaXVzKk1hdGguc2luKHJhZHMpKVxuXHRcdFx0XHRcdCk7XHRcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5wb2ludExpc3QucHVzaChuZXcgUG9zaXRpb24oMCwwKSk7XG5cdFx0aWYodGhpcy5zaGFwZT09bnVsbCkgdGhpcy5zaGFwZSA9IG5ldyBTaGFwZSh0aGlzLnBvaW50TGlzdCk7XG5cdFx0ZWxzZSB0aGlzLnNoYXBlLmluaXRTaGFwZSgpO1xuXHR9XG5cdFxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXG5cdHtcblx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKHBvc2l0aW9uKTtcblx0XHRyZXR1cm4oZGlzdGFuY2U8PXRoaXMuZGlzcGxheUluZm8ucmFkaXVzKTtcblx0fVxuXHRcblx0XG5cdGRyYXdOb2RleChjYW52YXNIb2xkZXIsbm9kZSlcblx0e1xuXG5cdH1cblx0XG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxuXHR7XG5cdFx0c3VwZXIuZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpO1xuXG5cdCAgICBpZihub2RlLmlzU2VsZWN0ZWQpXG5cdCAgICB7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RGaWxsQ29sb3IpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RCb3JkZXJDb2xvcik7XG5cdCAgICB9XG5cdCAgICBlbHNlXG5cdCAgICB7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5ib3JkZXJDb2xvcik7XG5cdCAgICB9XG5cdCAgIC8qIFxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5hcmMobm9kZS5wb3NpdGlvbi5nZXRYKCksbm9kZS5wb3NpdGlvbi5nZXRZKCksdGhpcy5kaXNwbGF5SW5mby5yYWRpdXMsMCxNYXRoLlBJICogMiwgZmFsc2UpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuY2xvc2VQYXRoKCk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5maWxsKCk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lV2lkdGggPSB0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlKCk7XG5cdCAgICAqL1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYmVnaW5QYXRoKCk7IC8vQmVnaW5zIGRyYXdpbmcgdGhlIHBhdGguIFNlZSBsaW5rIGluIFwiRWRpdFwiIHNlY3Rpb25cblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0Lm1vdmVUbyhub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKSk7IC8vTW92ZXMgdGhlIGJlZ2lubmluZyBwb3NpdGlvbiB0byBjeCwgY3kgKDEwMCwgNzUpXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5hcmMobm9kZS5wb3NpdGlvbi5nZXRYKCksbm9kZS5wb3NpdGlvbi5nZXRZKCksXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby5yYWRpdXMsXG5cdCAgICBcdFx0dGhpcy50b1JhZGlhbnModGhpcy5kaXNwbGF5SW5mby5zdGFydEFuZ2xlKSxcblx0ICAgIFx0XHR0aGlzLnRvUmFkaWFucyh0aGlzLmRpc3BsYXlJbmZvLmVuZEFuZ2xlKSk7IC8vXHRjdHguYXJjKGN4LCBjeSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgY291bnRlcmNsb2Nrd2lzZSAob3B0aW9uYWwpKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVUbyhub2RlLnBvc2l0aW9uLmdldFgoKSxub2RlLnBvc2l0aW9uLmdldFkoKSk7IC8vRHJhd3MgbGluZXMgZnJvbSB0aGUgZW5kcyBvZiB0aGUgYXJjIHRvIGN4IGFuZCBjeVxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuY2xvc2VQYXRoKCk7IC8vRmluaXNoZXMgZHJhd2luZyB0aGUgcGF0aFxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpOyAvL0FjdHVhbGx5IGRyYXdzIHRoZSBzaGFwZSAoYW5kIGZpbGxzKVxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aDtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xuXHR9XG5cdC8vdGhpcy5kaXNwbGF5SW5mby5lbmRBbmdsZSx0aGlzLmRpc3BsYXlJbmZvLnN0YXJ0QW5nbGVcblx0dG9SYWRpYW5zKGRlZylcblx0e1xuXHQgICAgcmV0dXJuIGRlZyAqIE1hdGguUEkgLyAxODAgLy9Db252ZXJ0cyBkZWdyZWVzIGludG8gcmFkaWFuc1xuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBBcmNEaXNwbGF5U2hhcGU7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6QXJjRGlzcGxheVNoYXBlXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cblxuY2xhc3MgQ2lyY2xlRGlzcGxheSBleHRlbmRzIE5vZGVEaXNwbGF5XG57XG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxuXHR7XG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xuXHR9XG5cdFxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXG5cdHtcblx0XHR2YXIgZGlzdGFuY2UgPSBub2RlLnBvc2l0aW9uLmdldERpc3RhbmNlKHBvc2l0aW9uKTtcblx0XHRyZXR1cm4oZGlzdGFuY2U8PXRoaXMuZGlzcGxheUluZm8ucmFkaXVzKTtcblx0fVxuXHRcblx0XG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxuXHR7XG5cdFx0c3VwZXIuZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpO1xuXG5cdCAgICBpZihub2RlLmlzU2VsZWN0ZWQpXG5cdCAgICB7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RGaWxsQ29sb3IpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RCb3JkZXJDb2xvcik7XG5cdCAgICB9XG5cdCAgICBlbHNlXG5cdCAgICB7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5ib3JkZXJDb2xvcik7XG5cdCAgICB9XG5cdCAgICBcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYXJjKG5vZGUucG9zaXRpb24uZ2V0WCgpLG5vZGUucG9zaXRpb24uZ2V0WSgpLHRoaXMuZGlzcGxheUluZm8ucmFkaXVzLDAsTWF0aC5QSSAqIDIsIGZhbHNlKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmNsb3NlUGF0aCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aDtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGVEaXNwbGF5O1xuY29uc29sZS5sb2coXCJMb2FkaW5nOkNpcmNsZURpc3BsYXlcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xuXG5jbGFzcyBOb2RlRGlzcGxheVxue1xuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcblx0e1xuXHRcdE5vZGVEaXNwbGF5LmNyZWF0ZU5vZGVEaXNwbGF5KHRoaXMsZGlzcGxheUluZm8pO1xuXHR9XG5cdFxuXHRzdGF0aWMgY3JlYXRlTm9kZURpc3BsYXkobm9kZURpc3BsYXksZGlzcGxheUluZm8pXG5cdHtcblx0XHRub2RlRGlzcGxheS5kaXNwbGF5SW5mbyA9IGRpc3BsYXlJbmZvO1xuXHR9XG5cdFxuXHRkcmF3Tm9kZShjYW52YXNIb2xkZXIsbm9kZSlcblx0e1xuXHRcdHRoaXMuZHJhd1Bvc2l0aW9uID0gbmV3IFBvc2l0aW9uKFxuXHRcdFx0XHRNYXRoLnJvdW5kKG5vZGUucG9zaXRpb24ueCksXG5cdFx0XHRcdE1hdGgucm91bmQobm9kZS5wb3NpdGlvbi55KVxuXHRcdFx0XHQpO1xuXHR9XG5cdFxuXHRjb250YWluc1Bvc2l0aW9uKHBvc3Rpb24sbm9kZSlcblx0e1xuXHR9XG5cdFxuXHRmaWxsVGV4dE11dGlwbGVMaW5lcyhjb250ZXh0LHRleHQseCx5LGxpbmVIZWlnaHQsc3BsaXRDaGFyKVxuXHR7XG5cdFx0dmFyIGxpbmVzID0gdGV4dC5zcGxpdChzcGxpdENoYXIpO1xuXHQgICAgdmFyIGxpbmUgPSAnJztcblx0XG5cdCAgICBmb3IodmFyIG4gPSAwOyBuIDwgbGluZXMubGVuZ3RoOyBuKyspXG5cdCAgICB7XG5cdCAgICAgIHZhciBtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dChsaW5lc1tuXSk7XG5cdCAgICAgIGNvbnRleHQuZmlsbFRleHQobGluZXNbbl0sIHgsIHkpO1xuXHQgICAgICB5ID0geStsaW5lSGVpZ2h0OyBcblx0ICAgIH1cblx0ICAgIGNvbnRleHQuZmlsbFRleHQobGluZSwgeCwgeSk7XG5cdCB9XG5cdFxuXHRtZXRyaWNzVGV4dE11dGlwbGVMaW5lcyhjb250ZXh0LHRleHQsbGluZUhlaWdodCxzcGxpdENoYXIpXG5cdHtcblx0XHR2YXIgbGluZXMgPSB0ZXh0LnNwbGl0KHNwbGl0Q2hhcik7XG5cdCAgICB2YXIgbGluZSA9ICcnO1xuXHQgICAgdmFyIG1heFdpZHRoID0gMDtcblx0ICAgIHZhciB0b3RhbEhlaWdodCA9IDA7XG5cdCAgICBmb3IodmFyIG4gPSAwOyBuIDwgbGluZXMubGVuZ3RoOyBuKyspXG5cdCAgICB7XG5cdCAgICAgIHZhciBtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dChsaW5lc1tuXSk7XG5cdCAgICAgIGlmKG1ldHJpY3Mud2lkdGg+bWF4V2lkdGgpIG1heFdpZHRoID0gbWV0cmljcy53aWR0aDtcblx0ICAgICAgdG90YWxIZWlnaHQgPSB0b3RhbEhlaWdodCArIGxpbmVIZWlnaHQ7XG5cdCAgICB9XG5cdCAgICByZXR1cm4oe3dpZHRoOm1heFdpZHRoLGhlaWdodDp0b3RhbEhlaWdodH0pO1xuXHQgfVxuXHRcblx0cm91bmRlZFJlY3QoY29udGV4dCx4LHksdyxoLHIsYm9yZGVyV2l0ZGgsYm9yZGVyQ29sb3IscmVjdENvbG9yKVxuXHR7XG5cdFx0ICBpZiAodyA8IDIgKiByKSByID0gdyAvIDI7XG5cdFx0ICBpZiAoaCA8IDIgKiByKSByID0gaCAvIDI7XG5cdFx0ICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdCAgY29udGV4dC5tb3ZlVG8oeCtyLCB5KTtcblx0XHQgIGNvbnRleHQuYXJjVG8oeCt3LCB5LCAgIHgrdywgeStoLCByKTtcblx0XHQgIGNvbnRleHQuYXJjVG8oeCt3LCB5K2gsIHgsICAgeStoLCByKTtcblx0XHQgIGNvbnRleHQuYXJjVG8oeCwgICB5K2gsIHgsICAgeSwgICByKTtcblx0XHQgIGNvbnRleHQuYXJjVG8oeCwgICB5LCAgIHgrdywgeSwgICByKTtcblx0XHQgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG5cdFx0Lypcblx0ICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdCAgICBjb250ZXh0Lm1vdmVUbyh4LCB5KTtcblx0ICAgIGNvbnRleHQubGluZVRvKHggKyB3aWR0aCAtIGNvcm5lclJhZGl1cywgeSk7XG5cdCAgICBjb250ZXh0LmFyY1RvKHggKyB3aWR0aCwgeSwgeCArIHdpZHRoLCB5ICsgY29ybmVyUmFkaXVzLCBjb3JuZXJSYWRpdXMpO1xuXHQgICAgY29udGV4dC5saW5lVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0KTtcblx0ICAgKi8gXG5cdCAgICBjb250ZXh0LmxpbmVXaWR0aCA9IGJvcmRlcldpdGRoO1xuXHQgICAgY29udGV4dC5maWxsU3R5bGUgPSByZWN0Q29sb3I7XG5cdCAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gYm9yZGVyQ29sb3I7XG5cdCAgICBcblx0ICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cdCAgICBjb250ZXh0LmZpbGwoKTtcblx0XG5cdH1cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IE5vZGVEaXNwbGF5O1xuY29uc29sZS5sb2coXCJMb2FkaW5nOk5vZGVEaXNwbGF5XCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIFJlY3RhbmdsZURpc3BsYXkgZXh0ZW5kcyBOb2RlRGlzcGxheVxue1xuXHRjb25zdHJ1Y3RvcihkaXNwbGF5SW5mbylcblx0e1xuXHRcdHN1cGVyKGRpc3BsYXlJbmZvKTtcblx0fVxuXHRcblx0Y29udGFpbnNQb3NpdGlvbihwb3NpdGlvbixub2RlKVxuXHR7XG5cdFx0cmV0dXJuKFxuXHRcdFx0XHQoXG5cdFx0XHRcdFx0XHQobm9kZS5wb3NpdGlvbi5nZXRYKCktdGhpcy5kaXNwbGF5SW5mby53aWR0aC8yKTw9cG9zaXRpb24uZ2V0WCgpICYmXG5cdFx0XHRcdFx0XHQobm9kZS5wb3NpdGlvbi5nZXRYKCkrdGhpcy5kaXNwbGF5SW5mby53aWR0aC8yKT49cG9zaXRpb24uZ2V0WCgpICYmXG5cdFx0XHRcdFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCktdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMik8PXBvc2l0aW9uLmdldFkoKSAmJlxuXHRcdFx0XHRcdFx0KG5vZGUucG9zaXRpb24uZ2V0WSgpK3RoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpPj1wb3NpdGlvbi5nZXRZKClcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0fVxuXHRcblx0XG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxuXHR7XG5cdFx0c3VwZXIuZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpO1xuXG5cdCAgICBpZihub2RlLmlzU2VsZWN0ZWQpXG5cdCAgICB7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RGaWxsQ29sb3IpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5zZWxlY3RCb3JkZXJDb2xvcik7XG5cdCAgICB9XG5cdCAgICBlbHNlXG5cdCAgICB7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5maWxsQ29sb3IpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5ib3JkZXJDb2xvcik7XG5cdCAgICB9XG5cdCAgICAvL2NvbnNvbGUubG9nKENvbW1vbnRvU3RyaW5nKHRoaXMuZGlzcGxheUluZm8pKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxSZWN0KCBcblx0ICAgIFx0XHQobm9kZS5wb3NpdGlvbi5nZXRYKCktdGhpcy5kaXNwbGF5SW5mby53aWR0aC8yKSxcblx0ICAgIFx0XHQobm9kZS5wb3NpdGlvbi5nZXRZKCktdGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMiksXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby53aWR0aCxcblx0ICAgIFx0XHR0aGlzLmRpc3BsYXlJbmZvLmhlaWdodCk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lV2lkdGggPSB0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uYm9yZGVyQ29sb3IpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlUmVjdCggXG5cdCAgICBcdFx0KG5vZGUucG9zaXRpb24uZ2V0WCgpLXRoaXMuZGlzcGxheUluZm8ud2lkdGgvMiksIFxuXHQgICAgXHRcdChub2RlLnBvc2l0aW9uLmdldFkoKS10aGlzLmRpc3BsYXlJbmZvLmhlaWdodC8yKSwgXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby53aWR0aCwgXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby5oZWlnaHQpO1xuXHRcblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gUmVjdGFuZ2xlRGlzcGxheTtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpSZWN0YW5nbGVEaXNwbGF5XCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIE5vZGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvbm9kZWRpc3BsYXkvbm9kZWRpc3BsYXknKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi8uLi9jb21tb24vY29tbW9uJyk7XG52YXIgU2hhcGUgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9zaGFwZXMvc2hhcGUnKTtcblxuY2xhc3MgVHJpYW5nbGVEaXNwbGF5IGV4dGVuZHMgTm9kZURpc3BsYXlcbntcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXG5cdHtcblx0XHRzdXBlcihkaXNwbGF5SW5mbyk7XG5cdFx0XG5cdFx0dmFyIHBvaW50TGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcdFxuXHRcdHBvaW50TGlzdC5wdXNoKG5ldyBQb3NpdGlvbigwLC0odGhpcy5kaXNwbGF5SW5mby5oZWlnaHQvMikpKTtcblx0XHRwb2ludExpc3QucHVzaChuZXcgUG9zaXRpb24odGhpcy5kaXNwbGF5SW5mby53aWR0aC8yLHRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpKTtcblx0XHRwb2ludExpc3QucHVzaChuZXcgUG9zaXRpb24oLSh0aGlzLmRpc3BsYXlJbmZvLndpZHRoLzIpLHRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpKTtcblx0XHRwb2ludExpc3QucHVzaChuZXcgUG9zaXRpb24oMCwtKHRoaXMuZGlzcGxheUluZm8uaGVpZ2h0LzIpKSk7XG5cdFxuXHRcdHRoaXMucG9pbnRMaXN0ID0gcG9pbnRMaXN0O1xuXHRcdHRoaXMuc2hhcGUgPSBuZXcgU2hhcGUocG9pbnRMaXN0KVxuXHR9XG5cdFxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5zaGFwZS5jb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpKTtcblx0fVxuXHRcblx0XG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxuXHR7XG5cdFx0c3VwZXIuZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpO1xuXHRcdHRoaXMuc2hhcGUuZHJhd1NoYXBlKGNhbnZhc0hvbGRlcixub2RlLHRoaXMuZGlzcGxheUluZm8pO1xuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBUcmlhbmdsZURpc3BsYXk7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6VHJpYW5nbGVEaXNwbGF5XCIpO1xuLy88L2pzMm5vZGU+XG4iLCJjbGFzcyBQb3NpdGlvblxue1xuXHRjb25zdHJ1Y3Rvcih4LCB5KVxuXHR7XG5cdCAgICB0aGlzLnggPSB4O1xuXHQgICAgdGhpcy55ID0geTtcblx0fVxuXG5cdHN0YXRpYyBnZXRBdmVyYWdlUG9zdGlvbkZyb21Qb3NpdGlvbkxpc3QocG9zaXRpb25MaXN0KVxuXHR7XG5cdFx0dmFyIHggPSAwLjA7XG5cdFx0dmFyIHkgPSAwLjA7XG5cdFx0Zm9yKHZhciBpPTA7aTxwb3NpdGlvbkxpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgcCA9IHBvc2l0aW9uTGlzdFtpXTtcblx0XHRcdHggKz0gcC5nZXRYKCk7XG5cdFx0XHR5ICs9IHAuZ2V0WSgpO1xuXHRcdH1cblx0XHR4ID0geCAvIHBvc2l0aW9uTGlzdC5sZW5ndGg7XG5cdFx0eSA9IHkgLyBwb3NpdGlvbkxpc3QubGVuZ3RoO1xuXHRcdHJldHVybihuZXcgUG9zaXRpb24oeCx5KSk7XG5cdH1cblx0XG4gIGdldENsaWVudEpzb24oKVxuICB7XG5cdCAgdmFyIGpzb24gPSB7fTtcblx0ICBqc29uLnggPSB0aGlzLmdldFgoKTtcblx0ICBqc29uLnkgPSB0aGlzLmdldFkoKTtcblx0ICByZXR1cm4oanNvbilcbiAgfVxuXHRcdFxuICBzdGF0aWMgZ2V0QXZlcmFnZVBvc3Rpb25Gcm9tTm9kZUxpc3Qobm9kZWxpc3QpXG4gIHtcblx0dmFyIHggPSAwLjA7XG5cdHZhciB5ID0gMC4wO1xuXHRmb3IodmFyIGk9MDtpPG5vZGVsaXN0Lmxlbmd0aDtpKyspXG5cdHtcblx0XHR2YXIgcCA9IG5vZGVsaXN0W2ldLnBvc2l0aW9uO1xuXHRcdHggKz0gcC5nZXRYKCk7XG5cdFx0eSArPSBwLmdldFkoKTtcblx0fVxuXHR4ID0geCAvIG5vZGVsaXN0Lmxlbmd0aDtcblx0eSA9IHkgLyBub2RlbGlzdC5sZW5ndGg7XG5cdHJldHVybihuZXcgUG9zaXRpb24oeCx5KSk7XG4gIH1cblx0XHRcblx0c3RhdGljIGdldFBvc3Rpb25MaXN0RnJvbU5vZGVMaXN0KG5vZGVMaXN0KVxuXHR7XG5cdFx0dmFyIHBvc2l0aW9ucyA9IG5ldyBBcnJheSgpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZUxpc3QubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0cG9zaXRpb25zLnB1c2gobm9kZUxpc3RbaV0ucG9zaXRpb24pO1xuXHRcdH1cblx0XHRyZXR1cm4ocG9zaXRpb25zKTtcblx0fVxuXG5cdGNvcHlGcm9tKHBvc2l0aW9uKVxuXHR7XG5cdFx0dGhpcy5zZXRYKHBvc2l0aW9uLmdldFgoKSk7XG5cdFx0dGhpcy5zZXRZKHBvc2l0aW9uLmdldFkoKSk7XG5cdH1cblxuXHRjb3B5VG8ocG9zaXRpb24pXG5cdHtcblx0XHRwb3NpdGlvbi5zZXRYKHRoaXMuZ2V0WCgpKTtcblx0XHRwb3NpdGlvbi5zZXRZKHRoaXMuZ2V0WSgpKTtcblx0fVxuXHRcblx0c2V0WFkoeCx5KVxuXHR7XG5cdFx0dGhpcy5zZXRYKHgpO1xuXHRcdHRoaXMuc2V0WSh5KTtcblx0fVxuXG5cdHNldFgoeClcblx0e1xuXHRcdHRoaXMueCA9IHg7XG5cdH1cblxuXHRzZXRZKHkpXG5cdHtcblx0XHR0aGlzLnkgPSB5O1xuXHR9XG5cblx0Z2V0WCgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy54KTtcblx0fVxuXG5cdGdldFkoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMueSk7XG5cdH1cblx0XG5cdGNsb25lKClcblx0e1xuXHRcdHJldHVybihuZXcgUG9zaXRpb24odGhpcy5nZXRYKCksdGhpcy5nZXRZKCkpKTtcblx0fVxuXG5cdGVxdWFscyhwb3NpdGlvbilcblx0e1xuXHRcdHJldHVybiggKHRoaXMuZ2V0WCgpPT1wb3NpdGlvbi5nZXRYKCkpICYmICh0aGlzLmdldFkoKT09cG9zaXRpb24uZ2V0WSgpKSApIDtcblx0fVxuXG5cdGNyZWF0ZUJ5QWRkaW5nKHBvc2l0aW9uKVxuXHR7XG5cdFx0cmV0dXJuKG5ldyBQb3NpdGlvbih0aGlzLmdldFgoKSArIHBvc2l0aW9uLmdldFgoKSx0aGlzLmdldFkoKStwb3NpdGlvbi5nZXRZKCkpKTtcblx0fVxuXG5cdGNyZWF0ZUJ5U3VidHJhY3RpbmcocG9zaXRpb24pXG5cdHtcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuZ2V0WCgpLXBvc2l0aW9uLmdldFgoKSx0aGlzLmdldFkoKS1wb3NpdGlvbi5nZXRZKCkpKTtcblx0fVxuXG5cdGZpbmRDbG9zZXN0UG9zdGlvbk9uTGluZShwMSxwMilcblx0e1xuXHRcdCAgdmFyIEEgPSB0aGlzLmdldERlbHRhWChwMSk7XG5cdFx0ICB2YXIgQiA9IHRoaXMuZ2V0RGVsdGFZKHAxKTtcblx0XHQgIHZhciBDID0gcDIuZ2V0RGVsdGFYKHAxKTtcblx0XHQgIHZhciBEID0gcDIuZ2V0RGVsdGFZKHAxKTtcblx0XG5cdFx0ICB2YXIgZG90ID0gQSAqIEMgKyBCICogRDtcblx0XHQgIHZhciBsZW5ndGhTcXVhcmVkID0gQyAqIEMgKyBEICogRDtcblx0XHQgIHZhciBwYXJhbSA9IC0xO1xuXHRcdCAgaWYgKGxlbmd0aFNxdWFyZWQgIT0gMCkgLy9pbiBjYXNlIG9mIDAgbGVuZ3RoIGxpbmVcblx0XHQgICAgICBwYXJhbSA9IGRvdCAvIGxlbmd0aFNxdWFyZWQ7XG5cdFxuXHRcdCAgdmFyIHh4LCB5eTtcblx0XG5cdFx0ICBpZiAocGFyYW0gPCAwKVxuXHRcdCAge1xuXHRcdCAgICB4eCA9IHAxLmdldFgoKTtcblx0XHQgICAgeXkgPSBwMS5nZXRZKCk7XG5cdFx0ICB9XG5cdFx0ICBlbHNlIGlmIChwYXJhbSA+IDEpIHtcblx0XHQgICAgeHggPSBwMi5nZXRYKCk7XG5cdFx0ICAgIHl5ID0gcDIuZ2V0WSgpO1xuXHRcdCAgfVxuXHRcdCAgZWxzZSB7XG5cdFx0ICAgIHh4ID0gcDEuZ2V0WCgpICsgcGFyYW0gKiBDO1xuXHRcdCAgICB5eSA9IHAxLmdldFkoKSArIHBhcmFtICogRDtcblx0XHQgIH1cblx0Lypcblx0XHQgIHZhciBkeCA9IHggLSB4eDtcblx0XHQgIHZhciBkeSA9IHkgLSB5eTtcblx0XHQgIHJldHVybiBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuXHRcdCAgKi9cblx0XHQgIHJldHVybihuZXcgUG9zaXRpb24oeHgseXkpKTtcblx0fVxuXG5cblx0ZmluZENsb3Nlc3RQb2ludEluTGlzdFx0KHBvc2l0aW9uTGlzdClcblx0e1xuXHRcdHZhciBjbG9zZXRJbmRleCA9IDA7XG5cdFx0dmFyIGNsb3NldFBvaW50ID0gcG9zaXRpb25MaXN0W2Nsb3NldEluZGV4XTtcblx0XHR2YXIgZGlzdGFuY2VUb0Nsb3Nlc3QgPSB0aGlzLmdldERpc3RhbmNlKGNsb3NldFBvaW50KTtcblx0XHRcblx0XHRmb3IodmFyIGk9MDtpPHBvc2l0aW9uTGlzdC5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBwb2ludCA9IHBvc2l0aW9uTGlzdFtpXTtcblx0XHRcdHZhciBkaXN0YW5jZVRvUG9pbnQgPSB0aGlzLmdldERpc3RhbmNlKHBvaW50KTtcblx0XHRcdGlmKGRpc3RhbmNlVG9Qb2ludDxkaXN0YW5jZVRvQ2xvc2VzdClcblx0XHRcdHtcblx0XHRcdFx0Y2xvc2V0SW5kZXggPSBpO1xuXHRcdFx0XHRjbG9zZXRQb2ludCA9IHBvaW50O1xuXHRcdFx0XHRkaXN0YW5jZVRvQ2xvc2VzdCA9IGRpc3RhbmNlVG9Qb2ludDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuKFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2xvc2V0SW5kZXg6Y2xvc2V0SW5kZXgsXG5cdFx0XHRcdFx0Y2xvc2V0UG9pbnQ6Y2xvc2V0UG9pbnQsXG5cdFx0XHRcdFx0ZGlzdGFuY2VUb0Nsb3Nlc3Q6ZGlzdGFuY2VUb0Nsb3Nlc3Rcblx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHR9XG5cblx0bG9nXHQoKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXG5cdFx0XHRcdFwiUG9zaXRpb25cIitcblx0XHRcdFx0XCI6eD1cIit0aGlzLmdldFgoKStcblx0XHRcdFx0XCI6eT1cIit0aGlzLmdldFkoKStcblx0XHRcdFx0XCJcIlxuXHRcdCk7XG5cdH1cblxuXHRnZXREZWx0YVkocG9zaXRpb24pXG5cdHtcblx0XHRyZXR1cm4odGhpcy5nZXRZKCktcG9zaXRpb24uZ2V0WSgpKTtcblx0fVxuXG5cdGdldERlbHRhWChwb3NpdGlvbilcblx0e1xuXHRcdHJldHVybih0aGlzLmdldFgoKS1wb3NpdGlvbi5nZXRYKCkpO1xuXHR9XG5cblx0Z2V0RGVsdGEocG9zaXRpb24pXG5cdHtcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuZ2V0RGVsdGFYKHBvc2l0aW9uKSx0aGlzLmdldERlbHRhWShwb3NpdGlvbikpKTtcblx0fVxuXG5cdGdldERpc3RhbmNlKHBvc2l0aW9uKVxuXHR7XG5cdFx0cmV0dXJuIChNYXRoLnNxcnQoTWF0aC5wb3codGhpcy5nZXREZWx0YVgocG9zaXRpb24pLCAyKSArIE1hdGgucG93KHRoaXMuZ2V0RGVsdGFZKHBvc2l0aW9uKSwgMikpKTtcblx0fVxuXG5cdGdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheShwb3NpdGlvbk9yZyxkaXN0YW5jZSlcblx0e1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHR2YXIgbW9kWCA9IDAuMDtcblx0XHR2YXIgbW9kWSA9IDAuMDtcblx0XG5cdFx0Ly8gd2hhdCBpZiB0aGV5IGFyZSB0b3Agb2YgZWFjaCBvdGhlcj9cblx0XHRpZiAodGhpcy5nZXREZWx0YVgocG9zaXRpb25PcmcpID09IDAgJiYgdGhpcy5nZXREZWx0YVkocG9zaXRpb25PcmcpID09IDApXG5cdFx0e1xuXHRcdFx0bW9kWCArPSBNYXRoLnJhbmRvbSgpIC0gMC41O1xuXHRcdFx0bW9kWSArPSBNYXRoLnJhbmRvbSgpIC0gMC41O1xuXHRcdH1cblx0XG5cdFx0dmFyIHBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKHBvc2l0aW9uT3JnLnggKyBtb2RYLCBwb3NpdGlvbk9yZy55ICsgbW9kWSk7XG5cdFxuXHRcdC8vIHRoaXMgaXMgd2hlbiB0aGUgc2xvcGUgaXMgdW5kZWZpbmVkICh0b3RhbGx5IGhvcml6b250YWwgbGluZSlcblx0XHRpZiAocG9zaXRpb24uZ2V0WCgpID09IHRoaXMuZ2V0WCgpKVxuXHRcdHtcblx0XHRcdHZhciBwMSA9IG5ldyBQb3NpdGlvbihwb3NpdGlvbi5nZXRYKCkscG9zaXRpb24uZ2V0WSgpK2Rpc3RhbmNlKTtcblx0XHRcdHZhciBwMiA9IG5ldyBQb3NpdGlvbihwb3NpdGlvbi5nZXRYKCkscG9zaXRpb24uZ2V0WSgpLWRpc3RhbmNlKTtcblx0XHRcdHAxLmRpc3RhbmNlID0gdGhpcy5nZXREaXN0YW5jZShwMSlcblx0XHRcdHAyLmRpc3RhbmNlID0gdGhpcy5nZXREaXN0YW5jZShwMilcblx0XG5cdFx0XHRwb3NpdGlvbkxpc3QucHVzaChwMSk7XG5cdFx0XHRwb3NpdGlvbkxpc3QucHVzaChwMik7XG5cdFx0XHRyZXR1cm4ocG9zaXRpb25MaXN0KTtcblx0XHR9XG5cdFxuXHRcdC8vIGdldCB0aGUgZXF1YXRpb24gZm9yIHRoZSBsaW5lIG09c2xvcGUgYj15LWludGVyY2VwdFxuXHRcdHZhciBtID0gdGhpcy5nZXREZWx0YVkocG9zaXRpb24pIC8gdGhpcy5nZXREZWx0YVgocG9zaXRpb24pO1xuXHRcdHZhciBiID0gdGhpcy5nZXRZKCkgLSAobSAqIHRoaXMuZ2V0WCgpKTtcblx0XG5cdFx0dmFyIHhQbHVzID0gcG9zaXRpb24uZ2V0WCgpICsgZGlzdGFuY2UgLyBNYXRoLnNxcnQoMSArIChtICogbSkpO1xuXHRcdHZhciB4TWludXMgPSBwb3NpdGlvbi5nZXRYKCkgLSBkaXN0YW5jZSAvIE1hdGguc3FydCgxICsgKG0gKiBtKSk7XG5cdFx0dmFyIHlQbHVzID0geFBsdXMgKiBtICsgYjtcblx0XHR2YXIgeU1pbnVzID0geE1pbnVzICogbSArIGI7XG5cdFxuXHRcdHZhciBwMSA9IG5ldyBQb3NpdGlvbih4UGx1cywgeVBsdXMpO1xuXHRcdHZhciBwMiA9IG5ldyBQb3NpdGlvbih4TWludXMsIHlNaW51cyk7XG5cdFx0cDEuZGlzdGFuY2UgPSB0aGlzLmdldERpc3RhbmNlKHAxKVxuXHRcdHAyLmRpc3RhbmNlID0gdGhpcy5nZXREaXN0YW5jZShwMilcblx0XG5cdFx0cG9zaXRpb25MaXN0LnB1c2gocDEpO1xuXHRcdHBvc2l0aW9uTGlzdC5wdXNoKHAyKTtcblx0XHRyZXR1cm4ocG9zaXRpb25MaXN0KTtcblx0fVxuXG5cdGdldERpc3RhbmNlUG9zdGlvbkxpc3QocG9zaXRpb25MaXN0KVxuXHR7XG5cdFx0dmFyIGRpc3RhbmNlTGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIHAgPSBwb3NpdGlvbkxpc3RbaV07XG5cdFx0XHR2YXIgZCA9IHRoaXMuZ2V0RGlzdGFuY2UocCk7XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBuZXcgUG9zaXRpb24ocC5nZXRYKCksIHAuZ2V0WSgpKTtcblx0XHRcdHBvc2l0aW9uLmRpc3RhbmNlID0gZDtcblx0XHRcdGRpc3RhbmNlTGlzdC5wdXNoKHBvc2l0aW9uKTtcblx0XHR9XG5cdFx0cmV0dXJuIChkaXN0YW5jZUxpc3QpO1xuXHR9XG5cblx0Z2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5Q2xvc2VzdChwb3NpdGlvbixkaXN0YW5jZSlcblx0e1xuXHRcdHZhciBwb3NpdGlvbkxpc3QgPSB0aGlzLmdldERpc3RhbmNlT25MaW5lUG9pbnRBcnJheShwb3NpdGlvbixkaXN0YW5jZSk7XG5cdFx0dmFyIGNsb3Nlc3QgPSBudWxsO1xuXHRcdGZvcih2YXIgaT0wO2k8cG9zaXRpb25MaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1x0XHRcblx0XHRcdHZhciBwb3NpdGlvbiA9IHBvc2l0aW9uTGlzdFtpXTtcblx0XHRcdGlmKGNsb3Nlc3Q9PW51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGNsb3Nlc3QgPSBwb3NpdGlvbjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYocG9zaXRpb24uZGlzdGFuY2UgPCBjbG9zZXN0LmRpc3RhbmNlKVxuXHRcdFx0e1xuXHRcdFx0XHRjbG9zZXN0ID0gcG9zaXRpb247XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vLy9jb25zb2xlLmxvZyhcImNsb3Nlc3Q9XCIrQ29tbW9udG9TdHJpbmcoY2xvc2VzdCkrXCIgZ2l2ZW4gZGlzdGFuY2U9XCIrZGlzdGFuY2UrXCIgcG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcocG9zaXRpb24pK1wiIGxpc3Q9XCIrQ29tbW9udG9TdHJpbmcocG9zaXRpb25MaXN0KSlcblx0XHRyZXR1cm4gKGNsb3Nlc3QpO1xuXHR9XG5cblx0Z2V0RGlzdGFuY2VPbkxpbmVQb2ludEFycmF5RmFydGhlc3QocG9zaXRpb24sZGlzdGFuY2UpXG5cdHtcblx0XHR2YXIgcG9zaXRpb25MaXN0ID0gdGhpcy5nZXREaXN0YW5jZU9uTGluZVBvaW50QXJyYXkocG9zaXRpb24sZGlzdGFuY2UpO1xuXHRcdHZhciBmYXJ0aGVzdCA9IG51bGw7XG5cdFx0Zm9yKHZhciBpPTA7aTxwb3NpdGlvbkxpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkxpc3RbaV07XG5cdFx0XHRpZihmYXJ0aGVzdD09bnVsbClcblx0XHRcdHtcblx0XHRcdFx0ZmFydGhlc3QgPSBwb3NpdGlvbjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYocG9zaXRpb24uZGlzdGFuY2UgPiBmYXJ0aGVzdC5kaXN0YW5jZSlcblx0XHRcdHtcblx0XHRcdFx0ZmFydGhlc3QgPSBwb3NpdGlvbjtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIChmYXJ0aGVzdCk7XG5cdH1cbn1cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gUG9zaXRpb247XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6UG9zaXRpb25cIik7XG4vLzwvanMybm9kZT5cbiIsImNsYXNzIEJvdW5kaW5nQm94XG57XG5cdGNvbnN0cnVjdG9yKHBvaW50TGlzdClcblx0e1xuXHRcdHRoaXMuaW5pdERvbmUgPSBmYWxzZTtcblx0XHR0aGlzLnBvaW50TGlzdCA9IHBvaW50TGlzdDtcblx0XHR0aGlzLmluaXRCb3VuZGluZ0JveCgpO1xuXHRcblx0fVxuXHRcblx0XG5cdGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSlcblx0e1xuXHRcdGlmKCF0aGlzLmluaXREb25lKSB0aGlzLmluaXRCb3VuZGluZ0JveCgpO1xuXHRcblx0XHRyZXR1cm4oXG5cdFx0XHRcdChcblx0XHRcdFx0XHRcdCh0aGlzLnhNaW4uZ2V0WCgpK25vZGUucG9zaXRpb24uZ2V0WCgpKT49cG9zaXRpb24ueCAmJlxuXHRcdFx0XHRcdFx0KHRoaXMueE1heC5nZXRYKCkrbm9kZS5wb3NpdGlvbi5nZXRYKCkpPD1wb3NpdGlvbi54ICYmXG5cdFx0XHRcdFx0XHQodGhpcy55TWluLmdldFkoKStub2RlLnBvc2l0aW9uLmdldFkoKSk+PXBvc2l0aW9uLnkgJiZcblx0XHRcdFx0XHRcdCh0aGlzLnlNYXguZ2V0WSgpK25vZGUucG9zaXRpb24uZ2V0WSgpKTw9cG9zaXRpb24ueVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHR9XG5cdFxuXHRpbml0Qm91bmRpbmdCb3goKVxuXHR7XG5cdFx0dGhpcy5pbml0RG9uZSA9IHRydWU7XG5cdFx0Ly90aGlzLnBvaW50TGlzdCA9IHBvaW50TGlzdDtcblx0XG5cdFxuXHRcdHRoaXMueE1pbiA9IG51bGw7XG5cdFx0dGhpcy54TWF4ID0gbnVsbDtcblx0XHR0aGlzLnlNaW4gPSBudWxsO1xuXHRcdHRoaXMueU1heCA9IG51bGw7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInBsaXN0IHNpemU9XCIrcG9pbnRMaXN0Lmxlbmd0aCk7XG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLnBvaW50TGlzdC5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBwID0gdGhpcy5wb2ludExpc3RbaV07XG5cdFx0XHRpZih0aGlzLnhNaW49PW51bGwpIHRoaXMueE1pbiA9IHA7XG5cdFx0XHRpZih0aGlzLnhNYXg9PW51bGwpIHRoaXMueE1heCA9IHA7XG5cdFx0XHRpZih0aGlzLnlNaW49PW51bGwpIHRoaXMueU1pbiA9IHA7XG5cdFx0XHRpZih0aGlzLnlNYXg9PW51bGwpIHRoaXMueU1heCA9IHA7XG5cdFx0XHRcblx0XHRcdGlmKHAuZ2V0WCgpPHRoaXMueE1pbikgdGhpcy54TWluID0gcDtcblx0XHRcdGlmKHAuZ2V0WCgpPnRoaXMueE1heCkgdGhpcy54TWF4ID0gcDtcblx0XHRcdGlmKHAuZ2V0WSgpPHRoaXMueU1pbikgdGhpcy55TWluID0gcDtcblx0XHRcdGlmKHAuZ2V0WSgpPnRoaXMueU1heCkgdGhpcy55TWF4ID0gcDtcblx0XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMud2lkdGggPSB0aGlzLnhNYXguZ2V0WCgpLXRoaXMueE1pbi5nZXRYKCk7XG5cdFx0dGhpcy5oZWlnaHQgPSB0aGlzLnlNYXguZ2V0WSgpLXRoaXMueU1pbi5nZXRZKCk7XG5cdH1cbn1cblxuXG5cblxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gQm91bmRpbmdCb3g7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6Qm91bmRpbmdCb3hcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgQm91bmRpbmdCb3ggPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9zaGFwZXMvYm91bmRpbmdib3gnKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL2NvbW1vbicpO1xuXG5jbGFzcyBTaGFwZVxue1xuXHRjb25zdHJ1Y3Rvcihwb2ludExpc3QpXG5cdHtcblx0XHR0aGlzLnBvaW50TGlzdCA9IHBvaW50TGlzdDtcblx0XHR0aGlzLmF2ZXJhZ2VQb2ludCA9IG5ldyBQb3NpdGlvbigwLDApO1xuXHRcdHRoaXMuYm91bmRpbmdCb3ggPSBuZXcgQm91bmRpbmdCb3gocG9pbnRMaXN0KTtcblx0XHR0aGlzLmluaXRTaGFwZSgpO1xuXHR9XG5cdFxuXHRpbml0U2hhcGUoKVxuXHR7XG5cdFx0aWYoIXRoaXMucG9pbnRMaXN0W3RoaXMucG9pbnRMaXN0Lmxlbmd0aC0xXS5lcXVhbHModGhpcy5wb2ludExpc3RbMF0pKSBcblx0XHRcdHRoaXMucG9pbnRMaXN0LnB1c2godGhpcy5wb2ludExpc3RbMF0uY2xvbmUoKSk7XG5cdFx0XG5cdFx0XG5cdFx0UG9zaXRpb24uZ2V0QXZlcmFnZVBvc3Rpb25Gcm9tUG9zaXRpb25MaXN0KHRoaXMucG9pbnRMaXN0KS5jb3B5VG8odGhpcy5hdmVyYWdlUG9pbnQpO1xuXHRcdFxuXHRcdHRoaXMuZHJhd0NlbnRlckRvdCA9IGZhbHNlO1xuXHRcdC8qXG5cdFx0Zm9yKHZhciBpPTA7aTxwb2ludExpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhcImk9XCIraStcIiBcIitDb21tb250b1N0cmluZyhwb2ludExpc3RbaV0pKTtcblx0XHR9XG5cdFx0Ki9cblx0XHRcblx0fVxuXHRcblx0ZHJhd1NoYXBlKGNhbnZhc0hvbGRlcixub2RlLGRpc3BsYXlJbmZvKVxuXHR7XG5cdCAgICBpZihub2RlLmlzU2VsZWN0ZWQpXG5cdCAgICB7XG5cdCAgICBcdGNhbnZhc0hvbGRlci5jb250ZXh0LmZpbGxTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcoZGlzcGxheUluZm8uc2VsZWN0RmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKGRpc3BsYXlJbmZvLnNlbGVjdEJvcmRlckNvbG9yKTtcblx0ICAgIH1cblx0ICAgIGVsc2Vcblx0ICAgIHtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyhkaXNwbGF5SW5mby5maWxsQ29sb3IpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcoZGlzcGxheUluZm8uYm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgICAgXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5iZWdpblBhdGgoKTtcblx0ICAgIGZvcih2YXIgaT0wO2k8dGhpcy5wb2ludExpc3QubGVuZ3RoO2krKylcblx0ICAgIHsgICBcdFxuXHRcdFx0dmFyIHBvaW50ID0gdGhpcy5wb2ludExpc3RbaV0uY3JlYXRlQnlBZGRpbmcobm9kZS5wb3NpdGlvbik7XG5cdCAgICBcdGlmKGk9PTApIGNhbnZhc0hvbGRlci5jb250ZXh0Lm1vdmVUbyhwb2ludC5nZXRYKCkscG9pbnQuZ2V0WSgpKTtcblx0ICAgIFx0ZWxzZSBjYW52YXNIb2xkZXIuY29udGV4dC5saW5lVG8ocG9pbnQuZ2V0WCgpLHBvaW50LmdldFkoKSk7XG5cdCAgICB9XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5jbG9zZVBhdGgoKTtcblx0ICAgIFxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gZGlzcGxheUluZm8uYm9yZGVyV2lkdGg7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2UoKTtcblx0ICAgIFxuXHQgICAgaWYodGhpcy5kcmF3Q2VudGVyRG90KVxuXHQgICAge1xuXHQgICAgXHR2YXIgYXZlcmFnZVRyYW5zID0gdGhpcy5nZXRBdmVyYWdlUG9pbnRUcmFuc2Zvcm1lZChub2RlKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbFN0eWxlID0gQ29tbW9uLmdldENvbG9yRnJvbVN0cmluZyhcIjAwMDAwMGZmXCIpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5iZWdpblBhdGgoKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuYXJjKG5vZGUucG9zaXRpb24uZ2V0WCgpLG5vZGUucG9zaXRpb24uZ2V0WSgpLDIsMCxNYXRoLlBJICogMiwgZmFsc2UpO1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5jbG9zZVBhdGgoKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpO1xuXHRcdH1cblx0fVxuXHRcblx0Z2V0QXZlcmFnZVBvaW50VHJhbnNmb3JtZWQobm9kZSlcblx0e1xuXHQgICAgdmFyIGF2ZXJhZ2VQb2ludFRyYW5zZm9ybWVkID0gdGhpcy5hdmVyYWdlUG9pbnQuY3JlYXRlQnlBZGRpbmcobm9kZS5wb3NpdGlvbik7XG5cdCAgICByZXR1cm4oYXZlcmFnZVBvaW50VHJhbnNmb3JtZWQpO1xuXHR9XG5cdFxuXHQvL2Z1bmN0aW9uIHBvbHlnb25BcmVhKFgsIFksIG51bVBvaW50cykgXG5cdFxuXHRnZXRTaGFwZUFyZWEoKVxuXHR7IFxuXHQgIHZhciBhcmVhID0gMDsgICAgICAgICAvLyBBY2N1bXVsYXRlcyBhcmVhIGluIHRoZSBsb29wXG5cdCAgdmFyIGogPSB0aGlzLnBvaW50TGlzdC5sZW5ndGgtMTsgIC8vIFRoZSBsYXN0IHZlcnRleCBpcyB0aGUgJ3ByZXZpb3VzJyBvbmUgdG8gdGhlIGZpcnN0XG5cdFxuXHQgIGZvciAodmFyIGk9MDsgaTx0aGlzLnBvaW50TGlzdC5sZW5ndGg7IGkrKylcblx0ICB7IFxuXHRcdCAgYXJlYSA9IGFyZWEgKyAodGhpcy5wb2ludExpc3Rbal0uZ2V0WCgpK3RoaXMucG9pbnRMaXN0W2ldLmdldFgoKSkgKlxuXHRcdCAgXHQodGhpcy5wb2ludExpc3Rbal0uZ2V0WSgpLXRoaXMucG9pbnRMaXN0W2ldLmdldFkoKSk7IFxuXHQgICAgICBqID0gaTsgIC8vaiBpcyBwcmV2aW91cyB2ZXJ0ZXggdG8gaVxuXHQgIH1cblx0ICBpZihhcmVhPDApIGFyZWEgPSBhcmVhICogLTE7XG5cdCAgcmV0dXJuKGFyZWEvMik7XG5cdH1cblx0XG5cdFxuXHRnZXRTaGFwZUFyZWEyKClcblx0eyBcblx0XHR2YXIgYXJlYSA9IDA7IC8vIEFjY3VtdWxhdGVzIGFyZWEgaW4gdGhlIGxvb3Bcblx0XHR2YXIgaiA9IHRoaXMucG9pbnRMaXN0Lmxlbmd0aC0xOyAvLyBUaGUgbGFzdCB2ZXJ0ZXggaXMgdGhlICdwcmV2aW91cycgb25lIHRvIHRoZSBmaXJzdFxuXHRcdGZvciAoaT0wO2k8dGhpcy5wb2ludExpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHRhcmVhID0gYXJlYSArICh0aGlzLnBvaW50TGlzdFtqXS5nZXRYKCkrdGhpcy5wb2ludExpc3RbaV0uZ2V0WCgpKSAqXG5cdFx0XHRcdCh0aGlzLnBvaW50TGlzdFtqXS5nZXRZKCkrdGhpcy5wb2ludExpc3RbaV0uZ2V0WSgpKTsgXG5cdFx0XHRqID0gaTsgLy9qIGlzIHByZXZpb3VzIHZlcnRleCB0byBpXG5cdFx0XHRcblx0XHRcdGNvbnNvbGUubG9nKFwiWFhYWFhYWFhYWFg6aT1cIitpK1wiIGFyZWE9XCIrYXJlYSk7XG5cdFxuXHRcdH1cblx0XHRyZXR1cm4oYXJlYSk7XG5cdH1cblx0XG5cdGZpbmRDbG9zZXN0UG9pbnRJblNoYXBlRnJvbVN0YXJ0aW5nUG9pbnQoc3RhcnRpbmdQb3NpdGlvbixub2RlKVxuXHR7XG5cdFx0dmFyIGxvb2tGcm9tUG9zaXRpb24gPSBzdGFydGluZ1Bvc2l0aW9uLmNyZWF0ZUJ5U3VidHJhY3Rpbmcobm9kZS5wb3NpdGlvbik7XG5cdFx0dmFyIGNsb3Nlc3RJbmZvID0gbG9va0Zyb21Qb3NpdGlvbi5maW5kQ2xvc2VzdFBvaW50SW5MaXN0KHRoaXMucG9pbnRMaXN0KTtcblx0XG5cdFx0dmFyIGVuZE9mTGlzdCA9IHRoaXMucG9pbnRMaXN0Lmxlbmd0aC0xO1xuXHRcdGlmKHRoaXMucG9pbnRMaXN0WzBdLmVxdWFscyh0aGlzLnBvaW50TGlzdFtlbmRPZkxpc3RdKSkgZW5kT2ZMaXN0ID0gZW5kT2ZMaXN0IC0gMTtcblx0XHRcdFxuXHRcdHZhciBjbG9zZXN0UG9pbnQgPSBjbG9zZXN0SW5mby5jbG9zZXRQb2ludDtcblx0XHR2YXIgcDFJbmRleCA9IGNsb3Nlc3RJbmZvLmNsb3NldEluZGV4LTE7XG5cdFx0dmFyIHAySW5kZXggPSBjbG9zZXN0SW5mby5jbG9zZXRJbmRleCsxO1xuXHRcdGlmKGNsb3Nlc3RJbmZvLmNsb3NldEluZGV4PT0wKSBwMUluZGV4ID0gZW5kT2ZMaXN0O1xuXHRcdGlmKGNsb3Nlc3RJbmZvLmNsb3NldEluZGV4PT1lbmRPZkxpc3QpIHAySW5kZXggPSAwO1xuXHRcdFxuXHRcdHZhciBwMSA9IHRoaXMucG9pbnRMaXN0W3AxSW5kZXhdO1xuXHRcdHZhciBwMiA9IHRoaXMucG9pbnRMaXN0W3AySW5kZXhdO1xuXHRcdFxuXHRcdFxuXHRcdHZhciBkaXN0YW5jZVRvQ2xvc2VzdCA9IGNsb3Nlc3RJbmZvLmRpc3RhbmNlVG9DbG9zZXN0O1xuXHRcdHZhciBwMUxpbmVQb2ludCA9IGxvb2tGcm9tUG9zaXRpb24uZmluZENsb3Nlc3RQb3N0aW9uT25MaW5lKGNsb3Nlc3RQb2ludCxwMSk7XG5cdFx0dmFyIHAyTGluZVBvaW50ID0gbG9va0Zyb21Qb3NpdGlvbi5maW5kQ2xvc2VzdFBvc3Rpb25PbkxpbmUoY2xvc2VzdFBvaW50LHAyKTtcblx0XHR2YXIgcDFEaXN0YW5jZSA9IGxvb2tGcm9tUG9zaXRpb24uZ2V0RGlzdGFuY2UocDFMaW5lUG9pbnQpO1xuXHRcdHZhciBwMkRpc3RhbmNlID0gbG9va0Zyb21Qb3NpdGlvbi5nZXREaXN0YW5jZShwMkxpbmVQb2ludCk7XG5cdFx0XG5cdFx0dmFyIGZpbmFsUG9pbnQgPSBjbG9zZXN0UG9pbnQ7XG5cdFx0dmFyIGZpbmFsRGlzdGFuY2UgPSBkaXN0YW5jZVRvQ2xvc2VzdDtcblx0XHRpZihkaXN0YW5jZVRvQ2xvc2VzdDxwMURpc3RhbmNlICYmIGRpc3RhbmNlVG9DbG9zZXN0PHAyRGlzdGFuY2UpXG5cdFx0e1xuXHRcdFx0ZmluYWxQb2ludCA9IGNsb3NldFBvaW50O1xuXHRcdFx0ZmluYWxEaXN0YW5jZSA9IGRpc3RhbmNlVG9DbG9zZXN0O1xuXHRcdH1cblx0XHRlbHNlIGlmKHAxRGlzdGFuY2U8cDJEaXN0YW5jZSlcblx0XHR7XG5cdFx0XHRmaW5hbFBvaW50ID0gcDFMaW5lUG9pbnQ7XG5cdFx0XHRmaW5hbERpc3RhbmNlID0gcDFEaXN0YW5jZTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGZpbmFsUG9pbnQgPSBwMkxpbmVQb2ludDtcblx0XHRcdGZpbmFsRGlzdGFuY2UgPSBwMkRpc3RhbmNlO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgZmluYWxQb2ludFRyYW5zbGF0ZWQgPSBmaW5hbFBvaW50LmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pO1xuXHRcdFxuXHRcdC8qXG5cdFx0Y29uc29sZS5sb2coQ29tbW9udG9TdHJpbmcoY2xvc2VzdEluZm8pKTtcblx0ICAgIGNvbnNvbGUubG9nKFwic3RhcnRpbmdQb3NpdGlvbj1cIitDb21tb250b1N0cmluZyhzdGFydGluZ1Bvc2l0aW9uKSk7XG5cdFx0Y29uc29sZS5sb2coXCJsb29rRnJvbVBvc2l0aW9uPVwiK0NvbW1vbnRvU3RyaW5nKGxvb2tGcm9tUG9zaXRpb24pKTtcblx0XHRjb25zb2xlLmxvZyhcIm5vZGUucG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcobm9kZS5wb3NpdGlvbikpO1xuXHRcdGNvbnNvbGUubG9nKFwidGhpcy5wb2ludExpc3QubGVuZ3RoPVwiK3RoaXMucG9pbnRMaXN0Lmxlbmd0aCk7XG5cdFx0Y29uc29sZS5sb2coXCJjbG9zZXN0SW5mby5jbG9zZXRJbmRleD1cIitjbG9zZXN0SW5mby5jbG9zZXRJbmRleCk7XG5cdFx0Y29uc29sZS5sb2coXCJlbmRPZkxpc3Q9XCIrZW5kT2ZMaXN0KTtcblx0XHRjb25zb2xlLmxvZyhcInAxSW5kZXg9XCIrcDFJbmRleCk7XG5cdFx0Y29uc29sZS5sb2coXCJwMkluZGV4PVwiK3AySW5kZXgpO1xuXHRcdGNvbnNvbGUubG9nKFwiY2xvc2VzdEluZm8uY2xvc2V0SW5kZXg9XCIrY2xvc2VzdEluZm8uY2xvc2V0SW5kZXgpO1xuXHRcdGNvbnNvbGUubG9nKFwicDE6XCIrQ29tbW9udG9TdHJpbmcocDEpKTtcblx0XHRjb25zb2xlLmxvZyhcInAyOlwiK0NvbW1vbnRvU3RyaW5nKHAyKSk7XG5cdFxuXHRcdGNvbnNvbGUubG9nKFwiZmluYWxEaXN0YW5jZT1cIitmaW5hbERpc3RhbmNlKTtcblx0XHRjb25zb2xlLmxvZyhcImZpbmFsUG9pbnQ9XCIrQ29tbW9udG9TdHJpbmcoZmluYWxQb2ludCkpO1xuXHRcdGNvbnNvbGUubG9nKFwiZmluYWxQb2ludFRyYW5zbGF0ZWR0PVwiK0NvbW1vbnRvU3RyaW5nKGZpbmFsUG9pbnRUcmFuc2xhdGVkKSk7XG5cdFx0Y29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xuXHRcdCovXG5cdFxuXHRcdHJldHVybihmaW5hbFBvaW50VHJhbnNsYXRlZCk7XG5cdH1cblx0XG5cdFxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXG5cdHtcblx0XHRpZih0aGlzLmJvdW5kaW5nQm94LmNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24sbm9kZSkpIHJldHVybiBmYWxzZTtcblx0XHRcblx0XHR2YXIgaTtcblx0XHR2YXIgajtcblx0XHR2YXIgYyA9IGZhbHNlO1xuXHRcdGZvcihpPTAsaj10aGlzLnBvaW50TGlzdC5sZW5ndGgtMTtpPCB0aGlzLnBvaW50TGlzdC5sZW5ndGg7aj1pKyspXG5cdFx0e1xuXHRcdFx0Ly9cblx0XHRcdHZhciBwaSA9IHRoaXMucG9pbnRMaXN0W2ldLmNyZWF0ZUJ5QWRkaW5nKG5vZGUucG9zaXRpb24pO1xuXHRcdFx0dmFyIHBqID0gdGhpcy5wb2ludExpc3Rbal0uY3JlYXRlQnlBZGRpbmcobm9kZS5wb3NpdGlvbik7XG5cdFx0XHQgIFxuXHRcdFx0aWYgKFxuXHRcdFx0XHQoKHBpLmdldFkoKT5wb3NpdGlvbi5nZXRZKCkpICE9IChwai5nZXRZKCk+cG9zaXRpb24uZ2V0WSgpKSkgJiZcblx0XHRcdFx0XHQocG9zaXRpb24uZ2V0WCgpIDwgKHBqLmdldFgoKS1waS5nZXRYKCkpICpcblx0XHRcdFx0XHQocG9zaXRpb24uZ2V0WSgpLXBpLmdldFkoKSkgL1xuXHRcdFx0XHRcdChwai5nZXRZKCktcGkuZ2V0WSgpKSArXG5cdFx0XHRcdFx0cGkuZ2V0WCgpKSApXG5cdFx0XHRcdGMgPSAhYztcblx0XHR9XG5cdFx0cmV0dXJuIGM7XG5cdH1cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlNoYXBlXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgTm9kZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGUnKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2NvbW1vbicpO1xudmFyIENvbm5lY3RvckRpc3BsYXlFbXB0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2Nvbm5lY3RvcmRpc3BsYXkvY29ubmVjdG9yZGlzcGxheWVtcHR5Jyk7XG52YXIgU2hhcGVDb25uZWN0b3IgPSByZXF1aXJlKCcuLi9ub2Rlcy9jb25uZWN0b3Ivc2hhcGVjb25uZWN0b3InKTtcbnZhciBBcmNEaXNwbGF5U2hhcGUgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlZGlzcGxheS9hcmNkaXNwbGF5c2hhcGUnKTtcblxuXG5jbGFzcyBKdW5jdGlvbiBleHRlbmRzIE5vZGVcbntcblx0Y29uc3RydWN0b3IobmFtZSxwb3NpdGlvbixjYW52YXNIb2xkZXIsc2hhcGVMaXN0LGdyYXBoRGF0YUtleSxpbmZvRGF0YSx3b3JsZClcblx0e1xuXHRcdHN1cGVyKG5hbWUscG9zaXRpb24sY2FudmFzSG9sZGVyLGdyYXBoRGF0YUtleSxpbmZvRGF0YSk7XG5cdFx0dGhpcy5wYXRoQXJyYXkgPSBuZXcgQXJyYXkoKTtcblx0XHR0aGlzLndhbGtlck9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0XHR0aGlzLndhbGtlclR5cGVDb25uZWN0aW9ucyA9IG5ldyBPYmplY3QoKTtcblx0XHR0aGlzLmxheWVyPTE7XG5cdFx0dGhpcy53b3JsZCA9IHdvcmxkO1xuXHR9XG5cblx0Z2V0Q2xpZW50SnNvbigpXG5cdHtcblx0XHR2YXIganNvbiA9IHN1cGVyLmdldENsaWVudEpzb24oKTtcblx0XHRqc29uLnBhdGhXb3JsZFR5ZSA9IFwianVuY3Rpb25cIjtcblx0XHRcblx0XHRcblx0XHR2YXIgd2Fsa2VyTGlzdCA9IHRoaXMuZ2V0V2Fsa2VyQXJyYXkoKTtcblx0XHRqc29uLndhbGtlckxpc3QgPSBuZXcgQXJyYXkoKTtcblx0XHRcblx0XHRmb3IodmFyIGk9MDtpPHdhbGtlckxpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHRqc29uLndhbGtlckxpc3QucHVzaCh3YWxrZXJMaXN0W2ldLmdldE5vZGVLZXkoKSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybihqc29uKTtcblx0fVxuXHRcblx0Z2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb24od2Fsa2VyVHlwZSlcblx0e1xuXHRcdGlmKCF0aGlzLndhbGtlclR5cGVDb25uZWN0aW9ucy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJUeXBlKSlcblx0XHR7XG5cdFx0XHR2YXIgd2Fsa2VyR3JhcGhEYXRhID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0R3JhcGhEYXRhKHdhbGtlclR5cGUpO1xuXHRcdFx0LyoqKlxuXHRcdFx0dGhpcy53b3JsZC53b3JsZERpc3BsYXkud2Fsa2VyRGlzcGxheVR5cGVzW1wiZ2VuZXJpY1wiXTtcblx0XHRcdGlmKHRoaXMud29ybGQud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlcy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJUeXBlKSlcblx0XHRcdHtcblx0XHRcdFx0d2Fsa2VyR3JhcGhEYXRhID0gdGhpcy53b3JsZC53b3JsZERpc3BsYXkud2Fsa2VyRGlzcGxheVR5cGVzW3dhbGtlclR5cGVdO1xuXHRcdFx0fSovXG5cdFx0XHQvKlxuXHRcdFx0Y29uc29sZS5sb2coXCJhZGRpbmcgXCIrd2Fsa2VyVHlwZStcblx0XHRcdFx0XHRcIiB0aGlzLmNvbm5lY3RvclBvc2l0aW9uPVwiK0NvbW1vbnRvU3RyaW5nKHRoaXMuY29ubmVjdG9yUG9zaXRpb24pK1xuXHRcdFx0XHRcdFwiIHRoaXMucG9zaXRpb249XCIrQ29tbW9udG9TdHJpbmcodGhpcy5wb3NpdGlvbikrXHRcdFxuXHRcdFx0XHRcdFwiXCIpO1xuXHRcdFx0XHRcdCovXG5cdFx0XHQvKlxuXHRcdFx0Y29uc29sZS5sb2coXCJuZCA9XCIrQ29tbW9udG9TdHJpbmcod2Fsa2VyR3JhcGhEYXRhKStcblx0XHRcdFx0XHRcIlwiKTtcblx0XHRcdFx0XHQqL1xuXHRcdFx0dmFyIHNoYXBlTm9kZSA9IG5ldyBOb2RlKFxuXHRcdFx0XHRcdFx0XCJzaGFwZU5vZGUgZm9yIFwiK3RoaXMubmFtZStcIiBcIit3YWxrZXJUeXBlLFxuXHRcdFx0XHRcdFx0dGhpcy5wb3NpdGlvbixcblx0XHRcdFx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLFxuXHRcdFx0XHRcdFx0XCJqdW5jdGlvblBpZVNsaWNlXCIsXG5cdFx0XHRcdFx0XHRuZXcgT2JqZWN0KClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XG5cdFx0XHRcblx0XHRcdHNoYXBlTm9kZS5sYXllcj0xMDtcblx0XHRcdHNoYXBlTm9kZS5kZWJ1Z0Z1bmN0aW9uKClcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImRlYnVnRnVuY3Rpb246XCIrdGhpcy5uYW1lKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV0gPSBuZXcgU2hhcGVDb25uZWN0b3IoXG5cdFx0XHRcdFx0c2hhcGVOb2RlLFxuXHRcdFx0XHRcdG5ldyBDb25uZWN0b3JEaXNwbGF5RW1wdHkoKSxcblx0XHRcdFx0XHRzaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LnNoYXBlLFxuXHRcdFx0XHRcdG5ldyBQb3NpdGlvbigwLDApLFxuXHRcdFx0XHRcdDEwLFxuXHRcdFx0XHRcdDAuNSxcblx0XHRcdFx0XHQwLjAsXG5cdFx0XHRcdFx0MC45NSxcblx0XHRcdFx0XHR0aGlzLm5hbWUrXCI6XCIrd2Fsa2VyVHlwZStcIjpcIitzaGFwZU5vZGUubmFtZSk7XG5cdFx0XHR0aGlzLndhbGtlclR5cGVDb25uZWN0aW9uc1t3YWxrZXJUeXBlXS5zaGFwZU5vZGUgPSBzaGFwZU5vZGU7XG5cdFx0XHQvL3RoaXMubm9kZXMucHVzaChzaGFwZU5vZGUpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHR0aGlzLmFkZE5vZGUoc2hhcGVOb2RlKTtcblx0XHRcdHRoaXMuc2hhcGVOb2RlID0gc2hhcGVOb2RlO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImdldENyZWF0ZVdhbGtlclR5cGVDb25uZWN0aW9uOkdPVCBORVc6d2Fsa2VyPVwiK3RoaXMubmFtZStcIjp3YWxrZXJUeXBlPVwiK3dhbGtlclR5cGUrXCI6dHM9XCIrc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby50cyk7XG5cdFx0XHRcblx0XHR9XG5cdFx0dmFyIGNvbm5lY3Rpb24gPSB0aGlzLndhbGtlclR5cGVDb25uZWN0aW9uc1t3YWxrZXJUeXBlXTtcblx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb246d2Fsa2VyPVwiK3RoaXMubmFtZStcIjp3YWxrZXJUeXBlPVwiK3dhbGtlclR5cGUrXCI6dHM9XCIrY29ubmVjdGlvbi5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLnRzKTtcblx0XHRcblx0XHRyZXR1cm4oY29ubmVjdGlvbik7XG5cdH1cblx0XG5cdGdldE5vZGVVaURpc3BsYXkobm9kZSlcblx0e1xuXHRcdHJldHVybihcblx0XHRcdFx0XCI8dWw+XCIrXG5cdFx0XHRcdFwiPGxpPiBuYW1lIDogXCIrdGhpcy5uYW1lK1wiPC9saT5cIitcblx0XHRcdFx0XCI8bGk+IG5vZGVLZXkudHMgOiBcIit0aGlzLmluZm9EYXRhLm5vZGVLZXkua2V5K1wiPC9saT5cIitcblx0XHRcdFx0XCI8bGk+IG5vZGVLZXkubm9kZUlkIDogXCIrdGhpcy5pbmZvRGF0YS5ub2RlS2V5Lm5vZGVJZCtcIjwvbGk+XCIrXG5cdFx0XHRcdFwiPC91bD5cIik7XG5cdH1cblx0XG5cdGdldFdhbGtlcktleXNTb3J0ZWQobm9kZSlcblx0e1xuXHRcdHZhciB3YWxrZXJUeXBlS2V5cyA9IG5ldyBBcnJheSgpXG5cdFx0dmFyIHRvdGFsV2Fsa2VycyA9IDA7XG5cdFx0Zm9yICh2YXIgd2Fsa2VyVHlwZSBpbiB0aGlzLndhbGtlclR5cGVDb25uZWN0aW9ucylcblx0XHR7XG5cdFx0XHR3YWxrZXJUeXBlS2V5cy5wdXNoKHdhbGtlclR5cGUpO1xuXHRcdFx0dmFyIGNvbm5lY3RvciA9IHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdO1xuXHRcdFx0dG90YWxXYWxrZXJzICs9IGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7XG5cdFx0XHQvL2NvbnNvbGUubG9nKHdhbGtlclR5cGUrXCI6dG90YWxXYWxrZXJzPVwiK3RvdGFsV2Fsa2VycytcIjpmb3IgY29uZWN0b3I9XCIrY29ubmVjdG9yLm5vZGVzLmxlbmd0aCk7XG5cdFxuXHRcdH1cblx0XHR3YWxrZXJUeXBlS2V5cy5zb3J0KCk7XG5cdFx0cmV0dXJuKHdhbGtlclR5cGVLZXlzKTtcblx0fVxuXHRcblx0Z2V0V2Fsa2VyQXJyYXlUb0ZpeCgpXG5cdHtcblx0XHR2YXIgd2Fsa2VyQXJyYXkgPSB0aGlzLndhbGtlck9iamVjdC52YWx1ZXMoKTtcblx0XHRyZXR1cm4od2Fsa2VyQXJyYXkpO1xuXHR9XG5cdFxuXHRnZXRXYWxrZXJBcnJheSgpXG5cdHtcblx0XHQvLyB0aGlzIGlzIFNMT1cuLiB3aHkgZG9lcyB0aGUgYWJvdmUgbm90IHdvcms/IT8hPyFcblx0XHR2YXIgd2Fsa2VyQXJyYXkgPSBuZXcgQXJyYXkoKTtcblx0XHR2YXIgd2Fsa2VyVHlwZUtleXMgPSB0aGlzLmdldFdhbGtlcktleXNTb3J0ZWQoKTtcblx0XHRmb3IgKHZhciBpPTA7aTx3YWxrZXJUeXBlS2V5cy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciB3YWxrZXJUeXBlID0gd2Fsa2VyVHlwZUtleXNbaV07XG5cdFx0XHR2YXIgY29ubmVjdG9yID0gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV07XG5cdFx0XHRmb3IodmFyIGo9MDtqPGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7aisrKVxuXHRcdFx0e1xuXHRcdFx0XHR3YWxrZXJBcnJheS5wdXNoKGNvbm5lY3Rvci5ub2Rlc1tqXSk7XG5cdFxuXHRcdFx0fVxuXHRcdH1cblx0XG5cdFx0cmV0dXJuKHdhbGtlckFycmF5KTtcblx0fVxuXHRcblx0YWRqdXN0d2Fsa2VyVHlwZUNvbm5lY3Rpb25zKClcblx0e1xuXHRcdHZhciB3YWxrZXJUeXBlS2V5cyA9IHRoaXMuZ2V0V2Fsa2VyS2V5c1NvcnRlZCgpO1xuXHRcdHZhciB0b3RhbFdhbGtlcnMgPSB0aGlzLmdldFdhbGtlckFycmF5KCkubGVuZ3RoO1xuXHQvL2NvbnNvbGUubG9nKFwid2FsZWtyQ291bnQ9XCIrdG90YWxXYWxrZXJzKTtcblx0XHQvL2NvbnNvbGUubG9nKFwid2Fsa2VyQ291bnRhbGtlckNvdW50PVwiK3RoaXMud2Fsa2VyT2JqZWN0KTtcblx0XHQvKlxuXHRcdG5ldyBBcnJheSgpXG5cdFx0dmFyIHRvdGFsV2Fsa2VycyA9IDA7XG5cdFx0Zm9yICh2YXIgd2Fsa2VyVHlwZSBpbiB0aGlzLndhbGtlclR5cGVDb25uZWN0aW9ucylcblx0XHR7XG5cdFx0XHR3YWxrZXJUeXBlS2V5cy5wdXNoKHdhbGtlclR5cGUpO1xuXHRcdFx0dmFyIGNvbm5lY3RvciA9IHRoaXMud2Fsa2VyVHlwZUNvbm5lY3Rpb25zW3dhbGtlclR5cGVdO1xuXHRcdFx0dG90YWxXYWxrZXJzICs9IGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGg7XG5cdFx0XHQvL2NvbnNvbGUubG9nKHdhbGtlclR5cGUrXCI6dG90YWxXYWxrZXJzPVwiK3RvdGFsV2Fsa2VycytcIjpmb3IgY29uZWN0b3I9XCIrY29ubmVjdG9yLm5vZGVzLmxlbmd0aCk7XG5cdFxuXHRcdH1cblx0XHR3YWxrZXJUeXBlS2V5cy5zb3J0KCk7Ki9cblx0XHR2YXIgYW5nbGUgPSAwO1xuXHRcdC8vIGFyZWEgPSBwaSByXjJcblx0XHQvLyBzby4uLiBpZiB3ZSBoYXZlIDEwIG5vZGVzLi4uXG5cdFx0Ly8gYW5kIGEgbm9kZSB0YWtlcyBcIjEwMCBhcmVhXCIgcGVyIG5vZGUgKGEgMTBYMTAgYXJlYSlcblx0XHQvLyAxMCBub2RlcyBhbmQgMTAwYXJlYV4yXG5cdFx0Ly8gc3FydChhcmVhL3BpKSA9IHJcblx0XHQvLyBzcXJ0KCAoYXJlYSpudW1iZXJOb2RlcyphcmVhUGVyTm9kZSkvUEkgKSA9IFJcblx0XHR2YXIgd2Fsa2VyQXJlYSA9IDI1O1xuXHRcdC8vdmFyIHJhZGl1cyA9IE1hdGguc3FydCggdG90YWxXYWxrZXJzL01hdGguUEkgKSo0O1xuXHRcdHZhciByYWRpdXMgPSBNYXRoLnNxcnQoIHRvdGFsV2Fsa2Vycyp3YWxrZXJBcmVhKSAvIE1hdGguUEk7XG5cdFx0XG5cdFx0Zm9yKHZhciBpPTA7aTx3YWxrZXJUeXBlS2V5cy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciB3YWxrZXJUeXBlID0gd2Fsa2VyVHlwZUtleXNbaV07XG5cdFx0XHR2YXIgY29ubmVjdG9yID0gdGhpcy53YWxrZXJUeXBlQ29ubmVjdGlvbnNbd2Fsa2VyVHlwZV07XG5cdFx0XHR2YXIgcGVyY2VudE9mV2Fsa2VycyA9IGNvbm5lY3Rvci5ub2Rlcy5sZW5ndGgvdG90YWxXYWxrZXJzO1xuXHRcdFx0dmFyIHdhbGtlckFuZ2xlID0gcGVyY2VudE9mV2Fsa2VycyAqIDM2MDtcblx0XHRcdFxuXHRcdFx0dmFyIGdyYXBoRGF0YSA9IHRoaXMuY2FudmFzSG9sZGVyLmdldEdyYXBoRGF0YSh3YWxrZXJUeXBlKTtcblx0XHRcdC8qXG5cdFx0XHRjb25zb2xlLmxvZyhcIndhbGtlclR5cGU9XCIrd2Fsa2VyVHlwZStcblx0XHRcdFx0XHRcIjpjb25uZWN0b3Iubm9kZXMubGVuZ3RoOlwiK2Nvbm5lY3Rvci5ub2Rlcy5sZW5ndGgrXG5cdFx0XHRcdFx0XCI6cGVyY2VudE9mV2Fsa2VyczpcIitwZXJjZW50T2ZXYWxrZXJzK1xuXHRcdFx0XHRcdFwiOndhbGtlckFuZ2xlOlwiK3dhbGtlckFuZ2xlK1xuXHRcdFx0XHRcdFwiZ3JhcGhEYXRhPVwiK0NvbW1vbi50b1N0cmluZyhncmFwaERhdGEpK1xuXHRcdFx0XHRcdFwiXCIpO1xuXHQqL1xuXHRcdFx0Ly9jb25zb2xlLmxvZyh3YWxrZXJUeXBlK1wiOmJlZm9yZTpcIitDb21tb250b1N0cmluZyhjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheSkpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIndhbGtlcj1cIit0aGlzLm5hbWUrXCI6d2Fsa2VyVHlwZT1cIit3YWxrZXJUeXBlK1wiOnRzPVwiK2Nvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLnRzKTtcblx0XHRcdFxuXHRcdFx0Y29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8uc3RhcnRBbmdsZSA9IGFuZ2xlO1xuXHRcdFx0YW5nbGUgKz0gd2Fsa2VyQW5nbGU7XG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5lbmRBbmdsZSA9IGFuZ2xlO1xuXHRcdFx0Y29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8ucmFkaXVzID0gcmFkaXVzO1xuXHRcdFx0XG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5maWxsQ29sb3IgPSBncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8uZmlsbENvbG9yO1xuXHRcdFx0Ly9pZihjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5maWxsQ29sb3IpXG5cdFx0XHQvL2Nvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5LmRpc3BsYXlJbmZvLmZpbGxDb2xvciA9IFxuXHRcdFx0Ly8vLy8vLy9jb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheSA9IG5ldyBBcmNEaXNwbGF5U2hhcGUoY29ubmVjdG9yLnNoYXBlTm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuZGlzcGxheUluZm8pXG5cdFx0XHRjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5pbml0KCk7XG5cdFx0XHQvLy8vLy8vLy9jb25uZWN0b3Iuc2hhcGUgPSBjb25uZWN0b3Iuc2hhcGVOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5zaGFwZTtcblx0XHRcdFxuXHRcdFx0Ly9jb25zb2xlLmxvZyh3YWxrZXJUeXBlK1wiOmFmdGVyOlwiK0NvbW1vbnRvU3RyaW5nKGNvbm5lY3Rvci5zaGFwZU5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5KSk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcblx0XHR9XG5cdH1cblx0XG5cdGFkZFdhbGtlcih3YWxrZXIpXG5cdHtcblx0XHR0aGlzLndhbGtlck9iamVjdFt3YWxrZXJdID0gd2Fsa2VyO1xuXHRcdHZhciBjb25uZWN0aW9uID0gdGhpcy5nZXRDcmVhdGVXYWxrZXJUeXBlQ29ubmVjdGlvbih3YWxrZXIuZ3JhcGhEYXRhS2V5KVxuXHRcdC8vdmFyIGNvbm5lY3Rpb24gPSB0aGlzLmdldENyZWF0ZVdhbGtlclR5cGVDb25uZWN0aW9uKHdhbGtlci5pbmZvRGF0YS53YWxrZXJUeXBlS2V5KVxuXHRcdGNvbm5lY3Rpb24uYWRkTm9kZSh3YWxrZXIpO1xuXHRcdFxuXHRcdHRoaXMuYWRqdXN0d2Fsa2VyVHlwZUNvbm5lY3Rpb25zKCk7XG5cdH1cblx0XG5cdHJlbW92ZVdhbGtlcih3YWxrZXIpXG5cdHtcblx0XHR2YXIgY29ubmVjdGlvbiA9IHRoaXMuZ2V0Q3JlYXRlV2Fsa2VyVHlwZUNvbm5lY3Rpb24od2Fsa2VyLmluZm9EYXRhLndhbGtlclR5cGVLZXkpO1xuXHRcdGRlbGV0ZSB0aGlzLndhbGtlck9iamVjdFt3YWxrZXJdOyBcblx0XHRjb25uZWN0aW9uLnJlbW92ZU5vZGUod2Fsa2VyKTtcdFxuXHRcdHRoaXMuYWRqdXN0d2Fsa2VyVHlwZUNvbm5lY3Rpb25zKCk7XG5cdH1cblx0XG5cdGxvZygpXG5cdHtcblx0XHRjb25zb2xlLmxvZyhcImp1bmN0aW9uIGxvZzpcIitDb21tb250b1N0cmluZyh0aGlzKSk7XG5cdH1cblxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gSnVuY3Rpb247XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6SnVuY3Rpb25cIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBDb25uZWN0b3JEaXNwbGF5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5Jyk7XG52YXIgTm9kZURpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS9ub2RlZGlzcGxheScpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcblxuY2xhc3MgSnVuY3Rpb25Db25uZWN0b3IgZXh0ZW5kcyBDb25uZWN0b3JEaXNwbGF5XG57XG5cdGNvbnN0cnVjdG9yKGRpc3BsYXlJbmZvKVxuXHR7XG5cdFx0c3VwZXIoZGlzcGxheUluZm8pO1xuXHR9XG5cdFxuXHRkcmF3Q29ubmVjdG9yKGNhbnZhc0hvbGRlcixjb25uZWN0b3Isbm9kZSlcblx0e1xuXHRcdHN1cGVyLmRyYXdDb25uZWN0b3IoY2FudmFzSG9sZGVyLGNvbm5lY3Rvcixub2RlKTtcblxuXHRcdGZvcih2YXIgaj0wO2o8Y29ubmVjdG9yLm5vZGVzLmxlbmd0aDtqKyspXG5cdFx0e1xuXHRcdFx0dmFyIG5vZGVKID0gY29ubmVjdG9yLm5vZGVzW2pdO1x0XHRcblx0XHRcdHZhciBwID0gbm9kZS5wb3NpdGlvbi5jcmVhdGVCeUFkZGluZyhub2RlLmNvbm5lY3RvclBvc2l0aW9uKTtcblx0XHRcdHZhciBwaiA9IG5vZGVKLnBvc2l0aW9uLmNyZWF0ZUJ5QWRkaW5nKG5vZGVKLmNvbm5lY3RvclBvc2l0aW9uKTtcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVXaWR0aCA9IDU7XG5cdFx0XHRjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcoXCIwMDAwMDBmZlwiKTtcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y2FudmFzSG9sZGVyLmNvbnRleHQubW92ZVRvKHAuZ2V0WCgpLHAuZ2V0WSgpKTtcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LmxpbmVUbyhwai5nZXRYKCkscGouZ2V0WSgpKTtcblx0XHRcdGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xuXHRcdH1cblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gSnVuY3Rpb25Db25uZWN0b3I7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6SnVuY3Rpb25Db25uZWN0b3JcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgTm9kZURpc3BsYXkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ub2RlZGlzcGxheS9ub2RlZGlzcGxheScpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9jb21tb24nKTtcblxuY2xhc3MgSnVuY3Rpb25EaXNwbGF5IGV4dGVuZHMgTm9kZURpc3BsYXlcbntcblx0Y29uc3RydWN0b3IoZGlzcGxheUluZm8pXG5cdHtcblx0XHRzdXBlcihkaXNwbGF5SW5mbyk7XG5cdFx0dGhpcy5jaGVja1Bvc2l0aW9uSW5mbyA9IHt9O1xuXHR9XG5cdFxuXHRjb250YWluc1Bvc2l0aW9uKHBvc2l0aW9uLG5vZGUpXG5cdHtcblx0XHQvL2NvbnNvbGUubG9nKFwiLS0tLSBcIitub2RlLm5hbWUrXCIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XG5cdFx0XG5cdFx0aWYoIW5vZGUuaGFzT3duUHJvcGVydHkoXCJjaGVja1Bvc2l0aW9uSW5mb1wiKSlcblx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCItLS0tIFwiK25vZGUubmFtZStcIiBcIitub2RlLmdldE5vZGVLZXkoKStcIiBtaXNzaW5nIGNoZWNrUG9zaXRpb25JbmZvIC0tXCIpO1xuXHRcdFx0XHRyZXR1cm4oZmFsc2UpO1xuXHRcdH1cblxuXHRcdFxuXHRcdHZhciBkaXN0YW5jZSA9IG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0RGlzdGFuY2UocG9zaXRpb24pO1xuXHRcblx0XG5cdFx0cmV0dXJuKFxuXHRcdFx0XHQoZGlzdGFuY2U8PW5vZGUuZ3JhcGhEYXRhLnJhZGl1cykgfHxcblx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFg8PXBvc2l0aW9uLmdldFgoKSkgJiZcblx0XHRcdFx0XHRcdChub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRYK25vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFdpZHRoKT49cG9zaXRpb24uZ2V0WCgpICYmXG5cdFx0XHRcdFx0XHQobm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0WTw9cG9zaXRpb24uZ2V0WSgpKSAmJlxuXHRcdFx0XHRcdFx0KG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFkrbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0SGVpZ2h0KT49cG9zaXRpb24uZ2V0WSgpXG5cdFx0XHRcdClcblx0XHRcdFx0KTtcblx0fVxuXHRcblx0XG5cdGRyYXdOb2RlKGNhbnZhc0hvbGRlcixub2RlKVxuXHR7XG5cdFx0c3VwZXIuZHJhd05vZGUoY2FudmFzSG9sZGVyLG5vZGUpO1xuXHRcdC8vY29uc29sZS5sb2coXCJaWlpaWlpaWlpaWlpaWjo6OjpcIitub2RlLm5hbWUpO1xuXHQgICAgdmFyIHJhZGl1c0F2ZXJhZ2UgPSAwO1xuXHQgICAgZm9yKHZhciBpPTA7aTxub2RlLm5vZGVzLmxlbmd0aDtpKyspXG5cdCAgICB7XG5cdCAgICAgXHR2YXIgc3ViTm9kZSA9IG5vZGUubm9kZXNbaV07XG5cdCAgICAgXHQvL2NvbnNvbGUubG9nKFwiICAgICAgICAgICAgWlpaWlpaWlpaWlpaWlo6Ojo6XCIrc3ViTm9kZS5uYW1lKTtcblx0ICAgIFx0cmFkaXVzQXZlcmFnZSArPSBzdWJOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kaXNwbGF5SW5mby5yYWRpdXM7XG5cdCAgICB9XG5cdCAgICBpZihyYWRpdXNBdmVyYWdlIT0wKSByYWRpdXNBdmVyYWdlID0gKHJhZGl1c0F2ZXJhZ2UgLyBub2RlLm5vZGVzLmxlbmd0aCk7XG5cdCAgICByYWRpdXNBdmVyYWdlICs9IHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGgqNTtcblx0ICAgIFxuXHQgICAgdmFyIGp1bmN0aW9uVGV4dCA9IG5vZGUubmFtZTtcdCAgICBcblx0ICAgIHZhciByZWN0UGFkZGluZyA9IHRoaXMuZGlzcGxheUluZm8uZm9udFBpeGVsSGVpZ2h0LzI7XG5cdCAgICBcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmZvbnQ9dGhpcy5kaXNwbGF5SW5mby5mb250U3R5bGUrXCIgXCIrdGhpcy5kaXNwbGF5SW5mby5mb250UGl4ZWxIZWlnaHQrXCJweCBcIit0aGlzLmRpc3BsYXlJbmZvLmZvbnRGYWNlOyBcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnRleHRBbGlnbj1cImNlbnRlclwiO1xuXHQgICAgdmFyIHRleHRNZXRyaWNzID0gdGhpcy5tZXRyaWNzVGV4dE11dGlwbGVMaW5lcyhcblx0ICAgIFx0XHRjYW52YXNIb2xkZXIuY29udGV4dCxcblx0ICAgIFx0XHRqdW5jdGlvblRleHQsXG5cdCAgICBcdFx0dGhpcy5kaXNwbGF5SW5mby5mb250UGl4ZWxIZWlnaHQsXG5cdCAgICBcdFx0XCJcXG5cIik7XG5cdCAgICBcblx0ICAgIHZhciB0b3RhbFdpZHRoID0gTWF0aC5tYXgocmFkaXVzQXZlcmFnZStyZWN0UGFkZGluZyx0ZXh0TWV0cmljcy53aWR0aCtyZWN0UGFkZGluZytyZWN0UGFkZGluZyk7XG5cdCAgICB2YXIgdG90YWxIZWlnaHQgPSBcblx0ICAgIFx0cmFkaXVzQXZlcmFnZStcblx0ICAgIFx0dGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aCoyK1xuXHQgICAgXHRub2RlLmdyYXBoRGF0YS50ZXh0U3BhY2VyK1xuXHQgICAgXHR0ZXh0TWV0cmljcy5oZWlnaHQrcmVjdFBhZGRpbmc7XG5cdCAgICBcblx0ICAgIG5vZGUud2lkdGggPSB0b3RhbFdpZHRoO1xuXHQgICAgbm9kZS5oZWlnaHQgPSB0b3RhbEhlaWdodDtcblx0ICAgIFxuXHRcdGlmKCFub2RlLmhhc093blByb3BlcnR5KFwiY2hlY2tQb3NpdGlvbkluZm9cIikpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIioqKiogXCIrbm9kZS5uYW1lK1wiIG1pc3NpbmcgY2hlY2tQb3NpdGlvbkluZm8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1x0XHRcdFxuXHRcdFx0bm9kZS5jaGVja1Bvc2l0aW9uSW5mbyA9IHsgbWFrZUl0UmVhbDpcInRydWVcIiwgfTtcblx0XHR9XG5cdFx0dmFyIHggPSBub2RlLnBvc2l0aW9uLmdldFgoKTtcblx0XHR2YXIgeSA9IG5vZGUucG9zaXRpb24uZ2V0WSgpO1xuXHRcdC8veCA9IHRoaXMuZHJhd1Bvc2l0aW9uLmdldFgoKTtcblx0XHQvL3kgPSB0aGlzLmRyYXdQb3NpdGlvbi5nZXRZKCk7XG5cblx0ICAgIC8vaWYobm9kZS5jaGVja1Bvc2l0aW9uSW5mbz09bnVsbCkgbm9kZS5jaGVja1Bvc2l0aW9uSW5mbyA9IHt9O1xuXHQgICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbiA9IG5ldyBQb3NpdGlvbihcblx0ICAgIFx0XHR4LFxuXHQgICAgXHRcdHktdG90YWxIZWlnaHQvMi4wK3JhZGl1c0F2ZXJhZ2UpO1xuXHQgICAgXG5cdCAgICBub2RlLmNvbm5lY3RvclBvc2l0aW9uLnNldFkoLSh0b3RhbEhlaWdodC8yLjAtcmFkaXVzQXZlcmFnZSkpO1xuXHRcblx0ICAgIFxuXHQgICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0WCA9IHgtKHRleHRNZXRyaWNzLndpZHRoK3JlY3RQYWRkaW5nKS8yLjA7XG5cdCAgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRZID0gbm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbi5nZXRZKCkrXG5cdCAgICBcdHJhZGl1c0F2ZXJhZ2UrXG5cdCAgICBcdHRoaXMuZGlzcGxheUluZm8uYm9yZGVyV2lkdGgrXG5cdCAgICBcdG5vZGUuZ3JhcGhEYXRhLnRleHRTcGFjZXI7XG5cdCAgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRXaWR0aCA9IHRleHRNZXRyaWNzLndpZHRoK3JlY3RQYWRkaW5nO1xuXHQgICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0SGVpZ2h0ID0gdGV4dE1ldHJpY3MuaGVpZ2h0K3JlY3RQYWRkaW5nO1xuXHRcblx0ICAgIFxuXHQgICAgdGhpcy5yb3VuZGVkUmVjdChcblx0ICAgIFx0XHRjYW52YXNIb2xkZXIuY29udGV4dCxcblx0IFx0XHQgICBub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRYLFxuXHQgXHRcdCAgIG5vZGUuY2hlY2tQb3NpdGlvbkluZm8udGV4dFksXG5cdCBcdFx0ICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0V2lkdGgsXG5cdCBcdFx0ICAgbm9kZS5jaGVja1Bvc2l0aW9uSW5mby50ZXh0SGVpZ2h0LFxuXHQgXHRcdCAgIHRoaXMuZGlzcGxheUluZm8uZm9udFBpeGVsSGVpZ2h0LzMsXG5cdCBcdFx0ICAgdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aCxcblx0IFx0XHQgICBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8ucmVjdEJvcmRlckNvbG9yKSxcblx0IFx0XHQgICBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8ucmVjdEZpbGxDb2xvcikgKTtcblx0ICAgIFxuXHQgICAgXG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGU9Q29tbW9uLmdldENvbG9yRnJvbVN0cmluZyh0aGlzLmRpc3BsYXlJbmZvLmZvbnRDb2xvcik7XG5cdFxuXHQgICAgdGhpcy5maWxsVGV4dE11dGlwbGVMaW5lcyhcblx0ICAgIFx0XHRjYW52YXNIb2xkZXIuY29udGV4dCxcblx0ICAgIFx0XHRqdW5jdGlvblRleHQsXG5cdCAgICBcdFx0eCxcblx0ICAgIFx0XHRub2RlLmNoZWNrUG9zaXRpb25JbmZvLnRleHRZK3JlY3RQYWRkaW5nKjIuMCt0aGlzLmRpc3BsYXlJbmZvLmJvcmRlcldpZHRoLFxuXHQgICAgXHRcdHRoaXMuZGlzcGxheUluZm8uZm9udFBpeGVsSGVpZ2h0LFxuXHQgICAgXHRcdFwiXFxuXCIpO1xuXHQgIFxuXHQgIFxuXHQgICAgaWYobm9kZS5pc1NlbGVjdGVkKVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0RmlsbENvbG9yKTtcblx0ICAgIFx0Y2FudmFzSG9sZGVyLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uc2VsZWN0Qm9yZGVyQ29sb3IpO1xuXHQgICAgfVxuXHQgICAgZWxzZVxuXHQgICAge1xuXHQgICAgXHRjYW52YXNIb2xkZXIuY29udGV4dC5maWxsU3R5bGUgPSBDb21tb24uZ2V0Q29sb3JGcm9tU3RyaW5nKHRoaXMuZGlzcGxheUluZm8uZmlsbENvbG9yKTtcblx0ICAgICAgICBjYW52YXNIb2xkZXIuY29udGV4dC5zdHJva2VTdHlsZSA9IENvbW1vbi5nZXRDb2xvckZyb21TdHJpbmcodGhpcy5kaXNwbGF5SW5mby5ib3JkZXJDb2xvcik7XG5cdCAgICB9XG5cdCAgLypcblx0ICAgIGNvbnNvbGUubG9nKFwibmFtZT1cIitub2RlLm5hbWUrXG5cdCAgICBcdFx0XCI6c2VsZWN0RmlsbENvbG9yPVwiK3RoaXMuZGlzcGxheUluZm8uc2VsZWN0RmlsbENvbG9yK1xuXHQgICAgXHRcdFwiOmZpbGxDb2xvcj1cIit0aGlzLmRpc3BsYXlJbmZvLmZpbGxDb2xvcitcblx0ICAgIFx0XHRcIjpYPVwiK25vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0WCgpK1xuXHQgICAgXHRcdFwiOlk9XCIrbm9kZS5jaGVja1Bvc2l0aW9uSW5mby5jaXJjbGVQb3NpdGlvbi5nZXRZKCkrXG5cdCAgICBcdFx0XCI6cmFkaXVzPVwiK3JhZGl1c0F2ZXJhZ2UrXG5cdCAgICBcdFx0XCJcIlxuXHQgICAgXHRcdCk7XG5cdCAgICAqL1xuXHQgICAgXG5cdFxuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuYmVnaW5QYXRoKCk7XG5cdCAgICBjYW52YXNIb2xkZXIuY29udGV4dC5hcmMoXG5cdFx0XHRcdG5vZGUuY2hlY2tQb3NpdGlvbkluZm8uY2lyY2xlUG9zaXRpb24uZ2V0WCgpLFxuXHRcdFx0XHRub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uLmdldFkoKSxcblx0XHRcdFx0cmFkaXVzQXZlcmFnZSwvL25vZGUuZ3JhcGhEYXRhLnJhZGl1cyxcblx0XHRcdFx0MCxcblx0XHRcdFx0TWF0aC5QSSAqIDIsIGZhbHNlKTtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LmNsb3NlUGF0aCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQuZmlsbCgpO1xuXHQgICAgY2FudmFzSG9sZGVyLmNvbnRleHQubGluZVdpZHRoID0gdGhpcy5kaXNwbGF5SW5mby5ib3JkZXJXaWR0aDtcblx0ICAgIGNhbnZhc0hvbGRlci5jb250ZXh0LnN0cm9rZSgpO1xuXHRcblx0XG5cdCAgICBmb3IodmFyIGk9MDtpPG5vZGUubm9kZXMubGVuZ3RoO2krKylcblx0ICAgIHtcblx0ICAgICBcdHZhciBzdWJOb2RlID0gbm9kZS5ub2Rlc1tpXTtcblx0ICAgICBcdHN1Yk5vZGUucG9zaXRpb24gPSBub2RlLmNoZWNrUG9zaXRpb25JbmZvLmNpcmNsZVBvc2l0aW9uO1xuXHQgICAgXHRzdWJOb2RlLmdyYXBoRGF0YS5ub2RlRGlzcGxheS5kcmF3Tm9kZShub2RlLmNhbnZhc0hvbGRlcixzdWJOb2RlKTtcblx0ICAgIH1cblx0XG5cdH1cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IEp1bmN0aW9uRGlzcGxheTtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpKdW5jdGlvbkRpc3BsYXlcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBDb25uZWN0b3IgPSByZXF1aXJlKCcuLi9ub2Rlcy9jb25uZWN0b3IvY29ubmVjdG9yJyk7XG52YXIgU3ByaW5nQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vbm9kZXMvY29ubmVjdG9yL3NwcmluZ2Nvbm5lY3RvcicpO1xuXG5cbmNsYXNzIFBhdGggZXh0ZW5kcyBTcHJpbmdDb25uZWN0b3Jcbntcblx0Y29uc3RydWN0b3IoY29ubmVjdG9yRGlzcGxheSxzcHJpbmdBbmNob3JQb2ludCxhbmNob3JPZmZzZXRQb2ludCxyZWxheGVkRGlzdGFuY2UsZWxhc3RpY2l0eUZhY3RvcixuYW1lKVxuXHR7XG5cdFx0c3VwZXIoY29ubmVjdG9yRGlzcGxheSxzcHJpbmdBbmNob3JQb2ludCxhbmNob3JPZmZzZXRQb2ludCxyZWxheGVkRGlzdGFuY2UsZWxhc3RpY2l0eUZhY3RvcixuYW1lKVxuXHRcdHRoaXMud2Fsa2VyT2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHR9XG5cdFxuXHRnZXRDbGllbnRKc29uKClcblx0e1xuXHRcdHZhciBqc29uID0gc3VwZXIuZ2V0Q2xpZW50SnNvbigpO1xuXHRcdGpzb24uanVuY3Rpb25TdGFydCA9IHRoaXMuanVuY3Rpb25TdGFydC5nZXROb2RlS2V5KCk7XG5cdFx0anNvbi5qdW5jdGlvbkVuZCA9IHRoaXMuanVuY3Rpb25FbmQuZ2V0Tm9kZUtleSgpO1xuXHRcdHJldHVybihqc29uKTtcblx0fVxuXHRcblx0c2V0SnVuY3Rpb25zKGp1bmN0aW9uU3RhcnQsanVuY3Rpb25FbmQpXG5cdHtcblx0ICAgIHRoaXMuanVuY3Rpb25TdGFydCA9IGp1bmN0aW9uU3RhcnQ7XG5cdFx0dGhpcy5qdW5jdGlvbkVuZCA9IGp1bmN0aW9uRW5kO1xuXHRcdHRoaXMuYWRkTm9kZShqdW5jdGlvblN0YXJ0KTtcblx0XHR0aGlzLmFkZE5vZGUoanVuY3Rpb25FbmQpO1x0XHRcblx0fVxuXHRcblx0Z2V0Q29ubmVjdG9yS2V5KClcblx0e1xuXHRcdHJldHVybih0aGlzLmdldFBhdGhLZXkoKSk7XG5cdH1cblx0XG5cdGdldFBhdGhLZXkoKVxuXHR7XG5cdFx0cmV0dXJuKHRoaXMuanVuY3Rpb25TdGFydC5nZXROb2RlS2V5KCkrXCIjXCIrdGhpcy5qdW5jdGlvbkVuZC5nZXROb2RlS2V5KCkpO1xuXHR9XG5cdFxuXHRsb2coKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXCJwYXRoIGxvZzpcIitDb21tb250b1N0cmluZyh0aGlzKSk7XG5cdH1cbn1cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IFBhdGg7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6UGF0aFwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIE5vZGUgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL25vZGVjYW52YXMnKTtcbnZhciBOb2RlQ2FudmFzID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWNhbnZhcy9ub2RlY2FudmFzJyk7XG52YXIgTm9kZUNhbnZhc01vdXNlID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWNhbnZhcy9ub2RlY2FudmFzbW91c2UnKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIFBhdGggPSByZXF1aXJlKCcuLi9wYXRocy9wYXRoJyk7XG52YXIgUGVyc29uID0gcmVxdWlyZSgnLi4vcGVkaWdyZWUvcGVyc29uJyk7XG52YXIgSnVuY3Rpb24gPSByZXF1aXJlKCcuLi9wYXRocy9qdW5jdGlvbicpO1xuXG5jbGFzcyBQZWRpZ3JlZUNhbnZhcyBleHRlbmRzIE5vZGVDYW52YXNcbntcblx0Y29uc3RydWN0b3IoY2FudmFzSG9sZGVyLHdvcmxkRGlzcGxheSlcblx0e1xuXHRcdHN1cGVyKGNhbnZhc0hvbGRlcik7XG5cdFx0dGhpcy5wZXJzb24gPSBuZXcgQXJyYXkoKTtcblx0XHQvL3RoaXMucGVyc29uU3BhY2VyID0gY2FudmFzSG9sZGVyLmdldENvbm5lY3RvcihcInBlcnNvblNwYWNlclwiLGNhbnZhc0hvbGRlci5jYW52YXNOYW1lK1wiOnBlcnNvblNwYWNlclwiKSxcblx0XHR0aGlzLndvcmxkV2FsbCA9IGNhbnZhc0hvbGRlci5nZXRDb25uZWN0b3IoXCJ3b3JsZFdhbGxcIixjYW52YXNIb2xkZXIuY2FudmFzTmFtZStcIjp3b3JsZFdhbGxcIiksXG5cdFx0XG5cdFx0dGhpcy51cGRhdGVRdWV1ZSA9IG5ldyBBcnJheSgpO1xuXHRcdHRoaXMudXBkYXRlUXVldWUuaXNJbk5lZWRPZlNvcnRpbmcgPSBmYWxzZVxuXG5cdFx0Ly90aGlzLmp1bmN0aW9uU3BhY2VyID0ganVuY3Rpb25TcGFjZXI7XG5cdFx0Ly90aGlzLndvcmxkV2FsbCA9IHdvcmxkV2FsbDtcblx0XHR0aGlzLndvcmxkRGlzcGxheSA9IHdvcmxkRGlzcGxheTtcblx0XHR0aGlzLmxhc3REYXRlID0gXCJcIjtcblx0XHR0aGlzLmNoZWNrVGltZXN0YW1wID0gXCJcIjtcblx0XHR0aGlzLm5vZGVDYW52YXNNb3VzZSA9IG5ldyBOb2RlQ2FudmFzTW91c2UodGhpcyk7XG5cdFx0dGhpcy5maWxsU3R5bGUgPSB3b3JsZERpc3BsYXkud29ybGRCYWNrZ3JvdW5kQ29sb3I7XG5cdH1cblx0XG5cdHN0YXRpYyBmaWxsUGVkaWdyZWVDYW52YXNGcm9tQ2xpZW50SnNvbih3b3JsZCxqc29uKVxuXHR7XHRcdFxuXHRcdC8vY29uc29sZS5sb2coXCJQYXRoV29scmQ6ZmlsbFBlZGlncmVlQ2FudmFzRnJvbUNsaWVudEpzb25cIik7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIlBhdGhXb2xyZDpmaWxsUGVkaWdyZWVDYW52YXNGcm9tQ2xpZW50SnNvbjp3b3JsZE5hbWU9XCIrdGhpcy5uYW1lKTtcblx0XHR3b3JsZC5pbmZvRGF0YS5ub2RlS2V5LmtleSA9IGpzb24uaW5mb0RhdGEubm9kZUtleS5rZXk7XG5cdFx0d29ybGQuaW5mb0RhdGEubm9kZUtleS5ub2RlSWQgPSBqc29uLmluZm9EYXRhLm5vZGVLZXkubm9kZUlkO1xuXHRcdFxuXHRcdHZhciBqdW5jdGlvbktleU1hcCA9IHt9O1xuXHRcdE9iamVjdC5rZXlzKGpzb24uanVuY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0dmFyIGp1bmN0aW9uSnNvbiA9IGpzb24uanVuY3Rpb25zW2tleV07XG5cdFx0XHR2YXIganVuY3Rpb24gPSB3b3JsZC5nZXRDcmVhdGVKdW5jdGlvbihqdW5jdGlvbkpzb24ubmFtZSxqdW5jdGlvbkpzb24uaW5mb0RhdGEpO1xuXHRcdFx0anVuY3Rpb24ucG9zaXRpb24ueCA9IGp1bmN0aW9uSnNvbi5wb3NpdGlvbi54O1xuXHRcdFx0anVuY3Rpb24ucG9zaXRpb24ueSA9IGp1bmN0aW9uSnNvbi5wb3NpdGlvbi55O1xuXHRcdFx0anVuY3Rpb25LZXlNYXBba2V5XSA9IGp1bmN0aW9uO1xuXHRcdH0pO1xuXHRcdFxuXHRcdE9iamVjdC5rZXlzKGpzb24ucGF0aHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHR7XG5cdFx0XHR2YXIgcGF0aEpzb24gPSBqc29uLnBhdGhzW2tleV07XG5cdFx0XHR2YXIgcGF0aCA9IHdvcmxkLmdldENyZWF0ZVBhdGgoXG5cdFx0XHRcdFx0anVuY3Rpb25LZXlNYXBbcGF0aEpzb24uanVuY3Rpb25TdGFydF0sXG5cdFx0XHRcdFx0anVuY3Rpb25LZXlNYXBbcGF0aEpzb24uanVuY3Rpb25FbmRdLFxuXHRcdFx0XHRcdHBhdGhKc29uKTtcblx0XHR9KTtcblx0XHRcdFx0XG5cdFx0T2JqZWN0LmtleXMoanNvbi53YWxrZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0dmFyIHdhbGtlckpzb24gPSBqc29uLndhbGtlcnNba2V5XTtcblx0XHRcdHZhciB3YWxrZXIgPSB3b3JsZC5nZXRDcmVhdGVXYWxrZXIod2Fsa2VySnNvbi5uYW1lLHdhbGtlckpzb24uaW5mb0RhdGEpO1xuXHRcdFx0d2Fsa2VyLnBvc2l0aW9uLnggPSB3YWxrZXJKc29uLnBvc2l0aW9uLng7XG5cdFx0XHR3YWxrZXIucG9zaXRpb24ueSA9IHdhbGtlckpzb24ucG9zaXRpb24ueTtcdFxuXHRcdFx0d2Fsa2VyLnNldEN1cnJlbnRKdW5jdGlvbihqdW5jdGlvbktleU1hcFt3YWxrZXJKc29uLmN1cnJlbnRKdW5jdGlvbl0pO1xuXHRcdH0pO1xuXHR9XG5cdFxuXHQgIHhnZXROb2RlSnNvbihqc29uKVxuXHQgIHtcblx0XHQgIGpzb24ubmFtZSA9IHRoaXMubmFtZTtcblx0XHQgIGpzb24uZ3JhcGhEYXRhS2V5ID0gdGhpcy5ncmFwaERhdGFLZXk7XG5cdFx0ICBqc29uLmluZm9EYXRhID0gdGhpcy5pbmZvRGF0YTtcblx0XHQgIC8vanNvbi5pbmZvRGF0YS5ub2RlS2V5ID0gdGhpcy5nZXROb2RlS2V5KCk7XG5cdFx0ICBqc29uLnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbi5nZXRDbGllbnRKc29uKCk7XG5cdFx0ICBqc29uLmNvbm5lY3RvcnMgPSBuZXcgQXJyYXkoKTtcblx0XHQgIGZvcih2YXIgaT0wO2k8dGhpcy5jb25uZWN0b3JzLmxlbmd0aDtpKyspIGpzb24uY29ubmVjdG9ycy5wdXNoKHRoaXMuY29ubmVjdG9yc1tpXS5nZXRDb25uZWN0b3JLZXkoKSk7XG5cblx0XHQgIHJldHVybihqc29uKTtcblx0ICB9XG5cblx0XG5cdHN0YXRpYyBjcmVhdGVQZWRpZ3JlZUNhbnZhc0Zyb21DbGllbnRKc29uKGNhbnZhc0hvbGRlcix3b3JsZERlZixqc29uKVxuXHR7XG5cdFx0dmFyIHBhdGhXb3JsZCA9IG5ldyBQZWRpZ3JlZUNhbnZhcyhjYW52YXNIb2xkZXIsd29ybGREZWYpO1xuXHRcdFxuXHRcdE9iamVjdC5rZXlzKGpzb24uanVuY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0dmFyIGp1bmN0aW9uSnNvbiA9IGpzb24uanVuY3Rpb25zW2tleV07XG5cdFx0XHR2YXIganVuY3Rpb24gPSBwYXRoV29ybGQuZ2V0Q3JlYXRlSnVuY3Rpb24oanVuY3Rpb25Kc29uLm5hbWUsanVuY3Rpb25Kc29uLmluZm9EYXRhKTtcblx0XHRcdGp1bmN0aW9uLnBvc2l0aW9uLnggPSBqdW5jdGlvbkpzb24ucG9zaXRpb24ueDtcblx0XHRcdGp1bmN0aW9uLnBvc2l0aW9uLnkgPSBqdW5jdGlvbkpzb24ucG9zaXRpb24ueTtcblx0XHR9KTtcblx0XHRcblx0XHRPYmplY3Qua2V5cyhqc29uLndhbGtlcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciB3YWxrZXJKc29uID0ganNvbi53YWxrZXJzW2tleV07XG5cdFx0XHRcdFx0dmFyIHdhbGtlciA9IHBhdGhXb3JsZC5nZXRDcmVhdGVXYWxrZXIod2Fsa2VySnNvbi5uYW1lLHdhbGtlckpzb24uaW5mb0RhdGEpO1xuXHRcdFx0XHRcdHdhbGtlci5wb3NpdGlvbi54ID0gd2Fsa2VySnNvbi5wb3NpdGlvbi54O1xuXHRcdFx0XHRcdHdhbGtlci5wb3NpdGlvbi55ID0gd2Fsa2VySnNvbi5wb3NpdGlvbi55O1xuXHRcdFx0XHR9KTtcblx0XHQvL2pzb24uanVuY3Rpb25zID0ge307XG5cdFx0Ly9qc29uLndhbGtlcnMgPSB7fTtcblx0XHQvL2pzb24ucGF0aHMgPSB7fTtcblx0XHRcblx0XHQvKlxuXHRcdHZhciBpc1dhbGtlck5ldyA9IHRoaXMuaXNXYWxrZXJOZXcod29ybGRVcGRhdGUud2Fsa2VyTmFtZSk7XG5cdFx0dmFyIGlzSnVuY3Rpb25OZXcgPSB0aGlzLmlzSnVuY3Rpb25OZXcod29ybGRVcGRhdGUuanVuY3Rpb25OYW1lKTtcblx0XHR2YXIgd2Fsa2VyID0gdGhpcy5nZXRDcmVhdGVXYWxrZXIod29ybGRVcGRhdGUud2Fsa2VyTmFtZSx3b3JsZFVwZGF0ZS53YWxrZXJJbmZvKTtcblx0XHR2YXIganVuY3Rpb24gPSB0aGlzLmdldENyZWF0ZUp1bmN0aW9uKHdvcmxkVXBkYXRlLmp1bmN0aW9uTmFtZSx3b3JsZFVwZGF0ZS5qdW5jdGlvbkluZm8pO1x0XHRcblx0XHR2YXIgY3VycmVudEp1bmN0aW9uID0gd2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpO1xuXHRcdCovXHRcblx0XHQvL3ZhciB3b3JsZERpc3BsYXkgPSBzZGZzZDtcblx0XHQvL3ZhciB3b3JsZFdhbGwgPSBzZnNkO1xuXHRcdC8vdmFyIGp1bmN0aW9uU3BhY2VyID0geHh4XG5cdFx0cmV0dXJuKHBhdGhXb3JsZCk7XG5cdH1cblx0XG5cdGRyYXdDYW52YXModGltZXN0YW1wKVxuXHR7XG5cdFx0c3VwZXIuZHJhd0NhbnZhcyh0aW1lc3RhbXApO1xuXHRcdHRoaXMucGVkaWdyZWVFeHRyYUFuaW1hdGlvbih0aW1lc3RhbXApO1xuXHR9XG5cdFxuXHRnZXRXb3JsZENsaWVudEpzb24oKVxuXHR7XG5cdFx0dmFyIGpzb24gPSB7fTtcblx0XHRcblx0XHRqc29uLmp1bmN0aW9ucyA9IHt9O1xuXHRcdHZhciBqdW5jdGlvbkxpc3QgPSB0aGlzLmdldEp1bmN0aW9uTGlzdCgpO1xuXHRcdGZvcih2YXIgaT0wO2k8anVuY3Rpb25MaXN0Lmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGp1bmN0aW9uID0ganVuY3Rpb25MaXN0W2ldO1xuXHRcdFx0anNvbi5qdW5jdGlvbnNbanVuY3Rpb24uZ2V0Tm9kZUtleSgpXSA9IGp1bmN0aW9uLmdldENsaWVudEpzb24oKTtcblx0XHR9XG5cdFx0XG5cdFx0XG5cdFx0anNvbi53YWxrZXJzID0ge307XG5cdFx0dmFyIHdhbGtlckxpc3QgPSB0aGlzLmdldFdhbGtlckxpc3QoKTtcblx0XHRmb3IodmFyIGk9MDtpPHdhbGtlckxpc3QubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgd2Fsa2VyID0gd2Fsa2VyTGlzdFtpXTtcblx0XHRcdGpzb24ud2Fsa2Vyc1t3YWxrZXIuZ2V0Tm9kZUtleSgpXSA9IHdhbGtlci5nZXRDbGllbnRKc29uKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGpzb24ucGF0aHMgPSB7fTtcblx0XHR2YXIgcGF0aExpc3QgPSB0aGlzLmdldFBhdGhMaXN0KCk7XG5cdFx0Zm9yKHZhciBpPTA7aTxwYXRoTGlzdC5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBwYXRoID0gcGF0aExpc3RbaV07XG5cdFx0XHRqc29uLnBhdGhzW3BhdGguZ2V0Q29ubmVjdG9yS2V5KCldID0gcGF0aC5nZXRDbGllbnRKc29uKCk7XG5cdFx0fVxuXHRcdFxuICBcdCAgIGpzb24uY2FudmFzSG9sZGVyID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0Q2xpZW50SnNvbigpO1xuICBcdCAgIGpzb24uaW5mb0RhdGEgPSB0aGlzLmluZm9EYXRhO1x0XG4gIFx0ICAgcmV0dXJuKGpzb24pO1xuXHR9XG5cdFxuXHRwZWRpZ3JlZUV4dHJhQW5pbWF0aW9uKHRpbWVzdGFtcClcblx0e1xuXHRcdHRoaXMucHJlcGFyZVVwZGF0ZVF1ZXVlKCk7XG5cblx0XHR2YXIgbG9jYWxDaGVja1RpbWVzdGFtcCA9IHRoaXMuYW5pbWF0aW9uRXhlY1RpbWUqdGhpcy50aW1lRmFjdG9yICsgdGhpcy5zdGFydFRpbWUuZ2V0VGltZSgpO1xuXHRcdHZhciBjaGVja0RhdGUgPSBuZXcgRGF0ZShsb2NhbENoZWNrVGltZXN0YW1wKTtcblxuXHRcdGlmKHRoaXMubGFzdERhdGU9PW51bGwpIHRoaXMubGFzdERhdGU9PVwiXCI7XG5cdFx0XG5cdFx0aWYodGhpcy5sYXN0RGF0ZSE9Y2hlY2tEYXRlLnRvTG9jYWxlU3RyaW5nKCkrXCIgXCIrQ29tbW9uLmdldERheU9mV2VlayhjaGVja0RhdGUpKVxuXHRcdHtcblx0XHRcdHRoaXMubGFzdERhdGUgPSBjaGVja0RhdGUudG9Mb2NhbGVTdHJpbmcoKStcIiBcIitDb21tb24uZ2V0RGF5T2ZXZWVrKGNoZWNrRGF0ZSk7XG5cdFx0XHRpZih0aGlzLmlzQW5pbWF0ZWQgJiYgdGhpcy5jYW52YXNIb2xkZXIuaXNEcmF3YWJsZSgpKSAkKCcjd29ybGRfZGF0ZScpLmh0bWwodGhpcy5sYXN0RGF0ZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMuY2hlY2tUaW1lc3RhbXAgPSBsb2NhbENoZWNrVGltZXN0YW1wO1xuXHRcdGlmKHRoaXMuaXNBbmltYXRlZCkgd2hpbGUodGhpcy5pc05leHRVcGRhdGVSZWFkeShsb2NhbENoZWNrVGltZXN0YW1wKSlcblx0XHR7XG5cdFx0XHR2YXIgcHJvY2Nlc2VkID0gdGhpcy5wcm9jZXNzVXBkYXRlUXVldWUoKTtcblx0XHRcdGlmKHByb2NjZXNlZCE9bnVsbClcblx0XHRcdHtcblx0XHRcdFx0dmFyIGRhdGUgPSBuZXcgRGF0ZShwcm9jY2VzZWQucHJvY2Vzc1RpbWVzdGFtcCoxMDAwKzAqMTAwMCk7Ly9wcm9jY2VzZWQuZ2V0RGF0ZSgpO1xuXHRcdFx0fVxuXHRcdH1cdFxuXHR9XG5cblx0XG5cdFxuXHRcblx0bG9nKClcblx0e1xuXHRcdGNvbnNvbGUubG9nKFwicGF0aFdvcmxkIGxvZzpcIitDb21tb250b1N0cmluZyh0aGlzLndvcmxkRGlzcGxheSkpO1xuXHR9XG5cdFxuXHRcblx0aXNXYWxrZXJOZXcod2Fsa2VyTmFtZSlcblx0e1xuXHRcdHJldHVybighdGhpcy53YWxrZXJzLmhhc093blByb3BlcnR5KHdhbGtlck5hbWUpKTtcblx0fVxuXHRcblx0aXNKdW5jdGlvbk5ldyhqdW5jdGlvbk5hbWUpXG5cdHtcblx0XHRyZXR1cm4oIXRoaXMuanVuY3Rpb25zLmhhc093blByb3BlcnR5KGp1bmN0aW9uTmFtZSkpO1xuXHR9XG5cdFxuXHRpc05leHRVcGRhdGVSZWFkeSh0aW1lc3RhbXApXG5cdHtcblx0XHR2YXIgcmVhZHkgPSBmYWxzZTtcblx0XHRpZih0aGlzLnVwZGF0ZVF1ZXVlLmxlbmd0aD4wKVxuXHRcdHtcblx0XHRcdHJlYWR5ID0gdGhpcy51cGRhdGVRdWV1ZVswXS5yZWFkeVRvQmVQcm9jZXNzZWQodGltZXN0YW1wKTtcblx0XHR9XG5cdFx0cmV0dXJuKHJlYWR5KTtcblx0fVxuXHRcblx0cGVla0F0TmV4dFVwZGF0ZSgpXG5cdHtcblx0XHR2YXIgdXBkYXRlID0gbnVsbDtcblx0XHRpZih0aGlzLnVwZGF0ZVF1ZXVlLmxlbmd0aD4wKVxuXHRcdHtcblx0XHRcdHdvcmxkVXBkYXRlID0gdGhpcy51cGRhdGVRdWV1ZVswXTtcblx0XHR9XG5cdFx0cmV0dXJuKHVwZGF0ZSk7XG5cdH1cblx0XG5cdGdldENyZWF0ZVBhdGgoanVuY3Rpb25TdGFydCxqdW5jdGlvbkVuZCxwYXRoSW5mbylcblx0e1xuXHRcdHZhciBjb25uZWN0b3JEaXNwbGF5T2JqZWN0ID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0Q29ubmVjdG9yRGlzcGxheShwYXRoSW5mby5wYXRoVHlwZUtleSk7XG5cdFx0XG5cdFx0dmFyIHBhdGggPSBudWxsO1xuXHRcdHZhciBwYXRoS2V5ID0gdGhpcy5nZXRQYXRoS2V5KGp1bmN0aW9uU3RhcnQsanVuY3Rpb25FbmQpO1xuXHRcdGlmKCF0aGlzLnBhdGhzLmhhc093blByb3BlcnR5KHBhdGhLZXkpKVxuXHRcdHtcblx0XHRcdHZhciBwID0gdGhpcy5jYW52YXNIb2xkZXIuZ2V0Q29ubmVjdG9yKFwicGF0aFwiLHBhdGhLZXkpO1xuXHRcdFx0cC5zZXRKdW5jdGlvbnMoanVuY3Rpb25TdGFydCxqdW5jdGlvbkVuZCk7XG5cdFx0XHR0aGlzLnBhdGhzW3BhdGhLZXldID0gcDtcblx0XHR9XG5cdFx0dmFyIHBhdGggPSB0aGlzLnBhdGhzW3BhdGhLZXldO1xuXHRcdHJldHVybihwYXRoKTtcblx0fVxuXHRcblx0Z2V0V2Fsa2VyTGlzdCgpXG5cdHtcblx0XHR2YXIgd2Fsa2VyTGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcdHZhciB3YWxrZXJzID0gdGhpcy53YWxrZXJzO1xuXHRcdE9iamVjdC5rZXlzKHRoaXMud2Fsa2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxuXHRcdHtcblx0XHRcdHdhbGtlckxpc3QucHVzaCh3YWxrZXJzW2tleV0pO1xuXHRcdH0pO1xuXHRcdHJldHVybih3YWxrZXJMaXN0KTtcblx0fVxuXG5cdGdldFBhdGhMaXN0KClcblx0e1xuXHRcdHZhciBwYXRoTGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcdHZhciBwYXRocyA9IHRoaXMucGF0aHM7XG5cdFx0T2JqZWN0LmtleXModGhpcy5wYXRocykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxuXHRcdHtcblx0XHRcdHBhdGhMaXN0LnB1c2gocGF0aHNba2V5XSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuKHBhdGhMaXN0KTtcblx0fVxuXG5cdGdldEp1bmN0aW9uTGlzdCgpXG5cdHtcblx0XHR2YXIganVuY3Rpb25MaXN0ID0gbmV3IEFycmF5KCk7XG5cdFx0dmFyIGp1bmN0aW9ucyA9IHRoaXMuanVuY3Rpb25zO1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuanVuY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0e1xuXHRcdFx0anVuY3Rpb25MaXN0LnB1c2goanVuY3Rpb25zW2tleV0pO1xuXHRcdH0pO1xuXHRcdHJldHVybihqdW5jdGlvbkxpc3QpO1xuXHR9XG5cdFxuXHQvKlxuXHRnZXRKdW50aW9uR3JhcGhEYXRhKGp1bmN0aW9uSW5mbylcblx0e1xuXHRcdHZhciBqdW5jdGlvbkdyYXBoRGF0YSA9IHRoaXMud29ybGREaXNwbGF5Lmp1bmN0aW9uVHlwZXNbXCJnZW5lcmljXCJdO1xuXHRcblx0XHRpZih0aGlzLndvcmxkRGlzcGxheS5qdW5jdGlvblR5cGVzLmhhc093blByb3BlcnR5KGp1bmN0aW9uSW5mby5qdW5jdGlvblR5cGVLZXkpKVxuXHRcdHtcblx0XHRcdGp1bmN0aW9uR3JhcGhEYXRhID0gdGhpcy53b3JsZERpc3BsYXkuanVuY3Rpb25UeXBlc1tqdW5jdGlvbkluZm8uanVuY3Rpb25UeXBlS2V5XTtcblx0XG5cdFx0fVxuXHRcdHJldHVybihqdW5jdGlvbkdyYXBoRGF0YSk7XG5cdH1cblx0Ki9cblx0Z2V0Q3JlYXRlSnVuY3Rpb24obmFtZSxqdW5jdGlvbkluZm8pXG5cdHtcblx0XHQvL3ZhciBqdW5jdGlvbkdyYXBoRGF0YSA9IHRoaXMuZ2V0SnVudGlvbkdyYXBoRGF0YShqdW5jdGlvbkluZm8pO1xuXHRcdGlmKCF0aGlzLmp1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShuYW1lKSlcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiUGVkaWdyZWVDYW52YXM6Z2V0Q3JlYXRlSnVuY3Rpb246dHlwZT1cIitqdW5jdGlvbkluZm8uanVuY3Rpb25UeXBlS2V5KTtcblxuXHRcdFx0dmFyIHN0YXJ0UG9zaXRpb24gPSB0aGlzLmdldFN0YXJ0UG9zaXRpb25KdW5jdGlvbigpO1xuXHRcdFx0dGhpcy5qdW5jdGlvbnNbbmFtZV0gPSBuZXcgSnVuY3Rpb24oXG5cdFx0XHRcdG5hbWUsXG5cdFx0XHRcdG5ldyBQb3NpdGlvbihzdGFydFBvc2l0aW9uLmdldFgoKSxzdGFydFBvc2l0aW9uLmdldFkoKSksXG5cdFx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLFxuXHRcdFx0XHRuZXcgQXJyYXkoKSxcblx0XHRcdFx0anVuY3Rpb25JbmZvLmp1bmN0aW9uVHlwZUtleSxcblx0XHRcdFx0anVuY3Rpb25JbmZvLFxuXHRcdFx0XHR0aGlzKTtcblx0XHRcdHZhciBqID0gdGhpcy5qdW5jdGlvbnNbbmFtZV07XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwicGF0aFdvcmxkIGdldENyZWF0ZUp1bmN0aW9uIGlubmVyIG5hbWU6XCIrai5uYW1lKVx0XG5cdFx0XHR0aGlzLmFkZE5vZGUoaik7XG5cdFx0XHR0aGlzLndvcmxkV2FsbC5hZGROb2RlKGopO1xuXHRcdFx0dGhpcy5qdW5jdGlvblNwYWNlci5hZGROb2RlKGopO1xuXHRcdH1cblx0XHR2YXIganVuY3Rpb24gPSB0aGlzLmp1bmN0aW9uc1tuYW1lXTtcblx0XG5cdFx0cmV0dXJuKGp1bmN0aW9uKTtcblx0fVxuXHRcblx0Lypcblx0Z2V0V2Fsa2VyR3JhcGhEYXRhKHdhbGtlckluZm8pXG5cdHtcblx0XHR2YXIgd2Fsa2VyR3JhcGhEYXRhID0gdGhpcy53b3JsZERpc3BsYXkud2Fsa2VyRGlzcGxheVR5cGVzW1wiZ2VuZXJpY1wiXTtcblx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0V2Fsa2VyR3JhcGhEYXRhOmxvb2tpbmcgdXA6XCIrQ29tbW9udG9TdHJpbmcod2Fsa2VySW5mbykpO1xuXHRcdGlmKHRoaXMud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlcy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJJbmZvLndhbGtlclR5cGVLZXkpKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coXCIgICAgIGdldFdhbGtlckdyYXBoRGF0YTpmb3VuZDpcIitDb21tb250b1N0cmluZyh3YWxrZXJJbmZvLndhbGtlclR5cGVLZXkpKTtcblx0XHRcdHdhbGtlckdyYXBoRGF0YSA9IHRoaXMud29ybGREaXNwbGF5LndhbGtlckRpc3BsYXlUeXBlc1t3YWxrZXJJbmZvLndhbGtlclR5cGVLZXldO1xuXHRcdH1cblx0XHRyZXR1cm4od2Fsa2VyR3JhcGhEYXRhKTtcblx0fVxuXHQqL1xuXHRnZXRDcmVhdGVXYWxrZXIod2Fsa2VyTmFtZSx3YWxrZXJJbmZvKVxuXHR7XG5cdFx0Ly92YXIgd2Fsa2VyR3JhcGhEYXRhID0gdGhpcy5nZXRXYWxrZXJHcmFwaERhdGEod2Fsa2VySW5mbyk7XG5cdFx0XG5cdFx0aWYoIXRoaXMud2Fsa2Vycy5oYXNPd25Qcm9wZXJ0eSh3YWxrZXJOYW1lKSlcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiUGVkaWdyZWVDYW52YXM6Z2V0Q3JlYXRlV2Fsa2VyOnR5cGU9XCIrd2Fsa2VySW5mby53YWxrZXJUeXBlS2V5KTtcblxuXHRcdFx0dmFyIHN0YXJ0UG9zaXRpb24gPSB0aGlzLmdldFN0YXJ0UG9zaXRpb25XYWxrZXIoKTtcblx0XHRcdHRoaXMud2Fsa2Vyc1t3YWxrZXJOYW1lXSA9IG5ldyBXYWxrZXIoXG5cdFx0XHRcdFx0d2Fsa2VyTmFtZSxcblx0XHRcdFx0XHRuZXcgUG9zaXRpb24oc3RhcnRQb3NpdGlvbi5nZXRYKCksc3RhcnRQb3NpdGlvbi5nZXRZKCkpLFxuXHRcdFx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLFxuXHRcdFx0XHRcdG5ldyBBcnJheSgpLFxuXHRcdFx0XHRcdHdhbGtlckluZm8ud2Fsa2VyVHlwZUtleSxcblx0XHRcdFx0XHR3YWxrZXJJbmZvKTtcblx0XHRcdHZhciB3ID0gdGhpcy53YWxrZXJzW3dhbGtlck5hbWVdO1xuXHRcdFx0dGhpcy5hZGROb2RlKHcpO1xuXHRcdFx0dGhpcy53b3JsZFdhbGwuYWRkTm9kZSh3KTtcblx0XHRcdC8vdGhpcy5qdW5jdGlvblNwYWNlci5hZGROb2RlKGopO1xuXHRcdH1cblx0XHR2YXIgd2Fsa2VyID0gdGhpcy53YWxrZXJzW3dhbGtlck5hbWVdOyBcblx0XHRyZXR1cm4od2Fsa2VyKTtcblx0fVxuXHRcblx0cmVtb3ZlV2Fsa2VyKHdhbGtlcilcblx0e1xuXHRcdC8vY29uc29sZS5sb2coXCJQZWRpZ3JlZUNhbnZhcy5yZW1vdmVXYWxrZXI6XCIrd2Fsa2VyLm5hbWUrXCIgYXQgXCIrd2Fsa2VyLmdldEN1cnJlbnRKdW5jdGlvbigpLm5hbWUpO1xuXHRcdGlmKHdhbGtlci5nZXRDdXJyZW50SnVuY3Rpb24oKSlcdHdhbGtlci5nZXRDdXJyZW50SnVuY3Rpb24oKS5yZW1vdmVXYWxrZXIod2Fsa2VyKTtcblx0XHR0aGlzLnJlbW92ZU5vZGUod2Fsa2VyKTtcblx0XHR0aGlzLndvcmxkV2FsbC5yZW1vdmVOb2RlKHdhbGtlcik7XG5cdFx0ZGVsZXRlIHRoaXMud2Fsa2Vyc1t3YWxrZXIubmFtZV07XG5cdH1cblx0XG5cdGdldFRlbGVwb3J0UGF0aChzdGFydEp1bmN0aW9uLGVuZEp1bmN0aW9uKVxuXHR7XG5cdFx0dmFyIHN0YXJ0SnVuY3Rpb25OYW1lID0gXCJcIjtcblx0XHR2YXIgZW5kSnVuY3Rpb25OYW1lID0gXCJcIjtcblx0XHRpZihzdGFydEp1bmN0aW9uIT1udWxsKSBzdGFydEp1bmN0aW9uTmFtZSA9IHN0YXJ0SnVuY3Rpb24ubmFtZTtcblx0XHRpZihlbmRKdW5jdGlvbiE9bnVsbCkgZW5kSnVuY3Rpb25OYW1lID0gZW5kSnVuY3Rpb24ubmFtZTtcblx0XHR2YXIgdGVsZXBvcnRQYXRoUmV0dXJuID0gbnVsbDtcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMud29ybGREaXNwbGF5LnRlbGVwb3J0UGF0aHMubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgdGVsZXBvcnRQYXRoID0gdGhpcy53b3JsZERpc3BsYXkudGVsZXBvcnRQYXRoc1tpXTtcblx0XHRcdHZhciBzdGFydEp1bmN0aW9uUmVnRXhwID0gbmV3IFJlZ0V4cCh0ZWxlcG9ydFBhdGguc3RhcnRKdW5jdGlvbik7XG5cdFx0XHR2YXIgZW5kSnVuY3Rpb25SZWdFeHAgPSBuZXcgUmVnRXhwKHRlbGVwb3J0UGF0aC5lbmRKdW5jdGlvbik7XG5cdFx0XHRpZihcblx0XHRcdFx0XHRzdGFydEp1bmN0aW9uUmVnRXhwLnRlc3Qoc3RhcnRKdW5jdGlvbk5hbWUpICYmXG5cdFx0XHRcdFx0ZW5kSnVuY3Rpb25SZWdFeHAudGVzdChlbmRKdW5jdGlvbk5hbWUpICYmXG5cdFx0XHRcdFx0c3RhcnRKdW5jdGlvbk5hbWUhPWVuZEp1bmN0aW9uTmFtZSlcblx0XHRcdHtcblx0XHRcdFx0dGVsZXBvcnRQYXRoUmV0dXJuID0gdGVsZXBvcnRQYXRoO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuKHRlbGVwb3J0UGF0aFJldHVybik7XG5cdH1cblx0XG5cdGdldEVuZFBvaW50TW9kKHN0YXJ0SnVuY3Rpb24sZW5kSnVuY3Rpb24pXG5cdHtcblx0XHR2YXIgc3RhcnRKdW5jdGlvbk5hbWUgPSBcIlwiO1xuXHRcdHZhciBlbmRKdW5jdGlvbk5hbWUgPSBcIlwiO1xuXHRcdGlmKHN0YXJ0SnVuY3Rpb24hPW51bGwpIHN0YXJ0SnVuY3Rpb25OYW1lID0gc3RhcnRKdW5jdGlvbi5uYW1lO1xuXHRcdGlmKGVuZEp1bmN0aW9uIT1udWxsKSBlbmRKdW5jdGlvbk5hbWUgPSBlbmRKdW5jdGlvbi5uYW1lO1xuXHRcdHZhciBlbmRQb2ludFJldHVybiA9IG51bGw7XG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLndvcmxkRGlzcGxheS5lbmRQb2ludE1vZHMubGVuZ3RoO2krKylcblx0XHR7XG5cdFx0XHR2YXIgZW5kUG9pbnQgPSB0aGlzLndvcmxkRGlzcGxheS5lbmRQb2ludE1vZHNbaV07XG5cdFx0XHR2YXIgc3RhcnRKdW5jdGlvblJlZ0V4cCA9IG5ldyBSZWdFeHAoZW5kUG9pbnQuc3RhcnRKdW5jdGlvbik7XG5cdFx0XHR2YXIgZW5kSnVuY3Rpb25SZWdFeHAgPSBuZXcgUmVnRXhwKGVuZFBvaW50LmVuZEp1bmN0aW9uKTtcblx0XHRcdGlmKFxuXHRcdFx0XHRcdHN0YXJ0SnVuY3Rpb25SZWdFeHAudGVzdChzdGFydEp1bmN0aW9uTmFtZSkgJiZcblx0XHRcdFx0XHRlbmRKdW5jdGlvblJlZ0V4cC50ZXN0KGVuZEp1bmN0aW9uTmFtZSkgJiZcblx0XHRcdFx0XHRzdGFydEp1bmN0aW9uTmFtZSE9ZW5kSnVuY3Rpb25OYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHRlbmRQb2ludFJldHVybiA9IGVuZFBvaW50O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuKGVuZFBvaW50UmV0dXJuKTtcblx0fVxuXHRcblx0cHJvY2Vzc1VwZGF0ZVF1ZXVlKClcblx0e1xuXHRcdHZhciB1cGRhdGUgPSB0aGlzLmdldE5leHRGcm9tVXBkYXRlUXVldWUoKTtcblx0XHRpZih1cGRhdGUhPW51bGwpIHdvcmxkVXBkYXRlID0gdGhpcy5wcm9jZXNzVXBkYXRlKHVwZGF0ZSk7XG5cdFx0cmV0dXJuKHdvcmxkVXBkYXRlKTtcblx0fVxuXHRcblx0cHJvY2Vzc1VwZGF0ZSh1cGRhdGUpXG5cdHtcblx0XHRjb25zb2xlLmxvZyhcInByb2Nlc3NVcGRhdGVRdWV1ZTp1cGRhdGU9XCIrQ29tbW9udG9TdHJpbmcodXBkYXRlKSk7XHRcdFxuXHRcdHRoaXMudXBkYXRlUXVldWVQcm9jZXNzZWQucHVzaCh1cGRhdGUpO1xuXHRcdHJldHVybih1cGRhdGUpO1xuXHR9XG5cdFxuXHRcblx0XG5cdGFkZFRvVXBkYXRlUXVldWUodXBkYXRlKVxuXHR7XG5cdFx0dGhpcy51cGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZyA9IHRydWU7XG5cdFx0dGhpcy51cGRhdGVRdWV1ZS5wdXNoKHVwZGF0ZSk7XG5cdH1cdFxuXHRcblx0cHJlcGFyZVVwZGF0ZVF1ZXVlKClcblx0e1xuXHRcdC8vY29uc29sZS5sb2coXCJwcmVwYXJlVXBkYXRlUXVldWU6aXNJbk5lZWRPZlNvcnRpbmc9XCIrdGhpcy51cGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZyk7XG5cdFx0aWYodGhpcy51cGRhdGVRdWV1ZS5pc0luTmVlZE9mU29ydGluZylcblx0XHR7XG5cdFx0XHR0aGlzLnVwZGF0ZVF1ZXVlLnNvcnQoXG5cdFx0XHRcdGZ1bmN0aW9uKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4oYS5wcm9jZXNzVGltZXN0YW1wLWIucHJvY2Vzc1RpbWVzdGFtcCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0XHRcdHRoaXMudXBkYXRlUXVldWUuaXNJbk5lZWRPZlNvcnRpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cblx0XG5cdGdldE5leHRGcm9tVXBkYXRlKClcblx0e1xuXHRcdHZhciB1cGRhdGUgPSBudWxsO1xuXHRcdGlmKHRoaXMud29ybGRRdWV1ZS5sZW5ndGg+MClcblx0XHR7XG5cdFx0XHR1cGRhdGUgPSB0aGlzLnVwZGF0ZVF1ZXVlWzBdO1xuXHRcdFx0dGhpcy51cGRhdGVRdWV1ZS5zaGlmdCgpO1xuXHRcdH1cblx0XHRyZXR1cm4odXBkYXRlKTtcblx0fVxuXHRcblx0Z2V0V2Fsa2VyS2V5KHdhbGtlcilcblx0e1xuXHRcdHJldHVybih3YWxrZXIubmFtZSk7XG5cdH1cblx0XG5cdGdldEp1bmN0aW9uS2V5KGp1bmN0aW9uKVxuXHR7XG5cdFx0cmV0dXJuKGp1bmN0aW9uLmdldE5vZGVLZXkoKSk7XG5cdH1cblx0XG5cdGdldFBhdGhLZXkoanVuY3Rpb25TdGFydCxqdW5jdGlvbkVuZClcblx0e1xuXHRcdHJldHVybih0aGlzLmdldEp1bmN0aW9uS2V5KGp1bmN0aW9uU3RhcnQpK1wiI1wiK3RoaXMuZ2V0SnVuY3Rpb25LZXkoanVuY3Rpb25FbmQpKTtcblx0fVxuXHRcblx0Z2V0U3RhcnRQb3NpdGlvbldhbGtlcigpXG5cdHtcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuY2FudmFzSG9sZGVyLmdldFdpZHRoKCkvMix0aGlzLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKS8yKSk7XG5cdH1cblx0XG5cdGdldFN0YXJ0UG9zaXRpb25KdW5jdGlvbigpXG5cdHtcblx0XHRyZXR1cm4obmV3IFBvc2l0aW9uKHRoaXMuY2FudmFzSG9sZGVyLmdldFdpZHRoKCkvMix0aGlzLmNhbnZhc0hvbGRlci5nZXRIZWlnaHQoKS8yKSk7XG5cdH1cblxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gUGVkaWdyZWVDYW52YXM7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6UGVkaWdyZWVDYW52YXNcIik7XG4vLzwvanMybm9kZT5cbiIsInZhciBDYW52YXNIb2xkZXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcicpO1xudmFyIENhbnZhc0hvbGRlclZpcnR1YWwgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcnZpcnR1YWwnKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoJy4uL25vZGVzL3Bvc2l0aW9uL3Bvc2l0aW9uJyk7XG52YXIgUGVkaWdyZWVDYW52YXMgPSByZXF1aXJlKCcuLi9wZWRpZ3JlZS9wZWRpZ3JlZWNhbnZhcycpO1xuLy92YXIgV29ybGRVcGRhdGUgPSBHZW5lcmljUGVkaWdyZWVEZWZyZXF1aXJlKCcuLi8uLi9wYXRocy93b3JsZHVwZGF0ZScpO1xuLy8vLy8vLy8vLy8vLy8vL3ZhciBHZW5lcmljUGVkaWdyZWVEZWYgPSByZXF1aXJlKCcuLi9wZWRpZ3JlZS9nZW5lcmljcGVkaWdyZWVkZWYnKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XG52YXIgQ2FudmFzSG9sZGVyID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXInKTtcblxuY2xhc3MgUGVkaWdyZWVDbGllbnRcbntcblx0Y29uc3RydWN0b3IoY2FudmFzSG9sZGVyKVxuXHR7XG5cdFx0dGhpcy5jYW52YXNOYW1lID0gY2FudmFzSG9sZGVyLmNhbnZhc05hbWU7XG5cdFx0dGhpcy5jYW52YXNIb2xkZXIgPSBjYW52YXNIb2xkZXI7XG5cdFx0dGhpcy53b3JsZERpc3BsYXkgPSB0aGlzLmNhbnZhc0hvbGRlci53b3JsZERlZi5nZXRXb3JsZERpc3BhbHkoKTtcdFxuXHRcdHRoaXMud29ybGQgPSBuZXcgUGVkaWdyZWVDYW52YXMoXG5cdFx0XHRcdHRoaXMuY2FudmFzSG9sZGVyLFx0XHRcblx0XHRcdFx0dGhpcy53b3JsZERpc3BsYXkpO1xuXHRcdHRoaXMud29ybGQudGltZUZhY3RvciA9IDEuMDtcblx0XHR0aGlzLndvcmxkLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cdFx0dGhpcy5sYXN0VGltZURlbHRhID0gLTE7XG5cblx0XHQvKlxuXHRcdHZhciBmaXJzdEl0ZW0gPSB0aGlzLndvcmxkLnBlZWtBdE5leHRXb3JsZFVwZGF0ZSgpO1xuXHRcdGlmKGZpcnN0SXRlbSE9bnVsbClcblx0XHR7XG5cdFx0XHR2YXIgZmlyc3REYXRlID0gZmlyc3RJdGVtLmdldERhdGUoKTtcblx0XHRcdHRoaXMud29ybGQuc3RhcnRUaW1lID0gZmlyc3REYXRlO1xuXHRcdH1cblx0XHQqL1xuXHR9XG5cdFxuXHRzdGF0aWMgZ2V0RXhwb3J0cygpXG5cdHtcblx0XHRyZXR1cm4oXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRDYW52YXNIb2xkZXI6Q2FudmFzSG9sZGVyLFxuXHRcdFx0XHRcdENhbnZhc0hvbGRlclZpcnR1YWw6Q2FudmFzSG9sZGVyVmlydHVhbCxcblx0XHRcdFx0XHRQb3NpdGlvbjpQb3NpdGlvbixcblx0XHRcdFx0XHRQZWRpZ3JlZUNhbnZhczpQZWRpZ3JlZUNhbnZhcyxcblx0XHRcdFx0XHQvL1dvcmxkVXBkYXRlOldvcmxkVXBkYXRlLFxuXHRcdFx0XHRcdC8vSW5hR3JhcGhQZWRpZ3JlZUNhbnZhc0RlZjpJbmFHcmFwaFBlZGlncmVlQ2FudmFzRGVmLFxuXHRcdFx0XHRcdENvbW1vbjpDb21tb24sXG5cdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0fVxuXHRcblx0c3RhcnRBbmltYXRpb24oKVxuXHR7XG5cdFx0XHR0aGlzLmRvRHJhdygpO1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXsgc2VsZi5kb0RyYXcoKTsgfSwyNTApO1x0XHRcblx0fVxuXHRcblx0ZG9EcmF3KClcblx0e1xuXHRcdGlmKHRoaXMubGFzdFRpbWVEZWx0YTwwKSB0aGlzLmdldERhdGEoKTtcblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5nZXREZWx0YSh0aGlzLmxhc3RUaW1lRGVsdGEpO1xuXHRcdFx0dGhpcy5wdXNoVXNlck1vdm1lbnRzKCk7XG5cdFx0fVxuXHR9ICAgIFx0XHRcdFx0XG5cdFxuXHRwdXNoVXNlck1vdm1lbnRzKClcblx0e1xuXHRcdC8vY29uc29sZS5sb2coXCJwdXNoVXNlck1vdm1lbnRzLi4uXCIpO1xuXHRcdHZhciBub2RlTW91c2VNb3ZtZW50ID0gdGhpcy53b3JsZC5ub2RlQ2FudmFzTW91c2Uubm9kZU1vdXNlTW92bWVudDtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0T2JqZWN0LmtleXMobm9kZU1vdXNlTW92bWVudCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxuXHRcdHtcblx0XHRcdHZhciBtb3ZlUG9zaXRpb24gPSBQb3NpdGlvbi5nZXRBdmVyYWdlUG9zdGlvbkZyb21Qb3NpdGlvbkxpc3Qobm9kZU1vdXNlTW92bWVudFtrZXldLm1vdmVQb3N0aW9uQXJyYXkpO1xuXHRcdFx0bm9kZU1vdXNlTW92bWVudFtrZXldLm1vdmVQb3N0aW9uQXJyYXkubGVuZ3RoID0gMDtcblx0XHRcdGRlbGV0ZSBub2RlTW91c2VNb3ZtZW50W2tleV07XG5cdFx0XHRcblx0XHRcdHZhciBtb3ZlTWVzc2FnZSA9IFxuXHRcdFx0e1xuXHRcdFx0XHRub2RlS2V5OmtleSxcblx0XHRcdFx0bW92ZVBvc2l0aW9uXG5cdFx0XHR9O1xuXHRcdFx0c2VsZi5zZW5kU2VydmVySnNvbihcblx0XHRcdFx0XCIvcGF0aHMvXCIrc2VsZi5jYW52YXNOYW1lK1wiL21vdmVub2RlL1wiLFxuXHRcdFx0XHRtb3ZlTWVzc2FnZSk7XG5cdFx0XHRjb25zb2xlLmxvZyhcIm1vdmVtZW50cyBmb3IgOiBcIitrZXkpO1xuXHRcdH0pO1xuXHR9XG5cdFxuXHRzZW5kU2VydmVySnNvbih1cmwsanNvbilcblx0e1xuXHRcdHZhciBlbmNvZGVkSnNvbiA9IENvbW1vbi5qc29uVG9VUkkoanNvbik7XG5cdFx0ZmV0Y2godXJsK2VuY29kZWRKc29uKS50aGVuKChyZXNwKSA9PiByZXNwLmpzb24oKSkudGhlbihcblx0ICBcdFx0XHRcdGZ1bmN0aW9uKGRhdGEpXG5cdCAgXHRcdFx0XHR7XG5cdCAgICBcdFx0XHRcdGNvbnNvbGUubG9nKFwic2VudCBqc29uIHRvIFwiK3VybCk7XG5cdCAgICBcdFx0XHR9KTsgIFx0XG5cdCB9XG5cdFxuXHRnZXREZWx0YShkZWx0YVRpbWUpXG5cdHtcblx0XHR2YXIgdXJsID0gXCIvcGF0aHMvXCIrdGhpcy5jYW52YXNOYW1lK1wiL2RlbHRhL1wiK2RlbHRhVGltZStcIi9cIisxMDtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0ZmV0Y2godXJsKS50aGVuKChyZXNwKSA9PiByZXNwLmpzb24oKSkudGhlbihcblx0ICBcdFx0XHRcdGZ1bmN0aW9uKGRhdGEpXG5cdCAgXHRcdFx0XHR7XG5cdCAgICBcdFx0XHRcdGZvcih2YXIgaT0wO2k8ZGF0YS5sZW5ndGg7aSsrKVxuXHQgICAgXHRcdFx0XHR7XG5cdCAgICBcdFx0XHRcdFx0dmFyICBvbmVEYXRhID0gZGF0YVtpXTtcblx0ICAgIFx0XHRcdFx0XHRpZihvbmVEYXRhLnVwZGF0ZVR5cGU9PSBcImp1bmN0aW9uXCIpXG5cdFx0XHRcdFx0XHRcdHtcblx0ICAgIFx0XHRcdFx0XHRcdHNlbGYud29ybGQuYWRkVG9Xb3JsZFVwZGF0ZVF1ZXVlKFdvcmxkVXBkYXRlLmNyZWF0ZVdvcmxkVXBkYXRlRnJvbUpzb24ob25lRGF0YSkpO1xuXHRcblx0ICAgIFx0XHRcdFx0XHR9XG5cdCAgICBcdFx0XHRcdFx0ZWxzZSBpZihvbmVEYXRhLnVwZGF0ZVR5cGU9PVwibW92ZVwiKVxuXHQgICAgXHRcdFx0XHRcdHtcblx0ICAgIFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwibW92ZTpcIitDb21tb24udG9TdHJpbmcob25lRGF0YSkpO1xuXHQgICAgXHRcdFx0XHRcdFx0aWYoc2VsZi53b3JsZC5kb2VzTm9kZUV4aXN0KG9uZURhdGEubm9kZUtleSkpXG5cdCAgICBcdFx0XHRcdFx0XHR7XG5cdCAgICBcdFx0XHRcdFx0XHRcdHZhciBub2RlID0gc2VsZi53b3JsZC5nZXROb2RlKG9uZURhdGEubm9kZUtleSk7XG5cdCAgICBcdFx0XHRcdFx0XHRcdGlmKCFub2RlLmlzU2VsZWN0ZWQpIG5vZGUucG9zaXRpb24uc2V0WFkob25lRGF0YS5tb3ZlUG9zaXRpb24ueCxvbmVEYXRhLm1vdmVQb3NpdGlvbi55KTtcblx0ICAgIFx0XHRcdFx0XHRcdH1cblx0ICAgIFx0XHRcdFx0XHR9XG5cdCAgICBcdFx0XHRcdFx0c2VsZi5sYXN0VGltZURlbHRhID0gb25lRGF0YS5wcm9jZXNzVGltZXN0YW1wO1xuXHQgICAgXHRcdFx0XHR9XG5cdCAgICBcdFx0XHR9KTsgIFx0XG5cdCB9XG5cdFxuXHRnZXREYXRhKClcblx0e1xuXHRcdHZhciB1cmwgPSBcIi9wYXRocy9cIit0aGlzLmNhbnZhc05hbWU7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdGZldGNoKHVybCkudGhlbigocmVzcCkgPT4gcmVzcC5qc29uKCkpLnRoZW4oXG5cdCAgXHRcdFx0XHRmdW5jdGlvbihkYXRhKVxuXHQgIFx0XHRcdFx0e1xuXHQgICAgXHRcdFx0XHRQZWRpZ3JlZUNhbnZhcy5maWxsUGVkaWdyZWVDYW52YXNGcm9tQ2xpZW50SnNvbihzZWxmLndvcmxkLGRhdGEpO1xuXHQgICAgXHRcdFx0fSk7XG5cdFx0dGhpcy5sYXN0VGltZURlbHRhID0gMDtcdFxuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IFBlZGlncmVlQ2xpZW50O1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlBlZGlncmVlQ2xpZW50XCIpO1xuLy88L2pzMm5vZGU+IiwidmFyIENhbnZhc0RlZiA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVjYW52YXMvY2FudmFzZGVmJyk7XG5cblxuY2xhc3MgUGVkaWdyZWVDYW52YXNEZWYgZXh0ZW5kcyBDYW52YXNEZWZcbntcblx0Y29uc3RydWN0b3IoKVxuXHR7XHRcdFxuXHRcdHN1cGVyKCk7XG5cdH1cblx0XG5cdGdldFBhdGhQYXJ0cygpXG5cdHtcblx0XHR0aHJvdyBcIlBlZGlncmVlQ2FudmFzRGVmLmdldFBhdGhQYXJ0cyBub3QgZGVmaW5lZFwiO1xuXHR9XG5cdFxuXHRnZXRQYXRoRGVmKClcblx0e1xuXHRcdHRocm93IFwiUGVkaWdyZWVDYW52YXNEZWYuZ2V0UGF0aERlZiBub3QgZGVmaW5lZFwiO1xuXHR9XG5cdFxuXHRnZXRXYWxrZXJKdW5jdGlvblJ1bGVzKClcblx0e1xuXHRcdHRocm93IFwiUGVkaWdyZWVDYW52YXNEZWYuZ2V0V2Fsa2VySnVuY3Rpb25SdWxlcyBub3QgZGVmaW5lZFwiO1xuXHR9XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IFBlZGlncmVlQ2FudmFzRGVmO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOlBlZGlncmVlQ2FudmFzRGVmXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgTm9kZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGUnKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24vY29tbW9uJyk7XG5cbmNsYXNzIFdhbGtlciBleHRlbmRzIE5vZGVcbntcblx0Y29uc3RydWN0b3IobmFtZSxwb3NpdGlvbixjYW52YXNIb2xkZXIsc2hhcGVMaXN0LGdyYXBoRGF0YUtleSxpbmZvRGF0YSlcblx0e1xuXHRcdHN1cGVyKG5hbWUscG9zaXRpb24sY2FudmFzSG9sZGVyLGdyYXBoRGF0YUtleSxpbmZvRGF0YSk7XG5cdFx0V2Fsa2VyLmluaXRXYWxrZXIodGhpcyxuYW1lLHBvc2l0aW9uLHNoYXBlTGlzdCxncmFwaERhdGFLZXksaW5mb0RhdGEpO1xuXHR9XG5cdFxuXHRzdGF0aWMgaW5pdFdhbGtlcih3YWxrZXIsbmFtZSxwb3NpdGlvbixzaGFwZUxpc3QsZ3JhcGhEYXRhS2V5LGluZm9EYXRhKVxuXHR7XG5cdFx0d2Fsa2VyLmp1bmN0aW9uQXJyYXkgPSBuZXcgQXJyYXkoKTtcblx0XHR3YWxrZXIubGF5ZXI9Mjtcblx0XHRpZighd2Fsa2VyLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzKSB3YWxrZXIuZ3JhcGhEYXRhLndhbGtlckp1bmN0aW9uUnVsZXMgPSBuZXcgT2JqZWN0KCk7XG5cdFx0aWYoIXdhbGtlci5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzKVxuXHRcdFx0d2Fsa2VyLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHMgPSBuZXcgQXJyYXkoKTtcblx0fVxuXHRcblx0Z2V0Q2xpZW50SnNvbigpXG5cdHtcblx0XHR2YXIganNvbiA9IHN1cGVyLmdldENsaWVudEpzb24oKTtcblx0XHRqc29uLnBhdGhXb3JsZFR5ZSA9IFwid2Fsa2VyXCI7XG5cdFx0anNvbi5jdXJyZW50SnVuY3Rpb24gPSB0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpLmdldE5vZGVLZXkoKTtcblx0XHRyZXR1cm4oanNvbik7XG5cdH1cblxuXHRcblx0Z2V0Tm9kZVVpRGlzcGxheShub2RlKVxuXHR7XG5cdFx0dmFyIHZhbHVlID0gdGhpcy5uYW1lO1xuXHRcblx0XHR2YWx1ZSArPSBcIjxsaT50eXBlOlwiK3RoaXMuaW5mb0RhdGEud2Fsa2VyVHlwZUtleStcIjwvbGk+XCI7XG5cdFx0dmFsdWUgKz0gXCI8bGk+Y3VycmVudEo6XCIrdGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5uYW1lK1wiPC9saT5cIjtcblx0XHRcblx0XHRmb3IodmFyIGk9MDtpPHRoaXMuZ3JhcGhEYXRhLndhbGtlckp1bmN0aW9uUnVsZXMuanVuY3Rpb25FeGl0cy5sZW5ndGg7aSsrKVxuXHRcdHtcblx0XHRcdHZhciBleGl0ID0gdGhpcy5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzW2ldO1xuXHRcblx0XHRcdHZhciB0aW1lVG9SZW1vdmUgPSAoXG5cdFx0XHRcdFx0KHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKVxuXHRcdFx0XHRcdDxcblx0XHRcdFx0XHR3b3JsZC5jaGVja1RpbWVzdGFtcCk7XG5cdFxuXHRcdFx0dmFsdWUgKz0gXCI8bGk+ZXhpdEp1bmN0aW9uOmk9XCIraStcIiBcIitleGl0LmV4aXRKdW5jdGlvbitcblx0XHRcdFx0XCIgYXQgZXhpdDpcIisoZXhpdC5leGl0SnVuY3Rpb249PXRoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkubmFtZSkrXG5cdFx0XHRcdFwiIHRpbWVUb1JlbW92ZTpcIit0aW1lVG9SZW1vdmUrXG5cdFx0XHRcdFwiPC9saT5cIjtcblx0XHR9XG5cdFx0Ly8vLy8vLy8vLy8vLy92YWx1ZSArPSBcIjxsaT5yZW1vdmUgYXQ6XCIrKHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKStcIjwvbGk+XCI7XG5cdFx0Ly92YWx1ZSArPSBcIjxsaT5jaGVja1RpbWU6XCIrd29ybGQuY2hlY2tUaW1lc3RhbXArXCI8L2xpPlwiO1xuXHRcdC8vLy8vLy8vL3ZhbHVlICs9IFwiPGxpPmRpZmY6XCIrKHdvcmxkLmNoZWNrVGltZXN0YW1wLSh0aGlzLmxhc3RVcGRhdGVUaW1lU3RhbXArZXhpdC5leGl0QWZ0ZXJNaWxpU2Vjb25kcykpK1wiPC9saT5cIjtcblx0XHRyZXR1cm4odmFsdWUpO1xuXHR9XG5cdFxuXHRcblx0cHJvY2Vzc1dhbGtlclJ1bGVzKHdvcmxkKVxuXHR7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInc6XCIrdGhpcy5uYW1lK1wiIGN1cnJlbnRKdW5jdGlvbj1cIit0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpLm5hbWUpO1xuXHRcdFxuXHRcdGZvcih2YXIgaT0wO2k8dGhpcy5ncmFwaERhdGEud2Fsa2VySnVuY3Rpb25SdWxlcy5qdW5jdGlvbkV4aXRzLmxlbmd0aDtpKyspXG5cdFx0e1xuXHRcdFx0dmFyIGV4aXQgPSB0aGlzLmdyYXBoRGF0YS53YWxrZXJKdW5jdGlvblJ1bGVzLmp1bmN0aW9uRXhpdHNbaV07XG5cdFx0XHRpZihleGl0LmV4aXRKdW5jdGlvbj09dGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5uYW1lKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgdGltZVRvUmVtb3ZlID0gKFxuXHRcdFx0XHRcdFx0KHRoaXMubGFzdFVwZGF0ZVRpbWVTdGFtcCtleGl0LmV4aXRBZnRlck1pbGlTZWNvbmRzKVxuXHRcdFx0XHRcdFx0PFxuXHRcdFx0XHRcdFx0d29ybGQuY2hlY2tUaW1lc3RhbXApO1xuXHRcdFx0XHRcblx0XHRcblx0XHRcdFx0aWYodGltZVRvUmVtb3ZlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJUSU1FIFRPIEVYSVQgdzpcIit0aGlzLm5hbWUrXG5cdFx0XHRcdFx0XHRcdFwiIGN1cnJlbnRKdW5jdGlvbj1cIit0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpLm5hbWUrXG5cdFx0XHRcdFx0XHRcdFwiIGV4aXQ6XCIrZXhpdC5leGl0SnVuY3Rpb24rXG5cdFx0XHRcdFx0XHRcdFwiIHR5cGU6XCIrQ29tbW9udG9TdHJpbmcodGhpcy5pbmZvRGF0YS53YWxrZXJUeXBlS2V5KStcblx0XHRcdFx0XHRcdFx0XCIgaW5mb0RhdGE6XCIrQ29tbW9udG9TdHJpbmcodGhpcy5pbmZvRGF0YSkpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHR3b3JsZC5yZW1vdmVXYWxrZXIodGhpcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly9jb25zb2xlLmxvZyhcInc6XCIrdGhpcy5uYW1lK1wiIGp1bmN0aW9uOlwiK3RoaXMuZ2V0Q3VycmVudEp1bmN0aW9uKCkpO1xuXHR9XG5cdFxuXHRzZXRDdXJyZW50SnVuY3Rpb24oanVuY3Rpb24pXG5cdHtcblx0XHRpZih0aGlzLmdldEN1cnJlbnRKdW5jdGlvbigpIT1udWxsKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coXCJnZXRDdXJyZW50SnVuY3Rpb24oKS5yZW1vdmVXYWxrZXIgXCIpO1xuXHRcdFx0dGhpcy5nZXRDdXJyZW50SnVuY3Rpb24oKS5yZW1vdmVXYWxrZXIodGhpcyk7XG5cdFx0fVxuXHRcdHRoaXMuanVuY3Rpb25BcnJheS5wdXNoKGp1bmN0aW9uKTtcblx0XHRqdW5jdGlvbi5hZGRXYWxrZXIodGhpcyk7XG5cdH1cblx0XG5cdGdldEN1cnJlbnRKdW5jdGlvbigpXG5cdHtcblx0XHRpZih0aGlzLmp1bmN0aW9uQXJyYXkubGVuZ3RoPT0wKSByZXR1cm4obnVsbCk7XG5cdFx0cmV0dXJuKHRoaXMuanVuY3Rpb25BcnJheVt0aGlzLmp1bmN0aW9uQXJyYXkubGVuZ3RoIC0gMV0pO1xuXHR9XG5cdFxuXHRsb2coKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXCJ3YWxrZXIgbG9nOlwiK0NvbW1vbnRvU3RyaW5nKHRoaXMpKTtcblx0fVxufVxuLy88anMybm9kZT5cbm1vZHVsZS5leHBvcnRzID0gV2Fsa2VyO1xuY29uc29sZS5sb2coXCJMb2FkaW5nOldhbGtlclwiKTtcbi8vPC9qczJub2RlPlxuIiwidmFyIENvbm5lY3RvciA9IHJlcXVpcmUoJy4uL25vZGVzL2Nvbm5lY3Rvci9jb25uZWN0b3InKTtcbnZhciBTcHJpbmdDb25uZWN0b3IgPSByZXF1aXJlKCcuLi9ub2Rlcy9jb25uZWN0b3Ivc3ByaW5nY29ubmVjdG9yJyk7XG5cblxuY2xhc3MgUGVyc29uQ29ubmVjdG9yIGV4dGVuZHMgU3ByaW5nQ29ubmVjdG9yXG57XG5cdGNvbnN0cnVjdG9yKGNvbm5lY3RvckRpc3BsYXksc3ByaW5nQW5jaG9yUG9pbnQsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IsbmFtZSlcblx0e1xuXHRcdHN1cGVyKGNvbm5lY3RvckRpc3BsYXksc3ByaW5nQW5jaG9yUG9pbnQsYW5jaG9yT2Zmc2V0UG9pbnQscmVsYXhlZERpc3RhbmNlLGVsYXN0aWNpdHlGYWN0b3IsbmFtZSlcblx0XHR0aGlzLndhbGtlck9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0fVxuXHRcblx0Z2V0Q2xpZW50SnNvbigpXG5cdHtcblx0XHR2YXIganNvbiA9IHN1cGVyLmdldENsaWVudEpzb24oKTtcblx0XHRqc29uLmp1bmN0aW9uU3RhcnQgPSB0aGlzLmp1bmN0aW9uU3RhcnQuZ2V0Tm9kZUtleSgpO1xuXHRcdGpzb24uanVuY3Rpb25FbmQgPSB0aGlzLmp1bmN0aW9uRW5kLmdldE5vZGVLZXkoKTtcblx0XHRyZXR1cm4oanNvbik7XG5cdH1cblx0XG5cdHNldEp1bmN0aW9ucyhqdW5jdGlvblN0YXJ0LGp1bmN0aW9uRW5kKVxuXHR7XG5cdCAgICB0aGlzLmp1bmN0aW9uU3RhcnQgPSBqdW5jdGlvblN0YXJ0O1xuXHRcdHRoaXMuanVuY3Rpb25FbmQgPSBqdW5jdGlvbkVuZDtcblx0XHR0aGlzLmFkZE5vZGUoanVuY3Rpb25TdGFydCk7XG5cdFx0dGhpcy5hZGROb2RlKGp1bmN0aW9uRW5kKTtcdFx0XG5cdH1cblx0XG5cdGdldENvbm5lY3RvcktleSgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy5nZXRQYXRoS2V5KCkpO1xuXHR9XG5cdFxuXHRnZXRQYXRoS2V5KClcblx0e1xuXHRcdHJldHVybih0aGlzLmp1bmN0aW9uU3RhcnQuZ2V0Tm9kZUtleSgpK1wiI1wiK3RoaXMuanVuY3Rpb25FbmQuZ2V0Tm9kZUtleSgpKTtcblx0fVxuXHRcblx0bG9nKClcblx0e1xuXHRcdGNvbnNvbGUubG9nKFwicGF0aCBsb2c6XCIrQ29tbW9udG9TdHJpbmcodGhpcykpO1xuXHR9XG59XG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBQZXJzb25Db25uZWN0b3I7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6UGVyc29uQ29ubmVjdG9yXCIpO1xuLy88L2pzMm5vZGU+XG4iLCJ2YXIgQ2FudmFzSG9sZGVyID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXInKTtcbnZhciBDYW52YXNIb2xkZXJWaXJ0dWFsID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXJ2aXJ0dWFsJyk7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKCcuLi9ub2Rlcy9wb3NpdGlvbi9wb3NpdGlvbicpO1xudmFyIFBlZGlncmVlQ2FudmFzID0gcmVxdWlyZSgnLi4vcGVkaWdyZWUvcGVkaWdyZWVjYW52YXMnKTtcbnZhciBQZWRpZ3JlZUNsaWVudCA9IHJlcXVpcmUoJy4uL3BlZGlncmVlL3BlZGlncmVlY2xpZW50Jyk7XG52YXIgR2VuZXJpY1BlZGlncmVlRGVmID0gcmVxdWlyZSgnLi4vcGVkaWdyZWVleHAvZ2VuZXJpY3BlZGlncmVlZGVmJyk7XG4vL3ZhciBXb3JsZFVwZGF0ZSA9IEdlbmVyaWNQZWRpZ3JlZURlZnJlcXVpcmUoJy4uLy4uL3BhdGhzL3dvcmxkdXBkYXRlJyk7XG4vLy8vLy8vLy8vLy8vLy8vdmFyIEdlbmVyaWNQZWRpZ3JlZURlZiA9IHJlcXVpcmUoJy4uL3BlZGlncmVlL2dlbmVyaWNwZWRpZ3JlZWRlZicpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9jb21tb24nKTtcbnZhciBDYW52YXNIb2xkZXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlY2FudmFzL2NhbnZhc2hvbGRlcicpO1xuXG5jbGFzcyBHZW5lcmljUGVkaWdyZWVDbGllbnQgZXh0ZW5kcyBQZWRpZ3JlZUNsaWVudFxue1xuXHRjb25zdHJ1Y3RvcihjYW52YXNIb2xkZXIpXG5cdHtcblx0XHRzdXBlcihjYW52YXNIb2xkZXIpO1xuXHR9XG5cdFxuXHRzdGF0aWMgZ2V0RXhwb3J0cygpXG5cdHtcdHZhciB0b0V4cG9ydCA9IHN1cGVyLmdldEV4cG9ydHMoKTtcblx0XHR0b0V4cG9ydC5HZW5lcmljUGVkaWdyZWVEZWYgPSBHZW5lcmljUGVkaWdyZWVEZWY7XG5cdFx0cmV0dXJuKHRvRXhwb3J0KTtcblx0fVxufVxuXG4vLzxqczJub2RlPlxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmljUGVkaWdyZWVDbGllbnQ7XG5jb25zb2xlLmxvZyhcIkxvYWRpbmc6R2VuZXJpY1BlZGlncmVlQ2xpZW50XCIpO1xuLy88L2pzMm5vZGU+IiwidmFyIFBhdGhXb3JsZERlZiA9IHJlcXVpcmUoJy4uL3BlZGlncmVlL3BlZGlncmVlZGVmJyk7XG52YXIgQ2FudmFzSG9sZGVyID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWNhbnZhcy9jYW52YXNob2xkZXInKTtcbnZhciBQZWRpZ3JlZURlZiA9IHJlcXVpcmUoJy4uL3BlZGlncmVlL3BlZGlncmVlZGVmJyk7XG4vL3ZhciBXb3JsZFVwZGF0ZSA9IHJlcXVpcmUoJy4uL3BlZGlncmVlL3dvcmxkdXBkYXRlJyk7XG52YXIgUGVyc29uID0gcmVxdWlyZSgnLi4vcGVkaWdyZWUvcGVyc29uJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2NvbW1vbicpO1xudmFyIENpcmNsZURpc3BsYXkgPSByZXF1aXJlKCcuLi9ub2Rlcy9ub2RlZGlzcGxheS9jaXJjbGVkaXNwbGF5Jyk7XG52YXIgQ29ubmVjdG9yRGlzcGxheUVtcHR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvY29ubmVjdG9yZGlzcGxheS9jb25uZWN0b3JkaXNwbGF5ZW1wdHknKTtcbnZhciBHcm91cENvbm5lY3RvciA9IHJlcXVpcmUoJy4uL25vZGVzL2Nvbm5lY3Rvci9ncm91cGNvbm5lY3RvcicpO1xudmFyIFdhbGxDb25uZWN0b3IgPSByZXF1aXJlKCcuLi9ub2Rlcy9jb25uZWN0b3Ivd2FsbGNvbm5lY3RvcicpO1xudmFyIEp1bmN0aW9uQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vcGF0aHMvbm9kZWRpc3BsYXkvanVuY3Rpb25jb25uZWN0b3InKTtcbnZhciBKdW5jdGlvbkRpc3BsYXkgPSByZXF1aXJlKCcuLi9wYXRocy9ub2RlZGlzcGxheS9qdW5jdGlvbmRpc3BsYXknKTtcbnZhciBSZWN0YW5nbGVEaXNwbGF5ID0gcmVxdWlyZSgnLi4vbm9kZXMvbm9kZWRpc3BsYXkvcmVjdGFuZ2xlZGlzcGxheScpO1xudmFyIFRyaWFuZ2xlRGlzcGxheSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVkaXNwbGF5L3RyaWFuZ2xlZGlzcGxheScpO1xudmFyIEFyY0Rpc3BsYXlTaGFwZSA9IHJlcXVpcmUoJy4uL25vZGVzL25vZGVkaXNwbGF5L2FyY2Rpc3BsYXlzaGFwZScpO1xudmFyIFBlcnNvbkNvbm5lY3RvciA9IHJlcXVpcmUoJy4uL3BlZGlncmVlL3BlcnNvbmNvbm5lY3RvcicpO1xuXG4vL3ZhciBJbml0SW5hR3JhcGggPSByZXF1aXJlKCcuLi9wYXRoc2V4cC9pbmFncmFwaC9pbml0aW5hZ3JhcGgnKTtcblxuXG5cblxuY2xhc3MgR2VuZXJpY1BlZGlncmVlRGVmIGV4dGVuZHMgUGVkaWdyZWVEZWZcbntcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cdFxuXHRpbml0KClcblx0e1xuXHRcdHRoaXMud29ybGREZWZhdWx0cyA9XG5cdFx0e1xuXHRcdFx0XHRqdW5jdGlvblJhZGl1c0RlZmF1bHQ6MTUsXG5cdFx0XHRcdHdhbGtlclJhZGl1c0RlZmF1bHQ6MTUqMC4zLFxuXHRcdFx0XHRyZWxheGVkRGlzdGFuY2VEZWZhdWx0OjguNSoxMCxcblx0XHRcdFx0ZWxhc3RpY2l0eUZhY3RvckRlZnVhbHQ6MC4wMjUsXG5cdFx0XHRcdHBvcnQ6MzAwMCxcblx0XHR9O1xuXHRcdFxuXHRcdHRoaXMucGVkaWdyZWUgPVxuXHRcdHtcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOlwiZTBlMGYwZmZcIixcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy53b3JsZERpc3BsYXkgPVxuXHRcdHtcdFxuXHRcdFx0anVuY3Rpb25SYWRpdXNEZWZhdWx0OnRoaXMud29ybGREZWZhdWx0cy5qdW5jdGlvblJhZGl1c0RlZmF1bHQsXG5cdFx0XHR3YWxrZXJSYWRpdXNEZWZhdWx0OnRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LFxuXHRcdFx0cmVsYXhlZERpc3RhbmNlRGVmYXVsdDp0aGlzLndvcmxkRGVmYXVsdHMucmVsYXhlZERpc3RhbmNlRGVmYXVsdCxcblx0XHRcdGVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0OnRoaXMud29ybGREZWZhdWx0cy5lbGFzdGljaXR5RmFjdG9yRGVmdWFsdCxcblx0XHRcdFxuXHRcdCAgICB3b3JsZEJhY2tncm91bmRDb2xvcjpcImUwZTBmMGZmXCIsXG5cdFx0XG5cdFx0XHRjb25uZWN0b3JEZWZzOlxuXHRcdFx0e1xuXHRcdFx0XHRnZW5lcmljOlxuXHRcdFx0XHRcdGZ1bmN0aW9uKHdvcmxkRGVmLG5hbWUpIFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybihcblx0XHRcdFx0XHRcdFx0XHRuZXcgR3JvdXBDb25uZWN0b3IoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5ldyBDb25uZWN0b3JEaXNwbGF5RW1wdHkoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0d29ybGREZWYud29ybGREZWZhdWx0cy5yZWxheGVkRGlzdGFuY2VEZWZhdWx0KjIuNSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0d29ybGREZWYud29ybGREZWZhdWx0cy5lbGFzdGljaXR5RmFjdG9yRGVmdWFsdCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmFtZSlcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdGp1bmN0aW9uU3BhY2VyOlxuXHRcdFx0XHRcdGZ1bmN0aW9uKHdvcmxkRGVmLG5hbWUpIFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybihcblx0XHRcdFx0XHRcdFx0XHRuZXcgR3JvdXBDb25uZWN0b3IoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5ldyBDb25uZWN0b3JEaXNwbGF5RW1wdHkoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0d29ybGREZWYud29ybGREZWZhdWx0cy5yZWxheGVkRGlzdGFuY2VEZWZhdWx0KjIuNSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0d29ybGREZWYud29ybGREZWZhdWx0cy5lbGFzdGljaXR5RmFjdG9yRGVmdWFsdCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmFtZSlcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdHdvcmxkV2FsbDpcblx0XHRcdFx0XHRmdW5jdGlvbih3b3JsZERlZixuYW1lKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybihcblx0XHRcdFx0XHRcdFx0XHRuZXcgV2FsbENvbm5lY3Rvcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IENvbm5lY3RvckRpc3BsYXlFbXB0eSgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR3b3JsZERlZi53b3JsZERlZmF1bHRzLnJlbGF4ZWREaXN0YW5jZURlZmF1bHQqMC43NSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0MS13b3JsZERlZi53b3JsZERlZmF1bHRzLmVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lKVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0cGF0aDpcblx0XHRcdFx0XHRmdW5jdGlvbih3b3JsZERlZixuYW1lKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybihcblx0XHRcdFx0XHRcdFx0bmV3IFBhdGgobmV3IEp1bmN0aW9uQ29ubmVjdG9yKFxuXHRcdFx0XHRcdFx0XHRcdFx0e2xpbmVDb2xvcjpcIjAwMDBhMGZmXCIsbGluZVdpZHRoOjV9KSxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0d29ybGREZWYud29ybGREZWZhdWx0cy5yZWxheGVkRGlzdGFuY2VEZWZhdWx0KjEuMjUsXG5cdFx0XHRcdFx0XHRcdFx0MS13b3JsZERlZi53b3JsZERlZmF1bHRzLmVsYXN0aWNpdHlGYWN0b3JEZWZ1YWx0LFxuXHRcdFx0XHRcdFx0XHRcdG5hbWUpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fSxcblx0XHRcdFxuXHRcdCAgICBjb25uZWN0b3JEaXNwbGF5OlxuXHRcdFx0e1xuXHRcdCAgICBcdC8qXG5cdFx0XHRcblx0XHRcdFx0Z2VuZXJpYzpcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbm5lY3RvckRpc3BsYXk6IG5ldyBQZXJzb25Db25uZWN0b3IoXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGluZUNvbG9yOlwiMDAwMGEwZmZcIixsaW5lV2lkdGg6NVxuXHRcdFx0XHRcdH0pLFx0XHRcdFx0XHRcblx0XHRcdFx0fSxcblx0XHRcdFx0Ki9cblx0XHRcdH0sXG5cdFx0XHRub2RlRGlzcGxheTpcblx0XHRcdHtcblx0XHRcdFx0Z2VuZXJpYzpcblx0XHRcdFx0e1xuXHRcdFxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBUcmlhbmdsZURpc3BsYXkoXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRmaWxsQ29sb3I6XCJmZmZmZmZmZlwiLGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCIyMGZmMjBmZlwiLHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxuXHRcdFx0XHRcdFx0XHRcdHJhZGl1czp0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1LFxuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcblx0XHRcdFx0XHRcdFx0XHRjbG9uZTpmYWxzZVxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOnRoaXMuanVuY3Rpb25FeGl0cyxcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZW5lcmljSnVuY3Rpb246XG5cdFx0XHRcdHtcdFx0XHRcblx0XHRcdFx0XHQvL2luaXRHcmFwaERhdGE6SW5hR3JhcGhQYXRoV29ybGREZWYuaW5pdEp1bmN0aW9uRGlzcGxheSxcblx0XHRcdFx0XHRpbml0R3JhcGhEYXRhOnRoaXMuaW5pdEp1bmN0aW9uRGlzcGxheSxcblx0XHRcdFx0XHRub2RlRGlzcGxheTp7ZGlzcGxheUluZm86e2Nsb25lOmZhbHNlfX1cblx0XHRcdFx0fSxcblx0XHRcdFx0bm9kZUdlbmVyaWM6XG5cdFx0XHRcdHtcblx0XHRcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgVHJpYW5nbGVEaXNwbGF5KFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiZmZmZmZmZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcblx0XHRcdFx0XHRcdFx0XHRyYWRpdXM6dGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSxcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0Y2xvbmU6ZmFsc2Vcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0d2Fsa2VySnVuY3Rpb25SdWxlczp0aGlzLmp1bmN0aW9uRXhpdHMsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGp1bmN0aW9uUGllU2xpY2U6XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRub2RlRGlzcGxheUZ1bmN0aW9uOmZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuKG5ldyBBcmNEaXNwbGF5U2hhcGUoXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiMDAwMDAwMDBcIixcblx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjAwZmYwMDdmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcblx0XHRcdFx0XHRcdFx0XHRcdHJhZGl1czoyNSxcblx0XHRcdFx0XHRcdFx0XHRcdGN1cnZlUG9pbnRzOjE2LFxuXHRcdFx0XHRcdFx0XHRcdFx0c3RhcnRBbmdsZTowLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZW5kQW5nbGU6MzIwLFxuXHRcdFx0XHRcdFx0XHRcdFx0d2lkdGg6MjUsXG5cdFx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6MjUsXG5cdFx0XHRcdFx0XHRcdFx0XHR0czpuZXcgRGF0ZSgpLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdFx0XHRcdGNsb25lOnRydWVcblx0XHRcdFx0XHRcdFx0XHR9KSlcblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBBcmNEaXNwbGF5U2hhcGUoXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiMDAwMDAwMDBcIixcblx0XHRcdFx0XHRcdGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjAwZmYwMDdmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxuXHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcblx0XHRcdFx0XHRcdHJhZGl1czoyNSxcblx0XHRcdFx0XHRcdGN1cnZlUG9pbnRzOjE2LFxuXHRcdFx0XHRcdFx0c3RhcnRBbmdsZTowLFxuXHRcdFx0XHRcdFx0ZW5kQW5nbGU6MzIwLFxuXHRcdFx0XHRcdFx0d2lkdGg6MjUsXG5cdFx0XHRcdFx0XHRoZWlnaHQ6MjUsXG5cdFx0XHRcdFx0XHRjbG9uZTp0cnVlXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHR1bW9yRmFpbFJRU3VjY2Vzczpcblx0XHRcdFx0e1xuXHRcdFxuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBUcmlhbmdsZURpc3BsYXkoXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRmaWxsQ29sb3I6XCJGRkE1MDBmZlwiLGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCIyMGZmMjBmZlwiLHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxuXHRcdFx0XHRcdFx0XHRcdC8vcmFkaXVzOndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSxcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0Y2xvbmU6ZmFsc2Vcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0d2Fsa2VySnVuY3Rpb25SdWxlczp0aGlzLmp1bmN0aW9uRXhpdHMsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG5vcm1hbDpcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5vZGVEaXNwbGF5Om5ldyBSZWN0YW5nbGVEaXNwbGF5KFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsbENvbG9yOlwiZmYyMDIwZmZcIixib3JkZXJDb2xvcjpcIjAwMDAwMGZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0RmlsbENvbG9yOlwiMjBmZjIwZmZcIixzZWxlY3RCb3JkZXJDb2xvcjpcIjAwMDBmZmZmXCIsXG5cdFx0XHRcdFx0XHRcdFx0Ym9yZGVyV2lkdGg6MSxcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0LzEuMjUpKjIsXG5cdFx0XHRcdFx0XHRcdFx0Y2xvbmU6ZmFsc2VcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOnRoaXMuanVuY3Rpb25FeGl0cyxcblx0XHRcdFx0fSxcblx0XHRcdFx0cm5hRmFpbFJRU3VjZXNzOlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bm9kZURpc3BsYXk6bmV3IENpcmNsZURpc3BsYXkoXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRmaWxsQ29sb3I6XCIwMEE1RkZmZlwiLGJvcmRlckNvbG9yOlwiMDAwMDAwZmZcIixcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3RGaWxsQ29sb3I6XCIyMGZmMjBmZlwiLHNlbGVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJXaWR0aDoxLFxuXHRcdFx0XHRcdFx0XHRcdHJhZGl1czp0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1LFxuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdC8xLjI1KSoyLFxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDoodGhpcy53b3JsZERlZmF1bHRzLndhbGtlclJhZGl1c0RlZmF1bHQvMS4yNSkqMixcblx0XHRcdFx0XHRcdFx0XHRjbG9uZTpmYWxzZVxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHR3YWxrZXJKdW5jdGlvblJ1bGVzOnRoaXMuanVuY3Rpb25FeGl0cyxcdFx0XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRlc3Rpbmc6XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRub2RlRGlzcGxheTpuZXcgQ2lyY2xlRGlzcGxheShcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGZpbGxDb2xvcjpcIkE1RkYwMGZmXCIsYm9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcIjIwZmYyMGZmXCIsc2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxuXHRcdFx0XHRcdFx0XHRcdGJvcmRlcldpZHRoOjEsXG5cdFx0XHRcdFx0XHRcdFx0cmFkaXVzOnRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0KjMsXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6KHRoaXMud29ybGREZWZhdWx0cy53YWxrZXJSYWRpdXNEZWZhdWx0KjMpKjIsXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0Oih0aGlzLndvcmxkRGVmYXVsdHMud2Fsa2VyUmFkaXVzRGVmYXVsdCozKSoyLFxuXHRcdFx0XHRcdFx0XHRcdGNsb25lOmZhbHNlXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHdhbGtlckp1bmN0aW9uUnVsZXM6dGhpcy5qdW5jdGlvbkV4aXRzLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHR9O1xuXHRcdFxuXHR9XG5cdFx0XG5cdGdldFdvcmxkRGlzcGFseSgpXG5cdHtcblx0XHRyZXR1cm4odGhpcy53b3JsZERpc3BsYXkpO1xuXHR9XG5cdFxuXHRnZXRXb3JsZERlZmF1bHRzKClcblx0e1xuXG5cdFx0cmV0dXJuKHRoaXMud29ybGREZWZhdWx0cyk7XG5cdH1cblx0XG5cdC8vc3RhdGljIGluaXRKdW5jdGlvbkRpc3BsYXkobm9kZSlcblx0aW5pdEp1bmN0aW9uRGlzcGxheShub2RlKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXCJpbnNpZGUgaW5pdEp1bmN0aW9uRGlzcGxheSBmb3IgbmFtZT1cIitub2RlLm5hbWUpO1xuXHRcdG5vZGUuZ3JhcGhEYXRhLm5vZGVEaXNwbGF5ID0gbmV3IEp1bmN0aW9uRGlzcGxheShcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGZpbGxDb2xvcjpcImEwYTBmZmZmXCIsXG5cdFx0XHRcdFx0Ym9yZGVyQ29sb3I6XCIwMDAwMDBmZlwiLFxuXHRcdFx0XHRcdHNlbGVjdEZpbGxDb2xvcjpcImZmZmYwMGZmXCIsXG5cdFx0XHRcdFx0c2VsZWN0Qm9yZGVyQ29sb3I6XCIwMDAwZmZmZlwiLFxuXHRcdFx0XHRcdGJvcmRlcldpZHRoOjIsXG5cdFx0XHRcdFx0Zm9udFN0eWxlOlwiYm9sZFwiLFxuXHRcdFx0XHRcdGZvbnRQaXhlbEhlaWdodDoxNSxcblx0XHRcdFx0XHRmb250RmFjZTpcIkFyaWFsXCIsXG5cdFx0XHRcdFx0cmVjdEJvcmRlckNvbG9yOlwiMDAwMGZmZmZcIixcblx0XHRcdFx0XHRyZWN0RmlsbENvbG9yOlwiZmZmZmZmZmZcIixcblx0XHRcdFx0XHRmb250Q29sb3I6XCIwMDAwZmZmZlwiLFxuXHRcdFx0XHRcdGNsb25lOmZhbHNlXG5cdFx0XHRcdH0pO1xuXHRcdC8vbm9kZS5ncmFwaERhdGEubm9kZURpc3BsYXkuY2xvbmU9ZmFsc2U7XG5cdFx0bm9kZS5ncmFwaERhdGEudGV4dFNwYWNlciA9IDU7XG5cdFx0Ly9ub2RlLmdyYXBoRGF0YS5yYWRpdXMgPSB0aGlzLndvcmxkRGVmYXVsdHMuanVuY3Rpb25SYWRpdXNEZWZhdWx0KjM7XG5cdFx0bm9kZS5ncmFwaERhdGEucmFkaXVzID0gMTU7XG5cdFx0bm9kZS5ncmFwaERhdGEud2lkdGggPSBub2RlLmdyYXBoRGF0YS5yYWRpdXMqMjtcblx0XHRub2RlLmdyYXBoRGF0YS5oZWlnaHQgPSBub2RlLmdyYXBoRGF0YS5yYWRpdXMqMjtcblx0XHRpZihub2RlLmdyYXBoRGF0YS5ub2Rlcz09bnVsbCkgbm9kZS5ncmFwaERhdGEubm9kZXMgPSBuZXcgQXJyYXkoKTtcblx0fVx0XG59XG5cbi8vPGpzMm5vZGU+XG5tb2R1bGUuZXhwb3J0cyA9IEdlbmVyaWNQZWRpZ3JlZURlZjtcbmNvbnNvbGUubG9nKFwiTG9hZGluZzpHZW5lcmljUGVkaWdyZWVEZWZcIik7XG4vLzwvanMybm9kZT4iXX0=
