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

const { Option } = Select;

function CreateNewNews() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const accountInfo: any = useSelector(accountInfoSelector)
    const [categories, setcategories] = useState<any>();
    const [categoriesObj, setcategoriesObj] = useState();
    const [userName, setuserName] = useState("");
    const [isReset, setisReset] = useState(false);
    const [formLoading, setformLoading] = useState(false);

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    useEffect(() => {
        getNewsCategories()
    }, []);

    useEffect(() => {
        if (accountInfo) {
            const userName = [accountInfo.firstName, accountInfo.lastName].join(" ")
            setuserName(userName);
            form.setFieldsValue({
                authorName: userName
            })
        }
    }, [accountInfo]);

    const getNewsCategories = async () => {
        setformLoading(true);
        const filters = { size: 100, type: "NEWS", status: "ACTIVE" };
        const response = await fetchGetCategories(filters, setformLoading);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                const categoriesObj = contents.reduce((obj: any, category: any) => {
                    obj[category.name] = category.name;
                    return obj;
                }, {});
                setcategories(contents)
                setcategoriesObj(categoriesObj);
                form.setFieldsValue({
                    categoryName: contents[0].name
                })
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t('Get categories list failed'))
        }
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
                    getNewsCategories();
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

    const handleSaveDraft = async () => {
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
        setformLoading(true);
        const response = await fetchCreateNewNews({ ...values, status: isSaveDraft ? "DRAFT" : values.status }, setformLoading)
        if (response) {
            if (response.status === 200) {
                if (isSaveDraft) {
                    message.success(t("Save draft successfully"));
                    navigate("/news/drafts");
                } else {
                    message.success(t("Create news successfully"))
                    navigate('/news/list')
                }
            } else {
                message.error(response.data)
            }
        } else {
            message.error(isSaveDraft ? t("Save as draft failed") : t('Create news failed'))
        }
    }

    const onReset = () => {
        form.resetFields();
        form.setFieldsValue({
            authorName: userName,
            categoryName: categories[0].name
        })
        setisReset(prev => !prev)
    }

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

                <ProFormText
                    width="md"
                    name="authorName"
                    required
                    dependencies={[['contract', 'name']]}
                    label={t("Author Name")}
                    placeholder='Pindias'
                    rules={[{ required: true, message: `${t("please-input")} ${t("Author Name").toLowerCase()}!` }]}
                />

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

                <ImageUploader isReset={isReset} />

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

export default CreateNewNews