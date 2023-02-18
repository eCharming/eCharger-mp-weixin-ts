<template>
  <view>
    <my-map></my-map>
    <movable-box></movable-box>
    <loading v-if="isLoading" style="position: absolute;top: 0;width: 100%;"></loading>
  </view>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import loading from '@/components/loading.vue'
import movableBox from '@/components/movableBox.vue'
import myMap from '@/components/myMap.vue'
import {infoReturn, wxLogin} from "@/apis/user/user";

@Component({
  components: {
    loading,
    movableBox,
    myMap
  }
})
export default class Index extends Vue {
  private isLoading: boolean = false;
  private refreshInterval: number = 0;

  public onUnload(): void {
    clearInterval(this.refreshInterval)
  }

  public onLoad(): void {
    //每隔五分钟自动刷新
    this.refreshInterval = setInterval(() => {
      this.$store.commit('setGetChargers')
      this.$store.commit('setRefresh')
    }, 300000);
    wxLogin().then(res => {
      this.$store.commit('setUid', res.result.uid);
      let logInStatus = res.result.loginStatus;
      this.$store.commit('setLogInStatus', logInStatus);
      if (res.result.loginStatus) {
        return infoReturn({//uid获取
          uid: res.result.uid,
        })
      }
    }).then(res => {
      this.$store.commit('setUserName', res.result.userName);
      this.$store.commit('setAvatarUrl', res.result.avatarUrl);

    })
    let windowHeight = wx.getSystemInfoSync().windowHeight - wx.getSystemInfoSync().statusBarHeight - 50;
    this.$store.commit('setWindowHeight', windowHeight);
    setTimeout(() => {
      this.isLoading = false;
    }, 8000)
  }

  public onShow(): void {
    this.$store.commit('setGetChargers')
    this.$store.commit('setChargerCardDefault')
  }

  @Watch("$store.state.logInStatus")
  public watchLoginStatus() {
    this.$store.commit('setGetChargers');
  }

}
</script>

<style scoped>
</style>
