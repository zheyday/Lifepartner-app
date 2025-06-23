if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_LOAD = "onLoad";
  const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const onPullDownRefresh = /* @__PURE__ */ createHook(ON_PULL_DOWN_REFRESH);
  class AbortablePromise {
    constructor(executor) {
      this._reject = null;
      this.promise = new Promise((resolve, reject) => {
        executor(resolve, reject);
        this._reject = reject;
      });
    }
    // 提供abort方法来中止Promise
    abort(error) {
      if (this._reject) {
        this._reject(error);
      }
    }
    then(onfulfilled, onrejected) {
      return this.promise.then(onfulfilled, onrejected);
    }
    catch(onrejected) {
      return this.promise.catch(onrejected);
    }
  }
  function addUnit(num) {
    return Number.isNaN(Number(num)) ? `${num}` : `${num}px`;
  }
  function isObj(value) {
    return Object.prototype.toString.call(value) === "[object Object]" || typeof value === "object";
  }
  function getType(target) {
    const typeStr = Object.prototype.toString.call(target);
    const match = typeStr.match(/\[object (\w+)\]/);
    const type = match && match.length ? match[1].toLowerCase() : "";
    return type;
  }
  const defaultDisplayFormat = function(items, kv) {
    const labelKey = (kv == null ? void 0 : kv.labelKey) || "value";
    if (Array.isArray(items)) {
      return items.map((item) => item[labelKey]).join(", ");
    } else {
      return items[labelKey];
    }
  };
  const isDef = (value) => value !== void 0 && value !== null;
  function rgbToHex(r2, g2, b2) {
    const hex = (r2 << 16 | g2 << 8 | b2).toString(16);
    const paddedHex = "#" + "0".repeat(Math.max(0, 6 - hex.length)) + hex;
    return paddedHex;
  }
  function hexToRgb(hex) {
    const rgb = [];
    for (let i2 = 1; i2 < 7; i2 += 2) {
      rgb.push(parseInt("0x" + hex.slice(i2, i2 + 2), 16));
    }
    return rgb;
  }
  const gradient = (startColor, endColor, step = 2) => {
    const sColor = hexToRgb(startColor);
    const eColor = hexToRgb(endColor);
    const rStep = (eColor[0] - sColor[0]) / step;
    const gStep = (eColor[1] - sColor[1]) / step;
    const bStep = (eColor[2] - sColor[2]) / step;
    const gradientColorArr = [];
    for (let i2 = 0; i2 < step; i2++) {
      gradientColorArr.push(
        rgbToHex(parseInt(String(rStep * i2 + sColor[0])), parseInt(String(gStep * i2 + sColor[1])), parseInt(String(bStep * i2 + sColor[2])))
      );
    }
    return gradientColorArr;
  };
  const range = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
  };
  const isEqual = (value1, value2) => {
    if (value1 === value2) {
      return true;
    }
    if (!Array.isArray(value1) || !Array.isArray(value2)) {
      return false;
    }
    if (value1.length !== value2.length) {
      return false;
    }
    for (let i2 = 0; i2 < value1.length; ++i2) {
      if (value1[i2] !== value2[i2]) {
        return false;
      }
    }
    return true;
  };
  const padZero = (number, length = 2) => {
    let numStr = number.toString();
    while (numStr.length < length) {
      numStr = "0" + numStr;
    }
    return numStr;
  };
  const context = {
    id: 1e3
  };
  function getRect(selector, all, scope, useFields) {
    return new Promise((resolve, reject) => {
      let query = null;
      if (scope) {
        query = uni.createSelectorQuery().in(scope);
      } else {
        query = uni.createSelectorQuery();
      }
      const method = all ? "selectAll" : "select";
      const callback = (rect) => {
        if (all && isArray(rect) && rect.length > 0) {
          resolve(rect);
        } else if (!all && rect) {
          resolve(rect);
        } else {
          reject(new Error("No nodes found"));
        }
      };
      if (useFields) {
        query[method](selector).fields({ size: true, node: true }, callback).exec();
      } else {
        query[method](selector).boundingClientRect(callback).exec();
      }
    });
  }
  function kebabCase(word) {
    const newWord = word.replace(/[A-Z]/g, function(match) {
      return "-" + match;
    }).toLowerCase();
    return newWord;
  }
  function camelCase(word) {
    return word.replace(/-(\w)/g, (_2, c2) => c2.toUpperCase());
  }
  function isArray(value) {
    if (typeof Array.isArray === "function") {
      return Array.isArray(value);
    }
    return Object.prototype.toString.call(value) === "[object Array]";
  }
  function isFunction(value) {
    return getType(value) === "function" || getType(value) === "asyncfunction";
  }
  function isString(value) {
    return getType(value) === "string";
  }
  function isNumber(value) {
    return getType(value) === "number";
  }
  function isPromise(value) {
    if (isObj(value) && isDef(value)) {
      return isFunction(value.then) && isFunction(value.catch);
    }
    return false;
  }
  function objToStyle(styles) {
    if (isArray(styles)) {
      return styles.filter(function(item) {
        return item != null && item !== "";
      }).map(function(item) {
        return objToStyle(item);
      }).join(";");
    }
    if (isString(styles)) {
      return styles;
    }
    if (isObj(styles)) {
      return Object.keys(styles).filter(function(key) {
        return styles[key] != null && styles[key] !== "";
      }).map(function(key) {
        return [kebabCase(key), styles[key]].join(":");
      }).join(";");
    }
    return "";
  }
  const pause = (ms2 = 1e3 / 30) => {
    return new AbortablePromise((resolve) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        resolve(true);
      }, ms2);
    });
  };
  function deepClone(obj, cache = /* @__PURE__ */ new Map()) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (isDate(obj)) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags);
    }
    if (obj instanceof Error) {
      const errorCopy = new Error(obj.message);
      errorCopy.stack = obj.stack;
      return errorCopy;
    }
    if (cache.has(obj)) {
      return cache.get(obj);
    }
    const copy = Array.isArray(obj) ? [] : {};
    cache.set(obj, copy);
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = deepClone(obj[key], cache);
      }
    }
    return copy;
  }
  function deepMerge(target, source) {
    target = deepClone(target);
    if (typeof target !== "object" || typeof source !== "object") {
      throw new Error("Both target and source must be objects.");
    }
    for (const prop in source) {
      if (!source.hasOwnProperty(prop))
        continue;
      target[prop] = source[prop];
    }
    return target;
  }
  function deepAssign(target, source) {
    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const newObjValue = source[key];
      if (isObj(targetValue) && isObj(newObjValue)) {
        deepAssign(targetValue, newObjValue);
      } else {
        target[key] = newObjValue;
      }
    });
    return target;
  }
  function debounce(func, wait, options = {}) {
    let timeoutId = null;
    let lastArgs;
    let lastThis;
    let result;
    const leading = isDef(options.leading) ? options.leading : false;
    const trailing = isDef(options.trailing) ? options.trailing : true;
    function invokeFunc() {
      if (lastArgs !== void 0) {
        result = func.apply(lastThis, lastArgs);
        lastArgs = void 0;
      }
    }
    function startTimer() {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (trailing) {
          invokeFunc();
        }
      }, wait);
    }
    function cancelTimer() {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
    function debounced(...args) {
      lastArgs = args;
      lastThis = this;
      if (timeoutId === null) {
        if (leading) {
          invokeFunc();
        }
        startTimer();
      } else if (trailing) {
        cancelTimer();
        startTimer();
      }
      return result;
    }
    return debounced;
  }
  const getPropByPath = (obj, path) => {
    const keys = path.split(".");
    try {
      return keys.reduce((acc, key) => acc !== void 0 && acc !== null ? acc[key] : void 0, obj);
    } catch (error) {
      return void 0;
    }
  };
  const isDate = (val) => Object.prototype.toString.call(val) === "[object Date]" && !Number.isNaN(val.getTime());
  function isImageUrl(url) {
    const imageRegex = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg|image)/i;
    return imageRegex.test(url);
  }
  const isH5 = /* @__PURE__ */ (() => {
    let isH52 = false;
    return isH52;
  })();
  const numericProp = [Number, String];
  const makeRequiredProp = (type) => ({
    type,
    required: true
  });
  const makeArrayProp = () => ({
    type: Array,
    default: () => []
  });
  const makeBooleanProp = (defaultVal) => ({
    type: Boolean,
    default: defaultVal
  });
  const makeNumberProp = (defaultVal) => ({
    type: Number,
    default: defaultVal
  });
  const makeNumericProp = (defaultVal) => ({
    type: numericProp,
    default: defaultVal
  });
  const makeStringProp = (defaultVal) => ({
    type: String,
    default: defaultVal
  });
  const baseProps = {
    /**
     * 自定义根节点样式
     */
    customStyle: makeStringProp(""),
    /**
     * 自定义根节点样式类
     */
    customClass: makeStringProp("")
  };
  const iconProps = {
    ...baseProps,
    /**
     * 使用的图标名字，可以使用链接图片
     */
    name: makeRequiredProp(String),
    /**
     * 图标的颜色
     */
    color: String,
    /**
     * 图标的字体大小
     */
    size: String,
    /**
     * 类名前缀，用于使用自定义图标
     */
    classPrefix: makeStringProp("wd-icon")
  };
  const __default__$f = {
    name: "wd-icon",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$F = /* @__PURE__ */ vue.defineComponent({
    ...__default__$f,
    props: iconProps,
    emits: ["click", "touch"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const isImage = vue.computed(() => {
        return isDef(props.name) && isImageUrl(props.name);
      });
      const rootClass = vue.computed(() => {
        const prefix = props.classPrefix;
        return `${prefix} ${props.customClass} ${isImage.value ? "wd-icon--image" : prefix + "-" + props.name}`;
      });
      const rootStyle = vue.computed(() => {
        const style = {};
        if (props.color) {
          style["color"] = props.color;
        }
        if (props.size) {
          style["font-size"] = addUnit(props.size);
        }
        return `${objToStyle(style)}; ${props.customStyle}`;
      });
      function handleClick(event) {
        emit("click", event);
      }
      const __returned__ = { props, emit, isImage, rootClass, rootStyle, handleClick };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  function _sfc_render$E(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        onClick: $setup.handleClick,
        class: vue.normalizeClass($setup.rootClass),
        style: vue.normalizeStyle($setup.rootStyle)
      },
      [
        $setup.isImage ? (vue.openBlock(), vue.createElementBlock("image", {
          key: 0,
          class: "wd-icon__image",
          src: _ctx.name
        }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$7 = /* @__PURE__ */ _export_sfc(_sfc_main$F, [["render", _sfc_render$E], ["__scopeId", "data-v-24906af6"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-icon/wd-icon.vue"]]);
  function useParent(key) {
    const parent = vue.inject(key, null);
    if (parent) {
      const instance = vue.getCurrentInstance();
      const { link, unlink, internalChildren } = parent;
      link(instance);
      vue.onUnmounted(() => unlink(instance));
      const index = vue.computed(() => internalChildren.indexOf(instance));
      return {
        parent,
        index
      };
    }
    return {
      parent: null,
      index: vue.ref(-1)
    };
  }
  const CELL_GROUP_KEY = Symbol("wd-cell-group");
  const cellGroupProps = {
    ...baseProps,
    /**
     * 分组标题
     */
    title: String,
    /**
     * 分组右侧内容
     */
    value: String,
    /**
     * 分组启用插槽
     */
    useSlot: makeBooleanProp(false),
    /**
     * 是否展示边框线
     */
    border: makeBooleanProp(false)
  };
  function useCell() {
    const { parent: cellGroup, index } = useParent(CELL_GROUP_KEY);
    const border = vue.computed(() => {
      return cellGroup && cellGroup.props.border && index.value;
    });
    return { border };
  }
  const FORM_KEY = Symbol("wd-form");
  const formProps = {
    ...baseProps,
    /**
     * 表单数据对象
     */
    model: makeRequiredProp(Object),
    /**
     * 表单验证规则
     */
    rules: {
      type: Object,
      default: () => ({})
    },
    /**
     * 是否在输入时重置表单校验信息
     */
    resetOnChange: makeBooleanProp(true),
    /**
     * 错误提示类型
     */
    errorType: {
      type: String,
      default: "message"
    }
  };
  const cellProps = {
    ...baseProps,
    /**
     * 标题
     */
    title: String,
    /**
     * 右侧内容
     */
    value: makeNumericProp(""),
    /**
     * 图标类名
     */
    icon: String,
    /**
     * 描述信息
     */
    label: String,
    /**
     * 是否为跳转链接
     */
    isLink: makeBooleanProp(false),
    /**
     * 跳转地址
     */
    to: String,
    /**
     * 跳转时是否替换栈顶页面
     */
    replace: makeBooleanProp(false),
    /**
     * 开启点击反馈，is-link 默认开启
     */
    clickable: makeBooleanProp(false),
    /**
     * 设置单元格大小，可选值：large
     */
    size: String,
    /**
     * 是否展示边框线
     */
    border: makeBooleanProp(void 0),
    /**
     * 设置左侧标题宽度
     */
    titleWidth: String,
    /**
     * 是否垂直居中，默认顶部居中
     */
    center: makeBooleanProp(false),
    /**
     * 是否必填
     */
    required: makeBooleanProp(false),
    /**
     * 表单属性，上下结构
     */
    vertical: makeBooleanProp(false),
    /**
     * 表单域 model 字段名，在使用表单校验功能的情况下，该属性是必填的
     */
    prop: String,
    /**
     * 表单验证规则，结合wd-form组件使用
     */
    rules: makeArrayProp(),
    /**
     * icon 使用 slot 时的自定义样式
     */
    customIconClass: makeStringProp(""),
    /**
     * label 使用 slot 时的自定义样式
     */
    customLabelClass: makeStringProp(""),
    /**
     * value 使用 slot 时的自定义样式
     */
    customValueClass: makeStringProp(""),
    /**
     * title 使用 slot 时的自定义样式
     */
    customTitleClass: makeStringProp("")
  };
  const __default__$e = {
    name: "wd-cell",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$E = /* @__PURE__ */ vue.defineComponent({
    ...__default__$e,
    props: cellProps,
    emits: ["click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const cell = useCell();
      const isBorder = vue.computed(() => {
        return Boolean(isDef(props.border) ? props.border : cell.border.value);
      });
      const { parent: form } = useParent(FORM_KEY);
      const errorMessage = vue.computed(() => {
        if (form && props.prop && form.errorMessages && form.errorMessages[props.prop]) {
          return form.errorMessages[props.prop];
        } else {
          return "";
        }
      });
      const isRequired = vue.computed(() => {
        let formRequired = false;
        if (form && form.props.rules) {
          const rules = form.props.rules;
          for (const key in rules) {
            if (Object.prototype.hasOwnProperty.call(rules, key) && key === props.prop && Array.isArray(rules[key])) {
              formRequired = rules[key].some((rule) => rule.required);
            }
          }
        }
        return props.required || props.rules.some((rule) => rule.required) || formRequired;
      });
      function onClick() {
        const url = props.to;
        if (props.clickable || props.isLink) {
          emit("click");
        }
        if (url && props.isLink) {
          if (props.replace) {
            uni.redirectTo({ url });
          } else {
            uni.navigateTo({ url });
          }
        }
      }
      const __returned__ = { props, emit, cell, isBorder, form, errorMessage, isRequired, onClick, wdIcon: __easycom_0$7 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$D(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: vue.normalizeClass(["wd-cell", $setup.isBorder ? "is-border" : "", _ctx.size ? "is-" + _ctx.size : "", _ctx.center ? "is-center" : "", _ctx.customClass]),
      style: vue.normalizeStyle(_ctx.customStyle),
      "hover-class": _ctx.isLink || _ctx.clickable ? "is-hover" : "none",
      "hover-stay-time": 70,
      onClick: $setup.onClick
    }, [
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["wd-cell__wrapper", _ctx.vertical ? "is-vertical" : ""])
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["wd-cell__left", $setup.isRequired ? "is-required" : ""]),
              style: vue.normalizeStyle(_ctx.titleWidth ? "min-width:" + _ctx.titleWidth + ";max-width:" + _ctx.titleWidth + ";" : "")
            },
            [
              vue.createCommentVNode("左侧icon部位"),
              _ctx.icon ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                key: 0,
                name: _ctx.icon,
                "custom-class": `wd-cell__icon  ${_ctx.customIconClass}`
              }, null, 8, ["name", "custom-class"])) : vue.renderSlot(_ctx.$slots, "icon", { key: 1 }, void 0, true),
              vue.createElementVNode("view", { class: "wd-cell__title" }, [
                vue.createCommentVNode("title BEGIN"),
                _ctx.title ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: vue.normalizeClass(_ctx.customTitleClass)
                  },
                  vue.toDisplayString(_ctx.title),
                  3
                  /* TEXT, CLASS */
                )) : vue.renderSlot(_ctx.$slots, "title", { key: 1 }, void 0, true),
                vue.createCommentVNode("title END"),
                vue.createCommentVNode("label BEGIN"),
                _ctx.label ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 2,
                    class: vue.normalizeClass(`wd-cell__label ${_ctx.customLabelClass}`)
                  },
                  vue.toDisplayString(_ctx.label),
                  3
                  /* TEXT, CLASS */
                )) : vue.renderSlot(_ctx.$slots, "label", { key: 3 }, void 0, true),
                vue.createCommentVNode("label END")
              ])
            ],
            6
            /* CLASS, STYLE */
          ),
          vue.createCommentVNode("right content BEGIN"),
          vue.createElementVNode("view", { class: "wd-cell__right" }, [
            vue.createElementVNode("view", { class: "wd-cell__body" }, [
              vue.createCommentVNode("文案内容"),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(`wd-cell__value ${_ctx.customValueClass}`)
                },
                [
                  vue.renderSlot(_ctx.$slots, "default", {}, () => [
                    vue.createTextVNode(
                      vue.toDisplayString(_ctx.value),
                      1
                      /* TEXT */
                    )
                  ], true)
                ],
                2
                /* CLASS */
              ),
              vue.createCommentVNode("箭头"),
              _ctx.isLink ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                key: 0,
                "custom-class": "wd-cell__arrow-right",
                name: "arrow-right"
              })) : vue.renderSlot(_ctx.$slots, "right-icon", { key: 1 }, void 0, true)
            ]),
            $setup.errorMessage ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: "wd-cell__error-message"
              },
              vue.toDisplayString($setup.errorMessage),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createCommentVNode("right content END")
        ],
        2
        /* CLASS */
      )
    ], 14, ["hover-class"]);
  }
  const __easycom_0$6 = /* @__PURE__ */ _export_sfc(_sfc_main$E, [["render", _sfc_render$D], ["__scopeId", "data-v-f1c5bbe2"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-cell/wd-cell.vue"]]);
  function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
  }
  function flattenVNodes(children) {
    const result = [];
    const traverse = (children2) => {
      if (Array.isArray(children2)) {
        children2.forEach((child) => {
          var _a;
          if (isVNode(child)) {
            result.push(child);
            if ((_a = child.component) == null ? void 0 : _a.subTree) {
              result.push(child.component.subTree);
              traverse(child.component.subTree.children);
            }
            if (child.children) {
              traverse(child.children);
            }
          }
        });
      }
    };
    traverse(children);
    return result;
  }
  const findVNodeIndex = (vnodes, vnode) => {
    const index = vnodes.indexOf(vnode);
    if (index === -1) {
      return vnodes.findIndex((item) => vnode.key !== void 0 && vnode.key !== null && item.type === vnode.type && item.key === vnode.key);
    }
    return index;
  };
  function sortChildren(parent, publicChildren, internalChildren) {
    const vnodes = parent && parent.subTree && parent.subTree.children ? flattenVNodes(parent.subTree.children) : [];
    internalChildren.sort((a2, b2) => findVNodeIndex(vnodes, a2.vnode) - findVNodeIndex(vnodes, b2.vnode));
    const orderedPublicChildren = internalChildren.map((item) => item.proxy);
    publicChildren.sort((a2, b2) => {
      const indexA = orderedPublicChildren.indexOf(a2);
      const indexB = orderedPublicChildren.indexOf(b2);
      return indexA - indexB;
    });
  }
  function useChildren(key) {
    const publicChildren = vue.reactive([]);
    const internalChildren = vue.reactive([]);
    const parent = vue.getCurrentInstance();
    const linkChildren = (value) => {
      const link = (child) => {
        if (child.proxy) {
          internalChildren.push(child);
          publicChildren.push(child.proxy);
          sortChildren(parent, publicChildren, internalChildren);
        }
      };
      const unlink = (child) => {
        const index = internalChildren.indexOf(child);
        publicChildren.splice(index, 1);
        internalChildren.splice(index, 1);
      };
      vue.provide(
        key,
        Object.assign(
          {
            link,
            unlink,
            children: publicChildren,
            internalChildren
          },
          value
        )
      );
    };
    return {
      children: publicChildren,
      linkChildren
    };
  }
  const __default__$d = {
    name: "wd-cell-group",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$D = /* @__PURE__ */ vue.defineComponent({
    ...__default__$d,
    props: cellGroupProps,
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const { linkChildren } = useChildren(CELL_GROUP_KEY);
      linkChildren({ props });
      const __returned__ = { props, linkChildren };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$C(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["wd-cell-group", _ctx.border ? "is-border" : "", _ctx.customClass]),
        style: vue.normalizeStyle(_ctx.customStyle)
      },
      [
        _ctx.title || _ctx.value || _ctx.useSlot ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "wd-cell-group__title"
        }, [
          vue.createCommentVNode("左侧标题"),
          vue.createElementVNode("view", { class: "wd-cell-group__left" }, [
            _ctx.title ? (vue.openBlock(), vue.createElementBlock(
              "text",
              { key: 0 },
              vue.toDisplayString(_ctx.title),
              1
              /* TEXT */
            )) : vue.renderSlot(_ctx.$slots, "title", { key: 1 }, void 0, true)
          ]),
          vue.createCommentVNode("右侧标题"),
          vue.createElementVNode("view", { class: "wd-cell-group__right" }, [
            _ctx.value ? (vue.openBlock(), vue.createElementBlock(
              "text",
              { key: 0 },
              vue.toDisplayString(_ctx.value),
              1
              /* TEXT */
            )) : vue.renderSlot(_ctx.$slots, "value", { key: 1 }, void 0, true)
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "wd-cell-group__body" }, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_2$2 = /* @__PURE__ */ _export_sfc(_sfc_main$D, [["render", _sfc_render$C], ["__scopeId", "data-v-55e5786b"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-cell-group/wd-cell-group.vue"]]);
  let mpMixins = {};
  mpMixins = {
    data() {
      return {
        is_show: "none"
      };
    },
    watch: {
      show(newVal) {
        this.is_show = this.show;
      }
    },
    created() {
      this.swipeaction = this.getSwipeAction();
      if (this.swipeaction && Array.isArray(this.swipeaction.children)) {
        this.swipeaction.children.push(this);
      }
    },
    mounted() {
      this.is_show = this.show;
    },
    methods: {
      // wxs 中调用
      closeSwipe(e2) {
        if (this.autoClose && this.swipeaction) {
          this.swipeaction.closeOther(this);
        }
      },
      change(e2) {
        this.$emit("change", e2.open);
        if (this.is_show !== e2.open) {
          this.is_show = e2.open;
        }
      },
      appTouchStart(e2) {
        const {
          clientX
        } = e2.changedTouches[0];
        this.clientX = clientX;
        this.timestamp = (/* @__PURE__ */ new Date()).getTime();
      },
      appTouchEnd(e2, index, item, position) {
        const {
          clientX
        } = e2.changedTouches[0];
        let diff = Math.abs(this.clientX - clientX);
        let time = (/* @__PURE__ */ new Date()).getTime() - this.timestamp;
        if (diff < 40 && time < 300) {
          this.$emit("click", {
            content: item,
            index,
            position
          });
        }
      },
      onClickForPC(index, item, position) {
        return;
      }
    }
  };
  const mpwxs = mpMixins;
  let bindIngXMixins = {};
  let otherMixins = {};
  const block0$1 = (Comp) => {
    (Comp.$wxs || (Comp.$wxs = [])).push("wxsswipe");
    (Comp.$wxsModules || (Comp.$wxsModules = {}))["wxsswipe"] = "afd46426";
  };
  const block1 = (Comp) => {
    (Comp.$renderjs || (Comp.$renderjs = [])).push("renderswipe");
    (Comp.$renderjsModules || (Comp.$renderjsModules = {}))["renderswipe"] = "5a1e922e";
  };
  const _sfc_main$C = {
    mixins: [mpwxs, bindIngXMixins, otherMixins],
    emits: ["click", "change"],
    props: {
      // 控制开关
      show: {
        type: String,
        default: "none"
      },
      // 禁用
      disabled: {
        type: Boolean,
        default: false
      },
      // 是否自动关闭
      autoClose: {
        type: Boolean,
        default: true
      },
      // 滑动缺省距离
      threshold: {
        type: Number,
        default: 20
      },
      // 左侧按钮内容
      leftOptions: {
        type: Array,
        default() {
          return [];
        }
      },
      // 右侧按钮内容
      rightOptions: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    // TODO vue3
    unmounted() {
      this.__isUnmounted = true;
      this.uninstall();
    },
    methods: {
      uninstall() {
        if (this.swipeaction) {
          this.swipeaction.children.forEach((item, index) => {
            if (item === this) {
              this.swipeaction.children.splice(index, 1);
            }
          });
        }
      },
      /**
       * 获取父元素实例
       */
      getSwipeAction(name = "uniSwipeAction") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      }
    }
  };
  function _sfc_render$B(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 在微信小程序 app vue端 h5 使用wxs 实现"),
        vue.createElementVNode("view", { class: "uni-swipe" }, [
          vue.createElementVNode("view", {
            class: "uni-swipe_box",
            "change:prop": _ctx.renderswipe.showWatch,
            prop: vue.wp(_ctx.is_show),
            "data-threshold": $props.threshold,
            "data-disabled": $props.disabled + "",
            onTouchstart: _cache[2] || (_cache[2] = (...args) => _ctx.renderswipe.touchstart && _ctx.renderswipe.touchstart(...args)),
            onTouchmove: _cache[3] || (_cache[3] = (...args) => _ctx.renderswipe.touchmove && _ctx.renderswipe.touchmove(...args)),
            onTouchend: _cache[4] || (_cache[4] = (...args) => _ctx.renderswipe.touchend && _ctx.renderswipe.touchend(...args))
          }, [
            vue.createCommentVNode(" 在微信小程序 app vue端 h5 使用wxs 实现"),
            vue.createElementVNode("view", { class: "uni-swipe_button-group button-group--left" }, [
              vue.renderSlot(_ctx.$slots, "left", {}, () => [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($props.leftOptions, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      style: vue.normalizeStyle({
                        backgroundColor: item.style && item.style.backgroundColor ? item.style.backgroundColor : "#C7C6CD"
                      }),
                      class: "uni-swipe_button button-hock",
                      onTouchstart: _cache[0] || (_cache[0] = vue.withModifiers((...args) => _ctx.appTouchStart && _ctx.appTouchStart(...args), ["stop"])),
                      onTouchend: vue.withModifiers(($event) => _ctx.appTouchEnd($event, index, item, "left"), ["stop"]),
                      onClick: vue.withModifiers(($event) => _ctx.onClickForPC(index, item, "left"), ["stop"])
                    }, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: "uni-swipe_button-text",
                          style: vue.normalizeStyle({ color: item.style && item.style.color ? item.style.color : "#FFFFFF", fontSize: item.style && item.style.fontSize ? item.style.fontSize : "16px" })
                        },
                        vue.toDisplayString(item.text),
                        5
                        /* TEXT, STYLE */
                      )
                    ], 44, ["onTouchend", "onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], true)
            ]),
            vue.createElementVNode("view", { class: "uni-swipe_text--center" }, [
              vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
            ]),
            vue.createElementVNode("view", { class: "uni-swipe_button-group button-group--right" }, [
              vue.renderSlot(_ctx.$slots, "right", {}, () => [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($props.rightOptions, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      style: vue.normalizeStyle({
                        backgroundColor: item.style && item.style.backgroundColor ? item.style.backgroundColor : "#C7C6CD"
                      }),
                      class: "uni-swipe_button button-hock",
                      onTouchstart: _cache[1] || (_cache[1] = vue.withModifiers((...args) => _ctx.appTouchStart && _ctx.appTouchStart(...args), ["stop"])),
                      onTouchend: vue.withModifiers(($event) => _ctx.appTouchEnd($event, index, item, "right"), ["stop"]),
                      onClick: vue.withModifiers(($event) => _ctx.onClickForPC(index, item, "right"), ["stop"])
                    }, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: "uni-swipe_button-text",
                          style: vue.normalizeStyle({ color: item.style && item.style.color ? item.style.color : "#FFFFFF", fontSize: item.style && item.style.fontSize ? item.style.fontSize : "16px" })
                        },
                        vue.toDisplayString(item.text),
                        5
                        /* TEXT, STYLE */
                      )
                    ], 44, ["onTouchend", "onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], true)
            ])
          ], 40, ["change:prop", "prop", "data-threshold", "data-disabled"])
        ]),
        vue.createCommentVNode(" app nvue端 使用 bindingx "),
        vue.createCommentVNode(" 其他平台使用 js ，长列表性能可能会有影响")
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  if (typeof block0$1 === "function")
    block0$1(_sfc_main$C);
  if (typeof block1 === "function")
    block1(_sfc_main$C);
  const __easycom_0$5 = /* @__PURE__ */ _export_sfc(_sfc_main$C, [["render", _sfc_render$B], ["__scopeId", "data-v-8ff2a577"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-swipe-action/components/uni-swipe-action-item/uni-swipe-action-item.vue"]]);
  const _sfc_main$B = {
    name: "uniSwipeAction",
    data() {
      return {};
    },
    created() {
      this.children = [];
    },
    methods: {
      // 公开给用户使用，重制组件样式
      resize() {
      },
      // 公开给用户使用，关闭全部 已经打开的组件
      closeAll() {
        this.children.forEach((vm) => {
          vm.is_show = "none";
        });
      },
      closeOther(vm) {
        if (this.openItem && this.openItem !== vm) {
          this.openItem.is_show = "none";
        }
        this.openItem = vm;
      }
    }
  };
  function _sfc_render$A(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.renderSlot(_ctx.$slots, "default")
    ]);
  }
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["render", _sfc_render$A], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-swipe-action/components/uni-swipe-action/uni-swipe-action.vue"]]);
  const _b64chars = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"];
  const _mkUriSafe = (src) => src.replace(/[+/]/g, (m0) => m0 === "+" ? "-" : "_").replace(/=+\$/m, "");
  const fromUint8Array = (src, rfc4648 = false) => {
    let b64 = "";
    for (let i2 = 0, l2 = src.length; i2 < l2; i2 += 3) {
      const [a0, a1, a2] = [src[i2], src[i2 + 1], src[i2 + 2]];
      const ord = a0 << 16 | a1 << 8 | a2;
      b64 += _b64chars[ord >>> 18];
      b64 += _b64chars[ord >>> 12 & 63];
      b64 += typeof a1 !== "undefined" ? _b64chars[ord >>> 6 & 63] : "=";
      b64 += typeof a2 !== "undefined" ? _b64chars[ord & 63] : "=";
    }
    return rfc4648 ? _mkUriSafe(b64) : b64;
  };
  const _btoa = typeof btoa === "function" ? (s2) => btoa(s2) : (s2) => {
    if (s2.charCodeAt(0) > 255) {
      throw new RangeError("The string contains invalid characters.");
    }
    return fromUint8Array(Uint8Array.from(s2, (c2) => c2.charCodeAt(0)));
  };
  const utob = (src) => unescape(encodeURIComponent(src));
  function encode(src, rfc4648 = false) {
    const b64 = _btoa(utob(src));
    return rfc4648 ? _mkUriSafe(b64) : b64;
  }
  const buttonProps = {
    ...baseProps,
    /**
     * 幽灵按钮
     */
    plain: makeBooleanProp(false),
    /**
     * 圆角按钮
     */
    round: makeBooleanProp(true),
    /**
     * 禁用按钮
     */
    disabled: makeBooleanProp(false),
    /**
     * 是否细边框
     */
    hairline: makeBooleanProp(false),
    /**
     * 块状按钮
     */
    block: makeBooleanProp(false),
    /**
     * 按钮类型，可选值：primary / success / info / warning / error / text / icon
     */
    type: makeStringProp("primary"),
    /**
     * 按钮尺寸，可选值：small / medium / large
     */
    size: makeStringProp("medium"),
    /**
     * 图标类名
     */
    icon: String,
    /**
     * 类名前缀，用于使用自定义图标，用法参考Icon组件
     */
    classPrefix: makeStringProp("wd-icon"),
    /**
     * 加载中按钮
     */
    loading: makeBooleanProp(false),
    /**
     * 加载图标颜色
     */
    loadingColor: String,
    /**
     * 开放能力
     */
    openType: String,
    /**
     * 指定是否阻止本节点的祖先节点出现点击态
     */
    hoverStopPropagation: Boolean,
    /**
     * 指定返回用户信息的语言，zh_CN 简体中文，zh_TW 繁体中文，en 英文
     */
    lang: String,
    /**
     * 会话来源，open-type="contact"时有效
     */
    sessionFrom: String,
    /**
     * 会话内消息卡片标题，open-type="contact"时有效
     */
    sendMessageTitle: String,
    /**
     * 会话内消息卡片点击跳转小程序路径，open-type="contact"时有效
     */
    sendMessagePath: String,
    /**
     * 会话内消息卡片图片，open-type="contact"时有效
     */
    sendMessageImg: String,
    /**
     * 打开 APP 时，向 APP 传递的参数，open-type=launchApp时有效
     */
    appParameter: String,
    /**
     * 是否显示会话内消息卡片，设置此参数为 true，用户进入客服会话会在右下角显示"可能要发送的小程序"提示，用户点击后可以快速发送小程序消息，open-type="contact"时有效
     */
    showMessageCard: Boolean,
    /**
     * 按钮的唯一标识，可用于设置隐私同意授权按钮的id
     */
    buttonId: String,
    /**
     * 支付宝小程序，当 open-type 为 getAuthorize 时有效。
     * 可选值：'phoneNumber' | 'userInfo'
     */
    scope: String
  };
  const __default__$c = {
    name: "wd-button",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$A = /* @__PURE__ */ vue.defineComponent({
    ...__default__$c,
    props: buttonProps,
    emits: [
      "click",
      "getuserinfo",
      "contact",
      "getphonenumber",
      "error",
      "launchapp",
      "opensetting",
      "chooseavatar",
      "agreeprivacyauthorization"
    ],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const loadingIcon = (color2 = "#4D80F0", reverse = true) => {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42"><defs><linearGradient x1="100%" y1="0%" x2="0%" y2="0%" id="a"><stop stop-color="${reverse ? color2 : "#fff"}" offset="0%" stop-opacity="0"/><stop stop-color="${reverse ? color2 : "#fff"}" offset="100%"/></linearGradient></defs><g fill="none" fill-rule="evenodd"><path d="M21 1c11.046 0 20 8.954 20 20s-8.954 20-20 20S1 32.046 1 21 9.954 1 21 1zm0 7C13.82 8 8 13.82 8 21s5.82 13 13 13 13-5.82 13-13S28.18 8 21 8z" fill="${reverse ? "#fff" : color2}"/><path d="M4.599 21c0 9.044 7.332 16.376 16.376 16.376 9.045 0 16.376-7.332 16.376-16.376" stroke="url(#a)" stroke-width="3.5" stroke-linecap="round"/></g></svg>`;
      };
      const props = __props;
      const emit = __emit;
      const hoverStartTime = vue.ref(20);
      const hoverStayTime = vue.ref(70);
      const loadingIconSvg = vue.ref("");
      const loadingStyle = vue.computed(() => {
        return `background-image: url(${loadingIconSvg.value});`;
      });
      vue.watch(
        () => props.loading,
        () => {
          buildLoadingSvg();
        },
        { deep: true, immediate: true }
      );
      function handleClick(event) {
        if (!props.disabled && !props.loading) {
          emit("click", event);
        }
      }
      function handleGetAuthorize(event) {
        if (props.scope === "phoneNumber") {
          handleGetphonenumber(event);
        } else if (props.scope === "userInfo") {
          handleGetuserinfo(event);
        }
      }
      function handleGetuserinfo(event) {
        emit("getuserinfo", event.detail);
      }
      function handleConcat(event) {
        emit("contact", event.detail);
      }
      function handleGetphonenumber(event) {
        emit("getphonenumber", event.detail);
      }
      function handleError(event) {
        emit("error", event.detail);
      }
      function handleLaunchapp(event) {
        emit("launchapp", event.detail);
      }
      function handleOpensetting(event) {
        emit("opensetting", event.detail);
      }
      function handleChooseavatar(event) {
        emit("chooseavatar", event.detail);
      }
      function handleAgreePrivacyAuthorization(event) {
        emit("agreeprivacyauthorization", event.detail);
      }
      function buildLoadingSvg() {
        const { loadingColor, type, plain } = props;
        let color2 = loadingColor;
        if (!color2) {
          switch (type) {
            case "primary":
              color2 = "#4D80F0";
              break;
            case "success":
              color2 = "#34d19d";
              break;
            case "info":
              color2 = "#333";
              break;
            case "warning":
              color2 = "#f0883a";
              break;
            case "error":
              color2 = "#fa4350";
              break;
            case "default":
              color2 = "#333";
              break;
          }
        }
        const svg = loadingIcon(color2, !plain);
        loadingIconSvg.value = `"data:image/svg+xml;base64,${encode(svg)}"`;
      }
      const __returned__ = { loadingIcon, props, emit, hoverStartTime, hoverStayTime, loadingIconSvg, loadingStyle, handleClick, handleGetAuthorize, handleGetuserinfo, handleConcat, handleGetphonenumber, handleError, handleLaunchapp, handleOpensetting, handleChooseavatar, handleAgreePrivacyAuthorization, buildLoadingSvg, wdIcon: __easycom_0$7 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$z(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("button", {
      id: _ctx.buttonId,
      "hover-class": `${_ctx.disabled || _ctx.loading ? "" : "wd-button--active"}`,
      style: vue.normalizeStyle(_ctx.customStyle),
      class: vue.normalizeClass([
        "wd-button",
        "is-" + _ctx.type,
        "is-" + _ctx.size,
        _ctx.round ? "is-round" : "",
        _ctx.hairline ? "is-hairline" : "",
        _ctx.plain ? "is-plain" : "",
        _ctx.disabled ? "is-disabled" : "",
        _ctx.block ? "is-block" : "",
        _ctx.loading ? "is-loading" : "",
        _ctx.customClass
      ]),
      "hover-start-time": $setup.hoverStartTime,
      "hover-stay-time": $setup.hoverStayTime,
      "open-type": _ctx.disabled || _ctx.loading ? void 0 : _ctx.openType,
      "send-message-title": _ctx.sendMessageTitle,
      "send-message-path": _ctx.sendMessagePath,
      "send-message-img": _ctx.sendMessageImg,
      "app-parameter": _ctx.appParameter,
      "show-message-card": _ctx.showMessageCard,
      "session-from": _ctx.sessionFrom,
      lang: _ctx.lang,
      "hover-stop-propagation": _ctx.hoverStopPropagation,
      scope: _ctx.scope,
      onClick: $setup.handleClick,
      "on:getAuthorize": $setup.handleGetAuthorize,
      onGetuserinfo: $setup.handleGetuserinfo,
      onContact: $setup.handleConcat,
      onGetphonenumber: $setup.handleGetphonenumber,
      onError: $setup.handleError,
      onLaunchapp: $setup.handleLaunchapp,
      onOpensetting: $setup.handleOpensetting,
      onChooseavatar: $setup.handleChooseavatar,
      onAgreeprivacyauthorization: $setup.handleAgreePrivacyAuthorization
    }, [
      vue.createElementVNode("view", { class: "wd-button__content" }, [
        _ctx.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "wd-button__loading"
        }, [
          vue.createElementVNode(
            "view",
            {
              class: "wd-button__loading-svg",
              style: vue.normalizeStyle($setup.loadingStyle)
            },
            null,
            4
            /* STYLE */
          )
        ])) : _ctx.icon ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
          key: 1,
          "custom-class": "wd-button__icon",
          name: _ctx.icon,
          classPrefix: _ctx.classPrefix
        }, null, 8, ["name", "classPrefix"])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "wd-button__text" }, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ])
      ])
    ], 46, ["id", "hover-class", "hover-start-time", "hover-stay-time", "open-type", "send-message-title", "send-message-path", "send-message-img", "app-parameter", "show-message-card", "session-from", "lang", "hover-stop-propagation", "scope"]);
  }
  const __easycom_3$1 = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["render", _sfc_render$z], ["__scopeId", "data-v-d858c170"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-button/wd-button.vue"]]);
  const transitionProps = {
    ...baseProps,
    /**
     * 是否展示组件
     * 类型：boolean
     * 默认值：false
     */
    show: makeBooleanProp(false),
    /**
     * 动画执行时间
     * 类型：number | boolean | Record<string, number>
     * 默认值：300 (毫秒)
     */
    duration: {
      type: [Object, Number, Boolean],
      default: 300
    },
    /**
     * 弹层内容懒渲染，触发展示时才渲染内容
     * 类型：boolean
     * 默认值：false
     */
    lazyRender: makeBooleanProp(false),
    /**
     * 动画类型
     * 类型：string
     * 可选值：fade / fade-up / fade-down / fade-left / fade-right / slide-up / slide-down / slide-left / slide-right / zoom-in
     * 默认值：'fade'
     */
    name: [String, Array],
    /**
     * 是否在动画结束时销毁子节点（display: none)
     * 类型：boolean
     * 默认值：false
     */
    destroy: makeBooleanProp(true),
    /**
     * 进入过渡的开始状态
     * 类型：string
     */
    enterClass: makeStringProp(""),
    /**
     * 进入过渡的激活状态
     * 类型：string
     */
    enterActiveClass: makeStringProp(""),
    /**
     * 进入过渡的结束状态
     * 类型：string
     */
    enterToClass: makeStringProp(""),
    /**
     * 离开过渡的开始状态
     * 类型：string
     */
    leaveClass: makeStringProp(""),
    /**
     * 离开过渡的激活状态
     * 类型：string
     */
    leaveActiveClass: makeStringProp(""),
    /**
     * 离开过渡的结束状态
     * 类型：string
     */
    leaveToClass: makeStringProp("")
  };
  const __default__$b = {
    name: "wd-transition",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$z = /* @__PURE__ */ vue.defineComponent({
    ...__default__$b,
    props: transitionProps,
    emits: ["click", "before-enter", "enter", "before-leave", "leave", "after-leave", "after-enter"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const getClassNames = (name) => {
        let enter2 = `${props.enterClass} ${props.enterActiveClass}`;
        let enterTo = `${props.enterToClass} ${props.enterActiveClass}`;
        let leave2 = `${props.leaveClass} ${props.leaveActiveClass}`;
        let leaveTo = `${props.leaveToClass} ${props.leaveActiveClass}`;
        if (Array.isArray(name)) {
          for (let index = 0; index < name.length; index++) {
            enter2 = `wd-${name[index]}-enter wd-${name[index]}-enter-active ${enter2}`;
            enterTo = `wd-${name[index]}-enter-to wd-${name[index]}-enter-active ${enterTo}`;
            leave2 = `wd-${name[index]}-leave wd-${name[index]}-leave-active ${leave2}`;
            leaveTo = `wd-${name[index]}-leave-to wd-${name[index]}-leave-active ${leaveTo}`;
          }
        } else if (name) {
          enter2 = `wd-${name}-enter wd-${name}-enter-active ${enter2}`;
          enterTo = `wd-${name}-enter-to wd-${name}-enter-active ${enterTo}`;
          leave2 = `wd-${name}-leave wd-${name}-leave-active ${leave2}`;
          leaveTo = `wd-${name}-leave-to wd-${name}-leave-active ${leaveTo}`;
        }
        return {
          enter: enter2,
          "enter-to": enterTo,
          leave: leave2,
          "leave-to": leaveTo
        };
      };
      const props = __props;
      const emit = __emit;
      const inited = vue.ref(false);
      const display = vue.ref(false);
      const status = vue.ref("");
      const transitionEnded = vue.ref(false);
      const currentDuration = vue.ref(300);
      const classes = vue.ref("");
      const enterPromise = vue.ref(null);
      const enterLifeCyclePromises = vue.ref(null);
      const leaveLifeCyclePromises = vue.ref(null);
      const style = vue.computed(() => {
        return `-webkit-transition-duration:${currentDuration.value}ms;transition-duration:${currentDuration.value}ms;${display.value || !props.destroy ? "" : "display: none;"}${props.customStyle}`;
      });
      const rootClass = vue.computed(() => {
        return `wd-transition ${props.customClass}  ${classes.value}`;
      });
      vue.onBeforeMount(() => {
        if (props.show) {
          enter();
        }
      });
      vue.watch(
        () => props.show,
        (newVal) => {
          handleShow(newVal);
        },
        { deep: true }
      );
      function handleClick() {
        emit("click");
      }
      function handleShow(value) {
        if (value) {
          handleAbortPromise();
          enter();
        } else {
          leave();
        }
      }
      function handleAbortPromise() {
        isPromise(enterPromise.value) && enterPromise.value.abort();
        isPromise(enterLifeCyclePromises.value) && enterLifeCyclePromises.value.abort();
        isPromise(leaveLifeCyclePromises.value) && leaveLifeCyclePromises.value.abort();
        enterPromise.value = null;
        enterLifeCyclePromises.value = null;
        leaveLifeCyclePromises.value = null;
      }
      function enter() {
        enterPromise.value = new AbortablePromise(async (resolve) => {
          try {
            const classNames = getClassNames(props.name);
            const duration = isObj(props.duration) ? props.duration.enter : props.duration;
            status.value = "enter";
            emit("before-enter");
            enterLifeCyclePromises.value = pause();
            await enterLifeCyclePromises.value;
            emit("enter");
            classes.value = classNames.enter;
            currentDuration.value = duration;
            enterLifeCyclePromises.value = pause();
            await enterLifeCyclePromises.value;
            inited.value = true;
            display.value = true;
            enterLifeCyclePromises.value = pause();
            await enterLifeCyclePromises.value;
            enterLifeCyclePromises.value = null;
            transitionEnded.value = false;
            classes.value = classNames["enter-to"];
            resolve();
          } catch (error) {
          }
        });
      }
      async function leave() {
        if (!enterPromise.value) {
          transitionEnded.value = false;
          return onTransitionEnd();
        }
        try {
          await enterPromise.value;
          if (!display.value)
            return;
          const classNames = getClassNames(props.name);
          const duration = isObj(props.duration) ? props.duration.leave : props.duration;
          status.value = "leave";
          emit("before-leave");
          currentDuration.value = duration;
          leaveLifeCyclePromises.value = pause();
          await leaveLifeCyclePromises.value;
          emit("leave");
          classes.value = classNames.leave;
          leaveLifeCyclePromises.value = pause();
          await leaveLifeCyclePromises.value;
          transitionEnded.value = false;
          classes.value = classNames["leave-to"];
          leaveLifeCyclePromises.value = setPromise(currentDuration.value);
          await leaveLifeCyclePromises.value;
          leaveLifeCyclePromises.value = null;
          onTransitionEnd();
          enterPromise.value = null;
        } catch (error) {
        }
      }
      function setPromise(duration) {
        return new AbortablePromise((resolve) => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            resolve();
          }, duration);
        });
      }
      function onTransitionEnd() {
        if (transitionEnded.value)
          return;
        transitionEnded.value = true;
        if (status.value === "leave") {
          emit("after-leave");
        } else if (status.value === "enter") {
          emit("after-enter");
        }
        if (!props.show && display.value) {
          display.value = false;
        }
      }
      const __returned__ = { getClassNames, props, emit, inited, display, status, transitionEnded, currentDuration, classes, enterPromise, enterLifeCyclePromises, leaveLifeCyclePromises, style, rootClass, handleClick, handleShow, handleAbortPromise, enter, leave, setPromise, onTransitionEnd };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$y(_ctx, _cache, $props, $setup, $data, $options) {
    return !_ctx.lazyRender || $setup.inited ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass($setup.rootClass),
        style: vue.normalizeStyle($setup.style),
        onTransitionend: $setup.onTransitionEnd,
        onClick: $setup.handleClick
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      38
      /* CLASS, STYLE, NEED_HYDRATION */
    )) : vue.createCommentVNode("v-if", true);
  }
  const wdTransition = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["render", _sfc_render$y], ["__scopeId", "data-v-af59a128"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-transition/wd-transition.vue"]]);
  const queueKey = "__QUEUE_KEY__";
  let queue = [];
  function pushToQueue(comp) {
    queue.push(comp);
  }
  function removeFromQueue(comp) {
    queue = queue.filter((item) => {
      return item.$.uid !== comp.$.uid;
    });
  }
  function closeOther(comp) {
    queue.forEach((item) => {
      if (item.$.uid !== comp.$.uid) {
        item.$.exposed.close();
      }
    });
  }
  const fabProps = {
    ...baseProps,
    /**
     * 是否激活
     */
    active: makeBooleanProp(false),
    /**
     * 类型，可选值为 default primary info success warning error
     */
    type: makeStringProp("primary"),
    /**
     * 悬浮按钮位置，可选值为 left-top right-top left-bottom right-bottom left-center right-center top-center bottom-center
     */
    position: makeStringProp("right-bottom"),
    /**
     * 悬浮按钮菜单弹出方向，可选值为 top bottom left right
     */
    direction: makeStringProp("top"),
    /**
     * 是否禁用
     */
    disabled: makeBooleanProp(false),
    /**
     * 悬浮按钮未展开时的图标
     */
    inactiveIcon: makeStringProp("add"),
    /**
     * 悬浮按钮展开时的图标
     */
    activeIcon: makeStringProp("close"),
    /**
     * 自定义悬浮按钮层级
     */
    zIndex: makeNumberProp(99),
    /**
     * 是否可拖动
     */
    draggable: makeBooleanProp(false),
    gap: {
      type: Object,
      default: () => ({})
    },
    /**
     * 用于控制点击时是否展开菜单
     */
    expandable: makeBooleanProp(true)
  };
  function useRaf(callback) {
    const requestRef = vue.ref(null);
    const start = () => {
      const handle = (time) => {
        callback(time);
      };
      if (isH5) {
        requestRef.value = requestAnimationFrame(handle);
      } else {
        requestRef.value = setTimeout(() => handle(Date.now()), 1e3 / 30);
      }
    };
    const cancel = () => {
      if (isH5 && isNumber(requestRef.value)) {
        cancelAnimationFrame(requestRef.value);
      } else if (isDef(requestRef.value)) {
        clearTimeout(requestRef.value);
      }
    };
    vue.onUnmounted(() => {
      cancel();
    });
    return { start, cancel };
  }
  const __default__$a = {
    name: "wd-fab",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$y = /* @__PURE__ */ vue.defineComponent({
    ...__default__$a,
    props: fabProps,
    emits: ["update:active", "click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const inited = vue.ref(false);
      const isActive = vue.ref(false);
      const queue2 = vue.inject(queueKey, null);
      const { proxy } = vue.getCurrentInstance();
      vue.watch(
        () => props.active,
        (newValue) => {
          isActive.value = newValue;
        },
        { immediate: true, deep: true }
      );
      vue.watch(
        () => isActive.value,
        (newValue) => {
          if (newValue) {
            if (queue2 && queue2.closeOther) {
              queue2.closeOther(proxy);
            } else {
              closeOther(proxy);
            }
          }
        }
      );
      const fabDirection = vue.ref(props.direction);
      vue.watch(
        () => props.direction,
        (direction) => fabDirection.value = direction
      );
      vue.watch(
        () => props.position,
        () => initPosition()
      );
      const top = vue.ref(0);
      const left = vue.ref(0);
      const screen = vue.reactive({ width: 0, height: 0 });
      const fabSize = vue.reactive({ width: 56, height: 56 });
      const bounding = vue.reactive({
        minTop: 0,
        minLeft: 0,
        maxTop: 0,
        maxLeft: 0
      });
      async function getBounding() {
        const sysInfo = uni.getSystemInfoSync();
        try {
          const trigerInfo = await getRect("#trigger", false, proxy);
          fabSize.width = trigerInfo.width || 56;
          fabSize.height = trigerInfo.height || 56;
        } catch (error) {
          formatAppLog("log", "at uni_modules/wot-design-uni/components/wd-fab/wd-fab.vue:112", error);
        }
        const { top: top2 = 16, left: left2 = 16, right = 16, bottom = 16 } = props.gap;
        screen.width = sysInfo.windowWidth;
        screen.height = isH5 ? sysInfo.windowTop + sysInfo.windowHeight : sysInfo.windowHeight;
        bounding.minTop = isH5 ? sysInfo.windowTop + top2 : top2;
        bounding.minLeft = left2;
        bounding.maxLeft = screen.width - fabSize.width - right;
        bounding.maxTop = screen.height - fabSize.height - bottom;
      }
      function initPosition() {
        const pos = props.position;
        const { minLeft, minTop, maxLeft, maxTop } = bounding;
        const centerY = (maxTop + minTop) / 2;
        const centerX = (maxLeft + minLeft) / 2;
        switch (pos) {
          case "left-top":
            top.value = minTop;
            left.value = minLeft;
            break;
          case "right-top":
            top.value = minTop;
            left.value = maxLeft;
            break;
          case "left-bottom":
            top.value = maxTop;
            left.value = minLeft;
            break;
          case "right-bottom":
            top.value = maxTop;
            left.value = maxLeft;
            break;
          case "left-center":
            top.value = centerY;
            left.value = minLeft;
            break;
          case "right-center":
            top.value = centerY;
            left.value = maxLeft;
            break;
          case "top-center":
            top.value = minTop;
            left.value = centerX;
            break;
          case "bottom-center":
            top.value = maxTop;
            left.value = centerX;
            break;
        }
      }
      const touchOffset = vue.reactive({ x: 0, y: 0 });
      const attractTransition = vue.ref(false);
      function handleTouchStart(e2) {
        if (props.draggable === false)
          return;
        const touch = e2.touches[0];
        touchOffset.x = touch.clientX - left.value;
        touchOffset.y = touch.clientY - top.value;
        attractTransition.value = false;
      }
      function handleTouchMove(e2) {
        if (props.draggable === false)
          return;
        const touch = e2.touches[0];
        const { minLeft, minTop, maxLeft, maxTop } = bounding;
        let x = touch.clientX - touchOffset.x;
        let y2 = touch.clientY - touchOffset.y;
        if (x < minLeft)
          x = minLeft;
        else if (x > maxLeft)
          x = maxLeft;
        if (y2 < minTop)
          y2 = minTop;
        else if (y2 > maxTop)
          y2 = maxTop;
        top.value = y2;
        left.value = x;
      }
      function handleTouchEnd() {
        if (props.draggable === false)
          return;
        const screenCenterX = screen.width / 2;
        const fabCenterX = left.value + fabSize.width / 2;
        attractTransition.value = true;
        if (fabCenterX < screenCenterX) {
          left.value = bounding.minLeft;
          fabDirection.value = "right";
        } else {
          left.value = bounding.maxLeft;
          fabDirection.value = "left";
        }
      }
      const rootStyle = vue.computed(() => {
        const style = {
          top: top.value + "px",
          left: left.value + "px",
          transition: attractTransition.value ? "all ease 0.3s" : "none"
        };
        if (isDef(props.zIndex)) {
          style["z-index"] = props.zIndex;
        }
        return `${objToStyle(style)};${props.customStyle}`;
      });
      vue.onMounted(() => {
        if (queue2 && queue2.pushToQueue) {
          queue2.pushToQueue(proxy);
        } else {
          pushToQueue(proxy);
        }
        const { start } = useRaf(async () => {
          await getBounding();
          initPosition();
          inited.value = true;
        });
        start();
      });
      vue.onBeforeUnmount(() => {
        if (queue2 && queue2.removeFromQueue) {
          queue2.removeFromQueue(proxy);
        } else {
          removeFromQueue(proxy);
        }
      });
      function handleClick() {
        if (props.disabled) {
          return;
        }
        if (!props.expandable) {
          emit("click");
          return;
        }
        isActive.value = !isActive.value;
        emit("update:active", isActive.value);
      }
      function open() {
        isActive.value = true;
        emit("update:active", true);
      }
      function close() {
        isActive.value = false;
        emit("update:active", false);
      }
      __expose({
        open,
        close
      });
      const __returned__ = { props, emit, inited, isActive, queue: queue2, proxy, fabDirection, top, left, screen, fabSize, bounding, getBounding, initPosition, touchOffset, attractTransition, handleTouchStart, handleTouchMove, handleTouchEnd, rootStyle, handleClick, open, close, wdButton: __easycom_3$1, wdIcon: __easycom_0$7, wdTransition };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$x(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        onTouchmove: vue.withModifiers($setup.handleTouchMove, ["stop", "prevent"]),
        onTouchstart: $setup.handleTouchStart,
        onTouchend: $setup.handleTouchEnd,
        class: vue.normalizeClass(`wd-fab ${_ctx.customClass}`),
        style: vue.normalizeStyle($setup.rootStyle),
        onClick: _cache[1] || (_cache[1] = vue.withModifiers(() => {
        }, ["stop"]))
      },
      [
        vue.createElementVNode(
          "view",
          {
            onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
            }, ["stop"])),
            style: vue.normalizeStyle({ visibility: $setup.inited ? "visible" : "hidden" }),
            id: "trigger"
          },
          [
            _ctx.$slots.trigger ? vue.renderSlot(_ctx.$slots, "trigger", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createBlock($setup["wdButton"], {
              key: 1,
              onClick: $setup.handleClick,
              "custom-class": "wd-fab__trigger",
              round: "",
              type: _ctx.type,
              disabled: _ctx.disabled
            }, {
              default: vue.withCtx(() => [
                vue.createVNode($setup["wdIcon"], {
                  "custom-class": "wd-fab__icon",
                  name: $setup.isActive ? _ctx.activeIcon : _ctx.inactiveIcon
                }, null, 8, ["name"])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["type", "disabled"]))
          ],
          4
          /* STYLE */
        ),
        _ctx.expandable ? (vue.openBlock(), vue.createBlock($setup["wdTransition"], {
          key: 0,
          "enter-class": `wd-fab__transition-enter--${$setup.fabDirection}`,
          "enter-active-class": "wd-fab__transition-enter-active",
          "leave-to-class": `wd-fab__transition-leave-to--${$setup.fabDirection}`,
          "leave-active-class": "wd-fab__transition-leave-active",
          "custom-class": `wd-fab__actions wd-fab__actions--${$setup.fabDirection}`,
          show: $setup.isActive,
          duration: 300
        }, {
          default: vue.withCtx(() => [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ]),
          _: 3
          /* FORWARDED */
        }, 8, ["enter-class", "leave-to-class", "custom-class", "show"])) : vue.createCommentVNode("v-if", true)
      ],
      38
      /* CLASS, STYLE, NEED_HYDRATION */
    );
  }
  const __easycom_4$1 = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$x], ["__scopeId", "data-v-c5c35da7"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-fab/wd-fab.vue"]]);
  class DBService {
    constructor() {
      this.db = null;
    }
    // 初始化数据库
    initDB() {
      return new Promise((resolve, reject) => {
        if (!plus.sqlite.isOpenDatabase({
          name: "lifeparterTally",
          path: "_doc/lifeparterTally.db"
        })) {
          this.db = plus.sqlite.openDatabase({
            name: "lifeparterTally",
            path: "_doc/lifeparterTally.db",
            // 对于iOS需要设置location为'default'
            success: function(e2) {
              formatAppLog("log", "at common/dbService.js:17", "数据库打开成功");
            },
            fail: function(e2) {
              formatAppLog("error", "at common/dbService.js:20", "数据库打开失败", e2);
            }
          });
        }
        this.createTables();
        this.initTables();
      });
    }
    // 创建表
    createTables() {
      this.createTable(`create table IF NOT EXISTS tally_account 
						(
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							account_name TEXT NOT NULL,
							balance INTEGER default 0 NOT NULL,
							book_id INTEGER NOT NULL,
							user_id INTEGER NOT NULL,
							account_type TEXT NOT NULL,
							create_time timestamp
							default CURRENT_TIMESTAMP NOT NULL
						);`);
      this.createTable(`create table IF NOT EXISTS tally_bill
						(
						    id          INTEGER PRIMARY KEY AUTOINCREMENT,
							comment 	TEXT,
						    account_id  INTEGER NOT NULL,
						    money       INTEGER default 0 NOT NULL,
						    bill_date   timestamp default CURRENT_TIMESTAMP,
						    category_id INTEGER                             ,
						    create_time timestamp default CURRENT_TIMESTAMP
						);`);
      this.executeSql(`drop table tally_category`);
      this.createTable(`create table IF NOT EXISTS tally_category
						(
						    id INTEGER PRIMARY KEY AUTOINCREMENT,
							parent_id INTEGER NOT NULL, -- 收入类型的一级分类是-1, 支出是-2
						    name TEXT NOT NULL,
							directory INTEGER NOT NULL, -- 收入1,支出-1
							user_id INTEGER NOT NULL,
							UNIQUE(user_id, parent_id, name)
						);`);
    }
    createTable(sql) {
      return new Promise((resolve, reject) => {
        plus.sqlite.executeSql(
          {
            name: "lifeparterTally",
            sql,
            success: function(e2) {
              formatAppLog("log", "at common/dbService.js:74", "表创建成功");
              resolve(e2);
            },
            fail: function(error) {
              formatAppLog("error", "at common/dbService.js:78", "创建表时出错:", error);
              reject(error);
            }
          }
        );
      });
    }
    initTables() {
      this.executeSql(`INSERT INTO tally_category (id, parent_id, name, directory, user_id) VALUES 
		(1, 0, '收入', 1, 1),
		(2, 0, '支出', -1, 1),
		(4, 1, '职业收入', 1, 1),
		(5, 4, '工资收入', 1, 1),
		(6, 4, '公积金收入', 1, 1),
		(7, 2, '日常支出', 1, 1),
		(8, 7, '消费', -1, 1),
		(9, 7, '房租', -1, 1)
		`);
    }
    insertTallyAccount(accountName, balance, bookId, userId, accountType) {
      var sql = `INSERT INTO tally_account (account_name, balance, book_id, user_id, account_type) 
				VALUES ('${accountName}', ${balance}, ${bookId}, ${userId}, '${accountType}')`;
      this.executeSql(sql);
    }
    insertTallyBill(account_id, money, bill_date, category_id, comment) {
      var sql = `INSERT INTO tally_bill (account_id, money, bill_date, category_id, comment) 
				VALUES (${account_id}, ${money}, ${bill_date}, ${category_id}, '${comment}')`;
      this.executeSql(sql);
    }
    deleteTallyBill(id) {
      var sql = `DELETE FROM tally_bill WHERE id=${id}`;
      this.executeSql(sql);
    }
    deleteById(table, id) {
      var sql = `DELETE FROM ${table} WHERE id=${id}`;
      this.executeSql(sql);
    }
    getTallyBill(account_id) {
      return this.queryTable(`SELECT * FROM tally_Bill where account_id=${account_id} order by bill_date desc`);
    }
    getTallyAccount() {
      return this.queryTable(`SELECT id, account_name, balance, account_type FROM tally_account`);
    }
    getTallyCategory() {
      return this.queryTable(`SELECT child.id as id, parent.name || '-' || child.name as category FROM tally_category child
		 join tally_category parent on child.parent_id = parent.id`);
    }
    getTallyCategoryById(id) {
      return this.queryTable(`SELECT * FROM tally_category where id = ${id}`);
    }
    executeSql(sql) {
      return new Promise((resolve, reject) => {
        plus.sqlite.executeSql({
          name: "lifeparterTally",
          sql,
          success: function(e2) {
            formatAppLog("log", "at common/dbService.js:145", "执行成功");
            resolve(e2);
          },
          fail: function(error) {
            formatAppLog("error", "at common/dbService.js:149", "执行出错:", error);
            reject(error);
          }
        });
      });
    }
    queryTableName(tableName) {
      return this.queryTable(`SELECT * FROM ${tableName}`);
    }
    queryTable(sql) {
      return new Promise((resolve, reject) => {
        plus.sqlite.selectSql({
          name: "lifeparterTally",
          sql,
          success: function(data) {
            resolve(data);
          },
          fail: function(error) {
            formatAppLog("error", "at common/dbService.js:170", "查询出错:", error);
            reject(error);
          }
        });
      });
    }
  }
  function keep2DigitsString(number) {
    return parseFloat(number).toFixed(2);
  }
  function keep2Digits(number) {
    return parseFloat(keep2DigitsString(number));
  }
  const _sfc_main$x = {
    __name: "settle-account",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const handleClick = () => {
        uni.navigateTo({
          url: "/pages/settle-account/create-account"
        });
      };
      var cards = vue.reactive([]);
      onLoad((options) => {
        setTimeout(function() {
          formatAppLog("log", "at pages/settle-account/settle-account.vue:52", "start pulldown");
        }, 1e3);
        uni.startPullDownRefresh();
      });
      onShow(async () => {
        const result = await dbService2.getTallyAccount();
        for (var account of result) {
          const tallBill = await dbService2.getTallyBill(account.id);
          account.balance = keep2DigitsString(account.balance + tallBill.reduce((balance, item) => {
            return balance + item.money;
          }, 0));
        }
        const groupData = Array.from(
          result.reduce((map, item) => {
            const key = item.account_type;
            if (!map.has(key))
              map.set(key, []);
            map.get(key).push(item);
            return map;
          }, /* @__PURE__ */ new Map()),
          // 将 Map 转换为所需的数组格式
          ([title, items]) => ({
            title,
            items
          })
        );
        Object.assign(cards, groupData);
      });
      onPullDownRefresh(() => {
        setTimeout(() => {
          uni.stopPullDownRefresh();
        }, 1e3);
      });
      const $refs = vue.getCurrentInstance().proxy.$refs;
      const swipeAction = vue.ref();
      const handleDelete = async (detail, card, index) => {
        try {
          if (swipeAction.value) {
            if (Array.isArray(swipeAction.value)) {
              swipeAction.value.forEach((action) => {
                if (action && action.closeAll) {
                  action.closeAll();
                }
              });
            } else {
              if (swipeAction.value.closeAll) {
                swipeAction.value.closeAll();
              }
            }
          }
          await dbService2.deleteById("tally_account", detail.id);
          card.items.splice(index, 1);
          const cardIndex = cards.findIndex((c2) => c2.title === card.title);
          if (card.items.length === 0 && cardIndex !== -1) {
            cards.splice(cardIndex, 1);
          }
        } catch (e2) {
          formatAppLog("log", "at pages/settle-account/settle-account.vue:122", e2);
          uni.showToast({
            title: "删除失败:" + e2,
            icon: "none"
          });
        }
      };
      const __returned__ = { dbService: dbService2, handleClick, get cards() {
        return cards;
      }, set cards(v2) {
        cards = v2;
      }, $refs, swipeAction, handleDelete, onMounted: vue.onMounted, reactive: vue.reactive, get DBService() {
        return DBService;
      }, get keep2DigitsString() {
        return keep2DigitsString;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$w(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_cell = resolveEasycom(vue.resolveDynamicComponent("wd-cell"), __easycom_0$6);
    const _component_wd_cell_group = resolveEasycom(vue.resolveDynamicComponent("wd-cell-group"), __easycom_2$2);
    const _component_uni_swipe_action_item = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action-item"), __easycom_0$5);
    const _component_uni_swipe_action = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action"), __easycom_1$2);
    const _component_wd_fab = resolveEasycom(vue.resolveDynamicComponent("wd-fab"), __easycom_4$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", null, " 总资产 10000000.00 "),
      vue.createCommentVNode(" 卡片组件 "),
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.cards, (card, index) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            class: "card",
            key: index
          }, [
            vue.createCommentVNode(" 卡片标题 "),
            vue.createElementVNode(
              "view",
              { class: "card-header" },
              vue.toDisplayString(card.title),
              1
              /* TEXT */
            ),
            vue.createVNode(
              _component_uni_swipe_action,
              {
                ref_for: true,
                ref: "swipeAction"
              },
              {
                default: vue.withCtx(() => [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(card.items, (accountItem, itemIndex) => {
                      return vue.openBlock(), vue.createBlock(_component_uni_swipe_action_item, {
                        key: itemIndex,
                        "right-options": [
                          { text: "删除", style: { backgroundColor: "red", color: "#fff" } }
                        ],
                        onClick: () => $setup.handleDelete(accountItem, card, itemIndex)
                      }, {
                        default: vue.withCtx(() => [
                          vue.createVNode(
                            _component_wd_cell_group,
                            { border: "" },
                            {
                              default: vue.withCtx(() => [
                                vue.createVNode(_component_wd_cell, {
                                  border: true,
                                  title: accountItem.account_name,
                                  value: accountItem.balance,
                                  "is-link": "",
                                  to: `/pages/settle-account/settle-account-flow?account_id=${accountItem.id}`
                                }, null, 8, ["title", "value", "to"])
                              ]),
                              _: 2
                              /* DYNAMIC */
                            },
                            1024
                            /* DYNAMIC_SLOTS */
                          )
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                _: 2
                /* DYNAMIC */
              },
              1536
              /* NEED_PATCH, DYNAMIC_SLOTS */
            )
          ]);
        }),
        128
        /* KEYED_FRAGMENT */
      )),
      vue.createVNode(_component_wd_fab, {
        draggable: true,
        expandable: false,
        onClick: $setup.handleClick
      })
    ]);
  }
  const PagesSettleAccountSettleAccount = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["render", _sfc_render$w], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/settle-account.vue"]]);
  const _sfc_main$w = {
    name: "uniLink",
    props: {
      href: {
        type: String,
        default: ""
      },
      text: {
        type: String,
        default: ""
      },
      download: {
        type: String,
        default: ""
      },
      showUnderLine: {
        type: [Boolean, String],
        default: true
      },
      copyTips: {
        type: String,
        default: "已自动复制网址，请在手机浏览器里粘贴该网址"
      },
      color: {
        type: String,
        default: "#999999"
      },
      fontSize: {
        type: [Number, String],
        default: 14
      }
    },
    computed: {
      isShowA() {
        if ((this.isMail() || this.isTel()) && this._isH5 === true) {
          return true;
        }
        return false;
      }
    },
    created() {
      this._isH5 = null;
    },
    methods: {
      isMail() {
        return this.href.startsWith("mailto:");
      },
      isTel() {
        return this.href.startsWith("tel:");
      },
      openURL() {
        if (this.isTel()) {
          this.makePhoneCall(this.href.replace("tel:", ""));
        } else {
          plus.runtime.openURL(this.href);
        }
      },
      makePhoneCall(phoneNumber) {
        uni.makePhoneCall({
          phoneNumber
        });
      }
    }
  };
  function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
    return $options.isShowA ? (vue.openBlock(), vue.createElementBlock("a", {
      key: 0,
      class: vue.normalizeClass(["uni-link", { "uni-link--withline": $props.showUnderLine === true || $props.showUnderLine === "true" }]),
      href: $props.href,
      style: vue.normalizeStyle({ color: $props.color, fontSize: $props.fontSize + "px" }),
      download: $props.download
    }, [
      vue.renderSlot(_ctx.$slots, "default", {}, () => [
        vue.createTextVNode(
          vue.toDisplayString($props.text),
          1
          /* TEXT */
        )
      ], true)
    ], 14, ["href", "download"])) : (vue.openBlock(), vue.createElementBlock(
      "text",
      {
        key: 1,
        class: vue.normalizeClass(["uni-link", { "uni-link--withline": $props.showUnderLine === true || $props.showUnderLine === "true" }]),
        style: vue.normalizeStyle({ color: $props.color, fontSize: $props.fontSize + "px" }),
        onClick: _cache[0] || (_cache[0] = (...args) => $options.openURL && $options.openURL(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, () => [
          vue.createTextVNode(
            vue.toDisplayString($props.text),
            1
            /* TEXT */
          )
        ], true)
      ],
      6
      /* CLASS, STYLE */
    ));
  }
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$v], ["__scopeId", "data-v-5db80ddb"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-link/components/uni-link/uni-link.vue"]]);
  const _sfc_main$v = {
    data() {
      return {
        href: "https://uniapp.dcloud.io/component/README?id=uniui"
      };
    },
    methods: {}
  };
  function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_link = resolveEasycom(vue.resolveDynamicComponent("uni-link"), __easycom_0$4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "intro" }, "本项目已包含uni ui组件，无需import和注册，可直接使用。在代码区键入字母u，即可通过代码助手列出所有可用组件。光标置于组件名称处按F1，即可查看组件文档。"),
      vue.createElementVNode("text", { class: "intro" }, "详见："),
      vue.createVNode(_component_uni_link, {
        href: $data.href,
        text: $data.href
      }, null, 8, ["href", "text"])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$u], ["__file", "E:/document/LifePartner/lifeparter-app/pages/index/index.vue"]]);
  const _sfc_main$u = {
    data() {
      return {
        phone: "",
        password: "",
        showPassword: true
      };
    },
    methods: {
      login() {
        uni.request({
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
            formatAppLog("log", "at pages/login/login.vue:42", res);
            if (res.statusCode == 200) {
              uni.setStorageSync("access_token", res.data.access_token);
              uni.setStorageSync("refresh_token", res.data.refresh_token);
              uni.redirectTo({
                url: "/pages/post/postList"
              });
            }
          },
          fail: () => {
            formatAppLog("log", "at pages/login/login.vue:52", "");
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
  function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("form", null, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            type: "text",
            class: "uni-input",
            id: "phone",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.phone = $event),
            placeholder: "手机号"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.phone]
        ]),
        vue.createElementVNode("br"),
        vue.createElementVNode("view", { class: "uni-input-wrapper" }, [
          vue.withDirectives(vue.createElementVNode("input", {
            class: "uni-input",
            id: "password",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
            placeholder: "密码",
            password: $data.showPassword,
            onClick: _cache[2] || (_cache[2] = (...args) => $options.login && $options.login(...args))
          }, null, 8, ["password"]), [
            [vue.vModelText, $data.password]
          ]),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["uni-icon", [!$data.showPassword ? "uni-eye-active" : ""]]),
              onClick: _cache[3] || (_cache[3] = (...args) => $options.changePassword && $options.changePassword(...args))
            },
            " ",
            2
            /* CLASS */
          )
        ]),
        vue.createElementVNode("br"),
        vue.createElementVNode("button", {
          type: "primary",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.login && $options.login(...args))
        }, "登录")
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$t], ["__file", "E:/document/LifePartner/lifeparter-app/pages/login/login.vue"]]);
  const _sfc_main$t = {
    data() {
      return {
        postList: []
      };
    },
    onLoad: function() {
      uni.request({
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
          "Authorization": "Bearer " + uni.getStorageSync("access_token")
        },
        success: (res) => {
          formatAppLog("log", "at pages/post/postList.vue:39", res);
          this.postList = res.data.data;
        },
        fail: () => {
        },
        complete: () => {
        }
      });
    },
    methods: {
      openPostDetail(e2) {
        var postId = e2.currentTarget.dataset.postid;
        uni.navigateTo({
          url: "/pages/post/postDetail?postId=" + postId
        });
      }
    }
  };
  function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("view", { class: "uni-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.postList, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "uni-list-cell",
              key: item.id,
              onClick: _cache[0] || (_cache[0] = (...args) => $options.openPostDetail && $options.openPostDetail(...args)),
              "data-postid": item.id
            }, [
              vue.createElementVNode("view", { class: "uni-media-list" }, [
                vue.createElementVNode("view", { class: "uni-media-list-body" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "uni-media-list-text-top" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "uni-media-list-text-bottom" },
                    vue.toDisplayString(item.content),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ], 8, ["data-postid"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesPostPostList = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$s], ["__file", "E:/document/LifePartner/lifeparter-app/pages/post/postList.vue"]]);
  const _sfc_main$s = {
    data() {
      return {
        title: "",
        content: ""
      };
    },
    onLoad: function(e2) {
      uni.request({
        url: "http://localhost:8000/post/getPostById",
        method: "GET",
        data: {
          postId: e2.postId
        },
        header: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + uni.getStorageSync("access_token")
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
  function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode(
        "view",
        { class: "title" },
        vue.toDisplayString($data.title),
        1
        /* TEXT */
      ),
      vue.createElementVNode(
        "view",
        { class: "content" },
        vue.toDisplayString($data.content),
        1
        /* TEXT */
      )
    ]);
  }
  const PagesPostPostDetail = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$r], ["__file", "E:/document/LifePartner/lifeparter-app/pages/post/postDetail.vue"]]);
  const _sfc_main$r = {};
  function _sfc_render$q(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view", null, " 个人中心 ");
  }
  const PagesUserCenterUserCenter = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$q], ["__file", "E:/document/LifePartner/lifeparter-app/pages/user-center/user-center.vue"]]);
  const pages = [
    {
      path: "pages/settle-account/settle-account",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/index/index",
      style: {
        navigationBarTitleText: "uni-app"
      }
    },
    {
      path: "pages/login/login",
      style: {
        navigationBarTitleText: "登陆",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/post/postList",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/post/postDetail",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/user-center/user-center",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/reports/reports",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/settle-account/settle-account-flow",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/reports/account",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/settle-account/create-account",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/settle-account/create-flow",
      style: {
        navigationBarTitleText: ""
      }
    }
  ];
  const globalStyle = {
    navigationBarTextStyle: "black",
    navigationBarTitleText: "uni-app",
    navigationBarBackgroundColor: "#F8F8F8",
    backgroundColor: "#F8F8F8",
    "app-plus": {
      background: "#efeff4"
    }
  };
  const condition = {
    current: 0,
    list: [
      {
        name: "settleccount",
        path: "pages/settle-account/settle-account"
      }
    ]
  };
  const tabBar = {
    list: [
      {
        text: "首页",
        pagePath: "pages/settle-account/settle-account",
        iconPath: "/static/home.png",
        selectedIconPath: "/static/home-active.png"
      },
      {
        text: "报表",
        pagePath: "pages/reports/reports",
        iconPath: "/static/tabbar/report.png",
        selectedIconPath: "/static/tabbar/report-active.png"
      },
      {
        text: "我的",
        pagePath: "pages/user-center/user-center",
        iconPath: "/static/tabbar/me.png",
        selectedIconPath: "/static/tabbar/me-active.png"
      }
    ]
  };
  const e = {
    pages,
    globalStyle,
    condition,
    tabBar
  };
  var define_process_env_UNI_SECURE_NETWORK_CONFIG_default = [];
  function t(e2) {
    return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
  }
  function n(e2, t2, n2) {
    return e2(n2 = { path: t2, exports: {}, require: function(e3, t3) {
      return function() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
      }(null == t3 && n2.path);
    } }, n2.exports), n2.exports;
  }
  var s = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = n2 || function(e3, t3) {
      var n3 = Object.create || /* @__PURE__ */ function() {
        function e4() {
        }
        return function(t4) {
          var n4;
          return e4.prototype = t4, n4 = new e4(), e4.prototype = null, n4;
        };
      }(), s2 = {}, r2 = s2.lib = {}, i2 = r2.Base = { extend: function(e4) {
        var t4 = n3(this);
        return e4 && t4.mixIn(e4), t4.hasOwnProperty("init") && this.init !== t4.init || (t4.init = function() {
          t4.$super.init.apply(this, arguments);
        }), t4.init.prototype = t4, t4.$super = this, t4;
      }, create: function() {
        var e4 = this.extend();
        return e4.init.apply(e4, arguments), e4;
      }, init: function() {
      }, mixIn: function(e4) {
        for (var t4 in e4)
          e4.hasOwnProperty(t4) && (this[t4] = e4[t4]);
        e4.hasOwnProperty("toString") && (this.toString = e4.toString);
      }, clone: function() {
        return this.init.prototype.extend(this);
      } }, o2 = r2.WordArray = i2.extend({ init: function(e4, n4) {
        e4 = this.words = e4 || [], this.sigBytes = n4 != t3 ? n4 : 4 * e4.length;
      }, toString: function(e4) {
        return (e4 || c2).stringify(this);
      }, concat: function(e4) {
        var t4 = this.words, n4 = e4.words, s3 = this.sigBytes, r3 = e4.sigBytes;
        if (this.clamp(), s3 % 4)
          for (var i3 = 0; i3 < r3; i3++) {
            var o3 = n4[i3 >>> 2] >>> 24 - i3 % 4 * 8 & 255;
            t4[s3 + i3 >>> 2] |= o3 << 24 - (s3 + i3) % 4 * 8;
          }
        else
          for (i3 = 0; i3 < r3; i3 += 4)
            t4[s3 + i3 >>> 2] = n4[i3 >>> 2];
        return this.sigBytes += r3, this;
      }, clamp: function() {
        var t4 = this.words, n4 = this.sigBytes;
        t4[n4 >>> 2] &= 4294967295 << 32 - n4 % 4 * 8, t4.length = e3.ceil(n4 / 4);
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4.words = this.words.slice(0), e4;
      }, random: function(t4) {
        for (var n4, s3 = [], r3 = function(t5) {
          t5 = t5;
          var n5 = 987654321, s4 = 4294967295;
          return function() {
            var r4 = ((n5 = 36969 * (65535 & n5) + (n5 >> 16) & s4) << 16) + (t5 = 18e3 * (65535 & t5) + (t5 >> 16) & s4) & s4;
            return r4 /= 4294967296, (r4 += 0.5) * (e3.random() > 0.5 ? 1 : -1);
          };
        }, i3 = 0; i3 < t4; i3 += 4) {
          var a3 = r3(4294967296 * (n4 || e3.random()));
          n4 = 987654071 * a3(), s3.push(4294967296 * a3() | 0);
        }
        return new o2.init(s3, t4);
      } }), a2 = s2.enc = {}, c2 = a2.Hex = { stringify: function(e4) {
        for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push((i3 >>> 4).toString(16)), s3.push((15 & i3).toString(16));
        }
        return s3.join("");
      }, parse: function(e4) {
        for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3 += 2)
          n4[s3 >>> 3] |= parseInt(e4.substr(s3, 2), 16) << 24 - s3 % 8 * 4;
        return new o2.init(n4, t4 / 2);
      } }, u2 = a2.Latin1 = { stringify: function(e4) {
        for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push(String.fromCharCode(i3));
        }
        return s3.join("");
      }, parse: function(e4) {
        for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3++)
          n4[s3 >>> 2] |= (255 & e4.charCodeAt(s3)) << 24 - s3 % 4 * 8;
        return new o2.init(n4, t4);
      } }, h2 = a2.Utf8 = { stringify: function(e4) {
        try {
          return decodeURIComponent(escape(u2.stringify(e4)));
        } catch (e5) {
          throw new Error("Malformed UTF-8 data");
        }
      }, parse: function(e4) {
        return u2.parse(unescape(encodeURIComponent(e4)));
      } }, l2 = r2.BufferedBlockAlgorithm = i2.extend({ reset: function() {
        this._data = new o2.init(), this._nDataBytes = 0;
      }, _append: function(e4) {
        "string" == typeof e4 && (e4 = h2.parse(e4)), this._data.concat(e4), this._nDataBytes += e4.sigBytes;
      }, _process: function(t4) {
        var n4 = this._data, s3 = n4.words, r3 = n4.sigBytes, i3 = this.blockSize, a3 = r3 / (4 * i3), c3 = (a3 = t4 ? e3.ceil(a3) : e3.max((0 | a3) - this._minBufferSize, 0)) * i3, u3 = e3.min(4 * c3, r3);
        if (c3) {
          for (var h3 = 0; h3 < c3; h3 += i3)
            this._doProcessBlock(s3, h3);
          var l3 = s3.splice(0, c3);
          n4.sigBytes -= u3;
        }
        return new o2.init(l3, u3);
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._data = this._data.clone(), e4;
      }, _minBufferSize: 0 });
      r2.Hasher = l2.extend({ cfg: i2.extend(), init: function(e4) {
        this.cfg = this.cfg.extend(e4), this.reset();
      }, reset: function() {
        l2.reset.call(this), this._doReset();
      }, update: function(e4) {
        return this._append(e4), this._process(), this;
      }, finalize: function(e4) {
        return e4 && this._append(e4), this._doFinalize();
      }, blockSize: 16, _createHelper: function(e4) {
        return function(t4, n4) {
          return new e4.init(n4).finalize(t4);
        };
      }, _createHmacHelper: function(e4) {
        return function(t4, n4) {
          return new d2.HMAC.init(e4, n4).finalize(t4);
        };
      } });
      var d2 = s2.algo = {};
      return s2;
    }(Math), n2);
  }), r = s, i = (n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function(e3) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [];
      !function() {
        for (var t4 = 0; t4 < 64; t4++)
          a2[t4] = 4294967296 * e3.abs(e3.sin(t4 + 1)) | 0;
      }();
      var c2 = o2.MD5 = i2.extend({ _doReset: function() {
        this._hash = new r2.init([1732584193, 4023233417, 2562383102, 271733878]);
      }, _doProcessBlock: function(e4, t4) {
        for (var n3 = 0; n3 < 16; n3++) {
          var s3 = t4 + n3, r3 = e4[s3];
          e4[s3] = 16711935 & (r3 << 8 | r3 >>> 24) | 4278255360 & (r3 << 24 | r3 >>> 8);
        }
        var i3 = this._hash.words, o3 = e4[t4 + 0], c3 = e4[t4 + 1], p2 = e4[t4 + 2], f2 = e4[t4 + 3], g2 = e4[t4 + 4], m2 = e4[t4 + 5], y2 = e4[t4 + 6], _2 = e4[t4 + 7], w2 = e4[t4 + 8], v2 = e4[t4 + 9], I2 = e4[t4 + 10], S2 = e4[t4 + 11], b2 = e4[t4 + 12], k2 = e4[t4 + 13], T2 = e4[t4 + 14], A2 = e4[t4 + 15], P2 = i3[0], C2 = i3[1], x2 = i3[2], O2 = i3[3];
        P2 = u2(P2, C2, x2, O2, o3, 7, a2[0]), O2 = u2(O2, P2, C2, x2, c3, 12, a2[1]), x2 = u2(x2, O2, P2, C2, p2, 17, a2[2]), C2 = u2(C2, x2, O2, P2, f2, 22, a2[3]), P2 = u2(P2, C2, x2, O2, g2, 7, a2[4]), O2 = u2(O2, P2, C2, x2, m2, 12, a2[5]), x2 = u2(x2, O2, P2, C2, y2, 17, a2[6]), C2 = u2(C2, x2, O2, P2, _2, 22, a2[7]), P2 = u2(P2, C2, x2, O2, w2, 7, a2[8]), O2 = u2(O2, P2, C2, x2, v2, 12, a2[9]), x2 = u2(x2, O2, P2, C2, I2, 17, a2[10]), C2 = u2(C2, x2, O2, P2, S2, 22, a2[11]), P2 = u2(P2, C2, x2, O2, b2, 7, a2[12]), O2 = u2(O2, P2, C2, x2, k2, 12, a2[13]), x2 = u2(x2, O2, P2, C2, T2, 17, a2[14]), P2 = h2(P2, C2 = u2(C2, x2, O2, P2, A2, 22, a2[15]), x2, O2, c3, 5, a2[16]), O2 = h2(O2, P2, C2, x2, y2, 9, a2[17]), x2 = h2(x2, O2, P2, C2, S2, 14, a2[18]), C2 = h2(C2, x2, O2, P2, o3, 20, a2[19]), P2 = h2(P2, C2, x2, O2, m2, 5, a2[20]), O2 = h2(O2, P2, C2, x2, I2, 9, a2[21]), x2 = h2(x2, O2, P2, C2, A2, 14, a2[22]), C2 = h2(C2, x2, O2, P2, g2, 20, a2[23]), P2 = h2(P2, C2, x2, O2, v2, 5, a2[24]), O2 = h2(O2, P2, C2, x2, T2, 9, a2[25]), x2 = h2(x2, O2, P2, C2, f2, 14, a2[26]), C2 = h2(C2, x2, O2, P2, w2, 20, a2[27]), P2 = h2(P2, C2, x2, O2, k2, 5, a2[28]), O2 = h2(O2, P2, C2, x2, p2, 9, a2[29]), x2 = h2(x2, O2, P2, C2, _2, 14, a2[30]), P2 = l2(P2, C2 = h2(C2, x2, O2, P2, b2, 20, a2[31]), x2, O2, m2, 4, a2[32]), O2 = l2(O2, P2, C2, x2, w2, 11, a2[33]), x2 = l2(x2, O2, P2, C2, S2, 16, a2[34]), C2 = l2(C2, x2, O2, P2, T2, 23, a2[35]), P2 = l2(P2, C2, x2, O2, c3, 4, a2[36]), O2 = l2(O2, P2, C2, x2, g2, 11, a2[37]), x2 = l2(x2, O2, P2, C2, _2, 16, a2[38]), C2 = l2(C2, x2, O2, P2, I2, 23, a2[39]), P2 = l2(P2, C2, x2, O2, k2, 4, a2[40]), O2 = l2(O2, P2, C2, x2, o3, 11, a2[41]), x2 = l2(x2, O2, P2, C2, f2, 16, a2[42]), C2 = l2(C2, x2, O2, P2, y2, 23, a2[43]), P2 = l2(P2, C2, x2, O2, v2, 4, a2[44]), O2 = l2(O2, P2, C2, x2, b2, 11, a2[45]), x2 = l2(x2, O2, P2, C2, A2, 16, a2[46]), P2 = d2(P2, C2 = l2(C2, x2, O2, P2, p2, 23, a2[47]), x2, O2, o3, 6, a2[48]), O2 = d2(O2, P2, C2, x2, _2, 10, a2[49]), x2 = d2(x2, O2, P2, C2, T2, 15, a2[50]), C2 = d2(C2, x2, O2, P2, m2, 21, a2[51]), P2 = d2(P2, C2, x2, O2, b2, 6, a2[52]), O2 = d2(O2, P2, C2, x2, f2, 10, a2[53]), x2 = d2(x2, O2, P2, C2, I2, 15, a2[54]), C2 = d2(C2, x2, O2, P2, c3, 21, a2[55]), P2 = d2(P2, C2, x2, O2, w2, 6, a2[56]), O2 = d2(O2, P2, C2, x2, A2, 10, a2[57]), x2 = d2(x2, O2, P2, C2, y2, 15, a2[58]), C2 = d2(C2, x2, O2, P2, k2, 21, a2[59]), P2 = d2(P2, C2, x2, O2, g2, 6, a2[60]), O2 = d2(O2, P2, C2, x2, S2, 10, a2[61]), x2 = d2(x2, O2, P2, C2, p2, 15, a2[62]), C2 = d2(C2, x2, O2, P2, v2, 21, a2[63]), i3[0] = i3[0] + P2 | 0, i3[1] = i3[1] + C2 | 0, i3[2] = i3[2] + x2 | 0, i3[3] = i3[3] + O2 | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        n3[r3 >>> 5] |= 128 << 24 - r3 % 32;
        var i3 = e3.floor(s3 / 4294967296), o3 = s3;
        n3[15 + (r3 + 64 >>> 9 << 4)] = 16711935 & (i3 << 8 | i3 >>> 24) | 4278255360 & (i3 << 24 | i3 >>> 8), n3[14 + (r3 + 64 >>> 9 << 4)] = 16711935 & (o3 << 8 | o3 >>> 24) | 4278255360 & (o3 << 24 | o3 >>> 8), t4.sigBytes = 4 * (n3.length + 1), this._process();
        for (var a3 = this._hash, c3 = a3.words, u3 = 0; u3 < 4; u3++) {
          var h3 = c3[u3];
          c3[u3] = 16711935 & (h3 << 8 | h3 >>> 24) | 4278255360 & (h3 << 24 | h3 >>> 8);
        }
        return a3;
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._hash = this._hash.clone(), e4;
      } });
      function u2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 & n3 | ~t4 & s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function h2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 & s3 | n3 & ~s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function l2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 ^ n3 ^ s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function d2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (n3 ^ (t4 | ~s3)) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      t3.MD5 = i2._createHelper(c2), t3.HmacMD5 = i2._createHmacHelper(c2);
    }(Math), n2.MD5);
  }), n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, void function() {
      var e3 = n2, t3 = e3.lib.Base, s2 = e3.enc.Utf8;
      e3.algo.HMAC = t3.extend({ init: function(e4, t4) {
        e4 = this._hasher = new e4.init(), "string" == typeof t4 && (t4 = s2.parse(t4));
        var n3 = e4.blockSize, r2 = 4 * n3;
        t4.sigBytes > r2 && (t4 = e4.finalize(t4)), t4.clamp();
        for (var i2 = this._oKey = t4.clone(), o2 = this._iKey = t4.clone(), a2 = i2.words, c2 = o2.words, u2 = 0; u2 < n3; u2++)
          a2[u2] ^= 1549556828, c2[u2] ^= 909522486;
        i2.sigBytes = o2.sigBytes = r2, this.reset();
      }, reset: function() {
        var e4 = this._hasher;
        e4.reset(), e4.update(this._iKey);
      }, update: function(e4) {
        return this._hasher.update(e4), this;
      }, finalize: function(e4) {
        var t4 = this._hasher, n3 = t4.finalize(e4);
        return t4.reset(), t4.finalize(this._oKey.clone().concat(n3));
      } });
    }());
  }), n(function(e2, t2) {
    e2.exports = r.HmacMD5;
  })), o = n(function(e2, t2) {
    e2.exports = r.enc.Utf8;
  }), a = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function() {
      var e3 = n2, t3 = e3.lib.WordArray;
      function s2(e4, n3, s3) {
        for (var r2 = [], i2 = 0, o2 = 0; o2 < n3; o2++)
          if (o2 % 4) {
            var a2 = s3[e4.charCodeAt(o2 - 1)] << o2 % 4 * 2, c2 = s3[e4.charCodeAt(o2)] >>> 6 - o2 % 4 * 2;
            r2[i2 >>> 2] |= (a2 | c2) << 24 - i2 % 4 * 8, i2++;
          }
        return t3.create(r2, i2);
      }
      e3.enc.Base64 = { stringify: function(e4) {
        var t4 = e4.words, n3 = e4.sigBytes, s3 = this._map;
        e4.clamp();
        for (var r2 = [], i2 = 0; i2 < n3; i2 += 3)
          for (var o2 = (t4[i2 >>> 2] >>> 24 - i2 % 4 * 8 & 255) << 16 | (t4[i2 + 1 >>> 2] >>> 24 - (i2 + 1) % 4 * 8 & 255) << 8 | t4[i2 + 2 >>> 2] >>> 24 - (i2 + 2) % 4 * 8 & 255, a2 = 0; a2 < 4 && i2 + 0.75 * a2 < n3; a2++)
            r2.push(s3.charAt(o2 >>> 6 * (3 - a2) & 63));
        var c2 = s3.charAt(64);
        if (c2)
          for (; r2.length % 4; )
            r2.push(c2);
        return r2.join("");
      }, parse: function(e4) {
        var t4 = e4.length, n3 = this._map, r2 = this._reverseMap;
        if (!r2) {
          r2 = this._reverseMap = [];
          for (var i2 = 0; i2 < n3.length; i2++)
            r2[n3.charCodeAt(i2)] = i2;
        }
        var o2 = n3.charAt(64);
        if (o2) {
          var a2 = e4.indexOf(o2);
          -1 !== a2 && (t4 = a2);
        }
        return s2(e4, t4, r2);
      }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
    }(), n2.enc.Base64);
  });
  const c = "FUNCTION", u = "OBJECT", h = "CLIENT_DB", l = "pending", d = "fulfilled", p = "rejected";
  function f(e2) {
    return Object.prototype.toString.call(e2).slice(8, -1).toLowerCase();
  }
  function g(e2) {
    return "object" === f(e2);
  }
  function m(e2) {
    return "function" == typeof e2;
  }
  function y(e2) {
    return function() {
      try {
        return e2.apply(e2, arguments);
      } catch (e3) {
        console.error(e3);
      }
    };
  }
  const _ = "REJECTED", w = "NOT_PENDING";
  class v {
    constructor({ createPromise: e2, retryRule: t2 = _ } = {}) {
      this.createPromise = e2, this.status = null, this.promise = null, this.retryRule = t2;
    }
    get needRetry() {
      if (!this.status)
        return true;
      switch (this.retryRule) {
        case _:
          return this.status === p;
        case w:
          return this.status !== l;
      }
    }
    exec() {
      return this.needRetry ? (this.status = l, this.promise = this.createPromise().then((e2) => (this.status = d, Promise.resolve(e2)), (e2) => (this.status = p, Promise.reject(e2))), this.promise) : this.promise;
    }
  }
  function I(e2) {
    return e2 && "string" == typeof e2 ? JSON.parse(e2) : e2;
  }
  const S = true, b = "app", T = I(define_process_env_UNI_SECURE_NETWORK_CONFIG_default), A = b, P = I(""), C = I("[]") || [];
  let O = "";
  try {
    O = "__UNI__E017681";
  } catch (e2) {
  }
  let E, L = {};
  function R(e2, t2 = {}) {
    var n2, s2;
    return n2 = L, s2 = e2, Object.prototype.hasOwnProperty.call(n2, s2) || (L[e2] = t2), L[e2];
  }
  function U() {
    return E || (E = function() {
      if ("undefined" != typeof globalThis)
        return globalThis;
      if ("undefined" != typeof self)
        return self;
      if ("undefined" != typeof window)
        return window;
      function e2() {
        return this;
      }
      return void 0 !== e2() ? e2() : new Function("return this")();
    }(), E);
  }
  L = uni._globalUniCloudObj ? uni._globalUniCloudObj : uni._globalUniCloudObj = {};
  const N = ["invoke", "success", "fail", "complete"], D = R("_globalUniCloudInterceptor");
  function M(e2, t2) {
    D[e2] || (D[e2] = {}), g(t2) && Object.keys(t2).forEach((n2) => {
      N.indexOf(n2) > -1 && function(e3, t3, n3) {
        let s2 = D[e3][t3];
        s2 || (s2 = D[e3][t3] = []), -1 === s2.indexOf(n3) && m(n3) && s2.push(n3);
      }(e2, n2, t2[n2]);
    });
  }
  function q(e2, t2) {
    D[e2] || (D[e2] = {}), g(t2) ? Object.keys(t2).forEach((n2) => {
      N.indexOf(n2) > -1 && function(e3, t3, n3) {
        const s2 = D[e3][t3];
        if (!s2)
          return;
        const r2 = s2.indexOf(n3);
        r2 > -1 && s2.splice(r2, 1);
      }(e2, n2, t2[n2]);
    }) : delete D[e2];
  }
  function K(e2, t2) {
    return e2 && 0 !== e2.length ? e2.reduce((e3, n2) => e3.then(() => n2(t2)), Promise.resolve()) : Promise.resolve();
  }
  function F(e2, t2) {
    return D[e2] && D[e2][t2] || [];
  }
  function j(e2) {
    M("callObject", e2);
  }
  const $ = R("_globalUniCloudListener"), B = "response", W = "needLogin", H = "refreshToken", J = "clientdb", z = "cloudfunction", V = "cloudobject";
  function G(e2) {
    return $[e2] || ($[e2] = []), $[e2];
  }
  function Y(e2, t2) {
    const n2 = G(e2);
    n2.includes(t2) || n2.push(t2);
  }
  function Q(e2, t2) {
    const n2 = G(e2), s2 = n2.indexOf(t2);
    -1 !== s2 && n2.splice(s2, 1);
  }
  function X(e2, t2) {
    const n2 = G(e2);
    for (let e3 = 0; e3 < n2.length; e3++) {
      (0, n2[e3])(t2);
    }
  }
  let Z, ee = false;
  function te() {
    return Z || (Z = new Promise((e2) => {
      ee && e2(), function t2() {
        if ("function" == typeof getCurrentPages) {
          const t3 = getCurrentPages();
          t3 && t3[0] && (ee = true, e2());
        }
        ee || setTimeout(() => {
          t2();
        }, 30);
      }();
    }), Z);
  }
  function ne(e2) {
    const t2 = {};
    for (const n2 in e2) {
      const s2 = e2[n2];
      m(s2) && (t2[n2] = y(s2));
    }
    return t2;
  }
  class se extends Error {
    constructor(e2) {
      super(e2.message), this.errMsg = e2.message || e2.errMsg || "unknown system error", this.code = this.errCode = e2.code || e2.errCode || "SYSTEM_ERROR", this.errSubject = this.subject = e2.subject || e2.errSubject, this.cause = e2.cause, this.requestId = e2.requestId;
    }
    toJson(e2 = 0) {
      if (!(e2 >= 10))
        return e2++, { errCode: this.errCode, errMsg: this.errMsg, errSubject: this.errSubject, cause: this.cause && this.cause.toJson ? this.cause.toJson(e2) : this.cause };
    }
  }
  var re = { request: (e2) => uni.request(e2), uploadFile: (e2) => uni.uploadFile(e2), setStorageSync: (e2, t2) => uni.setStorageSync(e2, t2), getStorageSync: (e2) => uni.getStorageSync(e2), removeStorageSync: (e2) => uni.removeStorageSync(e2), clearStorageSync: () => uni.clearStorageSync(), connectSocket: (e2) => uni.connectSocket(e2) };
  function ie(e2) {
    return e2 && ie(e2.__v_raw) || e2;
  }
  function oe() {
    return { token: re.getStorageSync("uni_id_token") || re.getStorageSync("uniIdToken"), tokenExpired: re.getStorageSync("uni_id_token_expired") };
  }
  function ae({ token: e2, tokenExpired: t2 } = {}) {
    e2 && re.setStorageSync("uni_id_token", e2), t2 && re.setStorageSync("uni_id_token_expired", t2);
  }
  let ce, ue;
  function he() {
    return ce || (ce = uni.getSystemInfoSync()), ce;
  }
  function le() {
    let e2, t2;
    try {
      if (uni.getLaunchOptionsSync) {
        if (uni.getLaunchOptionsSync.toString().indexOf("not yet implemented") > -1)
          return;
        const { scene: n2, channel: s2 } = uni.getLaunchOptionsSync();
        e2 = s2, t2 = n2;
      }
    } catch (e3) {
    }
    return { channel: e2, scene: t2 };
  }
  let de = {};
  function pe() {
    const e2 = uni.getLocale && uni.getLocale() || "en";
    if (ue)
      return { ...de, ...ue, locale: e2, LOCALE: e2 };
    const t2 = he(), { deviceId: n2, osName: s2, uniPlatform: r2, appId: i2 } = t2, o2 = ["appId", "appLanguage", "appName", "appVersion", "appVersionCode", "appWgtVersion", "browserName", "browserVersion", "deviceBrand", "deviceId", "deviceModel", "deviceType", "osName", "osVersion", "romName", "romVersion", "ua", "hostName", "hostVersion", "uniPlatform", "uniRuntimeVersion", "uniRuntimeVersionCode", "uniCompilerVersion", "uniCompilerVersionCode"];
    for (const e3 in t2)
      Object.hasOwnProperty.call(t2, e3) && -1 === o2.indexOf(e3) && delete t2[e3];
    return ue = { PLATFORM: r2, OS: s2, APPID: i2, DEVICEID: n2, ...le(), ...t2 }, { ...de, ...ue, locale: e2, LOCALE: e2 };
  }
  var fe = { sign: function(e2, t2) {
    let n2 = "";
    return Object.keys(e2).sort().forEach(function(t3) {
      e2[t3] && (n2 = n2 + "&" + t3 + "=" + e2[t3]);
    }), n2 = n2.slice(1), i(n2, t2).toString();
  }, wrappedRequest: function(e2, t2) {
    return new Promise((n2, s2) => {
      t2(Object.assign(e2, { complete(e3) {
        e3 || (e3 = {});
        const t3 = e3.data && e3.data.header && e3.data.header["x-serverless-request-id"] || e3.header && e3.header["request-id"];
        if (!e3.statusCode || e3.statusCode >= 400) {
          const n3 = e3.data && e3.data.error && e3.data.error.code || "SYS_ERR", r3 = e3.data && e3.data.error && e3.data.error.message || e3.errMsg || "request:fail";
          return s2(new se({ code: n3, message: r3, requestId: t3 }));
        }
        const r2 = e3.data;
        if (r2.error)
          return s2(new se({ code: r2.error.code, message: r2.error.message, requestId: t3 }));
        r2.result = r2.data, r2.requestId = t3, delete r2.data, n2(r2);
      } }));
    });
  }, toBase64: function(e2) {
    return a.stringify(o.parse(e2));
  } };
  var ge = class {
    constructor(e2) {
      ["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), this.config = Object.assign({}, { endpoint: 0 === e2.spaceId.indexOf("mp-") ? "https://api.next.bspapp.com" : "https://api.bspapp.com" }, e2), this.config.provider = "aliyun", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.config.accessTokenKey = "access_token_" + this.config.spaceId, this.adapter = re, this._getAccessTokenPromiseHub = new v({ createPromise: () => this.requestAuth(this.setupRequest({ method: "serverless.auth.user.anonymousAuthorize", params: "{}" }, "auth")).then((e3) => {
        if (!e3.result || !e3.result.accessToken)
          throw new se({ code: "AUTH_FAILED", message: "获取accessToken失败" });
        this.setAccessToken(e3.result.accessToken);
      }), retryRule: w });
    }
    get hasAccessToken() {
      return !!this.accessToken;
    }
    setAccessToken(e2) {
      this.accessToken = e2;
    }
    requestWrapped(e2) {
      return fe.wrappedRequest(e2, this.adapter.request);
    }
    requestAuth(e2) {
      return this.requestWrapped(e2);
    }
    request(e2, t2) {
      return Promise.resolve().then(() => this.hasAccessToken ? t2 ? this.requestWrapped(e2) : this.requestWrapped(e2).catch((t3) => new Promise((e3, n2) => {
        !t3 || "GATEWAY_INVALID_TOKEN" !== t3.code && "InvalidParameter.InvalidToken" !== t3.code ? n2(t3) : e3();
      }).then(() => this.getAccessToken()).then(() => {
        const t4 = this.rebuildRequest(e2);
        return this.request(t4, true);
      })) : this.getAccessToken().then(() => {
        const t3 = this.rebuildRequest(e2);
        return this.request(t3, true);
      }));
    }
    rebuildRequest(e2) {
      const t2 = Object.assign({}, e2);
      return t2.data.token = this.accessToken, t2.header["x-basement-token"] = this.accessToken, t2.header["x-serverless-sign"] = fe.sign(t2.data, this.config.clientSecret), t2;
    }
    setupRequest(e2, t2) {
      const n2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      return "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = fe.sign(n2, this.config.clientSecret), { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: s2 };
    }
    getAccessToken() {
      return this._getAccessTokenPromiseHub.exec();
    }
    async authorize() {
      await this.getAccessToken();
    }
    callFunction(e2) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
      return this.request({ ...this.setupRequest(t2), timeout: e2.timeout });
    }
    getOSSUploadOptionsFromPath(e2) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
      return this.request(this.setupRequest(t2));
    }
    uploadFileToOSS({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
      return new Promise((o2, a2) => {
        const c2 = this.adapter.uploadFile({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, header: { "X-OSS-server-side-encrpytion": "AES256" }, success(e3) {
          e3 && e3.statusCode < 400 ? o2(e3) : a2(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          a2(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
          i2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    reportOSSUpload(e2) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
      return this.request(this.setupRequest(t2));
    }
    async uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", cloudPathAsRealPath: s2 = false, onUploadProgress: r2, config: i2 }) {
      if ("string" !== f(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const o2 = i2 && i2.envType || this.config.envType;
      if (s2 && ("/" !== t2[0] && (t2 = "/" + t2), t2.indexOf("\\") > -1))
        throw new se({ code: "INVALID_PARAM", message: "使用cloudPath作为路径时，cloudPath不可包含“\\”" });
      const a2 = (await this.getOSSUploadOptionsFromPath({ env: o2, filename: s2 ? t2.split("/").pop() : t2, fileId: s2 ? t2 : void 0 })).result, c2 = "https://" + a2.cdnDomain + "/" + a2.ossPath, { securityToken: u2, accessKeyId: h2, signature: l2, host: d2, ossPath: p2, id: g2, policy: m2, ossCallbackUrl: y2 } = a2, _2 = { "Cache-Control": "max-age=2592000", "Content-Disposition": "attachment", OSSAccessKeyId: h2, Signature: l2, host: d2, id: g2, key: p2, policy: m2, success_action_status: 200 };
      if (u2 && (_2["x-oss-security-token"] = u2), y2) {
        const e3 = JSON.stringify({ callbackUrl: y2, callbackBody: JSON.stringify({ fileId: g2, spaceId: this.config.spaceId }), callbackBodyType: "application/json" });
        _2.callback = fe.toBase64(e3);
      }
      const w2 = { url: "https://" + a2.host, formData: _2, fileName: "file", name: "file", filePath: e2, fileType: n2 };
      if (await this.uploadFileToOSS(Object.assign({}, w2, { onUploadProgress: r2 })), y2)
        return { success: true, filePath: e2, fileID: c2 };
      if ((await this.reportOSSUpload({ id: g2 })).success)
        return { success: true, filePath: e2, fileID: c2 };
      throw new se({ code: "UPLOAD_FAILED", message: "文件上传失败" });
    }
    getTempFileURL({ fileList: e2 } = {}) {
      return new Promise((t2, n2) => {
        Array.isArray(e2) && 0 !== e2.length || n2(new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" })), t2({ fileList: e2.map((e3) => ({ fileID: e3, tempFileURL: e3 })) });
      });
    }
    async getFileInfo({ fileList: e2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.info", params: JSON.stringify({ id: e2.map((e3) => e3.split("?")[0]).join(",") }) };
      return { fileList: (await this.request(this.setupRequest(t2))).result };
    }
  };
  var me = { init(e2) {
    const t2 = new ge(e2), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  const ye = "undefined" != typeof location && "http:" === location.protocol ? "http:" : "https:";
  var _e;
  !function(e2) {
    e2.local = "local", e2.none = "none", e2.session = "session";
  }(_e || (_e = {}));
  var we = function() {
  }, ve = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function(e3) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [], c2 = [];
      !function() {
        function t4(t5) {
          for (var n4 = e3.sqrt(t5), s4 = 2; s4 <= n4; s4++)
            if (!(t5 % s4))
              return false;
          return true;
        }
        function n3(e4) {
          return 4294967296 * (e4 - (0 | e4)) | 0;
        }
        for (var s3 = 2, r3 = 0; r3 < 64; )
          t4(s3) && (r3 < 8 && (a2[r3] = n3(e3.pow(s3, 0.5))), c2[r3] = n3(e3.pow(s3, 1 / 3)), r3++), s3++;
      }();
      var u2 = [], h2 = o2.SHA256 = i2.extend({ _doReset: function() {
        this._hash = new r2.init(a2.slice(0));
      }, _doProcessBlock: function(e4, t4) {
        for (var n3 = this._hash.words, s3 = n3[0], r3 = n3[1], i3 = n3[2], o3 = n3[3], a3 = n3[4], h3 = n3[5], l2 = n3[6], d2 = n3[7], p2 = 0; p2 < 64; p2++) {
          if (p2 < 16)
            u2[p2] = 0 | e4[t4 + p2];
          else {
            var f2 = u2[p2 - 15], g2 = (f2 << 25 | f2 >>> 7) ^ (f2 << 14 | f2 >>> 18) ^ f2 >>> 3, m2 = u2[p2 - 2], y2 = (m2 << 15 | m2 >>> 17) ^ (m2 << 13 | m2 >>> 19) ^ m2 >>> 10;
            u2[p2] = g2 + u2[p2 - 7] + y2 + u2[p2 - 16];
          }
          var _2 = s3 & r3 ^ s3 & i3 ^ r3 & i3, w2 = (s3 << 30 | s3 >>> 2) ^ (s3 << 19 | s3 >>> 13) ^ (s3 << 10 | s3 >>> 22), v2 = d2 + ((a3 << 26 | a3 >>> 6) ^ (a3 << 21 | a3 >>> 11) ^ (a3 << 7 | a3 >>> 25)) + (a3 & h3 ^ ~a3 & l2) + c2[p2] + u2[p2];
          d2 = l2, l2 = h3, h3 = a3, a3 = o3 + v2 | 0, o3 = i3, i3 = r3, r3 = s3, s3 = v2 + (w2 + _2) | 0;
        }
        n3[0] = n3[0] + s3 | 0, n3[1] = n3[1] + r3 | 0, n3[2] = n3[2] + i3 | 0, n3[3] = n3[3] + o3 | 0, n3[4] = n3[4] + a3 | 0, n3[5] = n3[5] + h3 | 0, n3[6] = n3[6] + l2 | 0, n3[7] = n3[7] + d2 | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        return n3[r3 >>> 5] |= 128 << 24 - r3 % 32, n3[14 + (r3 + 64 >>> 9 << 4)] = e3.floor(s3 / 4294967296), n3[15 + (r3 + 64 >>> 9 << 4)] = s3, t4.sigBytes = 4 * n3.length, this._process(), this._hash;
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._hash = this._hash.clone(), e4;
      } });
      t3.SHA256 = i2._createHelper(h2), t3.HmacSHA256 = i2._createHmacHelper(h2);
    }(Math), n2.SHA256);
  }), Ie = ve, Se = n(function(e2, t2) {
    e2.exports = r.HmacSHA256;
  });
  const be = () => {
    let e2;
    if (!Promise) {
      e2 = () => {
      }, e2.promise = {};
      const t3 = () => {
        throw new se({ message: 'Your Node runtime does support ES6 Promises. Set "global.Promise" to your preferred implementation of promises.' });
      };
      return Object.defineProperty(e2.promise, "then", { get: t3 }), Object.defineProperty(e2.promise, "catch", { get: t3 }), e2;
    }
    const t2 = new Promise((t3, n2) => {
      e2 = (e3, s2) => e3 ? n2(e3) : t3(s2);
    });
    return e2.promise = t2, e2;
  };
  function ke(e2) {
    return void 0 === e2;
  }
  function Te(e2) {
    return "[object Null]" === Object.prototype.toString.call(e2);
  }
  function Ae(e2 = "") {
    return e2.replace(/([\s\S]+)\s+(请前往云开发AI小助手查看问题：.*)/, "$1");
  }
  function Pe(e2 = 32) {
    const t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n2 = t2.length;
    let s2 = "";
    for (let r2 = 0; r2 < e2; r2++)
      s2 += t2.charAt(Math.floor(Math.random() * n2));
    return s2;
  }
  var Ce;
  function xe(e2) {
    const t2 = (n2 = e2, "[object Array]" === Object.prototype.toString.call(n2) ? e2 : [e2]);
    var n2;
    for (const e3 of t2) {
      const { isMatch: t3, genAdapter: n3, runtime: s2 } = e3;
      if (t3())
        return { adapter: n3(), runtime: s2 };
    }
  }
  !function(e2) {
    e2.WEB = "web", e2.WX_MP = "wx_mp";
  }(Ce || (Ce = {}));
  const Oe = { adapter: null, runtime: void 0 }, Ee = ["anonymousUuidKey"];
  class Le extends we {
    constructor() {
      super(), Oe.adapter.root.tcbObject || (Oe.adapter.root.tcbObject = {});
    }
    setItem(e2, t2) {
      Oe.adapter.root.tcbObject[e2] = t2;
    }
    getItem(e2) {
      return Oe.adapter.root.tcbObject[e2];
    }
    removeItem(e2) {
      delete Oe.adapter.root.tcbObject[e2];
    }
    clear() {
      delete Oe.adapter.root.tcbObject;
    }
  }
  function Re(e2, t2) {
    switch (e2) {
      case "local":
        return t2.localStorage || new Le();
      case "none":
        return new Le();
      default:
        return t2.sessionStorage || new Le();
    }
  }
  class Ue {
    constructor(e2) {
      if (!this._storage) {
        this._persistence = Oe.adapter.primaryStorage || e2.persistence, this._storage = Re(this._persistence, Oe.adapter);
        const t2 = `access_token_${e2.env}`, n2 = `access_token_expire_${e2.env}`, s2 = `refresh_token_${e2.env}`, r2 = `anonymous_uuid_${e2.env}`, i2 = `login_type_${e2.env}`, o2 = "device_id", a2 = `token_type_${e2.env}`, c2 = `user_info_${e2.env}`;
        this.keys = { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2, anonymousUuidKey: r2, loginTypeKey: i2, userInfoKey: c2, deviceIdKey: o2, tokenTypeKey: a2 };
      }
    }
    updatePersistence(e2) {
      if (e2 === this._persistence)
        return;
      const t2 = "local" === this._persistence;
      this._persistence = e2;
      const n2 = Re(e2, Oe.adapter);
      for (const e3 in this.keys) {
        const s2 = this.keys[e3];
        if (t2 && Ee.includes(e3))
          continue;
        const r2 = this._storage.getItem(s2);
        ke(r2) || Te(r2) || (n2.setItem(s2, r2), this._storage.removeItem(s2));
      }
      this._storage = n2;
    }
    setStore(e2, t2, n2) {
      if (!this._storage)
        return;
      const s2 = { version: n2 || "localCachev1", content: t2 }, r2 = JSON.stringify(s2);
      try {
        this._storage.setItem(e2, r2);
      } catch (e3) {
        throw e3;
      }
    }
    getStore(e2, t2) {
      try {
        if (!this._storage)
          return;
      } catch (e3) {
        return "";
      }
      t2 = t2 || "localCachev1";
      const n2 = this._storage.getItem(e2);
      if (!n2)
        return "";
      if (n2.indexOf(t2) >= 0) {
        return JSON.parse(n2).content;
      }
      return "";
    }
    removeStore(e2) {
      this._storage.removeItem(e2);
    }
  }
  const Ne = {}, De = {};
  function Me(e2) {
    return Ne[e2];
  }
  class qe {
    constructor(e2, t2) {
      this.data = t2 || null, this.name = e2;
    }
  }
  class Ke extends qe {
    constructor(e2, t2) {
      super("error", { error: e2, data: t2 }), this.error = e2;
    }
  }
  const Fe = new class {
    constructor() {
      this._listeners = {};
    }
    on(e2, t2) {
      return function(e3, t3, n2) {
        n2[e3] = n2[e3] || [], n2[e3].push(t3);
      }(e2, t2, this._listeners), this;
    }
    off(e2, t2) {
      return function(e3, t3, n2) {
        if (n2 && n2[e3]) {
          const s2 = n2[e3].indexOf(t3);
          -1 !== s2 && n2[e3].splice(s2, 1);
        }
      }(e2, t2, this._listeners), this;
    }
    fire(e2, t2) {
      if (e2 instanceof Ke)
        return console.error(e2.error), this;
      const n2 = "string" == typeof e2 ? new qe(e2, t2 || {}) : e2;
      const s2 = n2.name;
      if (this._listens(s2)) {
        n2.target = this;
        const e3 = this._listeners[s2] ? [...this._listeners[s2]] : [];
        for (const t3 of e3)
          t3.call(this, n2);
      }
      return this;
    }
    _listens(e2) {
      return this._listeners[e2] && this._listeners[e2].length > 0;
    }
  }();
  function je(e2, t2) {
    Fe.on(e2, t2);
  }
  function $e(e2, t2 = {}) {
    Fe.fire(e2, t2);
  }
  function Be(e2, t2) {
    Fe.off(e2, t2);
  }
  const We = "loginStateChanged", He = "loginStateExpire", Je = "loginTypeChanged", ze = "anonymousConverted", Ve = "refreshAccessToken";
  var Ge;
  !function(e2) {
    e2.ANONYMOUS = "ANONYMOUS", e2.WECHAT = "WECHAT", e2.WECHAT_PUBLIC = "WECHAT-PUBLIC", e2.WECHAT_OPEN = "WECHAT-OPEN", e2.CUSTOM = "CUSTOM", e2.EMAIL = "EMAIL", e2.USERNAME = "USERNAME", e2.NULL = "NULL";
  }(Ge || (Ge = {}));
  class Ye {
    constructor() {
      this._fnPromiseMap = /* @__PURE__ */ new Map();
    }
    async run(e2, t2) {
      let n2 = this._fnPromiseMap.get(e2);
      return n2 || (n2 = new Promise(async (n3, s2) => {
        try {
          await this._runIdlePromise();
          const s3 = t2();
          n3(await s3);
        } catch (e3) {
          s2(e3);
        } finally {
          this._fnPromiseMap.delete(e2);
        }
      }), this._fnPromiseMap.set(e2, n2)), n2;
    }
    _runIdlePromise() {
      return Promise.resolve();
    }
  }
  class Qe {
    constructor(e2) {
      this._singlePromise = new Ye(), this._cache = Me(e2.env), this._baseURL = `https://${e2.env}.ap-shanghai.tcb-api.tencentcloudapi.com`, this._reqClass = new Oe.adapter.reqClass({ timeout: e2.timeout, timeoutMsg: `请求在${e2.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] });
    }
    _getDeviceId() {
      if (this._deviceID)
        return this._deviceID;
      const { deviceIdKey: e2 } = this._cache.keys;
      let t2 = this._cache.getStore(e2);
      return "string" == typeof t2 && t2.length >= 16 && t2.length <= 48 || (t2 = Pe(), this._cache.setStore(e2, t2)), this._deviceID = t2, t2;
    }
    async _request(e2, t2, n2 = {}) {
      const s2 = { "x-request-id": Pe(), "x-device-id": this._getDeviceId() };
      if (n2.withAccessToken) {
        const { tokenTypeKey: e3 } = this._cache.keys, t3 = await this.getAccessToken(), n3 = this._cache.getStore(e3);
        s2.authorization = `${n3} ${t3}`;
      }
      return this._reqClass["get" === n2.method ? "get" : "post"]({ url: `${this._baseURL}${e2}`, data: t2, headers: s2 });
    }
    async _fetchAccessToken() {
      const { loginTypeKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2, tokenTypeKey: s2 } = this._cache.keys, r2 = this._cache.getStore(e2);
      if (r2 && r2 !== Ge.ANONYMOUS)
        throw new se({ code: "INVALID_OPERATION", message: "非匿名登录不支持刷新 access token" });
      const i2 = await this._singlePromise.run("fetchAccessToken", async () => (await this._request("/auth/v1/signin/anonymously", {}, { method: "post" })).data), { access_token: o2, expires_in: a2, token_type: c2 } = i2;
      return this._cache.setStore(s2, c2), this._cache.setStore(t2, o2), this._cache.setStore(n2, Date.now() + 1e3 * a2), o2;
    }
    isAccessTokenExpired(e2, t2) {
      let n2 = true;
      return e2 && t2 && (n2 = t2 < Date.now()), n2;
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this.isAccessTokenExpired(n2, s2) ? this._fetchAccessToken() : n2;
    }
    async refreshAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, loginTypeKey: n2 } = this._cache.keys;
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.setStore(n2, Ge.ANONYMOUS), this.getAccessToken();
    }
    async getUserInfo() {
      return this._singlePromise.run("getUserInfo", async () => (await this._request("/auth/v1/user/me", {}, { withAccessToken: true, method: "get" })).data);
    }
  }
  const Xe = ["auth.getJwt", "auth.logout", "auth.signInWithTicket", "auth.signInAnonymously", "auth.signIn", "auth.fetchAccessTokenWithRefreshToken", "auth.signUpWithEmailAndPassword", "auth.activateEndUserMail", "auth.sendPasswordResetEmail", "auth.resetPasswordWithToken", "auth.isUsernameRegistered"], Ze = { "X-SDK-Version": "1.3.5" };
  function et(e2, t2, n2) {
    const s2 = e2[t2];
    e2[t2] = function(t3) {
      const r2 = {}, i2 = {};
      n2.forEach((n3) => {
        const { data: s3, headers: o3 } = n3.call(e2, t3);
        Object.assign(r2, s3), Object.assign(i2, o3);
      });
      const o2 = t3.data;
      return o2 && (() => {
        var e3;
        if (e3 = o2, "[object FormData]" !== Object.prototype.toString.call(e3))
          t3.data = { ...o2, ...r2 };
        else
          for (const e4 in r2)
            o2.append(e4, r2[e4]);
      })(), t3.headers = { ...t3.headers || {}, ...i2 }, s2.call(e2, t3);
    };
  }
  function tt() {
    const e2 = Math.random().toString(16).slice(2);
    return { data: { seqId: e2 }, headers: { ...Ze, "x-seqid": e2 } };
  }
  class nt {
    constructor(e2 = {}) {
      var t2;
      this.config = e2, this._reqClass = new Oe.adapter.reqClass({ timeout: this.config.timeout, timeoutMsg: `请求在${this.config.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] }), this._cache = Me(this.config.env), this._localCache = (t2 = this.config.env, De[t2]), this.oauth = new Qe(this.config), et(this._reqClass, "post", [tt]), et(this._reqClass, "upload", [tt]), et(this._reqClass, "download", [tt]);
    }
    async post(e2) {
      return await this._reqClass.post(e2);
    }
    async upload(e2) {
      return await this._reqClass.upload(e2);
    }
    async download(e2) {
      return await this._reqClass.download(e2);
    }
    async refreshAccessToken() {
      let e2, t2;
      this._refreshAccessTokenPromise || (this._refreshAccessTokenPromise = this._refreshAccessToken());
      try {
        e2 = await this._refreshAccessTokenPromise;
      } catch (e3) {
        t2 = e3;
      }
      if (this._refreshAccessTokenPromise = null, this._shouldRefreshAccessTokenHook = null, t2)
        throw t2;
      return e2;
    }
    async _refreshAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2, loginTypeKey: s2, anonymousUuidKey: r2 } = this._cache.keys;
      this._cache.removeStore(e2), this._cache.removeStore(t2);
      let i2 = this._cache.getStore(n2);
      if (!i2)
        throw new se({ message: "未登录CloudBase" });
      const o2 = { refresh_token: i2 }, a2 = await this.request("auth.fetchAccessTokenWithRefreshToken", o2);
      if (a2.data.code) {
        const { code: e3 } = a2.data;
        if ("SIGN_PARAM_INVALID" === e3 || "REFRESH_TOKEN_EXPIRED" === e3 || "INVALID_REFRESH_TOKEN" === e3) {
          if (this._cache.getStore(s2) === Ge.ANONYMOUS && "INVALID_REFRESH_TOKEN" === e3) {
            const e4 = this._cache.getStore(r2), t3 = this._cache.getStore(n2), s3 = await this.send("auth.signInAnonymously", { anonymous_uuid: e4, refresh_token: t3 });
            return this.setRefreshToken(s3.refresh_token), this._refreshAccessToken();
          }
          $e(He), this._cache.removeStore(n2);
        }
        throw new se({ code: a2.data.code, message: `刷新access token失败：${a2.data.code}` });
      }
      if (a2.data.access_token)
        return $e(Ve), this._cache.setStore(e2, a2.data.access_token), this._cache.setStore(t2, a2.data.access_token_expire + Date.now()), { accessToken: a2.data.access_token, accessTokenExpire: a2.data.access_token_expire };
      a2.data.refresh_token && (this._cache.removeStore(n2), this._cache.setStore(n2, a2.data.refresh_token), this._refreshAccessToken());
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2 } = this._cache.keys;
      if (!this._cache.getStore(n2))
        throw new se({ message: "refresh token不存在，登录状态异常" });
      let s2 = this._cache.getStore(e2), r2 = this._cache.getStore(t2), i2 = true;
      return this._shouldRefreshAccessTokenHook && !await this._shouldRefreshAccessTokenHook(s2, r2) && (i2 = false), (!s2 || !r2 || r2 < Date.now()) && i2 ? this.refreshAccessToken() : { accessToken: s2, accessTokenExpire: r2 };
    }
    async request(e2, t2, n2) {
      const s2 = `x-tcb-trace_${this.config.env}`;
      let r2 = "application/x-www-form-urlencoded";
      const i2 = { action: e2, env: this.config.env, dataVersion: "2019-08-16", ...t2 };
      let o2;
      if (-1 === Xe.indexOf(e2) && (this._cache.keys, i2.access_token = await this.oauth.getAccessToken()), "storage.uploadFile" === e2) {
        o2 = new FormData();
        for (let e3 in o2)
          o2.hasOwnProperty(e3) && void 0 !== o2[e3] && o2.append(e3, i2[e3]);
        r2 = "multipart/form-data";
      } else {
        r2 = "application/json", o2 = {};
        for (let e3 in i2)
          void 0 !== i2[e3] && (o2[e3] = i2[e3]);
      }
      let a2 = { headers: { "content-type": r2 } };
      n2 && n2.timeout && (a2.timeout = n2.timeout), n2 && n2.onUploadProgress && (a2.onUploadProgress = n2.onUploadProgress);
      const c2 = this._localCache.getStore(s2);
      c2 && (a2.headers["X-TCB-Trace"] = c2);
      const { parse: u2, inQuery: h2, search: l2 } = t2;
      let d2 = { env: this.config.env };
      u2 && (d2.parse = true), h2 && (d2 = { ...h2, ...d2 });
      let p2 = function(e3, t3, n3 = {}) {
        const s3 = /\?/.test(t3);
        let r3 = "";
        for (let e4 in n3)
          "" === r3 ? !s3 && (t3 += "?") : r3 += "&", r3 += `${e4}=${encodeURIComponent(n3[e4])}`;
        return /^http(s)?\:\/\//.test(t3 += r3) ? t3 : `${e3}${t3}`;
      }(ye, "//tcb-api.tencentcloudapi.com/web", d2);
      l2 && (p2 += l2);
      const f2 = await this.post({ url: p2, data: o2, ...a2 }), g2 = f2.header && f2.header["x-tcb-trace"];
      if (g2 && this._localCache.setStore(s2, g2), 200 !== Number(f2.status) && 200 !== Number(f2.statusCode) || !f2.data)
        throw new se({ code: "NETWORK_ERROR", message: "network request error" });
      return f2;
    }
    async send(e2, t2 = {}, n2 = {}) {
      const s2 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
      if (("ACCESS_TOKEN_DISABLED" === s2.data.code || "ACCESS_TOKEN_EXPIRED" === s2.data.code) && -1 === Xe.indexOf(e2)) {
        await this.oauth.refreshAccessToken();
        const s3 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
        if (s3.data.code)
          throw new se({ code: s3.data.code, message: Ae(s3.data.message) });
        return s3.data;
      }
      if (s2.data.code)
        throw new se({ code: s2.data.code, message: Ae(s2.data.message) });
      return s2.data;
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
  }
  const st = {};
  function rt(e2) {
    return st[e2];
  }
  class it {
    constructor(e2) {
      this.config = e2, this._cache = Me(e2.env), this._request = rt(e2.env);
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
    setAccessToken(e2, t2) {
      const { accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys;
      this._cache.setStore(n2, e2), this._cache.setStore(s2, t2);
    }
    async refreshUserInfo() {
      const { data: e2 } = await this._request.send("auth.getUserInfo", {});
      return this.setLocalUserInfo(e2), e2;
    }
    setLocalUserInfo(e2) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e2);
    }
  }
  class ot {
    constructor(e2) {
      if (!e2)
        throw new se({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._envId = e2, this._cache = Me(this._envId), this._request = rt(this._envId), this.setUserInfo();
    }
    linkWithTicket(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "ticket must be string" });
      return this._request.send("auth.linkWithTicket", { ticket: e2 });
    }
    linkWithRedirect(e2) {
      e2.signInWithRedirect();
    }
    updatePassword(e2, t2) {
      return this._request.send("auth.updatePassword", { oldPassword: t2, newPassword: e2 });
    }
    updateEmail(e2) {
      return this._request.send("auth.updateEmail", { newEmail: e2 });
    }
    updateUsername(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      return this._request.send("auth.updateUsername", { username: e2 });
    }
    async getLinkedUidList() {
      const { data: e2 } = await this._request.send("auth.getLinkedUidList", {});
      let t2 = false;
      const { users: n2 } = e2;
      return n2.forEach((e3) => {
        e3.wxOpenId && e3.wxPublicId && (t2 = true);
      }), { users: n2, hasPrimaryUid: t2 };
    }
    setPrimaryUid(e2) {
      return this._request.send("auth.setPrimaryUid", { uid: e2 });
    }
    unlink(e2) {
      return this._request.send("auth.unlink", { platform: e2 });
    }
    async update(e2) {
      const { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 } = e2, { data: a2 } = await this._request.send("auth.updateUserInfo", { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 });
      this.setLocalUserInfo(a2);
    }
    async refresh() {
      const e2 = await this._request.oauth.getUserInfo();
      return this.setLocalUserInfo(e2), e2;
    }
    setUserInfo() {
      const { userInfoKey: e2 } = this._cache.keys, t2 = this._cache.getStore(e2);
      ["uid", "loginType", "openid", "wxOpenId", "wxPublicId", "unionId", "qqMiniOpenId", "email", "hasPassword", "customUserId", "nickName", "gender", "avatarUrl"].forEach((e3) => {
        this[e3] = t2[e3];
      }), this.location = { country: t2.country, province: t2.province, city: t2.city };
    }
    setLocalUserInfo(e2) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e2), this.setUserInfo();
    }
  }
  class at {
    constructor(e2) {
      if (!e2)
        throw new se({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._cache = Me(e2);
      const { refreshTokenKey: t2, accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys, r2 = this._cache.getStore(t2), i2 = this._cache.getStore(n2), o2 = this._cache.getStore(s2);
      this.credential = { refreshToken: r2, accessToken: i2, accessTokenExpire: o2 }, this.user = new ot(e2);
    }
    get isAnonymousAuth() {
      return this.loginType === Ge.ANONYMOUS;
    }
    get isCustomAuth() {
      return this.loginType === Ge.CUSTOM;
    }
    get isWeixinAuth() {
      return this.loginType === Ge.WECHAT || this.loginType === Ge.WECHAT_OPEN || this.loginType === Ge.WECHAT_PUBLIC;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
  }
  class ct extends it {
    async signIn() {
      this._cache.updatePersistence("local"), await this._request.oauth.getAccessToken(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.ANONYMOUS, persistence: "local" });
      const e2 = new at(this.config.env);
      return await e2.user.refresh(), e2;
    }
    async linkAndRetrieveDataWithTicket(e2) {
      const { anonymousUuidKey: t2, refreshTokenKey: n2 } = this._cache.keys, s2 = this._cache.getStore(t2), r2 = this._cache.getStore(n2), i2 = await this._request.send("auth.linkAndRetrieveDataWithTicket", { anonymous_uuid: s2, refresh_token: r2, ticket: e2 });
      if (i2.refresh_token)
        return this._clearAnonymousUUID(), this.setRefreshToken(i2.refresh_token), await this._request.refreshAccessToken(), $e(ze, { env: this.config.env }), $e(Je, { loginType: Ge.CUSTOM, persistence: "local" }), { credential: { refreshToken: i2.refresh_token } };
      throw new se({ message: "匿名转化失败" });
    }
    _setAnonymousUUID(e2) {
      const { anonymousUuidKey: t2, loginTypeKey: n2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.setStore(t2, e2), this._cache.setStore(n2, Ge.ANONYMOUS);
    }
    _clearAnonymousUUID() {
      this._cache.removeStore(this._cache.keys.anonymousUuidKey);
    }
  }
  class ut extends it {
    async signIn(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "ticket must be a string" });
      const { refreshTokenKey: t2 } = this._cache.keys, n2 = await this._request.send("auth.signInWithTicket", { ticket: e2, refresh_token: this._cache.getStore(t2) || "" });
      if (n2.refresh_token)
        return this.setRefreshToken(n2.refresh_token), await this._request.refreshAccessToken(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.CUSTOM, persistence: this.config.persistence }), await this.refreshUserInfo(), new at(this.config.env);
      throw new se({ message: "自定义登录失败" });
    }
  }
  class ht extends it {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "email must be a string" });
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: "EMAIL", email: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token: i2, access_token_expire: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), i2 && o2 ? this.setAccessToken(i2, o2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.EMAIL, persistence: this.config.persistence }), new at(this.config.env);
      throw s2.code ? new se({ code: s2.code, message: `邮箱登录失败: ${s2.message}` }) : new se({ message: "邮箱登录失败" });
    }
    async activate(e2) {
      return this._request.send("auth.activateEndUserMail", { token: e2 });
    }
    async resetPasswordWithToken(e2, t2) {
      return this._request.send("auth.resetPasswordWithToken", { token: e2, newPassword: t2 });
    }
  }
  class lt extends it {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      "string" != typeof t2 && (t2 = "", console.warn("password is empty"));
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: Ge.USERNAME, username: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token_expire: i2, access_token: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), o2 && i2 ? this.setAccessToken(o2, i2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), $e(We), $e(Je, { env: this.config.env, loginType: Ge.USERNAME, persistence: this.config.persistence }), new at(this.config.env);
      throw s2.code ? new se({ code: s2.code, message: `用户名密码登录失败: ${s2.message}` }) : new se({ message: "用户名密码登录失败" });
    }
  }
  class dt {
    constructor(e2) {
      this.config = e2, this._cache = Me(e2.env), this._request = rt(e2.env), this._onAnonymousConverted = this._onAnonymousConverted.bind(this), this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this), je(Je, this._onLoginTypeChanged);
    }
    get currentUser() {
      const e2 = this.hasLoginState();
      return e2 && e2.user || null;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
    anonymousAuthProvider() {
      return new ct(this.config);
    }
    customAuthProvider() {
      return new ut(this.config);
    }
    emailAuthProvider() {
      return new ht(this.config);
    }
    usernameAuthProvider() {
      return new lt(this.config);
    }
    async signInAnonymously() {
      return new ct(this.config).signIn();
    }
    async signInWithEmailAndPassword(e2, t2) {
      return new ht(this.config).signIn(e2, t2);
    }
    signInWithUsernameAndPassword(e2, t2) {
      return new lt(this.config).signIn(e2, t2);
    }
    async linkAndRetrieveDataWithTicket(e2) {
      this._anonymousAuthProvider || (this._anonymousAuthProvider = new ct(this.config)), je(ze, this._onAnonymousConverted);
      return await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(e2);
    }
    async signOut() {
      if (this.loginType === Ge.ANONYMOUS)
        throw new se({ message: "匿名用户不支持登出操作" });
      const { refreshTokenKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2 } = this._cache.keys, s2 = this._cache.getStore(e2);
      if (!s2)
        return;
      const r2 = await this._request.send("auth.logout", { refresh_token: s2 });
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.removeStore(n2), $e(We), $e(Je, { env: this.config.env, loginType: Ge.NULL, persistence: this.config.persistence }), r2;
    }
    async signUpWithEmailAndPassword(e2, t2) {
      return this._request.send("auth.signUpWithEmailAndPassword", { email: e2, password: t2 });
    }
    async sendPasswordResetEmail(e2) {
      return this._request.send("auth.sendPasswordResetEmail", { email: e2 });
    }
    onLoginStateChanged(e2) {
      je(We, () => {
        const t3 = this.hasLoginState();
        e2.call(this, t3);
      });
      const t2 = this.hasLoginState();
      e2.call(this, t2);
    }
    onLoginStateExpired(e2) {
      je(He, e2.bind(this));
    }
    onAccessTokenRefreshed(e2) {
      je(Ve, e2.bind(this));
    }
    onAnonymousConverted(e2) {
      je(ze, e2.bind(this));
    }
    onLoginTypeChanged(e2) {
      je(Je, () => {
        const t2 = this.hasLoginState();
        e2.call(this, t2);
      });
    }
    async getAccessToken() {
      return { accessToken: (await this._request.getAccessToken()).accessToken, env: this.config.env };
    }
    hasLoginState() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this._request.oauth.isAccessTokenExpired(n2, s2) ? null : new at(this.config.env);
    }
    async isUsernameRegistered(e2) {
      if ("string" != typeof e2)
        throw new se({ code: "PARAM_ERROR", message: "username must be a string" });
      const { data: t2 } = await this._request.send("auth.isUsernameRegistered", { username: e2 });
      return t2 && t2.isRegistered;
    }
    getLoginState() {
      return Promise.resolve(this.hasLoginState());
    }
    async signInWithTicket(e2) {
      return new ut(this.config).signIn(e2);
    }
    shouldRefreshAccessToken(e2) {
      this._request._shouldRefreshAccessTokenHook = e2.bind(this);
    }
    getUserInfo() {
      return this._request.send("auth.getUserInfo", {}).then((e2) => e2.code ? e2 : { ...e2.data, requestId: e2.seqId });
    }
    getAuthHeader() {
      const { refreshTokenKey: e2, accessTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2);
      return { "x-cloudbase-credentials": this._cache.getStore(t2) + "/@@/" + n2 };
    }
    _onAnonymousConverted(e2) {
      const { env: t2 } = e2.data;
      t2 === this.config.env && this._cache.updatePersistence(this.config.persistence);
    }
    _onLoginTypeChanged(e2) {
      const { loginType: t2, persistence: n2, env: s2 } = e2.data;
      s2 === this.config.env && (this._cache.updatePersistence(n2), this._cache.setStore(this._cache.keys.loginTypeKey, t2));
    }
  }
  const pt = function(e2, t2) {
    t2 = t2 || be();
    const n2 = rt(this.config.env), { cloudPath: s2, filePath: r2, onUploadProgress: i2, fileType: o2 = "image" } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      const { data: { url: a2, authorization: c2, token: u2, fileId: h2, cosFileId: l2 }, requestId: d2 } = e3, p2 = { key: s2, signature: c2, "x-cos-meta-fileid": l2, success_action_status: "201", "x-cos-security-token": u2 };
      n2.upload({ url: a2, data: p2, file: r2, name: s2, fileType: o2, onUploadProgress: i2 }).then((e4) => {
        201 === e4.statusCode ? t2(null, { fileID: h2, requestId: d2 }) : t2(new se({ code: "STORAGE_REQUEST_FAIL", message: `STORAGE_REQUEST_FAIL: ${e4.data}` }));
      }).catch((e4) => {
        t2(e4);
      });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, ft = function(e2, t2) {
    t2 = t2 || be();
    const n2 = rt(this.config.env), { cloudPath: s2 } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      t2(null, e3);
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, gt = function({ fileList: e2 }, t2) {
    if (t2 = t2 || be(), !e2 || !Array.isArray(e2))
      return { code: "INVALID_PARAM", message: "fileList必须是非空的数组" };
    for (let t3 of e2)
      if (!t3 || "string" != typeof t3)
        return { code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" };
    const n2 = { fileid_list: e2 };
    return rt(this.config.env).send("storage.batchDeleteFile", n2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.delete_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, mt = function({ fileList: e2 }, t2) {
    t2 = t2 || be(), e2 && Array.isArray(e2) || t2(null, { code: "INVALID_PARAM", message: "fileList必须是非空的数组" });
    let n2 = [];
    for (let s3 of e2)
      "object" == typeof s3 ? (s3.hasOwnProperty("fileID") && s3.hasOwnProperty("maxAge") || t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是包含fileID和maxAge的对象" }), n2.push({ fileid: s3.fileID, max_age: s3.maxAge })) : "string" == typeof s3 ? n2.push({ fileid: s3 }) : t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是字符串" });
    const s2 = { file_list: n2 };
    return rt(this.config.env).send("storage.batchGetDownloadUrl", s2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.download_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, yt = async function({ fileID: e2 }, t2) {
    const n2 = (await mt.call(this, { fileList: [{ fileID: e2, maxAge: 600 }] })).fileList[0];
    if ("SUCCESS" !== n2.code)
      return t2 ? t2(n2) : new Promise((e3) => {
        e3(n2);
      });
    const s2 = rt(this.config.env);
    let r2 = n2.download_url;
    if (r2 = encodeURI(r2), !t2)
      return s2.download({ url: r2 });
    t2(await s2.download({ url: r2 }));
  }, _t = function({ name: e2, data: t2, query: n2, parse: s2, search: r2, timeout: i2 }, o2) {
    const a2 = o2 || be();
    let c2;
    try {
      c2 = t2 ? JSON.stringify(t2) : "";
    } catch (e3) {
      return Promise.reject(e3);
    }
    if (!e2)
      return Promise.reject(new se({ code: "PARAM_ERROR", message: "函数名不能为空" }));
    const u2 = { inQuery: n2, parse: s2, search: r2, function_name: e2, request_data: c2 };
    return rt(this.config.env).send("functions.invokeFunction", u2, { timeout: i2 }).then((e3) => {
      if (e3.code)
        a2(null, e3);
      else {
        let t3 = e3.data.response_data;
        if (s2)
          a2(null, { result: t3, requestId: e3.requestId });
        else
          try {
            t3 = JSON.parse(e3.data.response_data), a2(null, { result: t3, requestId: e3.requestId });
          } catch (e4) {
            a2(new se({ message: "response data must be json" }));
          }
      }
      return a2.promise;
    }).catch((e3) => {
      a2(e3);
    }), a2.promise;
  }, wt = { timeout: 15e3, persistence: "session" }, vt = {};
  class It {
    constructor(e2) {
      this.config = e2 || this.config, this.authObj = void 0;
    }
    init(e2) {
      switch (Oe.adapter || (this.requestClient = new Oe.adapter.reqClass({ timeout: e2.timeout || 5e3, timeoutMsg: `请求在${(e2.timeout || 5e3) / 1e3}s内未完成，已中断` })), this.config = { ...wt, ...e2 }, true) {
        case this.config.timeout > 6e5:
          console.warn("timeout大于可配置上限[10分钟]，已重置为上限数值"), this.config.timeout = 6e5;
          break;
        case this.config.timeout < 100:
          console.warn("timeout小于可配置下限[100ms]，已重置为下限数值"), this.config.timeout = 100;
      }
      return new It(this.config);
    }
    auth({ persistence: e2 } = {}) {
      if (this.authObj)
        return this.authObj;
      const t2 = e2 || Oe.adapter.primaryStorage || wt.persistence;
      var n2;
      return t2 !== this.config.persistence && (this.config.persistence = t2), function(e3) {
        const { env: t3 } = e3;
        Ne[t3] = new Ue(e3), De[t3] = new Ue({ ...e3, persistence: "local" });
      }(this.config), n2 = this.config, st[n2.env] = new nt(n2), this.authObj = new dt(this.config), this.authObj;
    }
    on(e2, t2) {
      return je.apply(this, [e2, t2]);
    }
    off(e2, t2) {
      return Be.apply(this, [e2, t2]);
    }
    callFunction(e2, t2) {
      return _t.apply(this, [e2, t2]);
    }
    deleteFile(e2, t2) {
      return gt.apply(this, [e2, t2]);
    }
    getTempFileURL(e2, t2) {
      return mt.apply(this, [e2, t2]);
    }
    downloadFile(e2, t2) {
      return yt.apply(this, [e2, t2]);
    }
    uploadFile(e2, t2) {
      return pt.apply(this, [e2, t2]);
    }
    getUploadMetadata(e2, t2) {
      return ft.apply(this, [e2, t2]);
    }
    registerExtension(e2) {
      vt[e2.name] = e2;
    }
    async invokeExtension(e2, t2) {
      const n2 = vt[e2];
      if (!n2)
        throw new se({ message: `扩展${e2} 必须先注册` });
      return await n2.invoke(t2, this);
    }
    useAdapters(e2) {
      const { adapter: t2, runtime: n2 } = xe(e2) || {};
      t2 && (Oe.adapter = t2), n2 && (Oe.runtime = n2);
    }
  }
  var St = new It();
  function bt(e2, t2, n2) {
    void 0 === n2 && (n2 = {});
    var s2 = /\?/.test(t2), r2 = "";
    for (var i2 in n2)
      "" === r2 ? !s2 && (t2 += "?") : r2 += "&", r2 += i2 + "=" + encodeURIComponent(n2[i2]);
    return /^http(s)?:\/\//.test(t2 += r2) ? t2 : "" + e2 + t2;
  }
  class kt {
    get(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        re.request({ url: bt("https:", t2), data: n2, method: "GET", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    post(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        re.request({ url: bt("https:", t2), data: n2, method: "POST", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    upload(e2) {
      return new Promise((t2, n2) => {
        const { url: s2, file: r2, data: i2, headers: o2, fileType: a2 } = e2, c2 = re.uploadFile({ url: bt("https:", s2), name: "file", formData: Object.assign({}, i2), filePath: r2, fileType: a2, header: o2, success(e3) {
          const n3 = { statusCode: e3.statusCode, data: e3.data || {} };
          200 === e3.statusCode && i2.success_action_status && (n3.statusCode = parseInt(i2.success_action_status, 10)), t2(n3);
        }, fail(e3) {
          n2(new Error(e3.errMsg || "uploadFile:fail"));
        } });
        "function" == typeof e2.onUploadProgress && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((t3) => {
          e2.onUploadProgress({ loaded: t3.totalBytesSent, total: t3.totalBytesExpectedToSend });
        });
      });
    }
  }
  const Tt = { setItem(e2, t2) {
    re.setStorageSync(e2, t2);
  }, getItem: (e2) => re.getStorageSync(e2), removeItem(e2) {
    re.removeStorageSync(e2);
  }, clear() {
    re.clearStorageSync();
  } };
  var At = { genAdapter: function() {
    return { root: {}, reqClass: kt, localStorage: Tt, primaryStorage: "local" };
  }, isMatch: function() {
    return true;
  }, runtime: "uni_app" };
  St.useAdapters(At);
  const Pt = St, Ct = Pt.init;
  Pt.init = function(e2) {
    e2.env = e2.spaceId;
    const t2 = Ct.call(this, e2);
    t2.config.provider = "tencent", t2.config.spaceId = e2.spaceId;
    const n2 = t2.auth;
    return t2.auth = function(e3) {
      const t3 = n2.call(this, e3);
      return ["linkAndRetrieveDataWithTicket", "signInAnonymously", "signOut", "getAccessToken", "getLoginState", "signInWithTicket", "getUserInfo"].forEach((e4) => {
        var n3;
        t3[e4] = (n3 = t3[e4], function(e5) {
          e5 = e5 || {};
          const { success: t4, fail: s2, complete: r2 } = ne(e5);
          if (!(t4 || s2 || r2))
            return n3.call(this, e5);
          n3.call(this, e5).then((e6) => {
            t4 && t4(e6), r2 && r2(e6);
          }, (e6) => {
            s2 && s2(e6), r2 && r2(e6);
          });
        }).bind(t3);
      }), t3;
    }, t2.customAuth = t2.auth, t2;
  };
  var xt = Pt;
  async function Ot(e2, t2) {
    const n2 = `http://${e2}:${t2}/system/ping`;
    try {
      const e3 = await (s2 = { url: n2, timeout: 500 }, new Promise((e4, t3) => {
        re.request({ ...s2, success(t4) {
          e4(t4);
        }, fail(e5) {
          t3(e5);
        } });
      }));
      return !(!e3.data || 0 !== e3.data.code);
    } catch (e3) {
      return false;
    }
    var s2;
  }
  async function Et(e2, t2) {
    let n2;
    for (let s2 = 0; s2 < e2.length; s2++) {
      const r2 = e2[s2];
      if (await Ot(r2, t2)) {
        n2 = r2;
        break;
      }
    }
    return { address: n2, port: t2 };
  }
  const Lt = { "serverless.file.resource.generateProximalSign": "storage/generate-proximal-sign", "serverless.file.resource.report": "storage/report", "serverless.file.resource.delete": "storage/delete", "serverless.file.resource.getTempFileURL": "storage/get-temp-file-url" };
  var Rt = class {
    constructor(e2) {
      if (["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), !e2.endpoint)
        throw new Error("集群空间未配置ApiEndpoint，配置后需要重新关联服务空间后生效");
      this.config = Object.assign({}, e2), this.config.provider = "dcloud", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.adapter = re;
    }
    async request(e2, t2 = true) {
      const n2 = t2;
      return e2 = n2 ? await this.setupLocalRequest(e2) : this.setupRequest(e2), Promise.resolve().then(() => n2 ? this.requestLocal(e2) : fe.wrappedRequest(e2, this.adapter.request));
    }
    requestLocal(e2) {
      return new Promise((t2, n2) => {
        this.adapter.request(Object.assign(e2, { complete(e3) {
          if (e3 || (e3 = {}), !e3.statusCode || e3.statusCode >= 400) {
            const t3 = e3.data && e3.data.code || "SYS_ERR", s2 = e3.data && e3.data.message || "request:fail";
            return n2(new se({ code: t3, message: s2 }));
          }
          t2({ success: true, result: e3.data });
        } }));
      });
    }
    setupRequest(e2) {
      const t2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), n2 = { "Content-Type": "application/json" };
      n2["x-serverless-sign"] = fe.sign(t2, this.config.clientSecret);
      const s2 = pe();
      n2["x-client-info"] = encodeURIComponent(JSON.stringify(s2));
      const { token: r2 } = oe();
      return n2["x-client-token"] = r2, { url: this.config.requestUrl, method: "POST", data: t2, dataType: "json", header: JSON.parse(JSON.stringify(n2)) };
    }
    async setupLocalRequest(e2) {
      const t2 = pe(), { token: n2 } = oe(), s2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now(), clientInfo: t2, token: n2 }), { address: r2, servePort: i2 } = this.__dev__ && this.__dev__.debugInfo || {}, { address: o2 } = await Et(r2, i2);
      return { url: `http://${o2}:${i2}/${Lt[e2.method]}`, method: "POST", data: s2, dataType: "json", header: JSON.parse(JSON.stringify({ "Content-Type": "application/json" })) };
    }
    callFunction(e2) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
      return this.request(t2, false);
    }
    getUploadFileOptions(e2) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
      return this.request(t2);
    }
    reportUploadFile(e2) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
      return this.request(t2);
    }
    uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2 }) {
      if (!t2)
        throw new se({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      let r2;
      return this.getUploadFileOptions({ cloudPath: t2 }).then((t3) => {
        const { url: i2, formData: o2, name: a2 } = t3.result;
        return r2 = t3.result.fileUrl, new Promise((t4, r3) => {
          const c2 = this.adapter.uploadFile({ url: i2, formData: o2, name: a2, filePath: e2, fileType: n2, success(e3) {
            e3 && e3.statusCode < 400 ? t4(e3) : r3(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
          }, fail(e3) {
            r3(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
          } });
          "function" == typeof s2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
            s2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
          });
        });
      }).then(() => this.reportUploadFile({ cloudPath: t2 })).then((t3) => new Promise((n3, s3) => {
        t3.success ? n3({ success: true, filePath: e2, fileID: r2 }) : s3(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }));
    }
    deleteFile({ fileList: e2 }) {
      const t2 = { method: "serverless.file.resource.delete", params: JSON.stringify({ fileList: e2 }) };
      return this.request(t2).then((e3) => {
        if (e3.success)
          return e3.result;
        throw new se({ code: "DELETE_FILE_FAILED", message: "删除文件失败" });
      });
    }
    getTempFileURL({ fileList: e2, maxAge: t2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new se({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const n2 = { method: "serverless.file.resource.getTempFileURL", params: JSON.stringify({ fileList: e2, maxAge: t2 }) };
      return this.request(n2).then((e3) => {
        if (e3.success)
          return { fileList: e3.result.fileList.map((e4) => ({ fileID: e4.fileID, tempFileURL: e4.tempFileURL })) };
        throw new se({ code: "GET_TEMP_FILE_URL_FAILED", message: "获取临时文件链接失败" });
      });
    }
  };
  var Ut = { init(e2) {
    const t2 = new Rt(e2), n2 = { signInAnonymously: function() {
      return Promise.resolve();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } }, Nt = n(function(e2, t2) {
    e2.exports = r.enc.Hex;
  });
  function Dt() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e2) {
      var t2 = 16 * Math.random() | 0;
      return ("x" === e2 ? t2 : 3 & t2 | 8).toString(16);
    });
  }
  function Mt(e2 = "", t2 = {}) {
    const { data: n2, functionName: s2, method: r2, headers: i2, signHeaderKeys: o2 = [], config: a2 } = t2, c2 = String(Date.now()), u2 = Dt(), h2 = Object.assign({}, i2, { "x-from-app-id": a2.spaceAppId, "x-from-env-id": a2.spaceId, "x-to-env-id": a2.spaceId, "x-from-instance-id": c2, "x-from-function-name": s2, "x-client-timestamp": c2, "x-alipay-source": "client", "x-request-id": u2, "x-alipay-callid": u2, "x-trace-id": u2 }), l2 = ["x-from-app-id", "x-from-env-id", "x-to-env-id", "x-from-instance-id", "x-from-function-name", "x-client-timestamp"].concat(o2), [d2 = "", p2 = ""] = e2.split("?") || [], f2 = function(e3) {
      const t3 = e3.signedHeaders.join(";"), n3 = e3.signedHeaders.map((t4) => `${t4.toLowerCase()}:${e3.headers[t4]}
`).join(""), s3 = Ie(e3.body).toString(Nt), r3 = `${e3.method.toUpperCase()}
${e3.path}
${e3.query}
${n3}
${t3}
${s3}
`, i3 = Ie(r3).toString(Nt), o3 = `HMAC-SHA256
${e3.timestamp}
${i3}
`, a3 = Se(o3, e3.secretKey).toString(Nt);
      return `HMAC-SHA256 Credential=${e3.secretId}, SignedHeaders=${t3}, Signature=${a3}`;
    }({ path: d2, query: p2, method: r2, headers: h2, timestamp: c2, body: JSON.stringify(n2), secretId: a2.accessKey, secretKey: a2.secretKey, signedHeaders: l2.sort() });
    return { url: `${a2.endpoint}${e2}`, headers: Object.assign({}, h2, { Authorization: f2 }) };
  }
  function qt({ url: e2, data: t2, method: n2 = "POST", headers: s2 = {}, timeout: r2 }) {
    return new Promise((i2, o2) => {
      re.request({ url: e2, method: n2, data: "object" == typeof t2 ? JSON.stringify(t2) : t2, header: s2, dataType: "json", timeout: r2, complete: (e3 = {}) => {
        const t3 = s2["x-trace-id"] || "";
        if (!e3.statusCode || e3.statusCode >= 400) {
          const { message: n3, errMsg: s3, trace_id: r3 } = e3.data || {};
          return o2(new se({ code: "SYS_ERR", message: n3 || s3 || "request:fail", requestId: r3 || t3 }));
        }
        i2({ status: e3.statusCode, data: e3.data, headers: e3.header, requestId: t3 });
      } });
    });
  }
  function Kt(e2, t2) {
    const { path: n2, data: s2, method: r2 = "GET" } = e2, { url: i2, headers: o2 } = Mt(n2, { functionName: "", data: s2, method: r2, headers: { "x-alipay-cloud-mode": "oss", "x-data-api-type": "oss", "x-expire-timestamp": Date.now() + 6e4 }, signHeaderKeys: ["x-data-api-type", "x-expire-timestamp"], config: t2 });
    return qt({ url: i2, data: s2, method: r2, headers: o2 }).then((e3) => {
      const t3 = e3.data || {};
      if (!t3.success)
        throw new se({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
      return t3.data || {};
    }).catch((e3) => {
      throw new se({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
    });
  }
  function Ft(e2 = "") {
    const t2 = e2.trim().replace(/^cloud:\/\//, ""), n2 = t2.indexOf("/");
    if (n2 <= 0)
      throw new se({ code: "INVALID_PARAM", message: "fileID不合法" });
    const s2 = t2.substring(0, n2), r2 = t2.substring(n2 + 1);
    return s2 !== this.config.spaceId && console.warn("file ".concat(e2, " does not belong to env ").concat(this.config.spaceId)), r2;
  }
  function jt(e2 = "") {
    return "cloud://".concat(this.config.spaceId, "/").concat(e2.replace(/^\/+/, ""));
  }
  class $t {
    constructor(e2) {
      this.config = e2;
    }
    signedURL(e2, t2 = {}) {
      const n2 = `/ws/function/${e2}`, s2 = this.config.wsEndpoint.replace(/^ws(s)?:\/\//, ""), r2 = Object.assign({}, t2, { accessKeyId: this.config.accessKey, signatureNonce: Dt(), timestamp: "" + Date.now() }), i2 = [n2, ["accessKeyId", "authorization", "signatureNonce", "timestamp"].sort().map(function(e3) {
        return r2[e3] ? "".concat(e3, "=").concat(r2[e3]) : null;
      }).filter(Boolean).join("&"), `host:${s2}`].join("\n"), o2 = ["HMAC-SHA256", Ie(i2).toString(Nt)].join("\n"), a2 = Se(o2, this.config.secretKey).toString(Nt), c2 = Object.keys(r2).map((e3) => `${e3}=${encodeURIComponent(r2[e3])}`).join("&");
      return `${this.config.wsEndpoint}${n2}?${c2}&signature=${a2}`;
    }
  }
  var Bt = class {
    constructor(e2) {
      if (["spaceId", "spaceAppId", "accessKey", "secretKey"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), e2.endpoint) {
        if ("string" != typeof e2.endpoint)
          throw new Error("endpoint must be string");
        if (!/^https:\/\//.test(e2.endpoint))
          throw new Error("endpoint must start with https://");
        e2.endpoint = e2.endpoint.replace(/\/$/, "");
      }
      this.config = Object.assign({}, e2, { endpoint: e2.endpoint || `https://${e2.spaceId}.api-hz.cloudbasefunction.cn`, wsEndpoint: e2.wsEndpoint || `wss://${e2.spaceId}.api-hz.cloudbasefunction.cn` }), this._websocket = new $t(this.config);
    }
    callFunction(e2) {
      return function(e3, t2) {
        const { name: n2, data: s2, async: r2 = false, timeout: i2 } = e3, o2 = "POST", a2 = { "x-to-function-name": n2 };
        r2 && (a2["x-function-invoke-type"] = "async");
        const { url: c2, headers: u2 } = Mt("/functions/invokeFunction", { functionName: n2, data: s2, method: o2, headers: a2, signHeaderKeys: ["x-to-function-name"], config: t2 });
        return qt({ url: c2, data: s2, method: o2, headers: u2, timeout: i2 }).then((e4) => {
          let t3 = 0;
          if (r2) {
            const n3 = e4.data || {};
            t3 = "200" === n3.errCode ? 0 : n3.errCode, e4.data = n3.data || {}, e4.errMsg = n3.errMsg;
          }
          if (0 !== t3)
            throw new se({ code: t3, message: e4.errMsg, requestId: e4.requestId });
          return { errCode: t3, success: 0 === t3, requestId: e4.requestId, result: e4.data };
        }).catch((e4) => {
          throw new se({ code: e4.errCode, message: e4.errMsg, requestId: e4.requestId });
        });
      }(e2, this.config);
    }
    uploadFileToOSS({ url: e2, filePath: t2, fileType: n2, formData: s2, onUploadProgress: r2 }) {
      return new Promise((i2, o2) => {
        const a2 = re.uploadFile({ url: e2, filePath: t2, fileType: n2, formData: s2, name: "file", success(e3) {
          e3 && e3.statusCode < 400 ? i2(e3) : o2(new se({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          o2(new se({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof r2 && a2 && "function" == typeof a2.onProgressUpdate && a2.onProgressUpdate((e3) => {
          r2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    async uploadFile({ filePath: e2, cloudPath: t2 = "", fileType: n2 = "image", onUploadProgress: s2 }) {
      if ("string" !== f(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new se({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const r2 = await Kt({ path: "/".concat(t2.replace(/^\//, ""), "?post_url") }, this.config), { file_id: i2, upload_url: o2, form_data: a2 } = r2, c2 = a2 && a2.reduce((e3, t3) => (e3[t3.key] = t3.value, e3), {});
      return this.uploadFileToOSS({ url: o2, filePath: e2, fileType: n2, formData: c2, onUploadProgress: s2 }).then(() => ({ fileID: i2 }));
    }
    async getTempFileURL({ fileList: e2 }) {
      return new Promise((t2, n2) => {
        (!e2 || e2.length < 0) && t2({ code: "INVALID_PARAM", message: "fileList不能为空数组" }), e2.length > 50 && t2({ code: "INVALID_PARAM", message: "fileList数组长度不能超过50" });
        const s2 = [];
        for (const n3 of e2) {
          let e3;
          "string" !== f(n3) && t2({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
          try {
            e3 = Ft.call(this, n3);
          } catch (t3) {
            console.warn(t3.errCode, t3.errMsg), e3 = n3;
          }
          s2.push({ file_id: e3, expire: 600 });
        }
        Kt({ path: "/?download_url", data: { file_list: s2 }, method: "POST" }, this.config).then((e3) => {
          const { file_list: n3 = [] } = e3;
          t2({ fileList: n3.map((e4) => ({ fileID: jt.call(this, e4.file_id), tempFileURL: e4.download_url })) });
        }).catch((e3) => n2(e3));
      });
    }
    async connectWebSocket(e2) {
      const { name: t2, query: n2 } = e2;
      return re.connectSocket({ url: this._websocket.signedURL(t2, n2), complete: () => {
      } });
    }
  };
  var Wt = { init: (e2) => {
    e2.provider = "alipay";
    const t2 = new Bt(e2);
    return t2.auth = function() {
      return { signInAnonymously: function() {
        return Promise.resolve();
      }, getLoginState: function() {
        return Promise.resolve(true);
      } };
    }, t2;
  } };
  function Ht({ data: e2 }) {
    let t2;
    t2 = pe();
    const n2 = JSON.parse(JSON.stringify(e2 || {}));
    if (Object.assign(n2, { clientInfo: t2 }), !n2.uniIdToken) {
      const { token: e3 } = oe();
      e3 && (n2.uniIdToken = e3);
    }
    return n2;
  }
  async function Jt(e2 = {}) {
    await this.__dev__.initLocalNetwork();
    const { localAddress: t2, localPort: n2 } = this.__dev__, s2 = { aliyun: "aliyun", tencent: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], r2 = this.config.spaceId, i2 = `http://${t2}:${n2}/system/check-function`, o2 = `http://${t2}:${n2}/cloudfunctions/${e2.name}`;
    return new Promise((t3, n3) => {
      re.request({ method: "POST", url: i2, data: { name: e2.name, platform: A, provider: s2, spaceId: r2 }, timeout: 3e3, success(e3) {
        t3(e3);
      }, fail() {
        t3({ data: { code: "NETWORK_ERROR", message: "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下，自动切换为已部署的云函数。" } });
      } });
    }).then(({ data: e3 } = {}) => {
      const { code: t3, message: n3 } = e3 || {};
      return { code: 0 === t3 ? 0 : t3 || "SYS_ERR", message: n3 || "SYS_ERR" };
    }).then(({ code: t3, message: n3 }) => {
      if (0 !== t3) {
        switch (t3) {
          case "MODULE_ENCRYPTED":
            console.error(`此云函数（${e2.name}）依赖加密公共模块不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "FUNCTION_ENCRYPTED":
            console.error(`此云函数（${e2.name}）已加密不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "ACTION_ENCRYPTED":
            console.error(n3 || "需要访问加密的uni-clientDB-action，自动切换为云端环境");
            break;
          case "NETWORK_ERROR":
            console.error(n3 || "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下");
            break;
          case "SWITCH_TO_CLOUD":
            break;
          default: {
            const e3 = `检测本地调试服务出现错误：${n3}，请检查网络环境或重启客户端再试`;
            throw console.error(e3), new Error(e3);
          }
        }
        return this._callCloudFunction(e2);
      }
      return new Promise((t4, n4) => {
        const r3 = Ht.call(this, { data: e2.data });
        re.request({ method: "POST", url: o2, data: { provider: s2, platform: A, param: r3 }, timeout: e2.timeout, success: ({ statusCode: e3, data: s3 } = {}) => !e3 || e3 >= 400 ? n4(new se({ code: s3.code || "SYS_ERR", message: s3.message || "request:fail" })) : t4({ result: s3 }), fail(e3) {
          n4(new se({ code: e3.code || e3.errCode || "SYS_ERR", message: e3.message || e3.errMsg || "request:fail" }));
        } });
      });
    });
  }
  const zt = [{ rule: /fc_function_not_found|FUNCTION_NOT_FOUND/, content: "，云函数[{functionName}]在云端不存在，请检查此云函数名称是否正确以及该云函数是否已上传到服务空间", mode: "append" }];
  var Vt = /[\\^$.*+?()[\]{}|]/g, Gt = RegExp(Vt.source);
  function Yt(e2, t2, n2) {
    return e2.replace(new RegExp((s2 = t2) && Gt.test(s2) ? s2.replace(Vt, "\\$&") : s2, "g"), n2);
    var s2;
  }
  const Xt = "request", Zt = "response", en = "both";
  const Mn = { code: 2e4, message: "System error" }, qn = { code: 20101, message: "Invalid client" };
  function jn(e2) {
    const { errSubject: t2, subject: n2, errCode: s2, errMsg: r2, code: i2, message: o2, cause: a2 } = e2 || {};
    return new se({ subject: t2 || n2 || "uni-secure-network", code: s2 || i2 || Mn.code, message: r2 || o2, cause: a2 });
  }
  let Bn;
  function Vn({ secretType: e2 } = {}) {
    return e2 === Xt || e2 === Zt || e2 === en;
  }
  function Gn({ name: e2, data: t2 = {} } = {}) {
    return "DCloud-clientDB" === e2 && "encryption" === t2.redirectTo && "getAppClientKey" === t2.action;
  }
  function Yn({ provider: e2, spaceId: t2, functionName: n2 } = {}) {
    const { appId: s2, uniPlatform: r2, osName: i2 } = he();
    let o2 = r2;
    "app" === r2 && (o2 = i2);
    const a2 = function({ provider: e3, spaceId: t3 } = {}) {
      const n3 = T;
      if (!n3)
        return {};
      e3 = /* @__PURE__ */ function(e4) {
        return "tencent" === e4 ? "tcb" : e4;
      }(e3);
      const s3 = n3.find((n4) => n4.provider === e3 && n4.spaceId === t3);
      return s3 && s3.config;
    }({ provider: e2, spaceId: t2 });
    if (!a2 || !a2.accessControl || !a2.accessControl.enable)
      return false;
    const c2 = a2.accessControl.function || {}, u2 = Object.keys(c2);
    if (0 === u2.length)
      return true;
    const h2 = function(e3, t3) {
      let n3, s3, r3;
      for (let i3 = 0; i3 < e3.length; i3++) {
        const o3 = e3[i3];
        o3 !== t3 ? "*" !== o3 ? o3.split(",").map((e4) => e4.trim()).indexOf(t3) > -1 && (s3 = o3) : r3 = o3 : n3 = o3;
      }
      return n3 || s3 || r3;
    }(u2, n2);
    if (!h2)
      return false;
    if ((c2[h2] || []).find((e3 = {}) => e3.appId === s2 && (e3.platform || "").toLowerCase() === o2.toLowerCase()))
      return true;
    throw console.error(`此应用[appId: ${s2}, platform: ${o2}]不在云端配置的允许访问的应用列表内，参考：https://uniapp.dcloud.net.cn/uniCloud/secure-network.html#verify-client`), jn(qn);
  }
  function Qn({ functionName: e2, result: t2, logPvd: n2 }) {
    if (this.__dev__.debugLog && t2 && t2.requestId) {
      const s2 = JSON.stringify({ spaceId: this.config.spaceId, functionName: e2, requestId: t2.requestId });
      console.log(`[${n2}-request]${s2}[/${n2}-request]`);
    }
  }
  function Xn(e2) {
    const t2 = e2.callFunction, n2 = function(n3) {
      const s2 = n3.name;
      n3.data = Ht.call(e2, { data: n3.data });
      const r2 = { aliyun: "aliyun", tencent: "tcb", tcb: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], i2 = Vn(n3), o2 = Gn(n3), a2 = i2 || o2;
      return t2.call(this, n3).then((e3) => (e3.errCode = 0, !a2 && Qn.call(this, { functionName: s2, result: e3, logPvd: r2 }), Promise.resolve(e3)), (e3) => (!a2 && Qn.call(this, { functionName: s2, result: e3, logPvd: r2 }), e3 && e3.message && (e3.message = function({ message: e4 = "", extraInfo: t3 = {}, formatter: n4 = [] } = {}) {
        for (let s3 = 0; s3 < n4.length; s3++) {
          const { rule: r3, content: i3, mode: o3 } = n4[s3], a3 = e4.match(r3);
          if (!a3)
            continue;
          let c2 = i3;
          for (let e5 = 1; e5 < a3.length; e5++)
            c2 = Yt(c2, `{$${e5}}`, a3[e5]);
          for (const e5 in t3)
            c2 = Yt(c2, `{${e5}}`, t3[e5]);
          return "replace" === o3 ? c2 : e4 + c2;
        }
        return e4;
      }({ message: `[${n3.name}]: ${e3.message}`, formatter: zt, extraInfo: { functionName: s2 } })), Promise.reject(e3)));
    };
    e2.callFunction = function(t3) {
      const { provider: s2, spaceId: r2 } = e2.config, i2 = t3.name;
      let o2, a2;
      if (t3.data = t3.data || {}, e2.__dev__.debugInfo && !e2.__dev__.debugInfo.forceRemote && C ? (e2._callCloudFunction || (e2._callCloudFunction = n2, e2._callLocalFunction = Jt), o2 = Jt) : o2 = n2, o2 = o2.bind(e2), Gn(t3))
        a2 = n2.call(e2, t3);
      else if (Vn(t3)) {
        a2 = new Bn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapEncryptDataCallFunction(n2.bind(e2))(t3);
      } else if (Yn({ provider: s2, spaceId: r2, functionName: i2 })) {
        a2 = new Bn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapVerifyClientCallFunction(n2.bind(e2))(t3);
      } else
        a2 = o2(t3);
      return Object.defineProperty(a2, "result", { get: () => (console.warn("当前返回结果为Promise类型，不可直接访问其result属性，详情请参考：https://uniapp.dcloud.net.cn/uniCloud/faq?id=promise"), {}) }), a2.then((e3) => ("undefined" != typeof UTSJSONObject && "undefined" != typeof UTS && (e3.result = UTS.JSON.parse(JSON.stringify(e3.result))), e3));
    };
  }
  Bn = class {
    constructor() {
      throw jn({ message: `Platform ${A} is not enabled, please check whether secure network module is enabled in your manifest.json` });
    }
  };
  const Zn = Symbol("CLIENT_DB_INTERNAL");
  function es(e2, t2) {
    return e2.then = "DoNotReturnProxyWithAFunctionNamedThen", e2._internalType = Zn, e2.inspect = null, e2.__v_raw = void 0, new Proxy(e2, { get(e3, n2, s2) {
      if ("_uniClient" === n2)
        return null;
      if ("symbol" == typeof n2)
        return e3[n2];
      if (n2 in e3 || "string" != typeof n2) {
        const t3 = e3[n2];
        return "function" == typeof t3 ? t3.bind(e3) : t3;
      }
      return t2.get(e3, n2, s2);
    } });
  }
  function ts(e2) {
    return { on: (t2, n2) => {
      e2[t2] = e2[t2] || [], e2[t2].indexOf(n2) > -1 || e2[t2].push(n2);
    }, off: (t2, n2) => {
      e2[t2] = e2[t2] || [];
      const s2 = e2[t2].indexOf(n2);
      -1 !== s2 && e2[t2].splice(s2, 1);
    } };
  }
  const ns = ["db.Geo", "db.command", "command.aggregate"];
  function ss(e2, t2) {
    return ns.indexOf(`${e2}.${t2}`) > -1;
  }
  function rs(e2) {
    switch (f(e2 = ie(e2))) {
      case "array":
        return e2.map((e3) => rs(e3));
      case "object":
        return e2._internalType === Zn || Object.keys(e2).forEach((t2) => {
          e2[t2] = rs(e2[t2]);
        }), e2;
      case "regexp":
        return { $regexp: { source: e2.source, flags: e2.flags } };
      case "date":
        return { $date: e2.toISOString() };
      default:
        return e2;
    }
  }
  function is(e2) {
    return e2 && e2.content && e2.content.$method;
  }
  class os {
    constructor(e2, t2, n2) {
      this.content = e2, this.prevStage = t2 || null, this.udb = null, this._database = n2;
    }
    toJSON() {
      let e2 = this;
      const t2 = [e2.content];
      for (; e2.prevStage; )
        e2 = e2.prevStage, t2.push(e2.content);
      return { $db: t2.reverse().map((e3) => ({ $method: e3.$method, $param: rs(e3.$param) })) };
    }
    toString() {
      return JSON.stringify(this.toJSON());
    }
    getAction() {
      const e2 = this.toJSON().$db.find((e3) => "action" === e3.$method);
      return e2 && e2.$param && e2.$param[0];
    }
    getCommand() {
      return { $db: this.toJSON().$db.filter((e2) => "action" !== e2.$method) };
    }
    get isAggregate() {
      let e2 = this;
      for (; e2; ) {
        const t2 = is(e2), n2 = is(e2.prevStage);
        if ("aggregate" === t2 && "collection" === n2 || "pipeline" === t2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isCommand() {
      let e2 = this;
      for (; e2; ) {
        if ("command" === is(e2))
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isAggregateCommand() {
      let e2 = this;
      for (; e2; ) {
        const t2 = is(e2), n2 = is(e2.prevStage);
        if ("aggregate" === t2 && "command" === n2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    getNextStageFn(e2) {
      const t2 = this;
      return function() {
        return as({ $method: e2, $param: rs(Array.from(arguments)) }, t2, t2._database);
      };
    }
    get count() {
      return this.isAggregate ? this.getNextStageFn("count") : function() {
        return this._send("count", Array.from(arguments));
      };
    }
    get remove() {
      return this.isCommand ? this.getNextStageFn("remove") : function() {
        return this._send("remove", Array.from(arguments));
      };
    }
    get() {
      return this._send("get", Array.from(arguments));
    }
    get add() {
      return this.isCommand ? this.getNextStageFn("add") : function() {
        return this._send("add", Array.from(arguments));
      };
    }
    update() {
      return this._send("update", Array.from(arguments));
    }
    end() {
      return this._send("end", Array.from(arguments));
    }
    get set() {
      return this.isCommand ? this.getNextStageFn("set") : function() {
        throw new Error("JQL禁止使用set方法");
      };
    }
    _send(e2, t2) {
      const n2 = this.getAction(), s2 = this.getCommand();
      if (s2.$db.push({ $method: e2, $param: rs(t2) }), S) {
        const e3 = s2.$db.find((e4) => "collection" === e4.$method), t3 = e3 && e3.$param;
        t3 && 1 === t3.length && "string" == typeof e3.$param[0] && e3.$param[0].indexOf(",") > -1 && console.warn("检测到使用JQL语法联表查询时，未使用getTemp先过滤主表数据，在主表数据量大的情况下可能会查询缓慢。\n- 如何优化请参考此文档：https://uniapp.dcloud.net.cn/uniCloud/jql?id=lookup-with-temp \n- 如果主表数据量很小请忽略此信息，项目发行时不会出现此提示。");
      }
      return this._database._callCloudFunction({ action: n2, command: s2 });
    }
  }
  function as(e2, t2, n2) {
    return es(new os(e2, t2, n2), { get(e3, t3) {
      let s2 = "db";
      return e3 && e3.content && (s2 = e3.content.$method), ss(s2, t3) ? as({ $method: t3 }, e3, n2) : function() {
        return as({ $method: t3, $param: rs(Array.from(arguments)) }, e3, n2);
      };
    } });
  }
  function cs({ path: e2, method: t2 }) {
    return class {
      constructor() {
        this.param = Array.from(arguments);
      }
      toJSON() {
        return { $newDb: [...e2.map((e3) => ({ $method: e3 })), { $method: t2, $param: this.param }] };
      }
      toString() {
        return JSON.stringify(this.toJSON());
      }
    };
  }
  function us(e2, t2 = {}) {
    return es(new e2(t2), { get: (e3, t3) => ss("db", t3) ? as({ $method: t3 }, null, e3) : function() {
      return as({ $method: t3, $param: rs(Array.from(arguments)) }, null, e3);
    } });
  }
  class hs extends class {
    constructor({ uniClient: e2 = {}, isJQL: t2 = false } = {}) {
      this._uniClient = e2, this._authCallBacks = {}, this._dbCallBacks = {}, e2._isDefault && (this._dbCallBacks = R("_globalUniCloudDatabaseCallback")), t2 || (this.auth = ts(this._authCallBacks)), this._isJQL = t2, Object.assign(this, ts(this._dbCallBacks)), this.env = es({}, { get: (e3, t3) => ({ $env: t3 }) }), this.Geo = es({}, { get: (e3, t3) => cs({ path: ["Geo"], method: t3 }) }), this.serverDate = cs({ path: [], method: "serverDate" }), this.RegExp = cs({ path: [], method: "RegExp" });
    }
    getCloudEnv(e2) {
      if ("string" != typeof e2 || !e2.trim())
        throw new Error("getCloudEnv参数错误");
      return { $env: e2.replace("$cloudEnv_", "") };
    }
    _callback(e2, t2) {
      const n2 = this._dbCallBacks;
      n2[e2] && n2[e2].forEach((e3) => {
        e3(...t2);
      });
    }
    _callbackAuth(e2, t2) {
      const n2 = this._authCallBacks;
      n2[e2] && n2[e2].forEach((e3) => {
        e3(...t2);
      });
    }
    multiSend() {
      const e2 = Array.from(arguments), t2 = e2.map((e3) => {
        const t3 = e3.getAction(), n2 = e3.getCommand();
        if ("getTemp" !== n2.$db[n2.$db.length - 1].$method)
          throw new Error("multiSend只支持子命令内使用getTemp");
        return { action: t3, command: n2 };
      });
      return this._callCloudFunction({ multiCommand: t2, queryList: e2 });
    }
  } {
    _parseResult(e2) {
      return this._isJQL ? e2.result : e2;
    }
    _callCloudFunction({ action: e2, command: t2, multiCommand: n2, queryList: s2 }) {
      function r2(e3, t3) {
        if (n2 && s2)
          for (let n3 = 0; n3 < s2.length; n3++) {
            const r3 = s2[n3];
            r3.udb && "function" == typeof r3.udb.setResult && (t3 ? r3.udb.setResult(t3) : r3.udb.setResult(e3.result.dataList[n3]));
          }
      }
      const i2 = this, o2 = this._isJQL ? "databaseForJQL" : "database";
      function a2(e3) {
        return i2._callback("error", [e3]), K(F(o2, "fail"), e3).then(() => K(F(o2, "complete"), e3)).then(() => (r2(null, e3), X(B, { type: J, content: e3 }), Promise.reject(e3)));
      }
      const c2 = K(F(o2, "invoke")), u2 = this._uniClient;
      return c2.then(() => u2.callFunction({ name: "DCloud-clientDB", type: h, data: { action: e2, command: t2, multiCommand: n2 } })).then((e3) => {
        const { code: t3, message: n3, token: s3, tokenExpired: c3, systemInfo: u3 = [] } = e3.result;
        if (u3)
          for (let e4 = 0; e4 < u3.length; e4++) {
            const { level: t4, message: n4, detail: s4 } = u3[e4], r3 = console["warn" === t4 ? "error" : t4] || console.log;
            let i3 = "[System Info]" + n4;
            s4 && (i3 = `${i3}
详细信息：${s4}`), r3(i3);
          }
        if (t3) {
          return a2(new se({ code: t3, message: n3, requestId: e3.requestId }));
        }
        e3.result.errCode = e3.result.errCode || e3.result.code, e3.result.errMsg = e3.result.errMsg || e3.result.message, s3 && c3 && (ae({ token: s3, tokenExpired: c3 }), this._callbackAuth("refreshToken", [{ token: s3, tokenExpired: c3 }]), this._callback("refreshToken", [{ token: s3, tokenExpired: c3 }]), X(H, { token: s3, tokenExpired: c3 }));
        const h2 = [{ prop: "affectedDocs", tips: "affectedDocs不再推荐使用，请使用inserted/deleted/updated/data.length替代" }, { prop: "code", tips: "code不再推荐使用，请使用errCode替代" }, { prop: "message", tips: "message不再推荐使用，请使用errMsg替代" }];
        for (let t4 = 0; t4 < h2.length; t4++) {
          const { prop: n4, tips: s4 } = h2[t4];
          if (n4 in e3.result) {
            const t5 = e3.result[n4];
            Object.defineProperty(e3.result, n4, { get: () => (console.warn(s4), t5) });
          }
        }
        return function(e4) {
          return K(F(o2, "success"), e4).then(() => K(F(o2, "complete"), e4)).then(() => {
            r2(e4, null);
            const t4 = i2._parseResult(e4);
            return X(B, { type: J, content: t4 }), Promise.resolve(t4);
          });
        }(e3);
      }, (e3) => {
        /fc_function_not_found|FUNCTION_NOT_FOUND/g.test(e3.message) && console.warn("clientDB未初始化，请在web控制台保存一次schema以开启clientDB");
        return a2(new se({ code: e3.code || "SYSTEM_ERROR", message: e3.message, requestId: e3.requestId }));
      });
    }
  }
  const ls = "token无效，跳转登录页面", ds = "token过期，跳转登录页面", ps = { TOKEN_INVALID_TOKEN_EXPIRED: ds, TOKEN_INVALID_INVALID_CLIENTID: ls, TOKEN_INVALID: ls, TOKEN_INVALID_WRONG_TOKEN: ls, TOKEN_INVALID_ANONYMOUS_USER: ls }, fs = { "uni-id-token-expired": ds, "uni-id-check-token-failed": ls, "uni-id-token-not-exist": ls, "uni-id-check-device-feature-failed": ls };
  function gs(e2, t2) {
    let n2 = "";
    return n2 = e2 ? `${e2}/${t2}` : t2, n2.replace(/^\//, "");
  }
  function ms(e2 = [], t2 = "") {
    const n2 = [], s2 = [];
    return e2.forEach((e3) => {
      true === e3.needLogin ? n2.push(gs(t2, e3.path)) : false === e3.needLogin && s2.push(gs(t2, e3.path));
    }), { needLoginPage: n2, notNeedLoginPage: s2 };
  }
  function ys(e2) {
    return e2.split("?")[0].replace(/^\//, "");
  }
  function _s() {
    return function(e2) {
      let t2 = e2 && e2.$page && e2.$page.fullPath || "";
      return t2 ? ("/" !== t2.charAt(0) && (t2 = "/" + t2), t2) : t2;
    }(function() {
      const e2 = getCurrentPages();
      return e2[e2.length - 1];
    }());
  }
  function ws() {
    return ys(_s());
  }
  function vs(e2 = "", t2 = {}) {
    if (!e2)
      return false;
    if (!(t2 && t2.list && t2.list.length))
      return false;
    const n2 = t2.list, s2 = ys(e2);
    return n2.some((e3) => e3.pagePath === s2);
  }
  const Is = !!e.uniIdRouter;
  const { loginPage: Ss, routerNeedLogin: bs, resToLogin: ks, needLoginPage: Ts, notNeedLoginPage: As, loginPageInTabBar: Ps } = function({ pages: t2 = [], subPackages: n2 = [], uniIdRouter: s2 = {}, tabBar: r2 = {} } = e) {
    const { loginPage: i2, needLogin: o2 = [], resToLogin: a2 = true } = s2, { needLoginPage: c2, notNeedLoginPage: u2 } = ms(t2), { needLoginPage: h2, notNeedLoginPage: l2 } = function(e2 = []) {
      const t3 = [], n3 = [];
      return e2.forEach((e3) => {
        const { root: s3, pages: r3 = [] } = e3, { needLoginPage: i3, notNeedLoginPage: o3 } = ms(r3, s3);
        t3.push(...i3), n3.push(...o3);
      }), { needLoginPage: t3, notNeedLoginPage: n3 };
    }(n2);
    return { loginPage: i2, routerNeedLogin: o2, resToLogin: a2, needLoginPage: [...c2, ...h2], notNeedLoginPage: [...u2, ...l2], loginPageInTabBar: vs(i2, r2) };
  }();
  if (Ts.indexOf(Ss) > -1)
    throw new Error(`Login page [${Ss}] should not be "needLogin", please check your pages.json`);
  function Cs(e2) {
    const t2 = ws();
    if ("/" === e2.charAt(0))
      return e2;
    const [n2, s2] = e2.split("?"), r2 = n2.replace(/^\//, "").split("/"), i2 = t2.split("/");
    i2.pop();
    for (let e3 = 0; e3 < r2.length; e3++) {
      const t3 = r2[e3];
      ".." === t3 ? i2.pop() : "." !== t3 && i2.push(t3);
    }
    return "" === i2[0] && i2.shift(), "/" + i2.join("/") + (s2 ? "?" + s2 : "");
  }
  function xs(e2) {
    const t2 = ys(Cs(e2));
    return !(As.indexOf(t2) > -1) && (Ts.indexOf(t2) > -1 || bs.some((t3) => function(e3, t4) {
      return new RegExp(t4).test(e3);
    }(e2, t3)));
  }
  function Os({ redirect: e2 }) {
    const t2 = ys(e2), n2 = ys(Ss);
    return ws() !== n2 && t2 !== n2;
  }
  function Es({ api: e2, redirect: t2 } = {}) {
    if (!t2 || !Os({ redirect: t2 }))
      return;
    const n2 = function(e3, t3) {
      return "/" !== e3.charAt(0) && (e3 = "/" + e3), t3 ? e3.indexOf("?") > -1 ? e3 + `&uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3 + `?uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3;
    }(Ss, t2);
    Ps ? "navigateTo" !== e2 && "redirectTo" !== e2 || (e2 = "switchTab") : "switchTab" === e2 && (e2 = "navigateTo");
    const s2 = { navigateTo: uni.navigateTo, redirectTo: uni.redirectTo, switchTab: uni.switchTab, reLaunch: uni.reLaunch };
    setTimeout(() => {
      s2[e2]({ url: n2 });
    }, 0);
  }
  function Ls({ url: e2 } = {}) {
    const t2 = { abortLoginPageJump: false, autoToLoginPage: false }, n2 = function() {
      const { token: e3, tokenExpired: t3 } = oe();
      let n3;
      if (e3) {
        if (t3 < Date.now()) {
          const e4 = "uni-id-token-expired";
          n3 = { errCode: e4, errMsg: fs[e4] };
        }
      } else {
        const e4 = "uni-id-check-token-failed";
        n3 = { errCode: e4, errMsg: fs[e4] };
      }
      return n3;
    }();
    if (xs(e2) && n2) {
      n2.uniIdRedirectUrl = e2;
      if (G(W).length > 0)
        return setTimeout(() => {
          X(W, n2);
        }, 0), t2.abortLoginPageJump = true, t2;
      t2.autoToLoginPage = true;
    }
    return t2;
  }
  function Rs() {
    !function() {
      const e3 = _s(), { abortLoginPageJump: t2, autoToLoginPage: n2 } = Ls({ url: e3 });
      t2 || n2 && Es({ api: "redirectTo", redirect: e3 });
    }();
    const e2 = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
    for (let t2 = 0; t2 < e2.length; t2++) {
      const n2 = e2[t2];
      uni.addInterceptor(n2, { invoke(e3) {
        const { abortLoginPageJump: t3, autoToLoginPage: s2 } = Ls({ url: e3.url });
        return t3 ? e3 : s2 ? (Es({ api: n2, redirect: Cs(e3.url) }), false) : e3;
      } });
    }
  }
  function Us() {
    this.onResponse((e2) => {
      const { type: t2, content: n2 } = e2;
      let s2 = false;
      switch (t2) {
        case "cloudobject":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in fs;
          }(n2);
          break;
        case "clientdb":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in ps;
          }(n2);
      }
      s2 && function(e3 = {}) {
        const t3 = G(W);
        te().then(() => {
          const n3 = _s();
          if (n3 && Os({ redirect: n3 }))
            return t3.length > 0 ? X(W, Object.assign({ uniIdRedirectUrl: n3 }, e3)) : void (Ss && Es({ api: "navigateTo", redirect: n3 }));
        });
      }(n2);
    });
  }
  function Ns(e2) {
    !function(e3) {
      e3.onResponse = function(e4) {
        Y(B, e4);
      }, e3.offResponse = function(e4) {
        Q(B, e4);
      };
    }(e2), function(e3) {
      e3.onNeedLogin = function(e4) {
        Y(W, e4);
      }, e3.offNeedLogin = function(e4) {
        Q(W, e4);
      }, Is && (R("_globalUniCloudStatus").needLoginInit || (R("_globalUniCloudStatus").needLoginInit = true, te().then(() => {
        Rs.call(e3);
      }), ks && Us.call(e3)));
    }(e2), function(e3) {
      e3.onRefreshToken = function(e4) {
        Y(H, e4);
      }, e3.offRefreshToken = function(e4) {
        Q(H, e4);
      };
    }(e2);
  }
  let Ds;
  const Ms = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", qs = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
  function Ks() {
    const e2 = oe().token || "", t2 = e2.split(".");
    if (!e2 || 3 !== t2.length)
      return { uid: null, role: [], permission: [], tokenExpired: 0 };
    let n2;
    try {
      n2 = JSON.parse((s2 = t2[1], decodeURIComponent(Ds(s2).split("").map(function(e3) {
        return "%" + ("00" + e3.charCodeAt(0).toString(16)).slice(-2);
      }).join(""))));
    } catch (e3) {
      throw new Error("获取当前用户信息出错，详细错误信息为：" + e3.message);
    }
    var s2;
    return n2.tokenExpired = 1e3 * n2.exp, delete n2.exp, delete n2.iat, n2;
  }
  Ds = "function" != typeof atob ? function(e2) {
    if (e2 = String(e2).replace(/[\t\n\f\r ]+/g, ""), !qs.test(e2))
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    var t2;
    e2 += "==".slice(2 - (3 & e2.length));
    for (var n2, s2, r2 = "", i2 = 0; i2 < e2.length; )
      t2 = Ms.indexOf(e2.charAt(i2++)) << 18 | Ms.indexOf(e2.charAt(i2++)) << 12 | (n2 = Ms.indexOf(e2.charAt(i2++))) << 6 | (s2 = Ms.indexOf(e2.charAt(i2++))), r2 += 64 === n2 ? String.fromCharCode(t2 >> 16 & 255) : 64 === s2 ? String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255) : String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2);
    return r2;
  } : atob;
  var Fs = n(function(e2, t2) {
    Object.defineProperty(t2, "__esModule", { value: true });
    const n2 = "chooseAndUploadFile:ok", s2 = "chooseAndUploadFile:fail";
    function r2(e3, t3) {
      return e3.tempFiles.forEach((e4, n3) => {
        e4.name || (e4.name = e4.path.substring(e4.path.lastIndexOf("/") + 1)), t3 && (e4.fileType = t3), e4.cloudPath = Date.now() + "_" + n3 + e4.name.substring(e4.name.lastIndexOf("."));
      }), e3.tempFilePaths || (e3.tempFilePaths = e3.tempFiles.map((e4) => e4.path)), e3;
    }
    function i2(e3, t3, { onChooseFile: s3, onUploadProgress: r3 }) {
      return t3.then((e4) => {
        if (s3) {
          const t4 = s3(e4);
          if (void 0 !== t4)
            return Promise.resolve(t4).then((t5) => void 0 === t5 ? e4 : t5);
        }
        return e4;
      }).then((t4) => false === t4 ? { errMsg: n2, tempFilePaths: [], tempFiles: [] } : function(e4, t5, s4 = 5, r4) {
        (t5 = Object.assign({}, t5)).errMsg = n2;
        const i3 = t5.tempFiles, o2 = i3.length;
        let a2 = 0;
        return new Promise((n3) => {
          for (; a2 < s4; )
            c2();
          function c2() {
            const s5 = a2++;
            if (s5 >= o2)
              return void (!i3.find((e5) => !e5.url && !e5.errMsg) && n3(t5));
            const u2 = i3[s5];
            e4.uploadFile({ provider: u2.provider, filePath: u2.path, cloudPath: u2.cloudPath, fileType: u2.fileType, cloudPathAsRealPath: u2.cloudPathAsRealPath, onUploadProgress(e5) {
              e5.index = s5, e5.tempFile = u2, e5.tempFilePath = u2.path, r4 && r4(e5);
            } }).then((e5) => {
              u2.url = e5.fileID, s5 < o2 && c2();
            }).catch((e5) => {
              u2.errMsg = e5.errMsg || e5.message, s5 < o2 && c2();
            });
          }
        });
      }(e3, t4, 5, r3));
    }
    t2.initChooseAndUploadFile = function(e3) {
      return function(t3 = { type: "all" }) {
        return "image" === t3.type ? i2(e3, function(e4) {
          const { count: t4, sizeType: n3, sourceType: i3 = ["album", "camera"], extension: o2 } = e4;
          return new Promise((e5, a2) => {
            uni.chooseImage({ count: t4, sizeType: n3, sourceType: i3, extension: o2, success(t5) {
              e5(r2(t5, "image"));
            }, fail(e6) {
              a2({ errMsg: e6.errMsg.replace("chooseImage:fail", s2) });
            } });
          });
        }(t3), t3) : "video" === t3.type ? i2(e3, function(e4) {
          const { camera: t4, compressed: n3, maxDuration: i3, sourceType: o2 = ["album", "camera"], extension: a2 } = e4;
          return new Promise((e5, c2) => {
            uni.chooseVideo({ camera: t4, compressed: n3, maxDuration: i3, sourceType: o2, extension: a2, success(t5) {
              const { tempFilePath: n4, duration: s3, size: i4, height: o3, width: a3 } = t5;
              e5(r2({ errMsg: "chooseVideo:ok", tempFilePaths: [n4], tempFiles: [{ name: t5.tempFile && t5.tempFile.name || "", path: n4, size: i4, type: t5.tempFile && t5.tempFile.type || "", width: a3, height: o3, duration: s3, fileType: "video", cloudPath: "" }] }, "video"));
            }, fail(e6) {
              c2({ errMsg: e6.errMsg.replace("chooseVideo:fail", s2) });
            } });
          });
        }(t3), t3) : i2(e3, function(e4) {
          const { count: t4, extension: n3 } = e4;
          return new Promise((e5, i3) => {
            let o2 = uni.chooseFile;
            if ("undefined" != typeof wx && "function" == typeof wx.chooseMessageFile && (o2 = wx.chooseMessageFile), "function" != typeof o2)
              return i3({ errMsg: s2 + " 请指定 type 类型，该平台仅支持选择 image 或 video。" });
            o2({ type: "all", count: t4, extension: n3, success(t5) {
              e5(r2(t5));
            }, fail(e6) {
              i3({ errMsg: e6.errMsg.replace("chooseFile:fail", s2) });
            } });
          });
        }(t3), t3);
      };
    };
  }), js = t(Fs);
  const $s = "manual";
  function Bs(e2) {
    return { props: { localdata: { type: Array, default: () => [] }, options: { type: [Object, Array], default: () => ({}) }, spaceInfo: { type: Object, default: () => ({}) }, collection: { type: [String, Array], default: "" }, action: { type: String, default: "" }, field: { type: String, default: "" }, orderby: { type: String, default: "" }, where: { type: [String, Object], default: "" }, pageData: { type: String, default: "add" }, pageCurrent: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 }, getcount: { type: [Boolean, String], default: false }, gettree: { type: [Boolean, String], default: false }, gettreepath: { type: [Boolean, String], default: false }, startwith: { type: String, default: "" }, limitlevel: { type: Number, default: 10 }, groupby: { type: String, default: "" }, groupField: { type: String, default: "" }, distinct: { type: [Boolean, String], default: false }, foreignKey: { type: String, default: "" }, loadtime: { type: String, default: "auto" }, manual: { type: Boolean, default: false } }, data: () => ({ mixinDatacomLoading: false, mixinDatacomHasMore: false, mixinDatacomResData: [], mixinDatacomErrorMessage: "", mixinDatacomPage: {}, mixinDatacomError: null }), created() {
      this.mixinDatacomPage = { current: this.pageCurrent, size: this.pageSize, count: 0 }, this.$watch(() => {
        var e3 = [];
        return ["pageCurrent", "pageSize", "localdata", "collection", "action", "field", "orderby", "where", "getont", "getcount", "gettree", "groupby", "groupField", "distinct"].forEach((t2) => {
          e3.push(this[t2]);
        }), e3;
      }, (e3, t2) => {
        if (this.loadtime === $s)
          return;
        let n2 = false;
        const s2 = [];
        for (let r2 = 2; r2 < e3.length; r2++)
          e3[r2] !== t2[r2] && (s2.push(e3[r2]), n2 = true);
        e3[0] !== t2[0] && (this.mixinDatacomPage.current = this.pageCurrent), this.mixinDatacomPage.size = this.pageSize, this.onMixinDatacomPropsChange(n2, s2);
      });
    }, methods: { onMixinDatacomPropsChange(e3, t2) {
    }, mixinDatacomEasyGet({ getone: e3 = false, success: t2, fail: n2 } = {}) {
      this.mixinDatacomLoading || (this.mixinDatacomLoading = true, this.mixinDatacomErrorMessage = "", this.mixinDatacomError = null, this.mixinDatacomGet().then((n3) => {
        this.mixinDatacomLoading = false;
        const { data: s2, count: r2 } = n3.result;
        this.getcount && (this.mixinDatacomPage.count = r2), this.mixinDatacomHasMore = s2.length < this.pageSize;
        const i2 = e3 ? s2.length ? s2[0] : void 0 : s2;
        this.mixinDatacomResData = i2, t2 && t2(i2);
      }).catch((e4) => {
        this.mixinDatacomLoading = false, this.mixinDatacomErrorMessage = e4, this.mixinDatacomError = e4, n2 && n2(e4);
      }));
    }, mixinDatacomGet(t2 = {}) {
      let n2;
      t2 = t2 || {}, n2 = "undefined" != typeof __uniX && __uniX ? e2.databaseForJQL(this.spaceInfo) : e2.database(this.spaceInfo);
      const s2 = t2.action || this.action;
      s2 && (n2 = n2.action(s2));
      const r2 = t2.collection || this.collection;
      n2 = Array.isArray(r2) ? n2.collection(...r2) : n2.collection(r2);
      const i2 = t2.where || this.where;
      i2 && Object.keys(i2).length && (n2 = n2.where(i2));
      const o2 = t2.field || this.field;
      o2 && (n2 = n2.field(o2));
      const a2 = t2.foreignKey || this.foreignKey;
      a2 && (n2 = n2.foreignKey(a2));
      const c2 = t2.groupby || this.groupby;
      c2 && (n2 = n2.groupBy(c2));
      const u2 = t2.groupField || this.groupField;
      u2 && (n2 = n2.groupField(u2));
      true === (void 0 !== t2.distinct ? t2.distinct : this.distinct) && (n2 = n2.distinct());
      const h2 = t2.orderby || this.orderby;
      h2 && (n2 = n2.orderBy(h2));
      const l2 = void 0 !== t2.pageCurrent ? t2.pageCurrent : this.mixinDatacomPage.current, d2 = void 0 !== t2.pageSize ? t2.pageSize : this.mixinDatacomPage.size, p2 = void 0 !== t2.getcount ? t2.getcount : this.getcount, f2 = void 0 !== t2.gettree ? t2.gettree : this.gettree, g2 = void 0 !== t2.gettreepath ? t2.gettreepath : this.gettreepath, m2 = { getCount: p2 }, y2 = { limitLevel: void 0 !== t2.limitlevel ? t2.limitlevel : this.limitlevel, startWith: void 0 !== t2.startwith ? t2.startwith : this.startwith };
      return f2 && (m2.getTree = y2), g2 && (m2.getTreePath = y2), n2 = n2.skip(d2 * (l2 - 1)).limit(d2).get(m2), n2;
    } } };
  }
  function Ws(e2) {
    return function(t2, n2 = {}) {
      n2 = function(e3, t3 = {}) {
        return e3.customUI = t3.customUI || e3.customUI, e3.parseSystemError = t3.parseSystemError || e3.parseSystemError, Object.assign(e3.loadingOptions, t3.loadingOptions), Object.assign(e3.errorOptions, t3.errorOptions), "object" == typeof t3.secretMethods && (e3.secretMethods = t3.secretMethods), e3;
      }({ customUI: false, loadingOptions: { title: "加载中...", mask: true }, errorOptions: { type: "modal", retry: false } }, n2);
      const { customUI: s2, loadingOptions: r2, errorOptions: i2, parseSystemError: o2 } = n2, a2 = !s2;
      return new Proxy({}, { get(s3, c2) {
        switch (c2) {
          case "toString":
            return "[object UniCloudObject]";
          case "toJSON":
            return {};
        }
        return function({ fn: e3, interceptorName: t3, getCallbackArgs: n3 } = {}) {
          return async function(...s4) {
            const r3 = n3 ? n3({ params: s4 }) : {};
            let i3, o3;
            try {
              return await K(F(t3, "invoke"), { ...r3 }), i3 = await e3(...s4), await K(F(t3, "success"), { ...r3, result: i3 }), i3;
            } catch (e4) {
              throw o3 = e4, await K(F(t3, "fail"), { ...r3, error: o3 }), o3;
            } finally {
              await K(F(t3, "complete"), o3 ? { ...r3, error: o3 } : { ...r3, result: i3 });
            }
          };
        }({ fn: async function s4(...h2) {
          let l2;
          a2 && uni.showLoading({ title: r2.title, mask: r2.mask });
          const d2 = { name: t2, type: u, data: { method: c2, params: h2 } };
          "object" == typeof n2.secretMethods && function(e3, t3) {
            const n3 = t3.data.method, s5 = e3.secretMethods || {}, r3 = s5[n3] || s5["*"];
            r3 && (t3.secretType = r3);
          }(n2, d2);
          let p2 = false;
          try {
            l2 = await e2.callFunction(d2);
          } catch (e3) {
            p2 = true, l2 = { result: new se(e3) };
          }
          const { errSubject: f2, errCode: g2, errMsg: m2, newToken: y2 } = l2.result || {};
          if (a2 && uni.hideLoading(), y2 && y2.token && y2.tokenExpired && (ae(y2), X(H, { ...y2 })), g2) {
            let e3 = m2;
            if (p2 && o2) {
              e3 = (await o2({ objectName: t2, methodName: c2, params: h2, errSubject: f2, errCode: g2, errMsg: m2 })).errMsg || m2;
            }
            if (a2)
              if ("toast" === i2.type)
                uni.showToast({ title: e3, icon: "none" });
              else {
                if ("modal" !== i2.type)
                  throw new Error(`Invalid errorOptions.type: ${i2.type}`);
                {
                  const { confirm: t3 } = await async function({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3 } = {}) {
                    return new Promise((i3, o3) => {
                      uni.showModal({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3, success(e5) {
                        i3(e5);
                      }, fail() {
                        i3({ confirm: false, cancel: true });
                      } });
                    });
                  }({ title: "提示", content: e3, showCancel: i2.retry, cancelText: "取消", confirmText: i2.retry ? "重试" : "确定" });
                  if (i2.retry && t3)
                    return s4(...h2);
                }
              }
            const n3 = new se({ subject: f2, code: g2, message: m2, requestId: l2.requestId });
            throw n3.detail = l2.result, X(B, { type: V, content: n3 }), n3;
          }
          return X(B, { type: V, content: l2.result }), l2.result;
        }, interceptorName: "callObject", getCallbackArgs: function({ params: e3 } = {}) {
          return { objectName: t2, methodName: c2, params: e3 };
        } });
      } });
    };
  }
  function Hs(e2) {
    return R("_globalUniCloudSecureNetworkCache__{spaceId}".replace("{spaceId}", e2.config.spaceId));
  }
  async function Js({ openid: e2, callLoginByWeixin: t2 = false } = {}) {
    Hs(this);
    throw new Error(`[SecureNetwork] API \`initSecureNetworkByWeixin\` is not supported on platform \`${A}\``);
  }
  async function zs(e2) {
    const t2 = Hs(this);
    return t2.initPromise || (t2.initPromise = Js.call(this, e2).then((e3) => e3).catch((e3) => {
      throw delete t2.initPromise, e3;
    })), t2.initPromise;
  }
  function Vs(e2) {
    return function({ openid: t2, callLoginByWeixin: n2 = false } = {}) {
      return zs.call(e2, { openid: t2, callLoginByWeixin: n2 });
    };
  }
  function Gs(e2) {
    !function(e3) {
      de = e3;
    }(e2);
  }
  function Ys(e2) {
    const t2 = { getSystemInfo: uni.getSystemInfo, getPushClientId: uni.getPushClientId };
    return function(n2) {
      return new Promise((s2, r2) => {
        t2[e2]({ ...n2, success(e3) {
          s2(e3);
        }, fail(e3) {
          r2(e3);
        } });
      });
    };
  }
  class Qs extends class {
    constructor() {
      this._callback = {};
    }
    addListener(e2, t2) {
      this._callback[e2] || (this._callback[e2] = []), this._callback[e2].push(t2);
    }
    on(e2, t2) {
      return this.addListener(e2, t2);
    }
    removeListener(e2, t2) {
      if (!t2)
        throw new Error('The "listener" argument must be of type function. Received undefined');
      const n2 = this._callback[e2];
      if (!n2)
        return;
      const s2 = function(e3, t3) {
        for (let n3 = e3.length - 1; n3 >= 0; n3--)
          if (e3[n3] === t3)
            return n3;
        return -1;
      }(n2, t2);
      n2.splice(s2, 1);
    }
    off(e2, t2) {
      return this.removeListener(e2, t2);
    }
    removeAllListener(e2) {
      delete this._callback[e2];
    }
    emit(e2, ...t2) {
      const n2 = this._callback[e2];
      if (n2)
        for (let e3 = 0; e3 < n2.length; e3++)
          n2[e3](...t2);
    }
  } {
    constructor() {
      super(), this._uniPushMessageCallback = this._receivePushMessage.bind(this), this._currentMessageId = -1, this._payloadQueue = [];
    }
    init() {
      return Promise.all([Ys("getSystemInfo")(), Ys("getPushClientId")()]).then(([{ appId: e2 } = {}, { cid: t2 } = {}] = []) => {
        if (!e2)
          throw new Error("Invalid appId, please check the manifest.json file");
        if (!t2)
          throw new Error("Invalid push client id");
        this._appId = e2, this._pushClientId = t2, this._seqId = Date.now() + "-" + Math.floor(9e5 * Math.random() + 1e5), this.emit("open"), this._initMessageListener();
      }, (e2) => {
        throw this.emit("error", e2), this.close(), e2;
      });
    }
    async open() {
      return this.init();
    }
    _isUniCloudSSE(e2) {
      if ("receive" !== e2.type)
        return false;
      const t2 = e2 && e2.data && e2.data.payload;
      return !(!t2 || "UNI_CLOUD_SSE" !== t2.channel || t2.seqId !== this._seqId);
    }
    _receivePushMessage(e2) {
      if (!this._isUniCloudSSE(e2))
        return;
      const t2 = e2 && e2.data && e2.data.payload, { action: n2, messageId: s2, message: r2 } = t2;
      this._payloadQueue.push({ action: n2, messageId: s2, message: r2 }), this._consumMessage();
    }
    _consumMessage() {
      for (; ; ) {
        const e2 = this._payloadQueue.find((e3) => e3.messageId === this._currentMessageId + 1);
        if (!e2)
          break;
        this._currentMessageId++, this._parseMessagePayload(e2);
      }
    }
    _parseMessagePayload(e2) {
      const { action: t2, messageId: n2, message: s2 } = e2;
      "end" === t2 ? this._end({ messageId: n2, message: s2 }) : "message" === t2 && this._appendMessage({ messageId: n2, message: s2 });
    }
    _appendMessage({ messageId: e2, message: t2 } = {}) {
      this.emit("message", t2);
    }
    _end({ messageId: e2, message: t2 } = {}) {
      this.emit("end", t2), this.close();
    }
    _initMessageListener() {
      uni.onPushMessage(this._uniPushMessageCallback);
    }
    _destroy() {
      uni.offPushMessage(this._uniPushMessageCallback);
    }
    toJSON() {
      return { appId: this._appId, pushClientId: this._pushClientId, seqId: this._seqId };
    }
    close() {
      this._destroy(), this.emit("close");
    }
  }
  async function Xs(e2) {
    {
      const { osName: e3, osVersion: t3 } = he();
      "ios" === e3 && function(e4) {
        if (!e4 || "string" != typeof e4)
          return 0;
        const t4 = e4.match(/^(\d+)./);
        return t4 && t4[1] ? parseInt(t4[1]) : 0;
      }(t3) >= 14 && console.warn("iOS 14及以上版本连接uniCloud本地调试服务需要允许客户端查找并连接到本地网络上的设备（仅开发期间需要，发行后不需要）");
    }
    const t2 = e2.__dev__;
    if (!t2.debugInfo)
      return;
    const { address: n2, servePort: s2 } = t2.debugInfo, { address: r2 } = await Et(n2, s2);
    if (r2)
      return t2.localAddress = r2, void (t2.localPort = s2);
    const i2 = console["error"];
    let o2 = "";
    if ("remote" === t2.debugInfo.initialLaunchType ? (t2.debugInfo.forceRemote = true, o2 = "当前客户端和HBuilderX不在同一局域网下（或其他网络原因无法连接HBuilderX），uniCloud本地调试服务不对当前客户端生效。\n- 如果不使用uniCloud本地调试服务，请直接忽略此信息。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。") : o2 = "无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。", o2 += "\n- 如果在HBuilderX开启的状态下切换过网络环境，请重启HBuilderX后再试\n- 检查系统防火墙是否拦截了HBuilderX自带的nodejs\n- 检查是否错误的使用拦截器修改uni.request方法的参数", 0 === A.indexOf("mp-") && (o2 += "\n- 小程序中如何使用uniCloud，请参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"), !t2.debugInfo.forceRemote)
      throw new Error(o2);
    i2(o2);
  }
  function Zs(e2) {
    e2._initPromiseHub || (e2._initPromiseHub = new v({ createPromise: function() {
      let t2 = Promise.resolve();
      var n2;
      n2 = 1, t2 = new Promise((e3) => {
        setTimeout(() => {
          e3();
        }, n2);
      });
      const s2 = e2.auth();
      return t2.then(() => s2.getLoginState()).then((e3) => e3 ? Promise.resolve() : s2.signInAnonymously());
    } }));
  }
  const er = { tcb: xt, tencent: xt, aliyun: me, private: Ut, dcloud: Ut, alipay: Wt };
  let tr = new class {
    init(e2) {
      let t2 = {};
      const n2 = er[e2.provider];
      if (!n2)
        throw new Error("未提供正确的provider参数");
      t2 = n2.init(e2), function(e3) {
        const t3 = {};
        e3.__dev__ = t3, t3.debugLog = "app" === A;
        const n3 = P;
        n3 && !n3.code && (t3.debugInfo = n3);
        const s2 = new v({ createPromise: function() {
          return Xs(e3);
        } });
        t3.initLocalNetwork = function() {
          return s2.exec();
        };
      }(t2), Zs(t2), Xn(t2), function(e3) {
        const t3 = e3.uploadFile;
        e3.uploadFile = function(e4) {
          return t3.call(this, e4);
        };
      }(t2), function(e3) {
        e3.database = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).database();
          if (this._database)
            return this._database;
          const n3 = us(hs, { uniClient: e3 });
          return this._database = n3, n3;
        }, e3.databaseForJQL = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).databaseForJQL();
          if (this._databaseForJQL)
            return this._databaseForJQL;
          const n3 = us(hs, { uniClient: e3, isJQL: true });
          return this._databaseForJQL = n3, n3;
        };
      }(t2), function(e3) {
        e3.getCurrentUserInfo = Ks, e3.chooseAndUploadFile = js.initChooseAndUploadFile(e3), Object.assign(e3, { get mixinDatacom() {
          return Bs(e3);
        } }), e3.SSEChannel = Qs, e3.initSecureNetworkByWeixin = Vs(e3), e3.setCustomClientInfo = Gs, e3.importObject = Ws(e3);
      }(t2);
      return ["callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "chooseAndUploadFile"].forEach((e3) => {
        if (!t2[e3])
          return;
        const n3 = t2[e3];
        t2[e3] = function() {
          return n3.apply(t2, Array.from(arguments));
        }, t2[e3] = (/* @__PURE__ */ function(e4, t3) {
          return function(n4) {
            let s2 = false;
            if ("callFunction" === t3) {
              const e5 = n4 && n4.type || c;
              s2 = e5 !== c;
            }
            const r2 = "callFunction" === t3 && !s2, i2 = this._initPromiseHub.exec();
            n4 = n4 || {};
            const { success: o2, fail: a2, complete: u2 } = ne(n4), h2 = i2.then(() => s2 ? Promise.resolve() : K(F(t3, "invoke"), n4)).then(() => e4.call(this, n4)).then((e5) => s2 ? Promise.resolve(e5) : K(F(t3, "success"), e5).then(() => K(F(t3, "complete"), e5)).then(() => (r2 && X(B, { type: z, content: e5 }), Promise.resolve(e5))), (e5) => s2 ? Promise.reject(e5) : K(F(t3, "fail"), e5).then(() => K(F(t3, "complete"), e5)).then(() => (X(B, { type: z, content: e5 }), Promise.reject(e5))));
            if (!(o2 || a2 || u2))
              return h2;
            h2.then((e5) => {
              o2 && o2(e5), u2 && u2(e5), r2 && X(B, { type: z, content: e5 });
            }, (e5) => {
              a2 && a2(e5), u2 && u2(e5), r2 && X(B, { type: z, content: e5 });
            });
          };
        }(t2[e3], e3)).bind(t2);
      }), t2.init = this.init, t2;
    }
  }();
  (() => {
    const e2 = C;
    let t2 = {};
    if (e2 && 1 === e2.length)
      t2 = e2[0], tr = tr.init(t2), tr._isDefault = true;
    else {
      const t3 = ["auth", "callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "database", "getCurrentUSerInfo", "importObject"];
      let n2;
      n2 = e2 && e2.length > 0 ? "应用有多个服务空间，请通过uniCloud.init方法指定要使用的服务空间" : "应用未关联服务空间，请在uniCloud目录右键关联服务空间", t3.forEach((e3) => {
        tr[e3] = function() {
          return console.error(n2), Promise.reject(new se({ code: "SYS_ERR", message: n2 }));
        };
      });
    }
    if (Object.assign(tr, { get mixinDatacom() {
      return Bs(tr);
    } }), Ns(tr), tr.addInterceptor = M, tr.removeInterceptor = q, tr.interceptObject = j, uni.__uniCloud = tr, "app" === A) {
      const e3 = U();
      e3.uniCloud = tr, e3.UniCloudError = se;
    }
  })();
  var nr = tr;
  const _sfc_main$q = {
    name: "loading1",
    data() {
      return {};
    }
  };
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading1" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading1 = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__scopeId", "data-v-0e645258"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading1.vue"]]);
  const _sfc_main$p = {
    name: "loading2",
    data() {
      return {};
    }
  };
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading2" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading2 = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-3df48dc2"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading2.vue"]]);
  const _sfc_main$o = {
    name: "loading3",
    data() {
      return {};
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading3" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading3 = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__scopeId", "data-v-27a8293c"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading3.vue"]]);
  const _sfc_main$n = {
    name: "loading5",
    data() {
      return {};
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading5" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading4 = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__scopeId", "data-v-2e7deb83"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading4.vue"]]);
  const _sfc_main$m = {
    name: "loading6",
    data() {
      return {};
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading6" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading5 = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__scopeId", "data-v-ef674bbb"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading5.vue"]]);
  const _sfc_main$l = {
    components: { Loading1, Loading2, Loading3, Loading4, Loading5 },
    name: "qiun-loading",
    props: {
      loadingType: {
        type: Number,
        default: 2
      }
    },
    data() {
      return {};
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_Loading1 = vue.resolveComponent("Loading1");
    const _component_Loading2 = vue.resolveComponent("Loading2");
    const _component_Loading3 = vue.resolveComponent("Loading3");
    const _component_Loading4 = vue.resolveComponent("Loading4");
    const _component_Loading5 = vue.resolveComponent("Loading5");
    return vue.openBlock(), vue.createElementBlock("view", null, [
      $props.loadingType == 1 ? (vue.openBlock(), vue.createBlock(_component_Loading1, { key: 0 })) : vue.createCommentVNode("v-if", true),
      $props.loadingType == 2 ? (vue.openBlock(), vue.createBlock(_component_Loading2, { key: 1 })) : vue.createCommentVNode("v-if", true),
      $props.loadingType == 3 ? (vue.openBlock(), vue.createBlock(_component_Loading3, { key: 2 })) : vue.createCommentVNode("v-if", true),
      $props.loadingType == 4 ? (vue.openBlock(), vue.createBlock(_component_Loading4, { key: 3 })) : vue.createCommentVNode("v-if", true),
      $props.loadingType == 5 ? (vue.openBlock(), vue.createBlock(_component_Loading5, { key: 4 })) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/qiun-loading.vue"]]);
  const _sfc_main$k = {
    name: "qiun-error",
    props: {
      errorMessage: {
        type: String,
        default: null
      }
    },
    data() {
      return {};
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "chartsview" }, [
      vue.createElementVNode("view", { class: "charts-error" }),
      vue.createElementVNode(
        "view",
        { class: "charts-font" },
        vue.toDisplayString($props.errorMessage == null ? "请点击重试" : $props.errorMessage),
        1
        /* TEXT */
      )
    ]);
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-a99d579b"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-error/qiun-error.vue"]]);
  const color$1 = ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"];
  const formatDateTime = (timeStamp, returnType) => {
    var date = /* @__PURE__ */ new Date();
    date.setTime(timeStamp * 1e3);
    var y2 = date.getFullYear();
    var m2 = date.getMonth() + 1;
    m2 = m2 < 10 ? "0" + m2 : m2;
    var d2 = date.getDate();
    d2 = d2 < 10 ? "0" + d2 : d2;
    var h2 = date.getHours();
    h2 = h2 < 10 ? "0" + h2 : h2;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    if (returnType == "full") {
      return y2 + "-" + m2 + "-" + d2 + " " + h2 + ":" + minute + ":" + second;
    }
    if (returnType == "y-m-d") {
      return y2 + "-" + m2 + "-" + d2;
    }
    if (returnType == "h:m") {
      return h2 + ":" + minute;
    }
    if (returnType == "h:m:s") {
      return h2 + ":" + minute + ":" + second;
    }
    return [y2, m2, d2, h2, minute, second];
  };
  const cfu = {
    //demotype为自定义图表类型，一般不需要自定义图表类型，只需要改根节点上对应的类型即可
    "type": ["pie", "ring", "rose", "word", "funnel", "map", "arcbar", "line", "column", "mount", "bar", "area", "radar", "gauge", "candle", "mix", "tline", "tarea", "scatter", "bubble", "demotype"],
    "range": ["饼状图", "圆环图", "玫瑰图", "词云图", "漏斗图", "地图", "圆弧进度条", "折线图", "柱状图", "山峰图", "条状图", "区域图", "雷达图", "仪表盘", "K线图", "混合图", "时间轴折线", "时间轴区域", "散点图", "气泡图", "自定义类型"],
    //增加自定义图表类型，如果需要categories，请在这里加入您的图表类型，例如最后的"demotype"
    //自定义类型时需要注意"tline","tarea","scatter","bubble"等时间轴（矢量x轴）类图表，没有categories，不需要加入categories
    "categories": ["line", "column", "mount", "bar", "area", "radar", "gauge", "candle", "mix", "demotype"],
    //instance为实例变量承载属性，不要删除
    "instance": {},
    //option为opts及eopts承载属性，不要删除
    "option": {},
    //下面是自定义format配置，因除H5端外的其他端无法通过props传递函数，只能通过此属性对应下标的方式来替换
    "formatter": {
      "yAxisDemo1": function(val, index, opts) {
        return val + "元";
      },
      "yAxisDemo2": function(val, index, opts) {
        return val.toFixed(2);
      },
      "xAxisDemo1": function(val, index, opts) {
        return val + "年";
      },
      "xAxisDemo2": function(val, index, opts) {
        return formatDateTime(val, "h:m");
      },
      "seriesDemo1": function(val, index, series, opts) {
        return val + "元";
      },
      "tooltipDemo1": function(item, category, index, opts) {
        if (index == 0) {
          return "随便用" + item.data + "年";
        } else {
          return "其他我没改" + item.data + "天";
        }
      },
      "pieDemo": function(val, index, series, opts) {
        if (index !== void 0) {
          return series[index].name + "：" + series[index].data + "元";
        }
      }
    },
    //这里演示了自定义您的图表类型的option，可以随意命名，之后在组件上 type="demotype" 后，组件会调用这个花括号里的option，如果组件上还存在opts参数，会将demotype与opts中option合并后渲染图表。
    "demotype": {
      //我这里把曲线图当做了自定义图表类型，您可以根据需要随意指定类型或配置
      "type": "line",
      "color": color$1,
      "padding": [15, 10, 0, 15],
      "xAxis": {
        "disableGrid": true
      },
      "yAxis": {
        "gridType": "dash",
        "dashLength": 2
      },
      "legend": {},
      "extra": {
        "line": {
          "type": "curve",
          "width": 2
        }
      }
    },
    //下面是自定义配置，请添加项目所需的通用配置
    "pie": {
      "type": "pie",
      "color": color$1,
      "padding": [5, 5, 5, 5],
      "extra": {
        "pie": {
          "activeOpacity": 0.5,
          "activeRadius": 10,
          "offsetAngle": 0,
          "labelWidth": 15,
          "border": true,
          "borderWidth": 3,
          "borderColor": "#FFFFFF"
        }
      }
    },
    "ring": {
      "type": "ring",
      "color": color$1,
      "padding": [5, 5, 5, 5],
      "rotate": false,
      "dataLabel": true,
      "legend": {
        "show": true,
        "position": "right",
        "lineHeight": 25
      },
      "title": {
        "name": "收益率",
        "fontSize": 15,
        "color": "#666666"
      },
      "subtitle": {
        "name": "70%",
        "fontSize": 25,
        "color": "#7cb5ec"
      },
      "extra": {
        "ring": {
          "ringWidth": 30,
          "activeOpacity": 0.5,
          "activeRadius": 10,
          "offsetAngle": 0,
          "labelWidth": 15,
          "border": true,
          "borderWidth": 3,
          "borderColor": "#FFFFFF"
        }
      }
    },
    "rose": {
      "type": "rose",
      "color": color$1,
      "padding": [5, 5, 5, 5],
      "legend": {
        "show": true,
        "position": "left",
        "lineHeight": 25
      },
      "extra": {
        "rose": {
          "type": "area",
          "minRadius": 50,
          "activeOpacity": 0.5,
          "activeRadius": 10,
          "offsetAngle": 0,
          "labelWidth": 15,
          "border": false,
          "borderWidth": 2,
          "borderColor": "#FFFFFF"
        }
      }
    },
    "word": {
      "type": "word",
      "color": color$1,
      "extra": {
        "word": {
          "type": "normal",
          "autoColors": false
        }
      }
    },
    "funnel": {
      "type": "funnel",
      "color": color$1,
      "padding": [15, 15, 0, 15],
      "extra": {
        "funnel": {
          "activeOpacity": 0.3,
          "activeWidth": 10,
          "border": true,
          "borderWidth": 2,
          "borderColor": "#FFFFFF",
          "fillOpacity": 1,
          "labelAlign": "right"
        }
      }
    },
    "map": {
      "type": "map",
      "color": color$1,
      "padding": [0, 0, 0, 0],
      "dataLabel": true,
      "extra": {
        "map": {
          "border": true,
          "borderWidth": 1,
          "borderColor": "#666666",
          "fillOpacity": 0.6,
          "activeBorderColor": "#F04864",
          "activeFillColor": "#FACC14",
          "activeFillOpacity": 1
        }
      }
    },
    "arcbar": {
      "type": "arcbar",
      "color": color$1,
      "title": {
        "name": "百分比",
        "fontSize": 25,
        "color": "#00FF00"
      },
      "subtitle": {
        "name": "默认标题",
        "fontSize": 15,
        "color": "#666666"
      },
      "extra": {
        "arcbar": {
          "type": "default",
          "width": 12,
          "backgroundColor": "#E9E9E9",
          "startAngle": 0.75,
          "endAngle": 0.25,
          "gap": 2
        }
      }
    },
    "line": {
      "type": "line",
      "color": color$1,
      "padding": [15, 10, 0, 15],
      "xAxis": {
        "disableGrid": true
      },
      "yAxis": {
        "gridType": "dash",
        "dashLength": 2
      },
      "legend": {},
      "extra": {
        "line": {
          "type": "straight",
          "width": 2,
          "activeType": "hollow"
        }
      }
    },
    "tline": {
      "type": "line",
      "color": color$1,
      "padding": [15, 10, 0, 15],
      "xAxis": {
        "disableGrid": false,
        "boundaryGap": "justify"
      },
      "yAxis": {
        "gridType": "dash",
        "dashLength": 2,
        "data": [
          {
            "min": 0,
            "max": 80
          }
        ]
      },
      "legend": {},
      "extra": {
        "line": {
          "type": "curve",
          "width": 2,
          "activeType": "hollow"
        }
      }
    },
    "tarea": {
      "type": "area",
      "color": color$1,
      "padding": [15, 10, 0, 15],
      "xAxis": {
        "disableGrid": true,
        "boundaryGap": "justify"
      },
      "yAxis": {
        "gridType": "dash",
        "dashLength": 2,
        "data": [
          {
            "min": 0,
            "max": 80
          }
        ]
      },
      "legend": {},
      "extra": {
        "area": {
          "type": "curve",
          "opacity": 0.2,
          "addLine": true,
          "width": 2,
          "gradient": true,
          "activeType": "hollow"
        }
      }
    },
    "column": {
      "type": "column",
      "color": color$1,
      "padding": [15, 15, 0, 5],
      "xAxis": {
        "disableGrid": true
      },
      "yAxis": {
        "data": [{ "min": 0 }]
      },
      "legend": {},
      "extra": {
        "column": {
          "type": "group",
          "width": 30,
          "activeBgColor": "#000000",
          "activeBgOpacity": 0.08
        }
      }
    },
    "mount": {
      "type": "mount",
      "color": color$1,
      "padding": [15, 15, 0, 5],
      "xAxis": {
        "disableGrid": true
      },
      "yAxis": {
        "data": [{ "min": 0 }]
      },
      "legend": {},
      "extra": {
        "mount": {
          "type": "mount",
          "widthRatio": 1.5
        }
      }
    },
    "bar": {
      "type": "bar",
      "color": color$1,
      "padding": [15, 30, 0, 5],
      "xAxis": {
        "boundaryGap": "justify",
        "disableGrid": false,
        "min": 0,
        "axisLine": false
      },
      "yAxis": {},
      "legend": {},
      "extra": {
        "bar": {
          "type": "group",
          "width": 30,
          "meterBorde": 1,
          "meterFillColor": "#FFFFFF",
          "activeBgColor": "#000000",
          "activeBgOpacity": 0.08
        }
      }
    },
    "area": {
      "type": "area",
      "color": color$1,
      "padding": [15, 15, 0, 15],
      "xAxis": {
        "disableGrid": true
      },
      "yAxis": {
        "gridType": "dash",
        "dashLength": 2
      },
      "legend": {},
      "extra": {
        "area": {
          "type": "straight",
          "opacity": 0.2,
          "addLine": true,
          "width": 2,
          "gradient": false,
          "activeType": "hollow"
        }
      }
    },
    "radar": {
      "type": "radar",
      "color": color$1,
      "padding": [5, 5, 5, 5],
      "dataLabel": false,
      "legend": {
        "show": true,
        "position": "right",
        "lineHeight": 25
      },
      "extra": {
        "radar": {
          "gridType": "radar",
          "gridColor": "#CCCCCC",
          "gridCount": 3,
          "opacity": 0.2,
          "max": 200,
          "labelShow": true
        }
      }
    },
    "gauge": {
      "type": "gauge",
      "color": color$1,
      "title": {
        "name": "66Km/H",
        "fontSize": 25,
        "color": "#2fc25b",
        "offsetY": 50
      },
      "subtitle": {
        "name": "实时速度",
        "fontSize": 15,
        "color": "#1890ff",
        "offsetY": -50
      },
      "extra": {
        "gauge": {
          "type": "default",
          "width": 30,
          "labelColor": "#666666",
          "startAngle": 0.75,
          "endAngle": 0.25,
          "startNumber": 0,
          "endNumber": 100,
          "labelFormat": "",
          "splitLine": {
            "fixRadius": 0,
            "splitNumber": 10,
            "width": 30,
            "color": "#FFFFFF",
            "childNumber": 5,
            "childWidth": 12
          },
          "pointer": {
            "width": 24,
            "color": "auto"
          }
        }
      }
    },
    "candle": {
      "type": "candle",
      "color": color$1,
      "padding": [15, 15, 0, 15],
      "enableScroll": true,
      "enableMarkLine": true,
      "dataLabel": false,
      "xAxis": {
        "labelCount": 4,
        "itemCount": 40,
        "disableGrid": true,
        "gridColor": "#CCCCCC",
        "gridType": "solid",
        "dashLength": 4,
        "scrollShow": true,
        "scrollAlign": "left",
        "scrollColor": "#A6A6A6",
        "scrollBackgroundColor": "#EFEBEF"
      },
      "yAxis": {},
      "legend": {},
      "extra": {
        "candle": {
          "color": {
            "upLine": "#f04864",
            "upFill": "#f04864",
            "downLine": "#2fc25b",
            "downFill": "#2fc25b"
          },
          "average": {
            "show": true,
            "name": ["MA5", "MA10", "MA30"],
            "day": [5, 10, 20],
            "color": ["#1890ff", "#2fc25b", "#facc14"]
          }
        },
        "markLine": {
          "type": "dash",
          "dashLength": 5,
          "data": [
            {
              "value": 2150,
              "lineColor": "#f04864",
              "showLabel": true
            },
            {
              "value": 2350,
              "lineColor": "#f04864",
              "showLabel": true
            }
          ]
        }
      }
    },
    "mix": {
      "type": "mix",
      "color": color$1,
      "padding": [15, 15, 0, 15],
      "xAxis": {
        "disableGrid": true
      },
      "yAxis": {
        "disabled": false,
        "disableGrid": false,
        "splitNumber": 5,
        "gridType": "dash",
        "dashLength": 4,
        "gridColor": "#CCCCCC",
        "padding": 10,
        "showTitle": true,
        "data": []
      },
      "legend": {},
      "extra": {
        "mix": {
          "column": {
            "width": 20
          }
        }
      }
    },
    "scatter": {
      "type": "scatter",
      "color": color$1,
      "padding": [15, 15, 0, 15],
      "dataLabel": false,
      "xAxis": {
        "disableGrid": false,
        "gridType": "dash",
        "splitNumber": 5,
        "boundaryGap": "justify",
        "min": 0
      },
      "yAxis": {
        "disableGrid": false,
        "gridType": "dash"
      },
      "legend": {},
      "extra": {
        "scatter": {}
      }
    },
    "bubble": {
      "type": "bubble",
      "color": color$1,
      "padding": [15, 15, 0, 15],
      "xAxis": {
        "disableGrid": false,
        "gridType": "dash",
        "splitNumber": 5,
        "boundaryGap": "justify",
        "min": 0,
        "max": 250
      },
      "yAxis": {
        "disableGrid": false,
        "gridType": "dash",
        "data": [{
          "min": 0,
          "max": 150
        }]
      },
      "legend": {},
      "extra": {
        "bubble": {
          "border": 2,
          "opacity": 0.5
        }
      }
    }
  };
  const color = ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"];
  const cfe = {
    //demotype为自定义图表类型
    "type": ["pie", "ring", "rose", "funnel", "line", "column", "area", "radar", "gauge", "candle", "demotype"],
    //增加自定义图表类型，如果需要categories，请在这里加入您的图表类型例如最后的"demotype"
    "categories": ["line", "column", "area", "radar", "gauge", "candle", "demotype"],
    //instance为实例变量承载属性，option为eopts承载属性，不要删除
    "instance": {},
    "option": {},
    //下面是自定义format配置，因除H5端外的其他端无法通过props传递函数，只能通过此属性对应下标的方式来替换
    "formatter": {
      "tooltipDemo1": function(res) {
        let result = "";
        for (let i2 in res) {
          if (i2 == 0) {
            result += res[i2].axisValueLabel + "年销售额";
          }
          let value = "--";
          if (res[i2].data !== null) {
            value = res[i2].data;
          }
          result += "<br/>" + res[i2].marker + res[i2].seriesName + "：" + value + " 万元";
        }
        return result;
      },
      legendFormat: function(name) {
        return "自定义图例+" + name;
      },
      yAxisFormatDemo: function(value, index) {
        return value + "元";
      },
      seriesFormatDemo: function(res) {
        return res.name + "年" + res.value + "元";
      }
    },
    //这里演示了自定义您的图表类型的option，可以随意命名，之后在组件上 type="demotype" 后，组件会调用这个花括号里的option，如果组件上还存在eopts参数，会将demotype与eopts中option合并后渲染图表。
    "demotype": {
      "color": color
      //在这里填写echarts的option即可
    },
    //下面是自定义配置，请添加项目所需的通用配置
    "column": {
      "color": color,
      "title": {
        "text": ""
      },
      "tooltip": {
        "trigger": "axis"
      },
      "grid": {
        "top": 30,
        "bottom": 50,
        "right": 15,
        "left": 40
      },
      "legend": {
        "bottom": "left"
      },
      "toolbox": {
        "show": false
      },
      "xAxis": {
        "type": "category",
        "axisLabel": {
          "color": "#666666"
        },
        "axisLine": {
          "lineStyle": {
            "color": "#CCCCCC"
          }
        },
        "boundaryGap": true,
        "data": []
      },
      "yAxis": {
        "type": "value",
        "axisTick": {
          "show": false
        },
        "axisLabel": {
          "color": "#666666"
        },
        "axisLine": {
          "lineStyle": {
            "color": "#CCCCCC"
          }
        }
      },
      "seriesTemplate": {
        "name": "",
        "type": "bar",
        "data": [],
        "barwidth": 20,
        "label": {
          "show": true,
          "color": "#666666",
          "position": "top"
        }
      }
    },
    "line": {
      "color": color,
      "title": {
        "text": ""
      },
      "tooltip": {
        "trigger": "axis"
      },
      "grid": {
        "top": 30,
        "bottom": 50,
        "right": 15,
        "left": 40
      },
      "legend": {
        "bottom": "left"
      },
      "toolbox": {
        "show": false
      },
      "xAxis": {
        "type": "category",
        "axisLabel": {
          "color": "#666666"
        },
        "axisLine": {
          "lineStyle": {
            "color": "#CCCCCC"
          }
        },
        "boundaryGap": true,
        "data": []
      },
      "yAxis": {
        "type": "value",
        "axisTick": {
          "show": false
        },
        "axisLabel": {
          "color": "#666666"
        },
        "axisLine": {
          "lineStyle": {
            "color": "#CCCCCC"
          }
        }
      },
      "seriesTemplate": {
        "name": "",
        "type": "line",
        "data": [],
        "barwidth": 20,
        "label": {
          "show": true,
          "color": "#666666",
          "position": "top"
        }
      }
    },
    "area": {
      "color": color,
      "title": {
        "text": ""
      },
      "tooltip": {
        "trigger": "axis"
      },
      "grid": {
        "top": 30,
        "bottom": 50,
        "right": 15,
        "left": 40
      },
      "legend": {
        "bottom": "left"
      },
      "toolbox": {
        "show": false
      },
      "xAxis": {
        "type": "category",
        "axisLabel": {
          "color": "#666666"
        },
        "axisLine": {
          "lineStyle": {
            "color": "#CCCCCC"
          }
        },
        "boundaryGap": true,
        "data": []
      },
      "yAxis": {
        "type": "value",
        "axisTick": {
          "show": false
        },
        "axisLabel": {
          "color": "#666666"
        },
        "axisLine": {
          "lineStyle": {
            "color": "#CCCCCC"
          }
        }
      },
      "seriesTemplate": {
        "name": "",
        "type": "line",
        "data": [],
        "areaStyle": {},
        "label": {
          "show": true,
          "color": "#666666",
          "position": "top"
        }
      }
    },
    "pie": {
      "color": color,
      "title": {
        "text": ""
      },
      "tooltip": {
        "trigger": "item"
      },
      "grid": {
        "top": 40,
        "bottom": 30,
        "right": 15,
        "left": 15
      },
      "legend": {
        "bottom": "left"
      },
      "seriesTemplate": {
        "name": "",
        "type": "pie",
        "data": [],
        "radius": "50%",
        "label": {
          "show": true,
          "color": "#666666",
          "position": "top"
        }
      }
    },
    "ring": {
      "color": color,
      "title": {
        "text": ""
      },
      "tooltip": {
        "trigger": "item"
      },
      "grid": {
        "top": 40,
        "bottom": 30,
        "right": 15,
        "left": 15
      },
      "legend": {
        "bottom": "left"
      },
      "seriesTemplate": {
        "name": "",
        "type": "pie",
        "data": [],
        "radius": ["40%", "70%"],
        "avoidLabelOverlap": false,
        "label": {
          "show": true,
          "color": "#666666",
          "position": "top"
        },
        "labelLine": {
          "show": true
        }
      }
    },
    "rose": {
      "color": color,
      "title": {
        "text": ""
      },
      "tooltip": {
        "trigger": "item"
      },
      "legend": {
        "top": "bottom"
      },
      "seriesTemplate": {
        "name": "",
        "type": "pie",
        "data": [],
        "radius": "55%",
        "center": ["50%", "50%"],
        "roseType": "area"
      }
    },
    "funnel": {
      "color": color,
      "title": {
        "text": ""
      },
      "tooltip": {
        "trigger": "item",
        "formatter": "{b} : {c}%"
      },
      "legend": {
        "top": "bottom"
      },
      "seriesTemplate": {
        "name": "",
        "type": "funnel",
        "left": "10%",
        "top": 60,
        "bottom": 60,
        "width": "80%",
        "min": 0,
        "max": 100,
        "minSize": "0%",
        "maxSize": "100%",
        "sort": "descending",
        "gap": 2,
        "label": {
          "show": true,
          "position": "inside"
        },
        "labelLine": {
          "length": 10,
          "lineStyle": {
            "width": 1,
            "type": "solid"
          }
        },
        "itemStyle": {
          "bordercolor": "#fff",
          "borderwidth": 1
        },
        "emphasis": {
          "label": {
            "fontSize": 20
          }
        },
        "data": []
      }
    },
    "gauge": {
      "color": color,
      "tooltip": {
        "formatter": "{a} <br/>{b} : {c}%"
      },
      "seriesTemplate": {
        "name": "业务指标",
        "type": "gauge",
        "detail": { "formatter": "{value}%" },
        "data": [{ "value": 50, "name": "完成率" }]
      }
    },
    "candle": {
      "xAxis": {
        "data": []
      },
      "yAxis": {},
      "color": color,
      "title": {
        "text": ""
      },
      "dataZoom": [
        {
          "type": "inside",
          "xAxisIndex": [0, 1],
          "start": 10,
          "end": 100
        },
        {
          "show": true,
          "xAxisIndex": [0, 1],
          "type": "slider",
          "bottom": 10,
          "start": 10,
          "end": 100
        }
      ],
      "seriesTemplate": {
        "name": "",
        "type": "k",
        "data": []
      }
    }
  };
  const block0 = (Comp) => {
    (Comp.$renderjs || (Comp.$renderjs = [])).push("rdcharts");
    (Comp.$renderjsModules || (Comp.$renderjsModules = {}))["rdcharts"] = "f9cb76fc";
  };
  function deepCloneAssign(origin = {}, ...args) {
    for (let i2 in args) {
      for (let key in args[i2]) {
        if (args[i2].hasOwnProperty(key)) {
          origin[key] = args[i2][key] && typeof args[i2][key] === "object" ? deepCloneAssign(Array.isArray(args[i2][key]) ? [] : {}, origin[key], args[i2][key]) : args[i2][key];
        }
      }
    }
    return origin;
  }
  function formatterAssign(args, formatter) {
    for (let key in args) {
      if (args.hasOwnProperty(key) && args[key] !== null && typeof args[key] === "object") {
        formatterAssign(args[key], formatter);
      } else if (key === "format" && typeof args[key] === "string") {
        args["formatter"] = formatter[args[key]] ? formatter[args[key]] : void 0;
      }
    }
    return args;
  }
  function getFormatDate(date) {
    var seperator = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = year + seperator + month + seperator + strDate;
    return currentdate;
  }
  const _sfc_main$j = {
    name: "qiun-data-charts",
    mixins: [nr.mixinDatacom],
    props: {
      type: {
        type: String,
        default: null
      },
      canvasId: {
        type: String,
        default: "uchartsid"
      },
      canvas2d: {
        type: Boolean,
        default: false
      },
      background: {
        type: String,
        default: "rgba(0,0,0,0)"
      },
      animation: {
        type: Boolean,
        default: true
      },
      chartData: {
        type: Object,
        default() {
          return {
            categories: [],
            series: []
          };
        }
      },
      opts: {
        type: Object,
        default() {
          return {};
        }
      },
      eopts: {
        type: Object,
        default() {
          return {};
        }
      },
      loadingType: {
        type: Number,
        default: 2
      },
      errorShow: {
        type: Boolean,
        default: true
      },
      errorReload: {
        type: Boolean,
        default: true
      },
      errorMessage: {
        type: String,
        default: null
      },
      inScrollView: {
        type: Boolean,
        default: false
      },
      reshow: {
        type: Boolean,
        default: false
      },
      reload: {
        type: Boolean,
        default: false
      },
      disableScroll: {
        type: Boolean,
        default: false
      },
      optsWatch: {
        type: Boolean,
        default: true
      },
      onzoom: {
        type: Boolean,
        default: false
      },
      ontap: {
        type: Boolean,
        default: true
      },
      ontouch: {
        type: Boolean,
        default: false
      },
      onmouse: {
        type: Boolean,
        default: true
      },
      onmovetip: {
        type: Boolean,
        default: false
      },
      echartsH5: {
        type: Boolean,
        default: false
      },
      echartsApp: {
        type: Boolean,
        default: false
      },
      tooltipShow: {
        type: Boolean,
        default: true
      },
      tooltipFormat: {
        type: String,
        default: void 0
      },
      tooltipCustom: {
        type: Object,
        default: void 0
      },
      startDate: {
        type: String,
        default: void 0
      },
      endDate: {
        type: String,
        default: void 0
      },
      textEnum: {
        type: Array,
        default() {
          return [];
        }
      },
      groupEnum: {
        type: Array,
        default() {
          return [];
        }
      },
      pageScrollTop: {
        type: Number,
        default: 0
      },
      directory: {
        type: String,
        default: "/"
      },
      tapLegend: {
        type: Boolean,
        default: true
      },
      menus: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    data() {
      return {
        cid: "uchartsid",
        inWx: false,
        inAli: false,
        inTt: false,
        inBd: false,
        inH5: false,
        inApp: false,
        inWin: false,
        type2d: true,
        disScroll: false,
        openmouse: false,
        pixel: 1,
        cWidth: 375,
        cHeight: 250,
        showchart: false,
        echarts: false,
        echartsResize: {
          state: false
        },
        uchartsOpts: {},
        echartsOpts: {},
        drawData: {},
        lastDrawTime: null
      };
    },
    created() {
      this.cid = this.canvasId;
      if (this.canvasId == "uchartsid" || this.canvasId == "") {
        let t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let len = t2.length;
        let id = "";
        for (let i2 = 0; i2 < 32; i2++) {
          id += t2.charAt(Math.floor(Math.random() * len));
        }
        this.cid = id;
      }
      const systemInfo = uni.getSystemInfoSync();
      if (systemInfo.platform === "windows" || systemInfo.platform === "mac") {
        this.inWin = true;
      }
      this.type2d = false;
      this.disScroll = this.disableScroll;
    },
    mounted() {
      this.inApp = true;
      if (this.echartsApp === true) {
        this.echarts = true;
        this.openmouse = false;
      }
      this.$nextTick(() => {
        this.beforeInit();
      });
    },
    destroyed() {
      if (this.echarts === true) {
        delete cfe.option[this.cid];
        delete cfe.instance[this.cid];
      } else {
        delete cfu.option[this.cid];
        delete cfu.instance[this.cid];
      }
      uni.offWindowResize(() => {
      });
    },
    watch: {
      chartDataProps: {
        handler(val, oldval) {
          if (typeof val === "object") {
            if (JSON.stringify(val) !== JSON.stringify(oldval)) {
              this._clearChart();
              if (val.series && val.series.length > 0) {
                this.beforeInit();
              } else {
                this.mixinDatacomLoading = true;
                this.showchart = false;
                this.mixinDatacomErrorMessage = null;
              }
            }
          } else {
            this.mixinDatacomLoading = false;
            this._clearChart();
            this.showchart = false;
            this.mixinDatacomErrorMessage = "参数错误：chartData数据类型错误";
          }
        },
        immediate: false,
        deep: true
      },
      localdata: {
        handler(val, oldval) {
          if (JSON.stringify(val) !== JSON.stringify(oldval)) {
            if (val.length > 0) {
              this.beforeInit();
            } else {
              this.mixinDatacomLoading = true;
              this._clearChart();
              this.showchart = false;
              this.mixinDatacomErrorMessage = null;
            }
          }
        },
        immediate: false,
        deep: true
      },
      optsProps: {
        handler(val, oldval) {
          if (typeof val === "object") {
            if (JSON.stringify(val) !== JSON.stringify(oldval) && this.echarts === false && this.optsWatch == true) {
              this.checkData(this.drawData);
            }
          } else {
            this.mixinDatacomLoading = false;
            this._clearChart();
            this.showchart = false;
            this.mixinDatacomErrorMessage = "参数错误：opts数据类型错误";
          }
        },
        immediate: false,
        deep: true
      },
      eoptsProps: {
        handler(val, oldval) {
          if (typeof val === "object") {
            if (JSON.stringify(val) !== JSON.stringify(oldval) && this.echarts === true) {
              this.checkData(this.drawData);
            }
          } else {
            this.mixinDatacomLoading = false;
            this.showchart = false;
            this.mixinDatacomErrorMessage = "参数错误：eopts数据类型错误";
          }
        },
        immediate: false,
        deep: true
      },
      reshow(val, oldval) {
        if (val === true && this.mixinDatacomLoading === false) {
          setTimeout(() => {
            this.mixinDatacomErrorMessage = null;
            this.echartsResize.state = !this.echartsResize.state;
            this.checkData(this.drawData);
          }, 200);
        }
      },
      reload(val, oldval) {
        if (val === true) {
          this.showchart = false;
          this.mixinDatacomErrorMessage = null;
          this.reloading();
        }
      },
      mixinDatacomErrorMessage(val, oldval) {
        if (val) {
          this.emitMsg({ name: "error", params: { type: "error", errorShow: this.errorShow, msg: val, id: this.cid } });
          if (this.errorShow) {
            formatAppLog("log", "at uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue:611", "[秋云图表组件]" + val);
          }
        }
      },
      errorMessage(val, oldval) {
        if (val && this.errorShow && val !== null && val !== "null" && val !== "") {
          this.showchart = false;
          this.mixinDatacomLoading = false;
          this.mixinDatacomErrorMessage = val;
        } else {
          this.showchart = false;
          this.mixinDatacomErrorMessage = null;
          this.reloading();
        }
      }
    },
    computed: {
      optsProps() {
        return JSON.parse(JSON.stringify(this.opts));
      },
      eoptsProps() {
        return JSON.parse(JSON.stringify(this.eopts));
      },
      chartDataProps() {
        return JSON.parse(JSON.stringify(this.chartData));
      }
    },
    methods: {
      beforeInit() {
        this.mixinDatacomErrorMessage = null;
        if (typeof this.chartData === "object" && this.chartData != null && this.chartData.series !== void 0 && this.chartData.series.length > 0) {
          this.drawData = deepCloneAssign({}, this.chartData);
          this.mixinDatacomLoading = false;
          this.showchart = true;
          this.checkData(this.chartData);
        } else if (this.localdata.length > 0) {
          this.mixinDatacomLoading = false;
          this.showchart = true;
          this.localdataInit(this.localdata);
        } else if (this.collection !== "") {
          this.mixinDatacomLoading = false;
          this.getCloudData();
        } else {
          this.mixinDatacomLoading = true;
        }
      },
      localdataInit(resdata) {
        if (this.groupEnum.length > 0) {
          for (let i2 = 0; i2 < resdata.length; i2++) {
            for (let j2 = 0; j2 < this.groupEnum.length; j2++) {
              if (resdata[i2].group === this.groupEnum[j2].value) {
                resdata[i2].group = this.groupEnum[j2].text;
              }
            }
          }
        }
        if (this.textEnum.length > 0) {
          for (let i2 = 0; i2 < resdata.length; i2++) {
            for (let j2 = 0; j2 < this.textEnum.length; j2++) {
              if (resdata[i2].text === this.textEnum[j2].value) {
                resdata[i2].text = this.textEnum[j2].text;
              }
            }
          }
        }
        let needCategories = false;
        let tmpData = { categories: [], series: [] };
        let tmpcategories = [];
        let tmpseries = [];
        if (this.echarts === true) {
          needCategories = cfe.categories.includes(this.type);
        } else {
          needCategories = cfu.categories.includes(this.type);
        }
        if (needCategories === true) {
          if (this.chartData && this.chartData.categories && this.chartData.categories.length > 0) {
            tmpcategories = this.chartData.categories;
          } else {
            if (this.startDate && this.endDate) {
              let idate = new Date(this.startDate);
              let edate = new Date(this.endDate);
              while (idate <= edate) {
                tmpcategories.push(getFormatDate(idate));
                idate = idate.setDate(idate.getDate() + 1);
                idate = new Date(idate);
              }
            } else {
              let tempckey = {};
              resdata.map(function(item, index) {
                if (item.text != void 0 && !tempckey[item.text]) {
                  tmpcategories.push(item.text);
                  tempckey[item.text] = true;
                }
              });
            }
          }
          tmpData.categories = tmpcategories;
        }
        let tempskey = {};
        resdata.map(function(item, index) {
          if (item.group != void 0 && !tempskey[item.group]) {
            tmpseries.push({ name: item.group, data: [] });
            tempskey[item.group] = true;
          }
        });
        if (tmpseries.length == 0) {
          tmpseries = [{ name: "默认分组", data: [] }];
          if (needCategories === true) {
            for (let j2 = 0; j2 < tmpcategories.length; j2++) {
              let seriesdata = 0;
              for (let i2 = 0; i2 < resdata.length; i2++) {
                if (resdata[i2].text == tmpcategories[j2]) {
                  seriesdata = resdata[i2].value;
                }
              }
              tmpseries[0].data.push(seriesdata);
            }
          } else {
            for (let i2 = 0; i2 < resdata.length; i2++) {
              tmpseries[0].data.push({ "name": resdata[i2].text, "value": resdata[i2].value });
            }
          }
        } else {
          for (let k = 0; k < tmpseries.length; k++) {
            if (tmpcategories.length > 0) {
              for (let j2 = 0; j2 < tmpcategories.length; j2++) {
                let seriesdata = 0;
                for (let i2 = 0; i2 < resdata.length; i2++) {
                  if (tmpseries[k].name == resdata[i2].group && resdata[i2].text == tmpcategories[j2]) {
                    seriesdata = resdata[i2].value;
                  }
                }
                tmpseries[k].data.push(seriesdata);
              }
            } else {
              for (let i2 = 0; i2 < resdata.length; i2++) {
                if (tmpseries[k].name == resdata[i2].group) {
                  tmpseries[k].data.push(resdata[i2].value);
                }
              }
            }
          }
        }
        tmpData.series = tmpseries;
        this.drawData = deepCloneAssign({}, tmpData);
        this.checkData(tmpData);
      },
      reloading() {
        if (this.errorReload === false) {
          return;
        }
        this.showchart = false;
        this.mixinDatacomErrorMessage = null;
        if (this.collection !== "") {
          this.mixinDatacomLoading = false;
          this.onMixinDatacomPropsChange(true);
        } else {
          this.beforeInit();
        }
      },
      checkData(anyData) {
        let cid = this.cid;
        if (this.echarts === true) {
          cfe.option[cid] = deepCloneAssign({}, this.eopts);
          cfe.option[cid].id = cid;
          cfe.option[cid].type = this.type;
        } else {
          if (this.type && cfu.type.includes(this.type)) {
            cfu.option[cid] = deepCloneAssign({}, cfu[this.type], this.opts);
            cfu.option[cid].canvasId = cid;
          } else {
            this.mixinDatacomLoading = false;
            this.showchart = false;
            this.mixinDatacomErrorMessage = "参数错误：props参数中type类型不正确";
          }
        }
        let newData = deepCloneAssign({}, anyData);
        if (newData.series !== void 0 && newData.series.length > 0) {
          this.mixinDatacomErrorMessage = null;
          if (this.echarts === true) {
            cfe.option[cid].chartData = newData;
            this.$nextTick(() => {
              this.init();
            });
          } else {
            cfu.option[cid].categories = newData.categories;
            cfu.option[cid].series = newData.series;
            this.$nextTick(() => {
              this.init();
            });
          }
        }
      },
      resizeHandler() {
        let currTime = Date.now();
        let lastDrawTime = this.lastDrawTime ? this.lastDrawTime : currTime - 3e3;
        let duration = currTime - lastDrawTime;
        if (duration < 1e3)
          return;
        uni.createSelectorQuery().in(this).select("#ChartBoxId" + this.cid).boundingClientRect((data) => {
          this.showchart = true;
          if (data.width > 0 && data.height > 0) {
            if (data.width !== this.cWidth || data.height !== this.cHeight) {
              this.checkData(this.drawData);
            }
          }
        }).exec();
      },
      getCloudData() {
        if (this.mixinDatacomLoading == true) {
          return;
        }
        this.mixinDatacomLoading = true;
        this.mixinDatacomGet().then((res) => {
          this.mixinDatacomResData = res.result.data;
          this.localdataInit(this.mixinDatacomResData);
        }).catch((err) => {
          this.mixinDatacomLoading = false;
          this.showchart = false;
          this.mixinDatacomErrorMessage = "请求错误：" + err;
        });
      },
      onMixinDatacomPropsChange(needReset, changed) {
        if (needReset == true && this.collection !== "") {
          this.showchart = false;
          this.mixinDatacomErrorMessage = null;
          this._clearChart();
          this.getCloudData();
        }
      },
      _clearChart() {
        let cid = this.cid;
        if (this.echarts !== true && cfu.option[cid] && cfu.option[cid].context) {
          const ctx = cfu.option[cid].context;
          if (typeof ctx === "object" && !!!cfu.option[cid].update) {
            ctx.clearRect(0, 0, this.cWidth * this.pixel, this.cHeight * this.pixel);
            ctx.draw();
          }
        }
      },
      init() {
        let cid = this.cid;
        uni.createSelectorQuery().in(this).select("#ChartBoxId" + cid).boundingClientRect((data) => {
          if (data.width > 0 && data.height > 0) {
            this.mixinDatacomLoading = false;
            this.showchart = true;
            this.lastDrawTime = Date.now();
            this.cWidth = data.width;
            this.cHeight = data.height;
            if (this.echarts !== true) {
              cfu.option[cid].background = this.background == "rgba(0,0,0,0)" ? "#FFFFFF" : this.background;
              cfu.option[cid].canvas2d = this.type2d;
              cfu.option[cid].pixelRatio = this.pixel;
              cfu.option[cid].animation = this.animation;
              cfu.option[cid].width = data.width * this.pixel;
              cfu.option[cid].height = data.height * this.pixel;
              cfu.option[cid].onzoom = this.onzoom;
              cfu.option[cid].ontap = this.ontap;
              cfu.option[cid].ontouch = this.ontouch;
              cfu.option[cid].onmouse = this.openmouse;
              cfu.option[cid].onmovetip = this.onmovetip;
              cfu.option[cid].tooltipShow = this.tooltipShow;
              cfu.option[cid].tooltipFormat = this.tooltipFormat;
              cfu.option[cid].tooltipCustom = this.tooltipCustom;
              cfu.option[cid].inScrollView = this.inScrollView;
              cfu.option[cid].lastDrawTime = this.lastDrawTime;
              cfu.option[cid].tapLegend = this.tapLegend;
            }
            if (this.inH5 || this.inApp) {
              if (this.echarts == true) {
                cfe.option[cid].ontap = this.ontap;
                cfe.option[cid].onmouse = this.openmouse;
                cfe.option[cid].tooltipShow = this.tooltipShow;
                cfe.option[cid].tooltipFormat = this.tooltipFormat;
                cfe.option[cid].tooltipCustom = this.tooltipCustom;
                cfe.option[cid].lastDrawTime = this.lastDrawTime;
                this.echartsOpts = deepCloneAssign({}, cfe.option[cid]);
              } else {
                cfu.option[cid].rotateLock = cfu.option[cid].rotate;
                this.uchartsOpts = deepCloneAssign({}, cfu.option[cid]);
              }
            } else {
              cfu.option[cid] = formatterAssign(cfu.option[cid], cfu.formatter);
              this.mixinDatacomErrorMessage = null;
              this.mixinDatacomLoading = false;
              this.showchart = true;
              this.$nextTick(() => {
                if (this.type2d === true) {
                  const query = uni.createSelectorQuery().in(this);
                  query.select("#" + cid).fields({ node: true, size: true }).exec((res) => {
                    if (res[0]) {
                      const canvas = res[0].node;
                      const ctx = canvas.getContext("2d");
                      cfu.option[cid].context = ctx;
                      cfu.option[cid].rotateLock = cfu.option[cid].rotate;
                      if (cfu.instance[cid] && cfu.option[cid] && cfu.option[cid].update === true) {
                        this._updataUChart(cid);
                      } else {
                        canvas.width = data.width * this.pixel;
                        canvas.height = data.height * this.pixel;
                        canvas._width = data.width * this.pixel;
                        canvas._height = data.height * this.pixel;
                        setTimeout(() => {
                          cfu.option[cid].context.restore();
                          cfu.option[cid].context.save();
                          this._newChart(cid);
                        }, 100);
                      }
                    } else {
                      this.showchart = false;
                      this.mixinDatacomErrorMessage = "参数错误：开启2d模式后，未获取到dom节点，canvas-id:" + cid;
                    }
                  });
                } else {
                  if (this.inAli) {
                    cfu.option[cid].rotateLock = cfu.option[cid].rotate;
                  }
                  cfu.option[cid].context = uni.createCanvasContext(cid, this);
                  if (cfu.instance[cid] && cfu.option[cid] && cfu.option[cid].update === true) {
                    this._updataUChart(cid);
                  } else {
                    setTimeout(() => {
                      cfu.option[cid].context.restore();
                      cfu.option[cid].context.save();
                      this._newChart(cid);
                    }, 100);
                  }
                }
              });
            }
          } else {
            this.mixinDatacomLoading = false;
            this.showchart = false;
            if (this.reshow == true) {
              this.mixinDatacomErrorMessage = "布局错误：未获取到父元素宽高尺寸！canvas-id:" + cid;
            }
          }
        }).exec();
      },
      saveImage() {
        uni.canvasToTempFilePath({
          canvasId: this.cid,
          success: (res) => {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function() {
                uni.showToast({
                  title: "保存成功",
                  duration: 2e3
                });
              }
            });
          }
        }, this);
      },
      getImage() {
        if (this.type2d == false) {
          uni.canvasToTempFilePath({
            canvasId: this.cid,
            success: (res) => {
              this.emitMsg({ name: "getImage", params: { type: "getImage", base64: res.tempFilePath } });
            }
          }, this);
        } else {
          const query = uni.createSelectorQuery().in(this);
          query.select("#" + this.cid).fields({ node: true, size: true }).exec((res) => {
            if (res[0]) {
              const canvas = res[0].node;
              this.emitMsg({ name: "getImage", params: { type: "getImage", base64: canvas.toDataURL("image/png") } });
            }
          });
        }
      },
      _error(e2) {
        this.mixinDatacomErrorMessage = e2.detail.errMsg;
      },
      emitMsg(msg) {
        this.$emit(msg.name, msg.params);
      },
      getRenderType() {
        if (this.echarts === true && this.mixinDatacomLoading === false) {
          this.beforeInit();
        }
      },
      toJSON() {
        return this;
      }
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_qiun_loading = resolveEasycom(vue.resolveDynamicComponent("qiun-loading"), __easycom_0$3);
    const _component_qiun_error = resolveEasycom(vue.resolveDynamicComponent("qiun-error"), __easycom_1$1);
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "chartsview",
      id: "ChartBoxId" + $data.cid
    }, [
      _ctx.mixinDatacomLoading ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
        vue.createCommentVNode(" 自定义加载状态，请改这里 "),
        vue.createVNode(_component_qiun_loading, { loadingType: $props.loadingType }, null, 8, ["loadingType"])
      ])) : vue.createCommentVNode("v-if", true),
      _ctx.mixinDatacomErrorMessage && $props.errorShow ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        onClick: _cache[0] || (_cache[0] = (...args) => $options.reloading && $options.reloading(...args))
      }, [
        vue.createCommentVNode(" 自定义错误提示，请改这里 "),
        vue.createVNode(_component_qiun_error, { errorMessage: $props.errorMessage }, null, 8, ["errorMessage"])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" APP和H5采用renderjs渲染图表 "),
      $data.echarts ? vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        style: vue.normalizeStyle([{ background: $props.background }, { "width": "100%", "height": "100%" }]),
        "data-directory": $props.directory,
        id: "EC" + $data.cid,
        prop: vue.wp($data.echartsOpts),
        "change:prop": _ctx.rdcharts.ecinit,
        resize: vue.wp($data.echartsResize),
        "change:resize": _ctx.rdcharts.ecresize
      }, null, 12, ["data-directory", "id", "prop", "change:prop", "resize", "change:resize"])), [
        [vue.vShow, $data.showchart]
      ]) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        onClick: _cache[2] || (_cache[2] = (...args) => _ctx.rdcharts.tap && _ctx.rdcharts.tap(...args)),
        onMousemove: _cache[3] || (_cache[3] = (...args) => _ctx.rdcharts.mouseMove && _ctx.rdcharts.mouseMove(...args)),
        onMousedown: _cache[4] || (_cache[4] = (...args) => _ctx.rdcharts.mouseDown && _ctx.rdcharts.mouseDown(...args)),
        onMouseup: _cache[5] || (_cache[5] = (...args) => _ctx.rdcharts.mouseUp && _ctx.rdcharts.mouseUp(...args)),
        onTouchstart: _cache[6] || (_cache[6] = (...args) => _ctx.rdcharts.touchStart && _ctx.rdcharts.touchStart(...args)),
        onTouchmove: _cache[7] || (_cache[7] = (...args) => _ctx.rdcharts.touchMove && _ctx.rdcharts.touchMove(...args)),
        onTouchend: _cache[8] || (_cache[8] = (...args) => _ctx.rdcharts.touchEnd && _ctx.rdcharts.touchEnd(...args)),
        id: "UC" + $data.cid,
        prop: vue.wp($data.uchartsOpts),
        "change:prop": _ctx.rdcharts.ucinit
      }, [
        vue.withDirectives(vue.createElementVNode("canvas", {
          id: $data.cid,
          canvasId: $data.cid,
          style: vue.normalizeStyle({ width: $data.cWidth + "px", height: $data.cHeight + "px", background: $props.background }),
          "disable-scroll": $props.disableScroll,
          onError: _cache[1] || (_cache[1] = (...args) => $options._error && $options._error(...args))
        }, null, 44, ["id", "canvasId", "disable-scroll"]), [
          [vue.vShow, $data.showchart]
        ])
      ], 40, ["id", "prop", "change:prop"])),
      vue.createCommentVNode(" 支付宝小程序 "),
      vue.createCommentVNode(" 其他小程序通过vue渲染图表 ")
    ], 8, ["id"]);
  }
  if (typeof block0 === "function")
    block0(_sfc_main$j);
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-0ca34aee"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue"]]);
  const _sfc_main$i = {
    data() {
      return {
        chartData: {}
      };
    },
    onReady() {
      this.getServerData();
    },
    methods: {
      getServerData() {
        setTimeout(() => {
          let res = {
            categories: ["2016", "2017", "2018", "2019", "2020", "2021"],
            series: [
              {
                name: "目标值",
                data: [35, 36, 31, 33, 13, 34]
              },
              {
                name: "完成量",
                data: [18, 27, 21, 24, 6, 28]
              }
            ]
          };
          this.chartData = JSON.parse(JSON.stringify(res));
        }, 500);
      }
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_qiun_data_charts = resolveEasycom(vue.resolveDynamicComponent("qiun-data-charts"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "charts-box" }, [
      vue.createVNode(_component_qiun_data_charts, {
        type: "column",
        chartData: $data.chartData
      }, null, 8, ["chartData"])
    ]);
  }
  const PagesReportsReports = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-704a5d1f"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/reports/reports.vue"]]);
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$h = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v2) => v2.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-d31e1c47"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  const _sfc_main$g = {
    name: "uniCollapseItem",
    props: {
      // 列表标题
      title: {
        type: String,
        default: ""
      },
      name: {
        type: [Number, String],
        default: ""
      },
      // 是否禁用
      disabled: {
        type: Boolean,
        default: false
      },
      // 是否显示动画,app 端默认不开启动画，卡顿严重
      showAnimation: {
        type: Boolean,
        default: false
      },
      // 是否展开
      open: {
        type: Boolean,
        default: false
      },
      // 缩略图
      thumb: {
        type: String,
        default: ""
      },
      // 标题分隔线显示类型
      titleBorder: {
        type: String,
        default: "auto"
      },
      border: {
        type: Boolean,
        default: true
      },
      showArrow: {
        type: Boolean,
        default: true
      }
    },
    data() {
      const elId = `Uni_${Math.ceil(Math.random() * 1e6).toString(36)}`;
      return {
        isOpen: false,
        isheight: null,
        height: 0,
        elId,
        nameSync: 0
      };
    },
    watch: {
      open(val) {
        this.isOpen = val;
        this.onClick(val, "init");
      }
    },
    updated(e2) {
      this.$nextTick(() => {
        this.init(true);
      });
    },
    created() {
      this.collapse = this.getCollapse();
      this.oldHeight = 0;
      this.onClick(this.open, "init");
    },
    // TODO vue3
    unmounted() {
      this.__isUnmounted = true;
      this.uninstall();
    },
    mounted() {
      if (!this.collapse)
        return;
      if (this.name !== "") {
        this.nameSync = this.name;
      } else {
        this.nameSync = this.collapse.childrens.length + "";
      }
      if (this.collapse.names.indexOf(this.nameSync) === -1) {
        this.collapse.names.push(this.nameSync);
      } else {
        formatAppLog("warn", "at uni_modules/uni-collapse/components/uni-collapse-item/uni-collapse-item.vue:154", `name 值 ${this.nameSync} 重复`);
      }
      if (this.collapse.childrens.indexOf(this) === -1) {
        this.collapse.childrens.push(this);
      }
      this.init();
    },
    methods: {
      init(type) {
        this.getCollapseHeight(type);
      },
      uninstall() {
        if (this.collapse) {
          this.collapse.childrens.forEach((item, index) => {
            if (item === this) {
              this.collapse.childrens.splice(index, 1);
            }
          });
          this.collapse.names.forEach((item, index) => {
            if (item === this.nameSync) {
              this.collapse.names.splice(index, 1);
            }
          });
        }
      },
      onClick(isOpen, type) {
        if (this.disabled)
          return;
        this.isOpen = isOpen;
        if (this.isOpen && this.collapse) {
          this.collapse.setAccordion(this);
        }
        if (type !== "init") {
          this.collapse.onChange(isOpen, this);
        }
      },
      getCollapseHeight(type, index = 0) {
        const views = uni.createSelectorQuery().in(this);
        views.select(`#${this.elId}`).fields({
          size: true
        }, (data) => {
          if (index >= 10)
            return;
          if (!data) {
            index++;
            this.getCollapseHeight(false, index);
            return;
          }
          this.height = data.height;
          this.isheight = true;
          if (type)
            return;
          this.onClick(this.isOpen, "init");
        }).exec();
      },
      getNvueHwight(type) {
        dom.getComponentRect(this.$refs["collapse--hook"], (option) => {
          if (option && option.result && option.size) {
            this.height = option.size.height;
            this.isheight = true;
            if (type)
              return;
            this.onClick(this.open, "init");
          }
        });
      },
      /**
       * 获取父元素实例
       */
      getCollapse(name = "uniCollapse") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-collapse-item" }, [
      vue.createCommentVNode(" onClick(!isOpen) "),
      vue.createElementVNode(
        "view",
        {
          onClick: _cache[0] || (_cache[0] = ($event) => $options.onClick(!$data.isOpen)),
          class: vue.normalizeClass(["uni-collapse-item__title", { "is-open": $data.isOpen && $props.titleBorder === "auto", "uni-collapse-item-border": $props.titleBorder !== "none" }])
        },
        [
          vue.createElementVNode("view", { class: "uni-collapse-item__title-wrap" }, [
            vue.renderSlot(_ctx.$slots, "title", {}, () => [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["uni-collapse-item__title-box", { "is-disabled": $props.disabled }])
                },
                [
                  $props.thumb ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: $props.thumb,
                    class: "uni-collapse-item__title-img"
                  }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode(
                    "text",
                    { class: "uni-collapse-item__title-text" },
                    vue.toDisplayString($props.title),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ], true)
          ]),
          $props.showArrow ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 0,
              class: vue.normalizeClass([{ "uni-collapse-item__title-arrow-active": $data.isOpen, "uni-collapse-item--animation": $props.showAnimation === true }, "uni-collapse-item__title-arrow"])
            },
            [
              vue.createVNode(_component_uni_icons, {
                color: $props.disabled ? "#ddd" : "#bbb",
                size: "14",
                type: "bottom"
              }, null, 8, ["color"])
            ],
            2
            /* CLASS */
          )) : vue.createCommentVNode("v-if", true)
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["uni-collapse-item__wrap", { "is--transition": $props.showAnimation }]),
          style: vue.normalizeStyle({ height: ($data.isOpen ? $data.height : 0) + "px" })
        },
        [
          vue.createElementVNode("view", {
            id: $data.elId,
            ref: "collapse--hook",
            class: vue.normalizeClass(["uni-collapse-item__wrap-content", { open: $data.isheight, "uni-collapse-item--border": $props.border && $data.isOpen }])
          }, [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ], 10, ["id"])
        ],
        6
        /* CLASS, STYLE */
      )
    ]);
  }
  const __easycom_2$1 = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-3d2dde9f"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-collapse/components/uni-collapse-item/uni-collapse-item.vue"]]);
  const _sfc_main$f = {
    name: "uniCollapse",
    emits: ["change", "activeItem", "input", "update:modelValue"],
    props: {
      value: {
        type: [String, Array],
        default: ""
      },
      modelValue: {
        type: [String, Array],
        default: ""
      },
      accordion: {
        // 是否开启手风琴效果
        type: [Boolean, String],
        default: false
      }
    },
    data() {
      return {};
    },
    computed: {
      // TODO 兼容 vue2 和 vue3
      dataValue() {
        let value = typeof this.value === "string" && this.value === "" || Array.isArray(this.value) && this.value.length === 0;
        let modelValue = typeof this.modelValue === "string" && this.modelValue === "" || Array.isArray(this.modelValue) && this.modelValue.length === 0;
        if (value) {
          return this.modelValue;
        }
        if (modelValue) {
          return this.value;
        }
        return this.value;
      }
    },
    watch: {
      dataValue(val) {
        this.setOpen(val);
      }
    },
    created() {
      this.childrens = [];
      this.names = [];
    },
    mounted() {
      this.$nextTick(() => {
        this.setOpen(this.dataValue);
      });
    },
    methods: {
      setOpen(val) {
        let str = typeof val === "string";
        let arr = Array.isArray(val);
        this.childrens.forEach((vm, index) => {
          if (str) {
            if (val === vm.nameSync) {
              if (!this.accordion) {
                formatAppLog("warn", "at uni_modules/uni-collapse/components/uni-collapse/uni-collapse.vue:75", "accordion 属性为 false ,v-model 类型应该为 array");
                return;
              }
              vm.isOpen = true;
            }
          }
          if (arr) {
            val.forEach((v2) => {
              if (v2 === vm.nameSync) {
                if (this.accordion) {
                  formatAppLog("warn", "at uni_modules/uni-collapse/components/uni-collapse/uni-collapse.vue:85", "accordion 属性为 true ,v-model 类型应该为 string");
                  return;
                }
                vm.isOpen = true;
              }
            });
          }
        });
        this.emit(val);
      },
      setAccordion(self2) {
        if (!this.accordion)
          return;
        this.childrens.forEach((vm, index) => {
          if (self2 !== vm) {
            vm.isOpen = false;
          }
        });
      },
      resize() {
        this.childrens.forEach((vm, index) => {
          vm.getCollapseHeight();
        });
      },
      onChange(isOpen, self2) {
        let activeItem = [];
        if (this.accordion) {
          activeItem = isOpen ? self2.nameSync : "";
        } else {
          this.childrens.forEach((vm, index) => {
            if (vm.isOpen) {
              activeItem.push(vm.nameSync);
            }
          });
        }
        this.$emit("change", activeItem);
        this.emit(activeItem);
      },
      emit(val) {
        this.$emit("input", val);
        this.$emit("update:modelValue", val);
      }
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-collapse" }, [
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
    ]);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-3f050360"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-collapse/components/uni-collapse/uni-collapse.vue"]]);
  const _sfc_main$e = {
    __name: "settle-account-flow",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const swipeAction = vue.ref();
      const handleClick = () => {
        uni.navigateTo({
          url: `/pages/settle-account/create-flow?account_id=${account_id.value}`
        });
      };
      const items = vue.reactive([]);
      const value = vue.ref();
      const account_id = vue.ref(0);
      onLoad((options) => {
        account_id.value = options.account_id;
      });
      onShow(async () => {
        const result = await dbService2.getTallyBill(account_id.value);
        const categoryResult = await dbService2.getTallyCategory();
        const categoryMap = {};
        categoryResult.forEach((row) => {
          categoryMap[row.id] = row.category;
        });
        const monthlyData = {};
        result.forEach((record) => {
          const date = new Date(record.bill_date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
          const yearMonthKey = `${year}-${month}`;
          if (!monthlyData[yearMonthKey]) {
            monthlyData[yearMonthKey] = {
              month: `${month}月`,
              year: `${year}`,
              netIncome: 0,
              revenue: 0,
              expense: 0,
              flow: {}
            };
          }
          const monthData = monthlyData[yearMonthKey];
          const dayKey = `${day}号`;
          if (!monthData.flow[dayKey]) {
            monthData.flow[dayKey] = {
              day: dayKey,
              dayFlowList: []
            };
          }
          const isExpense = parseFloat(record.money) < 0;
          const money = Math.abs(parseFloat(record.money));
          if (isExpense) {
            monthData.expense += money;
          } else {
            monthData.revenue += money;
          }
          monthData.flow[dayKey].dayFlowList.push({
            id: record.id,
            category: categoryMap[record.category_id],
            money: record.money.toFixed(2),
            time: timeStr
          });
        });
        Object.assign(items, Object.values(monthlyData).map((month) => {
          month.netIncome = (month.revenue - month.expense).toFixed(2);
          month.revenue = month.revenue.toFixed(2);
          month.expense = month.expense.toFixed(2);
          month.flow = Object.values(month.flow).sort((a2, b2) => {
            const dayA = parseInt(a2.day);
            const dayB = parseInt(b2.day);
            return dayB - dayA;
          });
          return month;
        }));
      });
      const $refs = vue.getCurrentInstance().proxy.$refs;
      const handleDelete = async (detail, monthItem, dayList, index1) => {
        try {
          if (swipeAction.value) {
            if (Array.isArray(swipeAction.value)) {
              swipeAction.value.forEach((action) => {
                if (action && action.closeAll) {
                  action.closeAll();
                }
              });
            } else {
              if (swipeAction.value.closeAll) {
                swipeAction.value.closeAll();
              }
            }
          }
          await dbService2.deleteTallyBill(detail.id);
          dayList.dayFlowList.splice(index1, 1);
          const money = detail.money;
          if (money < 0) {
            monthItem.expense -= Math.abs(money);
          } else {
            monthItem.revenue -= money;
          }
          monthItem.netIncome = (monthItem.revenue - monthItem.expense).toFixed(2);
          monthItem.revenue = parseFloat(monthItem.revenue).toFixed(2);
          monthItem.expense = parseFloat(monthItem.expense).toFixed(2);
          if (dayList.dayFlowList.length === 0) {
            const dayIndex = monthItem.flow.findIndex((f2) => f2.day === dayList.day);
            if (dayIndex !== -1) {
              monthItem.flow.splice(dayIndex, 1);
            }
          }
        } catch (e2) {
          formatAppLog("log", "at pages/settle-account/settle-account-flow.vue:209", e2);
          uni.showToast({
            title: "删除失败:" + e2,
            icon: "none"
          });
        }
      };
      const __returned__ = { dbService: dbService2, swipeAction, handleClick, items, value, account_id, $refs, handleDelete, reactive: vue.reactive, get DBService() {
        return DBService;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_swipe_action_item = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action-item"), __easycom_0$5);
    const _component_uni_swipe_action = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action"), __easycom_1$2);
    const _component_uni_collapse_item = resolveEasycom(vue.resolveDynamicComponent("uni-collapse-item"), __easycom_2$1);
    const _component_uni_collapse = resolveEasycom(vue.resolveDynamicComponent("uni-collapse"), __easycom_3);
    const _component_wd_fab = resolveEasycom(vue.resolveDynamicComponent("wd-fab"), __easycom_4$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.items, (item, index) => {
          return vue.openBlock(), vue.createElementBlock("view", null, [
            vue.createVNode(_component_uni_collapse, {
              class: "card",
              modelValue: $setup.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.value = $event)
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_uni_collapse_item, {
                  title: item.month,
                  name: item.month
                }, {
                  title: vue.withCtx(() => [
                    vue.createElementVNode("view", { class: "overview" }, [
                      vue.createElementVNode("view", { class: "date-section" }, [
                        vue.createElementVNode(
                          "view",
                          { class: "month" },
                          vue.toDisplayString(item.month),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "year" }, "2025")
                      ]),
                      vue.createElementVNode("view", { class: "amount-section" }, [
                        vue.createElementVNode("view", { class: "income-total" }, [
                          vue.createElementVNode("view", null, "净收入 "),
                          vue.createElementVNode(
                            "view",
                            {
                              class: "money-font",
                              style: vue.normalizeStyle({ color: item.netIncome > 0 ? "red" : "green" })
                            },
                            vue.toDisplayString(item.netIncome),
                            5
                            /* TEXT, STYLE */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "income-expense balance-font" }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            "收入 " + vue.toDisplayString(item.revenue),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            null,
                            "支出 " + vue.toDisplayString(item.expense),
                            1
                            /* TEXT */
                          )
                        ])
                      ])
                    ])
                  ]),
                  default: vue.withCtx(() => [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(item.flow, (dayList, index2) => {
                        return vue.openBlock(), vue.createElementBlock("view", null, [
                          vue.createElementVNode(
                            "view",
                            null,
                            vue.toDisplayString(dayList.day),
                            1
                            /* TEXT */
                          ),
                          vue.createVNode(
                            _component_uni_swipe_action,
                            {
                              ref_for: true,
                              ref: "swipeAction"
                            },
                            {
                              default: vue.withCtx(() => [
                                (vue.openBlock(true), vue.createElementBlock(
                                  vue.Fragment,
                                  null,
                                  vue.renderList(dayList.dayFlowList, (detail, index1) => {
                                    return vue.openBlock(), vue.createBlock(_component_uni_swipe_action_item, {
                                      key: index1,
                                      "right-options": [
                                        { text: "删除", style: { backgroundColor: "red", color: "#fff" } }
                                      ],
                                      onClick: () => $setup.handleDelete(detail, item, dayList, index1)
                                    }, {
                                      default: vue.withCtx(() => [
                                        vue.createElementVNode("view", { class: "uni-list-item" }, [
                                          vue.createElementVNode("view", { class: "uni-list-item__content" }, [
                                            vue.createElementVNode(
                                              "view",
                                              { class: "uni-list-item__title" },
                                              vue.toDisplayString(detail.category),
                                              1
                                              /* TEXT */
                                            ),
                                            vue.createElementVNode(
                                              "view",
                                              { class: "uni-list-item__note" },
                                              vue.toDisplayString(detail.time),
                                              1
                                              /* TEXT */
                                            )
                                          ]),
                                          vue.createElementVNode("view", { class: "detail-footer" }, [
                                            vue.createElementVNode(
                                              "text",
                                              {
                                                class: "money-font",
                                                style: vue.normalizeStyle({ color: detail.money > 0 ? "red" : "green" })
                                              },
                                              vue.toDisplayString(detail.money),
                                              5
                                              /* TEXT, STYLE */
                                            )
                                          ])
                                        ])
                                      ]),
                                      _: 2
                                      /* DYNAMIC */
                                    }, 1032, ["onClick"]);
                                  }),
                                  128
                                  /* KEYED_FRAGMENT */
                                ))
                              ]),
                              _: 2
                              /* DYNAMIC */
                            },
                            1536
                            /* NEED_PATCH, DYNAMIC_SLOTS */
                          )
                        ]);
                      }),
                      256
                      /* UNKEYED_FRAGMENT */
                    ))
                  ]),
                  _: 2
                  /* DYNAMIC */
                }, 1032, ["title", "name"])
              ]),
              _: 2
              /* DYNAMIC */
            }, 1032, ["modelValue"])
          ]);
        }),
        256
        /* UNKEYED_FRAGMENT */
      )),
      vue.createVNode(_component_wd_fab, {
        expandable: false,
        onClick: $setup.handleClick
      })
    ]);
  }
  const PagesSettleAccountSettleAccountFlow = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/settle-account-flow.vue"]]);
  const _sfc_main$d = {
    data() {
      return {
        chartData: {},
        //您可以通过修改 config-ucharts.js 文件中下标为 ['line'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
        opts: {
          color: [
            "#1890FF",
            "#91CB74",
            "#FAC858",
            "#EE6666",
            "#73C0DE",
            "#3CA272",
            "#FC8452",
            "#9A60B4",
            "#ea7ccc"
          ],
          padding: [15, 10, 0, 15],
          enableScroll: false,
          legend: {},
          xAxis: {
            disableGrid: true
          },
          yAxis: {
            gridType: "dash",
            dashLength: 2
          },
          extra: {
            line: {
              type: "straight",
              width: 2,
              activeType: "hollow"
            }
          }
        }
      };
    },
    onReady() {
      this.getServerData();
    },
    methods: {
      getServerData() {
        setTimeout(() => {
          let res = {
            categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
            series: [
              {
                name: "成交量A",
                data: [35, 8, 25, 37, 4, 20]
              },
              {
                name: "成交量B",
                data: [70, 40, 65, 100, 44, 68]
              },
              {
                name: "成交量C",
                data: [100, 80, 95, 150, 112, 132]
              }
            ]
          };
          this.chartData = JSON.parse(JSON.stringify(res));
        }, 500);
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_qiun_data_charts = resolveEasycom(vue.resolveDynamicComponent("qiun-data-charts"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "charts-box" }, [
      vue.createVNode(_component_qiun_data_charts, {
        type: "line",
        opts: $data.opts,
        chartData: $data.chartData
      }, null, 8, ["opts", "chartData"])
    ]);
  }
  const PagesReportsAccount = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-2aca474a"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/reports/account.vue"]]);
  const zhCN = {
    calendar: {
      placeholder: "请选择",
      title: "选择日期",
      day: "日",
      week: "周",
      month: "月",
      confirm: "确定",
      startTime: "开始时间",
      endTime: "结束时间",
      to: "至",
      timeFormat: "YY年MM月DD日 HH:mm:ss",
      dateFormat: "YYYY年MM月DD日",
      weekFormat: (year, week) => `${year} 第 ${week} 周`,
      startWeek: "开始周",
      endWeek: "结束周",
      startMonth: "开始月",
      endMonth: "结束月",
      monthFormat: "YYYY年MM月"
    },
    calendarView: {
      startTime: "开始",
      endTime: "结束",
      weeks: {
        sun: "日",
        mon: "一",
        tue: "二",
        wed: "三",
        thu: "四",
        fri: "五",
        sat: "六"
      },
      rangePrompt: (maxRange) => `选择天数不能超过${maxRange}天`,
      rangePromptWeek: (maxRange) => `选择周数不能超过${maxRange}周`,
      rangePromptMonth: (maxRange) => `选择月份不能超过${maxRange}个月`,
      monthTitle: "YYYY年M月",
      yearTitle: "YYYY年",
      month: "M月",
      hour: (value) => `${value}时`,
      minute: (value) => `${value}分`,
      second: (value) => `${value}秒`
    },
    collapse: {
      expand: "展开",
      retract: "收起"
    },
    colPicker: {
      title: "请选择",
      placeholder: "请选择",
      select: "请选择"
    },
    datetimePicker: {
      start: "开始时间",
      end: "结束时间",
      to: "至",
      placeholder: "请选择",
      confirm: "完成",
      cancel: "取消"
    },
    loadmore: {
      loading: "正在努力加载中...",
      finished: "已加载完毕",
      error: "加载失败",
      retry: "点击重试"
    },
    messageBox: {
      inputPlaceholder: "请输入",
      confirm: "确定",
      cancel: "取消",
      inputNoValidate: "输入的数据不合法"
    },
    numberKeyboard: {
      confirm: "完成"
    },
    pagination: {
      prev: "上一页",
      next: "下一页",
      page: (value) => `当前页：${value}`,
      total: (total) => `当前数据：${total}条`,
      size: (size) => `分页大小：${size}`
    },
    picker: {
      cancel: "取消",
      done: "完成",
      placeholder: "请选择"
    },
    imgCropper: {
      confirm: "完成",
      cancel: "取消"
    },
    search: {
      search: "搜索",
      cancel: "取消"
    },
    steps: {
      wait: "未开始",
      finished: "已完成",
      process: "进行中",
      failed: "失败"
    },
    tabs: {
      all: "全部"
    },
    upload: {
      error: "上传失败"
    },
    input: {
      placeholder: "请输入..."
    },
    selectPicker: {
      title: "请选择",
      placeholder: "请选择",
      select: "请选择",
      confirm: "确认",
      filterPlaceholder: "搜索"
    },
    tag: {
      placeholder: "请输入",
      add: "新增标签"
    },
    textarea: {
      placeholder: "请输入..."
    },
    tableCol: {
      indexLabel: "序号"
    },
    signature: {
      confirmText: "确认",
      clearText: "清空",
      revokeText: "撤销",
      restoreText: "恢复"
    }
  };
  const lang = vue.ref("zh-CN");
  const messages = vue.reactive({
    "zh-CN": zhCN
  });
  const Locale = {
    messages() {
      return messages[lang.value];
    },
    use(newLang, newMessage) {
      lang.value = newLang;
      if (newMessage) {
        this.add({ [newLang]: newMessage });
      }
    },
    add(newMessages = {}) {
      deepAssign(messages, newMessages);
    }
  };
  const useTranslate = (name) => {
    const prefix = name ? camelCase(name) + "." : "";
    const translate = (key, ...args) => {
      const currentMessages = Locale.messages();
      const message = getPropByPath(currentMessages, prefix + key);
      return isFunction(message) ? message(...args) : message;
    };
    return { translate };
  };
  const inputProps = {
    ...baseProps,
    customInputClass: makeStringProp(""),
    customLabelClass: makeStringProp(""),
    // 原生属性
    /**
     * 占位文本
     */
    placeholder: String,
    /**
     * 原生属性，指定 placeholder 的样式，目前仅支持color,font-size和font-weight
     */
    placeholderStyle: String,
    /**
     * 原生属性，指定 placeholder 的样式类
     */
    placeholderClass: makeStringProp(""),
    /**
     * 原生属性，指定光标与键盘的距离。取 input 距离底部的距离和cursor-spacing指定的距离的最小值作为光标与键盘的距离
     */
    cursorSpacing: makeNumberProp(0),
    /**
     * 原生属性，指定focus时的光标位置
     */
    cursor: makeNumberProp(-1),
    /**
     * 原生属性，光标起始位置，自动聚集时有效，需与selection-end搭配使用
     */
    selectionStart: makeNumberProp(-1),
    /**
     * 原生属性，光标结束位置，自动聚集时有效，需与selection-start搭配使用
     */
    selectionEnd: makeNumberProp(-1),
    /**
     * 原生属性，键盘弹起时，是否自动上推页面
     */
    adjustPosition: makeBooleanProp(true),
    /**
     * focus时，点击页面的时候不收起键盘
     */
    holdKeyboard: makeBooleanProp(false),
    /**
     * 设置键盘右下角按钮的文字，仅在type='text'时生效，可选值：done / go / next / search / send
     */
    confirmType: makeStringProp("done"),
    /**
     * 点击键盘右下角按钮时是否保持键盘不收起
     */
    confirmHold: makeBooleanProp(false),
    /**
     * 原生属性，获取焦点
     */
    focus: makeBooleanProp(false),
    /**
     * 类型，可选值：text / number / digit / idcard
     */
    type: makeStringProp("text"),
    /**
     * 原生属性，最大长度
     */
    maxlength: {
      type: Number,
      default: -1
    },
    /**
     * 原生属性，禁用
     */
    disabled: makeBooleanProp(false),
    /**
     * 微信小程序原生属性，强制 input 处于同层状态，默认 focus 时 input 会切到非同层状态 (仅在 iOS 下生效)
     */
    alwaysEmbed: makeBooleanProp(false),
    // 原生属性结束
    /**
     * 输入框的值靠右展示
     */
    alignRight: makeBooleanProp(false),
    /**
     * 绑定值
     */
    modelValue: makeNumericProp(""),
    /**
     * 显示为密码框
     */
    showPassword: makeBooleanProp(false),
    /**
     * 显示清空按钮
     */
    clearable: makeBooleanProp(false),
    /**
     * 只读
     */
    readonly: makeBooleanProp(false),
    /**
     * 前置图标，icon组件中的图标类名
     */
    prefixIcon: String,
    /**
     * 后置图标，icon组件中的图标类名
     */
    suffixIcon: String,
    /**
     * 显示字数限制，需要同时设置 maxlength
     */
    showWordLimit: makeBooleanProp(false),
    /**
     * 设置左侧标题
     */
    label: String,
    /**
     * 设置左侧标题宽度
     */
    labelWidth: makeStringProp(""),
    /**
     * 设置输入框大小，可选值：large
     */
    size: String,
    /**
     * 设置输入框错误状态，错误状态时为红色
     */
    error: makeBooleanProp(false),
    /**
     * 当有label属性时，设置标题和输入框垂直居中，默认为顶部居中
     */
    center: makeBooleanProp(false),
    /**
     * 非 cell 类型下是否隐藏下划线
     */
    noBorder: makeBooleanProp(false),
    /**
     * 是否必填
     */
    required: makeBooleanProp(false),
    /**
     * 表单域 model 字段名，在使用表单校验功能的情况下，该属性是必填的
     */
    prop: String,
    /**
     * 表单验证规则，结合wd-form组件使用
     */
    rules: makeArrayProp(),
    /**
     * 显示清除图标的时机，always 表示输入框不为空时展示，focus 表示输入框聚焦且不为空时展示
     * 类型: "focus" | "always"
     * 默认值: "always"
     */
    clearTrigger: makeStringProp("always"),
    /**
     * 是否在点击清除按钮时聚焦输入框
     * 类型: boolean
     * 默认值: true
     */
    focusWhenClear: makeBooleanProp(true),
    /**
     * 是否忽略组件内对文本合成系统事件的处理。为 false 时将触发 compositionstart、compositionend、compositionupdate 事件，且在文本合成期间会触发 input 事件
     * 类型: boolean
     * 默认值: true
     */
    ignoreCompositionEvent: makeBooleanProp(true),
    /**
     * 它提供了用户在编辑元素或其内容时可能输入的数据类型的提示。在符合条件的高版本webview里，uni-app的web和app-vue平台中可使用本属性。
     * 类型: InputMode
     * 可选值: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | "password"
     * 默认值: "text"
     */
    inputmode: makeStringProp("text")
  };
  const __default__$9 = {
    name: "wd-input",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$c = /* @__PURE__ */ vue.defineComponent({
    ...__default__$9,
    props: inputProps,
    emits: [
      "update:modelValue",
      "clear",
      "blur",
      "focus",
      "input",
      "keyboardheightchange",
      "confirm",
      "clicksuffixicon",
      "clickprefixicon",
      "click"
    ],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const slots = vue.useSlots();
      const { translate } = useTranslate("input");
      const isPwdVisible = vue.ref(false);
      const clearing = vue.ref(false);
      const focused = vue.ref(false);
      const focusing = vue.ref(false);
      const inputValue = vue.ref(getInitValue());
      const cell = useCell();
      vue.watch(
        () => props.focus,
        (newValue) => {
          focused.value = newValue;
        },
        { immediate: true, deep: true }
      );
      vue.watch(
        () => props.modelValue,
        (newValue) => {
          inputValue.value = isDef(newValue) ? String(newValue) : "";
        }
      );
      const { parent: form } = useParent(FORM_KEY);
      const placeholderValue = vue.computed(() => {
        return isDef(props.placeholder) ? props.placeholder : translate("placeholder");
      });
      const showClear = vue.computed(() => {
        const { disabled, readonly, clearable, clearTrigger } = props;
        if (clearable && !readonly && !disabled && inputValue.value && (clearTrigger === "always" || props.clearTrigger === "focus" && focusing.value)) {
          return true;
        } else {
          return false;
        }
      });
      const showWordCount = vue.computed(() => {
        const { disabled, readonly, maxlength, showWordLimit } = props;
        return Boolean(!disabled && !readonly && isDef(maxlength) && maxlength > -1 && showWordLimit);
      });
      const errorMessage = vue.computed(() => {
        if (form && props.prop && form.errorMessages && form.errorMessages[props.prop]) {
          return form.errorMessages[props.prop];
        } else {
          return "";
        }
      });
      const isRequired = vue.computed(() => {
        let formRequired = false;
        if (form && form.props.rules) {
          const rules = form.props.rules;
          for (const key in rules) {
            if (Object.prototype.hasOwnProperty.call(rules, key) && key === props.prop && Array.isArray(rules[key])) {
              formRequired = rules[key].some((rule) => rule.required);
            }
          }
        }
        return props.required || props.rules.some((rule) => rule.required) || formRequired;
      });
      const rootClass = vue.computed(() => {
        return `wd-input  ${props.label || slots.label ? "is-cell" : ""} ${props.center ? "is-center" : ""} ${cell.border.value ? "is-border" : ""} ${props.size ? "is-" + props.size : ""} ${props.error ? "is-error" : ""} ${props.disabled ? "is-disabled" : ""}  ${inputValue.value && String(inputValue.value).length > 0 ? "is-not-empty" : ""}  ${props.noBorder ? "is-no-border" : ""} ${props.customClass}`;
      });
      const labelClass = vue.computed(() => {
        return `wd-input__label ${props.customLabelClass} ${isRequired.value ? "is-required" : ""}`;
      });
      const inputPlaceholderClass = vue.computed(() => {
        return `wd-input__placeholder  ${props.placeholderClass}`;
      });
      const labelStyle = vue.computed(() => {
        return props.labelWidth ? objToStyle({
          "min-width": props.labelWidth,
          "max-width": props.labelWidth
        }) : "";
      });
      function getInitValue() {
        const formatted = formatValue(props.modelValue);
        if (!isValueEqual(formatted, props.modelValue)) {
          emit("update:modelValue", formatted);
        }
        return formatted;
      }
      function formatValue(value) {
        const { maxlength } = props;
        if (isDef(maxlength) && maxlength !== -1 && String(value).length > maxlength) {
          return value.toString().slice(0, maxlength);
        }
        return value;
      }
      function togglePwdVisible() {
        isPwdVisible.value = !isPwdVisible.value;
      }
      async function handleClear() {
        clearing.value = true;
        focusing.value = false;
        inputValue.value = "";
        if (props.focusWhenClear) {
          focused.value = false;
        }
        await pause();
        if (props.focusWhenClear) {
          focused.value = true;
          focusing.value = true;
        }
        emit("update:modelValue", inputValue.value);
        emit("clear");
      }
      async function handleBlur() {
        await pause(150);
        if (clearing.value) {
          clearing.value = false;
          return;
        }
        focusing.value = false;
        emit("blur", {
          value: inputValue.value
        });
      }
      function handleFocus({ detail }) {
        focusing.value = true;
        emit("focus", detail);
      }
      function handleInput({ detail }) {
        emit("update:modelValue", inputValue.value);
        emit("input", detail);
      }
      function handleKeyboardheightchange({ detail }) {
        emit("keyboardheightchange", detail);
      }
      function handleConfirm({ detail }) {
        emit("confirm", detail);
      }
      function onClickSuffixIcon() {
        emit("clicksuffixicon");
      }
      function onClickPrefixIcon() {
        emit("clickprefixicon");
      }
      function handleClick(event) {
        emit("click", event);
      }
      function isValueEqual(value1, value2) {
        return isEqual(String(value1), String(value2));
      }
      const __returned__ = { props, emit, slots, translate, isPwdVisible, clearing, focused, focusing, inputValue, cell, form, placeholderValue, showClear, showWordCount, errorMessage, isRequired, rootClass, labelClass, inputPlaceholderClass, labelStyle, getInitValue, formatValue, togglePwdVisible, handleClear, handleBlur, handleFocus, handleInput, handleKeyboardheightchange, handleConfirm, onClickSuffixIcon, onClickPrefixIcon, handleClick, isValueEqual, wdIcon: __easycom_0$7 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass($setup.rootClass),
        style: vue.normalizeStyle(_ctx.customStyle),
        onClick: $setup.handleClick
      },
      [
        _ctx.label || _ctx.$slots.label ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass($setup.labelClass),
            style: vue.normalizeStyle($setup.labelStyle)
          },
          [
            _ctx.prefixIcon || _ctx.$slots.prefix ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "wd-input__prefix"
            }, [
              _ctx.prefixIcon && !_ctx.$slots.prefix ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                key: 0,
                "custom-class": "wd-input__icon",
                name: _ctx.prefixIcon,
                onClick: $setup.onClickPrefixIcon
              }, null, 8, ["name"])) : vue.renderSlot(_ctx.$slots, "prefix", { key: 1 }, void 0, true)
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "wd-input__label-inner" }, [
              _ctx.label && !_ctx.$slots.label ? (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 0 },
                [
                  vue.createTextVNode(
                    vue.toDisplayString(_ctx.label),
                    1
                    /* TEXT */
                  )
                ],
                64
                /* STABLE_FRAGMENT */
              )) : vue.renderSlot(_ctx.$slots, "label", { key: 1 }, void 0, true)
            ])
          ],
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "wd-input__body" }, [
          vue.createElementVNode("view", { class: "wd-input__value" }, [
            (_ctx.prefixIcon || _ctx.$slots.prefix) && !_ctx.label ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "wd-input__prefix"
            }, [
              _ctx.prefixIcon && !_ctx.$slots.prefix ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                key: 0,
                "custom-class": "wd-input__icon",
                name: _ctx.prefixIcon,
                onClick: $setup.onClickPrefixIcon
              }, null, 8, ["name"])) : vue.renderSlot(_ctx.$slots, "prefix", { key: 1 }, void 0, true)
            ])) : vue.createCommentVNode("v-if", true),
            vue.withDirectives(vue.createElementVNode("input", {
              class: vue.normalizeClass([
                "wd-input__inner",
                _ctx.prefixIcon ? "wd-input__inner--prefix" : "",
                $setup.showWordCount ? "wd-input__inner--count" : "",
                _ctx.alignRight ? "is-align-right" : "",
                _ctx.customInputClass
              ]),
              type: _ctx.type,
              password: _ctx.showPassword && !$setup.isPwdVisible,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.inputValue = $event),
              placeholder: $setup.placeholderValue,
              disabled: _ctx.disabled || _ctx.readonly,
              maxlength: _ctx.maxlength,
              focus: $setup.focused,
              "confirm-type": _ctx.confirmType,
              "confirm-hold": _ctx.confirmHold,
              cursor: _ctx.cursor,
              "cursor-spacing": _ctx.cursorSpacing,
              "placeholder-style": _ctx.placeholderStyle,
              "selection-start": _ctx.selectionStart,
              "selection-end": _ctx.selectionEnd,
              "adjust-position": _ctx.adjustPosition,
              "hold-keyboard": _ctx.holdKeyboard,
              "always-embed": _ctx.alwaysEmbed,
              "placeholder-class": $setup.inputPlaceholderClass,
              ignoreCompositionEvent: _ctx.ignoreCompositionEvent,
              inputmode: _ctx.inputmode,
              onInput: $setup.handleInput,
              onFocus: $setup.handleFocus,
              onBlur: $setup.handleBlur,
              onConfirm: $setup.handleConfirm,
              onKeyboardheightchange: $setup.handleKeyboardheightchange
            }, null, 42, ["type", "password", "placeholder", "disabled", "maxlength", "focus", "confirm-type", "confirm-hold", "cursor", "cursor-spacing", "placeholder-style", "selection-start", "selection-end", "adjust-position", "hold-keyboard", "always-embed", "placeholder-class", "ignoreCompositionEvent", "inputmode"]), [
              [vue.vModelDynamic, $setup.inputValue]
            ]),
            $setup.props.readonly ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "wd-input__readonly-mask"
            })) : vue.createCommentVNode("v-if", true),
            $setup.showClear || _ctx.showPassword || _ctx.suffixIcon || $setup.showWordCount || _ctx.$slots.suffix ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "wd-input__suffix"
            }, [
              $setup.showClear ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                key: 0,
                "custom-class": "wd-input__clear",
                name: "error-fill",
                onClick: $setup.handleClear
              })) : vue.createCommentVNode("v-if", true),
              _ctx.showPassword ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                key: 1,
                "custom-class": "wd-input__icon",
                name: $setup.isPwdVisible ? "view" : "eye-close",
                onClick: $setup.togglePwdVisible
              }, null, 8, ["name"])) : vue.createCommentVNode("v-if", true),
              $setup.showWordCount ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "wd-input__count"
              }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass([
                      $setup.inputValue && String($setup.inputValue).length > 0 ? "wd-input__count-current" : "",
                      String($setup.inputValue).length > _ctx.maxlength ? "is-error" : ""
                    ])
                  },
                  vue.toDisplayString(String($setup.inputValue).length),
                  3
                  /* TEXT, CLASS */
                ),
                vue.createTextVNode(
                  " /" + vue.toDisplayString(_ctx.maxlength),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              _ctx.suffixIcon && !_ctx.$slots.suffix ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                key: 3,
                "custom-class": "wd-input__icon",
                name: _ctx.suffixIcon,
                onClick: $setup.onClickSuffixIcon
              }, null, 8, ["name"])) : vue.renderSlot(_ctx.$slots, "suffix", { key: 4 }, void 0, true)
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          $setup.errorMessage ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 0,
              class: "wd-input__error-message"
            },
            vue.toDisplayString($setup.errorMessage),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-4e0c9774"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-input/wd-input.vue"]]);
  const overlayProps = {
    ...baseProps,
    /**
     * 是否展示遮罩层
     */
    show: makeBooleanProp(false),
    /**
     * 动画时长，单位毫秒
     */
    duration: {
      type: [Object, Number, Boolean],
      default: 300
    },
    /**
     * 是否锁定滚动
     */
    lockScroll: makeBooleanProp(true),
    /**
     * 层级
     */
    zIndex: makeNumberProp(10)
  };
  const __default__$8 = {
    name: "wd-overlay",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
    ...__default__$8,
    props: overlayProps,
    emits: ["click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      function handleClick() {
        emit("click");
      }
      function noop() {
      }
      const __returned__ = { props, emit, handleClick, noop, wdTransition };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createBlock($setup["wdTransition"], {
      show: _ctx.show,
      name: "fade",
      "custom-class": "wd-overlay",
      duration: _ctx.duration,
      "custom-style": `z-index: ${_ctx.zIndex}; ${_ctx.customStyle}`,
      onClick: $setup.handleClick,
      onTouchmove: _cache[0] || (_cache[0] = vue.withModifiers(($event) => _ctx.lockScroll ? $setup.noop : "", ["stop", "prevent"]))
    }, {
      default: vue.withCtx(() => [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ]),
      _: 3
      /* FORWARDED */
    }, 8, ["show", "duration", "custom-style"]);
  }
  const wdOverlay = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-6e0d1141"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-overlay/wd-overlay.vue"]]);
  const popupProps = {
    ...baseProps,
    /**
     * 动画类型，参见 wd-transition 组件的name
     * 类型：string
     * 可选值：fade / fade-up / fade-down / fade-left / fade-right / slide-up / slide-down / slide-left / slide-right / zoom-in
     */
    transition: String,
    /**
     * 关闭按钮
     * 类型：boolean
     * 默认值：false
     */
    closable: makeBooleanProp(false),
    /**
     * 弹出框的位置
     * 类型：string
     * 默认值：center
     * 可选值：center / top / right / bottom / left
     */
    position: makeStringProp("center"),
    /**
     * 点击遮罩是否关闭
     * 类型：boolean
     * 默认值：true
     */
    closeOnClickModal: makeBooleanProp(true),
    /**
     * 动画持续时间
     * 类型：number | boolean
     * 默认值：300
     */
    duration: {
      type: [Number, Boolean],
      default: 300
    },
    /**
     * 是否显示遮罩
     * 类型：boolean
     * 默认值：true
     */
    modal: makeBooleanProp(true),
    /**
     * 设置层级
     * 类型：number
     * 默认值：10
     */
    zIndex: makeNumberProp(10),
    /**
     * 是否当关闭时将弹出层隐藏（display: none)
     * 类型：boolean
     * 默认值：true
     */
    hideWhenClose: makeBooleanProp(true),
    /**
     * 遮罩样式
     * 类型：string
     * 默认值：''
     */
    modalStyle: makeStringProp(""),
    /**
     * 弹出面板是否设置底部安全距离（iphone X 类型的机型）
     * 类型：boolean
     * 默认值：false
     */
    safeAreaInsetBottom: makeBooleanProp(false),
    /**
     * 弹出层是否显示
     */
    modelValue: makeBooleanProp(false),
    /**
     * 弹层内容懒渲染，触发展示时才渲染内容
     * 类型：boolean
     * 默认值：true
     */
    lazyRender: makeBooleanProp(true),
    /**
     * 是否锁定滚动
     * 类型：boolean
     * 默认值：true
     */
    lockScroll: makeBooleanProp(true)
  };
  const __default__$7 = {
    name: "wd-popup",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    ...__default__$7,
    props: popupProps,
    emits: [
      "update:modelValue",
      "before-enter",
      "enter",
      "before-leave",
      "leave",
      "after-leave",
      "after-enter",
      "click-modal",
      "close"
    ],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const transitionName = vue.computed(() => {
        if (props.transition) {
          return props.transition;
        }
        if (props.position === "center") {
          return ["zoom-in", "fade"];
        }
        if (props.position === "left") {
          return "slide-left";
        }
        if (props.position === "right") {
          return "slide-right";
        }
        if (props.position === "bottom") {
          return "slide-up";
        }
        if (props.position === "top") {
          return "slide-down";
        }
        return "slide-up";
      });
      const safeBottom = vue.ref(0);
      const style = vue.computed(() => {
        return `z-index:${props.zIndex}; padding-bottom: ${safeBottom.value}px;${props.customStyle}`;
      });
      const rootClass = vue.computed(() => {
        return `wd-popup wd-popup--${props.position} ${!props.transition && props.position === "center" ? "is-deep" : ""} ${props.customClass || ""}`;
      });
      vue.onBeforeMount(() => {
        if (props.safeAreaInsetBottom) {
          const { safeArea, screenHeight, safeAreaInsets } = uni.getSystemInfoSync();
          if (safeArea) {
            safeBottom.value = safeAreaInsets ? safeAreaInsets.bottom : 0;
          } else {
            safeBottom.value = 0;
          }
        }
      });
      function handleClickModal() {
        emit("click-modal");
        if (props.closeOnClickModal) {
          close();
        }
      }
      function close() {
        emit("close");
        emit("update:modelValue", false);
      }
      function noop() {
      }
      const __returned__ = { props, emit, transitionName, safeBottom, style, rootClass, handleClickModal, close, noop, wdIcon: __easycom_0$7, wdOverlay, wdTransition };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "wd-popup-wrapper" }, [
      _ctx.modal ? (vue.openBlock(), vue.createBlock($setup["wdOverlay"], {
        key: 0,
        show: _ctx.modelValue,
        "z-index": _ctx.zIndex,
        "lock-scroll": _ctx.lockScroll,
        duration: _ctx.duration,
        "custom-style": _ctx.modalStyle,
        onClick: $setup.handleClickModal,
        onTouchmove: $setup.noop
      }, null, 8, ["show", "z-index", "lock-scroll", "duration", "custom-style"])) : vue.createCommentVNode("v-if", true),
      vue.createVNode($setup["wdTransition"], {
        "lazy-render": _ctx.lazyRender,
        "custom-class": $setup.rootClass,
        "custom-style": $setup.style,
        duration: _ctx.duration,
        show: _ctx.modelValue,
        name: $setup.transitionName,
        destroy: _ctx.hideWhenClose,
        onBeforeEnter: _cache[0] || (_cache[0] = ($event) => $setup.emit("before-enter")),
        onEnter: _cache[1] || (_cache[1] = ($event) => $setup.emit("enter")),
        onAfterEnter: _cache[2] || (_cache[2] = ($event) => $setup.emit("after-enter")),
        onBeforeLeave: _cache[3] || (_cache[3] = ($event) => $setup.emit("before-leave")),
        onLeave: _cache[4] || (_cache[4] = ($event) => $setup.emit("leave")),
        onAfterLeave: _cache[5] || (_cache[5] = ($event) => $setup.emit("after-leave"))
      }, {
        default: vue.withCtx(() => [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
          _ctx.closable ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
            key: 0,
            "custom-class": "wd-popup__close",
            name: "add",
            onClick: $setup.close
          })) : vue.createCommentVNode("v-if", true)
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["lazy-render", "custom-class", "custom-style", "duration", "show", "name", "destroy"])
    ]);
  }
  const wdPopup = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-25a8a9f7"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-popup/wd-popup.vue"]]);
  const loadingProps = {
    ...baseProps,
    /**
     * 加载指示器类型，可选值：'outline' | 'ring'
     */
    type: makeStringProp("ring"),
    /**
     * 设置加载指示器颜色
     */
    color: makeStringProp("#4D80F0"),
    /**
     * 设置加载指示器大小
     */
    size: makeNumericProp("")
  };
  const __default__$6 = {
    name: "wd-loading",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$6,
    props: loadingProps,
    setup(__props, { expose: __expose }) {
      __expose();
      const svgDefineId = context.id++;
      const svgDefineId1 = context.id++;
      const svgDefineId2 = context.id++;
      const icon = {
        outline(color2 = "#4D80F0") {
          return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42"><defs><linearGradient x1="100%" y1="0%" x2="0%" y2="0%" id="${svgDefineId}"><stop stop-color="#FFF" offset="0%" stop-opacity="0"/><stop stop-color="#FFF" offset="100%"/></linearGradient></defs><g fill="none" fill-rule="evenodd"><path d="M21 1c11.046 0 20 8.954 20 20s-8.954 20-20 20S1 32.046 1 21 9.954 1 21 1zm0 7C13.82 8 8 13.82 8 21s5.82 13 13 13 13-5.82 13-13S28.18 8 21 8z" fill="${color2}"/><path d="M4.599 21c0 9.044 7.332 16.376 16.376 16.376 9.045 0 16.376-7.332 16.376-16.376" stroke="url(#${svgDefineId}) " stroke-width="3.5" stroke-linecap="round"/></g></svg>`;
        },
        ring(color2 = "#4D80F0", intermediateColor2 = "#a6bff7") {
          return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><linearGradient id="${svgDefineId1}" gradientUnits="userSpaceOnUse" x1="50" x2="50" y2="180"><stop offset="0" stop-color="${color2}"></stop> <stop offset="1" stop-color="${intermediateColor2}"></stop></linearGradient> <path fill="url(#${svgDefineId1})" d="M20 100c0-44.1 35.9-80 80-80V0C44.8 0 0 44.8 0 100s44.8 100 100 100v-20c-44.1 0-80-35.9-80-80z"></path> <linearGradient id="${svgDefineId2}" gradientUnits="userSpaceOnUse" x1="150" y1="20" x2="150" y2="180"><stop offset="0" stop-color="#fff" stop-opacity="0"></stop> <stop offset="1" stop-color="${intermediateColor2}"></stop></linearGradient> <path fill="url(#${svgDefineId2})" d="M100 0v20c44.1 0 80 35.9 80 80s-35.9 80-80 80v20c55.2 0 100-44.8 100-100S155.2 0 100 0z"></path> <circle cx="100" cy="10" r="10" fill="${color2}"></circle></svg>`;
        }
      };
      const props = __props;
      const svg = vue.ref("");
      const intermediateColor = vue.ref("");
      const iconSize = vue.ref(null);
      vue.watch(
        () => props.size,
        (newVal) => {
          iconSize.value = addUnit(newVal);
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.type,
        () => {
          buildSvg();
        },
        {
          deep: true,
          immediate: true
        }
      );
      const rootStyle = vue.computed(() => {
        const style = {};
        if (isDef(iconSize.value)) {
          style.height = addUnit(iconSize.value);
          style.width = addUnit(iconSize.value);
        }
        return `${objToStyle(style)}; ${props.customStyle}`;
      });
      vue.onBeforeMount(() => {
        intermediateColor.value = gradient(props.color, "#ffffff", 2)[1];
        buildSvg();
      });
      function buildSvg() {
        const { type, color: color2 } = props;
        let ringType = isDef(type) ? type : "ring";
        const svgStr = `"data:image/svg+xml;base64,${encode(ringType === "ring" ? icon[ringType](color2, intermediateColor.value) : icon[ringType](color2))}"`;
        svg.value = svgStr;
      }
      const __returned__ = { svgDefineId, svgDefineId1, svgDefineId2, icon, props, svg, intermediateColor, iconSize, rootStyle, buildSvg };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(`wd-loading ${$setup.props.customClass}`),
        style: vue.normalizeStyle($setup.rootStyle)
      },
      [
        vue.createElementVNode("view", { class: "wd-loading__body" }, [
          vue.createElementVNode(
            "view",
            {
              class: "wd-loading__svg",
              style: vue.normalizeStyle(`background-image: url(${$setup.svg});`)
            },
            null,
            4
            /* STYLE */
          )
        ])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const wdLoading = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-f2b508ee"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-loading/wd-loading.vue"]]);
  const pickerViewProps = {
    ...baseProps,
    /**
     * 加载状态
     */
    loading: makeBooleanProp(false),
    /**
     * 加载的颜色，只能使用十六进制的色值写法，且不能使用缩写
     */
    loadingColor: makeStringProp("#4D80F0"),
    /**
     * picker内部滚筒高
     */
    columnsHeight: makeNumberProp(217),
    /**
     * 选项对象中，value对应的 key
     */
    valueKey: makeStringProp("value"),
    /**
     * 选项对象中，展示的文本对应的 key
     */
    labelKey: makeStringProp("label"),
    /**
     * 是否在手指松开时立即触发picker-view的 change 事件。若不开启则会在滚动动画结束后触发 change 事件，1.2.25版本起提供，仅微信小程序和支付宝小程序支持。
     */
    immediateChange: makeBooleanProp(false),
    /**
     * 选中项，如果为多列选择器，则其类型应为数组
     */
    modelValue: {
      type: [String, Number, Boolean, Array, Array, Array],
      default: "",
      required: true
    },
    /**
     * 选择器数据，可以为字符串数组，也可以为对象数组，如果为二维数组，则为多列选择器
     */
    columns: makeArrayProp(),
    /**
     * 接收 pickerView 实例、选中项、当前修改列的下标、resolve 作为入参，根据选中项和列下标进行判断，通过 pickerView 实例暴露出来的 setColumnData 方法修改其他列的数据源。
     */
    columnChange: Function
  };
  function formatArray(array, valueKey, labelKey) {
    let tempArray = isArray(array) ? array : [array];
    const firstLevelTypeList = new Set(array.map(getType));
    if (firstLevelTypeList.size !== 1 && firstLevelTypeList.has("object")) {
      throw Error("The columns are correct");
    }
    if (!isArray(array[0])) {
      tempArray = [tempArray];
    }
    const result = tempArray.map((col) => {
      return col.map((row) => {
        if (!isObj(row)) {
          return {
            [valueKey]: row,
            [labelKey]: row
          };
        }
        if (!row.hasOwnProperty(valueKey) && !row.hasOwnProperty(labelKey)) {
          throw Error("Can't find valueKey and labelKey in columns");
        }
        if (!row.hasOwnProperty(labelKey)) {
          row[labelKey] = row[valueKey];
        }
        if (!row.hasOwnProperty(valueKey)) {
          row[valueKey] = row[labelKey];
        }
        return row;
      });
    });
    return result;
  }
  const __default__$5 = {
    name: "wd-picker-view",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$5,
    props: pickerViewProps,
    emits: ["change", "pickstart", "pickend", "update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const formatColumns = vue.ref([]);
      const itemHeight = vue.ref(35);
      const selectedIndex = vue.ref([]);
      vue.watch(
        [() => props.modelValue, () => props.columns],
        (newValue, oldValue) => {
          if (!isEqual(oldValue[1], newValue[1])) {
            if (isArray(newValue[1]) && newValue[1].length > 0) {
              formatColumns.value = formatArray(newValue[1], props.valueKey, props.labelKey);
            } else {
              formatColumns.value = [];
              selectedIndex.value = [];
            }
          }
          if (isDef(newValue[0])) {
            selectWithValue(newValue[0]);
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      const { proxy } = vue.getCurrentInstance();
      function selectWithValue(value) {
        if (formatColumns.value.length === 0) {
          selectedIndex.value = [];
          return;
        }
        if (value === "" || !isDef(value) || isArray(value) && value.length === 0) {
          value = formatColumns.value.map((col) => {
            return col[0][props.valueKey];
          });
        }
        const valueType = getType(value);
        const type = ["string", "number", "boolean", "array"];
        if (type.indexOf(valueType) === -1)
          formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-picker-view/wd-picker-view.vue:100", `value must be one of ${type.toString()}`);
        value = isArray(value) ? value : [value];
        value = value.slice(0, formatColumns.value.length);
        let selected = deepClone(selectedIndex.value);
        value.forEach((target, col) => {
          let row = formatColumns.value[col].findIndex((row2) => {
            return row2[props.valueKey].toString() === target.toString();
          });
          row = row === -1 ? 0 : row;
          selected = correctSelectedIndex(col, row, selected);
        });
        selectedIndex.value = selected.slice(0, value.length);
      }
      function correctSelected(value) {
        let selected = deepClone(value);
        value.forEach((row, col) => {
          row = range(row, 0, formatColumns.value[col].length - 1);
          selected = correctSelectedIndex(col, row, selected);
        });
        return selected;
      }
      function correctSelectedIndex(columnIndex, rowIndex, selected) {
        const col = formatColumns.value[columnIndex];
        if (!col || !col[rowIndex]) {
          throw Error(`The value to select with Col:${columnIndex} Row:${rowIndex} is incorrect`);
        }
        const select = deepClone(selected);
        select[columnIndex] = rowIndex;
        if (col[rowIndex].disabled) {
          const prev = col.slice(0, rowIndex).reverse().findIndex((s2) => !s2.disabled);
          const next = col.slice(rowIndex + 1).findIndex((s2) => !s2.disabled);
          if (prev !== -1) {
            select[columnIndex] = rowIndex - 1 - prev;
          } else if (next !== -1) {
            select[columnIndex] = rowIndex + 1 + next;
          } else if (select[columnIndex] === void 0) {
            select[columnIndex] = 0;
          }
        }
        return select;
      }
      function onChange({ detail: { value } }) {
        value = value.map((v2) => {
          return Number(v2 || 0);
        });
        const index = getChangeDiff(value);
        selectedIndex.value = deepClone(value);
        vue.nextTick(() => {
          selectedIndex.value = correctSelected(value);
          if (props.columnChange) {
            if (props.columnChange.length < 4) {
              props.columnChange(proxy.$.exposed, getSelects(), index || 0, () => {
              });
              handleChange(index || 0);
            } else {
              props.columnChange(proxy.$.exposed, getSelects(), index || 0, () => {
                handleChange(index || 0);
              });
            }
          } else {
            handleChange(index || 0);
          }
        });
      }
      function getChangeColumn(now, origin) {
        if (!now || !origin)
          return -1;
        const index = now.findIndex((row, index2) => row !== origin[index2]);
        return index;
      }
      function getChangeDiff(value) {
        value = value.slice(0, formatColumns.value.length);
        const origin = deepClone(selectedIndex.value);
        let selected = deepClone(selectedIndex.value);
        value.forEach((row, col) => {
          row = range(row, 0, formatColumns.value[col].length - 1);
          if (row === origin[col])
            return;
          selected = correctSelectedIndex(col, row, selected);
        });
        const diffCol = getChangeColumn(selected, origin);
        if (diffCol === -1)
          return;
        const diffRow = selected[diffCol];
        return selected.length === 1 ? diffRow : diffCol;
      }
      function handleChange(index) {
        const value = getValues();
        if (isEqual(value, props.modelValue))
          return;
        emit("update:modelValue", value);
        setTimeout(() => {
          emit("change", {
            picker: proxy.$.exposed,
            value,
            index
          });
        }, 0);
      }
      function getSelects() {
        const selects = selectedIndex.value.map((row, col) => formatColumns.value[col][row]);
        if (selects.length === 1) {
          return selects[0];
        }
        return selects;
      }
      function getValues() {
        const { valueKey } = props;
        const values = selectedIndex.value.map((row, col) => {
          return formatColumns.value[col][row][valueKey];
        });
        if (values.length === 1) {
          return values[0];
        }
        return values;
      }
      function getLabels() {
        const { labelKey } = props;
        return selectedIndex.value.map((row, col) => formatColumns.value[col][row][labelKey]);
      }
      function getColumnIndex(columnIndex) {
        return selectedIndex.value[columnIndex];
      }
      function getColumnData(columnIndex) {
        return formatColumns.value[columnIndex];
      }
      function setColumnData(columnIndex, data, rowIndex = 0) {
        formatColumns.value[columnIndex] = formatArray(data, props.valueKey, props.labelKey).reduce((acc, val) => acc.concat(val), []);
        selectedIndex.value = correctSelectedIndex(columnIndex, rowIndex, selectedIndex.value);
      }
      function getColumnsData() {
        return deepClone(formatColumns.value);
      }
      function getSelectedIndex() {
        return selectedIndex.value;
      }
      function resetColumns(columns) {
        if (isArray(columns) && columns.length) {
          formatColumns.value = formatArray(columns, props.valueKey, props.labelKey);
        }
      }
      function onPickStart() {
        emit("pickstart");
      }
      function onPickEnd() {
        emit("pickend");
      }
      __expose({
        getSelects,
        getValues,
        setColumnData,
        getColumnsData,
        getColumnData,
        getColumnIndex,
        getLabels,
        getSelectedIndex,
        resetColumns
      });
      const __returned__ = { props, emit, formatColumns, itemHeight, selectedIndex, proxy, selectWithValue, correctSelected, correctSelectedIndex, onChange, getChangeColumn, getChangeDiff, handleChange, getSelects, getValues, getLabels, getColumnIndex, getColumnData, setColumnData, getColumnsData, getSelectedIndex, resetColumns, onPickStart, onPickEnd, wdLoading };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(`wd-picker-view ${_ctx.customClass}`),
        style: vue.normalizeStyle(_ctx.customStyle)
      },
      [
        _ctx.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "wd-picker-view__loading"
        }, [
          vue.createVNode($setup["wdLoading"], { color: _ctx.loadingColor }, null, 8, ["color"])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "view",
          {
            style: vue.normalizeStyle(`height: ${_ctx.columnsHeight - 20}px;`)
          },
          [
            vue.createElementVNode("picker-view", {
              "mask-class": "wd-picker-view__mask",
              "indicator-class": "wd-picker-view__roller",
              "indicator-style": `height: ${$setup.itemHeight}px;`,
              style: vue.normalizeStyle(`height: ${_ctx.columnsHeight - 20}px;`),
              value: $setup.selectedIndex,
              "immediate-change": _ctx.immediateChange,
              onChange: $setup.onChange,
              onPickstart: $setup.onPickStart,
              onPickend: $setup.onPickEnd
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.formatColumns, (col, colIndex) => {
                  return vue.openBlock(), vue.createElementBlock("picker-view-column", {
                    key: colIndex,
                    class: "wd-picker-view-column"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(col, (row, rowIndex) => {
                        return vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: rowIndex,
                            class: vue.normalizeClass(`wd-picker-view-column__item ${row["disabled"] ? "wd-picker-view-column__item--disabled" : ""}  ${$setup.selectedIndex[colIndex] == rowIndex ? "wd-picker-view-column__item--active" : ""}`),
                            style: vue.normalizeStyle(`line-height: ${$setup.itemHeight}px;`)
                          },
                          vue.toDisplayString(row[_ctx.labelKey]),
                          7
                          /* TEXT, CLASS, STYLE */
                        );
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ], 44, ["indicator-style", "value", "immediate-change"])
          ],
          4
          /* STYLE */
        )
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const wdPickerView = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-c3bc94ff"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-picker-view/wd-picker-view.vue"]]);
  const pickerProps = {
    ...baseProps,
    /**
     * label 外部自定义样式
     */
    customLabelClass: makeStringProp(""),
    /**
     * value 外部自定义样式
     */
    customValueClass: makeStringProp(""),
    /**
     * pickerView 外部自定义样式
     */
    customViewClass: makeStringProp(""),
    /**
     * 选择器左侧文案
     */
    label: String,
    /**
     * 选择器占位符
     */
    placeholder: String,
    /**
     * 是否禁用
     */
    disabled: makeBooleanProp(false),
    /**
     * 是否只读
     */
    readonly: makeBooleanProp(false),
    /**
     * 加载中
     */
    loading: makeBooleanProp(false),
    /**
     * 加载中颜色
     */
    loadingColor: makeStringProp("#4D80F0"),
    /* popup */
    /**
     * 弹出层标题
     */
    title: String,
    /**
     * 取消按钮文案
     */
    cancelButtonText: String,
    /**
     * 确认按钮文案
     */
    confirmButtonText: String,
    /**
     * 是否必填
     */
    required: makeBooleanProp(false),
    /**
     * 尺寸
     */
    size: String,
    /**
     * 标签宽度
     */
    labelWidth: String,
    /**
     * 使用默认插槽
     */
    useDefaultSlot: makeBooleanProp(false),
    /**
     * 使用标签插槽
     */
    useLabelSlot: makeBooleanProp(false),
    /**
     * 错误状态
     */
    error: makeBooleanProp(false),
    /**
     * 右对齐
     */
    alignRight: makeBooleanProp(false),
    /**
     * 确定前校验函数，接收 (value, resolve, picker) 参数，通过 resolve 继续执行 picker，resolve 接收1个boolean参数
     */
    beforeConfirm: Function,
    /**
     * 点击蒙层关闭
     */
    closeOnClickModal: makeBooleanProp(true),
    /**
     * 底部安全区域内
     */
    safeAreaInsetBottom: makeBooleanProp(true),
    /**
     * 文本溢出显示省略号
     */
    ellipsis: makeBooleanProp(false),
    /**
     * 选项总高度
     */
    columnsHeight: makeNumberProp(217),
    /**
     * 选项值对应的键名
     */
    valueKey: makeStringProp("value"),
    /**
     * 选项文本对应的键名
     */
    labelKey: makeStringProp("label"),
    /**
     * 选中项，如果为多列选择器，则其类型应为数组
     */
    modelValue: {
      type: [String, Number, Array],
      default: ""
    },
    /**
     * 选择器数据，可以为字符串数组，也可以为对象数组，如果为二维数组，则为多列选择器
     */
    columns: {
      type: Array,
      default: () => []
    },
    /**
     * 接收 pickerView 实例、选中项、当前修改列的下标、resolve 作为入参，根据选中项和列下标进行判断，通过 pickerView 实例暴露出来的 setColumnData 方法修改其他列的数据源。
     */
    columnChange: Function,
    /**
     * 自定义展示文案的格式化函数，返回一个字符串
     */
    displayFormat: Function,
    /**
     * 自定义层级
     */
    zIndex: makeNumberProp(15),
    /**
     * 表单域 model 字段名，在使用表单校验功能的情况下，该属性是必填的
     */
    prop: String,
    /**
     * 表单验证规则，结合wd-form组件使用
     */
    rules: makeArrayProp(),
    /**
     * 是否在手指松开时立即触发 change 事件。若不开启则会在滚动动画结束后触发 change 事件，1.2.25版本起提供，仅微信小程序和支付宝小程序支持。
     */
    immediateChange: makeBooleanProp(false),
    /**
     * 显示清空按钮
     */
    clearable: makeBooleanProp(false)
  };
  const __default__$4 = {
    name: "wd-picker",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$4,
    props: pickerProps,
    emits: ["confirm", "open", "cancel", "clear", "update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const { translate } = useTranslate("picker");
      const props = __props;
      const emit = __emit;
      const pickerViewWd = vue.ref(null);
      const cell = useCell();
      const innerLoading = vue.ref(false);
      const popupShow = vue.ref(false);
      const showValue = vue.ref("");
      const pickerValue = vue.ref("");
      const displayColumns = vue.ref([]);
      const resetColumns = vue.ref([]);
      const isPicking = vue.ref(false);
      const hasConfirmed = vue.ref(false);
      const isLoading = vue.computed(() => {
        return props.loading || innerLoading.value;
      });
      vue.watch(
        () => props.displayFormat,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-picker/wd-picker.vue:125", "The type of displayFormat must be Function");
          }
          if (pickerViewWd.value && pickerViewWd.value.getSelectedIndex().length !== 0) {
            handleShowValueUpdate(props.modelValue);
          }
        },
        {
          immediate: true,
          deep: true
        }
      );
      vue.watch(
        () => props.modelValue,
        (newValue) => {
          pickerValue.value = newValue;
          handleShowValueUpdate(newValue);
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.columns,
        (newValue) => {
          displayColumns.value = deepClone(newValue);
          resetColumns.value = deepClone(newValue);
          if (newValue.length === 0) {
            pickerValue.value = isArray(props.modelValue) ? [] : "";
            showValue.value = "";
          } else {
            handleShowValueUpdate(props.modelValue);
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.columnChange,
        (newValue) => {
          if (newValue && !isFunction(newValue)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-picker/wd-picker.vue:174", "The type of columnChange must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      const { parent: form } = useParent(FORM_KEY);
      const errorMessage = vue.computed(() => {
        if (form && props.prop && form.errorMessages && form.errorMessages[props.prop]) {
          return form.errorMessages[props.prop];
        } else {
          return "";
        }
      });
      const isRequired = vue.computed(() => {
        let formRequired = false;
        if (form && form.props.rules) {
          const rules = form.props.rules;
          for (const key in rules) {
            if (Object.prototype.hasOwnProperty.call(rules, key) && key === props.prop && Array.isArray(rules[key])) {
              formRequired = rules[key].some((rule) => rule.required);
            }
          }
        }
        return props.required || props.rules.some((rule) => rule.required) || formRequired;
      });
      const { proxy } = vue.getCurrentInstance();
      vue.onMounted(() => {
        handleShowValueUpdate(props.modelValue);
      });
      vue.onBeforeMount(() => {
        displayColumns.value = deepClone(props.columns);
        resetColumns.value = deepClone(props.columns);
      });
      function handleShowValueUpdate(value) {
        if (isArray(value) && value.length > 0 || isDef(value) && !isArray(value) && value !== "") {
          if (pickerViewWd.value) {
            vue.nextTick(() => {
              setShowValue(pickerViewWd.value.getSelects());
            });
          } else {
            setShowValue(getSelects(value));
          }
        } else {
          showValue.value = "";
        }
      }
      function getSelects(value) {
        const formatColumns = formatArray(props.columns, props.valueKey, props.labelKey);
        if (props.columns.length === 0)
          return;
        if (value === "" || !isDef(value) || isArray(value) && value.length === 0) {
          return;
        }
        const valueType = getType(value);
        const type = ["string", "number", "boolean", "array"];
        if (type.indexOf(valueType) === -1)
          return [];
        value = isArray(value) ? value : [value];
        value = value.slice(0, formatColumns.length);
        if (value.length === 0) {
          value = formatColumns.map(() => 0);
        }
        let selected = [];
        value.forEach((target, col) => {
          let row = formatColumns[col].findIndex((row2) => {
            return row2[props.valueKey].toString() === target.toString();
          });
          row = row === -1 ? 0 : row;
          selected.push(row);
        });
        const selects = selected.map((row, col) => formatColumns[col][row]);
        if (selects.length === 1) {
          return selects[0];
        }
        return selects;
      }
      function open() {
        showPopup();
      }
      function close() {
        onCancel();
      }
      function showPopup() {
        if (props.disabled || props.readonly)
          return;
        emit("open");
        popupShow.value = true;
        pickerValue.value = props.modelValue;
        displayColumns.value = resetColumns.value;
      }
      function onCancel() {
        popupShow.value = false;
        emit("cancel");
        let timmer = setTimeout(() => {
          clearTimeout(timmer);
          isDef(pickerViewWd.value) && pickerViewWd.value.resetColumns(resetColumns.value);
        }, 300);
      }
      function onConfirm() {
        if (isLoading.value)
          return;
        if (isPicking.value) {
          hasConfirmed.value = true;
          return;
        }
        const { beforeConfirm } = props;
        if (beforeConfirm && isFunction(beforeConfirm)) {
          beforeConfirm(
            pickerValue.value,
            (isPass) => {
              isPass && handleConfirm();
            },
            proxy.$.exposed
          );
        } else {
          handleConfirm();
        }
      }
      function handleConfirm() {
        if (isLoading.value || props.disabled) {
          popupShow.value = false;
          return;
        }
        const selects = pickerViewWd.value.getSelects();
        const values = pickerViewWd.value.getValues();
        const columns = pickerViewWd.value.getColumnsData();
        popupShow.value = false;
        resetColumns.value = deepClone(columns);
        emit("update:modelValue", values);
        setShowValue(selects);
        emit("confirm", {
          value: values,
          selectedItems: selects
        });
      }
      function pickerViewChange({ value }) {
        pickerValue.value = value;
      }
      function setShowValue(items) {
        if (isArray(items) && !items.length || !items)
          return;
        const { valueKey, labelKey } = props;
        showValue.value = (props.displayFormat || defaultDisplayFormat)(items, { valueKey, labelKey });
      }
      function noop() {
      }
      function onPickStart() {
        isPicking.value = true;
      }
      function onPickEnd() {
        isPicking.value = false;
        if (hasConfirmed.value) {
          hasConfirmed.value = false;
          onConfirm();
        }
      }
      function setLoading(loading) {
        innerLoading.value = loading;
      }
      const showClear = vue.computed(() => {
        return props.clearable && !props.disabled && !props.readonly && showValue.value.length;
      });
      function handleClear() {
        const clearValue = isArray(pickerValue.value) ? [] : "";
        emit("update:modelValue", clearValue);
        emit("clear");
      }
      const showArrow = vue.computed(() => {
        return !props.disabled && !props.readonly && !showClear.value;
      });
      __expose({
        close,
        open,
        setLoading
      });
      const __returned__ = { translate, props, emit, pickerViewWd, cell, innerLoading, popupShow, showValue, pickerValue, displayColumns, resetColumns, isPicking, hasConfirmed, isLoading, form, errorMessage, isRequired, proxy, handleShowValueUpdate, getSelects, open, close, showPopup, onCancel, onConfirm, handleConfirm, pickerViewChange, setShowValue, noop, onPickStart, onPickEnd, setLoading, showClear, handleClear, showArrow, wdIcon: __easycom_0$7, wdPopup, wdPickerView };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(`wd-picker ${_ctx.disabled ? "is-disabled" : ""} ${_ctx.size ? "is-" + _ctx.size : ""}  ${$setup.cell.border.value ? "is-border" : ""} ${_ctx.alignRight ? "is-align-right" : ""} ${_ctx.error ? "is-error" : ""} ${_ctx.customClass}`),
        style: vue.normalizeStyle(_ctx.customStyle)
      },
      [
        vue.createElementVNode("view", {
          class: "wd-picker__field",
          onClick: $setup.showPopup
        }, [
          _ctx.useDefaultSlot ? vue.renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "wd-picker__cell"
          }, [
            _ctx.label || _ctx.useLabelSlot ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: vue.normalizeClass(`wd-picker__label ${_ctx.customLabelClass}  ${$setup.isRequired ? "is-required" : ""}`),
                style: vue.normalizeStyle(_ctx.labelWidth ? "min-width:" + _ctx.labelWidth + ";max-width:" + _ctx.labelWidth + ";" : "")
              },
              [
                _ctx.label ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 0 },
                  [
                    vue.createTextVNode(
                      vue.toDisplayString(_ctx.label),
                      1
                      /* TEXT */
                    )
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : vue.renderSlot(_ctx.$slots, "label", { key: 1 }, void 0, true)
              ],
              6
              /* CLASS, STYLE */
            )) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "wd-picker__body" }, [
              vue.createElementVNode("view", { class: "wd-picker__value-wraper" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(`wd-picker__value ${_ctx.ellipsis && "is-ellipsis"} ${_ctx.customValueClass} ${$setup.showValue ? "" : "wd-picker__placeholder"}`)
                  },
                  vue.toDisplayString($setup.showValue ? $setup.showValue : _ctx.placeholder || $setup.translate("placeholder")),
                  3
                  /* TEXT, CLASS */
                ),
                $setup.showArrow ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                  key: 0,
                  "custom-class": "wd-picker__arrow",
                  name: "arrow-right"
                })) : $setup.showClear ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  onClick: vue.withModifiers($setup.handleClear, ["stop"])
                }, [
                  vue.createVNode($setup["wdIcon"], {
                    "custom-class": "wd-picker__clear",
                    name: "error-fill"
                  })
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              $setup.errorMessage ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "wd-picker__error-message"
                },
                vue.toDisplayString($setup.errorMessage),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ]))
        ]),
        vue.createVNode($setup["wdPopup"], {
          modelValue: $setup.popupShow,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.popupShow = $event),
          position: "bottom",
          "hide-when-close": false,
          "close-on-click-modal": _ctx.closeOnClickModal,
          "z-index": _ctx.zIndex,
          "safe-area-inset-bottom": _ctx.safeAreaInsetBottom,
          onClose: $setup.onCancel,
          "custom-class": "wd-picker__popup"
        }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "wd-picker__wraper" }, [
              vue.createElementVNode(
                "view",
                {
                  class: "wd-picker__toolbar",
                  onTouchmove: $setup.noop
                },
                [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "wd-picker__action wd-picker__action--cancel",
                      onClick: $setup.onCancel
                    },
                    vue.toDisplayString(_ctx.cancelButtonText || $setup.translate("cancel")),
                    1
                    /* TEXT */
                  ),
                  _ctx.title ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "wd-picker__title"
                    },
                    vue.toDisplayString(_ctx.title),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(`wd-picker__action ${$setup.isLoading ? "is-loading" : ""}`),
                      onClick: $setup.onConfirm
                    },
                    vue.toDisplayString(_ctx.confirmButtonText || $setup.translate("done")),
                    3
                    /* TEXT, CLASS */
                  )
                ],
                32
                /* NEED_HYDRATION */
              ),
              vue.createVNode($setup["wdPickerView"], {
                ref: "pickerViewWd",
                "custom-class": _ctx.customViewClass,
                modelValue: $setup.pickerValue,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.pickerValue = $event),
                columns: $setup.displayColumns,
                loading: $setup.isLoading,
                "loading-color": _ctx.loadingColor,
                "columns-height": _ctx.columnsHeight,
                "value-key": _ctx.valueKey,
                "label-key": _ctx.labelKey,
                "immediate-change": _ctx.immediateChange,
                onChange: $setup.pickerViewChange,
                onPickstart: $setup.onPickStart,
                onPickend: $setup.onPickEnd,
                "column-change": _ctx.columnChange
              }, null, 8, ["custom-class", "modelValue", "columns", "loading", "loading-color", "columns-height", "value-key", "label-key", "immediate-change", "column-change"])
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["modelValue", "close-on-click-modal", "z-index", "safe-area-inset-bottom"])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-e228acd5"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-picker/wd-picker.vue"]]);
  const toastDefaultOptionKey = "__TOAST_OPTION__";
  const defaultOptions = {
    duration: 2e3,
    show: false
  };
  const None = Symbol("None");
  function useToast(selector = "") {
    const toastOptionKey = getToastOptionKey(selector);
    const toastOption = vue.inject(toastOptionKey, vue.ref(None));
    if (toastOption.value === None) {
      toastOption.value = defaultOptions;
      vue.provide(toastOptionKey, toastOption);
    }
    let timer = null;
    const createMethod = (toastOptions) => {
      return (options) => {
        return show(deepMerge(toastOptions, typeof options === "string" ? { msg: options } : options));
      };
    };
    const show = (option) => {
      const options = deepMerge(defaultOptions, typeof option === "string" ? { msg: option } : option);
      toastOption.value = deepMerge(options, {
        show: true
      });
      timer && clearTimeout(timer);
      if (toastOption.value.duration && toastOption.value.duration > 0) {
        timer = setTimeout(() => {
          timer && clearTimeout(timer);
          close();
        }, options.duration);
      }
    };
    const loading = createMethod({
      iconName: "loading",
      duration: 0,
      cover: true
    });
    const success = createMethod({
      iconName: "success",
      duration: 1500
    });
    const error = createMethod({ iconName: "error" });
    const warning = createMethod({ iconName: "warning" });
    const info = createMethod({ iconName: "info" });
    const close = () => {
      toastOption.value = { show: false };
    };
    return {
      show,
      loading,
      success,
      error,
      warning,
      info,
      close
    };
  }
  const getToastOptionKey = (selector) => {
    return selector ? `${toastDefaultOptionKey}${selector}` : toastDefaultOptionKey;
  };
  const toastIcon = {
    success() {
      return '<svg width="42px" height="42px" viewBox="0 0 42 42" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>成功</title><desc>Created with Sketch.</desc><defs><filter x="-63.2%" y="-80.0%" width="226.3%" height="260.0%" filterUnits="objectBoundingBox" id="filter-1"><feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0.122733141   0 0 0 0 0.710852582   0 0 0 0 0.514812768  0 0 0 1 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix><feMerge><feMergeNode in="shadowMatrixOuter1"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter><rect id="path-2" x="3.4176226" y="5.81442199" width="3" height="8.5" rx="1.5"></rect><linearGradient x1="50%" y1="0.126649064%" x2="50%" y2="100%" id="linearGradient-4"><stop stop-color="#ACFFBD" stop-opacity="0.208123907" offset="0%"></stop><stop stop-color="#10B87C" offset="100%"></stop></linearGradient></defs><g id="规范" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="反馈-轻提示" transform="translate(-388.000000, -538.000000)"><g id="成功" transform="translate(388.000000, 538.000000)"><circle id="Oval" fill="#34D19D" opacity="0.400000006" cx="21" cy="21" r="20"></circle><circle id="Oval" fill="#34D19D" cx="21" cy="21" r="16"></circle><g id="Group-6" filter="url(#filter-1)" transform="translate(11.500000, 14.000000)"><mask id="mask-3" fill="white"><use xlink:href="#path-2"></use></mask><use id="Rectangle-Copy-24" fill="#C4FFEB" transform="translate(4.917623, 10.064422) rotate(-45.000000) translate(-4.917623, -10.064422) " xlink:href="#path-2"></use><rect id="Rectangle" fill="url(#linearGradient-4)" mask="url(#mask-3)" transform="translate(6.215869, 11.372277) rotate(-45.000000) translate(-6.215869, -11.372277) " x="4.71586891" y="9.52269089" width="3" height="3.69917136"></rect><rect id="Rectangle" fill="#FFFFFF" transform="translate(11.636236, 7.232744) scale(1, -1) rotate(-45.000000) translate(-11.636236, -7.232744) " x="10.1362361" y="-1.02185365" width="3" height="16.5091951" rx="1.5"></rect></g></g></g></g></svg>';
    },
    warning() {
      return '<svg width="42px" height="42px" viewBox="0 0 42 42" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>警告</title><desc>Created with Sketch.</desc> <defs> <filter x="-240.0%" y="-60.0%" width="580.0%" height="220.0%" filterUnits="objectBoundingBox" id="filter-1"><feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0.824756567   0 0 0 0 0.450356612   0 0 0 0 0.168550194  0 0 0 1 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix><feMerge><feMergeNode in="shadowMatrixOuter1"></feMergeNode> <feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter></defs><g id="规范" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="反馈-轻提示" transform="translate(-580.000000, -538.000000)"> <g id="警告" transform="translate(580.000000, 538.000000)"><circle id="Oval" fill="#F0883A" opacity="0.400000006" cx="21" cy="21" r="20"></circle><circle id="Oval" fill="#F0883A" cx="21" cy="21" r="16"></circle><g id="Group-6" filter="url(#filter-1)" transform="translate(18.500000, 10.800000)"><rect id="Rectangle" fill="#FFFFFF" transform="translate(2.492935, 7.171583) scale(1, -1) rotate(-360.000000) translate(-2.492935, -7.171583) " x="0.992934699" y="0.955464537" width="3" height="12.4322365" rx="1.5"></rect><rect id="Rectangle-Copy-25" fill="#FFDEC5" transform="translate(2.508751, 17.202636) scale(1, -1) rotate(-360.000000) translate(-2.508751, -17.202636) " x="1.00875134" y="15.200563" width="3" height="4.00414639" rx="1.5"></rect></g></g></g></g></svg>';
    },
    info() {
      return '<svg width="42px" height="42px" viewBox="0 0 42 42" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>常规</title><desc>Created with Sketch.</desc><defs><filter x="-300.0%" y="-57.1%" width="700.0%" height="214.3%" filterUnits="objectBoundingBox" id="filter-1"><feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0.362700096   0 0 0 0 0.409035039   0 0 0 0 0.520238904  0 0 0 1 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix><feMerge><feMergeNode in="shadowMatrixOuter1"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter></defs><g id="规范" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="反馈-轻提示" transform="translate(-772.000000, -538.000000)"><g id="常规" transform="translate(772.000000, 538.000000)"><circle id="Oval" fill="#909CB7" opacity="0.4" cx="21" cy="21" r="20"></circle><circle id="Oval" fill="#909CB7" cx="21" cy="21" r="16"></circle><g id="Group-6" filter="url(#filter-1)" transform="translate(18.500000, 9.800000)"><g id="编组-2" transform="translate(2.492935, 10.204709) rotate(-180.000000) translate(-2.492935, -10.204709) translate(0.992935, 0.204709)"><rect id="Rectangle" fill="#FFFFFF" transform="translate(1.500000, 7.000000) scale(1, -1) rotate(-360.000000) translate(-1.500000, -7.000000) " x="0" y="0" width="3" height="14" rx="1.5"></rect><rect id="Rectangle-Copy-25" fill="#EEEEEE" transform="translate(1.500000, 18.000000) scale(1, -1) rotate(-360.000000) translate(-1.500000, -18.000000) " x="0" y="16" width="3" height="4" rx="1.5"></rect></g></g></g></g></g></svg>';
    },
    error() {
      return '<svg width="42px" height="42px" viewBox="0 0 42 42" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>toast</title><desc>Created with Sketch.</desc><defs><linearGradient x1="99.6229896%" y1="50.3770104%" x2="0.377010363%" y2="50.3770104%" id="linearGradient-1"><stop stop-color="#FFDFDF" offset="0%"></stop><stop stop-color="#F9BEBE" offset="100%"></stop></linearGradient><linearGradient x1="0.377010363%" y1="50.3770104%" x2="99.6229896%" y2="50.3770104%" id="linearGradient-2"><stop stop-color="#FFDFDF" offset="0%"></stop><stop stop-color="#F9BEBE" offset="100%"></stop></linearGradient></defs><g id="规范" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="反馈-轻提示" transform="translate(-196.000000, -538.000000)"> <g id="toast" transform="translate(196.000000, 538.000000)"><circle id="Oval" fill="#FA4350" opacity="0.400000006" cx="21" cy="21" r="20"></circle><circle id="Oval" fill="#FA4350" opacity="0.900000036" cx="21" cy="21" r="16"></circle><rect id="矩形" fill="#FFDFDF" transform="translate(21.071068, 21.071068) rotate(-225.000000) translate(-21.071068, -21.071068) " x="12.5710678" y="19.5710678" width="17" height="3" rx="1.5"></rect><rect id="矩形" fill="url(#linearGradient-1)" transform="translate(19.303301, 22.838835) rotate(-225.000000) translate(-19.303301, -22.838835) " x="17.3033009" y="21.3388348" width="4" height="3"></rect><rect id="矩形" fill="url(#linearGradient-2)" transform="translate(22.838835, 19.303301) rotate(-225.000000) translate(-22.838835, -19.303301) " x="20.8388348" y="17.8033009" width="4" height="3"></rect><rect id="矩形" fill="#FFFFFF" transform="translate(21.071068, 21.071068) rotate(-315.000000) translate(-21.071068, -21.071068) " x="12.5710678" y="19.5710678" width="17" height="3" rx="1.5"></rect></g></g></g></svg>';
    }
  };
  const toastProps = {
    ...baseProps,
    /**
     * 选择器
     * @type {string}
     * @default ''
     */
    selector: makeStringProp(""),
    /**
     * 提示信息
     * @type {string}
     * @default ''
     */
    msg: {
      type: String,
      default: ""
    },
    /**
     * 排列方向
     * @type {'vertical' | 'horizontal'}
     * @default 'horizontal'
     */
    direction: makeStringProp("horizontal"),
    /**
     * 图标名称
     * @type {'success' | 'error' | 'warning' | 'loading' | 'info'}
     * @default ''
     */
    iconName: {
      type: String,
      default: ""
    },
    /**
     * 图标大小
     * @type {number}
     */
    iconSize: Number,
    /**
     * 加载类型
     * @type {'outline' | 'ring'}
     * @default 'outline'
     */
    loadingType: makeStringProp("outline"),
    /**
     * 加载颜色
     * @type {string}
     * @default '#4D80F0'
     */
    loadingColor: {
      type: String,
      default: "#4D80F0"
    },
    /**
     * 加载大小
     * @type {number}
     */
    loadingSize: Number,
    /**
     * 图标颜色
     * @type {string}
     */
    iconColor: String,
    /**
     * 位置
     * @type {'top' | 'middle-top' | 'middle' | 'bottom'}
     * @default 'middle-top'
     */
    position: makeStringProp("middle-top"),
    /**
     * 层级
     * @type {number}
     * @default 100
     */
    zIndex: {
      type: Number,
      default: 100
    },
    /**
     * 是否存在遮罩层
     * @type {boolean}
     * @default false
     */
    cover: {
      type: Boolean,
      default: false
    },
    /**
     * 图标类名
     * @type {string}
     * @default ''
     */
    iconClass: {
      type: String,
      default: ""
    },
    /**
     * 类名前缀
     * @type {string}
     * @default 'wd-icon'
     */
    classPrefix: {
      type: String,
      default: "wd-icon"
    },
    /**
     * 完全展示后的回调函数
     * @type {Function}
     */
    opened: Function,
    /**
     * 完全关闭时的回调函数
     * @type {Function}
     */
    closed: Function
  };
  const __default__$3 = {
    name: "wd-toast",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$3,
    props: toastProps,
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const iconName = vue.ref("");
      const msg = vue.ref("");
      const position = vue.ref("middle");
      const show = vue.ref(false);
      const zIndex = vue.ref(100);
      const loadingType = vue.ref("outline");
      const loadingColor = vue.ref("#4D80F0");
      const iconSize = vue.ref();
      const loadingSize = vue.ref();
      const svgStr = vue.ref("");
      const cover = vue.ref(false);
      const classPrefix = vue.ref("wd-icon");
      const iconClass = vue.ref("");
      const direction = vue.ref("horizontal");
      let opened = null;
      let closed = null;
      const toastOptionKey = getToastOptionKey(props.selector);
      const toastOption = vue.inject(toastOptionKey, vue.ref(defaultOptions));
      vue.watch(
        () => toastOption.value,
        (newVal) => {
          reset(newVal);
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => iconName.value,
        () => {
          buildSvg();
        },
        {
          deep: true,
          immediate: true
        }
      );
      const transitionStyle = vue.computed(() => {
        const style = {
          "z-index": zIndex.value,
          position: "fixed",
          top: "50%",
          left: 0,
          width: "100%",
          transform: "translate(0, -50%)",
          "text-align": "center",
          "pointer-events": "none"
        };
        return objToStyle(style);
      });
      const rootClass = vue.computed(() => {
        return `wd-toast ${props.customClass} wd-toast--${position.value} ${(iconName.value !== "loading" || msg.value) && (iconName.value || iconClass.value) ? "wd-toast--with-icon" : ""} ${iconName.value === "loading" && !msg.value ? "wd-toast--loading" : ""} ${direction.value === "vertical" ? "is-vertical" : ""}`;
      });
      const svgStyle = vue.computed(() => {
        const style = {
          backgroundImage: `url(${svgStr.value})`
        };
        if (isDef(iconSize.value)) {
          style.width = iconSize.value;
          style.height = iconSize.value;
        }
        return objToStyle(style);
      });
      vue.onBeforeMount(() => {
        buildSvg();
      });
      function handleAfterEnter() {
        if (isFunction(opened)) {
          opened();
        }
      }
      function handleAfterLeave() {
        if (isFunction(closed)) {
          closed();
        }
      }
      function buildSvg() {
        if (iconName.value !== "success" && iconName.value !== "warning" && iconName.value !== "info" && iconName.value !== "error")
          return;
        const iconSvg = toastIcon[iconName.value]();
        const iconSvgStr = `"data:image/svg+xml;base64,${encode(iconSvg)}"`;
        svgStr.value = iconSvgStr;
      }
      function reset(option) {
        show.value = isDef(option.show) ? option.show : false;
        if (show.value) {
          mergeOptionsWithProps(option, props);
        }
      }
      function mergeOptionsWithProps(option, props2) {
        iconName.value = isDef(option.iconName) ? option.iconName : props2.iconName;
        iconClass.value = isDef(option.iconClass) ? option.iconClass : props2.iconClass;
        msg.value = isDef(option.msg) ? option.msg : props2.msg;
        position.value = isDef(option.position) ? option.position : props2.position;
        zIndex.value = isDef(option.zIndex) ? option.zIndex : props2.zIndex;
        loadingType.value = isDef(option.loadingType) ? option.loadingType : props2.loadingType;
        loadingColor.value = isDef(option.loadingColor) ? option.loadingColor : props2.loadingColor;
        iconSize.value = isDef(option.iconSize) ? addUnit(option.iconSize) : isDef(props2.iconSize) ? addUnit(props2.iconSize) : void 0;
        loadingSize.value = isDef(option.loadingSize) ? addUnit(option.loadingSize) : isDef(props2.loadingSize) ? addUnit(props2.loadingSize) : void 0;
        cover.value = isDef(option.cover) ? option.cover : props2.cover;
        classPrefix.value = isDef(option.classPrefix) ? option.classPrefix : props2.classPrefix;
        direction.value = isDef(option.direction) ? option.direction : props2.direction;
        closed = isFunction(option.closed) ? option.closed : isFunction(props2.closed) ? props2.closed : null;
        opened = isFunction(option.opened) ? option.opened : isFunction(props2.opened) ? props2.opened : null;
      }
      const __returned__ = { props, iconName, msg, position, show, zIndex, loadingType, loadingColor, iconSize, loadingSize, svgStr, cover, classPrefix, iconClass, direction, get opened() {
        return opened;
      }, set opened(v2) {
        opened = v2;
      }, get closed() {
        return closed;
      }, set closed(v2) {
        closed = v2;
      }, toastOptionKey, toastOption, transitionStyle, rootClass, svgStyle, handleAfterEnter, handleAfterLeave, buildSvg, reset, mergeOptionsWithProps, wdIcon: __easycom_0$7, wdLoading, wdOverlay, wdTransition };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        $setup.cover ? (vue.openBlock(), vue.createBlock($setup["wdOverlay"], {
          key: 0,
          "z-index": $setup.zIndex,
          "lock-scroll": "",
          show: $setup.show,
          "custom-style": "background-color: transparent;pointer-events: auto;"
        }, null, 8, ["z-index", "show"])) : vue.createCommentVNode("v-if", true),
        vue.createVNode($setup["wdTransition"], {
          name: "fade",
          show: $setup.show,
          "custom-style": $setup.transitionStyle,
          onAfterEnter: $setup.handleAfterEnter,
          onAfterLeave: $setup.handleAfterLeave
        }, {
          default: vue.withCtx(() => [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass($setup.rootClass)
              },
              [
                vue.createCommentVNode("iconName优先级更高"),
                $setup.iconName === "loading" ? (vue.openBlock(), vue.createBlock($setup["wdLoading"], {
                  key: 0,
                  type: $setup.loadingType,
                  color: $setup.loadingColor,
                  size: $setup.loadingSize,
                  "custom-class": `wd-toast__icon ${$setup.direction === "vertical" ? "is-vertical" : ""}`
                }, null, 8, ["type", "color", "size", "custom-class"])) : $setup.iconName === "success" || $setup.iconName === "warning" || $setup.iconName === "info" || $setup.iconName === "error" ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 1,
                    class: vue.normalizeClass(`wd-toast__iconWrap wd-toast__icon ${$setup.direction === "vertical" ? "is-vertical" : ""}`)
                  },
                  [
                    vue.createElementVNode("view", { class: "wd-toast__iconBox" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "wd-toast__iconSvg",
                          style: vue.normalizeStyle($setup.svgStyle)
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ],
                  2
                  /* CLASS */
                )) : $setup.iconClass ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                  key: 2,
                  "custom-class": `wd-toast__icon ${$setup.direction === "vertical" ? "is-vertical" : ""}`,
                  size: $setup.iconSize,
                  "class-prefix": $setup.classPrefix,
                  name: $setup.iconClass
                }, null, 8, ["custom-class", "size", "class-prefix", "name"])) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode("文本"),
                $setup.msg ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 3,
                    class: "wd-toast__msg"
                  },
                  vue.toDisplayString($setup.msg),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            )
          ]),
          _: 1
          /* STABLE */
        }, 8, ["show", "custom-style"])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const wdToast = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-fce8c80a"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-toast/wd-toast.vue"]]);
  const __default__$2 = {
    name: "wd-form",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$2,
    props: formProps,
    setup(__props, { expose: __expose }) {
      const { show: showToast } = useToast("wd-form-toast");
      const props = __props;
      const { children, linkChildren } = useChildren(FORM_KEY);
      let errorMessages = vue.reactive({});
      linkChildren({ props, errorMessages });
      vue.watch(
        () => props.model,
        () => {
          if (props.resetOnChange) {
            clearMessage();
          }
        },
        { immediate: true, deep: true }
      );
      async function validate(prop) {
        const errors = [];
        let valid = true;
        const promises = [];
        const formRules = getMergeRules();
        const propsToValidate = isArray(prop) ? prop : isDef(prop) ? [prop] : [];
        const rulesToValidate = propsToValidate.length > 0 ? propsToValidate.reduce((acc, key) => {
          if (formRules[key]) {
            acc[key] = formRules[key];
          }
          return acc;
        }, {}) : formRules;
        for (const propName in rulesToValidate) {
          const rules = rulesToValidate[propName];
          const value = getPropByPath(props.model, propName);
          if (rules && rules.length > 0) {
            for (const rule of rules) {
              if (rule.required && (!isDef(value) || value === "")) {
                errors.push({
                  prop: propName,
                  message: rule.message
                });
                valid = false;
                break;
              }
              if (rule.pattern && !rule.pattern.test(value)) {
                errors.push({
                  prop: propName,
                  message: rule.message
                });
                valid = false;
                break;
              }
              const { validator, ...ruleWithoutValidator } = rule;
              if (validator) {
                const result = validator(value, ruleWithoutValidator);
                if (isPromise(result)) {
                  promises.push(
                    result.then((res) => {
                      if (typeof res === "string") {
                        errors.push({
                          prop: propName,
                          message: res
                        });
                        valid = false;
                      } else if (typeof res === "boolean" && !res) {
                        errors.push({
                          prop: propName,
                          message: rule.message
                        });
                        valid = false;
                      }
                    }).catch((error) => {
                      const message = isDef(error) ? isString(error) ? error : error.message || rule.message : rule.message;
                      errors.push({ prop: propName, message });
                      valid = false;
                    })
                  );
                } else {
                  if (!result) {
                    errors.push({
                      prop: propName,
                      message: rule.message
                    });
                    valid = false;
                  }
                }
              }
            }
          }
        }
        await Promise.all(promises);
        showMessage(errors);
        if (valid) {
          if (propsToValidate.length) {
            propsToValidate.forEach(clearMessage);
          } else {
            clearMessage();
          }
        }
        return {
          valid,
          errors
        };
      }
      function getMergeRules() {
        const mergedRules = deepClone(props.rules);
        const childrenProps = children.map((child) => child.prop);
        Object.keys(mergedRules).forEach((key) => {
          if (!childrenProps.includes(key)) {
            delete mergedRules[key];
          }
        });
        children.forEach((item) => {
          if (isDef(item.prop) && isDef(item.rules) && item.rules.length) {
            if (mergedRules[item.prop]) {
              mergedRules[item.prop] = [...mergedRules[item.prop], ...item.rules];
            } else {
              mergedRules[item.prop] = item.rules;
            }
          }
        });
        return mergedRules;
      }
      function showMessage(errors) {
        const childrenProps = children.map((e2) => e2.prop).filter(Boolean);
        const messages2 = errors.filter((error) => error.message && childrenProps.includes(error.prop));
        if (messages2.length) {
          messages2.sort((a2, b2) => {
            return childrenProps.indexOf(a2.prop) - childrenProps.indexOf(b2.prop);
          });
          if (props.errorType === "toast") {
            showToast(messages2[0].message);
          } else if (props.errorType === "message") {
            messages2.forEach((error) => {
              errorMessages[error.prop] = error.message;
            });
          }
        }
      }
      function clearMessage(prop) {
        if (prop) {
          errorMessages[prop] = "";
        } else {
          Object.keys(errorMessages).forEach((key) => {
            errorMessages[key] = "";
          });
        }
      }
      function reset() {
        clearMessage();
      }
      __expose({ validate, reset });
      const __returned__ = { showToast, props, children, linkChildren, get errorMessages() {
        return errorMessages;
      }, set errorMessages(v2) {
        errorMessages = v2;
      }, validate, getMergeRules, showMessage, clearMessage, reset, wdToast };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(`wd-form ${_ctx.customClass}`),
        style: vue.normalizeStyle(_ctx.customStyle)
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
        $setup.props.errorType === "toast" ? (vue.openBlock(), vue.createBlock($setup["wdToast"], {
          key: 0,
          selector: "wd-form-toast"
        })) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-6504e7d0"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-form/wd-form.vue"]]);
  const _sfc_main$4 = /* @__PURE__ */ vue.defineComponent({
    __name: "create-account",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const columns = vue.ref(["储蓄卡", "信用卡", "股票账户", "基金账户", "现金", "虚拟账户"]);
      const model = vue.reactive({
        accountName: "",
        accountType: columns.value[0]
      });
      const rules = {
        accountName: [{
          required: true,
          pattern: /^.{1,20}$/,
          message: "请输入1-20位字符"
        }]
      };
      const onAmountBlur = (event) => {
        let cleanVal = event.value.replace(/[^\d.]/g, "");
        const parts = cleanVal.split(".");
        if (parts.length > 2) {
          cleanVal = parts[0] + "." + parts[1];
        }
        if (cleanVal.includes(".")) {
          const [intPart, decimalPart] = cleanVal.split(".");
          cleanVal = intPart + "." + decimalPart.slice(0, 2);
        }
        model.balance = cleanVal;
      };
      const form = vue.ref();
      function handleSubmit() {
        form.value.validate().then(({ valid, errors }) => {
          if (valid) {
            dbService2.insertTallyAccount(model.accountName, model.balance, 1, 1, model.accountType);
            uni.switchTab({
              url: `/pages/settle-account/settle-account`
            });
          }
        }).catch((error) => {
          formatAppLog("log", "at pages/settle-account/create-account.vue:74", error, "error");
        });
      }
      const __returned__ = { dbService: dbService2, columns, model, rules, onAmountBlur, form, handleSubmit };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_input = resolveEasycom(vue.resolveDynamicComponent("wd-input"), __easycom_0);
    const _component_wd_picker = resolveEasycom(vue.resolveDynamicComponent("wd-picker"), __easycom_1);
    const _component_wd_cell_group = resolveEasycom(vue.resolveDynamicComponent("wd-cell-group"), __easycom_2$2);
    const _component_wd_button = resolveEasycom(vue.resolveDynamicComponent("wd-button"), __easycom_3$1);
    const _component_wd_form = resolveEasycom(vue.resolveDynamicComponent("wd-form"), __easycom_4);
    return vue.openBlock(), vue.createBlock(_component_wd_form, {
      ref: "form",
      model: $setup.model,
      rules: $setup.rules
    }, {
      default: vue.withCtx(() => [
        vue.createVNode(_component_wd_cell_group, null, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_wd_input, {
              label: "账户名",
              prop: "accountName",
              modelValue: $setup.model.accountName,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.model.accountName = $event),
              clearable: "",
              placeholder: "请输入账户名称",
              maxlength: 20,
              "show-word-limit": ""
            }, null, 8, ["modelValue"]),
            vue.createVNode(_component_wd_input, {
              label: "余额",
              prop: "balance",
              modelValue: $setup.model.balance,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.model.balance = $event),
              onBlur: $setup.onAmountBlur,
              placeholder: "请输入金额"
            }, null, 8, ["modelValue"]),
            vue.createVNode(_component_wd_picker, {
              label: "账户类型",
              prop: "accountType",
              modelValue: $setup.model.accountType,
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.model.accountType = $event),
              placeholder: "请选择账户类型",
              columns: $setup.columns
            }, null, 8, ["modelValue", "columns"])
          ]),
          _: 1
          /* STABLE */
        }),
        vue.createElementVNode("view", { class: "footer" }, [
          vue.createVNode(_component_wd_button, {
            type: "primary",
            size: "large",
            onClick: $setup.handleSubmit,
            block: ""
          }, {
            default: vue.withCtx(() => [
              vue.createTextVNode("保存")
            ]),
            _: 1
            /* STABLE */
          })
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["model"]);
  }
  const PagesSettleAccountCreateAccount = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/create-account.vue"]]);
  function getPickerValue(value, type) {
    const values = [];
    const date = new Date(value);
    if (type === "time") {
      const pair = String(value).split(":");
      values.push(parseInt(pair[0]), parseInt(pair[1]));
    } else {
      values.push(date.getFullYear(), date.getMonth() + 1);
      if (type === "date") {
        values.push(date.getDate());
      } else if (type === "datetime") {
        values.push(date.getDate(), date.getHours(), date.getMinutes());
      }
    }
    return values;
  }
  const datetimePickerViewProps = {
    ...baseProps,
    /**
     * 选中项，当 type 为 time 时，类型为字符串，否则为 时间戳
     */
    modelValue: makeRequiredProp([String, Number]),
    /**
     * 加载中
     */
    loading: makeBooleanProp(false),
    /**
     * 加载的颜色，只能使用十六进制的色值写法，且不能使用缩写
     */
    loadingColor: makeStringProp("#4D80F0"),
    /**
     * picker内部滚筒高
     */
    columnsHeight: makeNumberProp(217),
    valueKey: makeStringProp("value"),
    labelKey: makeStringProp("label"),
    /**
     * 选择器类型，可选值：date / year-month / time
     */
    type: makeStringProp("datetime"),
    /**
     * 自定义过滤选项的函数，返回列的选项数组
     */
    filter: Function,
    /**
     * 自定义弹出层选项文案的格式化函数，返回一个字符串
     */
    formatter: Function,
    /**
     * 自定义列的格式化函数
     */
    columnFormatter: Function,
    /**
     * 最小日期
     */
    minDate: makeNumberProp(new Date((/* @__PURE__ */ new Date()).getFullYear() - 10, 0, 1).getTime()),
    /**
     * 最大日期
     */
    maxDate: makeNumberProp(new Date((/* @__PURE__ */ new Date()).getFullYear() + 10, 11, 31).getTime()),
    /**
     * 最小小时，time类型时生效
     */
    minHour: makeNumberProp(0),
    /**
     * 最大小时，time类型时生效
     */
    maxHour: makeNumberProp(23),
    /**
     * 最小分钟，time类型时生效
     */
    minMinute: makeNumberProp(0),
    /**
     * 最大分钟，time类型时生效
     */
    maxMinute: makeNumberProp(59),
    /**
     * 是否在手指松开时立即触发picker-view的 change 事件。若不开启则会在滚动动画结束后触发 change 事件，1.2.25版本起提供，仅微信小程序和支付宝小程序支持。
     */
    immediateChange: makeBooleanProp(false),
    startSymbol: makeBooleanProp(false)
  };
  const __default__$1 = {
    name: "wd-datetime-picker-view",
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: "shared"
  };
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$1,
    props: datetimePickerViewProps,
    emits: ["change", "pickstart", "pickend", "update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const isValidDate = (date) => isDef(date) && !Number.isNaN(date);
      const times = (n2, iteratee) => {
        let index = -1;
        const length = n2 < 0 ? 0 : n2;
        const result = Array(length);
        while (++index < n2) {
          result[index] = iteratee(index);
        }
        return result;
      };
      const getMonthEndDay = (year, month) => {
        return 32 - new Date(year, month - 1, 32).getDate();
      };
      const props = __props;
      const emit = __emit;
      const datePickerview = vue.ref();
      const innerValue = vue.ref(null);
      const columns = vue.ref([]);
      const pickerValue = vue.ref([]);
      const created = vue.ref(false);
      const { proxy } = vue.getCurrentInstance();
      __expose({
        updateColumns,
        setColumns,
        getSelects,
        correctValue,
        getPickerValue,
        getOriginColumns,
        ...props
      });
      const updateValue = debounce(() => {
        if (!created.value)
          return;
        const val = correctValue(props.modelValue);
        const isEqual2 = val === innerValue.value;
        if (!isEqual2) {
          updateColumnValue(val);
        } else {
          columns.value = updateColumns();
        }
      }, 50);
      vue.watch(
        () => props.modelValue,
        (val, oldVal) => {
          if (val === oldVal)
            return;
          const value = correctValue(val);
          updateColumnValue(value);
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        () => props.type,
        (target) => {
          const type = ["date", "year-month", "time", "datetime", "year"];
          if (type.indexOf(target) === -1) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker-view/wd-datetime-picker-view.vue:126", `type must be one of ${type}`);
          }
          updateValue();
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        () => props.filter,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker-view/wd-datetime-picker-view.vue:138", "The type of filter must be Function");
          }
          updateValue();
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        () => props.formatter,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker-view/wd-datetime-picker-view.vue:149", "The type of formatter must be Function");
          }
          updateValue();
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        () => props.columnFormatter,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker-view/wd-datetime-picker-view.vue:160", "The type of columnFormatter must be Function");
          }
          updateValue();
        },
        { deep: true, immediate: true }
      );
      vue.watch(
        [
          () => props.minDate,
          () => props.maxDate,
          () => props.minHour,
          () => props.maxHour,
          () => props.minMinute,
          () => props.minMinute,
          () => props.maxMinute
        ],
        () => {
          updateValue();
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.onBeforeMount(() => {
        created.value = true;
        const innerValue2 = correctValue(props.modelValue);
        updateColumnValue(innerValue2);
      });
      function onChange({ value }) {
        pickerValue.value = value;
        const result = updateInnerValue();
        emit("update:modelValue", result);
        emit("change", {
          value: result,
          picker: proxy.$.exposed
        });
      }
      function updateColumns() {
        const { formatter, columnFormatter } = props;
        if (columnFormatter) {
          return columnFormatter(proxy.$.exposed);
        } else {
          return getOriginColumns().map((column) => {
            return column.values.map((value) => {
              return {
                label: formatter ? formatter(column.type, padZero(value)) : padZero(value),
                value
              };
            });
          });
        }
      }
      function setColumns(columnList) {
        columns.value = columnList;
      }
      function getOriginColumns() {
        const { filter } = props;
        return getRanges().map(({ type, range: range2 }) => {
          let values = times(range2[1] - range2[0] + 1, (index) => {
            return range2[0] + index;
          });
          if (filter) {
            values = filter(type, values);
          }
          return {
            type,
            values
          };
        });
      }
      function getRanges() {
        if (props.type === "time") {
          return [
            {
              type: "hour",
              range: [props.minHour, props.maxHour]
            },
            {
              type: "minute",
              range: [props.minMinute, props.maxMinute]
            }
          ];
        }
        const { maxYear, maxDate, maxMonth, maxHour, maxMinute } = getBoundary("max", innerValue.value);
        const { minYear, minDate, minMonth, minHour, minMinute } = getBoundary("min", innerValue.value);
        const result = [
          {
            type: "year",
            range: [minYear, maxYear]
          },
          {
            type: "month",
            range: [minMonth, maxMonth]
          },
          {
            type: "date",
            range: [minDate, maxDate]
          },
          {
            type: "hour",
            range: [minHour, maxHour]
          },
          {
            type: "minute",
            range: [minMinute, maxMinute]
          }
        ];
        if (props.type === "date")
          result.splice(3, 2);
        if (props.type === "year-month")
          result.splice(2, 3);
        if (props.type === "year")
          result.splice(1, 4);
        return result;
      }
      function correctValue(value) {
        const isDateType = props.type !== "time";
        if (isDateType && !isValidDate(value)) {
          value = props.minDate;
        } else if (!isDateType && !value) {
          value = `${padZero(props.minHour)}:00`;
        }
        if (!isDateType) {
          let [hour, minute] = value.split(":");
          hour = padZero(range(Number(hour), props.minHour, props.maxHour));
          minute = padZero(range(Number(minute), props.minMinute, props.maxMinute));
          return `${hour}:${minute}`;
        }
        value = Math.min(Math.max(Number(value), props.minDate), props.maxDate);
        return value;
      }
      function getBoundary(type, innerValue2) {
        const value = new Date(innerValue2);
        const boundary = new Date(props[`${type}Date`]);
        const year = boundary.getFullYear();
        let month = 1;
        let date = 1;
        let hour = 0;
        let minute = 0;
        if (type === "max") {
          month = 12;
          date = getMonthEndDay(value.getFullYear(), value.getMonth() + 1);
          hour = 23;
          minute = 59;
        }
        if (value.getFullYear() === year) {
          month = boundary.getMonth() + 1;
          if (value.getMonth() + 1 === month) {
            date = boundary.getDate();
            if (value.getDate() === date) {
              hour = boundary.getHours();
              if (value.getHours() === hour) {
                minute = boundary.getMinutes();
              }
            }
          }
        }
        return {
          [`${type}Year`]: year,
          [`${type}Month`]: month,
          [`${type}Date`]: date,
          [`${type}Hour`]: hour,
          [`${type}Minute`]: minute
        };
      }
      function updateColumnValue(value) {
        const values = getPickerValue(value, props.type);
        if (props.modelValue !== value) {
          emit("update:modelValue", value);
          emit("change", {
            value,
            picker: proxy.$.exposed
          });
        }
        innerValue.value = value;
        columns.value = updateColumns();
        pickerValue.value = values;
      }
      function updateInnerValue() {
        var _a;
        const { type } = props;
        let innerValue2 = "";
        const pickerVal = ((_a = datePickerview.value) == null ? void 0 : _a.getValues()) || [];
        const values = isArray(pickerVal) ? pickerVal : [pickerVal];
        if (type === "time") {
          innerValue2 = `${padZero(values[0])}:${padZero(values[1])}`;
          return innerValue2;
        }
        const year = values[0] && parseInt(values[0]);
        const month = type === "year" ? 1 : values[1] && parseInt(values[1]);
        const maxDate = getMonthEndDay(Number(year), Number(month));
        let date = 1;
        if (type !== "year-month" && type !== "year") {
          date = (Number(values[2]) && parseInt(String(values[2]))) > maxDate ? maxDate : values[2] && parseInt(String(values[2]));
        }
        let hour = 0;
        let minute = 0;
        if (type === "datetime") {
          hour = Number(values[3]) && parseInt(values[3]);
          minute = Number(values[4]) && parseInt(values[4]);
        }
        const value = new Date(Number(year), Number(month) - 1, Number(date), hour, minute).getTime();
        innerValue2 = correctValue(value);
        return innerValue2;
      }
      function columnChange(picker) {
        if (props.type === "time" || props.type === "year-month" || props.type === "year") {
          return;
        }
        const values = picker.getValues();
        const year = Number(values[0]);
        const month = Number(values[1]);
        const maxDate = getMonthEndDay(year, month);
        let date = Number(values[2]);
        date = date > maxDate ? maxDate : date;
        let hour = 0;
        let minute = 0;
        if (props.type === "datetime") {
          hour = Number(values[3]);
          minute = Number(values[4]);
        }
        const value = new Date(year, month - 1, date, hour, minute).getTime();
        innerValue.value = correctValue(value);
        const newColumns = updateColumns();
        const selectedIndex = picker.getSelectedIndex().slice(0);
        newColumns.forEach((_columns, index) => {
          const nextColumnIndex = index + 1;
          const nextColumnData = newColumns[nextColumnIndex];
          if (nextColumnIndex > newColumns.length - 1)
            return;
          picker.setColumnData(
            nextColumnIndex,
            nextColumnData,
            selectedIndex[nextColumnIndex] <= nextColumnData.length - 1 ? selectedIndex[nextColumnIndex] : 0
          );
        });
      }
      function onPickStart() {
        emit("pickstart");
      }
      function onPickEnd() {
        emit("pickend");
      }
      function getSelects() {
        var _a;
        const pickerVal = (_a = datePickerview.value) == null ? void 0 : _a.getSelects();
        if (pickerVal == null)
          return void 0;
        if (isArray(pickerVal))
          return pickerVal;
        return [pickerVal];
      }
      const __returned__ = { isValidDate, times, getMonthEndDay, props, emit, datePickerview, innerValue, columns, pickerValue, created, proxy, updateValue, onChange, updateColumns, setColumns, getOriginColumns, getRanges, correctValue, getBoundary, updateColumnValue, updateInnerValue, columnChange, onPickStart, onPickEnd, getSelects, wdPickerView };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createVNode($setup["wdPickerView"], {
        ref: "datePickerview",
        "custom-class": _ctx.customClass,
        "custom-style": _ctx.customStyle,
        "immediate-change": _ctx.immediateChange,
        modelValue: $setup.pickerValue,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.pickerValue = $event),
        columns: $setup.columns,
        "columns-height": _ctx.columnsHeight,
        columnChange: $setup.columnChange,
        loading: _ctx.loading,
        "loading-color": _ctx.loadingColor,
        onChange: $setup.onChange,
        onPickstart: $setup.onPickStart,
        onPickend: $setup.onPickEnd
      }, null, 8, ["custom-class", "custom-style", "immediate-change", "modelValue", "columns", "columns-height", "loading", "loading-color"])
    ]);
  }
  const wdDatetimePickerView = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-db34fecd"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-datetime-picker-view/wd-datetime-picker-view.vue"]]);
  const datetimePickerProps = {
    ...baseProps,
    /**
     * 选择器左侧文案，label可以不传
     */
    label: String,
    /**
     * 选择器占位符
     */
    placeholder: String,
    /**
     * 禁用
     */
    disabled: makeBooleanProp(false),
    /**
     * 只读
     */
    readonly: makeBooleanProp(false),
    /**
     * 加载中
     */
    loading: makeBooleanProp(false),
    /**
     * 加载的颜色，只能使用十六进制的色值写法，且不能使用缩写
     */
    loadingColor: makeStringProp("#4D80F0"),
    /**
     * 弹出层标题
     */
    title: String,
    /**
     * 取消按钮文案
     */
    cancelButtonText: String,
    /**
     * 确认按钮文案
     */
    confirmButtonText: String,
    /**
     * 是否必填
     */
    required: makeBooleanProp(false),
    /**
     * 设置选择器大小，可选值：large
     */
    size: String,
    /**
     * 设置左侧标题宽度
     */
    labelWidth: makeStringProp("33%"),
    /**
     * 使用默认插槽
     */
    useDefaultSlot: makeBooleanProp(false),
    /**
     * label 使用插槽
     */
    useLabelSlot: makeBooleanProp(false),
    /**
     * 是否为错误状态，错误状态时右侧内容为红色
     */
    error: makeBooleanProp(false),
    /**
     * 选择器的值靠右展示
     */
    alignRight: makeBooleanProp(false),
    /**
     * 点击遮罩是否关闭
     */
    closeOnClickModal: makeBooleanProp(true),
    /**
     * 弹出面板是否设置底部安全距离（iphone X 类型的机型）
     */
    safeAreaInsetBottom: makeBooleanProp(true),
    /**
     * 是否超出隐藏
     */
    ellipsis: makeBooleanProp(false),
    /**
     * picker内部滚筒高
     */
    columnsHeight: makeNumberProp(217),
    valueKey: makeStringProp("value"),
    labelKey: makeStringProp("label"),
    /**
     * 选中项，当 type 为 time 时，类型为字符串；当 type 为 Array 时，类型为范围选择；否则为 时间戳
     */
    modelValue: makeRequiredProp([String, Number, Array]),
    /**
     * 选择器类型，可选值为：date / year-month / time
     */
    type: makeStringProp("datetime"),
    /**
     * 最小日期
     */
    minDate: makeNumberProp(new Date((/* @__PURE__ */ new Date()).getFullYear() - 10, 0, 1).getTime()),
    /**
     * 最大日期
     */
    maxDate: makeNumberProp(new Date((/* @__PURE__ */ new Date()).getFullYear() + 10, 11, 31, 23, 59, 59).getTime()),
    /**
     * 最小小时，time类型时生效
     */
    minHour: makeNumberProp(0),
    /**
     * 最大小时，time类型时生效
     */
    maxHour: makeNumberProp(23),
    /**
     * 最小分钟，time类型时生效
     */
    minMinute: makeNumberProp(0),
    /**
     * 最大分钟，time类型时生效
     */
    maxMinute: makeNumberProp(59),
    /**
     * 自定义过滤选项的函数，返回列的选项数组
     */
    filter: Function,
    /**
     * 自定义弹出层选项文案的格式化函数，返回一个字符串
     */
    formatter: Function,
    /**
     * 自定义展示文案的格式化函数，返回一个字符串
     */
    displayFormat: Function,
    /**
     * 确定前校验函数，接收 (value, resolve, picker) 参数，通过 resolve 继续执行 picker，resolve 接收1个boolean参数
     */
    beforeConfirm: Function,
    /**
     * 在区域选择模式下，自定义展示tab标签文案的格式化函数，返回一个字符串
     */
    displayFormatTabLabel: Function,
    /**
     * 默认日期，类型保持与 value 一致，打开面板时面板自动选到默认日期
     */
    defaultValue: [String, Number, Array],
    /**
     * 弹窗层级
     */
    zIndex: makeNumberProp(15),
    /**
     * 表单域 model 字段名，在使用表单校验功能的情况下，该属性是必填的
     */
    prop: String,
    /**
     * 表单验证规则，结合wd-form组件使用
     */
    rules: makeArrayProp(),
    /**
     * picker cell 外部自定义样式
     */
    customCellClass: makeStringProp(""),
    /**
     * pickerView 外部自定义样式
     */
    customViewClass: makeStringProp(""),
    /**
     * label 外部自定义样式
     */
    customLabelClass: makeStringProp(""),
    /**
     * value 外部自定义样式
     */
    customValueClass: makeStringProp(""),
    /**
     * 是否在手指松开时立即触发picker-view的 change 事件。若不开启则会在滚动动画结束后触发 change 事件，1.2.25版本起提供，仅微信小程序和支付宝小程序支持。
     */
    immediateChange: makeBooleanProp(false)
  };
  class Dayjs {
    constructor(dateStr) {
      this.utc = false;
      const parsedDate = this.parseConfig(dateStr);
      this.date = new Date(parsedDate);
      this.timeZone = this.date.getTimezoneOffset() / 60;
      this.timeZoneString = this.padNumber(String(-1 * this.timeZone).replace(/^(.)?(\d)/, "$10$200"), 5, "+");
      this.mYear = this.date.getFullYear();
      this.mMonth = this.date.getMonth();
      this.mDay = this.date.getDate();
      this.mWeek = this.date.getDay();
      this.mHour = this.date.getHours();
      this.mMinute = this.date.getMinutes();
      this.mSecond = this.date.getSeconds();
    }
    parseConfig(dateStr) {
      if (!dateStr)
        return /* @__PURE__ */ new Date();
      if (isDate(dateStr))
        return dateStr;
      if (/^(\d){8}$/.test(dateStr)) {
        this.utc = true;
        return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
      }
      return dateStr;
    }
    padNumber(num, length, padChar) {
      return !num || num.length >= length ? num : `${Array(length + 1 - num.length).join(padChar)}${num}`;
    }
    year() {
      return this.mYear;
    }
    month() {
      return this.mMonth;
    }
    unix() {
      const timeZoneOffset = this.utc ? 60 * this.timeZone * 60 * 1e3 : 0;
      return Math.floor((this.date.getTime() + timeZoneOffset) / 1e3);
    }
    toString() {
      return this.date.toUTCString();
    }
    startOf(unit) {
      switch (unit) {
        case "year":
          return new Dayjs(new Date(this.year(), 0, 1));
        case "month":
          return new Dayjs(new Date(this.year(), this.month(), 1));
        default:
          return this;
      }
    }
    add(amount, unit) {
      let interval;
      switch (unit) {
        case "m":
        case "minutes":
          interval = 60;
          break;
        case "h":
        case "hours":
          interval = 60 * 60;
          break;
        case "d":
        case "days":
          interval = 24 * 60 * 60;
          break;
        case "w":
        case "weeks":
          interval = 7 * 24 * 60 * 60;
          break;
        default:
          interval = 1;
      }
      const newUnixTime = this.unix() + amount * interval;
      return new Dayjs(1e3 * newUnixTime);
    }
    subtract(amount, unit) {
      return this.add(-1 * amount, unit);
    }
    format(formatStr = "YYYY-MM-DDTHH:mm:ssZ") {
      const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return formatStr.replace(/Y{2,4}|M{1,2}|D{1,2}|d{1,4}|H{1,2}|m{1,2}|s{1,2}|Z{1,2}/g, (match) => {
        switch (match) {
          case "YY":
            return String(this.mYear).slice(-2);
          case "YYYY":
            return String(this.mYear);
          case "M":
            return String(this.mMonth + 1);
          case "MM":
            return this.padNumber(String(this.mMonth + 1), 2, "0");
          case "D":
            return String(this.mDay);
          case "DD":
            return this.padNumber(String(this.mDay), 2, "0");
          case "d":
            return String(this.mWeek);
          case "dddd":
            return weekdays[this.mWeek];
          case "H":
            return String(this.mHour);
          case "HH":
            return this.padNumber(String(this.mHour), 2, "0");
          case "m":
            return String(this.mMinute);
          case "mm":
            return this.padNumber(String(this.mMinute), 2, "0");
          case "s":
            return String(this.mSecond);
          case "ss":
            return this.padNumber(String(this.mSecond), 2, "0");
          case "Z":
            return `${this.timeZoneString.slice(0, -2)}:00`;
          case "ZZ":
            return this.timeZoneString;
          default:
            return match;
        }
      });
    }
  }
  function dayjs(dateStr) {
    return new Dayjs(dateStr);
  }
  const __default__ = {
    name: "wd-datetime-picker",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    ...__default__,
    props: datetimePickerProps,
    emits: ["change", "open", "toggle", "cancel", "confirm", "update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const { translate } = useTranslate("datetime-picker");
      const datetimePickerView = vue.ref();
      const datetimePickerView1 = vue.ref();
      const showValue = vue.ref("");
      const popupShow = vue.ref(false);
      const showStart = vue.ref(true);
      const region = vue.ref(false);
      const showTabLabel = vue.ref([]);
      const innerValue = vue.ref("");
      const endInnerValue = vue.ref("");
      const isPicking = vue.ref(false);
      const hasConfirmed = vue.ref(false);
      const isLoading = vue.ref(false);
      const { proxy } = vue.getCurrentInstance();
      const cell = useCell();
      vue.watch(
        () => props.modelValue,
        (val, oldVal) => {
          if (isEqual(val, oldVal))
            return;
          if (isArray(val)) {
            region.value = true;
            innerValue.value = deepClone(getDefaultInnerValue(true));
            endInnerValue.value = deepClone(getDefaultInnerValue(true, true));
          } else {
            innerValue.value = deepClone(getDefaultInnerValue());
          }
          vue.nextTick(() => {
            setShowValue(false, false, true);
          });
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.displayFormat,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker/wd-datetime-picker.vue:223", "The type of displayFormat must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.filter,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker/wd-datetime-picker.vue:235", "The type of filter must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.formatter,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker/wd-datetime-picker.vue:247", "The type of formatter must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.beforeConfirm,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker/wd-datetime-picker.vue:259", "The type of beforeConfirm must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.displayFormatTabLabel,
        (fn) => {
          if (fn && !isFunction(fn)) {
            formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-datetime-picker/wd-datetime-picker.vue:271", "The type of displayFormatTabLabel must be Function");
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.defaultValue,
        (val) => {
          if (isArray(val) || region.value) {
            innerValue.value = deepClone(getDefaultInnerValue(true));
            endInnerValue.value = deepClone(getDefaultInnerValue(true, true));
          } else {
            innerValue.value = deepClone(getDefaultInnerValue());
          }
        },
        {
          deep: true,
          immediate: true
        }
      );
      const { parent: form } = useParent(FORM_KEY);
      const errorMessage = vue.computed(() => {
        if (form && props.prop && form.errorMessages && form.errorMessages[props.prop]) {
          return form.errorMessages[props.prop];
        } else {
          return "";
        }
      });
      const isRequired = vue.computed(() => {
        let formRequired = false;
        if (form && form.props.rules) {
          const rules = form.props.rules;
          for (const key in rules) {
            if (Object.prototype.hasOwnProperty.call(rules, key) && key === props.prop && Array.isArray(rules[key])) {
              formRequired = rules[key].some((rule) => rule.required);
            }
          }
        }
        return props.required || props.rules.some((rule) => rule.required) || formRequired;
      });
      function handleBoundaryValue(isStart, columnType, value, currentArray, boundary) {
        const { type } = props;
        switch (type) {
          case "datetime": {
            const [year, month, date, hour, minute] = boundary;
            if (columnType === "year") {
              return isStart ? value > year : value < year;
            }
            if (columnType === "month" && currentArray[0] === year) {
              return isStart ? value > month : value < month;
            }
            if (columnType === "date" && currentArray[0] === year && currentArray[1] === month) {
              return isStart ? value > date : value < date;
            }
            if (columnType === "hour" && currentArray[0] === year && currentArray[1] === month && currentArray[2] === date) {
              return isStart ? value > hour : value < hour;
            }
            if (columnType === "minute" && currentArray[0] === year && currentArray[1] === month && currentArray[2] === date && currentArray[3] === hour) {
              return isStart ? value > minute : value < minute;
            }
            break;
          }
          case "year-month": {
            const [year, month] = boundary;
            if (columnType === "year") {
              return isStart ? value > year : value < year;
            }
            if (columnType === "month" && currentArray[0] === year) {
              return isStart ? value > month : value < month;
            }
            break;
          }
          case "year": {
            const [year] = boundary;
            if (columnType === "year") {
              return isStart ? value > year : value < year;
            }
            break;
          }
          case "date": {
            const [year, month, date] = boundary;
            if (columnType === "year") {
              return isStart ? value > year : value < year;
            }
            if (columnType === "month" && currentArray[0] === year) {
              return isStart ? value > month : value < month;
            }
            if (columnType === "date" && currentArray[0] === year && currentArray[1] === month) {
              return isStart ? value > date : value < date;
            }
            break;
          }
          case "time": {
            const [hour, minute] = boundary;
            if (columnType === "hour") {
              return isStart ? value > hour : value < hour;
            }
            if (columnType === "minute" && currentArray[0] === hour) {
              return isStart ? value > minute : value < minute;
            }
            break;
          }
        }
        return false;
      }
      const customColumnFormatter = (picker) => {
        if (!picker)
          return [];
        const { type } = props;
        const { startSymbol, formatter } = picker;
        const start = picker.correctValue(innerValue.value);
        const end = picker.correctValue(endInnerValue.value);
        const currentValue = startSymbol ? picker.getPickerValue(start, type) : picker.getPickerValue(end, type);
        const boundary = startSymbol ? picker.getPickerValue(end, type) : picker.getPickerValue(start, type);
        const columns = picker.getOriginColumns();
        return columns.map((column, _2) => {
          return column.values.map((value) => {
            const disabled = handleBoundaryValue(startSymbol, column.type, value, currentValue, boundary);
            return {
              label: formatter ? formatter(column.type, padZero(value)) : padZero(value),
              value,
              disabled
            };
          });
        });
      };
      vue.onBeforeMount(() => {
        const { modelValue: value } = props;
        if (isArray(value)) {
          region.value = true;
          innerValue.value = deepClone(getDefaultInnerValue(true));
          endInnerValue.value = deepClone(getDefaultInnerValue(true, true));
        } else {
          innerValue.value = deepClone(getDefaultInnerValue());
        }
      });
      vue.onMounted(() => {
        setShowValue(false, false, true);
      });
      function getSelects(picker) {
        let value = picker === "before" ? innerValue.value : endInnerValue.value;
        let selected = [];
        if (value) {
          selected = getPickerValue(value, props.type);
        }
        let selects = selected.map((value2) => {
          return {
            [props.labelKey]: padZero(value2),
            [props.valueKey]: value2
          };
        });
        return selects;
      }
      function noop() {
      }
      function getDefaultInnerValue(isRegion, isEnd) {
        const { modelValue: value, defaultValue, maxDate, minDate, type } = props;
        if (isRegion) {
          const index = isEnd ? 1 : 0;
          const targetValue = isArray(value) ? value[index] : "";
          const targetDefault = isArray(defaultValue) ? defaultValue[index] : "";
          const maxValue = type === "time" ? dayjs(maxDate).format("HH:mm") : maxDate;
          const minValue = type === "time" ? dayjs(minDate).format("HH:mm") : minDate;
          return targetValue || targetDefault || (isEnd ? maxValue : minValue);
        } else {
          return isDef(value || defaultValue) ? value || defaultValue : "";
        }
      }
      function open() {
        showPopup();
      }
      function close() {
        onCancel();
      }
      function showPopup() {
        if (props.disabled || props.readonly)
          return;
        emit("open");
        if (region.value) {
          popupShow.value = true;
          showStart.value = true;
          innerValue.value = deepClone(getDefaultInnerValue(true, false));
          endInnerValue.value = deepClone(getDefaultInnerValue(true, true));
        } else {
          popupShow.value = true;
          innerValue.value = deepClone(getDefaultInnerValue());
        }
        setShowValue(true, false, true);
      }
      function tabChange() {
        showStart.value = !showStart.value;
        const picker = showStart.value ? datetimePickerView.value : datetimePickerView1.value;
        picker.setColumns(picker.updateColumns());
        emit("toggle", showStart.value ? innerValue.value : endInnerValue.value);
      }
      function onChangeStart({ value }) {
        if (!datetimePickerView.value)
          return;
        if (region.value && !datetimePickerView1.value)
          return;
        if (region.value) {
          const currentArray = datetimePickerView.value.getPickerValue(value, props.type);
          const boundaryArray = datetimePickerView.value.getPickerValue(endInnerValue.value, props.type);
          const columns = datetimePickerView.value.getOriginColumns();
          const needsAdjust = columns.some((column, index) => {
            return handleBoundaryValue(true, column.type, currentArray[index], currentArray, boundaryArray);
          });
          innerValue.value = deepClone(needsAdjust ? endInnerValue.value : value);
          vue.nextTick(() => {
            showTabLabel.value = [setTabLabel(), deepClone(showTabLabel.value[1])];
            emit("change", {
              value: [innerValue.value, endInnerValue.value]
            });
            datetimePickerView.value && datetimePickerView.value.setColumns(datetimePickerView.value.updateColumns());
            datetimePickerView1.value && datetimePickerView1.value.setColumns(datetimePickerView1.value.updateColumns());
          });
        } else {
          innerValue.value = deepClone(value);
          emit("change", {
            value: innerValue.value
          });
        }
      }
      function onChangeEnd({ value }) {
        if (!datetimePickerView.value || !datetimePickerView1.value)
          return;
        const currentArray = datetimePickerView1.value.getPickerValue(value, props.type);
        const boundaryArray = datetimePickerView1.value.getPickerValue(innerValue.value, props.type);
        const columns = datetimePickerView1.value.getOriginColumns();
        const needsAdjust = columns.some((column, index) => {
          return handleBoundaryValue(false, column.type, currentArray[index], currentArray, boundaryArray);
        });
        endInnerValue.value = deepClone(needsAdjust ? innerValue.value : value);
        vue.nextTick(() => {
          showTabLabel.value = [deepClone(showTabLabel.value[0]), setTabLabel(1)];
          emit("change", {
            value: [innerValue.value, endInnerValue.value]
          });
          datetimePickerView.value && datetimePickerView.value.setColumns(datetimePickerView.value.updateColumns());
          datetimePickerView1.value && datetimePickerView1.value.setColumns(datetimePickerView1.value.updateColumns());
        });
      }
      function onCancel() {
        popupShow.value = false;
        setTimeout(() => {
          if (region.value) {
            innerValue.value = deepClone(getDefaultInnerValue(true));
            endInnerValue.value = deepClone(getDefaultInnerValue(true, true));
          } else {
            innerValue.value = deepClone(getDefaultInnerValue());
          }
        }, 200);
        emit("cancel");
      }
      function onConfirm() {
        if (props.loading || isLoading.value)
          return;
        if (isPicking.value) {
          hasConfirmed.value = true;
          return;
        }
        const { beforeConfirm } = props;
        if (beforeConfirm) {
          beforeConfirm(
            region.value ? [innerValue.value, endInnerValue.value] : innerValue.value,
            (isPass) => {
              isPass && handleConfirm();
            },
            proxy.$.exposed
          );
        } else {
          handleConfirm();
        }
      }
      function onPickStart() {
        isPicking.value = true;
      }
      function onPickEnd() {
        isPicking.value = false;
        setTimeout(() => {
          if (hasConfirmed.value) {
            hasConfirmed.value = false;
            onConfirm();
          }
        }, 50);
      }
      function handleConfirm() {
        if (props.loading || isLoading.value || props.disabled) {
          popupShow.value = false;
          return;
        }
        const value = region.value ? [innerValue.value, endInnerValue.value] : innerValue.value;
        popupShow.value = false;
        emit("update:modelValue", value);
        emit("confirm", {
          value
        });
        setShowValue(false, true);
      }
      function setTabLabel(index = 0) {
        if (region.value) {
          let items = [];
          if (index === 0) {
            items = (datetimePickerView.value ? datetimePickerView.value.getSelects() : void 0) || innerValue.value && getSelects("before");
          } else {
            items = (datetimePickerView1.value ? datetimePickerView1.value.getSelects() : void 0) || endInnerValue.value && getSelects("after");
          }
          return defaultDisplayFormat2(items, true);
        } else {
          return "";
        }
      }
      function setShowValue(tab = false, isConfirm = false, beforeMount = false) {
        if (region.value) {
          const items = beforeMount ? innerValue.value && getSelects("before") || [] : datetimePickerView.value && datetimePickerView.value.getSelects && datetimePickerView.value.getSelects() || [];
          const endItems = beforeMount ? endInnerValue.value && getSelects("after") || [] : datetimePickerView1.value && datetimePickerView1.value.getSelects && datetimePickerView1.value.getSelects() || [];
          showValue.value = tab ? showValue.value : [
            props.modelValue[0] || isConfirm ? defaultDisplayFormat2(items) : "",
            props.modelValue[1] || isConfirm ? defaultDisplayFormat2(endItems) : ""
          ];
          showTabLabel.value = [defaultDisplayFormat2(items, true), defaultDisplayFormat2(endItems, true)];
        } else {
          const items = beforeMount ? innerValue.value && getSelects("before") || [] : datetimePickerView.value && datetimePickerView.value.getSelects && datetimePickerView.value.getSelects() || [];
          showValue.value = deepClone(props.modelValue || isConfirm ? defaultDisplayFormat2(items) : "");
        }
      }
      function defaultDisplayFormat2(items, tabLabel = false) {
        if (items.length === 0)
          return "";
        if (tabLabel && props.displayFormatTabLabel) {
          return props.displayFormatTabLabel(items);
        }
        if (props.displayFormat) {
          return props.displayFormat(items);
        }
        if (props.formatter) {
          const typeMaps = {
            year: ["year"],
            datetime: ["year", "month", "date", "hour", "minute"],
            date: ["year", "month", "date"],
            time: ["hour", "minute"],
            "year-month": ["year", "month"]
          };
          return items.map((item, index) => {
            return props.formatter(typeMaps[props.type][index], item.value);
          }).join("");
        }
        switch (props.type) {
          case "year":
            return items[0].label;
          case "date":
            return `${items[0].label}-${items[1].label}-${items[2].label}`;
          case "year-month":
            return `${items[0].label}-${items[1].label}`;
          case "time":
            return `${items[0].label}:${items[1].label}`;
          case "datetime":
            return `${items[0].label}-${items[1].label}-${items[2].label} ${items[3].label}:${items[4].label}`;
        }
      }
      function setLoading(loading) {
        isLoading.value = loading;
      }
      __expose({
        open,
        close,
        setLoading
      });
      const __returned__ = { props, emit, translate, datetimePickerView, datetimePickerView1, showValue, popupShow, showStart, region, showTabLabel, innerValue, endInnerValue, isPicking, hasConfirmed, isLoading, proxy, cell, form, errorMessage, isRequired, handleBoundaryValue, customColumnFormatter, getSelects, noop, getDefaultInnerValue, open, close, showPopup, tabChange, onChangeStart, onChangeEnd, onCancel, onConfirm, onPickStart, onPickEnd, handleConfirm, setTabLabel, setShowValue, defaultDisplayFormat: defaultDisplayFormat2, setLoading, wdPopup, wdDatetimePickerView, get isArray() {
        return isArray;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$7);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(`wd-picker ${_ctx.disabled ? "is-disabled" : ""} ${_ctx.size ? "is-" + _ctx.size : ""}  ${$setup.cell.border.value ? "is-border" : ""} ${_ctx.alignRight ? "is-align-right" : ""} ${_ctx.error ? "is-error" : ""} ${_ctx.customClass}`),
        style: vue.normalizeStyle(_ctx.customStyle)
      },
      [
        vue.createCommentVNode("文案"),
        vue.createElementVNode("view", {
          class: "wd-picker__field",
          onClick: $setup.showPopup
        }, [
          _ctx.$slots.default ? vue.renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: vue.normalizeClass(["wd-picker__cell", _ctx.customCellClass])
            },
            [
              _ctx.label || _ctx.$slots.label ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: vue.normalizeClass(`wd-picker__label ${_ctx.customLabelClass} ${$setup.isRequired ? "is-required" : ""}`),
                  style: vue.normalizeStyle(_ctx.labelWidth ? "min-width:" + _ctx.labelWidth + ";max-width:" + _ctx.labelWidth + ";" : "")
                },
                [
                  _ctx.$slots.label ? vue.renderSlot(_ctx.$slots, "label", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createElementBlock(
                    vue.Fragment,
                    { key: 1 },
                    [
                      vue.createTextVNode(
                        vue.toDisplayString(_ctx.label),
                        1
                        /* TEXT */
                      )
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ],
                6
                /* CLASS, STYLE */
              )) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "wd-picker__body" }, [
                vue.createElementVNode("view", { class: "wd-picker__value-wraper" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(`wd-picker__value ${_ctx.customValueClass}`)
                    },
                    [
                      $setup.region ? (vue.openBlock(), vue.createElementBlock(
                        vue.Fragment,
                        { key: 0 },
                        [
                          $setup.isArray($setup.showValue) ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                            vue.createElementVNode(
                              "text",
                              {
                                class: vue.normalizeClass($setup.showValue[0] ? "" : "wd-picker__placeholder")
                              },
                              vue.toDisplayString($setup.showValue[0] ? $setup.showValue[0] : _ctx.placeholder || $setup.translate("placeholder")),
                              3
                              /* TEXT, CLASS */
                            ),
                            vue.createTextVNode(
                              " " + vue.toDisplayString($setup.translate("to")) + " ",
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              {
                                class: vue.normalizeClass($setup.showValue[1] ? "" : "wd-picker__placeholder")
                              },
                              vue.toDisplayString($setup.showValue[1] ? $setup.showValue[1] : _ctx.placeholder || $setup.translate("placeholder")),
                              3
                              /* TEXT, CLASS */
                            )
                          ])) : (vue.openBlock(), vue.createElementBlock(
                            "view",
                            {
                              key: 1,
                              class: "wd-picker__placeholder"
                            },
                            vue.toDisplayString(_ctx.placeholder || $setup.translate("placeholder")),
                            1
                            /* TEXT */
                          ))
                        ],
                        64
                        /* STABLE_FRAGMENT */
                      )) : (vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          key: 1,
                          class: vue.normalizeClass($setup.showValue ? "" : "wd-picker__placeholder")
                        },
                        vue.toDisplayString($setup.showValue ? $setup.showValue : _ctx.placeholder || $setup.translate("placeholder")),
                        3
                        /* TEXT, CLASS */
                      ))
                    ],
                    2
                    /* CLASS */
                  ),
                  !_ctx.disabled && !_ctx.readonly ? (vue.openBlock(), vue.createBlock(_component_wd_icon, {
                    key: 0,
                    "custom-class": "wd-picker__arrow",
                    name: "arrow-right"
                  })) : vue.createCommentVNode("v-if", true)
                ]),
                $setup.errorMessage ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "wd-picker__error-message"
                  },
                  vue.toDisplayString($setup.errorMessage),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ],
            2
            /* CLASS */
          ))
        ]),
        vue.createCommentVNode("弹出层，picker-view 在隐藏时修改值，会触发多次change事件，从而导致所有列选中第一项，因此picker在关闭时不隐藏 "),
        vue.createVNode($setup["wdPopup"], {
          modelValue: $setup.popupShow,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.popupShow = $event),
          position: "bottom",
          "hide-when-close": false,
          "close-on-click-modal": _ctx.closeOnClickModal,
          "safe-area-inset-bottom": _ctx.safeAreaInsetBottom,
          "z-index": _ctx.zIndex,
          onClose: $setup.onCancel,
          "custom-class": "wd-picker__popup"
        }, {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "wd-picker__wraper" }, [
              vue.createCommentVNode("toolBar"),
              vue.createElementVNode(
                "view",
                {
                  class: "wd-picker__toolbar",
                  onTouchmove: $setup.noop
                },
                [
                  vue.createCommentVNode("取消按钮"),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "wd-picker__action wd-picker__action--cancel",
                      onClick: $setup.onCancel
                    },
                    vue.toDisplayString(_ctx.cancelButtonText || $setup.translate("cancel")),
                    1
                    /* TEXT */
                  ),
                  vue.createCommentVNode("标题"),
                  _ctx.title ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "wd-picker__title"
                    },
                    vue.toDisplayString(_ctx.title),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  vue.createCommentVNode("确定按钮"),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(`wd-picker__action ${_ctx.loading || $setup.isLoading ? "is-loading" : ""}`),
                      onClick: $setup.onConfirm
                    },
                    vue.toDisplayString(_ctx.confirmButtonText || $setup.translate("confirm")),
                    3
                    /* TEXT, CLASS */
                  )
                ],
                32
                /* NEED_HYDRATION */
              ),
              vue.createCommentVNode(" 区域选择tab展示 "),
              $setup.region ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "wd-picker__region-tabs"
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(`wd-picker__region ${$setup.showStart ? "is-active" : ""} `),
                    onClick: $setup.tabChange
                  },
                  [
                    vue.createElementVNode(
                      "view",
                      null,
                      vue.toDisplayString($setup.translate("start")),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "wd-picker__region-time" },
                      vue.toDisplayString($setup.showTabLabel[0]),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                ),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(`wd-picker__region ${$setup.showStart ? "" : "is-active"}`),
                    onClick: $setup.tabChange
                  },
                  [
                    vue.createElementVNode(
                      "view",
                      null,
                      vue.toDisplayString($setup.translate("end")),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "wd-picker__region-time" },
                      vue.toDisplayString($setup.showTabLabel[1]),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )
              ])) : vue.createCommentVNode("v-if", true),
              vue.createCommentVNode("datetimePickerView"),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass($setup.showStart ? "wd-picker__show" : "wd-picker__hidden")
                },
                [
                  vue.createVNode($setup["wdDatetimePickerView"], {
                    "custom-class": _ctx.customViewClass,
                    ref: "datetimePickerView",
                    type: _ctx.type,
                    modelValue: $setup.innerValue,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.innerValue = $event),
                    loading: _ctx.loading || $setup.isLoading,
                    "loading-color": _ctx.loadingColor,
                    "columns-height": _ctx.columnsHeight,
                    "value-key": _ctx.valueKey,
                    "label-key": _ctx.labelKey,
                    formatter: _ctx.formatter,
                    filter: _ctx.filter,
                    "column-formatter": $setup.isArray(_ctx.modelValue) ? $setup.customColumnFormatter : void 0,
                    "max-hour": _ctx.maxHour,
                    "min-hour": _ctx.minHour,
                    "max-date": _ctx.maxDate,
                    "min-date": _ctx.minDate,
                    "max-minute": _ctx.maxMinute,
                    "min-minute": _ctx.minMinute,
                    "start-symbol": true,
                    "immediate-change": _ctx.immediateChange,
                    onChange: $setup.onChangeStart,
                    onPickstart: $setup.onPickStart,
                    onPickend: $setup.onPickEnd
                  }, null, 8, ["custom-class", "type", "modelValue", "loading", "loading-color", "columns-height", "value-key", "label-key", "formatter", "filter", "column-formatter", "max-hour", "min-hour", "max-date", "min-date", "max-minute", "min-minute", "immediate-change"])
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass($setup.showStart ? "wd-picker__hidden" : "wd-picker__show")
                },
                [
                  vue.createVNode($setup["wdDatetimePickerView"], {
                    "custom-class": _ctx.customViewClass,
                    ref: "datetimePickerView1",
                    type: _ctx.type,
                    modelValue: $setup.endInnerValue,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.endInnerValue = $event),
                    loading: _ctx.loading || $setup.isLoading,
                    "loading-color": _ctx.loadingColor,
                    "columns-height": _ctx.columnsHeight,
                    "value-key": _ctx.valueKey,
                    "label-key": _ctx.labelKey,
                    formatter: _ctx.formatter,
                    filter: _ctx.filter,
                    "column-formatter": $setup.isArray(_ctx.modelValue) ? $setup.customColumnFormatter : void 0,
                    "max-hour": _ctx.maxHour,
                    "min-hour": _ctx.minHour,
                    "max-date": _ctx.maxDate,
                    "min-date": _ctx.minDate,
                    "max-minute": _ctx.maxMinute,
                    "min-minute": _ctx.minMinute,
                    "start-symbol": false,
                    "immediate-change": _ctx.immediateChange,
                    onChange: $setup.onChangeEnd,
                    onPickstart: $setup.onPickStart,
                    onPickend: $setup.onPickEnd
                  }, null, 8, ["custom-class", "type", "modelValue", "loading", "loading-color", "columns-height", "value-key", "label-key", "formatter", "filter", "column-formatter", "max-hour", "min-hour", "max-date", "min-date", "max-minute", "min-minute", "immediate-change"])
                ],
                2
                /* CLASS */
              )
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["modelValue", "close-on-click-modal", "safe-area-inset-bottom", "z-index"])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-2a8ca3bd"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-datetime-picker/wd-datetime-picker.vue"]]);
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "create-flow",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const categoryList = vue.reactive([]);
      const categoryColumns = vue.ref([]);
      const accountPicker = vue.reactive([]);
      const model = vue.reactive({
        money: "",
        category: "",
        account: "",
        comment: "",
        billDate: (/* @__PURE__ */ new Date()).getTime()
      });
      const rules = {
        money: [{
          required: true
        }],
        category: [{
          required: true
        }],
        account: [{
          required: true
        }]
      };
      const form = vue.ref();
      const account_id = vue.ref(0);
      onLoad((options) => {
        account_id.value = options.account_id;
      });
      vue.onMounted(async () => {
        Object.assign(categoryList, await getCategoryPicker());
        categoryColumns.value = [categoryList[0], categoryList[categoryList[0][0].value], categoryList[categoryList[categoryList[0][0].value][0].value]];
        model.category = vue.ref([1, 4, 5]);
        model.account = account_id;
        const accountList = await dbService2.getTallyAccount();
        accountList.forEach((item) => {
          accountPicker.push({
            label: item.account_name,
            value: item.id
          });
        });
      });
      function handleSubmit() {
        form.value.validate().then(async ({ valid, errors }) => {
          if (valid) {
            var categoryById = await dbService2.getTallyCategoryById(model.category[2]);
            dbService2.insertTallyBill(model.account, keep2Digits(model.money) * categoryById[0].directory, model.billDate, model.category[2], "");
            uni.navigateBack({
              delta: 1
            });
          }
        }).catch((error) => {
          formatAppLog("log", "at pages/settle-account/create-flow.vue:83", error, "error");
        });
      }
      const onChangeDistrict = (pickerView, value, columnIndex, resolve) => {
        const item = value[columnIndex];
        if (columnIndex === 0) {
          pickerView.setColumnData(1, categoryList[item.value]);
          pickerView.setColumnData(2, categoryList[categoryList[item.value][0].value]);
        } else if (columnIndex === 1) {
          pickerView.setColumnData(2, categoryList[item.value]);
        }
        resolve();
      };
      async function getCategoryPicker() {
        const result = await dbService2.queryTableName("tally_category");
        return result.reduce((acc, item) => {
          if (!acc[item.parent_id])
            acc[item.parent_id] = [];
          acc[item.parent_id].push({
            label: item.name,
            value: item.id
          });
          return acc;
        }, {});
      }
      const __returned__ = { dbService: dbService2, categoryList, categoryColumns, accountPicker, model, rules, form, account_id, handleSubmit, onChangeDistrict, getCategoryPicker };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_input = resolveEasycom(vue.resolveDynamicComponent("wd-input"), __easycom_0);
    const _component_wd_picker = resolveEasycom(vue.resolveDynamicComponent("wd-picker"), __easycom_1);
    const _component_wd_datetime_picker = resolveEasycom(vue.resolveDynamicComponent("wd-datetime-picker"), __easycom_2);
    const _component_wd_button = resolveEasycom(vue.resolveDynamicComponent("wd-button"), __easycom_3$1);
    const _component_wd_form = resolveEasycom(vue.resolveDynamicComponent("wd-form"), __easycom_4);
    return vue.openBlock(), vue.createBlock(_component_wd_form, {
      ref: "form",
      model: $setup.model,
      rules: $setup.rules
    }, {
      default: vue.withCtx(() => [
        vue.createVNode(_component_wd_input, {
          label: "金额",
          prop: "balance",
          modelValue: $setup.model.money,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.model.money = $event),
          placeholder: "0.00",
          type: "number"
        }, null, 8, ["modelValue"]),
        vue.createVNode(_component_wd_picker, {
          label: "类别",
          columns: $setup.categoryColumns,
          modelValue: $setup.model.category,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.model.category = $event),
          "column-change": $setup.onChangeDistrict
        }, null, 8, ["columns", "modelValue"]),
        vue.createVNode(_component_wd_picker, {
          label: "账户",
          columns: $setup.accountPicker,
          modelValue: $setup.model.account,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.model.account = $event)
        }, null, 8, ["columns", "modelValue"]),
        vue.createVNode(_component_wd_datetime_picker, {
          modelValue: $setup.model.billDate,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.model.billDate = $event),
          label: "时间"
        }, null, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "footer" }, [
          vue.createVNode(_component_wd_button, {
            type: "primary",
            size: "large",
            onClick: $setup.handleSubmit,
            block: ""
          }, {
            default: vue.withCtx(() => [
              vue.createTextVNode("保存")
            ]),
            _: 1
            /* STABLE */
          })
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["model"]);
  }
  const PagesSettleAccountCreateFlow = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/create-flow.vue"]]);
  __definePage("pages/settle-account/settle-account", PagesSettleAccountSettleAccount);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/post/postList", PagesPostPostList);
  __definePage("pages/post/postDetail", PagesPostPostDetail);
  __definePage("pages/user-center/user-center", PagesUserCenterUserCenter);
  __definePage("pages/reports/reports", PagesReportsReports);
  __definePage("pages/settle-account/settle-account-flow", PagesSettleAccountSettleAccountFlow);
  __definePage("pages/reports/account", PagesReportsAccount);
  __definePage("pages/settle-account/create-account", PagesSettleAccountCreateAccount);
  __definePage("pages/settle-account/create-flow", PagesSettleAccountCreateFlow);
  const dbService = new DBService();
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("warn", "at App.vue:8", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
      formatAppLog("log", "at App.vue:9", "App Launch");
      dbService.initDB();
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:13", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:16", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "E:/document/LifePartner/lifeparter-app/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
