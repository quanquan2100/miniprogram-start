#!/usr/bin/env node
/**
 * 使用教程 在项目目录中执行如下命令创建新页面
 * 
 *  ./scripts/add.js --page=pages/test/abc
 */

const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const argv = require('yargs').argv;
const glob = require("glob");
const project_root_dir = path.dirname(__dirname);

const tpl_base_dir = path.join(project_root_dir, 'template');
const page_tpl_dir = path.join(tpl_base_dir, 'page');
const component_tpl_dir = path.join(tpl_base_dir, 'component');

const src_base_dir = path.join(project_root_dir, 'src','pages');
const comp_base_dir = path.join(project_root_dir, 'src','components');


console.log("源码目录: ",src_base_dir);

function addPageFile(newPagePath) {
  // 之查找 template/page/下一级文件,不查找深层目录
  glob(page_tpl_dir + "/*.*", function(er, files) {
    if (er) {
      console.log("模板文件查找出错: ", er);
    } else {
      // console.log("页面模板集合: ", files);
      var noerror = true;
      _.forEach(files, function(src) {
        const dest = path.join(newPagePath, path.basename(src));
        fs.copy(src, dest, err => {
          if (err) { 
          	noerror = false;
          	return console.error(err); 
          }
        });
      });
      if(noerror){
      	console.log("新页面创建成功! 位于: ",newPagePath);
      }
    }
  });
}

function addPage() {
  const pageUrl = path.join(src_base_dir, argv.page);
  const checkFilePath = path.join(pageUrl, "index.wxml");
  console.log("checkPath: ", checkFilePath);
  fs.access(checkFilePath, fs.constants.F_OK | fs.constants.W_OK, (err) => {
    if (!err) {
      console.log(`${checkFilePath} 已存在,请重新指定新页面的路径`);
    } else {
      console.log(`页面创建中....`);
      fs.ensureDir(pageUrl, err => {
        if (err) {
          console.log('新页面所在路径创建错误: ', err);
        } else {
          addPageFile(pageUrl);
        }
      });
    }
  });
}

function addComponent() {

}

// ./script/add.js --page=
if (!_.isEmpty(argv.page)) {
  addPage();
} else if (argv.comp) {
  addComponent();
}
