import { Button, Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchCreateNewCategory } from "../../service/Categories/Categories";
import { PlusCircleOutlined } from "@ant-design/icons";
import { t } from "i18next";

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

function CreateNewCategory({ getCategoriesList, categoryType }: any) {
    const [form] = Form.useForm();

    // For modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        form.resetFields();
    }, [isModalVisible]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values: any) => {
            setConfirmLoading(true);
            const newCategory = { ...values, type: categoryType, status: "ACTIVE" };
            const response = await fetchCreateNewCategory(newCategory, setConfirmLoading);
            if (response) {
                if (response.status === 200) {
                    setIsModalVisible(false);
                    form.resetFields();
                    getCategoriesList();
                } else {
                    message.error(response.data);
                }
            } else {
                message.error(t("Create new category failed"));
            }
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <span>
            <Button className="me-2" type="primary" onClick={showModal}>
                <div className="d-flex align-items-center justify-content-between">
                    <PlusCircleOutlined className="me-2" />
                    {t("category-create-new")}
                </div>
            </Button>
            <Modal title={t("category-create-new")} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} confirmLoading={confirmLoading} forceRender>
                <Form {...layout} form={form} name="control-hooks">
                    <Form.Item name="name" label={t("name")} rules={[{ required: true, message: `${t("Please input new category name")}!` }]}>
                        <Input placeholder="Resort" />
                    </Form.Item>
                </Form>
            </Modal>
        </span>
    );
}

export default CreateNewCategory;
