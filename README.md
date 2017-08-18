# This package is deprecated
I've created this npm mainly for fun to display some stats on a dashboard at my work. 
I didnt plan to support it as it was fine for what is was create for.
I didn't update `node-itunesconnect` in very long time so this package is now deprecated.
I will let it be here but **Issues** are now closed.

### For anyone interested there is a better and still maintained version of similar tool here: https://github.com/JanHalozan/iTunesConnectAnalytics

# itunesconnect

 [![Build Status](https://travis-ci.org/stoprocent/node-itunesconnect.svg?branch=master)](https://travis-ci.org/stoprocent/node-itunesconnect)

 itunesconnect is [node.js](http://nodejs.org) module wrapping iTunes Connect Reporting API. It allows to query sales/downloads reports in super easy way.

## Installation

    $ npm install itunesconnect

 If you want to have and access to comman-line tool **`itcreport`** install itunesconnect globally. See [more info](#itcreport) about **`itcreport`**.

    $ npm install itunesconnect -g
    $ itcreport --help

## About reports

 There are 2 different report types, `ranked` and `timed`. 
 
 Ranked report is sorted by number of downloads and it can be filtered and grouped by one of the [constants](#constants). Ranked report result contains just a number of sales and/or proceeds regardless of time frame. Ranked  is also ignoring `interval` option. Good use case for ranked report is to get summary of sales and/or proceeds in some time period. You can also use `filters` and `group` to make your query more advanced.
 
 Timed report result is a little bit more detailed. It's not sorted by number of sales or proceeds. It's embedding objects with number of sales grouped by `interval` option. You should understand it more looking at the examples below. 
 
 It's hard to fuly understand Apple API without documentation so my description might have some errors. I strongly recommend to play with queries and results and try to understand different types. If you also want to improove description feel free to do so.

## Basic example

This example shows how to fetch ranked report data from last 10 days and timed report from last 3 weeks with `week` interval.

 **Query:**

```js
var itc = require("itunesconnect");
var Report = itc.Report;

// Connect to iTunes
var itunes = new itc.Connect('apple@id.com', 'password');

// Simple ranked report
itunes.request(Report.ranked().time(10, 'days'), function(error, result) {
    console.log(result);
});

// Or
itunes.request(Report('timed').time(3, 'weeks').interval('week'), function(error, result) {
    console.log(result);
});
```

 **Result (ranked):**

```json
[
  {
    "key": 0,
    "title": "App Name ",
    "rptgDesc": "App",
    "contentSpecificTypeId": 1,
    "contentSpecificTypeName": "iOS App",
    "contentGrpCd": "Apps",
    "contentProviderId": 0,
    "artistName": "Artist Name",
    "contentProviderName": "Provider Name",
    "units": 7684
  },
  {
    "key": 0,
    "title": "In App Name ...",
    "rptgDesc": "In App",
    "contentSpecificTypeId": 3,
    "contentSpecificTypeName": "Auto-Renewable Subscription",
    "contentGrpCd": "Apps",
    "contentProviderId": 0,
    "contentProviderName": "Provider Name",
    "units": 2886
  }

  ...

]
```

 **Result (timed):**
 
 Default group for timed report is null so it contains just all downloads. 
 
```json
 [
    {
        "data": [
            {
                "date": "2014-07-14T00:00:00.000Z",
                "units": 1234567
            },
            {
                "date": "2014-07-21T00:00:00.000Z",
                "units": 2345
            },
            {
                "date": "2014-07-28T00:00:00.000Z",
                "units": 987
            },
            {
                "date": "2014-08-04T00:00:00.000Z",
                "units": 456789
            }
        ]
    }
]
```

 **Query (timed) grouped by location:**

```js
var itc = require("itunesconnect");
var Report = itc.Report;

// Connect to iTunes
var itunes = new itc.Connect('apple@id.com', 'password');

// Or
itunes.request(Report('timed').time(3, 'weeks').interval('week').group('location'), function(error, result) {
    console.log(result);
});
```

 **Result (timed) grouped by location:**

```json
[
   {
        "metadata": {
            "key": "143461",
            "title": "New Zealand",
            "parent_key": "-100004"
        },
        "data": [
            {
                "date": "2014-07-14T00:00:00.000Z",
                "units": 3
            },
            {
                "date": "2014-07-28T00:00:00.000Z",
                "units": 2
            }
        ]
    },
    {
        "metadata": {
            "key": "143465",
            "title": "China",
            "parent_key": "-100004"
        },
        "data": [
            {
                "date": "2014-07-14T00:00:00.000Z",
                "units": 9
            },
            {
                "date": "2014-07-21T00:00:00.000Z",
                "units": 18
            },
            {
                "date": "2014-07-28T00:00:00.000Z",
                "units": 15
            },
            {
                "date": "2014-08-04T00:00:00.000Z",
                "units": 7
            }
        ]
    },
    
    ...
]
```

## More complex query

This example shows how to fetch ranked report data from last 2 days, both app sales and in-app sales with one of provided categories, grouped by content and returning both sales and proceeds (Moooooooooney). 

**Please note that limit property apply just to ranked reports**

```js
var itc = require("itunesconnect");
var Report = itc.Report;

// Connect to iTunes
var itunes = new itc.Connect('apple@id.com', 'password');

// More complex query
var query = Report('ranked', {
	limit 	: 100,
	filters : {
		type: [
			itc.type.inapp,
			itc.type.app
		],
		category: [6001,6002,6003]
	},
	group: 'content', // content is default group for ranked report so you dont have to use it here
	measures: [itc.measure.units, itc.measure.proceeds]
}).time(2, 'days');

itunes.request(query, function(error, result) {
	console.log(result);
});
```

**Same query in chainable way**

```js
var query = Report
    .ranked()
    .time(2,'days')
    .limit(100)
    .category([6001,6002,6003])
    .group('content') 
    .type([itc.type.inapp, itc.type.app])
    .measures( [itc.measure.units, itc.measure.proceeds]);
```

# Connect Class
Please also reffer to [Connect](http://stoprocent.github.io/node-itunesconnect/docs/classes/Connect.html) class docs.

```
Connect(<username>, <password>, [options]) 
```

Available options:
```js
options.concurrentRequests	= Number
options.errorCallback	 	= Function //function(error) {}
options.loginCallback	 	= Function //function(cookies) {}
options.cookies             = Array
```

If you want to cache login cookies use loginCallback and set cookies option

**Please note that cookies have expiration date**
```js
var itc = require("itunesconnect");

var options = {
    loginCallback: function(cookies) {
        redis.set("cache-cookies", cookies);    
    }
}

redis.get("cache-cookies", function (err, cookies) {
    if(!err) options.cookies = cookies;
});

// Connect to iTunes
var itunes = new itc.Connect('apple@id.com', 'password', options);

```

# Query Class
Please also reffer to [Query](http://stoprocent.github.io/node-itunesconnect/docs/classes/Query.html) class docs.

**To create new Query class instance please use [Report](http://stoprocent.github.io/node-itunesconnect/docs/classes/Report.html) helper functions.**

```
Report(<type>, [config])
Report.ranked([config])
Report.timed([config])
```

Config Object:

```js
config.start 		   	    = String|Date // (Date or if String must be in format YYYY-MM-DD)
config.end 			 	    = String|Date // (Date or if String must be in format YYYY-MM-DD)
config.interval 			= String // (Available values: day,week,month,quarter,year)
config.filters.content 	    = Number|Array // (Content ID / Application ID)
config.filters.type 		= String|Array // (Please refer to constants below)
config.filters.transaction  = String|Array // (Please refer to constants below)
config.filters.category 	= Number|Array // (Visit Cheet-Sheet#categories for available options)
config.filters.platform 	= String|Array // (Please refer to constants below)
config.filters.location 	= Number|Array // (Visit Cheet-Sheet#countries for available options)
config.group 		   	    = String // (Available values: content,type,transaction,category,platform,location)
config.measures 			= Array // (Please refer to constants below)
config.limit 		   	    = Number
```

### Constants

```js
// Import itunesconnect
var itc = require("itunesconnect"),

// Types
itc.type.inapp 
itc.type.app 

// Transactions
itc.transaction.free
itc.transaction.paid
itc.transaction.redownload
itc.transaction.update
itc.transaction.refund

// Platforms
itc.platform.desktop
itc.platform.iphone
itc.platform.ipad
itc.platform.ipod

// Measures
itc.measure.proceeds
itc.measure.units
```

# Query Class Methods

## query.date

Example:

```js
// Start and end date set manualy
query.date('2014-04-08', new Date());

// Start and end date will be todays date
query.date(new Date());

// Start and end date will be set as 8th of April 2014
query.date('2014-04-08');

// End date will be set as 8th of April 2014 and start as 8th of Jan 2014
query.date('2014-04-08').time('3', 'months');
```

## query.time

```js
// Start date will be set to 10 weeks from today
query.time(10, 'weeks');

// End date will be set as 8th of April 2014 and start as 8th of Jan 2014
query.date('2014-04-08').time('3', 'months');
```

## query.group

Available options:
 * content
 * type
 * transaction
 * category
 * platform
 * location

*Ranked report default is `content`. Timed report default is `null`*

```js
query.group('transaction');
```

## query.interval

Available options:
 * day
 * week
 * month
 * quarter
 * year

*Ranked report is ignoring this.*

```js
query.interval('day');
```

## query.limit

*Ranked report default is 100. Timed report is ignoring this.*

```js
query.limit(100);
```

## query.measures

*See [Constants](#constants) for available options*

```js
query.measures(itc.measure.units);
query.measures([itc.measure.units, itc.measure.proceeds]);
```

# Filter Medthods

*All filter methods take one parameter Value or Array of Values*

## query.content

*Content is taking Number or Array of Number (Application ID).*

```js
query.content(1);
query.content([1, 2]);
query.content([1, 2]).content(3);
```

## query.category

*Visit [Categories Cheet-Sheet](https://github.com/stoprocent/itc-report/wiki/Cheet-Sheet#categories) wiki page for available options*

```js
query.category(6001);
query.category([6002, 6003]);
query.category([6001, 6002]).category(6003);
```

## query.location

*Visit [Locations Cheet-Sheet](https://github.com/stoprocent/itc-report/wiki/Cheet-Sheet#countries) wiki page for available options*

```js
query.location(6001);
query.location([6002, 6003]);
query.location([6001, 6002]).location(6003);
```

## query.platform

*See [Constants](#constants) for available options*

```js
query.platform(itc.platform.desktop);
query.platform([itc.platform.desktop, itc.platform.ipad]).platform(itc.platform.ipod);
```

## query.transaction

*See [Constants](#constants) for available options*

```js
query.transaction(itc.transaction.free);
query.transaction([itc.transaction.free, itc.transaction.paid]).transaction(itc.transaction.refund);
```

## query.type 

*See [Constants](#constants) for available options*

```js
query.type(itc.type.app);
query.type([itc.type.inapp, itc.type.app]);
```

# itcreport

*Command-Line tool to get report results from console. It can output result to console or to to json file.* 

**I strongly recommend to put username and password in config file so its not in bash history**

```
$ itcreport --help

  Usage: itcreport [options] [command]

  Commands:

    create-config <filename>
       Creates new config file <filename>
    
    ranked [options] 
       Ranked report 
    
    timed [options] 
       Timed report
    

  Options:

    -h, --help                       output usage information
    -V, --version                    output the version number
    -c, --config <filename>          Specify config file
    -h, --cachetime <seconds>        Specify cache time for session cookies. Defaulting to 1800.
    -f, --forcelogin                 Will ignore cached cookies and re-login.
    -u, --username <username>        iTunes Connect Username (Apple ID)
    -p, --password <password>        iTunes Connect Password
    -s, --since <since>              Specify since date. You can use format YYYY-MM-DD or simply 1day ...
    -d, --date <date>                Specify date (YYYY-MM-DD) Defaulting to today.
    -g, --group <group>              Group results by one of the following: 
    -A, --content <contentid>        Filter by Content ID. [Repeatable value]
    -L, --location <location>        Filter by Location. Visit (...) for available options. [Repeatable value]
    -C, --category <category>        Filter by Category. Visit (...) for available options. [Repeatable value]
    -P, --platform <platform>        Filter by Platform. [Repeatable value]
    -T, --transaction <transaction>  Filter by Transaction Type. [Repeatable value]
    -t, --type                       Filter by Content Type. [Repeatable value]
    -M, --measure <measure>          Result measures (units, proceeds). Defaulting to units. [Repeatable value]
    -o, --outputfile <filename>      Output file name. Will be saved as json.
```

**Some examples ...**

```
$ itcreport create-config sample.json 
```

```
$ itcreport timed -c sample.json --since 1week
```

```
$ itcreport timed -c sample.json --since 1week -C 6001 -C 6002
```

```
$ itcreport timed -c sample.json --date 2014-01-01
```

### itcreport strings
*Same story as for [constants](#constants)*

```js
// Types
inapp
app

// Transactions
free
paid
redownload
update
refund

// Platforms
desktop
iphone
ipad
ipod

// Measures
proceeds
units
```

```
$ itcreport timed -c sample.json --date 2014-01-01 --platform desktop --platform ipad
```

# TODO

 - Better tests
 - More examples 

# Links

 - [Documentation](http://stoprocent.github.io/node-itunesconnect/docs/)
 - [Locations Cheet-Sheet](https://github.com/stoprocent/itc-report/wiki/Cheet-Sheet#countries)
 - [Categories Cheet-Sheet](https://github.com/stoprocent/itc-report/wiki/Cheet-Sheet#categories)
 - [examples](https://github.com/stoprocent/node-itunesconnect/tree/master/examples)

# License 

(The MIT License)

Copyright (c) 2014 Marek Serafin, itunesconnect module creator

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

