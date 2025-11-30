import bcrypt from 'bcryptjs'
import logger from './logger.js'
// 雪花算法生成器类
class SnowflakeGenerator {
	constructor(workerId = 1, datacenterId = 1) {
		// 雪花算法参数（简化版，避免位运算溢出）
		this.twepoch = 1640995200000 // 自定义起始时间戳 (2022-01-01)
		this.workerIdBits = 5 // 工作机器ID位数
		this.datacenterIdBits = 5 // 数据中心ID位数
		this.sequenceBits = 12 // 序列号位数

		// 最大值计算（使用更安全的方式）
		this.maxWorkerId = Math.pow(2, this.workerIdBits) - 1 // 31
		this.maxDatacenterId = Math.pow(2, this.datacenterIdBits) - 1 // 31
		this.sequenceMask = Math.pow(2, this.sequenceBits) - 1 // 4095

		// 位移量
		this.workerIdShift = this.sequenceBits
		this.datacenterIdShift = this.sequenceBits + this.workerIdBits
		this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits

		// 验证参数
		if (workerId > this.maxWorkerId || workerId < 0) {
			logger.warn(`workerId 超出范围，使用默认值。范围: 0-${this.maxWorkerId}`)
			workerId = Math.abs(workerId) % (this.maxWorkerId + 1)
		}
		if (datacenterId > this.maxDatacenterId || datacenterId < 0) {
			logger.warn(`datacenterId 超出范围，使用默认值。范围: 0-${this.maxDatacenterId}`)
			datacenterId = Math.abs(datacenterId) % (this.maxDatacenterId + 1)
		}

		this.workerId = workerId
		this.datacenterId = datacenterId
		this.sequence = 0
		this.lastTimestamp = -1
	}

	// 生成下一个ID
	nextId() {
		let timestamp = this.timeGen()

		// 时钟回拨检测
		if (timestamp < this.lastTimestamp) {
			logger.warn(`时钟回拨detected，等待恢复...`)
			timestamp = this.lastTimestamp + 1
		}

		// 同一毫秒内序列号递增
		if (this.lastTimestamp === timestamp) {
			this.sequence = (this.sequence + 1) & this.sequenceMask
			// 序列号用完，等待下一毫秒
			if (this.sequence === 0) {
				timestamp = this.tilNextMillis(this.lastTimestamp)
			}
		} else {
			this.sequence = 0
		}

		this.lastTimestamp = timestamp

		// 简化版雪花算法：使用字符串拼接避免位运算溢出
		const timestampPart = (timestamp - this.twepoch).toString()
		const datacenterPart = this.datacenterId.toString().padStart(2, '0')
		const workerPart = this.workerId.toString().padStart(2, '0')
		const sequencePart = this.sequence.toString().padStart(4, '0')

		// 生成ID: 时间戳 + 数据中心ID + 工作机器ID + 序列号
		const id = timestampPart + datacenterPart + workerPart + sequencePart

		return id
	}

	// 等待下一毫秒
	tilNextMillis(lastTimestamp) {
		let timestamp = this.timeGen()
		while (timestamp <= lastTimestamp) {
			timestamp = this.timeGen()
		}
		return timestamp
	}

	// 获取当前时间戳
	timeGen() {
		return Date.now()
	}
}

export default class DBService {
	constructor() {
		this.db = null;
		this.snowflakeGenerator = null;
	}

	// 初始化数据库
	initDB() {
		return new Promise((resolve, reject) => {
			if (!plus.sqlite.isOpenDatabase({
					name: 'lifeparterTally',
					path: '_doc/lifeparterTally.db'
				})) {
				this.db = plus.sqlite.openDatabase({
					name: 'lifeparterTally',
					path: '_doc/lifeparterTally.db', // 对于iOS需要设置location为'default'
					success: function(e) {
						logger.info('数据库打开成功')
					},
					fail: function(e) {
						logger.error('数据库打开失败: ' + JSON.stringify(e))
					}
				});
			}

			this.createTables()

			this.initTables()
		});
	}

	// 创建表
	createTables() {
		this.createTable(`create table IF NOT EXISTS user
						(
							id TEXT PRIMARY KEY,
							username TEXT NOT NULL,
							password TEXT NOT NULL,
							nickname TEXT default '',
							avatar TEXT default '',
							email TEXT default '',
							created_at timestamp default CURRENT_TIMESTAMP NOT NULL,
							updated_at timestamp default CURRENT_TIMESTAMP NOT NULL
						);`)
		this.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS idx_username ON user(username);')

		// this.executeSql(`drop table tally_account`)
		this.createTable(`create table IF NOT EXISTS tally_account 
						(
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							account_name TEXT NOT NULL,
							balance INTEGER default 0 NOT NULL,
							book_id INTEGER NOT NULL,
							user_id INTEGER NOT NULL,
							account_type TEXT NOT NULL,
							icon TEXT NOT NULL,
							create_time timestamp default CURRENT_TIMESTAMP NOT NULL
						);`)
		this.createTable(`create table IF NOT EXISTS tally_bill
						(
						    id          INTEGER PRIMARY KEY AUTOINCREMENT,
							comment 	TEXT,
						    account_id  INTEGER NOT NULL,
						    money       INTEGER default 0 NOT NULL,
						    bill_date   timestamp default CURRENT_TIMESTAMP,
						    category_id INTEGER                             ,
						    user_id     TEXT NOT NULL,
						    create_time timestamp default CURRENT_TIMESTAMP
						);`)
		// this.executeSql(`drop table tally_category`)
		this.createTable(`create table IF NOT EXISTS tally_category
						(
						    id INTEGER PRIMARY KEY AUTOINCREMENT,
							parent_id INTEGER NOT NULL, -- 收入类型的一级分类是-1, 支出是-2
						    name TEXT NOT NULL,
							directory INTEGER NOT NULL, -- 收入1,支出-1
							user_id INTEGER NOT NULL,
							icon TEXT NOT NULL default '',
							UNIQUE(user_id, parent_id, name, directory)
						);`)
	}

	createTable(sql) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
					name: 'lifeparterTally',
					sql: sql,
					success: function(e) {
						resolve(e);
					},
					fail: function(error) {
						logger.error('创建表时出错: ' + JSON.stringify(error));
						reject(error);
					}
				}

			);
		});
	}

	async initTables() {
		// 检查是否已经初始化过
		const isInitialized = uni.getStorageSync('lifeparter_db_initialized')
		if (isInitialized) {
			return
		}

		// 检查数据库中是否已有数据
		try {
			const result = await this.queryTable(`SELECT COUNT(*) as count FROM tally_category WHERE id < 2000`)
			if (result && result[0] && result[0].count > 0) {
				// 数据已存在，标记为已初始化
				uni.setStorageSync('db_initialized', true)
				return
			}
		} catch (error) {
			logger.error('检查初始化状态时出错，继续执行初始化: ' + error.message)
		}

		// 执行初始化
		await this.executeSql(`INSERT OR IGNORE INTO tally_category (id, parent_id, name, directory, user_id, icon) VALUES 
		(1, 0, '收入', 1, 1,''),
		(2, 0, '支出', -1, 1,''),
		(11, 1, '职业收入', 1, 1,''),
		(12, 11, '工资收入', 1, 1, '/static/icons/salary.png'),
		(13, 11, '公积金收入', 1, 1,'/static/icons/accumulation-fund.png'),
		(14, 11, '奖金', 1, 1,'/static/icons/bonus.svg'),
		(15, 11, '加班费', 1, 1,'/static/icons/overtime-pay.svg'),
		(16, 11, '经营所得', 1, 1,'/static/icons/business-income.svg'),
		(17, 11, '兼职', 1, 1,'/static/icons/part-time-job.svg'),
		
		(21, 1, '投资收入', 1, 1,''),
		(22, 21, '理财收入', 1, 1,'/static/icons/financial-management.png'),
		
		(101, 2, '日常支出', 1, 1,''),
		(102, 101, '消费', -1, 1,'/static/icons/consumption.png'),
		
		(200, 2, '住房支出', 1, 1,''),
		(201, 200, '房贷', -1, 1,'/static/icons/rent.png'),
		(202, 200, '房租', -1, 1,'/static/icons/rent.png'),
		
		(300, 2, '理财亏损', 1, 1,''),
		(301, 300, '股票', -1, 1,'/static/icons/rent.png'),
		(302, 300, '基金', -1, 1,'/static/icons/rent.png'),

		(1998, 0, '余额变更', 1, 1,'/static/icons/rent.png'),
		(1999, 0, '余额变更', -1, 1,'/static/icons/rent.png')
		`)

		// 标记为已初始化
		uni.setStorageSync('lifeparter_db_initialized', true)
	}

	insertTallyAccount(accountName, balance, bookId, userId, accountType, icon) {
		var sql = `INSERT INTO tally_account (account_name, balance, book_id, user_id, account_type, icon) 
				VALUES ('${accountName}', ${balance}, ${bookId}, ${userId}, '${accountType}', '${icon}')`
		return this.executeSql(sql)
	}

	updateTallyAccount(accountId, accountName, accountType, icon) {
		var sql =
			`UPDATE tally_account SET account_name='${accountName}', account_type='${accountType}', icon='${icon}' WHERE id=${accountId}`
		return this.executeSql(sql)
	}

	insertTallyBill(account_id, money, bill_date, category_id, comment, user_id) {
		var sql = `INSERT INTO tally_bill (account_id, money, bill_date, category_id, comment, user_id) 
				VALUES (${account_id}, ${money}, ${bill_date}, ${category_id}, '${comment}', '${user_id}')`
		this.executeSql(sql)
	}

	insertTallyCategory(name, icon, parent_id, directory, user_id) {
		const sql = `INSERT INTO tally_category (name, icon, parent_id, directory, user_id) 
				VALUES ('${name}', '${icon}', ${parent_id}, ${directory}, ${user_id})`;
		return this.executeSql(sql)
	}

	updateTallyCategory(id, name, icon, parent_id, directory) {
		const sql = `UPDATE tally_category SET name='${name}', icon='${icon}', parent_id=${parent_id}, directory=${directory} 
				WHERE id=${id}`;
		return this.executeSql(sql)
	}

	deleteTallyCategory(id) {
		const sql = `DELETE FROM tally_category WHERE id=${id}`;
		return this.executeSql(sql)
	}

	deleteTallyCategoryWithChildren(id) {
		// 先删除所有子分类，parent_id = 该一级分类的id
		const deleteChildrenSql = `DELETE FROM tally_category WHERE parent_id=${id}`;
		this.executeSql(deleteChildrenSql)
		// 再删除一级分类本身
		const deleteSql = `DELETE FROM tally_category WHERE id=${id}`;
		return this.executeSql(deleteSql)
	}

	async insertUser(username, password) {
		// 生成雪花算法ID
		const userId = this.generateSnowflakeId()
		// 密码加密
		const salt = bcrypt.genSaltSync(10)
		const hash = bcrypt.hashSync(password, salt)
		const sql = `INSERT INTO user (id, username, password) VALUES ('${userId}', '${username}', '${hash}')`
		await this.executeSql(sql)
		return userId
	}

	// 雪花算法ID生成器（内置到DBService中）
	generateSnowflakeId() {
		if (!this.snowflakeGenerator) {
			this.initSnowflakeGenerator()
		}

		try {
			const id = this.snowflakeGenerator.nextId()
			return id
		} catch (error) {
			logger.warn('雪花算法生成失败，使用备用方案: ' + error.message)
			// 备用方案：时间戳 + 随机数
			return this.generateFallbackId()
		}
	}

	// 备用ID生成方案
	generateFallbackId() {
		const timestamp = Date.now()
		const workerId = this.generateWorkerId()
		const random = Math.floor(Math.random() * 10000)

		// 格式：时间戳 + 工作机器ID + 随机数
		const id = `${timestamp}${workerId.toString().padStart(2, '0')}${random.toString().padStart(4, '0')}`
		logger.info('使用备用ID: ' + id)
		return id
	}

	// 初始化雪花算法生成器
	initSnowflakeGenerator() {
		// 基于设备信息生成workerId
		const workerId = this.generateWorkerId()
		const datacenterId = 1

		this.snowflakeGenerator = new SnowflakeGenerator(workerId, datacenterId)
	}

	// 基于设备信息生成workerId
	generateWorkerId() {
		try {
			const systemInfo = uni.getSystemInfoSync()
			const deviceId = systemInfo.deviceId || systemInfo.system || 'default'

			// 简单哈希算法生成workerId
			let hash = 0
			for (let i = 0; i < deviceId.length; i++) {
				hash = ((hash << 5) - hash + deviceId.charCodeAt(i)) & 0xffffffff
			}
			return Math.abs(hash) % 32 // 限制在0-31范围内
		} catch (error) {
			logger.warn('无法获取设备信息，使用默认workerId: ' + error.message)
			return Math.floor(Math.random() * 32)
		}
	}

	updateTallyBill(bill_id, account_id, money, bill_date, category_id, comment) {
		var sql =
			`UPDATE tally_bill set account_id=${account_id}, money=${money}, bill_date=${bill_date}, category_id=${category_id}, comment='${comment}' WHERE id=${bill_id}`
		this.executeSql(sql)
	}

	deleteTallyBill(id) {
		var sql = `DELETE FROM tally_bill WHERE id=${id}`
		this.executeSql(sql)
	}

	deleteTallyBillByAccount(account_id) {
		var sql = `DELETE FROM tally_bill WHERE account_id=${account_id}`
		this.executeSql(sql)
	}

	deleteById(table, id) {
		var sql = `DELETE FROM ${table} WHERE id=${id}`
		this.executeSql(sql)
	}

	getTallyBillByAccountId(account_id) {
		return this.queryTable(`SELECT b.*, a.account_name as accountName FROM tally_Bill b
		INNER JOIN tally_account a ON b.account_id = a.id
		where account_id=${account_id} order by bill_date desc`)
	}

	getTallyBillByCategoryAndMonth(category_id, month) {
		return this.queryTable(`SELECT b.*, a.account_name as accountName FROM tally_Bill b
		INNER JOIN tally_account a ON b.account_id = a.id
		where category_id=${category_id} 
		and strftime('%Y%m', datetime(bill_date / 1000, 'unixepoch')) = '${month}'
		order by bill_date desc`)
	}

	getTallyBillById(id) {
		return this.queryTable(`SELECT * FROM tally_Bill where id=${id}`)
	}

	getTallyAccount(user_id) {
		return this.queryTable(
			`SELECT id, account_name, balance, account_type, icon FROM tally_account WHERE user_id=${user_id}`)
	}

	getTallyAccountById(id) {
		return this.queryTable(`SELECT id, account_name, balance, account_type FROM tally_account WHERE id=${id}`)
			.then(rows => rows && rows.length > 0 ? rows[0] : null)
	}

	getTallyCategory() {
		return this.queryTable(`SELECT id, 
			icon,
			name as category
			FROM tally_category`)
	}

	getTallyCategoryById(id) {
		return this.queryTable(`SELECT * FROM tally_category where id = ${id}`)
	}

	getUser(username) {
		return this.queryTable(`SELECT 1 FROM user WHERE username = '${username}'`)
	}

	getUserById(user_id) {
		return this.queryTable(`SELECT * FROM user WHERE id = '${user_id}'`)
	}

	updateUser(user_id, updates) {
		const fields = []
		if (updates.nickname !== undefined) fields.push(`nickname='${updates.nickname}'`)
		if (updates.avatar !== undefined) fields.push(`avatar='${updates.avatar}'`)
		if (updates.email !== undefined) fields.push(`email='${updates.email}'`)
		if (updates.password !== undefined) fields.push(`password='${updates.password}'`)

		if (fields.length === 0) return Promise.resolve()

		const sql = `UPDATE user SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id='${user_id}'`
		return this.executeSql(sql)
	}

	async login(username, password) {
		// 先查出hash
		const rows = await this.queryTable(`SELECT id, password FROM user WHERE username = '${username}'`)
		if (!rows || rows.length === 0) return []
		const hash = rows[0].password
		if (bcrypt.compareSync(password, hash)) {
			return [{
				id: rows[0].id
			}]
		} else {
			return []
		}
	}

	getByTableName(tableName) {
		return this.queryTable(`SELECT * FROM ${tableName}`)
	}

	getLastInsertRowid() {
		return this.queryTable(`SELECT last_insert_rowid() AS id`)
	}

	executeSql(sql) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: 'lifeparterTally',
				sql: sql,
				success: function(e) {
					resolve(e);
				},
				fail: function(error) {
					logger.error('SQL执行出错: ' + JSON.stringify(error));
					reject(error);
				}
			})
		});
	}

	queryTableName(tableName) {
		return this.queryTable(`SELECT * FROM ${tableName}`)
	}

	queryTable(sql) {
		return new Promise((resolve, reject) => {
			plus.sqlite.selectSql({
				name: 'lifeparterTally',
				sql: sql,
				success: function(data) {
					resolve(data);
				},
				fail: function(error) {
					logger.error('SQL查询出错: ' + JSON.stringify(error));
					reject(error);
				}
			})
		});
	}
}