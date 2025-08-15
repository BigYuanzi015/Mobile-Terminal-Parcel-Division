// router index 基础配置文件
import * as VueRouter from "vue-router";

const routes = [
  {
    path: "/",
    name: "index",
    redirect: (to) => {
      const type = localStorage.getItem("PageType");
      switch (type) {
        case "landManagement":
          return "/landManagement";
        case "cropManagement":
          return "/cropManagement";
        case "ploughingManagement":
          return "/ploughingManagement";
        default:
          return "/land";
      }
    },
    component: () => import("@/views/index/indexPage.vue"),
    children: [
      {
        path: "/land",
        name: "land",
        meta: {
          name: "地块展示",
        },
        component: () => import("@/views/land/landPage.vue"),
      },
      {
        path: "/landManagement",
        name: "landManagement",
        meta: {
          name: "土地管理",
        },
        component: () => import("@/views/land/landManagementPage.vue"),
      },
      {
        path: "/cropManagement",
        name: "cropManagement",
        meta: {
          name: "种植管理",
        },
        component: () => import("@/views/land/cropManagementPage.vue"),
      },
      {
        path: "/ploughingManagement",
        name: "ploughingManagement",
        meta: {
          name: "春耕管理",
        },
        component: () => import("@/views/land/ploughingManagementPageNew.vue"),
      },
    ],
  },
  {
    path: "/:catchAll(.*)",
    name: "404",
    component: () => import("@/views/error/NotFoundPage.vue"),
  },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: routes,
});

export default router;
