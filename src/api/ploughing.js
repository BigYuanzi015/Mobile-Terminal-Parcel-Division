import request from "@/utils/axios/index.js"; // 引入刚才封装好的axios实例

/**
 * 获取种植作物列表
 * @param {Object} params - 查询参数  pageNum pageSize
 * @returns
 */
export function getSpringCropList(params) {
  return request({
    url: "/spring/crop/list",
    method: "get",
    params: {
      ...params,
    },
  });
}

/**
 * 获取春耕地块信息列表(不分页)
 * @param {Object} params - 查询参数  pageNum pageSize
 * @param {String} reginCode - 所属区域编码
 * @param {String} key - 模糊搜索关键字
 * @param {Number} cropId - 作物id
 * @returns
 */
export function getSpringPlowingList(params) {
  return request({
    url: "/spring/plowing/list",
    method: "get",
    params: {
      ...params,
    },
  });
}

/**
 * 获取春耕地空间信息
 * @param {Object} params - 查询参数  pageNum pageSize
 * @param {String} reginCode - 所属区域编码
 * @param {String} key - 模糊搜索关键字
 * @param {Number} cropId - 作物id
 * @returns
 */
export function getSpringCropJson(params) {
  return request({
    url: "/spring/plowing/json",
    method: "get",
    params: {
      ...params,
    },
  });
}

/**
 * 获取春耕地块信息列表
 * @param {String} reginCode - 所属区域编码
 * @param {String} key - 模糊搜索关键字
 * @param {Number} cropId - 作物id
 * @returns
 */
export function getSpringPlowingPage(params) {
  return request({
    url: "/spring/plowing/page",
    method: "get",
    params: {
      ...params,
    },
  });
}

/**
 * 新增春耕地块信息
 * @param {Number} surveyId - 唯一标识
 * @param {Number} regionId - 所属区域
 * @param {String} geom - 地理信息
 * @param {String} name - 责任人名称
 * @param {String} idCard - 身份证
 * @param {String} phone - 联系电话
 * @param {Number} cropId - 种植物id
 * @returns
 */
export function addSpringPlowingNew(data) {
  return request({
    url: "/spring/plowing/new",
    method: "post",
    data: data,
  });
}

/**
 * 修改春耕地块信息
 * @param {Number} surveyId - 唯一标识
 * @param {Number} regionId - 所属区域
 * @param {String} geom - 地理信息
 * @param {String} name - 责任人名称
 * @param {String} idCard - 身份证
 * @param {String} phone - 联系电话
 * @param {Number} cropId - 种植物id
 * @returns
 */
export function editSpringPlowingModify(data) {
  return request({
    url: "/spring/plowing/modify",
    method: "put",
    data: data,
  });
}

/**
 * 删除春耕地块信息
 * @param {Number} surveyId - 唯一标识
 * @returns
 */
export function delSpringPlowingRemove(id) {
  return request({
    url: "/spring/plowing/remove",
    method: "delete",
    params: {
      surveyId: id,
    },
  });
}
