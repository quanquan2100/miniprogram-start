import util from "./utils/util"
import hello from "./utils/event"

App({
  globalData: {},
  onLaunch: function(options) {
    // Do something initial when launch.
  },
  onShow: function(options) {
    // Do something when show.
  },
  onHide: function() {
    // Do something when hide.
  },
  onError: function(msg) {
    console.log(msg)
  },
  onPageNotFound: function(msg) {
    console.log(msg)
  }
});
