var PathWorldDef = require('../pedigree/pedigreedef');
var CanvasHolder = require('../nodes/nodecanvas/canvasholder');
var PedigreeDef = require('../pedigree/pedigreedef');
//var WorldUpdate = require('../pedigree/worldupdate');
var Person = require('../pedigree/person');
var Common = require('../common/common');
var CircleDisplay = require('../nodes/nodedisplay/circledisplay');
var ConnectorDisplayEmpty = require('../nodes/connectordisplay/connectordisplayempty');
var ConnectorDisplayLineAverage = require('../nodes/connectordisplay/connectordisplaylineaverage');
var Position = require('../nodes/position/position');
var HorizontalConnector = require('../nodes/connector/horizontalconnector');
var GroupConnector = require('../nodes/connector/groupconnector');
var SpringConnector = require('../nodes/connector/springconnector');
var PullTogether = require('../nodes/connector/pulltogether');
var PushApart = require('../nodes/connector/pushapart');
var MoveToRow = require('../nodes/connector/movetorow');
var PinConnector = require('../nodes/connector/pinconnector');
var WallConnector = require('../nodes/connector/wallconnector');
var ChildConnectorDisplay = require('../pedigree/nodedisplay/childconnectordisplay');
var JunctionDisplay = require('../paths/nodedisplay/junctiondisplay');
var RectangleDisplay = require('../nodes/nodedisplay/rectangledisplay');
var TriangleDisplay = require('../nodes/nodedisplay/triangledisplay');
var ArcDisplayShape = require('../nodes/nodedisplay/arcdisplayshape');
var PersonConnector = require('../pedigree/personconnector');

//var InitInaGraph = require('../pathsexp/inagraph/initinagraph');




class GenericPedigreeDef extends PedigreeDef
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
				personRadius:15,
				personSpacing:15*3.0,
				
				personSpacingPullElasticity:0.025,
				personSpacingPushElasticity:0.5,
				moveToRowElasticity:0.5,
				
				junctionRadiusDefault:15,
				walkerRadiusDefault:15*0.3,
				relaxedDistanceDefault:8.5*10,
				elasticityFactorDefualt:0.025,
				port:3000,
		};
		
		this.pedigree =
		{
				backgroundColor:"e0e0f0ff",
		}
		
		this.worldDisplay =
		{	
			junctionRadiusDefault:this.worldDefaults.junctionRadiusDefault,
			walkerRadiusDefault:this.worldDefaults.walkerRadiusDefault,
			relaxedDistanceDefault:this.worldDefaults.relaxedDistanceDefault,
			elasticityFactorDefualt:this.worldDefaults.elasticityFactorDefualt,
			
		    worldBackgroundColor:"e0e0f0ff",
		
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
				personSpacer:
						function(worldDef,name) 
						{
							return(
									new PushApart(
											new ConnectorDisplayEmpty(),
											null,
											null,
											worldDef.worldDefaults.personSpacing,
											worldDef.worldDefaults.personSpacingPushElasticity,
											name)
									);
						},						
				spousePushApart:
						function(worldDef,name) 
						{
							return(
									new PushApart(
											new ConnectorDisplayEmpty(),
											null,
											null,
											worldDef.worldDefaults.personSpacing,
											worldDef.worldDefaults.personSpacingPushElasticity,
											name)
									);
						},	
				spousePullTogether:
						function(worldDef,name) 
						{
							return(
									new PullTogether(
											new ConnectorDisplayEmpty(),
											null,
											null,
											worldDef.worldDefaults.personSpacing,
											worldDef.worldDefaults.personSpacingPullElasticity,
											name)
									);
						},	
				moveToRow:
						function(worldDef,name) 
						{
							return(
									new MoveToRow(
											new ConnectorDisplayEmpty(),
											null,
											null,
											0,
											worldDef.worldDefaults.moveToRowElasticity,
											name)
									);
						},	
				childOffsetPin:
						function(worldDef,name) 
						{
							return(
									new PinConnector(
											new ConnectorDisplayEmpty(),
											null,
											new Position(0,worldDef.worldDefaults.personSpacing*1.1),
											0,
											worldDef.worldDefaults.personSpacingPullElasticity*2,
											name)
									);
						},
				parentOffsetPin:
						function(worldDef,name) 
						{
							return(
									new PinConnector(
											new ConnectorDisplayEmpty(),
											null,
											new Position(0,worldDef.worldDefaults.personSpacing*-1.1),
											0,
											worldDef.worldDefaults.personSpacingPullElasticity*0.2,
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
				child:
					function(worldDef,name)
					{
						return(
							new HorizontalConnector(new ChildConnectorDisplay(
									{lineColor:"0000a0ff",lineWidth:2}),
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
		    	
				child:
				{
					connectorDisplay: new ChildConnectorDisplay(
					//connectorDisplay: new ConnectorDisplayLineAverage(
					{
						lineColor:"0000a0ff",lineWidth:2
					}),					
				},
		    	
			
				generic:
				{
					connectorDisplay: new ChildConnectorDisplay(
					//connectorDisplay: new ConnectorDisplayLineAverage(
					{
						lineColor:"0000a0ff",lineWidth:2
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
								radius:this.worldDefaults.personRadius/1.25,
								width:(this.worldDefaults.personRadius/1.25)*2,
								height:(this.worldDefaults.personRadius/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,							
				},
				unknown:
				{
		
					nodeDisplay:new TriangleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								width:(this.worldDefaults.personRadius/1.25)*2,
								height:(this.worldDefaults.personRadius/1.25)*2,
								clone:false
							}),
					walkerJunctionRules:this.junctionExits,							
				},
				male:
				{
					nodeDisplay:new RectangleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								width:(this.worldDefaults.personRadius/1.25)*2,
								height:(this.worldDefaults.personRadius/1.25)*2,
								clone:false							
							}),
					walkerJunctionRules:this.junctionExits,
				},
				female:
				{
					nodeDisplay:new CircleDisplay(
							{
								fillColor:"ffffffff",borderColor:"000000ff",
								selectFillColor:"20ff20ff",selectBorderColor:"0000ffff",
								borderWidth:1,
								radius:this.worldDefaults.personRadius/1.25,
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
		
	getWorldDispaly()
	{
		return(this.worldDisplay);
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
}

//<js2node>
module.exports = GenericPedigreeDef;
console.log("Loading:GenericPedigreeDef");
//</js2node>