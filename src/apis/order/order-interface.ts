export interface OrderReq {
    status?: number;
    uid?: number;
    toUid?: number;
    cid?: number;
    timeStamp?: number;
    startTime?: string;
    endTime?: string;
    address?: string;
    location?: string;
    predictedPrice?: string;
    outTradeNo?: number;
    transactionId?: number;
}