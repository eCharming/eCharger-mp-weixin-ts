import request from "@/apis/wx/request";
import {BookReq} from "@/apis/book/book-interface";

export function orderRefund(bookReq: BookReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: bookReq
    })
}

export function orderStatusChange(bookReq: BookReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: bookReq
    })
}

export function paySharing(bookReq: BookReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: bookReq
    })
}