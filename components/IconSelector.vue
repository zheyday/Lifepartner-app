<template>
	<view>
		<!-- 图标显示区域 -->
		<wd-cell is-link @click="showPicker = true" center>
		    <template #title>
				<text style="font-size: 28rpx;">{{ label }}</text>
			</template>
			<template v-if="modelValue">
				<image :src="modelValue" class="selected-icon" mode="aspectFit" />
			</template>
			<template v-else>
				<text>{{ placeholder }}</text>
			</template>
		</wd-cell>

		<!-- 图标选择弹窗 -->
		<wd-popup v-model="showPicker" position="bottom" :close-on-click-modal="true">
			<view class="icon-grid">
				<view v-for="(icon, index) in iconList" :key="index" class="icon-item"
					:class="{ 'icon-item-selected': modelValue === icon.path }" @click="selectIcon(icon.path)">
					<wd-icon :name="icon.path" size='46rpx' />
				</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'

	const props = defineProps({
		modelValue: {
			type: String,
			default: ''
		},
		label: {
			type: String,
			default: '图标'
		},
		placeholder: {
			type: String,
			default: '请选择图标'
		},
		iconSize: {
			type: String,
			default: '36rpx'
		}
	})

	const emit = defineEmits(['update:modelValue'])

	const showPicker = ref(false)

	// 使用 import.meta.glob 自动加载所有图标
	const iconModules = import.meta.glob('/static/icons/*.(png|svg)', {
		eager: true,
		query: '?url',
		import: 'default'
	})

	const iconList = ref(
		Object.keys(iconModules).map(path => {
			return {
				path: path
			}
		})
	)

	const selectIcon = (iconPath) => {
		emit('update:modelValue', iconPath)
		showPicker.value = false
	}
</script>

<style scoped>
	.icon-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 24rpx;
		padding: 32rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	.icon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		padding: 24rpx 16rpx;
		border-radius: 16rpx;
		background: #f8f9fa;
		transition: all 0.3s;
	}

	.icon-item:active {
		background: #e9ecef;
		transform: scale(0.95);
	}

	.icon-item-selected {
		background: #e3f2fd;
		border: 2px solid #2196F3;
	}

	.selected-icon {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		margin-left: auto;
	}
</style>
