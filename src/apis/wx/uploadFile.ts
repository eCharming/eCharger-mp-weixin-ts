import UploadFileSuccessCallbackResult = WechatMiniprogram.UploadFileSuccessCallbackResult;

export default function uploadFile(url: string, filePath: string, name: string): Promise<UploadFileSuccessCallbackResult> {
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: url,
            filePath: filePath,
            name: name,
            success: res => resolve(res),
            fail: err => reject(err)
        })
    })

}