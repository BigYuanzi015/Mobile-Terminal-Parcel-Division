import { defineStore } from "pinia";

export const useLandSearchStore = defineStore("landSearchState", {
  state: () => {
    return {
      key: "",
      regionCode: localStorage.getItem("Region")
        ? JSON.parse(localStorage.getItem("Region")).code
        : "",
      regionId: "",
      year: [],
      fieldValue: "", // 选择的城市名称
      selectedTabbar: "map",
    };
  },
});
