<template>
  <view style="display: flex;flex-direction:column;justify-content: space-between;height:100vh;">
    <view>
      <view :style="{'height':statusHeight+'px','width':'100%','top':0,'z-index':9999}">
        <view class="cityNavi"
              :style="{'height':statusHeight+'px','background':color,'position':'fixed','width':'100%','top':0}">
          <image src="/static/image/back.png" class="backimg" :style="{'top':statusBarHeight+12.5+'px'}"
                 @tap="back"></image>
          <text :style="{'margin-bottom':cityHeight+'px'}">意见反馈</text>
        </view>
      </view>
      <add-card>
        <view class="display">
          <view class="labeltext">反馈描述</view>
          <textarea class="input" placeholder="请说说您的意见或反馈,以便于我们提供更好的服务" maxlength="200"
                    v-model='feedback'></textarea>
        </view>
      </add-card>
      <add-card>
        <view class="display">
          <view class="labeltext">联系方式</view>
          <input placeholder="请输入您的手机号(选填)" maxlength="11" v-model="phoneNumber"></input>
        </view>
      </add-card>
    </view>
    <view>
      <button class="submit" @tap="submit" :disabled="feedback.length==0">提交反馈</button>
    </view>
  </view>
</template>

<script lang="ts">
import addCard from '@/components/addCard.vue'
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {
    addCard
  }
})
export default class Feedback extends Vue {
  private statusHeight: number = wx.getSystemInfoSync().statusBarHeight + 50;
  private statusBarHeight: number = wx.getSystemInfoSync().statusBarHeight;
  private cityHeight: number = 0;
  private color: string = 'rgba(102,205,170,1)';
  private feedback: string = "";
  private phoneNumber: string = "";

  public back(): void {
    wx.navigateBack({})
  }

  public submit() {
    wx.cloud.callFunction({
      name: 'feedback',
      data: {
        feedback: this.feedback,
        phoneNumber: this.phoneNumber,
        uid: this.$store.state.uid
      }
    }).then(res => {
      wx.showToast({
        title: "提交成功！",
        icon: 'success',
        complete: () => {
          setTimeout(() => {
            uni.navigateBack({})
          }, 1000)
        }
      })
    })
  }

  public mounted(): void {
    this.cityHeight = (this.statusHeight - wx.getMenuButtonBoundingClientRect().bottom);
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

.divLine {
  width: 100%;
  height: 3upx;
  background-color: #E0E3DA;
  margin-top: 18rpx;
  margin-bottom: 18rpx;
}

.display {
  margin: 15upx;
}

.labeltext {
  letter-spacing: 2upx;
  font-weight: 700;
  margin-top: 20upx;
  margin-bottom: 20upx;
}

.input {
  width: 100%;
  height: 300upx;
}

.submit {
  background-color: rgba(102, 205, 170, 1);
  color: white;
  font-weight: 700;
  letter-spacing: 3upx;
  margin: 20upx;
  border-radius: 20upx;
}
</style>
