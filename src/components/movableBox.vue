<template>
  <view>
    <navigator :isLow="isLow"></navigator>
    <movable-area class="movable-area" :style="{'top':boxHeight+'px','height':areaLength+'px'}" @touchmove.prevent.stop>
      <movable-view class="main" :style="{'height':windowHeight+'px'}" direction="vertical" damping="30"
                    out-of-bounds="true" :y="currentY" :disabled="isScroll"
                    @touchstart="start($event)" @touchend="end($event)">
        <view class="content">

          <view class="fixed-view">
            <view class='flex-img'>
              <info-button :isLow="isLow"></info-button>
              <view style="display: flex;">
                <navigate-button :isLow="isLow" :style="{'opacity':isNavigate}"
                                 style="transition: opacity 1s;"></navigate-button>
                <location-button :isLow="isLow"></location-button>
              </view>
            </view>
          </view>

          <view class="touchline">
            <view class="line"></view>
          </view>

          <hidden-card :isLow="isLow"></hidden-card>
          <hidden-detail v-if="hiddenDetail" :isLow="isLow" @tap="detail"></hidden-detail>
          <card>
            <total-button :text1="'租电桩'" :text2="'电桩共享'" :selected="isSelected1" :isLow="isLow" :type="1"
                          @tap="tapButton1()">
              <image class="image1" src="../static/image/car&charger_color.png"
                     :style="{'filter':'grayscale('+imageFilter1+')','opacity':imageOpacity1}"></image>
            </total-button>
            <total-button :text1="'借电桩'" :text2="'出租电桩'" :selected="isSelected2" :isLow="isLow" :type="2"
                          @tap="tapButton2()">
              <image class="image2" src="../static/image/park.png"
                     :style="{'filter':'grayscale('+imageFilter2+')','opacity':imageOpacity2}"></image>
            </total-button>
          </card>
          <destination></destination>


          <view style="transform-style: preserve-3d;transition:all .6s;
						transition-timing-function: cubic-bezier(.6,-0.5,.44,1.5);position: relative;"
                :style="{'transform':'rotateY('+rotate+'deg)'}">
            <view style="position: absolute;width: 100%;transform:translateZ(10upx);"
                  :class="isSelected1?'auto':'none'">
              <scroller @scrolltolower="scrollToLower()" @touchstart="scroll()">
                <order v-for="(order,index) in orders" :ref="'orderRef'+index" :key="index" :index="index"
                       :cid="order.id" :uid="order.uid" :longitude="order.longitude" :latitude="order.latitude"
                       :address="order.address" :location="order.location" :distance="order.distance"
                       :price="order.price" :time="order.time" :detail="order.detail" :windowWidth="windowWidth"
                       @map="tapOrder(index)" @detail="detail()" @undetail="undetail()" @toLow="toLow">
                </order>
                <view class="scrollerview" v-if="orders.length!==0">
                  <image :src="src1" style="width: 45rpx;height: 45rpx;" v-show="iconType==='download'"></image>
                  <image :src="src2" style="width: 45rpx;height: 45rpx;" v-show="iconType==='warn'"></image>
                  <text>{{ iconText }}</text>
                </view>
                <view v-if="orders.length===0"
                      style="width:100%;height:100%;display: flex;align-items: center;justify-content: center;flex-direction: column;">
                  <image src="/static/image/blank.png" style="width: 200rpx;height: 200rpx;"></image>
                  <text style="font-weight: bold;color: rgba(102,205,170,1);">附近暂无电桩</text>
                </view>
              </scroller>
            </view>

            <view style="transform: rotateY(180deg) translateZ(13upx);position: absolute;width: 100%;"
                  :class="isSelected2?'auto':'none'">
              <scroller @touchstart="scroll()">
                <charger v-for="(charger,index) in chargers" :ref="'chargerRef'+index" :key="index"
                         :location="charger.location" :address="charger.address" :state="charger.isAvailable"
                         :price="charger.price"
                         :time="charger.time" :cid="charger.cid" :windowWidth="windowWidth" :detail="charger.detail"
                         @tap="tapCharger(index)" @chargerUndetail="chargerUndetail()">
                </charger>
                <view v-if="chargers.length===0"
                      style="width:100%;height:100%;display: flex;align-items: center;justify-content: center;flex-direction: column;">
                  <image src="/static/image/blank_blue.png" style="width: 200rpx;height: 200rpx;"></image>
                  <text style="font-weight: bold;color: rgba(50,200,210,1);">暂无你的电桩</text>
                </view>
                <view class="scrollerview">
                  <image :src="src3" style="width: 45rpx;height: 45rpx;" @tap="addCharger"></image>
                  <text @tap="addCharger">添加你的电桩</text>
                </view>
              </scroller>
            </view>
          </view>
        </view>
      </movable-view>
    </movable-area>
  </view>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import totalButton from './totalButton.vue'
import card from './card.vue'
import destination from './destination.vue'
import locationButton from './locationButton.vue'
import navigateButton from './navigateButton.vue'
import scroller from './scroller.vue'
import order from './order.vue'
import charger from './myCharger.vue'
import infoButton from './infoButton.vue'
import hiddenCard from './hiddenCard.vue'
import hiddenDetail from './hiddenDetail.vue'
import navigator from './navigator.vue'
import {updateUrl} from "@/apis/user/user";
import {chargerSearch} from "@/apis/charger/charger";
import Order from "./order.vue";

@Component({
  components: {
    totalButton,
    card,
    destination,
    locationButton,
    navigateButton,
    scroller,
    order,
    charger,
    infoButton,
    hiddenCard,
    hiddenDetail,
    navigator
  }
})
export default class MovableBox extends Vue {
  private originY: number = 0;//第一次触摸时的手指位置
  private currentY: number = 0; //当前movableBox的高度(非实时)
  private boxHeight: number = 300; //movableBox的最高高度
  private windowHeight: number = 300; //本机的高度 单位px
  private windowWidth: number = 0; //本机的宽度 单位px
  private isLow: boolean = true; //滑动开始前上拉框处在低位则为真，在高位则为假
  private isScroll: boolean = false;
  private scrollTop: number = 0;
  private areaLength: number = 500;
  private minHeight: number = 0.33;
  private maxHeight: number = 0.88;
  private imageFilter1: number = 0;
  private imageOpacity1: number = 1;
  private imageFilter2: number = 1;
  private imageOpacity2: number = 0.3;
  private iconType: string = "warn";
  private iconText: string = "暂无更多";
  private rotate: number = 0;
  private orders: Array<any> = [];
  private chargers: Array<any> = [];
  private orderSelected: number = -1;
  private preOrder: number = -2;
  private hiddenDetail: boolean = false;//记录是否显示订单详情气泡
  private orderIndex: number = 0; //记录scroller刷新到哪个order
  private isFull: boolean = false; //是否拿满
  private chargerSelected: number = -1;
  private preCharger: number = -2;
  private isSelected1: boolean = true;
  private isSelected2: boolean = false;

  private src1: string = "/static/image/uparrow.png";
  private src2: string = "/static/image/warning.png";
  private src3: string = "/static/image/plus_blue.png";

  public scroll() {
    this.isScroll = true;
  }

  public start(e: { changedTouches: { pageY: number }[] }) {
    this.originY = e.changedTouches[0].pageY;
  }

  public end(e: { changedTouches: { pageY: any }[] }) {
    if (!this.isScroll) {
      let lastY = e.changedTouches[0].pageY;
      let moveHeight = this.windowHeight * (this.maxHeight - this.minHeight);
      let liveY = this.isLow ? moveHeight + lastY - this.originY : lastY - this.originY;
      let percent = liveY / moveHeight;
      if (this.isLow) { //初始在低位的情况
        if ((1 - percent) >= 0.25) { //上拉超过上下限的25%则移向高位 因为位置改变了也即currentY改变组件可以监听变化所以不用nextTick
          this.toHigh();
        } else { //上拉未超过上下限的25%则回到低位 因为位置没有改变也即currentY没有改变组件无法监听变化所以使用nextTickchangedTouches[0].pageY;
          if (Math.abs(liveY - moveHeight) >
              5) { //用于防止点击事件穿透触发touchend
            this.currentY = liveY;
            this.$nextTick(function () {
              this.currentY = moveHeight;
            })
          }
        }
      } else { //初始在高位的情况
        if (percent >= 0.25) { //下拉超过上下限的25%则移向低位 因为位置改变了也即currentY改变组件可以监听变化所以不用nextTick
          this.toLow();
        } else { //下拉未超过上下限的25%则回到高位 因为位置没有改变也即currentY没有改变组件无法监听变化所以使用nextTick
          this.currentY = liveY;
          this.$nextTick(function () {
            this.currentY = 0;
          })
        }
      }
    } else this.isScroll = false

  }

  public tapButton1() {
    this.rotate = 0;
    this.isSelected1 = true;
    this.isSelected2 = false;
    this.imageFilter1 = 0;
    this.imageOpacity1 = 1;
    this.imageFilter2 = 1;
    this.imageOpacity2 = 0.3;


    this.src1 = "/static/image/uparrow.png";
    this.src2 = "/static/image/warning.png";

    this.$store.commit('setButtonSelected', 1);
    this.$nextTick(function () {
      this.toHigh();
    })
  }

  public tapButton2() {
    this.rotate = 180;
    this.isSelected1 = false;
    this.isSelected2 = true;
    this.imageFilter1 = 1;
    this.imageOpacity1 = 0.3;
    this.imageFilter2 = 0;
    this.imageOpacity2 = 1;

    this.src1 = "/static/image/uparrow_blue.png";
    this.src2 = "/static/image/warning_blue.png";

    this.$store.commit('setButtonSelected', 2);
    this.$nextTick(function () {
      this.toHigh();
    })
  }

  public tapOrder(index: number) {  //用于触发点击order的事件
    if (index !== this.orderSelected) {			//因为还没更新数值 index代表该次点击的序号 orderselected代表上一次点击的序号 前一次点击和这一次点击不同则更新界面
      this.preOrder = this.orderSelected;
      this.orderSelected = index;
      if (this.preOrder !== -1) {
        this.orders[this.preOrder].detail = false;
        let $ref = <Order[]>this.$refs[`orderRef${this.preOrder}`];
        $ref[0].unTap();
      }

      let $ref1 = <Order[]>this.$refs[`orderRef${index}`];
      $ref1[0].tap();
    } else {		//前一次点击和这一次点击相同 则进入订单详情页 movablebox下拉置为低位 向vuex传递参数
      this.$store.commit('setOrderSelected', index);
      this.$nextTick(function () {
        this.toLow();
        this.hiddenDetail = true;
      })
    }

  }

  public tapCharger(index: number) {  //用于触发点击charger的事件
    if (index !== this.chargerSelected) {
      this.preCharger = this.chargerSelected;
      this.chargerSelected = index;
      if (this.preCharger !== -1)
        this.chargers[this.preCharger].detail = false;
      this.chargers[index].detail = true;
    }
  }

  public chargerUndetail() {
    this.chargers[this.chargerSelected].detail = false;
    this.chargerSelected = -1;
  }

  public scrollToLower() { //用于下拉刷新加载order
    if (this.isSelected1 && !this.isFull) {
      if (this.$store.state.orders.length - 1 - this.orderIndex <= 5) { //下拉刷新一次数量小于等于五
        for (let index = this.orderIndex + 1; index <= this.$store.state.orders.length - 1; index++) {
          this.orders.push(this.$store.state.orders[index]);
        }
        this.orderIndex = this.$store.state.orders.length - 1;
        this.isFull = true;
      } else {
        for (let index = this.orderIndex + 1; index <= this.orderIndex + 5; index++) { //此次拉取数量大于五
          this.orders.push(this.$store.state.orders[index]);
        }
        this.orderIndex += 5;
      }
    } else {
      this.iconText = "暂无更多";
      this.iconType = "warn";
    }
  }

  public detail() {
    if (!this.$store.state.logInStatus) {
      wx.getUserProfile({
        desc: '获取微信头像以及昵称',
        success: (res) => {
          this.$store.commit('setUserName', res.userInfo.nickName,);
          this.$store.commit('setAvatarUrl', res.userInfo.avatarUrl);
          this.$store.commit('setLogInStatus', true);
          updateUrl({ //uid获取
            userName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl,
          });
        }
      })
    } else {
      this.orders[this.orderSelected].detail = true;
      this.toHigh();
    }
  }

  public undetail() {
    this.orders[this.orderSelected].detail = false;
  }

  public toLow() {
    this.isLow = true;
    this.currentY = this.windowHeight * (this.maxHeight - this.minHeight);
  }

  public toHigh() {
    this.isLow = false;
    this.hiddenDetail = false;
    this.currentY = 0;
  }

  public addCharger() {
    if (!this.$store.state.logInStatus) {
      wx.getUserProfile({
        desc: '获取微信头像以及昵称',
        success: (res) => {
          this.$store.commit('setUserName', res.userInfo.nickName,);
          this.$store.commit('setAvatarUrl', res.userInfo.avatarUrl);
          this.$store.commit('setLogInStatus', true);
          wx.cloud.callFunction({ //uid获取
            name: 'updateUrl',
            data: {
              userName: res.userInfo.nickName,
              avatarUrl: res.userInfo.avatarUrl,
            }
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '../addCharger/addCharger'
      });
    }
  }

  public mounted() {
    this.windowHeight = this.$store.state.windowHeight;
    this.minHeight = uni.upx2px(250) / this.windowHeight;
    this.windowWidth = uni.getSystemInfoSync().windowWidth;
    this.boxHeight = this.windowHeight * (1 - this.maxHeight);
    this.areaLength = (1 + (this.maxHeight - this.minHeight)) * this.windowHeight;
    this.currentY = this.windowHeight * (this.maxHeight - this.minHeight);
  }

  public get isNavigate() {
    return this.$store.state.isNavigate ? 1 : 0;
  }

  @Watch("$store.state.chargerCardDefault")
  public watchChargerCardDefault() {
    this.preCharger = -2;
    this.chargerSelected = -1;
  }

  @Watch("$store.state.getChargers") //用于获得mycharger
  public watchGetChargers() {
    if (!this.$store.state.logInStatus) {
      this.chargers.splice(0)
      return;
    }
    chargerSearch({
      uid: this.$store.state.uid
    }).then(res => {
      if (res.result != null && res.result) {
        this.chargers.splice(0)
        for (let i = 0; i < res.result.length; i++) {
          res.result[i].detail = false;
        }
        this.chargers.push(...res.result)
      }
    })
  }

  @Watch("$store.state.orders") //用于加载order
  public watchOrders() {
    this.iconText = "上拉加载更多";
    this.iconType = "download";
    this.isFull = false;
    this.orders.splice(0);
    if (this.orderSelected !== -1) {
      let $ref = <Order[]>this.$refs[`orderRef${this.orderSelected}`];
      $ref[0].unTap();//由于在更新dom时是延时更新，因此order样式并不会变 需要手动调回
    }
    this.orderSelected = -1;
    this.preOrder = -2;
    if (this.$store.state.orders.length <= 5) { //数量小于等于5
      for (let index in this.$store.state.orders) {
        this.orders.push(this.$store.state.orders[index]);
      }
      this.orderIndex = this.$store.state.orders.length - 1;
      this.isFull = true;
      this.iconText = "暂无更多";
      this.iconType = "warn";
    } else {
      for (let index = 0; index <= 4; index++) {
        this.orders.push(this.$store.state.orders[index]);
      }
      this.orderIndex = 4;
    }
  }

  @Watch("$store.state.markerSelected") //当在地图上选中标点时movablebox弹出并且选中标点对应的order
  public watchMarkerSelected() {
    if (this.isSelected1) {
      for (; this.orderIndex < this.$store.state.markerSelected;) {
        this.scrollToLower();
      }
      if (this.orderSelected !== this.$store.state.markerSelected) {
        this.$nextTick(function () {
          this.tapOrder(this.$store.state.markerSelected);
        });
      }
      this.$nextTick(function () {
        this.scrollTop = uni.upx2px(this.$store.state.markerSelected * 338);
        this.toHigh();
      })
    }
  }

  @Watch("$store.state.isLow")
  public watchIsLow() {
    this.toLow();
  }

  @Watch("$store.state.myCharger")
  public watchMyCharger() {
    this.tapButton2()
  }

}
</script>

<style scoped>
.auto {
  pointer-events: auto;
}

.none {
  pointer-events: none;
}

.movable-area {
  position: relative;
  width: 100%;
  pointer-events: none;
}

.main {
  width: 750upx;
  background-color: rgb(240, 245, 240);
  padding: 0 20upx;
  border-top-left-radius: 40upx;
  border-top-right-radius: 40upx;
  pointer-events: auto;
  box-sizing: border-box;
}

.scrollerview {
  display: flex;
  justify-content: center;
}

.content {
  position: relative;
  height: 100%;

}

.touchline {
  margin-top: 20rpx;
  display: flex;
  justify-content: center;
}

.line {
  margin: 0;
  vertical-align: middle;
  border-bottom: 8rpx solid rgb(214, 215, 217);
  width: 60rpx;
  transform: scaleY(0.5);
  border-top-color: rgb(214, 215, 217);
  border-right-color: rgb(214, 215, 217);
  border-left-color: rgb(214, 215, 217);
}

.image1 {
  height: 140upx;
  width: 140upx;
  position: absolute;
  bottom: 0;
  right: 10upx;
  transition-property: opacity, filter;
  transition-duration: .3s;
}

.image2 {
  height: 150upx;
  width: 150upx;
  position: absolute;
  bottom: 0;
  right: 10upx;
  transition-property: opacity, filter;
  transition-duration: .3s;
}

.flex-img {
  display: flex;
  justify-content: space-between;
}

.fixed-view {
  position: fixed;
  left: 0;
  right: 0;
  top: -150upx;
}
</style>
