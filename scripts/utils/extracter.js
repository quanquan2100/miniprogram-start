const path = require('path');
const fs = require('fs-extra');
const nodeWatch = require('node-watch');
const http = require('http');
require('shelljs/global');
const chalk = require('chalk');
const os = require('os');

const isProduction = process.env.NODE_ENV === 'production';
const regx = /project\.config\.json$/; // 项目配置文件正则
const regx_md = /\.md$/;


module.exports = function(config = {}) {
  exec('clear');
  console.log(isProduction ? "开始构建项目 >>>>>>>" : "进入开发模式 >>>>>>>");

  // 1. 开始构建时执行一次全同步
  if (fs.existsSync(path.join(config.dist, '/project.config.json'))) {
    fs.copySync(path.join(config.dist, '/project.config.json'), path.join(config.src, '/project.config.json'));
  }
  // 清空 dist 目录
  fs.emptyDirSync(config.dist);
  fs.copySync(path.join(config.src, '/project.config.json'), path.join(config.dist, '/project.config.json'));
  fs.copySync(config.src, config.dist, {
    filter(src = '') {
      const extname = path.extname(src);

      if (isProduction) {
        // 如果是构建模式, 处理除了 wxml 以外的资源所有资源
        return ['.js', '.pcss', '.json', '.md', '.jpg', '.jpeg', '.png', '.gif', '.svg'].indexOf(extname) < 0;
      } else {
        // 如果是开发模式, 仅处理 js, pcss 即可
        return ['.js', '.pcss', '.md'].indexOf(extname) < 0;
      }
    }
  });

  // 执行 gulp
  if (isProduction) {
    exec(`gulp build --gulpfile scripts/utils/build.js --dist ${config.dist} --src ${config.src} --color`);

  } else {
    exec(`gulp dev --gulpfile scripts/utils/build.js --dist ${config.dist} --src ${config.src} --color`);
  }

  // 2. 监听文件变动
  if (isProduction) {
    console.log("构建完毕, 尝试打开小程序");
    openWxIDE(config);
  } else {
    nodeWatch(config.src, {
      recursive: true,
      filter: (src) => {
        return (!regx.test(src) && !regx_md.test(src))
      }
    }, (evt, name) => {
      if (evt == 'update') {
        // on create or modify, run compile
        const extname = path.extname(name);
        const distName = getDistPath(name, config);
        switch (true) {
          case ['.js'].indexOf(extname) >= 0:
            exec(`gulp compile-js --gulpfile scripts/utils/gulp-tasks/compile-js.js --dist ${distName} --src ${name} --color`);
            break;
          case ['.pcss'].indexOf(extname) >= 0:
            exec(`gulp compile-css --gulpfile scripts/utils/gulp-tasks/compile-css.js --dist ${distName} --src ${name} --color`);
            break;
          default:
            // 执行拷贝
            console.log('copy', chalk.blue.bold(name), 'to', chalk.blue.bold(distName))
            fs.copySync(name, distName);
        }
      }

      if (evt == 'remove') {
        // on delete, run del
        const distName = getDistPath(name, config);
        console.log("delete " + chalk.red.bold(distName))
        fs.unlinkSync(distName);
      }

    });

    // 反向监听 project.config.json 反馈回项目
    nodeWatch(path.join(config.dist, '/project.config.json'), () => {
      fs.copySync(path.join(config.dist, '/project.config.json'), path.join(config.src, '/project.config.json'));
    });
  }
};


function getDistPath(src, config) {
  return src.replace(config.src, config.dist);
}

function openWxIDE(config) {
  let portFile = path.join(os.homedir(), 'Library/Application\ Support/微信web开发者工具/Default/.ide');
  if (process.platform === 'win32') {
    portFile = path.join(os.homedir(), 'AppData/Local/微信web开发者工具/User\ Data/Default/.ide');
  }
  try {
    const port = fs.readFileSync(portFile).toString();
    exec(`curl 127.0.0.1:${port}/open?projectpath=${encodeURI(config.dist)} -s`)
    // let opt = {
    //   protocol:'http:',
    //   hostname:'127.0.0.1',
    //   port:port,
    //   path:'/open?projectpath='+config.dist
    // };
    // console.log(opt);
    // http.request(opt,function(res){
    //   res.setEncoding('utf8');
    //   res.on('data', (chunk) => {
    //     console.log(`BODY: ${chunk}`);
    //   });
    //   res.on('end', () => {
    //     console.log('No more data in response.');
    //   });
    // });

  } catch (error) {
    console.log("微信IDE未打开", error);
  }

}