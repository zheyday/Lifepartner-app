var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
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
  function requireNativePlugin(name) {
    return weex.requireModule(name);
  }
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
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const onPullDownRefresh = /* @__PURE__ */ createLifeCycleHook(
    ON_PULL_DOWN_REFRESH,
    2
    /* HookFlags.PAGE */
  );
  class AbortablePromise {
    constructor(executor) {
      __publicField(this, "promise");
      __publicField(this, "_reject", null);
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
  function isUndefined(value) {
    return typeof value === "undefined";
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
  function omitBy(obj, predicate) {
    const newObj = deepClone(obj);
    Object.keys(newObj).forEach((key) => predicate(newObj[key], key) && delete newObj[key]);
    return newObj;
  }
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
  const __default__$i = {
    name: "wd-icon",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$O = /* @__PURE__ */ vue.defineComponent({
    ...__default__$i,
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
  function _sfc_render$N(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$O, [["render", _sfc_render$N], ["__scopeId", "data-v-24906af6"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-icon/wd-icon.vue"]]);
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
  const _sfc_main$N = {
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
  function _sfc_render$M(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-swipe" }, [
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
    ]);
  }
  if (typeof block0$1 === "function")
    block0$1(_sfc_main$N);
  if (typeof block1 === "function")
    block1(_sfc_main$N);
  const __easycom_1$5 = /* @__PURE__ */ _export_sfc(_sfc_main$N, [["render", _sfc_render$M], ["__scopeId", "data-v-8ff2a577"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-swipe-action/components/uni-swipe-action-item/uni-swipe-action-item.vue"]]);
  const _sfc_main$M = {
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
  function _sfc_render$L(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.renderSlot(_ctx.$slots, "default")
    ]);
  }
  const __easycom_2$5 = /* @__PURE__ */ _export_sfc(_sfc_main$M, [["render", _sfc_render$L], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-swipe-action/components/uni-swipe-action/uni-swipe-action.vue"]]);
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
  const __default__$h = {
    name: "wd-button",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$L = /* @__PURE__ */ vue.defineComponent({
    ...__default__$h,
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
      const __returned__ = { loadingIcon, props, emit, hoverStartTime, hoverStayTime, loadingIconSvg, loadingStyle, handleClick, handleGetAuthorize, handleGetuserinfo, handleConcat, handleGetphonenumber, handleError, handleLaunchapp, handleOpensetting, handleChooseavatar, handleAgreePrivacyAuthorization, buildLoadingSvg, wdIcon: __easycom_0$4 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$K(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_3$1 = /* @__PURE__ */ _export_sfc(_sfc_main$L, [["render", _sfc_render$K], ["__scopeId", "data-v-d858c170"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-button/wd-button.vue"]]);
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
  const __default__$g = {
    name: "wd-transition",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$K = /* @__PURE__ */ vue.defineComponent({
    ...__default__$g,
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
  function _sfc_render$J(_ctx, _cache, $props, $setup, $data, $options) {
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
  const wdTransition = /* @__PURE__ */ _export_sfc(_sfc_main$K, [["render", _sfc_render$J], ["__scopeId", "data-v-af59a128"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-transition/wd-transition.vue"]]);
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
  const __default__$f = {
    name: "wd-fab",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$J = /* @__PURE__ */ vue.defineComponent({
    ...__default__$f,
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
      const __returned__ = { props, emit, inited, isActive, queue: queue2, proxy, fabDirection, top, left, screen, fabSize, bounding, getBounding, initPosition, touchOffset, attractTransition, handleTouchStart, handleTouchMove, handleTouchEnd, rootStyle, handleClick, open, close, wdButton: __easycom_3$1, wdIcon: __easycom_0$4, wdTransition };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$I(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_2$4 = /* @__PURE__ */ _export_sfc(_sfc_main$J, [["render", _sfc_render$I], ["__scopeId", "data-v-c5c35da7"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-fab/wd-fab.vue"]]);
  var lookup = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    0,
    62,
    0,
    63,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    0,
    0,
    0,
    0,
    63,
    0,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51
  ];
  function base64Decode(source, target) {
    var sourceLength = source.length;
    var paddingLength = source[sourceLength - 2] === "=" ? 2 : source[sourceLength - 1] === "=" ? 1 : 0;
    var tmp;
    var byteIndex = 0;
    var baseLength = sourceLength - paddingLength & 4294967292;
    for (var i2 = 0; i2 < baseLength; i2 += 4) {
      tmp = lookup[source.charCodeAt(i2)] << 18 | lookup[source.charCodeAt(i2 + 1)] << 12 | lookup[source.charCodeAt(i2 + 2)] << 6 | lookup[source.charCodeAt(i2 + 3)];
      target[byteIndex++] = tmp >> 16 & 255;
      target[byteIndex++] = tmp >> 8 & 255;
      target[byteIndex++] = tmp & 255;
    }
    if (paddingLength === 1) {
      tmp = lookup[source.charCodeAt(i2)] << 10 | lookup[source.charCodeAt(i2 + 1)] << 4 | lookup[source.charCodeAt(i2 + 2)] >> 2;
      target[byteIndex++] = tmp >> 8 & 255;
      target[byteIndex++] = tmp & 255;
    }
    if (paddingLength === 2) {
      tmp = lookup[source.charCodeAt(i2)] << 2 | lookup[source.charCodeAt(i2 + 1)] >> 4;
      target[byteIndex++] = tmp & 255;
    }
  }
  const crypto = {
    getRandomValues(arr) {
      if (!(arr instanceof Int8Array || arr instanceof Uint8Array || arr instanceof Int16Array || arr instanceof Uint16Array || arr instanceof Int32Array || arr instanceof Uint32Array || arr instanceof Uint8ClampedArray)) {
        throw new Error("Expected an integer array");
      }
      if (arr.byteLength > 65536) {
        throw new Error("Can only request a maximum of 65536 bytes");
      }
      var crypto2 = requireNativePlugin("DCloud-Crypto");
      base64Decode(crypto2.getRandomValues(arr.byteLength), new Uint8Array(
        arr.buffer,
        arr.byteOffset,
        arr.byteLength
      ));
      return arr;
    }
  };
  const nodeCrypto = new Proxy({}, {
    get(_2, key) {
      throw new Error(`Module "" has been externalized for browser compatibility. Cannot access ".${key}" in client code.  See https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
    }
  });
  var randomFallback = null;
  function randomBytes(len) {
    try {
      return crypto.getRandomValues(new Uint8Array(len));
    } catch {
    }
    try {
      return nodeCrypto.randomBytes(len);
    } catch {
    }
    if (!randomFallback) {
      throw Error(
        "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
      );
    }
    return randomFallback(len);
  }
  function setRandomFallback(random) {
    randomFallback = random;
  }
  function genSaltSync(rounds, seed_length) {
    rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
    if (typeof rounds !== "number")
      throw Error(
        "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
      );
    if (rounds < 4)
      rounds = 4;
    else if (rounds > 31)
      rounds = 31;
    var salt = [];
    salt.push("$2b$");
    if (rounds < 10)
      salt.push("0");
    salt.push(rounds.toString());
    salt.push("$");
    salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
    return salt.join("");
  }
  function genSalt(rounds, seed_length, callback) {
    if (typeof seed_length === "function")
      callback = seed_length, seed_length = void 0;
    if (typeof rounds === "function")
      callback = rounds, rounds = void 0;
    if (typeof rounds === "undefined")
      rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
    else if (typeof rounds !== "number")
      throw Error("illegal arguments: " + typeof rounds);
    function _async(callback2) {
      nextTick(function() {
        try {
          callback2(null, genSaltSync(rounds));
        } catch (err) {
          callback2(err);
        }
      });
    }
    if (callback) {
      if (typeof callback !== "function")
        throw Error("Illegal callback: " + typeof callback);
      _async(callback);
    } else
      return new Promise(function(resolve, reject) {
        _async(function(err, res) {
          if (err) {
            reject(err);
            return;
          }
          resolve(res);
        });
      });
  }
  function hashSync(password, salt) {
    if (typeof salt === "undefined")
      salt = GENSALT_DEFAULT_LOG2_ROUNDS;
    if (typeof salt === "number")
      salt = genSaltSync(salt);
    if (typeof password !== "string" || typeof salt !== "string")
      throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
    return _hash(password, salt);
  }
  function hash(password, salt, callback, progressCallback) {
    function _async(callback2) {
      if (typeof password === "string" && typeof salt === "number")
        genSalt(salt, function(err, salt2) {
          _hash(password, salt2, callback2, progressCallback);
        });
      else if (typeof password === "string" && typeof salt === "string")
        _hash(password, salt, callback2, progressCallback);
      else
        nextTick(
          callback2.bind(
            this,
            Error("Illegal arguments: " + typeof password + ", " + typeof salt)
          )
        );
    }
    if (callback) {
      if (typeof callback !== "function")
        throw Error("Illegal callback: " + typeof callback);
      _async(callback);
    } else
      return new Promise(function(resolve, reject) {
        _async(function(err, res) {
          if (err) {
            reject(err);
            return;
          }
          resolve(res);
        });
      });
  }
  function safeStringCompare(known, unknown) {
    var diff = known.length ^ unknown.length;
    for (var i2 = 0; i2 < known.length; ++i2) {
      diff |= known.charCodeAt(i2) ^ unknown.charCodeAt(i2);
    }
    return diff === 0;
  }
  function compareSync(password, hash2) {
    if (typeof password !== "string" || typeof hash2 !== "string")
      throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
    if (hash2.length !== 60)
      return false;
    return safeStringCompare(
      hashSync(password, hash2.substring(0, hash2.length - 31)),
      hash2
    );
  }
  function compare(password, hashValue, callback, progressCallback) {
    function _async(callback2) {
      if (typeof password !== "string" || typeof hashValue !== "string") {
        nextTick(
          callback2.bind(
            this,
            Error(
              "Illegal arguments: " + typeof password + ", " + typeof hashValue
            )
          )
        );
        return;
      }
      if (hashValue.length !== 60) {
        nextTick(callback2.bind(this, null, false));
        return;
      }
      hash(
        password,
        hashValue.substring(0, 29),
        function(err, comp) {
          if (err)
            callback2(err);
          else
            callback2(null, safeStringCompare(comp, hashValue));
        },
        progressCallback
      );
    }
    if (callback) {
      if (typeof callback !== "function")
        throw Error("Illegal callback: " + typeof callback);
      _async(callback);
    } else
      return new Promise(function(resolve, reject) {
        _async(function(err, res) {
          if (err) {
            reject(err);
            return;
          }
          resolve(res);
        });
      });
  }
  function getRounds(hash2) {
    if (typeof hash2 !== "string")
      throw Error("Illegal arguments: " + typeof hash2);
    return parseInt(hash2.split("$")[2], 10);
  }
  function getSalt(hash2) {
    if (typeof hash2 !== "string")
      throw Error("Illegal arguments: " + typeof hash2);
    if (hash2.length !== 60)
      throw Error("Illegal hash length: " + hash2.length + " != 60");
    return hash2.substring(0, 29);
  }
  function truncates(password) {
    if (typeof password !== "string")
      throw Error("Illegal arguments: " + typeof password);
    return utf8Length(password) > 72;
  }
  var nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
  function utf8Length(string) {
    var len = 0, c2 = 0;
    for (var i2 = 0; i2 < string.length; ++i2) {
      c2 = string.charCodeAt(i2);
      if (c2 < 128)
        len += 1;
      else if (c2 < 2048)
        len += 2;
      else if ((c2 & 64512) === 55296 && (string.charCodeAt(i2 + 1) & 64512) === 56320) {
        ++i2;
        len += 4;
      } else
        len += 3;
    }
    return len;
  }
  function utf8Array(string) {
    var offset = 0, c1, c2;
    var buffer = new Array(utf8Length(string));
    for (var i2 = 0, k = string.length; i2 < k; ++i2) {
      c1 = string.charCodeAt(i2);
      if (c1 < 128) {
        buffer[offset++] = c1;
      } else if (c1 < 2048) {
        buffer[offset++] = c1 >> 6 | 192;
        buffer[offset++] = c1 & 63 | 128;
      } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i2 + 1)) & 64512) === 56320) {
        c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
        ++i2;
        buffer[offset++] = c1 >> 18 | 240;
        buffer[offset++] = c1 >> 12 & 63 | 128;
        buffer[offset++] = c1 >> 6 & 63 | 128;
        buffer[offset++] = c1 & 63 | 128;
      } else {
        buffer[offset++] = c1 >> 12 | 224;
        buffer[offset++] = c1 >> 6 & 63 | 128;
        buffer[offset++] = c1 & 63 | 128;
      }
    }
    return buffer;
  }
  var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
  var BASE64_INDEX = [
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
    1,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    -1,
    -1,
    -1,
    -1,
    -1
  ];
  function base64_encode(b2, len) {
    var off = 0, rs2 = [], c1, c2;
    if (len <= 0 || len > b2.length)
      throw Error("Illegal len: " + len);
    while (off < len) {
      c1 = b2[off++] & 255;
      rs2.push(BASE64_CODE[c1 >> 2 & 63]);
      c1 = (c1 & 3) << 4;
      if (off >= len) {
        rs2.push(BASE64_CODE[c1 & 63]);
        break;
      }
      c2 = b2[off++] & 255;
      c1 |= c2 >> 4 & 15;
      rs2.push(BASE64_CODE[c1 & 63]);
      c1 = (c2 & 15) << 2;
      if (off >= len) {
        rs2.push(BASE64_CODE[c1 & 63]);
        break;
      }
      c2 = b2[off++] & 255;
      c1 |= c2 >> 6 & 3;
      rs2.push(BASE64_CODE[c1 & 63]);
      rs2.push(BASE64_CODE[c2 & 63]);
    }
    return rs2.join("");
  }
  function base64_decode(s2, len) {
    var off = 0, slen = s2.length, olen = 0, rs2 = [], c1, c2, c3, c4, o2, code;
    if (len <= 0)
      throw Error("Illegal len: " + len);
    while (off < slen - 1 && olen < len) {
      code = s2.charCodeAt(off++);
      c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
      code = s2.charCodeAt(off++);
      c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
      if (c1 == -1 || c2 == -1)
        break;
      o2 = c1 << 2 >>> 0;
      o2 |= (c2 & 48) >> 4;
      rs2.push(String.fromCharCode(o2));
      if (++olen >= len || off >= slen)
        break;
      code = s2.charCodeAt(off++);
      c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
      if (c3 == -1)
        break;
      o2 = (c2 & 15) << 4 >>> 0;
      o2 |= (c3 & 60) >> 2;
      rs2.push(String.fromCharCode(o2));
      if (++olen >= len || off >= slen)
        break;
      code = s2.charCodeAt(off++);
      c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
      o2 = (c3 & 3) << 6 >>> 0;
      o2 |= c4;
      rs2.push(String.fromCharCode(o2));
      ++olen;
    }
    var res = [];
    for (off = 0; off < olen; off++)
      res.push(rs2[off].charCodeAt(0));
    return res;
  }
  var BCRYPT_SALT_LEN = 16;
  var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
  var BLOWFISH_NUM_ROUNDS = 16;
  var MAX_EXECUTION_TIME = 100;
  var P_ORIG = [
    608135816,
    2242054355,
    320440878,
    57701188,
    2752067618,
    698298832,
    137296536,
    3964562569,
    1160258022,
    953160567,
    3193202383,
    887688300,
    3232508343,
    3380367581,
    1065670069,
    3041331479,
    2450970073,
    2306472731
  ];
  var S_ORIG = [
    3509652390,
    2564797868,
    805139163,
    3491422135,
    3101798381,
    1780907670,
    3128725573,
    4046225305,
    614570311,
    3012652279,
    134345442,
    2240740374,
    1667834072,
    1901547113,
    2757295779,
    4103290238,
    227898511,
    1921955416,
    1904987480,
    2182433518,
    2069144605,
    3260701109,
    2620446009,
    720527379,
    3318853667,
    677414384,
    3393288472,
    3101374703,
    2390351024,
    1614419982,
    1822297739,
    2954791486,
    3608508353,
    3174124327,
    2024746970,
    1432378464,
    3864339955,
    2857741204,
    1464375394,
    1676153920,
    1439316330,
    715854006,
    3033291828,
    289532110,
    2706671279,
    2087905683,
    3018724369,
    1668267050,
    732546397,
    1947742710,
    3462151702,
    2609353502,
    2950085171,
    1814351708,
    2050118529,
    680887927,
    999245976,
    1800124847,
    3300911131,
    1713906067,
    1641548236,
    4213287313,
    1216130144,
    1575780402,
    4018429277,
    3917837745,
    3693486850,
    3949271944,
    596196993,
    3549867205,
    258830323,
    2213823033,
    772490370,
    2760122372,
    1774776394,
    2652871518,
    566650946,
    4142492826,
    1728879713,
    2882767088,
    1783734482,
    3629395816,
    2517608232,
    2874225571,
    1861159788,
    326777828,
    3124490320,
    2130389656,
    2716951837,
    967770486,
    1724537150,
    2185432712,
    2364442137,
    1164943284,
    2105845187,
    998989502,
    3765401048,
    2244026483,
    1075463327,
    1455516326,
    1322494562,
    910128902,
    469688178,
    1117454909,
    936433444,
    3490320968,
    3675253459,
    1240580251,
    122909385,
    2157517691,
    634681816,
    4142456567,
    3825094682,
    3061402683,
    2540495037,
    79693498,
    3249098678,
    1084186820,
    1583128258,
    426386531,
    1761308591,
    1047286709,
    322548459,
    995290223,
    1845252383,
    2603652396,
    3431023940,
    2942221577,
    3202600964,
    3727903485,
    1712269319,
    422464435,
    3234572375,
    1170764815,
    3523960633,
    3117677531,
    1434042557,
    442511882,
    3600875718,
    1076654713,
    1738483198,
    4213154764,
    2393238008,
    3677496056,
    1014306527,
    4251020053,
    793779912,
    2902807211,
    842905082,
    4246964064,
    1395751752,
    1040244610,
    2656851899,
    3396308128,
    445077038,
    3742853595,
    3577915638,
    679411651,
    2892444358,
    2354009459,
    1767581616,
    3150600392,
    3791627101,
    3102740896,
    284835224,
    4246832056,
    1258075500,
    768725851,
    2589189241,
    3069724005,
    3532540348,
    1274779536,
    3789419226,
    2764799539,
    1660621633,
    3471099624,
    4011903706,
    913787905,
    3497959166,
    737222580,
    2514213453,
    2928710040,
    3937242737,
    1804850592,
    3499020752,
    2949064160,
    2386320175,
    2390070455,
    2415321851,
    4061277028,
    2290661394,
    2416832540,
    1336762016,
    1754252060,
    3520065937,
    3014181293,
    791618072,
    3188594551,
    3933548030,
    2332172193,
    3852520463,
    3043980520,
    413987798,
    3465142937,
    3030929376,
    4245938359,
    2093235073,
    3534596313,
    375366246,
    2157278981,
    2479649556,
    555357303,
    3870105701,
    2008414854,
    3344188149,
    4221384143,
    3956125452,
    2067696032,
    3594591187,
    2921233993,
    2428461,
    544322398,
    577241275,
    1471733935,
    610547355,
    4027169054,
    1432588573,
    1507829418,
    2025931657,
    3646575487,
    545086370,
    48609733,
    2200306550,
    1653985193,
    298326376,
    1316178497,
    3007786442,
    2064951626,
    458293330,
    2589141269,
    3591329599,
    3164325604,
    727753846,
    2179363840,
    146436021,
    1461446943,
    4069977195,
    705550613,
    3059967265,
    3887724982,
    4281599278,
    3313849956,
    1404054877,
    2845806497,
    146425753,
    1854211946,
    1266315497,
    3048417604,
    3681880366,
    3289982499,
    290971e4,
    1235738493,
    2632868024,
    2414719590,
    3970600049,
    1771706367,
    1449415276,
    3266420449,
    422970021,
    1963543593,
    2690192192,
    3826793022,
    1062508698,
    1531092325,
    1804592342,
    2583117782,
    2714934279,
    4024971509,
    1294809318,
    4028980673,
    1289560198,
    2221992742,
    1669523910,
    35572830,
    157838143,
    1052438473,
    1016535060,
    1802137761,
    1753167236,
    1386275462,
    3080475397,
    2857371447,
    1040679964,
    2145300060,
    2390574316,
    1461121720,
    2956646967,
    4031777805,
    4028374788,
    33600511,
    2920084762,
    1018524850,
    629373528,
    3691585981,
    3515945977,
    2091462646,
    2486323059,
    586499841,
    988145025,
    935516892,
    3367335476,
    2599673255,
    2839830854,
    265290510,
    3972581182,
    2759138881,
    3795373465,
    1005194799,
    847297441,
    406762289,
    1314163512,
    1332590856,
    1866599683,
    4127851711,
    750260880,
    613907577,
    1450815602,
    3165620655,
    3734664991,
    3650291728,
    3012275730,
    3704569646,
    1427272223,
    778793252,
    1343938022,
    2676280711,
    2052605720,
    1946737175,
    3164576444,
    3914038668,
    3967478842,
    3682934266,
    1661551462,
    3294938066,
    4011595847,
    840292616,
    3712170807,
    616741398,
    312560963,
    711312465,
    1351876610,
    322626781,
    1910503582,
    271666773,
    2175563734,
    1594956187,
    70604529,
    3617834859,
    1007753275,
    1495573769,
    4069517037,
    2549218298,
    2663038764,
    504708206,
    2263041392,
    3941167025,
    2249088522,
    1514023603,
    1998579484,
    1312622330,
    694541497,
    2582060303,
    2151582166,
    1382467621,
    776784248,
    2618340202,
    3323268794,
    2497899128,
    2784771155,
    503983604,
    4076293799,
    907881277,
    423175695,
    432175456,
    1378068232,
    4145222326,
    3954048622,
    3938656102,
    3820766613,
    2793130115,
    2977904593,
    26017576,
    3274890735,
    3194772133,
    1700274565,
    1756076034,
    4006520079,
    3677328699,
    720338349,
    1533947780,
    354530856,
    688349552,
    3973924725,
    1637815568,
    332179504,
    3949051286,
    53804574,
    2852348879,
    3044236432,
    1282449977,
    3583942155,
    3416972820,
    4006381244,
    1617046695,
    2628476075,
    3002303598,
    1686838959,
    431878346,
    2686675385,
    1700445008,
    1080580658,
    1009431731,
    832498133,
    3223435511,
    2605976345,
    2271191193,
    2516031870,
    1648197032,
    4164389018,
    2548247927,
    300782431,
    375919233,
    238389289,
    3353747414,
    2531188641,
    2019080857,
    1475708069,
    455242339,
    2609103871,
    448939670,
    3451063019,
    1395535956,
    2413381860,
    1841049896,
    1491858159,
    885456874,
    4264095073,
    4001119347,
    1565136089,
    3898914787,
    1108368660,
    540939232,
    1173283510,
    2745871338,
    3681308437,
    4207628240,
    3343053890,
    4016749493,
    1699691293,
    1103962373,
    3625875870,
    2256883143,
    3830138730,
    1031889488,
    3479347698,
    1535977030,
    4236805024,
    3251091107,
    2132092099,
    1774941330,
    1199868427,
    1452454533,
    157007616,
    2904115357,
    342012276,
    595725824,
    1480756522,
    206960106,
    497939518,
    591360097,
    863170706,
    2375253569,
    3596610801,
    1814182875,
    2094937945,
    3421402208,
    1082520231,
    3463918190,
    2785509508,
    435703966,
    3908032597,
    1641649973,
    2842273706,
    3305899714,
    1510255612,
    2148256476,
    2655287854,
    3276092548,
    4258621189,
    236887753,
    3681803219,
    274041037,
    1734335097,
    3815195456,
    3317970021,
    1899903192,
    1026095262,
    4050517792,
    356393447,
    2410691914,
    3873677099,
    3682840055,
    3913112168,
    2491498743,
    4132185628,
    2489919796,
    1091903735,
    1979897079,
    3170134830,
    3567386728,
    3557303409,
    857797738,
    1136121015,
    1342202287,
    507115054,
    2535736646,
    337727348,
    3213592640,
    1301675037,
    2528481711,
    1895095763,
    1721773893,
    3216771564,
    62756741,
    2142006736,
    835421444,
    2531993523,
    1442658625,
    3659876326,
    2882144922,
    676362277,
    1392781812,
    170690266,
    3921047035,
    1759253602,
    3611846912,
    1745797284,
    664899054,
    1329594018,
    3901205900,
    3045908486,
    2062866102,
    2865634940,
    3543621612,
    3464012697,
    1080764994,
    553557557,
    3656615353,
    3996768171,
    991055499,
    499776247,
    1265440854,
    648242737,
    3940784050,
    980351604,
    3713745714,
    1749149687,
    3396870395,
    4211799374,
    3640570775,
    1161844396,
    3125318951,
    1431517754,
    545492359,
    4268468663,
    3499529547,
    1437099964,
    2702547544,
    3433638243,
    2581715763,
    2787789398,
    1060185593,
    1593081372,
    2418618748,
    4260947970,
    69676912,
    2159744348,
    86519011,
    2512459080,
    3838209314,
    1220612927,
    3339683548,
    133810670,
    1090789135,
    1078426020,
    1569222167,
    845107691,
    3583754449,
    4072456591,
    1091646820,
    628848692,
    1613405280,
    3757631651,
    526609435,
    236106946,
    48312990,
    2942717905,
    3402727701,
    1797494240,
    859738849,
    992217954,
    4005476642,
    2243076622,
    3870952857,
    3732016268,
    765654824,
    3490871365,
    2511836413,
    1685915746,
    3888969200,
    1414112111,
    2273134842,
    3281911079,
    4080962846,
    172450625,
    2569994100,
    980381355,
    4109958455,
    2819808352,
    2716589560,
    2568741196,
    3681446669,
    3329971472,
    1835478071,
    660984891,
    3704678404,
    4045999559,
    3422617507,
    3040415634,
    1762651403,
    1719377915,
    3470491036,
    2693910283,
    3642056355,
    3138596744,
    1364962596,
    2073328063,
    1983633131,
    926494387,
    3423689081,
    2150032023,
    4096667949,
    1749200295,
    3328846651,
    309677260,
    2016342300,
    1779581495,
    3079819751,
    111262694,
    1274766160,
    443224088,
    298511866,
    1025883608,
    3806446537,
    1145181785,
    168956806,
    3641502830,
    3584813610,
    1689216846,
    3666258015,
    3200248200,
    1692713982,
    2646376535,
    4042768518,
    1618508792,
    1610833997,
    3523052358,
    4130873264,
    2001055236,
    3610705100,
    2202168115,
    4028541809,
    2961195399,
    1006657119,
    2006996926,
    3186142756,
    1430667929,
    3210227297,
    1314452623,
    4074634658,
    4101304120,
    2273951170,
    1399257539,
    3367210612,
    3027628629,
    1190975929,
    2062231137,
    2333990788,
    2221543033,
    2438960610,
    1181637006,
    548689776,
    2362791313,
    3372408396,
    3104550113,
    3145860560,
    296247880,
    1970579870,
    3078560182,
    3769228297,
    1714227617,
    3291629107,
    3898220290,
    166772364,
    1251581989,
    493813264,
    448347421,
    195405023,
    2709975567,
    677966185,
    3703036547,
    1463355134,
    2715995803,
    1338867538,
    1343315457,
    2802222074,
    2684532164,
    233230375,
    2599980071,
    2000651841,
    3277868038,
    1638401717,
    4028070440,
    3237316320,
    6314154,
    819756386,
    300326615,
    590932579,
    1405279636,
    3267499572,
    3150704214,
    2428286686,
    3959192993,
    3461946742,
    1862657033,
    1266418056,
    963775037,
    2089974820,
    2263052895,
    1917689273,
    448879540,
    3550394620,
    3981727096,
    150775221,
    3627908307,
    1303187396,
    508620638,
    2975983352,
    2726630617,
    1817252668,
    1876281319,
    1457606340,
    908771278,
    3720792119,
    3617206836,
    2455994898,
    1729034894,
    1080033504,
    976866871,
    3556439503,
    2881648439,
    1522871579,
    1555064734,
    1336096578,
    3548522304,
    2579274686,
    3574697629,
    3205460757,
    3593280638,
    3338716283,
    3079412587,
    564236357,
    2993598910,
    1781952180,
    1464380207,
    3163844217,
    3332601554,
    1699332808,
    1393555694,
    1183702653,
    3581086237,
    1288719814,
    691649499,
    2847557200,
    2895455976,
    3193889540,
    2717570544,
    1781354906,
    1676643554,
    2592534050,
    3230253752,
    1126444790,
    2770207658,
    2633158820,
    2210423226,
    2615765581,
    2414155088,
    3127139286,
    673620729,
    2805611233,
    1269405062,
    4015350505,
    3341807571,
    4149409754,
    1057255273,
    2012875353,
    2162469141,
    2276492801,
    2601117357,
    993977747,
    3918593370,
    2654263191,
    753973209,
    36408145,
    2530585658,
    25011837,
    3520020182,
    2088578344,
    530523599,
    2918365339,
    1524020338,
    1518925132,
    3760827505,
    3759777254,
    1202760957,
    3985898139,
    3906192525,
    674977740,
    4174734889,
    2031300136,
    2019492241,
    3983892565,
    4153806404,
    3822280332,
    352677332,
    2297720250,
    60907813,
    90501309,
    3286998549,
    1016092578,
    2535922412,
    2839152426,
    457141659,
    509813237,
    4120667899,
    652014361,
    1966332200,
    2975202805,
    55981186,
    2327461051,
    676427537,
    3255491064,
    2882294119,
    3433927263,
    1307055953,
    942726286,
    933058658,
    2468411793,
    3933900994,
    4215176142,
    1361170020,
    2001714738,
    2830558078,
    3274259782,
    1222529897,
    1679025792,
    2729314320,
    3714953764,
    1770335741,
    151462246,
    3013232138,
    1682292957,
    1483529935,
    471910574,
    1539241949,
    458788160,
    3436315007,
    1807016891,
    3718408830,
    978976581,
    1043663428,
    3165965781,
    1927990952,
    4200891579,
    2372276910,
    3208408903,
    3533431907,
    1412390302,
    2931980059,
    4132332400,
    1947078029,
    3881505623,
    4168226417,
    2941484381,
    1077988104,
    1320477388,
    886195818,
    18198404,
    3786409e3,
    2509781533,
    112762804,
    3463356488,
    1866414978,
    891333506,
    18488651,
    661792760,
    1628790961,
    3885187036,
    3141171499,
    876946877,
    2693282273,
    1372485963,
    791857591,
    2686433993,
    3759982718,
    3167212022,
    3472953795,
    2716379847,
    445679433,
    3561995674,
    3504004811,
    3574258232,
    54117162,
    3331405415,
    2381918588,
    3769707343,
    4154350007,
    1140177722,
    4074052095,
    668550556,
    3214352940,
    367459370,
    261225585,
    2610173221,
    4209349473,
    3468074219,
    3265815641,
    314222801,
    3066103646,
    3808782860,
    282218597,
    3406013506,
    3773591054,
    379116347,
    1285071038,
    846784868,
    2669647154,
    3771962079,
    3550491691,
    2305946142,
    453669953,
    1268987020,
    3317592352,
    3279303384,
    3744833421,
    2610507566,
    3859509063,
    266596637,
    3847019092,
    517658769,
    3462560207,
    3443424879,
    370717030,
    4247526661,
    2224018117,
    4143653529,
    4112773975,
    2788324899,
    2477274417,
    1456262402,
    2901442914,
    1517677493,
    1846949527,
    2295493580,
    3734397586,
    2176403920,
    1280348187,
    1908823572,
    3871786941,
    846861322,
    1172426758,
    3287448474,
    3383383037,
    1655181056,
    3139813346,
    901632758,
    1897031941,
    2986607138,
    3066810236,
    3447102507,
    1393639104,
    373351379,
    950779232,
    625454576,
    3124240540,
    4148612726,
    2007998917,
    544563296,
    2244738638,
    2330496472,
    2058025392,
    1291430526,
    424198748,
    50039436,
    29584100,
    3605783033,
    2429876329,
    2791104160,
    1057563949,
    3255363231,
    3075367218,
    3463963227,
    1469046755,
    985887462
  ];
  var C_ORIG = [
    1332899944,
    1700884034,
    1701343084,
    1684370003,
    1668446532,
    1869963892
  ];
  function _encipher(lr, off, P2, S2) {
    var n2, l2 = lr[off], r2 = lr[off + 1];
    l2 ^= P2[0];
    n2 = S2[l2 >>> 24];
    n2 += S2[256 | l2 >> 16 & 255];
    n2 ^= S2[512 | l2 >> 8 & 255];
    n2 += S2[768 | l2 & 255];
    r2 ^= n2 ^ P2[1];
    n2 = S2[r2 >>> 24];
    n2 += S2[256 | r2 >> 16 & 255];
    n2 ^= S2[512 | r2 >> 8 & 255];
    n2 += S2[768 | r2 & 255];
    l2 ^= n2 ^ P2[2];
    n2 = S2[l2 >>> 24];
    n2 += S2[256 | l2 >> 16 & 255];
    n2 ^= S2[512 | l2 >> 8 & 255];
    n2 += S2[768 | l2 & 255];
    r2 ^= n2 ^ P2[3];
    n2 = S2[r2 >>> 24];
    n2 += S2[256 | r2 >> 16 & 255];
    n2 ^= S2[512 | r2 >> 8 & 255];
    n2 += S2[768 | r2 & 255];
    l2 ^= n2 ^ P2[4];
    n2 = S2[l2 >>> 24];
    n2 += S2[256 | l2 >> 16 & 255];
    n2 ^= S2[512 | l2 >> 8 & 255];
    n2 += S2[768 | l2 & 255];
    r2 ^= n2 ^ P2[5];
    n2 = S2[r2 >>> 24];
    n2 += S2[256 | r2 >> 16 & 255];
    n2 ^= S2[512 | r2 >> 8 & 255];
    n2 += S2[768 | r2 & 255];
    l2 ^= n2 ^ P2[6];
    n2 = S2[l2 >>> 24];
    n2 += S2[256 | l2 >> 16 & 255];
    n2 ^= S2[512 | l2 >> 8 & 255];
    n2 += S2[768 | l2 & 255];
    r2 ^= n2 ^ P2[7];
    n2 = S2[r2 >>> 24];
    n2 += S2[256 | r2 >> 16 & 255];
    n2 ^= S2[512 | r2 >> 8 & 255];
    n2 += S2[768 | r2 & 255];
    l2 ^= n2 ^ P2[8];
    n2 = S2[l2 >>> 24];
    n2 += S2[256 | l2 >> 16 & 255];
    n2 ^= S2[512 | l2 >> 8 & 255];
    n2 += S2[768 | l2 & 255];
    r2 ^= n2 ^ P2[9];
    n2 = S2[r2 >>> 24];
    n2 += S2[256 | r2 >> 16 & 255];
    n2 ^= S2[512 | r2 >> 8 & 255];
    n2 += S2[768 | r2 & 255];
    l2 ^= n2 ^ P2[10];
    n2 = S2[l2 >>> 24];
    n2 += S2[256 | l2 >> 16 & 255];
    n2 ^= S2[512 | l2 >> 8 & 255];
    n2 += S2[768 | l2 & 255];
    r2 ^= n2 ^ P2[11];
    n2 = S2[r2 >>> 24];
    n2 += S2[256 | r2 >> 16 & 255];
    n2 ^= S2[512 | r2 >> 8 & 255];
    n2 += S2[768 | r2 & 255];
    l2 ^= n2 ^ P2[12];
    n2 = S2[l2 >>> 24];
    n2 += S2[256 | l2 >> 16 & 255];
    n2 ^= S2[512 | l2 >> 8 & 255];
    n2 += S2[768 | l2 & 255];
    r2 ^= n2 ^ P2[13];
    n2 = S2[r2 >>> 24];
    n2 += S2[256 | r2 >> 16 & 255];
    n2 ^= S2[512 | r2 >> 8 & 255];
    n2 += S2[768 | r2 & 255];
    l2 ^= n2 ^ P2[14];
    n2 = S2[l2 >>> 24];
    n2 += S2[256 | l2 >> 16 & 255];
    n2 ^= S2[512 | l2 >> 8 & 255];
    n2 += S2[768 | l2 & 255];
    r2 ^= n2 ^ P2[15];
    n2 = S2[r2 >>> 24];
    n2 += S2[256 | r2 >> 16 & 255];
    n2 ^= S2[512 | r2 >> 8 & 255];
    n2 += S2[768 | r2 & 255];
    l2 ^= n2 ^ P2[16];
    lr[off] = r2 ^ P2[BLOWFISH_NUM_ROUNDS + 1];
    lr[off + 1] = l2;
    return lr;
  }
  function _streamtoword(data, offp) {
    for (var i2 = 0, word = 0; i2 < 4; ++i2)
      word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
    return { key: word, offp };
  }
  function _key(key, P2, S2) {
    var offset = 0, lr = [0, 0], plen = P2.length, slen = S2.length, sw;
    for (var i2 = 0; i2 < plen; i2++)
      sw = _streamtoword(key, offset), offset = sw.offp, P2[i2] = P2[i2] ^ sw.key;
    for (i2 = 0; i2 < plen; i2 += 2)
      lr = _encipher(lr, 0, P2, S2), P2[i2] = lr[0], P2[i2 + 1] = lr[1];
    for (i2 = 0; i2 < slen; i2 += 2)
      lr = _encipher(lr, 0, P2, S2), S2[i2] = lr[0], S2[i2 + 1] = lr[1];
  }
  function _ekskey(data, key, P2, S2) {
    var offp = 0, lr = [0, 0], plen = P2.length, slen = S2.length, sw;
    for (var i2 = 0; i2 < plen; i2++)
      sw = _streamtoword(key, offp), offp = sw.offp, P2[i2] = P2[i2] ^ sw.key;
    offp = 0;
    for (i2 = 0; i2 < plen; i2 += 2)
      sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P2, S2), P2[i2] = lr[0], P2[i2 + 1] = lr[1];
    for (i2 = 0; i2 < slen; i2 += 2)
      sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P2, S2), S2[i2] = lr[0], S2[i2 + 1] = lr[1];
  }
  function _crypt(b2, salt, rounds, callback, progressCallback) {
    var cdata = C_ORIG.slice(), clen = cdata.length, err;
    if (rounds < 4 || rounds > 31) {
      err = Error("Illegal number of rounds (4-31): " + rounds);
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else
        throw err;
    }
    if (salt.length !== BCRYPT_SALT_LEN) {
      err = Error(
        "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
      );
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else
        throw err;
    }
    rounds = 1 << rounds >>> 0;
    var P2, S2, i2 = 0, j2;
    if (typeof Int32Array === "function") {
      P2 = new Int32Array(P_ORIG);
      S2 = new Int32Array(S_ORIG);
    } else {
      P2 = P_ORIG.slice();
      S2 = S_ORIG.slice();
    }
    _ekskey(salt, b2, P2, S2);
    function next() {
      if (progressCallback)
        progressCallback(i2 / rounds);
      if (i2 < rounds) {
        var start = Date.now();
        for (; i2 < rounds; ) {
          i2 = i2 + 1;
          _key(b2, P2, S2);
          _key(salt, P2, S2);
          if (Date.now() - start > MAX_EXECUTION_TIME)
            break;
        }
      } else {
        for (i2 = 0; i2 < 64; i2++)
          for (j2 = 0; j2 < clen >> 1; j2++)
            _encipher(cdata, j2 << 1, P2, S2);
        var ret = [];
        for (i2 = 0; i2 < clen; i2++)
          ret.push((cdata[i2] >> 24 & 255) >>> 0), ret.push((cdata[i2] >> 16 & 255) >>> 0), ret.push((cdata[i2] >> 8 & 255) >>> 0), ret.push((cdata[i2] & 255) >>> 0);
        if (callback) {
          callback(null, ret);
          return;
        } else
          return ret;
      }
      if (callback)
        nextTick(next);
    }
    if (typeof callback !== "undefined") {
      next();
    } else {
      var res;
      while (true)
        if (typeof (res = next()) !== "undefined")
          return res || [];
    }
  }
  function _hash(password, salt, callback, progressCallback) {
    var err;
    if (typeof password !== "string" || typeof salt !== "string") {
      err = Error("Invalid string / salt: Not a string");
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else
        throw err;
    }
    var minor, offset;
    if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
      err = Error("Invalid salt version: " + salt.substring(0, 2));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else
        throw err;
    }
    if (salt.charAt(2) === "$")
      minor = String.fromCharCode(0), offset = 3;
    else {
      minor = salt.charAt(2);
      if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
        err = Error("Invalid salt revision: " + salt.substring(2, 4));
        if (callback) {
          nextTick(callback.bind(this, err));
          return;
        } else
          throw err;
      }
      offset = 4;
    }
    if (salt.charAt(offset + 2) > "$") {
      err = Error("Missing salt rounds");
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else
        throw err;
    }
    var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
    password += minor >= "a" ? "\0" : "";
    var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
    function finish(bytes) {
      var res = [];
      res.push("$2");
      if (minor >= "a")
        res.push(minor);
      res.push("$");
      if (rounds < 10)
        res.push("0");
      res.push(rounds.toString());
      res.push("$");
      res.push(base64_encode(saltb, saltb.length));
      res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
      return res.join("");
    }
    if (typeof callback == "undefined")
      return finish(_crypt(passwordb, saltb, rounds));
    else {
      _crypt(
        passwordb,
        saltb,
        rounds,
        function(err2, bytes) {
          if (err2)
            callback(err2, null);
          else
            callback(null, finish(bytes));
        },
        progressCallback
      );
    }
  }
  function encodeBase64(bytes, length) {
    return base64_encode(bytes, length);
  }
  function decodeBase64(string, length) {
    return base64_decode(string, length);
  }
  const bcrypt = {
    setRandomFallback,
    genSaltSync,
    genSalt,
    hashSync,
    hash,
    compareSync,
    compare,
    getRounds,
    getSalt,
    truncates,
    encodeBase64,
    decodeBase64
  };
  class Logger {
    constructor() {
      this.logFileName = "life-partner.log";
      this.maxLogSize = 1024 * 1024 * 50;
    }
    /**
     * 写入日志
     * @param {string} message - 日志内容
     * @param {string} level - 日志级别
     */
    log(message, level = "INFO") {
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
      const timestamp = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;
      const logEntry = `[${timestamp}] [${level}] ${message}
`;
      formatAppLog("log", "at common/logger.js:30", logEntry);
      try {
        plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs2) => {
          fs2.root.getFile(this.logFileName, {
            create: true
          }, (fileEntry) => {
            fileEntry.file((file) => {
              if (file.size > this.maxLogSize) {
                this.clearAndWrite(fileEntry, logEntry);
              } else {
                this.appendToFile(fileEntry, logEntry);
              }
            });
          }, (error) => {
            formatAppLog("error", "at common/logger.js:49", "获取日志文件失败:", error);
          });
        }, (error) => {
          formatAppLog("error", "at common/logger.js:52", "请求文件系统失败:", error);
        });
      } catch (error) {
        formatAppLog("error", "at common/logger.js:55", "写入日志异常:", error);
      }
    }
    /**
     * 追加写入文件
     */
    appendToFile(fileEntry, content) {
      fileEntry.createWriter((writer) => {
        writer.onwrite = () => {
        };
        writer.onerror = (error) => {
          formatAppLog("error", "at common/logger.js:68", "写入日志失败:", error);
        };
        writer.seek(writer.length);
        writer.write(content);
      }, (error) => {
        formatAppLog("error", "at common/logger.js:73", "创建写入器失败:", error);
      });
    }
    /**
     * 清空并写入
     */
    clearAndWrite(fileEntry, content) {
      fileEntry.createWriter((writer) => {
        writer.onwrite = () => {
          writer.seek(0);
          writer.write(`[日志文件已清空]
${content}`);
        };
        writer.onerror = (error) => {
          formatAppLog("error", "at common/logger.js:88", "清空日志失败:", error);
        };
        writer.truncate(0);
      });
    }
    /**
     * 信息级别日志
     */
    info(message) {
      this.log(message, "INFO");
    }
    /**
     * 错误级别日志
     */
    error(message) {
      this.log(message, "ERROR");
    }
    /**
     * 警告级别日志
     */
    warn(message) {
      this.log(message, "WARN");
    }
    /**
     * 调试级别日志
     */
    debug(message) {
      this.log(message, "DEBUG");
    }
    /**
     * 读取日志文件内容
     * @param {function} callback - 回调函数，参数为日志内容
     */
    readLog(callback) {
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs2) => {
        fs2.root.getFile(this.logFileName, {
          create: false
        }, (fileEntry) => {
          fileEntry.file((file) => {
            const reader = new plus.io.FileReader();
            reader.onloadend = (e2) => {
              callback && callback(e2.target.result);
            };
            reader.onerror = (error) => {
              formatAppLog("error", "at common/logger.js:137", "读取日志失败:", error);
              callback && callback("");
            };
            reader.readAsText(file, "utf-8");
          });
        }, (error) => {
          formatAppLog("log", "at common/logger.js:143", "日志文件不存在");
          callback && callback("");
        });
      });
    }
    /**
     * 清空日志文件
     */
    clearLog() {
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs2) => {
        fs2.root.getFile(this.logFileName, {
          create: true
        }, (fileEntry) => {
          fileEntry.createWriter((writer) => {
            writer.onwrite = () => {
              formatAppLog("log", "at common/logger.js:159", "日志已清空");
            };
            writer.truncate(0);
          });
        });
      });
    }
    /**
     * 获取日志文件路径
     * @param {function} callback - 回调函数，参数为文件路径
     */
    getLogPath(callback) {
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs2) => {
        const path = `${fs2.root.fullPath}${this.logFileName}`;
        callback && callback(path);
      });
    }
  }
  const logger = new Logger();
  class SnowflakeGenerator {
    constructor(workerId = 1, datacenterId = 1) {
      this.twepoch = 16409952e5;
      this.workerIdBits = 5;
      this.datacenterIdBits = 5;
      this.sequenceBits = 12;
      this.maxWorkerId = Math.pow(2, this.workerIdBits) - 1;
      this.maxDatacenterId = Math.pow(2, this.datacenterIdBits) - 1;
      this.sequenceMask = Math.pow(2, this.sequenceBits) - 1;
      this.workerIdShift = this.sequenceBits;
      this.datacenterIdShift = this.sequenceBits + this.workerIdBits;
      this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits;
      if (workerId > this.maxWorkerId || workerId < 0) {
        logger.warn(`workerId 超出范围，使用默认值。范围: 0-${this.maxWorkerId}`);
        workerId = Math.abs(workerId) % (this.maxWorkerId + 1);
      }
      if (datacenterId > this.maxDatacenterId || datacenterId < 0) {
        logger.warn(`datacenterId 超出范围，使用默认值。范围: 0-${this.maxDatacenterId}`);
        datacenterId = Math.abs(datacenterId) % (this.maxDatacenterId + 1);
      }
      this.workerId = workerId;
      this.datacenterId = datacenterId;
      this.sequence = 0;
      this.lastTimestamp = -1;
    }
    // 生成下一个ID
    nextId() {
      let timestamp = this.timeGen();
      if (timestamp < this.lastTimestamp) {
        logger.warn(`时钟回拨detected，等待恢复...`);
        timestamp = this.lastTimestamp + 1;
      }
      if (this.lastTimestamp === timestamp) {
        this.sequence = this.sequence + 1 & this.sequenceMask;
        if (this.sequence === 0) {
          timestamp = this.tilNextMillis(this.lastTimestamp);
        }
      } else {
        this.sequence = 0;
      }
      this.lastTimestamp = timestamp;
      const timestampPart = (timestamp - this.twepoch).toString();
      const datacenterPart = this.datacenterId.toString().padStart(2, "0");
      const workerPart = this.workerId.toString().padStart(2, "0");
      const sequencePart = this.sequence.toString().padStart(4, "0");
      const id = timestampPart + datacenterPart + workerPart + sequencePart;
      return id;
    }
    // 等待下一毫秒
    tilNextMillis(lastTimestamp) {
      let timestamp = this.timeGen();
      while (timestamp <= lastTimestamp) {
        timestamp = this.timeGen();
      }
      return timestamp;
    }
    // 获取当前时间戳
    timeGen() {
      return Date.now();
    }
  }
  class DBService {
    constructor() {
      this.db = null;
      this.snowflakeGenerator = null;
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
              logger.info("数据库打开成功");
            },
            fail: function(e2) {
              logger.error("数据库打开失败: " + JSON.stringify(e2));
            }
          });
        }
        this.createTables();
        this.initTables();
      });
    }
    // 创建表
    createTables() {
      this.createTable(`create table IF NOT EXISTS user
						(
							id TEXT PRIMARY KEY,
							username TEXT NOT NULL,
							password TEXT NOT NULL,
							nickname TEXT default '',
							avatar TEXT default '',
							email TEXT default '',
							created_at timestamp default CURRENT_TIMESTAMP NOT NULL,
							updated_at timestamp default CURRENT_TIMESTAMP NOT NULL
						);`);
      this.executeSql("CREATE UNIQUE INDEX IF NOT EXISTS idx_username ON user(username);");
      this.createTable(`create table IF NOT EXISTS tally_account 
						(
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							account_name TEXT NOT NULL,
							balance INTEGER default 0 NOT NULL,
							book_id INTEGER NOT NULL,
							user_id INTEGER NOT NULL,
							account_type TEXT NOT NULL,
							icon TEXT NOT NULL,
							create_time timestamp default CURRENT_TIMESTAMP NOT NULL
						);`);
      this.createTable(`create table IF NOT EXISTS tally_bill
						(
						    id          INTEGER PRIMARY KEY AUTOINCREMENT,
							comment 	TEXT,
						    account_id  INTEGER NOT NULL,
						    money       INTEGER default 0 NOT NULL,
						    bill_date   timestamp default CURRENT_TIMESTAMP,
						    category_id INTEGER                             ,
						    user_id     TEXT NOT NULL,
						    create_time timestamp default CURRENT_TIMESTAMP
						);`);
      this.createTable(`create table IF NOT EXISTS tally_category
						(
						    id INTEGER PRIMARY KEY AUTOINCREMENT,
							parent_id INTEGER NOT NULL, -- 收入类型的一级分类是-1, 支出是-2
						    name TEXT NOT NULL,
							directory INTEGER NOT NULL, -- 收入1,支出-1
							user_id INTEGER NOT NULL,
							icon TEXT NOT NULL default '',
							UNIQUE(user_id, parent_id, name, directory)
						);`);
    }
    createTable(sql) {
      return new Promise((resolve, reject) => {
        plus.sqlite.executeSql(
          {
            name: "lifeparterTally",
            sql,
            success: function(e2) {
              resolve(e2);
            },
            fail: function(error) {
              logger.error("创建表时出错: " + JSON.stringify(error));
              reject(error);
            }
          }
        );
      });
    }
    async initTables() {
      const isInitialized = uni.getStorageSync("lifeparter_db_initialized");
      if (isInitialized) {
        return;
      }
      try {
        const result = await this.queryTable(`SELECT COUNT(*) as count FROM tally_category WHERE id < 2000`);
        if (result && result[0] && result[0].count > 0) {
          uni.setStorageSync("db_initialized", true);
          return;
        }
      } catch (error) {
        logger.error("检查初始化状态时出错，继续执行初始化: " + error.message);
      }
      await this.executeSql(`INSERT OR IGNORE INTO tally_category (id, parent_id, name, directory, user_id, icon) VALUES 
		(1, 0, '收入', 1, 1,''),
		(2, 0, '支出', -1, 1,''),
		(11, 1, '职业收入', 1, 1,''),
		(12, 11, '工资收入', 1, 1, '/static/icons/salary.png'),
		(13, 11, '公积金收入', 1, 1,'/static/icons/accumulation-fund.png'),
		(14, 11, '奖金', 1, 1,'/static/icons/bonus.svg'),
		(15, 11, '加班费', 1, 1,'/static/icons/overtime-pay.svg'),
		(16, 11, '经营所得', 1, 1,'/static/icons/business-income.svg'),
		(17, 11, '兼职', 1, 1,'/static/icons/part-time-job.svg'),
		
		(21, 1, '投资收入', 1, 1,''),
		(22, 21, '理财收入', 1, 1,'/static/icons/financial-management.png'),
		
		(101, 2, '日常支出', 1, 1,''),
		(102, 101, '消费', -1, 1,'/static/icons/consumption.png'),
		
		(200, 2, '住房支出', 1, 1,''),
		(201, 200, '房贷', -1, 1,'/static/icons/rent.png'),
		(202, 200, '房租', -1, 1,'/static/icons/rent.png'),
		
		(300, 2, '理财亏损', 1, 1,''),
		(301, 300, '股票', -1, 1,'/static/icons/rent.png'),
		(302, 300, '基金', -1, 1,'/static/icons/rent.png'),

		(1998, 0, '余额变更', 1, 1,'/static/icons/rent.png'),
		(1999, 0, '余额变更', -1, 1,'/static/icons/rent.png')
		`);
      uni.setStorageSync("lifeparter_db_initialized", true);
    }
    insertTallyAccount(accountName, balance, bookId, userId, accountType, icon) {
      var sql = `INSERT INTO tally_account (account_name, balance, book_id, user_id, account_type, icon) 
				VALUES ('${accountName}', ${balance}, ${bookId}, ${userId}, '${accountType}', '${icon}')`;
      return this.executeSql(sql);
    }
    updateTallyAccount(accountId, accountName, accountType, icon) {
      var sql = `UPDATE tally_account SET account_name='${accountName}', account_type='${accountType}', icon='${icon}' WHERE id=${accountId}`;
      return this.executeSql(sql);
    }
    insertTallyBill(account_id, money, bill_date, category_id, comment, user_id) {
      var sql = `INSERT INTO tally_bill (account_id, money, bill_date, category_id, comment, user_id) 
				VALUES (${account_id}, ${money}, ${bill_date}, ${category_id}, '${comment}', '${user_id}')`;
      this.executeSql(sql);
    }
    insertTallyCategory(name, icon, parent_id, directory, user_id) {
      const sql = `INSERT INTO tally_category (name, icon, parent_id, directory, user_id) 
				VALUES ('${name}', '${icon}', ${parent_id}, ${directory}, ${user_id})`;
      return this.executeSql(sql);
    }
    updateTallyCategory(id, name, icon, parent_id, directory) {
      const sql = `UPDATE tally_category SET name='${name}', icon='${icon}', parent_id=${parent_id}, directory=${directory} 
				WHERE id=${id}`;
      return this.executeSql(sql);
    }
    deleteTallyCategory(id) {
      const sql = `DELETE FROM tally_category WHERE id=${id}`;
      return this.executeSql(sql);
    }
    deleteTallyCategoryWithChildren(id) {
      const deleteChildrenSql = `DELETE FROM tally_category WHERE parent_id=${id}`;
      this.executeSql(deleteChildrenSql);
      const deleteSql = `DELETE FROM tally_category WHERE id=${id}`;
      return this.executeSql(deleteSql);
    }
    async insertUser(username, password) {
      const userId = this.generateSnowflakeId();
      const salt = bcrypt.genSaltSync(10);
      const hash2 = bcrypt.hashSync(password, salt);
      const sql = `INSERT INTO user (id, username, password) VALUES ('${userId}', '${username}', '${hash2}')`;
      await this.executeSql(sql);
      return userId;
    }
    // 雪花算法ID生成器（内置到DBService中）
    generateSnowflakeId() {
      if (!this.snowflakeGenerator) {
        this.initSnowflakeGenerator();
      }
      try {
        const id = this.snowflakeGenerator.nextId();
        return id;
      } catch (error) {
        logger.warn("雪花算法生成失败，使用备用方案: " + error.message);
        return this.generateFallbackId();
      }
    }
    // 备用ID生成方案
    generateFallbackId() {
      const timestamp = Date.now();
      const workerId = this.generateWorkerId();
      const random = Math.floor(Math.random() * 1e4);
      const id = `${timestamp}${workerId.toString().padStart(2, "0")}${random.toString().padStart(4, "0")}`;
      logger.info("使用备用ID: " + id);
      return id;
    }
    // 初始化雪花算法生成器
    initSnowflakeGenerator() {
      const workerId = this.generateWorkerId();
      const datacenterId = 1;
      this.snowflakeGenerator = new SnowflakeGenerator(workerId, datacenterId);
    }
    // 基于设备信息生成workerId
    generateWorkerId() {
      try {
        const systemInfo = uni.getSystemInfoSync();
        const deviceId = systemInfo.deviceId || systemInfo.system || "default";
        let hash2 = 0;
        for (let i2 = 0; i2 < deviceId.length; i2++) {
          hash2 = (hash2 << 5) - hash2 + deviceId.charCodeAt(i2) & 4294967295;
        }
        return Math.abs(hash2) % 32;
      } catch (error) {
        logger.warn("无法获取设备信息，使用默认workerId: " + error.message);
        return Math.floor(Math.random() * 32);
      }
    }
    updateTallyBill(bill_id, account_id, money, bill_date, category_id, comment) {
      var sql = `UPDATE tally_bill set account_id=${account_id}, money=${money}, bill_date=${bill_date}, category_id=${category_id}, comment='${comment}' WHERE id=${bill_id}`;
      this.executeSql(sql);
    }
    deleteTallyBill(id) {
      var sql = `DELETE FROM tally_bill WHERE id=${id}`;
      this.executeSql(sql);
    }
    deleteTallyBillByAccount(account_id) {
      var sql = `DELETE FROM tally_bill WHERE account_id=${account_id}`;
      this.executeSql(sql);
    }
    deleteById(table, id) {
      var sql = `DELETE FROM ${table} WHERE id=${id}`;
      this.executeSql(sql);
    }
    getTallyBillByAccountId(account_id) {
      return this.queryTable(`SELECT b.*, a.account_name as accountName FROM tally_Bill b
		INNER JOIN tally_account a ON b.account_id = a.id
		where account_id=${account_id} order by bill_date desc`);
    }
    getTallyBillByCategoryAndMonth(category_id, month) {
      return this.queryTable(`SELECT b.*, a.account_name as accountName FROM tally_Bill b
		INNER JOIN tally_account a ON b.account_id = a.id
		where category_id=${category_id} 
		and strftime('%Y%m', datetime(bill_date / 1000, 'unixepoch')) = '${month}'
		order by bill_date desc`);
    }
    getTallyBillById(id) {
      return this.queryTable(`SELECT * FROM tally_Bill where id=${id}`);
    }
    getTallyAccount(user_id) {
      return this.queryTable(
        `SELECT id, account_name, balance, account_type, icon FROM tally_account WHERE user_id=${user_id}`
      );
    }
    getTallyAccountById(id) {
      return this.queryTable(`SELECT id, account_name, balance, account_type FROM tally_account WHERE id=${id}`).then((rows) => rows && rows.length > 0 ? rows[0] : null);
    }
    getTallyCategory() {
      return this.queryTable(`SELECT id, 
			icon,
			name as category
			FROM tally_category`);
    }
    getTallyCategoryById(id) {
      return this.queryTable(`SELECT * FROM tally_category where id = ${id}`);
    }
    getUser(username) {
      return this.queryTable(`SELECT 1 FROM user WHERE username = '${username}'`);
    }
    getUserById(user_id) {
      return this.queryTable(`SELECT * FROM user WHERE id = '${user_id}'`);
    }
    updateUser(user_id, updates) {
      const fields = [];
      if (updates.nickname !== void 0)
        fields.push(`nickname='${updates.nickname}'`);
      if (updates.avatar !== void 0)
        fields.push(`avatar='${updates.avatar}'`);
      if (updates.email !== void 0)
        fields.push(`email='${updates.email}'`);
      if (updates.password !== void 0)
        fields.push(`password='${updates.password}'`);
      if (fields.length === 0)
        return Promise.resolve();
      const sql = `UPDATE user SET ${fields.join(", ")}, updated_at=CURRENT_TIMESTAMP WHERE id='${user_id}'`;
      return this.executeSql(sql);
    }
    async login(username, password) {
      const rows = await this.queryTable(`SELECT id, password FROM user WHERE username = '${username}'`);
      if (!rows || rows.length === 0)
        return [];
      const hash2 = rows[0].password;
      if (bcrypt.compareSync(password, hash2)) {
        return [{
          id: rows[0].id
        }];
      } else {
        return [];
      }
    }
    getByTableName(tableName) {
      return this.queryTable(`SELECT * FROM ${tableName}`);
    }
    getLastInsertRowid() {
      return this.queryTable(`SELECT last_insert_rowid() AS id`);
    }
    executeSql(sql) {
      return new Promise((resolve, reject) => {
        plus.sqlite.executeSql({
          name: "lifeparterTally",
          sql,
          success: function(e2) {
            resolve(e2);
          },
          fail: function(error) {
            logger.error("SQL执行出错: " + JSON.stringify(error));
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
            logger.error("SQL查询出错: " + JSON.stringify(error));
            reject(error);
          }
        });
      });
    }
  }
  function formatTime(time) {
    if (typeof time !== "number" || time < 0) {
      return time;
    }
    var hour = parseInt(time / 3600);
    time = time % 3600;
    var minute = parseInt(time / 60);
    time = time % 60;
    var second = time;
    return [hour, minute, second].map(function(n2) {
      n2 = n2.toString();
      return n2[1] ? n2 : "0" + n2;
    }).join(":");
  }
  function formatLocation(longitude, latitude) {
    if (typeof longitude === "string" && typeof latitude === "string") {
      longitude = parseFloat(longitude);
      latitude = parseFloat(latitude);
    }
    longitude = longitude.toFixed(2);
    latitude = latitude.toFixed(2);
    return {
      longitude: longitude.toString().split("."),
      latitude: latitude.toString().split(".")
    };
  }
  var dateUtils = {
    UNITS: {
      "年": 315576e5,
      "月": 26298e5,
      "天": 864e5,
      "小时": 36e5,
      "分钟": 6e4,
      "秒": 1e3
    },
    humanize: function(milliseconds) {
      var humanize = "";
      for (var key in this.UNITS) {
        if (milliseconds >= this.UNITS[key]) {
          humanize = Math.floor(milliseconds / this.UNITS[key]) + key + "前";
          break;
        }
      }
      return humanize || "刚刚";
    },
    format: function(dateStr) {
      var date = this.parse(dateStr);
      var diff = Date.now() - date.getTime();
      if (diff < this.UNITS["天"]) {
        return this.humanize(diff);
      }
      var _format = function(number) {
        return number < 10 ? "0" + number : number;
      };
      return date.getFullYear() + "/" + _format(date.getMonth() + 1) + "/" + _format(date.getDate()) + "-" + _format(date.getHours()) + ":" + _format(date.getMinutes());
    },
    parse: function(str) {
      var a2 = str.split(/[^0-9]/);
      return new Date(a2[0], a2[1] - 1, a2[2], a2[3], a2[4], a2[5]);
    }
  };
  function fenToYuanString(number) {
    return keep2DigitsString(number / 100);
  }
  function fenToYuanNumber(number) {
    return keep2DigitsNumber(number / 100);
  }
  function yuanToFenString(number) {
    return keep2DigitsString(number * 100);
  }
  function yuanToFenNumber(number) {
    return keep2DigitsNumber(number * 100);
  }
  function keep2DigitsString(number) {
    return parseFloat(number).toFixed(2);
  }
  function keep2DigitsNumber(number) {
    return parseFloat(keep2DigitsString(number));
  }
  class SnowflakeIdGenerator {
    constructor(workerId = 1, datacenterId = 1) {
      this.twepoch = 16409952e5;
      this.workerIdBits = 5;
      this.datacenterIdBits = 5;
      this.sequenceBits = 12;
      this.maxWorkerId = -1 ^ -1 << this.workerIdBits;
      this.maxDatacenterId = -1 ^ -1 << this.datacenterIdBits;
      this.sequenceMask = -1 ^ -1 << this.sequenceBits;
      this.workerIdShift = this.sequenceBits;
      this.datacenterIdShift = this.sequenceBits + this.workerIdBits;
      this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits;
      if (workerId > this.maxWorkerId || workerId < 0) {
        throw new Error(`workerId 必须在 0 到 ${this.maxWorkerId} 之间`);
      }
      if (datacenterId > this.maxDatacenterId || datacenterId < 0) {
        throw new Error(`datacenterId 必须在 0 到 ${this.maxDatacenterId} 之间`);
      }
      this.workerId = workerId;
      this.datacenterId = datacenterId;
      this.sequence = 0;
      this.lastTimestamp = -1;
    }
    // 生成下一个ID
    nextId() {
      let timestamp = this.timeGen();
      if (timestamp < this.lastTimestamp) {
        throw new Error(`时钟回拨，拒绝生成ID。上次时间戳: ${this.lastTimestamp}, 当前时间戳: ${timestamp}`);
      }
      if (this.lastTimestamp === timestamp) {
        this.sequence = this.sequence + 1 & this.sequenceMask;
        if (this.sequence === 0) {
          timestamp = this.tilNextMillis(this.lastTimestamp);
        }
      } else {
        this.sequence = 0;
      }
      this.lastTimestamp = timestamp;
      const id = timestamp - this.twepoch << this.timestampLeftShift | this.datacenterId << this.datacenterIdShift | this.workerId << this.workerIdShift | this.sequence;
      return id.toString();
    }
    // 等待下一毫秒
    tilNextMillis(lastTimestamp) {
      let timestamp = this.timeGen();
      while (timestamp <= lastTimestamp) {
        timestamp = this.timeGen();
      }
      return timestamp;
    }
    // 获取当前时间戳
    timeGen() {
      return Date.now();
    }
    // 解析雪花ID（用于调试）
    parseId(id) {
      const bigId = BigInt(id);
      const timestamp = Number((bigId >> BigInt(this.timestampLeftShift)) + BigInt(this.twepoch));
      const datacenterId = Number(bigId >> BigInt(this.datacenterIdShift) & BigInt(this.maxDatacenterId));
      const workerId = Number(bigId >> BigInt(this.workerIdShift) & BigInt(this.maxWorkerId));
      const sequence = Number(bigId & BigInt(this.sequenceMask));
      return {
        timestamp: new Date(timestamp),
        datacenterId,
        workerId,
        sequence,
        originalId: id
      };
    }
  }
  const idUtils = {
    // 雪花算法实例（可以根据设备生成不同的workerId）
    snowflake: null,
    // 初始化雪花算法
    initSnowflake(workerId = null, datacenterId = 1) {
      if (workerId === null) {
        workerId = this.generateWorkerId();
      }
      this.snowflake = new SnowflakeIdGenerator(workerId, datacenterId);
    },
    // 基于设备信息生成workerId
    generateWorkerId() {
      try {
        const systemInfo = uni.getSystemInfoSync();
        const deviceId = systemInfo.deviceId || systemInfo.system || "default";
        let hash2 = 0;
        for (let i2 = 0; i2 < deviceId.length; i2++) {
          hash2 = (hash2 << 5) - hash2 + deviceId.charCodeAt(i2) & 4294967295;
        }
        return Math.abs(hash2) % 32;
      } catch (error) {
        formatAppLog("warn", "at common/utils.js:217", "无法获取设备信息，使用默认workerId:", error);
        return Math.floor(Math.random() * 32);
      }
    },
    // 生成雪花ID
    generateSnowflakeId() {
      if (!this.snowflake) {
        this.initSnowflake();
      }
      return this.snowflake.nextId();
    },
    // UUID 生成器（保留作为备选）
    generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c2) {
        const r2 = Math.random() * 16 | 0;
        const v2 = c2 == "x" ? r2 : r2 & 3 | 8;
        return v2.toString(16);
      });
    },
    // 生成短UUID（去掉连字符）
    generateShortUUID() {
      return this.generateUUID().replace(/-/g, "");
    },
    // 生成数字ID（基于时间戳+随机数）
    generateNumericId() {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1e4);
      return `${timestamp}${random.toString().padStart(4, "0")}`;
    },
    // 解析雪花ID
    parseSnowflakeId(id) {
      if (!this.snowflake) {
        this.initSnowflake();
      }
      return this.snowflake.parseId(id);
    }
  };
  const uuidUtils = idUtils;
  const authUtils = {
    // 检查是否已登录
    isLoggedIn() {
      const user_id = uni.getStorageSync("user_id");
      return !!user_id;
    },
    // 获取当前用户ID
    getCurrentUserId() {
      return uni.getStorageSync("user_id");
    },
    // 登录检测拦截器 - 如果未登录则跳转到登录页
    requireLogin(showToast = true) {
      if (!this.isLoggedIn()) {
        if (showToast) {
          uni.showToast({
            title: "请先登录",
            icon: "none",
            duration: 1e3
          });
        }
        const pages2 = getCurrentPages();
        const currentPage = pages2[pages2.length - 1];
        const currentRoute = "/" + currentPage.route;
        if (currentRoute !== "/pages/user-center/login") {
          setTimeout(() => {
            uni.navigateTo({
              url: "/pages/user-center/login"
            });
          }, showToast ? 1e3 : 0);
        }
        return false;
      }
      return true;
    },
    // 登出功能
    logout() {
      uni.removeStorageSync("user_id");
      uni.setTabBarItem({
        index: 2,
        pagePath: "pages/user-center/user-center",
        text: "我的"
      });
      uni.showToast({
        title: "已退出登录",
        icon: "success",
        duration: 500
      });
    }
  };
  const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    authUtils,
    dateUtils,
    fenToYuanNumber,
    fenToYuanString,
    formatLocation,
    formatTime,
    idUtils,
    keep2DigitsNumber,
    keep2DigitsString,
    uuidUtils,
    yuanToFenNumber,
    yuanToFenString
  }, Symbol.toStringTag, { value: "Module" }));
  const authRequiredPages = [
    "/pages/settle-account/settle-account",
    "/pages/settle-account/account",
    "/pages/settle-account/flow",
    "/pages/settle-account/account-create",
    "/pages/settle-account/flow-create",
    "/pages/settle-account/flow-edit",
    "/pages/user-center/user-center",
    "/pages/user-center/account-setting",
    "/pages/reports/reports"
  ];
  const publicPages = [
    "/pages/user-center/registry",
    "/pages/user-center/login"
  ];
  function checkPageAuth(url, showToast = true) {
    const pagePath = url.split("?")[0];
    if (publicPages.includes(pagePath)) {
      return true;
    }
    if (authRequiredPages.includes(pagePath)) {
      return authUtils.requireLogin(showToast);
    }
    return true;
  }
  const originalNavigateTo = uni.navigateTo;
  uni.navigateTo = function(options) {
    if (checkPageAuth(options.url)) {
      return originalNavigateTo.call(this, options);
    }
    return Promise.reject(new Error("需要登录"));
  };
  const originalRedirectTo = uni.redirectTo;
  uni.redirectTo = function(options) {
    if (checkPageAuth(options.url)) {
      return originalRedirectTo.call(this, options);
    }
    return Promise.reject(new Error("需要登录"));
  };
  const originalSwitchTab = uni.switchTab;
  uni.switchTab = function(options) {
    if (checkPageAuth(options.url)) {
      return originalSwitchTab.call(this, options);
    }
    return Promise.reject(new Error("需要登录"));
  };
  const originalReLaunch = uni.reLaunch;
  uni.reLaunch = function(options) {
    if (checkPageAuth(options.url)) {
      return originalReLaunch.call(this, options);
    }
    return Promise.reject(new Error("需要登录"));
  };
  function checkCurrentPageAuth(pagePath) {
    if (authRequiredPages.includes(pagePath) && !authUtils.isLoggedIn()) {
      authUtils.requireLogin(true);
      return false;
    }
    return true;
  }
  const _sfc_main$I = {
    __name: "account",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const handleClick = () => {
        uni.navigateTo({
          url: "/pages/settle-account/account-create"
        });
      };
      const navigateToFlow = (accountId) => {
        uni.navigateTo({
          url: `/pages/settle-account/flow?account_id=${accountId}`
        });
      };
      const closeAllAndNavigate = (accountId) => {
        if (swipeAction.value && swipeAction.value.length > 0) {
          for (let i2 = 0; i2 < swipeAction.value.length; i2++) {
            if (swipeAction.value[i2] && swipeAction.value[i2].closeAll) {
              swipeAction.value[i2].closeAll();
            }
          }
        }
        navigateToFlow(accountId);
      };
      const totalAssets = vue.computed(() => {
        let total = 0;
        cards.forEach((card) => {
          card.items.forEach((item) => {
            total += parseFloat(item.balance) || 0;
          });
        });
        return total.toFixed(2);
      });
      var cards = vue.reactive([]);
      onLoad((options) => {
        if (!checkCurrentPageAuth("/pages/settle-account/account")) {
          return;
        }
      });
      async function loadAccounts() {
        const user_id = authUtils.getCurrentUserId();
        const accounts = await dbService2.getTallyAccount(user_id);
        for (var account of accounts) {
          const tallBill = await dbService2.getTallyBillByAccountId(account.id);
          account.balance = fenToYuanString(account.balance + tallBill.reduce((balance, item) => {
            return balance + item.money;
          }, 0));
        }
        const groupData = Array.from(
          accounts.reduce((map, item) => {
            const key = item.account_type;
            if (!map.has(key))
              map.set(key, []);
            map.get(key).push(item);
            return map;
          }, /* @__PURE__ */ new Map()),
          ([title, items]) => ({
            title,
            items
          })
        );
        cards.splice(0, cards.length, ...groupData);
      }
      onShow(loadAccounts);
      onPullDownRefresh(async () => {
        if (!checkCurrentPageAuth("/pages/settle-account/settle-account")) {
          uni.stopPullDownRefresh();
          return;
        }
        await loadAccounts();
        uni.stopPullDownRefresh();
      });
      const swipeAction = vue.ref();
      const swipeChange = (e2, index) => {
        if (e2 !== "none" && swipeAction.value && swipeAction.value.length > 0) {
          for (let i2 = 0; i2 < swipeAction.value.length; i2++) {
            if (i2 !== index && swipeAction.value[i2] && swipeAction.value[i2].closeAll) {
              swipeAction.value[i2].closeAll();
            }
          }
        }
      };
      const handleSwipeClick = (e2, account, card, index) => {
        const {
          index: buttonIndex
        } = e2;
        if (buttonIndex === 0) {
          navigateToEdit(account);
        } else if (buttonIndex === 1) {
          handleDelete(account, card, index);
        }
      };
      const navigateToEdit = (account) => {
        uni.navigateTo({
          url: `/pages/settle-account/account-create?id=${account.id}&accountName=${encodeURIComponent(account.account_name)}&balance=${account.balance}&accountType=${encodeURIComponent(account.account_type)}&icon=${encodeURIComponent(account.icon || "")}`
        });
      };
      const handleDelete = async (account, card, index) => {
        try {
          if (swipeAction.value && swipeAction.value.length > 0) {
            for (let i2 = 0; i2 < swipeAction.value.length; i2++) {
              if (swipeAction.value[i2] && swipeAction.value[i2].closeAll) {
                swipeAction.value[i2].closeAll();
              }
            }
          }
          await Promise.all([
            dbService2.deleteById("tally_account", account.id),
            dbService2.deleteTallyBillByAccount(account.id)
          ]);
          card.items.splice(index, 1);
          const cardIndex = cards.findIndex((c2) => c2.title === card.title);
          if (card.items.length === 0 && cardIndex !== -1) {
            cards.splice(cardIndex, 1);
          }
        } catch (e2) {
          formatAppLog("log", "at pages/settle-account/account.vue:196", e2);
          uni.showToast({
            title: "删除失败:" + e2,
            icon: "none"
          });
        }
      };
      const __returned__ = { dbService: dbService2, handleClick, navigateToFlow, closeAllAndNavigate, totalAssets, get cards() {
        return cards;
      }, set cards(v2) {
        cards = v2;
      }, loadAccounts, swipeAction, swipeChange, handleSwipeClick, navigateToEdit, handleDelete, onMounted: vue.onMounted, reactive: vue.reactive, computed: vue.computed, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get DBService() {
        return DBService;
      }, get authUtils() {
        return authUtils;
      }, get checkCurrentPageAuth() {
        return checkCurrentPageAuth;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$H(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$4);
    const _component_uni_swipe_action_item = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action-item"), __easycom_1$5);
    const _component_uni_swipe_action = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action"), __easycom_2$5);
    const _component_wd_fab = resolveEasycom(vue.resolveDynamicComponent("wd-fab"), __easycom_2$4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header-section" }, [
        vue.createElementVNode("view", { class: "status_bar" }),
        vue.createElementVNode("view", { class: "total-money" }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($setup.totalAssets),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "total-money-name" }, "净资产")
        ])
      ]),
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.cards, (card, index) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            class: "card",
            key: index
          }, [
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
                          { text: "编辑", style: { backgroundColor: "#0b95ff", color: "#fff" } },
                          { text: "删除", style: { backgroundColor: "red", color: "#fff" } }
                        ],
                        onChange: (e2) => $setup.swipeChange(e2, index),
                        onClick: (e2) => $setup.handleSwipeClick(e2, accountItem, card, itemIndex)
                      }, {
                        default: vue.withCtx(() => [
                          vue.createElementVNode("view", {
                            class: "account-item",
                            onClick: ($event) => $setup.closeAllAndNavigate(accountItem.id)
                          }, [
                            vue.createElementVNode("view", { class: "account-left" }, [
                              vue.createVNode(_component_wd_icon, {
                                name: accountItem.icon
                              }, null, 8, ["name"]),
                              vue.createElementVNode(
                                "text",
                                { class: "account-name" },
                                vue.toDisplayString(accountItem.account_name),
                                1
                                /* TEXT */
                              )
                            ]),
                            vue.createElementVNode("view", { class: "account-right" }, [
                              vue.createElementVNode(
                                "text",
                                { class: "account-balance" },
                                vue.toDisplayString(accountItem.balance),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode("text", { class: "arrow" }, ">")
                            ])
                          ], 8, ["onClick"])
                        ]),
                        _: 2
                        /* DYNAMIC */
                      }, 1032, ["onChange", "onClick"]);
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
  const PagesSettleAccountAccount = /* @__PURE__ */ _export_sfc(_sfc_main$I, [["render", _sfc_render$H], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/account.vue"]]);
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
  const _sfc_main$H = {
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
  function _sfc_render$G(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_1$4 = /* @__PURE__ */ _export_sfc(_sfc_main$H, [["render", _sfc_render$G], ["__scopeId", "data-v-d31e1c47"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  const _sfc_main$G = {
    __name: "login",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const username = vue.ref("");
      const password = vue.ref("");
      vue.onMounted(() => {
        if (authUtils.isLoggedIn()) {
          uni.reLaunch({
            url: "/pages/settle-account/account"
          });
        }
      });
      function login() {
        if (!username.value || !password.value) {
          return uni.showToast({
            title: "请输入用户名和密码",
            icon: "none"
          });
        }
        dbService2.login(username.value, password.value).then((result) => {
          if (result[0]) {
            uni.setStorageSync("user_id", result[0].id);
            uni.showToast({
              title: "登录成功",
              icon: "success",
              duration: 600
            });
            setTimeout(() => {
              uni.switchTab({
                url: "/pages/settle-account/account"
              });
            }, 600);
          } else {
            uni.showToast({
              title: "用户名或密码错误",
              icon: "none",
              duration: 2e3
            });
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/user-center/login.vue:83", err);
          uni.showToast({
            title: "登录失败，请稍后重试",
            icon: "none",
            duration: 2e3
          });
        });
      }
      function goRegister() {
        uni.navigateTo({
          url: "/pages/user-center/registry"
        });
      }
      const __returned__ = { dbService: dbService2, username, password, login, goRegister, onMounted: vue.onMounted, ref: vue.ref, get DBService() {
        return DBService;
      }, uniIcons: __easycom_1$4, get authUtils() {
        return authUtils;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$F(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "login-box" }, [
        vue.createElementVNode("view", { class: "login-header" }, [
          vue.createElementVNode("text", { class: "login-title" }, "GO GO GO"),
          vue.createElementVNode("text", { class: "login-title" }, "开始记账咯")
        ]),
        vue.createElementVNode("view", { class: "login-form" }, [
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.createVNode($setup["uniIcons"], {
              type: "person",
              size: "20",
              color: "#999"
            }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "login-input",
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.username = $event),
                placeholder: "请输入用户名"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.username]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.createVNode($setup["uniIcons"], {
              type: "locked",
              size: "20",
              color: "#999"
            }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "login-input",
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.password = $event),
                placeholder: "请输入密码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.password]
            ])
          ]),
          vue.createElementVNode("button", {
            class: "login-btn",
            onClick: $setup.login
          }, "登录"),
          vue.createElementVNode("view", {
            class: "register-link",
            onClick: $setup.goRegister
          }, "还没有账号？去注册")
        ])
      ])
    ]);
  }
  const PagesUserCenterLogin = /* @__PURE__ */ _export_sfc(_sfc_main$G, [["render", _sfc_render$F], ["__scopeId", "data-v-84491e6d"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/user-center/login.vue"]]);
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
  const _sfc_main$F = /* @__PURE__ */ vue.defineComponent({
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
      const __returned__ = { props, emit, cell, isBorder, form, errorMessage, isRequired, onClick, wdIcon: __easycom_0$4 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$E(_ctx, _cache, $props, $setup, $data, $options) {
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
              _ctx.icon ? (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                key: 0,
                name: _ctx.icon,
                "custom-class": `wd-cell__icon  ${_ctx.customIconClass}`
              }, null, 8, ["name", "custom-class"])) : vue.renderSlot(_ctx.$slots, "icon", { key: 1 }, void 0, true),
              vue.createElementVNode("view", { class: "wd-cell__title" }, [
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
                _ctx.label ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 2,
                    class: vue.normalizeClass(`wd-cell__label ${_ctx.customLabelClass}`)
                  },
                  vue.toDisplayString(_ctx.label),
                  3
                  /* TEXT, CLASS */
                )) : vue.renderSlot(_ctx.$slots, "label", { key: 3 }, void 0, true)
              ])
            ],
            6
            /* CLASS, STYLE */
          ),
          vue.createElementVNode("view", { class: "wd-cell__right" }, [
            vue.createElementVNode("view", { class: "wd-cell__body" }, [
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
          ])
        ],
        2
        /* CLASS */
      )
    ], 14, ["hover-class"]);
  }
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$F, [["render", _sfc_render$E], ["__scopeId", "data-v-f1c5bbe2"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-cell/wd-cell.vue"]]);
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
  const _sfc_main$E = /* @__PURE__ */ vue.defineComponent({
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
  function _sfc_render$D(_ctx, _cache, $props, $setup, $data, $options) {
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
          vue.createElementVNode("view", { class: "wd-cell-group__left" }, [
            _ctx.title ? (vue.openBlock(), vue.createElementBlock(
              "text",
              { key: 0 },
              vue.toDisplayString(_ctx.title),
              1
              /* TEXT */
            )) : vue.renderSlot(_ctx.$slots, "title", { key: 1 }, void 0, true)
          ]),
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
  const __easycom_2$3 = /* @__PURE__ */ _export_sfc(_sfc_main$E, [["render", _sfc_render$D], ["__scopeId", "data-v-55e5786b"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-cell-group/wd-cell-group.vue"]]);
  const _sfc_main$D = {
    __name: "LoginComponent",
    emits: ["loginSuccess"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit = __emit;
      const dbService2 = new DBService();
      const username = vue.ref("");
      const password = vue.ref("");
      function login() {
        if (!username.value || !password.value) {
          return uni.showToast({
            title: "请输入用户名和密码",
            icon: "none"
          });
        }
        dbService2.login(username.value, password.value).then((result) => {
          if (result[0]) {
            uni.setStorageSync("user_id", result[0].id);
            uni.showToast({
              title: "登录成功",
              icon: "success",
              duration: 800
            });
            setTimeout(() => {
              emit("loginSuccess", result[0]);
            }, 800);
          } else {
            uni.showToast({
              title: "用户名或密码错误",
              icon: "none",
              duration: 2e3
            });
          }
        }).catch((err) => {
          formatAppLog("error", "at components/LoginComponent.vue:73", err);
          uni.showToast({
            title: "登录失败，请稍后重试",
            icon: "none",
            duration: 2e3
          });
        });
      }
      function goRegister() {
        uni.navigateTo({
          url: "/pages/user-center/registry"
        });
      }
      const __returned__ = { emit, dbService: dbService2, username, password, login, goRegister, ref: vue.ref, get DBService() {
        return DBService;
      }, uniIcons: __easycom_1$4 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$C(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "login-box" }, [
        vue.createElementVNode("view", { class: "login-header" }, [
          vue.createElementVNode("text", { class: "login-title" }, "GO GO GO"),
          vue.createElementVNode("text", { class: "login-title" }, "开始记账咯")
        ]),
        vue.createElementVNode("view", { class: "login-form" }, [
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.createVNode($setup["uniIcons"], {
              type: "person",
              size: "20",
              color: "#999"
            }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "login-input",
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.username = $event),
                placeholder: "请输入用户名"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.username]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.createVNode($setup["uniIcons"], {
              type: "locked",
              size: "20",
              color: "#999"
            }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "login-input",
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.password = $event),
                placeholder: "请输入密码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.password]
            ])
          ]),
          vue.createElementVNode("button", {
            class: "login-btn",
            onClick: $setup.login
          }, "登录"),
          vue.createElementVNode("view", {
            class: "register-link",
            onClick: $setup.goRegister
          }, "还没有账号？去注册")
        ])
      ])
    ]);
  }
  const LoginComponent = /* @__PURE__ */ _export_sfc(_sfc_main$D, [["render", _sfc_render$C], ["__scopeId", "data-v-dfe0ea0e"], ["__file", "E:/document/LifePartner/lifeparter-app/components/LoginComponent.vue"]]);
  const _sfc_main$C = {
    __name: "user-center",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const nickname = vue.ref("");
      const avatarUrl = vue.ref("/static/image/default-avatar.png");
      const isLoggedIn = vue.ref(false);
      function checkLoginStatus() {
        isLoggedIn.value = authUtils.isLoggedIn();
        if (isLoggedIn.value) {
          loadUserInfo();
        }
      }
      async function loadUserInfo() {
        const user_id = authUtils.getCurrentUserId();
        if (user_id) {
          try {
            const userInfo = await dbService2.getUserById(user_id);
            if (userInfo && userInfo[0]) {
              const user = userInfo[0];
              nickname.value = user.nickname;
              if (user.avatar) {
                avatarUrl.value = user.avatar;
              }
            }
          } catch (error) {
            formatAppLog("error", "at pages/user-center/user-center.vue:73", "获取用户信息失败:", error);
            uni.showToast({
              title: "获取用户信息失败",
              icon: "none"
            });
          }
        }
      }
      onLoad(() => {
        checkLoginStatus();
      });
      onShow(() => {
        checkLoginStatus();
      });
      vue.onMounted(() => {
        checkLoginStatus();
      });
      function goToAccountSettings() {
        uni.navigateTo({
          url: "/pages/user-center/account-settings"
        });
      }
      function logout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: function(res) {
            if (res.confirm) {
              uni.removeStorageSync("user_id");
              setTimeout(() => {
                uni.redirectTo({
                  url: "/pages/user-center/login"
                });
              }, 400);
            }
          }
        });
      }
      const __returned__ = { dbService: dbService2, nickname, avatarUrl, isLoggedIn, checkLoginStatus, loadUserInfo, goToAccountSettings, logout, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get DBService() {
        return DBService;
      }, get authUtils() {
        return authUtils;
      }, LoginComponent };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$B(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$4);
    const _component_wd_cell = resolveEasycom(vue.resolveDynamicComponent("wd-cell"), __easycom_0$3);
    const _component_wd_cell_group = resolveEasycom(vue.resolveDynamicComponent("wd-cell-group"), __easycom_2$3);
    const _component_wd_button = resolveEasycom(vue.resolveDynamicComponent("wd-button"), __easycom_3$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "logged-in-content" }, [
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode("image", {
            src: $setup.avatarUrl,
            class: "avatar-img",
            onClick: _cache[0] || (_cache[0] = (...args) => _ctx.chooseAvatar && _ctx.chooseAvatar(...args)),
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode(
            "view",
            { class: "nickname" },
            vue.toDisplayString($setup.nickname),
            1
            /* TEXT */
          )
        ]),
        vue.createVNode(_component_wd_cell_group, null, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_wd_cell, {
              title: "账户设置",
              "is-link": "",
              onClick: $setup.goToAccountSettings
            }, {
              icon: vue.withCtx(() => [
                vue.createVNode(_component_wd_icon, {
                  name: "setting",
                  style: { "margin-right": "10px" }
                })
              ]),
              _: 1
              /* STABLE */
            }),
            vue.createVNode(_component_wd_cell, {
              title: "关于我们",
              "is-link": ""
            }, {
              icon: vue.withCtx(() => [
                vue.createVNode(_component_wd_icon, {
                  name: "info",
                  style: { "margin-right": "10px" }
                })
              ]),
              _: 1
              /* STABLE */
            })
          ]),
          _: 1
          /* STABLE */
        }),
        vue.createElementVNode("view", { class: "logout-btn" }, [
          vue.createVNode(_component_wd_button, {
            type: "error",
            onClick: $setup.logout
          }, {
            default: vue.withCtx(() => [
              vue.createTextVNode("退出登录")
            ]),
            _: 1
            /* STABLE */
          })
        ])
      ])
    ]);
  }
  const PagesUserCenterUserCenter = /* @__PURE__ */ _export_sfc(_sfc_main$C, [["render", _sfc_render$B], ["__file", "E:/document/LifePartner/lifeparter-app/pages/user-center/user-center.vue"]]);
  const _sfc_main$B = {
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
  function _sfc_render$A(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesPostPostList = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["render", _sfc_render$A], ["__file", "E:/document/LifePartner/lifeparter-app/pages/post/postList.vue"]]);
  const _sfc_main$A = {
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
  function _sfc_render$z(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesPostPostDetail = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["render", _sfc_render$z], ["__file", "E:/document/LifePartner/lifeparter-app/pages/post/postDetail.vue"]]);
  const pages = [
    {
      path: "pages/settle-account/account",
      style: {
        navigationStyle: "custom",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/user-center/login",
      style: {
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/user-center/user-center",
      style: {
        navigationBarTitleText: ""
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
      path: "pages/reports/reports",
      style: {
        navigationStyle: "custom",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/settle-account/flow",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/settle-account/account-create",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/settle-account/flow-edit",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/user-center/account-settings",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/user-center/registry",
      style: {
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/settle-account/flow-create",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/category/category",
      style: {
        navigationBarTitleText: ""
      }
    },
    {
      path: "pages/category/category-create",
      style: {
        navigationBarTitleText: ""
      }
    }
  ];
  const globalStyle = {
    navigationBarTextStyle: "black",
    navigationBarTitleText: "uni-app",
    navigationBarBackgroundColor: "#70aeff",
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
        pagePath: "pages/settle-account/account",
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
        var i3 = this._hash.words, o3 = e4[t4 + 0], c3 = e4[t4 + 1], p2 = e4[t4 + 2], f2 = e4[t4 + 3], g2 = e4[t4 + 4], m2 = e4[t4 + 5], y2 = e4[t4 + 6], _2 = e4[t4 + 7], w2 = e4[t4 + 8], I2 = e4[t4 + 9], v2 = e4[t4 + 10], S2 = e4[t4 + 11], T2 = e4[t4 + 12], b2 = e4[t4 + 13], E2 = e4[t4 + 14], k2 = e4[t4 + 15], A2 = i3[0], P2 = i3[1], C2 = i3[2], O2 = i3[3];
        A2 = u2(A2, P2, C2, O2, o3, 7, a2[0]), O2 = u2(O2, A2, P2, C2, c3, 12, a2[1]), C2 = u2(C2, O2, A2, P2, p2, 17, a2[2]), P2 = u2(P2, C2, O2, A2, f2, 22, a2[3]), A2 = u2(A2, P2, C2, O2, g2, 7, a2[4]), O2 = u2(O2, A2, P2, C2, m2, 12, a2[5]), C2 = u2(C2, O2, A2, P2, y2, 17, a2[6]), P2 = u2(P2, C2, O2, A2, _2, 22, a2[7]), A2 = u2(A2, P2, C2, O2, w2, 7, a2[8]), O2 = u2(O2, A2, P2, C2, I2, 12, a2[9]), C2 = u2(C2, O2, A2, P2, v2, 17, a2[10]), P2 = u2(P2, C2, O2, A2, S2, 22, a2[11]), A2 = u2(A2, P2, C2, O2, T2, 7, a2[12]), O2 = u2(O2, A2, P2, C2, b2, 12, a2[13]), C2 = u2(C2, O2, A2, P2, E2, 17, a2[14]), A2 = h2(A2, P2 = u2(P2, C2, O2, A2, k2, 22, a2[15]), C2, O2, c3, 5, a2[16]), O2 = h2(O2, A2, P2, C2, y2, 9, a2[17]), C2 = h2(C2, O2, A2, P2, S2, 14, a2[18]), P2 = h2(P2, C2, O2, A2, o3, 20, a2[19]), A2 = h2(A2, P2, C2, O2, m2, 5, a2[20]), O2 = h2(O2, A2, P2, C2, v2, 9, a2[21]), C2 = h2(C2, O2, A2, P2, k2, 14, a2[22]), P2 = h2(P2, C2, O2, A2, g2, 20, a2[23]), A2 = h2(A2, P2, C2, O2, I2, 5, a2[24]), O2 = h2(O2, A2, P2, C2, E2, 9, a2[25]), C2 = h2(C2, O2, A2, P2, f2, 14, a2[26]), P2 = h2(P2, C2, O2, A2, w2, 20, a2[27]), A2 = h2(A2, P2, C2, O2, b2, 5, a2[28]), O2 = h2(O2, A2, P2, C2, p2, 9, a2[29]), C2 = h2(C2, O2, A2, P2, _2, 14, a2[30]), A2 = l2(A2, P2 = h2(P2, C2, O2, A2, T2, 20, a2[31]), C2, O2, m2, 4, a2[32]), O2 = l2(O2, A2, P2, C2, w2, 11, a2[33]), C2 = l2(C2, O2, A2, P2, S2, 16, a2[34]), P2 = l2(P2, C2, O2, A2, E2, 23, a2[35]), A2 = l2(A2, P2, C2, O2, c3, 4, a2[36]), O2 = l2(O2, A2, P2, C2, g2, 11, a2[37]), C2 = l2(C2, O2, A2, P2, _2, 16, a2[38]), P2 = l2(P2, C2, O2, A2, v2, 23, a2[39]), A2 = l2(A2, P2, C2, O2, b2, 4, a2[40]), O2 = l2(O2, A2, P2, C2, o3, 11, a2[41]), C2 = l2(C2, O2, A2, P2, f2, 16, a2[42]), P2 = l2(P2, C2, O2, A2, y2, 23, a2[43]), A2 = l2(A2, P2, C2, O2, I2, 4, a2[44]), O2 = l2(O2, A2, P2, C2, T2, 11, a2[45]), C2 = l2(C2, O2, A2, P2, k2, 16, a2[46]), A2 = d2(A2, P2 = l2(P2, C2, O2, A2, p2, 23, a2[47]), C2, O2, o3, 6, a2[48]), O2 = d2(O2, A2, P2, C2, _2, 10, a2[49]), C2 = d2(C2, O2, A2, P2, E2, 15, a2[50]), P2 = d2(P2, C2, O2, A2, m2, 21, a2[51]), A2 = d2(A2, P2, C2, O2, T2, 6, a2[52]), O2 = d2(O2, A2, P2, C2, f2, 10, a2[53]), C2 = d2(C2, O2, A2, P2, v2, 15, a2[54]), P2 = d2(P2, C2, O2, A2, c3, 21, a2[55]), A2 = d2(A2, P2, C2, O2, w2, 6, a2[56]), O2 = d2(O2, A2, P2, C2, k2, 10, a2[57]), C2 = d2(C2, O2, A2, P2, y2, 15, a2[58]), P2 = d2(P2, C2, O2, A2, b2, 21, a2[59]), A2 = d2(A2, P2, C2, O2, g2, 6, a2[60]), O2 = d2(O2, A2, P2, C2, S2, 10, a2[61]), C2 = d2(C2, O2, A2, P2, p2, 15, a2[62]), P2 = d2(P2, C2, O2, A2, I2, 21, a2[63]), i3[0] = i3[0] + A2 | 0, i3[1] = i3[1] + P2 | 0, i3[2] = i3[2] + C2 | 0, i3[3] = i3[3] + O2 | 0;
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
  const c = "uni_id_token", u = "uni_id_token_expired", h = "uniIdToken", l = { DEFAULT: "FUNCTION", FUNCTION: "FUNCTION", OBJECT: "OBJECT", CLIENT_DB: "CLIENT_DB" }, d = "pending", p = "fulfilled", f = "rejected";
  function g(e2) {
    return Object.prototype.toString.call(e2).slice(8, -1).toLowerCase();
  }
  function m(e2) {
    return "object" === g(e2);
  }
  function y(e2) {
    return "function" == typeof e2;
  }
  function _(e2) {
    return function() {
      try {
        return e2.apply(e2, arguments);
      } catch (e3) {
        console.error(e3);
      }
    };
  }
  const w = "REJECTED", I = "NOT_PENDING";
  class v {
    constructor({ createPromise: e2, retryRule: t2 = w } = {}) {
      this.createPromise = e2, this.status = null, this.promise = null, this.retryRule = t2;
    }
    get needRetry() {
      if (!this.status)
        return true;
      switch (this.retryRule) {
        case w:
          return this.status === f;
        case I:
          return this.status !== d;
      }
    }
    exec() {
      return this.needRetry ? (this.status = d, this.promise = this.createPromise().then((e2) => (this.status = p, Promise.resolve(e2)), (e2) => (this.status = f, Promise.reject(e2))), this.promise) : this.promise;
    }
  }
  class S {
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
  }
  function T(e2) {
    return e2 && "string" == typeof e2 ? JSON.parse(e2) : e2;
  }
  const b = true, E = "app", A = T(define_process_env_UNI_SECURE_NETWORK_CONFIG_default), P = E, C = T(""), O = T("[]") || [];
  let N = "";
  try {
    N = "__UNI__E017681";
  } catch (e2) {
  }
  let R, L = {};
  function U(e2, t2 = {}) {
    var n2, s2;
    return n2 = L, s2 = e2, Object.prototype.hasOwnProperty.call(n2, s2) || (L[e2] = t2), L[e2];
  }
  function D() {
    return R || (R = function() {
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
    }(), R);
  }
  L = uni._globalUniCloudObj ? uni._globalUniCloudObj : uni._globalUniCloudObj = {};
  const M = ["invoke", "success", "fail", "complete"], q = U("_globalUniCloudInterceptor");
  function F(e2, t2) {
    q[e2] || (q[e2] = {}), m(t2) && Object.keys(t2).forEach((n2) => {
      M.indexOf(n2) > -1 && function(e3, t3, n3) {
        let s2 = q[e3][t3];
        s2 || (s2 = q[e3][t3] = []), -1 === s2.indexOf(n3) && y(n3) && s2.push(n3);
      }(e2, n2, t2[n2]);
    });
  }
  function K(e2, t2) {
    q[e2] || (q[e2] = {}), m(t2) ? Object.keys(t2).forEach((n2) => {
      M.indexOf(n2) > -1 && function(e3, t3, n3) {
        const s2 = q[e3][t3];
        if (!s2)
          return;
        const r2 = s2.indexOf(n3);
        r2 > -1 && s2.splice(r2, 1);
      }(e2, n2, t2[n2]);
    }) : delete q[e2];
  }
  function j(e2, t2) {
    return e2 && 0 !== e2.length ? e2.reduce((e3, n2) => e3.then(() => n2(t2)), Promise.resolve()) : Promise.resolve();
  }
  function $(e2, t2) {
    return q[e2] && q[e2][t2] || [];
  }
  function B(e2) {
    F("callObject", e2);
  }
  const W = U("_globalUniCloudListener"), H = { RESPONSE: "response", NEED_LOGIN: "needLogin", REFRESH_TOKEN: "refreshToken" }, J = { CLIENT_DB: "clientdb", CLOUD_FUNCTION: "cloudfunction", CLOUD_OBJECT: "cloudobject" };
  function z(e2) {
    return W[e2] || (W[e2] = []), W[e2];
  }
  function V(e2, t2) {
    const n2 = z(e2);
    n2.includes(t2) || n2.push(t2);
  }
  function G(e2, t2) {
    const n2 = z(e2), s2 = n2.indexOf(t2);
    -1 !== s2 && n2.splice(s2, 1);
  }
  function Y(e2, t2) {
    const n2 = z(e2);
    for (let e3 = 0; e3 < n2.length; e3++) {
      (0, n2[e3])(t2);
    }
  }
  let Q, X = false;
  function Z() {
    return Q || (Q = new Promise((e2) => {
      X && e2(), function t2() {
        if ("function" == typeof getCurrentPages) {
          const t3 = getCurrentPages();
          t3 && t3[0] && (X = true, e2());
        }
        X || setTimeout(() => {
          t2();
        }, 30);
      }();
    }), Q);
  }
  function ee(e2) {
    const t2 = {};
    for (const n2 in e2) {
      const s2 = e2[n2];
      y(s2) && (t2[n2] = _(s2));
    }
    return t2;
  }
  class te extends Error {
    constructor(e2) {
      const t2 = e2.message || e2.errMsg || "unknown system error";
      super(t2), this.errMsg = t2, this.code = this.errCode = e2.code || e2.errCode || "SYSTEM_ERROR", this.errSubject = this.subject = e2.subject || e2.errSubject, this.cause = e2.cause, this.requestId = e2.requestId;
    }
    toJson(e2 = 0) {
      if (!(e2 >= 10))
        return e2++, { errCode: this.errCode, errMsg: this.errMsg, errSubject: this.errSubject, cause: this.cause && this.cause.toJson ? this.cause.toJson(e2) : this.cause };
    }
  }
  var ne = { request: (e2) => uni.request(e2), uploadFile: (e2) => uni.uploadFile(e2), setStorageSync: (e2, t2) => uni.setStorageSync(e2, t2), getStorageSync: (e2) => uni.getStorageSync(e2), removeStorageSync: (e2) => uni.removeStorageSync(e2), clearStorageSync: () => uni.clearStorageSync(), connectSocket: (e2) => uni.connectSocket(e2) };
  function se(e2) {
    return e2 && se(e2.__v_raw) || e2;
  }
  function re() {
    return { token: ne.getStorageSync(c) || ne.getStorageSync(h), tokenExpired: ne.getStorageSync(u) };
  }
  function ie({ token: e2, tokenExpired: t2 } = {}) {
    e2 && ne.setStorageSync(c, e2), t2 && ne.setStorageSync(u, t2);
  }
  let oe, ae;
  function ce() {
    return oe || (oe = uni.getSystemInfoSync()), oe;
  }
  function ue() {
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
  let he = {};
  function le() {
    const e2 = uni.getLocale && uni.getLocale() || "en";
    if (ae)
      return { ...he, ...ae, locale: e2, LOCALE: e2 };
    const t2 = ce(), { deviceId: n2, osName: s2, uniPlatform: r2, appId: i2 } = t2, o2 = ["appId", "appLanguage", "appName", "appVersion", "appVersionCode", "appWgtVersion", "browserName", "browserVersion", "deviceBrand", "deviceId", "deviceModel", "deviceType", "osName", "osVersion", "romName", "romVersion", "ua", "hostName", "hostVersion", "uniPlatform", "uniRuntimeVersion", "uniRuntimeVersionCode", "uniCompilerVersion", "uniCompilerVersionCode"];
    for (const e3 in t2)
      Object.hasOwnProperty.call(t2, e3) && -1 === o2.indexOf(e3) && delete t2[e3];
    return ae = { PLATFORM: r2, OS: s2, APPID: i2, DEVICEID: n2, ...ue(), ...t2 }, { ...he, ...ae, locale: e2, LOCALE: e2 };
  }
  var de = { sign: function(e2, t2) {
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
          return s2(new te({ code: n3, message: r3, requestId: t3 }));
        }
        const r2 = e3.data;
        if (r2.error)
          return s2(new te({ code: r2.error.code, message: r2.error.message, requestId: t3 }));
        r2.result = r2.data, r2.requestId = t3, delete r2.data, n2(r2);
      } }));
    });
  }, toBase64: function(e2) {
    return a.stringify(o.parse(e2));
  } };
  var pe = class {
    constructor(e2) {
      ["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), this.config = Object.assign({}, { endpoint: 0 === e2.spaceId.indexOf("mp-") ? "https://api.next.bspapp.com" : "https://api.bspapp.com" }, e2), this.config.provider = "aliyun", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.config.accessTokenKey = "access_token_" + this.config.spaceId, this.adapter = ne, this._getAccessTokenPromiseHub = new v({ createPromise: () => this.requestAuth(this.setupRequest({ method: "serverless.auth.user.anonymousAuthorize", params: "{}" }, "auth")).then((e3) => {
        if (!e3.result || !e3.result.accessToken)
          throw new te({ code: "AUTH_FAILED", message: "获取accessToken失败" });
        this.setAccessToken(e3.result.accessToken);
      }), retryRule: I });
    }
    get hasAccessToken() {
      return !!this.accessToken;
    }
    setAccessToken(e2) {
      this.accessToken = e2;
    }
    requestWrapped(e2) {
      return de.wrappedRequest(e2, this.adapter.request);
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
      return t2.data.token = this.accessToken, t2.header["x-basement-token"] = this.accessToken, t2.header["x-serverless-sign"] = de.sign(t2.data, this.config.clientSecret), t2;
    }
    setupRequest(e2, t2) {
      const n2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      return "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = de.sign(n2, this.config.clientSecret), { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: s2 };
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
          e3 && e3.statusCode < 400 ? o2(e3) : a2(new te({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          a2(new te({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
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
      if ("string" !== g(t2))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const o2 = i2 && i2.envType || this.config.envType;
      if (s2 && ("/" !== t2[0] && (t2 = "/" + t2), t2.indexOf("\\") > -1))
        throw new te({ code: "INVALID_PARAM", message: "使用cloudPath作为路径时，cloudPath不可包含“\\”" });
      const a2 = (await this.getOSSUploadOptionsFromPath({ env: o2, filename: s2 ? t2.split("/").pop() : t2, fileId: s2 ? t2 : void 0 })).result, c2 = "https://" + a2.cdnDomain + "/" + a2.ossPath, { securityToken: u2, accessKeyId: h2, signature: l2, host: d2, ossPath: p2, id: f2, policy: m2, ossCallbackUrl: y2 } = a2, _2 = { "Cache-Control": "max-age=2592000", "Content-Disposition": "attachment", OSSAccessKeyId: h2, Signature: l2, host: d2, id: f2, key: p2, policy: m2, success_action_status: 200 };
      if (u2 && (_2["x-oss-security-token"] = u2), y2) {
        const e3 = JSON.stringify({ callbackUrl: y2, callbackBody: JSON.stringify({ fileId: f2, spaceId: this.config.spaceId }), callbackBodyType: "application/json" });
        _2.callback = de.toBase64(e3);
      }
      const w2 = { url: "https://" + a2.host, formData: _2, fileName: "file", name: "file", filePath: e2, fileType: n2 };
      if (await this.uploadFileToOSS(Object.assign({}, w2, { onUploadProgress: r2 })), y2)
        return { success: true, filePath: e2, fileID: c2 };
      if ((await this.reportOSSUpload({ id: f2 })).success)
        return { success: true, filePath: e2, fileID: c2 };
      throw new te({ code: "UPLOAD_FAILED", message: "文件上传失败" });
    }
    getTempFileURL({ fileList: e2 } = {}) {
      return new Promise((t2, n2) => {
        Array.isArray(e2) && 0 !== e2.length || n2(new te({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" })), this.getFileInfo({ fileList: e2 }).then((n3) => {
          t2({ fileList: e2.map((e3, t3) => {
            const s2 = n3.fileList[t3];
            return { fileID: e3, tempFileURL: s2 && s2.url || e3 };
          }) });
        });
      });
    }
    async getFileInfo({ fileList: e2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new te({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.info", params: JSON.stringify({ id: e2.map((e3) => e3.split("?")[0]).join(",") }) };
      return { fileList: (await this.request(this.setupRequest(t2))).result };
    }
  };
  var fe = { init(e2) {
    const t2 = new pe(e2), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  const ge = "undefined" != typeof location && "http:" === location.protocol ? "http:" : "https:";
  var me;
  !function(e2) {
    e2.local = "local", e2.none = "none", e2.session = "session";
  }(me || (me = {}));
  var ye = function() {
  }, _e = n(function(e2, t2) {
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
          var _2 = s3 & r3 ^ s3 & i3 ^ r3 & i3, w2 = (s3 << 30 | s3 >>> 2) ^ (s3 << 19 | s3 >>> 13) ^ (s3 << 10 | s3 >>> 22), I2 = d2 + ((a3 << 26 | a3 >>> 6) ^ (a3 << 21 | a3 >>> 11) ^ (a3 << 7 | a3 >>> 25)) + (a3 & h3 ^ ~a3 & l2) + c2[p2] + u2[p2];
          d2 = l2, l2 = h3, h3 = a3, a3 = o3 + I2 | 0, o3 = i3, i3 = r3, r3 = s3, s3 = I2 + (w2 + _2) | 0;
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
  }), we = _e, Ie = n(function(e2, t2) {
    e2.exports = r.HmacSHA256;
  });
  const ve = () => {
    let e2;
    if (!Promise) {
      e2 = () => {
      }, e2.promise = {};
      const t3 = () => {
        throw new te({ message: 'Your Node runtime does support ES6 Promises. Set "global.Promise" to your preferred implementation of promises.' });
      };
      return Object.defineProperty(e2.promise, "then", { get: t3 }), Object.defineProperty(e2.promise, "catch", { get: t3 }), e2;
    }
    const t2 = new Promise((t3, n2) => {
      e2 = (e3, s2) => e3 ? n2(e3) : t3(s2);
    });
    return e2.promise = t2, e2;
  };
  function Se(e2) {
    return void 0 === e2;
  }
  function Te(e2) {
    return "[object Null]" === Object.prototype.toString.call(e2);
  }
  function be(e2 = "") {
    return e2.replace(/([\s\S]+)\s+(请前往云开发AI小助手查看问题：.*)/, "$1");
  }
  function Ee(e2 = 32) {
    const t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let n2 = "";
    for (let s2 = 0; s2 < e2; s2++)
      n2 += t2.charAt(Math.floor(62 * Math.random()));
    return n2;
  }
  var ke;
  function Ae(e2) {
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
  }(ke || (ke = {}));
  const Pe = { adapter: null, runtime: void 0 }, Ce = ["anonymousUuidKey"];
  class Oe extends ye {
    constructor() {
      super(), Pe.adapter.root.tcbObject || (Pe.adapter.root.tcbObject = {});
    }
    setItem(e2, t2) {
      Pe.adapter.root.tcbObject[e2] = t2;
    }
    getItem(e2) {
      return Pe.adapter.root.tcbObject[e2];
    }
    removeItem(e2) {
      delete Pe.adapter.root.tcbObject[e2];
    }
    clear() {
      delete Pe.adapter.root.tcbObject;
    }
  }
  function xe(e2, t2) {
    switch (e2) {
      case "local":
        return t2.localStorage || new Oe();
      case "none":
        return new Oe();
      default:
        return t2.sessionStorage || new Oe();
    }
  }
  class Ne {
    constructor(e2) {
      if (!this._storage) {
        this._persistence = Pe.adapter.primaryStorage || e2.persistence, this._storage = xe(this._persistence, Pe.adapter);
        const t2 = `access_token_${e2.env}`, n2 = `access_token_expire_${e2.env}`, s2 = `refresh_token_${e2.env}`, r2 = `anonymous_uuid_${e2.env}`, i2 = `login_type_${e2.env}`, o2 = "device_id", a2 = `token_type_${e2.env}`, c2 = `user_info_${e2.env}`;
        this.keys = { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2, anonymousUuidKey: r2, loginTypeKey: i2, userInfoKey: c2, deviceIdKey: o2, tokenTypeKey: a2 };
      }
    }
    updatePersistence(e2) {
      if (e2 === this._persistence)
        return;
      const t2 = "local" === this._persistence;
      this._persistence = e2;
      const n2 = xe(e2, Pe.adapter);
      for (const e3 in this.keys) {
        const s2 = this.keys[e3];
        if (t2 && Ce.includes(e3))
          continue;
        const r2 = this._storage.getItem(s2);
        Se(r2) || Te(r2) || (n2.setItem(s2, r2), this._storage.removeItem(s2));
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
  const Re = {}, Le = {};
  function Ue(e2) {
    return Re[e2];
  }
  class De {
    constructor(e2, t2) {
      this.data = t2 || null, this.name = e2;
    }
  }
  class Me extends De {
    constructor(e2, t2) {
      super("error", { error: e2, data: t2 }), this.error = e2;
    }
  }
  const qe = new class {
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
      if (e2 instanceof Me)
        return console.error(e2.error), this;
      const n2 = "string" == typeof e2 ? new De(e2, t2 || {}) : e2;
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
  function Fe(e2, t2) {
    qe.on(e2, t2);
  }
  function Ke(e2, t2 = {}) {
    qe.fire(e2, t2);
  }
  function je(e2, t2) {
    qe.off(e2, t2);
  }
  const $e = "loginStateChanged", Be = "loginStateExpire", We = "loginTypeChanged", He = "anonymousConverted", Je = "refreshAccessToken";
  var ze;
  !function(e2) {
    e2.ANONYMOUS = "ANONYMOUS", e2.WECHAT = "WECHAT", e2.WECHAT_PUBLIC = "WECHAT-PUBLIC", e2.WECHAT_OPEN = "WECHAT-OPEN", e2.CUSTOM = "CUSTOM", e2.EMAIL = "EMAIL", e2.USERNAME = "USERNAME", e2.NULL = "NULL";
  }(ze || (ze = {}));
  class Ve {
    constructor() {
      this._fnPromiseMap = /* @__PURE__ */ new Map();
    }
    async run(e2, t2) {
      let n2 = this._fnPromiseMap.get(e2);
      return n2 || (n2 = new Promise(async (n3, s2) => {
        try {
          await this._runIdlePromise();
          const e3 = t2();
          n3(await e3);
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
  class Ge {
    constructor(e2) {
      this._singlePromise = new Ve(), this._cache = Ue(e2.env), this._baseURL = `https://${e2.env}.ap-shanghai.tcb-api.tencentcloudapi.com`, this._reqClass = new Pe.adapter.reqClass({ timeout: e2.timeout, timeoutMsg: `请求在${e2.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] });
    }
    _getDeviceId() {
      if (this._deviceID)
        return this._deviceID;
      const { deviceIdKey: e2 } = this._cache.keys;
      let t2 = this._cache.getStore(e2);
      return "string" == typeof t2 && t2.length >= 16 && t2.length <= 48 || (t2 = Ee(), this._cache.setStore(e2, t2)), this._deviceID = t2, t2;
    }
    async _request(e2, t2, n2 = {}) {
      const s2 = { "x-request-id": Ee(), "x-device-id": this._getDeviceId() };
      if (n2.withAccessToken) {
        const { tokenTypeKey: e3 } = this._cache.keys, t3 = await this.getAccessToken(), n3 = this._cache.getStore(e3);
        s2.authorization = `${n3} ${t3}`;
      }
      return this._reqClass["get" === n2.method ? "get" : "post"]({ url: `${this._baseURL}${e2}`, data: t2, headers: s2 });
    }
    async _fetchAccessToken() {
      const { loginTypeKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2, tokenTypeKey: s2 } = this._cache.keys, r2 = this._cache.getStore(e2);
      if (r2 && r2 !== ze.ANONYMOUS)
        throw new te({ code: "INVALID_OPERATION", message: "非匿名登录不支持刷新 access token" });
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
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.setStore(n2, ze.ANONYMOUS), this.getAccessToken();
    }
    async getUserInfo() {
      return this._singlePromise.run("getUserInfo", async () => (await this._request("/auth/v1/user/me", {}, { withAccessToken: true, method: "get" })).data);
    }
  }
  const Ye = ["auth.getJwt", "auth.logout", "auth.signInWithTicket", "auth.signInAnonymously", "auth.signIn", "auth.fetchAccessTokenWithRefreshToken", "auth.signUpWithEmailAndPassword", "auth.activateEndUserMail", "auth.sendPasswordResetEmail", "auth.resetPasswordWithToken", "auth.isUsernameRegistered"], Qe = { "X-SDK-Version": "1.3.5" };
  function Xe(e2, t2, n2) {
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
  function Ze() {
    const e2 = Math.random().toString(16).slice(2);
    return { data: { seqId: e2 }, headers: { ...Qe, "x-seqid": e2 } };
  }
  class et {
    constructor(e2 = {}) {
      var t2;
      this.config = e2, this._reqClass = new Pe.adapter.reqClass({ timeout: this.config.timeout, timeoutMsg: `请求在${this.config.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] }), this._cache = Ue(this.config.env), this._localCache = (t2 = this.config.env, Le[t2]), this.oauth = new Ge(this.config), Xe(this._reqClass, "post", [Ze]), Xe(this._reqClass, "upload", [Ze]), Xe(this._reqClass, "download", [Ze]);
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
        throw new te({ message: "未登录CloudBase" });
      const o2 = { refresh_token: i2 }, a2 = await this.request("auth.fetchAccessTokenWithRefreshToken", o2);
      if (a2.data.code) {
        const { code: e3 } = a2.data;
        if ("SIGN_PARAM_INVALID" === e3 || "REFRESH_TOKEN_EXPIRED" === e3 || "INVALID_REFRESH_TOKEN" === e3) {
          if (this._cache.getStore(s2) === ze.ANONYMOUS && "INVALID_REFRESH_TOKEN" === e3) {
            const e4 = this._cache.getStore(r2), t3 = this._cache.getStore(n2), s3 = await this.send("auth.signInAnonymously", { anonymous_uuid: e4, refresh_token: t3 });
            return this.setRefreshToken(s3.refresh_token), this._refreshAccessToken();
          }
          Ke(Be), this._cache.removeStore(n2);
        }
        throw new te({ code: a2.data.code, message: `刷新access token失败：${a2.data.code}` });
      }
      if (a2.data.access_token)
        return Ke(Je), this._cache.setStore(e2, a2.data.access_token), this._cache.setStore(t2, a2.data.access_token_expire + Date.now()), { accessToken: a2.data.access_token, accessTokenExpire: a2.data.access_token_expire };
      a2.data.refresh_token && (this._cache.removeStore(n2), this._cache.setStore(n2, a2.data.refresh_token), this._refreshAccessToken());
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2 } = this._cache.keys;
      if (!this._cache.getStore(n2))
        throw new te({ message: "refresh token不存在，登录状态异常" });
      let s2 = this._cache.getStore(e2), r2 = this._cache.getStore(t2), i2 = true;
      return this._shouldRefreshAccessTokenHook && !await this._shouldRefreshAccessTokenHook(s2, r2) && (i2 = false), (!s2 || !r2 || r2 < Date.now()) && i2 ? this.refreshAccessToken() : { accessToken: s2, accessTokenExpire: r2 };
    }
    async request(e2, t2, n2) {
      const s2 = `x-tcb-trace_${this.config.env}`;
      let r2 = "application/x-www-form-urlencoded";
      const i2 = { action: e2, env: this.config.env, dataVersion: "2019-08-16", ...t2 };
      let o2;
      if (-1 === Ye.indexOf(e2) && (this._cache.keys, i2.access_token = await this.oauth.getAccessToken()), "storage.uploadFile" === e2) {
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
      }(ge, "//tcb-api.tencentcloudapi.com/web", d2);
      l2 && (p2 += l2);
      const f2 = await this.post({ url: p2, data: o2, ...a2 }), g2 = f2.header && f2.header["x-tcb-trace"];
      if (g2 && this._localCache.setStore(s2, g2), 200 !== Number(f2.status) && 200 !== Number(f2.statusCode) || !f2.data)
        throw new te({ code: "NETWORK_ERROR", message: "network request error" });
      return f2;
    }
    async send(e2, t2 = {}, n2 = {}) {
      const s2 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
      if (("ACCESS_TOKEN_DISABLED" === s2.data.code || "ACCESS_TOKEN_EXPIRED" === s2.data.code) && -1 === Ye.indexOf(e2)) {
        await this.oauth.refreshAccessToken();
        const s3 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
        if (s3.data.code)
          throw new te({ code: s3.data.code, message: be(s3.data.message) });
        return s3.data;
      }
      if (s2.data.code)
        throw new te({ code: s2.data.code, message: be(s2.data.message) });
      return s2.data;
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
  }
  const tt = {};
  function nt(e2) {
    return tt[e2];
  }
  class st {
    constructor(e2) {
      this.config = e2, this._cache = Ue(e2.env), this._request = nt(e2.env);
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
  class rt {
    constructor(e2) {
      if (!e2)
        throw new te({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._envId = e2, this._cache = Ue(this._envId), this._request = nt(this._envId), this.setUserInfo();
    }
    linkWithTicket(e2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "ticket must be string" });
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
        throw new te({ code: "PARAM_ERROR", message: "username must be a string" });
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
  class it {
    constructor(e2) {
      if (!e2)
        throw new te({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._cache = Ue(e2);
      const { refreshTokenKey: t2, accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys, r2 = this._cache.getStore(t2), i2 = this._cache.getStore(n2), o2 = this._cache.getStore(s2);
      this.credential = { refreshToken: r2, accessToken: i2, accessTokenExpire: o2 }, this.user = new rt(e2);
    }
    get isAnonymousAuth() {
      return this.loginType === ze.ANONYMOUS;
    }
    get isCustomAuth() {
      return this.loginType === ze.CUSTOM;
    }
    get isWeixinAuth() {
      return this.loginType === ze.WECHAT || this.loginType === ze.WECHAT_OPEN || this.loginType === ze.WECHAT_PUBLIC;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
  }
  class ot extends st {
    async signIn() {
      this._cache.updatePersistence("local"), await this._request.oauth.getAccessToken(), Ke($e), Ke(We, { env: this.config.env, loginType: ze.ANONYMOUS, persistence: "local" });
      const e2 = new it(this.config.env);
      return await e2.user.refresh(), e2;
    }
    async linkAndRetrieveDataWithTicket(e2) {
      const { anonymousUuidKey: t2, refreshTokenKey: n2 } = this._cache.keys, s2 = this._cache.getStore(t2), r2 = this._cache.getStore(n2), i2 = await this._request.send("auth.linkAndRetrieveDataWithTicket", { anonymous_uuid: s2, refresh_token: r2, ticket: e2 });
      if (i2.refresh_token)
        return this._clearAnonymousUUID(), this.setRefreshToken(i2.refresh_token), await this._request.refreshAccessToken(), Ke(He, { env: this.config.env }), Ke(We, { loginType: ze.CUSTOM, persistence: "local" }), { credential: { refreshToken: i2.refresh_token } };
      throw new te({ message: "匿名转化失败" });
    }
    _setAnonymousUUID(e2) {
      const { anonymousUuidKey: t2, loginTypeKey: n2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.setStore(t2, e2), this._cache.setStore(n2, ze.ANONYMOUS);
    }
    _clearAnonymousUUID() {
      this._cache.removeStore(this._cache.keys.anonymousUuidKey);
    }
  }
  class at extends st {
    async signIn(e2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "ticket must be a string" });
      const { refreshTokenKey: t2 } = this._cache.keys, n2 = await this._request.send("auth.signInWithTicket", { ticket: e2, refresh_token: this._cache.getStore(t2) || "" });
      if (n2.refresh_token)
        return this.setRefreshToken(n2.refresh_token), await this._request.refreshAccessToken(), Ke($e), Ke(We, { env: this.config.env, loginType: ze.CUSTOM, persistence: this.config.persistence }), await this.refreshUserInfo(), new it(this.config.env);
      throw new te({ message: "自定义登录失败" });
    }
  }
  class ct extends st {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "email must be a string" });
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: "EMAIL", email: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token: i2, access_token_expire: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), i2 && o2 ? this.setAccessToken(i2, o2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Ke($e), Ke(We, { env: this.config.env, loginType: ze.EMAIL, persistence: this.config.persistence }), new it(this.config.env);
      throw s2.code ? new te({ code: s2.code, message: `邮箱登录失败: ${s2.message}` }) : new te({ message: "邮箱登录失败" });
    }
    async activate(e2) {
      return this._request.send("auth.activateEndUserMail", { token: e2 });
    }
    async resetPasswordWithToken(e2, t2) {
      return this._request.send("auth.resetPasswordWithToken", { token: e2, newPassword: t2 });
    }
  }
  class ut extends st {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "username must be a string" });
      "string" != typeof t2 && (t2 = "", console.warn("password is empty"));
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: ze.USERNAME, username: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token_expire: i2, access_token: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), o2 && i2 ? this.setAccessToken(o2, i2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Ke($e), Ke(We, { env: this.config.env, loginType: ze.USERNAME, persistence: this.config.persistence }), new it(this.config.env);
      throw s2.code ? new te({ code: s2.code, message: `用户名密码登录失败: ${s2.message}` }) : new te({ message: "用户名密码登录失败" });
    }
  }
  class ht {
    constructor(e2) {
      this.config = e2, this._cache = Ue(e2.env), this._request = nt(e2.env), this._onAnonymousConverted = this._onAnonymousConverted.bind(this), this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this), Fe(We, this._onLoginTypeChanged);
    }
    get currentUser() {
      const e2 = this.hasLoginState();
      return e2 && e2.user || null;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
    anonymousAuthProvider() {
      return new ot(this.config);
    }
    customAuthProvider() {
      return new at(this.config);
    }
    emailAuthProvider() {
      return new ct(this.config);
    }
    usernameAuthProvider() {
      return new ut(this.config);
    }
    async signInAnonymously() {
      return new ot(this.config).signIn();
    }
    async signInWithEmailAndPassword(e2, t2) {
      return new ct(this.config).signIn(e2, t2);
    }
    signInWithUsernameAndPassword(e2, t2) {
      return new ut(this.config).signIn(e2, t2);
    }
    async linkAndRetrieveDataWithTicket(e2) {
      this._anonymousAuthProvider || (this._anonymousAuthProvider = new ot(this.config)), Fe(He, this._onAnonymousConverted);
      return await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(e2);
    }
    async signOut() {
      if (this.loginType === ze.ANONYMOUS)
        throw new te({ message: "匿名用户不支持登出操作" });
      const { refreshTokenKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2 } = this._cache.keys, s2 = this._cache.getStore(e2);
      if (!s2)
        return;
      const r2 = await this._request.send("auth.logout", { refresh_token: s2 });
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.removeStore(n2), Ke($e), Ke(We, { env: this.config.env, loginType: ze.NULL, persistence: this.config.persistence }), r2;
    }
    async signUpWithEmailAndPassword(e2, t2) {
      return this._request.send("auth.signUpWithEmailAndPassword", { email: e2, password: t2 });
    }
    async sendPasswordResetEmail(e2) {
      return this._request.send("auth.sendPasswordResetEmail", { email: e2 });
    }
    onLoginStateChanged(e2) {
      Fe($e, () => {
        const t3 = this.hasLoginState();
        e2.call(this, t3);
      });
      const t2 = this.hasLoginState();
      e2.call(this, t2);
    }
    onLoginStateExpired(e2) {
      Fe(Be, e2.bind(this));
    }
    onAccessTokenRefreshed(e2) {
      Fe(Je, e2.bind(this));
    }
    onAnonymousConverted(e2) {
      Fe(He, e2.bind(this));
    }
    onLoginTypeChanged(e2) {
      Fe(We, () => {
        const t2 = this.hasLoginState();
        e2.call(this, t2);
      });
    }
    async getAccessToken() {
      return { accessToken: (await this._request.getAccessToken()).accessToken, env: this.config.env };
    }
    hasLoginState() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this._request.oauth.isAccessTokenExpired(n2, s2) ? null : new it(this.config.env);
    }
    async isUsernameRegistered(e2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "username must be a string" });
      const { data: t2 } = await this._request.send("auth.isUsernameRegistered", { username: e2 });
      return t2 && t2.isRegistered;
    }
    getLoginState() {
      return Promise.resolve(this.hasLoginState());
    }
    async signInWithTicket(e2) {
      return new at(this.config).signIn(e2);
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
  const lt = function(e2, t2) {
    t2 = t2 || ve();
    const n2 = nt(this.config.env), { cloudPath: s2, filePath: r2, onUploadProgress: i2, fileType: o2 = "image" } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      const { data: { url: a2, authorization: c2, token: u2, fileId: h2, cosFileId: l2 }, requestId: d2 } = e3, p2 = { key: s2, signature: c2, "x-cos-meta-fileid": l2, success_action_status: "201", "x-cos-security-token": u2 };
      n2.upload({ url: a2, data: p2, file: r2, name: s2, fileType: o2, onUploadProgress: i2 }).then((e4) => {
        201 === e4.statusCode ? t2(null, { fileID: h2, requestId: d2 }) : t2(new te({ code: "STORAGE_REQUEST_FAIL", message: `STORAGE_REQUEST_FAIL: ${e4.data}` }));
      }).catch((e4) => {
        t2(e4);
      });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, dt = function(e2, t2) {
    t2 = t2 || ve();
    const n2 = nt(this.config.env), { cloudPath: s2 } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      t2(null, e3);
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, pt = function({ fileList: e2 }, t2) {
    if (t2 = t2 || ve(), !e2 || !Array.isArray(e2))
      return { code: "INVALID_PARAM", message: "fileList必须是非空的数组" };
    for (let t3 of e2)
      if (!t3 || "string" != typeof t3)
        return { code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" };
    const n2 = { fileid_list: e2 };
    return nt(this.config.env).send("storage.batchDeleteFile", n2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.delete_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, ft = function({ fileList: e2 }, t2) {
    t2 = t2 || ve(), e2 && Array.isArray(e2) || t2(null, { code: "INVALID_PARAM", message: "fileList必须是非空的数组" });
    let n2 = [];
    for (let s3 of e2)
      "object" == typeof s3 ? (s3.hasOwnProperty("fileID") && s3.hasOwnProperty("maxAge") || t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是包含fileID和maxAge的对象" }), n2.push({ fileid: s3.fileID, max_age: s3.maxAge })) : "string" == typeof s3 ? n2.push({ fileid: s3 }) : t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是字符串" });
    const s2 = { file_list: n2 };
    return nt(this.config.env).send("storage.batchGetDownloadUrl", s2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.download_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, gt = async function({ fileID: e2 }, t2) {
    const n2 = (await ft.call(this, { fileList: [{ fileID: e2, maxAge: 600 }] })).fileList[0];
    if ("SUCCESS" !== n2.code)
      return t2 ? t2(n2) : new Promise((e3) => {
        e3(n2);
      });
    const s2 = nt(this.config.env);
    let r2 = n2.download_url;
    if (r2 = encodeURI(r2), !t2)
      return s2.download({ url: r2 });
    t2(await s2.download({ url: r2 }));
  }, mt = function({ name: e2, data: t2, query: n2, parse: s2, search: r2, timeout: i2 }, o2) {
    const a2 = o2 || ve();
    let c2;
    try {
      c2 = t2 ? JSON.stringify(t2) : "";
    } catch (e3) {
      return Promise.reject(e3);
    }
    if (!e2)
      return Promise.reject(new te({ code: "PARAM_ERROR", message: "函数名不能为空" }));
    const u2 = { inQuery: n2, parse: s2, search: r2, function_name: e2, request_data: c2 };
    return nt(this.config.env).send("functions.invokeFunction", u2, { timeout: i2 }).then((e3) => {
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
            a2(new te({ message: "response data must be json" }));
          }
      }
      return a2.promise;
    }).catch((e3) => {
      a2(e3);
    }), a2.promise;
  }, yt = { timeout: 15e3, persistence: "session" }, _t = 6e5, wt = {};
  class It {
    constructor(e2) {
      this.config = e2 || this.config, this.authObj = void 0;
    }
    init(e2) {
      switch (Pe.adapter || (this.requestClient = new Pe.adapter.reqClass({ timeout: e2.timeout || 5e3, timeoutMsg: `请求在${(e2.timeout || 5e3) / 1e3}s内未完成，已中断` })), this.config = { ...yt, ...e2 }, true) {
        case this.config.timeout > _t:
          console.warn("timeout大于可配置上限[10分钟]，已重置为上限数值"), this.config.timeout = _t;
          break;
        case this.config.timeout < 100:
          console.warn("timeout小于可配置下限[100ms]，已重置为下限数值"), this.config.timeout = 100;
      }
      return new It(this.config);
    }
    auth({ persistence: e2 } = {}) {
      if (this.authObj)
        return this.authObj;
      const t2 = e2 || Pe.adapter.primaryStorage || yt.persistence;
      var n2;
      return t2 !== this.config.persistence && (this.config.persistence = t2), function(e3) {
        const { env: t3 } = e3;
        Re[t3] = new Ne(e3), Le[t3] = new Ne({ ...e3, persistence: "local" });
      }(this.config), n2 = this.config, tt[n2.env] = new et(n2), this.authObj = new ht(this.config), this.authObj;
    }
    on(e2, t2) {
      return Fe.apply(this, [e2, t2]);
    }
    off(e2, t2) {
      return je.apply(this, [e2, t2]);
    }
    callFunction(e2, t2) {
      return mt.apply(this, [e2, t2]);
    }
    deleteFile(e2, t2) {
      return pt.apply(this, [e2, t2]);
    }
    getTempFileURL(e2, t2) {
      return ft.apply(this, [e2, t2]);
    }
    downloadFile(e2, t2) {
      return gt.apply(this, [e2, t2]);
    }
    uploadFile(e2, t2) {
      return lt.apply(this, [e2, t2]);
    }
    getUploadMetadata(e2, t2) {
      return dt.apply(this, [e2, t2]);
    }
    registerExtension(e2) {
      wt[e2.name] = e2;
    }
    async invokeExtension(e2, t2) {
      const n2 = wt[e2];
      if (!n2)
        throw new te({ message: `扩展${e2} 必须先注册` });
      return await n2.invoke(t2, this);
    }
    useAdapters(e2) {
      const { adapter: t2, runtime: n2 } = Ae(e2) || {};
      t2 && (Pe.adapter = t2), n2 && (Pe.runtime = n2);
    }
  }
  var vt = new It();
  function St(e2, t2, n2) {
    void 0 === n2 && (n2 = {});
    var s2 = /\?/.test(t2), r2 = "";
    for (var i2 in n2)
      "" === r2 ? !s2 && (t2 += "?") : r2 += "&", r2 += i2 + "=" + encodeURIComponent(n2[i2]);
    return /^http(s)?:\/\//.test(t2 += r2) ? t2 : "" + e2 + t2;
  }
  class Tt {
    get(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        ne.request({ url: St("https:", t2), data: n2, method: "GET", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    post(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        ne.request({ url: St("https:", t2), data: n2, method: "POST", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    upload(e2) {
      return new Promise((t2, n2) => {
        const { url: s2, file: r2, data: i2, headers: o2, fileType: a2 } = e2, c2 = ne.uploadFile({ url: St("https:", s2), name: "file", formData: Object.assign({}, i2), filePath: r2, fileType: a2, header: o2, success(e3) {
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
  const bt = { setItem(e2, t2) {
    ne.setStorageSync(e2, t2);
  }, getItem: (e2) => ne.getStorageSync(e2), removeItem(e2) {
    ne.removeStorageSync(e2);
  }, clear() {
    ne.clearStorageSync();
  } };
  var Et = { genAdapter: function() {
    return { root: {}, reqClass: Tt, localStorage: bt, primaryStorage: "local" };
  }, isMatch: function() {
    return true;
  }, runtime: "uni_app" };
  vt.useAdapters(Et);
  const kt = vt, At = kt.init;
  kt.init = function(e2) {
    e2.env = e2.spaceId;
    const t2 = At.call(this, e2);
    t2.config.provider = "tencent", t2.config.spaceId = e2.spaceId;
    const n2 = t2.auth;
    return t2.auth = function(e3) {
      const t3 = n2.call(this, e3);
      return ["linkAndRetrieveDataWithTicket", "signInAnonymously", "signOut", "getAccessToken", "getLoginState", "signInWithTicket", "getUserInfo"].forEach((e4) => {
        var n3;
        t3[e4] = (n3 = t3[e4], function(e5) {
          e5 = e5 || {};
          const { success: t4, fail: s2, complete: r2 } = ee(e5);
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
  var Pt = kt;
  async function Ct(e2, t2) {
    const n2 = `http://${e2}:${t2}/system/ping`;
    try {
      const e3 = await (s2 = { url: n2, timeout: 500 }, new Promise((e4, t3) => {
        ne.request({ ...s2, success(t4) {
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
  async function Ot(e2, t2) {
    let n2;
    for (let s2 = 0; s2 < e2.length; s2++) {
      const r2 = e2[s2];
      if (await Ct(r2, t2)) {
        n2 = r2;
        break;
      }
    }
    return { address: n2, port: t2 };
  }
  const xt = { "serverless.file.resource.generateProximalSign": "storage/generate-proximal-sign", "serverless.file.resource.report": "storage/report", "serverless.file.resource.delete": "storage/delete", "serverless.file.resource.getTempFileURL": "storage/get-temp-file-url" };
  var Nt = class {
    constructor(e2) {
      if (["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), !e2.endpoint)
        throw new Error("集群空间未配置ApiEndpoint，配置后需要重新关联服务空间后生效");
      this.config = Object.assign({}, e2), this.config.provider = "dcloud", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.adapter = ne;
    }
    async request(e2, t2 = true) {
      const n2 = t2;
      return e2 = n2 ? await this.setupLocalRequest(e2) : this.setupRequest(e2), Promise.resolve().then(() => n2 ? this.requestLocal(e2) : de.wrappedRequest(e2, this.adapter.request));
    }
    requestLocal(e2) {
      return new Promise((t2, n2) => {
        this.adapter.request(Object.assign(e2, { complete(e3) {
          if (e3 || (e3 = {}), !e3.statusCode || e3.statusCode >= 400) {
            const t3 = e3.data && e3.data.code || "SYS_ERR", s2 = e3.data && e3.data.message || "request:fail";
            return n2(new te({ code: t3, message: s2 }));
          }
          t2({ success: true, result: e3.data });
        } }));
      });
    }
    setupRequest(e2) {
      const t2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), n2 = { "Content-Type": "application/json" };
      n2["x-serverless-sign"] = de.sign(t2, this.config.clientSecret);
      const s2 = le();
      n2["x-client-info"] = encodeURIComponent(JSON.stringify(s2));
      const { token: r2 } = re();
      return n2["x-client-token"] = r2, { url: this.config.requestUrl, method: "POST", data: t2, dataType: "json", header: JSON.parse(JSON.stringify(n2)) };
    }
    async setupLocalRequest(e2) {
      const t2 = le(), { token: n2 } = re(), s2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now(), clientInfo: t2, token: n2 }), { address: r2, servePort: i2 } = this.__dev__ && this.__dev__.debugInfo || {}, { address: o2 } = await Ot(r2, i2);
      return { url: `http://${o2}:${i2}/${xt[e2.method]}`, method: "POST", data: s2, dataType: "json", header: JSON.parse(JSON.stringify({ "Content-Type": "application/json" })) };
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
        throw new te({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      let r2;
      return this.getUploadFileOptions({ cloudPath: t2 }).then((t3) => {
        const { url: i2, formData: o2, name: a2 } = t3.result;
        return r2 = t3.result.fileUrl, new Promise((t4, r3) => {
          const c2 = this.adapter.uploadFile({ url: i2, formData: o2, name: a2, filePath: e2, fileType: n2, success(e3) {
            e3 && e3.statusCode < 400 ? t4(e3) : r3(new te({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
          }, fail(e3) {
            r3(new te({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
          } });
          "function" == typeof s2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
            s2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
          });
        });
      }).then(() => this.reportUploadFile({ cloudPath: t2 })).then((t3) => new Promise((n3, s3) => {
        t3.success ? n3({ success: true, filePath: e2, fileID: r2 }) : s3(new te({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }));
    }
    deleteFile({ fileList: e2 }) {
      const t2 = { method: "serverless.file.resource.delete", params: JSON.stringify({ fileList: e2 }) };
      return this.request(t2).then((e3) => {
        if (e3.success)
          return e3.result;
        throw new te({ code: "DELETE_FILE_FAILED", message: "删除文件失败" });
      });
    }
    getTempFileURL({ fileList: e2, maxAge: t2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new te({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const n2 = { method: "serverless.file.resource.getTempFileURL", params: JSON.stringify({ fileList: e2, maxAge: t2 }) };
      return this.request(n2).then((e3) => {
        if (e3.success)
          return { fileList: e3.result.fileList.map((e4) => ({ fileID: e4.fileID, tempFileURL: e4.tempFileURL })) };
        throw new te({ code: "GET_TEMP_FILE_URL_FAILED", message: "获取临时文件链接失败" });
      });
    }
  };
  var Rt = { init(e2) {
    const t2 = new Nt(e2), n2 = { signInAnonymously: function() {
      return Promise.resolve();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } }, Lt = n(function(e2, t2) {
    e2.exports = r.enc.Hex;
  });
  function Ut() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e2) {
      var t2 = 16 * Math.random() | 0;
      return ("x" === e2 ? t2 : 3 & t2 | 8).toString(16);
    });
  }
  function Dt(e2 = "", t2 = {}) {
    const { data: n2, functionName: s2, method: r2, headers: i2, signHeaderKeys: o2 = [], config: a2 } = t2, c2 = String(Date.now()), u2 = Ut(), h2 = Object.assign({}, i2, { "x-from-app-id": a2.spaceAppId, "x-from-env-id": a2.spaceId, "x-to-env-id": a2.spaceId, "x-from-instance-id": c2, "x-from-function-name": s2, "x-client-timestamp": c2, "x-alipay-source": "client", "x-request-id": u2, "x-alipay-callid": u2, "x-trace-id": u2 }), l2 = ["x-from-app-id", "x-from-env-id", "x-to-env-id", "x-from-instance-id", "x-from-function-name", "x-client-timestamp"].concat(o2), [d2 = "", p2 = ""] = e2.split("?") || [], f2 = function(e3) {
      const t3 = "HMAC-SHA256", n3 = e3.signedHeaders.join(";"), s3 = e3.signedHeaders.map((t4) => `${t4.toLowerCase()}:${e3.headers[t4]}
`).join(""), r3 = we(e3.body).toString(Lt), i3 = `${e3.method.toUpperCase()}
${e3.path}
${e3.query}
${s3}
${n3}
${r3}
`, o3 = we(i3).toString(Lt), a3 = `${t3}
${e3.timestamp}
${o3}
`, c3 = Ie(a3, e3.secretKey).toString(Lt);
      return `${t3} Credential=${e3.secretId}, SignedHeaders=${n3}, Signature=${c3}`;
    }({ path: d2, query: p2, method: r2, headers: h2, timestamp: c2, body: JSON.stringify(n2), secretId: a2.accessKey, secretKey: a2.secretKey, signedHeaders: l2.sort() });
    return { url: `${a2.endpoint}${e2}`, headers: Object.assign({}, h2, { Authorization: f2 }) };
  }
  function Mt({ url: e2, data: t2, method: n2 = "POST", headers: s2 = {}, timeout: r2 }) {
    return new Promise((i2, o2) => {
      ne.request({ url: e2, method: n2, data: "object" == typeof t2 ? JSON.stringify(t2) : t2, header: s2, dataType: "json", timeout: r2, complete: (e3 = {}) => {
        const t3 = s2["x-trace-id"] || "";
        if (!e3.statusCode || e3.statusCode >= 400) {
          const { message: n3, errMsg: s3, trace_id: r3 } = e3.data || {};
          return o2(new te({ code: "SYS_ERR", message: n3 || s3 || "request:fail", requestId: r3 || t3 }));
        }
        i2({ status: e3.statusCode, data: e3.data, headers: e3.header, requestId: t3 });
      } });
    });
  }
  function qt(e2, t2) {
    const { path: n2, data: s2, method: r2 = "GET" } = e2, { url: i2, headers: o2 } = Dt(n2, { functionName: "", data: s2, method: r2, headers: { "x-alipay-cloud-mode": "oss", "x-data-api-type": "oss", "x-expire-timestamp": String(Date.now() + 6e4) }, signHeaderKeys: ["x-data-api-type", "x-expire-timestamp"], config: t2 });
    return Mt({ url: i2, data: s2, method: r2, headers: o2 }).then((e3) => {
      const t3 = e3.data || {};
      if (!t3.success)
        throw new te({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
      return t3.data || {};
    }).catch((e3) => {
      throw new te({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
    });
  }
  function Ft(e2 = "") {
    const t2 = e2.trim().replace(/^cloud:\/\//, ""), n2 = t2.indexOf("/");
    if (n2 <= 0)
      throw new te({ code: "INVALID_PARAM", message: "fileID不合法" });
    const s2 = t2.substring(0, n2), r2 = t2.substring(n2 + 1);
    return s2 !== this.config.spaceId && console.warn("file ".concat(e2, " does not belong to env ").concat(this.config.spaceId)), r2;
  }
  function Kt(e2 = "") {
    return "cloud://".concat(this.config.spaceId, "/").concat(e2.replace(/^\/+/, ""));
  }
  class jt {
    constructor(e2) {
      this.config = e2;
    }
    signedURL(e2, t2 = {}) {
      const n2 = `/ws/function/${e2}`, s2 = this.config.wsEndpoint.replace(/^ws(s)?:\/\//, ""), r2 = Object.assign({}, t2, { accessKeyId: this.config.accessKey, signatureNonce: Ut(), timestamp: "" + Date.now() }), i2 = [n2, ["accessKeyId", "authorization", "signatureNonce", "timestamp"].sort().map(function(e3) {
        return r2[e3] ? "".concat(e3, "=").concat(r2[e3]) : null;
      }).filter(Boolean).join("&"), `host:${s2}`].join("\n"), o2 = ["HMAC-SHA256", we(i2).toString(Lt)].join("\n"), a2 = Ie(o2, this.config.secretKey).toString(Lt), c2 = Object.keys(r2).map((e3) => `${e3}=${encodeURIComponent(r2[e3])}`).join("&");
      return `${this.config.wsEndpoint}${n2}?${c2}&signature=${a2}`;
    }
  }
  var $t = class {
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
      this.config = Object.assign({}, e2, { endpoint: e2.endpoint || `https://${e2.spaceId}.api-hz.cloudbasefunction.cn`, wsEndpoint: e2.wsEndpoint || `wss://${e2.spaceId}.api-hz.cloudbasefunction.cn` }), this._websocket = new jt(this.config);
    }
    callFunction(e2) {
      return function(e3, t2) {
        const { name: n2, data: s2, async: r2 = false, timeout: i2 } = e3, o2 = "POST", a2 = { "x-to-function-name": n2 };
        r2 && (a2["x-function-invoke-type"] = "async");
        const { url: c2, headers: u2 } = Dt("/functions/invokeFunction", { functionName: n2, data: s2, method: o2, headers: a2, signHeaderKeys: ["x-to-function-name"], config: t2 });
        return Mt({ url: c2, data: s2, method: o2, headers: u2, timeout: i2 }).then((e4) => {
          let t3 = 0;
          if (r2) {
            const n3 = e4.data || {};
            t3 = "200" === n3.errCode ? 0 : n3.errCode, e4.data = n3.data || {}, e4.errMsg = n3.errMsg;
          }
          if (0 !== t3)
            throw new te({ code: t3, message: e4.errMsg, requestId: e4.requestId });
          return { errCode: t3, success: 0 === t3, requestId: e4.requestId, result: e4.data };
        }).catch((e4) => {
          throw new te({ code: e4.errCode, message: e4.errMsg, requestId: e4.requestId });
        });
      }(e2, this.config);
    }
    uploadFileToOSS({ url: e2, filePath: t2, fileType: n2, formData: s2, onUploadProgress: r2 }) {
      return new Promise((i2, o2) => {
        const a2 = ne.uploadFile({ url: e2, filePath: t2, fileType: n2, formData: s2, name: "file", success(e3) {
          e3 && e3.statusCode < 400 ? i2(e3) : o2(new te({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          o2(new te({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof r2 && a2 && "function" == typeof a2.onProgressUpdate && a2.onProgressUpdate((e3) => {
          r2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    async uploadFile({ filePath: e2, cloudPath: t2 = "", fileType: n2 = "image", onUploadProgress: s2 }) {
      if ("string" !== g(t2))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const r2 = await qt({ path: "/".concat(t2.replace(/^\//, ""), "?post_url") }, this.config), { file_id: i2, upload_url: o2, form_data: a2 } = r2, c2 = a2 && a2.reduce((e3, t3) => (e3[t3.key] = t3.value, e3), {});
      return this.uploadFileToOSS({ url: o2, filePath: e2, fileType: n2, formData: c2, onUploadProgress: s2 }).then(() => ({ fileID: i2 }));
    }
    async getTempFileURL({ fileList: e2 }) {
      return new Promise((t2, n2) => {
        (!e2 || e2.length < 0) && t2({ code: "INVALID_PARAM", message: "fileList不能为空数组" }), e2.length > 50 && t2({ code: "INVALID_PARAM", message: "fileList数组长度不能超过50" });
        const s2 = [];
        for (const n3 of e2) {
          let e3;
          "string" !== g(n3) && t2({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
          try {
            e3 = Ft.call(this, n3);
          } catch (t3) {
            console.warn(t3.errCode, t3.errMsg), e3 = n3;
          }
          s2.push({ file_id: e3, expire: 600 });
        }
        qt({ path: "/?download_url", data: { file_list: s2 }, method: "POST" }, this.config).then((e3) => {
          const { file_list: n3 = [] } = e3;
          t2({ fileList: n3.map((e4) => ({ fileID: Kt.call(this, e4.file_id), tempFileURL: e4.download_url })) });
        }).catch((e3) => n2(e3));
      });
    }
    async connectWebSocket(e2) {
      const { name: t2, query: n2 } = e2;
      return ne.connectSocket({ url: this._websocket.signedURL(t2, n2), complete: () => {
      } });
    }
  };
  var Bt = { init: (e2) => {
    e2.provider = "alipay";
    const t2 = new $t(e2);
    return t2.auth = function() {
      return { signInAnonymously: function() {
        return Promise.resolve();
      }, getLoginState: function() {
        return Promise.resolve(true);
      } };
    }, t2;
  } };
  function Wt({ data: e2 }) {
    let t2;
    t2 = le();
    const n2 = JSON.parse(JSON.stringify(e2 || {}));
    if (Object.assign(n2, { clientInfo: t2 }), !n2.uniIdToken) {
      const { token: e3 } = re();
      e3 && (n2.uniIdToken = e3);
    }
    return n2;
  }
  async function Ht(e2 = {}) {
    await this.__dev__.initLocalNetwork();
    const { localAddress: t2, localPort: n2 } = this.__dev__, s2 = { aliyun: "aliyun", tencent: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], r2 = this.config.spaceId, i2 = `http://${t2}:${n2}/system/check-function`, o2 = `http://${t2}:${n2}/cloudfunctions/${e2.name}`;
    return new Promise((t3, n3) => {
      ne.request({ method: "POST", url: i2, data: { name: e2.name, platform: P, provider: s2, spaceId: r2 }, timeout: 3e3, success(e3) {
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
        const r3 = Wt.call(this, { data: e2.data });
        ne.request({ method: "POST", url: o2, data: { provider: s2, platform: P, param: r3 }, timeout: e2.timeout, success: ({ statusCode: e3, data: s3 } = {}) => !e3 || e3 >= 400 ? n4(new te({ code: s3.code || "SYS_ERR", message: s3.message || "request:fail" })) : t4({ result: s3 }), fail(e3) {
          n4(new te({ code: e3.code || e3.errCode || "SYS_ERR", message: e3.message || e3.errMsg || "request:fail" }));
        } });
      });
    });
  }
  const Jt = [{ rule: /fc_function_not_found|FUNCTION_NOT_FOUND/, content: "，云函数[{functionName}]在云端不存在，请检查此云函数名称是否正确以及该云函数是否已上传到服务空间", mode: "append" }];
  var zt = /[\\^$.*+?()[\]{}|]/g, Vt = RegExp(zt.source);
  function Gt(e2, t2, n2) {
    return e2.replace(new RegExp((s2 = t2) && Vt.test(s2) ? s2.replace(zt, "\\$&") : s2, "g"), n2);
    var s2;
  }
  const Yt = { NONE: "none", REQUEST: "request", RESPONSE: "response", BOTH: "both" }, Qt = "_globalUniCloudStatus", Xt = "_globalUniCloudSecureNetworkCache__{spaceId}", Zt = "uni-secure-network", en = { SYSTEM_ERROR: { code: 2e4, message: "System error" }, APP_INFO_INVALID: { code: 20101, message: "Invalid client" }, GET_ENCRYPT_KEY_FAILED: { code: 20102, message: "Get encrypt key failed" } };
  function nn(e2) {
    const { errSubject: t2, subject: n2, errCode: s2, errMsg: r2, code: i2, message: o2, cause: a2 } = e2 || {};
    return new te({ subject: t2 || n2 || Zt, code: s2 || i2 || en.SYSTEM_ERROR.code, message: r2 || o2, cause: a2 });
  }
  let Kn;
  function Hn({ secretType: e2 } = {}) {
    return e2 === Yt.REQUEST || e2 === Yt.RESPONSE || e2 === Yt.BOTH;
  }
  function Jn({ name: e2, data: t2 = {} } = {}) {
    return "DCloud-clientDB" === e2 && "encryption" === t2.redirectTo && "getAppClientKey" === t2.action;
  }
  function zn({ provider: e2, spaceId: t2, functionName: n2 } = {}) {
    const { appId: s2, uniPlatform: r2, osName: i2 } = ce();
    let o2 = r2;
    "app" === r2 && (o2 = i2);
    const a2 = function({ provider: e3, spaceId: t3 } = {}) {
      const n3 = A;
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
    throw console.error(`此应用[appId: ${s2}, platform: ${o2}]不在云端配置的允许访问的应用列表内，参考：https://uniapp.dcloud.net.cn/uniCloud/secure-network.html#verify-client`), nn(en.APP_INFO_INVALID);
  }
  function Vn({ functionName: e2, result: t2, logPvd: n2 }) {
    if (this.__dev__.debugLog && t2 && t2.requestId) {
      const s2 = JSON.stringify({ spaceId: this.config.spaceId, functionName: e2, requestId: t2.requestId });
      console.log(`[${n2}-request]${s2}[/${n2}-request]`);
    }
  }
  function Gn(e2) {
    const t2 = e2.callFunction, n2 = function(n3) {
      const s2 = n3.name;
      n3.data = Wt.call(e2, { data: n3.data });
      const r2 = { aliyun: "aliyun", tencent: "tcb", tcb: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], i2 = Hn(n3), o2 = Jn(n3), a2 = i2 || o2;
      return t2.call(this, n3).then((e3) => (e3.errCode = 0, !a2 && Vn.call(this, { functionName: s2, result: e3, logPvd: r2 }), Promise.resolve(e3)), (e3) => (!a2 && Vn.call(this, { functionName: s2, result: e3, logPvd: r2 }), e3 && e3.message && (e3.message = function({ message: e4 = "", extraInfo: t3 = {}, formatter: n4 = [] } = {}) {
        for (let s3 = 0; s3 < n4.length; s3++) {
          const { rule: r3, content: i3, mode: o3 } = n4[s3], a3 = e4.match(r3);
          if (!a3)
            continue;
          let c2 = i3;
          for (let e5 = 1; e5 < a3.length; e5++)
            c2 = Gt(c2, `{$${e5}}`, a3[e5]);
          for (const e5 in t3)
            c2 = Gt(c2, `{${e5}}`, t3[e5]);
          return "replace" === o3 ? c2 : e4 + c2;
        }
        return e4;
      }({ message: `[${n3.name}]: ${e3.message}`, formatter: Jt, extraInfo: { functionName: s2 } })), Promise.reject(e3)));
    };
    e2.callFunction = function(t3) {
      const { provider: s2, spaceId: r2 } = e2.config, i2 = t3.name;
      let o2, a2;
      if (t3.data = t3.data || {}, e2.__dev__.debugInfo && !e2.__dev__.debugInfo.forceRemote && O ? (e2._callCloudFunction || (e2._callCloudFunction = n2, e2._callLocalFunction = Ht), o2 = Ht) : o2 = n2, o2 = o2.bind(e2), Jn(t3))
        a2 = n2.call(e2, t3);
      else if (Hn(t3)) {
        a2 = new Kn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapEncryptDataCallFunction(n2.bind(e2))(t3);
      } else if (zn({ provider: s2, spaceId: r2, functionName: i2 })) {
        a2 = new Kn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapVerifyClientCallFunction(n2.bind(e2))(t3);
      } else
        a2 = o2(t3);
      return Object.defineProperty(a2, "result", { get: () => (console.warn("当前返回结果为Promise类型，不可直接访问其result属性，详情请参考：https://uniapp.dcloud.net.cn/uniCloud/faq?id=promise"), {}) }), a2.then((e3) => e3);
    };
  }
  Kn = class {
    constructor() {
      throw nn({ message: `Platform ${P} is not enabled, please check whether secure network module is enabled in your manifest.json` });
    }
  };
  const Yn = Symbol("CLIENT_DB_INTERNAL");
  function Qn(e2, t2) {
    return e2.then = "DoNotReturnProxyWithAFunctionNamedThen", e2._internalType = Yn, e2.inspect = null, e2.__v_raw = void 0, new Proxy(e2, { get(e3, n2, s2) {
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
  function Xn(e2) {
    return { on: (t2, n2) => {
      e2[t2] = e2[t2] || [], e2[t2].indexOf(n2) > -1 || e2[t2].push(n2);
    }, off: (t2, n2) => {
      e2[t2] = e2[t2] || [];
      const s2 = e2[t2].indexOf(n2);
      -1 !== s2 && e2[t2].splice(s2, 1);
    } };
  }
  const Zn = ["db.Geo", "db.command", "command.aggregate"];
  function es(e2, t2) {
    return Zn.indexOf(`${e2}.${t2}`) > -1;
  }
  function ts(e2) {
    switch (g(e2 = se(e2))) {
      case "array":
        return e2.map((e3) => ts(e3));
      case "object":
        return e2._internalType === Yn || Object.keys(e2).forEach((t2) => {
          e2[t2] = ts(e2[t2]);
        }), e2;
      case "regexp":
        return { $regexp: { source: e2.source, flags: e2.flags } };
      case "date":
        return { $date: e2.toISOString() };
      default:
        return e2;
    }
  }
  function ns(e2) {
    return e2 && e2.content && e2.content.$method;
  }
  class ss {
    constructor(e2, t2, n2) {
      this.content = e2, this.prevStage = t2 || null, this.udb = null, this._database = n2;
    }
    toJSON() {
      let e2 = this;
      const t2 = [e2.content];
      for (; e2.prevStage; )
        e2 = e2.prevStage, t2.push(e2.content);
      return { $db: t2.reverse().map((e3) => ({ $method: e3.$method, $param: ts(e3.$param) })) };
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
        const t2 = ns(e2), n2 = ns(e2.prevStage);
        if ("aggregate" === t2 && "collection" === n2 || "pipeline" === t2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isCommand() {
      let e2 = this;
      for (; e2; ) {
        if ("command" === ns(e2))
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isAggregateCommand() {
      let e2 = this;
      for (; e2; ) {
        const t2 = ns(e2), n2 = ns(e2.prevStage);
        if ("aggregate" === t2 && "command" === n2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    getNextStageFn(e2) {
      const t2 = this;
      return function() {
        return rs({ $method: e2, $param: ts(Array.from(arguments)) }, t2, t2._database);
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
      if (s2.$db.push({ $method: e2, $param: ts(t2) }), b) {
        const e3 = s2.$db.find((e4) => "collection" === e4.$method), t3 = e3 && e3.$param;
        t3 && 1 === t3.length && "string" == typeof e3.$param[0] && e3.$param[0].indexOf(",") > -1 && console.warn("检测到使用JQL语法联表查询时，未使用getTemp先过滤主表数据，在主表数据量大的情况下可能会查询缓慢。\n- 如何优化请参考此文档：https://uniapp.dcloud.net.cn/uniCloud/jql?id=lookup-with-temp \n- 如果主表数据量很小请忽略此信息，项目发行时不会出现此提示。");
      }
      return this._database._callCloudFunction({ action: n2, command: s2 });
    }
  }
  function rs(e2, t2, n2) {
    return Qn(new ss(e2, t2, n2), { get(e3, t3) {
      let s2 = "db";
      return e3 && e3.content && (s2 = e3.content.$method), es(s2, t3) ? rs({ $method: t3 }, e3, n2) : function() {
        return rs({ $method: t3, $param: ts(Array.from(arguments)) }, e3, n2);
      };
    } });
  }
  function is({ path: e2, method: t2 }) {
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
  class os {
    constructor({ uniClient: e2 = {}, isJQL: t2 = false } = {}) {
      this._uniClient = e2, this._authCallBacks = {}, this._dbCallBacks = {}, e2._isDefault && (this._dbCallBacks = U("_globalUniCloudDatabaseCallback")), t2 || (this.auth = Xn(this._authCallBacks)), this._isJQL = t2, Object.assign(this, Xn(this._dbCallBacks)), this.env = Qn({}, { get: (e3, t3) => ({ $env: t3 }) }), this.Geo = Qn({}, { get: (e3, t3) => is({ path: ["Geo"], method: t3 }) }), this.serverDate = is({ path: [], method: "serverDate" }), this.RegExp = is({ path: [], method: "RegExp" });
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
  }
  function as(e2, t2 = {}) {
    return Qn(new e2(t2), { get: (e3, t3) => es("db", t3) ? rs({ $method: t3 }, null, e3) : function() {
      return rs({ $method: t3, $param: ts(Array.from(arguments)) }, null, e3);
    } });
  }
  class cs extends os {
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
        return i2._callback("error", [e3]), j($(o2, "fail"), e3).then(() => j($(o2, "complete"), e3)).then(() => (r2(null, e3), Y(H.RESPONSE, { type: J.CLIENT_DB, content: e3 }), Promise.reject(e3)));
      }
      const c2 = j($(o2, "invoke")), u2 = this._uniClient;
      return c2.then(() => u2.callFunction({ name: "DCloud-clientDB", type: l.CLIENT_DB, data: { action: e2, command: t2, multiCommand: n2 } })).then((e3) => {
        const { code: t3, message: n3, token: s3, tokenExpired: c3, systemInfo: u3 = [] } = e3.result;
        if (u3)
          for (let e4 = 0; e4 < u3.length; e4++) {
            const { level: t4, message: n4, detail: s4 } = u3[e4];
            let r3 = "[System Info]" + n4;
            s4 && (r3 = `${r3}
详细信息：${s4}`), (console["warn" === t4 ? "error" : t4] || console.log)(r3);
          }
        if (t3) {
          return a2(new te({ code: t3, message: n3, requestId: e3.requestId }));
        }
        e3.result.errCode = e3.result.errCode || e3.result.code, e3.result.errMsg = e3.result.errMsg || e3.result.message, s3 && c3 && (ie({ token: s3, tokenExpired: c3 }), this._callbackAuth("refreshToken", [{ token: s3, tokenExpired: c3 }]), this._callback("refreshToken", [{ token: s3, tokenExpired: c3 }]), Y(H.REFRESH_TOKEN, { token: s3, tokenExpired: c3 }));
        const h2 = [{ prop: "affectedDocs", tips: "affectedDocs不再推荐使用，请使用inserted/deleted/updated/data.length替代" }, { prop: "code", tips: "code不再推荐使用，请使用errCode替代" }, { prop: "message", tips: "message不再推荐使用，请使用errMsg替代" }];
        for (let t4 = 0; t4 < h2.length; t4++) {
          const { prop: n4, tips: s4 } = h2[t4];
          if (n4 in e3.result) {
            const t5 = e3.result[n4];
            Object.defineProperty(e3.result, n4, { get: () => (console.warn(s4), t5) });
          }
        }
        return function(e4) {
          return j($(o2, "success"), e4).then(() => j($(o2, "complete"), e4)).then(() => {
            r2(e4, null);
            const t4 = i2._parseResult(e4);
            return Y(H.RESPONSE, { type: J.CLIENT_DB, content: t4 }), Promise.resolve(t4);
          });
        }(e3);
      }, (e3) => {
        /fc_function_not_found|FUNCTION_NOT_FOUND/g.test(e3.message) && console.warn("clientDB未初始化，请在web控制台保存一次schema以开启clientDB");
        return a2(new te({ code: e3.code || "SYSTEM_ERROR", message: e3.message, requestId: e3.requestId }));
      });
    }
  }
  const us = "token无效，跳转登录页面", hs = "token过期，跳转登录页面", ls = { TOKEN_INVALID_TOKEN_EXPIRED: hs, TOKEN_INVALID_INVALID_CLIENTID: us, TOKEN_INVALID: us, TOKEN_INVALID_WRONG_TOKEN: us, TOKEN_INVALID_ANONYMOUS_USER: us }, ds = { "uni-id-token-expired": hs, "uni-id-check-token-failed": us, "uni-id-token-not-exist": us, "uni-id-check-device-feature-failed": us }, ps = { ...ls, ...ds, default: "用户未登录或登录状态过期，自动跳转登录页面" };
  function fs(e2, t2) {
    let n2 = "";
    return n2 = e2 ? `${e2}/${t2}` : t2, n2.replace(/^\//, "");
  }
  function gs(e2 = [], t2 = "") {
    const n2 = [], s2 = [];
    return e2.forEach((e3) => {
      true === e3.needLogin ? n2.push(fs(t2, e3.path)) : false === e3.needLogin && s2.push(fs(t2, e3.path));
    }), { needLoginPage: n2, notNeedLoginPage: s2 };
  }
  function ms(e2) {
    return e2.split("?")[0].replace(/^\//, "");
  }
  function ys() {
    return function(e2) {
      let t2 = e2 && e2.$page && e2.$page.fullPath;
      return t2 ? ("/" !== t2.charAt(0) && (t2 = "/" + t2), t2) : "";
    }(function() {
      const e2 = getCurrentPages();
      return e2[e2.length - 1];
    }());
  }
  function _s() {
    return ms(ys());
  }
  function ws(e2 = "", t2 = {}) {
    if (!e2)
      return false;
    if (!(t2 && t2.list && t2.list.length))
      return false;
    const n2 = t2.list, s2 = ms(e2);
    return n2.some((e3) => e3.pagePath === s2);
  }
  const Is = !!e.uniIdRouter;
  const { loginPage: vs, routerNeedLogin: Ss, resToLogin: Ts, needLoginPage: bs, notNeedLoginPage: Es, loginPageInTabBar: ks } = function({ pages: t2 = [], subPackages: n2 = [], uniIdRouter: s2 = {}, tabBar: r2 = {} } = e) {
    const { loginPage: i2, needLogin: o2 = [], resToLogin: a2 = true } = s2, { needLoginPage: c2, notNeedLoginPage: u2 } = gs(t2), { needLoginPage: h2, notNeedLoginPage: l2 } = function(e2 = []) {
      const t3 = [], n3 = [];
      return e2.forEach((e3) => {
        const { root: s3, pages: r3 = [] } = e3, { needLoginPage: i3, notNeedLoginPage: o3 } = gs(r3, s3);
        t3.push(...i3), n3.push(...o3);
      }), { needLoginPage: t3, notNeedLoginPage: n3 };
    }(n2);
    return { loginPage: i2, routerNeedLogin: o2, resToLogin: a2, needLoginPage: [...c2, ...h2], notNeedLoginPage: [...u2, ...l2], loginPageInTabBar: ws(i2, r2) };
  }();
  if (bs.indexOf(vs) > -1)
    throw new Error(`Login page [${vs}] should not be "needLogin", please check your pages.json`);
  function As(e2) {
    const t2 = _s();
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
  function Ps(e2) {
    const t2 = ms(As(e2));
    return !(Es.indexOf(t2) > -1) && (bs.indexOf(t2) > -1 || Ss.some((t3) => function(e3, t4) {
      return new RegExp(t4).test(e3);
    }(e2, t3)));
  }
  function Cs({ redirect: e2 }) {
    const t2 = ms(e2), n2 = ms(vs);
    return _s() !== n2 && t2 !== n2;
  }
  function Os({ api: e2, redirect: t2 } = {}) {
    if (!t2 || !Cs({ redirect: t2 }))
      return;
    const n2 = function(e3, t3) {
      return "/" !== e3.charAt(0) && (e3 = "/" + e3), t3 ? e3.indexOf("?") > -1 ? e3 + `&uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3 + `?uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3;
    }(vs, t2);
    ks ? "navigateTo" !== e2 && "redirectTo" !== e2 || (e2 = "switchTab") : "switchTab" === e2 && (e2 = "navigateTo");
    const s2 = { navigateTo: uni.navigateTo, redirectTo: uni.redirectTo, switchTab: uni.switchTab, reLaunch: uni.reLaunch };
    setTimeout(() => {
      s2[e2]({ url: n2 });
    }, 0);
  }
  function xs({ url: e2 } = {}) {
    const t2 = { abortLoginPageJump: false, autoToLoginPage: false }, n2 = function() {
      const { token: e3, tokenExpired: t3 } = re();
      let n3;
      if (e3) {
        if (t3 < Date.now()) {
          const e4 = "uni-id-token-expired";
          n3 = { errCode: e4, errMsg: ps[e4] };
        }
      } else {
        const e4 = "uni-id-check-token-failed";
        n3 = { errCode: e4, errMsg: ps[e4] };
      }
      return n3;
    }();
    if (Ps(e2) && n2) {
      n2.uniIdRedirectUrl = e2;
      if (z(H.NEED_LOGIN).length > 0)
        return setTimeout(() => {
          Y(H.NEED_LOGIN, n2);
        }, 0), t2.abortLoginPageJump = true, t2;
      t2.autoToLoginPage = true;
    }
    return t2;
  }
  function Ns() {
    !function() {
      const e3 = ys(), { abortLoginPageJump: t2, autoToLoginPage: n2 } = xs({ url: e3 });
      t2 || n2 && Os({ api: "redirectTo", redirect: e3 });
    }();
    const e2 = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
    for (let t2 = 0; t2 < e2.length; t2++) {
      const n2 = e2[t2];
      uni.addInterceptor(n2, { invoke(e3) {
        const { abortLoginPageJump: t3, autoToLoginPage: s2 } = xs({ url: e3.url });
        return t3 ? e3 : s2 ? (Os({ api: n2, redirect: As(e3.url) }), false) : e3;
      } });
    }
  }
  function Rs() {
    this.onResponse((e2) => {
      const { type: t2, content: n2 } = e2;
      let s2 = false;
      switch (t2) {
        case "cloudobject":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in ps;
          }(n2);
          break;
        case "clientdb":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in ls;
          }(n2);
      }
      s2 && function(e3 = {}) {
        const t3 = z(H.NEED_LOGIN);
        Z().then(() => {
          const n3 = ys();
          if (n3 && Cs({ redirect: n3 }))
            return t3.length > 0 ? Y(H.NEED_LOGIN, Object.assign({ uniIdRedirectUrl: n3 }, e3)) : void (vs && Os({ api: "navigateTo", redirect: n3 }));
        });
      }(n2);
    });
  }
  function Ls(e2) {
    !function(e3) {
      e3.onResponse = function(e4) {
        V(H.RESPONSE, e4);
      }, e3.offResponse = function(e4) {
        G(H.RESPONSE, e4);
      };
    }(e2), function(e3) {
      e3.onNeedLogin = function(e4) {
        V(H.NEED_LOGIN, e4);
      }, e3.offNeedLogin = function(e4) {
        G(H.NEED_LOGIN, e4);
      }, Is && (U(Qt).needLoginInit || (U(Qt).needLoginInit = true, Z().then(() => {
        Ns.call(e3);
      }), Ts && Rs.call(e3)));
    }(e2), function(e3) {
      e3.onRefreshToken = function(e4) {
        V(H.REFRESH_TOKEN, e4);
      }, e3.offRefreshToken = function(e4) {
        G(H.REFRESH_TOKEN, e4);
      };
    }(e2);
  }
  let Us;
  const Ds = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", Ms = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
  function qs() {
    const e2 = re().token || "", t2 = e2.split(".");
    if (!e2 || 3 !== t2.length)
      return { uid: null, role: [], permission: [], tokenExpired: 0 };
    let n2;
    try {
      n2 = JSON.parse((s2 = t2[1], decodeURIComponent(Us(s2).split("").map(function(e3) {
        return "%" + ("00" + e3.charCodeAt(0).toString(16)).slice(-2);
      }).join(""))));
    } catch (e3) {
      throw new Error("获取当前用户信息出错，详细错误信息为：" + e3.message);
    }
    var s2;
    return n2.tokenExpired = 1e3 * n2.exp, delete n2.exp, delete n2.iat, n2;
  }
  Us = "function" != typeof atob ? function(e2) {
    if (e2 = String(e2).replace(/[\t\n\f\r ]+/g, ""), !Ms.test(e2))
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    var t2;
    e2 += "==".slice(2 - (3 & e2.length));
    for (var n2, s2, r2 = "", i2 = 0; i2 < e2.length; )
      t2 = Ds.indexOf(e2.charAt(i2++)) << 18 | Ds.indexOf(e2.charAt(i2++)) << 12 | (n2 = Ds.indexOf(e2.charAt(i2++))) << 6 | (s2 = Ds.indexOf(e2.charAt(i2++))), r2 += 64 === n2 ? String.fromCharCode(t2 >> 16 & 255) : 64 === s2 ? String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255) : String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2);
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
  }), Ks = t(Fs);
  const js = { auto: "auto", onready: "onready", manual: "manual" };
  function $s(e2) {
    return { props: { localdata: { type: Array, default: () => [] }, options: { type: [Object, Array], default: () => ({}) }, spaceInfo: { type: Object, default: () => ({}) }, collection: { type: [String, Array], default: "" }, action: { type: String, default: "" }, field: { type: String, default: "" }, orderby: { type: String, default: "" }, where: { type: [String, Object], default: "" }, pageData: { type: String, default: "add" }, pageCurrent: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 }, getcount: { type: [Boolean, String], default: false }, gettree: { type: [Boolean, String], default: false }, gettreepath: { type: [Boolean, String], default: false }, startwith: { type: String, default: "" }, limitlevel: { type: Number, default: 10 }, groupby: { type: String, default: "" }, groupField: { type: String, default: "" }, distinct: { type: [Boolean, String], default: false }, foreignKey: { type: String, default: "" }, loadtime: { type: String, default: "auto" }, manual: { type: Boolean, default: false } }, data: () => ({ mixinDatacomLoading: false, mixinDatacomHasMore: false, mixinDatacomResData: [], mixinDatacomErrorMessage: "", mixinDatacomPage: {}, mixinDatacomError: null }), created() {
      this.mixinDatacomPage = { current: this.pageCurrent, size: this.pageSize, count: 0 }, this.$watch(() => {
        var e3 = [];
        return ["pageCurrent", "pageSize", "localdata", "collection", "action", "field", "orderby", "where", "getont", "getcount", "gettree", "groupby", "groupField", "distinct"].forEach((t2) => {
          e3.push(this[t2]);
        }), e3;
      }, (e3, t2) => {
        if (this.loadtime === js.manual)
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
  function Bs(e2) {
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
              return await j($(t3, "invoke"), { ...r3 }), i3 = await e3(...s4), await j($(t3, "success"), { ...r3, result: i3 }), i3;
            } catch (e4) {
              throw o3 = e4, await j($(t3, "fail"), { ...r3, error: o3 }), o3;
            } finally {
              await j($(t3, "complete"), o3 ? { ...r3, error: o3 } : { ...r3, result: i3 });
            }
          };
        }({ fn: async function s4(...u2) {
          let h2;
          a2 && uni.showLoading({ title: r2.title, mask: r2.mask });
          const d2 = { name: t2, type: l.OBJECT, data: { method: c2, params: u2 } };
          "object" == typeof n2.secretMethods && function(e3, t3) {
            const n3 = t3.data.method, s5 = e3.secretMethods || {}, r3 = s5[n3] || s5["*"];
            r3 && (t3.secretType = r3);
          }(n2, d2);
          let p2 = false;
          try {
            h2 = await e2.callFunction(d2);
          } catch (e3) {
            p2 = true, h2 = { result: new te(e3) };
          }
          const { errSubject: f2, errCode: g2, errMsg: m2, newToken: y2 } = h2.result || {};
          if (a2 && uni.hideLoading(), y2 && y2.token && y2.tokenExpired && (ie(y2), Y(H.REFRESH_TOKEN, { ...y2 })), g2) {
            let e3 = m2;
            if (p2 && o2) {
              e3 = (await o2({ objectName: t2, methodName: c2, params: u2, errSubject: f2, errCode: g2, errMsg: m2 })).errMsg || m2;
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
                    return s4(...u2);
                }
              }
            const n3 = new te({ subject: f2, code: g2, message: m2, requestId: h2.requestId });
            throw n3.detail = h2.result, Y(H.RESPONSE, { type: J.CLOUD_OBJECT, content: n3 }), n3;
          }
          return Y(H.RESPONSE, { type: J.CLOUD_OBJECT, content: h2.result }), h2.result;
        }, interceptorName: "callObject", getCallbackArgs: function({ params: e3 } = {}) {
          return { objectName: t2, methodName: c2, params: e3 };
        } });
      } });
    };
  }
  function Ws(e2) {
    return U(Xt.replace("{spaceId}", e2.config.spaceId));
  }
  async function Hs({ openid: e2, callLoginByWeixin: t2 = false } = {}) {
    Ws(this);
    throw new Error(`[SecureNetwork] API \`initSecureNetworkByWeixin\` is not supported on platform \`${P}\``);
  }
  async function Js(e2) {
    const t2 = Ws(this);
    return t2.initPromise || (t2.initPromise = Hs.call(this, e2).then((e3) => e3).catch((e3) => {
      throw delete t2.initPromise, e3;
    })), t2.initPromise;
  }
  function zs(e2) {
    return function({ openid: t2, callLoginByWeixin: n2 = false } = {}) {
      return Js.call(e2, { openid: t2, callLoginByWeixin: n2 });
    };
  }
  function Vs(e2) {
    !function(e3) {
      he = e3;
    }(e2);
  }
  function Gs(e2) {
    const n2 = { getAppBaseInfo: uni.getSystemInfo, getPushClientId: uni.getPushClientId };
    return function(s2) {
      return new Promise((r2, i2) => {
        n2[e2]({ ...s2, success(e3) {
          r2(e3);
        }, fail(e3) {
          i2(e3);
        } });
      });
    };
  }
  class Ys extends S {
    constructor() {
      super(), this._uniPushMessageCallback = this._receivePushMessage.bind(this), this._currentMessageId = -1, this._payloadQueue = [];
    }
    init() {
      return Promise.all([Gs("getAppBaseInfo")(), Gs("getPushClientId")()]).then(([{ appId: e2 } = {}, { cid: t2 } = {}] = []) => {
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
  async function Qs(e2) {
    {
      const { osName: e3, osVersion: t3 } = ce();
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
    const { address: n2, servePort: s2 } = t2.debugInfo, { address: r2 } = await Ot(n2, s2);
    if (r2)
      return t2.localAddress = r2, void (t2.localPort = s2);
    const i2 = console["error"];
    let o2 = "";
    if ("remote" === t2.debugInfo.initialLaunchType ? (t2.debugInfo.forceRemote = true, o2 = "当前客户端和HBuilderX不在同一局域网下（或其他网络原因无法连接HBuilderX），uniCloud本地调试服务不对当前客户端生效。\n- 如果不使用uniCloud本地调试服务，请直接忽略此信息。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。") : o2 = "无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。", o2 += "\n- 如果在HBuilderX开启的状态下切换过网络环境，请重启HBuilderX后再试\n- 检查系统防火墙是否拦截了HBuilderX自带的nodejs\n- 检查是否错误的使用拦截器修改uni.request方法的参数", 0 === P.indexOf("mp-") && (o2 += "\n- 小程序中如何使用uniCloud，请参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"), !t2.debugInfo.forceRemote)
      throw new Error(o2);
    i2(o2);
  }
  function Xs(e2) {
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
  const Zs = { tcb: Pt, tencent: Pt, aliyun: fe, private: Rt, dcloud: Rt, alipay: Bt };
  let er = new class {
    init(e2) {
      let t2 = {};
      const n2 = Zs[e2.provider];
      if (!n2)
        throw new Error("未提供正确的provider参数");
      t2 = n2.init(e2), function(e3) {
        const t3 = {};
        e3.__dev__ = t3, t3.debugLog = "app" === P;
        const n3 = C;
        n3 && !n3.code && (t3.debugInfo = n3);
        const s2 = new v({ createPromise: function() {
          return Qs(e3);
        } });
        t3.initLocalNetwork = function() {
          return s2.exec();
        };
      }(t2), Xs(t2), Gn(t2), function(e3) {
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
          const n3 = as(cs, { uniClient: e3 });
          return this._database = n3, n3;
        }, e3.databaseForJQL = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).databaseForJQL();
          if (this._databaseForJQL)
            return this._databaseForJQL;
          const n3 = as(cs, { uniClient: e3, isJQL: true });
          return this._databaseForJQL = n3, n3;
        };
      }(t2), function(e3) {
        e3.getCurrentUserInfo = qs, e3.chooseAndUploadFile = Ks.initChooseAndUploadFile(e3), Object.assign(e3, { get mixinDatacom() {
          return $s(e3);
        } }), e3.SSEChannel = Ys, e3.initSecureNetworkByWeixin = zs(e3), e3.setCustomClientInfo = Vs, e3.importObject = Bs(e3);
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
              const e5 = n4 && n4.type || l.DEFAULT;
              s2 = e5 !== l.DEFAULT;
            }
            const r2 = "callFunction" === t3 && !s2, i2 = this._initPromiseHub.exec();
            n4 = n4 || {};
            const { success: o2, fail: a2, complete: c2 } = ee(n4), u2 = i2.then(() => s2 ? Promise.resolve() : j($(t3, "invoke"), n4)).then(() => e4.call(this, n4)).then((e5) => s2 ? Promise.resolve(e5) : j($(t3, "success"), e5).then(() => j($(t3, "complete"), e5)).then(() => (r2 && Y(H.RESPONSE, { type: J.CLOUD_FUNCTION, content: e5 }), Promise.resolve(e5))), (e5) => s2 ? Promise.reject(e5) : j($(t3, "fail"), e5).then(() => j($(t3, "complete"), e5)).then(() => (Y(H.RESPONSE, { type: J.CLOUD_FUNCTION, content: e5 }), Promise.reject(e5))));
            if (!(o2 || a2 || c2))
              return u2;
            u2.then((e5) => {
              o2 && o2(e5), c2 && c2(e5), r2 && Y(H.RESPONSE, { type: J.CLOUD_FUNCTION, content: e5 });
            }, (e5) => {
              a2 && a2(e5), c2 && c2(e5), r2 && Y(H.RESPONSE, { type: J.CLOUD_FUNCTION, content: e5 });
            });
          };
        }(t2[e3], e3)).bind(t2);
      }), t2.init = this.init, t2;
    }
  }();
  (() => {
    const e2 = O;
    let t2 = {};
    if (e2 && 1 === e2.length)
      t2 = e2[0], er = er.init(t2), er._isDefault = true;
    else {
      const t3 = ["auth", "callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile"], n2 = ["database", "getCurrentUserInfo", "importObject"];
      let s2;
      s2 = e2 && e2.length > 0 ? "应用有多个服务空间，请通过uniCloud.init方法指定要使用的服务空间" : "应用未关联服务空间，请在uniCloud目录右键关联服务空间", [...t3, ...n2].forEach((e3) => {
        er[e3] = function() {
          if (console.error(s2), -1 === n2.indexOf(e3))
            return Promise.reject(new te({ code: "SYS_ERR", message: s2 }));
          console.error(s2);
        };
      });
    }
    if (Object.assign(er, { get mixinDatacom() {
      return $s(er);
    } }), Ls(er), er.addInterceptor = F, er.removeInterceptor = K, er.interceptObject = B, uni.__uniCloud = er, "app" === P) {
      const e3 = D();
      e3.uniCloud = er, e3.UniCloudError = te;
    }
  })();
  var tr = er;
  const _sfc_main$z = {
    name: "loading1",
    data() {
      return {};
    }
  };
  function _sfc_render$y(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading1" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading1 = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["render", _sfc_render$y], ["__scopeId", "data-v-0e645258"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading1.vue"]]);
  const _sfc_main$y = {
    name: "loading2",
    data() {
      return {};
    }
  };
  function _sfc_render$x(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading2" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading2 = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$x], ["__scopeId", "data-v-3df48dc2"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading2.vue"]]);
  const _sfc_main$x = {
    name: "loading3",
    data() {
      return {};
    }
  };
  function _sfc_render$w(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading3" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading3 = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["render", _sfc_render$w], ["__scopeId", "data-v-27a8293c"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading3.vue"]]);
  const _sfc_main$w = {
    name: "loading5",
    data() {
      return {};
    }
  };
  function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading5" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading4 = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$v], ["__scopeId", "data-v-2e7deb83"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading4.vue"]]);
  const _sfc_main$v = {
    name: "loading6",
    data() {
      return {};
    }
  };
  function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container loading6" }, [
      vue.createElementVNode("view", { class: "shape shape1" }),
      vue.createElementVNode("view", { class: "shape shape2" }),
      vue.createElementVNode("view", { class: "shape shape3" }),
      vue.createElementVNode("view", { class: "shape shape4" })
    ]);
  }
  const Loading5 = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$u], ["__scopeId", "data-v-ef674bbb"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/loading5.vue"]]);
  const _sfc_main$u = {
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
  function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$t], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-loading/qiun-loading.vue"]]);
  const _sfc_main$t = {
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
  function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_1$3 = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$s], ["__scopeId", "data-v-a99d579b"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-error/qiun-error.vue"]]);
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
    "type": [
      "pie",
      "ring",
      "rose",
      "word",
      "funnel",
      "map",
      "arcbar",
      "line",
      "column",
      "mount",
      "bar",
      "area",
      "radar",
      "gauge",
      "candle",
      "mix",
      "tline",
      "tarea",
      "scatter",
      "bubble",
      "demotype"
    ],
    "range": [
      "饼状图",
      "圆环图",
      "玫瑰图",
      "词云图",
      "漏斗图",
      "地图",
      "圆弧进度条",
      "折线图",
      "柱状图",
      "山峰图",
      "条状图",
      "区域图",
      "雷达图",
      "仪表盘",
      "K线图",
      "混合图",
      "时间轴折线",
      "时间轴区域",
      "散点图",
      "气泡图",
      "自定义类型"
    ],
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
      },
      "pieNamePercent": function(val, index, series, opts) {
        if (index !== void 0) {
          const total = series.reduce((sum, cur) => sum + cur.data, 0);
          const percent = (series[index].data / total * 100).toFixed(2) + "%";
          if (series[index].name.length > 4) {
            series[index].name = series[index].name.substring(0, 4) + "..";
          }
          return `${series[index].name}${percent}`;
        }
      },
      "yuanToWan": function(val, index, series, opts) {
        if (Math.abs(val) >= 1e4) {
          const v2 = val / 1e4;
          return Number.isInteger(v2) ? `${v2}w` : `${v2.toFixed(0)}w`;
        }
        return val.toFixed(0);
      },
      "lineFormatter1": function(item, category, index, opts) {
        return "净收入" + item.data;
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
      "legend": {
        show: false
      },
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
      "legend": {
        show: false
      },
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
      "padding": [5, 15, 5, 25],
      "rotate": false,
      "dataLabel": true,
      "fontSize": 11,
      "label": {
        "show": true,
        "lineLength": 10
        // 限制宽度，长文字会换行，不用横向扩展
      },
      "legend": {
        "show": false,
        "position": "right",
        "lineHeight": 25
      },
      "title": {
        "name": "",
        "fontSize": 15,
        "color": "#666666"
      },
      "subtitle": {
        "name": "",
        "fontSize": 25,
        "color": "#7cb5ec"
      },
      "extra": {
        "ring": {
          "ringWidth": 35,
          "activeOpacity": 0.5,
          "activeRadius": 10,
          "offsetAngle": 0,
          "labelWidth": 6,
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
      "padding": [15, 10, 0, 5],
      "dataPointShape": false,
      "loadingType": 0,
      "xAxis": {
        "disableGrid": true,
        "fontColor": "#c0c3cf"
      },
      "yAxis": {
        "gridType": "dash",
        "dashLength": 6,
        // "splitNumber": 3,
        "format": "yuanToWan"
      },
      "legend": {
        "show": false
      },
      "extra": {
        "line": {
          "type": "straight",
          "width": 3,
          "activeType": "hollow"
        },
        "tooltip": {
          "legendShow": false
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
        "data": [{
          "min": 0,
          "max": 80
        }]
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
        "data": [{
          "min": 0,
          "max": 80
        }]
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
        "data": [{
          "min": 0
        }]
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
        "data": [{
          "min": 0
        }]
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
  const _sfc_main$s = {
    name: "qiun-data-charts",
    mixins: [tr.mixinDatacom],
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
  function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_qiun_loading = resolveEasycom(vue.resolveDynamicComponent("qiun-loading"), __easycom_0$2);
    const _component_qiun_error = resolveEasycom(vue.resolveDynamicComponent("qiun-error"), __easycom_1$3);
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "chartsview",
      id: "ChartBoxId" + $data.cid
    }, [
      _ctx.mixinDatacomLoading ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
        vue.createVNode(_component_qiun_loading, { loadingType: $props.loadingType }, null, 8, ["loadingType"])
      ])) : vue.createCommentVNode("v-if", true),
      _ctx.mixinDatacomErrorMessage && $props.errorShow ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        onClick: _cache[0] || (_cache[0] = (...args) => $options.reloading && $options.reloading(...args))
      }, [
        vue.createVNode(_component_qiun_error, { errorMessage: $props.errorMessage }, null, 8, ["errorMessage"])
      ])) : vue.createCommentVNode("v-if", true),
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
      ], 40, ["id", "prop", "change:prop"]))
    ], 8, ["id"]);
  }
  if (typeof block0 === "function")
    block0(_sfc_main$s);
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$r], ["__scopeId", "data-v-0ca34aee"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue"]]);
  const dbService$1 = new DBService();
  class ReportService {
    /**
     * 获取某个账户在指定年月（格式为202302）的净收入（结余）
     * @param {number} accountId - 账户ID
     * @param {string|number} yearMonth - 目标年月，如 202502
     * @returns [{ yearMonth: '202502', netIncome: xxx }]
     */
    async getMonthlyNetIncomeByYM(accountId, yearMonth) {
      const ymStr = String(yearMonth);
      const sql = `
		SELECT
			strftime('%Y%m', bill_date) AS yearMonth,
			SUM(money) AS netIncome
		FROM tally_bill
		WHERE account_id = ${accountId}
		AND strftime('%Y%m', bill_date) = '${ymStr}'
		GROUP BY strftime('%Y%m', bill_date)
		ORDER BY yearMonth DESC
	`;
      return dbService$1.queryTable(sql);
    }
    async getAccountsNetIncomeByMonth(yearMonth) {
      const ymStr = String(yearMonth);
      const sql = `
			SELECT 
				a.account_name,
				SUM(b.money) AS netIncome
			FROM tally_account a
			LEFT JOIN tally_bill b ON a.id = b.account_id
			WHERE strftime('%Y%m', datetime(b.bill_date / 1000, 'unixepoch')) = '${ymStr}'
			GROUP BY a.id, a.account_name
		`;
      return dbService$1.queryTable(sql);
    }
    async getNetIncomeByMonth(year, user_id) {
      const startDate = `${year}-01-01 00:00:00`;
      const endDate = `${year}-12-31 23:59:59`;
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      const sql = `
			SELECT 
				strftime('%m', datetime(bill_date / 1000, 'unixepoch')) AS month,
				SUM(b.money) AS netIncome
			FROM tally_account a
			LEFT JOIN tally_bill b ON a.id = b.account_id
			WHERE b.bill_date BETWEEN ${startTimestamp} AND ${endTimestamp}
			AND a.user_id = ${user_id}
			GROUP BY month
			ORDER BY month ASC
		`;
      return dbService$1.queryTable(sql);
    }
    async getCatorySumByMonth(month, directory, user_id = 0) {
      const sql = `
		SELECT 
			b.category_id AS categoryId,
			c.name AS categoryName,
			c.icon AS icon,
			SUM(b.money) AS total
		FROM tally_bill b
		JOIN tally_category c ON b.category_id=c.id
		WHERE strftime('%Y%m', datetime(b.bill_date / 1000, 'unixepoch')) = '${month}' 
		AND b.user_id='${user_id}'
		AND directory=${directory}
		GROUP BY b.category_id`;
      return dbService$1.queryTable(sql);
    }
  }
  const _sfc_main$r = {
    __name: "reports",
    setup(__props, { expose: __expose }) {
      __expose();
      const reportService = new ReportService();
      const incomeChartData = vue.ref({});
      const outcomeChartData = vue.ref({});
      const netIncomeChartData = vue.ref({});
      const lineOpts = {
        dataLabel: false,
        xAxis: {
          //绘制坐标轴轴线
          axisLine: false
        },
        yAxis: {
          axisLine: false,
          axisLineColor: "#FFFFFF",
          gridColor: "#ebebeb"
        }
      };
      const tabList = ["分类", "账户"];
      const currentTab = vue.ref(0);
      function clickTab(index) {
        currentTab.value = index;
        if (index === 0) {
          loadMonthData();
        } else if (index === 1) {
          loadAccountChart();
        }
      }
      const currentDateForCategory = vue.ref(/* @__PURE__ */ new Date());
      const currentYearForAccount = vue.ref((/* @__PURE__ */ new Date()).getFullYear());
      const currentMonthStr = vue.computed(() => {
        const year = currentDateForCategory.value.getFullYear();
        const month = (currentDateForCategory.value.getMonth() + 1).toString().padStart(2, "0");
        return `${year}${month}`;
      });
      const currentYear = vue.computed(() => {
        return currentYearForAccount.value.getFullYear().toString();
      });
      function formatMonth(date) {
        const y2 = date.getFullYear();
        const m2 = (date.getMonth() + 1).toString().padStart(2, "0");
        return `${y2}年${m2}月`;
      }
      const showList = vue.ref(true);
      async function changeMonth(direction) {
        const newDate = new Date(currentDateForCategory.value);
        newDate.setMonth(newDate.getMonth() + direction);
        currentDateForCategory.value = newDate;
        await loadMonthData();
      }
      async function changeYear(direction) {
        currentYearForAccount.value = currentYearForAccount.value + direction;
        await loadAccountChart();
      }
      const incomeCategoryByMonth = vue.ref([]);
      const outcomeCategoryByMonth = vue.ref([]);
      let tempIncomeCategoryByMonth = [];
      let tempOutcomeCategoryByMonth = [];
      const incomeTotal = vue.ref(0);
      const outcomeTotal = vue.ref(0);
      let tempIncomeTotal = 0;
      let tempOutcomeTotal = 0;
      const outcomeChartRef = vue.ref(null);
      const chartState = vue.reactive({
        incomeChartData: null,
        outcomeChartData: null,
        incomeCategoryByMonth: [],
        outcomeCategoryByMonth: []
      });
      const loadMonthData = async () => {
        try {
          const monthStr = currentMonthStr.value;
          const user_id = uni.getStorageSync("user_id") || 0;
          tempIncomeTotal = 0;
          tempOutcomeTotal = 0;
          tempIncomeCategoryByMonth = await reportService.getCatorySumByMonth(monthStr, 1, user_id).then((result) => {
            return result.filter((item) => item.categoryId !== 1998 && item.categoryId !== 1999).map(
              (item) => {
                tempIncomeTotal += item.total;
                return {
                  icon: item.icon,
                  categoryId: item.categoryId,
                  categoryName: item.categoryName,
                  total: fenToYuanNumber(item.total)
                };
              }
            ).sort((a2, b2) => b2.total - a2.total);
          });
          tempOutcomeCategoryByMonth = await reportService.getCatorySumByMonth(monthStr, -1, user_id).then((result) => {
            return result.filter((item) => item.categoryId !== 1998 && item.categoryId !== 1999).map(
              (item) => {
                var total = Math.abs(item.total);
                tempOutcomeTotal += total;
                return {
                  icon: item.icon,
                  categoryId: item.categoryId,
                  categoryName: item.categoryName,
                  total: fenToYuanNumber(total)
                };
              }
            ).sort((a2, b2) => b2.total - a2.total);
          });
          updateChartData();
        } catch (error) {
          formatAppLog("error", "at pages/reports/reports.vue:253", "加载月份数据失败:", error);
          uni.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        } finally {
        }
      };
      const updateChartData = () => {
        incomeChartData.value = {
          series: [{
            format: "pieNamePercent",
            data: tempIncomeCategoryByMonth.map((item) => {
              return {
                name: item.categoryName,
                value: item.total
              };
            })
          }]
        };
        outcomeChartData.value = {
          series: [{
            format: "pieNamePercent",
            data: tempOutcomeCategoryByMonth.map((item) => {
              return {
                name: item.categoryName,
                value: item.total
              };
            })
          }]
        };
      };
      function onChartCompleteAccountPieForIncome() {
        incomeTotal.value = fenToYuanString(tempIncomeTotal);
        incomeCategoryByMonth.value = tempIncomeCategoryByMonth;
        outcomeTotal.value = fenToYuanString(tempOutcomeTotal);
        outcomeCategoryByMonth.value = tempOutcomeCategoryByMonth;
      }
      async function loadAccountChart() {
        const user_id = uni.getStorageSync("user_id") || 0;
        const netIncomeResult = await reportService.getNetIncomeByMonth(currentYearForAccount.value, user_id);
        const netIncome = fillMonthlyData(netIncomeResult, currentYearForAccount.value);
        netIncomeChartData.value = {
          categories: netIncome.map((x) => {
            const monthNum = Number(x.month);
            return monthNum % 2 === 1 ? `${monthNum}月` : "";
          }),
          series: [{
            name: "",
            data: netIncome.map((x) => x.netIncome)
          }]
        };
      }
      const latestTotalMoney = vue.ref(0);
      function onChartCompleteAccountLine() {
        latestTotalMoney.value = netIncomeChartData.value.series[0].data[11];
      }
      function fillMonthlyData(rawData, year) {
        const result = [];
        const dataMap = /* @__PURE__ */ new Map();
        rawData.forEach((item) => {
          dataMap.set(item.month, fenToYuanString(item.netIncome));
        });
        const existingMonths = rawData.map((item) => Number(item.month));
        const lastDataMonth = Math.max(...existingMonths);
        let lastValue = "0.00";
        for (let m2 = 1; m2 <= 12; m2++) {
          const mm = m2.toString().padStart(2, "0");
          const key = `${mm}`;
          if (dataMap.has(key)) {
            lastValue = dataMap.get(key);
            result.push({
              month: key,
              netIncome: lastValue
            });
          } else {
            const value = m2 < lastDataMonth ? "0.00" : lastValue;
            result.push({
              month: key,
              netIncome: value
            });
          }
        }
        return result;
      }
      onPullDownRefresh(() => {
        clickTab(currentTab.value);
        uni.stopPullDownRefresh();
      });
      onLoad(() => {
        if (!checkCurrentPageAuth("/pages/reports/reports")) {
          return;
        }
      });
      onShow(() => {
        loadMonthData();
      });
      const __returned__ = { reportService, incomeChartData, outcomeChartData, netIncomeChartData, lineOpts, tabList, currentTab, clickTab, currentDateForCategory, currentYearForAccount, currentMonthStr, currentYear, formatMonth, showList, changeMonth, changeYear, incomeCategoryByMonth, outcomeCategoryByMonth, get tempIncomeCategoryByMonth() {
        return tempIncomeCategoryByMonth;
      }, set tempIncomeCategoryByMonth(v2) {
        tempIncomeCategoryByMonth = v2;
      }, get tempOutcomeCategoryByMonth() {
        return tempOutcomeCategoryByMonth;
      }, set tempOutcomeCategoryByMonth(v2) {
        tempOutcomeCategoryByMonth = v2;
      }, incomeTotal, outcomeTotal, get tempIncomeTotal() {
        return tempIncomeTotal;
      }, set tempIncomeTotal(v2) {
        tempIncomeTotal = v2;
      }, get tempOutcomeTotal() {
        return tempOutcomeTotal;
      }, set tempOutcomeTotal(v2) {
        tempOutcomeTotal = v2;
      }, outcomeChartRef, chartState, loadMonthData, updateChartData, onChartCompleteAccountPieForIncome, loadAccountChart, latestTotalMoney, onChartCompleteAccountLine, fillMonthlyData, ref: vue.ref, onMounted: vue.onMounted, reactive: vue.reactive, watch: vue.watch, get onLoad() {
        return onLoad;
      }, get ReportService() {
        return ReportService;
      }, get authUtils() {
        return authUtils;
      }, get checkCurrentPageAuth() {
        return checkCurrentPageAuth;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$4);
    const _component_qiun_data_charts = resolveEasycom(vue.resolveDynamicComponent("qiun-data-charts"), __easycom_1$2);
    const _component_wd_cell = resolveEasycom(vue.resolveDynamicComponent("wd-cell"), __easycom_0$3);
    const _component_wd_cell_group = resolveEasycom(vue.resolveDynamicComponent("wd-cell-group"), __easycom_2$3);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "status_bar" }),
      vue.createElementVNode("view", { class: "tab-bar" }, [
        (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tabList, (tab, index) => {
            return vue.createElementVNode("view", {
              key: index,
              class: vue.normalizeClass(["tab-item", { active: $setup.currentTab === index }]),
              onClick: ($event) => $setup.clickTab(index)
            }, [
              vue.createTextVNode(
                vue.toDisplayString(tab) + " ",
                1
                /* TEXT */
              ),
              $setup.currentTab === index ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "tab-underline"
              })) : vue.createCommentVNode("v-if", true)
            ], 10, ["onClick"]);
          }),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "tab-content" }, [
        $setup.currentTab === 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
          vue.createElementVNode("view", { class: "month-bar" }, [
            vue.createVNode(_component_wd_icon, {
              name: "arrow-left",
              size: "22px",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.changeMonth(-1))
            }),
            vue.createElementVNode(
              "text",
              { class: "month-text" },
              vue.toDisplayString($setup.formatMonth($setup.currentDateForCategory)),
              1
              /* TEXT */
            ),
            vue.createVNode(_component_wd_icon, {
              name: "arrow-right",
              size: "22px",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.changeMonth(1))
            })
          ]),
          vue.createElementVNode("view", { class: "card-section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "收入分类统计"),
              vue.createElementVNode("view", { class: "summary" }, [
                vue.createElementVNode("text", { class: "summary-text" }, [
                  vue.createTextVNode(" 总收入 "),
                  vue.createElementVNode(
                    "text",
                    { class: "income-text" },
                    vue.toDisplayString($setup.incomeTotal),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "charts-box" }, [
              vue.createVNode(_component_qiun_data_charts, {
                ref: "outcomeChartRef",
                type: "ring",
                animation: false,
                chartData: $setup.incomeChartData,
                onComplete: $setup.onChartCompleteAccountPieForIncome
              }, null, 8, ["chartData"])
            ]),
            vue.createVNode(_component_wd_cell_group, null, {
              default: vue.withCtx(() => [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.incomeCategoryByMonth, (item, index) => {
                    return vue.openBlock(), vue.createBlock(_component_wd_cell, {
                      title: item.categoryName,
                      value: item.total.toFixed(2),
                      "is-link": "",
                      to: `/pages/settle-account/flow?category=${item.categoryId}&month=${$setup.currentMonthStr}`,
                      border: "",
                      center: ""
                    }, {
                      icon: vue.withCtx(() => [
                        vue.createTextVNode(
                          vue.toDisplayString(index + 1) + " ",
                          1
                          /* TEXT */
                        ),
                        vue.createVNode(_component_wd_icon, {
                          name: item.icon,
                          style: { "margin": "0 6px" },
                          size: "22px"
                        }, null, 8, ["name"])
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["title", "value", "to"]);
                  }),
                  256
                  /* UNKEYED_FRAGMENT */
                ))
              ]),
              _: 1
              /* STABLE */
            })
          ]),
          vue.createElementVNode("view", { class: "card-section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "支出分类统计"),
              vue.createElementVNode("text", { class: "summary-text" }, [
                vue.createTextVNode(" 总支出 "),
                vue.createElementVNode(
                  "text",
                  { class: "outcome-text" },
                  vue.toDisplayString($setup.outcomeTotal),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "charts-box" }, [
              vue.createVNode(_component_qiun_data_charts, {
                type: "ring",
                animation: false,
                chartData: $setup.outcomeChartData
              }, null, 8, ["chartData"])
            ]),
            vue.createVNode(_component_wd_cell_group, null, {
              default: vue.withCtx(() => [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.outcomeCategoryByMonth, (item, index) => {
                    return vue.openBlock(), vue.createBlock(_component_wd_cell, {
                      title: item.categoryName,
                      value: item.total.toFixed(2),
                      border: "",
                      center: "",
                      "is-link": "",
                      to: `/pages/settle-account/flow?category=${item.categoryId}&month=${$setup.currentMonthStr}`
                    }, {
                      icon: vue.withCtx(() => [
                        vue.createTextVNode(
                          vue.toDisplayString(index + 1) + " ",
                          1
                          /* TEXT */
                        ),
                        vue.createVNode(_component_wd_icon, {
                          name: item.icon,
                          style: { "margin": "0 6px" },
                          size: "22px"
                        }, null, 8, ["name"])
                      ]),
                      _: 2
                      /* DYNAMIC */
                    }, 1032, ["title", "value", "to"]);
                  }),
                  256
                  /* UNKEYED_FRAGMENT */
                ))
              ]),
              _: 1
              /* STABLE */
            })
          ])
        ])) : $setup.currentTab === 1 ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
          vue.createElementVNode("view", { class: "month-bar" }, [
            vue.createVNode(_component_wd_icon, {
              name: "arrow-left",
              size: "22px",
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.changeYear(-1))
            }),
            vue.createElementVNode(
              "text",
              { class: "month-text" },
              vue.toDisplayString($setup.currentYearForAccount),
              1
              /* TEXT */
            ),
            vue.createVNode(_component_wd_icon, {
              name: "arrow-right",
              size: "22px",
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.changeYear(1))
            })
          ]),
          vue.createElementVNode("view", { class: "card-section" }, [
            vue.createElementVNode("view", { class: "account-card" }, [
              vue.createElementVNode("view", { class: "title" }, "净资产"),
              vue.createElementVNode(
                "view",
                { class: "net-assets-label" },
                vue.toDisplayString($setup.latestTotalMoney),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "charts-box" }, [
              vue.createVNode(_component_qiun_data_charts, {
                type: "line",
                animation: false,
                opts: $setup.lineOpts,
                tooltipFormat: "lineFormatter1",
                chartData: $setup.netIncomeChartData,
                onComplete: $setup.onChartCompleteAccountLine
              }, null, 8, ["chartData"])
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesReportsReports = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$q], ["__scopeId", "data-v-704a5d1f"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/reports/reports.vue"]]);
  const _sfc_main$q = {
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
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_1$4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-collapse-item" }, [
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
  const __easycom_2$2 = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__scopeId", "data-v-3d2dde9f"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-collapse/components/uni-collapse-item/uni-collapse-item.vue"]]);
  const _sfc_main$p = {
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
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-collapse" }, [
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
    ]);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-3f050360"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/uni-collapse/components/uni-collapse/uni-collapse.vue"]]);
  const _sfc_main$o = {
    __name: "FlowList",
    props: {
      flowList: {
        type: Array,
        required: true
      },
      groupId: {
        type: String,
        default: ""
      }
    },
    emits: ["delete", "click", "swipe-open"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const props = __props;
      const emits = __emit;
      function emitDelete(detail, index) {
        emits("delete", {
          detail,
          index
        });
      }
      function emitClick(detail) {
        emits("click", detail);
      }
      function getNetIncomeColor(value) {
        return {
          color: value > 0 ? "#ef4352" : "#2db2d0"
        };
      }
      const swipeItems = vue.ref([]);
      const swipeActionRef = vue.ref(null);
      const closeAll = () => {
        if (swipeActionRef.value) {
          swipeActionRef.value.closeAll();
        }
      };
      __expose({
        closeAll,
        groupId: props.groupId
      });
      const swipeChange = (e2, index) => {
        if (e2 !== "none") {
          emits("swipe-open", props.groupId);
        }
      };
      const __returned__ = { props, emits, emitDelete, emitClick, getNetIncomeColor, swipeItems, swipeActionRef, closeAll, swipeChange, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$4);
    const _component_uni_swipe_action_item = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action-item"), __easycom_1$5);
    const _component_uni_swipe_action = resolveEasycom(vue.resolveDynamicComponent("uni-swipe-action"), __easycom_2$5);
    return vue.openBlock(), vue.createBlock(
      _component_uni_swipe_action,
      { ref: "swipeActionRef" },
      {
        default: vue.withCtx(() => [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($props.flowList, (detail, index) => {
              return vue.openBlock(), vue.createBlock(_component_uni_swipe_action_item, {
                ref_for: true,
                ref: "swipeItems",
                key: index,
                "right-options": [
                  { text: "删除", style: { backgroundColor: "red", color: "#fff" } }
                ],
                onChange: (e2) => $setup.swipeChange(e2, index),
                onClick: () => $setup.emitDelete(detail, index)
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("view", {
                    class: "uni-list-item",
                    onClick: ($event) => $setup.emitClick(detail)
                  }, [
                    vue.createElementVNode("view", { class: "item-left" }, [
                      vue.createVNode(_component_wd_icon, {
                        name: detail.icon,
                        size: "22px"
                      }, null, 8, ["name"]),
                      vue.createElementVNode("view", { class: "uni-list-item__content" }, [
                        vue.createElementVNode(
                          "view",
                          { class: "uni-list-item__title" },
                          vue.toDisplayString(detail.category),
                          1
                          /* TEXT */
                        ),
                        detail.comment ? (vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: 0,
                            class: "uni-list-item__note"
                          },
                          vue.toDisplayString(detail.comment),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true),
                        vue.createElementVNode(
                          "view",
                          { class: "uni-list-item__note" },
                          vue.toDisplayString(detail.info),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "detail-footer" }, [
                        vue.createElementVNode(
                          "text",
                          {
                            class: "money-font",
                            style: vue.normalizeStyle($setup.getNetIncomeColor(detail.money))
                          },
                          vue.toDisplayString(detail.money),
                          5
                          /* TEXT, STYLE */
                        )
                      ])
                    ])
                  ], 8, ["onClick"])
                ]),
                _: 2
                /* DYNAMIC */
              }, 1032, ["onChange", "onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        _: 1
        /* STABLE */
      },
      512
      /* NEED_PATCH */
    );
  }
  const FlowList = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__scopeId", "data-v-0cee94b1"], ["__file", "E:/document/LifePartner/lifeparter-app/components/FlowList.vue"]]);
  const _sfc_main$n = {
    __name: "flow",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const flowListRefs = vue.ref([]);
      const addFlowListRef = (el) => {
        if (el) {
          flowListRefs.value.push(el);
        }
      };
      vue.onBeforeUpdate(() => {
        flowListRefs.value = [];
      });
      const handleSwipeOpen = (activeGroupId) => {
        flowListRefs.value.forEach((ref) => {
          if (ref && ref.groupId !== activeGroupId && ref.closeAll) {
            ref.closeAll();
          }
        });
      };
      function handleRecordClick(detail) {
        if (detail.category_id === 1998 || detail.category_id === 1999) {
          uni.showToast({
            title: "余额变更不可编辑",
            icon: "none",
            duration: 1e3
          });
          return;
        }
        uni.navigateTo({
          url: `/pages/settle-account/flow-edit?bill_id=${detail.id}&account_id=${account_id.value}&category=${detail.category}`
        });
      }
      const handleClick = () => {
        uni.navigateTo({
          url: `/pages/settle-account/flow-create?account_id=${account_id.value}&balance=${totalAssets.value}`
        });
      };
      const monthFlows = vue.reactive([]);
      const firstMonth = vue.ref();
      const totalAssets = vue.ref(0);
      const account_id = vue.ref(0);
      const month = vue.ref(0);
      const category = vue.ref(0);
      onLoad((options) => {
        account_id.value = options.account_id;
        month.value = options.month;
        category.value = options.category;
      });
      onShow(async () => {
        let result = null;
        if (account_id.value) {
          result = await dbService2.getTallyBillByAccountId(account_id.value);
          const account = await dbService2.getTallyAccountById(account_id.value);
          uni.setNavigationBarTitle({
            title: account.account_name
          });
          let totalBalance = account.balance;
          result.forEach((record) => {
            totalBalance += parseFloat(record.money);
          });
          totalAssets.value = fenToYuanString(totalBalance);
        } else {
          result = await dbService2.getTallyBillByCategoryAndMonth(category.value, month.value);
        }
        const categoryResult = await dbService2.getTallyCategory();
        const categoryMap = {};
        categoryResult.forEach((row) => {
          categoryMap[row.id] = row;
        });
        const monthlyData = {};
        result.forEach((record) => {
          const date = new Date(record.bill_date);
          const year = date.getFullYear();
          const month2 = date.getMonth() + 1;
          const day = date.getDate();
          const minuteTime = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
          const yearMonthKey = `${year}-${month2}`;
          if (!monthlyData[yearMonthKey]) {
            monthlyData[yearMonthKey] = {
              month: `${month2}月`,
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
          const money = Math.abs(fenToYuanNumber(record.money));
          if (isExpense) {
            monthData.expense += money;
          } else {
            monthData.revenue += money;
          }
          monthData.flow[dayKey].dayFlowList.push({
            id: record.id,
            category_id: record.category_id,
            category: categoryMap[record.category_id].category,
            money: fenToYuanString(record.money),
            info: record.accountName + " " + minuteTime,
            account_id: record.account_id,
            icon: categoryMap[record.category_id].icon,
            comment: record.comment
          });
        });
        Object.assign(monthFlows, Object.values(monthlyData).map((month2) => {
          month2.netIncome = keep2DigitsString(month2.revenue - month2.expense);
          month2.revenue = keep2DigitsString(month2.revenue);
          month2.expense = keep2DigitsString(month2.expense);
          month2.flow = Object.values(month2.flow).sort((a2, b2) => {
            const dayA = parseInt(a2.day);
            const dayB = parseInt(b2.day);
            return dayB - dayA;
          });
          return month2;
        }));
        if (monthFlows[0]) {
          firstMonth.value = [monthFlows[0].month];
        }
      });
      const $refs = vue.getCurrentInstance().proxy.$refs;
      const handleDelete = async (detail, monthItem, dayList, index1) => {
        try {
          flowListRefs.value.forEach((ref) => {
            if (ref && ref.closeAll) {
              ref.closeAll();
            }
          });
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
          if (account_id.value) {
            const currentAssets = yuanToFenNumber(totalAssets.value);
            const deletedMoney = yuanToFenNumber(money);
            totalAssets.value = fenToYuanString(currentAssets - deletedMoney);
          }
          if (dayList.dayFlowList.length === 0) {
            const dayIndex = monthItem.flow.findIndex((f2) => f2.day === dayList.day);
            if (dayIndex !== -1) {
              monthItem.flow.splice(dayIndex, 1);
            }
          }
        } catch (e2) {
          formatAppLog("log", "at pages/settle-account/flow.vue:264", e2);
          uni.showToast({
            title: "删除失败:" + e2,
            icon: "none"
          });
        }
      };
      const __returned__ = { dbService: dbService2, flowListRefs, addFlowListRef, handleSwipeOpen, handleRecordClick, handleClick, monthFlows, firstMonth, totalAssets, account_id, month, category, $refs, handleDelete, reactive: vue.reactive, ref: vue.ref, onBeforeUpdate: vue.onBeforeUpdate, getCurrentInstance: vue.getCurrentInstance, get onLoad() {
        return onLoad;
      }, get onShow() {
        return onShow;
      }, get DBService() {
        return DBService;
      }, FlowList, get utils() {
        return utils;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_collapse_item = resolveEasycom(vue.resolveDynamicComponent("uni-collapse-item"), __easycom_2$2);
    const _component_uni_collapse = resolveEasycom(vue.resolveDynamicComponent("uni-collapse"), __easycom_3);
    const _component_wd_fab = resolveEasycom(vue.resolveDynamicComponent("wd-fab"), __easycom_2$4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $setup.account_id ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "total-money"
      }, [
        vue.createElementVNode(
          "text",
          null,
          vue.toDisplayString($setup.totalAssets),
          1
          /* TEXT */
        ),
        vue.createElementVNode("text", { class: "total-money-name" }, "净流入")
      ])) : vue.createCommentVNode("v-if", true),
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($setup.monthFlows, (item, index) => {
          return vue.openBlock(), vue.createElementBlock("view", null, [
            vue.createVNode(_component_uni_collapse, {
              class: "card",
              modelValue: $setup.firstMonth,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.firstMonth = $event)
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
                        vue.createElementVNode(
                          "view",
                          { class: "year" },
                          vue.toDisplayString(item.year),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "amount-section" }, [
                        vue.createElementVNode("view", { class: "income-total" }, [
                          vue.createElementVNode("view", { style: { "color": "#ccd3ef" } }, "净收入 "),
                          vue.createElementVNode(
                            "view",
                            { class: "money-font" },
                            vue.toDisplayString(item.netIncome),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "balance-font" }, [
                          vue.createElementVNode("text", { class: "income-color" }, "收入 "),
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(item.revenue),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("text", null, " | "),
                          vue.createElementVNode("text", { class: "outcome-color" }, "支出 "),
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(item.expense),
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
                            { class: "day" },
                            vue.toDisplayString(dayList.day),
                            1
                            /* TEXT */
                          ),
                          vue.createVNode($setup["FlowList"], {
                            ref_for: true,
                            ref: $setup.addFlowListRef,
                            "group-id": `${item.year}-${item.month}-${dayList.day}`,
                            flowList: dayList.dayFlowList,
                            onClick: $setup.handleRecordClick,
                            onDelete: ({ detail, index: index3 }) => $setup.handleDelete(detail, item, dayList, index3),
                            onSwipeOpen: $setup.handleSwipeOpen
                          }, null, 8, ["group-id", "flowList", "onDelete"])
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
  const PagesSettleAccountFlow = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/flow.vue"]]);
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
  const __default__$c = {
    name: "wd-input",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$m = /* @__PURE__ */ vue.defineComponent({
    ...__default__$c,
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
      const __returned__ = { props, emit, slots, translate, isPwdVisible, clearing, focused, focusing, inputValue, cell, form, placeholderValue, showClear, showWordCount, errorMessage, isRequired, rootClass, labelClass, inputPlaceholderClass, labelStyle, getInitValue, formatValue, togglePwdVisible, handleClear, handleBlur, handleFocus, handleInput, handleKeyboardheightchange, handleConfirm, onClickSuffixIcon, onClickPrefixIcon, handleClick, isValueEqual, wdIcon: __easycom_0$4 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__scopeId", "data-v-4e0c9774"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-input/wd-input.vue"]]);
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
  const __default__$b = {
    name: "wd-overlay",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$l = /* @__PURE__ */ vue.defineComponent({
    ...__default__$b,
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
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
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
  const wdOverlay = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-6e0d1141"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-overlay/wd-overlay.vue"]]);
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
  const __default__$a = {
    name: "wd-popup",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$k = /* @__PURE__ */ vue.defineComponent({
    ...__default__$a,
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
      const __returned__ = { props, emit, transitionName, safeBottom, style, rootClass, handleClickModal, close, noop, wdIcon: __easycom_0$4, wdOverlay, wdTransition };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_2$1 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-25a8a9f7"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-popup/wd-popup.vue"]]);
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
  const __default__$9 = {
    name: "wd-loading",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$j = /* @__PURE__ */ vue.defineComponent({
    ...__default__$9,
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
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
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
  const wdLoading = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-f2b508ee"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-loading/wd-loading.vue"]]);
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
  const __default__$8 = {
    name: "wd-picker-view",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$i = /* @__PURE__ */ vue.defineComponent({
    ...__default__$8,
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
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
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
  const wdPickerView = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-c3bc94ff"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-picker-view/wd-picker-view.vue"]]);
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
  const __default__$7 = {
    name: "wd-picker",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$h = /* @__PURE__ */ vue.defineComponent({
    ...__default__$7,
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
      const __returned__ = { translate, props, emit, pickerViewWd, cell, innerLoading, popupShow, showValue, pickerValue, displayColumns, resetColumns, isPicking, hasConfirmed, isLoading, form, errorMessage, isRequired, proxy, handleShowValueUpdate, getSelects, open, close, showPopup, onCancel, onConfirm, handleConfirm, pickerViewChange, setShowValue, noop, onPickStart, onPickEnd, setLoading, showClear, handleClear, showArrow, wdIcon: __easycom_0$4, wdPopup: __easycom_2$1, wdPickerView };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-e228acd5"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-picker/wd-picker.vue"]]);
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
  const __default__$6 = {
    name: "wd-toast",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$g = /* @__PURE__ */ vue.defineComponent({
    ...__default__$6,
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
      }, toastOptionKey, toastOption, transitionStyle, rootClass, svgStyle, handleAfterEnter, handleAfterLeave, buildSvg, reset, mergeOptionsWithProps, wdIcon: __easycom_0$4, wdLoading, wdOverlay, wdTransition };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
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
  const wdToast = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-fce8c80a"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-toast/wd-toast.vue"]]);
  const __default__$5 = {
    name: "wd-form",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$f = /* @__PURE__ */ vue.defineComponent({
    ...__default__$5,
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
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-6504e7d0"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-form/wd-form.vue"]]);
  const __vite_glob_0_0 = "/static/icons/accumulation-fund.png";
  const __vite_glob_0_1 = "/static/icons/badge.png";
  const __vite_glob_0_2 = "/static/icons/balance.svg";
  const __vite_glob_0_3 = "/static/icons/bonus.svg";
  const __vite_glob_0_4 = "/static/icons/business-income.svg";
  const __vite_glob_0_5 = "/static/icons/button.png";
  const __vite_glob_0_6 = "/static/icons/calendar.png";
  const __vite_glob_0_7 = "/static/icons/card.png";
  const __vite_glob_0_8 = "/static/icons/collapse.png";
  const __vite_glob_0_9 = "/static/icons/color.png";
  const __vite_glob_0_10 = "/static/icons/combox.png";
  const __vite_glob_0_11 = "/static/icons/consumption.png";
  const __vite_glob_0_12 = "/static/icons/countdown.png";
  const __vite_glob_0_13 = "/static/icons/data-checkbox.png";
  const __vite_glob_0_14 = "/static/icons/data-picker.png";
  const __vite_glob_0_15 = "/static/icons/dateformat.png";
  const __vite_glob_0_16 = "/static/icons/datetime-picker.png";
  const __vite_glob_0_17 = "/static/icons/drawer.png";
  const __vite_glob_0_18 = "/static/icons/easyinput.png";
  const __vite_glob_0_19 = "/static/icons/fab.png";
  const __vite_glob_0_20 = "/static/icons/fav.png";
  const __vite_glob_0_21 = "/static/icons/file-picker.png";
  const __vite_glob_0_22 = "/static/icons/financial-management.png";
  const __vite_glob_0_23 = "/static/icons/font.png";
  const __vite_glob_0_24 = "/static/icons/forms.png";
  const __vite_glob_0_25 = "/static/icons/goods-nav.png";
  const __vite_glob_0_26 = "/static/icons/grid.png";
  const __vite_glob_0_27 = "/static/icons/group.png";
  const __vite_glob_0_28 = "/static/icons/icons.png";
  const __vite_glob_0_29 = "/static/icons/indexed-list.png";
  const __vite_glob_0_30 = "/static/icons/link.png";
  const __vite_glob_0_31 = "/static/icons/list.png";
  const __vite_glob_0_32 = "/static/icons/load-more.png";
  const __vite_glob_0_33 = "/static/icons/nav-bar.png";
  const __vite_glob_0_34 = "/static/icons/notice-bar.png";
  const __vite_glob_0_35 = "/static/icons/number-box.png";
  const __vite_glob_0_36 = "/static/icons/overtime-pay.svg";
  const __vite_glob_0_37 = "/static/icons/pagination.png";
  const __vite_glob_0_38 = "/static/icons/part-time-job.svg";
  const __vite_glob_0_39 = "/static/icons/popup.png";
  const __vite_glob_0_40 = "/static/icons/radius.png";
  const __vite_glob_0_41 = "/static/icons/rate.png";
  const __vite_glob_0_42 = "/static/icons/rent.png";
  const __vite_glob_0_43 = "/static/icons/row.png";
  const __vite_glob_0_44 = "/static/icons/salary.png";
  const __vite_glob_0_45 = "/static/icons/search-bar.png";
  const __vite_glob_0_46 = "/static/icons/section.png";
  const __vite_glob_0_47 = "/static/icons/segmented-control.png";
  const __vite_glob_0_48 = "/static/icons/space.png";
  const __vite_glob_0_49 = "/static/icons/steps.png";
  const __vite_glob_0_50 = "/static/icons/swipe-action.png";
  const __vite_glob_0_51 = "/static/icons/swiper-dot.png";
  const __vite_glob_0_52 = "/static/icons/tag.png";
  const __vite_glob_0_53 = "/static/icons/title.png";
  const __vite_glob_0_54 = "/static/icons/transition.png";
  const _sfc_main$e = {
    __name: "IconSelector",
    props: {
      modelValue: {
        type: String,
        default: ""
      },
      label: {
        type: String,
        default: "图标"
      },
      placeholder: {
        type: String,
        default: "请选择图标"
      },
      iconSize: {
        type: String,
        default: "36rpx"
      }
    },
    emits: ["update:modelValue"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const showPicker = vue.ref(false);
      const iconModules = /* @__PURE__ */ Object.assign({
        "/static/icons/accumulation-fund.png": __vite_glob_0_0,
        "/static/icons/badge.png": __vite_glob_0_1,
        "/static/icons/balance.svg": __vite_glob_0_2,
        "/static/icons/bonus.svg": __vite_glob_0_3,
        "/static/icons/business-income.svg": __vite_glob_0_4,
        "/static/icons/button.png": __vite_glob_0_5,
        "/static/icons/calendar.png": __vite_glob_0_6,
        "/static/icons/card.png": __vite_glob_0_7,
        "/static/icons/collapse.png": __vite_glob_0_8,
        "/static/icons/color.png": __vite_glob_0_9,
        "/static/icons/combox.png": __vite_glob_0_10,
        "/static/icons/consumption.png": __vite_glob_0_11,
        "/static/icons/countdown.png": __vite_glob_0_12,
        "/static/icons/data-checkbox.png": __vite_glob_0_13,
        "/static/icons/data-picker.png": __vite_glob_0_14,
        "/static/icons/dateformat.png": __vite_glob_0_15,
        "/static/icons/datetime-picker.png": __vite_glob_0_16,
        "/static/icons/drawer.png": __vite_glob_0_17,
        "/static/icons/easyinput.png": __vite_glob_0_18,
        "/static/icons/fab.png": __vite_glob_0_19,
        "/static/icons/fav.png": __vite_glob_0_20,
        "/static/icons/file-picker.png": __vite_glob_0_21,
        "/static/icons/financial-management.png": __vite_glob_0_22,
        "/static/icons/font.png": __vite_glob_0_23,
        "/static/icons/forms.png": __vite_glob_0_24,
        "/static/icons/goods-nav.png": __vite_glob_0_25,
        "/static/icons/grid.png": __vite_glob_0_26,
        "/static/icons/group.png": __vite_glob_0_27,
        "/static/icons/icons.png": __vite_glob_0_28,
        "/static/icons/indexed-list.png": __vite_glob_0_29,
        "/static/icons/link.png": __vite_glob_0_30,
        "/static/icons/list.png": __vite_glob_0_31,
        "/static/icons/load-more.png": __vite_glob_0_32,
        "/static/icons/nav-bar.png": __vite_glob_0_33,
        "/static/icons/notice-bar.png": __vite_glob_0_34,
        "/static/icons/number-box.png": __vite_glob_0_35,
        "/static/icons/overtime-pay.svg": __vite_glob_0_36,
        "/static/icons/pagination.png": __vite_glob_0_37,
        "/static/icons/part-time-job.svg": __vite_glob_0_38,
        "/static/icons/popup.png": __vite_glob_0_39,
        "/static/icons/radius.png": __vite_glob_0_40,
        "/static/icons/rate.png": __vite_glob_0_41,
        "/static/icons/rent.png": __vite_glob_0_42,
        "/static/icons/row.png": __vite_glob_0_43,
        "/static/icons/salary.png": __vite_glob_0_44,
        "/static/icons/search-bar.png": __vite_glob_0_45,
        "/static/icons/section.png": __vite_glob_0_46,
        "/static/icons/segmented-control.png": __vite_glob_0_47,
        "/static/icons/space.png": __vite_glob_0_48,
        "/static/icons/steps.png": __vite_glob_0_49,
        "/static/icons/swipe-action.png": __vite_glob_0_50,
        "/static/icons/swiper-dot.png": __vite_glob_0_51,
        "/static/icons/tag.png": __vite_glob_0_52,
        "/static/icons/title.png": __vite_glob_0_53,
        "/static/icons/transition.png": __vite_glob_0_54
      });
      const iconList = vue.ref(
        Object.keys(iconModules).map((path) => {
          return {
            path
          };
        })
      );
      const selectIcon = (iconPath) => {
        emit("update:modelValue", iconPath);
        showPicker.value = false;
      };
      const __returned__ = { props, emit, showPicker, iconModules, iconList, selectIcon, ref: vue.ref, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_cell = resolveEasycom(vue.resolveDynamicComponent("wd-cell"), __easycom_0$3);
    const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$4);
    const _component_wd_popup = resolveEasycom(vue.resolveDynamicComponent("wd-popup"), __easycom_2$1);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createVNode(_component_wd_cell, {
        "is-link": "",
        onClick: _cache[0] || (_cache[0] = ($event) => $setup.showPicker = true),
        center: ""
      }, {
        title: vue.withCtx(() => [
          vue.createElementVNode(
            "text",
            { style: { "font-size": "28rpx" } },
            vue.toDisplayString($props.label),
            1
            /* TEXT */
          )
        ]),
        default: vue.withCtx(() => [
          $props.modelValue ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            src: $props.modelValue,
            class: "selected-icon",
            mode: "aspectFit"
          }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock(
            "text",
            { key: 1 },
            vue.toDisplayString($props.placeholder),
            1
            /* TEXT */
          ))
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createVNode(_component_wd_popup, {
        modelValue: $setup.showPicker,
        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.showPicker = $event),
        position: "bottom",
        "close-on-click-modal": true
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "icon-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.iconList, (icon, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: vue.normalizeClass(["icon-item", { "icon-item-selected": $props.modelValue === icon.path }]),
                  onClick: ($event) => $setup.selectIcon(icon.path)
                }, [
                  vue.createVNode(_component_wd_icon, {
                    name: icon.path,
                    size: "46rpx"
                  }, null, 8, ["name"])
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["modelValue"])
    ]);
  }
  const IconSelector = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-7d1eb6ba"], ["__file", "E:/document/LifePartner/lifeparter-app/components/IconSelector.vue"]]);
  const _sfc_main$d = {
    __name: "account-create",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const columns = vue.ref(["储蓄卡", "信用卡", "股票账户", "基金账户", "虚拟账户", "现金", "负债账户"]);
      const accountId = vue.ref("");
      const oldBalance = vue.ref(0);
      const model = vue.reactive({
        accountName: "",
        balance: "",
        accountType: columns.value[0],
        icon: ""
      });
      onLoad((options) => {
        if (options.id) {
          accountId.value = options.id;
          model.accountName = decodeURIComponent(options.accountName || "");
          oldBalance.value = options.balance;
          model.balance = oldBalance.value;
          model.accountType = decodeURIComponent(options.accountType || columns.value[0]);
          model.icon = decodeURIComponent(options.icon || "");
        }
      });
      const rules = {
        accountName: [{
          required: true,
          pattern: /^.{1,20}$/,
          message: "请输入1-20位字符"
        }],
        balance: [{
          required: true,
          message: "请输入金额"
        }]
      };
      const onAmountBlur = (event) => {
        let cleanVal = event.value.replace(/[^\d.-]/g, "");
        const hasNegative = cleanVal.startsWith("-");
        cleanVal = cleanVal.replace(/-/g, "");
        if (hasNegative) {
          cleanVal = "-" + cleanVal;
        }
        const parts = cleanVal.replace("-", "").split(".");
        if (parts.length > 2) {
          cleanVal = (hasNegative ? "-" : "") + parts[0] + "." + parts[1];
        }
        if (cleanVal.includes(".")) {
          const negative = cleanVal.startsWith("-") ? "-" : "";
          const absolute = cleanVal.replace("-", "");
          const [intPart, decimalPart] = absolute.split(".");
          cleanVal = negative + intPart + "." + decimalPart.slice(0, 2);
        }
        model.balance = cleanVal;
      };
      const form = vue.ref();
      function handleSubmit() {
        if (!model.icon || model.icon.trim() === "") {
          uni.showToast({
            title: "请选择图标",
            icon: "none"
          });
          return;
        }
        form.value.validate().then(async ({
          valid
        }) => {
          if (valid) {
            const user_id = uni.getStorageSync("user_id");
            if (accountId.value) {
              await dbService2.updateTallyAccount(
                accountId.value,
                model.accountName,
                model.accountType,
                model.icon
              );
            } else {
              await dbService2.insertTallyAccount(
                model.accountName,
                0,
                1,
                user_id,
                model.accountType,
                model.icon
              );
              await dbService2.getLastInsertRowid().then((result) => {
                accountId.value = result[0].id;
              });
            }
            const offset = yuanToFenNumber(model.balance) - yuanToFenNumber(oldBalance.value);
            if (offset > 0) {
              dbService2.insertTallyBill(
                accountId.value,
                offset,
                (/* @__PURE__ */ new Date()).getTime(),
                1998,
                "",
                user_id
              );
            } else if (offset < 0) {
              dbService2.insertTallyBill(
                accountId.value,
                offset,
                (/* @__PURE__ */ new Date()).getTime(),
                1999,
                "",
                user_id
              );
            }
            uni.switchTab({
              url: `/pages/settle-account/account`
            });
          }
        }).catch((error) => {
          formatAppLog("log", "at pages/settle-account/account-create.vue:138", error, "error");
        });
      }
      const __returned__ = { dbService: dbService2, columns, accountId, oldBalance, model, rules, onAmountBlur, form, handleSubmit, get DBService() {
        return DBService;
      }, IconSelector, ref: vue.ref, reactive: vue.reactive, nextTick: vue.nextTick, get utils() {
        return utils;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_input = resolveEasycom(vue.resolveDynamicComponent("wd-input"), __easycom_0$1);
    const _component_wd_picker = resolveEasycom(vue.resolveDynamicComponent("wd-picker"), __easycom_1$1);
    const _component_wd_cell_group = resolveEasycom(vue.resolveDynamicComponent("wd-cell-group"), __easycom_2$3);
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
            }, null, 8, ["modelValue", "columns"]),
            vue.createVNode($setup["IconSelector"], {
              modelValue: $setup.model.icon,
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.model.icon = $event)
            }, null, 8, ["modelValue"])
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
  const PagesSettleAccountAccountCreate = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-fb877f2a"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/account-create.vue"]]);
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
  const __default__$4 = {
    name: "wd-datetime-picker-view",
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: "shared"
  };
  const _sfc_main$c = /* @__PURE__ */ vue.defineComponent({
    ...__default__$4,
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
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
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
  const wdDatetimePickerView = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-db34fecd"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-datetime-picker-view/wd-datetime-picker-view.vue"]]);
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
      __publicField(this, "utc");
      __publicField(this, "date");
      __publicField(this, "timeZone");
      __publicField(this, "timeZoneString");
      __publicField(this, "mYear");
      __publicField(this, "mMonth");
      __publicField(this, "mDay");
      __publicField(this, "mWeek");
      __publicField(this, "mHour");
      __publicField(this, "mMinute");
      __publicField(this, "mSecond");
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
  const __default__$3 = {
    name: "wd-datetime-picker",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
    ...__default__$3,
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
      const __returned__ = { props, emit, translate, datetimePickerView, datetimePickerView1, showValue, popupShow, showStart, region, showTabLabel, innerValue, endInnerValue, isPicking, hasConfirmed, isLoading, proxy, cell, form, errorMessage, isRequired, handleBoundaryValue, customColumnFormatter, getSelects, noop, getDefaultInnerValue, open, close, showPopup, tabChange, onChangeStart, onChangeEnd, onCancel, onConfirm, onPickStart, onPickEnd, handleConfirm, setTabLabel, setShowValue, defaultDisplayFormat: defaultDisplayFormat2, setLoading, wdPopup: __easycom_2$1, wdDatetimePickerView, get isArray() {
        return isArray;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$4);
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
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-2a8ca3bd"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-datetime-picker/wd-datetime-picker.vue"]]);
  const badgeProps = {
    ...baseProps,
    /**
     * 显示值
     */
    modelValue: numericProp,
    /** 当数值为 0 时，是否展示徽标 */
    showZero: makeBooleanProp(false),
    bgColor: String,
    /**
     * 最大值，超过最大值会显示 '{max}+'，要求 value 是 Number 类型
     */
    max: Number,
    /**
     * 是否为红色点状标注
     */
    isDot: Boolean,
    /**
     * 是否隐藏 badge
     */
    hidden: Boolean,
    /**
     * badge类型，可选值primary / success / warning / danger / info
     */
    type: makeStringProp(void 0),
    /**
     * 为正时，角标向下偏移对应的像素
     */
    top: numericProp,
    /**
     * 为正时，角标向左偏移对应的像素
     */
    right: numericProp
  };
  const __default__$2 = {
    name: "wd-badge",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    ...__default__$2,
    props: badgeProps,
    setup(__props, { expose: __expose }) {
      __expose();
      const props = __props;
      const content = vue.computed(() => {
        const { modelValue, max, isDot } = props;
        if (isDot)
          return "";
        let value = modelValue;
        if (value && max && isNumber(value) && !Number.isNaN(value) && !Number.isNaN(max)) {
          value = max < value ? `${max}+` : value;
        }
        return value;
      });
      const contentStyle = vue.computed(() => {
        const style = {};
        if (isDef(props.bgColor)) {
          style.backgroundColor = props.bgColor;
        }
        if (isDef(props.top)) {
          style.top = addUnit(props.top);
        }
        if (isDef(props.right)) {
          style.right = addUnit(props.right);
        }
        return objToStyle(style);
      });
      const shouldShowBadge = vue.computed(() => !props.hidden && (content.value || content.value === 0 && props.showZero || props.isDot));
      const __returned__ = { props, content, contentStyle, shouldShowBadge };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["wd-badge", _ctx.customClass]),
        style: vue.normalizeStyle(_ctx.customStyle)
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
        $setup.shouldShowBadge ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(["wd-badge__content", "is-fixed", _ctx.type ? "wd-badge__content--" + _ctx.type : "", _ctx.isDot ? "is-dot" : ""]),
            style: vue.normalizeStyle($setup.contentStyle)
          },
          vue.toDisplayString($setup.content),
          7
          /* TEXT, CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const wdBadge = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-6ea9b0eb"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-badge/wd-badge.vue"]]);
  const GRID_KEY = Symbol("wd-grid");
  const gridProps = {
    ...baseProps,
    /**
     * 是否开启格子点击反馈
     */
    clickable: makeBooleanProp(false),
    /**
     * 是否将格子固定为正方形
     */
    square: makeBooleanProp(false),
    /**
     * 列数
     */
    column: Number,
    /**
     * 是否显示边框
     */
    border: makeBooleanProp(false),
    /**
     * 背景颜色
     */
    bgColor: makeStringProp(""),
    /**
     * 格子之间的间距，默认单位为px
     */
    gutter: Number
  };
  const gridItemProps = {
    ...baseProps,
    /**
     * GridItem 下方文字样式
     */
    customText: makeStringProp(""),
    /**
     * GridItem 上方 icon 样式
     */
    customIcon: makeStringProp(""),
    /**
     * 图标名称，可选值见 wd-icon 组件
     */
    icon: makeStringProp(""),
    /**
     * 图标大小
     */
    iconSize: makeStringProp("26px"),
    /**
     * 文字
     */
    text: String,
    /**
     * 点击后跳转的链接地址
     */
    url: String,
    /**
     * 页面跳转方式, 参考微信小程序路由文档，可选值：navigateTo / switchTab / reLaunch
     */
    linkType: makeStringProp("navigateTo"),
    /**
     * 是否开启 GridItem 内容插槽
     */
    useSlot: makeBooleanProp(false),
    /**
     * 是否开启 GridItem icon 插槽
     */
    useIconSlot: makeBooleanProp(false),
    /**
     * 是否开启 GridItem text 内容插槽
     */
    useTextSlot: makeBooleanProp(false),
    /**
     * 是否显示图标右上角小红点
     */
    isDot: {
      type: Boolean,
      default: void 0
    },
    /**
     * 图标右上角显示的 badge 类型，可选值：primary / success / warning / danger / info
     */
    type: String,
    /**
     * 图标右上角 badge 显示值
     */
    value: numericProp,
    /**
     * 图标右上角 badge 最大值，超过最大值会显示 '{max}+'，要求 value 是 Number 类型
     */
    max: Number,
    /**
     * 徽标属性，透传给 Badge 组件
     */
    badgeProps: Object
  };
  const __default__$1 = {
    name: "wd-grid-item",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$1,
    props: gridItemProps,
    emits: ["itemclick"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const props = __props;
      const emit = __emit;
      const style = vue.ref("");
      const gutterContentStyle = vue.ref("");
      const itemClass = vue.ref("");
      const gutter = vue.ref(0);
      const square = vue.ref(false);
      const border = vue.ref(true);
      const { parent: grid } = useParent(GRID_KEY);
      const childCount = vue.computed(() => {
        if (isDef(grid) && isDef(grid.children)) {
          return grid.children.length;
        } else {
          return 0;
        }
      });
      const customBadgeProps = vue.computed(() => {
        const badgeProps2 = deepAssign(
          isDef(props.badgeProps) ? omitBy(props.badgeProps, isUndefined) : {},
          omitBy(
            {
              max: props.max,
              isDot: props.isDot,
              modelValue: props.value,
              type: props.type
            },
            isUndefined
          )
        );
        return badgeProps2;
      });
      vue.watch(
        () => childCount.value,
        () => {
          if (!grid)
            return;
          const width = grid.props.column ? 100 / grid.props.column + "%" : 100 / (childCount.value || 1) + "%";
          const gutterStyle = grid.props.gutter ? `padding:${grid.props.gutter}px ${grid.props.gutter}px 0 0; background-color: transparent;` : "";
          const squareStyle = grid.props.square ? `background-color:transparent; padding-bottom: 0; padding-top:${width}` : "";
          style.value = `width: ${width}; ${squareStyle || gutterStyle}`;
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.onMounted(() => {
        init();
      });
      function init() {
        if (!grid)
          return;
        const children = grid.children;
        const width = grid.props.column ? 100 / grid.props.column + "%" : 100 / children.length + "%";
        const gutterStyle = grid.props.gutter ? `padding:${grid.props.gutter}px ${grid.props.gutter}px 0 0; background-color: transparent;` : "";
        const squareStyle = grid.props.square ? `background-color:transparent; padding-bottom: 0; padding-top:${width}` : "";
        gutterContentStyle.value = grid.props.gutter && grid.props.square ? `right: ${grid.props.gutter}px; bottom:${grid.props.gutter}px;height: auto; background-color: ${grid.props.bgColor}` : `background-color: ${grid.props.bgColor}`;
        border.value = Boolean(grid.props.border);
        square.value = Boolean(grid.props.square);
        gutter.value = Number(grid.props.gutter);
        style.value = `width: ${width}; ${squareStyle || gutterStyle}`;
      }
      function click() {
        if (grid && !grid.props.clickable)
          return;
        const { url, linkType } = props;
        emit("itemclick");
        if (url) {
          switch (linkType) {
            case "navigateTo":
              uni.navigateTo({
                url
              });
              break;
            case "reLaunch":
              uni.reLaunch({
                url
              });
              break;
            case "redirectTo":
              uni.redirectTo({
                url
              });
              break;
            case "switchTab":
              uni.switchTab({
                url
              });
              break;
            default:
              formatAppLog("error", "at uni_modules/wot-design-uni/components/wd-grid-item/wd-grid-item.vue:144", `[wot-design] warning(wd-grid-item): linkType can not be ${linkType}`);
              break;
          }
        }
      }
      function setiIemClass(classes) {
        itemClass.value = classes;
      }
      __expose({
        setiIemClass,
        itemClass,
        init
      });
      const __returned__ = { props, emit, style, gutterContentStyle, itemClass, gutter, square, border, grid, childCount, customBadgeProps, init, click, setiIemClass, wdIcon: __easycom_0$4, wdBadge };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(`wd-grid-item ${$setup.border && !$setup.gutter ? $setup.itemClass : ""} ${_ctx.customClass}`),
        onClick: $setup.click,
        style: vue.normalizeStyle(`${$setup.style};${_ctx.customStyle}`)
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(`wd-grid-item__content ${$setup.square ? "is-square" : ""} ${$setup.border && $setup.gutter > 0 ? "is-round" : ""}`),
            style: vue.normalizeStyle($setup.gutterContentStyle)
          },
          [
            _ctx.useSlot ? vue.renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 1 },
              [
                vue.createElementVNode(
                  "view",
                  {
                    style: vue.normalizeStyle("width:" + _ctx.iconSize + "; height: " + _ctx.iconSize),
                    class: "wd-grid-item__wrapper"
                  },
                  [
                    vue.createVNode(
                      $setup["wdBadge"],
                      vue.mergeProps({ "custom-class": "badge" }, $setup.customBadgeProps),
                      {
                        default: vue.withCtx(() => [
                          _ctx.useIconSlot ? vue.renderSlot(_ctx.$slots, "icon", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createBlock($setup["wdIcon"], {
                            key: 1,
                            name: _ctx.icon,
                            size: _ctx.iconSize,
                            "custom-class": _ctx.customIcon
                          }, null, 8, ["name", "size", "custom-class"]))
                        ]),
                        _: 3
                        /* FORWARDED */
                      },
                      16
                      /* FULL_PROPS */
                    )
                  ],
                  4
                  /* STYLE */
                ),
                _ctx.useTextSlot ? vue.renderSlot(_ctx.$slots, "text", { key: 0 }, void 0, true) : (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 1,
                    class: "wd-grid-item__text custom-text"
                  },
                  vue.toDisplayString(_ctx.text),
                  1
                  /* TEXT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ],
          6
          /* CLASS, STYLE */
        )
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-8ad0f7d6"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-grid-item/wd-grid-item.vue"]]);
  const __default__ = {
    name: "wd-grid",
    options: {
      virtualHost: true,
      addGlobalClass: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    ...__default__,
    props: gridProps,
    setup(__props, { expose: __expose }) {
      __expose();
      const nextTick2 = () => new Promise((resolve) => setTimeout(resolve, 20));
      const props = __props;
      const { linkChildren, children } = useChildren(GRID_KEY);
      linkChildren({ props });
      vue.watch(
        () => props.column,
        (val, oldVal) => {
          if (val === oldVal)
            return;
          if (!val || val <= 0) {
            formatAppLog(
              "error",
              "at uni_modules/wot-design-uni/components/wd-grid/wd-grid.vue:37",
              "The number of columns attribute value is invalid. The attribute must be greater than 0 and it is not recommended to use a larger value attribute."
            );
          }
          oldVal && init();
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => props.border,
        (val) => {
          val && Promise.resolve().then(nextTick2).then(() => {
            init();
          });
        },
        {
          deep: true,
          immediate: true
        }
      );
      vue.watch(
        () => children,
        () => {
          handleChildrenChange();
        },
        {
          deep: true
        }
      );
      const rootStyle = vue.computed(() => {
        return `${props.gutter ? "padding-left:" + props.gutter + "px;padding-bottom:" + props.gutter + "px;" : ""}${props.customStyle}`;
      });
      const handleChildrenChange = debounce(() => {
        init();
      }, 50);
      function init() {
        if (!children)
          return;
        children.forEach((item, index) => {
          if (props.border) {
            const { column } = props;
            if (column) {
              const isRightItem = children.length - 1 === index || (index + 1) % column === 0;
              const isFirstLine = index + 1 <= column;
              isFirstLine && item.$.exposed.setiIemClass("is-first");
              isRightItem && item.$.exposed.setiIemClass("is-right");
              !isFirstLine && item.$.exposed.setiIemClass("is-border");
            } else {
              item.$.exposed.setiIemClass("is-first");
            }
            children.length - 1 === index && item.$.exposed.setiIemClass(item.$.exposed.itemClass.value + " is-last");
          }
          item.$.exposed.init();
        });
      }
      const __returned__ = { nextTick: nextTick2, props, linkChildren, children, rootStyle, handleChildrenChange, init };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(`wd-grid ${_ctx.customClass}`),
        style: vue.normalizeStyle($setup.rootStyle)
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-6fdada2e"], ["__file", "E:/document/LifePartner/lifeparter-app/uni_modules/wot-design-uni/components/wd-grid/wd-grid.vue"]]);
  const _sfc_main$7 = {
    __name: "CategorySelector",
    props: /* @__PURE__ */ vue.mergeModels({
      type: {
        type: String,
        default: "income"
        // 'income' 或 'expense'
      }
    }, {
      "showPopup": {},
      "showPopupModifiers": {}
    }),
    emits: /* @__PURE__ */ vue.mergeModels(["select"], ["update:showPopup"]),
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const dbService2 = new DBService();
      const props = __props;
      const showPopup = vue.useModel(__props, "showPopup");
      const expenseDisplayList = vue.ref([]);
      const incomeDisplayList = vue.ref([]);
      const displayList = vue.computed(() => {
        return props.type === "income" ? incomeDisplayList.value : expenseDisplayList.value;
      });
      function selectCategory(firstLevel, secondLevel) {
        showPopup.value = false;
        emit("select", {
          id: secondLevel.id,
          name: firstLevel.name + " > " + secondLevel.name,
          icon: secondLevel.icon
        });
      }
      function goToCategory() {
        showPopup.value = false;
        uni.navigateTo({
          url: "/pages/category/category?type=" + props.type
        });
      }
      let categoryTreeCache = null;
      async function getCategoryTree() {
        categoryTreeCache = null;
        const data = await dbService2.queryTableName("tally_category");
        const map = {};
        const result = [];
        data.forEach((item) => map[item.id] = {
          ...item,
          children: []
        });
        data.forEach((item) => {
          if (item.parent_id === 0) {
            result.push(map[item.id]);
          } else {
            if (map[item.parent_id]) {
              map[item.parent_id].children.push(map[item.id]);
            }
          }
        });
        categoryTreeCache = result;
        return result;
      }
      async function loadCategoryData() {
        const tree = await getCategoryTree();
        const expenseRoot = tree.find((item) => item.name === "支出");
        expenseDisplayList.value = expenseRoot.children.map((sub) => ({
          id: sub.id,
          name: sub.name,
          iconGroup: sub.children.map((child) => ({
            id: child.id,
            name: child.name,
            icon: child.icon
          }))
        }));
        const incomeRoot = tree.find((item) => item.name === "收入");
        incomeDisplayList.value = incomeRoot.children.map((sub) => ({
          id: sub.id,
          name: sub.name,
          iconGroup: sub.children.map((child) => ({
            id: child.id,
            name: child.name,
            icon: child.icon
          }))
        }));
      }
      vue.onMounted(() => {
        loadCategoryData();
      });
      vue.watch(showPopup, (newVal) => {
        if (newVal) {
          loadCategoryData();
        }
      });
      const emit = __emit;
      const __returned__ = { dbService: dbService2, props, showPopup, expenseDisplayList, incomeDisplayList, displayList, selectCategory, goToCategory, get categoryTreeCache() {
        return categoryTreeCache;
      }, set categoryTreeCache(v2) {
        categoryTreeCache = v2;
      }, getCategoryTree, loadCategoryData, emit, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, watch: vue.watch, get DBService() {
        return DBService;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_grid_item = resolveEasycom(vue.resolveDynamicComponent("wd-grid-item"), __easycom_0);
    const _component_wd_grid = resolveEasycom(vue.resolveDynamicComponent("wd-grid"), __easycom_1);
    const _component_wd_popup = resolveEasycom(vue.resolveDynamicComponent("wd-popup"), __easycom_2$1);
    return vue.openBlock(), vue.createBlock(_component_wd_popup, {
      modelValue: $setup.showPopup,
      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.showPopup = $event),
      "custom-style": "height: 700rpx;",
      position: "bottom"
    }, {
      default: vue.withCtx(() => [
        vue.createElementVNode("view", { class: "popup-content" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.displayList, (firstLevel) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "categoryList",
                key: firstLevel.id
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "firstCategory" },
                  vue.toDisplayString(firstLevel.name),
                  1
                  /* TEXT */
                ),
                vue.createVNode(
                  _component_wd_grid,
                  { column: 5 },
                  {
                    default: vue.withCtx(() => [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(firstLevel.iconGroup, (secondLevel) => {
                          return vue.openBlock(), vue.createBlock(_component_wd_grid_item, {
                            key: secondLevel.id,
                            icon: secondLevel.icon,
                            text: secondLevel.name,
                            onClick: ($event) => $setup.selectCategory(firstLevel, secondLevel)
                          }, null, 8, ["icon", "text", "onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    _: 2
                    /* DYNAMIC */
                  },
                  1024
                  /* DYNAMIC_SLOTS */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createElementVNode("view", {
          class: "footer-btn",
          onClick: $setup.goToCategory
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "+"),
          vue.createElementVNode("text", { class: "btn-text" }, "管理分类")
        ])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["modelValue"]);
  }
  const CategorySelector = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-a6937ff6"], ["__file", "E:/document/LifePartner/lifeparter-app/components/CategorySelector.vue"]]);
  const _sfc_main$6 = /* @__PURE__ */ vue.defineComponent({
    __name: "flow-edit",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const tab = vue.ref(0);
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
          required: true,
          message: "请输入金额"
        }],
        category: [{
          required: true,
          message: "请选择分类"
        }],
        account: [{
          required: true,
          message: "请选择账户"
        }]
      };
      const showPopup = vue.ref(false);
      const categoryDisplay = vue.ref("");
      const categoryType = vue.ref("expense");
      function onCategorySelect(category) {
        model.category = category.id;
        categoryDisplay.value = category.name;
        showPopup.value = false;
      }
      const bill_id = vue.ref(0);
      const account_id = vue.ref(0);
      onLoad((options) => {
        bill_id.value = options.bill_id;
        account_id.value = options.account_id;
        categoryDisplay.value = options.category;
      });
      vue.onMounted(async () => {
        model.account = account_id.value;
        if (bill_id.value) {
          const bills = await dbService2.getTallyBillById(bill_id.value);
          const bill = bills[0];
          model.money = fenToYuanString(Math.abs(bill.money));
          model.billDate = bill.bill_date;
          model.category = bill.category_id;
          model.comment = bill.comment;
          categoryType.value = bill.money >= 0 ? "income" : "expense";
        }
        const user_id = authUtils.getCurrentUserId();
        const accountList = await dbService2.getTallyAccount(user_id);
        accountList.forEach((item) => {
          accountPicker.push({
            label: item.account_name,
            value: item.id
          });
        });
      });
      const form = vue.ref();
      function handleSubmit() {
        form.value.validate().then(async ({ valid, errors }) => {
          if (valid) {
            var categoryById = await dbService2.getTallyCategoryById(model.category);
            const user_id = authUtils.getCurrentUserId();
            if (bill_id.value) {
              dbService2.updateTallyBill(bill_id.value, model.account, yuanToFenNumber(model.money) * categoryById[0].directory, model.billDate, model.category, model.comment);
            } else {
              dbService2.insertTallyBill(model.account, yuanToFenNumber(model.money) * categoryById[0].directory, model.billDate, model.category, model.comment, user_id);
            }
            uni.navigateBack({
              delta: 1
            });
          }
        }).catch((error) => {
          formatAppLog("log", "at pages/settle-account/flow-edit.vue:112", error, "error");
        });
      }
      const __returned__ = { dbService: dbService2, tab, accountPicker, model, rules, showPopup, categoryDisplay, categoryType, onCategorySelect, bill_id, account_id, form, handleSubmit, CategorySelector };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_input = resolveEasycom(vue.resolveDynamicComponent("wd-input"), __easycom_0$1);
    const _component_wd_picker = resolveEasycom(vue.resolveDynamicComponent("wd-picker"), __easycom_1$1);
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
        vue.createVNode(_component_wd_input, {
          type: "text",
          label: "分类",
          modelValue: $setup.categoryDisplay,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.categoryDisplay = $event),
          readonly: "",
          onClick: _cache[2] || (_cache[2] = ($event) => $setup.showPopup = true)
        }, null, 8, ["modelValue"]),
        vue.createVNode(_component_wd_picker, {
          label: "账户",
          columns: $setup.accountPicker,
          modelValue: $setup.model.account,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.model.account = $event)
        }, null, 8, ["columns", "modelValue"]),
        vue.createVNode(_component_wd_datetime_picker, {
          modelValue: $setup.model.billDate,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.model.billDate = $event),
          label: "时间"
        }, null, 8, ["modelValue"]),
        vue.createVNode(_component_wd_input, {
          label: "备注",
          modelValue: $setup.model.comment,
          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.model.comment = $event),
          clearable: ""
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
        ]),
        vue.createVNode($setup["CategorySelector"], {
          showPopup: $setup.showPopup,
          "onUpdate:showPopup": _cache[6] || (_cache[6] = ($event) => $setup.showPopup = $event),
          type: $setup.categoryType,
          onSelect: $setup.onCategorySelect
        }, null, 8, ["showPopup", "type"])
      ]),
      _: 1
      /* STABLE */
    }, 8, ["model"]);
  }
  const PagesSettleAccountFlowEdit = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-ab517b9e"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/flow-edit.vue"]]);
  const _sfc_main$5 = {
    __name: "account-settings",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const userId = vue.ref("");
      const username = vue.ref("");
      const avatarUrl = vue.ref("/static/image/default-avatar.png");
      const nickname = vue.ref("");
      const email = vue.ref("");
      const oldPassword = vue.ref("");
      const newPassword = vue.ref("");
      const confirmPassword = vue.ref("");
      const avatarChanged = vue.ref(false);
      async function loadUserInfo() {
        const currentUserId = authUtils.getCurrentUserId();
        if (!currentUserId) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/user-center/user-center"
            });
          }, 1e3);
          return;
        }
        userId.value = currentUserId;
        try {
          const result = await dbService2.getUserById(currentUserId);
          if (result && result.length > 0) {
            const user = result[0];
            username.value = user.username;
            nickname.value = user.nickname;
            email.value = user.email;
            if (user.avatar) {
              avatarUrl.value = user.avatar;
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/user-center/account-settings.vue:101", "加载用户信息失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      }
      function chooseAvatar() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            if (res.tempFilePaths && res.tempFilePaths.length > 0) {
              avatarUrl.value = res.tempFilePaths[0];
              avatarChanged.value = true;
            }
          }
        });
      }
      function validateEmail(email2) {
        if (!email2)
          return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email2);
      }
      function saveAvatar() {
        return new Promise((resolve, reject) => {
          if (!avatarChanged.value) {
            resolve(avatarUrl.value);
            return;
          }
          const timestamp = Date.now();
          `_doc/avatar_${userId.value}_${timestamp}.jpg`;
          plus.io.resolveLocalFileSystemURL(avatarUrl.value, (entry) => {
            plus.io.resolveLocalFileSystemURL("_doc", (dirEntry) => {
              entry.copyTo(
                dirEntry,
                `avatar_${userId.value}_${timestamp}.jpg`,
                (newEntry) => {
                  resolve(newEntry.toLocalURL());
                },
                (error) => {
                  formatAppLog("error", "at pages/user-center/account-settings.vue:149", "保存头像失败:", error);
                  reject(error);
                }
              );
            });
          }, (error) => {
            formatAppLog("error", "at pages/user-center/account-settings.vue:155", "读取头像失败:", error);
            reject(error);
          });
        });
      }
      async function saveSettings() {
        if (email.value && !validateEmail(email.value)) {
          uni.showToast({
            title: "邮箱格式不正确",
            icon: "none"
          });
          return;
        }
        if (oldPassword.value || newPassword.value || confirmPassword.value) {
          if (!oldPassword.value) {
            uni.showToast({
              title: "请输入原密码",
              icon: "none"
            });
            return;
          }
          if (!newPassword.value) {
            uni.showToast({
              title: "请输入新密码",
              icon: "none"
            });
            return;
          }
          if (newPassword.value.length < 6) {
            uni.showToast({
              title: "新密码至少6位",
              icon: "none"
            });
            return;
          }
          if (newPassword.value !== confirmPassword.value) {
            uni.showToast({
              title: "两次密码不一致",
              icon: "none"
            });
            return;
          }
          try {
            const result = await dbService2.login(username.value, oldPassword.value);
            if (!result || result.length === 0) {
              uni.showToast({
                title: "原密码错误",
                icon: "none"
              });
              return;
            }
          } catch (error) {
            formatAppLog("error", "at pages/user-center/account-settings.vue:217", "验证密码失败:", error);
            uni.showToast({
              title: "验证失败",
              icon: "none"
            });
            return;
          }
        }
        try {
          let savedAvatarPath = avatarUrl.value;
          if (avatarChanged.value) {
            savedAvatarPath = await saveAvatar();
          }
          const updates = {
            nickname: nickname.value || "",
            email: email.value || "",
            avatar: savedAvatarPath
          };
          if (newPassword.value) {
            const salt = bcrypt.genSaltSync(10);
            const hash2 = bcrypt.hashSync(newPassword.value, salt);
            updates.password = hash2;
          }
          await dbService2.updateUser(userId.value, updates);
          uni.hideLoading();
          uni.showToast({
            title: "保存成功",
            icon: "success"
          });
          oldPassword.value = "";
          newPassword.value = "";
          confirmPassword.value = "";
          avatarChanged.value = false;
          setTimeout(() => {
            uni.navigateBack();
          }, 1e3);
        } catch (error) {
          formatAppLog("error", "at pages/user-center/account-settings.vue:268", "保存失败:", error);
          uni.hideLoading();
          uni.showToast({
            title: "保存失败",
            icon: "none"
          });
        }
      }
      onLoad(() => {
        loadUserInfo();
      });
      const __returned__ = { dbService: dbService2, userId, username, avatarUrl, nickname, email, oldPassword, newPassword, confirmPassword, avatarChanged, loadUserInfo, chooseAvatar, validateEmail, saveAvatar, saveSettings, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get DBService() {
        return DBService;
      }, get bcrypt() {
        return bcrypt;
      }, get authUtils() {
        return authUtils;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_cell = resolveEasycom(vue.resolveDynamicComponent("wd-cell"), __easycom_0$3);
    const _component_wd_input = resolveEasycom(vue.resolveDynamicComponent("wd-input"), __easycom_0$1);
    const _component_wd_cell_group = resolveEasycom(vue.resolveDynamicComponent("wd-cell-group"), __easycom_2$3);
    const _component_wd_button = resolveEasycom(vue.resolveDynamicComponent("wd-button"), __easycom_3$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "account-settings-container" }, [
      vue.createElementVNode("view", { class: "avatar-section" }, [
        vue.createElementVNode("image", {
          src: $setup.avatarUrl,
          class: "avatar-img",
          onClick: $setup.chooseAvatar,
          mode: "aspectFill"
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "avatar-tip" }, "点击更换头像")
      ]),
      vue.createElementVNode("view", { class: "section-title" }, "基本信息"),
      vue.createElementVNode("view", { class: "form-section" }, [
        vue.createVNode(_component_wd_cell_group, null, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_wd_cell, {
              title: "用户名",
              "title-width": "120rpx"
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  { class: "readonly-text" },
                  vue.toDisplayString($setup.username),
                  1
                  /* TEXT */
                )
              ]),
              _: 1
              /* STABLE */
            }),
            vue.createVNode(_component_wd_cell, {
              title: "昵称",
              "title-width": "120rpx",
              center: ""
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_wd_input, {
                  modelValue: $setup.nickname,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.nickname = $event),
                  placeholder: "请输入昵称",
                  clearable: "",
                  "show-word-limit": "",
                  maxlength: 20
                }, null, 8, ["modelValue"])
              ]),
              _: 1
              /* STABLE */
            }),
            vue.createVNode(_component_wd_cell, {
              title: "邮箱",
              "title-width": "120rpx",
              center: ""
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_wd_input, {
                  modelValue: $setup.email,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.email = $event),
                  placeholder: "请输入邮箱",
                  clearable: "",
                  type: "email"
                }, null, 8, ["modelValue"])
              ]),
              _: 1
              /* STABLE */
            })
          ]),
          _: 1
          /* STABLE */
        })
      ]),
      vue.createElementVNode("view", { class: "section-title" }, "安全设置"),
      vue.createElementVNode("view", { class: "form-section" }, [
        vue.createVNode(_component_wd_cell_group, null, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_wd_cell, {
              title: "原密码",
              "title-width": "120rpx",
              center: ""
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_wd_input, {
                  modelValue: $setup.oldPassword,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.oldPassword = $event),
                  placeholder: "请输入原密码",
                  type: "password",
                  clearable: ""
                }, null, 8, ["modelValue"])
              ]),
              _: 1
              /* STABLE */
            }),
            vue.createVNode(_component_wd_cell, {
              title: "新密码",
              "title-width": "120rpx",
              center: ""
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_wd_input, {
                  modelValue: $setup.newPassword,
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.newPassword = $event),
                  placeholder: "请输入新密码",
                  type: "password",
                  clearable: ""
                }, null, 8, ["modelValue"])
              ]),
              _: 1
              /* STABLE */
            }),
            vue.createVNode(_component_wd_cell, {
              title: "确认密码",
              "title-width": "120rpx",
              center: ""
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_component_wd_input, {
                  modelValue: $setup.confirmPassword,
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.confirmPassword = $event),
                  placeholder: "请再次输入新密码",
                  type: "password",
                  clearable: ""
                }, null, 8, ["modelValue"])
              ]),
              _: 1
              /* STABLE */
            })
          ]),
          _: 1
          /* STABLE */
        })
      ]),
      vue.createElementVNode("view", { class: "save-btn" }, [
        vue.createVNode(_component_wd_button, {
          type: "primary",
          onClick: $setup.saveSettings,
          block: ""
        }, {
          default: vue.withCtx(() => [
            vue.createTextVNode("保存设置")
          ]),
          _: 1
          /* STABLE */
        })
      ])
    ]);
  }
  const PagesUserCenterAccountSettings = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-ad1c1eb0"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/user-center/account-settings.vue"]]);
  const _sfc_main$4 = {
    __name: "registry",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const username = vue.ref("");
      const password = vue.ref("");
      const confirmPassword = vue.ref("");
      onLoad(() => {
        const user_id = uni.getStorageSync("user_id");
        if (user_id) {
          uni.switchTab({
            url: "/pages/user-center/user-center"
          });
        }
      });
      const handleRegister = async () => {
        if (!username.value.trim()) {
          return uni.showToast({
            title: "请输入用户名",
            icon: "none"
          });
        }
        if (username.value.length < 3) {
          return uni.showToast({
            title: "用户名至少3个字符",
            icon: "none"
          });
        }
        if (!password.value) {
          return uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
        }
        if (password.value.length < 3) {
          return uni.showToast({
            title: "密码至少3个字符",
            icon: "none"
          });
        }
        if (password.value !== confirmPassword.value) {
          return uni.showToast({
            title: "两次密码输入不一致",
            icon: "none"
          });
        }
        try {
          const exists = await dbService2.getUser(username.value);
          if (exists[0]) {
            return uni.showToast({
              title: "用户名已存在",
              icon: "none"
            });
          }
          await dbService2.insertUser(username.value, password.value);
          uni.showToast({
            title: "注册成功",
            icon: "success",
            duration: 700
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 700);
        } catch (err) {
          formatAppLog("error", "at pages/user-center/registry.vue:121", "注册失败:", err);
          uni.showToast({
            title: "注册失败，请稍后重试",
            icon: "none",
            duration: 2e3
          });
        }
      };
      function goLogin() {
        uni.navigateBack();
      }
      const __returned__ = { dbService: dbService2, username, password, confirmPassword, handleRegister, goLogin, ref: vue.ref, get onLoad() {
        return onLoad;
      }, get DBService() {
        return DBService;
      }, uniIcons: __easycom_1$4 };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createElementVNode("view", { class: "register-box" }, [
        vue.createElementVNode("view", { class: "register-header" }, [
          vue.createElementVNode("text", { class: "register-title" }, "创建账户"),
          vue.createElementVNode("text", { class: "register-subtitle" }, "开始记账吧")
        ]),
        vue.createElementVNode("view", { class: "register-form" }, [
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.createVNode($setup["uniIcons"], {
              type: "person",
              size: "20",
              color: "#999"
            }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "register-input",
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.username = $event),
                placeholder: "请输入用户名"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.username]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.createVNode($setup["uniIcons"], {
              type: "locked",
              size: "20",
              color: "#999"
            }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "register-input",
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.password = $event),
                placeholder: "请输入密码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.password]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-item" }, [
            vue.createVNode($setup["uniIcons"], {
              type: "locked",
              size: "20",
              color: "#999"
            }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "register-input",
                type: "password",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.confirmPassword = $event),
                placeholder: "请再次输入密码"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.confirmPassword]
            ])
          ]),
          vue.createElementVNode("button", {
            class: "register-btn",
            onClick: $setup.handleRegister
          }, "注册"),
          vue.createElementVNode("view", {
            class: "login-link",
            onClick: $setup.goLogin
          }, "已有账号？去登录")
        ])
      ])
    ]);
  }
  const PagesUserCenterRegistry = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "E:/document/LifePartner/lifeparter-app/pages/user-center/registry.vue"]]);
  const _sfc_main$3 = {
    __name: "flow-create",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const tabList = ["收入", "支出", "转账", "余额"];
      const currentTab = vue.ref(0);
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
          pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
          message: "请输入有效的金额"
        }],
        category: [{
          validator: (value) => value !== "",
          message: "请选择分类"
        }],
        account: [{
          validator: (value) => value !== "",
          message: "请选择账户"
        }]
      };
      const showPopup = vue.ref(false);
      const categoryDisplay = vue.ref("");
      const categoryType = vue.computed(() => currentTab.value === 0 ? "income" : "expense");
      function clickTab(index) {
        currentTab.value = index;
        model.money = "";
        model.category = "";
        model.comment = "";
        categoryDisplay.value = "";
      }
      function onCategorySelect(category) {
        model.category = category.id;
        categoryDisplay.value = category.name;
        showPopup.value = false;
      }
      onLoad(async (options) => {
        const user_id = authUtils.getCurrentUserId();
        const accountList = await dbService2.getTallyAccount(user_id);
        accountList.forEach((item) => {
          accountPicker.push({
            label: item.account_name,
            value: item.id
          });
        });
        model.account = options.account_id;
        balanceModel.account = options.account_id;
        balanceModel.oldBalance = options.balance;
        balanceModel.balance = options.balance;
      });
      const form = vue.ref();
      function handleSubmit() {
        form.value.validate().then(async ({
          valid,
          errors
        }) => {
          if (valid) {
            var categoryById = await dbService2.getTallyCategoryById(model.category);
            const user_id = authUtils.getCurrentUserId();
            dbService2.insertTallyBill(model.account, yuanToFenNumber(model.money) * categoryById[0].directory, model.billDate, model.category, model.comment, user_id);
            uni.navigateBack({
              delta: 1
            });
          }
        }).catch((error) => {
          formatAppLog("log", "at pages/settle-account/flow-create.vue:159", error, "error");
        });
      }
      const balanceModel = vue.reactive({
        oldBalance: "",
        // 原余额
        balance: "",
        account: "",
        comment: "",
        billDate: (/* @__PURE__ */ new Date()).getTime()
      });
      const balanceRules = {
        balance: [{
          pattern: /^-?[0-9]+(\.[0-9]{1,2})?$/,
          message: "请输入有效的金额"
        }],
        account: [{
          validator: (value) => value !== "",
          message: "请选择账户"
        }]
      };
      const balanceForm = vue.ref();
      function handleBalanceSubmit() {
        balanceForm.value.validate().then(async ({
          valid
        }) => {
          if (valid) {
            const user_id = authUtils.getCurrentUserId();
            const moneyFen = yuanToFenNumber(balanceModel.balance) - yuanToFenNumber(balanceModel.oldBalance);
            const isIncome = moneyFen >= 0;
            const categoryId = isIncome ? 1998 : 1999;
            dbService2.insertTallyBill(
              balanceModel.account,
              moneyFen,
              balanceModel.billDate,
              categoryId,
              balanceModel.comment,
              user_id
            );
            uni.navigateBack({
              delta: 1
            });
          }
        }).catch((error) => {
          formatAppLog("log", "at pages/settle-account/flow-create.vue:208", error, "error");
        });
      }
      const __returned__ = { dbService: dbService2, tabList, currentTab, accountPicker, model, rules, showPopup, categoryDisplay, categoryType, clickTab, onCategorySelect, form, handleSubmit, balanceModel, balanceRules, balanceForm, handleBalanceSubmit, ref: vue.ref, reactive: vue.reactive, computed: vue.computed, onMounted: vue.onMounted, get DBService() {
        return DBService;
      }, get authUtils() {
        return authUtils;
      }, CategorySelector };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_input = resolveEasycom(vue.resolveDynamicComponent("wd-input"), __easycom_0$1);
    const _component_wd_picker = resolveEasycom(vue.resolveDynamicComponent("wd-picker"), __easycom_1$1);
    const _component_wd_datetime_picker = resolveEasycom(vue.resolveDynamicComponent("wd-datetime-picker"), __easycom_2);
    const _component_wd_button = resolveEasycom(vue.resolveDynamicComponent("wd-button"), __easycom_3$1);
    const _component_wd_form = resolveEasycom(vue.resolveDynamicComponent("wd-form"), __easycom_4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "tab-bar" }, [
        (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.tabList, (tab, index) => {
            return vue.createElementVNode("view", {
              key: index,
              class: vue.normalizeClass(["tab-item", { active: $setup.currentTab === index }]),
              onClick: ($event) => $setup.clickTab(index)
            }, [
              vue.createTextVNode(
                vue.toDisplayString(tab) + " ",
                1
                /* TEXT */
              ),
              $setup.currentTab === index ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "tab-underline"
              })) : vue.createCommentVNode("v-if", true)
            ], 10, ["onClick"]);
          }),
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "tab-content" }, [
        $setup.currentTab === 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
          vue.createVNode(_component_wd_form, {
            ref: "form",
            model: $setup.model,
            rules: $setup.rules
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_wd_input, {
                label: "金额",
                prop: "money",
                modelValue: $setup.model.money,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.model.money = $event),
                placeholder: "0.00",
                type: "number"
              }, null, 8, ["modelValue"]),
              vue.createVNode(_component_wd_input, {
                type: "text",
                label: "分类",
                modelValue: $setup.categoryDisplay,
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.categoryDisplay = $event),
                prop: "category",
                readonly: "",
                onClick: _cache[2] || (_cache[2] = ($event) => $setup.showPopup = true)
              }, null, 8, ["modelValue"]),
              vue.createVNode(_component_wd_picker, {
                label: "账户",
                columns: $setup.accountPicker,
                modelValue: $setup.model.account,
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.model.account = $event),
                prop: "account"
              }, null, 8, ["columns", "modelValue"]),
              vue.createVNode(_component_wd_datetime_picker, {
                modelValue: $setup.model.billDate,
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.model.billDate = $event),
                label: "时间"
              }, null, 8, ["modelValue"]),
              vue.createVNode(_component_wd_input, {
                label: "备注",
                modelValue: $setup.model.comment,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.model.comment = $event),
                clearable: ""
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
          }, 8, ["model"])
        ])) : $setup.currentTab === 1 ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
          vue.createVNode(_component_wd_form, {
            ref: "form",
            model: $setup.model,
            rules: $setup.rules
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_wd_input, {
                label: "金额",
                prop: "money",
                modelValue: $setup.model.money,
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.model.money = $event),
                placeholder: "0.00",
                type: "number"
              }, null, 8, ["modelValue"]),
              vue.createVNode(_component_wd_input, {
                type: "text",
                label: "分类",
                modelValue: $setup.categoryDisplay,
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.categoryDisplay = $event),
                prop: "category",
                readonly: "",
                onClick: _cache[8] || (_cache[8] = ($event) => $setup.showPopup = true)
              }, null, 8, ["modelValue"]),
              vue.createVNode(_component_wd_picker, {
                label: "账户",
                columns: $setup.accountPicker,
                modelValue: $setup.model.account,
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.model.account = $event),
                prop: "account"
              }, null, 8, ["columns", "modelValue"]),
              vue.createVNode(_component_wd_datetime_picker, {
                modelValue: $setup.model.billDate,
                "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $setup.model.billDate = $event),
                label: "时间"
              }, null, 8, ["modelValue"]),
              vue.createVNode(_component_wd_input, {
                label: "备注",
                modelValue: $setup.model.comment,
                "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $setup.model.comment = $event),
                clearable: ""
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
          }, 8, ["model"])
        ])) : $setup.currentTab === 2 ? (vue.openBlock(), vue.createElementBlock("view", { key: 2 })) : $setup.currentTab === 3 ? (vue.openBlock(), vue.createElementBlock("view", { key: 3 }, [
          vue.createVNode(_component_wd_form, {
            ref: "balanceForm",
            model: $setup.balanceModel,
            rules: $setup.balanceRules
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_wd_input, {
                label: "余额",
                prop: "money",
                modelValue: $setup.balanceModel.balance,
                "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $setup.balanceModel.balance = $event),
                clearable: "",
                placeholder: "0.00",
                type: "number"
              }, null, 8, ["modelValue"]),
              vue.createVNode(_component_wd_picker, {
                label: "账户",
                columns: $setup.accountPicker,
                modelValue: $setup.balanceModel.account,
                "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => $setup.balanceModel.account = $event),
                prop: "account"
              }, null, 8, ["columns", "modelValue"]),
              vue.createVNode(_component_wd_datetime_picker, {
                modelValue: $setup.balanceModel.billDate,
                "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => $setup.balanceModel.billDate = $event),
                label: "时间"
              }, null, 8, ["modelValue"]),
              vue.createVNode(_component_wd_input, {
                label: "备注",
                modelValue: $setup.balanceModel.comment,
                "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => $setup.balanceModel.comment = $event),
                clearable: ""
              }, null, 8, ["modelValue"]),
              vue.createElementVNode("view", { class: "footer" }, [
                vue.createVNode(_component_wd_button, {
                  type: "primary",
                  size: "large",
                  onClick: $setup.handleBalanceSubmit,
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
          }, 8, ["model"])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createVNode($setup["CategorySelector"], {
        showPopup: $setup.showPopup,
        "onUpdate:showPopup": _cache[16] || (_cache[16] = ($event) => $setup.showPopup = $event),
        type: $setup.categoryType,
        onSelect: $setup.onCategorySelect
      }, null, 8, ["showPopup", "type"])
    ]);
  }
  const PagesSettleAccountFlowCreate = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-fe3d27f2"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/settle-account/flow-create.vue"]]);
  const _sfc_main$2 = {
    __name: "category",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const categoryType = vue.ref("expense");
      const displayList = vue.ref([]);
      onLoad((options) => {
        categoryType.value = options.type;
        uni.setNavigationBarTitle({
          title: categoryType.value === "income" ? "收入分类管理" : "支出分类管理"
        });
      });
      async function getCategoryTree() {
        const data = await dbService2.queryTableName("tally_category");
        const map = {};
        const result = [];
        data.forEach((item) => map[item.id] = {
          ...item,
          children: []
        });
        data.forEach((item) => {
          if (item.parent_id === 0) {
            result.push(map[item.id]);
          } else {
            if (map[item.parent_id]) {
              map[item.parent_id].children.push(map[item.id]);
            }
          }
        });
        return result;
      }
      async function loadCategoryData() {
        const tree = await getCategoryTree();
        const rootName = categoryType.value === "income" ? "收入" : "支出";
        const root = tree.find((item) => item.name === rootName);
        displayList.value = root.children.map((sub) => ({
          id: sub.id,
          name: sub.name,
          parentId: sub.parent_id,
          icon: sub.icon,
          iconGroup: sub.children.map((child) => ({
            id: child.id,
            name: child.name,
            icon: child.icon,
            parentId: child.parent_id
          }))
        }));
      }
      vue.onMounted(() => {
        loadCategoryData();
      });
      onShow(() => {
        loadCategoryData();
      });
      function editCategory(category) {
        const isFirstLevel = category.parent_id === 1 || category.parent_id === 2;
        const params = {
          id: category.id,
          name: encodeURIComponent(category.name),
          type: categoryType.value
        };
        if (isFirstLevel) {
          params.isFirstLevel = "true";
        }
        params.icon = encodeURIComponent(category.icon);
        params.parentId = category.parentId;
        uni.navigateTo({
          url: `/pages/category/category-create?${Object.keys(params).map((k) => `${k}=${params[k]}`).join("&")}`
        });
      }
      async function deleteCategory(category) {
        const hasChildren = category.parent_id === 1 || category.parent_id === 2;
        let content = '确定要删除 "' + category.name + '" 吗？';
        if (hasChildren) {
          content = `删除 "${category.name}" 将同时删除其下的 ${category.iconGroup.length} 个子分类，确定要删除吗？`;
        }
        uni.showModal({
          title: "确认删除",
          content,
          success: async (res) => {
            if (res.confirm) {
              try {
                if (hasChildren) {
                  await dbService2.deleteTallyCategoryWithChildren(category.id);
                } else {
                  await dbService2.deleteTallyCategory(category.id);
                }
                uni.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                await loadCategoryData();
              } catch (error) {
                uni.showToast({
                  title: "删除失败：" + error.message,
                  icon: "none"
                });
              }
            }
          }
        });
      }
      function addSecondCategory(firstLevel) {
        uni.navigateTo({
          url: `/pages/category/category-create?type=${categoryType.value}&firstLevelId=${firstLevel.id}&firstLevelName=${firstLevel.name}`
        });
      }
      function addFirstCategory() {
        uni.navigateTo({
          url: `/pages/category/category-create?type=${categoryType.value}&isFirstLevel=true`
        });
      }
      const __returned__ = { dbService: dbService2, categoryType, displayList, getCategoryTree, loadCategoryData, editCategory, deleteCategory, addSecondCategory, addFirstCategory, ref: vue.ref, onMounted: vue.onMounted, get DBService() {
        return DBService;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_wd_icon = resolveEasycom(vue.resolveDynamicComponent("wd-icon"), __easycom_0$4);
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_1$4);
    const _component_uni_collapse_item = resolveEasycom(vue.resolveDynamicComponent("uni-collapse-item"), __easycom_2$2);
    const _component_uni_collapse = resolveEasycom(vue.resolveDynamicComponent("uni-collapse"), __easycom_3);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "category-content" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.displayList, (firstLevel) => {
            return vue.openBlock(), vue.createBlock(
              _component_uni_collapse,
              {
                key: firstLevel.id
              },
              {
                default: vue.withCtx(() => [
                  vue.createVNode(_component_uni_collapse_item, {
                    title: firstLevel.name,
                    open: true
                  }, {
                    title: vue.withCtx(() => [
                      vue.createElementVNode("view", { class: "first-category-header" }, [
                        vue.createElementVNode("view", { class: "category-info" }, [
                          vue.createVNode(_component_wd_icon, {
                            name: firstLevel.icon,
                            size: "20px"
                          }, null, 8, ["name"]),
                          vue.createElementVNode(
                            "text",
                            { class: "first-category-name" },
                            vue.toDisplayString(firstLevel.name),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "category-actions" }, [
                          vue.createElementVNode("view", {
                            class: "action-btn",
                            onClick: vue.withModifiers(($event) => $setup.editCategory(firstLevel), ["stop"])
                          }, [
                            vue.createVNode(_component_uni_icons, {
                              type: "compose",
                              size: "20",
                              color: "#999"
                            })
                          ], 8, ["onClick"]),
                          vue.createElementVNode("view", {
                            class: "action-btn",
                            onClick: vue.withModifiers(($event) => $setup.deleteCategory(firstLevel), ["stop"])
                          }, [
                            vue.createVNode(_component_uni_icons, {
                              type: "trash",
                              size: "20",
                              color: "#999"
                            })
                          ], 8, ["onClick"])
                        ])
                      ])
                    ]),
                    default: vue.withCtx(() => [
                      vue.createElementVNode("view", { class: "second-category-list" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(firstLevel.iconGroup, (secondLevel) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: secondLevel.id,
                              class: "second-category-item"
                            }, [
                              vue.createElementVNode("view", { class: "category-info" }, [
                                vue.createVNode(_component_wd_icon, {
                                  name: secondLevel.icon,
                                  size: "20px"
                                }, null, 8, ["name"]),
                                vue.createElementVNode(
                                  "text",
                                  { class: "category-name" },
                                  vue.toDisplayString(secondLevel.name),
                                  1
                                  /* TEXT */
                                )
                              ]),
                              vue.createElementVNode("view", { class: "category-actions" }, [
                                vue.createElementVNode("view", {
                                  class: "action-btn",
                                  onClick: ($event) => $setup.editCategory(secondLevel)
                                }, [
                                  vue.createVNode(_component_uni_icons, {
                                    type: "compose",
                                    size: "20",
                                    color: "#999"
                                  })
                                ], 8, ["onClick"]),
                                vue.createElementVNode("view", {
                                  class: "action-btn",
                                  onClick: ($event) => $setup.deleteCategory(secondLevel)
                                }, [
                                  vue.createVNode(_component_uni_icons, {
                                    type: "trash",
                                    size: "20",
                                    color: "#999"
                                  })
                                ], 8, ["onClick"])
                              ])
                            ]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        )),
                        vue.createElementVNode("view", {
                          class: "add-second-btn",
                          onClick: ($event) => $setup.addSecondCategory(firstLevel)
                        }, [
                          vue.createElementVNode("text", { class: "add-icon" }, "+"),
                          vue.createElementVNode("text", { class: "add-text" }, "新建二级分类")
                        ], 8, ["onClick"])
                      ])
                    ]),
                    _: 2
                    /* DYNAMIC */
                  }, 1032, ["title"])
                ]),
                _: 2
                /* DYNAMIC */
              },
              1024
              /* DYNAMIC_SLOTS */
            );
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", {
        class: "footer-btn",
        onClick: $setup.addFirstCategory
      }, [
        vue.createElementVNode("text", { class: "btn-icon" }, "+"),
        vue.createElementVNode("text", { class: "btn-text" }, "新建一级分类")
      ])
    ]);
  }
  const PagesCategoryCategory = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-8145b772"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/category/category.vue"]]);
  const _sfc_main$1 = {
    __name: "category-create",
    setup(__props, { expose: __expose }) {
      __expose();
      const dbService2 = new DBService();
      const categoryType = vue.ref("expense");
      const firstLevelId = vue.ref(0);
      const isFirstLevel = vue.ref(false);
      const categoryName = vue.ref("");
      const selectedIcon = vue.ref("");
      const isEdit = vue.ref(false);
      const categoryId = vue.ref(0);
      onLoad((options) => {
        categoryType.value = options.type || "expense";
        isFirstLevel.value = options.isFirstLevel === "true";
        isEdit.value = !!options.id;
        if (isEdit.value) {
          categoryId.value = parseInt(options.id);
          categoryName.value = decodeURIComponent(options.name || "");
          selectedIcon.value = decodeURIComponent(options.icon || "");
          firstLevelId.value = parseInt(options.parentId);
          uni.setNavigationBarTitle({
            title: "编辑分类"
          });
        } else if (isFirstLevel.value) {
          firstLevelId.value = categoryType.value === "income" ? 1 : 2;
          uni.setNavigationBarTitle({
            title: `新建一级分类`
          });
        } else {
          firstLevelId.value = parseInt(options.firstLevelId);
          uni.setNavigationBarTitle({
            title: `新建二级分类`
          });
        }
      });
      async function handleSave() {
        if (!categoryName.value.trim()) {
          uni.showToast({
            title: "请输入分类名称",
            icon: "none"
          });
          return;
        }
        if (!selectedIcon.value) {
          uni.showToast({
            title: "请选择分类图标",
            icon: "none"
          });
          return;
        }
        try {
          const directory = categoryType.value === "income" ? 1 : -1;
          const icon = selectedIcon.value;
          if (isEdit.value) {
            await dbService2.updateTallyCategory(
              categoryId.value,
              categoryName.value,
              icon,
              firstLevelId.value,
              directory
            );
          } else {
            const user_id = authUtils.getCurrentUserId();
            await dbService2.insertTallyCategory(
              categoryName.value,
              icon,
              firstLevelId.value,
              directory,
              user_id
            );
          }
          uni.showToast({
            title: "保存成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        } catch (error) {
          uni.showToast({
            title: "保存失败：" + error.message,
            icon: "none"
          });
        }
      }
      const __returned__ = { dbService: dbService2, categoryType, firstLevelId, isFirstLevel, categoryName, selectedIcon, isEdit, categoryId, handleSave, ref: vue.ref, get DBService() {
        return DBService;
      }, IconSelector, get authUtils() {
        return authUtils;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "form-content" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("view", { class: "label" }, "分类名称"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.categoryName = $event),
              placeholder: "请输入分类名称",
              maxlength: "20"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.categoryName]
          ]),
          vue.createElementVNode(
            "text",
            { class: "char-count" },
            vue.toDisplayString($setup.categoryName.length),
            1
            /* TEXT */
          )
        ]),
        vue.createVNode($setup["IconSelector"], {
          modelValue: $setup.selectedIcon,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.selectedIcon = $event),
          label: "分类图标",
          placeholder: "请选择图标"
        }, null, 8, ["modelValue"])
      ]),
      vue.createElementVNode("view", {
        class: "footer-btn",
        onClick: $setup.handleSave
      }, [
        vue.createElementVNode("text", { class: "btn-text" }, "保存")
      ])
    ]);
  }
  const PagesCategoryCategoryCreate = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-d1dcade1"], ["__file", "E:/document/LifePartner/lifeparter-app/pages/category/category-create.vue"]]);
  __definePage("pages/settle-account/account", PagesSettleAccountAccount);
  __definePage("pages/user-center/login", PagesUserCenterLogin);
  __definePage("pages/user-center/user-center", PagesUserCenterUserCenter);
  __definePage("pages/post/postList", PagesPostPostList);
  __definePage("pages/post/postDetail", PagesPostPostDetail);
  __definePage("pages/reports/reports", PagesReportsReports);
  __definePage("pages/settle-account/flow", PagesSettleAccountFlow);
  __definePage("pages/settle-account/account-create", PagesSettleAccountAccountCreate);
  __definePage("pages/settle-account/flow-edit", PagesSettleAccountFlowEdit);
  __definePage("pages/user-center/account-settings", PagesUserCenterAccountSettings);
  __definePage("pages/user-center/registry", PagesUserCenterRegistry);
  __definePage("pages/settle-account/flow-create", PagesSettleAccountFlowCreate);
  __definePage("pages/category/category", PagesCategoryCategory);
  __definePage("pages/category/category-create", PagesCategoryCategoryCreate);
  const dbService = new DBService();
  const _sfc_main = {
    onLaunch: function() {
      dbService.initDB();
      this.checkLoginStatus();
    },
    onShow: function() {
      this.checkLoginStatus();
    },
    onHide: function() {
    },
    methods: {
      // 检查登录状态并设置tabBar
      checkLoginStatus() {
        uni.getStorageSync("user_id");
        const tabBarIndex = 2;
        uni.setTabBarItem({
          index: tabBarIndex,
          pagePath: "pages/user-center/user-center",
          text: "我的"
        });
      }
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
