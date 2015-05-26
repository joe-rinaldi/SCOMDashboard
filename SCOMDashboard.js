/**
 * Module requirements.

http://debugmode.net/2014/03/31/understanding-routing-of-expressjs-in-node-js/
localhost:3000/originhealth/xml/json
http://172.18.110.108:3000/originhealth/xml/json
localhost:3000/originhealth
"C:\Program Files\nodejs\node" SCOMDashBoard.js
L60001073JRIN:3000/originhealth


 */

var express = require('express');
var http = require('http');
//https://www.npmjs.com/package/xml-mapping
var XMLMapping = require('xml-mapping');
var winston = require('winston');

var winston = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: 'debug' }),
        new (winston.transports.File)({ filename: __dirname + 'SCOMDashboard.log', level: 'debug' })
    ]
});


/**
 * Create app.
 */

var app = express();
var server = http.createServer(app);

/**
 * Routes
 */
//http://localhost:3000/SCOMDashboard.html
//http://L60001073JRIN:3000/SCOMDashboard.html
//http://soa040.subaru1.com:3000/SCOMDashboard.html
//links above work in all browsers except chrome ? and ie which is ok
app.use(express.static(__dirname + '/public'));

app.all('*', function(req, res, next) {
  winston.info('app.all requesting url='+req.url);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader("Content-Type", "text/json");
  next();
 });


app.get('/', function (req, res) {
    winston.info('app.get / requesting url='+req.url);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end([' SCOMDashboard id=[id] idRespType=[xml]  reponsetype=[json]'].join(''));
});


app.get('/favicon.ico', function (req, res){
    winston.info('app.get /favicon requesting url='+req.url);
	res.writeHead(200, {'Content-Type': 'image/x-icon'} );
	res.end();
});


app.get('/:xmlurl', function (req, res) {
    winston.info('app.get healthcheck requesting url='+req.url);

	if (!req.params.xmlurl)
	{
		req.params.xmlurl = "empty";
	}
    winston.info('req.params.xmlurl='+req.params.xmlurl);

	res.type('json');
	sendScomJson(req.params.xmlurl,res);
});


var sendScomJson = function(xmlurl,respJson)
{
		var result = "";
		var jsonObj = {};

		if (typeof xmlurl === 'undefined' || typeof xmlurl == 'undefined'  )
		{
			respJson.json(jsonObj);
		    winston.info('skipping ...');
		    return;
		}

		//call url to get xml
		xmlurl = 'http://'+xmlurl;
	    winston.info('xmlurl='+xmlurl);

	    http.get(xmlurl, function(res) {
		  res.on("data", function(chunk) {
			  result += chunk;
  		  });
  		  res.on('end', function(res) {
			  	winston.info('response result='+result);
				//convert xml to json
				//https://www.npmjs.com/package/xml2json
				//http://davidwalsh.name/convert-xml-json
				if (!res || res.statusCode == 200)
				{
					if (result)
					{
						if (result.indexOf("503 Service") > -1)
						{
							  winston.info("skipping xml parse");
						}
						else
						{
							winston.info('converting xml ...');
							//result = result.substring(result.indexOf("<status"),result.length);
							//winston.info('response result='+result);
							jsonObj = XMLMapping.load(result,{ throwErrors : true });
							if (jsonObj)
							{
							  winston.info("jsonObj: " +JSON.stringify(jsonObj), null, " ");
							}
							else
							{
							  winston.info("jsonObj: is empty");
							}
						}
					}
					else
					{
						winston.info("result: is empty");
					}
				}
				else
				{
					winston.info("res.statusCode = "+res.statusCode);
				}
			    winston.info('done');
			    respJson.json(jsonObj);
  		  });
		}).on('error', function(e,res) {
			winston.info("Got error: " + e.message);
			respJson.json(jsonObj);
		});
}


/**
 * Listen
 */

app.listen(3000);
module.exports = winston;


