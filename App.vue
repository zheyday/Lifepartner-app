<script>
	import DBService from '@/common/dbService.js'

	const dbService = new DBService()

	export default {
		onLaunch: function() {
			// console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			dbService.initDB()

			// 检查登录状态并设置tabBar
			this.checkLoginStatus()
		},
		onShow: function() {
			// 每次显示应用时检查登录状态
			this.checkLoginStatus()
		},
		onHide: function() {
			// console.log('App Hide')
		},
		methods: {
			// 检查登录状态并设置tabBar
			checkLoginStatus() {
				const user_id = uni.getStorageSync('user_id')
				const tabBarIndex = 2 // "我的"选项卡的索引

				// 无论是否登录，都保持tabBar指向用户中心，在用户中心页面内部处理登录检查
				uni.setTabBarItem({
					index: tabBarIndex,
					pagePath: 'pages/user-center/user-center',
					text: '我的'
				})
			}
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	@import './common/uni.css';
	@import './common/css/custom-global.css';

	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>