import { Button, Cascader, Divider, Form, Input, message, Select, Space, Spin } from 'antd';
import { CaretRightOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchEditSource, fetchGetSourcesAndPaths } from '../../../service/Sources/sources';
import { fetchCreateNewCategory } from '../../../service/Categories/Categories';
import { t } from 'i18next';

const { Option } = Select;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

function EditActivateSourceTab({ categories, getCategories }: any) {
    const navigate = useNavigate();
    const [sourcesData, setsourcesData] = useState<any>([]);
    const [options, setoptions] = useState<any>([]);
    const [selectedOption, setselectedOption] = useState<any>({});
    const [isSaveButtonDisabled, setisSaveButtonDisabled] = useState(true);
    const [checkSaveButtonDisabled, setcheckSaveButtonDisabled] = useState(false);
    const [loading, setloading] = useState(false);

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    const [form] = Form.useForm();

    useEffect(() => {
        getSourcesAndPaths()
    }, []);

    useEffect(() => {
        const fieldValues = form.getFieldsValue()
        if (fieldValues && fieldValues.domainAndPath) {
            const newFormValues = { ...fieldValues, linkHomepage: fieldValues.domainAndPath[0], path: fieldValues.domainAndPath[1] }
            delete newFormValues.domainAndPath
            // Compare each field value with the selectedOption, if they are the same, disable the save button, otherwise enable it
            const isSame = Object.keys(newFormValues).every(key => newFormValues[key] == selectedOption[key])
            isSame ? setisSaveButtonDisabled(true) : setisSaveButtonDisabled(false)
        }
    }, [checkSaveButtonDisabled]);

    const getSourcesAndPaths = async () => {
        const response = await fetchGetSourcesAndPaths()
        if (response) {
            if (response.status === 200) {
                const data = response.data
                setsourcesData(data);
                // Make an array of options for the Cascader
                setoptions(data.map((item: any) => {
                    return {
                        value: item.source,
                        label: item.source,
                        children: item.sourceCrawls.map((sourceCrawlData: any) => {
                            return {
                                value: sourceCrawlData.path,
                                label: sourceCrawlData.path
                            }
                        })
                    }
                }))
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Get sources and paths failed'))
        }
    }

    const onFinish = async (values: any) => {
        setloading(true);
        let newValues = { ...selectedOption, ...values }
        if (selectedOption.selectorDetail) newValues = { ...newValues, ...JSON.parse(selectedOption.selectorDetail) }
        // remove the unnecessary fields
        delete newValues.domainAndPath
        delete newValues.selectorDetail
        delete newValues.createdAt
        delete newValues.createdBy
        delete newValues.updatedAt
        delete newValues.updatedBy

        // remove all null values
        const newValuesWithoutNull = Object.keys(newValues).reduce((obj: any, key: any) => {
            if (newValues[key] !== null) {
                obj[key] = newValues[key];
            }
            return obj;
        }, {});

        const response = await fetchEditSource(newValuesWithoutNull, setloading)
        if (response) {
            if (response.status === 200) {
                message.success(t('Source updated successfully'))
                setselectedOption(newValuesWithoutNull)
                setisSaveButtonDisabled(true)
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Edit source failed'))
        }
    };

    const onReset = () => {
        setisSaveButtonDisabled(true);
        form.resetFields();
    };

    const displayRender = (labels: string[]) => {
        return (
            <div className='d-flex align-items-center'>
                <span className='me-2' style={{ fontStyle: 'italic' }}>{labels[0]}</span> <CaretRightOutlined /> <span className='ms-2' style={{ fontStyle: 'italic' }}>{labels[1]}</span>
            </div>
        )
    }
    const handleCascaderChange = (value: any) => {
        const selectedSource = sourcesData.find((sourceData: any) => sourceData.source === value[0]);
        const selectedSourceCrawl = selectedSource.sourceCrawls.find((sourceCrawlData: any) => sourceCrawlData.path === value[1]);
        if (selectedSourceCrawl) {
            setselectedOption(selectedSourceCrawl);
            form.setFieldsValue({ ...selectedSourceCrawl });
            setcheckSaveButtonDisabled(state => !state);
        }
    }

    // For add new category
    const handleNewCategoryNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setnewCategoryName(event.target.value);
    };

    const addNewCategory = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (newCategoryName.length) {
            setaddNewCategoryButtonLoading(true);
            const newCategory = { name: newCategoryName, type: "REAL_ESTATE", status: 'ACTIVE' }
            const response = await fetchCreateNewCategory(newCategory, setaddNewCategoryButtonLoading)
            if (response) {
                if (response.status === 200) {
                    message.success(`${t("Category created successfully")}`)
                    setnewCategoryName('');
                    getCategories();
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
        <Spin spinning={loading}>
            <Form
                {...layout}
                form={form}
                // layout="vertical"
                labelCol={{ span: 6 }}
                name="control-hooks"
                className='mt-3'
                onFinish={onFinish}
            >
                <Form.Item
                    label={t("Domain & path")}
                    name="domainAndPath"
                    rules={[{ required: true, message: `${t("please-select")} ${t("Domain & path").toLowerCase()}!` }]}
                >
                    <Cascader
                        allowClear={false}
                        options={options}
                        displayRender={displayRender}
                        onChange={handleCascaderChange}
                        placeholder={`${t("please-select")} ${t("Domain & path").toLowerCase()}`}
                    />
                </Form.Item>

                <Form.Item
                    label={t("Source Name")}
                    name="name"
                    rules={[{ required: true, message: `${t("please-input")} ${t("Source Name").toLowerCase()}!` }]}
                >
                    <Input placeholder={t("real-estate")} onChange={() => setcheckSaveButtonDisabled(state => !state)} />
                </Form.Item>

                <Form.Item
                    label={t("category")}
                    name="categoryName"
                    rules={[
                        {
                            required: true,
                            message: `${t("please-select")} ${t("category").toLowerCase()}!`,
                        }
                    ]}
                >
                    <Select
                        placeholder={`${t("please-select")} ${t("category").toLowerCase()}`}
                        onChange={() => setcheckSaveButtonDisabled(state => !state)}
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
                    label={t("status")}
                    name="status"
                >
                    <Select
                        placeholder={`${t("please-select")} ${t("status").toLowerCase()}`}
                        onChange={() => setcheckSaveButtonDisabled(state => !state)}
                    >
                        <Option value="ACTIVE">{t("active")}</Option>
                        <Option value="DEACTIVE">{t("inactive")}</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label={t("Crawl Time")}
                    name="crawlTime"
                >
                    <Select
                        placeholder={`${t("please-select")} ${t("Crawl Time").toLowerCase()}`}
                        onChange={() => setcheckSaveButtonDisabled(state => !state)}
                    >
                        <Option value={5}>{t("Every")} 5 {t("minutes")}</Option>
                        <Option value={10}>{t("Every")} 10 {t("minutes")}</Option>
                        <Option value={30}>{t("Every")} 30 {t("minutes")}</Option>
                        <Option value={60}>{t("Every")} 1 {t("hour")}</Option>
                        <Option value={360}>{t("Every")} 6 {t("hours")}</Option>
                        <Option value={720}>{t("Every")} 12 {t("hours")}</Option>
                        <Option value={1440}>{t("Every")} 24 {t("hours")}</Option>
                    </Select>
                </Form.Item>

                <Space className='d-flex justify-content-center mt-3'>
                    <Button disabled={isSaveButtonDisabled} type="primary" htmlType="submit">
                        {t("save-changes")}
                    </Button>
                    <Button htmlType="button" onClick={onReset}>
                        {t("reset")}
                    </Button>
                </Space>
            </Form>
        </Spin>
    )
}

export default EditActivateSourceTab