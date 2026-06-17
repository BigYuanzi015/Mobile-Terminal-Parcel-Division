/**
 * request.js — Axios HTTP 请求实例
 *
 * 提供预配置的 Axios 实例，支持：
 *   - 自动从 config 读取 baseURL 和 timeout
 *   - 可选的 Token 认证（请求拦截器）
 *   - 统一的错误处理（响应拦截器）
 *
 * 🛠 修改 API 地址：编辑 src/config.js → api.baseURL
 */

import axios from "axios";
import config from "@/config";

/**
 * 创建 Axios 实例
 *
 * 每次请求自动携带：
 *   - baseURL:   从 config.api.baseURL 读取
 *   - timeout:   从 config.api.timeout 读取（默认 3 分钟）
 *   - 请求头:    Content-Type: application/json
 */
const request = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// ============================================================
//  请求拦截器 — 自动附加 Token
// ============================================================

request.interceptors.request.use(
  (requestConfig) => {
    // 仅当 config.api.useToken 为 true 时才附加 Token
    if (config.api.useToken) {
      const token = localStorage.getItem(config.api.tokenKey);
      if (token) {
        requestConfig.headers["Authorization"] = token;
      }
    }
    return requestConfig;
  },
  (error) => Promise.reject(error),
);

// ============================================================
//  响应拦截器 — 统一提取 data + 错误日志
// ============================================================

request.interceptors.response.use(
  // 成功：直接返回 response.data，调用方无需解包
  (response) => response.data,
  // 失败：打印错误日志后继续抛出，由调用方自行处理
  (error) => {
    console.error("HTTP 请求失败:", error?.response?.status, error?.message);
    return Promise.reject(error);
  },
);

export default request;
