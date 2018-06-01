const path = require('path');
const fs = require('fs-extra');
const nodeWatch = require('node-watch');
const http = require('http');

const isProduction = process.env.NODE_ENV === 'production';
const task = process.env.NODE_ENV === 'production' ? 'build' : 'dev';

require('shelljs/global');

console.log("extracter", process.env.NODE_ENV)

module.exports = function(config = {}) {
  // 清空 dist 目录
  fs.emptyDirSync(config.dist);

  extracter(config);

  if (config.watch) {
    nodeWatch(config.src, { recursive: true }, () => extracter(config));
  }
};


function extracter(config = {}) {
  // 复制 src
  fs.copySync(config.src, config.dist, {
    filter(src = '') {
      const extname = path.extname(src);

      if (isProduction) {
        // 如果是构建模式, 需处理 js, pcss, img
        return ['.js', '.pcss', '.json', '.wxml', '.md', '.jpg', '.jpeg', '.png', '.gif', '.svg'].indexOf(extname) < 0;
      } else {
        // 如果是开发模式, 仅处理 js, pcss 即可
        return ['.js', '.pcss', '.md'].indexOf(extname) < 0;
      }
    }
  });

  // 编译 js wxss img 文件
  exec(`gulp ${task} --gulpfile scripts/utils/build.js --dist ${config.dist} --src ${config.src} --color`);
  console.log("执行完毕, 打开小程序")
  // http://127.0.0.1:22295/open?projectpath=%E9%A1%B9%E7%9B%AE%E5%85%A8%E8%B7%AF%E5%BE%84
  const req = http.request({
    port: 22295,
    path: '/open?projectpath=' + encodeURIComponent('/Users/kuaikan/Documents/GitHub/miniprogram-begintemplate/dist')
  })

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

}
