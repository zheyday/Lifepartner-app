"use strict";
const uni_modules_wotDesignUni_components_common_props = require("../common/props.js");
const collapseItemProps = {
  ...uni_modules_wotDesignUni_components_common_props.baseProps,
  /**
   * 自定义折叠栏内容容器样式类名
   */
  customBodyClass: uni_modules_wotDesignUni_components_common_props.makeStringProp(""),
  /**
   * 自定义折叠栏内容容器样式
   */
  customBodyStyle: uni_modules_wotDesignUni_components_common_props.makeStringProp(""),
  /**
   * 折叠栏的标题, 可通过 slot 传递自定义内容
   */
  title: uni_modules_wotDesignUni_components_common_props.makeStringProp(""),
  /**
   * 禁用折叠栏
   */
  disabled: uni_modules_wotDesignUni_components_common_props.makeBooleanProp(false),
  /**
   * 折叠栏的标识符
   */
  name: uni_modules_wotDesignUni_components_common_props.makeRequiredProp(String),
  /**
   * 打开前的回调函数，返回 false 可以阻止打开，支持返回 Promise
   */
  beforeExpend: Function
};
exports.collapseItemProps = collapseItemProps;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/wot-design-uni/components/wd-collapse-item/types.js.map
