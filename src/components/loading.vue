<template>
  <view id="outer-wrapper">
    <view id="inner-wrapper">
      <view id="rotate-fourth" :style="{'transform':'rotateX('+backRotate4+'deg)'}">
        <view id="rotate-third" :style="{'transform':'rotateX('+backRotate3+'deg)'}">
          <view id="rotate-second" :style="{'transform':'rotateX('+backRotate2+'deg)'}">
            <view id="first-background" :style="{'transform':'rotateX('+backRotate1+'deg)'}">
              <text class="icon-text">eCharger</text>
            </view>
            <view id="second-background"></view>
          </view>
          <view id="third-background"></view>
        </view>
        <view id="fourth-background">
          <text class="icon-text">易插</text>
        </view>
      </view>
    </view>
    <view id="lightning-wrapper">
      <view id="lightning" :style="{'transform':'scale('+scale+')'}">
        <view class="view1" :style="{'bottom':bottom+'rpx','transform':'rotate('+rotate+'deg)'}"></view>
        <view class="view2" :style="{'bottom':bottom+'rpx','transform':'rotate('+rotate+'deg)'}"></view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class Loading extends Vue {
  private rotate: number = 0;
  private bottom: number = 0;
  private backRotate1: number = 0;
  private backRotate2: number = 0;
  private backRotate3: number = 0;
  private backRotate4: number = 0;
  private scale: number = 1;

  public mounted(): void {
    setTimeout(() => {
      this.rotate = 360;
      this.bottom = 750;
    }, 400)
    setTimeout(() => {
      this.scale = 0;
    }, 4300)
    setTimeout(() => {
      this.backRotate1 = -180;
    }, 4800)
    setTimeout(() => {
      this.backRotate2 = -180;
    }, 5250)
    setTimeout(() => {
      this.backRotate3 = -180;
    }, 5700)
    setTimeout(() => {
      this.backRotate4 = -180;
    }, 6150)
  }

}
</script>

<style lang="less" scoped>
.icon-text {
  color: white;
  font-size: 45upx;
  font-weight: 800;
}

#outer-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

#inner-wrapper {
  position: absolute;
  height: 100vh;
  top: 0;
  width: 100%;
  perspective: 1000upx;
  perspective-origin: 50% 0;
  transform: translateZ(400upx);
}

#rotate-fourth {
  position: absolute;
  height: 100vh;
  top: 0;
  width: 100%;
  transform-origin: top;
  transition: all 1.5s;
  perspective: 1000upx;
  perspective-origin: 50% 25%;
}

#rotate-third {
  position: absolute;
  height: 75vh;
  top: 25%;
  width: 100%;
  transition: all 1.5s;
  transform-origin: top;
  perspective: 1000upx;
  perspective-origin: 50% 33%;
}

#rotate-second {
  position: absolute;
  height: 50vh;
  top: 33.3%;
  width: 100%;
  transform-origin: top;
  transition: all 1.5s;
  perspective: 1000upx;
  perspective-origin: 50% 50%;
}

#first-background {
  background-color: rgba(0, 185, 199, 1);
  height: 25vh;
  position: absolute;
  top: 50%;
  width: 100%;
  transform-origin: top;
  transition: all 1.5s;
  display: flex;
  justify-content: center;
  align-items: center;
}

#second-background {
  background-color: rgba(0, 185, 179, 1);
  height: 25vh;
  position: absolute;
  top: 0;
  width: 100%;
  transition: all 1s;
}

#third-background {
  background-color: rgba(0, 185, 159, 1);
  height: 25vh;
  position: absolute;
  top: 0;
  width: 100%;
  transition: all 1s;
}

#fourth-background {
  background-color: rgba(0, 185, 139, 1);
  height: 25vh;
  position: absolute;
  top: 0;
  width: 100%;
  transform-origin: top;
  transition: all 1s;
  display: flex;
  justify-content: center;
  align-items: center;
}

#lightning-wrapper {
  transform: translateZ(450upx);
  height: 700upx;
  width: 700upx;

  #lightning {
    height: 700upx;
    width: 700upx;
    clip-path: polygon(25% 53%, 50% 0, 81% 0, 53% 40%, 77% 40%, 33% 100%, 52% 53%);
    position: absolute;
    transition: all .7s cubic-bezier(.52, -0.46, .46, 1.01);
    background-color: #f7f14b;
  }
}

.view1 {
  position: absolute;
  height: 750upx;
  width: 750upx;
  background-color: #e5e39e;
  border-radius: 52% 25% 62% 52% / 25% 38%;
  transition: 5s all;
}

.view2 {
  position: absolute;
  height: 750upx;
  width: 750upx;
  background-color: #f8f8dd;
  border-radius: 70% 30% 65% 35% / 37% 46% 54% 63%;
  transition: 5s all;
}

</style>
