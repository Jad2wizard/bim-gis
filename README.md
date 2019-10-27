## Usage

### development

1. npm install //安装依赖包
2. npm run build:dev //将前端代码打包为 bundle.js 和 lib.js 文件
3. npm start //启动 node 服务器(会同时启动热更新)
4. http://127.0.0.1:3001/

### production

1. npm install --production //安装 node 服务器的依赖包
2. npm run start:prod //启动 node 服务器

## 技术选型

### 前端

1. Javascript 框架 React@16 (react hooks)
2. 前端路由管理 react-router@3
3. 前端状态管理 redux && react-redux@7 && redux-saga
4. 静态代码检查 eslint && 格式规范 prettier (pre-commit hook 中会先通过 prettier 对不规范的代码进行修改，再执行 eslint 代码检查)
5. 三维模型可视化 threejs@0.109
6. GIS 开发 BaiduMap API
7. CSS 预处理 less
8. 前端构建工具 npm && webpack@4

### 后端

1. Nodejs 框架 Koa@2
2. 模版文件生成 nunjucks
3. 后端路由 koa-router
4. 会话管理 koa-session (目前没有使用数据库，当前在线的会话 id 都保存在请求的 Cookie 里面。同样的原因，已注册用户的数据保存在 server/controllers/session/userList.json 文件中)

## 开发流程

### 前端

-   前端代码位于 src/ 文件夹中，入口文件为 src/index.js。
-   运行 npm run build:dev 时会先将第三方依赖包打成 lib.js，然后将前端的开发代码打包成 bundle.js。
-   运行 npm run build.prod 时也会打包 lib.js 和 bundle.js，但该命令会压缩文件。一般用于部署前的打包
-   src/store/ 中定义了 redux 的 store 对象，前端的数据和大部分状态都存放在该对象中
-   前端路由定义在 src/index.js 中，每个路由对应一个 React 组件
-   src/Pages/ 中存放了各个模块对应的 React 组件。以 Manage 组件为例，
    -   该组件负责渲染左侧模型管理模块对应的页面。Manage 组件定义在 src/Pages/Manage/index.js 文件中，起样式文件则写在 index.less 文件中。
    -   src/Pages/Manage/ 目录下其它以大写字母开头的文件则是 Manage 组件的子组件。
    -   src/Pages/Manage/actions.js 文件中定义了跟模型管理相关的一些 redux action，主要描述了一些交互事件
    -   src/Pages/Manage/reducer.js 文件中定义了跟模型管理相关的一些数据，即存放在 redux store 对象中的模型数据。包括模型列表等等，对应于 state.manageState
    -   src/Pages/Manage/sagas.js 文件定义了模型管理相关的异步 action 的处理，比如请求获取模型列表，上传模型，删除模型，修改模型等 ajax 请求
-   src/Pages/Home 为左侧所有模块的父组件，主要包括左侧导航栏的渲染和 Header 的渲染等等
-   src/utils/ 中定义了一些工具函数和常量等等

### 后端

-   node 服务器的启动文件为 app.js，开发模式下的启动命令为 npm start，生产模式下(即服务器上)的启动命令为 **npm run start:prod**。注意这里和之前约定的启动命令有变化
-   node 框架为 Koa，启动时会先检查是否需要开启热更新，开发模型下会自动开启前端代码的热更新，即前端代码修改后不需要重新打包以及刷新页面就可以在页面上看到修改带来的变化
-   后端的代码位于 server/ 文件夹中
-   session 管理相关的代码在 server/controllers/session/ 中
    -   用户注册后的信息保存在 server/controllers/session/userList.json
    -   session 管理以中间件的方式插入 Koa.app
    -   登录后的用户 id 和此次登录的过期时间拼接后作为 sessionId 写入 cookie 中
    -   会话过期时间为 24 小时，在 server/controllers/session/config.js 中设置
-   模型处理相关的代码在 server/controllers/model.js 文件中。上传的模型存放在 res/data/models 中
    -   上传的每个模型都存放在 res/data/models/ 目录下，每个模型对应一个文件夹，文件夹以模型 id 命名
    -   模型的相关信息存在模型文件夹下的 metadata.json 文件中

### 具体开发流程

1. 开发人员先执行 npm run build:dev 打包好 lib.js 和 bundle.js
2. 执行 npm start 启动 node 服务器
3. 访问 http://127.0.0.1:3001/ 进入页面
4. 修改前端代码即 src/ 目录下的代码后，无需再次打包，网页端会自动更新。也可以自己手动刷新网页查看修改的变化
5. 如果修改 node 端的代码即 server/ 目录下的代码后，需要重新运行 npm start 来重启 node 服务器才能让修改生效
6. 如果需要部署到服务器上，需要先执行 npm run build:prod 打包好压缩后的 lib.js 和 bundle.js
    - 将本地的 res/js/ 目录替换服务器端的 res/js 目录
    - 如果更改来 server/ 目录中的代码，还需要用本地的 server/ 替换服务器端的 server/ 目录
