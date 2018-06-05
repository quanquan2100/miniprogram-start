import util from "./utils/util"
import Event from "./utils/event";
App({
  ...Event,
  /**
   * 重写 runevent 函数, 由于app 主程序跟页面的生命周期不同, 只需要监听即执行
   * @return {[type]} [description]
   */
  $runEvent: function(event) {
    this.$eventPool = this.$eventPool || [];
    this.$eventPool = this.$eventPool.filter(item => (item !== null))
    // 使用闭包以支持异步函数
    this.$eventPool.forEach((listen, index) => {
      if (listen.name !== event.name) {
        return;
      }
      (function(_this, listen, event, index) {
        listen.callback(event)

        if (listen.once) {
          _this.$eventPool[index] = null;
        }
      })(this, listen, event, index);
    })
  },
  globalData: {
    userInfo: null
  },
  onLaunch: function() {},
})
