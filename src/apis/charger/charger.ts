import {ChargerReq} from "@/apis/charger/charger-interface";
import request from "@/apis/wx/request";

export function chargerDelete(chargerReq: ChargerReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: chargerReq
    })
}

export function chargerPicDelete(chargerReq: ChargerReq) {
    return request({
        url: "https://ws.healtool.cn/deletePic/",
        method: "POST",
        data: chargerReq
    })
}