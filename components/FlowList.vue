<template>
	<uni-swipe-action ref="swipeActionRef">
		<uni-swipe-action-item ref="swipeItems" v-for="(detail, index) in flowList" :key="index" :right-options="[
	        { text: '删除', style: { backgroundColor: 'red', color: '#fff' } }
	      ]" @change="(e) => swipeChange(e, index)" @click="() => emitDelete(detail, index)">
			<view class="uni-list-item" @click="emitClick(detail)">
				<view class="item-left">
					<wd-icon :name="detail.icon" size="22px" />
					<view class="uni-list-item__content">
						<view class="uni-list-item__title">{{ detail.category }}</view>
						<view v-if="detail.comment" class="uni-list-item__note">{{ detail.comment }}</view>
						<view class="uni-list-item__note">{{ detail.info }}</view>
					</view>
					<view class="detail-footer">
						<text class="money-font" :style="getNetIncomeColor(detail.money)">
							{{ detail.money }}
						</text>
					</view>
				</view>
			</view>
		</uni-swipe-action-item>
	</uni-swipe-action>
</template>

<script setup>
	import {
		ref
	} from 'vue'

	const props = defineProps({
		flowList: {
			type: Array,
			required: true
		},
		groupId: {
			type: String,
			default: ''
		}
	})

	const emits = defineEmits(['delete', 'click', 'swipe-open'])

	function emitDelete(detail, index) {
		emits('delete', {
			detail,
			index
		})
	}

	function emitClick(detail) {
		emits('click', detail)
	}

	function getNetIncomeColor(value) {
		return {
			color: value > 0 ? '#ef4352' : '#2db2d0'
		};
	}

	const swipeItems = ref([])
	const swipeActionRef = ref(null)

	const closeAll = () => {
		if (swipeActionRef.value) {
			swipeActionRef.value.closeAll()
		}
	}

	defineExpose({
		closeAll,
		groupId: props.groupId
	})

	const swipeChange = (e, index) => {
		if (e !== 'none') {
			emits('swipe-open', props.groupId)
		}
	}
</script>

<style>
	.uni-list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		background-color: #fff;
		border-bottom: 1px solid #f7f7f7;
	}

	.item-left {
		display: flex;
		align-items: flex-start;
		flex: 1;
	}

	.uni-list-item__content {
		display: flex;
		flex-direction: column;
		margin-left: 12px;
		flex: 1;
	}

	.uni-list-item__title {
		font-size: 15px;
		font-weight: 400;
		line-height: 1.4;
	}

	.uni-list-item__note {
		font-size: 12px;
		color: #999;
		line-height: 1.4;
		margin-top: 2px;
	}
</style>