var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class PullTogether extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(PullTogether.processPullTogetherConnectorOneNodeToConnectedNodes,connectorDisplay,name);

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}
	
	static processPullTogetherConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node && distance>connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
	}


}

//<js2node>
module.exports = PullTogether;
console.log("Loading:PullTogether");
//</js2node>
