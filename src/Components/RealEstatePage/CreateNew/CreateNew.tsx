import { useEffect, useState } from "react";
import { Breadcrumb, Typography, Button, Form, Input, Select, Radio, Row, Col, message, Cascader, DatePicker, Switch, Upload, Spin, Space, Divider, Checkbox } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import TextEditor from "./TextEditor";
import ImageUploader from "./ImageUploader";
import { fetchCreateNewRealEstate } from "../../../service/postRealEstate";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { accountInfoSelector } from "../../../Features/selectors";
import moment from "moment";
import { fetchCreateNewCategory, fetchGetCategories } from "../../../service/Categories/Categories";
import { getLatitudeLongitude } from "../../../Hooks/GeographicCoordinateHelper";
import BraftEditor from "braft-editor";
import { fetchGetProjectByStatus } from "../../../service/Projects/projects";
import React from "react";
import { fetchGetDistrictsByProvinceId, fetchGetProvinces, fetchGetWardsByDistrictId } from "../../../service/Address/getAddress";
import { cascaderFilter } from "../../../Hooks/CascaderHelper";
import { t } from "i18next";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
};

function CreateNew() {
    const navigate = useNavigate();
    const accountInfo: any = useSelector(accountInfoSelector)
    const [categories, setcategories] = useState<any>();
    const [form] = Form.useForm();
    const [options, setOptions] = useState<any>([]);
    const [projects, setprojects] = useState<any>([]);
    const [provinces, setprovinces] = useState([]);
    const [districts, setdistricts] = useState([]);
    const [wards, setwards] = useState([]);
    const [text, settext] = useState("");
    const [isReset, setisReset] = useState(false);
    const [isautoRepost, setisautoRepost] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isDescriptionFieldError, setisDescriptionFieldError] = useState(false);

    // For add new category
    const [addNewCategoryButtonLoading, setaddNewCategoryButtonLoading] = useState(false);
    const [newCategoryName, setnewCategoryName] = useState('');

    // For price suffix text
    const [priceSuffixText, setpriceSuffixText] = useState("");
    const [recalculatePricePerAreaUnit, setrecalculatePricePerAreaUnit] = useState(false);

    useEffect(() => {
        getProvinces();
        getAllApprovedProjects();
        getCategories()
    }, []);

    useEffect(() => {
        const currentPriceValue = Number(form.getFieldValue('price')?.replaceAll(",", ""))
        handlePriceSuffixText(currentPriceValue)
    }, [recalculatePricePerAreaUnit]);

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

    const loadData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        if (selectedOptions.length === 1) {
            getDestinations(fetchGetDistrictsByProvinceId, targetOption.value, targetOption, true);
        } else if (selectedOptions.length === 2) {
            getDestinations(fetchGetWardsByDistrictId, targetOption.value, targetOption, false);
        }
    };

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

    const range = (start: number, end: number) => {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    };

    const disabledDate = (current: any) => {
        // Can not select days before today and today
        return current && current < moment().startOf("day");
    };

    const disabledDateTime = () => {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const currentSecond = new Date().getSeconds();
        return ({
            // get current hour
            disabledHours: () => range(0, 24).splice(0, currentHour),
            disabledMinutes: () => range(0, currentMinute),
            // disabledSeconds: () => range(0, currentSecond),
        })
    };

    const onFinishFailed = (errorInfo: any) => {
        const descriptionField = errorInfo.errorFields.find((error: any) => error.name[0] === 'description')
        if (descriptionField) {
            setisDescriptionFieldError(true);
        }
    }

    const onFinish = async (values: any) => {
        executePostDataToServer(values, false);
    };

    const handleSaveDraft = async () => {
        const title = form.getFieldValue("name")
        if (title && title.length) {
            const values = form.getFieldsValue();
            executePostDataToServer(values, true);
        } else {
            message.error(t("Please enter title to save draft"));
        }
    }

    const findNameWithTypeById = (id: string, addressType: string, addressArray: any = null) => {
        // addressType = 'province' | 'district' | 'wards'
        if (addressType === 'province') {
            const province: any = provinces.find((province: any) => province.id === id);
            return province ? province.nameWithType : '';
        } else if (addressType === 'district') {
            const district = (addressArray || districts).find((district: any) => district.id === id);
            return district ? district.nameWithType : '';
        } else if (addressType === 'ward') {
            const ward = (addressArray || wards).find((ward: any) => ward.id === id);
            return ward ? ward.nameWithType : '';
        }
    }

    const findIdByNameWithType = (nameWithType: string, addressType: string) => {
        // addressType = 'province' | 'district' | 'wards'
        if (addressType === 'province') {
            const province: any = provinces.find((province: any) => province.nameWithType === nameWithType);
            return province ? province.id : '';
        } else if (addressType === 'district') {
            const district: any = districts.find((district: any) => district.nameWithType === nameWithType);
            return district ? district.id : '';
        } else if (addressType === 'ward') {
            const ward: any = wards.find((ward: any) => ward.nameWithType === nameWithType);
            return ward ? ward.id : '';
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
                provinceId = findIdByNameWithType(addressSelectionsArray[2], 'province');
                districtId = findIdByNameWithType(addressSelectionsArray[1], 'district');
                wardId = findIdByNameWithType(addressSelectionsArray[0], 'ward');
                fullAddress = [detailedAddress, addressSelectionsArray[0], addressSelectionsArray[1], addressSelectionsArray[2], "Việt Nam"].join(", ")
            }
        }

        const imageArray: any = [];

        if (values.images) {
            values.images.forEach((image: any) => {
                if (image.response) {
                    imageArray.push(image.response.result.variants[0]);
                }
            });
        }

        let detail: any = {
            locationDetail: values.locationDetail?.toHTML(),
            description: values.description,
            images: imageArray,
            contact: {
                "name": (accountInfo.firstName || accountInfo.lastName) ? `${accountInfo.firstName && accountInfo.firstName}${accountInfo.lastName && " " + accountInfo.lastName}` : "Pindias",
                "mobile": accountInfo.phone || "1800234546",
                "email": accountInfo.email || "marcom@pindias.com",
                "province": ""
            },
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

        const postData = {
            accountId: 1,
            area: values.area,
            areaUnit: values.areaUnit,
            baths: values.baths,
            beds: values.beds,
            categoryName: values.categoryName,
            currency: values.currency,
            detail: JSON.stringify(detail),
            direction: values.direction.toUpperCase(),
            latitude: latLngObject?.latitude != null ? latLngObject.latitude : "",
            longitude: latLngObject?.longitude != null ? latLngObject.longitude : "",
            location: values.address.detail,
            province: provinceId,
            district: districtId,
            ward: wardId,
            juridical: values.juridical,
            name: values.name,
            postType: "REGULAR", // hard fixed
            price: Number(values.price?.replaceAll(",", "")), // replace comma with empty string and turn to number
            projectId: values.projectId,
            purpose: values.purpose,
            source: "Pindias",
            startDate: values.startDate ? moment(values.startDate).format("YYYY-MM-DDTHH:mm:ss.SSS") : moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            endDate: values.endDate ? moment(values.endDate).format("YYYY-MM-DDTHH:mm:ss.SSS") : moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            status: isSaveDraft ? "DRAFT" : "PENDING",
            thumbnail: imageArray[0],
            view: 0,
        };

        window.scrollTo(0, 0);
        setLoading(true);

        // post data to server
        const response = await fetchCreateNewRealEstate(postData, setLoading);
        if (response) {
            if (response.status === 200) {
                if (isSaveDraft) {
                    message.success(t("Save draft successfully"));
                    navigate("/real-estate/drafts");
                } else {
                    message.success(t("Create new real estate successfully"));
                    navigate("/real-estate/all");
                }
            } else {
                message.error(response.data);
            }
        } else {
            message.error(isSaveDraft ? t("Save as draft failed") : t("Create new real estate failed"));
        }
    }

    const onReset = () => {
        form.resetFields();
        // toggle isReset
        setisReset(!isReset);
        setisDescriptionFieldError(false);
    };

    const handleTextEditorChange = (e: any) => {
        // remove all tags and keep only text
        settext(e.replace(/<[^>]*>/g, ""));
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
            const formattedPriceString = Number(e.target.value.replaceAll(",", "")).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
            const stringifiedPricePerArea = (isDecimal ? "~" : "") + Number(pricePerArea.toFixed(0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            const currentAreaUnit = form.getFieldValue('areaUnit') === "M2" ? "m²" : form.getFieldValue('areaUnit')
            const priceSuffixText = `${stringifiedPricePerArea} / ${currentAreaUnit}`
            setpriceSuffixText(priceSuffixText)
        }
    }

    return (
        <div id="create-new-real-estate">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("create-new")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("real-estate-manager")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("create-new")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="site-layout-background">
                <Spin spinning={loading}>
                    <Row justify="center">
                        <Col span={18}>
                            <Form
                                {...layout}
                                form={form}
                                name="control-hooks"
                                layout="vertical"
                                labelCol={{
                                    flex: '25px',
                                }}
                                labelWrap
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                initialValues={{
                                    purpose: "SELL",
                                    areaUnit: "M2",
                                    juridical: "House Ownership Certificate",
                                    direction: "North",
                                    autoRepost: true,
                                    currency: "VND",
                                    categoryName: "VILLA",
                                    projectId: 0,
                                    baths: 0,
                                    beds: 0,
                                    price: "0",
                                    usageArea: 0,
                                    facade: 0,
                                    length: 0,
                                    width: 0,
                                }}
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
                                <Form.Item>
                                    <Row style={{ justifyContent: 'space-between' }}>
                                        <Col xs={24} sm={24} md={10}>
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
                                                        categories &&
                                                        categories.map((category: any) =>
                                                            <Option key={category.id} value={category.name}>{category.name}</Option>
                                                        )
                                                    }
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={10}>
                                            <Form.Item
                                                label={t("project")}
                                                name="projectId"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: `${t("please-select")} ${t("project").toLowerCase()}!`,
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

                                <Form.Item>
                                    <Row className="w-100 justify-content-between">
                                        <Col xs={24} sm={24} md={11}>
                                            <Row style={{ alignItems: 'flex-end' }}>
                                                <Col span={18}>
                                                    <Form.Item
                                                        name="area"
                                                        label={t("area")}
                                                        style={{ width: "100%" }}
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
                                                <Col span={6}>
                                                    <Form.Item name="areaUnit" style={{ width: "100%" }}>
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
                                            </Row>
                                        </Col>
                                        <Col xs={24} sm={24} md={11}>
                                            <Row style={{ alignItems: 'flex-end' }}>
                                                <Col span={18}>
                                                    <Form.Item
                                                        label={t("price")}
                                                        className="d-flex"
                                                        name="price"
                                                        style={{ width: "100%" }}
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
                                                <Col span={6}>
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
                                        </Col>
                                    </Row>
                                </Form.Item>

                                <Form.Item>

                                    <Input.Group compact>
                                        <Row className="w-100 d-flex justify-content-between">
                                            <Col xs={24} sm={24} md={11}>
                                                <Form.Item
                                                    label={t("length")}
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
                                            <Col xs={24} sm={24} md={11}>
                                                <Form.Item
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

                                <Form.Item>
                                    <Input.Group compact>
                                        <Row className="w-100 d-flex justify-content-between">
                                            <Col xs={24} sm={24} md={11}>
                                                <Form.Item
                                                    style={{ width: "100%" }}
                                                    label={t("usage area")}
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
                                            <Col xs={24} sm={24} md={11}>
                                                <Form.Item
                                                    label={t("facade")}
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

                                <ImageUploader isReset={isReset} />

                                <Form.Item className="required-label">
                                    <Input.Group compact>
                                        <Row className="w-100 d-flex justify-content-between">
                                            <Col xs={24} sm={24} md={11}>
                                                <Form.Item
                                                    style={{ width: "100%" }}
                                                    label={t("bedrooms")}
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
                                            <Col xs={24} sm={24} md={11}>
                                                <Form.Item
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
                                >
                                    <Input.Group compact>
                                        <Row className="w-100 d-flex justify-content-between">
                                            <Col xs={24} sm={24} md={11}>
                                                <Form.Item
                                                    name="juridical"
                                                    label={t("juridical")}
                                                    style={{ width: "100%" }}
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
                                            <Col xs={24} sm={24} md={11}>
                                                <Form.Item
                                                    label={t("direction")}
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

                                <Form.Item className="required-label">
                                    <Input.Group compact>
                                        <Row className="w-100 d-flex justify-content-between">
                                            <Col xs={24} sm={24} md={10}>
                                                <Form.Item
                                                    label={t("start-date")}
                                                    style={{ width: "100%" }}
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
                                                    <DatePicker
                                                        disabledDate={disabledDate}
                                                        disabledTime={disabledDateTime}
                                                        showTime
                                                        style={{ width: "100%" }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={10}>
                                                <Form.Item
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
                                                    <DatePicker showTime style={{ width: "100%" }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Input.Group>
                                </Form.Item>

                                {/* <Form.Item name="autoRepost" label="Auto repost">
                            <Switch checked={isautoRepost} onChange={() => setisautoRepost((value) => !value)} />
                        </Form.Item> */}

                                <Form.Item className="justify-content-center">
                                    <Row>
                                        <Col xs={24} sm={24} md={8}>
                                            <Button type="primary" htmlType="submit" className="btnCreate">
                                                {t("create-new")}
                                            </Button>
                                        </Col>
                                        <Col xs={24} sm={24} md={8}>
                                            <Button htmlType="button" onClick={handleSaveDraft} className="btnSaveDraft">
                                                {t("save-draft")}
                                            </Button>
                                        </Col>
                                        <Col xs={24} sm={24} md={8}>
                                            <Button htmlType="button" onClick={onReset} className="btnReset">
                                                {t("reset")}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>

                </Spin>
            </div>
        </div >
    );
}

export default CreateNew;