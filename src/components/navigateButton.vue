<template>
  <view>
    <view>
      <image :src="src" class="navigate-image"
             :style="{'pointer-events':pointerEvents,'opacity':opacity}" @click="unnavigate"></image>
    </view>
  </view>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

@Component
export default class NavigateButton extends Vue {

  @Prop()
  isLow!: boolean;
  private src: string = "../static/image/navigate.png";
  private pointerEvents: string = "auto";
  private opacity: number = 1;

  public unnavigate(): void {
    if (this.$store.state.isNavigate) {
      this.$store.commit('refreshPolyline');
      this.$store.commit('setIsNavigate', false);
    }
  }

  @Watch("$store.state.buttonSelected")
  public watchStoreButtonSelected() {
    if (this.$store.state.buttonSelected == 1) {
      this.src = "../static/image/navigate.png";
    } else {
      this.src = "../static/image/navigate_blue.png";
    }
  }

  @Watch("isLow")
  public watchStateIsLow() {
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

<style lang="less" scoped>
.navigate-image {
  width: 100rpx;
  height: 100rpx;
  transition: opacity .3s;
  margin: 20rpx;
}
</style>
