<!--
  地图容器组件

  职责：
    1. 渲染 <div id="map"> 占满视口
    2. 调用 useMap() 初始化 Leaflet 地图
    3. 通过 emit("ready", map) 将地图实例传递给父组件

  为什么独立成组件：
    — 确保地图 DOM 元素在 onMounted 时已存在
    — 用 requestAnimationFrame 延迟一帧初始化，确保布局计算完成
    — 通过 defineExpose 暴露 map / isReady 供父组件访问

  用法:
    <MapContainer ref="mapRef" @ready="onMapReady" />
    // onMapReady(map) { this.mapInstance = map; }
-->
<template>
  <div id="map" class="map-container"></div>
</template>

<script setup>
import { onMounted } from "vue";
import { useMap } from "@/hooks/useMap";

const emit = defineEmits(["ready"]);

// 初始化地图（幂等，重复调用安全）
const { map, isReady, initMap } = useMap("map");

onMounted(() => {
  // 延迟一帧确保 DOM 布局稳定（避免 Leaflet 计算错误）
  requestAnimationFrame(() => {
    initMap();
    // 通知父组件地图已就绪
    emit("ready", map.value);
  });
});

// 暴露给父组件（可通过 ref 访问）
defineExpose({ map, isReady });
</script>

<style scoped>
/* 固定定位填满视口，不随页面滚动 */
.map-container {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
