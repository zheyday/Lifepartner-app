"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_wotDesignUni_components_wdCollapse_types = require("./types.js");
const uni_modules_wotDesignUni_components_composables_useChildren = require("../composables/useChildren.js");
const uni_modules_wotDesignUni_components_common_util = require("../common/util.js");
const uni_modules_wotDesignUni_components_composables_useTranslate = require("../composables/useTranslate.js");
if (!Math) {
  wdIcon();
}
const wdIcon = () => "../wd-icon/wd-icon.js";
const __default__ = {
  name: "wd-collapse",
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  props: uni_modules_wotDesignUni_components_wdCollapse_types.collapseProps,
  emits: ["change", "update:modelValue"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { translate } = uni_modules_wotDesignUni_components_composables_useTranslate.useTranslate("collapse");
    const contentLineNum = common_vendor.ref(0);
    const { linkChildren, children } = uni_modules_wotDesignUni_components_composables_useChildren.useChildren(uni_modules_wotDesignUni_components_wdCollapse_types.COLLAPSE_KEY);
    linkChildren({ props, toggle });
    common_vendor.watch(
      () => props.modelValue,
      (newVal) => {
        const { viewmore, accordion } = props;
        if (accordion && typeof newVal !== "string") {
          common_vendor.index.__f__("error", "at uni_modules/wot-design-uni/components/wd-collapse/wd-collapse.vue:67", "accordion value must be string");
        } else if (!accordion && !viewmore && !uni_modules_wotDesignUni_components_common_util.isArray(newVal)) {
          common_vendor.index.__f__("error", "at uni_modules/wot-design-uni/components/wd-collapse/wd-collapse.vue:69", "value must be Array");
        }
      },
      { deep: true }
    );
    common_vendor.watch(
      () => props.lineNum,
      (newVal) => {
        if (newVal <= 0) {
          common_vendor.index.__f__("error", "at uni_modules/wot-design-uni/components/wd-collapse/wd-collapse.vue:79", "lineNum must greater than 0");
        }
      },
      { deep: true, immediate: true }
    );
    common_vendor.onBeforeMount(() => {
      const { lineNum, viewmore, modelValue } = props;
      contentLineNum.value = viewmore && !modelValue ? lineNum : 0;
    });
    function updateChange(activeNames) {
      emit("update:modelValue", activeNames);
      emit("change", {
        value: activeNames
      });
    }
    function toggle(name, expanded) {
      const { accordion, modelValue } = props;
      if (accordion) {
        updateChange(name === modelValue ? "" : name);
      } else if (expanded) {
        updateChange(modelValue.concat(name));
      } else {
        updateChange(modelValue.filter((activeName) => activeName !== name));
      }
    }
    const toggleAll = (options = {}) => {
      if (props.accordion) {
        return;
      }
      if (uni_modules_wotDesignUni_components_common_util.isBoolean(options)) {
        options = { expanded: options };
      }
      const { expanded, skipDisabled } = options;
      const names = [];
      children.forEach((item, index) => {
        if (item.disabled && skipDisabled) {
          if (item.$.exposed.getExpanded()) {
            names.push(item.name || index);
          }
        } else if (uni_modules_wotDesignUni_components_common_util.isDef(expanded) ? expanded : !item.$.exposed.getExpanded()) {
          names.push(item.name || index);
        }
      });
      updateChange(names);
    };
    function handleMore() {
      emit("update:modelValue", !props.modelValue);
      emit("change", {
        value: !props.modelValue
      });
    }
    __expose({
      toggleAll
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !_ctx.viewmore
      }, !_ctx.viewmore ? {} : common_vendor.e({
        b: common_vendor.n(`wd-collapse__content ${!_ctx.modelValue ? "is-retract" : ""} `),
        c: common_vendor.s(`-webkit-line-clamp: ${contentLineNum.value}; -webkit-box-orient: vertical`),
        d: _ctx.useMoreSlot
      }, _ctx.useMoreSlot ? {
        e: common_vendor.n(_ctx.customMoreSlotClass)
      } : {
        f: common_vendor.t(!_ctx.modelValue ? common_vendor.unref(translate)("expand") : common_vendor.unref(translate)("retract")),
        g: common_vendor.p({
          name: "arrow-down"
        }),
        h: common_vendor.n(`wd-collapse__arrow ${_ctx.modelValue ? "is-retract" : ""}`)
      }, {
        i: common_vendor.o(handleMore)
      }), {
        j: common_vendor.n(`wd-collapse ${_ctx.viewmore ? "is-viewmore" : ""} ${_ctx.customClass}`),
        k: common_vendor.s(_ctx.customStyle)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b3a2d45a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/wot-design-uni/components/wd-collapse/wd-collapse.js.map
