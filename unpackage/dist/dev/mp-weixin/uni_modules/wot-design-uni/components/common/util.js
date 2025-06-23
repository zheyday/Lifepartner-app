"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_wotDesignUni_components_common_AbortablePromise = require("./AbortablePromise.js");
function uuid() {
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}
function s4() {
  return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
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
const isDef = (value) => value !== void 0 && value !== null;
function getRect(selector, all, scope, useFields) {
  return new Promise((resolve, reject) => {
    let query = null;
    if (scope) {
      query = common_vendor.index.createSelectorQuery().in(scope);
    } else {
      query = common_vendor.index.createSelectorQuery();
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
  return word.replace(/-(\w)/g, (_, c) => c.toUpperCase());
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
function isPromise(value) {
  if (isObj(value) && isDef(value)) {
    return isFunction(value.then) && isFunction(value.catch);
  }
  return false;
}
function isBoolean(value) {
  return typeof value === "boolean";
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
const pause = (ms = 1e3 / 30) => {
  return new uni_modules_wotDesignUni_components_common_AbortablePromise.AbortablePromise((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve(true);
    }, ms);
  });
};
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
const getPropByPath = (obj, path) => {
  const keys = path.split(".");
  try {
    return keys.reduce((acc, key) => acc !== void 0 && acc !== null ? acc[key] : void 0, obj);
  } catch (error) {
    return void 0;
  }
};
function isImageUrl(url) {
  const imageRegex = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg|image)/i;
  return imageRegex.test(url);
}
exports.addUnit = addUnit;
exports.camelCase = camelCase;
exports.deepAssign = deepAssign;
exports.getPropByPath = getPropByPath;
exports.getRect = getRect;
exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isDef = isDef;
exports.isFunction = isFunction;
exports.isImageUrl = isImageUrl;
exports.isPromise = isPromise;
exports.isString = isString;
exports.objToStyle = objToStyle;
exports.pause = pause;
exports.uuid = uuid;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/wot-design-uni/components/common/util.js.map
