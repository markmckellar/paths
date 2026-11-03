class ElapsedTime
{
	constructor()
	{
		this.timers = new Object();
	}

	startTimer(timerName)
	{
		this.timers[timerName] = new Date();
	}

	startTimerLog(timerName)
	{
		this.startTimer(timerName);
		console.log("ElapsedTime:"+timerName+":started:"+this.timers[timerName]);
	}

	elaspedTime(timerName)
	{
		var elasped = new Date().getTime();
		var start = this.timers[timerName];
		elasped = elasped-start.getTime();
		return(elasped)
	}

	elaspedTimeLog(timerName)
	{
		console.log("ElapsedTime:elapsed="+timerName+":"+this.elaspedTime(timerName));
	}
}


//<js2node>
module.exports = ElapsedTime;
console.log("Loading:ElapsedTime");
//</js2node>
