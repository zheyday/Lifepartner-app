"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_wd_collapse_item2 = common_vendor.resolveComponent("wd-collapse-item");
  const _easycom_wd_collapse2 = common_vendor.resolveComponent("wd-collapse");
  (_easycom_wd_collapse_item2 + _easycom_wd_collapse2)();
}
const _easycom_wd_collapse_item = () => "../../uni_modules/wot-design-uni/components/wd-collapse-item/wd-collapse-item.js";
const _easycom_wd_collapse = () => "../../uni_modules/wot-design-uni/components/wd-collapse/wd-collapse.js";
if (!Math) {
  (_easycom_wd_collapse_item + _easycom_wd_collapse)();
}
const _sfc_main = {
  __name: "settle-account-flow",
  setup(__props) {
    const value = common_vendor.ref(["item1", "item2"]);
    const items = common_vendor.ref(
      [
        {
          title: "3月",
          list: ["1", "2"]
        },
        {
          title: "2月",
          list: ["3", "4"]
        }
      ]
    );
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(common_vendor.unref(items), (item, k0, i0) => {
          return {
            a: common_vendor.f(item.list, (item2, itemIndex, i1) => {
              return {
                a: common_vendor.t(item2),
                b: itemIndex
              };
            }),
            b: "ba03400a-1-" + i0 + "," + ("ba03400a-0-" + i0),
            c: common_vendor.p({
              title: item.title,
              name: item.title
            }),
            d: "ba03400a-0-" + i0
          };
        }),
        b: common_vendor.o(($event) => common_vendor.isRef(value) ? value.value = $event : null),
        c: common_vendor.p({
          modelValue: common_vendor.unref(value)
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settle-account/settle-account-flow.js.map
