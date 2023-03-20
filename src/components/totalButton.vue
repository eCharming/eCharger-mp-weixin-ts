<template>
  <button
      id="btn"
      class="btn"
      :plain="true"
      :style="{'border-color':borderColor}"
  >
    <view class="address-wrapper">
      <text class="text1" :style="{'top':top+'rpx'}">{{ text1 }}</text>
    </view>
    <view class="view2">
      <text class="text2" :style="{'opacity':opacity}">{{ text2 }}</text>
    </view>
    <view>
      <slot></slot>
    </view>

  </button>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

@Component
export default class TotalButton extends Vue {
  @Prop()
  type!: number;
  @Prop()
  text1!: string;
  @Prop()
  text2!: string;
  @Prop({
    type: Boolean,
    default: false
  })
  selected!: boolean;
  @Prop()
  isLow!: boolean;

  private borderColor: string = "rgba(0,0,0,0.3)";
  private opacity: number = 0;
  private top: number = 20;

  @Watch("selected", {
    immediate: true
  })
  public watchSelected() {
    if (this.selected)
      this.activate();
    else {
      this.inactivate();
    }
  }

  @Watch("isLow")
  public watchIsLow() {
    if (this.isLow) {
      this.top = 20;
      this.opacity = 0;
    } else {
      this.top = 5;
      this.opacity = 1;
    }
  }

  public activate(): void {
    if (this.type == 1)
      this.borderColor = "rgba(102,205,170,1)";
    else this.borderColor = this.$store.state.color;
  }

  public inactivate(): void {
    this.borderColor = "rgba(0,0,0,0.1)";
  }
}

</script>

<style lang="less" scoped>
.btn {
  height: 120upx;
  width: 280upx;
  border-radius: 20upx;
  margin: 20upx;
  padding-left: 10upx;
  border: 3px solid;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  /*align-content: flex-start; !*把多余的行高放到两边*!*/
  transition-property: border;
  transition-duration: .3s;
}

.address-wrapper {
  font-weight: 700;
  font-size: 30upx;

}

.view2 {
  font-size: 22upx;
  color: rgba(0, 0, 0, 0.3);

}

.text1 {
  position: relative;
  right: 65upx;
  top: 20upx;
  transition: all .3s;
  transition-timing-function: linear;
}

.text2 {
  position: relative;
  right: 67upx;
  bottom: 25upx;
  transition: all .3s;
  transition-timing-function: linear;

}
</style>
