var mapApple = function(){ 
	emit({company: "Apple"}, {sd: this.value.sd});
}

var mapGoogle = function(){ 
	emit({company: "Google"}, {sd: this.value.sd});
}

var mapFacebook = function(){ 
	emit({company: "Facebook"}, {sd: this.value.sd});
}

var reduce = function(key, values){
	return {sd: values.reduce(function(x, y){return x.concat(y.sd);}, [])};
}

var finalize = function(key, value){
	var variance_sum = 0;	
	for(var i = 0; i < value.sd.length; i++){
		variance_sum += Math.pow(value.sd[i], 2);
	}
	value.average_sd = Math.sqrt(variance_sum / value.sd.length);
	return value;
}

resultsaapl = db.runCommand({
	mapReduce: 'aapl.report',
	map: mapApple,
	reduce: reduce,
	finalize: finalize,
	out: 'aapl.sd'
})

resultsgoog = db.runCommand({
	mapReduce: 'goog.report',
	map: mapGoogle,
	reduce: reduce,
	finalize: finalize,
	out: 'goog.sd'
})

resultsfb = db.runCommand({
	mapReduce: 'fb.report',
	map: mapFacebook,
	reduce: reduce,
	finalize: finalize,
	out: 'fb.sd'
})
