var Position = require('../../nodes/position/position');
var Connector = require('../../nodes/connector/connector');
var Common = require('../../common/common');

class ShapeConnector extends Connector
{
	constructor(node,connectorDisplay,shape,anchorOffsetPoint,relaxedDistance,elasticityFactor,outsideRelaxedDistance,outsideElasticityFactor,name)
	{
		super(ShapeConnector.processShapeConnectorOneNodeToConnectedNodes,connectorDisplay,name);

		this.node = node;
		this.springAnchorPoint = node.position;
		this.anchorOffsetPoint = anchorOffsetPoint;
		this.relaxedDistance = relaxedDistance;
		this.elasticityFactor = elasticityFactor;
		this.outsideRelaxedDistance = outsideRelaxedDistance;
		this.outsideElasticityFactor = outsideElasticityFactor;
		this.shape = shape;
	}
	
	static processShapeConnectorOneNodeToConnectedNodes(connector,node,timestamp)
	{
	//	var positionList = connector.initProcessor();
		var positionList = new Array();
	
		
		if(!this.shape.containsPosition(node.position,this.node))
		{
			/************
			var onShapeLinePosition = this.shape.findClosestPointInShapeFromStartingPoint(node.position,this.node);
			positionList.push(onShapeLinePosition);
			connector.calulateMovementExp(node,positionList,0.0,this.outsideRelaxedDistance,this.outsideElasticityFactor);
			****************/
			var averagePointTransformed = this.shape.getAveragePointTransformed(this.node)
			//positionList.push(this.node.position);
			positionList.push(averagePointTransformed);
			
			var outsideRelaxDistance = this.outsideRelaxedDistance;
			var outsideElasticityFactor = this.outsideElasticityFactor;
			outsideElasticityFactor = 0.025;
			if(distance>outsideRelaxDistance*1.25) 
			{
				console.log("its outside!!:node="+node.name+" distance="+distance);
				outsideElasticityFactor = 0.01;
			}
				 
			connector.calulateMovementExp(
				node,
				positionList,
				0.0,
				outsideRelaxDistance,
				outsideElasticityFactor);
	
			//connector.calulateMovementExp(node,positionList,0.0,0.0,0.5);
		}
		else
		{
			var shapeArea = this.shape.getShapeArea();
			var minAreaPerNode = shapeArea / connector.nodes.length;
			//var spacing = minAreaPerNode/2;//Math.sqrt(minAreaPerNode);
			var spacing = Math.sqrt(minAreaPerNode)*1.01;//*2.3;
			if(spacing==0) spacing = 1;
			//var spacing = Math.sqrt(minAreaPerNode)*1.3;
			/*
			if(node.isSelected)
			{
				console.log("node name:"+node.name);
				console.log("	shapeArea:"+shapeArea);
				console.log("	minAreaPerNode:"+minAreaPerNode);
				console.log("	spacing:"+spacing);
			}
			*/
	
			this.relaxedDistance = spacing;
			for(var i=0;i<connector.nodes.length;i++)
			{
				var b = connector.nodes[i];
				
				/*
				if(node.isSelected)
				{
					var d = node.position.getDistance(b.position);
	
					console.log("	checking:"+b.name+" distance="+d);
				}
				*/
				if(b != node && this.shape.containsPosition(b.position,this.node))
				{
					var distance = node.position.getDistance(b.position);
					if (distance<spacing)
					{
						positionList.push(b.position);
					}
				}
			}
			//if(node.isSelected) console.log("---------------------------------------------------");
	
			connector.calulateMovementExp(node,positionList,0.0,this.relaxedDistance,this.elasticityFactor);
			// move it to a new spacing distance (still in the shape)
		}
		
		//connector.calulateMovement(node,positionList,0);
	
		//if(shape.containsPosition())
		// if it is not inside the shape move into the shape fast as possible
		//        ..you can cycle through the sides and find the closet intersection point.
		//        ..this can probably be optimized by looking at each point first
		// if it is inside the shape then :
		//        ..find he average distance between the points (only check those so close?!?!?_
		//        if its distance is great than the average then move away for the CON of the sampling
		//        if the distance is less than the average hen move towards the COM of the sampling
		//      ..the average space be able to to be calculated 
		//
		//      function to find the average distance between a list of points
		///     if you look at the area you should be able to dive it by the size o the sampling
		//      to get this average....
		//		if we limited it to a pe slice it is easy... a slice of the pie's area is easy to calculate
		//
		//		for a closed list of polygons it is a sum of triangles... should circles
		// 		be a special case?
		/*
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			if (b != node && distance<connector.relaxedDistance)
			{
				positionList.push(b.position);		
			}
	
			
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
		*/
	}

	processWallSpringRepulseOneNode(connector,node,timestamp)
	{
		var positionList = connector.initProcessor();
		for(var i=0;i<connector.nodes.length;i++)
		{
			var b = connector.nodes[i];
			var distance = node.position.getDistance(b.position);
			if (b != node && distance<connector.relaxedDistance) positionList.push(b.position);		
		}
		connector.calulateMovement(node,positionList,0);
	}
}

//<js2node>
module.exports = ShapeConnector;
console.log("Loading:ShapeConnector");
//</js2node>
