<template>
  <view>
    <view :style="{'height':statusHeight+'px','background':doubleColor}">
      <image src="../../static/image/back.png" class="backimg" :style="{'top':statusBarHeight+12.5+'px'}"
             @tap="back"></image>
    </view>
    <view class="searchbox">
      <view class="textareaview">
        <input class="textarea" placeholder="输入目的地" v-model="position" @input="request()"
               :style="{'border-color':color}">
        </input>
        <text class="searchtext" :style="{'color':color}">搜索</text>
        <image :src="src1" :class="changeImg===0?'image1':'image1_none'"></image>
        <image :src="src2" :class="changeImg===0?'image1_none':'image1'"></image>
      </view>

      <scroll-view scroll-y="true"
                   style="margin: 30upx;background-color: #FFFFFF;border-radius: 40upx;width:690upx"
                   :style="{'height': suggestionHeight+'px'}">
        <view class="suggestion" v-for="(suggestion,index) in suggestions" :key="index"
              @tap="tap(suggestion.id,suggestion.title,suggestion.location,suggestion.category)">
          <view style="display: flex;justify-content: space-between;">
            <view class="address-wrapper">
              <image class="image2" src="../../static/image/landmark.png"></image>
              <rich-text :nodes="suggestion.strings" class="richtext"></rich-text>
            </view>
            <view
                style="position: absolute;right: 40upx;top: 5upx;display: flex;flex-direction: column;justify-content: center;">
              <image src='../../static/image/distance.png' style="width: 80upx;height: 80upx;"></image>
              <text
                  style="font-size: 23upx;color: rgb(0,0,0,0.6);margin-top: 5upx;">{{ suggestion.distance }}km
              </text>
            </view>
          </view>

          <view class="view2">
            <text class="text2">{{ suggestion.category }}</text>
          </view>
          <view class="view3">
            <text style="font-size: 23upx;color: rgb(0,0,0,0.6);">{{ suggestion.address }}</text>
          </view>
          <view style="display: flex;justify-content: center;">
            <view style="border-bottom: 1px solid rgba(0,0,0,0.1);width: 500upx;"></view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>

</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import navigator from '@/components/navigator.vue'
import {placeSuggestion} from "@/apis/map/map";

@Component({
  components: {
    navigator
  }
})
export default class AddFrePlace extends Vue {
  private statusHeight: number = wx.getSystemInfoSync().statusBarHeight + 50;
  private statusBarHeight: number = wx.getSystemInfoSync().statusBarHeight;
  private position: string = "";
  private suggestions: {
    id: string;
    title: string;
    address: string;
    category: string;
    location: {
      lat: number;
      lng: number;
    };
    distance: string;
    strings: string;
  }[] = [];
  private suggestionHeight: number = this.$store.state.windowHeight * 0.85;
  private index: number = 0;
  private isInput: boolean = false;
  private changeImg: number = 0;
  private color: string = 'rgba(102,205,170,1)';
  private doubleColor: string = "linear-gradient(to right bottom,rgb(102,205,170) 0% 100%,rgb(50,200,210))";
  private src1: string = "../../static/image/lightning_green.png";
  private src2: string = "../../static/image/lightning_blue.png";

  public back(): void {
    wx.navigateBack({})
  }

  public request(): void {
    if (this.position == "") {
      this.isInput = false;
    } else {
      this.isInput = true;
      placeSuggestion({
        address: this.position,
        addressFormat: "short",
        location: {
          latitude: this.$store.state.currentLocation.latitude,
          longitude: this.$store.state.currentLocation.longitude
        },
        key: "ORFBZ-V73LX-N3Z4Y-Z3MR4-V35MJ-LNBFL"
      }).then(data => {
        if (data.status === 0) {
          this.suggestions.splice(0);
          for (let index in data.data) {
            this.suggestions.push({
              id: data.data[index].id,
              title: data.data[index].title,
              address: data.data[index].address,
              category: data.data[index].category,
              location: data.data[index].location,
              distance: (<number>data.data[index]._distance / 1000).toFixed(1),
              strings: "<div style='width: 100%;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;'>" +
                  this.keyword(data.data[index].title, this.position) +
                  "<div>"
            });
          }
        }
      })
    }
  }

  public keyword(title: string, position: string): string {
    if (title.includes(position)) {
      let html = (title.replace(
          position,
          '<span style="color:rgb(102,205,170);">' + position + '</span>'
      ));
      html = '<span class="text1">' + html + '</span>';
      return html;
    } else {
      return title;
    }
  }

  public setOtherFreStorage(id: string, title: string, location: { lng: number; lat: number; }, category: string) {
    let otherFrePlace = wx.getStorageSync('frePlace');
    otherFrePlace = JSON.parse(otherFrePlace);
    for (let index in otherFrePlace.freOther) {
      if (otherFrePlace.freOther[index].id == id) {
        otherFrePlace.freOther.splice(Number(index), 1);
        break;
      }
    }
    otherFrePlace.freOther.push({
      id: id,
      title: title,
      location: location,
      category: category
    });
    wx.setStorageSync('frePlace', JSON.stringify(otherFrePlace));
  }

  public setFreStorage(id: string, title: string, location: { lng: number; lat: number; }, category: string, type: number) {
    let otherFrePlace = uni.getStorageSync('frePlace');
    otherFrePlace = JSON.parse(otherFrePlace);
    let frePlace = {
      id: id,
      title: title,
      location: location,
      category: category
    }
    if (type == 0) {
      otherFrePlace.freHome = frePlace
    } else if (type == 1) {
      otherFrePlace.freCompany = frePlace
    } else if (type == 2) {
      otherFrePlace.freSchool = frePlace
    }
    wx.setStorageSync('frePlace', JSON.stringify(otherFrePlace));
  }

  public tap(id: string, title: string, location: { lng: number; lat: number; }, category: string) {
    wx.showActionSheet({
      itemList: ['家', '公司', '学校', '其他'],
      success: (res) => {
        if (res.tapIndex == 3) {
          this.setOtherFreStorage(id, title, location, category);
        } else {
          this.setFreStorage(id, title, location, category, res.tapIndex);
        }
        wx.showToast({
          title: "添加成功！",
          icon: 'success',
          complete: () => {
            setTimeout(() => {
              wx.navigateBack({})
            }, 500)
          }
        })
      },
      fail: res => {
        wx.showToast({
          title: "添加失败！",
          icon: 'error',
          complete: () => {
            setTimeout(() => {
              wx.navigateBack({})
            }, 500)
          }
        })
      }
    })
  }
}
</script>

<style scoped>
.image1 {
  position: absolute;
  height: 70upx;
  width: 70upx;
  left: 45upx;
  bottom: 10upx;
  opacity: 1;
  transition: opacity 0.5s;
}

.image1_none {
  position: absolute;
  height: 70upx;
  width: 70upx;
  left: 45upx;
  bottom: 10upx;
  opacity: 0;
  transition: opacity 0.5s;
}

.image2 {
  position: relative;
  height: 50upx;
  width: 50upx;
  bottom: 7upx;
  right: 10upx;

}

.searchbox {
  background-color: rgb(240, 240, 240);
}

.textareaview {
  position: relative;
}

.textarea {
  background-color: rgb(255, 255, 255);
  margin: 30upx;
  padding-left: 80upx;
  padding-right: 100upx;
  width: 700upx;
  height: 90upx;
  font-size: 32upx;
  letter-spacing: 1upx;
  border-radius: 20upx;
  border: 6upx outset;
}

.searchtext {
  position: absolute;
  left: 608upx;
  bottom: 7upx;
  font-size: 32upx;
  color: rgba(102, 205, 170, 1);
  font-weight: 700;
  padding: 20upx 20upx 20upx 25upx;
}

.suggestion {
  margin-bottom: 10upx;
  border-radius: 10upx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.address-wrapper {
  display: flex;
  margin: 20upx 20upx 10upx 30upx;
  font-size: 30upx;
  font-weight: 700;
  letter-spacing: 1upx;
}

.text2 {
  background-color: rgba(102, 205, 170, 0.2);
  color: rgba(102, 205, 170, 1);
  margin-left: 80upx;
  padding: 10upx;
  font-size: 20upx;
}

.view3 {
  margin: 20upx 20upx 20upx 82upx;
}

.text1 {
  border: 2upx red solid;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 350upx;
}

.richtext {
  width: 450upx;
}

.backimg {
  position: absolute;
  left: 8px;
  width: 25px;
  height: 25px;
}
</style>
