"use strict";
const uni_modules_wotDesignUni_components_common_props = require("../common/props.js");
const COLLAPSE_KEY = Symbol("wd-collapse");
const collapseProps = {
  ...uni_modules_wotDesignUni_components_common_props.baseProps,
  /**
   * 查看更多模式下的插槽外部自定义样式
   */
  customMoreSlotClass: uni_modules_wotDesignUni_components_common_props.makeStringProp(""),
  /**
   * 绑定值
   */
  modelValue: {
    type: [String, Array, Boolean]
  },
  /**
   * 手风琴模式
   */
  accordion: uni_modules_wotDesignUni_components_common_props.makeBooleanProp(false),
  /**
   * 查看更多的折叠面板
   */
  viewmore: uni_modules_wotDesignUni_components_common_props.makeBooleanProp(false),
  /**
   * 查看更多的自定义插槽使用标志
   */
  useMoreSlot: uni_modules_wotDesignUni_components_common_props.makeBooleanProp(false),
  /**
   * 查看更多的折叠面板，收起时的显示行数
   */
  lineNum: uni_modules_wotDesignUni_components_common_props.makeNumberProp(2)
};
exports.COLLAPSE_KEY = COLLAPSE_KEY;
exports.collapseProps = collapseProps;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/wot-design-uni/components/wd-collapse/types.js.map
