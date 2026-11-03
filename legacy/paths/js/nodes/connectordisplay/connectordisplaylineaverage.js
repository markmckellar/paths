var ConnectorDisplay = require('../connectordisplay/connectordisplay');

class ConnectorDisplayLineAverage extends ConnectorDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}

	drawConnector(canvasHolder,connector,node)
	{
		var averagePosition = Position.getAveragePostionFromNodeList(connector.nodes)	
	    canvasHolder.context.lineWidth = this.displayInfo.lineWidth;
		canvasHolder.context.strokeStyle = Common.getColorFromString(this.displayInfo.lineColor);
	    canvasHolder.context.beginPath();
		canvasHolder.context.moveTo(averagePosition.getX(),averagePosition.getY());
		canvasHolder.context.lineTo(node.position.getX(),node.position.getY());
		canvasHolder.context.stroke();
	}
}
//<js2node>
module.exports = ConnectorDisplayLineAverage;
console.log("Loading:ConnectorDisplayLineAverage");
//</js2node>
