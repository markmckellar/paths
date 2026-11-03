////////////////////////////////////////////
// WorldUpdate
//////////////////////////////////////////////
class PedigreeUpdate
{
	constructor(junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo)
	{
		WorldUpdate.createWorldUpdate(this,junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo);
	}
	
	static createWorldUpdateFromJson(json)
	{
		var worldUpdate = new WorldUpdate(
				json.junctionName,
				json.walkerName,
				json.processTimestamp,
				json.walkerInfo,
				json.junctionInfo,
				json.pathInfo);
		return(worldUpdate);
	}
		
	static createWorldUpdate(worldUpdate,junctionName,walkerName,processTimestamp,walkerInfo,junctionInfo,pathInfo)
	{
		worldUpdate.junctionName = junctionName;
		worldUpdate.walkerName = walkerName;
		worldUpdate.processTimestamp = processTimestamp;
		worldUpdate.walkerInfo = walkerInfo;
		worldUpdate.junctionInfo = junctionInfo;
		worldUpdate.pathInfo = pathInfo;
		worldUpdate.updateType = "junction";

	}
	
	readyToBeProcessed (timestamp)
	{
		return( (this.processTimestamp<=timestamp) );
		//return(  (this.getDate().getTime()<=timestamp)  );
	}
	
	xgetDate()
	{
		return(new Date(this.processTimestamp*1000));
	}
}

//<js2node>
module.exports = PedigreeUpdate;
console.log("Loading:PedigreeUpdate");
//</js2node>
