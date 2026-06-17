/**
 * Vue Router 路由配置
 *
 * 路由模式：Hash 模式（createWebHashHistory）
 *   使用 #/ 路径，兼容静态部署无需服务端配置
 *
 * 路由表：
 *   /               → HomePage.vue    (地图主页)
 *   /:pathMatch(.*)* → NotFoundPage   (404 兜底)
 *
 * 🛠 扩展路由：在此文件 routes 数组中添加新路由即可
 */

import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    // 懒加载：页面组件在首次访问时才加载，减小首屏体积
    component: () => import("@/views/HomePage.vue"),
  },
  {
    // 通配符：匹配所有未定义路径，必须放在最后
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundPage.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
