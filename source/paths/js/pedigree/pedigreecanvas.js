var Node = require('../nodes/nodecanvas/nodecanvas');
var NodeCanvas = require('../nodes/nodecanvas/nodecanvas');
var NodeCanvasMouse = require('../nodes/nodecanvas/nodecanvasmouse');
var Common = require('../common/common');
var Position = require('../nodes/position/position');
var Path = require('../paths/path');
var Person = require('../pedigree/person');
var Child = require('../pedigree/child');
var Junction = require('../paths/junction');

class PedigreeCanvas extends NodeCanvas
{
	constructor(canvasHolder,worldDisplay)
	{
		super(canvasHolder);
		this.personMap = new Object();
		this.childMap = new Object();
		this.personSpacer = canvasHolder.getConnector("personSpacer",canvasHolder.canvasName+":personSpacer"),
		this.worldWall = this.canvasHolder.getConnector("worldWall",canvasHolder.canvasName+":worldWall"),
		
		this.updateQueue = new Array();
		this.updateQueue.isInNeedOfSorting = false

		//this.junctionSpacer = junctionSpacer;
		//this.worldWall = worldWall;
		this.worldDisplay = worldDisplay;
		this.lastDate = "";
		this.checkTimestamp = "";
		this.nodeCanvasMouse = new NodeCanvasMouse(this);
		this.fillStyle = worldDisplay.worldBackgroundColor;
	}
		
	pedigreeExtraAnimation(timestamp)
	{
		/*
		this.prepareUpdateQueue();

		var localCheckTimestamp = this.animationExecTime*this.timeFactor + this.startTime.getTime();
		var checkDate = new Date(localCheckTimestamp);

		if(this.lastDate==null) this.lastDate=="";
		
		if(this.lastDate!=checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate))
		{
			this.lastDate = checkDate.toLocaleString()+" "+Common.getDayOfWeek(checkDate);
			if(this.isAnimated && this.canvasHolder.isDrawable()) $('#world_date').html(this.lastDate);
		}
		
		this.checkTimestamp = localCheckTimestamp;
		if(this.isAnimated) while(this.isNextUpdateReady(localCheckTimestamp))
		{
			var proccesed = this.processUpdateQueue();
			if(proccesed!=null)
			{
				var date = new Date(proccesed.processTimestamp*1000+0*1000);//proccesed.getDate();
			}
		}
		*/	
	}

	isNextUpdateReady(timestamp)
	{
		var ready = false;
		if(this.updateQueue.length>0)
		{
			ready = this.updateQueue[0].readyToBeProcessed(timestamp);
		}
		return(ready);
	}
	
	peekAtNextUpdate()
	{
		var update = null;
		if(this.updateQueue.length>0)
		{
			update = this.updateQueue[0];
		}
		return(update);
	}

	doesPersonExist(person)
	{
		return( this.doesPersonKeyExist(person.getPersonKey()) );
	}
	
	doesPersonKeyExist(personKey)
	{
		return( this.personMap.hasOwnProperty(personKey) );
	}

	getPersonByKey(personKey)
	{
		return( this.personMap[personKey] );
	}
	
	getCreatePersonFromJson(json)
	{
		var isPersonNew = !this.doesPersonKeyExist(json.personPedigreeId);
		var person = null;

		if(isPersonNew)
		{
			person  = Person.createPersonFromJson(json,this.canvasHolder);
			this.addNode(person);
			this.worldWall.addNode(person);
			this.personSpacer.addNode(person);
			this.personMap[person.getPersonKey()] = person;
		}
		else
		{
			person = this.getPersonByKey(json.personPedigreeId);
		}
		
		return(person);
	}
	
	processChildUpdate(childUpdate)
	{
		var isMotherNew = !this.doesPersonKeyExist(childUpdate.mother.personPedigreeId);
		var isFatherNew = !this.doesPersonKeyExist(childUpdate.father.personPedigreeId);
		var isChildNew = !this.doesPersonKeyExist(childUpdate.child.personPedigreeId);
		
		var mother = this.getCreatePersonFromJson(childUpdate.mother);		
		var father = this.getCreatePersonFromJson(childUpdate.father);
		var child = this.getCreatePersonFromJson(childUpdate.child);
		
		//var childTrip = new Child(mother,father,child,this.canvasHolder,childUpdate.tripInfo)
		console.log("PedigreeCanvas:processChildUpdate"+
				":isMotherNew="+isMotherNew+
				":isFatherNew="+isFatherNew+
				":isChildNew="+isChildNew+
				""
				);
		
		var childTrip = null;
		     if(!isMotherNew && !isFatherNew && !isChildNew)
		{

		}
		else if(!isMotherNew && !isFatherNew &&  isChildNew)
		{
			console.log("PedigreeCanvas:processChildUpdate:adding child to existing trip");
			childTrip = this.childMap[Child.getChildKeyFromParents(mother,father)];
			childTrip.addChild(child);
		}
		else if(!isMotherNew &&  isFatherNew && !isChildNew)
		{
		}
		else if(!isMotherNew &&  isFatherNew &&  isChildNew)
		{
			console.log("PedigreeCanvas:processChildUpdate:creating new trip, father and child are new");
			childTrip = new Child(mother,father,child,this.canvasHolder,childUpdate.tripInfo);
		}
		else if( isMotherNew && !isFatherNew && !isChildNew)
		{
		}
		else if( isMotherNew && !isFatherNew &&  isChildNew)
		{
		}
		else if( isMotherNew &&  isFatherNew && !isChildNew)
		{
				console.log("PedigreeCanvas:processChildUpdate:creating new trip, mother and father new");
				childTrip = new Child(mother,father,child,this.canvasHolder,childUpdate.tripInfo);
		}
		else if( isMotherNew &&  isFatherNew &&  isChildNew)
		{
			console.log("PedigreeCanvas:processChildUpdate:creating new trip, all new");
			childTrip = new Child(mother,father,child,this.canvasHolder,childUpdate.tripInfo);
		}
		else
		{
			console.log("PedigreeCanvas:processChildUpdate:missed case"+
					":isMotherNew="+isMotherNew+
					":isFatherNew="+isFatherNew+
					":isChildNew="+isChildNew+
					""
					);
		}
		this.childMap[childTrip.getChildKey()] = childTrip;

	}
	
	getPersonList()
	{
		var personList = new Array();
		Object.keys(this.personMap).forEach(function (key)
		{
			personList.push(this.personMap[key]);
		});
		return(personList);
	}
	
	getChildList()
	{
		var childList = new Array();
		Object.keys(this.childMap).forEach(function (key)
		{
			childList.push(this.childMap[key]);
		});
		return(childList);
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
	
	removeWalker(walker)
	{
		//console.log("PedigreeCanvas.removeWalker:"+walker.name+" at "+walker.getCurrentJunction().name);
		if(walker.getCurrentJunction())	walker.getCurrentJunction().removeWalker(walker);
		this.removeNode(walker);
		this.worldWall.removeNode(walker);
		delete this.walkers[walker.name];
	}
			
	processUpdateQueue()
	{
		var update = this.getNextFromUpdateQueue();
		if(update!=null) worldUpdate = this.processUpdate(update);
		return(worldUpdate);
	}
	
	processUpdate(update)
	{
		console.log("processUpdateQueue:update="+CommontoString(update));		
		this.updateQueueProcessed.push(update);
		return(update);
	}
	
	addToUpdateQueue(update)
	{
		this.updateQueue.isInNeedOfSorting = true;
		this.updateQueue.push(update);
	}	
	
	prepareUpdateQueue()
	{
		//console.log("prepareUpdateQueue:isInNeedOfSorting="+this.updateQueue.isInNeedOfSorting);
		if(this.updateQueue.isInNeedOfSorting)
		{
			this.updateQueue.sort(
				function(a, b)
				{
					return(a.processTimestamp-b.processTimestamp);
				}
				);
			this.updateQueue.isInNeedOfSorting = false;
		}
	}
	
	getNextFromUpdate()
	{
		var update = null;
		if(this.worldQueue.length>0)
		{
			update = this.updateQueue[0];
			this.updateQueue.shift();
		}
		return(update);
	}

}
//<js2node>
module.exports = PedigreeCanvas;
console.log("Loading:PedigreeCanvas");
//</js2node>
