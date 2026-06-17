/**
 * geo.js — 地理空间工具函数
 *
 * 提供坐标转换、面积计算等纯函数，
 * 不依赖 Vue 响应式系统，可在任何 JS 环境中使用。
 */

import WKT from "terraformer-wkt-parser";
import L from "leaflet";

/**
 * 将 Leaflet LatLng 坐标数组转换为 WKT 格式的多边形字符串
 *
 * 用途：绘制地块完成后，将多边形边界导出为后端可存储的 WKT 格式
 *
 * @param {L.LatLng[]} coordinates - Leaflet 经纬度坐标数组
 *   每个元素格式: { lat: number, lng: number }
 * @returns {string} WKT 格式字符串，例如 "POLYGON((116.4 39.9, 116.5 39.9, ...))"
 *
 * @example
 *   const wkt = coordinatesToWKT(polygon.getLatLngs()[0]);
 *   // "POLYGON((116.4 39.92, 116.42 39.92, 116.42 39.94, 116.4 39.94, 116.4 39.92))"
 */
export function coordinatesToWKT(coordinates) {
  // WKT POLYGON 起始标记
  let wkt = "POLYGON((";

  // 拼接每个坐标点 "经度 纬度"
  coordinates.forEach((coord, index) => {
    wkt += coord.lng + " " + coord.lat;
    if (index < coordinates.length - 1) {
      wkt += ", ";
    }
  });

  // 闭合多边形：最后一个点连回第一个点
  wkt += ", " + coordinates[0].lng + " " + coordinates[0].lat;
  wkt += "))";

  return wkt;
}

/**
 * 将 GeoJSON geometry 对象转换为 WKT 字符串
 *
 * @param {Object} geometry - 标准 GeoJSON geometry 对象
 *   { type: "Polygon", coordinates: [...] }
 * @returns {string} WKT 格式字符串
 *
 * @example
 *   const wkt = geojsonToWKT({ type: "Polygon", coordinates: [[[116,39],...]] });
 */
export function geojsonToWKT(geometry) {
  // terraformer-wkt-parser 生成 "POLYGON (" 中间有空格，统一去掉
  const wkt = WKT.convert(geometry);
  return wkt.replace("POLYGON (", "POLYGON(");
}

/**
 * 计算多边形面积并格式化为可读字符串
 *
 * 使用 Leaflet.GeometryUtil.geodesicArea 进行球面面积计算（WGS84 椭球体）
 *
 * @param {L.LatLng[]} polygon - Leaflet 坐标数组
 * @returns {string} 格式化面积，小面积显示 m²，大面积显示 km²
 *
 * @example
 *   formatArea(polygon.getLatLngs()[0])
 *   // "1523㎡" 或 "1.52k㎡"
 */
export function formatArea(polygon) {
  // geodesicArea 返回平方米（基于 WGS84 椭球体的大地测量面积）
  const areaSquareMeters = L.GeometryUtil.geodesicArea(polygon);

  let formattedArea = areaSquareMeters.toFixed(0) + "㎡";

  // 超过 100 万平方米时切换为平方公里
  if (areaSquareMeters > 10e5) {
    formattedArea = (areaSquareMeters / 10e5).toFixed(2) + "k㎡";
  }

  return formattedArea;
}

// 重新导出 WKT 解析器，供其他地方直接 import { WKT } from '@/utils/geo'
export { WKT };
