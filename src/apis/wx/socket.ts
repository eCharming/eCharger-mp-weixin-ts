import SocketTask = WechatMiniprogram.SocketTask;
import GeneralCallbackResult = WechatMiniprogram.GeneralCallbackResult;

export function socketSend(socket: SocketTask | undefined, data: string | ArrayBuffer): Promise<GeneralCallbackResult> {
    return new Promise((resolve, reject) => {
        socket?.send({
            data: data,
            success: res => resolve(res),
            fail: err => reject(err)
        })
    })
}

export function socketClose(socket: SocketTask | undefined): Promise<GeneralCallbackResult> {
    return new Promise((resolve, reject) => {
        socket?.close({
            success: res => resolve(res),
            fail: err => reject(err)
        })
    })
}