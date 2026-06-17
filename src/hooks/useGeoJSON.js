/**
 * useGeoJSON — GeoJSON 图层加载、分类筛选、渲染
 *
 * 职责：
 *   1. 从 URL 或直接对象加载 GeoJSON 数据
 *   2. 按 feature.properties.category 字段分组
 *   3. 为每个分类创建独立的 L.geoJSON 图层（配置驱动颜色）
 *   4. 提供 filterByCategory 实现按分类显隐图层
 *
 * 数据格式要求：
 *   GeoJSON FeatureCollection，每个 feature.properties.category
 *   对应 config.categories 中的 key 值
 *
 * 用法:
 *   const { loadFromUrl, loadFromData, filterByCategory } = useGeoJSON(mapRef);
 *   await loadFromUrl("/api/parcels");               // 从接口加载
 *   loadFromData({ type: "FeatureCollection", ... }); // 直接传入对象
 *   filterByCategory("farmland");                     // 只显示 farmland 分类
 */

import { ref } from "vue";
import L from "leaflet";
import request from "@/utils/request";
import config from "@/config";

/**
 * @param {import('vue').Ref<L.Map|null>} mapRef — 地图实例的响应式引用
 */
export function useGeoJSON(mapRef) {
  /**
   * 图层列表 — 每个元素 { layer: L.GeoJSON, category: string }
   * 添加/删除元素时直接替换整个数组以触发响应式更新
   */
  const layerList = ref([]);

  /** 当前选中的分类（"all" 表示全部显示） */
  const currentCategory = ref("all");

  /** 原始 GeoJSON features（不含图层信息） */
  const allFeatures = ref([]);

  /** 是否正在加载数据 */
  const isLoading = ref(false);

  // 预先从 config 构建分类 → 颜色映射，避免渲染循环中重复查找
  const categoryColorMap = {};
  config.categories.forEach((category) => {
    if (category.key !== "all") categoryColorMap[category.key] = category.color;
  });

  // ================================================================
  //  数据加载（入口方法）
  // ================================================================

  /**
   * 从 URL 异步加载 GeoJSON 并渲染
   *
   * 自动处理字符串/对象两种响应格式。
   *
   * @param {string} url — GeoJSON 接口地址
   */
  async function loadFromUrl(url) {
    if (!mapRef.value) return;

    isLoading.value = true;
    try {
      const response = await request({ url, method: "get" });
      // 兼容后端返回 JSON 字符串或已解析的对象
      const data = typeof response === "string" ? JSON.parse(response) : response;
      renderGeoJSON(data);
    } catch (error) {
      console.error("GeoJSON 加载失败:", error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 直接渲染内存中的 GeoJSON 对象
   *
   * 适用于已在前端组装好数据、无需请求后端的场景。
   *
   * @param {Object} geojson — 标准 GeoJSON FeatureCollection 对象
   */
  function loadFromData(geojson) {
    if (mapRef.value) renderGeoJSON(geojson);
  }

  // ================================================================
  //  渲染与分类
  // ================================================================

  /**
   * 核心渲染函数
   *
   * 流程：
   *   1. 清除旧图层
   *   2. 按 category 字段分组 features
   *   3. 为每组创建 L.geoJSON 图层（颜色来自 config.categories）
   *   4. 绑定点击弹窗
   *
   * @param {Object} geojson — GeoJSON FeatureCollection
   */
  function renderGeoJSON(geojson) {
    // 先清除所有旧图层（防止叠加）
    clearLayers();

    const features = geojson.features || [];
    allFeatures.value = features;

    // 按 category 分组（未标注的归入 "default"）
    const groupedByCategory = {};
    features.forEach((feature) => {
      const category = feature.properties?.category || "default";
      (groupedByCategory[category] ??= []).push(feature);
    });

    // 为每个分类创建图层
    const newLayerList = [];
    Object.entries(groupedByCategory).forEach(
      ([categoryName, categoryFeatures]) => {
        // 取配置色，未配置则哈希生成稳定颜色
        const fillColor =
          categoryColorMap[categoryName] || hashStringToColor(categoryName);

        const layer = L.geoJSON(
          {
            type: "FeatureCollection",
            features: categoryFeatures,
          },
          {
            // 样式：config.geoStyle 为默认，fillColor/color 覆盖为分类色
            style: {
              fillColor,
              color: fillColor,
              ...config.geoStyle,
            },
            // 每个 feature 绑定属性弹窗
            onEachFeature: (feature, leafletLayer) =>
              leafletLayer.bindPopup(buildPopupContent(feature)),
          },
        ).addTo(mapRef.value);

        newLayerList.push({ layer, category: categoryName });
      },
    );

    // 整体替换，触发响应式
    layerList.value = newLayerList;
  }

  // ================================================================
  //  筛选
  // ================================================================

  /**
   * 按分类显示/隐藏图层
   *
   * "all" → 全部可见
   * 其他值 → 仅匹配 category 的图层可见
   *
   * @param {string} category — 分类 key，如 "farmland"、"orchard"
   */
  function filterByCategory(category) {
    currentCategory.value = category;

    const list = layerList.value;
    for (let index = 0; index < list.length; index++) {
      if (!mapRef.value) return;

      const { layer, category: layerCategory } = list[index];

      if (category === "all" || layerCategory === category) {
        // 需要显示
        if (!mapRef.value.hasLayer(layer)) mapRef.value.addLayer(layer);
      } else {
        // 需要隐藏
        if (mapRef.value.hasLayer(layer)) mapRef.value.removeLayer(layer);
      }
    }
  }

  /** 显示所有图层（快捷方法，等价于 filterByCategory("all")） */
  function showAll() {
    filterByCategory("all");
  }

  /** 清除所有 GeoJSON 图层并重置数据 */
  function clearLayers() {
    for (let index = 0; index < layerList.value.length; index++) {
      mapRef.value?.removeLayer(layerList.value[index].layer);
    }
    layerList.value = [];
    allFeatures.value = [];
  }

  return {
    layerList,
    currentCategory,
    allFeatures,
    isLoading,
    loadFromUrl,
    loadFromData,
    filterByCategory,
    showAll,
    clearLayers,
  };
}

// ================================================================
//  模块级工具函数
// ================================================================

/**
 * 根据 feature 属性构建 Leaflet 弹出框 HTML
 *
 * 自动过滤以 "_" 开头的内部字段，
 * 最多展示 6 个属性避免弹窗过长。
 *
 * @param {Object} feature — GeoJSON feature 对象
 * @returns {string} 弹出框 HTML 字符串
 */
function buildPopupContent(feature) {
  const properties = feature.properties || {};
  const rows = Object.entries(properties)
    .filter(([key]) => !key.startsWith("_"))
    .slice(0, 6)
    .map(
      ([key, value]) =>
        `<p style="margin:2px 0;font-size:13px;"><b>${key}:</b> ${value ?? "-"}</p>`,
    )
    .join("");

  return `<div style="min-width:100px;max-width:200px;">${rows}</div>`;
}

/**
 * 字符串 → HSL 颜色（确定性哈希）
 *
 * 相同的输入始终生成相同的颜色，适合为未配置颜色的分类
 * 自动分配一个视觉上可区分的颜色。
 *
 * @param {string} text — 类别名
 * @returns {string} CSS 颜色字符串，如 "hsl(42, 55%, 58%)"
 */
function hashStringToColor(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index++) {
    hash = text.charCodeAt(index) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 58%)`;
}
