import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

/**
 * Vite 配置文件
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [vue()],

  // 相对路径，适配移动端部署
  base: "./",

  // 路径别名
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // 开发服务器
  server: {
    port: 3000,
    // 如需移动端真机调试，改为本机局域网 IP
    // host: "192.168.1.100",
    // 如需代理 API，在此配置
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:8080",
    //     changeOrigin: true,
    //   },
    // },
  },
});
