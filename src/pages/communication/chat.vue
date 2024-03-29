<template>
  <view style="background-color: rgb(240,240,240);">
    <view class="navigator" :style="{'height':statusHeight+'px'}">
      <image src="/static/image/back.png" class="backimg" :style="{'top':statusBarHeight+12.5+'px'}"
             @tap="back"></image>
      <text :style="{'margin-bottom':friendBottom+'px'}">{{ name }}</text>
    </view>
    <view>
      <scroll-view
          style="overflow-anchor:auto;"
          scroll-anchoring="true"
          refresher-enabled="true"
          :scroll-y="scrollStatus"
          :scroll-with-animation="scrollAnimation"
          :scroll-into-view="textIndex"
          :refresher-triggered="refreshTriggered"
          :style="{'height':scrollHeight+'px'}"
          @refresherrefresh="scrollToUpper()"
      >
        <view v-for="(text,index) in texts" :key="index" :id="'index'+index">
          <view class="time" v-if="text.showTime">
            <text>{{ text.time.timeText }}</text>
          </view>
          <view :class="text.fromMe?'myTextView':'otherTextView'">
            <view class="avatarView" v-if="!text.fromMe">
              <image style="width: 90upx;height: 90upx;" :src="yourAvatarUrl"></image>
            </view>

            <text v-if="!text.isOrder" :class="text.fromMe?'myText':'otherText'" selectable="true" space="nbsp">
              {{ text.message }}
            </text>
            <book v-if="text.isOrder" :class="text.fromMe?'myOrder':'otherOrder'" :message="text.message"
                  @changeOrderStatus="changeOrderStatus($event,index)" @orderText="orderText($event)"></book>
            <view class="avatarView" v-if="text.fromMe">
              <image style="width: 90upx;height: 90upx;" :src="myAvatarUrl"></image>
            </view>
          </view>


        </view>
      </scroll-view>
    </view>
    <view class="typeView">
      <view style="display: flex;">
				<textarea class="type" v-model="message" maxlength="140"
                  confirm-hold="true"
                  :show-confirm-bar="False"
                  hold-keyboard="true"
                  :adjust-position="False"
                  @keyboardheightchange="keyboardHeightChange($event)"
        ></textarea>
        <view class="send" @click="send">发送</view>
      </view>

    </view>
  </view>
</template>

<script lang="ts">
import book from '@/components/book.vue'
import {Vue, Component} from "vue-property-decorator";
import {infoReturn} from "@/apis/user/user";
import SocketTask = WechatMiniprogram.SocketTask;
import {ChatNewOrder, ChatText, ChatTime} from './chat-interface';
import {socketClose} from "@/apis/wx/socket";
import EventChannel = WechatMiniprogram.EventChannel;


@Component({
  components: {
    book
  }
})
export default class Chat extends Vue {
  private name: string = "";
  private yourAvatarUrl: string = "";
  private myAvatarUrl: string = "";
  private uid: number = 0;
  private toUid: number = 0;
  private socketTask: SocketTask | undefined;//websocket
  private message: string = '';//textarea中的文字 双向绑定
  private texts: ChatText[] = [];//显示在屏幕上的所有消息
  private textIndex: string = 'index0';//判定scroll滚动到哪里
  private historyIndex: number = 0;//判定缓存记录显示到哪里
  private statusBarHeight: number = wx.getSystemInfoSync().statusBarHeight;//状态栏高度
  private statusHeight: number = wx.getSystemInfoSync().statusBarHeight + 50;//导航栏高度

  private scrollStatus: boolean = true;//是否允许滚动
  private constScrollHeight: number = wx.getSystemInfoSync().windowHeight - (wx.getSystemInfoSync().statusBarHeight + 50) - uni.upx2px(230);//scollview的高度
  private scrollHeight: number = wx.getSystemInfoSync().windowHeight - (wx.getSystemInfoSync().statusBarHeight + 50) - uni.upx2px(230);
  private scrollAnimation: boolean = true;//是否允许滚动动画
  private refreshTriggered: boolean = false;//是否触发刷新

  private False: boolean = false;//需要规定一个变量否则直接绑定false会被解释为字符串
  private keyboardHeight: number = 0;//键盘高度
  private storageNum: number = 100;//最大存储历史数据数量
  private storage: any[] = [];//缓存的所有历史数据
  private firstCall: boolean = true;//用来记录是否是第一次打开，若是则onshow不运行
  private orderStatusChange: string = '';//当订单页面改变了order的状态 传值给chat页面在onload时发送消息，此时socketTask很可能还未初始化完成所以无法发送消息。因此用该变量记录
  private newOrder: ChatNewOrder | undefined;
  private hasNew: boolean = false;
  private timeCount: number = -1;

  public keyboardHeightChange(e: { detail: { height: number; }; }) {
    if (e.detail.height !== this.keyboardHeight) {
      this.keyboardHeight = e.detail.height
      this.scrollHeight = this.constScrollHeight - e.detail.height;
    }
  }

  public back() {
    wx.navigateBack({})
  }

  public judgeTime(time: number): boolean {	//判断这条消息是否要加上时间
    if (this.texts.length == 0)	//如果这是第一条消息那么就加上时间
      return true;
    else {				//如果不是第一条消息
      return time - this.texts[this.texts.length - 1].time.timeStamp >= 300000;
    }
  }

  public timeObject(time: number, bool: boolean): ChatTime {
    //用于将时间戳转化为时间显示 需要完成显示 昨天 或者日期 或者不显示日期的功能
    if (bool) {				//如果不需要显示时间那么就直接返回空字符串
      let currentTime = new Date();
      let currentYear = currentTime.getFullYear();
      let currentMonth = currentTime.getMonth() + 1;
      let currentDay = currentTime.getDate();
      let timeDate = new Date(time);
      let year: number | string = timeDate.getFullYear();
      let month: number | string = timeDate.getMonth() + 1;
      let day: number | string = timeDate.getDate();
      let hour: number | string = timeDate.getHours();
      let minute: number | string = timeDate.getMinutes();
      if (hour < 10)
        hour = '0' + hour;
      if (minute < 10)
        minute = '0' + minute;
      let timeText: string;
      if (currentYear === year) {
        if (currentMonth === month && currentDay === day) {
          timeText = hour + ':' + minute;
        } else if (currentMonth === month && currentDay - day === 1) {
          timeText = '昨天' + hour + ':' + minute;
        } else {
          month = (month < 10) ? '0' + month : month;
          day = (day < 10) ? '0' + day : day;
          timeText = month + '-' + day + ' ' + hour + ':' + minute;
        }
      } else {
        month = (month < 10) ? '0' + month : month;
        day = (day < 10) ? '0' + day : day;
        timeText = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
      }
      return {
        timeStamp: time,
        timeText: timeText
      }
    } else return {
      timeStamp: time,
      timeText: ''
    }
  }

  public send() {		//发送消息
    let message = this.message;
    if (message === '') {
      return;
    }
    this.message = '';
    let time = new Date().getTime();
    let showTime = this.judgeTime(time);
    let timeObject = this.timeObject(time, showTime);

    this.texts.push({ //将数据加入texts数组显示在scroll中
      isOrder: false,//查看是否是订单消息
      fromMe: true,//是否是我发出的
      time: timeObject,
      showTime: showTime,
      message: message,
    });
    this.textIndex = "index" + (this.texts.length - 1);//移动到这条数据
    let data = JSON.stringify({
      isOrder: false,//查看是否是订单消息
      uid: this.uid,
      toUid: this.toUid,
      time: time,
      message: message
    });
    this.storage.push(data);	//放入storage数组 一会儿一起放入缓存
    if (this.storage.length >= this.storageNum)	//如果缓存的数量大于最大缓存数量，那么就直接删除第一条数据
      this.storage.splice(0, 1);
    this.socketTask?.send({ 		//发送到服务器
      data: data
    });
    this.hasNew = true;
  }

  public connect(): void {
    this.socketTask = wx.connectSocket({		//打开链接
      url: 'wss://ws.healtool.cn/websocketapi/Chat/' + this.uid + '/' + this.toUid
    });
    this.socketTask.onOpen(() => {
      if (this.orderStatusChange !== '') {
        setTimeout(() => {
          this.orderText(this.orderStatusChange);
          this.orderStatusChange = '';
        }, 1000)
      }
      if (this.newOrder !== undefined) {
        setTimeout(() => {
          this.sendNewOrder(<ChatNewOrder>this.newOrder);
          this.newOrder = undefined;
        }, 1000)
      }
    })
    this.socketTask.onMessage(res => {
      let data = JSON.parse(<string>res.data);		//将数据对象化
      let messages = data.message;
      this.storage.push(...messages);		//放入storage数组 一会儿一起放入缓存
      if (this.storage.length >= this.storageNum) {	//如果缓存的数量大于最大缓存数量，那么就直接删除第一条数据
        this.storage.splice(0, this.storage.length - this.storageNum);
      }
      for (let index in messages) {		//将每一条数据加入texts数组显示在scroll中
        let text = JSON.parse(messages[index])
        let showTime = this.judgeTime(text.time);
        let timeObject = this.timeObject(text.time, showTime);
        this.texts.push({
          isOrder: text.isOrder,//查看是否是订单消息
          fromMe: false,//是否是我发出的
          time: timeObject,
          showTime: showTime,
          message: text.message,
        })
      }

      if (this.texts.length !== 0) {	//如果屏幕上有消息 那么移动到最下一条消息
        this.$nextTick(function () {
          this.textIndex = 'index' + (this.texts.length - 1)
        })
      }
      this.hasNew = true;
    });
  }

  public scrollToUpper(): void {		//滚动到最上层刷新缓存
    this.scrollStatus = false;	//不准scroll滚动
    this.scrollAnimation = false;	//关闭滚动动画模拟实现页面锚定功能（但会出现闪烁）
    this.refreshTriggered = true;	//打开刷新触发

    if (this.historyIndex !== 0) {	//如果缓存中的历史纪录不是最后一条那么刷新更多消息
      setTimeout(() => {		//一秒后再刷新
        let lastIndex = this.historyIndex - 1;
        if (this.historyIndex > 15)	//如果历史记录还有超过15条那么减少15 如果小于15那么直接变为零
          this.historyIndex -= 15;
        else this.historyIndex = 0;
        let textsCopy: any[] = [];	//利用副本 避免一条一条加入texts数组
        for (let i = this.historyIndex; i <= lastIndex; i++) {		//将缓存中的数据推入texts数组来显示在屏幕上
          let text = JSON.parse(this.storage[i]);
          let fromMe = false;
          if (text.uid === this.uid)
            fromMe = true;

          let showTime = false;
          if (i === this.historyIndex)		//是否显示时间
            showTime = true;
          else {
            showTime = text.time - textsCopy[textsCopy.length - 1].time.timeStamp >= 300000;
          }

          let timeObject = this.timeObject(text.time, showTime);		//时间字符串
          textsCopy.push({
            fromMe: fromMe,//是否是我发出的
            time: timeObject,
            showTime: showTime,
            message: text.message,
          })
        }
        this.texts.unshift(...textsCopy);	//将副本一道推入texts数组

        this.$nextTick(function () {	//在下一帧移动到刷新之前的第一条以模拟实现页面锚定

          this.textIndex = 'index' + (lastIndex - this.historyIndex + 1);
          this.$nextTick(function () {
            this.scrollAnimation = true;	//在下下一帧将动画再次打开
          })

        })
      }, 1000)
    }
    setTimeout(() => {		//在0.8秒后关闭刷新的动画以及打开页面的滚动
      this.refreshTriggered = false;
      this.scrollStatus = true;
    }, 800)
  }

  public sendNewOrder(orderDetail: ChatNewOrder): void {		//发送新的预约order
    let message = orderDetail;
    let time = new Date().getTime();
    let showTime = this.judgeTime(time);
    let timeObject = this.timeObject(time, showTime);

    this.texts.push({					//将数据加入texts数组显示在scroll中
      isOrder: true,//查看是否是订单消息
      fromMe: true,//是否是我发出的
      time: timeObject,
      showTime: showTime,
      message: message,
    });
    this.textIndex = "index" + (this.texts.length - 1);//移动到这条数据
    let data = JSON.stringify({
      isOrder: true,//查看是否是订单消息
      uid: this.uid,
      toUid: this.toUid,
      time: time,
      message: message
    });
    this.storage.push(data);	//放入storage数组 一会儿一起放入缓存
    if (this.storage.length >= this.storageNum)	//如果缓存的数量大于最大缓存数量，那么就直接删除第一条数据
      this.storage.splice(0, 1);
    this.socketTask?.send({ 		//发送到服务器
      data: data
    });
    this.hasNew = true;
  }

  public changeOrderStatus(e: any, index: number): void { 		//变更order的状态
    this.texts[index].message.status = e;
    let data = JSON.parse(this.storage[index + this.historyIndex]);
    data.message.status = e;
    this.storage[index + this.historyIndex] = JSON.stringify(data);
  }

  public orderText(e: string): void {
    let time = new Date().getTime();
    let showTime = this.judgeTime(time);
    let timeObject = this.timeObject(time, showTime);

    this.texts.push({	//将数据加入texts数组显示在scroll中
      isOrder: false,//查看是否是订单消息
      fromMe: true,//是否是我发出的
      time: timeObject,
      showTime: showTime,
      message: e,
    });
    this.textIndex = "index" + (this.texts.length - 1);//移动到这条数据
    let data = JSON.stringify({
      isOrder: false,//查看是否是订单消息
      uid: this.uid,
      toUid: this.toUid,
      time: time,
      message: e
    });
    this.storage.push(data);	//放入storage数组 一会儿一起放入缓存
    if (this.storage.length >= this.storageNum)	//如果缓存的数量大于最大缓存数量，那么就直接删除第一条数据
      this.storage.splice(0, 1);
    this.socketTask?.send({ 		//发送到服务器
      data: data
    });
    this.hasNew = true;
  }

  public saveData() {
    let reminder = wx.getStorageSync(this.uid + 'friends');	//获取friends页面好友列表的缓存

    wx.setStorageSync(this.uid + 'ChatWith' + this.toUid, JSON.stringify(this.storage));	//页面关闭时将storage数组存入缓存以达到持久化并且最小化设备压力的目的
    if (reminder !== '') {
      reminder = JSON.parse(reminder);
    } else reminder = {};
    let last = JSON.parse(this.storage[this.storage.length - 1]);	//将好友uid、最新的头像、名字以及最后一条消息的文字和时间存入缓存持久化
    if (!last.isOrder) {	//不是订单消息
      reminder[this.toUid] = {
        name: this.name,
        avatarUrl: this.yourAvatarUrl,
        time: last.time,
        message: last.message
      };
    } else { 	//是订单消息
      if (last.uid === this.uid) {		//消息是我发出的也即我发出的预约
        reminder[this.toUid] = {
          name: this.name,
          avatarUrl: this.yourAvatarUrl,
          time: last.time,
          message: "你发起了一个预约"
        };
      } else {		//消息是对方发出的也即对方发出的预约
        reminder[this.toUid] = {
          name: this.name,
          avatarUrl: this.yourAvatarUrl,
          time: last.time,
          message: "对方发来了一个预约"
        };
      }

      wx.setStorageSync(this.uid + 'friends', JSON.stringify(reminder));
    }
  }

  public get friendBottom() {
    return (this.statusHeight - wx.getMenuButtonBoundingClientRect().bottom);
  }

  public onLoad(option: { toUid: number; name: string; avatarUrl: string; }) {
    this.uid = this.$store.state.uid;
    this.toUid = option.toUid;//从上个页面的url获得好友的uid信息
    this.name = option.name;//从上个页面的url获得好友的姓名信息
    this.yourAvatarUrl = option.avatarUrl;//从上个页面的url获得好友的头像url信息
    this.myAvatarUrl = this.$store.state.avatarUrl;
    infoReturn({  //再获取一次好友的头像和名字
      uid: Number(this.uid)
    }).then(res => {
      this.name = res.result.userName;
      this.yourAvatarUrl = res.result.avatarUrl;
    })
    let storage = wx.getStorageSync(this.uid + 'ChatWith' + this.toUid);	//将所有的历史记录缓存存入storage缓存
    if (storage == undefined || storage == '' || storage == null) {	//如果缓存为空那么显式声明为数组
      this.storage = [];
    } else this.storage = JSON.parse(storage);	//不是空则对象化
    let length = this.storage.length;
    if (length > 15)	//如果历史记录缓存大于十五条则historyIndex为长度－15，否则直接为零
      this.historyIndex = length - 15;
    else this.historyIndex = 0;
    for (let i = this.historyIndex; i <= length - 1; i++) {	//从historyIndex到最后一条缓存全部推入texts数组来显示在屏幕上
      let text = JSON.parse(this.storage[i]);
      let fromMe = false;
      if (text.uid === this.uid)
        fromMe = true;
      let showTime = this.judgeTime(text.time);
      let timeObject = this.timeObject(text.time, showTime);
      this.texts.push({
        isOrder: text.isOrder,//查看是否是订单消息
        fromMe: fromMe,//是否是我发出的
        time: timeObject,
        showTime: showTime,
        message: text.message,
      })
    }

    if (this.texts.length !== 0)	//如果屏幕上有消息 那么移动到最下一条消息
      this.textIndex = 'index' + (this.texts.length - 1)

    if (this.socketTask == undefined) {	//打开页面打开链接
      this.connect();
    }

    if (this.timeCount == null) {
      this.timeCount = setInterval(() => {
        if (this.hasNew) {
          this.saveData();
          this.hasNew = false;
        }
      }, 5000);
    }

    // @ts-ignore
    // 无法识别getOpenerEventChannel()
    const eventChannel: EventChannel = this.getOpenerEventChannel();//从order组件中传来的订单消息
    eventChannel.on('bookOrder', (data) => {
      let oid = data.data.oid;
      let cid = data.data.cid;
      let longitude = data.data.longitude;
      let latitude = data.data.latitude;
      let address = data.data.address;
      let location = data.data.location;
      let price = data.data.price;
      let timeStamp = data.data.timeStamp;
      let startTime = data.data.startTime;
      let endTime = data.data.endTime;

      this.newOrder = {
        status: 0,
        oid: oid,
        uid: Number(this.uid),
        toUid: Number(this.toUid),
        cid: Number(cid),
        longitude: longitude,
        latitude: latitude,
        address: address,
        location: location,
        price: price,
        timeStamp: timeStamp,
        startTime: startTime,
        endTime: endTime
      };
    });
    eventChannel.on('sendStatus', (data) => {
      this.orderStatusChange = data.data.message
    });
  }

  public onUnload() {
    socketClose(this.socketTask).then(res => {  //页面关闭那么关闭链接
      this.socketTask = undefined;
    })
    if (this.timeCount != -1) {
      clearInterval(this.timeCount);
      this.timeCount = -1;
    }
    let reminder = wx.getStorageSync(this.uid + 'friends');	//获取friends页面好友列表的缓存

    wx.setStorageSync(this.uid + 'ChatWith' + this.toUid, JSON.stringify(this.storage));	//页面关闭时将storage数组存入缓存以达到持久化并且最小化设备压力的目的
    if (reminder !== '') {
      reminder = JSON.parse(reminder);
    } else reminder = {};
    let last = JSON.parse(this.storage[this.storage.length - 1]);	//将好友uid、最新的头像、名字以及最后一条消息的文字和时间存入缓存持久化
    if (!last.isOrder) {	//不是订单消息
      reminder[this.toUid] = {
        name: this.name,
        avatarUrl: this.yourAvatarUrl,
        time: last.time,
        message: last.message
      };
    } else { 	//是订单消息
      if (last.uid === this.uid) {		//消息是我发出的也即我发出的预约
        reminder[this.toUid] = {
          name: this.name,
          avatarUrl: this.yourAvatarUrl,
          time: last.time,
          message: "你发起了一个预约"
        };
      } else {		//消息是对方发出的也即对方发出的预约
        reminder[this.toUid] = {
          name: this.name,
          avatarUrl: this.yourAvatarUrl,
          time: last.time,
          message: "对方发来了一个预约"
        };
      }

      wx.setStorageSync(this.uid + 'friends', JSON.stringify(reminder));
    }

  }

  public onShow() {
    if (!this.firstCall) {	//如果不是第一次打开页面
      if (this.socketTask == undefined) {	//打开页面打开链接
        this.connect();
      }
      if (this.timeCount == null) {
        this.timeCount = setInterval(() => {
          if (this.hasNew) {
            this.saveData();
            this.hasNew = false;
          }
        }, 5000);
      }
    } else {
      this.firstCall = false;
    }
  }

  public onHide() {	//页面隐藏关闭链接
    socketClose(this.socketTask).then(res => {
      this.socketTask = undefined;
    })
    if (this.timeCount != -1) {
      clearInterval(this.timeCount);
      this.timeCount = -1;
    }
  }
}
</script>

<style scoped>
.navigator {
  background-color: rgba(102, 205, 170, 1);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  color: #FFFFFF;
  font-size: 35upx;
  font-weight: 700;
  letter-spacing: 2upx;
}

.typeView {
  background-color: rgba(240, 240, 240, 1);
  height: 230upx;
  width: 100%;
}

.type {
  padding: 20upx;
  font-size: 30upx;
  line-height: 30upx;
  min-height: 70upx;
  margin: 20upx;
  height: 180upx;
  border-radius: 35upx;
  width: 600upx;
  background-color: rgb(255, 255, 255);
}

.send {
  background-color: rgba(102, 205, 170, 1);
  color: #FFFFFF;
  width: 100upx;
  border-radius: 35upx;
  margin: 20upx 20upx 20upx 0;
  height: 70upx;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 1upx;
}

.avatarView {
  width: 90upx;
  height: 90upx;
  margin: 20upx;
  border-radius: 50%;
  overflow: hidden;
}

.time {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20upx;
  font-size: 25upx;
  color: rgba(0, 0, 0, 0.5);
}

.myTextView {
  display: flex;
  justify-content: flex-end;
}

.otherTextView {
  display: flex;
}

.myText {
  background-color: rgba(102, 205, 170, 1);
  color: #FFFFFF;
  margin: 20upx 0 20upx 20upx;
  padding: 30upx;
  border-radius: 30upx 0 30upx 30upx;
  font-size: 30upx;
  word-break: break-all;
  word-wrap: break-word;
  max-width: 520upx;
}

.otherText {
  background-color: rgba(255, 255, 255, 1);
  margin: 20upx 20upx 20upx 0;
  padding: 30upx;
  border-radius: 0 30upx 30upx 30upx;
  font-size: 30upx;
  word-break: break-all;
  word-wrap: break-word;
  max-width: 520upx;
}

.myOrder {
  margin: 20upx 0 20upx 20upx;
}

.otherOrder {
  margin: 20upx 20upx 20upx 0;
}

.backimg {
  position: absolute;
  left: 8px;
  width: 25px;
  height: 25px;
}
</style>
