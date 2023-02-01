export interface BookReq {
    oid: number,
    status?: number,
}

export interface BookMessage {
    status: number,
    oid: number,
    cid: number,
    uid: number,
    toUid: number,
    longitude: string,
    latitude: string,
    address: string,
    location: string,
    price: string,
    timeStamp: string,
    startTime: string,
    endTime: string,
}