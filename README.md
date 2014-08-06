# itunesconnect

 itunesconnect is [node.js](http://nodejs.org) module wrapping iTunes Connect Reporting API. It allows to query sales/downloads reports in super easy way.

## Installation

    $ npm install itunesconnect

 If you want to have and access to comman-line tool **itcreport** install itunesconnect globally.

    $ npm install itunesconnect -g

## About reports

 There are 2 different report types, `ranked` and `timed`. 
 
 Ranked report is sorted by number of downloads and it can be filtered and grouped by one of the [types](#types). Ranked report result contains just a number of sales and/or proceeds regardless of time frame. Ranked  is also ignoring `interval` option. Good use case for ranked report is to get summary of sales and/or proceeds in some time period. You can also use `filters` and `group` to make your query more advanced.
 
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
itunesconnect.request(Report.ranked().time(10, 'days'), function(error, result) {
    console.log(result);
});

// Or
itunesconnect.request(Report('timed').time(3, 'weeks').interval('week'), function(error, result) {
    console.log(result);
});
```

 **Result (ranked):**

```json
[ { key: '0000000000',
    title: 'App Name ',
    rptgDesc: 'App',
    contentSpecificTypeId: '1',
    contentSpecificTypeName: 'iOS App',
    contentGrpCd: 'Apps',
    contentProviderId: '000000',
    artistName: 'Artist Name',
    contentProviderName: 'Provider Name',
    units: 7684 }, // Number of units sold
  { key: '0000000000',
    title: 'In App Name ...',
    rptgDesc: 'In App',
    contentSpecificTypeId: '3',
    contentSpecificTypeName: 'Auto-Renewable Subscription',
    contentGrpCd: 'Apps',
    contentProviderId: '000000',
    contentProviderName: 'Provider Name',
    units: 2886 }, // Number of units sold

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
itunesconnect.request(Report('timed').time(3, 'weeks').interval('week').group('location'), function(error, result) {
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
```
concurrentRequests	: Number,
errorCallback	 	: function(error) {},
loginCallback	 	: function(cookies) {},
cookies               : []
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
```

Config Object:
```
config.start 		   	= String|Date // (Date or if String must be in format YYYY-MM-DD)
config.end 			 	= String|Date // (Date or if String must be in format YYYY-MM-DD)
config.interval 			= String // (Available values: day,week,month,quarter,year)
config.filters.content 	 = Number|Array // (Content ID / Application ID)
config.filters.type 		= String|Array // (Please refer to constants below)
config.filters.transaction  = String|Array // (Please refer to constants below)
config.filters.category 	= Number|Array // (Visit Cheet-Sheet#categories for available options)
config.filters.platform 	= String|Array // (Please refer to constants below)
config.filters.location 	= Number|Array // (Visit Cheet-Sheet#countries for available options)
config.group 		   	= String // (Available values: content,type,transaction,category,platform,location)
config.measures 			= Array // (Please refer to constants below)
config.limit 		   	= Number
```

Constants:
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

## query.category

## query.content

## query.date

## query.group

## query.interval

## query.limit

## query.location

## query.measures

## query.platform

## query.time

## query.transaction

## query.type 




# Links

 - [Documentation](http://stoprocent.github.io/node-itunesconnect/docs/)
 - [Countries Cheet-Sheet](https://github.com/LearnBoost/cli-table)
 - [Categories Cheet-Sheet](https://github.com/visionmedia/node-progress)
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

