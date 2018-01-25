
var Common = require('../../common/common');
var http = require('http');


class PushWorldUpdate
{
	constructor(canvasHolder)
	{
	}
	
	sendToServer(worldUpdate)
	{	
		var options =
		{
  			host: '127.0.0.1',
  			port : 3000,
  			path: '/paths/myCanvas/update/'
		};
		
		var encodedWorldUpdate = Common.jsonToURI(worldUpdate);
		console.log("sending : "+encodedWorldUpdate);
		options.path += encodedWorldUpdate;
		http.request(options,
			function(response)
			{
				var self = this;
			  	var str = '';
			
			  	//another chunk of data has been recieved, so append it to `str`
			  	response.on('data', function (chunk)
			  	{
			    	str += chunk;
			  	});
			
			  	//the whole response has been recieved, so we just print it out here
			  	response.on('end', function ()
				{
				  	console.log(str);
				});
			}).end();
	}
	
}


//<js2node>
module.exports = PushWorldUpdate;
console.log("Loading:PushWorldUpdate");
//</js2node>