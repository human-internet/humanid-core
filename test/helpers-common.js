'use strict'

const chai = require('chai'),
    helpers = require('../components/common')

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

    it('should generate unique hash', async () => {
        let appId = 'APP_ID'
        let phone = helpers.combinePhone('62', '081234567890')        
		let sessionId = helpers.hmac(`${appId}_${phone}_${Date.now()}`)        
        await new Promise(resolve => setTimeout(resolve, 10))
        let newSessionId = helpers.hmac(`${appId}_${phone}_${Date.now()}`)
        sessionId.should.not.equals(newSessionId)
    })
})