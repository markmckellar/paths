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
