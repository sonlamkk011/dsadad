import { Button, Collapse, Divider, Form, Input, message, Modal, Select, Space, Spin, Switch } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchCreateNewSource } from '../../../../service/Sources/sources';
import DetailsPreview from './DetailsPreview';
import LinkPreview from './LinkPreview';
import { fetchCreateNewCategory } from '../../../../service/Categories/Categories';
import { formatDomainPath } from '../../../../Hooks/DomainPathFormatter';
import { t } from 'i18next';
import { handlePurpose } from '../../../../Hooks/NameHandler';

const { Option } = Select;
const { Panel } = Collapse;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
};

function ConfigureSourceTab({ categories = [], getCategories }: any) {
    const navigate = useNavigate();
    const [formLoading, setformLoading] = useState(false);
    const [form] = Form.useForm();

    const [isInfiniteCrawl, setisInfiniteCrawl] = useState(false);

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    const articleURLInputRef = useRef(null);
    const titleInputRef = useRef(null);
    const descriptionInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);
    const imagesInputRef = useRef(null);
    const areaInputRef = useRef(null);
    const locationInputRef = useRef(null);
    const priceInputRef = useRef(null);
    const bathsInputRef = useRef(null);
    const bedsInputRef = useRef(null);
    const mobileContactInputRef = useRef(null);
    const nameContactInputRef = useRef(null);
    const directionInputRef = useRef(null);
    const startDateInputRef = useRef(null);
    const endDateInputRef = useRef(null);
    const dateTimeFormatInputRef = useRef(null);

    const refs = { articleURLInputRef, titleInputRef, descriptionInputRef, thumbnailInputRef, imagesInputRef, areaInputRef, locationInputRef, priceInputRef, bathsInputRef, bedsInputRef, mobileContactInputRef, nameContactInputRef, directionInputRef, startDateInputRef, endDateInputRef, dateTimeFormatInputRef };

    useEffect(() => {
        if (categories.length) {
            form.setFieldsValue({ categoryName: categories[0].name })
        }
    }, [categories]);

    const handleSaveDraft = () => {
        const name = form.getFieldValue("name")
        const linkHomepage = form.getFieldValue("linkHomepage")
        const path = form.getFieldValue("path")
        if (name && linkHomepage && path) {
            const values = form.getFieldsValue();
            executePostDataToServer(values, true);
        } else {
            form.setFields([
                {
                    name: 'name',
                    errors: [`${t("please-input")} ${t("Source Name").toLowerCase()}!`],
                },
                {
                    name: 'linkHomepage',
                    errors: [`${t("please-input")} ${t("domain").toLowerCase()}!`],
                },
                {
                    name: 'path',
                    errors: [`${t("please-input")} ${t("path").toLowerCase()}!`],
                },
            ]);
            const missingFields = []
            if (!name) missingFields.push(t("Source Name").toLowerCase())
            if (!linkHomepage) missingFields.push(t("domain").toLowerCase())
            if (!path) missingFields.push(t("path").toLowerCase())
            message.destroy()
            message.error(`${t("please-input")} ${missingFields.join(", ")} ${t("to save draft")}!`);
        }
    }

    const onFinish = async (values: any) => {
        executePostDataToServer(values, false);
    };

    const executePostDataToServer = async (values: any, isSaveDraft: boolean) => {
        setformLoading(true);

        // Change every key of values object that is undefined to empty string
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
            status: isSaveDraft ? "DRAFT" : nullClearedValues.status,
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
        // Call api to create new source
        const response = await fetchCreateNewSource(formattedValues, setformLoading)
        if (response) {
            if (response.status === 200) {
                if (isSaveDraft) {
                    message.success(t("Save draft successfully"));
                    navigate("/sources/drafts");
                } else {
                    message.success(t("Create source successfully"));
                    navigate('/sources')
                }
            } else {
                message.error(response.data)
            }
        } else {
            message.error(isSaveDraft ? t("Save as draft failed") : t("Create source failed"))
        }
    }

    const onReset = () => {
        form.resetFields();
        form.setFieldsValue({ categoryName: categories[0].name })
    };

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
        <Spin spinning={formLoading}>
            <Form
                {...layout}
                form={form}
                name="control-hooks"
                className='mt-3'
                onFinish={onFinish}
                initialValues={{
                    status: 'ACTIVE',
                    crawlTime: 1440,
                    nullClearedValues: false,
                    purpose: 'SELL',
                    pageStartCrawl: 2,
                }}
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
                            <Select>
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
                                    checked={isInfiniteCrawl}
                                    onChange={(e: any) => setisInfiniteCrawl(e)}
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
        </Spin >
    )
}

export default ConfigureSourceTab