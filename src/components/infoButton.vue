<template>
  <view>
    <view>
      <image :src="src"
             style="transition: opacity .3s;border-radius: 50%;width: 100rpx;height:100rpx;margin:20rpx"
             :style="{'pointer-events':pointerEvents,'opacity':opacity}" @click="info"></image>
    </view>
  </view>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

@Component
export default class InfoButton extends Vue {
  public src: string = "../static/image/person_1.gif";
  public pointerEvents: string = "auto";
  public opacity: number = 1;
  public logInStatus: boolean = false;

  @Prop()
  isLow!: boolean;

  public info(): void {
    if (!this.logInStatus) {
      wx.getUserProfile({
        desc: '获取微信头像以及昵称',
        success: (res) => {
          this.$store.commit('setUserName', res.userInfo.nickName,);
          this.$store.commit('setAvatarUrl', res.userInfo.avatarUrl);
          this.$store.commit('setLogInStatus', true);
          wx.cloud.callFunction({ //uid获取
            name: 'updateUrl',
            data: {
              userName: res.userInfo.nickName,
              avatarUrl: res.userInfo.avatarUrl,
            }
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '../my/my',
      });
    }
  }

  public mounted(): void {
    this.logInStatus = this.$store.state.logInStatus;
    if (this.logInStatus) {
      this.src = this.$store.state.avatarUrl;
    }
  }

  @Watch("$store.state.buttonSelected")
  public watchStateButtonSelected() {
    if (!this.logInStatus) {
      if (this.$store.state.buttonSelected == 1) {
        this.src = "../static/image/person_1.gif";
      } else {
        this.src = "../static/image/person_blue_1.gif";
      }
    }
  }

  @Watch("isLow")
  public watchIsLow() {
    if (this.isLow) {
      this.pointerEvents = 'auto';
      this.opacity = 1;
    } else {
      this.pointerEvents = 'none';
      this.opacity = 0;
    }
  }

  @Watch("$store.state.logInStatus")
  public watchLogInStatus() {
    this.logInStatus = this.$store.state.logInStatus;
    if (this.$store.state.logInStatus) {
      this.src = this.$store.state.avatarUrl;
    } else {
      if (this.$store.state.buttonSelected == 1) {
        this.src = "../static/image/person_1.gif";
      } else {
        this.src = "../static/image/person_blue_1.gif";
      }
    }
  }
}
</script>

<style scoped>
</style>
