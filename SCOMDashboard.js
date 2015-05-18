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

var scom_urls = {
	'originhealth': 			{url:'http://origin-www.subaru.com/health/report.xml',health:'grey'},
	'soa-110':					{url:'',health:'grey'},
	'soa-110-health':			{url:'http://scom-110.prod.subaru.com/server-status',health:'grey'},
	'soa-110-scom':				{url:'',health:'grey'},
	'soa-110-scom-health':		{url:'http://scom-110.prod.subaru.com/health/report.xml',health:'grey'},
	'soa-110-scom2':			{url:'',health:'grey'},
	'soa-110-scom2-health':		{url:'http://scom2-110.prod.subaru.com/health/report.xml',health:'grey'},
	'soa-110-webadmin':			{url:'',health:'grey'},
	'soa-110-webadmin-health':	{url:'http://webadmin.subarunet.com/health/report.xml',health:'grey'},
	'soa-109':					{url:'',health:'grey'},
	'soa-109-health':			{url:'http://scom-109.prod.subaru.com/server-status',health:'grey'},
	'soa-109-scom':				{url:'',health:'grey'},
	'soa-109-scom-health':		{url:'http://scom-109.prod.subaru.com/health/report.xml',health:'grey'},
	'soa-109-scom2':			{url:'',health:'grey'},
	'soa-109-scom2-health':		{url:'http://scom2-109.prod.subaru.com/health/report.xml',health:'grey'},
	'soa-109-webadmin':			{url:'',health:'grey'},
	'soa-109-webadmin-health':	{url:'http://webadmin.subarunet.com/health/report.xml',health:'grey'},
	'soa014-mysubaru':			{url:'',health:'grey'},
	'soa014-mysubaru-health':	{url:'http://www.qa.mysubaru.com/health/report.xml',health:'grey'},
	'soa-117-mysubaru':			{url:'',health:'grey'},
	'soa-117-mysubaru-health':	{url:'http://preprod.mysubaru.com/health/report.xml',health:'grey'},
	'soa-118-mysubaru':			{url:'',health:'grey'},
	'soa-118-mysubaru-health':	{url:'http://preprod.mysubaru.com/health/report.xml',health:'grey'},
	'soa050-webadmin':			{url:'',health:'grey'},
	'soa050-webadmin-health':	{url:'http://webadmin.qa.subarunet.com/health/report.xml',health:'grey'}
	};


/**
 * Create app.
 */

var app = express();
var server = http.createServer(app);

/**
 * Routes
 */

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader("Content-Type", "text/json");
  winston.info('in app.all');
  next();
 });

app.get('/', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end([' SCOMDashboard id=[id] idRespType=[xml]  reponsetype=[json]'].join(''));
    winston.info('in root request');
});


app.get('/favicon.ico', function (req, res){
	res.writeHead(200, {'Content-Type': 'image/x-icon'} );
	res.end();
    winston.info('favicon requested');
});



app.get('/:id/:idRespType?/:respType?', function (req, res) {
	if (!req.params.id)
	{
		req.params.id = "originhealth";
	}
    winston.info('req.params.id='+req.params.id);

	if (!req.params.idRespType)
	{
		req.params.idRespType = "xml";
	}
    winston.info('req.params.idRespType='+req.params.idRespType);

	if (!req.params.respType)
	{
		req.params.respType = "json";
	}
    winston.info('req.params.respType='+req.params.respType);

	res.type('json');
	sendScomJson(req.params.id,res);
});

var sendScomJson = function(id,respJson)
{
		var result = "";
		var jsonObj = {};

		if (typeof id === 'undefined' || typeof scom_urls[id] == 'undefined' || !scom_urls[id].url )
		{
			respJson.json(jsonObj);
		    winston.info('skipping ...');
		    return;
		}

		//call url to get xml
	    winston.info('id.url='+scom_urls[id].url);

	    http.get(scom_urls[id].url, function(res) {
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


