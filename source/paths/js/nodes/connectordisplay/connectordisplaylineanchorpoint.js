var ConnectorDisplay = require('../connectordisplay/connectordisplay');

class ConnectorDisplayLineAchorPoint extends ConnectorDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}

	drawConnector(canvasHolder,connector,node)
	{
		var averagePosition = Position.getAveragePostionFromNodeList(connector.nodes)	
	    canvasHolder.context.lineWidth = 5;
		canvasHolder.context.strokeStyle = Common.getColorFromString("000000ff");
		canvasHolder.context.beginPath();
		canvasHolder.context.moveTo(averageposition.getX(),averageposition.getY());
		canvasHolder.context.lineTo(node.position.getX(),node.position.getY());
		canvasHolder.context.stroke();
	}
}
//<js2node>
module.exports = ConnectorDisplayLineAchorPoint;
console.log("Loading:ConnectorDisplayLineAchorPoint");
//</js2node>
