<template>
  <view
      class="order-wrapper"
      :style="{'transform':'rotateY('+rotate+'deg)','height':height+'rpx'}">
    <view id="box">
      <view class="box-wrapper" :style="{'transform':translate}"></view>
      <view class="card" :style="{'width':width+'px'}" @tap="checkMap()">
        <image class="background-image" src="/static/image/background.png"></image>
        <view class="card-container">
          <view class="address-location-wrapper">
            <view class="address-wrapper">
              <text class="location">{{ address }}</text>
              <view>
                <image class="location-button-image" src="/static/image/arrow.png"></image>
                <text class="distance">{{ distance }}km</text>
              </view>
            </view>
            <view class="location-wrapper">
              <text class="location">{{ location }}</text>
              <image class="image1" :style="{'opacity':checkOpacity,'right':checkRight+'rpx'}"
                     src='/static/image/checkdetail.png' v-if="check"
                     @click.native.stop.prevent="checkDetail"></image>
            </view>
          </view>
          <view class="price-wrapper">
            <text>价格</text>
            <text class="yuan">￥</text>
            <text class="price">{{ price }}</text>
          </view>
          <view class="time-wrapper">
            <text>可用时间：</text>
            <text class="time">{{ showTime }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="box-outer" :style="{'height':height+'rpx'}">
      <view
          class="box-outer-wrapper"
          :style="{'transform':'rotateX('+buttonRotate+'deg)','height':height+'rpx'}">
        <view class="box-left-wrapper" :style="{'opacity':buttonOpacity}">
          <view class="left-return-wrapper">
            <text class="left-return" @tap="unCheckDetail()">返回</text>
          </view>
          <view class="small-detail-wrapper" :animation="animationBook">
            <image src="/static/image/order.png" style="height: 125upx;width: 125upx;" @tap="book">
            </image>
            <text class="small-detail">预约</text>
          </view>
          <view class="small-detail-wrapper" :animation="animationContact">
            <image src="/static/image/connection.png" style="height: 125upx;width: 125upx;" @tap="chat">
            </image>
            <text class="small-detail">联系</text>
          </view>
          <view class="small-detail-wrapper" :animation="animationNavigate">
            <image src="/static/image/navigation.png" style="height: 125upx;width: 125upx;"
                   @tap="navigate"></image>
            <text class="small-detail">导航</text>
          </view>
          <view class="small-detail-wrapper" :animation="animationDetail">
            <image src="/static/image/chargerdetail.png" style="height: 125upx;width: 125upx;"
                   @tap="orderDetail"></image>
            <text class="small-detail">详情</text>
          </view>
        </view>
        <view class="box-right-wrapper">
          <view class="drawer-wrapper">
            <view class="drawer-info">
              <view class="right-return-wrapper">
                <text class="right-return" @tap="unbook()">返回</text>
              </view>
              <view>
                <view
                    style="margin: 0 30upx 30upx;width: 550upx;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                  <text style="font-size: 30upx;font-weight: 700;
									">{{ location }}
                  </text>
                </view>
                <view
                    style="margin-left:30upx;margin-right:30upx;margin-top: 10upx;display: flex;justify-content: space-between;">
                  <view>
                    <image class="location-button-image" src="/static/image/arrow.png"></image>
                    <text
                        style="color:rgba(102,205,170,1) ;font-size: 30upx;letter-spacing: 1upx;">
                      距离您约{{ distance }}km
                    </text>
                  </view>
                  <view style="color:rgba(102,205,170,1) ;font-size: 30upx;letter-spacing: 1upx;"
                        @tap="bookDetail()">
                    详情
                  </view>
                </view>


              </view>
              <view style="display: flex;justify-content: space-between;margin: 30upx;">
                <view class="price-view">
                  <text>价格</text>
                  <text class="yuan">￥</text>
                  <text class="price">{{ price }}</text>
                </view>
                <view class="time-view">
                  <text>可用时间：</text>
                  <text class="time">{{ showTime }}</text>
                </view>
              </view>
            </view>

            <view class="drawer-reverse" :style="{'transform':'rotateX('+bookRotate+'deg)'}">
              <view
                  style="margin: 30upx;display: flex;letter-spacing: 3upx;font-weight: 700;font-size: 31upx;align-items: center;">
                <text>
                  预约时间
                </text>
                <view class="time1">
                  <picker mode="time" :start="minTime1" :end="maxTime1" @change="changetime1">
                    <text class="time-text1" :style="{'opacity':opacity1}">{{ text1 }}</text>
                  </picker>
                </view>
                <view class="line">-</view>
                <view class="time2">
                  <picker mode="time" :start="minTime2" :end="maxTime2" @change="changetime2">
                    <text class="time-text2" :style="{'opacity':opacity2}">{{ text2 }}</text>
                  </picker>
                </view>
              </view>
              <view class="price-view">
                <text>预估价格：</text>
                <text class="time">￥{{ possiblePrice }}</text>
              </view>
              <view
                  style="display: flex;justify-content: center;align-items: center;margin-bottom: 40upx;">
                <view style="width: 150rpx;height: 70upx;background-color: rgba(102,205,170,1);
								border-radius: 20upx;display: flex;justify-content: center;align-items: center;">
                  <text style="color: white;font-size: 33upx;font-weight: 700;letter-spacing: 10upx;"
                        @tap="bookOrder">
                    预约
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {updateUrl} from "@/apis/user/user";
import NodesRef = WechatMiniprogram.NodesRef;
import {orderInput, orderNum, orderPay, payQuery} from "@/apis/order/order";
import showModal from "@/apis/wx/showModal";

@Component
export default class Order extends Vue {
  @Prop()
  index!: number;
  @Prop()
  cid!: number;
  @Prop()
  uid!: number;
  @Prop()
  longitude!: string;
  @Prop()
  latitude!: string;
  @Prop()
  address!: string;
  @Prop()
  location!: string;
  @Prop()
  distance!: number;
  @Prop()
  price!: string;
  @Prop({
    type: Array,
    default: () => []
  })
  time!: Array<string>
  @Prop()
  detail!: boolean;
  @Prop()
  windowWidth!: number;

  private height: number = 300;
  private width: number = 0;
  private translate: string = 'translate(' + (this.windowWidth - uni.upx2px(160) + 10) + 'px,-' + uni.upx2px(300) + 'px)';
  private check: boolean = false;
  private checkOpacity: number = 0;
  private rotate: number = 0;
  private checkRight: number = 100;
  private animationBook: object = {};
  private animationContact: object = {};
  private animationNavigate: object = {};
  private animationDetail: object = {};
  private buttonRotate: number = 0;
  private buttonOpacity: number = 1;
  private bookRotate: number = -90;
  private minTime1: string = '00:00';
  private maxTime1: string = '24:00';
  private minTime2: string = '00:00';
  private maxTime2: string = '24:00';
  private text1: string = '起始时间';
  private text2: string = '结束时间';
  private opacity1: number = 0.5;
  private opacity2: number = 0.5;
  private possiblePrice: string = '0';

  public get showTime() {
    let tempDate = new Date();
    let days = tempDate.getDay();
    if (days === 0) {
      days = 7;
    }
    let showTime: string;
    if (this.time[days - 1] === "") {
      showTime = "-"
    } else {
      showTime = this.time[days - 1]
    }
    return showTime;
  }

  public changetime1(e: { detail: { value: any } }): void {
    let time1 = e.detail.value;
    this.text1 = time1;
    this.minTime2 = time1;
    this.opacity1 = 1;
    if (this.text2 !== "结束时间") {
      let sp1 = this.text1.split(":")
      let sp2 = this.text2.split(":")
      let time1 = Number(sp1[0]) * 60 + Number(sp1[1])
      let time2 = Number(sp2[0]) * 60 + Number(sp2[1])
      this.possiblePrice = ((time2 - time1) / 60 * Number(this.price)).toFixed(2)
    }
  }

  public changetime2(e: { detail: { value: any } }): void {
    let time2 = e.detail.value;
    this.text2 = time2;
    this.maxTime1 = time2;
    this.opacity2 = 1;
    if (this.text1 !== "起始时间") {
      let sp1 = this.text1.split(":")
      let sp2 = this.text2.split(":")
      let time1 = Number(sp1[0]) * 60 + Number(sp1[1])
      let time2 = Number(sp2[0]) * 60 + Number(sp2[1])
      this.possiblePrice = ((time2 - time1) / 60 * Number(this.price)).toFixed(2)
    }
  }

  public tap(): void {
    this.translate = 'translate(0rpx,-300rpx)';
    setTimeout(() => {
      this.translate = 'translate(' + (-this.width) + 'px,0px)';
    }, 300);
    setTimeout(() => {
      this.translate = 'translate(0rpx,284rpx)';
    }, 600);
    setTimeout(() => {
      this.translate = 'translate(0rpx,0rpx)';
    }, 900);

    this.check = true;
    this.$nextTick(function () {
      this.checkOpacity = 1;
      this.checkRight = 10;
    });
  }

  public unTap(): void {
    this.translate = 'translate(0rpx,284rpx)';
    setTimeout(() => {
      this.translate = 'translate(' + (-this.width) + 'px,0px)';
    }, 300);
    setTimeout(() => {
      this.translate = 'translate(0rpx,-300rpx)';
    }, 600);
    setTimeout(() => {
      this.translate = 'translate(' + (this.width + 10) + 'px,-' + uni.upx2px(300) + 'px)';
    }, 900);

    this.check = false;
    this.checkOpacity = 0;
    this.checkRight = 100;
  }

  public checkMap(): void {
    this.$emit('map');
  }

  public checkDetail(): void {
    if (!this.$store.state.logInStatus) {
      wx.getUserProfile({
        desc: '获取微信头像以及昵称',
        success: (res) => {
          this.$store.commit('setUserName', res.userInfo.nickName,);
          this.$store.commit('setAvatarUrl', res.userInfo.avatarUrl);
          this.$store.commit('setLogInStatus', true);
          updateUrl({ //uid获取
            userName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl
          })
        }
      })
    } else {
      this.$emit('detail');
    }
  }

  public unCheckDetail(): void {
    this.$emit('undetail');
  }

  public navigate(): void {
    let animation = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease',
    })
    animation.scale(0.8).step()
    this.animationNavigate = animation.export()
    setTimeout(() => {
      let animation2 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      animation2.scale(1).step()

      this.animationNavigate = animation2.export();
      this.$store.commit('setNavigateSelected', this.index);
      this.$emit('toLow');
    }, 100)
  }

  public book(): void {
    if (this.uid === this.$store.state.uid) {
      wx.showToast({
        title: "禁止向自己预约",
        icon: 'error',
      })
      return;
    }
    this.buttonRotate = 180;
    this.buttonOpacity = 0;
    let animation = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease',
    })
    animation.scale(0.8).step()
    this.animationBook = animation.export()
    setTimeout(() => {
      let animation2 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      animation2.scale(1).step()

      this.animationBook = animation2.export();
    }, 100)
    setTimeout(() => {
      this.height = 600;
    }, 200)

    setTimeout(() => {
      this.bookRotate = 0;
    }, 400)
  }

  public unbook(): void {
    this.bookRotate = -90;
    setTimeout(() => {
      this.height = 300;
    }, 100)
    setTimeout(() => {
      this.buttonRotate = 0;
      this.buttonOpacity = 1;
    }, 400)
  }

  public orderDetail(): void {
    let animation = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease',
    })
    animation.scale(0.8).step()
    this.animationDetail = animation.export()
    setTimeout(() => {
      let animation2 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      animation2.scale(1).step()

      this.animationDetail = animation2.export();
      wx.navigateTo({
        url: '../detail/detail?cid=' + this.cid
      })
    }, 100)

  }

  public chat(): void {
    if (this.uid === this.$store.state.uid) {
      wx.showToast({
        title: "禁止联系自己",
        icon: 'error',
      })
      return;
    }
    let animation = wx.createAnimation({
      duration: 100,
      timingFunction: 'ease',
    })
    animation.scale(0.8).step()
    this.animationContact = animation.export()
    setTimeout(() => {
      let animation2 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      animation2.scale(1).step()

      this.animationContact = animation2.export();
      wx.navigateTo({
        url: '../communication/chat?toUid=' + this.uid
      })
    }, 100)
  }

  public bookDetail(): void {
    wx.navigateTo({
      url: '../detail/detail?cid=' + this.cid
    })
  }

  public bookOrder(): void {
    showModal("确定预约吗？").then(res => {
      if (!res.confirm) {
        return;
      }
      let time1 = this.text1.split(':')
      let time2 = this.text2.split(':')
      if (time1.length !== 2 || time2.length !== 2) {
        wx.showToast({
          title: "时间不合法！",
          icon: 'error',
        })
        return;
      }
      if (Number(time2[0]) * 60 + Number(time2[1]) - Number(time1[0]) * 60 - Number(time1[1]) < 30) {
        wx.showToast({
          title: "预约时间过短！",
          icon: 'error',
        })
        return;
      }
      if (Number(this.possiblePrice) < 0.1) {
        wx.showToast({
          title: "预约金额过少！",
          icon: 'error',
        })
        return;
      }
      wx.showLoading({
        title: "请稍候",
        mask: true
      })
      orderNum({  //查询我是否有未完成的订单以及该电桩是否可用
        uid: this.$store.state.uid,
        cid: this.cid
      }).then(res => {
        if (res.result === 1) {
          orderPay({
            predictedPrice: String(Math.round(Number(this.possiblePrice) * 100))
          }).then(res => {
            let outTradeNo = res.result.outTradeNo;
            const payment = res.result.payment
            wx.requestPayment({
              ...payment,
              success: () => {
                let timeStamp = new Date().getTime();
                payQuery({
                  outTradeNo: outTradeNo
                }).then(res => {
                  let transactionId = res.result.transactionId;
                  return orderInput({
                    status: 0,
                    uid: Number(this.$store.state.uid),
                    toUid: Number(this.uid),
                    cid: Number(this.cid),
                    timeStamp: timeStamp,
                    startTime: this.text1,
                    endTime: this.text2,
                    address: this.address,
                    location: this.location,
                    predictedPrice: this.possiblePrice,
                    outTradeNo: outTradeNo,
                    transactionId: transactionId
                  })
                }).then(res => {
                  let oid = res.result;
                  wx.hideLoading()
                  wx.showToast({
                    title: "预约成功！",
                    icon: 'success',
                    complete: () => {
                      setTimeout(() => {
                        wx.navigateTo({
                          url: '../communication/chat?toUid=' + this.uid,
                          success: (res) => {
                            res.eventChannel.emit('bookOrder', {
                              data: {
                                oid: oid,
                                cid: this.cid,
                                longitude: this.longitude,
                                latitude: this.latitude,
                                address: this.address,
                                location: this.location,
                                price: this.possiblePrice,
                                timeStamp: timeStamp,
                                startTime: this.text1,
                                endTime: this.text2,
                              }
                            })
                          }
                        });
                        this.$store.commit('setRefresh') //更新order
                      }, 500)
                    }
                  })
                })
              },
              fail: () => {
                wx.hideLoading()
                wx.showToast({
                  title: "支付失败！",
                  icon: 'error'
                })
              }
            })
          }).catch(err => {
            wx.hideLoading();
            wx.showToast({
              title: "预约失败！",
              icon: 'error',
            })
          })
        } else if (res.result === -1) {
          wx.hideLoading()
          wx.showToast({
            title: "您有订单未处理",
            icon: 'error',
          })
        } else if (res.result === -2) {
          wx.hideLoading()
          wx.showToast({
            title: "该电桩已被预约",
            icon: 'error',
          })
        }
      })
    })
  }

  @Watch("detail")
  public watchDetail() {
    if (!this.detail) {
      this.$nextTick(function () {
        this.rotate = 0;
        this.bookRotate = -90;
        this.height = 300;
        this.buttonRotate = 0;
        this.buttonOpacity = 1;
      })
    } else {
      this.$nextTick(function () {
        this.rotate = -90;
      })
    }
  }

  @Watch("cid", {
    immediate: true
  })
  public watchCid() {
    this.text1 = '起始时间'
    this.text2 = '结束时间'
    let tempDate = new Date();
    let days = tempDate.getDay();
    if (days === 0) {
      days = 7;
    }
    if (this.time[days - 1] !== "") {
      let minMinutes = tempDate.getHours() * 60 + tempDate.getMinutes() + 30
      let minHours = Math.floor(minMinutes / 60) + ':' + minMinutes % 60
      let showTime = this.time[days - 1].split("-")
      this.minTime1 = this.minTime2 = minHours
      this.maxTime1 = this.maxTime2 = showTime[1]
    }
  }

  public mounted(): void {
    let info = <NodesRef>uni.createSelectorQuery().in(this).select("#box");
    info.boundingClientRect((data) => {
      this.width = data.width - uni.upx2px(16);
    })
    let tempDate = new Date();
    let days = tempDate.getDay();
    if (days === 0) {
      days = 7;
    }
    if (this.time[days - 1] !== "") {
      let minMinutes = tempDate.getHours() * 60 + tempDate.getMinutes() + 30
      let minHours = Math.floor(minMinutes / 60) + ':' + minMinutes % 60
      let showTime = this.time[days - 1].split("-")
      this.minTime1 = this.minTime2 = minHours
      this.maxTime1 = this.maxTime2 = showTime[1]
    }
  }
}
</script>

<style lang="less" scoped>
.order-wrapper {
  position: relative;
  height: 300upx;
  margin: 20upx 20upx 40upx;
  transform-style: preserve-3d;
  transition: .7s all;

  #box {
    border-radius: 40upx;
    height: 300upx;
    width: 100%;
    position: absolute;
    transform: translateZ(300upx);
    background: linear-gradient(to right bottom, rgb(102, 205, 170), #d4fce9);
    overflow: hidden;

    .box-wrapper {
      position: absolute;
      background-color: #219779;
      border-radius: 40upx;
      height: 300upx;
      width: 100%;
      left: 10upx;
      top: 10upx;
      transition: all .3s;

      .card {
        position: absolute;
        background-color: white;
        border-radius: 32upx;
        transition: all .5s;
        top: 9upx;
        left: 8upx;
        height: 284upx;

        .background-image {
          position: absolute;
          opacity: 0.25;
          height: 284upx;
          width: 333upx;
          right: -2upx;
        }

        .card-container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: absolute;
          height: 100%;
          width: 100%;
          padding: 15upx;
        }
      }
    }
  }
}

.address-location-wrapper {
  display: flex;
  flex-direction: column;

  .address-wrapper {
    display: flex;
    justify-content: space-between;

    .location {
      margin: 15upx;
      font-size: 30upx;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 350upx;
    }

    .location-button-image {
      width: 40upx;
      height: 40upx;
      position: relative;
      top: 11upx;
      right: 5upx;
    }

    .distance {
      margin-right: 15upx;
      color: rgba(102, 205, 170, 1);
    }
  }

  .location-wrapper {
    display: flex;
    justify-content: space-between;
    position: relative;

    .location {
      margin-top: 10upx;
      margin-left: 15upx;
      opacity: 0.5;
      width: 450upx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .image1 {
      position: absolute;
      width: 80upx;
      height: 80upx;
      transition: all .5s;
    }
  }
}

.price-wrapper {
  margin-left: 10upx;

  .yuan {
    font-weight: 700;
    color: #219779;
  }

  .price {
    font-size: 40upx;
    font-weight: 700;
    color: #219779;
  }
}

.time-wrapper {
  margin-left: 10upx;
  margin-bottom: 10upx;

  .time {
    font-size: 35upx;
    font-weight: 700;
    color: #219779;
    letter-spacing: 3upx;
  }
}

.box-outer {
  position: absolute;
  transform: rotateY(90deg) translateZ(300upx);
  width: 100%;
  transition: .7s all;
  border-radius: 30upx;
  border-top: 10upx solid rgba(102, 205, 170, 1);
  border-bottom: 10upx solid rgba(102, 205, 170, 1);
  transform-style: preserve-3d;
  overflow: hidden;

  .box-outer-wrapper {
    position: relative;
    transition: .7s all;
    transform-style: preserve-3d;
    transform-origin: 50% 50% -150upx;
  }
}

.time-view {
  margin-top: 15upx;
}

.box-left-wrapper {
  position: absolute;
  width: 100%;
  height: 300upx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  transform: translateZ(5upx);
  background-color: rgba(250, 255, 250, 1);
  transition: all .7s;

  .left-return-wrapper {
    position: absolute;
    right: 30upx;
    top: 20upx;

    .left-return {
      color: rgba(102, 205, 170, 1);
      letter-spacing: 2upx;
      font-size: 28upx;
    }
  }

  .small-detail-wrapper {
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
  }
}

.box-right-wrapper {
  transform-origin: center;
  transform: rotateX(180deg);
  position: absolute;
  transform-style: preserve-3d;
  height: 100%;
  width: 100%;

  .drawer-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    transform-style: preserve-3d;
    perspective: 500px;
    transform: translateZ(300upx);

    .drawer-info {
      height: 300upx;
      width: 100%;
      position: absolute;
      background-color: #edfdf6;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .right-return-wrapper {
        margin-right: 30upx;
        margin-top: 20upx;
        display: flex;
        justify-content: flex-end;

        .right-return {
          color: rgba(102, 205, 170, 1);
          letter-spacing: 2upx;
          font-size: 28upx;
        }
      }
    }

    .drawer-reverse {
      height: 300upx;
      width: 100%;
      position: absolute;
      transform-origin: top;
      top: 300upx;
      border-top: 2px solid rgba(0, 0, 0, 0.3);
      transition: 0.7s all;
      background-color: #edfdf6;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}

.time1 {
  height: 56upx;
  width: 144upx;
  border-radius: 12upx;
  position: relative;
  bottom: 1upx;
  left: 30upx;
  background-color: rgb(230, 230, 230);
}

.time-text1 {
  position: relative;
  top: 10upx;
  left: 18upx;
  font-size: 27upx;
  letter-spacing: 1upx;
}

.time-text2 {
  position: relative;
  top: 10upx;
  left: 18upx;
  font-size: 27upx;
  letter-spacing: 1upx;
}

.line {
  position: relative;
  top: 2upx;
  left: 45upx;
}

.time2 {
  height: 56upx;
  width: 144upx;
  border-radius: 12upx;
  position: relative;
  bottom: 1upx;
  left: 60upx;
  background-color: rgb(230, 230, 230);
}

.price-view {
  margin-right: 30upx;
  margin-top: 15upx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}


</style>
