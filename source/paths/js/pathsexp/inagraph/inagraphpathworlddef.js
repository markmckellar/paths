var PathWorldDef = require('../../paths/pathworlddef');
var CanvasHolder = require('../../nodes/nodecanvas/canvasholder');
var PathWorld = require('../../paths/pathworld');
var WorldUpdate = require('../../paths/worldupdate');
var Path = require('../../paths/path');
var Common = require('../../common/common');
var CircleDisplay = require('../../nodes/nodedisplay/circledisplay');
var ConnectorDisplayEmpty = require('../../nodes/connectordisplay/connectordisplayempty');
var GroupConnector = require('../../nodes/connector/groupconnector');
var WallConnector = require('../../nodes/connector/wallconnector');
var JunctionConnector = require('../../paths/nodedisplay/junctionconnector');
var JunctionDisplay = require('../../paths/nodedisplay/junctiondisplay');
var RectangleDisplay = require('../../nodes/nodedisplay/rectangledisplay');
var TriangleDisplay = require('../../nodes/nodedisplay/triangledisplay');
var ArcDisplayShape = require('../../nodes/nodedisplay/arcdisplayshape');

//var InitInaGraph = require('../../pathsexp/inagraph/initinagraph');




class InaGraphPathWorldDef extends PathWorldDef
{

	constructor()
	{
		super();
		this.init();
	}
	
	init()
	{
		this.worldDefaults =
		{
				junctionRadiusDefault:15,
				walkerRadiusDefault:15*0.3,
				relaxedDistanceDefault:8.5*10,
				elasticityFactorDefualt:0.025,
				port:3000,
		};
		
		this.pathParts =
		{
			start:["Accessioning","Anatomic pathology lab"],
			normalEnd:["RNA lab","Medical services","Lab director sign off","Reporting","Result mailed/ Sample returned"],
			tumorFailRequeue:["Insufficient tumor","Canceled","Reporting","Extra Tisue","YES requeue"],
			tumorFailCS:["Insufficient tumor","Canceled","Reporting","Extra Tisue","NO cancel sample","Customer Service"],
			rnaFailRequeue:["Insufficient RNA","Canceled","Reporting","Extra Tisue","YES requeue"],
			rnaFailCS:["Insufficient RNA","Canceled","Reporting","Extra Tisue","NO hold","Customer Service"],
		};

		
		this.pathDefs =
		[
			{
				pathDefName:"normal",numberNodes:100,nodeShape:"circle",nodeColor:"ff0000",
				path:["start","normalEnd"]
			},
			{
				pathDefName:"tumorFailRQSuccess",numberNodes:20,nodeShape:"circle",nodeColor:"ff0000",
				path:["start","tumorFailRequeue","normalEnd"]
			},
			{
				pathDefName:"rnaFailRQSucess",numberNodes:20,nodeShape:"circle",nodeColor:"ff0000",
				path:["start","rnaFailRequeue","normalEnd"]
			},
			{
				pathDefName:"tumorFailCancel",numberNodes:20,nodeShape:"circle",nodeColor:"ff0000",
				path:["start","tumorFailCS"]
			},
			{
				pathDefName:"tumorFailCancel",numberNodes:20,nodeShape:"circle",nodeColor:"ff0000",
				path:["start","rnaFailCS"]
			},
		];
			
	    this.junctionExits = 
	    [
	        {exitJunction:"Result mailed/ Sample returned",exitAfterMiliSeconds:60*60*24*1000},
	    ];
		
		this.worldDisplay =
		{	
			junctionRadiusDefault:this.worldDefaults.junctionRadiusDefault,
			walkerRadiusDefault:this.worldDefaults.walkerRadiusDefault,
			relaxedDistanceDefault:this.worldDefaults.relaxedDistanceDefault,
			elasticityFactorDefualt:this.worldDefaults.elasticityFactorDefualt,
			
		    worldBackgroundColor:"e0e0f0ff",
		
		    teleportPaths:
				[
					// Teleport Path! name=Requeue to MS start=DT1 end=MS/In Progress
					{teleportName:"Requeue to MS/In Progress",startJunction:"^((?!DT1|MS.*|Signing).)*$",endJunction:"MS/In Progress"},
					{teleportName:"Requeue to MS",startJunction:"^((?!DT1|MS.*|Signing).)*$",endJunction:"MS"},
					{teleportName:"Requeue to DT1",startJunction:"^((?!CS|MS.*).)*$",endJunction:"DT1"},
					{teleportName:"Requeue to MRP-Packaging",startJunction:"^((?!Signing|Cancled).)*$",endJunction:"MRP-Packaging"},
					{teleportName:"Requeue to Signing",startJunction:"^((?!MS|Packaging|MRP-Packaging).)*$",endJunction:"Signing"},
					{teleportName:"Test canceled",startJunction:"^((?!Canceled|.*Packaging.*).)*$",endJunction:"Canceled"},	
				],
			endPointMods:
				[
					{endPointModName:"MRP-Test Reported",startJunction:"MRP-Packaging",endJunction:"Test Reported"},		
					//{endPointModName:"NEW-Test Reported",startJunction:".*",endJunction:"Test Reported"},		
				],
			connectorDefs:
			{
				generic:
					function(worldDef,name) 
					{
						return(
								new GroupConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*2.5,
										worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				junctionSpacer:
					function(worldDef,name) 
					{
						return(
								new GroupConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*2.5,
										worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				worldWall:
					function(worldDef,name)
					{
						return(
								new WallConnector(
										new ConnectorDisplayEmpty(),
										null,
										null,
										worldDef.worldDefaults.relaxedDistanceDefault*0.75,
										1-worldDef.worldDefaults.elasticityFactorDefualt,
										name)
								);
					},
				path:
					function(worldDef,name)
					{
						return(
							new Path(new JunctionConnector(
									{lineColor:"0000a0ff",lineWidth:5}),
								null,
								null,
								worldDef.worldDefaults.relaxedDistanceDefault*1.25,
								1-worldDef.worldDefaults.elasticityFactorDefualt,
								name)
						);
				}
				
			},
		    connectorDisplay:
			{
				generic:
				{
					connectorDisplay: new JunctionConnector(
					{
						lineColor:"0000a0ff",lineWidth:5
					}),					
				},
			},
			nodeDisplay:
			{
				generic:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,							
				},
				genericJunction:
				{			
					//initGraphData:InaGraphPathWorldDef.initJunctionDisplay,
					initGraphData:this.initJunctionDisplay,
					nodeDisplay:{displayInfo:{clone:false}}
				},
				nodeGeneric:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				junctionPieSlice:
				{
					
					nodeDisplayFunction:function()
						{
							return(new ArcDisplayShape(
								{
									fillColor:"00000000",
									borderColor:"000000ff",
									selectFillColor:"00ff007f",selectBorderColor:"000000ff",
									borderWidth:1,
									radius:25,
									curvePoints:16,
									startAngle:0,
									endAngle:320,
									width:25,
									height:25,
									ts:new Date().getTime(),
									clone:true
								}))
								},
					nodeDisplay:new ArcDisplayShape(
					{
						fillColor:"00000000",
						borderColor:"000000ff",
						selectFillColor:"00ff007f",selectBorderColor:"000000ff",
						borderWidth:1,
						radius:25,
						curvePoints:16,
						startAngle:0,
						endAngle:320,
						width:25,
						height:25,
						clone:true
					}),
				},
				tumorFailRQSuccess:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"FFA500ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								//radius:walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				normal:
				{
					nodeDisplay:new RectangleDisplay(
							{
								fillColor:"ff2020ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false							
							}),
					walkerJunctionRules:this.junctionExits,
				},
				rnaFailRQSucess:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"00A5FFff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,		
				},
				tumorFailCancel:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"A5FF00ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault/1.25,
								width:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								height:(this.worldDefaults.walkerRadiusDefault/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
				testing:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"A5FF00ff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.walkerRadiusDefault*3,
								width:(this.worldDefaults.walkerRadiusDefault*3)*2,
								height:(this.worldDefaults.walkerRadiusDefault*3)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,
				},
			},
		};
		
	}
	
	getPathParts()
	{
		return(this.pathParts);
	}
	
	getPathDef()
	{
		return(this.pathDefs);
	}
	
	getWorldDispaly()
	{
		return(this.worldDisplay);
	}
	
	getWalkerJunctionRules()
	{
		return(this.junctionExits);
   	}
	
	getWorldDefaults()
	{

		return(this.worldDefaults);
	}
	
	//static initJunctionDisplay(node)
	initJunctionDisplay(node)
	{
		console.log("inside initJunctionDisplay for name="+node.name);
		node.graphData.nodeDisplay = new JunctionDisplay(
				{
					fillColor:"a0a0ffff",
					borderColor:"000000ff",
					selectFillColor:"ffff00ff",
					selectBorderColor:"0000ffff",
					borderWidth:2,
					fontStyle:"bold",
					fontPixelHeight:15,
					fontFace:"Arial",
					rectBorderColor:"0000ffff",
					rectFillColor:"ffffffff",
					fontColor:"0000ffff",
					clone:false
				});
		//node.graphData.nodeDisplay.clone=false;
		node.graphData.textSpacer = 5;
		//node.graphData.radius = this.worldDefaults.junctionRadiusDefault*3;
		node.graphData.radius = 15;
		node.graphData.width = node.graphData.radius*2;
		node.graphData.height = node.graphData.radius*2;
		if(node.graphData.nodes==null) node.graphData.nodes = new Array();
	}
	
	
	getPathArray()
	{
		var allPathArray = [];
		for(var i=0;i<this.pathDefs.length;i++)
		{
			var pathDef = this.pathDefs[i]; 
			for(var nodeLoop=0;nodeLoop<pathDef.numberNodes;nodeLoop++)
			{
				var pathArray = [];
				for(var j=0;j<pathDef.path.length;j++)
				{
					var pathName = pathDef.path[j];
					var pathDefName = pathDef.pathDefName;
					//console.log("   doing pathDefName="+pathDefName+" pathName="+pathName);
					for(var k=0;k<this.pathParts[pathName].length;k++)
					{
						//console.log("               junction="+pathParts[pathName][k]);
						pathArray.push(this.pathParts[pathName][k]);
					}
				}
				allPathArray.push(
				{
					pathDef:pathDef,
					path:pathArray
				});
				//console.log("#"+i+" pathArray size="+pathArray.length+" name="+pathDef.pathDefName);
			}
		}
		//CommonshuffleArray(allPathArray);
		return(allPathArray);
	}
	
	initCustomNodes(world)
	{
		var pathArray = this.getPathArray();
		
		var now = new Date().getTime();
		//now = Math.floor(now/1000);
		//now = now/1000;
		//var lastTime = now;
		
		for(var i=0;i<pathArray.length;i++)
		{
			var lastTime = now;
			var pd = pathArray[i];
			//console.log("Start of worldUpdate:"+CommontoString(pd));
			
			var startSpacer = Math.floor(Math.random()*360000)-0;
			if( (lastTime+startSpacer) < now) startSpacer = 0;
			for(var j=0;j<pd.path.length;j++)
			{
				var spacer = Math.floor(Math.random()*8000)+1000;
				lastTime += spacer;
				
				//console.log("adding : pathName="+pd.pathDef.pathDefName+" junction="+pd.path[j]);
	
				var worldUpdate = new WorldUpdate(
						pd.path[j],
						pd.pathDef.pathDefName+"."+i,
						lastTime+startSpacer,
						{
							waklerName:pd.pathDef.pathDefName+"."+i,
							walkerTypeKey:pd.pathDef.pathDefName
						},
						{
							junctionName:pd.path[j],
							junctionTypeKey:"genericJunction"
						},
						{
							pathTypeKey:"generic"
						},
						{
							status:"In Progress"
						}); // 23-JAN-17 06.35.14 AM
				console.log("adding : pathName="+pd.pathDef.pathDefName+" junction="+pd.path[j]+" ts="+worldUpdate.processTimestamp);

				world.addToWorldUpdateQueue(worldUpdate);
			}
		}
	}
}

//<js2node>
module.exports = InaGraphPathWorldDef;
console.log("Loading:InaGraphPathWorldDef");
//</js2node>