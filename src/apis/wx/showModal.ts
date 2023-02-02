import ShowModalSuccessCallbackResult = WechatMiniprogram.ShowModalSuccessCallbackResult;

export default function showModal(content: string, title?: string): Promise<ShowModalSuccessCallbackResult> {
    if (title !== undefined) {
        return new Promise((resolve, reject) => {
            wx.showModal({
                title: title,
                content: content,
                success: res => resolve(res),
                fail: err => reject(err)
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            wx.showModal({
                content: content,
                success: res => resolve(res),
                fail: err => reject(err)
            })
        })
    }
}