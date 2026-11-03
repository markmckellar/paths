var ConnectorDisplay = require('../../nodes/connectordisplay/connectordisplay');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');

class JunctionConnector extends ConnectorDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}
	
	drawConnector(canvasHolder,connector,node)
	{
		super.drawConnector(canvasHolder,connector,node);

		for(var j=0;j<connector.nodes.length;j++)
		{
			var nodeJ = connector.nodes[j];		
			var p = node.position.createByAdding(node.connectorPosition);
			var pj = nodeJ.position.createByAdding(nodeJ.connectorPosition);
			canvasHolder.context.lineWidth = 5;
			canvasHolder.context.strokeStyle = Common.getColorFromString("000000ff");
			canvasHolder.context.beginPath();
			canvasHolder.context.moveTo(p.getX(),p.getY());
			canvasHolder.context.lineTo(pj.getX(),pj.getY());
			canvasHolder.context.stroke();
		}
	}
}
//<js2node>
module.exports = JunctionConnector;
console.log("Loading:JunctionConnector");
//</js2node>
