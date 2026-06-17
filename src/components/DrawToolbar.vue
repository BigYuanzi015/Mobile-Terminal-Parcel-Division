<!--
  绘制工具栏

  仅在绘制模式（isDrawing = true）时显示，包含两层：

    上层 — 屏幕中央十字准星（标记目标位置）+ 圆形加号按钮（点击添加顶点）
    下层 — 底部操作栏（撤销 / 恢复 / 重画 / 完成）

  交互全部使用 @touchstart.prevent 消除移动端 300ms 延迟。

  Props:
    visible      — 是否显示（绑定 isDrawing）
    canUndo      — 撤销按钮是否可用
    canRedo      — 重做按钮是否可用
    primaryColor — 主色调（加号按钮/十字准星颜色）
    successColor — 完成按钮颜色

  Events:
    add-marker   — 点击加号 → 在地图中心添加顶点
    undo         — 撤销
    redo         — 重做
    clear        — 重画（清除所有绘制）
    finish       — 完成绘制
-->
<template>
  <transition name="slide-up">
    <div v-if="visible" class="draw-overlay">
      <!-- ======== 十字准星 ======== -->
      <div class="crosshair">
        <span class="crosshair-v"></span>
        <span class="crosshair-h"></span>
      </div>

      <!-- ======== 加号按钮 ======== -->
      <div class="add-btn-wrapper">
        <button class="add-btn" @touchstart.prevent="$emit('add-marker')">
          <span class="add-cross">+</span>
        </button>
      </div>

      <!-- ======== 底部工具栏 ======== -->
      <div class="toolbar">
        <div class="toolbar-inner">
          <!-- 撤销 -->
          <button
            class="tool-btn"
            :disabled="!canUndo"
            @touchstart.prevent="canUndo && $emit('undo')"
          >
            <van-icon name="revoke" size="20" />
            <span class="btn-label">撤销</span>
          </button>

          <!-- 恢复 -->
          <button
            class="tool-btn"
            :disabled="!canRedo"
            @touchstart.prevent="canRedo && $emit('redo')"
          >
            <van-icon name="revoke" size="20" class="mirror" />
            <span class="btn-label">恢复</span>
          </button>

          <!-- 重画 -->
          <button class="tool-btn" @touchstart.prevent="$emit('clear')">
            <van-icon name="delete-o" size="20" />
            <span class="btn-label">重画</span>
          </button>

          <!-- 完成 -->
          <button class="tool-btn" @touchstart.prevent="$emit('finish')">
            <van-icon name="success" size="20" :color="successColor" />
            <span class="btn-label" :style="{ color: successColor }">完成</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  canUndo: { type: Boolean, default: false },
  canRedo: { type: Boolean, default: false },
  primaryColor: { type: String, default: "#1989fa" },
  successColor: { type: String, default: "#07c160" },
});

defineEmits(["add-marker", "undo", "redo", "clear", "finish"]);
</script>

<style scoped>
/* 全屏覆盖层 — pointer-events: none 让地图交互穿透 */
.draw-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
}

/* ---- 十字准星（屏幕正中央） ---- */
.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  pointer-events: none; /* 不阻挡地图触摸 */
}
.crosshair-v,
.crosshair-h {
  position: absolute;
  background: v-bind(primaryColor);
  opacity: 0.85;
}
/* 竖线 */
.crosshair-v {
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
}
/* 横线 */
.crosshair-h {
  left: 0;
  top: 50%;
  width: 100%;
  height: 2px;
  transform: translateY(-50%);
}

/* ---- 加号按钮 ---- */
.add-btn-wrapper {
  position: absolute;
  bottom: 100px;
  bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto; /* 恢复交互 */
}
.add-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: v-bind(primaryColor);
  color: #fff;
  box-shadow: 0 4px 16px rgba(25, 137, 250, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s;
}
.add-btn:active { transform: scale(0.9); }
.add-cross { font-size: 30px; font-weight: 400; line-height: 1; }

/* ---- 底部工具栏 ---- */
.toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  pointer-events: auto;
}
.toolbar-inner {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 4px 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* ---- 工具按钮 ---- */
.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
  min-width: 52px;
}
.tool-btn:active { background: #f0f0f0; }
.tool-btn:disabled { opacity: 0.25; pointer-events: none; }
.btn-label { font-size: 11px; color: #666; }

/* 恢复按钮图标水平翻转 */
.mirror { transform: scaleX(-1); }

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active { transition: opacity 0.25s; }
.slide-up-enter-from,
.slide-up-leave-to { opacity: 0; }
</style>
