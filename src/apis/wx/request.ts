import {RequestBody, ResponseBody} from "@/apis/wx/request-interface";

const BASE_URL: string = "http://127.0.0.1";

export default function request(requestBody: RequestBody): Promise<void> {
    const {url, method, data, header} = requestBody;
    return new Promise((resolve, reject) => {
        wx.request({
            url: BASE_URL + url,
            method: method,
            data: data,
            header: header,
            success: res => {
                const {code, msg, result} = <ResponseBody>res.data;
                if (code == 200) {
                    resolve(result);
                } else {
                    reject(msg);
                }
            },
            fail: err => {
                reject(err);
            }
        })
    });
}