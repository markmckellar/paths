var ConnectorDisplay = require('../connectordisplay/connectordisplay');

class ConnectorDisplayLineAll extends ConnectorDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}

	drawConnector(canvasHolder,connector,node)
	{
		for(var j=0;j<connector.nodes.length;j++)
		{
			var nodeJ = connector.nodes[j];		
			canvasHolder.context.lineWidth = 5;
			canvasHolder.context.strokeStyle = Common.getColorFromString("000000ff");
			canvasHolder.context.beginPath();
			canvasHolder.context.moveTo(node.position.getX(),node.position.getY());
			canvasHolder.context.lineTo(nodeJ.position.getX(),nodeJ.position.getY());
			canvasHolder.context.stroke();
		}
	}
}
//<js2node>
module.exports = ConnectorDisplayLineAll;
console.log("Loading:ConnectorDisplayLineAll");
//</js2node>
