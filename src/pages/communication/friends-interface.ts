export interface FriendsFriends {
    uid: number;
    name: string;
    avatarUrl: string;
    lastWord: string;
    lastTime: string;
    newMessageNum: number;
    hasNew: boolean;

}

export interface FriendsReminders {
    uid?: number;
    fromUid?: number;
    name: string;
    avatarUrl: string;
    time: string;
    message: string;
}