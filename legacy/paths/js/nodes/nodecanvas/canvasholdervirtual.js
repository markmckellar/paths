var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var Common = require('../../common/common');


class CanvasHolderVirtual extends CanvasHolder
{
	constructor(canvasName,worldDef,width,height,origin)
	{
		super(canvasName,worldDef);
		this.width = width;
		this.height = height;
	}
	
	init(canvasName,worldDef)
	{
		this.canvas = null;
		this.context = null;
		this.isCanvasVisable = false;
		this.isCanvasDrawable = false;
	}

	clone(origin)
	{
		var canvasHolder = new CanvasHolderVirtual(this.canvasName,this.worldDef,this.width,this.height,origin);
		return(canvasHolder);
	}

	getWidth()
	{
		return(this.width);
	}

	getHeight()
	{
		return(this.height);
	}
}
//<js2node>
module.exports = CanvasHolderVirtual;
console.log("Loading:CanvasHolderVirtual");
//</js2node>
