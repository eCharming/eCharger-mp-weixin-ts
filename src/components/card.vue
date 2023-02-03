<template>
  <view class="card">
    <slot></slot>
  </view>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class Card extends Vue {}
</script>

<style scoped>
.card {
  margin: 20upx;
  padding: 15upx;
  background-color: rgba(250, 255, 250, 1);
  border-radius: 40upx;
  display: flex;
  justify-content: center;
  box-shadow: 0 12upx 24upx 8upx #e5e5e5;
}
</style>
