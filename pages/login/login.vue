<template>
	<view>
		<form>
			<input type="text" class="uni-input" id="phone" v-model="phone" placeholder="手机号">
			<br>
			<view class="uni-input-wrapper">
				<input class="uni-input" id="password" v-model="password" placeholder="密码" :password="showPassword" @click="login">
				<text class="uni-icon" :class="[!showPassword ? 'uni-eye-active' : '']"
										@click="changePassword">&#xe568;
				</text>
			</view>
			
			<br>
			<button type="primary" @click="login">登录</button>
		</form>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				phone: '',
				password: '',
				showPassword: true
			}
		},
		methods: {
			login() {
				// 可以在这里发送登录请求等操作
				uni.request({
					url: 'http://localhost:9120/oauth/token?grant_type=password&scope=app&client_id=zcs&client_secret=zcs',
					method: 'POST',
					data: {
						username: this.phone,
						password: this.password,
					},
					header: {
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					success: res => {
						console.log(res)
						if (res.statusCode == 200){
							uni.setStorageSync('access_token', res.data.access_token)
							uni.setStorageSync('refresh_token', res.data.refresh_token)
							uni.redirectTo({
								url: '/pages/post/postList'
							})
						}
					},
					fail: () => {
						console.log('')
					},
					complete: () => {}
				});
			},
			changePassword: function() {
				this.showPassword = !this.showPassword;
			}
		}
	}
</script>

<style lang="scss">

</style>