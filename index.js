//! itc-report.js
//! version : 0.0.1
//! authors : Marek Serafin
//! license : MIT
//! github.com/stoprocent/itc-report

var async 	= require('async');
	request = require('request'),
	cheerio = require('cheerio'),
	moment  = require('moment'),
	fs 		= require('fs'),
	path 	= require('path'),
	_ 		= require('underscore');

/**
* Expose `iTunesConnect`
*/

exports = module.exports = iTunesConnect;

/**
* Expose `ReportQuery`.
*/

exports.ReportQuery = ReportQuery;

/**
* Initialize a new `iTunesConnect` with the given `username`, `password` and `options`.
*
* @param {String} flags
* @param {String} description
* @api public
*/

function iTunesConnect(username, password, options) {
	this._cookies = [];

	this.options = {
		loginURL			: "https://itunesconnect.apple.com",
		apiURL				: "https://reportingitc2.apple.com/api/",
		concurrentRequests	: 3
	};
	_.extend(this.options, options);

	// Task Executor
	this._queue = async.queue(
		this.executeRequest.bind(this), 
		this.options.concurrentRequests
	);
	this._queue.pause();

	this.login(username, password);
}

iTunesConnect.prototype.request = function(query, completed) {
	this._queue.push({query: query, completed: completed});
	return this;
}

iTunesConnect.prototype.executeRequest = function(task, callback) {
	var query = task.query;
	var completed = task.completed;

	console.log(query.body());

	request.post({
		url 	: this.options.apiURL + query.endpoint,
		body 	: query.body(),
		headers	: {
			'Content-Type': 'application/json',
			'Cookie': this._cookies
		}
	}, function(error, response, body) {
		if(response.statusCode == 401) {
			error = new Error('This request requires authentication. Please check your username and password.');
			body  = null;
		}
		else {
			try {
				body = JSON.parse(body);
			} catch (e) {
				error = new Error('There was an error while parsing JSON.');
				body  = null;
			}
		}
		completed(error, body);
		callback();
	})
}

iTunesConnect.prototype.login = function(username, password) {
	var self = this;
	// Request ITC to get fresh post action
	request.get(this.options.loginURL, function(error, response, body) {
		// Handle Errors

		// Search for action attribute
		var html = cheerio.load(body);
		var action = html('form').attr('action');

		// Login to ITC
		request.post({
			url : self.options.loginURL + action, 
			form: {
				'theAccountName' 	: username,
				'theAccountPW'		: password,
				'theAuxValue'		: ""
			}
		}, function(error, response, body) {
			var cookies = response.headers['set-cookie'];
			// Handle Errors
			if(error || !cookies.length) {

			}
			else { 
				// Set Cookies and emit event
				self._cookies = cookies;
				self._queue.resume();
			}
		});
	});
}

function ReportQuery(query) {
	this.type   			= null;
	this.endpoint 			= null;

	this._body = {
		start 		: moment(),
		end 		: moment(),
		interval 	: 'day',
		filters 	: [],
		group 		: null,
		measures	: ['units'],
		limit 		: 100
	};
	// Extend options with user stuff
	_.extend(this._body, query);

	// Private Options
	this._body._time = null;
}

ReportQuery.prototype.body = function() {
	// Ensure date is moment object
	this._body.start = parseToMoment(this._body.start);
	this._body.end = parseToMoment(this._body.end);

	// If start and end date are same and time() was used in query calculate new start date
	if (!this._body.end.diff(this._body.start, 'days') && _.isArray(this._body._time)) {
		this._body.start = this._body.start.subtract(this._body._time[0], this._body._time[1]);
	}

	// Ensure if ranked and group = null set group to default
	if(this.type == 'ranked' && this._body.group == null) {
		this._body.group = 'content';
	}

	// Building body
	var body = {
		"start_date"	: this._body.start.format("YYYY-MM-DD[T00:00:00.000Z]"),
		"end_date"		: this._body.end.format("YYYY-MM-DD[T00:00:00.000Z]"),
		"interval"		: this._body.interval,
		"filters"		: this._body.filters,
		"group"			: this._body.group,
		"measures"		: this._body.measures,
		"limit"			: this._body.limit
	};
	return JSON.stringify(body);
}

ReportQuery.prototype.timed = function() {
	this.type 		= 'timed';
	this.endpoint 	= 'data/timeseries';

	return this;
}

ReportQuery.prototype.ranked = function() {
	this.type 		= 'ranked';
	this.endpoint 	= 'data/ranked';

	return this;
}

ReportQuery.prototype.interval = function(value) {
	this._body.interval = value;
	return this;
}

ReportQuery.prototype.date = function(start, end) {
	this._body.start = parseToMoment( start );
	this._body.end = parseToMoment( ((typeof end == 'undefined') ? start : end) );

	return this;
}

ReportQuery.prototype.time = function(value, unit) {
	this._body._time = [value, unit];
	return this;
}

ReportQuery.prototype.group = function(value) {
	this._body.group = value;
	return this;
}

ReportQuery.prototype.measures = function(value) {
	this._body.measures = value;
	return this;
}

ReportQuery.prototype.limit = function(value) {
	this._body.limit = value;
	return this;
}

ReportQuery.prototype.addFilters = function(dimension, values) {
	if (!_.isArray(values)) {
		values = [values];
	};
	this._body.filters.push({
		dimension_key	: dimension,
		option_keys		: values
	});
}

ReportQuery.prototype.content = function(value) {
	this.addFilters('content', value);
	return this;
}

function parseToMoment(date) {
	// Quick check if moment
	if(moment.isMoment(date)) {
		return date;
	}
	else if(date instanceof Date) {
		return moment(date);
	}
	else if(typeof date === "string" && !!(date.match(new RegExp(/([0-9]{4})-([0-9]{2})-([0-9]{2})/)))) {
		return moment(date, "YYYY-MM-DD");
	} 
	return false;
}