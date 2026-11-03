var Position = require('../nodes/position/position');
var CanvasHolder= require('../nodes/node');
var Common = require('../common/common');

class NodeWorld
{
	constructor(name,worldDef)
	{
		NodeWorld.initNodeWorld(this,name,worldDef);
	}
	
	static initNodeWorld(nodeWorld,name,worldDef)
	{
		nodeWorld.name = name;
		nodeWorld.worldDef = worldDef;
		nodeWorld.nodeList = new Array();
		nodeWorld.nodeMap = new Object();
		nodeWorld.conectorList = new Array();
		nodeWorld.conectorMap = new Object();
	}
	
	  /*
   * The client needs to know : 
   * o node id (name)
   * o position
   * o infoData (grap specific data about this node)    
   * o drawNode functon id
   * o list of connectors      
   *   - connector id
   *   
   *   - 
   */
  getClientJson()
  {
	  //console.log("getting json for:"+this.name);
	  var json = {};
	  json.name = this.name;
	  json.worldDef = this.worldDef;
	  json.nodes = new Array();
	  for(var i=0;i<this.nodeList.length;i++)
	  {
		  json.nodes.push(this.nodeList[i].getClientJson());
	  }
	  json.connectors = new Array();
	  for(var i=0;i<this.connectorList.length;i++)
	  {
		  json.connectors.push(this.connectorList[i].getClientJson());
	  }

	  JSON.stringify(json);
	  return(json)
  }
	
	addNode(node)
	{
		if(!doesNodeExist(node))
		{
			this.nodeMap[node.name] = node;
			this.nodeList.push(node);
		}
	}
	
	removeNode(node)
	{
		Common.removeItemFromArray(this.nodeList,node);
		this.nodeMap.remove(node.name)
	}
	
	getNode(node)
	{
			return(!this.nodeMap.hasOwnProperty(node.name));
	}
	
	doesNodeExist(node)
	{
			return(!this.nodeMap.hasOwnProperty(node.name));
	}
	
	addConnector(connector)
	{
		if(!doesConnectorExist(connector))
		{
			this.connectorMap[connector.name] = connector;
			this.connectorist.push(connector);
		}
	}
	
	removeConnector(connector)
	{
		Common.removeItemFromArray(this.connectorist,connector);
		this.connectorMap.remove(connector.name)
	}
	
	getConnector(connector)
	{
			return(!this.connectorMap.hasOwnProperty(connector.name));
	}
	
	doesConnectorExist(connector)
	{
			return(!this.connectorMap.hasOwnProperty(connector.name));
	}
}
//<js2node>
module.exports = NodeWorld;
console.log("Loading:NodeWorld");
//</js2node>