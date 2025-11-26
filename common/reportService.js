import DBService from '@/common/dbService.js'
const dbService = new DBService()

export default class ReportService {
	/**
	 * 获取某个账户在指定年月（格式为202302）的净收入（结余）
	 * @param {number} accountId - 账户ID
	 * @param {string|number} yearMonth - 目标年月，如 202502
	 * @returns [{ yearMonth: '202502', netIncome: xxx }]
	 */
	async getMonthlyNetIncomeByYM(accountId, yearMonth) {
		const ymStr = String(yearMonth) // 确保是字符串
		const sql = `
		SELECT
			strftime('%Y%m', bill_date) AS yearMonth,
			SUM(money) AS netIncome
		FROM tally_bill
		WHERE account_id = ${accountId}
		AND strftime('%Y%m', bill_date) = '${ymStr}'
		GROUP BY strftime('%Y%m', bill_date)
		ORDER BY yearMonth DESC
	`;
		return dbService.queryTable(sql);
	}

	async getAccountsNetIncomeByMonth(yearMonth) {
		const ymStr = String(yearMonth)
		const sql = `
			SELECT 
				a.account_name,
				SUM(b.money) AS netIncome
			FROM tally_account a
			LEFT JOIN tally_bill b ON a.id = b.account_id
			WHERE strftime('%Y%m', datetime(b.bill_date / 1000, 'unixepoch')) = '${ymStr}'
			GROUP BY a.id, a.account_name
		`;
		return dbService.queryTable(sql);
	}

	async getNetIncomeByMonth(year, user_id) {
		const startDate = `${year}-01-01 00:00:00`;
		const endDate = `${year}-12-31 23:59:59`;

		const startTimestamp = new Date(startDate).getTime(); // 毫秒
		const endTimestamp = new Date(endDate).getTime();
		const sql = `
			SELECT 
				strftime('%m', datetime(bill_date / 1000, 'unixepoch')) AS month,
				SUM(b.money) AS netIncome
			FROM tally_account a
			LEFT JOIN tally_bill b ON a.id = b.account_id
			WHERE b.bill_date BETWEEN ${startTimestamp} AND ${endTimestamp}
			AND a.user_id = ${user_id}
			GROUP BY month
			ORDER BY month ASC
		`;
		return dbService.queryTable(sql);
	}

	async getCatorySumByMonth(month, directory, user_id = 0) {
		const sql = `
		SELECT 
			b.category_id AS categoryId,
			c.name AS categoryName,
			c.icon AS icon,
			SUM(b.money) AS total
		FROM tally_bill b
		JOIN tally_category c ON b.category_id=c.id
		WHERE strftime('%Y%m', datetime(b.bill_date / 1000, 'unixepoch')) = '${month}' 
		AND b.user_id='${user_id}'
		AND directory=${directory}
		GROUP BY b.category_id`
		return dbService.queryTable(sql);
	}
}