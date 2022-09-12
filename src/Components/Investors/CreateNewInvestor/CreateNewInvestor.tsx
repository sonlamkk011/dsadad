import React, { useState } from 'react'
import { Breadcrumb, Button, Card, Col, DatePicker, Form, Input, message, Row, Select, Space, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchCreateNewInvestor } from '../../../service/Investors/investors';
import ImageUploader from './ImageUploader';
import { useTranslation } from 'react-i18next';

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
        const formattedValues = { ...values, createdYear: values.createdYear.toISOString(), status: "NORMAL", thumbnail };
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

    return (
        <div id='create-new-news'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("investor-create-new")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("investor-manager")}</Breadcrumb.Item>
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
                                >
                                    <Form.Item
                                        label={t("name")}
                                        name="name"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("name").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder='Pindias' />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("phone")}
                                        name="phone"
                                        rules={[
                                            { required: true, message: `${t("please-input")} ${t("phone").toLowerCase()}!` },
                                            { pattern: /^[0-9]*$/, message: `${t("please-input")} ${t("numbers-only")}!` }
                                        ]}
                                    >
                                        <Input placeholder='0123456789' />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("location")}
                                        name="location"
                                        rules={[{ required: true, message: `${t("please-input")} ${t("location").toLowerCase()}!` }]}
                                    >
                                        <Input placeholder='Văn Khê, Khu đô thị Văn Khê, Hà Đông, Hà Nội, Việt Nam' />
                                    </Form.Item>

                                    <Form.Item
                                        className="d-flex"
                                        name="createdYear"
                                        label={t("establishDate")}
                                        rules={[
                                            {
                                                required: true,
                                                message: `${t("please-select")} ${t("establishDate").toLowerCase()}!`,
                                            },
                                        ]}
                                    >
                                        <DatePicker placeholder={`${t("please-select")} ${t("establishDate").toLowerCase()}`} style={{ width: "100%" }} />
                                    </Form.Item>

                                    <Form.Item
                                        label={t("charteredCapital")}
                                        name="charteredCapital"
                                        rules={[
                                            { required: true, message: `${t("please-input")} ${t("charteredCapital").toLowerCase()}!` },
                                            { pattern: /^[0-9]*$/, message: `${t("please-input")} ${t("numbers-only")}!` }
                                        ]}
                                    >
                                        <Input placeholder='5,000,000,000' />
                                    </Form.Item>

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

                                    <ImageUploader isReset={isReset} />

                                    <Space className='d-flex justify-content-center mt-3'>
                                        <Button type="primary" htmlType="submit">
                                            {t("create-new")}
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

export default CreateNewInvestor