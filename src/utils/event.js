/**
 * 补充小程序缺失的页面间事件系统
 */

exports.$runEvent = function(event) {

  // 使用闭包以支持异步函数
  this.$eventPool.forEach(listen => {
    if (listen.name !== event.name) {
      return;
    }
    if (listen.forceNow) {
      (function(_this, listen, event) {
        console.log(arguments)
        listen.callback(event)

        if (listen.once) {
          listen = null;
        }
      })(this, listen, event);
    } else {
      (function(_this, listen, event) {
        _this.$eventCatch = _this.$eventCatch || [];
        _this.$eventCatch.push({
          callback: listen.callback,
          params: event
        })

        if (listen.once) {
          listen = null;
        }
      })(this, listen, event);
    }
  })
};

exports.$runCatchEvent = function () {
  if (!Array.isArray(this.$eventCatch)) {
    return;
  }
  this.$eventCatch.forEach(item => {
    (function (item) {
      item.callback(item.params)
    }(item))
  })
}

/**
 * 监听事件功能
 * @param  {function} callback 监听到事件的回调函数
 * @param  {boolean} now 是否立即反应
 * @return {string}          监听id
 */
exports.$on = function(evtName = "", callback = null, now = false) {
  if (!evtName || typeof callback !== "function") {
    return;
  }

  // step:1 创建监听对象
  this.$eventPool = this.$eventPool || [];
  const key = Symbol(evtName);
  const listen = {
    id: key,
    name: evtName,
    callback: callback.bind(this),
    forceNow: now,
    once: false
  };

  // step:2 对象加入事件池
  this.$eventPool.push(listen)

  // step:3 返回监听id
  return key;
};

/**
 * 仅监听一次功能
 * @param  {function} callback 监听到事件的回调函数
 * @param  {boolean} now 是否立即反应, 否则当页面 onshow 的时候反应
 * @return {string}          监听id
 */
exports.$one = function(evtName = "", callback = null, now = false) {
  if (!evtName || typeof callback !== "function") {
    return;
  }

  // step:1 创建监听对象
  this.$eventPool = this.$eventPool || [];
  const key = Symbol(evtName);
  const listen = {
    id: key,
    name: evtName,
    callback: callback.bind(this),
    forceNow: now,
    once: true
  };

  // step:2 对象加入事件池
  this.$eventPool.push(listen)

  // step:3 返回监听id
  return key;
};

/**
 * 取消监听
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
exports.$off = function(listenId = "") {
  // step:1 参数验证
  if (!listenId) {
    return;
  }

  this.$eventPool = this.$eventPool || [];
  this.$eventPool.filter(item => item.id !== listenId)
};

/**
 * 触发事件功能
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
exports.$emit = function(name = "", data = null) {
  // step:1 构建事件对象
  const event = _createEvent(name, data, this);

  // step:2 事件广播
  setTimeout(() => {
    _eventBus(event);
  })
};

/**
 * 创建事件对象
 * @param  {String} name  [description]
 * @param  {[type]} data  [description]
 * @param  {[type]} _this [description]
 * @return {[type]}       [description]
 */
function _createEvent(name = "", data = null, _this = null) {
  // 参数验证
  if (name === "") {
    throw "Event name is required";
  }
  // TODO: 判断 _this 为 page
  const event = {};
  event.createTime = Date.now();
  event.name = name;
  event.source = _this;
  event.data = data;
  return event;
}

/**
 * 事件传递
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function _eventBus(event) {
  const pages = getCurrentPages();

  // 倒序遍历页面栈
  for (let i = pages.length - 1; i >= 0; i--) {
    // 尝试执行每个页面的监听
    pages[i].$runEvent(event)
  }
}
