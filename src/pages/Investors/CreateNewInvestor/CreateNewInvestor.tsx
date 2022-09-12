import React, { useState } from 'react'
import { Breadcrumb, Button, Card, Col, DatePicker, Form, Input, message, Row, Select, Space, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchCreateNewInvestor } from '../../../service/Investors/investors';
import ImageUploader from './ImageUploader';
import { useTranslation } from 'react-i18next';
import { FooterToolbar, PageContainer, ProForm, ProFormDatePicker, ProFormMoney, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

function CreateNewInvestor() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setloading] = useState(false);
    const [isReset, setisReset] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setloading(true);
        const thumbnail = values.thumbnail ? values.thumbnail[0].response.result.variants[0] : null
        const formattedValues = { ...values, createdYear: moment(values.createdYear).format('YYYY-MM-DDTHH:mm:ss.SSS'), status: "NORMAL", thumbnail };
        const response = await fetchCreateNewInvestor(formattedValues, setloading)
        if (response) {
            if (response.status === 200) {
                message.success('Create new investor successfully');
                navigate('/investor')
            } else {
                message.error(response.data)
            }
        } else {
            message.error('Create new investor failed')
        }
    };

    const onReset = () => {
        form.resetFields();
        setisReset(prev => !prev);
    };

    const content = (
        <Spin spinning={loading}>
            <ProForm
                {...layout}
                form={form}
                onFinish={onFinish}
                autoFocusFirstInput
                // for fixed footer
                submitter={{
                    render: (_, dom) => {
                        return (
                            <FooterToolbar>
                                <Button htmlType="button" onClick={onReset}>
                                    {t("reset")}
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    {t("create-new")}
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
                        labelCol={{span: 8}}
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
                    rules={[
                        { required: true, message: `${t("please-input")} ${t("charteredCapital").toLowerCase()}!` },
                    ]}
                />

                <ProFormTextArea
                    name="description"
                    label={t("description")}
                    placeholder='Pindias là siêu ứng dụng kết nối, quản lý, giao dịch tài sản số hóa được ứng dụng trên công nghệ blockchain cho phép số hóa các tài sản bất động sản vật lý thành tài sản số thông qua các hợp đồng thông minh (smart contracts).'
                    rules={[{ required: true, message: `${t("please-input")} ${t("description").toLowerCase()}!` }]}
                    width="xl"
                />

                <ProFormSelect
                    name="field"
                    label={t("field")}
                    width="sm"
                    valueEnum={{
                        SELL: t("sell"),
                        RENT: t("rent"),
                    }}
                    placeholder={`${t("please-select")} ${t("field").toLowerCase()}`}
                    rules={[{ required: true, message: `${t("please-select")} ${t("field").toLowerCase()}!` }]}
                    allowClear={false}
                />

                <ProFormText
                    name="website"
                    label={t("website")}
                    placeholder='http://vn.pindias.com/'
                    rules={[{ required: true, message: `${t("please-input")} ${t("website").toLowerCase()}!` }]}
                    width="xl"
                />

                <ImageUploader isReset={isReset} />

            </ProForm>
        </Spin>
    )

    return (
        <PageContainer
            className='create-new-investor-page'
            style={{ padding: 24, paddingBottom: 0 }}
            content={content}
        />
    )
}

export default CreateNewInvestor