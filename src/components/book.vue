<template>
  <view>
    <view class="card">
      <view>
        <view class="address">{{ address }}</view>
        <view class="location">{{ location }}</view>
        <image
            style="width: 420upx; height: 315upx; margin-bottom: 25upx"
            :src="imageUrl"
        ></image>

        <view class="time-wrap">
          <view class="time-text">下单时间：</view>
          <view class="book-time">{{ bookTimeText }}</view>
        </view>
        <view class="time-wrap" v-if="status === 0">
          <view class="time-text">剩余时间：</view>
          <view class="book-time">{{ timeRemain }}</view>
        </view>
        <view class="time-wrap">
          <view class="time-text">预约时间：</view>
          <view class="start-end-time">{{ startTime }}-{{ endTime }}</view>
        </view>
        <view class="time-wrap">
          <view class="time-text">预估价格：</view>
          <view class="price">￥{{ price }}</view>
        </view>
        <view class="charger-detail-wrapper">
          <view class="charger-detail-wrap">
            <view class="charge-detail" @tap="detail()">
              <view>电桩详情</view>
            </view>
            <view class="status-text" :style="{ 'background-color': color }" @tap="check()">
              <view>{{ statusText }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import showModal from "@/apis/wx/showModal";
import {orderRefund, orderStatusChange, orderStatusQuery, paySharing} from "@/apis/book/book";
import {BookMessage} from "@/apis/book/book-interface";
import SocketTask = WechatMiniprogram.SocketTask;
import {socketClose, socketSend} from "@/apis/wx/socket";

@Component
export default class Book extends Vue {
  @Prop()
  message!: BookMessage;

  private status: number = 0;
  private oid: number = 0;
  private cid: number = 0;
  private uid: number = 0;
  private toUid: number = 0;
  private longitude: string = "";
  private latitude: string = "";
  private address: string = "";
  private location: string = "";
  private price: string = "";
  private timeStamp: string = "";
  private startTime: string = "";
  private endTime: string = "";
  private imageUrl: string = "";
  private statusText: string = "";
  private bookTimeText: string = "";
  private timeRemain: string = "";
  private color: string = "rgba(102,205,170,1)"
  private timeCount: number = 0; //倒计时计时器
  private socketTask: SocketTask | undefined;

  public detail(): void {
    wx.navigateTo({
      url: "../detail/detail?cid=" + this.cid,
    });
  }

  public check(): void {
    if (this.status == 0) {
      //状态码为0 也即预约订单正在等待桩主确定
      if (this.uid == this.$store.state.uid) {
        //我向对方发起预约 电桩是对方的 按下则为取消预约
        showModal("确定取消预约？").then(res => {
          if (res.confirm) {
            wx.showLoading({
              title: "请稍候",
              mask: true
            });
            return orderRefund({
              oid: this.oid
            });
          }
        }).then(res => {
          return orderStatusChange({
            oid: this.oid,
            status: -1
          })
        }).catch(err => {
          wx.showToast({
            title: "预约取消失败！",
            icon: "error"
          });
        }).then(res => {
          wx.hideLoading();
          wx.showToast({
            title: "预约取消成功！",
            icon: "success"
          });
          this.$emit("changeOrderStatus", -1);
          this.$emit("orderText", "已取消预约");
          this.status = -1;
          this.statusText = "已取消预约";
          this.color = "rgba(0,0,0,0.6)";

          let data = JSON.stringify({
            oid: this.oid,
            uid: this.uid,
            toUid: this.toUid,
            message: "-1",
          });
          socketSend(this.socketTask, data).then(res => {
            return socketClose(this.socketTask)
          }).then(res => {
            this.socketTask = undefined;
          })
        })
      }
    } else {
      //对方向我发起预约 电桩是自己的 按下则为确定预约
      showModal("确定预约？").then(res => {
        if (res.confirm) {
          wx.showLoading({
            title: "请稍候",
            mask: true,
          });
          return paySharing({
            oid: this.oid
          })
        }
      }).then(res => {
        return orderStatusChange({
          oid: this.oid,
          status: 1
        })
      }).catch(err => {
        wx.showToast({
          title: "确认取消失败！",
          icon: "error"
        });
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: "预约确定成功！",
          icon: "success"
        });
        this.$emit("changeOrderStatus", 1);
        this.$emit("orderText", "已确定预约");
        this.status = 1;
        this.statusText = "已确定预约";
        this.color = "rgba(0,0,0,0.6)";
        let data = JSON.stringify({
          oid: this.oid,
          uid: this.uid,
          toUid: this.toUid,
          message: "1",
        });
        socketSend(this.socketTask, data).then(res => {
          return socketClose(this.socketTask)
        }).then(res => {
          this.socketTask = undefined;
        })
      })
    }
  }

  public mounted(): void {
    this.status = this.message.status;
    this.oid = this.message.oid;
    this.cid = this.message.cid;
    this.uid = this.message.uid;
    this.toUid = this.message.toUid;
    this.longitude = this.message.longitude;
    this.latitude = this.message.latitude;
    this.address = this.message.address;
    this.location = this.message.location;
    this.price = this.message.price;
    this.timeStamp = this.message.timeStamp;
    this.startTime = this.message.startTime;
    this.endTime = this.message.endTime;
    this.imageUrl =
        "https://apis.map.qq.com/ws/staticmap/v2/?key=ORFBZ-V73LX-N3Z4Y-Z3MR4-V35MJ-LNBFL&size=200x150&center=" +
        this.latitude +
        "," +
        this.longitude +
        "&markers=" +
        this.latitude +
        "," +
        this.longitude +
        "&zoom=14";
    let time = new Date(Number(this.timeStamp));
    let month =
        time.getMonth() + 1 < 10
            ? "0" + (time.getMonth() + 1)
            : time.getMonth() + 1;
    let date = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
    let hh = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
    let mm =
        time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
    let ss =
        time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
    this.bookTimeText = month + "月" + date + "日" + hh + ":" + mm + ":" + ss;
    if (this.status == -2) {
      //状态码为-2 也即预约订单超时
      this.statusText = "预约已过期";
      this.color = "rgba(0,0,0,0.6)";
    } else if (this.status == -1) {
      //状态码为-1 也即预约订单被取消
      if (this.uid == this.$store.state.uid) {
        this.statusText = "已取消预约";
        this.color = "rgba(0,0,0,0.6)";
      } else {
        this.statusText = "对方已取消";
        this.color = "rgba(0,0,0,0.6)";
      }
    } else if (this.status == 0) {
      //状态码为0 也即预约订单正在等待桩主确定
      if (this.uid == this.$store.state.uid) {
        //我向对方发起预约 电桩是对方的
        this.statusText = "取消预约";
        this.color = "#be0e0e";
      } else {
        //对方向我发起预约 电桩是自己的
        this.statusText = "确定预约";
        this.color = "rgba(102,205,170,1)";
      }

      let currentTime = new Date().getTime();
      let count = 1800 - Math.floor((currentTime - Number(this.timeStamp)) / 1000);
      if (count <= 0) {
        this.$emit("changeOrderStatus", -2);
        this.status = -2;
        this.statusText = "预约已过期";
        this.color = "rgba(0,0,0,0.6)";

        orderStatusQuery({
          oid: this.oid
        }).then(res => {
          if (res.result != -2) {
            this.status = res.result;
            this.$emit("changeOrderStatus", this.status);
            if (this.status == 1) {
              if (this.uid != this.$store.state.uid) {
                this.statusText = "已确定预约";
                this.color = "rgba(0,0,0,0.6)";
              } else {
                this.statusText = "对方已确定";
                this.color = "rgba(0,0,0,0.6)";
              }
            } else if (this.status == -1) {
              if (this.uid == this.$store.state.uid) {
                this.statusText = "已取消预约";
                this.color = "rgba(0,0,0,0.6)";
              } else {
                this.statusText = "对方已取消";
                this.color = "rgba(0,0,0,0.6)";
              }
            }
          }
        });
      } else {
        orderStatusQuery({
          oid: this.oid
        }).then(res => {
          if (res.result != -2) {
            this.status = res.result;
            this.$emit("changeOrderStatus", this.status);
            if (this.status == 1) {
              if (this.uid != this.$store.state.uid) {
                this.statusText = "已确定预约";
                this.color = "rgba(0,0,0,0.6)";
              } else {
                this.statusText = "对方已确定";
                this.color = "rgba(0,0,0,0.6)";
              }
            } else if (this.status == -1) {
              if (this.uid == this.$store.state.uid) {
                this.statusText = "已取消预约";
                this.color = "rgba(0,0,0,0.6)";
              } else {
                this.statusText = "对方已取消";
                this.color = "rgba(0,0,0,0.6)";
              }
            } else if (this.status == 0) {
              let uid = this.uid;
              let toUid = this.toUid;
              if (this.uid != this.$store.state.uid) {
                uid = this.toUid;
                toUid = this.uid;
              }
              this.socketTask = wx.connectSocket({  //打开链接
                url: `wss://ws.healtool.cn/websocketapi/Order/${this.oid}/${uid}/${toUid}`
              });

              this.socketTask.onMessage(res => {
                this.status = JSON.parse(<string>res.data).message;
                if (this.status == -1) {
                  //我向对方发起预约 电桩是对方的 按下则为取消预约
                  this.$emit("changeOrderStatus", -1);
                  this.statusText = "对方已取消";
                  this.color = "rgba(0,0,0,0.6)";
                } else {
                  //对方向我发起预约 电桩是自己的 按下则为确定预约
                  this.$emit("changeOrderStatus", 1);
                  this.statusText = "对方已确定";
                  this.color = "rgba(0,0,0,0.6)";
                }
                socketClose(this.socketTask).then(res => {
                  this.socketTask = undefined;
                })
              });

              this.timeCount = setInterval(() => {
                if (this.status == 0) {
                  let currentTime = new Date().getTime();
                  let count =
                      1800 - Math.floor((currentTime - Number(this.timeStamp)) / 1000);
                  let mm = Math.floor(count / 60);
                  let ss = count % 60;
                  this.timeRemain =
                      (mm < 10 ? "0" + mm : mm) +
                      ":" +
                      (ss < 10 ? "0" + ss : ss);
                  if (count <= 0) {
                    this.$emit("changeOrderStatus", -2);
                    this.status = -2;
                    this.statusText = "预约已过期";
                    this.color = "rgba(0,0,0,0.6)";
                    clearInterval(this.timeCount);
                    this.timeCount = -1;
                    socketClose(this.socketTask).then(res => {
                      this.socketTask = undefined;
                    })
                  }
                } else clearInterval(this.timeCount);
              }, 1000);
            }
          }
        });
      }
    } else if (this.status == 1) {
      //状态码为1 也即桩主确定了订单
      if (this.uid != this.$store.state.uid) {
        this.statusText = "已确定预约";
        this.color = "rgba(0,0,0,0.6)";
      } else {
        this.statusText = "对方已确定";
        this.color = "rgba(0,0,0,0.6)";
      }
    }
  }

  public destroyed(): void {
    if (this.timeCount) {
      clearInterval(this.timeCount);
    }
    if (this.socketTask !== undefined) {
      this.socketTask.close({});
    }
  }
}
</script>

<style lang="less" scoped>
.card {
  background-color: rgb(255, 255, 255);
  width: 500upx;
  border-radius: 25upx;
  padding: 40upx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .address {
    width: 400upx;
    font-size: 32upx;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 25upx;
    color: rgba(102, 205, 170, 1);
  }

  .location {
    width: 400upx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 25upx;
    color: rgba(0, 0, 0, 0.5);
  }

  .book-time {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.5);
    letter-spacing: 1upx;
  }

  .time-wrap {
    display: flex;
    margin-bottom: 25upx
  }

  .time-text {
    color: rgba(0, 0, 0, 0.5);
  }

  .status-text {
    height: 70upx;
    width: 170upx;
    color: white;
    font-size: 28upx;
    font-weight: 700;
    letter-spacing: 2upx;
    border-radius: 25upx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .start-end-time {
    font-size: 35upx;
    font-weight: 700;
    color: rgba(102, 205, 170, 1);
    letter-spacing: 3upx;
  }

  .price {
    font-size: 35upx;
    font-weight: 700;
    color: rgba(102, 205, 170, 1);
    letter-spacing: 3upx;
  }

  .charger-detail-wrap {
    width: 400upx;
    display: flex;
    justify-content: space-between;
  }

  .charge-detail {
    height: 70upx;
    width: 170upx;
    background-color: rgba(102, 205, 170, 1);
    color: white;
    font-size: 28upx;
    font-weight: 700;
    letter-spacing: 2upx;
    border-radius: 25upx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .charger-detail-wrapper {
    width: 100%;
    height: 70upx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
