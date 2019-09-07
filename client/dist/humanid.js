'use strict'

class HumanID {
	constructor(config) {
		this.baseUrl = config.apiUrl || ''
		this.appId = config.appId
		this.appSecret = config.appSecret
		this.interval = config.interval || 5000
	}

	static async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

	/**
	 * Request OTP SMS
	 * @param {*} countryCode 
	 * @param {*} phone 
	 */
	async requestOTP(countryCode, phone) {
		let res = await fetch(this.baseUrl + '/web/users/verifyPhone', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				countryCode: countryCode,
				phone: phone,
				appId: this.appId,
				appSecret: this.appSecret,
			})
		})

		if (!res.ok) {
			let text = await res.text()
			throw new Error(text)			
		} else {
			return res
		}
	}

	/**
	 * Login using push notification or OTP code
	 * @param {*} countryCode 
	 * @param {*} phone 
	 * @param {*} verificationCode Optional. If not provided, will try push notif
	 */
	async login(countryCode, phone, verificationCode) {
		let confirmed = false
		let res = null
		let data = null
		let params = {
			countryCode: countryCode,
			phone: phone,
			appId: this.appId,
			appSecret: this.appSecret,
		}

		// use verificationCode if provided
		if (verificationCode) {
			params.verificationCode = verificationCode
		}

		let body = JSON.stringify(params)
		while (!confirmed) {
			res = await fetch(this.baseUrl + '/web/users/login', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: body,
			})
			
			if (!res.ok) {
				let text = await res.text()
				throw new Error(text)
			} else {
				data = await res.json()
				if (data.status === 'CONFIRMED') {
					confirmed = true
				} else if (data.status === 'REJECTED') {
					throw new Error('Login request rejected')
				} else if (data.status === 'PENDING') {
					await HumanID.sleep(this.interval)
				}
			}
		}
		return confirmed
	}
}