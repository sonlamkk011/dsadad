import { Breadcrumb, Button, Col, DatePicker, Form, Input, message, Modal, Row, Select, Space, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchDeleteInvestorById, fetchEditInvestor, fetchGetInvestorById } from '../../../service/Investors/investors';
import moment from 'moment';
import ImageUploader from './ImageUploader';
import { t } from 'i18next';

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
    }, [checkSaveButtonDisabled]);

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
        const formattedValues = { ...values, createdYear: values.createdYear.toISOString(), status: "NORMAL", thumbnail };

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

    return (
        <div id='investor-details'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("Investor Details")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("investor-manager")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("Investor Details")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div
                className="site-layout-background"
                style={{
                    padding: 24,
                    minHeight: 250
                }}
            >
                <div>{t("investor id")}: <span>{investorId}</span></div>
                <Row justify="center">
                    <Col span={16}>
                        <Spin spinning={loading}>
                            <Form
                                {...layout}
                                form={form}
                                name="control-hooks"
                                className='mt-3'
                                onFinish={onFinish}
                                onChange={handleFormChange}
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
                                    <DatePicker
                                        onChange={() => setcheckSaveButtonDisabled(prev => !prev)}
                                        placeholder={`${t("please-select")} ${t("establishDate").toLowerCase()}`}
                                        style={{ width: "100%" }}
                                    />
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

                                <Space className='d-flex justify-content-center mt-3'>
                                    <Button disabled={isSaveButtonDisabled} type="primary" htmlType="submit">
                                        {t("save-changes")}
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

export default InvestorDetails