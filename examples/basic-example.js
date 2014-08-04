var iTunesConnect 	= require("../"),
	ReportQuery   	= iTunesConnect.ReportQuery;
	Constants 		= iTunesConnect.Constants;

// Connect to iTunes
var itunes = new iTunesConnect('apple@id.com', 'password');

// Simple ranked report
itunes.request(ReportQuery.ranked().time(10, 'days'), function(error, result) {
	console.log(result);
});

// More complex query
var advancedQuery = ReportQuery('timed', {
	start 	: '2014-01-10',
	end 	: '2014-08-01',
	limit 	: 100,
	filters : {
		transaction: Constants.Free,
		type: [
			Constants.InApp, 
			Constants.App
		]
	},
	group: 'content'
});

itunes.request(advancedQuery, function(error, result) {
	console.log(result);
});

