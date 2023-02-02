<template>
  <view style="margin: 30upx;padding: 25upx;border-radius: 40upx;
	position: relative;transition: all .5s;border: 8upx solid rgb(50,200,210);">
    <view
        style="font-size: 32upx;font-weight: 700;letter-spacing: 1upx;margin-bottom: 15upx;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
      {{ address }}
    </view>
    <view style="font-size: 25upx;font-weight: 600;margin-bottom: 15upx;color: rgba(0,0,0,0.5);
			overflow: hidden;-webkit-line-clamp: 3;text-overflow: ellipsis;display: -webkit-box;">
      {{ location }}
    </view>
    <view style="margin-bottom: 15upx;">
      <text style="font-size: 25upx;font-weight: 600;color: rgba(0,0,0,0.5);">
        下单时间：
      </text>
      <text style="font-size: 25upx;letter-spacing: 1upx;color: rgba(0,0,0,0.5);font-weight: 600;">
        {{ timeText }}
      </text>
    </view>
    <view style="margin-bottom: 15upx;">
      <text style="font-size: 25upx;font-weight: 600;color: rgba(0,0,0,0.5);">
        剩余时间：
      </text>
      <text style="font-size: 25upx;letter-spacing: 1upx;color: rgba(0,0,0,0.5);font-weight: 600;">
        {{ timeRemain }}
      </text>
    </view>
    <view style="margin-bottom: 15upx;">
      <text style="font-size: 25upx;font-weight: 600;color: rgba(0,0,0,0.5);">
        预约时间：
      </text>
      <text style="font-size: 32upx;font-weight: 700;color:rgb(50,200,210) ;letter-spacing: 1upx;">
        {{ startTime }}-{{ endTime }}
      </text>
    </view>
    <view style="margin-bottom: 15upx;">
      <text style="font-size: 25upx;font-weight: 600;color: rgba(0,0,0,0.5);">
        预估价格：
      </text>
      <text style="font-size: 32upx;font-weight: 700;color:rgb(50,200,210) ;letter-spacing: 1upx;">
        ￥{{ predictedPrice }}
      </text>
    </view>
    <view style="margin-bottom: 15upx;">
      <text style="font-size: 25upx;font-weight: 600;color: rgba(0,0,0,0.5);">
        状态：
      </text>
      <text style="font-size: 32upx;font-weight: 700;letter-spacing: 1upx;" :style="{'color':statusColor}">
        {{ statusText }}
      </text>
    </view>
    <view style="display: flex;justify-content: center;">
      <view style="width: 450upx;display: flex;justify-content: space-between;">
        <view style="background-color:rgb(50,200,210);height: 70upx;width: 170upx;color: white;
					font-size: 28upx;font-weight: 700;letter-spacing: 2upx;border-radius: 25upx;
					display: flex;justify-content: center;align-items: center;" @tap="detail()">
          电桩详情
        </view>
        <view style="height: 70upx;width: 170upx;color: white;
					font-size: 28upx;font-weight: 700;letter-spacing: 2upx;border-radius: 25upx;
					display: flex;justify-content: center;align-items: center;" :style="{'background-color':checkColor}"
              @tap="check">
          {{ checkStatus }}
        </view>
      </view>

    </view>
    <image src="../static/image/orderHistory-blue.png"
           style="width: 300upx;height: 300upx;position: absolute;right: -10upx;bottom: 120upx;opacity: 0.3;"></image>
  </view>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import SocketTask = WechatMiniprogram.SocketTask;
import showModal from "@/apis/wx/showModal";
import {orderStatusChange, paySharing} from "@/apis/book/book";
import {socketClose, socketSend} from "@/apis/wx/socket";

@Component
export default class BorrowOrderHistory extends Vue {
  @Prop()
  uid!: string;
  @Prop()
  toUid!: string;
  @Prop()
  cid!: number;
  @Prop()
  oid!: number;
  @Prop()
  address!: string;
  @Prop()
  location!: string;
  @Prop()
  startTime!: string;
  @Prop()
  endTime!: string;
  @Prop()
  timeStamp!: string;
  @Prop()
  predictedPrice!: string;
  @Prop()
  statusContext!: number;

  public status: number = -3;
  public statusText: string = "";
  public statusColor: string = "";
  public checkStatus: string = "";
  public checkColor: string = "";
  public timeText: string = "";
  public timeCount: number = -1;
  public socketTask: SocketTask | undefined = undefined;
  public timeRemain: string = "";

  public detail(): void {
    wx.navigateTo({
      url: '../detail/detail?cid=' + this.cid
    })
  }

  public check(): void {
    if (this.status == 0) {
      showModal("确定预约？").then(res => {
        if (res.confirm) {
          wx.showLoading({
            title: "请稍候",
            mask: true
          })
          this.status = 1;
          this.timeRemain = '订单完成';
          this.checkStatus = '预约已确定';
          this.checkColor = 'rgba(0,0,0,0.5)';
          this.statusText = '预约已确定';
          this.statusColor = 'rgb(50,200,210)';

          return paySharing({
            oid: this.oid,
          })
        }
      }).then(res => {
        return orderStatusChange({
          oid: this.oid,
          status: 1,
        })
      }).then(res => {
        let data = JSON.stringify({
          oid: this.oid,
          uid: this.uid,
          toUid: this.toUid,
          message: '1'
        });
        return socketSend(this.socketTask, data)
      }).then(res => {
        return socketClose(this.socketTask)
      }).then(res => {
        this.socketTask = undefined;
        wx.hideLoading();
        wx.showToast({
          title: "已确定预约",
          icon: 'success',
          complete: () => {
            setTimeout(() => {
              wx.navigateTo({
                url: '../communication/chat?toUid=' + this.uid,
                success: res => {
                  res.eventChannel.emit('sendStatus', {
                    data: {
                      message: '已确定预约'
                    }
                  })
                }
              });
            }, 500)
          }
        })
      })
    }
  }

  public mounted(): void {
    this.status = this.statusContext;
    let time = new Date(Number(this.timeStamp));
    let year = time.getFullYear();
    let month = time.getMonth() + 1 < 10 ? "0" + (time.getMonth() + 1) : time.getMonth() + 1;
    let date = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
    let hh = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
    let mm = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
    let ss = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
    this.timeText = year + '年' + month + '月' + date + '日' + hh + ':' + mm + ':' + ss;
    if (this.status == -2) {
      this.timeRemain = '订单完成';
      this.checkStatus = '预约已超时';
      this.checkColor = 'rgba(0,0,0,0.5)';
      this.statusText = '预约已超时';
      this.statusColor = 'rgba(0,0,0,0.5)';
    } else if (this.status == -1) {
      this.timeRemain = '订单完成';
      this.checkStatus = '预约已取消';
      this.checkColor = 'rgba(0,0,0,0.5)';
      this.statusText = '预约已取消';
      this.statusColor = '#be0e0e';
    } else if (this.status == 0) {
      this.checkStatus = '确定预约';
      this.checkColor = 'rgb(50,200,210)';
      this.statusText = '预约已发起';
      this.statusColor = 'rgb(50,200,210)';

      this.timeCount = setInterval(() => {
        if (this.status == 0) {
          let currentTime = new Date().getTime();
          let count = 1800 - Math.ceil(((currentTime - Number(this.timeStamp)) / 1000));
          let mm = Math.ceil(count / 60);
          let ss = count % 60;

          this.timeRemain = (mm < 10 ? '0' + mm : mm) + ':' + (ss < 10 ? '0' + ss : ss);
          if (count <= 0) {
            this.status = -2;
            this.timeRemain = '订单完成';
            this.checkStatus = '预约已超时';
            this.checkColor = 'rgba(0,0,0,0.5)';
            this.statusText = '预约已超时';
            this.statusColor = 'rgba(0,0,0,0.5)';
            clearInterval(this.timeCount);
            this.timeCount = -1;
            if (this.socketTask != null) {
              this.socketTask.close({
                success: () => {
                  this.socketTask = undefined;
                }
              });
            }
          }
        } else clearInterval(this.timeCount);

      }, 1000);

      this.socketTask = wx.connectSocket({		//打开链接
        url: 'wss://ws.healtool.cn/websocketapi/Order/' + this.oid + '/' + this.toUid + '/' + this.uid
      });
      this.socketTask.onMessage((res) => {
        this.status = (JSON.parse(<string>res.data)).message;
        if (this.status == -1) {	//我向对方发起预约 电桩是对方的 按下则为取消预约
          this.timeRemain = '订单完成';
          this.checkStatus = '预约已取消';
          this.checkColor = 'rgba(0,0,0,0.5)';
          this.statusText = '预约已取消';
          this.statusColor = '#be0e0e';
        } else if (this.status == 1) {		//对方向我发起预约 电桩是自己的 按下则为确定预约
          this.timeRemain = '订单完成';
          this.checkStatus = '预约已确定';
          this.checkColor = 'rgba(0,0,0,0.5)';
          this.statusText = '预约已确定';
          this.statusColor = 'rgb(50,200,210)';
        }
        this.socketTask?.close({
          success: () => {
            this.socketTask = undefined;
          }
        });
      });


    } else if (this.status == 1) {
      this.timeRemain = '订单完成';
      this.checkStatus = '预约已确定';
      this.checkColor = 'rgba(0,0,0,0.5)';
      this.statusText = '预约已确定';
      this.statusColor = 'rgb(50,200,210)';
    }
  }

  public destroyed(): void {
    if (this.timeCount != null) {
      clearInterval(this.timeCount);
    }
    if (this.socketTask != undefined) {
      this.socketTask.close({});
    }
  }
}
</script>

<style scoped>
</style>

