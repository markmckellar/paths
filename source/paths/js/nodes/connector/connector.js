var Common = require('../../common/common');
var Position = require('../../nodes/position/position');


class Connector
{
	constructor(connectorFunction,connectorDisplay,name)
	{
		this.nodes = new Array();
		this.connectorFunction = connectorFunction;	
		this.connectorDisplay = connectorDisplay;	
		this.name = name;
		this.connectorKey = name+"#"+Common.getTimeKey();
		if(!name) console.trace("Connector passed in empty name");
	}
	
	getConnectorKey()
	{
		return(this.connectorKey);
	}

	getClientJson()
	{
		var json = {};
		json.connectorKey = this.getConnectorKey();
		json.connectorDisplay = this.connectorDisplay;
		json.connectorDefKey = this.connectorDefKey;
		json.nodes = new Array();
		for(var i=0;i<this.nodes.list;i++)
		{
			json.nodes.push(this.nodes[i].getNodeKey());
		}
		return(json);
	}
	
	executeConnectorFunction(timestamp,node)
	{
		this.connectorFunction(this,node,timestamp)
	}

	containsPostion(position)
	{
		console.log("Node:containsPostion:"+this.name+":default, will always fail");
		return(false);
	}

	addNodeList(nodeList)
	{
		for(var i=0;i<nodeList.length;i++)
		{
			this.addNode(nodeList[i]);
		}
	}

	addNode(node)
	{
		this.nodes.push(node);
		node.connectors.push(this);
	}

	removeNode(node)
	{
		// console.log("Connector removeNode before:"+
		// "node="+node.name+
		// ":this.nodes="+this.nodes.length+
		// ":node.connectors="+node.connectors.length+
		// "");
		Common.removeItemFromArray(this.nodes,node);
		Common.removeItemFromArray(node.connectors,this);
		
		// console.log("Connector removeNode after :"+
		// "node="+node.name+
		// ":this.nodes="+this.nodes.length+
		// ":node.connectors="+node.connectors.length+
		// "");
	}

	initProcessor()
	{
		var positionList = new Array();
		if (this.springAnchorPoint != null)
		{
			if (this.anchorOffsetPoint == null)
			{
				positionList.push(this.springAnchorPoint);
			}
			else
			{
				positionList.push(this.springAnchorPoint.createByAdding(this.anchorOffsetPoint));
			}
		}
		return(positionList);
	}

	calulateMovementExp(node,positionList,randomStrengthFactor,relaxedDistance,elasticityFactor)
	{
		if (positionList.length>0)
		{
			// look at each position and make a new list of positions the
			// "relaxed" distance away
			var animateList = new Array();
			var x = 0.0;
			var y = 0.0;
			for(var i=0;i<positionList.length;i++)
			{
				var position = node.position.getDistanceOnLinePointArrayClosest(
						positionList[i],
						relaxedDistance+(randomStrengthFactor/2-randomStrengthFactor*Math.random())
						);
				x += position.getX()+(randomStrengthFactor/2-randomStrengthFactor*Math.random());
				y += position.getY()+(randomStrengthFactor/2-randomStrengthFactor*Math.random());		
				animateList.push(position);
			}

			// find the average "relaxed" position
			var averagePosition = new Position(x / positionList.length,y / positionList.length);
			var distanceToAveragePosition = node.position.getDistance(averagePosition);

			// take the average position and move towards it based upon the
			// elasticity factor
			var movePosition = averagePosition.getDistanceOnLinePointArrayClosest(
					node.position,
					distanceToAveragePosition * elasticityFactor
					);

			// add this position to the list of points this node needs to move
			// to
			node.positionMoveList.push(movePosition);
		}
	}

	calulateMovement(node,positionList,randomStrengthFactor)
	{
		if (positionList.length>0)
		{
			// look at each position and make a new list of positions the
			// "relaxed" distance away
			var animateList = new Array();
			var x = 0.0;
			var y = 0.0;
			for(var i=0;i<positionList.length;i++)
			{
				var position = node.position.getDistanceOnLinePointArrayClosest(
						positionList[i],
						this.relaxedDistance+randomStrengthFactor*Math.random()
						);
				x += position.getX();
				y += position.getY();		
				animateList.push(position);
			}

			// find the average "relaxed" position
			var averagePosition = new Position(x / positionList.length,y / positionList.length);
			var distanceToAveragePosition = node.position.getDistance(averagePosition);

			// take the average position and move towards it based upon the
			// elasticity factor
			var movePosition = averagePosition.getDistanceOnLinePointArrayClosest(
					node.position,
					distanceToAveragePosition * this.elasticityFactor
					);

			// add this position to the list of points this node needs to move
			// to
			node.positionMoveList.push(movePosition);
		}
	}
}

// <js2node>
module.exports = Connector;
console.log("Loading:Connector");
// </js2node>
