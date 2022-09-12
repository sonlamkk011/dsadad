import BraftEditor from 'braft-editor';
import { t } from 'i18next';

export const myUploadFn = (param: any) => {
    const serverURL = 'https://v2.pindias.com/api/v2/image/upload'
    const xhr = new XMLHttpRequest
    const fd = new FormData()

    const successFn = (response: any) => {
        //After the upload is successful, call param.success and pass in the uploaded file address
        const imageUrl = JSON.parse(xhr.response).result.variants[0]
        param.success({
            url: imageUrl,
        })
    }

    const progressFn = (event: any) => {
        //call param.progress when upload progress changes
        param.progress(event.loaded / event.total * 100)
    }

    const errorFn = (response: any) => {
        //call param.error when upload error occurs
        param.error({
            msg: t('Unable to upload')
        })
    }

    xhr.upload.addEventListener("progress", progressFn, false)
    xhr.addEventListener("load", successFn, false)
    xhr.addEventListener("error", errorFn, false)
    xhr.addEventListener("abort", errorFn, false)

    fd.append('file', param.file)
    xhr.open('POST', serverURL, true)
    xhr.send(fd)
}

export const turnToBraftState = (value: any) => {
    return BraftEditor.createEditorState(value)
}