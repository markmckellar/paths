var PathWorld = require('../paths/pathworld');


class PathWorldUniverse
{
	constructor()
	{
		this.pathWorlds = new Object();
	}
	
	draw()
	{
		var pathWorldList = this.getPathWorldList();
		for(var i=0;i<pathWorldList.length;i++)
		{
			var world = pathWorldList[i];
			var date = new Date();
			/*
			console.log("draw:"+date+
				" worldName:"+world.name+
				" #junctions:"+Object.keys(world.junctions).length+
				" #walkers:"+Object.keys(world.walkers).length+
				"");
*/
			world.drawCanvas(date.getTime());
		}
	}
	
	getPathWorld(worldName)
	{
		var world = new Object();
		if(this.doesPathWorldExist(worldName))
		{
			world = this.pathWorlds[worldName];
		}
		return(world);
	}
	
	doesPathWorldExist(worldName)
	{
		return(this.pathWorlds.hasOwnProperty(worldName));
	}
	
	addPathWorld(world)
	{
		this.pathWorlds[world.name] = world;
	}
	
	getPathWorldNameList()
	{
		var pathWorldNameList = new Array();
		var pathWorlds = this.pathWorlds;
		Object.keys(this.pathWorlds).forEach(function (key)
		{
			pathWorldNameList.push(key);
		});
		return(pathWorldNameList);
	}
	
	getPathWorldList()
	{
		var pathWorldList = new Array();
		var pathWorlds = this.pathWorlds;
		Object.keys(this.pathWorlds).forEach(function (key)
		{
			pathWorldList.push(pathWorlds[key]);
		});
		return(pathWorldList);
	}
}

//<js2node>
module.exports = PathWorldUniverse;
console.log("Loading:PathWorldUniverse");
//</js2node>
