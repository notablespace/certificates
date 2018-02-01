# certificates
Load certificates from Windows key store or local directory


# Status

The files here were added from another project.  The intention is to clean up 
and release this as it's own NPM module, available to the public and released
under the MIT license.  Contributions welcome.

It is not ready for release at this time, and may be useful for others who
once relied on the [windows-certs](https://github.com/jfromaniello/node-windows-certs).

Good luck!  And stay tuned for eventual updates.

# TODO

* Clean up code, create index.js and package.json for package
* Show demonstrated usage.
* Remove dependency on node-forge (only used for debugging)


# Example Usage

```
const certs = require('./certificate_manager.js');
const rp = require('request-promise')

// certs.all() returns all certificates from Local_Machine\Root and local pki directory as PEM encoded single string
certs.all().then(pem => {
	return rp({
		uri: 'http://www.example.com/resource.json',
		json: true,
		strictSSL: true,
		agentOptions: {
			ca: pem
		}
	})
}).then(json => {
	console.log(json)
}).error(err => {
	console.log("Error!", err);
})
```

# Notes

* In the application from which this was extracted, the PowerShell script was
  signed by a valid developer code-signing certificate.  I'm not sure if it's
  necessary to sign this for Windows desktop applications to work or not.
* The PowerShell script originally only worked with Windows Server 2016 and 
  Windows 10.  It has since gone through iterations to make it backward compatible
  with Windows Server 2008.  Compatibility with other versions is unknown/untested.
