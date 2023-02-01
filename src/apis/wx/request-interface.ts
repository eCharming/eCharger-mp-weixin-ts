import IAnyObject = WechatMiniprogram.IAnyObject;

export interface ResponseBody {
    code: number,
    msg: string,
    result: any
}

export interface RequestBody {
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE"
    data: IAnyObject,
    header?: IAnyObject
}