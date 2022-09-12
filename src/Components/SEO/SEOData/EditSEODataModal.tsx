import { Form, Input, message, Modal, Switch, Typography } from 'antd';
import React, { useEffect, useState } from 'react'
import { fetchEditSEOData } from '../../../service/SEO/SEO';
import TextEditor from '../../RealEstatePage/CreateNew/TextEditor';

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

const { Title, Text } = Typography;

function EditSEODataModal(prop: any) {
    const { visible, setVisible, getAllSEOData, selectedRowData } = prop;
    const [isRowDataActive, setisRowDataActive] = useState(false);
    const [modalLoading, setmodalLoading] = useState(false);
    const [text, settext] = useState('');

    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            id: selectedRowData.id,
            imageSEO: selectedRowData.imageSEO,
            name: selectedRowData.name,
            titleSEO: selectedRowData.titleSEO,
            descriptionSEO: selectedRowData.descriptionSEO,
            keywordsSEO: selectedRowData.keywordsSEO,
            urlSEO: selectedRowData.urlSEO,
            contentSEO: selectedRowData.contentSEO,
            active: selectedRowData.active,
        });
        setisRowDataActive(selectedRowData.active)
    }, [selectedRowData]);

    const handleOk = () => {
        setmodalLoading(true);
        form
            .validateFields()
            .then(async values => {
                // replace all </p><p> to \n
                // and then remove all tags like <p> and </p>
                const descriptionSEO = values.descriptionSEO.replace(/<\/p><p>/g, '\n').replace(/<\/?[^>]+(>|$)/g, '');
                // switch all entities to string
                const descriptionSEOString = descriptionSEO.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                const formattedValues = {...values, descriptionSEO: descriptionSEOString}
                const response = await fetchEditSEOData(formattedValues, setmodalLoading)
                if (response) {
                    if (response.status === 200) {
                        message.success('Edit SEO data success');
                        setVisible(false);
                        getAllSEOData();
                    } else {
                        message.error(response.data)
                    }
                } else {
                    message.error('Edit SEO data failed')
                }
            })
            .catch(errorInfo => {
                const { errorFields } = errorInfo;
                const errorFieldsNameArray: any = []
                errorFields.forEach((field: any) => {
                    const capitalizedFieldName = field.name[0].charAt(0).toUpperCase() + field.name[0].slice(1)
                    errorFieldsNameArray.push(capitalizedFieldName)
                })
                message.destroy();
                message.error(`${errorFieldsNameArray.join(", ")} is invalid`);
            });
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const onFinish = (values: any) => {
        // console.log(values);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const handleTextEditorChange = (e: any) => {
        // remove all tags and keep only text
        settext(e.replace(/<[^>]*>/g, ''));
    }

    return (
        <>
            <Modal
                title="Edit information"
                centered
                visible={visible}
                onOk={handleOk}
                confirmLoading={modalLoading}
                onCancel={handleCancel}
                destroyOnClose
                okText="Save"
                width={800}
                className="SEO-modal-form"
            >
                <Form
                    {...layout}
                    form={form}
                    name="basic"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="ID"
                        name="id"
                    >
                        <Text>{selectedRowData?.id}</Text>
                    </Form.Item>
                    <Form.Item
                        label="Image SEO"
                        name="imageSEO"
                    >
                        <Input
                            placeholder="Enter new image URL"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Name"
                        name="name"
                    >
                        <Input
                            placeholder="Enter new name"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Title SEO"
                        name="titleSEO"
                    >
                        <Input
                            placeholder="Enter new title"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Description SEO"
                        name="descriptionSEO"
                    >
                        <TextEditor
                            value={text}
                            onChange={handleTextEditorChange}
                            placeholder="Enter new description"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Key words SEO"
                        name="keywordsSEO"
                    >
                        <Input
                            placeholder="Enter new keywords"
                        />
                    </Form.Item>
                    <Form.Item
                        label="URL SEO"
                        name="urlSEO"
                    >
                        <Input
                            placeholder="Enter new url"
                        />
                    </Form.Item>
                    <Form.Item
                        name="contentSEO"
                        label="Content SEO">
                        <TextEditor
                            value={text}
                            onChange={handleTextEditorChange}
                            placeholder="Enter new content"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Active"
                        name="active"
                    >
                        <Switch checked={isRowDataActive} onChange={(e) => setisRowDataActive(e)} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default EditSEODataModal