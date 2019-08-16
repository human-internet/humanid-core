'use strict';

const bcrypt = require('bcryptjs')

module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		let now = new Date()
		try {
			let admin1 = {
				email: 'admin@local.host', 
				password: bcrypt.hashSync('admin123'),
				createdAt: now,
				updatedAt: now,
			}
			let app1 = {
				id: 'DEMO_APP',
				createdAt: now,
				updatedAt: now,
			}
			app1.secret = '2ee4300fd136ed6796a6a507de7c1f49aecd4a11663352fe54e54403c32bd6a0'
			let user1 = {
				hash: 'a0e2676406bbea729dbb8c5ce7c4c92bf62980953abb4fab544147df65bb72a7', // 6281234567890
				createdAt: now,
				updatedAt: now,
			}
			await Promise.all([
				queryInterface.bulkInsert('Admins', [admin1]),
				queryInterface.bulkInsert('Apps', [app1]),
				queryInterface.bulkInsert('Users', [user1]),
			])

			let nowStr = now.toJSON().slice(0, 19).replace('T', ' ')
			let s = queryInterface.sequelize
			let users = await s.query('select * from Users', { type: s.QueryTypes.SELECT })
			let apps = await s.query('select * from Apps', { type: s.QueryTypes.SELECT })
			let sql = `insert into AppUsers (userId, appId, hash, deviceId, notifId, createdAt, updatedAt) values ('${users[0].id}', '${apps[0].id}', '7a009b9c3203ac3ff081146137e658583d2d60cf867acdb49716b84f1603f8a4', 'DEVICE_ID', 'NOTIF_ID', '${nowStr}', '${nowStr}')`
			await s.query(sql)
			await transaction.commit()
		} catch (e) {
			await transaction.rollback()
			throw e
		}     
	},
	
	async down(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			await Promise.all([
				queryInterface.bulkDelete('Admins', null),
				queryInterface.bulkDelete('Apps', null),
				queryInterface.bulkDelete('Users', null),
			])
			await transaction.commit()
		} catch (e) {
			await transaction.rollback()
			throw e
		}		
	}
};
