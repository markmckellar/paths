var Node = require('../nodes/nodecanvas/nodecanvas');
var NodeCanvas = require('../nodes/nodecanvas/nodecanvas');
var NodeCanvasMouse = require('../nodes/nodecanvas/nodecanvasmouse');
var Common = require('../common/common');
var Position = require('../nodes/position/position');
var Path = require('../paths/path');
var Walker = require('../paths/walker');
var Junction = require('../paths/junction');

class PathWorld extends NodeCanvas
{
	constructor(canvasHolder,worldDisplay)
	{
		super(canvasHolder);
		this.junctions = new Object();
		this.paths = new Object();
		this.walkers = new Object();
		this.worldUpdateQueue = new Array();
		this.worldUpdateQueue.isInNeedOfSorting = false
		
		this.junctionSpacer = canvasHolder.getConnector("junctionSpacer",canvasHolder.canvasName+":junctionSpacer"),
		this.worldWall = canvasHolder.getConnector("worldWall",canvasHolder.canvasName+":worldWall"),
		
		//this.junctionSpacer = junctionSpacer;
		//this.worldWall = worldWall;
		this.worldDisplay = worldDisplay;
		this.lastDate = "";
		this.checkTimestamp = "";
		this.nodeCanvasMouse = new NodeCanvasMouse(this);
		this.fillStyle = worldDisplay.worldBackgroundColor;
	}
	
	static fillPathWorldFromClientJson(world,json)
	{		
		//console.log("PathWolrd:fillPathWorldFromClientJson");
		//console.log("PathWolrd:fillPathWorldFromClientJson:worldName="+this.name);
		world.infoData.nodeKey.key = json.infoData.nodeKey.key;
		world.infoData.nodeKey.nodeId = json.infoData.nodeKey.nodeId;
		
		var junctionKeyMap = {};
		Object.keys(json.junctions).forEach(function (key)
		{
			var junctionJson = json.junctions[key];
			var junction = world.getCreateJunction(junctionJson.name,junctionJson.infoData);
			junction.position.x = junctionJson.position.x;
			junction.position.y = junctionJson.position.y;
			junctionKeyMap[key] = junction;
		});
		
		Object.keys(json.paths).forEach(function (key)
		{
			var pathJson = json.paths[key];
			var path = world.getCreatePath(
					junctionKeyMap[pathJson.junctionStart],
					junctionKeyMap[pathJson.junctionEnd],
					pathJson);
		});
				
		Object.keys(json.walkers).forEach(function (key)
		{
			var walkerJson = json.walkers[key];
			var walker = world.getCreateWalker(walkerJson.name,walkerJson.infoData);
			walker.position.x = walkerJson.position.x;
			walker.position.y = walkerJson.position.y;	
			walker.setCurrentJunction(junctionKeyMap[walkerJson.currentJunction]);
		});
	}
	
	  xgetNodeJson(json)
	  {
		  json.name = this.name;
		  json.graphDataKey = this.graphDataKey;
		  json.infoData = this.infoData;
		  //json.infoData.nodeKey = this.getNodeKey();
		  json.position = this.position.getClientJson();
		  json.connectors = new Array();
		  for(var i=0;i<this.connectors.length;i++) json.connectors.push(this.connectors[i].getConnectorKey());

		  return(json);
	  }

	
	static createPathWorldFromClientJson(canvasHolder,worldDef,json)
	{
		var pathWorld = new PathWorld(canvasHolder,worldDef);
		
		Object.keys(json.junctions).forEach(function (key)
		{
			var junctionJson = json.junctions[key];
			var junction = pathWorld.getCreateJunction(junctionJson.name,junctionJson.infoData);
			junction.position.x = junctionJson.position.x;
			junction.position.y = junctionJson.position.y;
		});
		
		Object.keys(json.walkers).forEach(function (key)
				{
					var walkerJson = json.walkers[key];
					var walker = pathWorld.getCreateWalker(walkerJson.name,walkerJson.infoData);
					walker.position.x = walkerJson.position.x;
					walker.position.y = walkerJson.position.y;
				});
		//json.junctions = {};
		//json.walkers = {};
		//json.paths = {};
		
		/*
		var isWalkerNew = this.isWalkerNew(worldUpdate.walkerName);
		var isJunctionNew = this.isJunctionNew(worldUpdate.junctionName);
		var walker = this.getCreateWalker(worldUpdate.walkerName,worldUpdate.walkerInfo);
		var junction = this.getCreateJunction(worldUpdate.junctionName,worldUpdate.junctionInfo);		
		var currentJunction = walker.getCurrentJunction();
		*/	
		//var worldDisplay = sdfsd;
		//var worldWall = sfsd;
		//var junctionSpacer = xxx
		return(pathWorld);
	}
	
	drawCanvas(timestamp)
	{
		super.drawCanvas(timestamp);
		this.pathWolrdExtraAnimation(timestamp);
	}
	
	getWorldClientJson()
	{
		var json = {};
		
		json.junctions = {};
		var junctionList = this.getJunctionList();
		for(var i=0;i<junctionList.length;i++)
		{
			var junction = junctionList[i];
			json.junctions[junction.getNodeKey()] = junction.getClientJson();
		}
		
		
		json.walkers = {};
		var walkerList = this.getWalkerList();
		for(var i=0;i<walkerList.length;i++)
		{
			var walker = walkerList[i];
			json.walkers[walker.getNodeKey()] = walker.getClientJson();
		}
		
		json.paths = {};
		var pathList = this.getPathList();
		for(var i=0;i<pathList.length;i++)
		{
			var path = pathList[i];
			json.paths[path.getConnectorKey()] = path.getClientJson();
		}
		
  	   json.canvasHolder = this.canvasHolder.getClientJson();
  	   json.infoData = this.infoData;	
  	   return(json);
	}
	
	pathWolrdExtraAnimation(timestamp)
	{
		this.prepareWorldUpdateQueue();

		var localCheckTimestamp = this.animationExecTime*this.timeFactor + this.startTime.getTime();
		var checkDate = new Date(localCheckTimestamp);

		if(this.lastDate==null) this.lastDate=="";
		
		if(this.lastDate!=checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate))
		{
			this.lastDate = checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate);
			if(this.isAnimated && this.canvasHolder.isDrawable()) $('#world_date').html(this.lastDate);
		}
		
		this.checkTimestamp = localCheckTimestamp;
		if(this.isAnimated) while(this.isNextWorldUpdateReady(localCheckTimestamp))
		{
			var proccesed = this.processWorldUpdateQueue();
			if(proccesed!=null)
			{
				var date = new Date(proccesed.processTimestamp*1000+0*1000);//proccesed.getDate();
			}
		}	
		
		// process the walkers rules
		for (var walkerKey in this.walkers)
		{
			var walker = this.walkers[walkerKey];
			walker.processWalkerRules(this);
		}
	}

	
	
	
	log()
	{
		console.log("pathWorld log:"+CommontoString(this.worldDisplay));
	}
	
	
	isWalkerNew(walkerName)
	{
		return(!this.walkers.hasOwnProperty(walkerName));
	}
	
	isJunctionNew(junctionName)
	{
		return(!this.junctions.hasOwnProperty(junctionName));
	}
	
	isNextWorldUpdateReady(timestamp)
	{
		var ready = false;
		if(this.worldUpdateQueue.length>0)
		{
			ready = this.worldUpdateQueue[0].readyToBeProcessed(timestamp);
		}
		return(ready);
	}
	
	peekAtNextWorldUpdate()
	{
		var worldUpdate = null;
		if(this.worldUpdateQueue.length>0)
		{
			worldUpdate = this.worldUpdateQueue[0];
		}
		return(worldUpdate);
	}
	
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
	
	getWalkerList()
	{
		var walkerList = new Array();
		var walkers = this.walkers;
		Object.keys(this.walkers).forEach(function (key)
		{
			walkerList.push(walkers[key]);
		});
		return(walkerList);
	}

	getPathList()
	{
		var pathList = new Array();
		var paths = this.paths;
		Object.keys(this.paths).forEach(function (key)
		{
			pathList.push(paths[key]);
		});
		return(pathList);
	}

	getJunctionList()
	{
		var junctionList = new Array();
		var junctions = this.junctions;
		Object.keys(this.junctions).forEach(function (key)
		{
			junctionList.push(junctions[key]);
		});
		return(junctionList);
	}
	
	/*
	getJuntionGraphData(junctionInfo)
	{
		var junctionGraphData = this.worldDisplay.junctionTypes["generic"];
	
		if(this.worldDisplay.junctionTypes.hasOwnProperty(junctionInfo.junctionTypeKey))
		{
			junctionGraphData = this.worldDisplay.junctionTypes[junctionInfo.junctionTypeKey];
	
		}
		return(junctionGraphData);
	}
	*/
	getCreateJunction(name,junctionInfo)
	{
		//var junctionGraphData = this.getJuntionGraphData(junctionInfo);
		if(!this.junctions.hasOwnProperty(name))
		{
			//console.log("PathWorld:getCreateJunction:type="+junctionInfo.junctionTypeKey);

			var startPosition = this.getStartPositionJunction();
			this.junctions[name] = new Junction(
				name,
				new Position(startPosition.getX(),startPosition.getY()),
				this.canvasHolder,
				new Array(),
				junctionInfo.junctionTypeKey,
				junctionInfo,
				this);
			var j = this.junctions[name];
			//console.log("pathWorld getCreateJunction inner name:"+j.name)	
			this.addNode(j);
			this.worldWall.addNode(j);
			this.junctionSpacer.addNode(j);
		}
		var junction = this.junctions[name];
	
		return(junction);
	}
	
	/*
	getWalkerGraphData(walkerInfo)
	{
		var walkerGraphData = this.worldDisplay.walkerDisplayTypes["generic"];
		//console.log("getWalkerGraphData:looking up:"+CommontoString(walkerInfo));
		if(this.worldDisplay.walkerDisplayTypes.hasOwnProperty(walkerInfo.walkerTypeKey))
		{
			//console.log("     getWalkerGraphData:found:"+CommontoString(walkerInfo.walkerTypeKey));
			walkerGraphData = this.worldDisplay.walkerDisplayTypes[walkerInfo.walkerTypeKey];
		}
		return(walkerGraphData);
	}
	*/
	getCreateWalker(walkerName,walkerInfo)
	{
		//var walkerGraphData = this.getWalkerGraphData(walkerInfo);
		
		if(!this.walkers.hasOwnProperty(walkerName))
		{
			//console.log("PathWorld:getCreateWalker:type="+walkerInfo.walkerTypeKey);

			var startPosition = this.getStartPositionWalker();
			this.walkers[walkerName] = new Walker(
					walkerName,
					new Position(startPosition.getX(),startPosition.getY()),
					this.canvasHolder,
					new Array(),
					walkerInfo.walkerTypeKey,
					walkerInfo);
			var w = this.walkers[walkerName];
			this.addNode(w);
			this.worldWall.addNode(w);
			//this.junctionSpacer.addNode(j);
		}
		var walker = this.walkers[walkerName]; 
		return(walker);
	}
	
	removeWalker(walker)
	{
		//console.log("PathWorld.removeWalker:"+walker.name+" at "+walker.getCurrentJunction().name);
		if(walker.getCurrentJunction())	walker.getCurrentJunction().removeWalker(walker);
		this.removeNode(walker);
		this.worldWall.removeNode(walker);
		delete this.walkers[walker.name];
	}
	
	getTeleportPath(startJunction,endJunction)
	{
		var startJunctionName = "";
		var endJunctionName = "";
		if(startJunction!=null) startJunctionName = startJunction.name;
		if(endJunction!=null) endJunctionName = endJunction.name;
		var teleportPathReturn = null;
		for(var i=0;i<this.worldDisplay.teleportPaths.length;i++)
		{
			var teleportPath = this.worldDisplay.teleportPaths[i];
			var startJunctionRegExp = new RegExp(teleportPath.startJunction);
			var endJunctionRegExp = new RegExp(teleportPath.endJunction);
			if(
					startJunctionRegExp.test(startJunctionName) &&
					endJunctionRegExp.test(endJunctionName) &&
					startJunctionName!=endJunctionName)
			{
				teleportPathReturn = teleportPath;
				break;
			}
		}
		return(teleportPathReturn);
	}
	
	getEndPointMod(startJunction,endJunction)
	{
		var startJunctionName = "";
		var endJunctionName = "";
		if(startJunction!=null) startJunctionName = startJunction.name;
		if(endJunction!=null) endJunctionName = endJunction.name;
		var endPointReturn = null;
		for(var i=0;i<this.worldDisplay.endPointMods.length;i++)
		{
			var endPoint = this.worldDisplay.endPointMods[i];
			var startJunctionRegExp = new RegExp(endPoint.startJunction);
			var endJunctionRegExp = new RegExp(endPoint.endJunction);
			if(
					startJunctionRegExp.test(startJunctionName) &&
					endJunctionRegExp.test(endJunctionName) &&
					startJunctionName!=endJunctionName)
			{
				endPointReturn = endPoint;
				break;
			}
		}
		return(endPointReturn);
	}
	
	processWorldUpdateQueue()
	{
		var worldUpdate = this.getNextFromWorldUpdate();
		if(worldUpdate!=null) worldUpdate = this.processWorldUpdate(worldUpdate);
		return(worldUpdate);
	}
	
	processWorldUpdate(worldUpdate)
	{
		//console.log("processWorldUpdateQueue:worldUpdate="+CommontoString(worldUpdate));		
		var isWalkerNew = this.isWalkerNew(worldUpdate.walkerName);
		var isJunctionNew = this.isJunctionNew(worldUpdate.junctionName);
		var walker = this.getCreateWalker(worldUpdate.walkerName,worldUpdate.walkerInfo);
		var junction = this.getCreateJunction(worldUpdate.junctionName,worldUpdate.junctionInfo);		
		var currentJunction = walker.getCurrentJunction();	
		
		var endPointMod = this.getEndPointMod(currentJunction,junction);		
		if(endPointMod!=null)
		{
			console.log("Before getEndPointMod! name="+endPointMod.endPointModName+" start="+currentJunction.name+
					" end="+junction.name+" walkerName:"+worldUpdate.walkerName+
					" worldUpdate="+CommontoString(worldUpdate));
			
			
			isJunctionNew = this.isJunctionNew(endPointMod.endPointModName);
			worldUpdate.junctionInfo.junctionName = endPointMod.endPointModName;
			worldUpdate.junctionName = endPointMod.endPointModName;
			junction = this.getCreateJunction(endPointMod.endPointModName,worldUpdate.junctionInfo);
			console.log("...after getEndPointMod! name="+endPointMod.endPointModName+" start="+currentJunction.name+
					" end="+junction.name+" walkerName:"+worldUpdate.walkerName+
					" worldUpdate="+CommontoString(worldUpdate));
			//walker.setCurrentJunction(currentJunction);
		}
		
		var teleportPath = this.getTeleportPath(currentJunction,junction);
		if(teleportPath!=null)
		{	var cjname = "null";
			if(currentJunction!=null) cjname = currentJunction.name; 
			//console.log("Teleport Path! name="+teleportPath.teleportName+" start="+cjname+" end="+junction.name);
			
			currentJunction = this.getCreateJunction(teleportPath.teleportName,
					{junctionName:teleportPath.teleportName,junctionTypeKey:"genericJunction"});
			//console.log("...after Teleport Path! name="+teleportPath.teleportName+" start="+currentJunction.name+" end="+junction.name);
			walker.setCurrentJunction(currentJunction);
		}
		
		if(currentJunction!=null)
		{
			this.getCreatePath(currentJunction,junction,worldUpdate.pathInfo);
			//walker.setCurrentJunction(junction);
		}
		
		walker.setCurrentJunction(junction);
		walker.lastUpdateTimeStamp = this.checkTimestamp;
		if(isJunctionNew)
		{
			if(this.junctions.length==0)
			{
				this.junction.position.setX(0);
				this.junction.position.setY(0);
			}
			else if(currentJunction==null)
			{
				junction.position.setX(this.worldDisplay.relaxedDistanceDefault);
				junction.position.setY(this.worldDisplay.relaxedDistanceDefault);
			}
			else
			{
				junction.position.setX( currentJunction.position.getX()+this.worldDisplay.junctionRadiusDefault*(Math.random()) );
				junction.position.setY( currentJunction.position.getY()+this.worldDisplay.junctionRadiusDefault*(Math.random()) );
			}
		}
		if(isWalkerNew)
		{
			walker.position.setX( junction.position.getX() );
			walker.position.setY( junction.position.getY() );
		}
		this.worldUpdateQueueProcessed.push(worldUpdate);
		return(worldUpdate);
	}
	
	
	
	addToWorldUpdateQueue(worldUpdate)
	{
		this.worldUpdateQueue.isInNeedOfSorting = true;
		this.worldUpdateQueue.push(worldUpdate);
	}	
	
	prepareWorldUpdateQueue()
	{
		//console.log("prepareWorldUpdateQueue:isInNeedOfSorting="+this.worldUpdateQueue.isInNeedOfSorting);
		if(this.worldUpdateQueue.isInNeedOfSorting)
		{
			this.worldUpdateQueue.sort(
				function(a, b)
				{
					return(a.processTimestamp-b.processTimestamp);
				}
				);
			this.worldUpdateQueue.isInNeedOfSorting = false;
		}
	}
	
	getNextFromWorldUpdate(worldUpdate)
	{
		var worldUpdate = null;
		if(this.worldUpdateQueue.length>0)
		{
			worldUpdate = this.worldUpdateQueue[0];
			this.worldUpdateQueue.shift();
		}
		return(worldUpdate);
	}
	
	getWalkerKey(walker)
	{
		return(walker.name);
	}
	
	getJunctionKey(junction)
	{
		return(junction.getNodeKey());
	}
	
	getPathKey(junctionStart,junctionEnd)
	{
		return(this.getJunctionKey(junctionStart)+"#"+this.getJunctionKey(junctionEnd));
	}
	
	getStartPositionWalker()
	{
		return(new Position(this.canvasHolder.getWidth()/2,this.canvasHolder.getHeight()/2));
	}
	
	getStartPositionJunction()
	{
		return(new Position(this.canvasHolder.getWidth()/2,this.canvasHolder.getHeight()/2));
	}

}
//<js2node>
module.exports = PathWorld;
console.log("Loading:PathWorld");
//</js2node>
