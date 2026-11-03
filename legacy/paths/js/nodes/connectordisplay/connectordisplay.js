class ConnectorDisplay
{
	constructor(displayInfo)
	{
		ConnectorDisplay.createConnectorDisplay(this,displayInfo);
	}

	static createConnectorDisplay(connectorDisplay,displayInfo)
	{
		connectorDisplay.displayInfo = displayInfo;
	}

	drawConnector(canvasHolder,connector,node)
	{
	}

	containsPostion(position,connector)
	{
		return(false);
	}
}

//<js2node>
module.exports = ConnectorDisplay;
console.log("Loading:ConnectorDisplay");
//</js2node>
