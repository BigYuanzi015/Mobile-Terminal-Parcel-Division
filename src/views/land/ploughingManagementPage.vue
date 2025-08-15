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
  <div v-if="!isEditLand" class="right-btn" @click="addLand">
    <img
      alt="新增地块Icon"
      class="icon"
      src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_right_add.png"
    />
    <p>新增地块</p>
  </div>
  <div
    v-if="!isEditLand"
    class="right-btn right-btn-list"
    @click="handleLandList"
  >
    <img
      alt="地块列表Icon"
      class="icon"
      src="https://soi.zhxtypt.com:9013/wxapp/map_HTML_icon/icon_right_add.png"
    />
    <p>地块列表</p>
  </div>
  <div v-if="isEditLand" class="right-btn" @click="successEdit">
    <van-icon class="icon" color="#5ea94a" name="success" size="26" />
    <p>完成编辑</p>
  </div>
  <!-- 底部显示确权土地切换 -->
  <ul id="bottomListCon" class="bottom-list-content">
    <li
      :class="{ selected: isSelected == 'All' }"
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
      :class="{ selected: isSelected == 'Wheat' }"
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
      :class="{ selected: isSelected == 'Corn' }"
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
      :class="{ selected: isSelected == 'Melon' }"
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
      :class="{ selected: isSelected == 'Gourd' }"
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
    closeable
    get-container="body"
    position="bottom"
    round
    @close="closePopup"
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
          @click="showCropIdPopup = true"
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
          @click="showDatePickerPopup = true"
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
  <van-popup
    id="addLandPopup"
    v-model:show="popupListShow"
    :style="{ padding: '20px', height: '80%' }"
    closeable
    get-container="body"
    position="bottom"
    round
    @close="closePopup"
    @click-close-icon="closePopup"
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
  </van-popup>
  <van-popup v-model:show="showCropIdPopup" position="bottom" round>
    <van-picker
      :columns="cropTypeList"
      @cancel="showCropIdPopup = false"
      @confirm="cropIdPopupConfirm"
    />
  </van-popup>
  <van-popup v-model:show="showDatePickerPopup" position="bottom" round>
    <van-date-picker
      v-model="plantTime"
      :readonly="isCheck"
      title="选择种植日期"
      @cancel="showDatePickerPopup = false"
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
import country from "../../utils/country";
import village from "../../utils/village";

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
 * 验证手机号
 */
const lesseePhone = (val) => {
  let reg =
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
  if (reg.test(val)) {
    return true;
  } else if (val == "") {
    return "请输入联系电话！";
  } else {
    return "请输入正确的联系电话！";
  }
};

const hasToken = ref(true); // 是否使用token
const hasTokenLoading = ref(true); // 是否加载中
const landListLoading = ref(false); // 地块列表加载中
const finished = ref(false); // 地块列表是否加载完毕
const isSelected = ref("All"); // 存储当前选中的标记类型
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
const popupFormBackUp = ref({}); // 弹窗表单数据备份
const pageParams = {
  currentPage: 1,
  pageSize: 10000,
}; // 查询参数
const showCropIdPopup = ref(false); // 控制作物选择弹窗状态
const springPlowingLise = ref([]); // 春耕地块信息列表
const isCheck = ref(false); // 是否为查看状态
const landList = ref([]); // 地块列表
const editId = ref(""); // 编辑地块id
const landData = ref([]); // 地块数据
const drawType = ref("add"); // 新增地块类型
const showDatePickerPopup = ref(false); // 日期选择弹窗
let map = null; // 地图对象
let cropData = {}; // 作物数据 geojson
let polygonjson = null; // 多边形图层
let layerMarker = []; // 图层标记
let params = {
  pageNum: 1,
  pageSize: 10,
}; // 查询数据参数
let drawGroupPolygon = null; //添加绘制图层
let editableLayers = null; // 绘制编辑图层
let editFeature = null; // 编辑地块的geo信息
let editLandLayer = null; // 编辑地块的图层
let cropTypeList = []; // 作物列表数据
let polygon = null; // 绘制的多边形对象

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
  showDatePickerPopup.value = false;
}

// 获取地理定位
// function getLocation() {
//   if ("geolocation" in navigator) {
//     // 支持 geolocation
//     navigator.geolocation.getCurrentPosition(function (position) {
//       return position;
//     });
//   } else {
//     // 不支持 geolocation
//     showFailToast("您的浏览器不支持地理位置功能。");
//   }
// }

function addProvLayers(states, maps, key) {
  if (polygonjson != null) {
    polygonjson.clearLayers();
  }
  if (layerMarker.length > 0) {
    for (let i = 0; i < layerMarker.length; i++) {
      maps.removeLayer(layerMarker[i]);
    }
    layerMarker = [];
  }
  let that = this;
  map.eachLayer(function (layer) {
    if (layer.id == "layerMarker") {
      map.removeLayer(layer);
    }
  });
  polygonjson = L.geoJSON(states, {
    style: function (feature) {
      return {
        fillColor: "#fff",
        weight: key == "country" ? 2 : 4,
        opacity: 1,
        color: key == "country" ? "#fc3d66" : "#fff",
        fillOpacity: 0,
        dashArray: key == "country" ? 5 : 0,
      };
    },
    onEachFeature: function (feature, layer) {
      if (feature.geometry.type === "Polygon") {
        let name = "";
        if (key == "village") {
          name = feature.properties.O_Name;
        } else {
          name = feature.properties.name;
        }
        if (name) {
          var bounds = layer.getBounds().getCenter();
          let myicon = L.divIcon({
            html: name,
            className: "leaflet_village",
          });
          let markers = L.marker(bounds, { icon: myicon });

          layerMarker.push(markers);
        }
      }
    },
  });
  let layers = L.layerGroup(layerMarker);
  layers.id = "layerMarker";
  layers.addTo(maps);
  polygonjson.setZIndex(1);
  polygonjson.addTo(maps);
}

// 地块选择确认
function cropIdPopupConfirm({ selectedOptions }) {
  showCropIdPopup.value = false;
  popupForm.value.cropId = selectedOptions[0].value;
  popupForm.value.cropName = selectedOptions[0].text;
}

/**
 * 初始化页面
 */
function initPage() {
  map = L.map("map", {
    editable: true,
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

  drawGroupPolygon = L.featureGroup().addTo(map);
  // map.addLayer(drawnItems);
  L.drawLocal.draw.handlers.polygon = {
    tooltip: {
      start: "点击地图开始绘制多边形",
      cont: "继续选择",
      end: "点击第一个顶点完成绘制",
    },
  };
  addProvLayers(village, map, "village");
  //画图创建事件
  map.on(L.Draw.Event.CREATED, (event) => {
    const { layer, layerType } = event;
    if (layerType === "polygon") {
      //layer.getLatLngs()得到的多边形的经纬度集合，多边形得到的是一个二维数组，这里要取里面的数组，一定要注意
      let latlng = layer.getLatLngs()[0];
      //一个自定义的计算面积的函数
      let area = formatArea(latlng);

      drawGroupPolygon.addLayer(layer);
      addMeasureMarker(
        area,
        [latlng[latlng.length - 1].lat, latlng[latlng.length - 1].lng],
        map,
        "area",
        layer,
      ); //把画图之后计算的结果添加到地图上
    }
  });
  getTodayDate();
  loadSpringCropList();
  loadSpringCropJson();
  loadSpringPlowingLise();
}

/**
 * 完成编辑
 */
function successEdit() {
  if (isEditLand.value) {
    onSubmit();
    popupShow.value = false;
    isSelected.value = "All";
    isEditLand.value = false;
    editFeature = null;
    editLandLayer = null;
    editableLayers = null;
    loadSpringCropJson();
    loadSpringPlowingPage(params);
  } else {
    console.log(polygon);
    const { layer } = polygon;
    let latlng = polygon.getLatLngs()[0];
    //一个自定义的计算面积的函数
    let area = formatArea(latlng);

    drawGroupPolygon.addLayer(polygon);
    addMeasureMarker(
      area,
      [latlng[latlng.length - 1].lat, latlng[latlng.length - 1].lng],
      map,
      "area",
      polygon,
    ); //把画图之后计算的结果添加到地图上
  }
}

// 新增地块按钮点击
function handleAdd() {
  popupShow.value = true;
}

// 地块列表按钮点击
function handleLandList() {
  params = {
    pageNum: 1,
    pageSize: 10,
  };
  popupListShow.value = true;
  loadSpringPlowingPage(params, "init");
}

// 地块列表下拉刷新
function landListLoad() {
  params.pageNum = params.pageNum++;
  loadSpringPlowingPage(params);
}

// 地块列表数据编辑事件
function handleLandListEdit(id, type) {
  if (type === "check") {
    isCheck.value = true;
  } else {
    isCheck.value = false;
  }
  const detail = springPlowingLise.value.find((item) => item.surveyId == id);
  plantTime.value = detail.plantTime || [];
  // 将获取到的地块信息填充到弹窗表单中
  popupForm.value = detail;
  isEditLand.value = true;
  popupShow.value = true;
}

// 地块列表地块编辑事件
function handleLandEdit(id) {
  const detail = springPlowingLise.value.find((item) => item.surveyId == id);
  editId.value = id;
  popupForm.value = detail;
  popupListShow.value = false;
  const geom = landData.value.features.find((item) => item.properties.id == id);
  if (geom) {
    map.setView(
      [geom.geometry.coordinates[0][0][1], geom.geometry.coordinates[0][0][0]],
      14,
    );
    handleEditLandClick(id);
  } else {
    addLand();
  }
}

let points = [];

let timer;

//清除多边形
const deleteDraw = () => {
  map.removeLayer(polygon);
};

/**
 * 添加地块
 */
function addLand() {
  if (polygon) {
    deleteDraw();
  }
  points = [];
  popupFormBackUp.value = popupForm.value;
  popupShow.value = false;
  showFailToast("开始绘制地块");
  polygon = new L.polygon(points, { color: "#fff" }).addTo(map);
  //取消默认双击放大地图事件
  map.off("dblclick");
  map.on("click", onClick);

  function onClick(e) {
    // 先清定时器
    clearTimeout(timer);
    timer = setTimeout(() => {
      isEditLand.value = true;

      // 再延迟执行
      points.push([e.latlng.lat, e.latlng.lng]);
      polygon.setLatLngs(points);
      map.on("mousemove", onMove);
      map.on("dblclick", onDoubleClick);
      console.log("click", polygon._latlngs[0]);
      isEditLand.value = false;
      successEdit();
    }, 50);
  }

  function onMove(e) {
    points.push([e.latlng.lat, e.latlng.lng]);
    polygon.setLatLngs(points);
    points.pop();
  }

  function onDoubleClick(e) {
    clearTimeout(timer);
    map.off("click");
    map.off("mousemove");
    isEditLand.value = false;
    successEdit();
  }

  // popupFormBackUp.value = popupForm.value;
  // popupShow.value = false;
  // isEditLand.value = false;

  // polygon = new L.Draw.Polygon(map, {
  //   shapeOptions: {
  //     weight: 2,
  //     color: "#fff",
  //     opacity: 0.8,
  //     fillColor: "#fff",
  //   },
  // });
  // polygon.enable();
}

/**
 * 新增测量结果
 * @param text
 * @param latlng
 * @param groupLayer
 * @param key
 * @param bounds
 */
function addMeasureMarker(area, latlng, groupLayer, key, bounds) {
  var myIcon = L.divIcon({
    // html: text,
    className: "my-div-icon",
    iconSize: [80, 26],
  });
  let html = `<div class='popupDiv2'>
                <div>
                  <h3>测量数据</h3>
                </div>
                <p>当前测量面积为：${area} 亩</p>`;

  if (key == "area") {
    //当前为绘制
    html += `<div><button type="button" class="popup-view-btn" onclick='changeDetails()'>新增此绘制地块</button></div>
    <div><button type="button" class="popup-del-btn" onclick='cancelDetails()'>取消此绘制地块</button></div>`;
  }
  html += "</div>";
  const popup = L.popup().setContent(html);
  let markers = L.marker(latlng, { icon: myIcon });
  markers.id = "measureMarker";

  window.changeDetails = function (i) {
    let data = bounds.toGeoJSON();
    let datas = WKT.convert(data.geometry);
    let datasNew = datas.replace("POLYGON (", "POLYGON(");
    let detail = springPlowingLise.value.find(
      (item) => item.surveyId == editId.value,
    );
    if (!detail) {
      detail = popupFormBackUp.value;
    }
    clearTimeout(timer);
    map.off("click");
    map.off("mousemove");
    detail.geom = datasNew;
    popupForm.value = detail;
    popupForm.value.stArea = area;
    // popupForm.value.area = area;
    isEditLand.value = true;
    if (drawType.value == "add") {
      popupShow.value = true;
      isEditLand.value = false;
      return;
    } else {
      onSubmit();
    }
    // that.farmform.geom = datasNew;
    // that.farmformModal = true;
    markers
      .addTo(groupLayer)
      .bindPopup(popup, { className: "mydivicon" })
      .openPopup();
  };
  window.cancelDetails = function (i) {
    groupLayer.closePopup();
    map.removeLayer(bounds);
  };
  markers
    .addTo(groupLayer)
    .bindPopup(popup, { className: "mydivicon" })
    .openPopup();
}

/**
 * 该函数用于加载春季作物列表
 * 它通过调用`getSpringCropList`方法获取数据，并将结果解析为一个包含作物名称和ID的数组
 */
function loadSpringCropList() {
  getSpringCropList(pageParams).then((result) => {
    // 检查结果状态码是否为0，表示请求成功
    if (result.code === 0) {
      // 将获取到的作物数据映射为一个新数组，每个元素包含作物名称(text)和作物ID(value)
      cropTypeList = result.data.map((item) => {
        return {
          text: item.cropName,
          value: item.cropId,
        };
      });
    }
  });
}

/**
 * 加载春季作物的GeoJSON数据
 * 此函数负责从服务器获取指定作物的GeoJSON数据，并在地图上绘制相应的图层
 * 它首先显示一个加载中的toast，然后根据作物ID获取数据
 * 如果获取成功，它会解析JSON数据，清除现有的作物和土地图层，并根据作物类型添加新的图层
 * 如果获取失败，它会显示一个失败的toast并记录错误信息
 *
 * @param {string} cropName - 作物名称，用于筛选特定的作物图层，如果不传则加载所有作物图层
 * @param {number} id - 作物ID，用于获取特定作物的数据
 */
function loadSpringCropJson(cropName, id) {
  // 显示加载中的toast
  const toast = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: "加载中...",
  });

  // 获取春季作物的JSON数据
  getSpringCropJson({ cropId: id })
    .then((result) => {
      // 关闭加载中的toast
      closeToast();

      // 检查返回结果的状态码
      if (result.code !== 0) {
        // 如果状态码不为0，显示失败的toast并记录错误信息
        showFailToast(result.msg);
        console.error(
          "获取指定区域下的所有耕地的信息geo-json格式失败：",
          result.msg,
        );
        return;
      }

      // 定义作物数据的结构
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

      // 解析获取到的JSON数据
      landData.value = JSON.parse(result.data);
      const needData = JSON.parse(result.data);

      // 清除现有的作物和土地图层
      map.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer);
        }
      });

      // 如果数据为空，则直接返回
      if (JSON.stringify(needData.features) === "null") {
        return;
      }

      // 根据作物名称将数据分类
      needData.features.forEach((feature) => {
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

      // 定义样式函数
      const styleFunction = (feature) => {
        const cropName = feature.properties.crop_name;
        const color = cropColors[cropName];
        console.log(color);
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
            editFeature = feature;
            editLandLayer = layer;
            let popupContentData = null;
            popupContentData = springPlowingLise.value.find(
              (item) => item.surveyId == feature.properties.id,
            );
            const popupContent = `
      <div style="display:flex;flex-direction: column;align-items: flex-start; width: 140px;">
                      <p style="margin:0 0 5px 0;"><strong>负责人:</strong> ${
                        popupContentData.name
                      }</p>
                      <p style="margin:0 0 5px 0;"><strong>种植作物:</strong> ${
                        popupContentData
                          ? popupContentData.cropName
                          : "暂无信息"
                      }</p>
                      <p style="margin:0 0 5px 0;"><strong>联系电话:</strong> ${
                        popupContentData.phone
                      }</p>
                      <p style="margin:0 0 5px 0;"><strong>种植时间:</strong> ${
                        popupContentData.plantTime
                      }</p>
                      <p style="margin:0 0 5px 0;"><strong>上报时间:</strong> ${
                        popupContentData.reportTime
                      }</p>
                        <button class="popup-edit-btn" id="viewLandBtn" onclick="handleEditLandClick('${
                          feature.properties.id
                        }')">编辑地块详情</button>
       <button class="popup-del-btn" id="viewLandBtn" onclick="handleDelLandClick('${
         feature.properties.id
       }')">删除该地块</button>
                    </div>
            `;
            // 绑定弹窗
            layer.bindPopup(popupContent).openPopup();
            //   添加自定义事件处理函数
            window.handleEditLandClick = (id) => {
              const detail = springPlowingLise.value.find(
                (item) => item.surveyId == id || feature.properties.id,
              );
              plantTime.value = detail.plantTime;
              // 将获取到的地块信息填充到弹窗表单中
              popupForm.value = detail;
              // 将几何信息转换为可编辑的GeoJSON格式
              popupForm.value.geom = WKT.convert(editFeature.geometry);
              // 设置几何信息为可编辑的GeoJSON格式
              editableGeojson();
            };
            window.handleDelLandClick = (id) => {
              delSpringPlowing(id);
            };
          },
        });
      };

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

      // 如果没有参数，加载所有数据
      if (!cropName) {
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
      }
    })
    .catch((err) => {
      // 如果获取数据失败，记录错误信息并显示失败的toast
      console.error("获取接口出错信息：", err);
      closeToast();
      showFailToast(err);
    });
}

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
        popupShow.value = false;
        isSelected.value = "All";
        isEditLand.value = false;
        editFeature = null;
        editLandLayer && editLandLayer.enableEdit();
        editableLayers = null;
        loadSpringCropJson();
        loadSpringPlowingLise();
        landListLoad();
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
        popupShow.value = false;
        isSelected.value = "All";
        isEditLand.value = false;
        loadSpringCropJson();
        loadSpringPlowingLise();
        landListLoad();
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
  isSelected.value = landType;
  loadSpringCropJson(landType, id);
}

// 获取春耕地块信息列表(不分页)
function loadSpringPlowingLise() {
  getSpringPlowingList().then((result) => {
    if (result.code !== 0) {
      return;
    }
    springPlowingLise.value = result.data.map((item) => {
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
            popupShow.value = false;
            isSelected.value = "All";
            isEditLand.value = false;
            editFeature = null;
            editLandLayer = null;
            editableLayers = null;
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
    .catch(() => {
      // on cancel
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

// ==================================

// 获取面积
function formatArea(polygon) {
  //L.GeometryUtil.geodesicArea(),返回number类型的数据，单位是平方米，这里做了一下转化
  var seeArea = L.GeometryUtil.geodesicArea(polygon);
  let area = (seeArea * 0.0015).toFixed(2);
  popupForm.value.stArea = area;
  // let area = seeArea.toFixed(0) + "㎡";
  // if (seeArea > 10e5) {
  //   area = (seeArea / 10e5).toFixed(2) + "k㎡";
  // }
  return area;
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
  isEditLand.value = false;
  popupForm.value = {
    name: "", // 责任人名称
    idCard: "", // 责任人身份证
    phone: "", // 手机号
    geom: "", // 地块边界
    cropId: "", // 作物id
    cropName: "", // 作物名称
    plantTime: "", // 种植时间
    area: "", // 种植面积
  };
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
  width: 160px;
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
