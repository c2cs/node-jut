/**
 * A Jut API Client. (http://www.jut.io)
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @created 2015-22-07
 * @copyright See LICENSE.md
 */

// Dependencies
var validate = require( "validate.js" );
var _ = require( "underscore" );
var tipe = require("tipe");
var rp = require("request-promise");
var Promise = require("bluebird");

/**
 * @constructor
 */
var ex = module.exports = function Jut ( cfg ) {

	// Locals
	var me = this;

	// Defaults
	me.isAuthenticated = false;
	me.accessToken = null;

	// Set the config
	me.setConfig( cfg );

};

// For convenience..
var pr = ex.prototype;

/**
 * Sets the JUT configuration.  Only configuration variables
 * that are provided will have any effect. i.e. If `enginePort`
 * is not provided then the currently set `enginePort` will keep
 * its value.
 *
 * @access public
 * @param {object} cfg
 * @returns {void}
 */
pr.setConfig = function( cfg ) {

	var me = this;

	if( cfg !== undefined && cfg !== null ) {

		_.each(
			cfg, function( val, key ) {

				if( val !== null ) {

					me[key] = val;

				}

			}
		);

	}

	me.validateConfig();

};

/**
 * Validates the JUT configuration.
 *
 * @access public
 * @throws Error
 * @returns {boolean}
 */
pr.validateConfig = function() {

	// Locals
	var me = this;

	// Engine port can be defaulted if it was not provided
	if( me.enginePort === undefined || me.enginePort === null ) {
		me.enginePort = 3100;
	}

	// Validation Config (aka "constraints")
	var validationConstraints = {
		engineHost   : {
			presence : true,
			format   : {
				pattern : /.*\.jutdata\.io/,
				message : "The provided data engine url is invalid or malformed; it should be in the format of '*.jutdata.io'"
			}
		},
		enginePort   : {
			presence     : true,
			numericality : {
				onlyInteger : true,
				greaterThan : 0,
				lessThan    : 35000
			}
		},
		clientId     : {
			presence : true
		},
		clientSecret : {
			presence : true
		}
	};

	// Execute the validation
	var res = validate( me, validationConstraints, {format : "flat"} );

	// Throw an error if validation fails
	if( res !== undefined ) {
		throw new Error( "The configuration provided for the Jut client is invalid.\n\nValidation failed with the following error(s):\n  - " + res.join( "\n  -" ) );
	}

	// Validation succeeded :)
	return true;

};

/**
 * Executes a POST request against the JUT API.
 *
 * @access private
 * @param {string} url The full URL to the target endpoint, or a partial URL
 * that will be automatically appended to the engine URL after `api/v1/..`
 * @param {object?} headers Any _additional_ headers to add to the request
 * @param {object?} body The request body, if applicable
 * @returns {Promise}
 */
pr.__POST = function( url, headers, body ) {

	var me = this;
	return me.__REQUEST( "POST", url, headers, body );

};

/**
 * Convenience method for executing requests against the JUT API.
 *
 * @access private
 * @param {string} method The HTTP method to execute
 * @param {string} url The full URL to the target endpoint, or a partial URL
 * that will be automatically appended to the engine URL after `api/v1/..`
 * @param {object?} headers Any _additional_ headers to add to the request
 * @param {object?} body The request body, if applicable
 * @returns {Promise}
 */
pr.__REQUEST = function( method, url, headers, body ) {

	var me = this;
	var requestConfig;

	// Resolve URL
	if( url.substr(0,8) !== "https://" ) {
		url = "https://" + me.engineHost + ":" + me.enginePort + "/api/v1/" + url;
	}

	// Normalize Headers
	if( headers === undefined || headers === null || tipe(headers) !== "object" ) {
		headers = {};
	}
	headers["Content-Type"] = "application/json";

	// Build the request configuration
	requestConfig = {
		url: url,
		json: true,
		method: method,
		headers: headers
	};

	// Attach the body, if it was provided
	if( body !== undefined && body !== null ) {
		requestConfig.body = body;
	}

	// Execute the Request
	return rp( requestConfig );

};

/**
 * Authenticate with the Jut API using OAuth 2.0
 *
 * @access private
 * @returns {Promise}
 */
pr.__AUTHENTICATE = function() {

	var me = this;
	return me.__POST(
		"https://auth.jut.io/token",
		{},
		{
			grant_type    : "client_credentials",
			client_id     : me.clientId,
			client_secret : me.clientSecret
		}
	).then(

		function onAuthSuccess( res ) {

			var accessToken = res.access_token;
			var tokenExpiresIn = res.expires_in;

			me.accessToken = accessToken;
			me.isAuthenticated = true;

			setTimeout( function() {
				me.accessToken 		= null;
				me.isAuthenticated 	= false;
			}, tokenExpiresIn);

			return true;

		}

	);


};

/**
 * Executes an arbitrary Juttle job.
 *
 * @param {string} juttle The Juttle to execute
 * @returns {Promise}
 */
pr.runJob = function( juttle ) {

	var me = this;
	return me.__POST_WITH_AUTH( "runjob", {
		program: juttle
	});

};

/**
 * Executes a POST request against the Jut API and includes authentication
 * information.  This method is unlike `#__POST` in that `#__POST` does not
 * automatically inject auth info. (because `#__AUTHENTICATE` uses `#__POST`
 * for its requests).
 *
 * @access private
 * @param {string} path The API endpoint. (appended to `/api/v1/`)
 * @param {object?} body The POST request body
 * @returns {Promise}
 */
pr.__POST_WITH_AUTH = function( path, body ) {

	var me = this;
	var auth;

	if( me.isAuthenticated ) {
		auth = Promise.resolve(true);
	} else {
		auth = me.__AUTHENTICATE();
	}

	return auth.then(

		function afterAuth() {

			return me.__POST(
				path,
				{
					"Authorization": "Bearer " + me.accessToken
				},
				body
			)

		}

	);

};

/**
 * Generates a URL link to an existing Jut program with, optionally, one or more
 * inputs pre-filled with data from `params`.
 *
 * @param {string} deploymentId Your Jut deployment id.
 * @param {string} programId The ID for the program you'd like to execute.
 * @param {object?} params A key-value pair of input parameters for the Juttle program.
 * @returns {string} A link to the output results.
 */
pr.generateProgramLink = function( deploymentId, programId, params ) {

	// Locals
	var me = this;
	var baseUrl = "https://app.jut.io/#viewer/deployment/";
	var url = baseUrl + deploymentId + "/program/" + programId;

	// Consider Params
	if( params !== undefined && params !== null && tipe( params ) === "object"
			&& _.keys(params ).length > 0 ) {

		var escaped = [];
		url += "?";
		_.each( params, function(v,k) {

			escaped.push( k + "='" + encodeURIComponent(v) + "'")

		});
		url += escaped.join("&");

	}
	return url;

};
