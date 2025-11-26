<template>
	<view class="container">
		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>
		<!-- 顶部标签栏 -->
		<view class="tab-bar">
			<view v-for="(tab, index) in tabList" :key="index" class="tab-item"
				:class="{ active: currentTab === index }" @click=clickTab(index)>
				{{ tab }}
				<view class="tab-underline" v-if="currentTab === index"></view>
			</view>
		</view>

		<!-- 内容区域：用 v-if 切换展示 -->
		<view class="tab-content">
			<view v-if="currentTab === 0">
				<!-- 月份切换器 -->
				<view class="month-bar">
					<wd-icon name="arrow-left" size="22px" @click="changeMonth(-1)"></wd-icon>
					<text class="month-text">{{ formatMonth(currentDateForCategory) }}</text>
					<wd-icon name="arrow-right" size="22px" @click="changeMonth(1)" />
				</view>

				<view class="card-section">
					<view class="section-header">
						<text class="section-title">收入分类统计</text>
						<view class="summary">
							<text class="summary-text">
								总收入 <text class="income-text">{{incomeTotal}}</text>
							</text>
						</view>
					</view>
					<!-- 环形图 -->
					<view class="charts-box">
						<qiun-data-charts ref="outcomeChartRef" type="ring" :animation="false"
							:chartData="incomeChartData" @complete="onChartCompleteAccountPieForIncome" />
					</view>
					<!-- 分类列表 -->
					<wd-cell-group>
						<wd-cell v-for="(item, index) in incomeCategoryByMonth" :title="item.categoryName"
							:value="item.total.toFixed(2)" is-link
							:to="`/pages/settle-account/flow?category=${item.categoryId}&month=${currentMonthStr}`"
							border center>
							<template #icon>
								{{index+1}}
								<wd-icon :name="item.icon" style="margin: 0 6px;" size="22px"></wd-icon>
							</template>
						</wd-cell>
					</wd-cell-group>
				</view>

				<view class="card-section">
					<view class="section-header">
						<text class="section-title">支出分类统计</text>
						<text class="summary-text">
							总支出 <text class="outcome-text">{{outcomeTotal}}</text>
						</text>
					</view>

					<!-- 环形图 -->
					<view class="charts-box">
						<qiun-data-charts type="ring" :animation="false" :chartData="outcomeChartData" />
					</view>
					<!-- 分类列表 -->
					<wd-cell-group>
						<wd-cell v-for="(item, index) in outcomeCategoryByMonth" :title="item.categoryName"
							:value="item.total.toFixed(2)" border center is-link
							:to="`/pages/settle-account/flow?category=${item.categoryId}&month=${currentMonthStr}`">
							<template #icon>
								{{index+1}}
								<wd-icon :name="item.icon" style="margin: 0 6px;" size="22px"></wd-icon>
							</template>
						</wd-cell>
					</wd-cell-group>
				</view>
			</view>
			<view v-else-if="currentTab === 1">
				<!-- 年份切换器 -->
				<view class="month-bar">
					<wd-icon name="arrow-left" size="22px" @click="changeYear(-1)"></wd-icon>
					<text class="month-text">{{ currentYearForAccount }}</text>
					<wd-icon name="arrow-right" size="22px" @click="changeYear(1)" />
				</view>
				<view class="card-section">
					<view class="account-card">
						<view class="title">净资产</view>
						<view class="net-assets-label">
							{{latestTotalMoney}}
						</view>
					</view>

					<view class="charts-box">
						<qiun-data-charts type="line" :animation="false" :opts="lineOpts" tooltipFormat="lineFormatter1"
							:chartData="netIncomeChartData" @complete="onChartCompleteAccountLine" />
					</view>
				</view>
			</view>
		</view>


	</view>

</template>

<script setup>
	import {
		ref,
		onMounted,
		reactive,
		watch
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import ReportService from '@/common/ReportService.js'
	import {
		authUtils
	} from '@/common/utils.js'
	import {
		checkCurrentPageAuth
	} from '@/common/authGuard.js'
	const reportService = new ReportService()
	const incomeChartData = ref({})
	const outcomeChartData = ref({})
	const netIncomeChartData = ref({})


	const lineOpts = {
		dataLabel: false,
		xAxis: {
			//绘制坐标轴轴线
			axisLine: false,
		},
		yAxis: {
			axisLine: false,
			axisLineColor: '#FFFFFF',
			gridColor: '#ebebeb',
		},
	}

	// 标签数据
	const tabList = ['分类', '账户']
	const currentTab = ref(0)

	function clickTab(index) {
		currentTab.value = index
		if (index === 0) {
			loadMonthData()
		} else if (index === 1) {
			loadAccountChart()
		}
	}

	const currentDateForCategory = ref(new Date())
	const currentYearForAccount = ref(new Date().getFullYear())

	// 计算当前月份的字符串格式 (YYYYMM)
	const currentMonthStr = computed(() => {
		const year = currentDateForCategory.value.getFullYear()
		const month = (currentDateForCategory.value.getMonth() + 1).toString().padStart(2, '0')
		return `${year}${month}`
	})

	// 计算当前年份
	const currentYear = computed(() => {
		return currentYearForAccount.value.getFullYear().toString()
	})

	function formatMonth(date) {
		const y = date.getFullYear();
		const m = (date.getMonth() + 1).toString().padStart(2, '0');
		return `${y}年${m}月`;
	}

	const showList = ref(true)

	async function changeMonth(direction) {
		const newDate = new Date(currentDateForCategory.value);
		newDate.setMonth(newDate.getMonth() + direction);
		currentDateForCategory.value = newDate;
		// 重新加载当前月份的数据
		await loadMonthData()

	}

	async function changeYear(direction) {
		currentYearForAccount.value = currentYearForAccount.value + direction;

		await loadAccountChart()
	}

	const incomeCategoryByMonth = ref([])
	const outcomeCategoryByMonth = ref([])
	let tempIncomeCategoryByMonth = []
	let tempOutcomeCategoryByMonth = []

	const incomeTotal = ref(0)
	const outcomeTotal = ref(0)
	let tempIncomeTotal = 0
	let tempOutcomeTotal = 0

	const outcomeChartRef = ref(null)


	const chartState = reactive({
		incomeChartData: null,
		outcomeChartData: null,
		incomeCategoryByMonth: [],
		outcomeCategoryByMonth: []
	})
	// 加载特定月份的数据
	const loadMonthData = async () => {
		try {
			// 获取当前月份的收入分类数据
			const monthStr = currentMonthStr.value
			const user_id = uni.getStorageSync('user_id') || 0
			tempIncomeTotal = 0
			tempOutcomeTotal = 0
			// 获取分类统计数据
			tempIncomeCategoryByMonth = await reportService.getCatorySumByMonth(monthStr, 1, user_id)
				.then(result => {
					return result.filter(item => item.categoryId !== 1998 && item.categoryId !== 1999).map(
						item => {
							tempIncomeTotal += item.total
							return {
								icon: item.icon,
								categoryId: item.categoryId,
								categoryName: item.categoryName,
								total: utils.fenToYuanNumber(item.total)
							}
						}).sort((a, b) => b.total - a.total)
				})

			tempOutcomeCategoryByMonth = await reportService.getCatorySumByMonth(monthStr, -1, user_id)
				.then(result => {
					return result.filter(item => item.categoryId !== 1998 && item.categoryId !== 1999).map(
						item => {
							var total = Math.abs(item.total)
							tempOutcomeTotal += total
							return {
								icon: item.icon,
								categoryId: item.categoryId,
								categoryName: item.categoryName,
								total: utils.fenToYuanNumber(total)
							}
						}).sort((a, b) => b.total - a.total)
				})

			// 更新环形图数据
			updateChartData()
		} catch (error) {
			console.error('加载月份数据失败:', error)
			uni.showToast({
				title: '数据加载失败',
				icon: 'none'
			})
		} finally {}
	}

	// 更新环形图数据
	const updateChartData = () => {
		incomeChartData.value = {
			series: [{
				format: "pieNamePercent",
				data: tempIncomeCategoryByMonth.map(item => {
					return {
						name: item.categoryName,
						value: item.total,
					}
				})
			}]
		}

		outcomeChartData.value = {
			series: [{
				format: "pieNamePercent",
				data: tempOutcomeCategoryByMonth.map(item => {
					return {
						name: item.categoryName,
						value: item.total,
					}
				})
			}]
		}
	}

	function onChartCompleteAccountPieForIncome() {
		incomeTotal.value = utils.fenToYuanString(tempIncomeTotal)
		incomeCategoryByMonth.value = tempIncomeCategoryByMonth
		outcomeTotal.value = utils.fenToYuanString(tempOutcomeTotal)
		outcomeCategoryByMonth.value = tempOutcomeCategoryByMonth
	}

	// 账户
	async function loadAccountChart() {
		const user_id = uni.getStorageSync('user_id') || 0
		const netIncomeResult = await reportService.getNetIncomeByMonth(currentYearForAccount.value, user_id)
		const netIncome = fillMonthlyData(netIncomeResult, currentYearForAccount.value)
		netIncomeChartData.value = {
			categories: netIncome.map(x => {
				const monthNum = Number(x.month) // 提取月
				return monthNum % 2 === 1 ? `${monthNum}月` : '' // 奇数月显示，偶数月空
			}),
			series: [{
				name: '',
				data: netIncome.map(x => x.netIncome),
			}]
		}
	}

	const latestTotalMoney = ref(0)

	function onChartCompleteAccountLine() {
		latestTotalMoney.value = netIncomeChartData.value.series[0].data[11]
	}

	function fillMonthlyData(rawData, year) {
		const result = []
		const dataMap = new Map()

		// 构造 map：{ '2025-05': 1200, ... }
		rawData.forEach(item => {
			dataMap.set(item.month, utils.fenToYuanString(item.netIncome))
		})

		// 找出最后一个有数据的月份
		const existingMonths = rawData.map(item => Number(item.month))
		const lastDataMonth = Math.max(...existingMonths)

		let lastValue = '0.00'

		for (let m = 1; m <= 12; m++) {
			const mm = m.toString().padStart(2, '0')
			const key = `${mm}`

			if (dataMap.has(key)) {
				lastValue = dataMap.get(key)
				result.push({
					month: key,
					netIncome: lastValue
				})
			} else {
				// 没数据：前面补0，后面补最后一个月的值
				const value = m < lastDataMonth ? '0.00' : lastValue
				result.push({
					month: key,
					netIncome: value
				})
			}
		}
		return result
	}

	onPullDownRefresh(() => {
		clickTab(currentTab.value)
		// 必须调用此方法停止刷新动画
		uni.stopPullDownRefresh();
	})

	// 页面加载时检查登录状态
	onLoad(() => {
		if (!checkCurrentPageAuth('/pages/reports/reports')) {
			return
		}
	})

	onShow(() => {
		loadMonthData()
	})
</script>

<style scoped>
	/* 基本样式 */
	.container {
		padding: 0px;
	}

	.tab-bar {
		display: flex;
		background: #fff;
		border-bottom: 1px solid #eee;
	}

	.tab-item {
		padding: 20rpx 30rpx;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #333;
		font-weight: bold;
	}

	.tab-underline {
		position: absolute;
		bottom: 10rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 32rpx;
		height: 6rpx;
		background-color: #f9ae3d;
		border-radius: 3rpx;
	}

	.tab-content {
		padding: 10rpx 0rpx;
	}

	.charts-box {
		width: 100%;
		height: 400rpx;
	}

	.month-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5rpx 0;
		font-size: 30rpx;
		color: #646464;
	}

	.month-text {
		margin: 0 20rpx;
	}

	.card-section,
	.income-section {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 20rpx;
	}

	.account-card {
		position: relative;
		height: 100rpx;
		background: linear-gradient(135deg, #8ab3ff 0%, #aed3ff 50%, #d4e2ff 100%);
		border-radius: 15rpx 15rpx 0 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 30rpx;
	}

	.total-statistics {
		position: relative;
		height: 100%;

	}

	.title {
		color: #FFFFFF;
		font-size: 30rpx;
		font-weight: 600;
	}

	.net-assets-label {
		color: rgba(255, 255, 255, 0.9);
		font-size: 70rpx;
		font-weight: 500;
	}

	.main-amount {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 30rpx;
		padding: 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 500;
	}

	.summary {
		text-align: right;
	}

	.summary-text {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
		display: block;
	}

	.income-text {
		color: red;
	}

	.outcome-text {
		color: green;
	}
</style>