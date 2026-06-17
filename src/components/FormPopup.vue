<!--
  通用表单弹窗

  底部弹出式表单，字段完全由 config.formFields 驱动。
  支持 v-model 双向绑定显示/隐藏。

  Props:
    modelValue   — 是否显示（v-model）
    title        — 弹窗标题
    fields       — 表单字段配置数组（来自 config.formFields）
    initialData  — 表单初始数据对象
    primaryColor — 提交按钮颜色

  Events:
    submit       — 用户点击提交，参数为表单数据对象 { fieldName: value }

  Slots:
    extra-fields — 可在表单字段列表下方插入自定义字段
                   slotProps: { formData } — 当前表单数据（reactive 对象）

  🛠 扩展：
    通过 extra-fields 插槽可以插入 van-cascader / van-date-picker 等
    非标准输入组件。
-->
<template>
  <van-popup
    :show="modelValue"
    position="bottom"
    round
    :style="{ padding: '20px', height: '75%' }"
    @update:show="$emit('update:modelValue', $event)"
    @closed="$emit('closed')"
  >
    <!-- 标题 -->
    <h3 style="text-align:center;margin:0 0 16px;">{{ title }}</h3>

    <!-- 表单 — 由 fields 配置驱动渲染 -->
    <van-form @submit="handleSubmit" style="overflow:auto;height:calc(100% - 40px);">
      <van-cell-group>
        <van-field
          v-for="field in fields"
          :key="field.name"
          v-model="formData[field.name]"
          :label="field.label"
          :name="field.name"
          :type="field.type === 'number' ? 'number' : field.type === 'textarea' ? 'textarea' : 'text'"
          :placeholder="field.placeholder"
          :required="field.required"
          :readonly="field.readonly"
          :rules="field.required ? [{ required: true, message: `请输入${field.label}` }] : []"
          :rows="field.type === 'textarea' ? 2 : 1"
          :autosize="field.type === 'textarea'"
          clearable
        />
      </van-cell-group>

      <!-- 自定义字段插槽（如级联选择器、日期选择器等） -->
      <slot name="extra-fields" :formData="formData" />

      <!-- 提交按钮 -->
      <div style="margin:20px 16px;">
        <van-button round block type="primary" native-type="submit" :color="primaryColor">
          提交
        </van-button>
      </div>
    </van-form>
  </van-popup>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  /** v-model 绑定值 */
  modelValue: { type: Boolean, default: false },
  /** 弹窗标题 */
  title: { type: String, default: "表单" },
  /** 表单字段配置 */
  fields: { type: Array, default: () => [] },
  /** 表单初始值 */
  initialData: { type: Object, default: () => ({}) },
  /** 提交按钮颜色 */
  primaryColor: { type: String, default: "#1989fa" },
});

const emit = defineEmits(["submit", "closed", "update:modelValue"]);

/**
 * 表单数据（reactive 对象）
 *
 * initialData 变化时重置表单：
 *   1. 删除所有旧 key
 *   2. 填入新的 initialData 值
 */
const formData = reactive({});

watch(
  () => props.initialData,
  (data) => {
    // 清空旧字段
    for (const key of Object.keys(formData)) {
      delete formData[key];
    }
    // 填入新数据
    Object.assign(formData, data || {});
  },
  { immediate: true, deep: true },
);

/** 提交：浅拷贝一份数据 emit 出去 */
function handleSubmit() {
  emit("submit", { ...formData });
}

/** 关闭弹窗 */
function close() {
  emit("update:modelValue", false);
}

// 暴露 close 方法供父组件通过 ref 调用
defineExpose({ close });
</script>
