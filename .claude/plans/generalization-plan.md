# 项目通用化改造计划

## 目标
将当前与"塔城市智慧乡村"深度耦合的项目，改造成一个**通用的移动端 Leaflet 地图应用模板**，任何人拉下来后只需改动少量配置即可落地使用。

## 核心原则
1. **删除所有硬编码的业务逻辑**（Token 校验、微信小程序、特定后端 API）
2. **提取可配置项到单一配置入口**
3. **保留核心通用能力**：Leaflet 地图展示、GeoJSON 图层渲染、多边形绘制与编辑、标记聚合
4. **简化到最小可用单元**：一个地图页 + 示例 GeoJSON 数据 + 清晰的扩展点

---

## 第一阶段：删除业务耦合代码

### 1.1 删除的页面
- `src/views/land/landManagementPage.vue` — 土地管理（与 landPage 高度重复）
- `src/views/land/cropManagementPage.vue` — 种植管理（与 landPage 高度重复）
- `src/views/land/ploughingManagementPageNew.vue` — 春耕管理（与特定后端耦合）
- `src/views/index/indexPage.vue` — 无意义的空壳容器
- `src/views/error/NotFoundPage.vue` — 用 Ant Design Vue 组件但项目已有 Vant

### 1.2 删除的文件
- `src/api/land.js` — 全部删除（业务 API）
- `src/api/ploughing.js` — 全部删除（业务 API）
- `src/api/system.js` — 全部删除（业务 API）
- `src/utils/checkIdCard.js` — 身份证校验（业务逻辑）
- `src/utils/Auth.js` — 登录认证（不需要）
- `src/stores/modules/landSearchState.js` — 业务状态（不需要）
- `src/index.html` 中的微信 JS-SDK 脚本和 URL 参数解析逻辑
- `vite.config.js` 中的代理配置和硬编码 host

### 1.3 删除的图标
- `public/icons/` 下所有与特定业务相关的图标（保留一个作为示例）

### 1.4 删除的依赖
- `terraformer-wkt-parser` — WKT 格式解析（特定后端格式）
- `leaflet-draw` — 已有（保留，通用多边形绘制）
- 移除未使用的 Ant Design Vue 依赖？先保留 Vant 作为移动端 UI

---

## 第二阶段：重构为通用模板

### 2.1 新的目录结构
```
leaflet-mobile-template/
├── index.html               # 干净的入口 HTML
├── package.json
├── vite.config.js           # 干净的 Vite 配置
├── .gitignore
├── README.md
├── public/
│   └── icons/               # 只保留 marker_point.svg 示例
├── src/
│   ├── main.js              # 应用入口，只加载 Vant + 路由
│   ├── App.vue              # 根组件
│   ├── style.css            # 全局样式（保留 Leaflet 控件样式）
│   ├── config.js            # 【核心】单一配置文件，用户只需改这个
│   ├── router/
│   │   └── index.js         # 简化为两个路由：首页 + 404
│   ├── views/
│   │   ├── HomePage.vue     # 【核心】通用地图页面
│   │   └── NotFoundPage.vue # 使用 Vant 重构
│   ├── hooks/
│   │   ├── useMap.js        # Leaflet 地图初始化
│   │   ├── useGeoJSON.js    # GeoJSON 加载/渲染/分类
│   │   ├── useDraw.js       # 绘制多边形（含撤销/重做）
│   │   └── useMarker.js     # 标记聚合
│   ├── components/
│   │   ├── MapContainer.vue # 地图容器组件
│   │   ├── BottomTabBar.vue # 底部分类筛选栏
│   │   ├── MapLegend.vue    # 图例组件
│   │   ├── DrawToolbar.vue  # 绘制工具栏
│   │   └── FormPopup.vue    # 通用表单弹窗（插槽模式）
│   ├── utils/
│   │   ├── geo.js           # 面积/坐标/WKT 工具（保留 WKT 支持但作为可选项）
│   │   └── request.js       # 【核心】通用 Axios 实例（无拦截器业务逻辑）
│   └── constants/
│       └── index.js         # 常量（颜色、默认中心点）
```

### 2.2 单一配置文件 `src/config.js`
```js
// 用户只需修改这个文件即可适配自己的项目
export default {
  // 地图配置
  map: {
    center: [39.9042, 116.4074],     // 默认中心点（北京）
    zoom: 5,
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  // API 配置
  api: {
    baseURL: '/api',
    geoDataEndpoint: '/geo/parcels',  // GeoJSON 数据接口
  },
  // 图层筛选分类（可自定义）
  categories: [
    { key: 'all', label: '全部', color: null },
  ],
  // 图例（可自定义）
  legend: [],
}
```

### 2.3 保留为可选的工具
- `src/utils/checkIdCard.js` → 移到 `src/utils/validators.js`，作为可选工具
- WKT 转换 → 保留在 `src/utils/geo.js`，提供完整实现供参考

---

## 第三阶段：核心页面重写

### 3.1 HomePage.vue — 通用地图页
组合以下能力（通过 hooks + components 组装）：
- 地图底图加载
- GeoJSON 图层渲染（按分类着色）
- 底部分类筛选栏
- 图例
- 多边形绘制（点击新增 → 绘制 → 获取 WKT + 面积）
- 点击地块查看详情弹窗
- 编辑/删除地块

**关键设计：所有 API 调用改为 emit 事件或回调，由用户自行接入后端**

### 3.2 组件拆分
每个组件职责单一：
- `MapContainer.vue` — 只负责渲染 `<div id="map">`，暴露 map 实例
- `BottomTabBar.vue` — props 接收 categories，emit 切换事件
- `MapLegend.vue` — props 接收 legend 数据
- `DrawToolbar.vue` — 控制绘制模式的 UI
- `FormPopup.vue` — 通用表单弹窗，使用 slot 让用户自定义表单内容

### 3.3 Hooks 设计
- `useMap(containerId, options)` — 返回 `{ map, mapInitialized }`
- `useGeoJSON(map, options)` — 返回 `{ loadData, clearLayers, currentCategory }`
- `useDraw(map)` — 返回 `{ startDraw, undoDraw, redoDraw, finishDraw, reDraw }`
- `useMarker(map)` — 返回 `{ addMarkers, clearMarkers, markerGroup }`

---

## 第四阶段：文档与示例

### 4.1 README.md 重写
- 项目定位：移动端 Leaflet 地图应用模板
- 快速开始：改配置 → npm install → npm run dev
- 配置说明：详细注释 config.js 每个字段
- 扩展指南：如何接入后端、如何添加新图层类型
- 示例截图

### 4.2 提供示例 GeoJSON 数据
在 `public/sample.geojson` 放置一份示例数据，项目启动后直接展示，无需后端。

---

## 改造后的项目能力清单
| 能力 | 状态 |
|------|------|
| Leaflet 底图 | ✅ 通用 |
| GeoJSON 图层渲染 | ✅ 通用 |
| 按分类着色筛选 | ✅ 通用（配置驱动） |
| 多边形绘制 | ✅ 通用 |
| 撤销/重做 | ✅ 通用 |
| 面积测量 | ✅ 通用 |
| WKT 坐标导出 | ✅ 通用（可选用） |
| 标记聚合 | ✅ 通用 |
| 地块详情查看 | ✅ 通用 |
| Token 登录 | ❌ 删除 |
| 微信小程序 | ❌ 删除 |
| 身份证校验 | ❌ 移到可选工具 |
| 特定后端 API | ❌ 删除 |
