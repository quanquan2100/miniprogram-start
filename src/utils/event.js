/**
 * 补充小程序缺失的页面反向/广播事件系统
 * todo: 考虑是否进行事件触发排重处理, 多次相同 name 事件缓存, 仅执行最后一次
 * 使用方式:
 * this.$on(name, callback)
 * this.$one(name, callback)
 * this.$off(eventId)
 * this.$emit(name, data)
 */

/**
 * 执行事件
 * @param  {object} event 事件对象
 * @return {[type]}       [description]
 */
exports.$runEvent = function(event) {
  this.$eventPool = this.$eventPool || [];
  this.$eventPool = this.$eventPool.filter(item => (item !== null));
  // 使用闭包以支持异步函数
  this.$eventPool.forEach((listen, index) => {
    if (listen.name !== event.name) {
      return;
    }
    if (listen.forceNow) {
      (function(_this, listen, event, index) {
        listen.callback(event)

        if (listen.once) {
          _this.$eventPool[index] = null;
        }
      })(this, listen, event, index);
    } else {
      (function(_this, listen, event, index) {
        _this.$eventCatch = _this.$eventCatch || [];

        // 事件执行非累加模式, 删除同名事件执行函数
        if (!listen.accumulate) {
          _this.$eventCatch = _this.$eventCatch.filter(item => item.listen.id !== listen.id)
        }
        _this.$eventCatch.push({
          name: event.name,
          listen,
          callback: listen.callback,
          params: event
        })
        if (listen.once) {
          _this.$eventPool[index] = null;
        }
      })(this, listen, event, index);
    }
  })
};

exports.$runCatchEvent = function() {
  // 当页面 onshow 时执行事件回调
  if (!Array.isArray(this.$eventCatch)) {
    return;
  }
  this.$eventCatch.forEach((item, index) => {
    (function(item, _this, index) {
      const listen = item.listen;
      item.callback(item.params)

      // 如果监听一次, 执行完删除监听
      if (listen.once) {
        _this.$eventPool[index] = null;
      }
    }(item, this, index))
  })
  this.$eventCatch = []
}

/**
 * 监听事件功能
 * @param  {string} evtName 事件名
 * @param  {function} callback 监听到事件的回调函数
 * @param  {boolean} now 是否立即反应
 * @return {string}          监听id
 */
exports.$on = function(evtName = "", callback = null, now = false, accumulate = false) {
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
    forceNow: now, // 立即执行, 立即执行回调函数, 无论 page 是否显示
    accumulate, // 累计监听, 多次事件执行多次
    once: false
  };

  // step:2 对象加入事件池
  this.$eventPool.push(listen)

  // step:3 返回监听id
  return key;
};

/**
 * 仅监听一次功能
 * @param  {string} evtName 事件名
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
    accumulate: false, // 仅一次时默认为不可累加
    once: true
  };

  // step:2 对象加入事件池
  this.$eventPool.push(listen)

  // step:3 返回监听id
  return key;
};

/**
 * 取消监听
 * @param  {symbol} listenId 事件监听id
 * @return {[type]}          [description]
 */
exports.$off = function(listenId = "") {
  // step:1 参数验证
  if (!listenId) {
    return;
  }

  this.$eventPool = this.$eventPool || [];
  this.$eventPool = this.$eventPool.filter(item => (item !== null && item.id !== listenId && item.name !== listenId))
};

/**
 * 触发事件功能
 * @param  {string} name 事件名
 * @param  {any} data 事件上带着的数据
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

  if (pages.length === 0) { // app 发出的事件, 发出时首页未加载
    return;
  }
  // 当前显示页面
  pages[pages.length - 1].$runEvent(event)
  pages[pages.length - 1].$runCatchEvent()

  // 倒序遍历页面栈
  for (let i = pages.length - 2; i >= 0; i--) {
    // 尝试执行每个页面的监听
    pages[i].$runEvent(event)
  }

  // 遍历完成后事件进入 app 主进程
  const app = getApp();
  app.$runEvent(event);
}
