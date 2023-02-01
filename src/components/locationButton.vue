<template>
  <view>
    <view>
      <image :src="src" style="width: 100rpx;height:100rpx;transition: opacity .3s;margin:20rpx"
             :style="{'pointer-events':pointerEvents,'opacity':opacity}" @click="relocate"></image>
    </view>
  </view>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

@Component
export default class LocationButton extends Vue {
  public src: string = "../static/image/location.png";
  public pointerEvents: string = "auto";
  public opacity: number = 1;

  @Prop()
  isLow!: boolean;

  public relocate(): void {
    wx.startLocationUpdate({})
    uni.getLocation({
      type: "gcj02",
      success: res => {
        this.$store.commit('setLocationRes', res);
        this.$store.commit('setDestination', null);
        this.$store.commit('setCurrentLocation', {
          latitude: res.latitude,
          longitude: res.longitude
        });
        this.$store.commit('setCityLocation', {
          name: null,
          latitude: null,
          longitude: null
        })
      },
      fail: () => {
        this.$store.commit('setLocationRes', {});
      },
    });
    this.$store.state.relocate = true;
  }

  @Watch("$store.state.buttonSelected")
  public watchStateButtonSelected() {
    if (this.$store.state.buttonSelected == 1) {
      this.src = "../static/image/location.png";
    } else {
      this.src = "../static/image/location_blue.png";
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
}
</script>

<style scoped>
</style>
