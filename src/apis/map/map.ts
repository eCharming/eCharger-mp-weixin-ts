import {
    DirectionDrivingReq,
    DirectionDrivingResp,
    GeoCoderReq,
    GeoCoderResp,
    GeoPoint,
    GeoPointExtend
} from "@/apis/map/map-interface";
import request from "@/apis/wx/request";

export function geoCoder(geoCoderReq: GeoCoderReq): Promise<GeoCoderResp> {
    const {longitude, latitude, key} = geoCoderReq;
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${key}`,
            success: res => {
                const data = <GeoCoderResp>res.data;
                resolve(data)
            },
            fail: err => {
                reject(err);
            }
        })
    });
}

export function directionDriving(directionDrivingReq: DirectionDrivingReq): Promise<DirectionDrivingResp> {
    const {fromLongitude, fromLatitude, toLongitude, toLatitude, key} = directionDrivingReq;
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://apis.map.qq.com/ws/direction/v1/driving/?from=${fromLatitude},${fromLongitude}&to=${toLatitude},${toLongitude}&key=${key}`,
            success: res => {
                const data = <DirectionDrivingResp>res.data;
                resolve(data)
            },
            fail: err => {
                reject(err);
            }
        })
    });
}

export function wholeCity(geoPoint: GeoPoint) {
    return request({
        url: "TODO",
        method: "GET",
        data: geoPoint
    })
}

export function getSurround(geoPoint: GeoPointExtend) {
    return request({
        url: "TODO",
        method: "GET",
        data: geoPoint
    })
}