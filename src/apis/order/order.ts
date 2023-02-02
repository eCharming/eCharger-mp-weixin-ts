import {OrderReq} from "@/apis/order/order-interface";
import request from "@/apis/wx/request";

export function orderNum(orderReq: OrderReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: orderReq
    })
}

export function orderPay(orderReq: OrderReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: orderReq
    })
}

export function payQuery(orderReq: OrderReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: orderReq
    })
}

export function orderInput(orderReq: OrderReq) {
    return request({
        url: "TODO",
        method: "POST",
        data: orderReq
    })
}