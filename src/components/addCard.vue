<template>
  <view class="card">
    <slot></slot>
  </view>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class AddCard extends Vue {}
</script>

<style scoped>
.card {
  margin: 20upx;
  padding: 15upx;
  background-color: rgba(255, 255, 255, 1.0);
  border-radius: 20upx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 12upx 24upx 8upx #e5e5e5;
}
</style>
