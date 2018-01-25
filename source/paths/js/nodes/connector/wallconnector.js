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
