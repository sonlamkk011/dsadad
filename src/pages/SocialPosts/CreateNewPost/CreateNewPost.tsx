import React, { useEffect, useState } from 'react'
import { FooterToolbar } from '@ant-design/pro-components';
import { PageContainer, ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import { Button, Divider, Form, Input, message, Select, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { fetchGetCategories, fetchCreateNewCategory } from '../../../service/Categories/Categories';
import { myUploadFn } from '../../../Hooks/braftEditorHelper';
import BraftEditor from 'braft-editor';
import { removeAllTags } from '../../../Hooks/textEditorHelper';
import { useSelector } from 'react-redux';
import ImageUploader from './ImageUploader';
import { accountInfoSelector } from '../../../Features/selectors';
import { t } from 'i18next';
import { fetchCreateNewNews } from '../../../service/News/news';
import { useNavigate } from 'react-router-dom';
import { formatHashtag, formatImageArray } from '../Helpers/Helpers';
import { fetchCreateNewPost } from '../../../service/SocialPosts/SocialPosts';
import TextEditor from './TextEditor';

const { Option } = Select;

function CreateNewPost() {
    const navigate = useNavigate();
    const accountInfo: any = useSelector(accountInfoSelector)
    const [accountName, setaccountName] = useState("");
    const [categories, setcategories] = useState<any>([]);
    const [formLoading, setformLoading] = useState(false);
    const [isReset, setisReset] = useState(false);
    const [form] = Form.useForm();

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    // For text editor
    const [isContentFieldError, setisContentFieldError] = useState(false);
    const [text, settext] = useState("");

    useEffect(() => {
        if (accountInfo) {
            const nameArray = []
            if (accountInfo.firstName) nameArray.push(accountInfo.firstName);
            if (accountInfo.lastName) nameArray.push(accountInfo.lastName);
            const userName = nameArray.join(' ');
            setaccountName(userName);
            form.setFieldsValue({
                accountName: userName
            })
        }
    }, [accountInfo]);

    useEffect(() => {
        getCategoriesList();
    }, []);

    const getCategoriesList = async () => {
        const response = await fetchGetCategories({ size: 100, type: 'COMMUNITY', status: 'ACTIVE' })
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content
                form.setFieldsValue({ categoryId: contents[0].id })
                setcategories(contents);
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Get categories list failed'))
        }
    }

    const handleSaveDraft = () => {
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

        // console.log(formattedValues);

        executePostDataToServer(formattedValues, false);
    };

    const executePostDataToServer = async (values: any, isDraft: boolean) => {
        setformLoading(true);
        const response = await fetchCreateNewPost(values, setformLoading)
        if (response) {
            if (response.status === 200) {
                if (isDraft) {
                    message.success(t('Save draft successfully'));
                    navigate('/posts/drafts')
                } else {
                    message.success(t('Create new post successfully'));
                    navigate('/posts/list')
                }
            } else {
                message.error(response.data)
            }
        } else {
            message.error(isDraft ? t("Save as draft failed") : t(`Create new post failed`))
        }
    }

    const onReset = () => {
        form.resetFields();
        form.setFieldsValue({
            accountName: accountName,
            categoryId: categories[0].id
        })
        setisReset(prev => !prev);
    };

    // For add new category
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
        // remove all tags and keep only text
        settext(e.replace(/<[^>]*>/g, ""));
    };

    const content = (
        <Spin spinning={formLoading}>
            <ProForm
                form={form}
                onFinish={onFinish}
                // for fixed footer
                submitter={{
                    render: (_, dom) => {
                        return (
                            <FooterToolbar>
                                <Button htmlType="button" onClick={onReset}>
                                    {t("reset")}
                                </Button>
                                <Button htmlType="button" onClick={handleSaveDraft}>
                                    {t("save-draft")}
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    {t("create-new")}
                                </Button>
                            </FooterToolbar>
                        )
                    },
                }}
                autoFocusFirstInput
                initialValues={{
                    status: 'ACTIVE',
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

                <ImageUploader isReset={isReset} />

                <ProForm.Item
                    label={t("Hashtags")}
                    name="listHashtag"
                >
                    <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        tokenSeparators={[',']}
                        placeholder={t("Select suggested or enter new hashtags")}
                    >
                        <Option key={"#bất_động_sản"}>#bất_động_sản</Option>
                        <Option key={"#dự_án"}>#dự_án</Option>
                        <Option key={"#ven_biển"}>#ven_biển</Option>
                        <Option key={"#mặt_đường"}>#mặt_đường</Option>
                    </Select>
                </ProForm.Item>

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
            className='create-news-page'
            style={{ padding: 24, paddingBottom: 0 }}
            content={content}
        />
    )
}

export default CreateNewPost