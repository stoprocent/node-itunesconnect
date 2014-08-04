var should			= require('should'),
	moment			= require('moment')
	iTunesConnect 	= require("../"),
	ReportQuery   	= iTunesConnect.ReportQuery;
	Constants 		= iTunesConnect.Constants;


describe('ReportQuery', function(){
	describe('Constructor', function(){
		it('should have a type of timed', function(done){
			var query = ReportQuery('timed');
			query.type.should.equal('timed');
			done();
		})

		it('should have a type of ranked', function(done){
			var query = ReportQuery('ranked');
			query.type.should.equal('ranked');
			done();
		})
	})

	describe('timed()', function(){
		it('should have a type of timed', function(done){
			var query = ReportQuery.timed();
			query.type.should.equal('timed');
			done();
		})
	})

	describe('ranked()', function(){
		it('should have a type of ranked', function(done){
			var query = ReportQuery.ranked();
			query.type.should.equal('ranked');
			done();
		})

		it('should have a default group property', function(done){
			var query = ReportQuery.ranked();
			query.config.group.should.not.equal(null);
			done();
		})

		it('should have properties start and end', function(done){
			var query = ReportQuery.ranked();
			query.config.should.have.properties('start', 'end');
			done();
		})

		describe('when query object is given', function(){

			it('should have a property limit', function(done){
				var query = ReportQuery.ranked({
					limit: 10
				});
				query.config.limit.should.equal(10);
				done();
			})

			it('should overwrite default group property', function(done){
				var query = ReportQuery.ranked({group: 'location'});
				query.config.group.should.not.equal('content');
				done();
			})

			describe('group()', function(){
				it('should overwrite query group value', function(done){
					var query = ReportQuery.ranked({group: 'location'}).group('category');
					query.config.group.should.equal('category');
					done();
				})
			})
		})
	})

	describe('body()', function(){
		it('should not throw error when query is empty', function(done){
			(function(){
			  ReportQuery.timed().body();
			}).should.not.throwError();
			done();
		})

		describe('when query object is given with filters property', function() {
			it('should throw error when filters property is array', function(done) {
				(function(){
			  		ReportQuery.timed({
			  			filters: [1]
			  		}).body();
				}).should.throwError();
				done();
			})

			it('should throw error when filters property is string', function(done) {
				(function(){
			  		ReportQuery.timed({
			  			filters: "filter"
			  		}).body();
				}).should.throwError();
				done();
			})
			
			it('should have correct filters property', function(done) {
				var query = ReportQuery.ranked({
					filters : {
						content: [1,2,3],
						location: [4,5,6],
						transaction: Constants.Free,
						type: [
							Constants.InApp, 
							Constants.App
						],
						category: 7
					}
				});
				query.body();

				query._body.should.have.properties({
				    "filters": [{
				        "dimension_key": "content",
				        "option_keys": [1, 2, 3]
				    }, {
				        "dimension_key": "piano_location",
				        "option_keys": [4, 5, 6]
				    }, {
				        "dimension_key": "transaction_type",
				        "option_keys": [Constants.Free]
				    }, {
				        "dimension_key": "content_type",
				        "option_keys": [Constants.InApp, Constants.App]
				    }, {
				        "dimension_key": "Category",
				        "option_keys": [7]
				    }]
				});
				done();
			})
		})
	})

	describe('time()', function(){
		it('should have start value as moment object', function(done){
			var query = ReportQuery.timed().date('2014-10-02').time(1, 'day')
			query.body();

			moment.isMoment(query.config.start).should.be.true;
			done();
		})

		it('should have end value as moment object', function(done){
			var query = ReportQuery.timed().date('2014-10-02').time(1, 'day')
			query.body();

			moment.isMoment(query.config.end).should.be.true;
			done();
		})

		it('should have start value one day before end date', function(done){
			var query = ReportQuery.timed().date('2014-10-02').time(1, 'day')
			query.body();

			query.config.start.format('YYYY-MM-DD').should.equal('2014-10-01');
			done();
		})
		it('should have start value one week before end date', function(done){
			var query = ReportQuery.timed().date('2014-10-08').time(1, 'week')
			query.body();

			query.config.start.format('YYYY-MM-DD').should.equal('2014-10-01');
			done();
		})
		it('should have start value 2 months before end date', function(done){
			var query = ReportQuery.timed().date('2014-10-02').time(2, 'months')
			query.body();

			query.config.start.format('YYYY-MM-DD').should.equal('2014-08-02');
			done();
		})
		it('should have start value 3 years before end date', function(done){
			var query = ReportQuery.timed().date('2014-10-02').time(3, 'years')
			query.body();

			query.config.start.format('YYYY-MM-DD').should.equal('2011-10-02');
			done();
		})
	})
})