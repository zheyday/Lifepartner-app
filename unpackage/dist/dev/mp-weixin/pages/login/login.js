"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      phone: "",
      password: "",
      showPassword: true
    };
  },
  methods: {
    login() {
      common_vendor.index.request({
        url: "http://localhost:9120/oauth/token?grant_type=password&scope=app&client_id=zcs&client_secret=zcs",
        method: "POST",
        data: {
          username: this.phone,
          password: this.password
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/login/login.vue:42", res);
          if (res.statusCode == 200) {
            common_vendor.index.setStorageSync("access_token", res.data.access_token);
            common_vendor.index.setStorageSync("refresh_token", res.data.refresh_token);
            common_vendor.index.redirectTo({
              url: "/pages/post/postList"
            });
          }
        },
        fail: () => {
          common_vendor.index.__f__("log", "at pages/login/login.vue:52", "");
        },
        complete: () => {
        }
      });
    },
    changePassword: function() {
      this.showPassword = !this.showPassword;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.phone,
    b: common_vendor.o(($event) => $data.phone = $event.detail.value),
    c: $data.showPassword,
    d: common_vendor.o((...args) => $options.login && $options.login(...args)),
    e: $data.password,
    f: common_vendor.o(($event) => $data.password = $event.detail.value),
    g: common_vendor.n(!$data.showPassword ? "uni-eye-active" : ""),
    h: common_vendor.o((...args) => $options.changePassword && $options.changePassword(...args)),
    i: common_vendor.o((...args) => $options.login && $options.login(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
