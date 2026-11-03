var CanvasHolder = require('../nodes/nodecanvas/canvasholder');
var CanvasHolderVirtual = require('../nodes/nodecanvas/canvasholdervirtual');
var Position = require('../nodes/position/position');
var PedigreeCanvas = require('../pedigree/pedigreecanvas');
var PedigreeClient = require('../pedigree/pedigreeclient');
var GenericPedigreeDef = require('../pedigreeexp/genericpedigreedef');
//var WorldUpdate = GenericPedigreeDefrequire('../../paths/worldupdate');
////////////////var GenericPedigreeDef = require('../pedigree/genericpedigreedef');
var Common = require('../common/common');
var CanvasHolder = require('../nodes/nodecanvas/canvasholder');

class GenericPedigreeClient extends PedigreeClient
{
	constructor(canvasHolder)
	{
		super(canvasHolder);
	}
	
	static getExports()
	{	
		var toExport = super.getExports();
		toExport.GenericPedigreeDef = GenericPedigreeDef;
		return(toExport);
	}
	
	static getTestTrip1()
	{
		return(
				{
					mother: {
							personPedigreeId:2,
							name:"mother",
							graphDataKey:"female",
							infoDatax:{ nodeKey:2 }
						},
					father: {
							personPedigreeId:3,
							name:"father",
							graphDataKey:"male",
							infoDatax:{ nodeKey:3 }
						},
					child: {
							personPedigreeId:1,
							name:"child1",
							graphDataKey:"unkown",
							infoDatax:{ nodeKey:3 }
						},
					tripInfo :
						{
							childDisplayTypeKey:"child",
						}
						
				}
				);
	}
	
	static getTestTrip2()
	{
		return(
				{
					mother: {
							personPedigreeId:2,
							name:"mother",
							graphDataKey:"female",
							infoDatax:{ nodeKey:2 }
						},
					father: {
							personPedigreeId:3,
							name:"father",
							graphDataKey:"male",
							infoDatax:{ nodeKey:3 }
						},
					child: {
							personPedigreeId:4,
							name:"child2",
							graphDataKey:"unkown",
							infoDatax:{ nodeKey:4 }
						},
					tripInfo :
						{
							childDisplayTypeKey:"child",
						}
						
				}
				);
	}
	
	
	static getTestTrip3()
	{
		return(
				{
					mother: {
							personPedigreeId:2,
							name:"mother",
							graphDataKey:"female",
							infoDatax:{ nodeKey:2 }
						},
					father: {
							personPedigreeId:3,
							name:"father",
							graphDataKey:"male",
							infoDatax:{ nodeKey:3 }
						},
					child: {
							personPedigreeId:5,
							name:"child3",
							graphDataKey:"unkown",
							infoDatax:{ nodeKey:5 }
						},
					tripInfo :
						{
							childDisplayTypeKey:"child",
						}
						
				}
				);
	}
	
	static getTestTrip4()
	{
		return(
				{
					mother: {
							personPedigreeId:2,
							name:"mother",
							graphDataKey:"female",
							infoDatax:{ nodeKey:2 }
						},
					father: {
							personPedigreeId:3,
							name:"father",
							graphDataKey:"male",
							infoDatax:{ nodeKey:3 }
						},
					child: {
							personPedigreeId:6,
							name:"child4",
							graphDataKey:"unkown",
							infoDatax:{ nodeKey:6 }
						},
					tripInfo :
						{
							childDisplayTypeKey:"child",
						}
						
				}
				);
	}
	
	static getTestTrip5()
	{
		return(
				{
					mother: {
							personPedigreeId:7,
							name:"mother7",
							graphDataKey:"female",
							infoDatax:{ nodeKey:7 }
						},
					father: {
							personPedigreeId:8,
							name:"father8",
							graphDataKey:"male",
							infoDatax:{ nodeKey:8 }
						},
					child: {
							personPedigreeId:2,
							name:"mother",
							graphDataKey:"female",
							infoDatax:{ nodeKey:2 }
						},
					tripInfo :
						{
							childDisplayTypeKey:"child",
						}
						
				}
				);
	}
	
	static getTestTrip6()
	{
		return(
				{
					mother: {
							personPedigreeId:7,
							name:"mother",
							graphDataKey:"female",
							infoDatax:{ nodeKey:9 }
						},
					father: {
							personPedigreeId:8,
							name:"father",
							graphDataKey:"male",
							infoDatax:{ nodeKey:8 }
						},
					child: {
							personPedigreeId:9,
							name:"child9",
							graphDataKey:"unkown",
							infoDatax:{ nodeKey:9 }
						},
					tripInfo :
						{
							childDisplayTypeKey:"child",
						}
						
				}
				);
	}
	
	static getTestTrip7()
	{
		return(
				{
					mother: {
						personPedigreeId:6,
						name:"child4",
						graphDataKey:"unkown",
						infoDatax:{ nodeKey:6 }
					},
					father: {
							personPedigreeId:11,
							name:"father11",
							graphDataKey:"male",
							infoDatax:{ nodeKey:11 }
						},
					child: {
							personPedigreeId:10,
							name:"child",
							graphDataKey:"unkown",
							infoDatax:{ nodeKey:10 }
						},
					tripInfo :
						{
							childDisplayTypeKey:"child",
						}
						
				}
				);
	}
}

//<js2node>
module.exports = GenericPedigreeClient;
console.log("Loading:GenericPedigreeClient");
//</js2node>