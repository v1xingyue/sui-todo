# sui-todo

一个 基于 next.js Tailwind daisyui  的 sui move 应用程序。

## 启动运行

1. git clone <https://github.com/v1xingyue/sui-todo.git>
2. cd sui-todo
3. yarn # 安装必须的前端包，注意自己本地的网络环境
4. 环境配置，部分全局变量在 .env.local 中,该变量会默认 注入到 yarn 启动的进程当中。
   其中两个参数需要注意:
   NEXT_PUBLIC_DAPP_PACKAGE 为合约发布的包地址
   NEXT_PUBLIC_DAPP_MODULE 为需要调用的模块名
   这个两个参数在 dapp 内部调用合约的时候需要添加到调用参数里边。
5. yarn dev
6. yarn build #编译完成的 next.js 应用
7. 合约代码在 move 中
