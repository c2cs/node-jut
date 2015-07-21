# node-jut

This module is a handler for the [Jut](http://jut.io) REST API.  

This module is very simple and was constructed for our 
([C2C Schools, LLC](http://www.c2cschools.com/)) own internal use.  

This module should not be considered as ready for production deployment. Instead, 
it was published here in the hopes that someone else might find it useful.

### Basic Usage

```javascript
var nodeJut = require("node-jut");
var jut = new nodeJut( process.env.JUT_CLIENT_ID, process.env.JUT_CLIENT_SECRET );

var params = {};
jut.runJob( params ).then( 
	
	function afterJobRun( res ) {
	
	}
	
).catch(

	function onJobRunError( err ) {
	
	}
	
);
```

### License

```
Released under the "The MIT License (MIT)".
Please see LICENSE.md for additional information.
```

### External References and Resources

* [Official JUT Documentation](http://docs.jut.io/)
