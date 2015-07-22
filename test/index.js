"use strict";

var chai = require("chai");
var expect = chai.expect;

var jutApiHandler = require("../lib/index.js");

var cfg = require("../config/settings.json");

describe("JUT API Handler", function () {

	var jut;

	describe("Config validation", function() {

		var cfgExample;

		beforeEach( function() {

			cfgExample = {
				"engineHost"   : "data-engine-xxxxxxx.jutdata.io",
				"enginePort"   : 3100,
				"clientId"     : "GxTR7Bjfg1k=",
				"clientSecret" : "sZXgjMNLqprraSwBedfaHD1F8g4GJVwI1aPcSIzXOL0="
			};

		});

		it("should allow valid configurations", function() {

			var execTest = function() {
				jut = new jutApiHandler(cfgExample);
			};
			expect( execTest ).to.not.throw( Error );

		});

		it("should require a data engine host", function() {

			var execTest = function() {
				delete cfgExample.engineHost;
				jut = new jutApiHandler(cfgExample);
			};
			expect( execTest ).to.throw( Error );

		});

		it("should require a client id", function() {

			var execTest = function() {
				delete cfgExample.clientId;
				jut = new jutApiHandler(cfgExample);
			};
			expect( execTest ).to.throw( Error );

		});

		it("should require a client secret", function() {

			var execTest = function() {
				delete cfgExample.clientSecret;
				jut = new jutApiHandler(cfgExample);
			};
			expect( execTest ).to.throw( Error );

		});

		it("should reject invalid ports", function() {

			var execTest = function() {
				cfgExample.enginePort = -1;
				jut = new jutApiHandler(cfgExample);
			};
			expect( execTest ).to.throw( Error );

			var execTest2 = function() {
				cfgExample.enginePort = 99999;
				jut = new jutApiHandler(cfgExample);
			};
			expect( execTest2 ).to.throw( Error );

			var execTest3 = function() {
				cfgExample.enginePort = "bobsyouruncle";
				jut = new jutApiHandler(cfgExample);
			};
			expect( execTest3 ).to.throw( Error );

		});

	});

	describe("Authentication", function() {

		beforeEach( function() {
			jut = new jutApiHandler(cfg);
		});

		it("should work properly", function (done) {

			jut.__AUTHENTICATE().then(

				function afterAuth( res ) {
					expect( jut.isAuthenticated ).to.equal(true);
					done();
				}

			).catch(

				function onAuthError( err ) {
					done(err);
				}

			);


		});

	});

	describe("Juttle Execution (runjob)", function() {

		before( function() {
			jut = new jutApiHandler(cfg);
		});

		it("should work properly", function (done) {

			var juttle = "read -from :6 hour ago:" 		+ "\n" +
							"-to :now:" 				+ "\n" +
							"-space 'default'" 			+ "\n" +
							"| head 15" 				+ "\n" +
							"| @table";

			jut.runJob( juttle ).then(

				function afterExecution( res ) {
					expect( res.results[0] ).to.not.be.an("undefined");
					done();
				}

			).catch(

				function onExecutionError( err ) {
					done(err);
				}

			);


		});

	});

	describe("Program Link Generation", function() {

		before( function() {
			jut = new jutApiHandler(cfg);
		});

		it("should work properly", function () {

			// A little crude, sure..

			var expected = "https://app.jut.io/#viewer/deployment/xxx-xxx/program/yyy?execId_3_0=%27123%27";
			var link = jut.generateProgramLink(
				"xxx-xxx", "yyy", {
					execId: "123"
				}
			);

			expect(link).to.equal(expected);

		});

	});

});
