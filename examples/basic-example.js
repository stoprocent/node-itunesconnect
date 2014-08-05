var itc 	= require("../"),
	Report  = itc.Report;

// Connect to iTunes
var itunesconnect = new itc.Connect('apple@id.com', 'password');

// Simple ranked report
itunesconnect.request(Report.ranked().time(10, 'days'), function(error, result) {
	console.log(result);
});

// More complex query
var advancedQuery = Report('timed', {
	limit 	: 100,
	filters : {
		type: [
			itc.Type.InApp,
			itc.Type.App
		]
	},
	group: 'content'
}).time(2, 'days');

itunes.request(advancedQuery, function(error, result) {
	console.log(result);
});

