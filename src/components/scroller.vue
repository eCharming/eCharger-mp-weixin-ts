<template>
  <view class="card">
    <scroll-view
        scroll-y="true"
        scroll-with-animation=true
        refresher-enabled="true"
        :scroll-top="scrollTop"
        :style="{'height':height+'px'}"
        :refresher-triggered="refreshTriggered"
        @scrolltolower="emit"
        @refresherrefresh="scrollToUpper()"
    >
      <slot></slot>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class Scroller extends Vue {
  @Prop()
  scrollTop!: number;

  private height: number = 0;
  private refreshTriggered: boolean = false;

  public emit(): void {
    this.$emit('scrolltolower');
  }

  public scrollToUpper(): void {		//滚动到最上层刷新缓存
    this.refreshTriggered = true;	//打开刷新触发
    setTimeout(() => {		//在0.8秒后关闭刷新的动画以及打开页面的滚动
      this.refreshTriggered = false;
    }, 800)
  }

  public mounted(): void {
    this.height = this.$store.state.windowHeight * 0.9 - uni.upx2px(560);
  }
}
</script>

<style lang="less" scoped>
.card {
  margin: 0 20upx 20upx;
  padding: 15upx;
  background-color: rgba(250, 255, 250, 1);
  border-radius: 40upx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 12upx 24upx 8upx #e5e5e5;
}
</style>
