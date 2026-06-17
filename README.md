# Leaflet 移动端地图模板

基于 **Vue 3 + Vite + Vant + Leaflet** 的通用移动端 Web 地图应用模板。

开箱即用：修改一个配置文件即可接入自己的后端和数据。

## 技术栈

| 类别     | 技术选型                                                     |
| -------- | ------------------------------------------------------------ |
| 框架     | Vue 3 (Composition API)                                      |
| 构建工具 | Vite 5                                                       |
| UI 组件  | [Vant 4](https://vant-ui.github.io/)                         |
| 地图引擎 | [Leaflet](https://leafletjs.com/) + leaflet-draw + leaflet-editable + markercluster |
| HTTP     | [Axios](https://axios-http.com/)                             |
| 样式     | Sass                                                         |
| 地图格式 | GeoJSON + WKT                                                |

## 快速开始

```bash
npm install
npm run dev
```

启动后浏览器访问 `http://localhost:3000`，可看到预置的示例地图（CartoDB 底图 + 示例 GeoJSON 数据）。

## 三步接入你的项目

### 1. 修改 `src/config.js`

这是整个项目的**唯一配置入口**，包含地图、图层、绘制样式、表单、功能开关等全部可定制项。详细字段见文件顶部注释。

### 2. 准备 GeoJSON 数据

两种方式任选其一：

- **静态示例**：将 GeoJSON 文件放到 `public/sample.geojson`
- **API 接口**：在 `config.api.geoDataEndpoint` 配置后端接口路径

GeoJSON 中每个 feature 的 `properties.category` 字段对应 config 中 categories 的 key。

### 3. （可选）替换图标

将图标放到 `public/icons/`，在 categories 配置中引用。

## 目录结构

```
leaflet-mobile-template/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── icons/
│   │   ├── icon_marker_point.svg
│   │   └── icon_ditu_location.png
│   └── sample.geojson          # 示例 GeoJSON
├── src/
│   ├── main.js                 # 应用入口
│   ├── App.vue                 # 根组件
│   ├── style.css               # 全局样式
│   ├── config.js               # ★ 唯一配置入口
│   ├── router/
│   │   └── index.js            # 路由
│   ├── views/
│   │   ├── HomePage.vue        # 主页面
│   │   └── NotFoundPage.vue    # 404
│   ├── components/
│   │   ├── MapContainer.vue    #   地图容器
│   │   ├── BottomTabBar.vue    #   底部分类筛选栏
│   │   ├── MapLegend.vue       #   图例
│   │   ├── DrawToolbar.vue     #   绘制工具栏（含十字准星）
│   │   └── FormPopup.vue       #   通用表单弹窗
│   ├── hooks/
│   │   ├── useMap.js           #   地图初始化
│   │   ├── useGeoJSON.js       #   GeoJSON 加载/渲染/筛选
│   │   ├── useDraw.js          #   多边形绘制（撤销/重做）
│   │   └── useMarker.js        #   标记聚合
│   └── utils/
│       ├── request.js          #   Axios 实例
│       └── geo.js              #   面积/WKT 工具
```

## 核心功能

| 功能         | 说明                                       |
| ------------ | ------------------------------------------ |
| GeoJSON 渲染 | 按分类着色、点击查看属性弹窗               |
| 分类筛选     | 底部 TabBar 切换，按 category 筛选图层     |
| 图例         | 自动从 categories 配置生成                 |
| 多边形绘制   | 屏幕中央十字准星定位、命令模式撤销/重做    |
| 面积测量     | 实时显示边长（米）和面积（亩）             |
| WKT 导出     | 绘制完成自动导出 WKT 格式坐标              |
| 标记聚合     | 可选启用 MarkerCluster                     |
| 表单弹窗     | 字段由 config 驱动，支持插槽扩展自定义字段 |

## 配置说明

### 功能开关 (`config.features`)

| 字段 | 类型 | 说明 |
|------|------|------|
| `enableDraw` | boolean | 是否启用多边形绘制 |
| `showLegend` | boolean | 是否展示图例 |
| `enableMarkerCluster` | boolean | 是否启用标记聚合 |

### 主色调 (`config.primaryColor` 等)

控制 FAB 按钮、加号按钮、表单提交按钮、TabBar 高亮色。可配合品牌色直接替换。

### 绘制样式 (`config.draw`)

| 字段 | 说明 |
|------|------|
| `vertex` | 顶点圆圈样式（radius/fillColor/color/weight） |
| `edge` | 连线样式 |
| `polygon` | 闭合多边形样式 |
| `tempLine` | 临时辅助线样式（虚线） |
| `closeThreshold` | 自动闭合距离阈值（米），默认 5 |
| `distanceColor` | 距离标注文字颜色 |
| `areaColor` | 面积标注文字颜色 |

### 表单 (`config.form` / `config.formFields`)

`config.formFields` 数组定义表单字段，每个字段支持：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 字段名（对应表单数据 key） |
| `label` | string | 显示标签 |
| `type` | string | 输入类型：`input` / `number` / `textarea` |
| `required` | boolean | 是否必填 |
| `placeholder` | string | 占位提示 |

## 扩展指南

### 自定义表单字段

通过 FormPopup 的 `extra-fields` 插槽添加级联选择器、日期选择器等：

```vue
<HomePage>
  <template #custom-form-field="{ formData }">
    <van-field v-model="formData.extraField" label="自定义字段" />
  </template>
</HomePage>
```

### 接入后端 CRUD

在 `HomePage.vue` 的 `onFormSubmit` 函数中调用你的后端 API。

### 更换瓦片底图

修改 `config.map.tileUrl`：
- 高德：`https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}`
- 天地图：`https://t{s}.tianditu.gov.cn/img_w/wmts?...&tk=你的key`

## 构建部署

```bash
npm run build
```

产物在 `dist/` 目录，直接部署到任意静态服务器即可。
