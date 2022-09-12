import { Button, Form, Input, message, Modal, Select } from 'antd'
import { EditOutlined, DownOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { fetchEditCategory } from '../../service/Categories/Categories';
import { t } from 'i18next';

const { Option } = Select;
const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

function EditCategory({ rowDetail, reloadTableData }: any) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(rowDetail);
    }, [isModalVisible]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (values: any) => {
                if (values.name !== rowDetail.name || values.status !== rowDetail.status) {
                    setConfirmLoading(true);
                    const editedValues = { ...rowDetail, ...values }
                    delete editedValues.key;
                    executeEditCategory(editedValues, setConfirmLoading)
                } else {
                    message.info('No changes detected');
                    setIsModalVisible(false)
                }
            })
    };

    const executeEditCategory = async (editedValues: any, setConfirmLoading: any) => {
        const response = await fetchEditCategory(editedValues, setConfirmLoading);
        if (response) {
            if (response.status === 200) {
                message.success(`${t("Edit category")} ${t("successfully")}`);
                setIsModalVisible(false);
                reloadTableData()
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${t("Edit category")} ${t("failed")}`);
        }
    }

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Button className='d-flex align-items-center' onClick={showModal}><EditOutlined /></Button>
            <Modal
                title={t("Edit category")}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={confirmLoading}
                forceRender
            >
                <Form {...layout} form={form} name="control-hooks">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: `${t("Category name is required")}!` }]}>
                        <Input placeholder='Tư vấn' />
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select
                            placeholder="Please select a category"
                        >
                            <Option value="ACTIVE">{t("active")}</Option>
                            <Option value="DELETED">{t("deleted")}</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default EditCategory