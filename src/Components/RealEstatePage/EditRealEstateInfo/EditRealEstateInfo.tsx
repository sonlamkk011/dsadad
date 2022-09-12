import { Breadcrumb, Button, Cascader, Checkbox, Col, DatePicker, Divider, Form, Input, message, Radio, Row, Select, Space, Spin, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { fetchCreateNewCategory, fetchGetCategories } from '../../../service/Categories/Categories';
import ImageUploader from './ImageUploader';
import TextEditor from './TextEditor';
import { fetchEditNewRealEstate } from '../../../service/postRealEstate';
import { getLatitudeLongitude } from '../../../Hooks/GeographicCoordinateHelper';
import { fetchGetProjectByStatus } from '../../../service/Projects/projects';
import BraftEditor from 'braft-editor';
import { fetchGetDistrictsByProvinceId, fetchGetProvinces, fetchGetWardsByDistrictId } from '../../../service/Address/getAddress';
import { cascaderFilter } from '../../../Hooks/CascaderHelper';
import { fetchGetRealEstateDetails } from '../../../service/RealEstates/realEstate';
import { t } from 'i18next';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
};

function EditRealEstateInfo() {
    const navigate = useNavigate();
    const realEstateId = window.location.pathname.split('/')[3];
    const [categories, setcategories] = useState<any>();
    const [formInitialValues, setformInitialValues] = useState<any>();
    const [form] = Form.useForm();
    const [options, setOptions] = useState<any>([]);
    const [projects, setprojects] = useState<any>([]);
    const [provinces, setprovinces] = useState<any>([]);
    const [districts, setdistricts] = useState<any>([]);
    const [wards, setwards] = useState<any>([]);
    const [text, settext] = useState("");
    const [isReset, setisReset] = useState(false);
    const [formLoading, setformLoading] = useState(false);
    const [isDescriptionFieldError, setisDescriptionFieldError] = useState(false);

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    // For check save button is disabled or not
    const [isSaveButtonDisabled, setisSaveButtonDisabled] = useState(true);

    // For price suffix text
    const [priceSuffixText, setpriceSuffixText] = useState("");
    const [recalculatePricePerAreaUnit, setrecalculatePricePerAreaUnit] = useState(false);

    useEffect(() => {
        getProvinces();
        getRealEstateDetails()
        getAllApprovedProjects();
        getCategories()
    }, []);

    useEffect(() => {
        const currentPriceValue = Number(form.getFieldValue('price')?.replaceAll(",", ""))
        handlePriceSuffixText(currentPriceValue)
    }, [recalculatePricePerAreaUnit]);

    const getProvinces = async () => {
        const response = await fetchGetProvinces();
        if (response) {
            if (response.status === 200) {
                setprovinces(response.data);
                const residencesTest = response.data.map((province: any) => {
                    return {
                        value: province.id,
                        label: province.nameWithType,
                        isLeaf: false,
                    };
                });
                setOptions(residencesTest);
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t("Get provinces failed"));
        }
    };

    const getCategories = async () => {
        const filters = { size: 100, type: "REAL_ESTATE", status: 'ACTIVE' }
        const response = await fetchGetCategories(filters)
        if (response) {
            if (response.status === 200) {
                const categories = response.data.content
                setcategories(categories);
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t("get-investors-list-error"));
        }
    }

    const getAllApprovedProjects = async () => {
        const filters = { row: 100 }
        const response = await fetchGetProjectByStatus('APPROVED', filters);
        if (response) {
            if (response.status === 200) {
                const date = response.data.content
                const projectsArray: any = []
                date.forEach((project: any) => {
                    projectsArray.push({
                        id: project.id,
                        name: project.name,
                    });
                })
                setprojects(projectsArray);
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t("Get all approved projects failed"));
        }
    };

    const getRealEstateDetails = async () => {
        setformLoading(true);
        const response: any = await fetchGetRealEstateDetails(realEstateId, setformLoading);
        if (response) {
            if (response.status === 200) {
                const responseData = (response.data);
                const parcedDetails = JSON.parse(responseData.detail);
                const formInitialValues = { ...responseData, ...parcedDetails }
                delete formInitialValues.detail;
                setformInitialValues(formInitialValues);

                // Set fields values for form
                form.setFieldsValue(
                    {
                        ...formInitialValues,
                        ...formInitialValues.utilities,
                        price: responseData.price.toLocaleString("en-US"),
                        endDate: moment(responseData.endDate),
                        startDate: moment(responseData.startDate),
                        youtubeLink: parcedDetails.youtubeLink,
                        link3dview: parcedDetails.link3dview,
                        locationDetail: parcedDetails.locationDetail ? BraftEditor.createEditorState(parcedDetails.locationDetail) : null,
                        ground: parcedDetails.ground ? BraftEditor.createEditorState(parcedDetails.ground) : null,
                        detailUtility: (parcedDetails.utilities && parcedDetails.utilities.detailUtility) ? BraftEditor.createEditorState(parcedDetails.utilities.detailUtility) : null,
                        reasonsToInvest: parcedDetails.reasonsToInvest ? BraftEditor.createEditorState(parcedDetails.reasonsToInvest) : null,
                    });

                handlePriceSuffixText(Number(formInitialValues.price))

                form.setFields([{ name: ['address', 'detail'], value: formInitialValues.location }])
                form.setFields([{ name: ['address', 'selections'], value: [formInitialValues.ward?.nameWithType, formInitialValues.district?.nameWithType, formInitialValues.province?.nameWithType] }])

            } else {
                message.error(response.data);
            }
        } else {
            message.error(t('Get real estate details failed'));
        }
    }

    const getDestinations = async (functionName: any, parentId: any, targetOption: any, isGettingDistricts: boolean) => {
        const response = await functionName(parentId);
        if (response) {
            if (response.status === 200) {
                targetOption.loading = false;
                if (isGettingDistricts) {
                    setdistricts(response.data);
                    targetOption.children = response.data.map((district: any) => {
                        return {
                            value: district.id,
                            label: district.nameWithType,
                            isLeaf: false,
                        };
                    });
                } else {
                    setwards(response.data);
                    targetOption.children = response.data.map((ward: any) => {
                        return {
                            value: ward.id,
                            label: ward.nameWithType,
                        };
                    });
                }
                setOptions([...options]);
            } else {
                message.error(response.data);
            }
        } else {
            if (isGettingDistricts) {
                message.error(t("Get districts failed"));
            } else {
                message.error(t("Get wards failed"));
            }
        }
    };

    const loadData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        if (selectedOptions.length === 1) {
            getDestinations(fetchGetDistrictsByProvinceId, targetOption.value, targetOption, true);
        } else if (selectedOptions.length === 2) {
            getDestinations(fetchGetWardsByDistrictId, targetOption.value, targetOption, false);
        }
    };

    const handleTextEditorChange = (e: any) => {
        // remove all tags and keep only text
        settext(e.replace(/<[^>]*>/g, ""));
    };

    const disabledDate = (current: any) => {
        // Can not select days before today and today
        return current && current < moment().startOf("day");
    };

    const range = (start: number, end: number) => {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    };

    const disabledDateTime = () => {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        return ({
            disabledHours: () => range(0, 24).splice(0, currentHour),
            disabledMinutes: () => range(0, currentMinute),
        })
    };

    const findNameWithTypeById = (id: string, addressType: string, addressArray: any = null) => {
        // addressType = 'province' | 'district' | 'wards'
        if (addressType === 'province') {
            const province = provinces.find((province: any) => province.id === id);
            return province ? province.nameWithType : '';
        } else if (addressType === 'district') {
            const district = (addressArray || districts).find((district: any) => district.id === id);
            return district ? district.nameWithType : '';
        } else if (addressType === 'ward') {
            const ward = (addressArray || wards).find((ward: any) => ward.id === id);
            return ward ? ward.nameWithType : '';
        }
    }

    const handleSaveDraft = async () => {
        const title = form.getFieldValue("name")
        if (title && title.length) {
            const values = form.getFieldsValue();
            executePostDataToServer(values, true);
        } else {
            message.error(t("Please enter title to save draft"));
        }
    }

    const executePostDataToServer = async (values: any, isSaveDraft: boolean) => {
        // Address handling
        const addressSelectionsArray = values.address.selections;
        let provinceId = addressSelectionsArray ? addressSelectionsArray[0] : ""
        let districtId = addressSelectionsArray ? addressSelectionsArray[1] : ""
        let wardId = addressSelectionsArray ? addressSelectionsArray[2] : ""
        const detailedAddress = values.address.detail;
        let fullAddress = ""
        if (addressSelectionsArray) {
            let isAllNumbers = true
            addressSelectionsArray.forEach((address: string, index: any) => {
                // check if address contains numbers only or not
                if (!address.match(/^[0-9]+$/)) {
                    isAllNumbers = false
                }
            })
            if (isAllNumbers) {
                const provinceName = findNameWithTypeById(provinceId, 'province');
                const districtName = findNameWithTypeById(districtId, 'district');
                const wardName = findNameWithTypeById(wardId, 'ward');
                fullAddress = [detailedAddress, wardName, districtName, provinceName, "Việt Nam"].join(", ")
            } else {
                provinceId = formInitialValues.province.id
                districtId = formInitialValues.district.id
                wardId = formInitialValues.ward.id
                fullAddress = [detailedAddress, addressSelectionsArray[0], addressSelectionsArray[1], addressSelectionsArray[2], "Việt Nam"].join(", ")
            }
        }

        const imageArray: any = [];

        if (values.images) {
            values.images.forEach((image: any) => {
                if (image.response) {
                    imageArray.push(image.response.result.variants[0]);
                } else {
                    if (image.url) {
                        imageArray.push(image.url);
                    } else {
                        imageArray.push(image);
                    }
                }
            });
        }

        let detail: any = {
            locationDetail: values.locationDetail?.toHTML(),
            description: values.description,
            images: imageArray,
            contact: formInitialValues.contact,
            panoramaId: "",
            youtubeLink: values.youtubeLink || "",
            link3dview: values.link3dview || "",
            ground: (values.ground && values.ground.toHTML() !== "<p></p>") ? values.ground.toHTML() : null,
            reasonsToInvest: (values.reasonsToInvest && values.reasonsToInvest.toHTML() !== "<p></p>") ? values.reasonsToInvest.toHTML() : null,
            utilities: {
                infrastructure: values.infrastructure?.length ? values.infrastructure : null,
                securityAndHygiene: values.securityAndHygiene?.length ? values.securityAndHygiene : null,
                educationAndMedical: values.educationAndMedical?.length ? values.educationAndMedical : null,
                entertainment: values.entertainment?.length ? values.entertainment : null,
                consumptionAndCuisine: values.consumptionAndCuisine?.length ? values.consumptionAndCuisine : null,
                sport: values.sport?.length ? values.sport : null,
                detailUtility: (values.detailUtility && values.detailUtility.toHTML() !== "<p></p>") ? values.detailUtility.toHTML() : null,
            },
            usageArea: values.usageArea == null || values.usageArea === "" ? 0 : values.usageArea,
            facade: values.facade == null || values.facade === "" ? 0 : values.facade,
            length: values.length == null || values.length === "" ? 0 : values.length,
            width: values.width == null || values.width === "" ? 0 : values.width,
            condition: values.condition || "",
        };
        if (!detail.ground) delete detail.ground;
        if (!detail.reasonsToInvest) delete detail.reasonsToInvest;

        // delete all null utility fields
        Object.keys(detail.utilities).forEach((key: any) => {
            if (!detail.utilities[key]) delete detail.utilities[key];
        })

        // if everything in utilities is null, delete utilities
        const notNullUtilitiesKey = Object.keys(detail.utilities).find((key: any) => {
            return detail.utilities[key] !== null;
        })
        if (!notNullUtilitiesKey) delete detail.utilities;

        const latLngObject = fullAddress ? await getLatitudeLongitude(fullAddress) : null;

        const editValues = {
            accountId: formInitialValues.accountId,
            active: formInitialValues.active,
            area: values.area,
            areaUnit: values.areaUnit,
            baths: values.baths,
            beds: values.beds,
            categoryName: values.categoryName,
            currency: values.currency,
            detail: JSON.stringify(detail),
            direction: values.direction.toUpperCase(),
            id: realEstateId,
            latitude: latLngObject?.latitude != null ? latLngObject.latitude.toString() : "",
            longitude: latLngObject?.longitude != null ? latLngObject.longitude.toString() : "",
            location: values.address.detail,
            province: provinceId,
            district: districtId,
            ward: wardId,
            juridical: values.juridical,
            name: values.name,
            postType: formInitialValues.postType,
            price: Number(values.price.toString().replaceAll(",", "")), // replace comma with empty string and turn to number
            projectId: values.projectId,
            purpose: values.purpose,
            source: formInitialValues.source,
            startDate: moment(values.startDate).format("YYYY-MM-DDTHH:mm:ss.SSS"),
            endDate: moment(values.endDate).format("YYYY-MM-DDTHH:mm:ss.SSS"),
            status: isSaveDraft ? "DRAFT" : "PENDING",
            thumbnail: imageArray[0],
            view: formInitialValues.view,
        }

        window.scrollTo(0, 0);
        setformLoading(true);

        const response = await fetchEditNewRealEstate(editValues, setformLoading);
        if (response) {
            if (response.status === 200) {
                if (isSaveDraft) {
                    message.success(t("Save draft successfully"));
                    navigate("/real-estate/drafts");
                } else {
                    message.success(t("Edit real estate successfully"));
                    navigate(`/real-estate/demo-view/${realEstateId}`);
                }
            } else {
                message.error(response.data);
            }
        } else {
            message.error(isSaveDraft ? t("Save as draft failed") : t(`Edit real estate failed`))
        }
    }

    const onFinish = async (values: any) => {
        executePostDataToServer(values, false);
    };

    const onReset = () => {
        form.setFieldsValue(
            {
                ...formInitialValues,
                ...formInitialValues.utilities,
                price: formInitialValues.price.toLocaleString("en-US"),
                endDate: moment(formInitialValues.endDate),
                startDate: moment(formInitialValues.startDate),
                youtubeLink: formInitialValues.youtubeLink,
                link3dview: formInitialValues.link3dview,
                locationDetail: formInitialValues.locationDetail ? BraftEditor.createEditorState(formInitialValues.locationDetail) : null,
                ground: formInitialValues.ground ? BraftEditor.createEditorState(formInitialValues.ground) : null,
                detailUtility: (formInitialValues.utilities && formInitialValues.utilities.detailUtility) ? BraftEditor.createEditorState(formInitialValues.utilities.detailUtility) : null,
                reasonsToInvest: formInitialValues.reasonsToInvest ? BraftEditor.createEditorState(formInitialValues.reasonsToInvest) : null,
            })
        // toggle isReset
        setisReset(!isReset);
        // handle address reset
        let initialAddress: any = []
        if (formInitialValues.fullAddress) {
            const fullAddress = JSON.parse(formInitialValues.fullAddress)
            initialAddress = [fullAddress.province, fullAddress.district, fullAddress.wards]
        } else {
            initialAddress = (formInitialValues.location.split(", ").reverse());
            initialAddress.shift();
        }

        // For price suffix text
        const currentPriceValue = formInitialValues.price
        handlePriceSuffixText(currentPriceValue)

        form.setFields([{ name: ['address', 'detail'], value: formInitialValues.location }])
        form.setFields([{ name: ['address', 'selections'], value: [formInitialValues.ward?.nameWithType, formInitialValues.district?.nameWithType, formInitialValues.province?.nameWithType] }])
    };

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

    const myUploadFn = (param: any) => {
        const serverURL = 'https://v2.pindias.com/api/v2/image/upload'
        const xhr = new XMLHttpRequest
        const fd = new FormData()

        const successFn = (response: any) => {
            //After the upload is successful, call param.success and pass in the uploaded file address
            const imageUrl = JSON.parse(xhr.response).result.variants[0]
            param.success({
                url: imageUrl,
            })
        }

        const progressFn = (event: any) => {
            //call param.progress when upload progress changes
            param.progress(event.loaded / event.total * 100)
        }

        const errorFn = (response: any) => {
            //call param.error when upload error occurs
            param.error({
                msg: t('Unable to upload')
            })
        }

        xhr.upload.addEventListener("progress", progressFn, false)
        xhr.addEventListener("load", successFn, false)
        xhr.addEventListener("error", errorFn, false)
        xhr.addEventListener("abort", errorFn, false)

        fd.append('file', param.file)
        xhr.open('POST', serverURL, true)
        xhr.send(fd)
    }

    const handlePriceInputChange = (e: any) => {
        // check if e.target.value include any charactor other than numbers and comma       
        const regex = /[^0-9,]/g;
        if (regex.test(e.target.value)) {
            message.destroy();
            message.error(`${t("please-input")} ${t("numbers-only")}!`)
            return;
        } else {
            // For input showing
            const formattedPriceString = Number(e.target.value.replaceAll(",", "")).toLocaleString("en-US")
            form.setFieldsValue({ price: formattedPriceString })

            // For price suffix text
            const currentPriceValue = Number(e.target.value.replaceAll(",", ""))
            handlePriceSuffixText(currentPriceValue)
        }
    }

    const handlePriceSuffixText = (currentPriceValue: number) => {
        const currentArea = form.getFieldValue('area')
        if (currentArea) {
            const pricePerArea = currentPriceValue / currentArea
            const isDecimal = pricePerArea % 1 !== 0
            const stringifiedPricePerArea = (isDecimal ? "~" : "") + Number(pricePerArea.toFixed(0)).toLocaleString("en-US")
            const currentAreaUnit = form.getFieldValue('areaUnit') === "M2" ? "m²" : form.getFieldValue('areaUnit')
            const priceSuffixText = `${stringifiedPricePerArea} / ${currentAreaUnit}`
            setpriceSuffixText(priceSuffixText)
        } else {
            setpriceSuffixText("")
        }
    }

    return (
        <div id="create-new-real-estate">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("Edit")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("real-estate-manager")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("Edit")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="site-layout-background" style={{ padding: "24px 50px", minHeight: 360 }}>
                <Spin spinning={formLoading}>
                    <Form
                        {...layout}
                        form={form}
                        name="control-hooks"
                        onFinish={onFinish}
                    >
                        <Title level={5}>{t("Basic information")}</Title>

                        <Form.Item
                            label={t("purpose")}
                            name="purpose"
                        >
                            <Radio.Group>
                                <Radio value="SELL">{t("sell")}</Radio>
                                <Radio value="RENT">{t("rent")}</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {/* new form item */}
                        <Form.Item
                            label={t("category")}
                            className="required-label"
                        >
                            <Input.Group compact>
                                <Row className="w-100 d-flex">
                                    <Col span={11}>
                                        <Form.Item
                                            name="categoryName"
                                            style={{ width: "90%" }}
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
                                                    categories &&
                                                    categories.map((category: any) =>
                                                        <Option key={category.id} value={category.name}>{category.name}</Option>
                                                    )
                                                }
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={13}>
                                        <Form.Item
                                            className="d-flex"
                                            label={t("project")}
                                            name="projectId"
                                            style={{ width: "50%" }}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please select a project",
                                                },
                                            ]}
                                        >
                                            <Select
                                                placeholder={`${t("please-select")} ${t("project").toLowerCase()}`}
                                            >
                                                {projects.map((project: any) => (
                                                    <Option key={project.id} value={project.id}>
                                                        {project.name}
                                                    </Option>
                                                ))}
                                                <Option value={0}>{t("None")}</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </Form.Item>

                        <Form.Item
                            label={t("address")}
                            className="required-label"
                        >
                            <Input.Group compact>
                                <Form.Item
                                    name={["address", "selections"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: `${t("please-select")} ${t("address").toLowerCase()}!`,
                                        },
                                        {
                                            validator: (rule, value, callback) => {
                                                if (value.length === 1) {
                                                    callback(`${t("please-select")} ${t("districts")}, ${t("wards")}`)
                                                } else if (value.length === 2) {
                                                    callback(`${t("please-select")} ${t("wards")}`)
                                                } else {
                                                    callback()
                                                }
                                            }
                                        }
                                    ]}
                                    noStyle
                                >
                                    <Cascader
                                        style={{ width: "100%" }}
                                        options={options}
                                        loadData={loadData}
                                        placeholder={`${t("please-select")} ${t("address").toLowerCase()}`}
                                        changeOnSelect
                                        showSearch={{
                                            // @ts-ignore
                                            cascaderFilter
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={["address", "detail"]}
                                    noStyle
                                    rules={[
                                        {
                                            required: true,
                                            message: `${t("please-input")} ${t("detailed address").toLowerCase()}!`,
                                        }
                                    ]}
                                >
                                    <Input className="mt-1" placeholder={t("Example address")} />
                                </Form.Item>
                            </Input.Group>
                        </Form.Item>

                        <Form.Item
                            label={t("Location details")}
                            name="locationDetail"
                            rules={[
                                {
                                    required: true,
                                    message: `${t("please-input")} ${t("Location details").toLowerCase()}!`,
                                },
                            ]}
                        >
                            <BraftEditor
                                language="en"
                                style={{ border: '1px solid #ccc' }}
                                media={{ uploadFn: myUploadFn }}

                            />
                        </Form.Item>

                        <Title level={5}>{t("Details")}</Title>

                        <Form.Item
                            label={t("title")}
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: `${t("please-input")} ${t("title").toLowerCase()}!`,
                                },
                                {
                                    max: 99,
                                    message: `${t("title")} ${t("must not exceed")} 99 ${t("characters")}`,
                                }
                            ]}
                        >
                            <TextArea rows={4} showCount placeholder={t("Example title")} />
                        </Form.Item>

                        <Form.Item
                            label={t("description")}
                            className={`required-label ${isDescriptionFieldError ? "react-quill-error" : ""}`}
                        >
                            <Form.Item
                                name="description"
                                noStyle
                                rules={[
                                    {
                                        required: true,
                                        message: `${t("please-input")} ${t("description").toLowerCase()}!`,
                                    },
                                    {
                                        // at least 1 characters excluding tags like <p>, <h1>, <h2>, ...
                                        validator: (rule: any, value: any, callback: any) => {
                                            if (value && value.replace(/<[^>]*>/g, "").length < 1) {
                                                setisDescriptionFieldError(true);
                                                callback(`${t("please-input")} ${t("description").toLowerCase()}!`);
                                            } else {
                                                setisDescriptionFieldError(false);
                                                callback();
                                            }
                                        },
                                    },
                                ]}
                            >
                                <TextEditor
                                    value={text}
                                    onChange={handleTextEditorChange}
                                    placeholder={t("Example description")}
                                />
                            </Form.Item>
                        </Form.Item>

                        <Form.Item
                            label={t("area")}
                            className="required-label"
                        >
                            <Input.Group compact>
                                <Row className="w-100 d-flex">
                                    <Col span={10}>
                                        <Form.Item
                                            name="area"
                                            style={{ width: "95%" }}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("please-input")} ${t("area").toLowerCase()}!`,
                                                },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (isNaN(value)) {
                                                            return Promise.reject(new Error(`${t("invalid area")}!`));
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input
                                                placeholder="85"
                                                onChange={() => setrecalculatePricePerAreaUnit(prev => !prev)}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                        <Form.Item name="areaUnit" style={{ width: "90%" }}>
                                            <Select
                                                className="text-center"
                                                onChange={() => setrecalculatePricePerAreaUnit(prev => !prev)}
                                            >
                                                <Option className="text-center" value="M2">
                                                    m<sup>2</sup>
                                                </Option>
                                                <Option className="text-center" value="ACRES">
                                                    {t("Acres")}
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={10}>
                                        <Form.Item
                                            label={t("price")}
                                            className="d-flex"
                                            name="price"
                                            style={{ width: "95%" }}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("please-input")} ${t("price").toLowerCase()}!`,
                                                },
                                                {
                                                    // Accept pattern from number 0 to 9 and comma (,) only. Ex: 12,122,312,312,312
                                                    pattern: /^[0-9,]*$/,
                                                    message: `${t("please-input")} ${t("numbers-only")}!`,
                                                },
                                                {
                                                    validator: (rule: any, value: any, callback: any) => {
                                                        if (value && value < 1) {
                                                            callback(`${t("price")} ${t("can not be less than 1")}`);
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ]}
                                        >
                                            <Input
                                                placeholder="120,000,000"
                                                onChange={handlePriceInputChange}
                                                suffix={priceSuffixText}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                        <Form.Item name="currency">
                                            <Select className="text-center">
                                                <Option className="text-center" value="VND">
                                                    VND
                                                </Option>
                                                <Option className="text-center" value="USD">
                                                    USD
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </Form.Item>

                        <Form.Item
                            label={t("length")}
                        >
                            <Input.Group compact>
                                <Row className="w-100 d-flex">
                                    <Col span={11}>
                                        <Form.Item
                                            className="d-flex"
                                            style={{ width: "90%" }}
                                            name="length"
                                            rules={[
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (isNaN(value)) {
                                                            return Promise.reject(new Error(`${t("invalid length")}!`));
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input placeholder="25" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={13}>
                                        <Form.Item
                                            className="d-flex"
                                            name="width"
                                            label={t("width")}
                                            rules={[
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (isNaN(value)) {
                                                            return Promise.reject(new Error(`${t("invalid width")}!`));
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input placeholder="4" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </Form.Item>

                        <Form.Item label={t("usage area")}>
                            <Input.Group compact>
                                <Row className="w-100 d-flex">
                                    <Col span={11}>
                                        <Form.Item
                                            className="d-flex"
                                            style={{ width: "90%" }}
                                            name="usageArea"
                                            rules={[
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (isNaN(value)) {
                                                            return Promise.reject(new Error(`${t("invalid usage area")}!`));
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input placeholder="65" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={13}>
                                        <Form.Item
                                            label={t("facade")}
                                            className="d-flex"
                                            name="facade"
                                            rules={[
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (isNaN(value)) {
                                                            return Promise.reject(new Error(`${t("invalid facade")}!`));
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input placeholder="4" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </Form.Item>

                        <Form.Item
                            label={t("condition")}
                            name="condition"
                            rules={[{
                                max: 70,
                                message: `${t("condition")} ${t("must not exceed")} 70 ${t("characters")}`,
                            }]}
                        >
                            <TextArea rows={3} showCount placeholder={t("Example condition")} />
                        </Form.Item>

                        <ImageUploader isReset={isReset} defaultImages={formInitialValues?.images} />

                        <Form.Item className="required-label" label={t("bedrooms")}>
                            <Input.Group compact>
                                <Row className="w-100 d-flex">
                                    <Col span={11}>
                                        <Form.Item
                                            className="d-flex"
                                            style={{ width: "90%" }}
                                            name="beds"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("please-input")} ${t("bedrooms").toLowerCase()}!`,
                                                },
                                                {
                                                    pattern: /^[0-9]*$/,
                                                    message: `${t("please-input")} ${t("numbers-only")}!`,
                                                },
                                            ]}
                                        >
                                            <Input placeholder="5" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={13}>
                                        <Form.Item
                                            className="d-flex"
                                            name="baths"
                                            label={t("bathrooms")}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("please-input")} ${t("bathrooms").toLowerCase()}!`,
                                                },
                                                {
                                                    pattern: /^[0-9]*$/,
                                                    message: `${t("please-input")} ${t("numbers-only")}!`,
                                                },
                                            ]}
                                        >
                                            <Input placeholder="4" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </Form.Item>

                        <Form.Item
                            // className="required-label"
                            label={t("juridical")}
                        >
                            <Input.Group compact>
                                <Row className="w-100 d-flex">
                                    <Col span={11}>
                                        <Form.Item
                                            name="juridical"
                                            style={{ width: "90%" }}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("please-select")} ${t("juridical").toLowerCase()}!`,
                                                }
                                            ]}
                                        >
                                            <Radio.Group>
                                                <Radio value="House Ownership Certificate">{t("House Ownership Certificate")}</Radio>
                                                <Radio value="Land Use Rights Certificate">{t("Land Use Rights Certificate")}</Radio>
                                                <Radio value="NONE">{t("None")}</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Col>
                                    <Col span={13}>
                                        <Form.Item
                                            label={t("direction")}
                                            className="d-flex"
                                            name="direction"
                                            rules={[{ required: true }]}
                                        >
                                            <Select className="text-center" placeholder="Select direction">
                                                <Option className="text-center" value="North">
                                                    {t("North")}
                                                </Option>
                                                <Option className="text-center" value="South">
                                                    {t("South")}
                                                </Option>
                                                <Option className="text-center" value="East">
                                                    {t("East")}
                                                </Option>
                                                <Option className="text-center" value="West">
                                                    {t("West")}
                                                </Option>
                                                <Option className="text-center" value="NorthEast">
                                                    {t("North-East")}
                                                </Option>
                                                <Option className="text-center" value="NorthWest">
                                                    {t("North-West")}
                                                </Option>
                                                <Option className="text-center" value="SouthEast">
                                                    {t("South-East")}
                                                </Option>
                                                <Option className="text-center" value="SouthWest">
                                                    {t("South-West")}
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </Form.Item>

                        <Title level={5}>{t("Media")}</Title>
                        <Form.Item
                            name="youtubeLink"
                            label={t("Youtube link")}
                        >
                            <Input placeholder="https://www.youtube.com/watch?v=cxkJgHovdMU" />
                        </Form.Item>

                        <Form.Item
                            name="link3dview"
                            label={t("VR link")}
                        >
                            <Input placeholder="https://panomatics.com/360-videos/watch?v=cxkJgHovdMU" />
                        </Form.Item>

                        <Title level={5}>{t("ground")}</Title>
                        <Form.Item
                            name="ground"
                            label={t("ground")}
                        >
                            <BraftEditor
                                language="en"
                                style={{ border: "1px solid #ccc" }}
                                media={{ uploadFn: myUploadFn }}
                            />
                        </Form.Item>

                        <Title level={5}>{t("utilities")}</Title>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    name="infrastructure"
                                    label="Infrastructure"
                                >
                                    <Checkbox.Group style={{ width: "100%" }}>
                                        <Row>
                                            <Col span={8}>
                                                <Checkbox value="square">{t("square")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="parkingArea">{t("parkingArea")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="motorcycleParkingArea">{t("motorcycleParkingArea")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="greenCampus">{t("greenCampus")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="eventArea">{t("eventArea")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="park">{t("park")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="seaside">{t("seaside")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="lake">{t("lake")}</Checkbox>
                                            </Col>
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>

                                <Form.Item
                                    name="securityAndHygiene"
                                    label={t("securityAndHygiene")}
                                >
                                    <Checkbox.Group style={{ width: "100%" }}>
                                        <Row>
                                            <Col span={8}>
                                                <Checkbox value="securityGuard">{t("securityGuard")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="surveillanceCamera">{t("surveillanceCamera")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="fireProtectionSystem">{t("fireProtectionSystem")}</Checkbox>
                                            </Col>
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>

                                <Form.Item
                                    name="educationAndMedical"
                                    label={t("educationAndMedical")}
                                >
                                    <Checkbox.Group style={{ width: "100%" }}>
                                        <Row>
                                            <Col span={8}>
                                                <Checkbox value="hospitalsClinics">{t("hospitalsClinics")}</Checkbox>
                                            </Col>
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>

                                <Form.Item
                                    name="entertainment"
                                    label={t("entertainment")}
                                >
                                    <Checkbox.Group style={{ width: "100%" }}>
                                        <Row>
                                            <Col span={8}>
                                                <Checkbox value="childrenPlayArea">{t("childrenPlayArea")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="beautySpa">{t("beautySpa")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="bar">{t("bar")}</Checkbox>
                                            </Col>
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>

                                <Form.Item
                                    name="consumptionAndCuisine"
                                    label={t("consumptionAndCuisine")}
                                >
                                    <Checkbox.Group style={{ width: "100%" }}>
                                        <Row>
                                            <Col span={8}>
                                                <Checkbox value="restaurant">{t("restaurant")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="coffeeShop">{t("coffeeShop")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="shoppingMall">{t("shoppingMall")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="supermarket">{t("supermarket")}</Checkbox>
                                            </Col>
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>

                                <Form.Item
                                    name="sport"
                                    label={t("sportArea")}
                                >
                                    <Checkbox.Group style={{ width: "100%" }}>
                                        <Row>
                                            <Col span={8}>
                                                <Checkbox value="fourSeasonsSwimmingPool">{t("fourSeasonsSwimmingPool")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="outdoorPool">{t("outdoorPool")}</Checkbox>
                                            </Col>
                                            <Col span={8}>
                                                <Checkbox value="fitness">{t("fitness")}</Checkbox>
                                            </Col>
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>

                                <Form.Item
                                    name="detailUtility"
                                    label={t("utilities-details")}
                                >
                                    <BraftEditor
                                        language="en"
                                        style={{ border: "1px solid #ccc" }}
                                        media={{ uploadFn: myUploadFn }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Title level={5}>{t("reasons-to-invest")}</Title>
                        <Form.Item
                            name="reasonsToInvest"
                            label={t("reasons-to-invest")}
                        >
                            <BraftEditor
                                language="en"
                                style={{ border: "1px solid #ccc" }}
                                media={{ uploadFn: myUploadFn }}
                            />
                        </Form.Item>

                        <Form.Item label={t("start-date")} className="required-label">
                            <Input.Group compact>
                                <Row className="w-100 d-flex">
                                    <Col span={11}>
                                        <Form.Item
                                            name="startDate"
                                            style={{ width: "90%" }}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("please-select")} ${t("start-date").toLowerCase()}!`,
                                                },
                                                {
                                                    // start date must be greater than now
                                                    validator: (rule: any, value: any, callback: any) => {
                                                        if (value && value < moment().subtract(1, "minutes")) {
                                                            callback(t("Start date must be greater than now"));
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ]}
                                        >
                                            {
                                                <DatePicker
                                                    disabledDate={disabledDate}
                                                    disabledTime={disabledDateTime}
                                                    showTime
                                                    style={{ width: "100%" }}
                                                />
                                            }
                                        </Form.Item>
                                    </Col>
                                    <Col span={13}>
                                        <Form.Item
                                            className="d-flex"
                                            name="endDate"
                                            label={t("end-date")}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("please-select")} ${t("end-date").toLowerCase()}!`,
                                                },
                                                {
                                                    // endDate must be greater than startDate
                                                    validator: (rule: any, value: any, callback: any) => {
                                                        if (value && value < form.getFieldValue("startDate")) {
                                                            callback(t("End date must be after start date"));
                                                        } else {
                                                            callback();
                                                        }
                                                    }
                                                }
                                            ]}
                                        >
                                            {
                                                // @ts-ignore
                                                <DatePicker showTime style={{ width: "100%" }} />
                                            }
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Input.Group>
                        </Form.Item>

                        {/* <Form.Item name="autoRepost" label="Auto repost">
                            <Switch checked={isautoRepost} onChange={() => setisautoRepost((value) => !value)} />
                        </Form.Item> */}

                        <Form.Item>
                            <Space className="d-flex justify-content-center">
                                <Button type="primary" htmlType="submit" className="btnCreate">
                                    {t("save-changes")}
                                </Button>
                                <Button htmlType="button" onClick={handleSaveDraft} className="btnSaveDraft">
                                    {t("save-draft")}
                                </Button>
                                <Button htmlType="button" onClick={onReset} className="btnReset">
                                    {t("reset")}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </div>
        </div>
    )
}

export default EditRealEstateInfo