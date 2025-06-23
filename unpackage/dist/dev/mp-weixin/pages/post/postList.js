"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      postList: []
    };
  },
  onLoad: function() {
    common_vendor.index.request({
      url: "http://localhost:8000/post/matchPost",
      method: "GET",
      data: {
        tagNameList: "电影,看电影",
        startTime: "1975-10-11 10:15:18",
        endTime: "1997-02-01 00:00:00",
        pageNum: 1,
        pageSize: 10
      },
      header: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + common_vendor.index.getStorageSync("access_token")
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at pages/post/postList.vue:39", res);
        this.postList = res.data.data;
      },
      fail: () => {
      },
      complete: () => {
      }
    });
  },
  methods: {
    openPostDetail(e) {
      var postId = e.currentTarget.dataset.postid;
      common_vendor.index.navigateTo({
        url: "/pages/post/postDetail?postId=" + postId
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.postList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.content),
        c: item.id,
        d: common_vendor.o((...args) => $options.openPostDetail && $options.openPostDetail(...args), item.id),
        e: item.id
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/post/postList.js.map
