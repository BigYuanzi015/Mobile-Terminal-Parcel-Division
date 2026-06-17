<!--
  HomePage — 主页面

  组合地图底图、GeoJSON 图层、分类筛选、图例、多边形绘制、表单弹窗。
  所有可配置项从 src/config.js 读取，无需改动本文件。

  组件树：
    HomePage
    ├── MapContainer       — Leaflet 地图容器
    ├── MapLegend          — 左上角图例
    ├── BottomTabBar       — 底部分类筛选栏（绘制模式隐藏）
    ├── DrawToolbar        — 绘制模式工具栏（十字准星 + 加号 + 底部操作栏）
    ├── FormPopup          — 表单弹窗（字段由 config.formFields 驱动）
    └── FAB 按钮           — 右上角进入/取消绘制模式

  数据流：
    GeoJSON:  loadSampleData() → loadFromData() → renderGeoJSON()
    绘制:     DrawToolbar 事件 → useDraw 方法 → finishDraw() → 表单
-->
<template>
  <div class="home-page">
    <!-- ======== 地图容器 ======== -->
    <MapContainer ref="mapContainerRef" @ready="onMapReady" />

    <!-- ======== 左上角：图例 ======== -->
    <MapLegend
      :visible="config.features.showLegend && !isDrawing && legendItems.length > 0"
      :items="legendItems"
    />

    <!-- ======== 右上角：FAB 入口按钮 ======== -->
    <!-- 未绘制时：显示 + 号（进入绘制模式） -->
    <div
      v-if="config.features.enableDraw && !isDrawing"
      class="fab"
      @click="onStartDraw"
    >
      <van-icon name="add" size="24" color="#fff" />
    </div>

    <!-- 绘制中：显示 × 号（取消绘制，红色） -->
    <div
      v-if="isDrawing"
      class="fab"
      :style="{ background: config.dangerColor }"
      @click="onCancelDraw"
    >
      <van-icon name="cross" size="22" color="#fff" />
    </div>

    <!-- ======== 绘制工具栏（绘制模式时显示） ======== -->
    <DrawToolbar
      :visible="isDrawing"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :primary-color="config.primaryColor"
      :success-color="config.successColor"
      @add-marker="onAddMarker"
      @undo="onUndo"
      @redo="onRedo"
      @clear="onClearDraw"
      @finish="onFinishDraw"
    />

    <!-- ======== 底部分类筛选栏（非绘制模式时显示） ======== -->
    <BottomTabBar
      v-if="!isDrawing && categories.length > 0"
      v-model="selectedCategory"
      :items="categories"
      :active-color="config.primaryColor"
    />

    <!-- ======== 表单弹窗（绘制完成后弹出） ======== -->
    <FormPopup
      v-model="formVisible"
      :title="formTitle"
      :fields="config.formFields"
      :initial-data="formInitialData"
      :primary-color="config.primaryColor"
      @submit="onFormSubmit"
    >
      <!-- 自定义字段插槽 — 允许外部注入额外表单项 -->
      <template #extra-fields>
        <slot name="custom-form-field" :formData="formInitialData" />
      </template>
    </FormPopup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { showToast, showConfirmDialog } from "vant";
import config from "@/config";
import { useGeoJSON } from "@/hooks/useGeoJSON";
import { useDraw } from "@/hooks/useDraw";
import MapContainer from "@/components/MapContainer.vue";
import BottomTabBar from "@/components/BottomTabBar.vue";
import MapLegend from "@/components/MapLegend.vue";
import DrawToolbar from "@/components/DrawToolbar.vue";
import FormPopup from "@/components/FormPopup.vue";

// ================================================================
//  地图 & 图层
// ================================================================

/** MapContainer 组件的模板引用 */
const mapContainerRef = ref(null);

/** Leaflet 地图实例（从 MapContainer @ready 事件获取） */
const mapInstance = ref(null);

// GeoJSON 图层管理
const { filterByCategory, loadFromUrl, loadFromData } = useGeoJSON(mapInstance);

// 多边形绘制
const {
  isDrawing,
  geometry,
  canUndo,
  canRedo,
  startDraw,
  cancelDraw,
  addMarker,
  undo,
  redo,
  clearDraw,
  finishDraw,
} = useDraw(mapInstance);

// ================================================================
//  表单
// ================================================================

const formVisible = ref(false);
const formTitle = ref(config.form.createTitle);
const formInitialData = ref({});

// ================================================================
//  分类筛选
// ================================================================

const selectedCategory = ref("all");

/** 从 config.categories 转换为 BottomTabBar 所需的 items 格式 */
const categories = computed(() =>
  config.categories.map((category) => ({
    key: category.key,
    label: category.label,
    icon: category.icon ?? null,
  })),
);

/**
 * 图例项 — 优先用 config.legendItems 手动指定，
 * 留空则自动从 categories 生成（排除 "all"）
 */
const legendItems = computed(() =>
  config.legendItems.length > 0
    ? config.legendItems
    : config.categories
        .filter((category) => category.key !== "all" && category.color)
        .map((category) => ({
          label: category.label,
          color: category.color,
        })),
);

// 分类切换 → 触发图层筛选
watch(selectedCategory, (category) => filterByCategory(category));

// ================================================================
//  地图就绪 & 数据加载
// ================================================================

/**
 * 地图初始化完成后回调
 * @param {L.Map} map — Leaflet 地图实例
 */
function onMapReady(map) {
  mapInstance.value = map;
  loadSampleData();
}

/**
 * 加载 GeoJSON 数据
 *
 * 优先级：
 *   1. /public/sample.geojson（静态示例文件）
 *   2. config.api.geoDataEndpoint（后端 API 接口）
 */
async function loadSampleData() {
  // 尝试加载本地示例文件
  try {
    const response = await fetch("/sample.geojson");
    if (response.ok) {
      loadFromData(await response.json());
      return;
    }
  } catch {
    // 示例文件不存在，静默忽略
  }

  // 回退到 API 接口
  if (config.api.geoDataEndpoint) {
    loadFromUrl(config.api.geoDataEndpoint);
  }
}

// ================================================================
//  绘制事件处理
// ================================================================

/** 点击右上角 + 号 → 进入绘制模式 */
function onStartDraw() { startDraw(); }

/** 点击右上角 × 号 → 取消绘制 */
function onCancelDraw() { cancelDraw(); }

/** 点击加号按钮 → 在地图中心添加顶点 */
function onAddMarker() { addMarker(); }

function onUndo() { undo(); }
function onRedo() { redo(); }

/** 点击"重画" → 清除所有绘制 */
function onClearDraw() { clearDraw(); }

/**
 * 点击"完成"按钮
 *
 *   1. 调用 finishDraw() 获取几何数据
 *   2. 弹出确认框展示面积
 *   3. 用户确认 → 打开表单弹窗
 */
function onFinishDraw() {
  const result = finishDraw();
  if (!result) {
    showToast("请至少绘制三个点");
    return;
  }

  showConfirmDialog({
    title: "完成绘制",
    message: `面积: ${result.area} 亩，是否添加？`,
  })
    .then(() => {
      // 将 WKT 和面积预设到表单中
      formInitialData.value = { geom: result.wkt, area: result.area };
      formTitle.value = config.form.createTitle;
      formVisible.value = true;
    })
    .catch(() => {
      // 用户取消，不做任何操作
    });
}

// ================================================================
//  表单提交
// ================================================================

/**
 * 表单提交回调
 *
 * 🛠 接入后端：在此函数中调用你的 API 保存地块数据
 *
 * @param {Object} formData — 表单字段键值对
 */
function onFormSubmit(formData) {
  console.log("表单提交:", formData);
  showToast(config.form.submitSuccessMsg);
  formVisible.value = false;
}
</script>

<style scoped>
/* 页面布局 */
.home-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ---- FAB 浮动操作按钮 ---- */
.fab {
  position: fixed;
  top: calc(16px + env(safe-area-inset-top, 0px));
  right: 16px;
  z-index: 2000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: v-bind("config.primaryColor");
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.35);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s, background 0.15s;
}

.fab:active {
  transform: scale(0.92);
}
</style>
