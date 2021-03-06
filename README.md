# 微信小程序开发初始模板
本模板适用于适用微信小程序原生开发, 辅助开发者开发小程序.
约一年前刚开发小程序时为了辅助开发制作的模板, 可惜后续进行其它业务线本模板没有后续改进.

## 开发期支持
* 支持监听文件执行同步
* 样式支持 scss 语法, js 支持 es6 转 es5
* 增量型同步, 仅对修改做处理

**使用方式**
```
cd [项目文件夹]
npm run dev
```
## 发布支持
* 支持 css js json 图像资源的编译压缩
* 支持构建完成自动打开小程序项目

**使用方式**
```
cd [项目文件夹]
npm run build
```
## 其他功能
* 支持根据模板添加页面/组件
    - 模板为 `template` 文件夹, `page` 文件夹表示页面模板, `component` 文件夹表示组件模板
    - 可根据需要自行编辑模板
* 支持小程序页面级事件系统
    - this 可以为当前 Page 也可以为 App
    - this.$on(name, callback)
    - this.$one(name, callback)
    - this.$off(eventId)
    - this.$emit(name, data)

**使用方式**
```shell
# 添加页面
cd [项目文件夹]
npm run add -- --page=index
# 添加组件
npm run add -- --comp=index
```
# 使用方式
1. 下载本项目
2. 进入项目文件夹, 执行 `npm install`
3. 如果有现有项目, 将现有项目放入 `src`
    * 对于项目的基本要求, 页面放入 `src/pages` 文件夹, 组件放入 `src/components`. 该规范与小程序默认保持一致
    * `.wxss` 文件需改为 `.pxss`. 否则不进行对应的样式压缩编译操作, 只执行同步
4. 如果新建项目, 将小程序 IDE 路径指向`dist` 文件夹. 创建基础页面模板后拷贝进 `src`

## 下一步
* ~~添加事件系统相关代码, 弥补小程序跨页面事件模块功能缺失~~
* 自动转化现有项目为所需项目要求. 比如, 自动转化 `.wxss` 为 `.pcss`
* 项目文档自动构建
