var InaGraphPathWorldDef = require('../../pathsexp/inagraph/inagraphpathworlddef');
var Common = require('../../common/common');
var WorldUpdate = require('../../paths/worldupdate');
var PushWorldUpdate = require('../../pathsexp/pathserver/pushworldupdate');
var worldDef = new InaGraphPathWorldDef();		
var port = worldDef.getWorldDefaults().port;


class PushInaTestStandAlone {

	constructor()
	{
		console.log("Got new PushInaTestStandAlone");
	}

	initCustomNodes(world)
	{
		var pathArray = this.getPathArray();
		
		var now = new Date().getTime();
		
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

				//var pushWorldUpdate = new PushWorldUpdate();
				world.addToWorldUpdateQueue(WorldUpdate.createWorldUpdateFromJson(worldUpdate));

				//pushWorldUpdate.sendToServer(worldUpdate);
				
			}
		}
	}

	getPathArray()
	{
		var allPathArray = [];
		for(var i=0;i<worldDef.pathDefs.length;i++)
		{
			var pathDef = worldDef.pathDefs[i]; 
			for(var nodeLoop=0;nodeLoop<pathDef.numberNodes;nodeLoop++)
			{
				var pathArray = [];
				for(var j=0;j<pathDef.path.length;j++)
				{
					var pathName = pathDef.path[j];
					var pathDefName = pathDef.pathDefName;
					//console.log("   doing pathDefName="+pathDefName+" pathName="+pathName);
					for(var k=0;k<worldDef.pathParts[pathName].length;k++)
					{
						//console.log("               junction="+pathParts[pathName][k]);
						pathArray.push(worldDef.pathParts[pathName][k]);
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
}

//<js2node>
module.exports = PushInaTestStandAlone;
console.log("Loading:PushInaTestStandAlone");
//</js2node>
