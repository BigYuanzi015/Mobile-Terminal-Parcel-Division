<!--
  404 页面

  使用 Vant 的 van-empty 组件展示友好的"页面未找到"提示，
  并提供"返回首页"按钮导航回主页。
-->
<template>
  <div class="not-found">
    <van-empty image="error" description="页面未找到">
      <van-button round type="primary" color="#1989fa" @click="goHome">
        返回首页
      </van-button>
    </van-empty>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

/** 导航回首页 */
function goHome() {
  router.push("/");
}
</script>

<style scoped>
/* 垂直居中 */
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
