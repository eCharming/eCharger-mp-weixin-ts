<template>
  <view style="display: flex;flex-direction:column;justify-content: space-between;height:100vh;">
    <view>
      <view class="navigator" :style="{'height':statusHeight+'px'}">
        <image src="/static/image/back.png" class="backimg" :style="{'top':statusBarHeight+12.5+'px'}"
               @tap="back"></image>
        <text :style="{'margin-bottom':myBottom+'px'}">我的</text>
      </view>

      <view class="avatar-view"
            style="height: 220rpx;display: flex;justify-content: center;align-items: center;margin: 20upx;">
        <view
            style="display: flex;flex-direction: column;align-items: center;color: rgba(0,0,0,0.6);font-size: 35rpx;">
          <image :src="avatarUrl" style="height: 130rpx;width: 130rpx;border-radius: 50%;margin: 20rpx;">
          </image>
          <text>{{ userName }}</text>
          <text style="font-size: 25rpx;">余额：{{ balance }}元</text>
        </view>
      </view>

      <add-card style='margin:10rpx;'>
        <view style="display: flex;justify-content: space-around;">
          <view @tap="navi(1)" class='funbutton'>
            <image src='/static/image/historyOrder.png' style="width: 100upx;height:100upx;"></image>
            <view class='labeltext'>历史订单</view>
          </view>
          <view @tap="navi(2)" class='funbutton'>
            <image src='/static/image/myCharger.png' style="width: 100upx;height:100upx;"></image>
            <view class='labeltext'>我的电桩</view>
          </view>
          <view @tap="navi(3)" class='funbutton'>
            <image src='/static/image/faq.png' style="width: 100upx;height:100upx;"></image>
            <view class='labeltext'>常见问题</view>
          </view>
        </view>

      </add-card>

      <add-card style='margin:10rpx;'>
        <view class='labeltext' @tap="navi(7)">
          申请提现（Beta）
        </view>
        <view class='divLine'></view>
        <view class='labeltext' @tap="navi(6)">
          意见反馈
        </view>
        <view class='divLine'></view>
        <view class='labeltext' @tap="navi(5)">
          关于我们
        </view>
      </add-card>
    </view>

    <view>
      <button class="submit" @tap="logout">退出登录</button>
    </view>
  </view>
</template>

<script lang="ts">
import {getBalance, wxLogout} from '@/apis/user/user';
import addCard from '@/components/addCard.vue'
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {
    addCard
  }
})
export default class My extends Vue {
  private uid: number = -1;
  private avatarUrl: string = '';
  private userName: string = '';
  private myBottom: number = 0; //联系人距离导航栏底部距离
  private statusHeight: number = 0; //导航栏高度
  private statusBarHeight: number = wx.getSystemInfoSync().statusBarHeight; //状态栏高度
  private balance: number = 0;	//余额

  public back(): void {
    wx.navigateBack({})
  }

  public navi(index: number): void {
    if (index === 1) {
      wx.navigateTo({
        url: '../orders/ordersHistory',
      });
    } else if (index === 2) {
      this.$store.commit('setMyCharger')
      wx.navigateBack({})
    } else if (index === 3) {
      wx.navigateTo({
        url: '../faq/faq',
      })
    } else if (index === 5) {
      wx.navigateTo({
        url: '../aboutUs/aboutUs',
      })
    } else if (index === 6) {
      wx.navigateTo({
        url: '../feedback/feedback',
      })
    } else if (index === 7) {
      wx.navigateTo({
        url: '../withdraw/withdraw?maxBalance=' + this.balance
      })
    }
  }

  public logout(): void {
    wxLogout({
      uid: this.$store.state.uid
    }).then(res => {
      this.$store.commit('setLogInStatus', null);
      wx.showToast({
        title: "退出登录成功！",
        icon: 'success',
        complete: () => {
          setTimeout(() => {
            wx.navigateBack({})
          }, 1000)
        }
      })
    })
  }

  public mounted(): void {
    this.statusHeight = wx.getSystemInfoSync().statusBarHeight + 50;
    this.myBottom = (this.statusHeight - wx.getMenuButtonBoundingClientRect().bottom);
    this.avatarUrl = this.$store.state.avatarUrl;
    this.userName = this.$store.state.userName;
    getBalance({
      uid: this.$store.state.uid
    }).then(res => {
      this.balance = res.result / 100
    })
  }

  public onShow(): void {
    getBalance({
      uid: this.$store.state.uid
    }).then(res => {
      this.balance = res.result / 100
    })
  }
}
</script>

<style scoped>
.navigator {
  background-color: rgba(102, 205, 170, 1);
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
  font-weight: 700;
  margin-top: 10upx;
  margin-bottom: 10upx;
}

.funbutton {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 30upx;
  margin-bottom: 30upx;
}

.divLine {
  width: 100%;
  height: 3upx;
  background-color: #E0E3DA;
  margin-top: 18rpx;
  margin-bottom: 18rpx;
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
