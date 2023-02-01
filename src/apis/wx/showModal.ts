import ShowModalSuccessCallbackResult = WechatMiniprogram.ShowModalSuccessCallbackResult;
import GeneralCallbackResult = WechatMiniprogram.GeneralCallbackResult;

export default function showModal(content: string) {
    return new Promise((resolve: (res: ShowModalSuccessCallbackResult) => void,
                        reject: (err: GeneralCallbackResult) => void) => {
        wx.showModal({
            content: content,
            success: res => resolve(res),
            fail: err => reject(err)
        })
    })
}