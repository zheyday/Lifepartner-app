<template>
	<view class="container">
		<view>
			总资产 10000000.00
		</view>
		<!-- 卡片组件 -->
		<view class="card" v-for="(card, index) in cards" :key="index">
			<!-- 卡片标题 -->
			<view class="card-header">
				{{ card.title }}
			</view>

			<uni-swipe-action ref="swipeAction">
				<uni-swipe-action-item v-for="(accountItem, itemIndex) in card.items" :key="itemIndex" :right-options="[
					{ text: '删除', style: { backgroundColor: 'red', color: '#fff' } }
				]" @click="() => handleDelete(accountItem, card, itemIndex)">
					<wd-cell-group border>
						<wd-cell :border="true" :title="accountItem.account_name" :value="accountItem.balance" is-link
							:to="`/pages/settle-account/settle-account-flow?account_id=${accountItem.id}`" />
					</wd-cell-group>
				</uni-swipe-action-item>
			</uni-swipe-action>

		</view>

		<wd-fab :draggable="true" :expandable="false" @click="handleClick"></wd-fab>
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive
	} from 'vue';
	import DBService from '@/common/dbService.js'
	import {
		keep2DigitsString
	} from '@/common/util.js'

	const dbService = new DBService()

	const handleClick = () => {
		uni.navigateTo({
			url: '/pages/settle-account/create-account'
		})
	}

	var cards = reactive([])

	onLoad((options) => {
		setTimeout(function() {
			console.log('start pulldown');
		}, 1000);
		uni.startPullDownRefresh();
	})

	onShow(async () => {
		const result = await dbService.getTallyAccount()
		for (var account of result) {
			const tallBill = await dbService.getTallyBill(account.id)
			account.balance = keep2DigitsString(account.balance + tallBill.reduce((balance,
				item) => {
				return balance + item.money
			}, 0))
		}

		const groupData = Array.from(
			result.reduce((map, item) => {
				const key = item.account_type;
				// 如果 Map 中没有该类型，则初始化一个数组
				if (!map.has(key)) map.set(key, []);
				// 将当前项添加到对应类型的数组中
				map.get(key).push(item);
				return map;
			}, new Map()),
			// 将 Map 转换为所需的数组格式
			([title, items]) => ({
				title,
				items
			})
		);
		Object.assign(cards, groupData)
	})

	onPullDownRefresh(() => {
		setTimeout(() => {
			// 更新数据...

			// 必须调用此方法停止刷新动画
			uni.stopPullDownRefresh();
		}, 1000);
	})

	const $refs = getCurrentInstance().proxy.$refs;
	const swipeAction = ref()

	const handleDelete = async (detail, card, index) => {
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
			await dbService.deleteById('tally_account', detail.id);

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
	/* 基本样式 */
	.container {
		padding: 15px;
	}
</style>