var iTunesConnect = require("../"),
	ReportQuery   = iTunesConnect.ReportQuery;

var itunes = new iTunesConnect('', '');


itunes.request(new ReportQuery().timed().time(2, 'week').content(804089146), function(error, result) {
	
	console.log(result);

});

var reportQuery = new ReportQuery({
	limit: 10, 
	start: '2013-01-01', 
	end: '2013-02-01'
}).ranked();



itunes.request(reportQuery, function(error, result) {
	console.log(result);
});

