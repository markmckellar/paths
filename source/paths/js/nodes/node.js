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
			
			console.log("info data passed in for  : "+this.name +" infoData="+Common.toString(infoData));
			console.log("info data passed in for  : "+this.name);
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
		    		//console.log("drawing connector:"+connector.name);
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
