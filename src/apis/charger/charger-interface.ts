import {GeoPoint} from "@/apis/map/map-interface";

export interface ChargerPicReq {
    cid: number | string;
    fileName?: string;
    fileNames?: string[];
}

export interface ChargerReq {
    cid?: number;
    uid?: number;
    userName?: string;
    phoneNumber?: string;
    address?: string;
    location?: string;
    geoPoint?: GeoPoint;
    timeStamp?: Array<number>;
    time?: Array<string>;
    price?: string;
    remarks?: string;
}