class Common
{
	constructor(values)
	{
		this.values = values;
		console.log("101");
	}
	
	static inheritsFrom(child, parent)
	{
	    child.prototype = Object.create(parent.prototype);
	}
	
	static getTimeKey()
	{
		var uid = (new Date().getTime()).toString(36);
		return(uid);
	}

	static  jsonToURI(json){ return encodeURIComponent(JSON.stringify(json)); }

	static uriToJSON(urijson){ return JSON.parse(decodeURIComponent(urijson)); }

	static stringifyCommon(obj, replacer, spaces, cycleReplacer)
	{
	  return JSON.stringify(obj, this.serializerCommon(replacer, cycleReplacer), spaces)
	}

	static getDayOfWeek(date)
	{   
	    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][ date.getDay() ];
	};
	
	test(test)
	{
		console.log("Common:test:"+test);
	}

	static serializerCommon(replacer, cycleReplacer)
	{
	  var stack = [], keys = []

	  if (cycleReplacer == null) cycleReplacer = function(key, value) {
	    if (stack[0] === value) return "[Circular ~]"
	    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
	  }

	  return function(key, value) {
	    if (stack.length > 0) {
	      var thisPos = stack.indexOf(this)
	      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
	      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
	      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
	    }
	    else stack.push(value)

	    return replacer == null ? value : replacer.call(this, key, value)
	  }
	}

	static getColorFromString(colorString)
	{
		var transparency = 1.0;
		if(colorString.length==6)
		{
			colorString += "ff";
		}
		
		var color = "rgba("+
				parseInt(colorString.substring(0,2), 16)+","+
				parseInt(colorString.substring(2,4), 16)+","+
				parseInt(colorString.substring(4,6), 16)+","+
				parseInt(colorString.substring(6,8), 16)/255.0+")";
		
		return(color);
	}

	static logInsertArray(array,printValueFunction)
	{
		for(var i=0;i<array.length;i++)
		{
			console.log("i="+printValueFunction(array[i]));
		}
	}	
	
	static insertIntoArray(toInsert,array,position)
	{
		array.splice(position,0,toInsert);
	}	
	
	static shuffleArray(array)
	{
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}

	static removeItemFromArray(array,item)
	{
		var index = array.indexOf(item);
		if (index > -1)
		{
		    array.splice(index, 1);
		}
	}
	
	static toString(object)
	{
		return(JSON.stringify(object));
	}
}


//<js2node>
module.exports = Common;
console.log("Loading:Common");
//</js2node>
