import request from "@/utils/axios/index.js"; // 引入刚才封装好的axios实例

/**
 * 获取城市列表
 * @param {Object} params pid-指定的父级ID
 * @returns
 */
export function getCityList(params) {
  return request({
    url: "/query/region",
    method: "get",
    params: { ...params },
  });
}

/**
 * 获取用户token
 * @param {Object} params token
 * @returns
 */
export function getUser(params) {
  return request({
    url: "/product/CardServer/mine/getBaseInfo",
    method: "get",
    params: { ...params },
  });
}

export function uploadFiles(data) {
  return request({
    url: "/query/upload/list",
    method: "post",
    data: data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
