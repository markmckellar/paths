var http = require('http');
var Common = require('../../common/common');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options =
{
  host: '127.0.0.1',
  port : 3000,
  path: '/paths/myCanvas/update/'
};

callback = function(response)
{
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function ()
		  {
	  		dataDone(str);
		  });
}

function dataDone(data)
{
	console.log(data);
}
var worldUpdate = 
	{
		  "junctionName": "TEST1",
		  "walkerName": "testing.1",
		  "processTimestamp": 1493322875.199,
		  "walkerInfo": {
		    "waklerName": "testing.1",
		    "walkerTypeKey": "testing"
		  },
		  "junctionInfo": {
		    "junctionName": "TEST1",
		    "junctionTypeKey": "genericJunction"
		  },
		  "pathInfo": {
		    "pathTypeKey": "generic"
		  }
		};
var encodedWorldUpdate = Common.jsonToURI(worldUpdate);
console.log("sending : "+encodedWorldUpdate);
options.path += encodedWorldUpdate;

http.request(options, callback).end();
