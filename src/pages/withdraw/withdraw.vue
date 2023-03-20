<template>
  <view style="display: flex;flex-direction:column;justify-content: space-between;height:100vh;">
    <view>
      <view :style="{'height':statusHeight+'px','width':'100%','top':0,'z-index':9999}">
        <view class="cityNavi"
              :style="{'height':statusHeight+'px','background':color,'position':'fixed','width':'100%','top':0}">
          <image src="/static/image/back.png" class="backimg" :style="{'top':statusBarHeight+12.5+'px'}"
                 @tap="back"></image>
          <text :style="{'margin-bottom':cityHeight+'px'}">申请提现</text>
        </view>
      </view>
      <add-card>
        <view class="display">
          <view class="labeltext">提现金额</view>
          <input class="input" type="digit" v-model='withdraw' :maxlength="maxlength"></input>
        </view>
        <view style="margin:15upx;">最大提现金额：{{ maxBalance }}元</view>
      </add-card>
      <add-card>
        <view class="display">
          <view class="labeltext">手机号</view>
          <input maxlength="11" class="input" v-model="phoneNumber"></input>
        </view>
      </add-card>
      <add-card>
        <view class="display">
          <view class="labeltext">*仅供测试，无实际用途</view>
        </view>
      </add-card>
      <!-- <add-card>
        <view class="display">
          <text class="labeltext">图片</text>
        </view>
        <view class='content'>
          <view class='img-view' v-for='(item,index) in avatarUrl' :key='index'>
            <image :src='item' @tap='showPic(item)'
              style="width:200upx;height:200upx;margin-left: 3.9upx;margin-right: 3.9upx;"
              mode='aspectFill'>
            </image>
            <icon @tap='deletePic(index)' class='close' color='rgb(199, 0, 3)' type='clear' size='15'>
            </icon>
          </view>
          <image @tap='uploadPic' class='add-img' src='/static/image/addImg.png' v-show="isAdd"></image>
        </view>
      </add-card> -->
    </view>
    <view>
      <!-- <button class="submit" @tap="submit" :disabled="(avatarUrl.length==0 || String(withdraw).length==0) || disable">提现</button> -->
      <button class="submit" @tap="submit"
              :disabled=" phoneNumber.length===0 || String(withdraw).length===0 || disable">
        提现
      </button>
    </view>
  </view>
</template>

<script lang="ts">
import addCard from '@/components/addCard.vue'
import {Component, Vue, Watch} from "vue-property-decorator";

@Component({
  components: {
    addCard
  }
})
export default class Withdraw extends Vue {
  private statusHeight: number = wx.getSystemInfoSync().statusBarHeight + 50;
  private statusBarHeight: number = wx.getSystemInfoSync().statusBarHeight;
  private cityHeight: number = 0;
  private color: string = 'rgba(102,205,170,1)';
  private withdraw: any = null;
  private avatarUrl: any[] = [];
  private maxBalance: number = 0;
  private maxlength: number = 5;
  private haveDot: boolean = false;
  private disable: boolean = false;
  private phoneNumber: string = "";

  public get isAdd() {
    return this.avatarUrl.length < 1;
  }

  public get listLength() {
    return 1 - this.avatarUrl.length;
  }

  public back() {
    wx.navigateBack({})
  }

  public submit(): void {
    /*if(Number(this.withdraw)>this.maxBalance) {
      wx.showToast({
        title: "提现金额过大！",
        icon: 'error',
      })
      return;
    }
    if(Number(this.withdraw)<=0) {
      wx.showToast({
        title: "提现金额过小！",
        icon: 'error',
      })
      return;
    }*/
    if (this.phoneNumber.length === 0) {
      wx.showToast({
        title: "请输入手机号！",
        icon: 'error',
      })
      return;
    }
    /*if(this.avatarUrl.length==0) {
      wx.showToast({
        title: "请上传图片！",
        icon: 'error',
      })
      return;
    }*/
    this.disable = true
    wx.cloud.callFunction({
      name: 'withdrawalInput',
      data: {
        uid: this.$store.state.uid,
        withdrawal: this.withdraw,
        phoneNumber: this.phoneNumber
      }
    }).then(res => {
      wx.showToast({
        title: "提交成功！",
        icon: 'success',
        complete: () => {
          setTimeout(() => {
            this.disable = false;
            uni.navigateBack({})
          }, 1500)
        }
      })
    })
    /*for (var i = 0; i < this.avatarUrl.length; i++) {
      wx.uploadFile({
        url: "https://ws.healtool.cn/uploadPay/" + this.$store.state.uid,
        filePath: this.avatarUrl[i],
        name: 'file',
        success: res => {
          if (res.data.startsWith("<html>")) {
            wx.showToast({
              title: "图片上传失败！",
              icon: 'none',
            })
            this.disable=false;
            return;
          }
          var res = JSON.parse(res.data)
          if (res.code != 200) {
            wx.showToast({
              title: "图片上传失败！",
              icon: 'none',
            })
            this.disable=false;
            return;
          } else {
            wx.cloud.callFunction({
              name: 'withdrawalInput',
              data: {
                uid:this.$store.state.uid,
                withdrawal:this.withdraw,
                wxPay:res.data
              }
            }).then(res=>{
              wx.showToast({
                title: "提交成功！",
                icon: 'success',
                complete:()=>{
                  setTimeout(()=>{
                    this.disable=false;
                    uni.navigateBack({})
                  },1500)
                }
              })
            })
          }
        },
        fail: res => {
          wx.showToast({
            title: "图片上传失败！",
            icon: 'none',
          })
          this.disable=false;
          return;
        }
      })
    }*/
  }

  public showPic(item: any): void {
    wx.previewImage({
      current: item,
      urls: this.avatarUrl,
    })
  }

  public deletePic(index: number): void {
    this.avatarUrl.splice(index, 1);
  }

  public uploadPic(): void {
    if (this.avatarUrl.length >= 1) {
      wx.showToast({
        title: "图片数量不能超过一张！",
        icon: 'none',
      })
      return;
    }
    wx.chooseMedia({
      count: this.listLength,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: res => {
        //限制图片大小
        for (var i = 0; i < res.tempFiles.length; i++) {
          let size = res.tempFiles.every(item => {
            return item.size <= 10000000
          })
          if (size) {
            this.avatarUrl.push(res.tempFiles[i].tempFilePath);
          } else {
            wx.showToast({
              title: '上传图片不能大于10M!',
              icon: 'none'
            })
            return;
          }
        }
      }
    })
  }

  public mounted(): void {
    this.cityHeight = (this.statusHeight - uni.getMenuButtonBoundingClientRect().bottom);
  }

  public onLoad(option: { maxBalance: number; }): void {
    this.maxBalance = option.maxBalance
  }

  @Watch("withdraw")
  public watchWithdraw() {
    if (this.withdraw.indexOf('.') !== -1 && !this.haveDot) {
      this.maxlength = this.withdraw.length + 2
      this.haveDot = true
    } else if (this.withdraw.indexOf('.') === -1 && this.haveDot) {
      this.maxlength = 5
      this.haveDot = false
    }
  }
}
</script>

<style scoped>
.cityNavi {
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

.display {
  margin: 15upx;
  display: flex;
  justify-content: space-between;
}

.labeltext {
  letter-spacing: 2upx;
  font-weight: 700;
  margin-top: 10upx;
  margin-bottom: 10upx;
}

.submit {
  background-color: rgba(102, 205, 170, 1);
  color: white;
  font-weight: 700;
  letter-spacing: 3upx;
  margin: 20upx;
  border-radius: 20upx;
}

.add-img {
  width: 200upx;
  height: 200upx;
  opacity: 0.3;
  margin-left: 3.9upx;
  margin-right: 3.9upx;
}

.close {
  position: absolute;
  margin-left: -45upx;
  margin-top: 10upx;
}

.input {
  margin-top: 10upx;
  margin-bottom: 10upx;
  width: 500upx;
  text-align: right;
}
</style>
