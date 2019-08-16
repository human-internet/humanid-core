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

	async login(countryCode, phone) {
		let confirmed = false
		let res = null
		let data = null
		while (!confirmed) {
			try {
				res = await fetch(this.baseUrl + '/web/users/login', {
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
					data = await res.json()
					if (data.status === 'CONFIRMED') {
						confirmed = true
					} else if (data.status === 'REJECTED') {
						throw new Error('Login request rejected')
					} else if (data.status === 'PENDING') {
						await HumanID.sleep(this.interval)
					}
				}

			} catch (e) {
				throw e
			}
		}
		return confirmed
	}
}