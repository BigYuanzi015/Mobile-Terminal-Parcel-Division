<!--
  根组件 — 仅负责渲染 <router-view>

  整个应用的布局入口：
    - <router-view /> 根据当前路由展示对应页面
    - 页面级布局由各自页面组件自行管理
-->
<script setup>
// 根组件无需任何逻辑，路由会自动匹配
</script>

<template>
  <router-view />
</template>

<style scoped>
/* 根组件无需样式，页面样式由各自组件管理 */
</style>
