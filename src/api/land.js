import request from "@/utils/axios/index.js"; // 引入刚才封装好的axios实例

/**
 * 获取家庭定位数据
 * @param {Object} params - 查询参数  pageNum pageSize
 * @returns
 */
export function getFamilyLocation(params) {
  return request({
    url: "/wxapp/household",
    method: "get",
    params: {
      ...params,
    },
  });
}

/**
 * 获取高标准土地GeoJSON数据
 * @returns
 */
export function getHighLandJSON() {
  return request({
    url: "/query/land/high/farm/json",
    method: "get",
  });
}

/**
 * 获取指定区域下的所有耕地的信息geo-json格式
 * @param {Object} params - 查询参数  regionCode key
 * @returns
 */
export function getLandJSON(params) {
  return request({
    url: "/query/land/farm/json",
    method: "get",
    params: {
      ...params,
    },
  });
}

/**
 * 获取地块信息
 * @param {String} id - 地块Id
 * @returns
 */
export function getLandInfoById(id) {
  return request({
    url: "/info/land/get",
    method: "get",
    params: {
      landId: id,
    },
  });
}

/**
 * 新增地块
 * @param {Object} data - 新增地块数据
 * @returns
 */
export function addNewLand(data) {
  return request({
    url: "/info/land/new",
    method: "post",
    data: data,
  });
}

/**
 * 编辑地块
 * @param {Object} data - 编辑的内容
 * @returns
 */
export function editLand(data) {
  return request({
    url: "/info/land/modify",
    method: "put",
    data: data,
  });
}

/**
 * 删除地块信息
 * @param {String} landId - 地块Id
 * @returns
 */
export function delLand(landId) {
  return request({
    url: "/info/land/remove",
    method: "delete",
    params: { landId: landId },
  });
}

/**
 * 获取指定地块的土地租赁变更列表
 * @param {String} landId - 所属地块
 * @returns
 */
export function getCropLandById(landId) {
  return request({
    url: "/news/land/change",
    method: "get",
    params: { landId: landId },
  });
}
