import {
    DirectionDrivingReq,
    DirectionDrivingResp, DistanceDrivingResp,
    GeoCoderReq,
    GeoCoderResp,
    GeoPoint,
    GeoPointExtend, PlaceSuggestionReq, PlaceSuggestionResp
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

export function placeSuggestion(placeSuggestionReq: PlaceSuggestionReq): Promise<PlaceSuggestionResp> {
    const {address, addressFormat, location, key} = placeSuggestionReq;
    let url: string;
    if (location !== undefined) {
        url = `https://apis.map.qq.com/ws/place/v1/suggestion?keyword=${address}&location=${location.latitude},${location.longitude}&address_format=${addressFormat}&key=${key}`;
    } else {
        url = `https://apis.map.qq.com/ws/place/v1/suggestion?keyword=${address}&address_format=${addressFormat}&key=${key}`;
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url: url,
            success: res => {
                const data = <PlaceSuggestionResp>res.data;
                resolve(data)
            },
            fail: err => {
                reject(err);
            }
        })
    });
}

export function distanceDriving(directionDrivingReq: DirectionDrivingReq): Promise<DistanceDrivingResp> {
    const {fromLongitude, fromLatitude, toLongitude, toLatitude, key} = directionDrivingReq;
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://apis.map.qq.com/ws/distance/v1/matrix/?mode=driving&from=${fromLatitude},${fromLongitude}&to=${toLatitude},${toLongitude}&key=${key}`,
            success: res => {
                const data = <DistanceDrivingResp>res.data;
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