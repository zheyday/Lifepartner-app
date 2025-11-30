function formatTime(time) {
	if (typeof time !== 'number' || time < 0) {
		return time
	}

	var hour = parseInt(time / 3600)
	time = time % 3600
	var minute = parseInt(time / 60)
	time = time % 60
	var second = time

	return ([hour, minute, second]).map(function(n) {
		n = n.toString()
		return n[1] ? n : '0' + n
	}).join(':')
}

function formatLocation(longitude, latitude) {
	if (typeof longitude === 'string' && typeof latitude === 'string') {
		longitude = parseFloat(longitude)
		latitude = parseFloat(latitude)
	}

	longitude = longitude.toFixed(2)
	latitude = latitude.toFixed(2)

	return {
		longitude: longitude.toString().split('.'),
		latitude: latitude.toString().split('.')
	}
}
var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDate()) + '-' +
			_format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};

function fenToYuanString(number) {
	return keep2DigitsString(number / 100)
}

function fenToYuanNumber(number) {
	return keep2DigitsNumber(number / 100)
}

function yuanToFenString(number) {
	return keep2DigitsString(number * 100)
}

function yuanToFenNumber(number) {
	return keep2DigitsNumber(number * 100)
}

function keep2DigitsString(number) {
	return parseFloat(number).toFixed(2)
}

function keep2DigitsNumber(number) {
	return parseFloat(keep2DigitsString(number))
}

// 雪花算法 ID 生成器
class SnowflakeIdGenerator {
	constructor(workerId = 1, datacenterId = 1) {
		// 雪花算法参数
		this.twepoch = 1640995200000 // 自定义起始时间戳 (2022-01-01)
		this.workerIdBits = 5 // 工作机器ID位数
		this.datacenterIdBits = 5 // 数据中心ID位数
		this.sequenceBits = 12 // 序列号位数

		// 最大值计算
		this.maxWorkerId = -1 ^ (-1 << this.workerIdBits)
		this.maxDatacenterId = -1 ^ (-1 << this.datacenterIdBits)
		this.sequenceMask = -1 ^ (-1 << this.sequenceBits)

		// 位移量
		this.workerIdShift = this.sequenceBits
		this.datacenterIdShift = this.sequenceBits + this.workerIdBits
		this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits

		// 验证参数
		if (workerId > this.maxWorkerId || workerId < 0) {
			throw new Error(`workerId 必须在 0 到 ${this.maxWorkerId} 之间`)
		}
		if (datacenterId > this.maxDatacenterId || datacenterId < 0) {
			throw new Error(`datacenterId 必须在 0 到 ${this.maxDatacenterId} 之间`)
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
			throw new Error(`时钟回拨，拒绝生成ID。上次时间戳: ${this.lastTimestamp}, 当前时间戳: ${timestamp}`)
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

		// 生成ID: 时间戳 + 数据中心ID + 工作机器ID + 序列号
		const id = ((timestamp - this.twepoch) << this.timestampLeftShift) |
			(this.datacenterId << this.datacenterIdShift) |
			(this.workerId << this.workerIdShift) |
			this.sequence

		return id.toString()
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

	// 解析雪花ID（用于调试）
	parseId(id) {
		const bigId = BigInt(id)
		const timestamp = Number((bigId >> BigInt(this.timestampLeftShift)) + BigInt(this.twepoch))
		const datacenterId = Number((bigId >> BigInt(this.datacenterIdShift)) & BigInt(this.maxDatacenterId))
		const workerId = Number((bigId >> BigInt(this.workerIdShift)) & BigInt(this.maxWorkerId))
		const sequence = Number(bigId & BigInt(this.sequenceMask))

		return {
			timestamp: new Date(timestamp),
			datacenterId,
			workerId,
			sequence,
			originalId: id
		}
	}
}

// ID 生成器工具类
const idUtils = {
	// 雪花算法实例（可以根据设备生成不同的workerId）
	snowflake: null,

	// 初始化雪花算法
	initSnowflake(workerId = null, datacenterId = 1) {
		// 如果没有指定workerId，基于设备信息生成
		if (workerId === null) {
			workerId = this.generateWorkerId()
		}
		this.snowflake = new SnowflakeIdGenerator(workerId, datacenterId)
	},

	// 基于设备信息生成workerId
	generateWorkerId() {
		try {
			// 在uni-app中获取设备信息
			const systemInfo = uni.getSystemInfoSync()
			const deviceId = systemInfo.deviceId || systemInfo.system || 'default'

			// 简单哈希算法生成workerId
			let hash = 0
			for (let i = 0; i < deviceId.length; i++) {
				hash = ((hash << 5) - hash + deviceId.charCodeAt(i)) & 0xffffffff
			}
			return Math.abs(hash) % 32 // 限制在0-31范围内
		} catch (error) {
			console.warn('无法获取设备信息，使用默认workerId:', error)
			return Math.floor(Math.random() * 32) // 随机生成
		}
	},

	// 生成雪花ID
	generateSnowflakeId() {
		if (!this.snowflake) {
			this.initSnowflake()
		}
		return this.snowflake.nextId()
	},

	// UUID 生成器（保留作为备选）
	generateUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0
			const v = c == 'x' ? r : (r & 0x3 | 0x8)
			return v.toString(16)
		})
	},

	// 生成短UUID（去掉连字符）
	generateShortUUID() {
		return this.generateUUID().replace(/-/g, '')
	},

	// 生成数字ID（基于时间戳+随机数）
	generateNumericId() {
		const timestamp = Date.now()
		const random = Math.floor(Math.random() * 10000)
		return `${timestamp}${random.toString().padStart(4, '0')}`
	},

	// 解析雪花ID
	parseSnowflakeId(id) {
		if (!this.snowflake) {
			this.initSnowflake()
		}
		return this.snowflake.parseId(id)
	}
}

// 为了向后兼容，保留uuidUtils别名
const uuidUtils = idUtils

// 登录状态检测相关函数
const authUtils = {
	// 检查是否已登录
	isLoggedIn() {
		const user_id = uni.getStorageSync('user_id')
		return !!user_id
	},

	// 获取当前用户ID
	getCurrentUserId() {
		return uni.getStorageSync('user_id')
	},

	// 登录检测拦截器 - 如果未登录则跳转到登录页
	requireLogin(showToast = true) {
		if (!this.isLoggedIn()) {
			if (showToast) {
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					duration: 1000
				})
			}

			// 获取当前页面路径
			const pages = getCurrentPages()
			const currentPage = pages[pages.length - 1]
			const currentRoute = '/' + currentPage.route

			// 如果不在用户中心，才跳转
			if (currentRoute !== '/pages/user-center/login') {
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/user-center/login'
					})
				}, showToast ? 1000 : 0)
			}

			return false
		}
		return true
	},

	// 登出功能
	logout() {
		uni.removeStorageSync('user_id')

		// 更新tabBar为登录状态
		uni.setTabBarItem({
			index: 2,
			pagePath: 'pages/user-center/user-center',
			text: '我的'
		})

		uni.showToast({
			title: '已退出登录',
			icon: 'success',
			duration: 500
		})
	}
}

export {
	formatTime,
	formatLocation,
	dateUtils,
	keep2DigitsString,
	keep2DigitsNumber,
	fenToYuanString,
	fenToYuanNumber,
	yuanToFenString,
	yuanToFenNumber,
	idUtils,
	uuidUtils,
	authUtils
}