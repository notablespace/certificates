'use strict'

//require('dotenv').config()
const chai = require('chai');
const expect = chai.expect;


describe('CertificateManager', () => {
	describe('#all()', () => {
		it('should return all the trusted CA certificates');
	})

	describe('#osCAs()', () => {
		it('should return all the trusted root CAs from the Operating System');

	})

	describe('#localCAs()', () => {
		it('should return all the trusted root CAs from local directory');
	})

})