/**
 * useMap — Leaflet 地图初始化 Composable
 *
 * 职责：
 *   1. 创建 Leaflet 地图实例并挂载到指定 DOM 容器
 *   2. 加载瓦片底图
 *   3. 配置移动端手势交互参数
 *   4. 组件卸载时自动销毁地图
 *
 * 关键设置：
 *   zoomAnimation: false  — 关闭缩放动画，根除自定义图层坐标偏移
 *   tap: true             — 启用移动端 tap 事件
 *   touchZoom: true       — 双指缩放
 *   attributionControl: false — 隐藏右下角版权信息（省空间）
 *   zoomControl: false    — 隐藏左上角缩放按钮（手势替代）
 *
 * 用法:
 *   const { map, isReady, initMap } = useMap("map");
 *   // map 是 L.Map 实例的 ref，isReady 是布尔 ref
 */

import { ref, onUnmounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import config from "@/config";

/**
 * @param {string} containerId - 地图渲染的 DOM 元素 ID（默认 "map"）
 * @returns {{ map, isReady, initMap, destroyMap }}
 */
export function useMap(containerId = "map") {
  /** @type {import('vue').Ref<L.Map|null>} Leaflet 地图实例 */
  const mapInstance = ref(null);

  /** 地图是否已初始化完成 */
  const isReady = ref(false);

  /**
   * 初始化地图
   *
   * 幂等操作：重复调用不会创建第二个实例
   *
   * @returns {L.Map} Leaflet 地图实例
   */
  function initMap() {
    // 防止重复初始化
    if (mapInstance.value) return mapInstance.value;

    const { center, zoom, minZoom, maxZoom, tileUrl, tileOptions } = config.map;

    // 创建 Leaflet 地图，关闭缩放动画以根除自定义图层坐标偏移
    const map = L.map(containerId, {
      center,
      zoom,
      minZoom: minZoom ?? 3,
      maxZoom: maxZoom ?? 20,
      // 移动端交互
      zoomControl: false,        // 手势缩放替代按钮
      attributionControl: false, // 省空间
      zoomAnimation: false,      // ★ 关闭动画根除标注偏移
      fadeAnimation: false,      // ★ 关闭淡入淡出
      markerZoomAnimation: false,// ★ 关闭 marker 缩放动画
      tap: true,                 // 移动端 tap 事件
      tapTolerance: 15,          // tap 容差（像素）
      touchZoom: true,           // 双指缩放
      dragging: true,            // 单指拖拽
    });

    // 加载瓦片底图（URL 模板和选项从 config 读取）
    L.tileLayer(tileUrl, {
      maxZoom: maxZoom ?? 20,
      minZoom: minZoom ?? 3,
      ...tileOptions,
    }).addTo(map);

    // 设置容器的 touch-action 为 manipulation，进一步消除移动端延迟
    map.getContainer().style.touchAction = "manipulation";

    mapInstance.value = map;
    isReady.value = true;
    return map;
  }

  /**
   * 销毁地图实例，释放内存
   * 组件卸载时通过 onUnmounted 自动调用
   */
  function destroyMap() {
    if (mapInstance.value) {
      mapInstance.value.remove();
      mapInstance.value = null;
      isReady.value = false;
    }
  }

  // 组件卸载时自动清理
  onUnmounted(() => destroyMap());

  return { map: mapInstance, isReady, initMap, destroyMap };
}
