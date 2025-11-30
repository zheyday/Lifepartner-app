/**
 * 日志工具类 - App 平台专用
 * 将日志写入本地文件
 */

class Logger {
	constructor() {
		this.logFileName = 'life-partner.log'
		this.maxLogSize = 1024 * 1024 * 50 // 50MB，超过则清空
	}

	/**
	 * 写入日志
	 * @param {string} message - 日志内容
	 * @param {string} level - 日志级别
	 */
	log(message, level = 'INFO') {
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		const hours = String(now.getHours()).padStart(2, '0')
		const minutes = String(now.getMinutes()).padStart(2, '0')
		const seconds = String(now.getSeconds()).padStart(2, '0')
		const milliseconds = String(now.getMilliseconds()).padStart(3, '0')
		
		const timestamp = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}:${milliseconds}`
		const logEntry = `[${timestamp}] [${level}] ${message}\n`

		console.log(logEntry)

		try {
			plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
				// 获取或创建日志文件
				fs.root.getFile(this.logFileName, {
					create: true
				}, (fileEntry) => {
					// 检查文件大小
					fileEntry.file((file) => {
						if (file.size > this.maxLogSize) {
							// 文件过大，清空后重写
							this.clearAndWrite(fileEntry, logEntry)
						} else {
							// 追加写入
							this.appendToFile(fileEntry, logEntry)
						}
					})
				}, (error) => {
					console.error('获取日志文件失败:', error)
				})
			}, (error) => {
				console.error('请求文件系统失败:', error)
			})
		} catch (error) {
			console.error('写入日志异常:', error)
		}
	}

	/**
	 * 追加写入文件
	 */
	appendToFile(fileEntry, content) {
		fileEntry.createWriter((writer) => {
			writer.onwrite = () => {
				// 写入成功
			}
			writer.onerror = (error) => {
				console.error('写入日志失败:', error)
			}
			writer.seek(writer.length) // 移动到文件末尾
			writer.write(content)
		}, (error) => {
			console.error('创建写入器失败:', error)
		})
	}

	/**
	 * 清空并写入
	 */
	clearAndWrite(fileEntry, content) {
		fileEntry.createWriter((writer) => {
			writer.onwrite = () => {
				// 清空后，再追加新内容
				writer.seek(0)
				writer.write(`[日志文件已清空]\n${content}`)
			}
			writer.onerror = (error) => {
				console.error('清空日志失败:', error)
			}
			writer.truncate(0) // 清空文件
		})
	}

	/**
	 * 信息级别日志
	 */
	info(message) {
		this.log(message, 'INFO')
	}

	/**
	 * 错误级别日志
	 */
	error(message) {
		this.log(message, 'ERROR')
	}

	/**
	 * 警告级别日志
	 */
	warn(message) {
		this.log(message, 'WARN')
	}

	/**
	 * 调试级别日志
	 */
	debug(message) {
		this.log(message, 'DEBUG')
	}

	/**
	 * 读取日志文件内容
	 * @param {function} callback - 回调函数，参数为日志内容
	 */
	readLog(callback) {
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
			fs.root.getFile(this.logFileName, {
				create: false
			}, (fileEntry) => {
				fileEntry.file((file) => {
					const reader = new plus.io.FileReader()
					reader.onloadend = (e) => {
						callback && callback(e.target.result)
					}
					reader.onerror = (error) => {
						console.error('读取日志失败:', error)
						callback && callback('')
					}
					reader.readAsText(file, 'utf-8')
				})
			}, (error) => {
				console.log('日志文件不存在')
				callback && callback('')
			})
		})
	}

	/**
	 * 清空日志文件
	 */
	clearLog() {
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
			fs.root.getFile(this.logFileName, {
				create: true
			}, (fileEntry) => {
				fileEntry.createWriter((writer) => {
					writer.onwrite = () => {
						console.log('日志已清空')
					}
					writer.truncate(0)
				})
			})
		})
	}

	/**
	 * 获取日志文件路径
	 * @param {function} callback - 回调函数，参数为文件路径
	 */
	getLogPath(callback) {
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
			const path = `${fs.root.fullPath}${this.logFileName}`
			callback && callback(path)
		})
	}
}

export default new Logger()
