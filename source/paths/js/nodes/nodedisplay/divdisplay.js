var Position = require('../../nodes/position/position');
var NodeDisplay = require('../../nodes/nodedisplay/nodedisplay');
var Common = require('../../common/common');

class DivDisplay extends NodeDisplay
{
	constructor(displayInfo)
	{
		super(displayInfo);
	}
	
	containsPosition(position,node)
	{
		return(
				(
						(node.position.getX()-node.width/2)<=position.getX() &&
						(node.position.getX()+node.width/2)>=position.getX() &&
						(node.position.getY()-node.height/2)<=position.getY() &&
						(node.position.getY()+node.height/2)>=position.getY()
				)
			);
	}
	
	
	drawNode(canvasHolder,node)
	{
		super.drawNode(canvasHolder,node);

		var htmlObject = document.getElementById(node.graphData.docId);
		if(htmlObject!=null)
		{
			htmlObject.style.left = node.position.getX()-htmlObject.style.width/2 + 'px';
			htmlObject.style.top  = node.position.getY()-htmlObject.style.height/2 + 'px';
		}
	}
}
//<js2node>
module.exports = DivDisplay;
console.log("Loading:DivDisplay");
//</js2node>
