export interface ChatNewOrder {
    status: number;
    oid: number;
    uid: number;
    toUid: number;
    cid: number;
    longitude: number;
    latitude: number;
    address: string;
    location: string;
    price: string;
    timeStamp: number;
    startTime: string;
    endTime: string;
}

export interface ChatTime {
    timeStamp: number;
    timeText: string;
}

export interface ChatText {
    isOrder: boolean;//查看是否是订单消息
    fromMe: boolean;//是否是我发出的
    time: ChatTime;
    showTime: boolean;
    message: any;
}