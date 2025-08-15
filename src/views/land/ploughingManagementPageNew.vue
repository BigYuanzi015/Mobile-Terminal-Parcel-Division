<!-- 土地承租变更公示 -->
<template>
  <div id="map"></div>
  <!-- 返回主页 -->
  <div class="back-main" @click="goHome">
    <img
      alt="返回主页Icon"
      class="icon"
      src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_map_fanhui_zhuye.png"
    />
    <p>主页</p>
  </div>
  <!-- 右侧增加按钮 -->
  <div
    v-if="!pageConfig.isOperateBaseMap"
    class="right-btn"
    @click="pageConfig.isOperateBaseMap = true"
  >
    <img
      alt="新增地块Icon"
      class="icon"
      src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_right_add.png"
    />
    <p>新增地块</p>
  </div>
  <div
    v-if="pageConfig.isOperateBaseMap"
    class="right-btn"
    @click="
      pageConfig.isOperateBaseMap = false;
      reDraw();
    "
  >
    <van-icon name="clear" size="26px" color="#5EA94A" class="icon" />
    <p>取消操作</p>
  </div>
  <!-- <div
    class="right-btn right-btn-list"
    v-if="!isEditLand"
    @click="handleLandList"
  >
    <img
      class="icon"
      src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_right_add.png"
      alt="地块列表Icon"
    />
    <p>地块列表</p>
  </div> -->
  <!-- <div class="right-btn" v-if="isEditLand" @click="successEdit">
    <van-icon class="icon" size="26" color="#5ea94a" name="success" />
    <p>完成编辑</p>
  </div> -->
  <!--  屏幕中间十字准星 -->
  <div
    v-if="pageConfig.isOperateBaseMap"
    id="coordinates"
    class="cross-hair"
  ></div>
  <!-- 底部地块绘画操作栏 -->
  <div v-if="pageConfig.isOperateBaseMap" class="bottom-control">
    <ul>
      <li @click="undoDraw">
        <van-icon name="revoke" size="24px" class="icon" />
        <p>撤销</p>
      </li>
      <li @click="redoDraw">
        <van-icon name="revoke" size="24px" class="mirror-icon" />
        <p>恢复</p>
      </li>
      <li @click="addMakerToLayer">
        <van-icon name="add" size="38px" color="#5EA94A" class="icon" />
      </li>
      <li @click="reDraw">
        <van-icon name="replay" size="24px" class="icon" />
        <p>重画</p>
      </li>
      <li @click="finishDraw">
        <van-icon name="passed" size="24px" class="icon" />
        <p>完成</p>
      </li>
    </ul>
  </div>
  <!-- 底部显示确权土地切换 -->
  <ul
    v-if="!pageConfig.isOperateBaseMap"
    id="bottomListCon"
    class="bottom-list-content"
  >
    <li
      :class="{ selected: pageConfig.cropSelected == 'All' }"
      @click="switchMapCrop('All')"
    >
      <img
        alt="底部全部标签icon"
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_quanbu.png"
      />
      <p>全部</p>
    </li>
    <li
      :class="{ selected: pageConfig.cropSelected == 'Wheat' }"
      @click="switchMapCrop('Wheat', 1)"
    >
      <img
        alt="底部小麦标签icon"
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_xiaomai.png"
      />
      <p>小麦</p>
    </li>
    <li
      :class="{ selected: pageConfig.cropSelected == 'Corn' }"
      @click="switchMapCrop('Corn', 2)"
    >
      <img
        alt="底部玉米标签icon"
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_yumi.png"
      />
      <p>玉米</p>
    </li>
    <li
      :class="{ selected: pageConfig.cropSelected == 'Melon' }"
      @click="switchMapCrop('Melon', 3)"
    >
      <img
        alt="底部打瓜标签icon"
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_dagua.png"
      />
      <p>打瓜</p>
    </li>
    <li
      :class="{ selected: pageConfig.cropSelected == 'Gourd' }"
      @click="switchMapCrop('Gourd', 4)"
    >
      <img
        alt="底部葫芦标签icon"
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_hulu.png"
      />
      <p>葫芦</p>
    </li>
  </ul>
  <!-- 图例 -->
  <div class="legend">
    <ul>
      <li>
        <span style="background-color: #ffda3a"></span>
        <p>玉米</p>
      </li>
      <li>
        <span style="background-color: #bf922e"></span>
        <p>小麦</p>
      </li>
      <li>
        <span style="background-color: #ff5252"></span>
        <p>打瓜</p>
      </li>
      <li>
        <span style="background-color: #60ff80"></span>
        <p>葫芦</p>
      </li>
    </ul>
  </div>
  <!-- 新增/编辑表单弹窗 -->
  <van-popup
    id="addLandPopup"
    v-model:show="popupShow"
    :style="{ padding: '20px', height: '80%' }"
    get-container="body"
    position="bottom"
    round
  >
    <div class="title">
      <p>{{ isEditLand ? "编辑地块详情信息" : "新增地块详情信息" }}</p>
    </div>
    <van-form
      required="auto"
      style="overflow: auto; height: 95%"
      @submit="onSubmit"
    >
      <van-cell-group title="责任人信息">
        <van-field
          v-model="popupForm.name"
          :readonly="isCheck"
          :rules="[{ required: true, message: '请输入责任人' }]"
          clearable
          label="责任人"
          label-width="110px"
          name="name"
          placeholder="请输入责任人"
        ></van-field>
        <van-field
          v-model="popupForm.idCard"
          :label-width="'6.8em'"
          :readonly="isCheck"
          clearable
          label="责任人身份证"
          label-width="110px"
          name="idCard"
          placeholder="请输入责任人身份证"
        ></van-field>
        <van-field
          v-model="popupForm.phone"
          :label-width="'8em'"
          :readonly="isCheck"
          clearable
          label="责任人联系电话"
          label-width="110px"
          name="phone"
          placeholder="请输入责任人联系电话"
        ></van-field>
      </van-cell-group>
      <van-cell-group title="地块信息">
        <van-field
          v-model="popupForm.cropName"
          :readonly="isCheck"
          is-link
          label="种植作物"
          placeholder="请选择种植作物"
          readonly
          required
          @click="pageConfig.showCropIdPopup = true"
        />
        <van-field
          v-model="popupForm.area"
          :readonly="isCheck"
          clearable
          label="种植面积"
          name="area"
          placeholder="请填写种植面积"
          required
        >
          <template #button>
            <span>亩</span>
          </template>
        </van-field>
        <van-field
          v-model="popupForm.plantTime"
          :readonly="isCheck"
          is-link
          label="种植日期"
          placeholder="请选择种植日期"
          readonly
          required
          @click="pageConfig.showDatePickerPopup = true"
        />
      </van-cell-group>
      <van-field
        v-model="popupForm.geom"
        label="地块边界"
        name="geom"
        placeholder="请选择地块边界"
        readonly
      ></van-field>
      <van-field v-model="popupForm.stArea" label="标注面积" readonly>
        <template #button>
          <span>亩</span>
        </template>
      </van-field>
      <!-- <div style="margin: 16px">
        <van-button
          round
          block
          type="primary"
          @click="addLand"
          style="background-color: blue; border-color: blue"
        >
          绘制地块
        </van-button>
      </div> -->
      <div style="margin: 16px">
        <van-button
          block
          native-type="submit"
          round
          style="background-color: #5ea94a; border-color: #5ea94a"
          type="primary"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </van-popup>
  <!-- 地块列表弹窗 -->
  <!-- <van-popup
    id="addLandPopup"
    v-model:show="popupListShow"
    :style="{ padding: '20px', height: '80%' }"
    get-container="body"
    position="bottom"
    round
  >
    <div style="height: 100%; overflow: auto">
      <van-list
        v-model:loading="landListLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="landListLoad"
      >
        <van-cell-group v-for="item in landList" :key="item">
          <van-cell :value="item.name" title="责任人"></van-cell>
          <van-cell :value="item.cropName" title="种植作物"></van-cell>
          <van-cell :value="item.plantTime" title="种植时间"></van-cell>
          <van-cell :value="item.area + '亩'" title="种植面积"></van-cell>
          <van-button
            plain
            size="mini"
            type="primary"
            @click="handleLandListEdit(item.surveyId, 'check')"
            >详情
          </van-button>
          <van-button
            plain
            size="mini"
            type="warning"
            @click="handleLandListEdit(item.surveyId)"
            >编辑
          </van-button>
          <van-button
            plain
            size="mini"
            type="danger"
            @click="delSpringPlowing(item.surveyId)"
            >删除
          </van-button>
          <van-button
            plain
            size="mini"
            type="primary"
            @click="handleLandEdit(item.surveyId)"
            >编辑地块
          </van-button>
        </van-cell-group>
      </van-list>
    </div>
  </van-popup> -->
  <van-popup v-model:show="pageConfig.showCropIdPopup" position="bottom" round>
    <van-picker
      :columns="pageState.cropTypeList"
      @cancel="pageConfig.showCropIdPopup = false"
      @confirm="cropIdPopupConfirm"
    />
  </van-popup>
  <van-popup
    v-model:show="pageConfig.showDatePickerPopup"
    position="bottom"
    round
  >
    <van-date-picker
      v-model="plantTime"
      :readonly="isCheck"
      title="选择种植日期"
      @cancel="pageConfig.showDatePickerPopup = false"
      @confirm="plantTimeConfirm"
    />
  </van-popup>
  <van-overlay
    :show="hasToken"
    style="background: rgba(0, 0, 0, 0.9); z-index: 3000"
  >
    <van-loading
      v-if="hasTokenLoading"
      color="#5ea94a"
      style="
        top: 50vh;
        left: 38vw;
        display: flex;
        flex-direction: column;
        width: 100px;
        align-items: center;
      "
    >
      加载中...
    </van-loading>
    <div v-else class="overlay-error">
      <van-icon color="red" name="cross" size="3rem" />
      <p>登录失败，请通知管理员</p>
    </div>
  </van-overlay>
</template>

<script setup>
import { onMounted, ref } from "vue";
import {
  closeToast,
  showConfirmDialog,
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast,
} from "vant";
import WKT from "terraformer-wkt-parser";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-editable";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import IdentityCodeValid from "@/utils/checkIdCard";
import {
  addSpringPlowingNew,
  delSpringPlowingRemove,
  editSpringPlowingModify,
  getSpringCropJson,
  getSpringCropList,
  getSpringPlowingList,
  getSpringPlowingPage,
} from "@/api/ploughing.js";

const pageConfig = ref({
  isOperateBaseMap: false, // 是否操作底图，控制页面显示内容：操作栏，新增地块，选择分类栏
  cropSelected: "All", // 被选择的作物
  showCropIdPopup: false, // 弹窗选择作物id弹窗显示
  showDatePickerPopup: false, // 弹窗选择种植时间弹窗显示
}); // 页面配置
const pageState = ref({
  cropTypeList: [], // 作物类型列表
  landJsonData: [], // 地块JSON数据
}); // 页面内变量集合

const hasToken = ref(true); // 是否使用token
const hasTokenLoading = ref(true); // 是否加载中
const landListLoading = ref(false); // 地块列表加载中
const finished = ref(false); // 地块列表是否加载完毕
const isEditLand = ref(false); // 是否为编辑状态
const popupShow = ref(false); // 新增弹出框显示
const popupListShow = ref(false); // 地块列表弹窗框
const plantTime = ref([]); // 用来缓存种植时间
const popupForm = ref({
  name: "", // 责任人名称
  idCard: "", // 责任人身份证
  phone: "", // 手机号
  geom: "", // 地块边界
  cropId: "", // 作物id
  cropName: "", // 作物名称
  plantTime: "", // 种植时间
  area: "", // 种植面积
  stArea: "", // 标注面积
}); // 弹窗表单数据
// const popupFormBackUp = ref({}); // 弹窗表单数据备份
const pageParams = {
  currentPage: 1,
  pageSize: 10000,
}; // 查询参数
const springPlowingList = ref([]); // 春耕地块信息列表
const isCheck = ref(false); // 是否为查看状态
const landList = ref([]); // 地块列表
// const editId = ref(""); // 编辑地块id
const landData = ref([]); // 地块数据
// const drawType = ref("add"); // 新增地块类型
let map = null; // 地图对象
// let cropData = {}; // 作物数据 geojson
// let polygonjson = null; // 多边形图层
// let layerMarker = []; // 图层标记
let params = {
  pageNum: 1,
  pageSize: 10,
}; // 查询数据参数
// let drawGroupPolygon = null; //添加绘制图层
let editableLayers = null; // 绘制编辑图层
// let editFeature = null; // 编辑地块的geo信息
let editLandLayer = null; // 编辑地块的图层
// let polygon = null; // 绘制的多边形对象

/**
 * 确认种植时间选择的函数
 *
 * 该函数在用户选择种植时间后点击确认按钮时触发
 * 它的主要作用是将选择的种植时间格式化为字符串并存储到表单中
 * 同时，关闭日期选择器弹窗
 */
function plantTimeConfirm() {
  // 将选择的种植时间格式化为年-月-日的字符串，并存储到表单的plantTime字段中
  popupForm.value.plantTime = plantTime.value.join("-");
  // 关闭日期选择器弹窗
  pageConfig.value.showDatePickerPopup = false;
}

// 地块选择确认
function cropIdPopupConfirm({ selectedOptions }) {
  pageConfig.value.showCropIdPopup = false;
  popupForm.value.cropId = selectedOptions[0].value;
  popupForm.value.cropName = selectedOptions[0].text;
}

/**
 * 初始化页面
 */
function initPage() {
  map = L.map("map", {
    editable: true,
    preferCanvas: true,
    zoomAnimation: false,
  });
  if (localStorage.getItem("Lng") && localStorage.getItem("Lat")) {
    map.setView([localStorage.getItem("Lat"), localStorage.getItem("Lng")], 13);
  } else {
    map.setView([46.6287504, 83.03114605], 13);
  }
  // 底图加载
  L.tileLayer(
    "https://t7.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=f78eabcb8cbd6865d9b58e29c0a68795",
  ).addTo(map);

  getTodayDate();
  loadSpringCropList();
  loadSpringCropJson();
  loadSpringPlowingList();
}

/**
 * 该函数用于加载春季作物列表
 * 它通过调用`getSpringCropList`方法获取数据，并将结果解析为一个包含作物名称和ID的数组
 */
function loadSpringCropList() {
  getSpringCropList(pageParams)
    .then((result) => {
      if (result.code !== 0) {
        showToast(result.msg);
        console.error("加载作物列表错误信息：", result.msg);
        return false;
      }
      pageState.value.cropTypeList = (result.data || []).map((item) => {
        return {
          text: item.cropName ?? "",
          value: item.cropId ?? "",
        };
      });
    })
    .catch((err) => {
      console.error("HTTP请求错误", err);
      showFailToast("请求失败");
    });
}

/**
 * 加载春季作物GeoJSON数据并在地图上展示
 * @param {string} cropName - 作物名称（可选），用于筛选特定作物数据
 * @param {number} id - 作物ID，用于请求特定区域的数据
 */
async function loadSpringCropJson(cropName, id) {
  try {
    // 显示加载提示
    const loadingToast = showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: "加载中...",
    });

    // 1. 获取数据
    const result = await getSpringCropJson({ cropId: id });
    closeToast(loadingToast);

    // 2. 验证响应数据
    if (result.code !== 0) {
      showFailToast(result.msg);
      console.error("获取耕地GeoJSON数据失败:", result.msg);
      return;
    }

    // 3. 初始化数据结构
    const cropData = initializeCropDataStructure();
    const needData = parseResponseData(result.data);
    pageState.value.landJsonData = needData;

    // 4. 清理现有图层
    clearExistingGeoJsonLayers();

    // 5. 处理空数据情况
    if (!needData.features || needData.features.length === 0) {
      console.warn("未获取到有效的耕地数据");
      return;
    }

    // 6. 分类作物数据
    classifyCropFeatures(needData.features, cropData);

    // 7. 配置地图显示
    const { styleFunction, onEachFeature } = configureMapDisplay();

    // 8. 添加数据到地图
    addDataToMap(cropName, cropData, styleFunction, onEachFeature);
  } catch (err) {
    console.error("加载作物数据出错:", err);
    closeToast();
    showFailToast("数据加载失败");
  }
}

/**
 * 初始化作物数据结构
 * @returns {Object} 初始化后的作物数据结构
 */
function initializeCropDataStructure() {
  return {
    corn: [{ type: "FeatureCollection", features: [] }], // 玉米
    wheat: [{ type: "FeatureCollection", features: [] }], // 小麦
    melon: [{ type: "FeatureCollection", features: [] }], // 打瓜
    gourd: [{ type: "FeatureCollection", features: [] }], // 葫芦
  };
}

/**
 * 解析响应数据
 * @param {string} data - 原始响应数据
 * @returns {Object} 解析后的GeoJSON对象
 */
function parseResponseData(data) {
  try {
    landData.value = JSON.parse(data);
    return JSON.parse(data);
  } catch (e) {
    console.error("解析GeoJSON数据失败:", e);
    throw new Error("数据格式错误");
  }
}

/**
 * 清理地图上现有的GeoJSON图层
 */
function clearExistingGeoJsonLayers() {
  map.eachLayer((layer) => {
    if (layer instanceof L.GeoJSON) {
      map.removeLayer(layer);
    }
  });
}

/**
 * 按作物类型分类特征数据
 * @param {Array} features - GeoJSON特征数组
 * @param {Object} cropData - 作物数据容器
 */
function classifyCropFeatures(features, cropData) {
  const cropMapping = {
    玉米: "corn",
    小麦: "wheat",
    打瓜: "melon",
    葫芦: "gourd",
  };

  features.forEach((feature) => {
    const cropType = cropMapping[feature.properties.crop_name];
    if (cropType) {
      cropData[cropType][0].features.push(feature);
    }
  });
}

/**
 * 配置地图显示样式和交互
 * @returns {Object} 包含样式函数和特征交互函数的对象
 */
function configureMapDisplay() {
  // 作物颜色映射
  const cropColors = {
    玉米: "#FFDA3A",
    打瓜: "#FF5252",
    小麦: "#BF922E",
    葫芦: "#60FF80",
  };

  // 样式函数
  const styleFunction = (feature) => ({
    fillColor: cropColors[feature.properties.crop_name] || "#CCC",
    weight: 1,
    opacity: 0.1,
    color: "white",
    fillOpacity: 0.7,
  });

  // 特征交互函数
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => handleFeatureClick(feature, layer),
    });
  };

  return { styleFunction, onEachFeature };
}

/**
 * 处理地块点击事件
 * @param {Object} feature - GeoJSON特征
 * @param {L.Layer} layer - 地图图层
 */
function handleFeatureClick(feature, layer) {
  const popupContentData = springPlowingList.value.find(
    (item) => item.surveyId == feature.properties.id,
  );

  const popupContent = generatePopupContent(feature, popupContentData);
  layer.bindPopup(popupContent).openPopup();
}

/**
 * 生成弹出窗口内容
 * @param {Object} feature - GeoJSON特征
 * @param {Object} popupData - 弹出窗口数据
 * @returns {string} HTML格式的弹出内容
 */
function generatePopupContent(feature, popupData) {
  return `
    <div style="display:flex;flex-direction: column;align-items: flex-start; width: 140px;">
      <p style="margin:0 0 5px 0;"><strong>负责人:</strong> ${popupData?.name || "暂无"}</p>
      <p style="margin:0 0 5px 0;"><strong>种植作物:</strong> ${popupData?.cropName || "暂无"}</p>
      <p style="margin:0 0 5px 0;"><strong>联系电话:</strong> ${popupData?.phone || "暂无"}</p>
      <p style="margin:0 0 5px 0;"><strong>种植时间:</strong> ${popupData?.plantTime || "暂无"}</p>
      <p style="margin:0 0 5px 0;"><strong>上报时间:</strong> ${popupData?.reportTime || "暂无"}</p>
      <button class="popup-edit-btn" onclick="handleEditLandClick('${feature.properties.id}')">
        编辑地块详情
      </button>
      <button class="popup-del-btn" onclick="handleDelLandClick('${feature.properties.id}')">
        删除该地块
      </button>
    </div>`;
}

/**
 * 添加数据到地图
 * @param {string} cropName - 作物名称
 * @param {Object} cropData - 作物数据
 * @param {Function} styleFunction - 样式函数
 * @param {Function} onEachFeature - 特征交互函数
 */
function addDataToMap(cropName, cropData, styleFunction, onEachFeature) {
  if (cropName) {
    // 添加指定作物图层
    addSingleCropLayer(cropName, cropData, styleFunction, onEachFeature);
  } else {
    // 添加所有作物图层
    Object.keys(cropData).forEach((crop) => {
      addSingleCropLayer(crop, cropData, styleFunction, onEachFeature);
    });
  }
}

/**
 * 添加单个作物图层到地图
 * @param {string} crop - 作物名称
 * @param {Object} cropData - 作物数据
 * @param {Function} styleFunction - 样式函数
 * @param {Function} onEachFeature - 特征交互函数
 */
function addSingleCropLayer(crop, cropData, styleFunction, onEachFeature) {
  const geojsonData = cropData[crop][0];
  if (geojsonData.features.length > 0) {
    L.geoJSON(geojsonData, {
      style: styleFunction,
      onEachFeature: onEachFeature,
      layerType: "cropOrLand",
    }).addTo(map);
  }
}

// 全局点击处理函数
window.handleEditLandClick = (id) => {
  const detail = springPlowingList.value.find((item) => item.surveyId == id);
  plantTime.value = detail?.plantTime;
  popupForm.value = detail;
  popupForm.value.geom = detail?.geom ? WKT.convert(detail.geom) : null;
  popupForm.value.surveyId = detail?.surveyId;
  editableGeojson();
};

window.handleDelLandClick = (id) => {
  delSpringPlowing(id);
};

/*
 * 提交数据
 */
function onSubmit() {
  let toast = showLoadingToast({
    message: "提交中...",
    forbidClick: true,
  });
  map.eachLayer((layer) => {
    console.log(layer);
    if (layer instanceof L.GeoJSON && layer.id == "layerMarker") {
      map.removeLayer(layer);
    }
  });
  if (typeof popupForm.value.plantTime == "object") {
    popupForm.value.plantTime = popupForm.value.plantTime.join("-");
  }
  let postData = {
    surveyId: popupForm.value.surveyId,
    geom: popupForm.value.geom,
    name: popupForm.value.name,
    idCard: popupForm.value.idCard,
    phone: popupForm.value.phone,
    cropId: popupForm.value.cropId,
    plantTime: popupForm.value.plantTime,
    area: popupForm.value.area,
  };
  if (isEditLand.value) {
    editSpringPlowingModify(postData)
      .then((result) => {
        if (result.code !== 0) {
          showFailToast(result.msg);
          console.error("编辑地块数据失败：", result.msg);
          return;
        }
        showSuccessToast("提交成功");
        finishSubmit();
      })
      .catch((err) => {
        console.error("提交接口出错信息：", err);
        closeToast();
        showFailToast(err);
      });
  } else {
    addSpringPlowingNew(postData)
      .then((result) => {
        closeToast();
        if (result.code !== 0) {
          showFailToast(result.msg);
          console.error("提交新增地块数据失败：", result.msg);
          return;
        }
        showSuccessToast("提交成功");
        finishSubmit();
      })
      .catch((err) => {
        console.error("提交接口出错信息：", err);
        closeToast();
        showFailToast(err);
      });
  }
}

/**
 * 切换地图
 * @param {string} landType - 地块类型
 * @param {string} id - 作物id
 */
function switchMapCrop(landType, id) {
  pageConfig.value.cropSelected = landType;
  loadSpringCropJson(landType, id);
}

// 获取春耕地块信息列表(不分页)
function loadSpringPlowingList() {
  getSpringPlowingList().then((result) => {
    if (result.code !== 0) {
      return;
    }
    springPlowingList.value = result.data.map((item) => {
      item.plantTime = item.plantTime.split("-");
      return item;
    });
  });
}

// 获取春耕地块信息列表(分页)
function loadSpringPlowingPage(params, type) {
  landListLoading.value = true;
  finished.value = false;
  getSpringPlowingPage(params).then((result) => {
    if (result.code !== 0) {
      return;
    }
    landListLoading.value = false;
    finished.value = true;
    if (type === "init") {
      landList.value = [];
    }
    landList.value = landList.value.concat(result.data);
  });
}

/**
 * 删除地块
 * @param {String} id - 要删除的地块ID
 */
function delSpringPlowing(id) {
  showConfirmDialog({
    title: "提示",
    message: "删除后数据无法恢复，确认删除吗？",
  })
    .then(() => {
      // 显示加载中的Toast提示
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: "删除中...",
      });
      delSpringPlowingRemove(id)
        .then((result) => {
          // 关闭加载中的Toast提示
          closeToast();
          // 如果请求成功，处理结果数据
          if (result.code === 0) {
            showSuccessToast("删除成功");
            pageConfig.value.cropSelected = "All";
            loadSpringCropJson();
            loadSpringPlowingPage(params);
          } else {
            // 如果请求失败，打印错误信息并显示失败Toast提示
            console.error("删除地块失败", result.msg);
            showFailToast(result.msg);
          }
        })
        .catch((err) => {
          console.error("获取接口出错信息：", err);
          closeToast();
          showFailToast(err);
        });
    })
    .catch(() => {});
}

/**
 * 启用GeoJSON图层编辑功能
 * 此函数用于将土地图层切换到编辑模式，包括更新图层样式、添加到可编辑图层组、以及设置编辑事件监听器
 */
function editableGeojson() {
  // 设置土地图层为编辑状态
  isEditLand.value = true;
  const editLayer = pageState.value.landJsonData.features.find((element) => {
    return popupForm.value.surveyId == element.properties.id;
  });
  const points = editLayer.geometry.coordinates[0].map((item) => {
    const lng = Array.isArray(item) ? item[0] : item.lng;
    const lat = Array.isArray(item) ? item[1] : item.lat;
    return { lat, lng };
  });
  pageConfig.value.isOperateBaseMap = true;
  map.eachLayer((layer) => {
    if (layer.getPopup) {
      const popup = layer.getPopup();
      if (popup) {
        popup.close();
      }
    }
  });
  points.forEach((item) => {
    console.log("item", item);
    const command = new AddMarkerCommand(item);
    if (MapOptions.timer == null) {
      MapOptions.timer = setInterval(() => {
        createTemporaryPolyline();
      }, 10);
    }
    executeCommand(command);
  });
}

/**
 * 点击返回按钮
 */
function goHome() {
  wx.miniProgram.switchTab({
    url: "/pages/main/main",
  });
}

/**
 * 提交完成
 */
function finishSubmit() {
  popupShow.value = false;
  popupForm.value = {
    name: "", // 责任人名称
    idCard: "", // 责任人身份证
    phone: "", // 手机号
    geom: "", // 地块边界
    cropId: "", // 作物id
    cropName: "", // 作物名称
    plantTime: "", // 种植时间
    area: "", // 种植面积
    stArea: "",
  };
  pageConfig.value.cropSelected = "All";
  pageConfig.value.isOperateBaseMap = false;
  isEditLand.value = false;
  reDraw();
  loadSpringCropJson();
  loadSpringPlowingList();
  // landListLoad();
}

/**
 * 将坐标数组转换为WKT (Well-Known Text) 格式
 *
 * @param {Array} coordinates - 一个包含坐标对象的数组，每个坐标对象都有lng（经度）和lat（纬度）属性
 * @returns {string} 返回多边形的WKT表示字符串
 */
function convertToWKT(coordinates) {
  // 初始化WKT字符串，多边形的WKT格式开始部分
  var wkt = "POLYGON((";
  // 遍历坐标数组，将每个坐标转换为WKT格式并添加到wkt字符串中
  coordinates.forEach(function (coord, index) {
    wkt += coord.lng + " " + coord.lat;
    // 如果当前坐标不是最后一个坐标，则添加逗号和空格作为分隔符
    if (index < coordinates.length - 1) {
      wkt += ", ";
    }
  });
  // 添加多边形的最后一个坐标，它需要与第一个坐标相同，以闭合多边形
  wkt += ", " + coordinates[0].lng + " " + coordinates[0].lat;
  // 结束多边形的WKT格式
  wkt += "))";
  // 返回构造好的多边形WKT字符串
  return wkt;
}

// 地图配置和状态管理
const MapOptions = {
  map: null, // Leaflet地图实例
  history: [], // 操作历史记录
  historyIndex: -1, // 当前历史记录索引
  anchorPointList: [], // 存储所有标记点
  polylineList: [], // 存储所有折线
  polylineDistanceIcon: [], // 存储所有距离标签
  landShapePolygon: null, // 地块多边形
  landShapePolygonDistanceIcon: null, // 地块面积标签
  nowUsePolyline: null, // 当前临时折线
  nowUsePolylineDistanceIcon: null, // 当前临时距离标签
  timer: null, // 临时折线定时器
};

class AddMarkerCommand {
  constructor(position) {
    this.position = position;
    this.marker = null;
    this.polyline = null;
    this.distanceIcon = null;
    this.isClosed = false;
  }

  execute() {
    // 创建标记
    this.marker = L.marker(this.position, {
      icon: L.icon({
        iconUrl: "/public/icons/icon_marker_point.svg",
        iconSize: [30, 30],
      }),
    }).addTo(map);

    // 如果有前一个点，创建折线
    if (MapOptions.anchorPointList.length > 0) {
      const prevPos =
        MapOptions.anchorPointList[
          MapOptions.anchorPointList.length - 1
        ].getLatLng();
      this.polyline = L.polyline([prevPos, this.position], {
        color: "#ffffff",
        weight: 3,
        zIndex: 1000,
        noClip: true,
        smoothFactor: 0,
      }).addTo(map);

      // 创建距离标签
      const midPoint = L.latLng(
        (prevPos.lat + this.position.lat) / 2,
        (prevPos.lng + this.position.lng) / 2,
      );

      const distance = prevPos.distanceTo(this.position);
      this.distanceIcon = L.marker(midPoint, {
        icon: L.divIcon({
          html: `<div style="color:#e12727;font-weight:bold;font-size:16px;text-shadow: -1px -1px 0 white, 1px -1px 0 white,-1px 1px 0 white,1px 1px 0 white;">
            ${distance.toFixed(0)}米</div>`,
          className: "distance-label",
          iconSize: [60, 24],
          iconAnchor: [30, 35],
        }),
        interactive: false,
      }).addTo(map);
    }

    // 更新状态
    MapOptions.anchorPointList.push(this.marker);
    if (this.polyline) MapOptions.polylineList.push(this.polyline);
    if (this.distanceIcon)
      MapOptions.polylineDistanceIcon.push(this.distanceIcon);

    // 检查是否需要闭合多边形
    if (MapOptions.anchorPointList.length >= 3) {
      const firstMarker = MapOptions.anchorPointList[0];
      const lastMarker =
        MapOptions.anchorPointList[MapOptions.anchorPointList.length - 1];
      const distance = firstMarker
        .getLatLng()
        .distanceTo(lastMarker.getLatLng());

      if (distance <= 3) {
        this.closePolygon();
        this.isClosed = true;
      }
    }
  }

  closePolygon() {
    // 创建闭合多边形
    const polygonLatLngs = MapOptions.anchorPointList.map((marker) =>
      marker.getLatLng(),
    );

    // 移除旧的多边形（如果存在）
    if (MapOptions.landShapePolygon) {
      map.removeLayer(MapOptions.landShapePolygon);
      map.removeLayer(MapOptions.landShapePolygonDistanceIcon);
    }

    MapOptions.landShapePolygon = L.polygon(polygonLatLngs, {
      color: "#ffffff",
      weight: 3,
      opacity: 1,
      zIndex: 1000,
      noClip: true,
      smoothFactor: 0,
    }).addTo(map);

    // 创建面积标签
    const center = MapOptions.landShapePolygon.getCenter();
    const area = formatArea(polygonLatLngs);

    MapOptions.landShapePolygonDistanceIcon = L.marker(center, {
      icon: L.divIcon({
        html: `<div style="color:#e12727;font-weight:bold;font-size:16px;text-shadow: -1px -1px 0 white, 1px -1px 0 white,-1px 1px 0 white,1px 1px 0 white;">
          ${area} 亩</div>`,
        className: "area-label-marker",
        iconSize: [120, 40],
      }),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(map);

    map.fitBounds(MapOptions.landShapePolygon.getBounds());

    if (MapOptions.nowUsePolyline) {
      map.removeLayer(MapOptions.nowUsePolyline);
      MapOptions.nowUsePolyline = null;
    }
    if (MapOptions.nowUsePolylineDistanceIcon) {
      map.removeLayer(MapOptions.nowUsePolylineDistanceIcon);
      MapOptions.nowUsePolylineDistanceIcon = null;
    }
  }

  undo() {
    if (this.isClosed) this.isClosed = false;

    if (MapOptions.landShapePolygon) {
      map.removeLayer(MapOptions.landShapePolygon);
      MapOptions.landShapePolygon = null;
    }
    if (MapOptions.landShapePolygonDistanceIcon) {
      map.removeLayer(MapOptions.landShapePolygonDistanceIcon);
      MapOptions.landShapePolygonDistanceIcon = null;
    }

    map.removeLayer(this.marker);
    if (this.polyline) map.removeLayer(this.polyline);
    if (this.distanceIcon) map.removeLayer(this.distanceIcon);

    MapOptions.anchorPointList.pop();
    if (this.polyline) MapOptions.polylineList.pop();
    if (this.distanceIcon) MapOptions.polylineDistanceIcon.pop();
  }
}

/**
 * 添加标记并创建展示折线
 */
function addMakerToLayer() {
  const command = new AddMarkerCommand(map.getCenter());
  if (MapOptions.timer == null) {
    MapOptions.timer = setInterval(() => {
      createTemporaryPolyline();
    }, 10);
  }
  executeCommand(command);
}

// 执行命令
function executeCommand(command) {
  // 如果从中间位置执行新命令，丢弃后面的历史
  if (MapOptions.historyIndex < MapOptions.history.length - 1) {
    MapOptions.history = MapOptions.history.slice(
      0,
      MapOptions.historyIndex + 1,
    );
  }

  command.execute();
  MapOptions.history.push(command);
  MapOptions.historyIndex = MapOptions.history.length - 1;
}

// 撤销操作
function undoDraw() {
  if (MapOptions.historyIndex >= 0) {
    MapOptions.history[MapOptions.historyIndex--].undo();
  }
}

// 重做操作
function redoDraw() {
  if (MapOptions.historyIndex < MapOptions.history.length - 1) {
    MapOptions.history[++MapOptions.historyIndex].execute();
  }
}

// 创建临时折线
function createTemporaryPolyline() {
  const currentCenter = map.getCenter();

  if (MapOptions.nowUsePolyline) {
    map.removeLayer(MapOptions.nowUsePolyline);
  }
  if (MapOptions.nowUsePolylineDistanceIcon) {
    map.removeLayer(MapOptions.nowUsePolylineDistanceIcon);
  }

  if (MapOptions.anchorPointList.length > 0) {
    const lastPos =
      MapOptions.anchorPointList[
        MapOptions.anchorPointList.length - 1
      ].getLatLng();

    MapOptions.nowUsePolyline = L.polyline([lastPos, currentCenter], {
      color: "#ffffff",
      weight: 3,
      opacity: 0.7,
      zIndex: 1000,
      dashArray: "10, 10",
      noClip: true,
      smoothFactor: 0,
    }).addTo(map);

    const distance = lastPos.distanceTo(currentCenter);
    MapOptions.nowUsePolylineDistanceIcon = L.marker(currentCenter, {
      icon: L.divIcon({
        html: `<div style="color:#000;font-weight:bold;font-size:16px;text-shadow: -1px -1px 0 white, 1px -1px 0 white,-1px 1px 0 white,1px 1px 0 white;">
          ${distance.toFixed(0)}米</div>`,
        className: "distance-label",
        iconSize: [60, 24],
        iconAnchor: [30, 35],
      }),
      interactive: false,
    }).addTo(map);
  }
}

// 计算地块面积
function formatArea(polygon) {
  const area = L.GeometryUtil.geodesicArea(polygon) * 0.0015;
  return area.toFixed(2);
}

/**
 * 重新绘制图形
 */
function reDraw() {
  // 清除所有图层
  MapOptions.anchorPointList.forEach((marker) => map.removeLayer(marker));
  MapOptions.polylineList.forEach((polyline) => map.removeLayer(polyline));
  MapOptions.polylineDistanceIcon.forEach((icon) => map.removeLayer(icon));

  if (MapOptions.landShapePolygon) {
    map.removeLayer(MapOptions.landShapePolygon);
    map.removeLayer(MapOptions.landShapePolygonDistanceIcon);
  }

  if (MapOptions.nowUsePolyline) {
    map.removeLayer(MapOptions.nowUsePolyline);
  }

  if (MapOptions.nowUsePolylineDistanceIcon) {
    map.removeLayer(MapOptions.nowUsePolylineDistanceIcon);
  }

  // 清除定时器
  clearInterval(MapOptions.timer);
  MapOptions.timer = null;

  // 重置状态
  MapOptions.anchorPointList = [];
  MapOptions.polylineList = [];
  MapOptions.polylineDistanceIcon = [];
  MapOptions.landShapePolygon = null;
  MapOptions.landShapePolygonDistanceIcon = null;
  MapOptions.nowUsePolyline = null;
  MapOptions.nowUsePolylineDistanceIcon = null;
  MapOptions.history = [];
  MapOptions.historyIndex = -1;
}

/**
 * 完成绘制功能
 *
 */
function finishDraw() {
  if (
    MapOptions.landShapePolygon == null &&
    MapOptions.anchorPointList.length >= 3
  ) {
    // 创建一个添加标记的命令实例
    const command = new AddMarkerCommand();

    // 将锚点列表的第一个锚点添加到列表末尾，以闭合多边形
    MapOptions.anchorPointList.push(MapOptions.anchorPointList[0]);

    // 执行闭合多边形的操作
    command.closePolygon();

    // 显示自动绘制完成的提示信息
    showToast({
      message: "已自动完成绘制",
      forbidClick: true,
    });

    // 两秒后检查是否已完成所有绘制操作
    setTimeout(() => {
      checkFinished();
    }, 2000);
  } else if (MapOptions.landShapePolygon) {
    checkFinished();
  } else {
    showToast("请至少绘制三个点");
  }
  function checkFinished() {
    showConfirmDialog({
      title: "完成绘制",
      message: "是否确认地块绘制完成？",
    })
      .then(() => {
        // 清除定时器
        clearInterval(MapOptions.timer);
        MapOptions.timer = null;
        // 如果存在正在使用的折线图层，则从地图中移除
        if (MapOptions.nowUsePolyline) {
          map.removeLayer(MapOptions.nowUsePolyline);
        }
        // 如果存在正在使用的距离图标图层，则从地图中移除
        if (MapOptions.nowUsePolylineDistanceIcon) {
          map.removeLayer(MapOptions.nowUsePolylineDistanceIcon);
        }
        popupForm.value.stArea = formatArea(
          MapOptions.landShapePolygon.getLatLngs()[0],
        );
        popupForm.value.geom = convertToWKT(
          MapOptions.landShapePolygon.getLatLngs()[0],
        );
        popupShow.value = true;
      })
      .catch(() => {});
  }
}

/**
 * 获取今天的日期
 * 该函数用于获取当前的日期，并将其格式化为 YYYY-MM-DD 的形式
 * 主要用途是初始化或重置日期相关的数据
 */
function getTodayDate() {
  // 创建一个新的Date对象，用于获取当前的日期信息
  const date = new Date();
  // 获取当前的年份，并将其转换为字符串
  const year = date.getFullYear().toString();
  // 获取当前的月份，由于月份是从0开始计算的，因此需要加1，然后补零
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份从 0 开始，补零
  // 获取当前的日期，并将其转换为两位数的字符串形式，不足两位数时在前面补零
  const day = date.getDate().toString().padStart(2, "0"); // 补零
  // 将年、月、日组合成一个数组，形成格式化的日期
  const formattedDate = [year, month, day];
  // 将格式化的日期赋值给plantTime的value属性，用于在界面上显示或进一步处理
  plantTime.value = formattedDate;
}

onMounted(() => {
  if (localStorage.getItem("Token")) {
    hasTokenLoading.value = false;
    hasToken.value = false;
    initPage();
    // 禁止在触摸移动时缩放页面
    document.addEventListener(
      "touchmove",
      function (e) {
        // 当用户缩放页面时，阻止默认行为
        if (e.scale !== 1) {
          e.preventDefault();
        }
      },
      { passive: false },
    );
  } else {
    hasTokenLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
p {
  margin: 0;
}

#map {
  height: 100vh;
  width: 100vw;
}

:deep(.popup-edit-btn) {
  color: #fff;
  background-color: #1677ff;
  border: 1px solid #1677ff;
  padding: 10px 30px;
  border-radius: 5px;
  margin-top: 10px;
  width: 140px;
  cursor: pointer;
}

:deep(.popup-view-btn) {
  color: #fff;
  background-color: #1677ff;
  border: 1px solid #1677ff;
  padding: 10px 30px;
  border-radius: 5px;
  margin-top: 10px;
  width: 140px;
  cursor: pointer;
}

:deep(.popup-del-btn) {
  color: #fff;
  background-color: #ee0a24;
  border: 1px solid #ee0a24;
  padding: 10px 30px;
  border-radius: 5px;
  margin-top: 10px;
  width: 140px;
  cursor: pointer;
}

/* 左侧 返回主页按钮 */
.back-main {
  position: absolute;
  z-index: 1000;
  top: 0;
  left: 0;
  margin-left: 10px;
  margin-top: 80px;
  padding: 5px;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  color: #2b2b2b;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    background-color: #f4f4f4;
  }

  .icon {
    width: 26px;
    height: 26px;
    margin-bottom: 10px;
  }
}

/* 右侧 新增地块按钮 */
.right-btn {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  margin-right: 10px;
  margin-top: 10px;
  padding: 5px;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  color: #2b2b2b;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .icon {
    width: 26px;
    height: 26px;
    margin-bottom: 10px;
  }
}

.right-btn-list {
  top: 80px;
}

.bottom-control {
  position: absolute;
  bottom: 0;
  left: calc((100vw - 80vw) / 2);
  z-index: 1000;
  width: 80vw;
  height: 70px;
  margin: 0 0 20px 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0px 0px 29px 3px rgba(69, 72, 74, 0.3);

  ul {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-evenly;
    align-items: center;
    height: 100%;

    li {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;

      .mirror-icon {
        transform: scaleX(-1);
      }

      p {
        margin-top: 5px;
        color: #5ea94a;
      }
    }
  }
}

.cross-hair {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000;
}

.cross-hair:before,
.cross-hair:after {
  content: "";
  position: absolute;
  background: red;
}

.cross-hair:before {
  width: 2px;
  border: 1px red;
  height: 30px;
  left: 14px;
  top: 0;
}

.cross-hair:after {
  width: 30px;
  height: 2px;
  left: 0;
  top: 14px;
}

.bottom-list-content {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-wrap: nowrap;
  width: 100vw;
  background-color: #fff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: auto;
  padding: 15px 15px 15px 15px;
  box-shadow: 0px 0px 29px 3px rgba(69, 72, 74, 0.3);

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f2f2f2;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    margin-right: 10px;
    width: 80px;

    &.selected {
      box-shadow: 0px 0px 0 3px #5ea94a;
      background: #ffffff;
      color: #5fa94b;
      font-weight: 600;
    }

    &:last-child {
      margin: 0;
    }

    .icon {
      width: 30px;
      height: 30px;
      margin-bottom: 5px;
    }

    p {
      font-size: 14px;
    }
  }
}

.legend {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1000;
  margin-bottom: 150px;
  margin-right: 10px;
  background-color: #0000008b;
  border-radius: 8px;
  padding: 10px;

  li {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 14px;
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }

    span {
      width: 15px;
      height: 15px;
      margin-right: 5px;
      border: 1px solid #fff;
    }
  }
}

:deep(.van-radio__icon--checked .van-icon) {
  background-color: #5ea94a;
  border-color: #5ea94a;
}

.overlay-error {
  position: absolute;
  top: 45vh;
  left: calc(50% - 88px);
  display: flex;
  align-items: center;
  flex-direction: column;

  p {
    margin-bottom: 0;
    font-size: 16px;
    color: red;
  }
}

/* 距离标签样式 */
.distance-label {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #333;
  border-radius: 4px;
  text-align: center;
}

.area-label-marker {
  background: transparent !important;
  border: none !important;
}

.segment-distance {
  color: #333;
  padding: 1px 3px;
  font-size: 16px;
  font-weight: bold;
}
</style>
