<template>
  <view>
    <map id="myMap" ref="map" style="width: 100%; height: 100vh;position: absolute;top: 0;" layer-style="1"
         :latitude="centerLatitude" :longitude="centerLongitude" :markers="covers" :setting="mapSetting"
         :circles="circles" :scale="scale" :polyline="polyline" @markertap="markerTap($event)">
    </map>
  </view>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import {MapCircle, MapCover, MapPolyline} from "@/apis/map/map-interface";
import MapContext = UniNamespace.MapContext;
import {directionDriving, getSurround, wholeCity} from "@/apis/map/map";

@Component
export default class MyMap extends Vue {
  public centerLatitude: number = 39.909;  //中心纬度
  public centerLongitude: number = 116.39742; //中心经度
  public latitude: number = 39.909;  //当前纬度
  public longitude: number = 116.39742;  //当前经度
  public cityLatitude: number = 39.909;  //城市纬度，仅仅用于全城
  public cityLongitude: number = 116.39742;  //城市经度，仅仅用于全城
  public mapSetting: object = {
    "showCompass": true,
    "enableOverlooking": false,
    "enableSatellite": false,
    "enableTraffic": false,
    "enableZoom": true,
    "enableScroll": true,
    "enableRotate": true,
    "showLocation": true,
    "subkey": "ORFBZ-V73LX-N3Z4Y-Z3MR4-V35MJ-LNBFL"
  }
  public covers: Array<MapCover> = [];
  public polyline: Array<MapPolyline> = [];
  public circles: Array<MapCircle> = [];
  public mapContext: MapContext | undefined;
  public scale: number = 16;
  public ordersCopy: Array<any> = [];
  public url: string = 'https://apis.map.qq.com/ws/distance/v1/matrix/?mode=driving&from=';
  public markerSelected: number = -1;
  public chargerList: Array<any> = []; //请求所获得的所有桩信息

  public mounted(): void {
    setTimeout(() => {
      this.mapContext = uni.createMapContext('myMap', this);
      this.openLocation();
    }, 1500)
  }

  public pickerHandler() {
    this.$store.commit('setIsNavigate', false);
    this.ordersCopy.splice(0);
    this.polyline.splice(0);
    this.markerSelected = -1;
    if (this.chargerList.length !== 0) {
      let tempDate = new Date();
      let days = tempDate.getDay();
      if (days === 0) {
        days = 7;
      }
      let rawStartTime = this.$store.state.startTime.split(":");
      let rawEndTime = this.$store.state.endTime.split(":");
      let endTime = rawEndTime.length > 1 ? (Number(rawEndTime[0]) * 60 + Number(rawEndTime[1])) : -1;
      let startTime = rawStartTime.length > 1 ? (Number(rawStartTime[0]) * 60 + Number(rawStartTime[1])) : 1440;

      for (let charger of this.chargerList) {
        let timeStamp = charger.timeStamp;
        if (timeStamp[2 * days - 2] <= startTime && timeStamp[2 * days - 1] >= endTime) {
          this.covers.push({
            title: charger.address,
            id: charger._id,
            latitude: charger.geoPoint.coordinates[1],
            longitude: charger.geoPoint.coordinates[0],
            iconPath: "/static/image/charger.png",
            width: 40,
            height: 40,
            callout: {
              content: charger.address,
              color: "#333333",
              fontSize: 13,
              borderRadius: 20,
              bgColor: "#e7ffed",
              textAlign: "center",
              padding: 10,
            }
          });

          let distance = (charger.Distance / 1000).toFixed(1);
          this.ordersCopy.push({ //为解决每次插入后界面都刷新使用了副本记录 最后一次性赋给store中的order
            address: charger.address,
            location: charger.location,
            uid: charger.uid,
            id: charger.id,
            latitude: charger.geoPoint.coordinates[1],
            longitude: charger.geoPoint.coordinates[0],
            price: charger.price,
            time: charger.time,
            distance: distance,
            detail: false,
          });
        }
      }
    }
    this.$store.commit('setOrders', this.ordersCopy);
  }

  public moveLocation(lat: number, lng: number) {
    let _this = this
    this.mapContext?.moveToLocation({
      latitude: lat,
      longitude: lng,
      fail: err => { //fail后500ms重新执行
        setTimeout(function () {
          _this.moveLocation(lat, lng)
        }, 500)
      }
    });
  }

  public getWholeCity(lng: number, lat: number) {
    this.$store.commit('setIsNavigate', false);
    this.centerLatitude = lat
    this.centerLongitude = lng
    this.scale = 0;
    this.$nextTick(() => {
      this.scale = 9;
    })
    wholeCity({
      longitude: lng,
      latitude: lat
    }).then(res => {
      let chargerList = <Array<any>>res.result;
      this.chargerList.splice(0);
      this.chargerList = <Array<any>>res.result;

      if (this.$store.state.startTime === "" && this.$store.state.endTime === "") {
        this.ordersCopy.splice(0);
        this.polyline.splice(0);
        this.covers.splice(0);
        this.markerSelected = -1;
        if (chargerList.length !== 0) {
          for (let charger of chargerList) {
            this.covers.push({
              title: charger.address,
              id: charger._id,
              latitude: charger.geoPoint.coordinates[1],
              longitude: charger.geoPoint.coordinates[0],
              iconPath: "/static/image/charger.png",
              width: 40,
              height: 40,
              callout: {
                content: charger.address,
                color: "#333333",
                fontSize: 13,
                borderRadius: 20,
                bgColor: "#e7ffed",
                textAlign: "center",
                padding: 10,
              }
            });

            let distance = (charger.Distance / 1000).toFixed(1);
            this.ordersCopy.push({ //为解决每次插入后界面都刷新使用了副本记录 最后一次性赋给store中的order
              address: charger.address,
              location: charger.location,
              uid: charger.uid,
              id: charger._id,
              latitude: charger.geoPoint.coordinates[1],
              longitude: charger.geoPoint.coordinates[0],
              price: charger.price,
              time: charger.time,
              distance: distance,
              detail: false,
            });

          }
        }
        this.$store.commit('setOrders', this.ordersCopy);
      } else {
        this.covers.splice(0);
        this.pickerHandler()
      }
    })
    this.circles.splice(0, 1, {
      latitude: -1,
      longitude: -1,
      fillColor: "rgb(255, 255, 255)",
      color: "rgb(255, 255, 255)",
      radius: 1,
      strokeWidth: 1,
    })
  }

  public getChargerLocation(lng: number, lat: number, tle: string | undefined) {
    this.$store.commit('setIsNavigate', false);
    getSurround({
      longitude: lng,
      latitude: lat,
      distance: 2000,
      rawLongitude: this.$store.state.currentLocation.longitude,
      rawLatitude: this.$store.state.currentLocation.latitude,
    }).then(res => {
      let chargerList = <Array<any>>res.result;
      this.chargerList.splice(0);
      this.chargerList = <Array<any>>res.result;

      if (this.$store.state.startTime === "" && this.$store.state.endTime === "") {
        this.ordersCopy.splice(0);
        this.polyline.splice(0);
        this.covers.splice(0);
        this.markerSelected = -1;
        if (tle != undefined) { //为了防止异步问题，所以放在这里
          this.covers.push({
            title: tle,
            id: 0,
            latitude: lat,
            longitude: lng,
            iconPath: "/static/image/landmarksolid.png",
            width: 50,
            height: 50,
            callout: {
              content: tle,
              color: "#333333",
              fontSize: 13,
              borderRadius: 20,
              bgColor: "#e7ffed",
              textAlign: "center",
              padding: 10,
            }
          });
          this.circles.splice(0, 1, {
            latitude: lat,
            longitude: lng,
            fillColor: "#4162996A",
            color: "#b0daff",
            radius: 300,
            strokeWidth: 1,
          })
        }
        if (chargerList.length !== 0) {
          for (let charger of chargerList) {
            this.covers.push({
              title: charger.address,
              id: charger._id,
              latitude: charger.geoPoint.coordinates[1],
              longitude: charger.geoPoint.coordinates[0],
              iconPath: "/static/image/charger.png",
              width: 40,
              height: 40,
              callout: {
                content: charger.address,
                color: "#333333",
                fontSize: 13,
                borderRadius: 20,
                bgColor: "#e7ffed",
                textAlign: "center",
                padding: 10,
              }
            });

            let distance = (charger.Distance / 1000).toFixed(1);
            this.ordersCopy.push({ //为解决每次插入后界面都刷新使用了副本记录 最后一次性赋给store中的order
              address: charger.address,
              location: charger.location,
              uid: charger.uid,
              id: charger._id,
              latitude: charger.geoPoint.coordinates[1],
              longitude: charger.geoPoint.coordinates[0],
              price: charger.price,
              time: charger.time,
              distance: distance,
              detail: false,
            });
          }
        }
        this.$store.commit('setOrders', this.ordersCopy);
      } else {
        this.covers.splice(0);
        if (tle != undefined) { //为了防止异步问题，所以放在这里
          this.covers.push({
            title: tle,
            id: 0,
            latitude: lat,
            longitude: lng,
            iconPath: "/static/image/landmarksolid.png",
            width: 50,
            height: 50,
            callout: {
              content: tle,
              color: "#333333",
              fontSize: 13,
              borderRadius: 20,
              bgColor: "#e7ffed",
              textAlign: "center",
              padding: 10,
            }
          });
          this.circles.splice(0, 1, {
            latitude: lat,
            longitude: lng,
            fillColor: "#4162996A",
            color: "#b0daff",
            radius: 300,
            strokeWidth: 1,
          })
        }
        this.pickerHandler();
      }
    })
  }

  public openLocation() {
    wx.startLocationUpdate({
      success: res => {
        let oldLatitude;
        let oldLongitude;
        let firstFlag = true;
        wx.onLocationChange((res) => { //调用实时获取定位
          oldLatitude = this.latitude;
          oldLongitude = this.longitude;
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.cityLatitude = res.latitude;
          this.cityLongitude = res.longitude;
          this.$store.commit('setCurrentLocation', {
            latitude: this.latitude,
            longitude: this.longitude
          });
          if (firstFlag) {
            this.centerLatitude = this.latitude;
            this.centerLongitude = this.longitude;
          }
          this.circles.splice(0, 1, {
            latitude: this.latitude,
            longitude: this.longitude,
            fillColor: "#4162996A",
            color: "#b0daff",
            radius: 300,
            strokeWidth: 1,
          })
          if (firstFlag || (oldLatitude && oldLongitude && Math.abs(
              oldLatitude - this.latitude) + Math.abs(oldLongitude - this
              .longitude) > 0.005)) { //两次定位距离过近时不调用云函数以减小负载
            this.$store.commit('setCurrentLocation', {
              latitude: this.latitude,
              longitude: this.longitude
            });
            this.getChargerLocation(this.longitude, this.latitude, undefined);
          }
          firstFlag = false;
        });
      }
    })
  }

  public markerTap(e: { detail: { markerId: number } }) { //用于告知组件按下的marker编号
    let number = -1;
    for (let index = 0; index < this.covers.length; index++) {
      if (this.covers[index].id === e.detail.markerId) {
        number = index;
      }
    }
    if (this.covers[0].id === 0)
      number--;
    if (this.markerSelected === number) { //第二次点击再生效
      this.$store.commit('setMarkerSelected', number);
      this.moveLocation(this.covers[number].latitude, this.covers[number].longitude);
    }
    this.markerSelected = number;
  }

  public navigate(index: number) {
    directionDriving({
      fromLatitude: this.latitude,
      fromLongitude: this.longitude,
      toLatitude: this.covers[index].latitude,
      toLongitude: this.covers[index].longitude,
      key: "ORFBZ-V73LX-N3Z4Y-Z3MR4-V35MJ-LNBFL"
    }).then(data => {
      if (data.status === 0) {
        this.polyline.splice(0);
        this.polyline.push({
          points: [],
          width: 5,
          color: "#66CDAA"
        });
        let polyline = data.result.routes[0].polyline;
        this.polyline[0].points.push({
          latitude: polyline[0],
          longitude: polyline[1]
        })

        for (let i = 2; i < polyline.length; i++) {
          polyline[i] = polyline[i - 2] + polyline[i] / 1000000;
          if (i % 2 === 1) {
            this.polyline[0].points.push({
              latitude: polyline[i - 1],
              longitude: polyline[i]
            });

          }
        }
      }
      this.$store.commit('setIsNavigate', true)
    })
    this.moveLocation(this.covers[index].latitude, this.covers[index].longitude);
  }

  @Watch("$store.state.refresh") //仅仅用于更新电桩信息
  public watchRefresh() {
    if (this.$store.state.destination != null) {
      let title = this.$store.state.destination.title;
      let latitude = this.$store.state.destination.location.lat;
      let longitude = this.$store.state.destination.location.lng;
      this.getChargerLocation(longitude, latitude, title);
    } else {
      this.getChargerLocation(this.longitude, this.latitude, undefined)
    }
  }

  @Watch("$store.state.destination")  //监听destination变化 变化就在地图上加入标记点并且移动到该位置
  public watchDestination() {
    if (this.$store.state.destination != null) { //按下locationButton重置回到自己位置，destination置为空
      this.$store.state.relocate = false;
      wx.stopLocationUpdate();
      let title = this.$store.state.destination.title;
      let latitude = this.$store.state.destination.location.lat;
      let longitude = this.$store.state.destination.location.lng;
      this.getChargerLocation(longitude, latitude, title);
      this.moveLocation(latitude, longitude);
    }
  }

  @Watch("$store.state.relocate")
  public watchRelocate() {
    if (this.$store.state.relocate)
      this.openLocation();
  }

  @Watch("$store.state.orderSelected")
  public watchOrderSelected() {
    if (this.$store.state.orderSelected != null) {
      let latitude = this.covers[this.$store.state.orderSelected].latitude;
      let longitude = this.covers[this.$store.state.orderSelected].longitude;
      this.moveLocation(latitude, longitude);
      this.$nextTick(function () {
        this.$store.commit('setOrderSelected', null);
      })
    }
  }

  @Watch("$store.state.locationres")
  public watchLocationRes() {
    let res = this.$store.state.locationres;
    if (res && res !== {} && res.errMsg === "getLocation:ok") {
      this.latitude = res.latitude;
      this.longitude = res.longitude;
      this.cityLatitude = res.latitude;
      this.cityLongitude = res.longitude;
      this.centerLatitude = res.latitude;
      this.centerLongitude = res.longitude;
      this.circles.splice(0, 1, {
        latitude: this.latitude,
        longitude: this.longitude,
        fillColor: "#4162996A",
        color: "#b0daff",
        radius: 300,
        strokeWidth: 1,
      })
    }
    if (this.mapContext) {
      this.mapContext.moveToLocation({
        latitude: this.latitude,
        longitude: this.longitude
      })
    }
    this.getChargerLocation(this.longitude, this.latitude, undefined);
    this.scale = 0;
    this.$nextTick(() => {
      this.scale = 16;
    })
  }

  @Watch("$store.state.navigateSelected")
  public watchNavigateSelected() {
    if (this.$store.state.navigateSelected != null) {
      this.navigate(this.$store.state.navigateSelected);
      this.$nextTick(function () {
        this.$store.commit('setNavigateSelected', null);
      })
    }
  }

  @Watch("$store.state.startTime")
  public watchStartTime() {
    if (this.covers.length > 0 && this.covers[0].id === 1027368) {
      this.covers.splice(1);
    } else {
      this.covers.splice(0);
    }
    this.pickerHandler()
  }

  @Watch("$store.state.endTime")
  public watchEndTime() {
    if (this.covers.length > 0 && this.covers[0].id === 1027368) {
      this.covers.splice(1);
    } else {
      this.covers.splice(0);
    }
    this.pickerHandler();
  }

  @Watch("$store.state.cityLocation", {
    deep: true
  })
  public watchCityLocation(res: { latitude: number; longitude: number; name: string; }) {
    if (res.latitude != null && res.longitude != null) {
      wx.stopLocationUpdate();
      this.cityLatitude = res.latitude
      this.cityLongitude = res.longitude
      this.scale = 0;
      this.$nextTick(() => {
        this.scale = 16;
      })
      setTimeout(() => {
        if (this.mapContext) {
          this.mapContext.moveToLocation({
            latitude: res.latitude,
            longitude: res.longitude
          })
        }

        this.getChargerLocation(res.longitude, res.latitude, res.name);
      }, 500)
    }
  }

  @Watch("$store.state.isWholeCity")
  public watchIsWhileCity() {
    this.getWholeCity(this.cityLongitude, this.cityLatitude);
  }

  @Watch("$store.state.refreshPolyline")
  public watchRefreshPolyline() {
    this.polyline.splice(0);
  }

}
</script>

<style scoped>
</style>
