import ShowModalSuccessCallbackResult = WechatMiniprogram.ShowModalSuccessCallbackResult;

export default function showModal(content: string): Promise<ShowModalSuccessCallbackResult> {
    return new Promise((resolve, reject) => {
        wx.showModal({
            content: content,
            success: res => resolve(res),
            fail: err => reject(err)
        })
    })
}