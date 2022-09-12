import { Breadcrumb, Button, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import BraftEditor from 'braft-editor';
import { fetchCreateNewCategory, fetchGetCategories } from '../../../service/Categories/Categories';
import { t } from 'i18next';
import { fetchDeletePost, fetchEditPost, fetchGetPostById } from '../../../service/SocialPosts/SocialPosts';
import TextEditor from './TextEditor';
import { formatHashtag, formatImageArray } from '../Helpers/Helpers';
import { FooterToolbar, PageContainer, ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { removeAllTags } from '../../../Hooks/textEditorHelper';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

function EditPost() {
    const navigate = useNavigate();
    const postId = location.pathname.split('/')[3];
    const [categories, setcategories] = useState<any>([]);
    const [postData, setpostData] = useState<any>();
    const [formLoading, setformLoading] = useState(false);
    const [form] = Form.useForm();
    const [isSaveButtonDisabled, setisSaveButtonDisabled] = useState(true);
    const [checkSaveButtonDisabled, setcheckSaveButtonDisabled] = useState(false);
    const [isReset, setisReset] = useState(false);

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    // For text editor
    const [isContentFieldError, setisContentFieldError] = useState(false);
    const [text, settext] = useState("");

    useEffect(() => {
        getPostDataById()
        getCategoriesList();
    }, [])

    useEffect(() => {
        if (postData) checkSaveButton()
    }, [checkSaveButtonDisabled, postData]);

    const getCategoriesList = async () => {
        const response = await fetchGetCategories({ size: 100, type: 'COMMUNITY', status: 'ACTIVE' })
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

    const getPostDataById = async () => {
        setformLoading(true);
        const response = await fetchGetPostById(postId, setformLoading)
        if (response) {
            if (response.status === 200) {
                const data = response.data
                const initialFormValues = {
                    ...data, ...data.detail
                }
                delete initialFormValues.detail;

                setpostData(initialFormValues);
                form.setFieldsValue(initialFormValues)
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Get post details failed'));
        }
    }

    const handleFormChange = () => {
        checkSaveButton()
    }

    const checkSaveButton = () => {
        const fieldValues = form.getFieldsValue()
        // Compare each field value with the selectedOption, if they are the same, disable the save button, otherwise enable it
        const isSame = Object.keys(fieldValues).every(key => {
            if (key === "listHashtag" || key === "images") {
                // compare two arrays
                return fieldValues[key]?.length === postData[key]?.length && fieldValues[key]?.every((value: any, index: any) => value === postData[key][index])
            } else {
                return fieldValues[key] === postData[key]
            }
        })
        isSame ? setisSaveButtonDisabled(true) : setisSaveButtonDisabled(false)
    }

    const handleSaveDraft = async () => {
        const title = form.getFieldValue("title")
        if (title && title.length) {
            const values = form.getFieldsValue();

            const images = formatImageArray(values.images)
            const formattedHashtags = values.listHashtag?.map((item: any) => formatHashtag(item))

            const detail = {
                images: images || [],
                listHashtag: formattedHashtags || [],
            }

            // turn all null values to empty string
            Object.keys(values).forEach(key => {
                if (values[key] == null) values[key] = ''
            })

            const formattedValues = {
                ...values,
                detail: JSON.stringify(detail),
                thumbnail: images[0] || "",
                status: 'DRAFT',
            };
            delete formattedValues.images;
            delete formattedValues.listHashtag;

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
        const images = formatImageArray(values.images)
        const formattedHashtags = values.listHashtag?.map((item: any) => formatHashtag(item))

        const detail = {
            images: images || [],
            listHashtag: formattedHashtags || [],
        }

        const formattedValues = {
            ...values,
            detail: JSON.stringify(detail),
            thumbnail: images[0] || "",
        };
        delete formattedValues.images;
        delete formattedValues.listHashtag;

        executePostDataToServer(formattedValues, false);
    };

    const executePostDataToServer = async (values: any, isSaveDraft: boolean) => {
        setformLoading(true);
        const response = await fetchEditPost(postId, values, setformLoading)
        if (response) {
            if (response.status === 200) {
                if (isSaveDraft) {
                    message.success(t("Save draft successfully"));
                    navigate("/posts/drafts");
                } else {
                    message.success(t('Edit post successfully'))
                    navigate(`/posts/preview/${postId}`);
                }
            } else {
                message.error(response.data)
            }
        } else {
            message.error(isSaveDraft ? t("Save as draft failed") : t('Edit post failed'))
        }
    }

    const onReset = () => {
        setisSaveButtonDisabled(true);
        form.resetFields()
        form.setFieldsValue({
            ...postData,
        })
        setisReset(!isReset);
    };

    const showDeleteConfirm = () => {
        confirm({
            title: t("single-post-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: 'danger',
            cancelText: t("no"),
            onOk() {
                executeDeletePost()
            },
        });
    };

    const executeDeletePost = async () => {
        const response = await fetchDeletePost(postId, setformLoading)
        if (response) {
            if (response.status === 200) {
                message.success(`${t("deleted")} ${t("successfully")}`);
                navigate("/posts");
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${t("deleted")} ${t("failed")}`);
        }
    }

    const handleNewCategoryNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setnewCategoryName(event.target.value);
    };

    const addNewCategory = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (newCategoryName.length) {
            setaddNewCategoryButtonLoading(true);
            const newCategory = { name: newCategoryName, type: "COMMUNITY", status: 'ACTIVE' }
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

    // For text editor
    const handleTextEditorChange = (e: any) => {
        setcheckSaveButtonDisabled(prev => !prev)
        // remove all tags and keep only text
        settext(e.replace(/<[^>]*>/g, ""));
    };

    const content = (
        <>
            <div>{t("Post ID")}: <span>{postId}</span></div>
            <Spin spinning={formLoading}>
                <ProForm
                    {...layout}
                    form={form}
                    name="control-hooks"
                    className='mt-3'
                    onFinish={onFinish}
                    onChange={handleFormChange}
                    autoFocusFirstInput={false}
                    // for fixed footer
                    submitter={{
                        render: () => {
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
                            name="description"
                            label={t("description")}
                            placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')}
                            rules={[{ required: true, message: `${t("please-input")} ${t("description").toLowerCase()}!` }]}
                            width="xl"
                        />
                    </ProForm.Group>

                    <ProForm.Item
                        className='category-select'
                        label={t("category")}
                        name="categoryId"
                        rules={[{ required: true, message: `${t("please-select")} ${t("category").toLowerCase()}!` }]}
                    >
                        <Select
                            // className='category-select'
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
                                categories?.map((category: any) =>
                                    <Option key={category.id} value={category.id}>{category.name}</Option>
                                )
                            }
                        </Select>
                    </ProForm.Item>

                    <Form.Item
                        label={t("content")}
                        className={`required-label ${isContentFieldError ? "react-quill-error" : ""}`}
                        name="content"
                        rules={[
                            {
                                required: true,
                                message: `${t("please-input")} ${t("content").toLowerCase()}!`,
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!removeAllTags(value) || removeAllTags(value).length === 0) {
                                        setisContentFieldError(true);
                                        return Promise.reject(new Error(`${t("please-input")} ${t("content").toLowerCase()}!`));
                                    }
                                    setisContentFieldError(false);
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <TextEditor
                            value={text}
                            onChange={handleTextEditorChange}
                            placeholder={t("Example content")}
                        />
                    </Form.Item>

                    <ImageUploader isReset={isReset} defaultImagesArray={postData?.images} setcheckSaveButtonDisabled={setcheckSaveButtonDisabled} />

                    <Form.Item
                        label={t("Hashtags")}
                        name="listHashtag"
                    >
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            tokenSeparators={[',']}
                            placeholder={t("Select suggested or enter new hashtags")}
                            onChange={() => setcheckSaveButtonDisabled(prev => !prev)}
                        >
                            <Option key={"#bất_động_sản"}>bất động sản</Option>
                            <Option key={"#dự_án"}>dự án</Option>
                            <Option key={"#ven_biển"}>ven biển</Option>
                            <Option key={"#mặt_đường"}>mặt đường</Option>
                        </Select>
                    </Form.Item>

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

                </ProForm>
            </Spin>
        </>
    )

    return (
        <PageContainer
            className='create-news-page'
            style={{ padding: 24, paddingBottom: 0 }}
            content={content}
        />
    )
}

export default EditPost