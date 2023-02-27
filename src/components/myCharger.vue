<template>
  <view class="charger-wrapper" :style="{'transform':'rotateY('+rotate+'deg)','height':height+'rpx'}">
    <view class="card" :style="{'width':width+'px'}">
      <image class="background-image" src="/static/image/background-blue.png"></image>
      <view class="charger-inner-wrapper">
        <view class="charger-inner-up">
          <view class="address-wrapper">
            <text class="location">{{ address }}</text>
            <text class="state1" v-if="state">未使用</text>
            <text class="state2" v-if="!state">使用中</text>
          </view>
          <view class="location-wrapper">
            <text class="text">{{ location }}</text>
          </view>
        </view>
        <view class="charger-inner-middle">
          <text>价格</text>
          <text class="yuan">￥</text>
          <text class="price">{{ price }}</text>
        </view>
        <view class="charger-inner-down">
          <text>可用时间：</text>
          <text class="time">{{ showTime }}</text>
        </view>
      </view>
    </view>

    <view class="drawer" :style="{'height':height+'rpx'}">
      <view class="drawer-wrapper" :style="{'transform':'rotateX('+buttonRotate+'deg)','height':height+'rpx'}">
        <view class="button-wrapper" :style="{'opacity':buttonOpacitty}">
          <view style="position: absolute;right: 30upx;top: 20upx;">
            <text style="color:rgba(50,200,210,1) ;letter-spacing: 2upx;font-size: 28upx;"
                  @click.native.stop.prevent="untap">
              返回
            </text>
          </view>
          <view class="small-detail-view">
            <image src="/static/image/chargerdetail.png" class="small-icon"
                   @click.native.stop.prevent="editCharger"></image>
            <text class="small-detail">修改</text>
          </view>
          <view class="small-detail-view">
            <image src="/static/image/delete.png" class="small-icon"
                   @click.native.stop.prevent="deleteCharger"></image>
            <text class="small-detail">删除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import showModal from "@/apis/wx/showModal";
import {chargerDelete, chargerPicDelete} from "@/apis/charger/charger";

@Component
export default class MyCharger extends Vue {
  @Prop()
  address!: string;
  @Prop()
  location!: string;
  @Prop()
  state!: boolean;
  @Prop()
  price!: string;
  @Prop()
  cid!: string;
  @Prop({
    type: Array,
    default: () => []
  })
  time!: Array<string>;
  @Prop()
  windowWidth!: number;
  @Prop()
  detail!: boolean;

  private height: number = 300;
  private rotate: number = 0;
  private buttonRotate: number = 0;
  private buttonOpacity: number = 1;
  private bookRotate: number = -90;

  public get showTime() {
    let tempDate = new Date();
    let days = tempDate.getDay();
    if (days == 0) {
      days = 7;
    }
    let showTime: string;
    if (this.time[days - 1] == "") {
      showTime = "-"
    } else {
      showTime = this.time[days - 1]
    }
    return showTime;
  }

  public get width() {
    return (this.windowWidth - uni.upx2px(160));
  }

  public untap(): void {
    this.$emit('chargerUndetail')
  }

  public editCharger(): void {
    if (!this.state) {
      wx.showToast({
        title: "无法修改！",
        icon: 'error'
      })
      return;
    }
    this.$store.commit('setChargerCardDefault')
    wx.navigateTo({
      url: '../editCharger/editCharger?cid=' + this.cid,
    });
  }

  public deleteCharger(): void {
    showModal("确认要删除该电桩", "提示").then(res => {
      if (res.confirm) {
        return chargerDelete({
          cid: Number(this.cid)
        })
      }
    }).then(res => {
      // TODO
      if (res.result == "charger unavailable") {
        wx.showToast({
          title: "删除失败！",
          icon: 'error',
          complete: () => {
            this.$store.commit('setChargerCardDefault')
            this.$store.commit('setGetChargers')
          }
        })
      } else {
        return chargerPicDelete({
          cid: this.cid
        })
      }
    }).then(res => {
      //如果图片删除失败也不管了
      wx.showToast({
        title: "删除成功！",
        icon: 'success',
        complete: () => {
          this.$store.commit('setChargerCardDefault')
          this.$store.commit('setGetChargers')
        }
      })
    })
  }

  @Watch("detail")
  public watchDetail() {
    if (this.detail) {
      this.$nextTick(function () {
        this.rotate = -90;
      })
    } else {
      this.$nextTick(function () {
        this.rotate = 0;
        this.bookRotate = -90;
        this.height = 300;
        this.buttonRotate = 0;
        this.buttonOpacity = 1;
      })
    }
  }
}
</script>

<style lang="less" scoped>
.charger-wrapper {
  position: relative;
  height: 300upx;
  margin: 20upx 20upx 40upx;
  transform-style: preserve-3d;
  transition: .7s all;

  .card {
    position: absolute;
    border: 10upx inset rgba(50, 200, 210, 1);
    background-color: white;
    border-radius: 40upx;
    transition: all .5s;
    transform: translateZ(300upx);
    height: 300upx;

    .background-image {
      position: absolute;
      opacity: 0.25;
      height: 280upx;
      width: 328upx;
      right: 0;
      top: 0;
    }

    .charger-inner-wrapper {
      padding: 15upx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: absolute;
      height: 100%;
      width: 100%;

      .charger-inner-up {
        display: flex;
        flex-direction: column;

        .address-wrapper {
          display: flex;
          justify-content: space-between;
        }

        .location-wrapper {
          display: flex;
          justify-content: space-between;
          position: relative;
        }
      }

      .charger-inner-middle {
        margin-left: 10upx;

        .yuan {
          font-weight: 700;
          color: #249399;
        }

        .price {
          font-size: 40upx;
          font-weight: 700;
          color: #249399;
        }
      }

      .charger-inner-down {
        margin-left: 10upx;
        margin-bottom: 10upx;
      }
    }
  }

  .drawer {
    position: absolute;
    transform: rotateY(90deg) translateZ(300upx);
    width: 100%;
    transition: .7s all;
    border-radius: 30upx;
    border-top: 10upx solid rgba(50, 200, 210, 1);
    border-bottom: 10upx solid rgba(50, 200, 210, 1);
    transform-style: preserve-3d;
    overflow: hidden;

    .drawer-wrapper {
      position: relative;
      transition: .7s all;
      transform-style: preserve-3d;
      transform-origin: 50% 50% -150upx;

      .button-wrapper {
        position: absolute;
        width: 100%;
        height: 300upx;
        display: flex;
        align-items: center;
        justify-content: space-around;
        transform: translateZ(5upx);
        background-color: rgba(250, 255, 250, 1);
        transition: all .7s;

        .small-detail-view {
          height: 180upx;
          display: flex;
          flex-direction: column;
          justify-content: center;

          .small-detail {
            font-size: 25upx;
            letter-spacing: 0.6upx;
            margin-left: 38upx;
            position: relative;
            bottom: 10upx;
          }

          .small-icon {
            height: 125upx;
            width: 125upx;
          }
        }
      }
    }
  }
}

.location {
  margin: 15upx;
  font-size: 30upx;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 350upx;
}

.text {
  margin-top: 10upx;
  margin-left: 15upx;
  opacity: 0.5;
  width: 450upx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font-size: 35upx;
  font-weight: 700;
  color: #249399;
  letter-spacing: 3upx;
}
</style>
