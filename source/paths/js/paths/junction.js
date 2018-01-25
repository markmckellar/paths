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
