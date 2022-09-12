import { Breadcrumb, Button, Col, DatePicker, Form, Input, message, Modal, Row, Select, Space, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchDeleteInvestorById, fetchEditInvestor, fetchGetInvestorById } from '../../../service/Investors/investors';
import moment from 'moment';
import ImageUploader from './ImageUploader';
import { t } from 'i18next';
import { FooterToolbar, PageContainer, ProForm, ProFormDatePicker, ProFormMoney, ProFormText } from '@ant-design/pro-components';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

function InvestorDetails() {
    const navigate = useNavigate();
    const investorId = location.pathname.split('/')[3];
    const [investorData, setinvestorData] = useState<any>({});
    const [loading, setloading] = useState(false);
    const [form] = Form.useForm();
    const [isSaveButtonDisabled, setisSaveButtonDisabled] = useState(true);
    const [checkSaveButtonDisabled, setcheckSaveButtonDisabled] = useState(false);

    const [isReset, setisReset] = useState(false);

    useEffect(() => {
        getInvestorDataById()
    }, [])

    useEffect(() => {
        checkSaveButton()
    }, [investorData, checkSaveButtonDisabled]);

    const getInvestorDataById = async () => {
        setloading(true);
        const response = await fetchGetInvestorById(investorId, setloading)
        if (response) {
            if (response.status === 200) {
                const data = response.data
                setinvestorData(data);
                form.setFieldsValue({
                    ...data, createdYear: moment(data.createdYear)
                })
            } else {
                message.error(response.data)
            }
        } else {
            message.error('Get investor data by id failed')
        }
    }

    const handleFormChange = () => {
        checkSaveButton()
    }

    const checkSaveButton = () => {
        const fieldValues = form.getFieldsValue()
        // Compare each field value with the selectedOption, if they are the same, disable the save button, otherwise enable it
        const isSame = Object.keys(fieldValues).every(key => {
            if (key === "createdYear") {
                return moment(fieldValues[key]).format("YYYY-MM-DD") == moment(investorData[key]).format("YYYY-MM-DD")
            } else {
                return fieldValues[key] == investorData[key]
            }
        })
        isSame ? setisSaveButtonDisabled(true) : setisSaveButtonDisabled(false)
    }

    const onFinish = async (values: any) => {
        setloading(true);
        let thumbnail = values.thumbnail
        if (values.thumbnail) {
            if (Array.isArray(values.thumbnail)) {
                thumbnail = values.thumbnail[0].response.result.variants[0]
            }
        }
        const formattedValues = { ...values, createdYear: moment(values.createdYear).format('YYYY-MM-DDTHH:mm:ss.SSS'), status: "NORMAL", thumbnail };
        const response = await fetchEditInvestor(investorId, formattedValues, setloading)
        if (response) {
            if (response.status === 200) {
                message.success(t('Edit investor successfully'))
                getInvestorDataById()
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Edit investor failed'))
        }
    };

    const onReset = () => {
        form.setFieldsValue({
            ...investorData, createdYear: moment(investorData.createdYear)
        })
        setisSaveButtonDisabled(true);
        setisReset(prev => !prev);
    };

    const showDeleteConfirm = () => {
        confirm({
            title: t("this-investor-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: 'danger',
            cancelText: t("no"),
            width: 450,
            onOk() {
                executeDeleteInvestor()
            },
        });
    };

    const executeDeleteInvestor = async () => {
        const response = await fetchDeleteInvestorById(investorId, setloading)
        if (response) {
            if (response.status === 200) {
                message.success(t("Delete investor successfully"))
                navigate('/investor')
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t("Delete investor failed"))
        }
    }

    const content = (
        <Spin spinning={loading}>
            <ProForm<any>
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
                        name="name"
                        required
                        label={t("name")}
                        placeholder='Pindias'
                        rules={[{ required: true, message: `${t("please-input")} ${t("name").toLowerCase()}!` }]}
                        width="xl"
                    />
                    <ProFormText
                        name="phone"
                        label={t("phone")}
                        placeholder='0123456789'
                        rules={[
                            { required: true, message: `${t("please-input")} ${t("phone").toLowerCase()}!` },
                            { pattern: /^[0-9]*$/, message: `${t("please-input")} ${t("numbers-only")}!` }
                        ]}
                        width="xl"
                    />
                </ProForm.Group>

                <ProFormText
                    name="location"
                    label={t("location")}
                    placeholder='Văn Khê, Khu đô thị Văn Khê, Hà Đông, Hà Nội, Việt Nam'
                    rules={[{ required: true, message: `${t("please-input")} ${t("location").toLowerCase()}!` }]}
                    width="xl"
                />

                <ProFormDatePicker
                    name="createdYear"
                    label={t("establishDate")}
                    // @ts-ignore
                    onChange={() => setcheckSaveButtonDisabled(prev => !prev)}
                    width="md"
                    rules={[
                        {
                            required: true,
                            message: `${t("please-select")} ${t("establishDate").toLowerCase()}!`,
                        },
                    ]}
                    placeholder={`${t("please-select")} ${t("establishDate").toLowerCase()}`}
                />

                <ProFormMoney
                    label={t("charteredCapital")}
                    name="charteredCapital"
                    fieldProps={{
                        precision: 2,
                        prefix: "VND",
                        formatter: (value) => {
                            return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        },
                    }}
                    customSymbol="VND"
                    placeholder='5,000,000,000'
                    // @ts-ignore
                    onChange={() => setcheckSaveButtonDisabled(prev => !prev)}
                    rules={[
                        { required: true, message: `${t("please-input")} ${t("charteredCapital").toLowerCase()}!` },
                    ]}
                />

                <Form.Item
                    label={t("description")}
                    name="description"
                    rules={[{ required: true, message: `${t("please-input")} ${t("description").toLowerCase()}!` }]}
                >
                    <TextArea rows={4} placeholder='Pindias là siêu ứng dụng kết nối, quản lý, giao dịch tài sản số hóa được ứng dụng trên công nghệ blockchain cho phép số hóa các tài sản bất động sản vật lý thành tài sản số thông qua các hợp đồng thông minh (smart contracts).' />
                </Form.Item>

                <Form.Item
                    label={t("field")}
                    name="field"
                    rules={[{ required: true, message: `${t("please-select")} ${t("field").toLowerCase()}!` }]}
                >
                    <Select
                        placeholder={`${t("please-select")} ${t("field").toLowerCase()}`}
                        onChange={() => setcheckSaveButtonDisabled(prev => !prev)}
                    >
                        <Option value="SELL">{t("sell")}</Option>
                        <Option value="RENT">{t("rent")}</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label={t("website")}
                    name="website"
                    rules={[{ required: true, message: `${t("please-input")} ${t("website").toLowerCase()}!` }]}
                >
                    <Input placeholder='http://vn.pindias.com/' />
                </Form.Item>

                <ImageUploader isReset={isReset} defaultThumbnail={investorData.thumbnail} />

            </ProForm>
        </Spin>
    )

    return (
        <PageContainer
            className='edit-investor-page'
            style={{ padding: 24, paddingBottom: 0 }}
            content={content}
        />
    )
}

export default InvestorDetails