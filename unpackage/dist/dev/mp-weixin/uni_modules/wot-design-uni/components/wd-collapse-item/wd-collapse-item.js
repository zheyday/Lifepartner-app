"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_wotDesignUni_components_common_util = require("../common/util.js");
const uni_modules_wotDesignUni_components_composables_useParent = require("../composables/useParent.js");
const uni_modules_wotDesignUni_components_wdCollapse_types = require("../wd-collapse/types.js");
const uni_modules_wotDesignUni_components_wdCollapseItem_types = require("./types.js");
if (!Math) {
  wdIcon();
}
const wdIcon = () => "../wd-icon/wd-icon.js";
const __default__ = {
  name: "wd-collapse-item",
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  props: uni_modules_wotDesignUni_components_wdCollapseItem_types.collapseItemProps,
  setup(__props, { expose: __expose }) {
    const collapseId = common_vendor.ref(`collapseId${uni_modules_wotDesignUni_components_common_util.uuid()}`);
    const props = __props;
    const { parent: collapse, index } = uni_modules_wotDesignUni_components_composables_useParent.useParent(uni_modules_wotDesignUni_components_wdCollapse_types.COLLAPSE_KEY);
    const height = common_vendor.ref("");
    const inited = common_vendor.ref(false);
    const expanded = common_vendor.ref(false);
    const { proxy } = common_vendor.getCurrentInstance();
    const isFirst = common_vendor.computed(() => {
      return index.value === 0;
    });
    const contentStyle = common_vendor.computed(() => {
      const style = {};
      if (inited.value) {
        style.transition = "height 0.3s ease-in-out";
      }
      if (!expanded.value) {
        style.height = "0px";
      } else if (height.value) {
        style.height = uni_modules_wotDesignUni_components_common_util.addUnit(height.value);
      }
      return uni_modules_wotDesignUni_components_common_util.objToStyle(style);
    });
    const isSelected = common_vendor.computed(() => {
      const modelValue = collapse ? (collapse == null ? void 0 : collapse.props.modelValue) || [] : [];
      const { name } = props;
      return uni_modules_wotDesignUni_components_common_util.isString(modelValue) && modelValue === name || uni_modules_wotDesignUni_components_common_util.isArray(modelValue) && modelValue.indexOf(name) >= 0;
    });
    common_vendor.watch(
      () => isSelected.value,
      (newVal) => {
        updateExpand(newVal);
      }
    );
    common_vendor.onMounted(() => {
      updateExpand(isSelected.value);
    });
    async function updateExpand(useBeforeExpand = true) {
      try {
        if (useBeforeExpand) {
          await handleBeforeExpand();
        }
        initRect();
      } catch (error) {
      }
    }
    function initRect() {
      uni_modules_wotDesignUni_components_common_util.getRect(`#${collapseId.value}`, false, proxy).then(async (rect) => {
        const { height: rectHeight } = rect;
        height.value = uni_modules_wotDesignUni_components_common_util.isDef(rectHeight) ? Number(rectHeight) : "";
        await uni_modules_wotDesignUni_components_common_util.pause();
        if (isSelected.value) {
          expanded.value = true;
        } else {
          expanded.value = false;
        }
        if (!inited.value) {
          inited.value = true;
        }
      });
    }
    function handleTransitionEnd() {
      if (expanded.value) {
        height.value = "";
      }
    }
    async function handleClick() {
      if (props.disabled)
        return;
      try {
        await updateExpand();
        const { name } = props;
        collapse && collapse.toggle(name, !expanded.value);
      } catch (error) {
      }
    }
    function handleBeforeExpand() {
      return new Promise((resolve, reject) => {
        const { name } = props;
        const nextexpanded = !expanded.value;
        if (nextexpanded && props.beforeExpend) {
          const response = props.beforeExpend(name);
          if (!response) {
            reject();
          }
          if (uni_modules_wotDesignUni_components_common_util.isPromise(response)) {
            response.then(() => resolve()).catch(reject);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }
    function getExpanded() {
      return expanded.value;
    }
    __expose({ getExpanded, updateExpand });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(_ctx.title),
        b: common_vendor.p({
          name: "arrow-down",
          ["custom-class"]: `wd-collapse-item__arrow ${expanded.value ? "is-retract" : ""}`
        }),
        c: common_vendor.r("title", {
          expanded: expanded.value,
          disabled: _ctx.disabled,
          isFirst: isFirst.value
        }),
        d: common_vendor.n(`wd-collapse-item__header ${expanded.value ? "is-expanded" : ""} ${isFirst.value ? "wd-collapse-item__header-first" : ""} ${_ctx.$slots.title ? "is-custom" : ""}`),
        e: common_vendor.o(handleClick),
        f: common_vendor.n(_ctx.customBodyClass),
        g: common_vendor.s(_ctx.customBodyStyle),
        h: collapseId.value,
        i: common_vendor.s(contentStyle.value),
        j: common_vendor.o(handleTransitionEnd),
        k: common_vendor.n(`wd-collapse-item ${_ctx.disabled ? "is-disabled" : ""} is-border ${_ctx.customClass}`),
        l: common_vendor.s(_ctx.customStyle)
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9fdfc147"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/wot-design-uni/components/wd-collapse-item/wd-collapse-item.js.map
