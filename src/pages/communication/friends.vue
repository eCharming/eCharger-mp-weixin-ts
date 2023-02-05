<template>
  <view>
    <view class="navigator" :style="{'height':statusHeight+'px'}">
      <image src="../../static/image/back.png" class="backimg" :style="{'top':statusBarHeight+12.5+'px'}"
             @tap="back"></image>
      <text :style="{'margin-bottom':contacterBottom+'px'}">联系人</text>
    </view>
    <scroll-view
        scroll-y="true"
        scroll-with-animation=true
        style="background-color: white;"
        :style="{'height':scrollHeight+'px'}"
    >

      <view v-for="(friend,index) in friends" :key="index">
        <friendList :avatarUrl="friend.avatarUrl" :name="friend.name" :lastTime="friend.lastTime"
                    :lastWord="friend.lastWord"
                    :hasNew="friend.hasNew" :newMessageNum="friend.newMessageNum" @clickMessage="click(index)"
                    @deleteFriends="deleteFriends(index)"></friendList>
      </view>


      <view v-if="friends.length===0"
            style="width:100%;height:100%;display: flex;align-items: center;justify-content: center;flex-direction: column;">
        <image src="/static/image/blank.png" style="width: 200rpx;height: 200rpx;"></image>
        <text style="font-weight: bold;color: rgba(102,205,170,1);">还没有联系人</text>
      </view>
    </scroll-view>

  </view>

</template>

<script lang="ts">
import friendList from '../../components/friendList.vue'
import {Component, Vue} from "vue-property-decorator";
import SocketTask = WechatMiniprogram.SocketTask;
import {infoReturn} from "@/apis/user/user";
import {FriendsFriends, FriendsReminders} from "@/pages/communication/friends-interface";
import {socketClose} from "@/apis/wx/socket";

@Component({
  components: {
    friendList
  }
})
export default class Friends extends Vue {
  private contacterBottom: number = 0;//联系人距离导航栏底部距离
  private statusHeight: number = 0;//导航栏高度
  private scrollHeight: number = 0;//scrollview高度
  private friends: FriendsFriends[] = [];//所有好友数据的信息都存储在这个数组里
  private uid: number = -1;
  private statusBarHeight: number = wx.getSystemInfoSync().statusBarHeight;//状态栏高度
  public socketTask: SocketTask | undefined;

  private reminders: FriendsReminders[] = [];

  public back(): void {
    wx.navigateBack({})
  }

  public click(index: number): void {	//按下某一个好友 导航到chat页面 通过缓存传送好友的uid、姓名和头像url
    this.friends[index].hasNew = false;
    this.friends[index].newMessageNum = 0;
    wx.navigateTo({
      url: './chat?toUid=' + this.friends[index].uid + '&name=' + this.friends[index].name + '&avatarUrl=' + this.friends[index].avatarUrl,
    });
  }

  public deleteFriends(index: number): void {
    let uid = this.friends[index].uid;
    this.friends.splice(index, 1);
    delete this.reminders[uid];
    wx.setStorageSync(this.uid + 'friends', JSON.stringify(this.reminders));
  }

  public connect(): void {
    this.socketTask = wx.connectSocket({		//打开链接
      url: 'wss://ws.healtool.cn/websocketapi/Reminder/' + this.uid
    });
    this.socketTask.onMessage((res) => {	//接收到消息
      let reminders = JSON.parse(<string>res.data); //对象化
      for (let index in reminders) {	//检索每一条数据
        let fromUid = reminders[index].fromUid;
        let text = JSON.parse(reminders[index].latestText);
        let num = reminders[index].num;
        let hasFound = false;//用于判断是否寻找到匹配的好友
        let time = this.timeObject(text.time);
        for (let i in this.friends) {
          if (fromUid === this.friends[i].uid) {	//匹配到好友的uid之后修正数据
            if (!text.isOrder) {	//不是订单
              this.friends[i].lastWord = text.message;
            } else {
              this.friends[i].lastWord = "对方发来了一个预约";
            }
            this.friends[i].newMessageNum = num;
            this.friends[i].hasNew = true;
            this.friends[i].lastTime = time;
            hasFound = true;
            break;
          }
        }
        if (!hasFound) {	//没有匹配到好友 则好友列表当中没有该好友 向friends里加入该好友并且向缓存中注入该好友
          infoReturn({  //获取该好友的头像以及名字
            uid: Number(fromUid)
          }).then(res => {
            let message: string;
            if (!text.isOrder) {	//不是订单
              message = text.message;
            } else {
              message = "对方发来了一个预约";
            }
            this.reminders[Number(fromUid)] = {			//将传入的reminder参数增加该好友
              name: res.result.userName,
              avatarUrl: res.result.avatarUrl,
              time: time,
              message: message
            };
            wx.setStorageSync(this.uid + 'friends', JSON.stringify(this.reminders)); 	//存入缓存持久化该好友 用于下一次打开时可以找到该好友
            this.friends.unshift({		//向好友列表当中推入该好友
              uid: fromUid,
              name: res.result.userName,
              avatarUrl: res.result.avatarUrl,
              lastWord: message,
              lastTime: time,
              newMessageNum: num,//新消息数量
              hasNew: true//是否有新消息
            })
          })
        }
      }
    });
  }

  public timeObject(time: string | number | Date) {		//用于将时间戳转化为时间显示 需要完成显示 昨天 或者日期 或者不显示日期的功能
    let currentTime = new Date();
    let currentYear = currentTime.getFullYear();
    let currentMonth = currentTime.getMonth() + 1;
    let currentDay = currentTime.getDate();
    let timeDate = new Date(time);
    let year = timeDate.getFullYear();
    let month: number | string = timeDate.getMonth() + 1;
    let day: number | string = timeDate.getDate();
    let hour: number | string = timeDate.getHours();
    let minute: number | string = timeDate.getMinutes();
    if (hour < 10)
      hour = '0' + hour;
    if (minute < 10)
      minute = '0' + minute;
    let timeText = '';
    if (currentYear == year) {
      if (currentMonth == month && currentDay == day) {
        timeText = hour + ':' + minute;
      } else if (currentMonth == month && currentDay - day == 1) {
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
    return timeText
  }

  public onLoad() {
    this.uid = this.$store.state.uid;
    this.statusHeight = wx.getSystemInfoSync().statusBarHeight + 50;
    this.contacterBottom = (this.statusHeight - uni.getMenuButtonBoundingClientRect().bottom);
    this.scrollHeight = wx.getSystemInfoSync().windowHeight - this.statusHeight;
  }

  public onUnload() {		//页面关闭则断开连接
    socketClose(this.socketTask).then(res => {
      this.socketTask = undefined;
    })
  }

  public onShow() {
    this.friends.splice(0);   //正式版
    let reminder = wx.getStorageSync(this.uid + 'friends');		//获取好友列表缓存
    if (reminder != '') {
      this.reminders = JSON.parse(reminder);
      let keys = Object.keys(this.reminders);
      for (let index in keys) {   //正式版
        this.friends.push({
          uid: Number(keys[index]),
          name: this.reminders[Number(keys[index])].name,
          avatarUrl: this.reminders[Number(keys[index])].avatarUrl,
          lastWord: this.reminders[Number(keys[index])].message,
          lastTime: this.timeObject(this.reminders[Number(keys[index])].time),
          newMessageNum: 0,//新消息数量
          hasNew: false//是否有新消息
        })
      }
    } else {
      this.reminders = []
    }
    if (this.socketTask == undefined) {
      this.connect();		//先注入缓存再打开websocket链接查看好友是否在我离线的时候发来了新消息
    }
  }

  public onHide() {
    socketClose(this.socketTask).then(res => {  //页面隐藏就关闭连接
      this.socketTask = undefined;
    })
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

.friends {
  height: 150upx;
  position: relative;
}

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

.backimg {
  position: absolute;
  left: 8px;
  width: 25px;
  height: 25px;
}
</style>
