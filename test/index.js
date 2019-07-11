'use strict'

const chai = require('chai'),
    chaiHttp = require('chai-http'),
    bcrypt = require('bcryptjs'),
    models = require('../models/index'),
    app = require('../index')

// setup chai
chai.use(chaiHttp)
chai.should()

describe('Server', () => {
        
    beforeEach(async () => {
        await models.migrate()
        await models.Admin.create({
            email: 'admin@local.host', 
            password: bcrypt.hashSync('admin123'),
        })
    })

    it('index should be publicliy accessible', async () => {
        let res = await chai.request(app).get('/')            
        res.should.have.status(200)
    })

    it('should be able to register an app ID', async () => {
        // called by our platform when app owner is 
        // registering to use our API
        try {
            let res = await chai.request(app)
                .post('/login')
                .send({email: 'admin@local.host', password: 'admin123'})
            res.should.have.status(200)
            res.body.accessToken.length.should.gte(10)
            let accessToken = res.body.accessToken
            let data = {appId: 'New York Times'}
            res = await chai.request(app)
                .post('/apps')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(data)
            res.should.have.status(200)
            res.body.id.should.equals(data.appId)
            res.body.secret.length.should.gte(10)
            res = await chai.request(app)
                .get('/apps')
                .set('Authorization', `Bearer ${accessToken}`)
            res.body.data.length.should.equals(1)
            res.body.total.should.equals(1)
        } catch (e) {
            throw e
        }
    })

    it('should be able to register as new user', async () => {
        let data = {appId: 'New York Times', phone: '+6280989999'}        
        let req = chai.request(app).keepOpen()
        try {
            // Create an app
            let res = await req.post('/login')
                .send({email: 'admin@local.host', password: 'admin123'})
            let res1 = await req.post('/apps')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send({appId: data.appId})
            res1.should.have.status(200)
            res1.body.secret.length.should.gte(10)
            // Called by SDK within partner app
            // when a new user is trying to login
            let res2 = await req.post('/users/verifyPhone').send({
                appId: data.appId,
                phone: data.phone, 
                appSecret: res1.body.secret,
            })
            res2.should.have.status(200)
            res2 = await req.post('/users/register').send({
                appId: data.appId,
                phone: data.phone, 
                deviceId: '122333444455555', 
                appSecret: res1.body.secret,
                verificationCode: '123456',
            })
            res2.should.have.status(200)
            res2.body.appId.should.equals(data.appId)
            // The hash is unique per app per user
            // this hash should be encrypted and stored 
            // on user device
            res2.body.hash.length.should.gte(10)
            res2.body.should.not.have.all.keys('hash')
        } catch (e) {
            throw e
        } finally {
            req.close()
        }
    })

    it('should be able to login using stored hash', async () => {
        let data = {appId: 'New York Times', phone: '+6280989999', deviceId: '122333444455555'}
        let data2 = {appId: 'The Guardian'}
        let req = chai.request(app).keepOpen()
        try {
            let res = await req.post('/login')
                .send({email: 'admin@local.host', password: 'admin123'})            
            // Create two apps
            let res1 = await req.post('/apps')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send({appId: data.appId})
            res1.should.have.status(200)
            let res2= await req.post('/apps')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send({appId: data2.appId})
            res2.should.have.status(200)

            // Register the user to 1st app
            let res3 = await req.post('/users/register').send({
                appId: data.appId,
                phone: data.phone, 
                deviceId: data.deviceId, 
                appSecret: res1.body.secret,
                verificationCode: '123456',
            })
            res3.should.have.status(200)

            // Login to 2nd app
            // Called by SDK within partner app/server
            // to check if a user is registered (hence logged-in).
            // The hash is considered as a replacement for conventional password
            // hence must be encrypted when stored in user's device
            // and decrypted only when being used for login           
            let res4 = await req.post('/users/login').send({
                appId: data2.appId, 
                appSecret: res2.body.secret,
                existingHash: res3.body.hash,
            })
            res4.should.have.status(200)
            res4.body.appId.should.equals(data2.appId)
            // The hash is unique per app per user
            // this hash should be encrypted and stored 
            // on user device
            res4.body.hash.length.should.gte(10)
            res4.body.should.not.have.any.keys('userHash')

            // check login status
            let res5 = await req.get('/users/login').query({
                appId: data.appId, 
                appSecret: res1.body.secret,
                hash: res4.body.hash,
            })
            res5.should.have.status(200)
        } catch (e) {
            throw e
        } finally {
            req.close()
        }
    })
})