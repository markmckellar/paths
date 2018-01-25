var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class HorizontalConnector extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(HorizontalConnector.processGroupSpringConnectorOneNodeToConnectedNodes,connectorDisplay,name);

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}
	
	static processGroupSpringConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		var averageY = 0;

		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);			
			if (b != node && distance<connector.relaxedDistance)
			{
				averageY += b.position.y;
				positionList.push(b.position);		
			}
		}
		
		if(positionList.length>0)
		{
			averageY = averageY / positionList.length;
			for(var i=0;i<positionList.length;i++) positionList[i].y = averageY;
		}
		connector.calulateMovement(node,positionList,0);
	}
	
	static processGroupSpringConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		var averageY = 0;
		
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			averageY += b.position.y;
						
			if (b != node && distance>connector.relaxedDistance)
			{
				positionList.push(b.position);
			}
		}
		if(connector.nodes.length>0)
		{
			averageY = averageY / connector.nodes.length;
			for(var i=0;i<positionList.length;i++) positionList[i].y = averageY;
		}
		connector.calulateMovement(node,positionList,0);
	}

}

//<js2node>
module.exports = HorizontalConnector;
console.log("Loading:HorizontalConnector");
//</js2node>
