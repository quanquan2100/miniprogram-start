#!/usr/bin/env node
/**
 * 使用教程 在项目目录中执行如下命令创建新页面
  *  npm run add -- --page=test/abc
 *  以 src/pages 为base目录 创建 test/abc文件夹,并在此文件夹中创建 index.[js|wxml|pcss|json|..] 等预设的页面模板文件
 */
const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const yargs = require('yargs');
const chalk = require('chalk');

(function () {
  // step:1 参数验证
  const argv = yargs.argv
  if (_.isEmpty(argv.page) && _.isEmpty(argv.comp)) {
    console.log(`添加出错: 请指定需要添加的页面/组件路径, 检查您的命令格式, 示例: 'npm run add -- --page=index1'`)
    return;
  }

  // step:2 计算源和目标路径
  const name = _.isEmpty(argv.page) ? '组件' : '页面';
  const type = _.isEmpty(argv.page) ? "component" : "page";
  const targetFile = _.isEmpty(argv.page) ? argv.comp : argv.page;
  const targetDir = path.resolve(__dirname, `../src/${type}s`); // 目标文件夹路径
  const templateDir = path.resolve(__dirname, `../template/${type}`); // 模板文件夹路径

  // step:2 验证源和目标路径
  if (!fs.existsSync(templateDir)) {
    console.log(chalk.red(`添加出错: 模板目录不存在, 请检查 template 目录正确 (${templateDir})`));
    return;
  }

  if (fs.existsSync(path.join(targetDir, targetFile, '/index.wxml'))) {
    console.log(chalk.red(`添加出错: ${targetFile} ${name}已存在, 请更换路径或删除无用的${name}`));
    return;
  }
  
  // step:3 拷贝
  try {
    fs.copySync(templateDir, path.join(targetDir, targetFile));
  } catch (err) {
    console.log(chalk.red(`添加出错: 拷贝期间出现错误 ${err}`))
    return;
  }

  console.log(chalk`${name} {bold ${targetFile}} 已成功添加, 请前往 {cyan.bold '${path.join(targetDir, targetFile)}' 进行后续开发}`)
}())
