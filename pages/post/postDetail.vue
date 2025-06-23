<template>
	<view class="content">
		<view class="title">{{title}}</view>
		<view class="content">{{content}}</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '',
				content: ''
			}
		},
		onLoad: function(e) {
			uni.request({
				url: 'http://localhost:8000/post/getPostById',
				method: 'GET',
				data: {
					postId : e.postId
				},
				header: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + uni.getStorageSync('access_token')
				},
				success: res => {
					this.title = res.data.data.title
					this.content = res.data.data.content
				},
				fail: () => {
				}
			});
		},
		methods: {

		}
	}
</script>
<style>
.content{padding:10upx 2%; width: 96%; flex-wrap: wrap;}
.title{line-height: 2em; font-weight: 700; font-size: 38upx;}
</style>