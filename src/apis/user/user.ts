import {UserInfo} from "@/apis/user/user-interface";
import request from "@/apis/wx/request";

export function updateUrl(userInfo: UserInfo) {
    return request({
        url: "TODO",
        method: "POST",
        data: userInfo
    })
}