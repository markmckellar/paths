var Common = require('../../common/common');
var Position = require('../../nodes/position/position');

class NodeDisplay
{
	constructor(displayInfo)
	{
		NodeDisplay.createNodeDisplay(this,displayInfo);
	}
	
	static createNodeDisplay(nodeDisplay,displayInfo)
	{
		nodeDisplay.displayInfo = displayInfo;
	}
	
	drawNode(canvasHolder,node)
	{
		this.drawPosition = new Position(
				Math.round(node.position.x),
				Math.round(node.position.y)
				);
	}
	
	containsPosition(postion,node)
	{
	}
	
	fillTextMutipleLines(context,text,x,y,lineHeight,splitChar)
	{
		var lines = text.split(splitChar);
	    var line = '';
	
	    for(var n = 0; n < lines.length; n++)
	    {
	      var metrics = context.measureText(lines[n]);
	      context.fillText(lines[n], x, y);
	      y = y+lineHeight; 
	    }
	    context.fillText(line, x, y);
	 }
	
	metricsTextMutipleLines(context,text,lineHeight,splitChar)
	{
		var lines = text.split(splitChar);
	    var line = '';
	    var maxWidth = 0;
	    var totalHeight = 0;
	    for(var n = 0; n < lines.length; n++)
	    {
	      var metrics = context.measureText(lines[n]);
	      if(metrics.width>maxWidth) maxWidth = metrics.width;
	      totalHeight = totalHeight + lineHeight;
	    }
	    return({width:maxWidth,height:totalHeight});
	 }
	
	roundedRect(context,x,y,w,h,r,borderWitdh,borderColor,rectColor)
	{
		  if (w < 2 * r) r = w / 2;
		  if (h < 2 * r) r = h / 2;
		  context.beginPath();
		  context.moveTo(x+r, y);
		  context.arcTo(x+w, y,   x+w, y+h, r);
		  context.arcTo(x+w, y+h, x,   y+h, r);
		  context.arcTo(x,   y+h, x,   y,   r);
		  context.arcTo(x,   y,   x+w, y,   r);
		  context.closePath();
		/*
	    context.beginPath();
	    context.moveTo(x, y);
	    context.lineTo(x + width - cornerRadius, y);
	    context.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
	    context.lineTo(x + width, y + height);
	   */ 
	    context.lineWidth = borderWitdh;
	    context.fillStyle = rectColor;
	    context.strokeStyle = borderColor;
	    
	    context.stroke();
	    context.fill();
	
	}
}
//<js2node>
module.exports = NodeDisplay;
console.log("Loading:NodeDisplay");
//</js2node>
