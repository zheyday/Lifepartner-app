<template>
	<view class="container">
		<view class="header-section">
			<view class="status_bar">
				<!-- 这里是状态栏 -->
			</view>

			<view class="total-money">
				<text>{{totalAssets}}</text>
				<text class="total-money-name">净资产</text>
			</view>
		</view>

		<!-- 账户分组卡片 -->
		<view class="card" v-for="(card, index) in cards" :key="index">
			<!-- 标题 -->
			<view class="card-header">
				{{ card.title }}
			</view>

			<uni-swipe-action ref="swipeAction">
				<uni-swipe-action-item v-for="(accountItem, itemIndex) in card.items" :key="itemIndex" :right-options="[
					{ text: '编辑', style: { backgroundColor: '#0b95ff', color: '#fff' } },
					{ text: '删除', style: { backgroundColor: 'red', color: '#fff' } }
				]" @change="(e) => swipeChange(e, index)" @click="(e) => handleSwipeClick(e, accountItem, card, itemIndex)">
					<view class="account-item" @click="closeAllAndNavigate(accountItem.id)">
						<view class="account-left">
							<wd-icon :name="accountItem.icon" />
							<text class="account-name">{{ accountItem.account_name }}</text>
						</view>
						<view class="account-right">
							<text class="account-balance">{{ accountItem.balance }}</text>
							<text class="arrow">></text>
						</view>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
		</view>

		<wd-fab :draggable="true" :expandable="false" @click="handleClick"></wd-fab>
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive,
		computed,
		ref
	} from 'vue';
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import DBService from '@/common/dbService.js'
	import {
		authUtils
	} from '@/common/utils.js'
	import {
		checkCurrentPageAuth
	} from '@/common/authGuard.js'

	const dbService = new DBService()

	const handleClick = () => {
		uni.navigateTo({
			url: '/pages/settle-account/account-create'
		})
	}

	const navigateToFlow = (accountId) => {
		uni.navigateTo({
			url: `/pages/settle-account/flow?account_id=${accountId}`
		})
	}

	const closeAllAndNavigate = (accountId) => {
		// 先关闭所有滑动项
		if (swipeAction.value && swipeAction.value.length > 0) {
			for (let i = 0; i < swipeAction.value.length; i++) {
				if (swipeAction.value[i] && swipeAction.value[i].closeAll) {
					swipeAction.value[i].closeAll()
				}
			}
		}
		// 再跳转
		navigateToFlow(accountId)
	}

	// 计算总资产
	const totalAssets = computed(() => {
		let total = 0
		cards.forEach(card => {
			card.items.forEach(item => {
				total += parseFloat(item.balance) || 0
			})
		})
		return total.toFixed(2)
	})

	var cards = reactive([])

	// 页面加载时检查登录状态
	onLoad((options) => {
		// if (!checkCurrentPageAuth('/pages/settle-account/settle-account')) {
		// 	return
		// }
	})

	async function loadAccounts() {
		const user_id = authUtils.getCurrentUserId()
		const accounts = await dbService.getTallyAccount(user_id)
		for (var account of accounts) {
			const tallBill = await dbService.getTallyBillByAccountId(account.id)
			account.balance = utils.fenToYuanString(account.balance + tallBill.reduce((balance, item) => {
				return balance + item.money
			}, 0))
		}
		const groupData = Array.from(
			accounts.reduce((map, item) => {
				const key = item.account_type;
				if (!map.has(key)) map.set(key, []);
				map.get(key).push(item);
				return map;
			}, new Map()),
			([title, items]) => ({
				title,
				items
			})
		)
		cards.splice(0, cards.length, ...groupData)
	}

	onShow(loadAccounts)

	onPullDownRefresh(async () => {
		if (!checkCurrentPageAuth('/pages/settle-account/settle-account')) {
			uni.stopPullDownRefresh();
			return;
		}

		await loadAccounts();
		uni.stopPullDownRefresh();
	})

	const swipeAction = ref()

	const swipeChange = (e, index) => {
		if (e !== 'none' && swipeAction.value && swipeAction.value.length > 0) {
			for (let i = 0; i < swipeAction.value.length; i++) {
				if (i !== index && swipeAction.value[i] && swipeAction.value[i].closeAll) {
					swipeAction.value[i].closeAll()
				}
			}
		}
	}

	const handleSwipeClick = (e, account, card, index) => {
		const {
			index: buttonIndex
		} = e
		if (buttonIndex === 0) {
			// 编辑
			navigateToEdit(account)
		} else if (buttonIndex === 1) {
			// 删除
			handleDelete(account, card, index)
		}
	}

	const navigateToEdit = (account) => {
		uni.navigateTo({
			url: `/pages/settle-account/account-create?id=${account.id}&accountName=${encodeURIComponent(account.account_name)}&balance=${account.balance}&accountType=${encodeURIComponent(account.account_type)}&icon=${encodeURIComponent(account.icon || '')}`
		})
	}

	const handleDelete = async (account, card, index) => {
		try {
			if (swipeAction.value && swipeAction.value.length > 0) {
				for (let i = 0; i < swipeAction.value.length; i++) {
					if (swipeAction.value[i] && swipeAction.value[i].closeAll) {
						swipeAction.value[i].closeAll()
					}
				}
			}

			await Promise.all([
				dbService.deleteById('tally_account', account.id),
				dbService.deleteTallyBillByAccount(account.id)
			]);
			card.items.splice(index, 1);
			const cardIndex = cards.findIndex(c => c.title === card.title);
			if (card.items.length === 0 && cardIndex !== -1) {
				cards.splice(cardIndex, 1);
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
	.account-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx;
		background-color: #fff;
		border-bottom: 1px solid #f0f0f0;
	}

	.account-left {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.account-name {
		font-size: 32rpx;
		color: #333;
		margin-left: 10rpx;
	}

	.account-right {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.account-balance {
		font-size: 32rpx;
		margin-right: 20rpx;
	}

	.arrow {
		font-size: 32rpx;
		color: #999;
	}
</style>