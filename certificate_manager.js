"use strict";

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const PowerShell = require('./power_shell.js');
const log = require('../logger.js');
const pki = require('node-forge').pki;

const PS_SCRIPT_FILENAME = 'certs_b64_lines.ps1';
const CERT_DELIMETER = '@';
const PATH = path.join('pki', 'ca');

try {
	fs.mkdirsSync(PATH);
} catch (err) {
	log.error({err, path:PATH}, "Error creating pki directories!");
}

const PEM_BEGIN = '-----BEGIN CERTIFICATE-----';
const PEM_END = '-----END CERTIFICATE-----';

class CertificateManager {
	constructor() {}

	all() {
		return Promise.all([ this.osCAs(), this.localCAs() ]).then(([os, local]) => {
			return os.join("\n").concat(local.join("\n"));
		})
	}

	/** osCAs()
	 * Get certificates from OS trusted root CA store. Currently only Windows
	 * is supported.  All other platforms return empty array.
	 * 
	 * @returns {Array} Array of PEM encoded trusted root certificates.
	**/
	osCAs() {
		log.info({platform: os.platform(), arch: os.arch(), release: os.release()}, 
		"Importing OS Trusted root CA certificates");

		if ('win32' != os.platform()) {
			log.debug("Non-Windows platform detected. Skipping certificate import.");
			return Promise.resolve([])
		}

		log.debug("Detected Windows OS. Invoking PowerShell.");

		return PowerShell.run(PS_SCRIPT_FILENAME, {Delim: CERT_DELIMETER}).then((lines) => {
			return lines.replace(/\s|@\s*$/g, '').split(CERT_DELIMETER).filter(i => (i) ? true : false).map((s) => { 
				return [PEM_BEGIN, s, PEM_END].join("\n");
			});
		}).then(certs => {
			log.debug({subjects: certs.map(pem => {
				try {
					return pki.certificateFromPem(pem).subject.getField('CN').value;
				} catch (err) {
					log.error({err}, 'Error parsing PEM certificate!');
					return "ERROR";
				}
			})}, 'OS Trusted Root CA certificates loaded.')
			return certs;
		})
	}

	/** localCAs()
	 * Get certificates from local pki/ca directory.  Only loads files with .pem
	 * extention (case)
	 * 
	 * @returns {Array} Array of PEM encoded trusted root certificates.
	**/
	localCAs() {
		log.debug({path: PATH}, "Loading local CA PEM files.");

		return new Promise((resolve, reject) => {
			fs.readdir(PATH, (err, files) => {
				if (err) {
					reject(err);
				} else {
					resolve(files.filter(f => f.toLowerCase().endsWith('.pem')));
				}
			})
		}).then((files) => {
			log.debug({files}, "Loading PEM certificates.");

			return Promise.all(files.map(f => {
				return new Promise((resolve, reject) => {
					fs.readFile(path.join(PATH, f), (err, data) => {
						(err) ? reject(err) : resolve(data);
					});
				})
			}))
		}).then(certs => {
			log.debug({subjects: certs.map(pem => {
				try {
					return pki.certificateFromPem(pem).subject.getField('CN').value;
				} catch (err) {
					log.error({err}, 'Error parsing PEM certificate!');
					return "ERROR";
				}
			})}, 'Local Trusted Root CA certificates loaded.')
			return certs;
		})
	}

}


const certMgr = module.exports = new CertificateManager();
