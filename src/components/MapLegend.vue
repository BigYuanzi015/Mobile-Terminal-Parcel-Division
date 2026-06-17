<!--
  图例组件

  固定在屏幕左上角，展示各分类的颜色对照。
  支持 fade 过渡动画，visible 为 false 时平滑隐藏。

  Props:
    visible — 是否显示
    items   — [{ label: string, color: string }]

  🛠 图例内容在 HomePage 中通过 computed 从 config.categories 自动生成
-->
<template>
  <transition name="fade">
    <div v-if="visible && items.length > 0" class="map-legend">
      <div v-for="item in items" :key="item.label" class="legend-row">
        <!-- 颜色色块 -->
        <span :style="{ backgroundColor: item.color }" class="legend-dot"></span>
        <!-- 分类名称 -->
        <span class="legend-text">{{ item.label }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  /** 是否显示图例 */
  visible: { type: Boolean, default: true },
  /** 图例项 [{ label: "耕地", color: "#ffda3a" }] */
  items: { type: Array, default: () => [] },
});
</script>

<style scoped>
/* 左上角固定，半透明深色背景 + 毛玻璃 */
.map-legend {
  position: fixed;
  top: 16px;
  top: calc(16px + env(safe-area-inset-top, 0px)); /* 刘海屏安全区 */
  left: 12px;
  z-index: 1600;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 颜色色块 */
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

/* 分类名称 */
.legend-text {
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
