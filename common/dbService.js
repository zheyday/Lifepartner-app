export default class DBService {
	constructor() {
		this.db = null;
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
						console.log('数据库打开成功')
					},
					fail: function(e) {
						console.error('数据库打开失败', e)
					}
				});
			}

			this.createTables()

			this.initTables()
		});
	}

	// 创建表
	createTables() {
		//this.executeSql(`drop table tally_account`)
		//this.executeSql(`drop table tally_bill`)
		this.createTable(`create table IF NOT EXISTS tally_account 
						(
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							account_name TEXT NOT NULL,
							balance INTEGER default 0 NOT NULL,
							book_id INTEGER NOT NULL,
							user_id INTEGER NOT NULL,
							account_type TEXT NOT NULL,
							create_time timestamp
							default CURRENT_TIMESTAMP NOT NULL
						);`)
		this.createTable(`create table IF NOT EXISTS tally_bill
						(
						    id          INTEGER PRIMARY KEY AUTOINCREMENT,
							comment 	TEXT,
						    account_id  INTEGER NOT NULL,
						    money       INTEGER default 0 NOT NULL,
						    bill_date   timestamp default CURRENT_TIMESTAMP,
						    category_id INTEGER                             ,
						    create_time timestamp default CURRENT_TIMESTAMP
						);`)
		this.executeSql(`drop table tally_category`)
		this.createTable(`create table IF NOT EXISTS tally_category
						(
						    id INTEGER PRIMARY KEY AUTOINCREMENT,
							parent_id INTEGER NOT NULL, -- 收入类型的一级分类是-1, 支出是-2
						    name TEXT NOT NULL,
							directory INTEGER NOT NULL, -- 收入1,支出-1
							user_id INTEGER NOT NULL,
							UNIQUE(user_id, parent_id, name)
						);`)
	}

	createTable(sql) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
					name: 'lifeparterTally',
					sql: sql,
					success: function(e) {
						console.log('表创建成功');
						resolve(e);
					},
					fail: function(error) {
						console.error('创建表时出错:', error);
						reject(error);
					}
				}

			);
		});
	}

	initTables() {
		this.executeSql(`INSERT INTO tally_category (id, parent_id, name, directory, user_id) VALUES 
		(1, 0, '收入', 1, 1),
		(2, 0, '支出', -1, 1),
		(4, 1, '职业收入', 1, 1),
		(5, 4, '工资收入', 1, 1),
		(6, 4, '公积金收入', 1, 1),
		(7, 2, '日常支出', 1, 1),
		(8, 7, '消费', -1, 1),
		(9, 7, '房租', -1, 1)
		`)
	}

	insertTallyAccount(accountName, balance, bookId, userId, accountType) {
		var sql = `INSERT INTO tally_account (account_name, balance, book_id, user_id, account_type) 
				VALUES ('${accountName}', ${balance}, ${bookId}, ${userId}, '${accountType}')`
		this.executeSql(sql)
	}

	insertTallyBill(account_id, money, bill_date, category_id, comment) {
		var sql = `INSERT INTO tally_bill (account_id, money, bill_date, category_id, comment) 
				VALUES (${account_id}, ${money}, ${bill_date}, ${category_id}, '${comment}')`
		this.executeSql(sql)
	}

	deleteTallyBill(id) {
		var sql = `DELETE FROM tally_bill WHERE id=${id}`
		this.executeSql(sql)
	}

	deleteById(table, id) {
		var sql = `DELETE FROM ${table} WHERE id=${id}`
		this.executeSql(sql)
	}

	getTallyBill(account_id) {
		return this.queryTable(`SELECT * FROM tally_Bill where account_id=${account_id} order by bill_date desc`)
	}

	getTallyAccount() {
		return this.queryTable(`SELECT id, account_name, balance, account_type FROM tally_account`)
	}

	getTallyCategory() {
		return this.queryTable(`SELECT child.id as id, parent.name || '-' || child.name as category FROM tally_category child
		 join tally_category parent on child.parent_id = parent.id`)
	}

	getTallyCategoryById(id) {
		return this.queryTable(`SELECT * FROM tally_category where id = ${id}`)
	}

	executeSql(sql) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: 'lifeparterTally',
				sql: sql,
				success: function(e) {
					console.log('执行成功');
					resolve(e);
				},
				fail: function(error) {
					console.error('执行出错:', error);
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
					console.error('查询出错:', error);
					reject(error);
				}
			})
		});
	}
}