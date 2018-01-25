class MouseStatus
{
	constructor(isDown,startPosition,position,node,nodeStartPosition)
	{
		this.isDown = isDown;
		this.startPosition = startPosition;
		this.position = position;
		this.node = node;
		this.nodeStartPosition = nodeStartPosition;
	}
}
//<js2node>
module.exports = MouseStatus;
console.log("Loading:MouseStatus");
//</js2node>
