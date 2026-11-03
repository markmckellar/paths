var Node = require('../nodes/node');
var Position = require('../nodes/position/position');
var Common = require('../common/common');

class Person extends Node
{
	constructor(personPedigreeId,name,position,canvasHolder,shapeList,graphDataKey,infoData)
	{
		super(name,position,canvasHolder,graphDataKey,infoData);
		this.layer=2;
		this.personPedigreeId = personPedigreeId;
	}
	
	static createPersonFromJson(json,canvasHolder)
	{

		var person = new Person(
				json.personPedigreeId,
				json.name,
				new Position(100,100),
				canvasHolder,
				new Array(),
				json.graphDataKey,
				json.infoData
				);
		return(person);
	}
	
	getPersonKey()
	{
		return(this.personPedigreeId);
	}
	
	getClientJson()
	{
		var json = super.getClientJson();
		json.pathWorldTye = "walker";
		json.currentJunction = this.getCurrentJunction().getNodeKey();
		return(json);
	}

	
	getNodeUiDisplay(node)
	{
		var value = this.name;
	
		value += "<li>name:"+this.name+"</li>";
		return(value);
	}
	
	
}
//<js2node>
module.exports = Person;
console.log("Loading:Person");
//</js2node>
