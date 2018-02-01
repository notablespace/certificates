'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const log = require('../logger.js');


const DEFAULT_POWERSHELL_OPTIONS = {
	debugMsg: false, //(config.production) ? false : true
	executionPolicy: 'Unrestricted'
}

const Shell = require('node-powershell');

class PowerShell {

	constructor(opts) {
		let _opts = Object.assign({}, DEFAULT_POWERSHELL_OPTIONS, opts);
		
		let ps = this.ps = new Shell(_opts);

		if (_opts.debugMsg) {
			ps.on('output', data => {
				console.out(data);
			});
			ps.on('err', data => {
				console.error(data);
			});
			ps.on('end', code => {
				console.out("PowerShell exited with code %s", code);
			});
		}

	}
	
	static run(script) {
		return (new PowerShell()).run(script);
	}

	run(script, args) {
		return new Promise((resolve, reject) => {
			//Copy file from virtual filesystem (pkg) to CWD
			fs.readFile(path.join(__dirname, script), (err, data) => {
				if (err) {
					reject(err);
				} else {
					let export_filename = path.resolve(process.cwd(), script)
					log.trace({script, export_filename}, "Exporting PowerShell script");

					fs.writeFile(export_filename, data, (err, data) => {
						if (err) {
							reject(err);
						} else {
							resolve(export_filename);
						}
					})
				}
			})
		})
		.then(script => {
			let cmd = `& "${script}"`;
			log.trace({cmd, args}, "Loading script into PowerShell")
			this.ps.addCommand(cmd, args);

			//Invoke the command
			log.trace("Invoking PowerShell script");
			return this.ps.invoke();
		})
		.then(output => {
			//TODO: Replace with call to log.file('trace', 'ps.out.txt', output) when implemented.
			//fs.writeFile('ps.out.txt', output);
			log.trace("PowerShell returned. Disposing.")
			this.ps.dispose();
			return output;
		})
		.catch(err => {
			log.error({err}, "PowerShell Error!");
		})
	}

}

module.exports = PowerShell;