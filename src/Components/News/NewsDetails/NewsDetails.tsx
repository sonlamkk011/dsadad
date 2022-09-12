import { Breadcrumb, Button, Col, Collapse, Divider, Form, Input, message, Modal, Row, Select, Space, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import BraftEditor from 'braft-editor';
import { fetchDeleteNewsById, fetchEditNews, fetchGetNewsById } from '../../../service/News/news';
import { fetchCreateNewCategory, fetchGetCategories } from '../../../service/Categories/Categories';
import { t } from 'i18next';

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { confirm } = Modal;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

function NewsDetails() {
    const navigate = useNavigate();
    const newsId = location.pathname.split('/')[3];
    const [categories, setcategories] = useState<any>([]);
    const [newsData, setnewsData] = useState<any>({});
    const [loading, setloading] = useState(false);
    const [form] = Form.useForm();
    const [isSaveButtonDisabled, setisSaveButtonDisabled] = useState(true);
    const [checkSaveButtonDisabled, setcheckSaveButtonDisabled] = useState(false);
    const [isReset, setisReset] = useState(false);

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    useEffect(() => {
        getNewsDataById()
        getCategoriesList();
    }, [])

    useEffect(() => {
        checkSaveButton()
    }, [checkSaveButtonDisabled]);

    const getCategoriesList = async () => {
        const response = await fetchGetCategories({ size: 100, type: 'NEWS', status: 'ACTIVE' })
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content
                setcategories(contents);
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Get categories list failed'))
        }
    }

    const getNewsDataById = async () => {
        setloading(true);
        const response = await fetchGetNewsById(newsId, setloading)
        if (response) {
            if (response.status === 200) {
                const data = response.data
                setnewsData(data);
                const content = data.content ? BraftEditor.createEditorState(data.content) : null
                form.setFieldsValue({
                    ...data,
                    content
                })
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Get news data failed'))
        }
    }

    const handleFormChange = () => {
        checkSaveButton()
    }

    const checkSaveButton = () => {
        const fieldValues = form.getFieldsValue()
        // Compare each field value with the selectedOption, if they are the same, disable the save button, otherwise enable it
        const isSame = Object.keys(fieldValues).every(key => {
            if (key === "content") {
                return fieldValues[key]?.toHTML() == newsData[key]
            } else {
                return fieldValues[key] == newsData[key]
            }
        })
        isSame ? setisSaveButtonDisabled(true) : setisSaveButtonDisabled(false)
    }

    const handleSaveDraft = async () => {
        const title = form.getFieldValue("title")
        if (title && title.length) {
            const values = form.getFieldsValue();
            let thumbnail: any
            if (values.thumbnail && values.thumbnail.length > 0 && Array.isArray(values.thumbnail)) {
                thumbnail = values.thumbnail[0].response.result.variants[0]
            }
            const content = (values.content && values.content.toHTML() !== "<p></p>") ? values.content.toHTML() : null
            const formattedValues = {
                ...values,
                authorId: newsData.authorId,
                authorName: newsData.authorName,
                content,
                thumbnail: thumbnail || newsData.thumbnail,
                id: newsId,
            }
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
        let thumbnail: any
        if (values.thumbnail && values.thumbnail.length > 0 && Array.isArray(values.thumbnail)) {
            thumbnail = values.thumbnail[0].response.result.variants[0]
        }
        const formattedValues = {
            ...values,
            authorId: newsData.authorId,
            authorName: newsData.authorName,
            content: values.content.toHTML(),
            thumbnail: thumbnail || newsData.thumbnail,
            id: newsId,
        }
        executePostDataToServer(formattedValues, false);
    };

    const executePostDataToServer = async (values: any, isSaveDraft: boolean) => {
        setloading(true);
        const response = await fetchEditNews({ ...values, status: isSaveDraft ? "DRAFT" : values.status }, setloading)
        if (response) {
            if (response.status === 200) {
                if (isSaveDraft) {
                    message.success(t("Save draft successfully"));
                    navigate("/news/drafts");
                } else {
                    message.success(t('Edit news successfully'))
                    getNewsDataById()
                }
            } else {
                message.error(response.data)
            }
        } else {
            message.error(isSaveDraft ? t("Save as draft failed") : t('Edit news failed'))
        }
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onReset = () => {
        setisSaveButtonDisabled(true);
        form.resetFields()
        const content = newsData.content ? BraftEditor.createEditorState(newsData.content) : null
        form.setFieldsValue({
            ...newsData,
            content
        })
        setisReset(!isReset);
    };

    const showDeleteConfirm = () => {
        confirm({
            title: t("single-news-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: 'danger',
            cancelText: t("no"),
            onOk() {
                executeDeleteNews()
            },
        });
    };

    const executeDeleteNews = async () => {
        const response = await fetchDeleteNewsById(newsId, setloading)
        if (response) {
            if (response.status === 200) {
                message.success(`${t("Delete news")} ${t("successfully")}`)
                navigate('/news')
            } else {
                message.error(response.data)
            }
        } else {
            message.error(`${t("Delete news")} ${t("failed")}`)
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
        <div id='source-details'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("News Details")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("news")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("News Details")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div
                className="site-layout-background"
                style={{
                    padding: 24,
                    minHeight: 250
                }}
            >
                <div>{t("News ID")}: <span>{newsId}</span></div>
                <Row justify="center">
                    <Col span={16}>
                        <Spin spinning={loading}>
                            <Form
                                {...layout}
                                form={form}
                                name="control-hooks"
                                className='mt-3'
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                onChange={handleFormChange}
                            >
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
                                        onChange={() => setcheckSaveButtonDisabled(prev => !prev)}
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
                                        onChange={checkSaveButton}
                                    />
                                </Form.Item>

                                <ImageUploader isReset={isReset} defaultThumbnail={newsData.thumbnail} setcheckSaveButtonDisabled={setcheckSaveButtonDisabled} />

                                <Form.Item
                                    label={t("status")}
                                    name="status"
                                    rules={[{ required: true, message: `${t("please-select")} a ${t("status").toLowerCase()}!` }]}
                                >
                                    <Select
                                        placeholder={`${t("please-select")} a ${t("status").toLowerCase()}`}
                                        onChange={() => setcheckSaveButtonDisabled(prev => !prev)}
                                    >
                                        <Option value="ACTIVE">{t("active")}</Option>
                                        <Option value="DEACTIVE">{t("inactive")}</Option>
                                    </Select>
                                </Form.Item>

                                <Space className='d-flex justify-content-center mt-3'>
                                    <Button disabled={isSaveButtonDisabled} type="primary" htmlType="submit">
                                        {t("save-changes")}
                                    </Button>
                                    <Button htmlType="button" onClick={handleSaveDraft}>
                                        {t("save-draft")}
                                    </Button>
                                    <Button htmlType="button" onClick={onReset}>
                                        {t("reset")}
                                    </Button>
                                    <Button danger onClick={showDeleteConfirm} >
                                        {t("delete")}
                                    </Button>
                                </Space>
                            </Form>
                        </Spin>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default NewsDetails