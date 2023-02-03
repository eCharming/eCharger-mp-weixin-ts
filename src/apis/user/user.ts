import {UserInfo} from "@/apis/user/user-interface";
import request from "@/apis/wx/request";

export function updateUrl(userInfo: UserInfo) {
    return request({
        url: "TODO",
        method: "POST",
        data: userInfo
    })
}

export function wxLogin() {
    return request({
        url: "TODO",
        method: "POST"
    })
}

export function wxLogout(userInfo: UserInfo) {
    return request({
        url: "TODO",
        method: "POST",
        data: userInfo
    })
}
export function infoReturn(userInfo: UserInfo) {
    return request({
        url: "TODO",
        method: "POST",
        data: userInfo
    })
}

export function getBalance(userInfo: UserInfo) {
    return request({
        url: "TODO",
        method: "POST",
        data: userInfo
    })
}