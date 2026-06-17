/**
 * useMarker — 标记点聚合 Composable
 *
 * 基于 Leaflet.markercluster 提供高性能的标记点聚合展示，
 * 适用于在地图上展示大量离散位置点（如农户分布、设备位置等）。
 *
 * 核心功能：
 *   - addMarkers: 批量添加标记点，自动按缩放级别聚合/展开
 *   - clearMarkers: 清除所有标记
 *
 * 依赖：
 *   leaflet.markercluster 插件（在 package.json 中声明）
 *
 * 用法:
 *   const { addMarkers, clearMarkers } = useMarker(mapRef);
 *   addMarkers([
 *     { lat: 39.92, lng: 116.42, title: "点位A", desc: "描述" },
 *     { lat: 39.93, lng: 116.43, title: "点位B", desc: "描述" },
 *   ], { iconUrl: "/icons/my-icon.png" });
 */

import { shallowRef } from "vue";
import L from "leaflet";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

/**
 * @param {import('vue').Ref<L.Map|null>} mapRef — 地图实例的响应式引用
 */
export function useMarker(mapRef) {
  /** MarkerClusterGroup 聚合组实例（非响应式） */
  let markerClusterGroup = null;

  /**
   * 批量添加标记点到地图
   *
   * 会自动清除之前的聚合组后重建。
   *
   * @param {Array} markers — 标记点数据数组
   *   每个元素格式: { lat: number, lng: number, title?: string, desc?: string }
   * @param {Object} [options] — 可选配置
   * @param {string} [options.iconUrl] — 自定义图标 URL
   * @param {Object} [options.*] — 其他 MarkerClusterGroup 配置项
   */
  function addMarkers(markers, options = {}) {
    // 地图未就绪则跳过
    if (!mapRef.value) return;

    // 先清除旧的聚合组
    clearMarkers();

    // 创建新的聚合组
    markerClusterGroup = L.markerClusterGroup(options);

    markers.forEach((item) => {
      // 跳过无效坐标
      if (item.lat === undefined || item.lng === undefined) return;

      // 如果指定了图标 URL，创建自定义图标
      const icon = options.iconUrl
        ? L.icon({
            iconUrl: options.iconUrl,
            iconSize: [32, 37],
            popupAnchor: [0, -18],
          })
        : undefined;

      // 构建弹出框 HTML
      const popupContent = `
        <div style="min-width:100px;">
          ${item.title ? `<p style="margin:0 0 4px;font-weight:600;">${item.title}</p>` : ""}
          ${item.desc ? `<p style="margin:0;">${item.desc}</p>` : ""}
        </div>`;

      // 创建标记并绑定弹窗，添加到聚合组
      L.marker([item.lat, item.lng], { icon })
        .bindPopup(popupContent)
        .addTo(markerClusterGroup);
    });

    // 将聚合组添加到地图
    markerClusterGroup.addTo(mapRef.value);
  }

  /**
   * 清除地图上的所有聚合标记
   * 幂等操作：重复调用不会报错
   */
  function clearMarkers() {
    if (markerClusterGroup && mapRef.value) {
      mapRef.value.removeLayer(markerClusterGroup);
      markerClusterGroup = null;
    }
  }

  /**
   * 获取当前聚合组实例
   * 可用于手动操作聚合/展开等
   *
   * @returns {L.MarkerClusterGroup|null}
   */
  function getClusterGroup() {
    return markerClusterGroup;
  }

  return { addMarkers, clearMarkers, getClusterGroup };
}
