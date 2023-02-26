<template>
  <view>
    <view class="big-label">{{ alphabet }}</view>
    <view class="card">
      <view v-if="list.length!==0" v-for='(item,index) in list' :key='index' class="display" @tap="changeCity(item)">
        <view class="label-text">{{ item.name }}</view>
        <view v-if="index!==list.length-1" class="div-line"></view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class CityCard extends Vue {
  @Prop()
  alphabet!: string;
  @Prop({
    type: Array,
    default: () => []
  })
  list!: Array<{ location: any; name: any; }>

  public changeCity(item: { location: any; name: any; }): void {
    let poploc = item.location;
    poploc.name = item.name;
    this.$store.commit('setCityLocation', poploc)
    wx.navigateBack()
  }
}
</script>

<style lang="less" scoped>
.display {
  margin: 15upx;
}

.div-line {
  width: 100%;
  height: 3upx;
  background-color: #E0E3DA;
  margin-top: 18rpx;
}

.label-text {
  letter-spacing: 2upx;
  font-weight: 700;
}

.big-label {
  margin: 20upx 20upx 20upx 30upx;
  padding: 15upx;
  font-weight: 900;
  color: #666666;
}

.card {
  padding: 15upx;
  margin: 20upx 30upx;
  background-color: rgba(250, 255, 250, 1);
  border-radius: 20upx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 12upx 24upx 8upx #e5e5e5;
}
</style>
