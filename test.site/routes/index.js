var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var candlechart = require('../charts/candlestickchart.json');  
var linechart = require('../charts/linechart.json');  
var sdchart = require('../charts/sdchart.json');  
var volumechart = require('../charts/volumechart.json');  
var clone = require('clone');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CS129.1 Database Project' });
});

router.get('/graphFb', function(req, res) {
	toGraph('fb', req, res);				
});

router.get('/graphGoog', function(req, res) {
	toGraph('goog', req, res);				
});

router.get('/graphAapl', function(req, res) {
	toGraph('aapl', req, res);				
});

toGraph = function(dbname, req, res) {
	var client = mongodb.MongoClient;
	var url = 'mongodb://localhost:27011/stocks?slaveOk=true';
	var toGraphCandlesticks = [];
	var toGraphAverage = [];
	var toGraphSDUpperBound = [];
	var toGraphSDLowerBound = [];
	var toGraphVolume = [];
	var toGraphClose = [];
	var SD = [];
	var toLabelxAxis = [];
	var toLabelxxAxis = [];

	var chartcandleOptions = clone(candlechart);
	var chartlineOptions = clone(linechart);
	var chartsdOptions = clone(sdchart);
	var chartvolumeOptions = clone(volumechart);

	chartcandleOptions.title.text = "Stock Data";
	chartlineOptions.title.text = "Summary";
	chartsdOptions.title.text = "Standard Deviation";
	chartvolumeOptions.title.text = "Volume";

		
	client.connect(url, function(err,db){
		if(err){
			console.log('Unable to connect');
		} else {
			console.log('Connected successfully to database');
			var collection = db.collection(dbname);
			console.log('Accessing collection ' + dbname);
			collection.find({}).forEach(function(u){
				toGraphCandlesticks.unshift([u.open, u.close, u.low, u.high]);
				toGraphClose.unshift(u.adj_close);
				toGraphVolume.unshift(u.volume);
				toLabelxAxis.unshift(u.date);
				}); 

			chartcandleOptions.series[0].data = toGraphCandlesticks;
			chartcandleOptions.series[1].data = toGraphClose;
			chartvolumeOptions.series[0].data = toGraphVolume;
			;

			chartcandleOptions.xAxis[0].data = toLabelxAxis;
			chartvolumeOptions.xAxis[0].data = toLabelxAxis;


			var report = db.collection(dbname +'.report');
			console.log('Accessing collection '+ dbname + '.report');
			report.find({}).forEach(function(u){
				toGraphAverage.push(u.value.average);
				SD.push(u.value.sd);
				toGraphSDUpperBound.push(u.value.average + u.value.sd);
				toGraphSDLowerBound.push(u.value.average - u.value.sd);
				toLabelxxAxis.push(u._id.month);
				}); 


			chartlineOptions.series[0].data = toGraphSDLowerBound;
			chartlineOptions.series[1].data = toGraphSDUpperBound;
			chartlineOptions.series[2].data = toGraphAverage;
			chartsdOptions.series[0].data = SD;
			chartlineOptions.xAxis[0].data = toLabelxxAxis;
			chartsdOptions.xAxis[0].data = toLabelxxAxis;

			collection.find({}).toArray(function(err,result){
				if(err){
					res.send(err)
				} else if (result.length){
					res.render('graph', {
						data: result, 
						dataindex: toGraphCandlesticks, 
						title: dbname.toUpperCase() + ' Stocks Graph', 
						chartlinedata: JSON.stringify(chartlineOptions), 
						chartcandledata: JSON.stringify(chartcandleOptions),
						chartvolumedata: JSON.stringify(chartvolumeOptions), 
						chartsddata: JSON.stringify(chartsdOptions),
					});
				} else {
					res.send('No documents found');
				}
			db.close();

		});
	

		}
	});				
};



module.exports = router;