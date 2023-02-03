import {GeoPoint} from "@/apis/map/map-interface";

export interface ChargerReq {
    id: number;
}

export interface ChargerSearchReq {
    uid: number;
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