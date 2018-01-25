var ConnectorDisplay = require('../../nodes/connectordisplay/connectordisplay');

class ConnectorDisplayEmpty extends ConnectorDisplay
{
	constructor(displayInfo) 
	{
		super(displayInfo);
	}

	drawConnector(canvasHolder,connector,node)
	{
	}
}
//<js2node>
module.exports = ConnectorDisplayEmpty;
console.log("Loading:ConnectorDisplayEmpty");
//</js2node>
