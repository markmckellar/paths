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
