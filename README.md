# node-jut

This module is a handler for the [Jut](http://jut.io) REST API.  

This module is very simple and was constructed for our 
([C2C Schools, LLC](http://www.c2cschools.com/)) own internal use.  

This module should not be considered as ready for production deployment. Instead, 
it was published here in the hopes that someone else might find it useful.

### Basic Usage

```
var jutClient = require("node-jut");
var cfg = { ... };
var jut = new jutClient( cfg );
```

### Configuration

All configuration for the API client is passed in through the constructor using
a configuration variable.

```
var jutClient = require("node-jut");
var cfg = {
	"engineHost"   : "data-engine-xxxxxxx.jutdata.io",
	"enginePort"   : 3100,
	"clientId"     : "_CLIENT_ID_HERE_",
	"clientSecret" : "_CLIENT_SECRET_HERE_"
};
var jut = new jutClient( cfg );
```

#### .. using environment variables (recommended)
```
export JUT_ENGINE_HOST=data-engine-xxxxxxx.jutdata.io
export JUT_ENGINE_PORT=3100
export JUT_CLIENT_ID=_CLIENT_ID_HERE_
export JUT_CLIENT_SECRET=_CLIENT_SECRET_HERE_
```

.. then ..

```
var jutClient = require("node-jut");
var cfg = {
	"engineHost"   : process.env.JUT_ENGINE_HOST,
	"enginePort"   : process.env.JUT_ENGINE_PORT,
	"clientId"     : process.env.JUT_CLIENT_ID,
	"clientSecret" : process.env.JUT_CLIENT_SECRET
};
var jut = new jutClient( cfg );
```

#### .. using a configuration file

A simple example configuration has been provided in `config/settings.example.json`.
Although it is provided for convenience and as an example, reading from configuration
files is not part of the functionality of this API client.  Still, it would look
something like this:

```
var jutClient = require("node-jut");
var cfg = require("./path-to/settings.json");
var jut = new jutClient( cfg );
```

#### Client ID & Secret
 
As of the time of this writing, the Jut API is not yet documented.  However,
you should check the Jut documentation before following the instructions below
as the Jut team will probably add API documentation soon, which might obsolete
these instructions.

To obtain client authorization info.
1. Click on your account name in the upper right hand corner of the Jut Explorer
2. Choose "My Account"
3. Click on the "Authorizations" section
4. Use the "Create Authorization" button and an ID & Secret will be created for you.

#### Engine Host & Port

There is probably an easier or better way, but you can find your Jut hostname
and port through the Chrome developer tools (ctrl+shift+I).

Execute any job in the Explorer and look for a request in the `Network` tab of
the developer tools.  There is usually a request to a target named `jobs`.  Click
on that request and take note of the "Request URL", which should look something
like this:

`https://data-engine-99-9-999-999.jutdata.io:3100/api/v1/jobs`

The `engineHost` in the above URL is "data-engine-99-9-999-999.jutdata.io" and
the `enginePort` is 3100.

### API

Currently the Jut Client only has two useful features.  It can execute arbitrary
Juttle code and return the result and it can generate URLs to _existing_ juttle programs.
This API documentation is currently limited to only those two features.

#### runJob( juttle )

* *juttle* _{string}_ The juttle to execute.

##### Usage Example:
```
var juttle = "read -from :6 hour ago:" 		+ "\n" +
				"-to :now:" 				+ "\n" +
				"-space 'default'" 			+ "\n" +
				"| head 15" 				+ "\n" +
				"| @table";

jut.runJob( juttle ).then( ... ).catch( ... );
```

##### Return Syntax/Example:*
```
{ warnings: [],
  errors: [],
  results:
   [ { data: [Object],
       name: 'table',
       type: 'table',
       options: [Object] } ] }
```

The results of your query will be in `.results[0].data`.  If your Juttle includes
more than one output (such as two `@table` constructs), the `results` array will
contain more than one element.

#### generateLink( deploymentId, programId, params )

* *deploymentId* _{string}_ Your Jut deployment ID
* *programId* _{string}_ The ID of the program to execute
* *params* _{object}_ (nullable) One or more key-value pairs to use for `input` parameter values.

You can find your "Deployment Id" and the ID of any program by, first, opening
the program and then clicking on the "Share Results" in the program options
drop-down (which has a default action of "Save").

The link it produces might look something like this:
```
https://app.jut.io/#viewer/deployment/xxxxxxxx-xxxx/program/YYYyYyYY...
```

In the example above the `deploymentId` is "xxxxxxxx-xxxx" and the `programId` 
is "YYYyYyYY".

The functionality of the `generateLink` method is identical to that of the "Share Results"
button in the Jut Explorer.  Therefore, you can use the "Share Link" button to validate
the output of this method.  This method exists mainly to facilitate programmatic
inclusion of the input parameter values.

##### Usage Example:
```
var link = jut.generateProgramLink(
	myDeploymentId, 
	myProgramId,
	{
		someInput: "someVal"
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
