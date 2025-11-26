<template>
	<view class="container">
		<view class="total-money" v-if="account_id">
			<text>{{totalAssets}}</text>
			<text class="total-money-name">净流入</text>
		</view>

		<view v-for="(item,index) in monthFlows">
			<uni-collapse class="card" v-model="firstMonth">
				<uni-collapse-item :title="item.month" :name="item.month">
					<!-- 月份和收支概览 -->
					<template v-slot:title>
						<view class="overview">
							<view class="date-section">
								<view class="month">{{item.month}}</view>
								<view class="year">{{item.year}}</view>
							</view>

							<view class="amount-section">
								<view class="income-total">
									<view style="color: #ccd3ef;">净收入&nbsp;</view>
									<view class="money-font">
										{{item.netIncome}}
									</view>
								</view>

								<view class="balance-font">
									<text class="income-color">收入&nbsp;</text>
									<text>{{item.revenue}}</text>
									<text> | </text>
									<text class="outcome-color">支出&nbsp;</text>
									<text>{{item.expense}}</text>
								</view>
							</view>
						</view>
					</template>

					<view v-for="(dayList, index) in item.flow">
						<view class="day">{{dayList.day}}</view>
						<FlowList :ref="addFlowListRef" :group-id="`${item.year}-${item.month}-${dayList.day}`"
							:flowList="dayList.dayFlowList" @click="handleRecordClick"
							@delete="({ detail, index }) => handleDelete(detail, item, dayList, index)"
							@swipe-open="handleSwipeOpen" />
					</view>

				</uni-collapse-item>
			</uni-collapse>
		</view>

		<wd-fab :expandable="false" @click="handleClick"></wd-fab>
	</view>
</template>

<script setup>
	import {
		reactive,
		ref,
		onBeforeUpdate,
		getCurrentInstance
	} from 'vue'
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import DBService from '@/common/dbService.js'
	import FlowList from '@/components/FlowList.vue'
	import * as utils from '@/common/utils.js'

	const dbService = new DBService()
	const flowListRefs = ref([])
	const addFlowListRef = (el) => {
		if (el) {
			flowListRefs.value.push(el)
		}
	}
	onBeforeUpdate(() => {
		flowListRefs.value = []
	})

	const handleSwipeOpen = (activeGroupId) => {
		flowListRefs.value.forEach(ref => {
			if (ref && ref.groupId !== activeGroupId && ref.closeAll) {
				ref.closeAll()
			}
		})
	}

	function handleRecordClick(detail) {
		if (detail.category_id === 1998 || detail.category_id === 1999) {
			uni.showToast({
				title: '余额变更不可编辑',
				icon: 'none',
				duration: 1000
			});
			return
		}

		uni.navigateTo({
			url: `/pages/settle-account/flow-edit?bill_id=${detail.id}&account_id=${account_id.value}&category=${detail.category}`
		})
	}
	const handleClick = () => {
		uni.navigateTo({
			url: `/pages/settle-account/flow-create?account_id=${account_id.value}&balance=${totalAssets.value}`
		})
	}

	const monthFlows = reactive([])
	const firstMonth = ref();
	const totalAssets = ref(0);
	const account_id = ref(0);
	const month = ref(0);
	const category = ref(0);

	onLoad((options) => {
		account_id.value = options.account_id
		month.value = options.month
		category.value = options.category
	})

	onShow(async () => {
		let result = null
		if (account_id.value) {
			result = await dbService.getTallyBillByAccountId(account_id.value)
			const account = await dbService.getTallyAccountById(account_id.value)

			uni.setNavigationBarTitle({
				title: account.account_name,
			})
			// 计算总净资产(所有流水的总和)
			let totalBalance = account.balance
			result.forEach(record => {
				totalBalance += parseFloat(record.money)
			})
			totalAssets.value = utils.fenToYuanString(totalBalance)
		} else {
			result = await dbService.getTallyBillByCategoryAndMonth(category.value, month.value)
		}
		const categoryResult = await dbService.getTallyCategory()
		const categoryMap = {};
		categoryResult.forEach(row => {
			categoryMap[row.id] = row;
		});
		// 按年月分组数据
		const monthlyData = {};
		result.forEach(record => {
			const date = new Date(record.bill_date);
			const year = date.getFullYear();
			const month = date.getMonth() + 1; // 月份从 0 开始
			const day = date.getDate();
			const minuteTime =
				`${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

			// 构建年月键（如 "2025-2"）
			const yearMonthKey = `${year}-${month}`;

			// 初始化月份数据
			if (!monthlyData[yearMonthKey]) {
				monthlyData[yearMonthKey] = {
					month: `${month}月`,
					year: `${year}`,
					netIncome: 0,
					revenue: 0,
					expense: 0,
					flow: {}
				};
			}

			const monthData = monthlyData[yearMonthKey];

			// 按日分组流水
			const dayKey = `${day}号`;
			if (!monthData.flow[dayKey]) {
				monthData.flow[dayKey] = {
					day: dayKey,
					dayFlowList: []
				};
			}

			// 添加记录到对应日期
			const isExpense = parseFloat(record.money) < 0;
			const money = Math.abs(utils.fenToYuanNumber(record.money));

			// 更新收入/支出
			if (isExpense) {
				monthData.expense += money;
			} else {
				monthData.revenue += money;
			}
			// 添加到每日列表
			monthData.flow[dayKey].dayFlowList.push({
				id: record.id,
				category_id: record.category_id,
				category: categoryMap[record.category_id].category,
				money: utils.fenToYuanString(record.money),
				info: record.accountName + ' ' + minuteTime,
				account_id: record.account_id,
				icon: categoryMap[record.category_id].icon,
				comment: record.comment,
			});
		});

		// 转换为最终格式并计算净收入
		Object.assign(monthFlows, Object.values(monthlyData).map(month => {
			// 计算净收入
			month.netIncome = utils.keep2DigitsString(month.revenue - month.expense);
			// 格式化收入/支出为两位小数
			month.revenue = utils.keep2DigitsString(month.revenue);
			month.expense = utils.keep2DigitsString(month.expense);

			// 将 flow 对象转换为数组并按日期排序
			month.flow = Object.values(month.flow).sort((a, b) => {
				const dayA = parseInt(a.day);
				const dayB = parseInt(b.day);
				return dayB - dayA; // 降序排列（最新日期在前）
			});

			return month;
		}))

		if (monthFlows[0]) {
			firstMonth.value = [monthFlows[0].month]
		}
	})

	const $refs = getCurrentInstance().proxy.$refs;

	const handleDelete = async (detail, monthItem, dayList, index1) => {
		try {
			// 先关闭所有滑动项
			flowListRefs.value.forEach(ref => {
				if (ref && ref.closeAll) {
					ref.closeAll()
				}
			})

			await dbService.deleteTallyBill(detail.id);
			dayList.dayFlowList.splice(index1, 1);

			const money = detail.money;
			if (money < 0) {
				monthItem.expense -= Math.abs(money);
			} else {
				monthItem.revenue -= money;
			}

			monthItem.netIncome = (monthItem.revenue - monthItem.expense).toFixed(2);
			monthItem.revenue = parseFloat(monthItem.revenue).toFixed(2);
			monthItem.expense = parseFloat(monthItem.expense).toFixed(2);

			if (account_id.value) {
				const currentAssets = utils.yuanToFenNumber(totalAssets.value);
				const deletedMoney = utils.yuanToFenNumber(money);
				totalAssets.value = utils.fenToYuanString(currentAssets - deletedMoney);
			}

			if (dayList.dayFlowList.length === 0) {
				const dayIndex = monthItem.flow.findIndex(f => f.day === dayList.day);
				if (dayIndex !== -1) {
					monthItem.flow.splice(dayIndex, 1);
				}
			}
		} catch (e) {
			console.log(e)
			uni.showToast({
				title: '删除失败:' + e,
				icon: 'none'
			});
		}
	};
</script>

<style>
	.overview {
		border-bottom: 1px solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.date-section {
		margin-left: 12rpx;
		padding: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.month {
		font-size: 16px;
		color: #333333;
		font-weight: 500;
	}

	.year {
		font-size: 11px;
		color: #666666;
	}

	.day {
		margin-left: 12rpx;
		padding: 12rpx;
		font-size: 12px;
		color: #666666;
	}

	.amount-section {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 10px;
	}

	.income-total {
		display: flex;
		align-items: baseline;
	}

	.right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
	}

	.income-color {
		color: #ef4352;
	}

	.outcome-color {
		color: #2db2d0;
	}

	.detail-footer {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		min-width: 80px;
	}

	.money-font {
		font-size: 16px;
		padding-top: 12rpx;
	}

	.balance-font {
		gap: 6rpx;
		color: #887c77;
		align-items: center;
		padding-bottom: 12rpx;
	}
</style>