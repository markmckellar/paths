var Connector = require('../nodes/connector/connector');
var SpringConnector = require('../nodes/connector/springconnector');


class PersonConnector extends SpringConnector
{
	constructor(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
	{
		super(connectorDisplay,springAnchorPoint,anchorOffsetPoint,relaxedDistance,elasticityFactor,name)
		this.walkerObject = new Object();
	}
	
	getClientJson()
	{
		var json = super.getClientJson();
		json.junctionStart = this.junctionStart.getNodeKey();
		json.junctionEnd = this.junctionEnd.getNodeKey();
		return(json);
	}
	
	setJunctions(junctionStart,junctionEnd)
	{
	    this.junctionStart = junctionStart;
		this.junctionEnd = junctionEnd;
		this.addNode(junctionStart);
		this.addNode(junctionEnd);		
	}
	
	getConnectorKey()
	{
		return(this.getPathKey());
	}
	
	getPathKey()
	{
		return(this.junctionStart.getNodeKey()+"#"+this.junctionEnd.getNodeKey());
	}
	
	log()
	{
		console.log("path log:"+CommontoString(this));
	}
}
//<js2node>
module.exports = PersonConnector;
console.log("Loading:PersonConnector");
//</js2node>
