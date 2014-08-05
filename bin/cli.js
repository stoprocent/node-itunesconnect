#!/usr/bin/env node

/**
* Script dependencies.
*/

var program = require('commander'),
	itc 	= require('../'),
	report 	= itc.Report,
	moment 	= require('moment'),
	fs 		= require('fs'),
	path 	= require('path'),
	_ 		= require('underscore');

/**
* Options helpers
*/
var Helpers = {
	cacheFile: path.join( ((process.platform.substr(0, 3) === 'win') ? process.env.HOMEPATH : process.env.HOME),  ".itcreport"),
	translate: {
		inapp: itc.type.inapp,
		app: itc.type.app,

		free: itc.transaction.free,
		paid: itc.transaction.paid,
		redownload: itc.transaction.redownload,
		update: itc.transaction.update,
		refund: itc.transaction.refund,

		desktop: itc.platform.desktop,
		iphone: itc.platform.iphone,
		ipad: itc.platform.ipad,
		ipod: itc.platform.ipod,

		proceeds: itc.measure.proceeds,
		units: itc.measure.units
	}
};

Helpers.collectValues = function (value, collection) {
	// All values are unique so for now its ok to do it this way :()
	if (typeof Helpers.translate[value] !== 'undefined') {
		collection.push(Helpers.translate[value]);
		return collection;
	}
	console.error("\nUknown value: " + value + "\n");
	process.exit(1);
}

Helpers.sinceDate = function(value) {
	if(!!value.match(new RegExp(/([0-9]{4})-([0-9]{2})-([0-9]{2})/))) {
		return value;
	}
	else {
		var descMatch = value.match(new RegExp(/([0-9]+)([a-zA-Z]+)/));
		if(!!descMatch)
			return moment().subtract(descMatch[1], descMatch[2]).format('YYYY-MM-DD');
	}
	return false;
}

Helpers.configFile = function(value) {
	var configFile = path.resolve(value);
	if(fs.existsSync(configFile)) {
		var config = fs.readFileSync(configFile, {encoding: 'utf8'});
		return JSON.parse(config);
	}
	else {
		console.error("\nConfig file does not exist at path: " + configFile + "\n");
		process.exit(1);
	}
}

Helpers.processRequestResponse = function(error, result, outputfile) {
	if(error) {
		console.error("\n" + error + "\n");
		process.exit(1);
	}
	if (outputfile === undefined) { 
		console.log(JSON.stringify(result, null, 4));
	}
	else {
		var outputFile = path.resolve(outputfile);
		fs.writeFile(outputFile, JSON.stringify(result), function(error) {
			if(error) {
				console.error("\n" + error + "\n");
				process.exit(1);
			}
		});
	}
}

Helpers.request = function(p, call) {
	var options = {
		loginCallback: function(cookies) {
			fs.writeFile(Helpers.cacheFile, JSON.stringify({
				cookies: cookies, 
				expire: moment().add(p.cachetime, 'seconds')
			}));
		}
	};
	// Requesting Cookies
	if(fs.existsSync(Helpers.cacheFile) && p.forcelogin === undefined && !!p.username && !!p.password) {
		var cachedContent = fs.readFileSync(Helpers.cacheFile, {
			encoding: 'utf8'
		});
		var cache = JSON.parse(cachedContent);

		if(moment().diff(cache.expire, 'minutes') < 0) {
			options.cookies = cache.cookies;
		}
	}
	// Create itunes object
	var itunes = new itc.Connect(p.username, p.password, options);
	// Run callback
	call(itunes);
}

/**
* Config base
*/

var Config = {
	filters: {}
};

/**
* Config File Template
*/

var ConfigFileTemplate = '{\n\
//     "cachetime"      : 1800,\n\
     "username"       : "",\n\
     "password"       : "",\n\
//     "since"          : "",\n\
//     "date"           : "",\n\
//     "group"          : "content",\n\
//     "content"        : [],\n\
//     "location"       : [],\n\
//     "category"       : [],\n\
//     "platform"       : [],\n\
//     "transaction"    : [],\n\
//     "type"           : [],\n\
//     "measure"        : "units",\n\
//     "outputfile"     : ""\n\
}';

/**
* Setup program
*/

program
	.version('0.0.1')
	// Tool options
	.option('-c, --config <filename>', 'Specify config file', Helpers.configFile, "")
	.option('-h, --cachetime <seconds>', 'Specify cache time for session cookies. Defaulting to 1800.', 1800)
	.option('-f, --forcelogin', 'Will ignore cached cookies and re-login.', null, false)
	// Login
	.option('-u, --username <username>', 'iTunes Connect Username (Apple ID)')
	.option('-p, --password <password>', 'iTunes Connect Password')
	// Date options
	.option('-s, --since <since>', 'Specify since date. You can use format YYYY-MM-DD or simply 1day, 3months, 5weeks, 2years ...', Helpers.sinceDate, false)
	.option('-d, --date <date>', 'Specify date (YYYY-MM-DD) Defaulting to today.', moment().format('YYYY-MM-DD'))
	// Group
	.option('-g, --group <group>', 'Group results by one of the following: ')
	// Filters
	.option('-A, --content <contentid>', 'Filter by Content ID. [Repeatable value]', Helpers.collectValues, [])
	.option('-L, --location <location>', 'Filter by Location. Visit https://github.com/stoprocent/itc-report/wiki/Cheet-Sheet#countries for available options. [Repeatable value]', Helpers.collectValues, [])
	.option('-C, --category <category>', 'Filter by Category. Visit https://github.com/stoprocent/itc-report/wiki/Cheet-Sheet#categories for available options. [Repeatable value]', Helpers.collectValues, [])
	.option('-P, --platform <platform>', 'Filter by Platform. [Repeatable value]', Helpers.collectValues, [])
	.option('-T, --transaction <transaction>', 'Filter by Transaction Type (call "reportingitc options transaction" to see all options). [Repeatable value]', Helpers.collectValues, [])
	.option('-t, --type', 'Filter by Content Type. [Repeatable value]')
	// Result
	.option('-M, --measure <measure>', 'Result measures (units, proceeds). Defaulting to units. [Repeatable value]', Helpers.collectValues, ['units'])
	// Output
	.option('-o, --outputfile <filename>', 'Output file name. Will be saved as json.')
	// Config
	.on("config", function() {
		_.extend(program, program.config);
	})
	.on("since", function() {
		Config.start = program.since;
	})
	.on("date", function() {
		Config.end = program.date;
	})
	.on("group", function() {
		Config.group = program.group;
	})
	.on("content", function() {
		Config.filters.content = program.content;
	})
	.on("location", function() {
		Config.filters.location = program.location;
	})
	.on("category", function() {
		Config.filters.category = program.category;
	})
	.on("platform", function() {
		Config.filters.platform = program.platform;
	})
	.on("transaction", function() {
		Config.filters.transaction = program.transaction;
	})
	.on("type", function() {
		Config.filters.type = program.type;
	})
	.on("measure", function() {
		Config.measures = program.measure;
	});

// Command create-config
program
	.command('create-config <filename>')
	.description('Creates new config file <filename>')
	.usage('report.json -> this will create config file named report.json')
	.action(function(filename, options) {
		var configFile = path.resolve(filename);
		fs.writeFile(configFile, ConfigFileTemplate, function(err) {
			if(err)
				console.error(err);
			else
				console.log("\nConfig file was created at: " + configFile + "\n");
		});
	});

// Command ranked
program
	.command('ranked')
	.description('Ranked report ')
	.option('-l, --limit <limit>', 'Specify results limit. Defaulting to 100', 100)
	.action(function(options) {
		Helpers.request(program, function(itunes) {
			// add Limit
			Config.limit = options.limit;
			// Query
			var query = report.ranked(Config);
			// Request
			itunes.request(query, function(error, result, query) {
				Helpers.processRequestResponse(error, result, program.outputfile);
			});
		});
	});

// Command timed
program
	.command('timed')
	.description('Timed report')
	.option('-i, --interval <interval>', 'Specify date interval (day, week, month, quarter, year). Defaulting to day', 'day')
	.action(function(options) {
		Helpers.request(program, function(itunes) {
			// add interval
			Config.interval = options.interval;
			// Query
			var query = report.timed(Config);
			// Request
			itunes.request(query, function(error, result, query) {
				Helpers.processRequestResponse(error, result, program.outputfile);
			});
		});
	});

// Go go go ...
program.parse(process.argv);
