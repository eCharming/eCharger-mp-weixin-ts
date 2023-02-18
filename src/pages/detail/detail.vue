<template>
  <view style="display: flex;flex-direction:column">
    <view :style="{'height':statusHeight+'px','width':'100%','top':0,'z-index':9999}">
      <view class="detailNavi"
            :style="{'height':statusHeight+'px','background':color,'position':'fixed','width':'100%','top':0}">
        <image src="../../static/image/back.png" class="backimg" :style="{'top':statusBarHeight+12.5+'px'}"
               @tap="back"></image>
        <text :style="{'margin-bottom':detailHeight+'px'}">电桩详情</text>
      </view>
    </view>

    <view>
      <add-card style="position: relative;">
        <view style="margin: 28upx;">
          <view class="labeltext">电桩位置</view>
          <view style="color:rgba(0,0,0,0.5)">
            {{ address }}
          </view>
        </view>
        <map id="myMap" style="width: 680upx; height: 500upx;" layer-style="1" :latitude="centerLatitude"
             :longitude="centerLongitude" showLocation='true' subkey="ORFBZ-V73LX-N3Z4Y-Z3MR4-V35MJ-LNBFL"
             :markers="covers" :polyline="polyline">
        </map>


        <view style="margin: 28upx;">
          <view class="labeltext">详细地址</view>
          <view style="color:rgba(0,0,0,0.5)">
            {{ location }}
          </view>
        </view>

        <view class="divLine"></view>

        <view style="margin: 28upx;">
          <view class="labeltext">电桩单价</view>
          <view style="color:rgba(0,0,0,0.5)">
            {{ price }}元/小时
          </view>
        </view>

        <view class="divLine"></view>

        <view style="margin: 28upx;">
          <view class="labeltext">可用时间</view>
          <view class="time" v-for="(day,index) in days" :key="index">
            <view style="color:rgba(0,0,0,0.5)">
              {{ '周' + day + '可用时间' }}
            </view>
            <view class="availabeTime">{{ time[index] === '' ? '无可用时间' : time[index] }}</view>
          </view>
        </view>

        <view class="divLine"></view>

        <view style="margin: 28upx;">
          <view class="labeltext">备注</view>
          <view style="color:rgba(0,0,0,0.5)">
            {{ remarks === '' ? '无' : remarks }}
          </view>
        </view>
      </add-card>
      <add-card>
        <view style="margin: 28upx;">
          <view class="labeltext">图片</view>
          <view class='content'>
            <view class='img-view' v-for='(item,index) in imgUrl' :key='index'>
              <image :src='item' @tap='showPic(item)'
                     style="width:200upx;height:200upx;margin-left: 3.9upx;margin-right: 3.9upx;"
                     mode='aspectFill'>
              </image>
            </view>
          </view>
        </view>
      </add-card>

      <add-card style="position: relative;">
        <view style="margin: 28upx;">
          <view class="labeltext">桩主信息</view>
          <view style="display: flex;justify-content: space-between;margin-top: 20upx;">
            <view style="color:rgba(0,0,0,0.5);width: 200upx;display: flex;justify-content: space-between;">
              <image :src="avatarUrl" style="width: 90upx;height: 90upx;"></image>
              <view style="margin-top: 30upx;">{{ name }}</view>
            </view>
            <view
                style="color:rgba(0,0,0,0.5);width: 250upx;display: flex;justify-content: space-between;margin-top: 30upx;">
              <view @tap="chat">在线联系</view>
              <view @tap="call">电话联系</view>
            </view>
          </view>

        </view>
      </add-card>

    </view>
  </view>
</template>

<script lang="ts">
import addCard from '@/components/addCard.vue'
import {Component, Vue} from "vue-property-decorator";
import {GeoPoint, MapCover, MapPolyline} from "@/apis/map/map-interface";
import {directionDriving} from "@/apis/map/map";
import {chargerDetail, chargerPicGet} from "@/apis/charger/charger";

@Component({
  components: {
    addCard
  }
})
export default class Detail extends Vue {
  private statusHeight: number = wx.getSystemInfoSync().statusBarHeight + 50;
  private detailHeight: number = 0;
  private color: string = '#66CDAA';
  private statusBarHeight: number = wx.getSystemInfoSync().statusBarHeight;
  private uid: string = "";
  private name: string = "";
  private phoneNumber: string = "";
  private location: string = "";
  private address: string = "";
  private price: string = "";
  private remarks: string = "";
  private time: Array<string> = [];
  private days: Array<string> = ['一', '二', '三', '四', '五', '六', '天'];
  private avatarUrl: string = "";
  private covers: Array<MapCover> = [];
  private polyline: Array<MapPolyline> = [];
  private geoPoint: GeoPoint = {
    latitude: 39.909,
    longitude: 116.39742,
  };
  private centerLatitude: number = this.$store.state.currentLocation == null ? 39.909 : this.$store.state.currentLocation.latitude;
  private centerLongitude: number = this.$store.state.currentLocation == null ? 116.39742 : this.$store.state.currentLocation.longitude;
  private imgUrl: Array<any> = [];

  public back(): void {
    wx.navigateBack({})
  }

  public navigate(): void {
    directionDriving({
      fromLatitude: this.$store.state.currentLocation.latitude,
      fromLongitude: this.$store.state.currentLocation.longitude,
      toLatitude: this.geoPoint.latitude,
      toLongitude: this.geoPoint.longitude,
      key: "ORFBZ-V73LX-N3Z4Y-Z3MR4-V35MJ-LNBFL"
    }).then(data => {
      if (data.status === 0) {
        this.polyline.splice(0);
        this.polyline.push({
          points: [],
          width: 6,
          color: "#66CDAA"
        });
        const polyline = data.result.routes[0].polyline;
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
    });
  }

  public call(): void {
    if (this.uid == this.$store.state.uid) {
      wx.showToast({
        title: "禁止联系自己",
        icon: 'error',
      })
      return;
    }
    wx.makePhoneCall({
      phoneNumber: this.phoneNumber
    })
  }

  public chat(): void {
    if (this.uid == this.$store.state.uid) {
      wx.showToast({
        title: "禁止联系自己",
        icon: 'error'
      })
      return;
    }
    wx.navigateTo({
      url: '../communication/chat?toUid=' + this.uid + '&name=' + this.name + '&avatarUrl=' + this.avatarUrl
    })
  }

  public showPic(item: any): void {
    wx.previewImage({
      current: item,
      urls: this.imgUrl
    })
  }

  public getPic(cid: string): void {
    chargerPicGet({
      cid: cid
    }).then(res => {
      this.imgUrl = res.data.data.resUrl
    })
  }

  public onLoad(option: { cid: string; }): void {
    this.detailHeight = (this.statusHeight - uni.getMenuButtonBoundingClientRect().bottom);
    chargerDetail({
      cid: Number(option.cid)
    }).then(res => {
      if (res.result.status == -1) {
        wx.showToast({
          title: "电桩已被删除",
          icon: 'error',
          complete: () => {
            setTimeout(() => {
              uni.navigateBack({})
            }, 1500)

          }
        })
      } else {
        this.uid = res.result.uid;
        this.address = res.result.address;
        this.location = res.result.location;
        this.geoPoint.latitude = res.result.geoPoint.coordinates[1];
        this.geoPoint.longitude = res.result.geoPoint.coordinates[0];
        this.name = res.result.userName;
        this.avatarUrl = res.result.avatarUrl;
        this.phoneNumber = res.result.phoneNumber;
        this.price = res.result.price;
        this.time = res.result.time;

        this.covers.push({
          title: this.address,
          id: Number(option.cid),
          latitude: this.geoPoint.latitude,
          longitude: this.geoPoint.longitude,
          iconPath: "/static/image/charger.png",
          width: 40,
          height: 40,
          callout: {
            content: this.address,
            color: "#333333",
            fontSize: 13,
            borderRadius: 20,
            bgColor: "#e7ffed",
            textAlign: "center",
            padding: 10,
          }
        });
        this.navigate();
        this.getPic(option.cid);
      }
    })
    if (this.$store.state.currentLocation == null) {
      wx.showToast({
        title: "请打开定位！",
        icon: 'error',
        complete: () => {
          setTimeout(() => {
            uni.navigateBack({})
          }, 1500)

        }
      })
    }
  }
}
</script>

<style scoped>
.detailNavi {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  color: #FFFFFF;
  font-size: 35upx;
  font-weight: 700;
  letter-spacing: 2upx;
}

.backimg {
  position: absolute;
  left: 8px;
  width: 25px;
  height: 25px;
}

.labeltext {
  letter-spacing: 2upx;
  font-size: 30upx;
  font-weight: 700;
  margin-bottom: 15upx;
}

.divLine {
  width: 100%;
  height: 3upx;
  background-color: #E0E3DA;
}

.time {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20upx;
}

.availabeTime {
  color: rgba(0, 0, 0, 0.5);
  width: 250upx;
  display: flex;
  justify-content: flex-end;
}
</style>