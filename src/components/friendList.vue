<template>
  <movable-area style="height: 150upx;width: 100%;">
    <movable-view style="height: 150upx;width: 1000upx;display: flex;" direction="horizontal" damping="40"
                  @touchstart="start($event)" @touchend="end($event)" :x="currentX">
      <view style="height: 150upx;width: 750upx;position: relative;" @click="click()">
        <view class="avatarView">
          <image class="avatar" :src="avatarUrl"></image>
        </view>
        <text class="name">{{ name }}</text>
        <text class="lastWord">{{ lastWord }}</text>
        <text class="lastTime">{{ lastTime }}</text>

        <!-- 这里需要vif hasNewLocal，但是有bug -->
        <view v-if="hasNewLocal" class="newMessage">
          <text>{{ newMessageNumLocal }}</text>
        </view>

      </view>
      <view
          style="height: 150upx;width: 250upx;background-color: #be0e0e;display: flex;justify-content: center;align-items: center;"
          @tap="deleteFriend">
        <text style="color: white;font-size: 30upx;">删除</text>
      </view>
    </movable-view>
  </movable-area>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

@Component
export default class FriendList extends Vue {
  @Prop()
  avatarUrl!: string;
  @Prop()
  name!: string;
  @Prop()
  lastTime!: string;
  @Prop()
  lastWord!: string;
  @Prop()
  hasNew!: boolean;
  @Prop()
  newMessageNum!: number;

  private originX: number = 0;
  private isRight: boolean = true;
  private currentX: number = 0;
  private newMessageNumLocal: number = 0;
  private hasNewLocal: boolean = false;

  public start(e: { changedTouches: { pageX: number }[] }): void {
    this.originX = e.changedTouches[0].pageX;
  }

  public end(e: { changedTouches: { pageX: any; }[] }): void {
    let lastX = e.changedTouches[0].pageX;
    let moveWidth = uni.upx2px(250);
    let liveX = this.isRight ? this.originX - lastX : lastX - this.originX;
    let percent = liveX / moveWidth;
    if (this.isRight) { //初始在低位的情况
      if (percent >= 0.4) { //上拉超过上下限的40%则移向高位 因为位置改变了也即currentX改变组件可以监听变化所以不用nextTick
        this.isRight = false;
        this.currentX = uni.upx2px(-250);
      } else { //上拉未超过上下限的40%则回到低位 因为位置没有改变也即currentX没有改变组件无法监听变化所以使用nextTickchangedTouches[0].pageX;
        if (Math.abs(liveX) > 5) { //用于防止点击事件穿透触发touchend
          this.currentX = -1;
          this.$nextTick(() => {
            this.currentX = 0;
          })
        }
      }
    } else { //初始在高位的情况
      if (percent >= 0.4) { //下拉超过上下限的40%则移向低位 因为位置改变了也即currentX改变组件可以监听变化所以不用nextTick
        this.isRight = true;
        this.currentX = 0;
      } else { //下拉未超过上下限的40%则回到高位 因为位置没有改变也即currentX没有改变组件无法监听变化所以使用nextTick
        if (Math.abs(liveX) > 5) { //用于防止点击事件穿透触发touchend
          this.currentX = -251;
          this.$nextTick(() => {
            this.currentX = uni.upx2px(-250);
          })
        }
      }
    }
  }

  public click(): void {
    this.$emit('clickMessage');
  }

  public deleteFriend(): void {
    wx.showModal({
      title: "确定删除好友？",
      success: (res) => {
        if (res.confirm) {
          this.$emit('deleteFriends')
        }
      }
    })
  }

  @Watch('hasNew')
  public watchHasNew() {
    this.hasNewLocal = this.hasNew;
  }

  @Watch('newMessageNum')
  public watchNewMessageNum() {
    this.newMessageNumLocal = this.newMessageNum;
  }
}
</script>

<style lang="less" scoped>
.avatarView {
  position: absolute;
  height: 100upx;
  width: 100upx;
  border-radius: 50%;
  top: 25upx;
  left: 25upx;
  overflow: hidden;
}

.avatar {
  position: absolute;
  height: 100upx;
  width: 100upx;
}

.name {
  font-size: 35upx;
  letter-spacing: 2upx;
  position: absolute;
  top: 30upx;
  left: 150upx;
}

.lastWord {
  letter-spacing: 1upx;
  position: absolute;
  width: 500upx;
  height: 33upx;
  top: 80upx;
  left: 150upx;
  color: rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lastTime {
  font-size: 25upx;
  letter-spacing: 1upx;
  position: absolute;
  top: 35upx;
  right: 30upx;
  color: rgba(0, 0, 0, 0.5);
}

.newMessage {
  background-color: rgba(102, 205, 170, 1);
  color: #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  height: 40upx;
  width: 40upx;
  position: absolute;
  top: 80upx;
  right: 30upx;
}
</style>
