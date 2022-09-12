import { Breadcrumb, Button, Card, Col, Collapse, Divider, Form, Input, InputRef, message, Modal, Row, Select, Space, Spin, Typography, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import BraftEditor from 'braft-editor';
import { useSelector } from 'react-redux';
import { accountInfoSelector } from '../../../Features/selectors';
import { fetchCreateNewNews } from '../../../service/News/news';
import { fetchCreateNewCategory, fetchGetCategories } from '../../../service/Categories/Categories';
import { t } from 'i18next';

const { Title } = Typography;
const { Option } = Select;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

function CreateNewNews() {
    const navigate = useNavigate();
    const accountInfo: any = useSelector(accountInfoSelector)
    const [authorName, setauthorName] = useState("");
    const [categories, setcategories] = useState<any>([]);
    const [loading, setloading] = useState(false);
    const [form] = Form.useForm();

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    useEffect(() => {
        getCategoriesList();
    }, []);

    useEffect(() => {
        if (accountInfo) {
            let userName = ""
            if (accountInfo.firstName && accountInfo.lastName) {
                setauthorName(`${accountInfo.firstName} ${accountInfo.lastName}`);
                userName = `${accountInfo.firstName} ${accountInfo.lastName}`
            } else if (accountInfo.firstName && !accountInfo.lastName) {
                setauthorName(`${accountInfo.firstName}`);
                userName = `${accountInfo.firstName}`
            } else if (!accountInfo.firstName && accountInfo.lastName) {
                setauthorName(`${accountInfo.lastName}`);
                userName = `${accountInfo.lastName}`
            }
            if (userName) {
                form.setFieldsValue({
                    authorName: userName
                })
            }
        }
    }, [accountInfo]);

    const getCategoriesList = async () => {
        const response = await fetchGetCategories({ size: 100, type: 'NEWS', status: 'ACTIVE' })
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content
                form.setFieldsValue({ categoryName: contents[0].name })
                setcategories(contents);
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Get categories list failed'))
        }
    }

    const myUploadFn = (param: any) => {
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

    const handleSaveDraft = () => {
        const title = form.getFieldValue("title")
        if (title && title.length) {
            const values = form.getFieldsValue();
            const thumbnail = values.thumbnail ? values.thumbnail[0].response.result.variants[0] : null
            const content = (values.content && values.content.toHTML() !== "<p></p>") ? values.content.toHTML() : null
            const formattedValues = { ...values, authorId: accountInfo.id, content, thumbnail }
            executePostDataToServer(formattedValues, true);
        } else {
            form.setFields([
                {
                    name: 'title',
                    errors: [`${t("please-input")} ${t("title").toLowerCase()}!`],
                },
            ]);
            message.error(t("Please enter title to save draft"));
        }
    }

    const onFinish = async (values: any) => {
        const thumbnail = values.thumbnail[0].response.result.variants[0]
        const formattedValues = { ...values, authorId: accountInfo.id, content: values.content.toHTML(), thumbnail }
        executePostDataToServer(formattedValues, false);
    };

    const executePostDataToServer = async (values: any, isSaveDraft: boolean) => {
        setloading(true);
        const response = await fetchCreateNewNews({ ...values, status: isSaveDraft ? "DRAFT" : values.status }, setloading)
        if (response) {
            if (response.status === 200) {
                if (isSaveDraft) {
                    message.success(t("Save draft successfully"));
                    navigate("/news/drafts");
                } else {
                    message.success(t("Create news successfully"))
                    navigate('/news')
                }
            } else {
                message.error(response.data)
            }
        } else {
            message.error(isSaveDraft ? t("Save as draft failed") : t('Create news failed'))
        }
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onReset = () => {
        form.resetFields();
        form.setFieldsValue({
            authorName: authorName
        })
    };

    const handleNewCategoryNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setnewCategoryName(event.target.value);
    };

    const addNewCategory = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (newCategoryName.length) {
            setaddNewCategoryButtonLoading(true);
            const newCategory = { name: newCategoryName, type: "NEWS", status: 'ACTIVE' }
            const response = await fetchCreateNewCategory(newCategory, setaddNewCategoryButtonLoading)
            if (response) {
                if (response.status === 200) {
                    message.success(`${t("Category created successfully")}`)
                    setnewCategoryName('');
                    getCategoriesList();
                } else {
                    message.error(response.data)
                }
            } else {
                message.error(`${t("Create new category failed")}`)
            }
        } else {
            message.destroy();
            message.error(`${t("Category name is required")}!`)
        }
    };

    return (
        <div id='create-new-news'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("create-new")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("news")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("create-new")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div
                className="site-layout-background"
                style={{
                    padding: 24,
                    minHeight: 250
                }}
            >
                <Row justify="center">
                    <Col span={16}>
                        <Card>
                            <Spin spinning={loading}>
                                <Form
                                    {...layout}
                                    form={form}
                                    name="control-hooks"
                                    className='mt-3'
                                    onFinish={onFinish}
                                    onFinishFailed={onFinishFailed}
                                    initialValues={{
                                        status: "ACTIVE",
                                    }}
                                >
                                    <Form.Item
                                        label={t("Author Name")}
                                        name="authorName"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("Author Name").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder='Pindias' />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("title")}
                                        name="title"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("title").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')} />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("description")}
                                        name="subtitle"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("subtitle").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')} />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("category")}
                                        name="categoryName"
                                        rules={[{ required: true, message: `${t("please-select")} ${t("category").toLowerCase()}!` }]}
                                    >
                                        <Select
                                            placeholder={`${t("please-select")} ${t("category").toLowerCase()}`}
                                            dropdownRender={menu => (
                                                <>
                                                    {menu}
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <div className='d-flex justify-content-between' style={{ padding: '0 8px 4px' }}>
                                                        <span className='w-50'>
                                                            <Input
                                                                placeholder={t("Please input new category name")}
                                                                value={newCategoryName}
                                                                onChange={handleNewCategoryNameChange}
                                                            />
                                                        </span>
                                                        <Button loading={addNewCategoryButtonLoading} className='d-flex align-items-center' type="text" onClick={addNewCategory}>
                                                            <PlusOutlined /> {t("Add category")}
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        >
                                            {
                                                categories.map((category: any) =>
                                                    <Option key={category.id} value={category.name}>{category.name}</Option>
                                                )
                                            }
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label={t("SEO Title")}
                                        name="seoTitle"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("SEO Title").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')} />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("SEO Keywords")}
                                        name="seoKeyword"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("SEO Keywords").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')} />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("SEO description")}
                                        name="seoDescription"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("SEO description").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')} />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("content")}
                                        name="content"
                                        rules={[
                                            {
                                                required: true,
                                                message: `${t("please-input")} ${t("content").toLowerCase()}!`,
                                            },
                                            {
                                                validator: (rule: any, value: any, callback: any) => {
                                                    if (value.toHTML() === "<p></p>") {
                                                        callback(`${t("please-input")} ${t("content").toLowerCase()}!`);
                                                    } else {
                                                        callback();
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <BraftEditor
                                            language="en"
                                            style={{ border: '1px solid #ccc' }}
                                            media={{ uploadFn: myUploadFn }}

                                        />
                                    </Form.Item>

                                    <ImageUploader />

                                    <Form.Item
                                        label={t("status")}
                                        name="status"
                                        rules={[{ required: true, message: `${t("please-select")} a ${t("status").toLowerCase()}!` }]}
                                    >
                                        <Select
                                            placeholder={`${t("please-select")} a ${t("status").toLowerCase()}`}
                                        >
                                            <Option value="ACTIVE">{t("active")}</Option>
                                            <Option value="DEACTIVE">{t("inactive")}</Option>
                                        </Select>
                                    </Form.Item>

                                    <Space className='d-flex justify-content-center mt-3'>
                                        <Button type="primary" htmlType="submit">
                                            {t("create-new")}
                                        </Button>
                                        <Button htmlType="button" onClick={handleSaveDraft}>
                                            {t("save-draft")}
                                        </Button>
                                        <Button htmlType="button" onClick={onReset}>
                                            {t("reset")}
                                        </Button>
                                    </Space>
                                </Form>
                            </Spin>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default CreateNewNews