<!--
  底部分类筛选栏

  水平可滚动的 chip 列表，用于切换 GeoJSON 图层分类。
  选中项有高亮边框 + 文字变色。

  Props:
    modelValue  — 当前选中的分类 key（v-model 双向绑定）
    items       — [{ key, label, icon? }] 分类列表
    activeColor — 选中态高亮颜色

  用法:
    <BottomTabBar v-model="selectedCategory" :items="categories" />
-->
<template>
  <div v-if="items.length > 0" class="tab-bar-wrapper">
    <!-- 水平滚动容器 -->
    <div class="tab-bar-scroll">
      <button
        v-for="item in items"
        :key="item.key"
        :class="['tab-chip', { active: modelValue === item.key }]"
        @touchstart.prevent="$emit('update:modelValue', item.key)"
      >
        <!-- 可选图标 -->
        <img v-if="item.icon" :src="item.icon" class="tab-chip-icon" alt="" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** 当前选中值（v-model） */
  modelValue: { type: String, default: "all" },
  /** 选项列表 [{ key, label, icon? }] */
  items: { type: Array, default: () => [] },
  /** 选中态高亮颜色 */
  activeColor: { type: String, default: "#1989fa" },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
/* 固定在底部，安全区适配 */
.tab-bar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1800;
  padding: 0 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}

/* 水平滚动 — 隐藏滚动条，平滑滚动 */
.tab-bar-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* iOS 惯性滚动 */
  scrollbar-width: none;             /* Firefox 隐藏滚动条 */
  padding: 4px 0;
}
.tab-bar-scroll::-webkit-scrollbar { display: none; } /* Chrome 隐藏滚动条 */

/* 单个 chip */
.tab-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;      /* 不压缩 */
  gap: 3px;
  min-width: 56px;
  height: 52px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1.5px solid transparent;
  border-radius: 12px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent; /* 禁止 iOS 灰色高亮 */
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 选中态 */
.tab-chip.active {
  border-color: v-bind(activeColor);
  background: #fff;
  color: v-bind(activeColor);
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(25, 137, 250, 0.18);
}

/* 按下反馈 */
.tab-chip:active { transform: scale(0.95); }

.tab-chip-icon {
  width: 22px;
  height: 22px;
}
</style>
