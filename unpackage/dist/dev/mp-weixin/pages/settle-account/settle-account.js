"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 模拟数据
      cards: [
        {
          title: "卡片1",
          items: [
            {
              text: "Account1",
              balance: "12000"
            },
            {
              text: "Account2",
              balance: "66000"
            },
            {
              text: "Account3",
              balance: "888000"
            }
          ]
        },
        {
          title: "卡片2",
          items: [
            {
              text: "项目A",
              balance: "999000"
            },
            {
              text: "项目B",
              balance: "888000"
            }
          ]
        }
        // 可以继续添加更多卡片和项目
      ]
    };
  }
};
if (!Array) {
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.cards, (card, index, i0) => {
      return {
        a: common_vendor.t(card.title),
        b: common_vendor.f(card.items, (item, itemIndex, i1) => {
          return {
            a: "15f25d90-1-" + i0 + "-" + i1 + "," + ("15f25d90-0-" + i0 + "-" + i1),
            b: common_vendor.p({
              showArrow: true,
              title: item.text,
              rightText: item.balance
            }),
            c: itemIndex,
            d: "15f25d90-0-" + i0 + "-" + i1
          };
        }),
        c: index
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settle-account/settle-account.js.map
