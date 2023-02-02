export interface QWeatherReq {
    longitude: number;
    latitude: number;
    key: string;
}

export interface QWeatherResp {
    code: string;
    updateTime: string;
    fxLink: string;
    now?: {
        obsTime: string;
        temp: string;
        feelsLike: string;
        icon: string;
        text: string;
        wind360: string;
        windDir: string;
        windScale: string;
        windSpeed: string;
        humidity: string;
        precip: string;
        pressure: string;
        vis: string;
        cloud: string;
        dew: string;
    };
    refer: any;
    license: any;
}