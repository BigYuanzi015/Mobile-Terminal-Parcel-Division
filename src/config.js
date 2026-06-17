/**
 * ========================================
 *  项目配置文件（唯一配置入口）
 *
 *  修改此文件即可适配你自己的项目，
 *  无需改动任何组件或 hooks 源码。
 * ========================================
 *
 * 配置模块一览：
 *   map         — 地图中心点、缩放级别、瓦片底图 URL
 *   api         — 后端地址、Token 认证、GeoJSON 接口
 *   categories  — 图层分类（对应 GeoJSON properties.category）
 *   geoStyle    — GeoJSON 图层默认线宽/透明度
 *   legendItems — 图例项（留空自动从 categories 生成）
 *   primaryColor / dangerColor / successColor — 全局主色调
 *   draw.*      — 绘制工具完整样式（顶点/连线/多边形/辅助线）
 *   features    — 功能开关（绘制/编辑/图例/标记聚合）
 *   form        — 表单标题、提示文案
 *   formFields  — 表单字段定义（名称/类型/是否必填）
 * ========================================
 */

export default {
  // ================================================================
  //  地图配置
  // ================================================================
  map: {
    /** 地图默认中心点 [纬度, 经度] */
    center: [39.92, 116.42],
    /** 默认缩放级别（越大越近，19 为建筑物级别） */
    zoom: 13,
    /** 缩放范围限制 */
    minZoom: 3,
    maxZoom: 20,

    /**
     * 瓦片底图 URL
     *
     * 占位符说明：
     *   {s} — 子域名（用于负载均衡，需配合 tileOptions.subdomains）
     *   {z} — 缩放级别
     *   {x} — 瓦片列号
     *   {y} — 瓦片行号
     *
     * 常用替换：
     *   高德: https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}
     *   天地图(需key): https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=你的key
     *   OSM: https://tile.openstreetmap.org/{z}/{x}/{y}.png
     */
    tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",

    /** 瓦片图层附加选项（直接传给 L.tileLayer） */
    tileOptions: {
      subdomains: ["a", "b", "c", "d"],
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
  },

  // ================================================================
  //  API 配置
  // ================================================================
  api: {
    /** 后端 API 基础地址 */
    baseURL: "/api",
    /** 请求超时时间（毫秒），3 分钟 */
    timeout: 3 * 60 * 1000,
    /** 是否在请求头自动携带 Token */
    useToken: false,
    /** Token 在 localStorage 中的键名 */
    tokenKey: "token",
    /** GeoJSON 地块数据接口路径（拼接在 baseURL 后面） */
    geoDataEndpoint: "/parcels/geojson",
  },

  // ================================================================
  //  图层分类
  // ================================================================

  /**
   * 分类列表 — 与 GeoJSON properties.category 对应
   *
   * 每条记录：
   *   key   — 对应 GeoJSON feature.properties.category 的取值
   *   label — 底部筛选 Tab 显示的文字
   *   color — 该分类图层的填充颜色
   *   icon  — （可选）Tab 上的图标 URL
   *
   * 第一个条目固定为 "全部"（key="all"）
   */
  categories: [
    { key: "all", label: "全部", color: null },
    { key: "farmland", label: "耕地", color: "#ffc53d" },
    { key: "orchard", label: "果园", color: "#73d13d" },
    { key: "greenhouse", label: "大棚", color: "#69b1ff" },
  ],

  // ================================================================
  //  GeoJSON 图层渲染样式
  // ================================================================

  /**
   * 默认样式 — 每个分类在此基础上叠加 fillColor
   *
   * weight:      边框线宽（像素）
   * opacity:     边框不透明度 (0-1)
   * fillOpacity: 填充不透明度 (0-1)
   */
  geoStyle: {
    weight: 1,
    opacity: 0.3,
    fillOpacity: 0.45,
  },

  // ================================================================
  //  图例
  // ================================================================

  /**
   * 图例项列表，留空数组则自动从 categories 生成
   *
   * 手动指定示例：
   *   legendItems: [
   *     { label: "耕地", color: "#ffda3a" },
   *     { label: "林地", color: "#52c41a" },
   *   ]
   */
  legendItems: [],

  // ================================================================
  //  全局主色调
  // ================================================================

  /** 主色调 — FAB 按钮 / 加号按钮 / 表单提交按钮 / TabBar 高亮 */
  primaryColor: "#1989fa",

  /** 危险色 — 取消按钮 / 删除按钮 */
  dangerColor: "#ee0a24",

  /** 成功色 — 完成按钮 */
  successColor: "#07c160",

  // ================================================================
  //  绘制工具样式（完整可配）
  // ================================================================

  draw: {
    /** 顶点圆圈样式 — L.circleMarker 参数 */
    vertex: {
      radius: 8,
      fillColor: "#1989fa",
      fillOpacity: 1,
      color: "#fff",
      weight: 2,
    },

    /** 已确认的连线样式 — L.polyline 参数 */
    edge: {
      color: "#fff",
      weight: 3,
    },

    /** 闭合多边形样式 — L.polygon 参数 */
    polygon: {
      color: "#fff",
      weight: 3,
      fillColor: "#1989fa",
      fillOpacity: 0.25,
    },

    /** 临时辅助线样式（虚线） — 从最后顶点到屏幕中心的线 */
    tempLine: {
      color: "#1989fa",
      weight: 2,
      dashArray: "8 6",
    },

    /** 自动闭合距离阈值（米） — 新顶点距离起点 < 此值时自动闭合 */
    closeThreshold: 5,

    /** 距离标注文字颜色 */
    distanceColor: "#e12727",

    /** 面积标注文字颜色 */
    areaColor: "#e12727",
  },

  // ================================================================
  //  功能开关
  // ================================================================

  features: {
    /** 是否启用多边形绘制（含撤销/重做） */
    enableDraw: true,
    /** 是否启用编辑已有地块 */
    enableEdit: true,
    /** 是否启用删除地块 */
    enableDelete: true,
    /** 是否在左上角展示图例 */
    showLegend: true,
    /** 是否启用标记点聚合（MarkerCluster） */
    enableMarkerCluster: false,
    /** 标记点数据接口路径 */
    markerDataEndpoint: "/markers",
  },

  // ================================================================
  //  表单
  // ================================================================

  form: {
    /** 新增地块时弹窗的标题 */
    createTitle: "新增地块",
    /** 提交成功后 Toast 显示的文案 */
    submitSuccessMsg: "提交成功（数据已输出到控制台）",
  },

  /**
   * 表单字段定义 — 驱动 FormPopup 组件渲染
   *
   * 每个字段：
   *   name        — 字段键名（提交时用）
   *   label       — 显示标签
   *   type        — 输入类型: "input" | "number" | "textarea"
   *   required    — 是否必填
   *   placeholder — 占位提示文字
   */
  formFields: [
    {
      name: "name",
      label: "名称",
      type: "input",
      required: true,
      placeholder: "请输入名称",
    },
    {
      name: "area",
      label: "面积(亩)",
      type: "number",
      required: false,
      placeholder: "请输入面积",
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
      required: false,
      placeholder: "请输入描述",
    },
  ],
};
