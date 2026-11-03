var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class MoveToRow extends Connector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(MoveToRow.processMoveToRowConnectorOneNodeToConnectedNodes,connectorDisplay,name);

		this.springAnchorPoint = springAnchorPoint;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
	}
	
	static processMoveToRowConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		var averageY = 0;

		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			positionList.push(new Position(node.position.x,0));
			averageY += b.position.y;
		}
		
		if(positionList.length>0)
		{
			averageY = averageY / positionList.length;
			if(connector.springAnchorPoint!=null) averageY = connector.springAnchorPoint.getY();
			for(var i=0;i<positionList.length;i++)
			{
				positionList[i].y = averageY;
			}
		}
	
		connector.calulateMovement(node,positionList,0);
	}


}

//<js2node>
module.exports = MoveToRow;
console.log("Loading:MoveToRow");
//</js2node>
