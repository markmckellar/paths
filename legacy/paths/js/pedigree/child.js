var Node = require('../nodes/node');
var Common = require('../common/common');
var Position = require('../nodes/position/position');
var HorizontalConnector = require('../nodes/connector/horizontalconnector');
var PinConnector = require('../nodes/connector/pinconnector');
	
class Child  
{
	constructor(mother,father,child,canvasHolder,tripInfo)
	{
		this.mother = mother;
		this.father = father;
		this.childList = new Array();
		this.canvasHolder = canvasHolder;
				
		this.parentOffsetPin = this.canvasHolder.getConnector("parentOffsetPin","parentOffsetPin:"+this.getChildKey());
		this.spousePullTogether = this.canvasHolder.getConnector("spousePullTogether","spousePullTogether:"+this.getChildKey());		
		this.spouseMoveToRow = this.canvasHolder.getConnector("moveToRow","spouseMoveToRow:"+this.getChildKey());
		//this.spouseMoveToRow.springAnchorPoint = this.parentOffsetPin.getPinPosition();

		this.childOffsetPin = this.canvasHolder.getConnector("childOffsetPin","childOffsetPin:"+this.getChildKey());
		this.childMoveToRow = this.canvasHolder.getConnector("moveToRow","childMoveToRow:"+this.getChildKey());
		this.childMoveToRow.springAnchorPoint = this.childOffsetPin.getPinPosition();
		
		
		this.addParent(this.mother)
		this.addParent(this.father)

		this.addChild(child);
	}
	
	addParent(parent)
	{
		this.spousePullTogether.addNode(parent);		
		this.spouseMoveToRow.addNode(parent);
		this.childOffsetPin.addNode(parent);
	}
	
	addChild(child)
	{
		this.childList.push(child);
		this.childMoveToRow.addNode(child);	
		this.parentOffsetPin.addNode(child);
	}
	
	/*
	getCreatePath(junctionStart,junctionEnd,pathInfo)
	{
		var connectorDisplayObject = this.canvasHolder.getConnectorDisplay(pathInfo.pathTypeKey);
		
		var path = null;
		var pathKey = this.getPathKey(junctionStart,junctionEnd);
		if(!this.paths.hasOwnProperty(pathKey))
		{
			var p = this.canvasHolder.getConnector("path",pathKey);
			p.setJunctions(junctionStart,junctionEnd);
			this.paths[pathKey] = p;
		}
		var path = this.paths[pathKey];
		return(path);
	}
	*/
	
	static getChildKeyFromParents(mother,father)
	{
		return(
				mother.getPersonKey()+
				father.getPersonKey()
				);
	}
	
	getChildKey()
	{
		return( Child.getChildKeyFromParents(this.mother,this.father) );
	}
	
	getClientJson()
	{
		var json = super.getClientJson();
		json.pathWorldTye = "walker";
		json.currentJunction = this.getCurrentJunction().getNodeKey();
		return(json);
	}
	
}
//<js2node>
module.exports = Child;
console.log("Loading:Child");
//</js2node>
