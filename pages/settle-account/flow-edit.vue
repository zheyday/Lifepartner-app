<template>
	<wd-form ref="form" :model="model" :rules="rules">
		<wd-input label="金额" prop="balance" v-model="model.money" placeholder="0.00" type="number"></wd-input>
		<wd-input type="text" label="分类" v-model="categoryDisplay" readonly @click="showPopup = true" />
		<wd-picker label="账户" :columns="accountPicker" v-model="model.account"></wd-picker>
		<wd-datetime-picker v-model="model.billDate" label="时间" />
		<wd-input label="备注" v-model="model.comment" clearable />
		<view class="footer">
			<wd-button type="primary" size="large" @click="handleSubmit" block>保存</wd-button>
		</view>

		<!-- 分类选择弹窗 -->
		<CategorySelector v-model:showPopup="showPopup" :type="categoryType" @select="onCategorySelect" />
	</wd-form>
</template>

<script setup lang="ts">
	import { onMounted, reactive, ref, computed } from 'vue'
	import DBService from '@/common/dbService.js'
	import { authUtils } from '@/common/utils.js'
	import CategorySelector from '@/components/CategorySelector.vue'
	const dbService = new DBService()

	const tab = ref<number>(0)

	const accountPicker = reactive([])
	const model = reactive({
		money: '',
		category: '',
		account: '',
		comment: '',
		billDate: new Date().getTime(),
	})

	const rules : FormRules = {
		money: [{
			required: true,
			message: '请输入金额'
		}],
		category: [{
			required: true,
			message: '请选择分类'
		}],
		account: [{
			required: true,
			message: '请选择账户'
		}],
	}

	const showPopup = ref(false)
	const categoryDisplay = ref('')
	const categoryType = ref('expense')

	function onCategorySelect(category) {
		model.category = category.id
		categoryDisplay.value = category.name
		showPopup.value = false
	}



	const bill_id = ref(0);
	const account_id = ref(0);

	onLoad((options) => {
		bill_id.value = options.bill_id
		account_id.value = options.account_id
		categoryDisplay.value = options.category
	})

	onMounted(async () => {
		model.account = account_id.value
		if (bill_id.value) {
			const bills = await dbService.getTallyBillById(bill_id.value)
			const bill = bills[0]
			model.money = utils.fenToYuanString(Math.abs(bill.money))
			model.billDate = bill.bill_date
			model.category = bill.category_id
			model.comment = bill.comment
			categoryType.value = bill.money >= 0 ? 'income' : 'expense'
		}

		const user_id = authUtils.getCurrentUserId()
		const accountList = await dbService.getTallyAccount(user_id)
		accountList.forEach(item => {
			accountPicker.push({
				label: item.account_name,
				value: item.id
			})
		})
	})

	const form = ref<FormInstance>()
	function handleSubmit() {
		form
			.value!.validate()
			.then(async ({ valid, errors }) => {
				if (valid) {
					var categoryById = await dbService.getTallyCategoryById(model.category)
					const user_id = authUtils.getCurrentUserId()
					if (bill_id.value) {
						dbService.updateTallyBill(bill_id.value, model.account, utils.yuanToFenNumber(model.money) * categoryById[0].directory, model.billDate, model.category, model.comment)
					} else {
						dbService.insertTallyBill(model.account, utils.yuanToFenNumber(model.money) * categoryById[0].directory, model.billDate, model.category, model.comment, user_id)
					}
					uni.navigateBack({
						delta: 1
					})
				}
			})
			.catch((error) => {
				console.log(error, 'error')
			})
	}
</script>

<style scoped>
	.footer {
		padding: 20rpx 150rpx;
	}

	.popup-header {
		text-align: center;
		font-weight: bold;
		padding: 20rpx 0;
	}
</style>