import {QWeatherReq, QWeatherResp} from "@/apis/weather/weather-interface";

export function qWeather(qWeatherReq: QWeatherReq): Promise<QWeatherResp> {
    const {longitude, latitude, key} = qWeatherReq;
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://devapi.qweather.com/v7/weather/now?location=${longitude.toFixed(2)},${latitude.toFixed(2)}&key=${key}`,
            success: res => {
                const data = <QWeatherResp>res.data;
                resolve(data)
            },
            fail: err => {
                reject(err);
            }
        })
    });
}