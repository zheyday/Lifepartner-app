"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      title: "",
      content: ""
    };
  },
  onLoad: function(e) {
    common_vendor.index.request({
      url: "http://localhost:8000/post/getPostById",
      method: "GET",
      data: {
        postId: e.postId
      },
      header: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + common_vendor.index.getStorageSync("access_token")
      },
      success: (res) => {
        this.title = res.data.data.title;
        this.content = res.data.data.content;
      },
      fail: () => {
      }
    });
  },
  methods: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.title),
    b: common_vendor.t($data.content)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/post/postDetail.js.map
