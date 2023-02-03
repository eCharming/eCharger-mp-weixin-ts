export interface GeoPoint {
    longitude: number;
    latitude: number;
}

export interface GeoPointExtend {
    longitude: number;
    latitude: number;
    distance: number;
    rawLongitude: number;
    rawLatitude: number;
}

export interface GeoCoderReq {
    longitude: number;
    latitude: number;
    key: string;
}

export interface DirectionDrivingReq {
    fromLongitude: number;
    fromLatitude: number;
    toLongitude: number;
    toLatitude: number;
    key: string;
}

export interface PlaceSuggestionReq {
    address: string;
    addressFormat: string;
    key: string;
    location?: GeoPoint;
}

export interface GeoCoderResp {
    status: number;
    message: string;
    request_id: string;
    result: {
        location: {
            lat: number;
            lng: number;
        };
        formatted_addresses?: {
            recommend: string,
            rough: string
        };
        address_component: {
            nation: string;
            ad_level_1?: string;
            ad_level_2?: string;
            ad_level_3?: string;
            province?: string;
            city?: string;
            district?: string;
            street?: string;
            street_number?: string;
            locality?: string;
        };
        ad_info: any;
        address_reference?: any
        address: string;
    }
}

export interface DirectionDrivingResp {
    status: number;
    message: string;
    request_id: string;
    result: {
        routes: Array<{
            mode: string;
            distance: string;
            duration: string;
            traffic_light_count: string;
            toll: string;
            restriction: any;
            polyline: Array<number>;
            steps: Array<any>;
            tags: Array<any>;
            taxi_fare: any;
        }>
    }
}

export interface LocationRaw {
    id: string;
    title: string;
    address: string;
    category: string;
    type: number;
    location: {
        lat: number;
        lng: number;
    }
    adcode: number;
    province: number;
    city: string;
    district: string;
    _distance?:number;
}

export interface placeSuggestionResp {
    status: number;
    message: string;
    request_id: string;
    count: number;
    data: Array<LocationRaw>
}

export interface MapCover {
    title: string;
    id: number;
    latitude: number;
    longitude: number;
    iconPath: string;
    width: number;
    height: number;
    callout?: {
        content: string;
        color: string;
        fontSize: number;
        borderRadius: number;
        bgColor: string;
        textAlign: string;
        padding: number;
    }
}

export interface MapPolyline {
    points: Array<GeoPoint>
    width: number;
    color: string;
}

export interface MapCircle {
    latitude: number;
    longitude: number;
    fillColor: string;
    color: string;
    radius: number;
    strokeWidth: number;
}