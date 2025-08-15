<!-- 土地承租变更公示 -->
<template>
  <div id="map"></div>
  <!-- 返回主页 -->
  <div class="back-main" @click="goHome">
    <img
      class="icon"
      src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_map_fanhui_zhuye.png"
      alt="返回主页Icon"
    />
    <p>主页</p>
  </div>
  <!-- 右侧增加按钮 -->
  <div class="right-btn" v-if="!isEditLand" @click="addLand">
    <img
      class="icon"
      src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_right_add.png"
      alt="新增地块Icon"
    />
    <p>新增地块</p>
  </div>
  <div class="right-btn" v-if="isEditLand" @click="popupShow = true">
    <van-icon class="icon" size="26" color="#5ea94a" name="success" />
    <p>完成编辑</p>
  </div>
  <!-- 底部显示确权土地切换 -->
  <ul id="bottomListCon" class="bottom-list-content">
    <li
      :class="{ selected: isSelected == 'All' }"
      @click="switchMapCrop('All')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_quanbu.png"
        alt="底部全部标签icon"
      />
      <p>全部</p>
    </li>
    <li
      :class="{ selected: isSelected == 'Wheat' }"
      @click="switchMapCrop('Wheat')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_xiaomai.png"
        alt="底部小麦标签icon"
      />
      <p>小麦</p>
    </li>
    <li
      :class="{ selected: isSelected == 'Corn' }"
      @click="switchMapCrop('Corn')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_yumi.png"
        alt="底部玉米标签icon"
      />
      <p>玉米</p>
    </li>
    <li
      :class="{ selected: isSelected == 'Melon' }"
      @click="switchMapCrop('Melon')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_dagua.png"
        alt="底部打瓜标签icon"
      />
      <p>打瓜</p>
    </li>
    <li
      :class="{ selected: isSelected == 'Gourd' }"
      @click="switchMapCrop('Gourd')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_hulu.png"
        alt="底部葫芦标签icon"
      />
      <p>葫芦</p>
    </li>
    <li
      :class="{ selected: isSelected == 'Family' }"
      @click="switchMapCrop('Family')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_nonghu.png"
        alt="底部人员标签icon"
      />
      <p>人员</p>
    </li>
    <li
      :class="{ selected: isSelected == 'Land' }"
      @click="switchMapCrop('Land')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_huangdi.png"
        alt="底部确权土地标签icon"
      />
      <p>确权土地</p>
    </li>
    <li
      :class="{ selected: isSelected == 'MobileLand' }"
      @click="switchMapCrop('MobileLand')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_tabbar_jidongdi.png"
        alt="底部机动地标签icon"
      />
      <p>机动地</p>
    </li>
    <li
      :class="{ selected: isSelected == 'OtherLand' }"
      @click="switchMapCrop('OtherLand')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_tabbar_other.png"
        alt="底部其他方式标签icon"
      />
      <p>其他方式</p>
    </li>
    <li
      :class="{ selected: isSelected == 'HighLand' }"
      @click="switchMapCrop('HighLand')"
    >
      <img
        class="icon"
        src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_tabbar_gaobiaozhun.png"
        alt="底部高标准农田标签icon"
      />
      <p>高标准农田</p>
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
      <li>
        <span style="background-color: #418bf5"></span>
        <p>确权土地</p>
      </li>
      <li>
        <span style="background-color: #800080"></span>
        <p>机动地</p>
      </li>
      <li>
        <span style="background-color: #ff379a"></span>
        <p>其他方式</p>
      </li>
      <li>
        <span style="background-color: #4c3df5"></span>
        <p>高标准农田</p>
      </li>
    </ul>
  </div>
  <van-popup
    v-model:show="popupShow"
    get-container="body"
    closeable
    round
    position="bottom"
    :style="{ padding: '20px', height: '80%' }"
    id="addLandPopup"
    @close="closePopup"
  >
    <div class="title">
      <p>{{ isEditLand ? "编辑地块详情信息" : "新增地块详情信息" }}</p>
    </div>
    <van-form
      @submit="onSubmit"
      required="auto"
      style="overflow: auto; height: 95%"
    >
      <van-cell-group title="承包人信息">
        <van-field
          v-model="popupForm.contractorCode"
          label="承包方编码"
          name="contractorCode"
          placeholder="请输入承包方编码"
          clearable
          :rules="[{ required: true, message: '请输入承包方编码' }]"
        ></van-field>
        <van-field
          v-model="popupForm.contractor"
          label="承包人"
          name="contractor"
          placeholder="请输入承包人"
          clearable
          :rules="[{ required: true, message: '请输入承包人' }]"
        ></van-field>
        <van-field
          v-model="popupForm.idCard"
          label="承包人身份证"
          required
          name="idCard"
          placeholder="请输入承包人身份证"
          :label-width="'6.8em'"
          clearable
          :rules="[{ validator: lesseeIdCard, message: '请输入承包人身份证' }]"
        ></van-field>
        <van-field
          v-model="popupForm.address"
          label="承包人地址"
          placeholder="请输入承包人地址"
          clearable
          rows="1"
          autosize
          type="textarea"
        ></van-field>
      </van-cell-group>
      <van-cell-group title="地块四至">
        <van-field
          v-model="popupForm.east"
          label="东至"
          placeholder="请输入地块东至"
          clearable
        ></van-field>
        <van-field
          v-model="popupForm.west"
          label="西至"
          placeholder="请输入地块西至"
          clearable
        ></van-field>
        <van-field
          v-model="popupForm.south"
          label="南至"
          placeholder="请输入地块南至"
          clearable
        ></van-field>
        <van-field
          v-model="popupForm.north"
          label="北至"
          placeholder="请输入地块北至"
          clearable
        ></van-field>
      </van-cell-group>
      <van-cell-group title="地块信息">
        <van-field
          v-model="popupForm.geom"
          label="地块边界"
          name="geom"
          placeholder="请选择地块边界"
          readonly
          :rules="[{ required: true, message: '请选择地块边界' }]"
        ></van-field>
        <van-field
          v-model="fieldValue"
          label="所属区域"
          name="regionId"
          placeholder="请选择所属区域"
          is-link
          readonly
          :rules="[{ required: true, message: '请选择所属区域' }]"
          @click="openRegionPopup()"
        >
        </van-field>
        <van-field
          v-model="popupForm.landCode"
          label="地块编码"
          name="landCode"
          placeholder="请输入地块编码"
          type="digit"
          clearable
          :rules="[{ required: true, message: '请填写地块编码' }]"
        ></van-field>
        <van-field
          label="地块类型"
          name="landType"
          placeholder="请选择地块类型"
          :rules="[{ required: true, message: '请选择地块类型' }]"
        >
          <template #input>
            <van-radio-group
              v-model="popupForm.landType"
              direction="horizontal"
            >
              <van-radio name="确权土地">确权土地</van-radio>
              <van-radio name="机动地">机动地</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-model="popupForm.contractArea"
          label="合同面积"
          name="contractArea"
          placeholder="请输入合同面积"
          type="number"
          clearable
          :rules="[{ required: true, message: '请填写合同面积' }]"
        >
          <template #button>
            <p>亩</p>
          </template>
        </van-field>
        <van-field
          v-model="popupForm.actualArea"
          label="实测面积"
          name="actualArea"
          placeholder="请输入实测面积"
          type="number"
          clearable
          :rules="[{ required: true, message: '请填写实测面积' }]"
        >
          <template #button>
            <p>亩</p>
          </template>
        </van-field>
        <van-field
          v-model="popupForm.cropName"
          label="作物名称"
          name="cropName"
          placeholder="请输入作物名称"
          clearable
          :rules="[{ required: true, message: '请填写作物名称' }]"
        ></van-field>
        <van-field
          v-model="popupForm.description"
          label="地块描述"
          placeholder="请输入地块描述"
          clearable
          rows="1"
          autosize
          type="textarea"
        ></van-field>
      </van-cell-group>
      <div style="margin: 16px">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          style="background-color: #5ea94a; border-color: #5ea94a"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </van-popup>
  <!-- 地区选择筛选 -->
  <van-popup
    v-model:show="showRegionPopup"
    round
    position="bottom"
    :style="{ padding: '20px', height: '80%' }"
  >
    <van-cascader
      v-model="popupForm.regionId"
      title="请选择筛选地区"
      :options="cascaderOptions"
      active-color="#5ea94a"
      @close="showRegionPopup = false"
      @finish="onSelectRegionFinish"
      @change="onSelectRegionChange"
    />
  </van-popup>
  <van-overlay
    :show="isUseToken"
    style="background: rgba(0, 0, 0, 0.9); z-index: 3000"
  >
    <van-loading
      v-if="isLoading"
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
      <van-icon name="cross" color="red" size="3rem" />
      <p>登录失败，请通知管理员</p>
    </div>
  </van-overlay>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import {
  showFailToast,
  showLoadingToast,
  closeToast,
  showSuccessToast,
  showConfirmDialog,
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
  getFamilyLocation,
  getHighLandJSON,
  getLandJSON,
  addNewLand,
  getLandInfoById,
  editLand,
  delLand,
} from "@/api/land.js";
import { getCityList } from "@/api/system";

const isUseToken = ref(true);

const isLoading = ref(true);

// 地图对象
let map = null;

// 聚合点标记对象
let markerGroup = null;

// 高标准农田矢量数据
let highLandGeoJSONLayer = null;

let cropData = {}; // 作物数据 geojson

let landData = {}; // 土地数据 geojson

const isSelected = ref("All"); // 存储当前选中的标记类型

//添加绘制图层
let drawGroupPolygon = null;

// 绘制编辑图层
let editableLayers = null;

// 编辑地块的geo信息
let editFeature = null;

// 编辑地块的图层
let editLandLayer = null;

const isEditLand = ref(false);

let drawGroup = null;

let polygon = null;

// 新增弹出框显示
const popupShow = ref(false);

// 弹窗表单数据
const popupForm = ref({
  contractorCode: "", // 承包方编码
  contractor: "", // 承包人
  idCard: "", // 身份证
  address: "", // 承包人地址
  landCode: "", // 地块编码
  regionId: "", // 区域ID
  description: "", // 地块描述
  east: "", // 地块冬至
  west: "", // 地块西至
  south: "", // 地块南至
  north: "", // 地块北至
  contractArea: "", // 合同面积
  actualArea: "", // 实际面积
  geom: "", // 地块边界
  village: "", // 所属村
  town: "", // 所属乡镇
  landType: "", // 地块类型
  cropName: "", // 作物名称
});

// 定义一个响应式变量 popupShow，用于控制弹出框的显示与隐藏
const showRegionPopup = ref(false);

// 定义一个响应式数组 cascaderOptions，用于存储级联选择器的选项
const cascaderOptions = ref([]);

// 定义一个响应式变量 fieldValue，用于存储输入框的值
const fieldValue = ref("");

const cityPid = ref("0");

// 身份证号码验证函数
const lesseeIdCard = (val) => {
  let data = val.toUpperCase();
  if (IdentityCodeValid(data)) {
    return true;
  } else if (val === "") {
    return "请输入身份证号码！";
  } else {
    return "请输入正确的身份证号码！";
  }
};

/**
 * 初始化页面
 */
function initPage() {
  map = L.map("map", {
    editable: true,
  }).setView([46.6287504, 83.03114605], 13);
  // 底图加载
  L.tileLayer(
    "https://t7.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=f78eabcb8cbd6865d9b58e29c0a68795",
  ).addTo(map);
  drawGroupPolygon = L.featureGroup().addTo(map);
  // map.addLayer(drawnItems);
  L.drawLocal.draw.handlers.polygon = {
    tooltip: {
      start: "点击地图开始绘制多边形",
      cont: "继续选择",
      end: "点击第一个顶点完成绘制",
    },
  };
  //画图创建事件
  map.on(L.Draw.Event.CREATED, (event) => {
    const { layer, layerType } = event;
    if (layerType === "polygon") {
      //layer.getLatLngs()得到的多边形的经纬度集合，多边形得到的是一个二维数组，这里要取里面的数组，一定要注意
      let latlng = layer.getLatLngs()[0];
      //一个自定义的计算面积的函数
      let area = "当前测量面积为：" + formatArea(latlng) + "";
      addMeasureMarker(
        area,
        [latlng[latlng.length - 1].lat, latlng[latlng.length - 1].lng],
        map,
        "area",
        layer,
      ); //把画图之后计算的结果添加到地图上
      drawGroupPolygon.addLayer(layer);
    }
  });

  loadFamilyMark();
}

// 获取面积
function formatArea(polygon) {
  //L.GeometryUtil.geodesicArea(),返回number类型的数据，单位是平方米，这里做了一下转化
  var seeArea = L.GeometryUtil.geodesicArea(polygon);
  let area = seeArea.toFixed(0) + "㎡";
  if (seeArea > 10e5) {
    area = (seeArea / 10e5).toFixed(2) + "k㎡";
  }
  return area;
}

/**
 * 加载家庭定位数据
 */
function loadFamilyMark() {
  // 页面配置数据，用于分页请求
  const page = {
    currentPage: 1,
    pageSize: 10000,
  };
  const toast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: "加载中...",
  });
  getFamilyLocation({
    pageNum: page.currentPage,
    pageSize: page.pageSize,
  })
    .then((result) => {
      closeToast();
      if (result.code !== 0) {
        showFailToast(result.msg);
        console.error("获取家庭定位数据失败：", result.msg);
        return;
      }
      // 创建一个新的 MarkerClusterGroup
      markerGroup = L.markerClusterGroup();
      // 遍历结果数据，创建并添加标记
      result.data.forEach((item) => {
        if (item.lat && item.lng) {
          const lat = item.lat;
          const lng = item.lng;
          const name = item.householdLeader;
          const address = item.address;

          // 自定义图标
          const myIcon = L.icon({
            iconUrl:
              "https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_ditu_location.png",
            iconSize: [40, 45],
            popupAnchor: [0, -20],
          });

          // 创建标记并绑定弹出框
          const customMarker = L.marker([lat, lng], { icon: myIcon })
            .bindPopup(
              `
        <div style="display:flex;flex-direction: column;align-items: flex-start;">
          <p style="margin:0 0 5px 0;font-weight:600;">${name}</p>
          <p style="margin:0">${address}</p>
        </div>
      `,
            )
            .addTo(markerGroup);
        }
      });
      // 将 MarkerClusterGroup 添加到地图
      markerGroup.addTo(map);
      if (isSelected.value === "All") {
        loadHighLandGeoJSON();
      }
    })
    .catch((err) => {
      console.error("获取接口出错信息：", err);
      closeToast();
      showFailToast(err);
    });
}

/**
 * 加载高标准农田矢量数据
 */
function loadHighLandGeoJSON() {
  const toast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: "加载中...",
  });
  getHighLandJSON()
    .then((result) => {
      closeToast();
      if (result.code !== 0) {
        showFailToast(result.msg);
        console.error("获取高标准土地GeoJSON数据失败：", result.msg);
        return;
      }
      const needData = JSON.parse(result.data);
      highLandGeoJSONLayer = L.geoJSON(needData, {
        style: (feature) => {
          return {
            fillColor: "#4C3DF5",
            weight: 1,
            opacity: 0.1,
            color: "white", // 边界颜色
            fillOpacity: 0.7,
          };
        },
      }).addTo(map);
      // 将图层移动到最底层
      highLandGeoJSONLayer.bringToBack();
      if (isSelected.value === "All") {
        loadGeoJSON();
      }
    })
    .catch((err) => {
      console.error("获取接口出错信息：", err);
      closeToast();
      showFailToast(err);
    });
}

/**
 * 加载GeoJSON数据
 * @param {String} cropName - 作物名称
 * @param {String} landType - 土地类型
 */
function loadGeoJSON(cropName, landType) {
  const toast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: "加载中...",
  });
  getLandJSON()
    .then((result) => {
      closeToast();
      if (result.code !== 0) {
        showFailToast(result.msg);
        console.error(
          "获取指定区域下的所有耕地的信息geo-json格式失败：",
          result.msg,
        );
        return;
      }
      cropData = {
        corn: [
          {
            type: "FeatureCollection",
            features: [],
          },
        ], // 玉米
        wheat: [
          {
            type: "FeatureCollection",
            features: [],
          },
        ], // 小麦
        melon: [
          {
            type: "FeatureCollection",
            features: [],
          },
        ], // 打瓜
        gourd: [
          {
            type: "FeatureCollection",
            features: [],
          },
        ], // 葫芦
      }; // 作物数据 geojson
      landData = {
        land: [
          {
            type: "FeatureCollection",
            features: [],
          },
        ], // 确权土地
        mobile: [
          {
            type: "FeatureCollection",
            features: [],
          },
        ], // 机动地
        other: [
          {
            type: "FeatureCollection",
            features: [],
          },
        ], // 其他方式
      }; // 土地数据 geojson

      const needData = JSON.parse(result.data);
      needData.features.forEach((feature) => {
        switch (feature.properties.land_type) {
          case "机动地":
            landData.mobile[0].features.push(feature);
            break;
          case "确权土地":
            landData.land[0].features.push(feature);
            break;
          case "其他方式":
            landData.other[0].features.push(feature);
            break;
          default:
            break;
        }
        switch (feature.properties.crop_name) {
          case "玉米":
            cropData.corn[0].features.push(feature);
            break;
          case "小麦":
            cropData.wheat[0].features.push(feature);
            break;
          case "打瓜":
            cropData.melon[0].features.push(feature);
            break;
          case "葫芦":
            cropData.gourd[0].features.push(feature);
            break;
          default:
            break;
        }
      });

      // 定义颜色映射
      const cropColors = {
        玉米: "#FFDA3A",
        打瓜: "#FF5252",
        小麦: "#BF922E",
        葫芦: "#60FF80",
      };
      const landColors = {
        确权土地: "#418BF5",
        机动地: "#800080",
        其他方式: "#ff379a",
      };

      // 定义样式函数
      const styleFunction = (feature) => {
        const cropName = feature.properties.crop_name;
        const landName = feature.properties.land_type;
        const color = cropColors[cropName] || landColors[landName];
        return {
          fillColor: color,
          weight: 1,
          opacity: 0.1,
          color: "white", // 边界颜色
          fillOpacity: 0.7,
        };
      };

      // 添加点击事件
      const onEachFeature = (feature, layer) => {
        layer.on({
          click: () => {
            const cropName = feature.properties.crop_name || "暂无";
            const landName = feature.properties.land_type;
            editFeature = feature;
            editLandLayer = layer;
            const popupContent = `
      <div style="display:flex;flex-direction: column;align-items: flex-start; width: 140px;">
                      <p style="margin:0 0 5px 0;"><strong>作物名称:</strong> ${cropName}</p>
                      <p style="margin:0"><strong>土地类型:</strong> ${landName}</p>
       <button class="popup-edit-btn" id="viewLandBtn" onclick="handleEditLandClick('${feature.properties.id}')">编辑地块详情</button>
       <button class="popup-del-btn" id="viewLandBtn" onclick="handleDelLandClick('${feature.properties.id}')">删除该地块</button>
                    </div>
            `;
            // 绑定弹窗
            layer.bindPopup(popupContent).openPopup();
            //   添加自定义事件处理函数
            window.handleEditLandClick = (id) => {
              getLandById(id);
            };
            window.handleDelLandClick = (id) => {
              delLandById(id);
            };
          },
        });
      };

      // 清除现有的作物和土地图层
      map.eachLayer((layer) => {
        if (
          layer instanceof L.GeoJSON &&
          layer.options.layerType === "cropOrLand"
        ) {
          map.removeLayer(layer);
        }
      });

      // 根据参数加载特定的数据
      if (cropName) {
        if (cropData[cropName]) {
          const geojsonData = cropData[cropName][0];
          if (geojsonData.features.length > 0) {
            L.geoJSON(geojsonData, {
              style: styleFunction,
              onEachFeature: onEachFeature,
              layerType: "cropOrLand", // 添加标识
            }).addTo(map);
          }
        }
      }

      if (landType) {
        if (landData[landType]) {
          const geojsonData = landData[landType][0];
          if (geojsonData.features.length > 0) {
            L.geoJSON(geojsonData, {
              style: styleFunction,
              onEachFeature: onEachFeature,
              layerType: "cropOrLand", // 添加标识
            }).addTo(map);
          }
        }
      }

      // 如果没有参数，加载所有数据
      if (!cropName && !landType) {
        // 添加作物图层
        Object.keys(cropData).forEach((crop) => {
          const geojsonData = cropData[crop][0];
          if (geojsonData.features.length > 0) {
            L.geoJSON(geojsonData, {
              style: styleFunction,
              onEachFeature: onEachFeature,
              layerType: "cropOrLand", // 添加标识
            }).addTo(map);
          }
        });

        // 添加土地图层
        Object.keys(landData).forEach((land) => {
          const geojsonData = landData[land][0];
          if (geojsonData.features.length > 0) {
            L.geoJSON(geojsonData, {
              style: styleFunction,
              onEachFeature: onEachFeature,
              layerType: "cropOrLand", // 添加标识
            }).addTo(map);
          }
        });
      }
    })
    .catch((err) => {
      console.error("获取接口出错信息：", err);
      closeToast();
      showFailToast(err);
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
 * 切换地图
 * @param {string} landType - 地块类型
 */
function switchMapCrop(landType) {
  if (highLandGeoJSONLayer) {
    map.removeLayer(highLandGeoJSONLayer);
  }

  // 如果 markerGroup 已经存在，先从地图上移除
  if (markerGroup) {
    map.removeLayer(markerGroup);
  }

  // 清除现有的作物和土地图层
  map.eachLayer((layer) => {
    if (
      layer instanceof L.GeoJSON &&
      layer.options.layerType === "cropOrLand"
    ) {
      map.removeLayer(layer);
    }
  });

  switch (landType) {
    case "All":
      isSelected.value = "All";
      loadFamilyMark();
      break;
    case "Wheat":
      isSelected.value = "Wheat";
      loadGeoJSON("wheat");
      break;
    case "Corn":
      isSelected.value = "Corn";
      loadGeoJSON("corn");
      break;
    case "Melon":
      isSelected.value = "Melon";
      loadGeoJSON("melon");
      break;
    case "Gourd":
      isSelected.value = "Gourd";
      loadGeoJSON("gourd");
      break;
    case "Family":
      isSelected.value = "Family";
      loadFamilyMark();
      break;
    case "Land":
      isSelected.value = "Land";
      loadGeoJSON("", "land");
      break;
    case "MobileLand":
      isSelected.value = "MobileLand";
      loadGeoJSON("", "mobile");
      break;
    case "OtherLand":
      isSelected.value = "OtherLand";
      loadGeoJSON("", "other");
      break;
    case "HighLand":
      isSelected.value = "HighLand";
      loadHighLandGeoJSON();
      break;
    default:
      break;
  }
}

/**
 * 添加地块
 */
function addLand() {
  polygon = new L.Draw.Polygon(map, {
    shapeOptions: {
      weight: 2,
      color: "#fff",
      opacity: 0.8,
      fillColor: "#fff",
    },
  });
  polygon.enable();
}

/**
 * 关闭弹出框
 */
function closePopup() {
  map.eachLayer(function (layer) {
    if (layer.id == "measureMarker") {
      map.removeLayer(layer);
    }
  });
  drawGroupPolygon.clearLayers();
  popupShow.value = false;
}

/**
 * 新增测量结果
 * @param text
 * @param latlng
 * @param groupLayer
 * @param key
 * @param bounds
 */
function addMeasureMarker(text, latlng, groupLayer, key, bounds) {
  var myIcon = L.divIcon({
    // html: text,
    className: "my-div-icon",
    iconSize: [80, 26],
  });
  let html = `<div class='popupDiv2'>
                <div>
                  <h3>测量数据</h3>
                </div>
                <p>${text}</p>`;

  if (key == "area") {
    //当前为绘制
    html += `<div><button type="button" class="popup-view-btn" onclick='changeDetails()'>新增此绘制地块</button></div>`;
  }
  html += "</div>";
  const popup = L.popup().setContent(html);
  let markers = L.marker(latlng, { icon: myIcon });
  markers.id = "measureMarker";
  window.changeDetails = function (i) {
    let data = bounds.toGeoJSON();
    let datas = WKT.convert(data.geometry);
    let datasNew = datas.replace("POLYGON (", "POLYGON(");
    popupShow.value = true;
    popupForm.value.geom = datasNew;
    // that.farmform.geom = datasNew;
    // that.farmformModal = true;
  };
  markers
    .addTo(groupLayer)
    .bindPopup(popup, { className: "mydivicon" })
    .openPopup();
}

/*
 * 提交数据
 */
function onSubmit() {
  let toast = showLoadingToast({
    message: "提交中...",
    forbidClick: true,
  });
  let postData = popupForm.value;
  if (isEditLand) {
    editLand(postData)
      .then((result) => {
        if (result.code !== 0) {
          showFailToast(result.msg);
          console.error("编辑地块数据失败：", result.msg);
          return;
        }
        showSuccessToast("提交成功");
        popupShow.value = false;
        isSelected.value = "All";
        isEditLand.value = false;
        editFeature = null;
        editLandLayer.enableEdit();
        editableLayers = null;
        loadFamilyMark();
      })
      .catch((err) => {
        console.error("提交接口出错信息：", err);
        closeToast();
        showFailToast(err);
      });
  } else {
    addNewLand(postData)
      .then((result) => {
        closeToast();
        if (result.code !== 0) {
          showFailToast(result.msg);
          console.error("提交新增地块数据失败：", result.msg);
          return;
        }
        showSuccessToast("提交成功");
        popupShow.value = false;
        isSelected.value = "All";
        loadFamilyMark();
      })
      .catch((err) => {
        console.error("提交接口出错信息：", err);
        closeToast();
        showFailToast(err);
      });
  }
}

function openRegionPopup() {
  getCity();
  if (!showRegionPopup.value) {
    // 将popupShow设置为true，显示弹窗
    showRegionPopup.value = true;
  }
}

/**
 * 判断数组中是否存在具有指定属性值的对象
 *
 * @param {Array} arr - 需要检查的数组，预计每个元素是一个对象
 * @param {string} propertyName - 需要检查的对象属性名称
 * @param {*} propertyValue - 需要检查的对象属性值
 * @returns {boolean} - 如果数组中存在具有指定属性值的对象，则返回true，否则返回false
 */
function hasObjectWithProperty(arr, propertyName, propertyValue) {
  // 使用Array.prototype.some方法遍历数组中的每个对象，检查指定属性是否等于指定值
  return arr.some((obj) => obj[propertyName] === propertyValue);
}

/**
 * @description 检查两个数组是否重复
 * @param {Array} mainArray 原本的数组
 * @param {Array} subArray 结果数组
 */
function containsAll(mainArray, subArray) {
  // 使用 Set 来存储 mainArray 中的元素，以便进行快速查找
  const mainSet = new Set(mainArray);
  // 检查 subArray 中的每个元素是否都在 mainSet 中
  for (const item of subArray) {
    if (!mainSet.has(item)) {
      // 如果 subArray 中的某个元素不在 mainSet 中，则返回 false
      return false;
    }
  }
  // 如果所有元素都在 mainSet 中，则返回 true
  return true;
}

/**
 * 获取城市列表并更新级联选择框的数据
 * 此函数从服务端获取城市列表数据，并根据父级ID将数据分类，更新到级联选择框中
 */
function getCity() {
  // 显示加载中的Toast提示
  showLoadingToast({
    message: "加载中...",
    forbidClick: true,
  });
  // 调用接口获取城市列表，传入上级城市ID
  getCityList({
    pid: cityPid.value,
  })
    .then((result) => {
      // 加载完成，关闭Toast提示
      closeToast();
      // 如果请求成功，处理并更新级联选择框的数据
      if (result.code === 0) {
        // 遍历结果集，根据不同的父级ID将数据分类并添加到对应的级联选择框中
        result.data.map((item) => {
          switch (item.pid) {
            // 如果是顶级城市，直接添加到最顶层级联选择框
            case 0:
              if (
                !hasObjectWithProperty(cascaderOptions.value, "code", item.code)
              ) {
                cascaderOptions.value.push({
                  text: item.name,
                  value: item.id,
                  code: item.code,
                  children: [],
                });
              }
              break;
            // 如果是二级城市，添加到第一层子级联选择框
            case 1:
              if (
                !hasObjectWithProperty(
                  cascaderOptions.value[0].children,
                  "code",
                  item.code,
                )
              ) {
                cascaderOptions.value[0].children.push({
                  text: item.name,
                  value: item.id,
                  code: item.code,
                  children: [],
                });
              }
              break;
            // 对于其他父级ID，遍历已有的子元素并找到对应的父节点添加数据项
            default:
              cascaderOptions.value[0].children.forEach((pItem, pIndex) => {
                if (
                  pItem.value === item.pid &&
                  !containsAll(
                    cascaderOptions.value[0].children[pIndex].children,
                    result.data,
                  ) &&
                  !hasObjectWithProperty(
                    cascaderOptions.value[0].children[pIndex].children,
                    "code",
                    item.code,
                  )
                ) {
                  cascaderOptions.value[0].children[pIndex].children.push({
                    value: item.id,
                    text: item.name,
                    code: item.code,
                  });
                }
              });
              break;
          }
        });
      } else {
        // 如果请求失败，打印错误信息并显示失败Toast提示
        console.error("获取城市列表失败", result.msg);
        showFailToast(result.msg);
      }
    })
    .catch((err) => {
      // 请求失败，关闭Toast提示并打印错误信息
      closeToast();
      console.error("获取城市列表失败", err);
    });
}

/**
 * 当选择的城市变化时调用此函数
 * @param {Object} value - 一个包含城市信息的对象
 * 此函数的目的是更新cityPid的值，并重新调用getCity函数以获取新的城市数据
 */
function onSelectRegionChange(value) {
  // 更新cityPid的值为选择的城市的值
  cityPid.value = value.value;
  // 调用getCity函数，获取新的城市数据
  getCity();
}

/**
 * 处理级联选择器完成事件的函数
 * 当用户完成选择时，此函数会更新搜索值和字段值
 * 同时关闭弹出框显示状态
 *
 * @param {Object} value - 级联选择器传递的值对象
 * 此对象包含selectedOptions属性，该属性是一个数组
 * 数组中的每个元素是一个选择项对象，包含code和text属性
 */
function onSelectRegionFinish(value) {
  // 更新搜索值的regionCode属性
  popupForm.value.regionId =
    value.selectedOptions[value.selectedOptions.length - 1].value;

  // 更新字段值
  // 将级联选择器中所有选中项的text属性值连接成一个字符串
  // 用"/"分隔
  fieldValue.value = value.selectedOptions
    .map((option) => option.text)
    .join("/");

  // 关闭弹出框显示状态
  showRegionPopup.value = false;
}

/**
 * 根据ID获取地块信息
 * @param {number} id - 地块的唯一标识符
 */
function getLandById(id) {
  // 显示加载中的Toast消息，设置持续时间为0，禁止点击，并显示加载中的消息
  const toast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: "加载中...",
  });
  // 调用后端接口，根据ID获取地块信息
  getLandInfoById(id)
    .then((result) => {
      // 关闭加载中的Toast消息
      closeToast();
      // 检查获取地块信息的结果代码
      if (result.code !== 0) {
        // 如果结果代码不为0，显示失败的Toast消息，并记录错误日志
        showFailToast(result.msg);
        console.error("获取地块信息失败：", result.msg);
        return;
      }
      // 将获取到的地块信息填充到弹窗表单中
      popupForm.value = result.data;
      // 将几何信息转换为可编辑的GeoJSON格式
      popupForm.value.geom = WKT.convert(editFeature.geometry);
      // 设置几何信息为可编辑的GeoJSON格式
      editableGeojson();
    })
    .catch((err) => {
      // 如果获取接口出错，记录错误日志，关闭加载中的Toast消息，并显示失败的Toast消息
      console.error("获取接口出错信息：", err);
      closeToast();
      showFailToast(err);
    });
}

/**
 * 启用GeoJSON图层编辑功能
 * 此函数用于将土地图层切换到编辑模式，包括更新图层样式、添加到可编辑图层组、以及设置编辑事件监听器
 */
function editableGeojson() {
  // 设置土地图层为编辑状态
  isEditLand.value = true;
  // 创建一个新的可编辑图层组，并将其添加到地图中
  editableLayers = new L.FeatureGroup();
  map.addLayer(editableLayers);
  // 定义当前图层为将要编辑的土地图层
  let currentLayer = editLandLayer;
  // 更新当前图层的样式，以便在编辑时更清晰可见
  currentLayer.setStyle({
    fillColor: "red",
    weight: 2,
    opacity: 1,
    color: "#fff",
    fillOpacity: 0.4,
  });
  // 为当前图层设置一个唯一的标识符
  currentLayer.id = "editLandLayer";
  // 将当前图层添加到可编辑图层组中
  editableLayers.addLayer(currentLayer);
  // 关闭编辑图层的弹出框
  editLandLayer.closePopup();
  // 启用当前图层的编辑功能
  editLandLayer.enableEdit();
  /**
   * 监听编辑事件，当编辑发生时，更新popupForm中的几何数据
   * 此事件处理函数遍历可编辑图层组中的所有图层，寻找特定的编辑图层，
   * 并将其编辑后的地理坐标转换为WKT格式，然后更新在popupForm中的值
   */
  editLandLayer.on("editable:editing", () => {
    let data = null;
    for (let key in editableLayers._layers) {
      let ids = editableLayers._layers[key].id;
      if (ids == "editLandLayer") {
        data = editableLayers._layers[key].editing.latlngs[0][0];
        popupForm.value.geom = convertToWKT(data);
      }
    }
  });
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

/**
 * 删除地块
 * @param {String} id - 要删除的地块ID
 */
function delLandById(id) {
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
      delLand(id)
        .then((result) => {
          // 关闭加载中的Toast提示
          closeToast();
          // 如果请求成功，处理结果数据
          if (result.code === 0) {
            showSuccessToast("删除成功");
            popupShow.value = false;
            isSelected.value = "All";
            isEditLand.value = false;
            editFeature = null;
            editLandLayer = null;
            editableLayers = null;
            loadFamilyMark();
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
    .catch(() => {
      // on cancel
    });
}

onMounted(() => {
  if (localStorage.getItem("Token")) {
    isLoading.value = false;
    isUseToken.value = false;
    initPage();
  } else {
    isLoading.value = false;
  }
});
</script>

<style scoped lang="scss">
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
  width: 160px;
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
</style>
