<template>
	<view class="container">
		<view v-for="(item,index) in items">
			<uni-collapse class="card" v-model="value">
				<uni-collapse-item :title="item.month" :name="item.month">
					<!-- 月份和收支概览 -->
					<template v-slot:title>
						<view class="overview">
							<view class="date-section">
								<view class="month">{{item.month}}</view>
								<view class="year">2025</view>
							</view>

							<view class="amount-section">
								<view class="income-total">
									<view>净收入&nbsp;</view>
									<view class="money-font" :style="{ color: item.netIncome > 0 ? 'red' : 'green' }">
										{{item.netIncome}}
									</view>
								</view>

								<view class="income-expense balance-font">
									<text>收入 {{item.revenue}}</text>
									<text>支出 {{item.expense}}</text>
								</view>
							</view>
						</view>
					</template>

					<!-- 每笔流水 -->
					<view v-for="(dayList, index) in item.flow">
						<view>{{dayList.day}}</view>

						<uni-swipe-action ref="swipeAction">
							<uni-swipe-action-item v-for="(detail, index1) in dayList.dayFlowList" :key="index1"
								:right-options="[
				{ text: '删除', style: { backgroundColor: 'red', color: '#fff' } }
			]" @click="() => handleDelete(detail, item, dayList, index1)">
								<view class="uni-list-item">
									<view class="uni-list-item__content">
										<view class="uni-list-item__title">{{ detail.category }}</view>
										<view class="uni-list-item__note">{{ detail.time }}</view>
									</view>
									<view class="detail-footer">
										<text class="money-font" :style="{ color: detail.money > 0 ? 'red' : 'green' }">
											{{ detail.money }}
										</text>
									</view>
								</view>
							</uni-swipe-action-item>
						</uni-swipe-action>

					</view>

				</uni-collapse-item>
			</uni-collapse>
		</view>

		<wd-fab :expandable="false" @click="handleClick"></wd-fab>
	</view>
</template>

<script setup>
	import {
		reactive
	} from 'vue'
	import DBService from '@/common/dbService.js'

	const dbService = new DBService()
	const swipeAction = ref()

	const handleClick = () => {
		uni.navigateTo({
			url: `/pages/settle-account/create-flow?account_id=${account_id.value}`
		})
	}

	const items = reactive([])
	const value = ref();
	const account_id = ref(0);

	onLoad((options) => {
		account_id.value = options.account_id
	})
	onShow(async () => {
		const result = await dbService.getTallyBill(account_id.value)
		const categoryResult = await dbService.getTallyCategory()
		const categoryMap = {};
		categoryResult.forEach(row => {
			categoryMap[row.id] = row.category;
		});
		// 按年月分组数据
		const monthlyData = {};
		result.forEach(record => {
			const date = new Date(record.bill_date);
			const year = date.getFullYear();
			const month = date.getMonth() + 1; // 月份从 0 开始
			const day = date.getDate();
			const timeStr =
				`${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

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
			const money = Math.abs(parseFloat(record.money));

			// 更新收入/支出
			if (isExpense) {
				monthData.expense += money;
			} else {
				monthData.revenue += money;
			}
			// 添加到每日列表
			monthData.flow[dayKey].dayFlowList.push({
				id: record.id,
				category: categoryMap[record.category_id],
				money: record.money.toFixed(2),
				time: timeStr
			});
		});

		// 转换为最终格式并计算净收入
		Object.assign(items, Object.values(monthlyData).map(month => {
			// 计算净收入
			month.netIncome = (month.revenue - month.expense).toFixed(2);
			// 格式化收入/支出为两位小数
			month.revenue = month.revenue.toFixed(2);
			month.expense = month.expense.toFixed(2);

			// 将 flow 对象转换为数组并按日期排序
			month.flow = Object.values(month.flow).sort((a, b) => {
				const dayA = parseInt(a.day);
				const dayB = parseInt(b.day);
				return dayB - dayA; // 降序排列（最新日期在前）
			});

			return month;
		}))
	})

	const $refs = getCurrentInstance().proxy.$refs;

	const handleDelete = async (detail, monthItem, dayList, index1) => {
		try {
			if (swipeAction.value) {
				// 如果 swipeAction 是数组
				if (Array.isArray(swipeAction.value)) {
					swipeAction.value.forEach(action => {
						if (action && action.closeAll) {
							action.closeAll()
						}
					})
				} else {
					// 如果 swipeAction 是单个对象
					if (swipeAction.value.closeAll) {
						swipeAction.value.closeAll()
					}
				}
			}

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
	.container {
		padding: 15px;
	}

	.overview {
		border-bottom: 1px solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.uni-list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background-color: #fff;
		border-bottom: 1px solid #eee;
	}

	.uni-list-item__content {
		display: flex;
		flex-direction: column;
	}

	.uni-list-item__title {
		font-size: 14px;
		font-weight: 500;
	}

	.uni-list-item__note {
		font-size: 12px;
		color: #999;
	}


	.date-section {
		padding: 10rpx;
		display: flex;
		flex-direction: column;
	}

	.month {
		font-size: 16px;
		color: #333333;
		font-weight: bold;
		margin-right: 20rpx;
	}

	.year {
		font-size: 12px;
		color: #666666;
	}

	.amount-section {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 12px;
	}

	.income-total {
		display: flex;
		align-items: baseline;
	}

	.income-expense {
		display: flex;
		gap: 6rpx;
	}

	.right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8rpx;
	}

	.detail-footer {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.money-font {
		font-size: 16px;
	}

	.balance-font {
		font-size: 12px;
		color: #887c77;
	}
</style>