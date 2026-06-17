/**
 * 应用入口文件
 *
 * 启动流程：
 *   1. 加载全局样式（CSS Reset + Leaflet 控件定制）
 *   2. 注册 Vant 移动端 UI 组件库
 *   3. 注册 Vue Router 路由
 *   4. 挂载 Vue 应用到 #app
 *
 * 🛠 无需修改此文件，所有可配置项见 src/config.js
 */

import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

/** Vant 4 移动端 UI 组件库 — 按需引入或全量引入 */
import Vant from "vant";
import "vant/lib/index.css";

/** Vue Router — 路由配置见 src/router/index.js */
import router from "@/router";

const app = createApp(App);

// 注册插件（顺序无关紧要）
app.use(Vant);
app.use(router);

// 挂载到 #app（index.html 中的根 div）
app.mount("#app");
