const express = require('express');
const app = express();
var Common = require('../common/common');
var PedigreeCanvasHolder = require('../pedigree/pedigreecanvasholder');
var GenericPedigreeDef = require('../pedigreeexp/genericpedigreedef');
var PedigreeUpdate = require('../pedigree/pedigreeupdate');
var CanvasHolderVirtual = require('../nodes/nodecanvas/canvasholdervirtual');
var Position = require('../nodes/position/position');
var PedigreeClient = require('../pedigree/pedigreeclient');
var GenericPedigreeClient = require('../pedigreeexp/genericpedigreeclient');




var path = require('path');


var worldDef = new GenericPedigreeDef();		
var canvasHolder = new CanvasHolderVirtual('myCanvas',worldDef,800,800,new Position());

var pedigreeClient = new GenericPedigreeClient(canvasHolder);

var world = pedigreeClient.world;


world.processChildUpdate(GenericPedigreeClient.getTestTrip1());


/*
var pathWorldUniverse = new PathWorldUniverse();
var worldDef = new InaGraphPathWorldDef();		
var canvasHolder = new CanvasHolderVirtual('myCanvas',worldDef,800,800,new Position())
var pathClient = new PathClient(canvasHolder);
var timeToDraw = true;
var bbm = 240;
var bbs = bbm/60.0;
var interval = 1000/bbs; //one millisecond over beat per second
pathWorldUniverse.addPathWorld(pathClient.world);
console.log("drawing every : "+interval+"ms");
setInterval(doDraw,interval);
*/
function doDraw()
{
	pathWorldUniverse.draw();
}


var port = canvasHolder.worldDef.getWorldDefaults().port;


app.listen(port, function() {
	  console.log('listening on '+port)
	});

var root = __dirname +'/../../..';
app.use('/', express.static(root));


app.get('/paths', function(req, res)
		{
		    res.setHeader('Content-Type', 'application/json');
		    res.send(JSON.stringify(pathWorldUniverse.getPathWorldNameList()));
		});

app.get('/paths/:worldName', function(req, res)
		{
			console.log("reqeust:worldName"+req.params.worldName);
			var world = pathWorldUniverse.getPathWorld(req.params.worldName);
		    res.setHeader('Content-Type', 'application/json');
		    res.send(JSON.stringify(world.getWorldClientJson()));
		});

app.get('/paths/:worldName/movenode/:moveObject', function(req, res)
		{
			console.log("reqeust:worldName"+req.params.worldName);
			var world = pathWorldUniverse.getPathWorld(req.params.worldName);
			var moveObject = Common.uriToJSON(req.params.moveObject);
			//var updateObject = pathWorldUniverse.getPathWorld(req.params.updateObject);			
			
			console.log("move:world="+world.name+":moveObject="+Common.toString(moveObject));
			
			
			//////////////world.movedNodeUpdateList.push(moveObject);
			moveObject.processTimestamp = new Date().getTime();
			moveObject.updateType = "move";
			
			world.worldUpdateQueueProcessed.push(moveObject);

			world.getNode(moveObject.nodeKey).position.setXY(moveObject.movePosition.x,moveObject.movePosition.y);
			//world.addToWorldUpdateQueue(WorldUpdate.createWorldUpdateFromJson(worldUpdate));
		    res.setHeader('Content-Type', 'application/json');
		    var status = { status:"sucess"};
		    res.send(JSON.stringify(status));
		});

app.get('/paths/:worldName/update/:updateObject', function(req, res)
		{
			console.log("reqeust:worldName"+req.params.worldName);
			var world = pathWorldUniverse.getPathWorld(req.params.worldName);
			var worldUpdate = Common.uriToJSON(req.params.updateObject);
			//var updateObject = pathWorldUniverse.getPathWorld(req.params.updateObject);			
			
			console.log("update:world="+world.name+":updateObject="+Common.toString(worldUpdate));
			world.addToWorldUpdateQueue(WorldUpdate.createWorldUpdateFromJson(worldUpdate));
			res.setHeader('Content-Type', 'application/json');
			var status = { status:"sucess"};
		    res.send(JSON.stringify(status));
		});

app.get('/paths/:worldName/delta/:timeStamp/:numberUpdates', function(req, res)
		{
			var world = pathWorldUniverse.getPathWorld(req.params.worldName);
			var timeStamp = req.params.timeStamp;
			var numberUpdates = req.params.numberUpdates;
			//console.log("reqeust:delta:worldName="+world.name+":timeStamp="+timeStamp+":numberUpdates="+numberUpdates);
			
		    res.setHeader('Content-Type', 'application/json');
		    
		    var worldUpdateArray = world.getWorldUpdatesProcessed(timeStamp,numberUpdates);
		    res.send(JSON.stringify(worldUpdateArray));
		});

