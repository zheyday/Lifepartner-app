<template>
	<view class="content">
		<view class="uni-list">
			<view class="uni-list-cell" v-for="(item, index) in postList" :key="item.id" @tap="openPostDetail" :data-postid="item.id">
				<view class="uni-media-list">
					<view class="uni-media-list-body">
						<view class="uni-media-list-text-top">{{item.title}}</view>
						<view class="uni-media-list-text-bottom">{{item.content}}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				postList: []
			}
		},
		onLoad: function() {
			uni.request({
				url: 'http://localhost:8000/post/matchPost',
				method: 'GET',
				data: {
					tagNameList: '电影,看电影',
					startTime: '1975-10-11 10:15:18',
					endTime: '1997-02-01 00:00:00',
					pageNum: 1,
					pageSize: 10
				},
				header: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + uni.getStorageSync('access_token')
				},
				success: res => {
					console.log(res)
					this.postList = res.data.data
				},
				fail: () => {},
				complete: () => {}
			});
		},
		methods: {
			openPostDetail(e) {
				var postId = e.currentTarget.dataset.postid;
				uni.navigateTo({
					url: '/pages/post/postDetail?postId='+postId,
				});
			}
		}
	}
</script>

<style>

</style>