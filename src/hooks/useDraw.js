/**
 * useDraw — 多边形绘制 Composable
 *
 * 完整的移动端地块绘制方案，包含：
 *   1. 屏幕中心十字准星定位（由 DrawToolbar 组件渲染）
 *   2. 点击加号在地图中心添加顶点
 *   3. 实时辅助线 + 距离标注（requestAnimationFrame 驱动）
 *   4. 命令模式实现撤销/重做（AddCommand）
 *   5. 自动闭合检测（最后一个顶点靠近起点时自动闭合）
 *   6. 球面面积计算 + WKT 坐标导出
 *
 * 架构：
 *   — 所有绘制元素统一纳入 L.featureGroup，缩放时自动同步坐标
 *   — 临时辅助线使用 RAF 循环，在地图移动时实时更新
 *   — 撤销/重做基于命令历史栈（非快照），内存高效
 *   — 所有样式从 config.draw 读取，统一可配
 *
 * 依赖：
 *   leaflet-draw — 提供 L.Draw 基础类
 *   leaflet-editable — 提供 enableEdit() 等编辑能力
 *
 * 用法:
 *   const {
 *     isDrawing, geometry, canUndo, canRedo,
 *     startDraw, cancelDraw, addMarker, undo, redo, clearDraw, finishDraw
 *   } = useDraw(mapRef);
 */

import { ref, onUnmounted } from "vue";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-editable";
import { coordinatesToWKT } from "@/utils/geo";
import config from "@/config";

/** 绘制样式配置（模块级常量，避免每次调用 createDistanceLabel 时解构） */
const drawConfig = config.draw;

/**
 * @param {import('vue').Ref<L.Map|null>} mapRef — 地图实例的响应式引用
 */
export function useDraw(mapRef) {
  // ================================================================
  //  响应式状态（暴露给外部）
  // ================================================================

  /** 是否处于绘制模式 */
  const isDrawing = ref(false);

  /** 绘制完成后的几何数据 { wkt, area, areaMeters, latlngs } */
  const geometry = ref(null);

  /** 是否可以撤销（有历史记录且 index >= 0） */
  const canUndo = ref(false);

  /** 是否可以重做（index 未到末尾） */
  const canRedo = ref(false);

  // ================================================================
  //  内部状态（非响应式，高频操作避免响应式开销）
  // ================================================================

  /** 容纳所有绘制元素的 FeatureGroup */
  let drawGroup = null;

  /** 命令历史栈（AddCommand 实例） */
  let history = [];
  let historyIndex = -1;

  /** 已确认的顶点（L.circleMarker 数组） */
  let anchorPoints = [];

  /** 已确认的连线（L.polyline 数组，连接相邻顶点） */
  let polylines = [];

  /** 已确认的距离标注（L.marker + divIcon 数组） */
  let distanceLabels = [];

  /** 闭合多边形图层 */
  let shapePolygon = null;

  /** 面积标注图层 */
  let shapeLabel = null;

  /** 临时辅助线（最后顶点 → 地图中心） */
  let tempLine = null;

  /** 临时距离标注 */
  let tempLabel = null;

  /** requestAnimationFrame 句柄 */
  let rafId = null;

  /** 上次更新的地图中心点（用于减少不必要的重绘） */
  let lastCenter = null;

  // ================================================================
  //  公共 API
  // ================================================================

  /**
   * 进入绘制模式
   *
   * 会自动清除之前的绘制内容，创建新的 FeatureGroup。
   */
  function startDraw() {
    if (!mapRef.value) return;
    clearAll();
    ensureDrawGroup();
    isDrawing.value = true;
    geometry.value = null;
  }

  /** 取消绘制，清除所有绘制内容并退出绘制模式 */
  function cancelDraw() {
    clearAll();
    isDrawing.value = false;
  }

  /** 清除绘制内容并退出（同 cancelDraw，但额外重置 geometry） */
  function clearDraw() {
    clearAll();
    isDrawing.value = false;
    geometry.value = null;
  }

  /**
   * 在地图当前中心点添加一个顶点
   *
   * 用户移动地图 → 十字准星对准目标 → 点击加号 → 调用此方法
   */
  function addMarker() {
    if (!mapRef.value || !isDrawing.value) return;
    executeCommand(new AddCommand(mapRef.value.getCenter()));
    startTempLine();
  }

  /** 撤销上一步操作 */
  function undo() {
    if (historyIndex >= 0) {
      history[historyIndex--].undo();
      updateState();
    }
  }

  /** 重做被撤销的操作 */
  function redo() {
    if (historyIndex < history.length - 1) {
      history[++historyIndex].execute();
      updateState();
    }
  }

  /**
   * 完成绘制
   *
   * 如果未闭合但已有 3 个以上顶点，尝试自动闭合；
   * 返回几何数据（WKT + 面积），或 null（顶点不足）。
   *
   * @returns {Object|null} { wkt, area, areaMeters, latlngs } 或 null
   */
  function finishDraw() {
    // 未闭合但顶点 ≥ 3 → 自动闭合
    if (!shapePolygon && anchorPoints.length >= 3) {
      // 把第一个点再推一次以触发闭合检测
      anchorPoints.push(anchorPoints[0]);
      new AddCommand().closePolygon();
    }

    if (!shapePolygon) return null;

    // 停止辅助线动画
    stopTempLine();

    // 计算面积
    const latlngs = shapePolygon.getLatLngs()[0];
    const areaSquareMeters = L.GeometryUtil.geodesicArea(latlngs);
    const areaChineseMu = areaSquareMeters * 0.0015; // 平方米 → 亩

    geometry.value = {
      wkt: coordinatesToWKT(latlngs),
      area: areaChineseMu.toFixed(2),
      areaMeters: areaSquareMeters.toFixed(2),
      latlngs,
    };

    return geometry.value;
  }

  // ================================================================
  //  内部方法
  // ================================================================

  /**
   * 确保 FeatureGroup 存在
   *
   * FeatureGroup 用于统一管理所有绘制图层，
   * 缩放时 Leaflet 会自动同步组内所有元素的坐标。
   */
  function ensureDrawGroup() {
    if (!drawGroup && mapRef.value) {
      drawGroup = L.featureGroup().addTo(mapRef.value);
    }
    return drawGroup;
  }

  /**
   * 启动临时辅助线动画
   *
   * 使用 requestAnimationFrame 循环，在地图移动时实时更新：
   *   — 从最后一个顶点到地图中心的虚线
   *   — 线段长度标注
   *
   * 优化：只在中心点坐标变化时才重绘，静止时跳过
   */
  function startTempLine() {
    if (rafId) return; // 防止重复启动

    const tick = () => {
      if (!mapRef.value || !isDrawing.value) {
        rafId = null;
        return;
      }

      const center = mapRef.value.getCenter();

      // 中心点没变化则跳过（减少 DOM 操作）
      if (lastCenter && lastCenter.equals(center)) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastCenter = center;

      const group = ensureDrawGroup();

      // 清除上一帧的临时元素
      if (tempLine) group.removeLayer(tempLine);
      if (tempLabel) group.removeLayer(tempLabel);

      // 从最后一个顶点画虚线到地图中心
      if (anchorPoints.length > 0) {
        const lastPoint =
          anchorPoints[anchorPoints.length - 1].getLatLng();

        tempLine = L.polyline([lastPoint, center], {
          ...drawConfig.tempLine,
          interactive: false,
        });
        group.addLayer(tempLine);

        tempLabel = createDistanceLabel(
          lastPoint.distanceTo(center),
          center,
          "temp", // "temp" → 使用辅助线样式颜色
        );
        group.addLayer(tempLabel);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  }

  /** 停止辅助线动画 */
  function stopTempLine() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (drawGroup) {
      if (tempLine) drawGroup.removeLayer(tempLine);
      if (tempLabel) drawGroup.removeLayer(tempLabel);
    }
    tempLine = null;
    tempLabel = null;
    lastCenter = null;
  }

  /**
   * 清除所有绘制内容，重置状态
   *
   * 包括：临时线、FeatureGroup、所有顶点/连线/标注、
   * 闭合多边形、面积标注、命令历史。
   */
  function clearAll() {
    stopTempLine();

    if (drawGroup) {
      drawGroup.clearLayers();
      if (mapRef.value) mapRef.value.removeLayer(drawGroup);
      drawGroup = null;
    }

    anchorPoints = [];
    polylines = [];
    distanceLabels = [];
    shapePolygon = null;
    shapeLabel = null;
    history = [];
    historyIndex = -1;

    updateState();
  }

  /**
   * 执行命令并入栈
   *
   * 如果当前不在历史末尾（即执行过撤销），
   * 则丢弃之后的历史，实现"新操作覆盖旧未来"的标准行为。
   */
  function executeCommand(command) {
    if (historyIndex < history.length - 1) {
      // 丢弃当前位置之后的记录
      history = history.slice(0, historyIndex + 1);
    }

    command.execute();
    history.push(command);
    historyIndex = history.length - 1;

    updateState();
  }

  /** 同步 canUndo / canRedo 响应式状态 */
  function updateState() {
    canUndo.value = historyIndex >= 0;
    canRedo.value = historyIndex < history.length - 1;
  }

  /**
   * 创建距离/面积标注
   *
   * 使用 L.divIcon 实现无边框的纯文字标注，
   * 文字用 text-shadow 描边确保在各种底图上清晰可读。
   *
   * @param {number} meters — 距离（米）或面积（平方米）
   * @param {L.LatLng} latlng — 标注位置
   * @param {"dist"|"temp"|"area"} type — 标注类型
   *   "dist" — 已确认线段距离
   *   "temp" — 临时辅助线距离
   *   "area" — 多边形面积
   * @returns {L.Marker}
   */
  function createDistanceLabel(meters, latlng, type) {
    // 根据类型选择样式
    const cssClass =
      type === "area"
        ? "draw-area-label"
        : type === "temp"
          ? "draw-temp-label"
          : "draw-dist-label";

    const color =
      type === "temp"
        ? drawConfig.tempLine.color
        : type === "area"
          ? drawConfig.areaColor
          : drawConfig.distanceColor;

    const fontSize = type === "area" ? 16 : 13;
    const text =
      type === "area"
        ? `${(meters * 0.0015).toFixed(2)} 亩`
        : `${meters.toFixed(0)}m`;

    const icon = L.divIcon({
      html: `<span style="font-weight:700;font-size:${fontSize}px;color:${color};text-shadow:0 0 4px #fff,0 0 4px #fff;white-space:nowrap;">${text}</span>`,
      className: cssClass,
      iconSize: [0, 0],   // 不限制尺寸，由内容撑开
      iconAnchor: [0, 0], // 不偏移
    });

    return L.marker(latlng, { icon, interactive: false });
  }

  // ================================================================
  //  命令类 (Command Pattern)
  // ================================================================

  /**
   * AddCommand — 添加顶点的命令
   *
   * 每个实例记录单次操作创建的所有图层，
   * 支持 execute() 执行和 undo() 撤销。
   *
   * 闭合检测：当顶点数 ≥ 3 且新顶点距起点 < drawConfig.closeThreshold 时，
   * 自动调用 closePolygon() 闭合多边形。
   */
  class AddCommand {
    /**
     * @param {L.LatLng} [position] — 顶点坐标（空则仅用于闭合操作）
     */
    constructor(position) {
      this.position = position;
      this.circle = null;   // L.circleMarker — 顶点圆圈
      this.line = null;     // L.polyline — 到上一个顶点的连线
      this.label = null;    // L.marker + divIcon — 距离标注
      this.wasClosed = false; // 是否触发了自动闭合
    }

    /** 执行：创建顶点 + 连线 + 标注，检测闭合 */
    execute() {
      if (!mapRef.value || !this.position) return;

      const group = ensureDrawGroup();

      // 1. 创建顶点圆圈
      this.circle = L.circleMarker(this.position, {
        ...drawConfig.vertex,
        interactive: false,
      });
      group.addLayer(this.circle);

      // 2. 如果有前一个顶点，创建连线 + 距离标注
      if (anchorPoints.length > 0) {
        const previous = anchorPoints[anchorPoints.length - 1].getLatLng();

        this.line = L.polyline([previous, this.position], {
          ...drawConfig.edge,
          interactive: false,
        });
        group.addLayer(this.line);

        // 标注放在线段中点
        const midpoint = L.latLng(
          (previous.lat + this.position.lat) / 2,
          (previous.lng + this.position.lng) / 2,
        );
        this.label = createDistanceLabel(
          previous.distanceTo(this.position),
          midpoint,
          "dist",
        );
        group.addLayer(this.label);
      }

      // 3. 推入状态数组
      anchorPoints.push(this.circle);
      if (this.line) polylines.push(this.line);
      if (this.label) distanceLabels.push(this.label);

      // 4. 闭合检测：顶点数 ≥ 3 且最后一个点接近起点
      if (anchorPoints.length >= 3) {
        const distanceToFirst = anchorPoints[0]
          .getLatLng()
          .distanceTo(
            anchorPoints[anchorPoints.length - 1].getLatLng(),
          );

        if (distanceToFirst <= drawConfig.closeThreshold) {
          this.closePolygon();
          this.wasClosed = true;
        }
      }
    }

    /**
     * 闭合多边形
     *
     * 创建 L.polygon + 面积标注，自动缩放视野到多边形范围，
     * 同时停止辅助线动画。
     */
    closePolygon() {
      if (!mapRef.value) return;

      const group = ensureDrawGroup();
      const latlngs = anchorPoints.map((point) => point.getLatLng());

      // 移除旧的闭合图形和标注（如果有）
      if (shapePolygon) group.removeLayer(shapePolygon);
      if (shapeLabel) group.removeLayer(shapeLabel);

      // 创建闭合多边形
      shapePolygon = L.polygon(latlngs, {
        ...drawConfig.polygon,
        interactive: false,
      });
      group.addLayer(shapePolygon);

      // 面积标注（显示在多边形中心）
      shapeLabel = createDistanceLabel(
        L.GeometryUtil.geodesicArea(latlngs),
        shapePolygon.getCenter(),
        "area",
      );
      group.addLayer(shapeLabel);

      // 自动缩放视野
      mapRef.value.fitBounds(shapePolygon.getBounds(), {
        padding: [30, 30],
      });

      stopTempLine();
    }

    /** 撤销：移除本命令创建的所有图层，恢复状态 */
    undo() {
      this.wasClosed = false;

      const group = drawGroup;
      if (group) {
        if (shapePolygon) {
          group.removeLayer(shapePolygon);
          shapePolygon = null;
        }
        if (shapeLabel) {
          group.removeLayer(shapeLabel);
          shapeLabel = null;
        }
        if (this.circle) group.removeLayer(this.circle);
        if (this.line) group.removeLayer(this.line);
        if (this.label) group.removeLayer(this.label);
      }

      anchorPoints.pop();
      if (this.line) polylines.pop();
      if (this.label) distanceLabels.pop();
    }
  }

  // 组件卸载时自动清理
  onUnmounted(() => clearAll());

  return {
    isDrawing,
    geometry,
    canUndo,
    canRedo,
    startDraw,
    cancelDraw,
    addMarker,
    undo,
    redo,
    clearDraw,
    finishDraw,
  };
}
