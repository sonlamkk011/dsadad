import React, { useEffect, useState } from 'react'
import { Breadcrumb, Button, Card, Col, DatePicker, Divider, Form, Input, message, Row, Select, Space, Spin, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchCreateNewPost } from '../../../service/SocialPosts/SocialPosts';
import { useSelector } from 'react-redux';
import { accountInfoSelector } from '../../../Features/selectors';
import BraftEditor from 'braft-editor';
import { fetchCreateNewCategory, fetchGetCategories } from '../../../service/Categories/Categories';
import { t } from 'i18next';
import TextEditor from "./TextEditor";
import ImageUploader from './ImageUploader';
import { formatHashtag, formatImageArray } from '../Helpers/Helpers';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

function CreateNewPost() {
    const navigate = useNavigate();
    const accountInfo: any = useSelector(accountInfoSelector)
    const [accountName, setaccountName] = useState("");
    const [categories, setcategories] = useState<any>([]);
    const [loading, setloading] = useState(false);
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

        executePostDataToServer(formattedValues, false);
    };

    const executePostDataToServer = async (values: any, isDraft: boolean) => {
        setloading(true);
        const response = await fetchCreateNewPost(values, setloading)
        if (response) {
            if (response.status === 200) {
                if (isDraft) {
                    message.success(t('Save draft successfully'));
                    navigate('/posts/drafts')
                } else {
                    message.success(t('Create new post successfully'));
                    navigate('/posts')
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

    return (
        <div id='create-new-post'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("create-new")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("social-post")}</Breadcrumb.Item>
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
                                    initialValues={{
                                        status: "DEACTIVE"
                                    }}
                                >
                                    <Form.Item
                                        label={t("title")}
                                        name="title"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("title").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')} />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("category")}
                                        name="categoryId"
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
                                                    <Option key={category.id} value={category.id}>{category.name}</Option>
                                                )
                                            }
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label={t("description")}
                                        name="description"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("description").toLowerCase()}!` }]}
                                    >
                                        <TextArea rows={2} placeholder={t('Investor Hoa Tien Paradise cooperates with Landmarks to change the appearance of the project')} />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("content")}
                                        className={`required-label ${isContentFieldError ? "react-quill-error" : ""}`}
                                        name="content"
                                        rules={[
                                            {
                                                required: true,
                                                message: `${t("please-input")} ${t("content").toLowerCase()}!`,
                                            },
                                            {
                                                // at least 1 characters excluding tags like <p>, <h1>, <h2>, ...
                                                validator: (rule: any, value: any, callback: any) => {
                                                    if (value && value.replace(/<[^>]*>/g, "").length < 1) {
                                                        setisContentFieldError(true);
                                                        callback(`${t("please-input")} ${t("content").toLowerCase()}!`);
                                                    } else {
                                                        setisContentFieldError(false);
                                                        callback();
                                                    }
                                                },
                                            },
                                        ]}
                                    >
                                        <TextEditor
                                            value={text}
                                            onChange={handleTextEditorChange}
                                            placeholder={t("Example content")}
                                        />
                                    </Form.Item>

                                    <ImageUploader isReset={isReset} />

                                    <Form.Item
                                        label={t("Hashtags")}
                                        name="listHashtag"
                                    >
                                        <Select
                                            mode="tags"
                                            style={{ width: '100%' }}
                                            tokenSeparators={[',']}
                                            placeholder={t("Select suggested or enter new hashtags")}
                                        >
                                            <Option key={"#bất_động_sản"}>#bất động sản</Option>
                                            <Option key={"#dự_án"}>#dự án</Option>
                                            <Option key={"#ven_biển"}>#ven biển</Option>
                                            <Option key={"#mặt_đường"}>#mặt đường</Option>
                                        </Select>
                                    </Form.Item>

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

export default CreateNewPost