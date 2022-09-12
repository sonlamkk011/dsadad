import { Breadcrumb, Button, Col, Collapse, Form, Input, message, Modal, Row, Select, Space, Spin, Switch, Typography } from 'antd';
import type { InputRef } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react'
import { fetchGetCategories } from '../../../service/Sources/categories';
import { fetchDeleteSourceById, fetchEditSource, fetchGetSourceById, fetchRunCronJobManually } from '../../../service/Sources/sources';
import { useNavigate } from 'react-router-dom';
import LinkPreview from '../CreateNew/ConfigureSourceTab/LinkPreview';
import DetailsPreview from '../CreateNew/ConfigureSourceTab/DetailsPreview';
import { formatDomainPath } from '../../../Hooks/DomainPathFormatter';
import { t } from 'i18next';
import { handlePurpose } from '../../../Hooks/NameHandler';

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { confirm } = Modal;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

function SourceDetails() {
    const navigate = useNavigate();
    const sourceId = location.pathname.split('/')[3];
    const [categories, setcategories] = useState<any>([]);
    const [sourceData, setsourceData] = useState<any>({});
    const [loading, setloading] = useState(false);
    const [form] = Form.useForm();
    const [isSaveButtonDisabled, setisSaveButtonDisabled] = useState(true);
    const [checkSaveButtonDisabled, setcheckSaveButtonDisabled] = useState(false);
    const [isInfiniteCrawl, setisInfiniteCrawl] = useState(false);

    const articleURLInputRef = useRef<InputRef>(null);
    const titleInputRef = useRef<InputRef>(null);
    const descriptionInputRef = useRef<InputRef>(null);
    const thumbnailInputRef = useRef<InputRef>(null);
    const imagesInputRef = useRef<InputRef>(null);
    const areaInputRef = useRef<InputRef>(null);
    const locationInputRef = useRef<InputRef>(null);
    const priceInputRef = useRef<InputRef>(null);
    const bathsInputRef = useRef<InputRef>(null);
    const bedsInputRef = useRef<InputRef>(null);
    const mobileContactInputRef = useRef<InputRef>(null);
    const nameContactInputRef = useRef<InputRef>(null);
    const directionInputRef = useRef<InputRef>(null);
    const startDateInputRef = useRef<InputRef>(null);
    const endDateInputRef = useRef<InputRef>(null);
    const dateTimeFormatInputRef = useRef<InputRef>(null);

    const refs = { articleURLInputRef, titleInputRef, descriptionInputRef, thumbnailInputRef, imagesInputRef, areaInputRef, locationInputRef, priceInputRef, bathsInputRef, bedsInputRef, mobileContactInputRef, nameContactInputRef, directionInputRef, startDateInputRef, endDateInputRef, dateTimeFormatInputRef };

    useEffect(() => {
        getSourceDataById()
    }, [])

    useEffect(() => {
        getCategories()
    }, []);

    useEffect(() => {
        checkSaveButton()
    }, [checkSaveButtonDisabled]);

    const getCategories = async () => {
        const response = await fetchGetCategories()
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content
                setcategories(contents);
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t("Get categories list failed"));
        }
    }

    const getSourceDataById = async () => {
        setloading(true);
        const response = await fetchGetSourceById(sourceId, setloading)
        if (response) {
            if (response.status === 200) {
                const data = response.data
                setisInfiniteCrawl(data.infinityCrawl)
                setsourceData(data);
                form.setFieldsValue({
                    ...data,
                    ...data.selectorDetail
                })
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Get source data failed'))
        }
    }

    const handleFormChange = () => {
        checkSaveButton()
    }

    const checkSaveButton = () => {
        const fieldValues = form.getFieldsValue()
        // Compare each field value with the selectedOption, if they are the same, disable the save button, otherwise enable it
        const isSame = Object.keys(fieldValues).every(key => fieldValues[key] == sourceData[key])
        isSame ? setisSaveButtonDisabled(true) : setisSaveButtonDisabled(false)
    }

    const onFinish = async (values: any) => {
        // setloading(true);
        const nullClearedValues = Object.keys(values).reduce((obj: any, key: any) => {
            if (values[key] != undefined) {
                obj[key] = values[key];
            } else {
                obj[key] = '';
            }
            return obj;
        }, {});

        if (nullClearedValues.url) delete nullClearedValues.url;

        const formattedValues = {
            id: sourceId,
            categoryName: nullClearedValues.categoryName,
            purpose: nullClearedValues.purpose,
            crawlTime: nullClearedValues.crawlTime,
            infinityCrawl: nullClearedValues.infinityCrawl,
            nextPage: nullClearedValues.nextPage,
            pageStartCrawl: nullClearedValues.pageStartCrawl,
            linkHomepage: formatDomainPath(nullClearedValues.linkHomepage, "domain"),
            linkSelector: nullClearedValues.linkSelector,
            name: nullClearedValues.name,
            path: formatDomainPath(nullClearedValues.path, "path"),
            status: nullClearedValues.status,
            selectorDetail: {
                area: nullClearedValues.area,
                baths: nullClearedValues.baths,
                beds: nullClearedValues.beds,
                dateTimeFormat: nullClearedValues.dateTimeFormat,
                description: nullClearedValues.description,
                direction: nullClearedValues.direction,
                startDate: nullClearedValues.startDate,
                endDate: nullClearedValues.endDate,
                images: nullClearedValues.images,
                location: nullClearedValues.location,
                mobileContact: nullClearedValues.mobileContact,
                nameContact: nullClearedValues.nameContact,
                price: nullClearedValues.price,
                thumbnail: nullClearedValues.thumbnail,
                title: nullClearedValues.title,
            }
        }

        const response = await fetchEditSource(formattedValues, setloading)
        if (response) {
            if (response.status === 200) {
                message.success(t('Source updated successfully'))
                setsourceData(values)
                setisSaveButtonDisabled(true)
                getSourceDataById()
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Edit source failed'))
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onReset = () => {
        setisSaveButtonDisabled(true);
        form.setFieldsValue({
            ...sourceData,
            ...sourceData.selectorDetail,
            url: ""
        })
    };

    const showDeleteConfirm = () => {
        confirm({
            title: t('single-source-delete-confirm'),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: 'danger',
            cancelText: t("no"),
            onOk() {
                executeDeleteSource()
            },
        });
    };

    const executeDeleteSource = async () => {
        const response = await fetchDeleteSourceById(sourceId, setloading)
        if (response) {
            if (response.status === 200) {
                message.success(t('Source deleted successfully'))
                navigate('/sources')
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Delete source failed'))
        }
    }

    const handleRunCronManuallyButton = async () => {
        setloading(true);
        const response = await fetchRunCronJobManually(sourceId, setloading)
        if (response) {
            if (response.status === 200) {
                message.success(t('Cron job executed successfully'))
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Run cron job manually failed'))
        }
    }

    const isSelectorValid = ((dummyElement) =>
        (selector: any) => {
            try { dummyElement.querySelector(selector) } catch { return false }
            return true
        })(document.createDocumentFragment())

    const executeSelectorValidationCheck = {
        // validator: (rule: any, value: any) => {
        //     if (!value || isSelectorValid(value)) {
        //         return Promise.resolve();
        //     } else {
        //         return Promise.reject(`${t("Selector is invalid")}`);
        //     }
        // }
    }

    return (
        <div id='source-details'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("Source Details")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("sources")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("Source Details")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div
                className="site-layout-background"
                style={{
                    padding: 24,
                    minHeight: 250
                }}
            >
                <div>{t("Source ID")}: <span>{sourceId}</span></div>
                <Row justify="center">
                    <Col span={16}>
                        <Spin spinning={loading}>
                            <Form
                                {...layout}
                                form={form}
                                name="control-hooks"
                                className='mt-3'
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                onChange={handleFormChange}
                            >
                                <Collapse defaultActiveKey={['sourceSelectors']}>
                                    <Panel header={t("Source Selectors")} key="sourceSelectors">
                                        <Form.Item
                                            label={t("Source Name")}
                                            name="name"
                                            rules={[{ required: true, message: `${t("please-input")} ${t("Source Name").toLowerCase()}!` }]}
                                        >
                                            <Input placeholder={t("real-estate")} />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("domain")}
                                            name="linkHomepage"
                                            rules={[{ required: true, message: `${t("please-input")} ${t("domain").toLowerCase()}!` }]}
                                        >
                                            <Input placeholder='https://batdongsan.com.vn' />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("path")}
                                            name="path"
                                            rules={[{ required: true, message: `${t("please-input")} ${t("path").toLowerCase()}!` }]}
                                        >
                                            <Input placeholder='/du-an-bat-dong-san' />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("purpose")}
                                            name="purpose"
                                            rules={[{ required: true }]}
                                        >
                                            <Select
                                                onChange={() => setcheckSaveButtonDisabled(state => !state)}
                                            >
                                                <Option value="SELL">{handlePurpose("SELL")}</Option>
                                                <Option value="RENT">{handlePurpose("RENT")}</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label={t("category")}
                                            name="categoryName"
                                            rules={[{ required: true, message: `${t("please-select")} ${t("category").toLowerCase()}!` }]}
                                        >
                                            <Select
                                                onChange={() => setcheckSaveButtonDisabled(state => !state)}
                                                placeholder={`${t("please-select")} ${t("category").toLowerCase()}`}
                                            >
                                                {
                                                    categories.map((category: any) =>
                                                        <Option key={category.id} value={category.name}>{category.name}</Option>
                                                    )
                                                }
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Link Detail Selector")}
                                            name="linkSelector"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("please-input")} ${t("Link Detail Selector").toLowerCase()}!`
                                                },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input placeholder='.box-content #MainPage .content .tab-content product-item .product-item-top>h3 a' />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Infinite Crawl")}
                                        >
                                            <Form.Item name="infinityCrawl">
                                                <Switch
                                                    onChange={(e: any) => {
                                                        setisInfiniteCrawl(e)
                                                        setcheckSaveButtonDisabled(state => !state)
                                                    }}
                                                    checked={isInfiniteCrawl}
                                                />
                                            </Form.Item>
                                        </Form.Item>

                                        {
                                            isInfiniteCrawl &&
                                            < Form.Item
                                                label={t("Next-page param")}
                                                name="nextPage"
                                                rules={[
                                                    {
                                                        required: isInfiniteCrawl,
                                                        message: `${t("please-input")} ${t("Next-page param").toLowerCase()}!`,
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Eg. ?p=%s or /p%s" />
                                            </Form.Item>
                                        }

                                        {
                                            isInfiniteCrawl &&
                                            < Form.Item
                                                label={t("Start-from page")}
                                                name="pageStartCrawl"
                                                rules={[
                                                    {
                                                        required: isInfiniteCrawl,
                                                        message: `${t("please-input")} ${t("Start-from page").toLowerCase()}!`,
                                                    },
                                                    {
                                                        pattern: new RegExp(/^[0-9\b]+$/),
                                                        message: `${t("please-input")} ${t("numbers-only")}!`
                                                    }
                                                ]}
                                            >
                                                <Input placeholder="2" />
                                            </Form.Item>
                                        }

                                        <LinkPreview form={form} isInfiniteCrawl={isInfiniteCrawl} />
                                    </Panel>
                                </Collapse>

                                <Collapse className='mt-3' defaultActiveKey={['detailSelectors']}>
                                    <Panel header={t("Detail Selectors")} key="detailSelectors">
                                        <Form.Item
                                            label={t("Article URL")}
                                            name="url"
                                        >
                                            <Input
                                                ref={articleURLInputRef}
                                                onChange={() => {
                                                    form.setFields([
                                                        {
                                                            name: "url",
                                                            errors: []
                                                        }
                                                    ]);
                                                }}
                                                placeholder='https://homedy.com/ban-nha-biet-thu-lien-ke-regal-legend-quang-binh/dau-tu-4-ty-so-huu-ngay-boutique-hotel-mat-bien-12-15-phong-tai-chiet-khau-135-es1898429'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Title Selector")}
                                            name="title"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Title Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={titleInputRef}
                                                placeholder='.product-item .content .product-detail-top .product-detail-top-left h1'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Description Selector")}
                                            name="description"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Description Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={descriptionInputRef}
                                                placeholder='.product-item .content .description-content div.description'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Thumbnail Selector")}
                                            name="thumbnail"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Thumbnail Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={thumbnailInputRef}
                                                placeholder='.product .image-view .owl-stage .owl-item .o-item.image-default a.image-popup img.owl-lazy'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Images Selector")}
                                            name="images"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Images Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={imagesInputRef}
                                                placeholder='.product .image-view .owl-stage .owl-item .o-item.image-item div.item div.animate-box a.image-popup img.owl-lazy'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Area Selector")}
                                            name="area"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Area Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={areaInputRef}
                                                placeholder='.product-item .content div.product-detail-top div.product-detail-top-left div.option-bar div.product-short-info div.short-item strong span'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Location Selector")}
                                            name="location"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Location Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={locationInputRef}
                                                placeholder='.product-item .content .product-detail-top .product-detail-top-left .address'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Price Selector")}
                                            name="price"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Price Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={priceInputRef}
                                                placeholder='.product-item .content div.product-detail-top div.product-detail-top-left div.option-bar div.product-short-info div.short-item strong span'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Baths Selector")}
                                            name="baths"
                                            rules={[
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={bathsInputRef}
                                                placeholder='.product .product-item .container .agency .info-agency .info a#baths'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Beds Selector")}
                                            name="beds"
                                            rules={[
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={bedsInputRef}
                                                placeholder='.product .product-item .container .agency .info-agency .info a#beds'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Mobile Contact Selector")}
                                            name="mobileContact"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Mobile Contact Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={mobileContactInputRef}
                                                placeholder='.product .product-item .container .agency .info-agency .info a#copy-mobile'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Name Contact Selector")}
                                            name="nameContact"
                                            rules={[
                                                { required: true, message: `${t("please-input")} ${t("Name Contact Selector").toLowerCase()}!` },
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={nameContactInputRef}
                                                placeholder='.product .product-item .container .agency .info-agency .name a.text-name'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Direction Selector")}
                                            name="direction"
                                            rules={[
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={directionInputRef}
                                                placeholder='.product .product-item .container .agency .info-agency .info a#direction'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Start date Selector")}
                                            name="startDate"
                                            rules={[
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={startDateInputRef}
                                                placeholder='.product .product-item .container .agency .info-agency .info a#direction'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("End date Selector")}
                                            name="endDate"
                                            rules={[
                                                { ...executeSelectorValidationCheck }
                                            ]}
                                        >
                                            <Input
                                                ref={endDateInputRef}
                                                placeholder='.product .product-item .container .agency .info-agency .info a#direction'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("Date time format")}
                                            name="dateTimeFormat"
                                        >
                                            <Input
                                                ref={dateTimeFormatInputRef}
                                                placeholder='dd/MM/yyyy'
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={t("status")}
                                            name="status"
                                        >
                                            <Select
                                                placeholder={`${t("please-select")} ${t("status").toLowerCase()}`}
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

                                        <DetailsPreview form={form} refs={refs} />
                                    </Panel>
                                </Collapse>

                                <Space className='d-flex justify-content-center mt-3'>
                                    <Button disabled={isSaveButtonDisabled} type="primary" htmlType="submit">
                                        {t("save-changes")}
                                    </Button>
                                    <Button type="primary" onClick={handleRunCronManuallyButton} >
                                        {t("Run Manually")}
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

export default SourceDetails