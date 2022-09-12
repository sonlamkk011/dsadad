import { Breadcrumb, Button, Col, Collapse, Divider, Form, Input, message, Modal, Row, Select, Space, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import BraftEditor from 'braft-editor';
import { fetchDeleteNewsById, fetchEditNews, fetchGetNewsById } from '../../../service/News/news';
import { fetchCreateNewCategory, fetchGetCategories } from '../../../service/Categories/Categories';
import { t } from 'i18next';
import { FooterToolbar, PageContainer, ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { removeAllTags } from '../../../Hooks/textEditorHelper';
import { myUploadFn } from '../../../Hooks/braftEditorHelper';

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { confirm } = Modal;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

function EditNews() {
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

    const content = (
        <Spin spinning={loading}>
            <ProForm
                {...layout}
                form={form}
                name="control-hooks"
                className='mt-3'
                onFinish={onFinish}
                onChange={handleFormChange}
                // for fixed footer
                submitter={{
                    render: (_, dom) => {
                        return (
                            <FooterToolbar>
                                <Button danger onClick={showDeleteConfirm} >
                                    {t("delete")}
                                </Button>
                                <Button htmlType="button" onClick={onReset}>
                                    {t("reset")}
                                </Button>
                                <Button htmlType="button" onClick={handleSaveDraft}>
                                    {t("save-draft")}
                                </Button>
                                <Button disabled={isSaveButtonDisabled} type="primary" htmlType="submit">
                                    {t("save-changes")}
                                </Button>
                            </FooterToolbar>
                        )
                    },
                }}
            >
                <ProForm.Group>
                    <ProFormText
                        name="title"
                        required
                        label={t("title")}
                        placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')}
                        rules={[{ required: true, message: `${t("please-input")} ${t("title").toLowerCase()}!` }]}
                        width="xl"
                    />
                    <ProFormTextArea
                        name="subtitle"
                        label={t("description")}
                        placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')}
                        rules={[{ required: true, message: `${t("please-input")} ${t("subtitle").toLowerCase()}!` }]}
                        width="xl"
                        allowClear
                    />
                </ProForm.Group>

                <ProForm.Item
                    className='category-select'
                    label={t("category")}
                    name="categoryName"
                    rules={[{ required: true, message: `${t("please-select")} ${t("category").toLowerCase()}!` }]}
                >
                    <Select
                        // className='category-select'
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
                            categories?.map((category: any) =>
                                <Option key={category.id} value={category.name}>{category.name}</Option>
                            )
                        }
                    </Select>
                </ProForm.Item>

                <ProForm.Group>
                    <ProFormText
                        name="seoTitle"
                        required
                        label={t("SEO Title")}
                        placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')}
                        rules={[{ required: true, message: `${t("please-input")} ${t("SEO Title").toLowerCase()}!` }]}
                        width="xl"
                    />
                    <ProFormText
                        name="seoKeyword"
                        required
                        label={t("SEO Keywords")}
                        placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')}
                        rules={[{ required: true, message: 'This is required' }]}
                        width="xl"
                    />
                    <ProFormText
                        name="seoDescription"
                        required
                        label={t("SEO description")}
                        placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')}
                        rules={[{ required: true, message: 'This is required' }]}
                        width="xl"
                    />
                </ProForm.Group>

                <ProForm.Item
                    label="Content"
                    name="content"
                    rules={[
                        {
                            required: true,
                            message: "",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const valueToHTML = value?.toHTML()
                                if (!removeAllTags(valueToHTML) || removeAllTags(valueToHTML).length === 0) {
                                    return Promise.reject(new Error("Please input content"));
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    <BraftEditor
                        language="en"
                        style={{ border: '1px solid #ccc' }}
                        media={{ uploadFn: myUploadFn }}

                    />
                </ProForm.Item>

                <ImageUploader isReset={isReset} defaultThumbnail={newsData.thumbnail} setcheckSaveButtonDisabled={setcheckSaveButtonDisabled} />

                <ProFormSelect
                    name="status"
                    label={t("status")}
                    width="sm"
                    valueEnum={{
                        ACTIVE: t("active"),
                        DEACTIVE: t("inactive"),
                    }}
                    placeholder={`${t("please-select")} a ${t("status").toLowerCase()}`}
                    rules={[{ required: true, message: `${t("please-select")} a ${t("status").toLowerCase()}!` }]}
                    allowClear={false}
                />

            </ProForm>
        </Spin>
    )

    return (
        <PageContainer
            className='edit-news-page'
            style={{ padding: 24, paddingBottom: 0 }}
            content={content}
        />
    )
}

export default EditNews