const path = require('path');
const fs = require('fs-extra');
const nodeWatch = require('node-watch');
const http = require('http');

const isProduction = process.env.NODE_ENV === 'production';
const task = process.env.NODE_ENV === 'production' ? 'build' : 'dev';

require('shelljs/global');

console.log(isProduction ? "开始构建项目 >>>>>>>" : "进入开发模式 >>>>>>>")

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
        // 如果是构建模式, 处理所有资源
        return ['.js', '.pcss', '.json', '.wxml', '.md', '.jpg', '.jpeg', '.png', '.gif', '.svg'].indexOf(extname) < 0;
      } else {
        // 如果是开发模式, 仅处理 js, pcss 即可
        return ['.js', '.pcss', '.md'].indexOf(extname) < 0;
      }
    }
  });

  // 编译 js wxss img 文件
  exec(`gulp ${task} --gulpfile scripts/utils/build.js --dist ${config.dist} --src ${config.src} --color`);

  if (isProduction) {
    console.log("构建完毕, 尝试打开小程序")
    const req = http.request({
      port: 22295,
      path: '/open?projectpath=' + encodeURIComponent('/Users/kuaikan/Documents/GitHub/miniprogram-begintemplate/dist')
    })

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });
  } else {
    console.log("编译成功, 监听中...")
  }
}
