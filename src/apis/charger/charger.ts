import {ChargerReq, ChargerPicReq} from "@/apis/charger/charger-interface";
import request from "@/apis/wx/request";

export function chargerDelete(chargerReq: ChargerReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: chargerReq
    })
}

export function chargerPicDelete(chargerPicReq: ChargerPicReq) {
    const {cid, fileName} = chargerPicReq;
    if (fileName) {
        return request({
            url: `https://ws.healtool.cn/deletePic/${cid}/${fileName}`,
            method: "DELETE"
        })
    } else {
        return request({
            url: `https://ws.healtool.cn/deletePic/${cid}`,
            method: "DELETE"
        })
    }
}

export function chargerPicGet(chargerPicReq: ChargerPicReq) {
    return request({
        url: 'https://ws.healtool.cn/downloadPic/' + chargerPicReq.cid,
        method: "GET"
    })
}

export function chargerPicRollback(chargerPicReq: ChargerPicReq) {
    return request({
        url: "https://ws.healtool.cn/rollbackPic",
        method: "POST",
        data: chargerPicReq
    })
}

export function chargerSearch(chargerReq: ChargerReq) {
    return request({
        url: "TODO",
        method: "GET",
        data: chargerReq
    })
}

export function chargerInput(chargerReq: ChargerReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: chargerReq
    })
}

export function chargerDetail(chargerReq: ChargerReq) {
    return request({
        url: "TODO",
        method: "GET",
        data: chargerReq
    })
}

export function chargerUpdate(chargerReq: ChargerReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: chargerReq
    })
}