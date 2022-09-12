import { message, Upload, Modal, Form, notification } from "antd";
import type { RcFile } from 'antd/es/upload';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { t } from "i18next";
import { ProForm } from "@ant-design/pro-components";

function ImageUploader({ isReset }: any) {
    const [fileList, setFileList] = useState<any>([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        setFileList([])
    }, [isReset]);

    const getBase64 = (file: any): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

    const handlePreview = async (file: any) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const beforeUpload = (file: RcFile) => {
        const isValidImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isValidImage) {
            message.error(t('You can only upload JPG/PNG file!'));
        }
        const isLt1M = file.size / 1024 / 1024 < 1;
        if (!isLt1M) {
            notification.error({
                message: `${t("Image is too large")}`,
                description: `${t("Image must be smaller than 1MB")}!`,
            });
        }
        return (isValidImage && isLt1M) || Upload.LIST_IGNORE;
        // return false
    };

    const handleChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);
    }

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const getImages = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    return (
        <>
            <ProForm.Item
                name="thumbnail"
                label={t("thumbnail")}
                getValueFromEvent={getImages}
                rules={[{ required: true, message: `${t("please-upload")} ${t("thumbnail").toLowerCase()}!` }]}
            >
                <Upload
                    action="https://v2.pindias.com/api/v2/image/upload"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    beforeUpload={beforeUpload}
                    accept=".png, .jpg, .jpeg"
                >
                    {fileList.length >= 1 ? null : uploadButton}
                </Upload>
            </ProForm.Item>
            <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={() => setPreviewVisible(false)}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    )
}

export default ImageUploader