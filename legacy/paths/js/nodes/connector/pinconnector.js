var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class PinConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(PinConnector.processSpringConnectorOneBeastieToConnectedNodes,connectorDisplay,name);
		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
		this.pinPosition = new Position();
	}
	
	getPinPosition()
	{
		return(this.pinPosition);
	}

	static processSpringConnectorOneBeastieToConnectedNodes(connector,node,timestamp)
	{		
		connector.pinPosition.copyFrom( Position.getAveragePostionFromNodeList(connector.nodes) );
		if(connector.anchorOffsetPoint!=null) connector.pinPosition.addTo(this.anchorOffsetPoint);
	}
}

//<js2node>
module.exports = PinConnector;
console.log("Loading:PinConnector");
//</js2node>
