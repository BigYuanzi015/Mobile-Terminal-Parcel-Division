import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
/**
 * 引入AntV
 */
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

/**
 * 引入Pinia
 */
import pinia from "@/utils/store";

/**
 * 引入路由
 */
import router from "@/utils/router";

/**
 * 引入Vant UI
 */
import Vant from "vant";
import "vant/lib/index.css";

/**
 * 创建Vue实例
 */
const app = createApp(App);

/**
 * 挂载AntV
 */
app.use(Antd);

/**
 * 挂载Pinia
 */
app.use(pinia);

/**
 * 挂载路由
 */
app.use(router);

/**
 * 挂载Vant
 */
app.use(Vant);

/**
 * 挂载Vue实例
 */
app.mount("#app");
