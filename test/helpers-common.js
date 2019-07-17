'use strict'

const chai = require('chai'),
    helpers = require('../helpers/common')

// setup chai
chai.should()

describe('Common Helpers', () => {
        
    it('should generate random string', async () => {
        let n = 10
        let res = helpers.randStr(n)
        res.length.should.equals(n)
        res.should.match(/^[A-Za-z0-9]+$/i)
    })

    it('should combine country code and phone number', async () => {
        helpers.combinePhone('62', '081234567890').should.equals('6281234567890')
        helpers.combinePhone('62', '81234567890').should.equals('6281234567890')
    })
})