import React, { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    Breadcrumb,
    Row,
    Col,
    Typography,
    Space,
    message,
    Spin,
    Cascader,
    DatePicker,
    Divider,
    Checkbox,
    notification,
    Modal,
} from "antd";
import { PlusCircleOutlined, SaveOutlined, ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchAllInvestor } from "../../../service/investor";
import { fetchAllCategory } from "../../../service/category";

import ImageUploader from "./ImageUploader";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import BraftEditor from "braft-editor";

import moment from "moment";
import { fetchCities, fetchDistricts, fetchWards } from "../../../service/getProvinces";
import { fetchGetProjectDetails } from "../../../service/projects";
import { fetchUpdateProject } from "../../../service/projects";
import { fetchGetDistrictsByProvinceId, fetchGetProvinces, fetchGetWardsByDistrictId } from "../../../service/Address/getAddress";
import { fetchGetCategories } from "../../../service/Categories/Categories";
import { cascaderFilter } from "../../../Hooks/CascaderHelper";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const googleMapApiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY as string;

function EditProject(): JSX.Element {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const [form] = Form.useForm();
    const navigate = useNavigate();
    let { params } = useParams();

    const [projectDetails, setProjectDetails] = useState<any>([]);
    const [projectImages, setProjectImages] = useState<any>([]);
    const [center, setCenter] = useState<any>();
    const [investor, setInvestor] = useState<any>([]);
    const [categories, setCategories] = useState<any>([]);
    const [options, setOptions] = useState<any>([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState<any>([]);
    const [wards, setWards] = useState<any>([]);
    const [isReset, setIsReset] = useState(false);
    const [isDescriptionFieldError, setisDescriptionFieldError] = useState(false);
    const [text, setText] = useState("");
    const [disabledEdit, setDisabledEdit] = useState(true);

    //  * Set metadata for project
    const [metaData, setMetaData] = useState<any>([]);

    useEffect(() => {
        getProjectDetails();
        getCategoriesList();
        getAllInvestor();
        getProvinces();
    }, []);

    const getProjectDetails = () => {
        setLoading(true);
        const response = fetchGetProjectDetails(params)
            .then((res: any) => {
                setLoading(true);

                if (res.status === 200) {
                    setProjectDetails(res.data);
                    const data = res.data;
                    if (data !== null) {
                        setMetaData(data.metadata);
                        const metaValue = JSON.parse(data.metaData);
                        form.setFieldsValue({
                            ...data,
                            ...metaValue,
                            ...metaValue.utilities,
                            area: parseInt(metaValue.area).toLocaleString(),
                            constructionArea: parseInt(metaValue.constructionArea).toLocaleString(),
                            priceFrom: metaValue.priceFrom ? Number(metaValue.priceFrom).toLocaleString() : "",
                            priceTo: metaValue.priceTo ? parseInt(metaValue.priceTo).toLocaleString() : "",
                            buildingNumber: parseInt(metaValue.buildingNumber).toLocaleString(),
                            productNumber: metaValue.productNumber ? parseInt(metaValue.productNumber).toLocaleString() : "",
                            address: { selections: [data.location.province, data.location.district, data.location.wards], detail: data.location.address },
                            detailLocation: BraftEditor.createEditorState(metaValue.detailLocation),
                            detailUtility: BraftEditor.createEditorState(metaValue.utilities.detailUtility),
                            ground: BraftEditor.createEditorState(metaValue.ground),
                            utilities: BraftEditor.createEditorState(metaValue.utilities),
                            reasonsToInvest: BraftEditor.createEditorState(metaValue.reasonsToInvest),
                            investor: data.investorId,
                            startDate: moment.utc(data.startDate).clone().local(),
                            endDate: moment.utc(data.endDate).clone().local(),
                            timeStart: metaValue.timeStart !== undefined ? moment.utc(metaValue.timeStart).clone().local() : null,
                            timeComplete: metaValue.timeComplete !== undefined ? moment.utc(metaValue.timeComplete).clone().local() : null,
                            location: { selections: [data.location.province, data.location.district, data.location.wards], detail: data.location.address },
                        });
                    }

                    const center = {
                        lat: Number(res.data.latitude),
                        lng: Number(res.data.longitude),
                    };
                    const imageArray = JSON.parse(res.data.images);
                    setProjectImages(imageArray);
                    setCenter(center);

                    const currentData = res.data;
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
        setLoading(false);
    };

    const getAllInvestor = async () => {
        const response = await fetchAllInvestor();
        if (response) {
            if (response.status === 200) {
                setInvestor(response.data.content);
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Get all investors failed");
        }
    };

    const getCategoriesList = async () => {
        const filters = { status: "ACTIVE", type: "PROJECT" };
        const response = await fetchGetCategories(filters);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                if (contents.length > 0) {
                    const data = contents.map((content: any) => {
                        return { ...content, key: content.id };
                    });
                    setCategories(data);
                    form.setFieldsValue({
                        category: data[0].name,
                    });
                } else {
                    setCategories([]);
                }
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t("Get categories list failed"));
        }
    };
    const getProvinces = async () => {
        const response = await fetchGetProvinces();
        if (response) {
            if (response.status === 200) {
                setProvinces(response.data);
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
            message.error("Get provinces failed");
        }
    };

    const getLatitudeLongitude = async (address: string) => {
        // example address: 'trang tien plaza';
        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googleMapApiKey}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.error_message) return message.error(data.error_message);
        if (data.results.length > 0) {
            return {
                latitude: data.results[0].geometry.location.lat,
                longitude: data.results[0].geometry.location.lng,
            };
        } else {
            return message.error("Can not find location");
        }
    };

    const getDestinations = async (functionName: any, parentId: any, targetOption: any, isGettingDistricts: boolean) => {
        const response = await functionName(parentId);
        if (response) {
            if (response.status === 200) {
                targetOption.loading = false;
                if (isGettingDistricts) {
                    setDistricts(response.data);
                    targetOption.children = response.data.map((district: any) => {
                        return {
                            value: district.id,
                            label: district.nameWithType,
                            isLeaf: false,
                        };
                    });
                } else {
                    setWards(response.data);
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
            message.error(`Get ${isGettingDistricts ? "districts" : "wards"} failed`);
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

    const findNameWithTypeById = (id: string, addressType: string, addressArray: any = null) => {
        // addressType = 'province' | 'district' | 'wards'
        if (addressType === "province") {
            const province: any = provinces.find((province: any) => province.id === id);
            return province ? province.nameWithType : "";
        } else if (addressType === "district") {
            const district = (addressArray || districts).find((district: any) => district.id === id);
            return district ? district.nameWithType : "";
        } else if (addressType === "ward") {
            const ward = (addressArray || wards).find((ward: any) => ward.id === id);
            return ward ? ward.nameWithType : "";
        }
    };

    const findIdByNameWithType = (nameWithType: string, addressType: string) => {
        // addressType = 'province' | 'district' | 'wards'
        if (addressType === "province") {
            const province: any = provinces.find((province: any) => province.nameWithType === nameWithType);
            return province ? province.id : "";
        } else if (addressType === "district") {
            const district: any = districts.find((district: any) => district.nameWithType === nameWithType);
            return district ? district.id : "";
        } else if (addressType === "ward") {
            const ward: any = wards.find((ward: any) => ward.nameWithType === nameWithType);
            return ward ? ward.id : "";
        }
    };

    const onCheckboxUtilities = (checkedValues: CheckboxValueType[]) => {
        // console.log("checked = ", checkedValues);
    };

    const myUploadFn = (param: any) => {
        const serverURL = "https://v2.pindias.com/api/v2/image/upload";
        const xhr = new XMLHttpRequest();
        const fd = new FormData();

        const successFn = (response: any) => {
            //After the upload is successful, call param.success and pass in the uploaded file address
            const imageUrl = JSON.parse(xhr.response).result.variants[0];
            param.success({
                url: imageUrl,
            });
        };

        const progressFn = (event: any) => {
            //call param.progress when upload progress changes
            param.progress((event.loaded / event.total) * 100);
        };

        const errorFn = (response: any) => {
            //call param.error when upload error occurs
            param.error({
                msg: "Unable to upload",
            });
        };

        xhr.upload.addEventListener("progress", progressFn, false);
        xhr.addEventListener("load", successFn, false);
        xhr.addEventListener("error", errorFn, false);
        xhr.addEventListener("abort", errorFn, false);

        fd.append("file", param.file);
        xhr.open("POST", serverURL, true);
        xhr.send(fd);
    };

    const onFinish = async (values: any) => {
        executePostDataToServer(values, false);
    };

    const handleSaveDraft = async () => {
        const title = form.getFieldValue("name");
        if (title && title.length) {
            const values = form.getFieldsValue();
            executePostDataToServer(values, true);
        } else {
            message.error(t("Please enter title to save draft"));
        }
    };

    const executePostDataToServer = async (values: any, isSaveDraft: boolean) => {
        const addressSelectionsArray = values.address.selections;
        let provinceId = addressSelectionsArray ? addressSelectionsArray[0] : "";
        let districtId = addressSelectionsArray ? addressSelectionsArray[1] : "";
        let wardId = addressSelectionsArray ? addressSelectionsArray[2] : "";
        const detailedAddress = values.address.detail;
        let fullAddress: any = [];
        if (addressSelectionsArray) {
            let isAllNumbers = true;
            addressSelectionsArray.forEach((address: string, index: any) => {
                // check if address contains numbers only or not
                if (!address.match(/^[0-9]+$/)) {
                    isAllNumbers = false;
                }
            });
            if (isAllNumbers) {
                const provinceName = findNameWithTypeById(provinceId, "province");
                const districtName = findNameWithTypeById(districtId, "district");
                const wardName = findNameWithTypeById(wardId, "ward");
                fullAddress = {
                    country: "Việt Nam",
                    province: provinceName,
                    district: districtName,
                    wards: wardName,
                    address: detailedAddress,
                };
            } else {
                provinceId = findIdByNameWithType(addressSelectionsArray[2], "province");
                districtId = findIdByNameWithType(addressSelectionsArray[1], "district");
                wardId = findIdByNameWithType(addressSelectionsArray[0], "ward");
                fullAddress = {
                    country: "Việt Nam",
                    province: addressSelectionsArray[2],
                    district: addressSelectionsArray[1],
                    wards: addressSelectionsArray[0],
                    address: detailedAddress,
                };
            }
        }

        const imageArray: any = [];

        if (values.images && typeof values.images === "object") {
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
        } else {
            const image = JSON.parse(values.images);
            image.forEach((image: any) => {
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
        const latLngObject = fullAddress.length === 0 ? { lat: "", lng: "" } : await getLatitudeLongitude(JSON.stringify(fullAddress));
        const postData = {
            category: values.category !== undefined ? values.category : categories[0].id,
            description: values.description ? values.description : null,
            images: JSON.stringify(imageArray),
            investorId: values.investor ? values.investor : "",
            provinceId: provinceId ? provinceId : "",
            districtId: districtId ? districtId : "",
            wardId: wardId ? wardId : "",
            latitude: latLngObject?.latitude != null ? latLngObject.latitude : "",
            longitude: latLngObject?.longitude != null ? latLngObject.longitude : "",
            location: {
                address: fullAddress.address,
                country: fullAddress.country,
                district: fullAddress.district,
                province: fullAddress.province,
                wards: fullAddress.wards,
            },
            metaData: JSON.stringify({
                youtubeLink: values.youtubeLink,
                streetView: values.streetView,
                link3dview: values.link3dview,
                area: values.area?.replaceAll(",", ""),
                areaType: values.areaType,
                areaUnit: values.areaUnit,
                priceFrom: values.priceFrom?.replaceAll(",", ""),
                priceTo: values.priceTo?.replaceAll(",", ""),
                moreInfo: values.moreInfo,
                priceUnit: values.priceUnit,
                detailLocation: values.detailLocation ? values.detailLocation.toHTML() : null,
                timeStart: values.timeStart,
                timeComplete: values.timeComplete,
                fluctuatingPrice: values.fluctuatingPrice,
                buildingNumber: values.buildingNumber?.replaceAll(",", ""),
                productNumber: values.productNumber?.replaceAll(",", ""),
                constructionArea: values.constructionArea?.replaceAll(",", ""),
                utilities: {
                    detailUtility: values.detailUtility ? values.detailUtility.toHTML() : null,
                    consumptionAndCuisine: values.consumptionAndCuisine,
                    educationAndMedical: values.educationAndMedical,
                    entertainment: values.entertainment,
                    infrastructure: values.infrastructure,
                    securityAndHygiene: values.securityAndHygiene,
                    sport: values.sport,
                },
                ground: values.ground ? values.ground.toHTML() : null,
                reasonsToInvest: values.reasonsToInvest ? values.reasonsToInvest.toHTML() : null,
            }),
            name: values.name,
            price: 0,
            startDate: values.startDate,
            endDate: values.endDate ? values.endDate : null,
            status: isSaveDraft === false ? values.status : "DRAFT",
            thumbnail: imageArray[0],
        };

        window.scrollTo(0, 0);
        setLoading(true);
        const response = await fetchUpdateProject(postData, params, setLoading);
        if (response) {
            if (response.status === 200) {
                setLoading(true);
                if (isSaveDraft === true) {
                    setTimeout(() => {
                        notification.success({
                            message: "Save draft successfully",
                        });
                        navigate("/project/drafts");
                    }, 500);
                } else {
                    setTimeout(() => {
                        notification.success({
                            message: `${t("edit-project-info-message-success")}`,
                        });
                        navigate("/project/all");
                    }, 500);
                }
            } else {
                if (isSaveDraft === true) {
                    notification.error({
                        message: `${t("save-false")}`,
                    });
                } else {
                    notification.error({
                        message: `${t("edit-project-info-message-failed")}`,
                    });
                }
            }
        } else {
            message.error("Create new real estate failed");
        }
        setLoading(false);
    };

    const onFinishFailed = (errorInfo: any) => {
        const descriptionField = errorInfo.errorFields.find((error: any) => error.name[0] === "description");
        if (descriptionField) {
            setisDescriptionFieldError(true);
        }
    };

    const onReset = () => {
        Modal.confirm({
            title: "Confirm",
            icon: <ExclamationCircleOutlined />,
            content: "Do you want to delete all entered information?",
            okText: "Reset all fields",
            cancelText: "Cancel",
            onOk() {
                form.resetFields();
            },
        });
    };

    const handleAreaInputChange = (e: any, key: any) => {
        const formattedPriceString = Number(e.target.value.replaceAll(",", "")).toLocaleString();
        if (key === "area") {
            form.setFieldsValue({ area: formattedPriceString });
        } else if (key === "constructionArea") {
            form.setFieldsValue({ constructionArea: formattedPriceString });
        }
    };

    const handlePriceInputChange = (e: any, key: any) => {
        const formattedPriceString = Number(e.target.value.replaceAll(",", "")).toLocaleString();
        if (key === "priceFrom") {
            form.setFieldsValue({ priceFrom: formattedPriceString });
        } else if (key === "priceTo") {
            form.setFieldsValue({ priceTo: formattedPriceString });
        } else if (key === "productNumber") {
            form.setFieldsValue({ productNumber: formattedPriceString });
        } else if (key === "buildingNumber") {
            form.setFieldsValue({ buildingNumber: formattedPriceString });
        }
    };

    const handleValidate = (rules: any, value: any) => {
        const newValue = Number(rules.target.value.replaceAll(",", ""));
        const a = Number(form.getFieldValue("area").replaceAll(",", ""));

        if (newValue > a) {
            form.validateFields()
                .then((values: any) => {
                    Promise.reject("aloha");
                })
                .catch((errorInfo: any) => {
                    console.log("errorInfo", errorInfo);
                });
        } else {
            return Promise.resolve();
        }
    };

    const style: React.CSSProperties = { background: "#0092ff", padding: "8px 0" };
    return (
        <>
            <Spin spinning={loading} tip="Loading...">
                <div id="update-project-info">
                    <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                        <Title level={4}>{t("edit-project-info")}</Title>
                        <Breadcrumb>
                            <Breadcrumb.Item>{t("project-manager")}</Breadcrumb.Item>
                            <Breadcrumb.Item>{t("edit-project-info")}</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <Link to={"/project/all"} style={{ fontSize: 12 }}>
                        {t("project-back-to-all-list")}
                    </Link>
                    <div className="site-layout-background" style={{ padding: "24px 50px" }}>
                        <Row justify="center">
                            <Col span={18}>
                                <Spin spinning={loading} tip="Submitting request...">
                                    <Title level={4} className="mb-4">
                                        {t("basic-info")}
                                    </Title>
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={onFinish}
                                        onFinishFailed={onFinishFailed}
                                        autoComplete="off"
                                        initialValues={{
                                            areaUnit: "M2",
                                            priceUnit: "VND",
                                            // startDate: moment(),
                                        }}
                                    >
                                        <Row gutter={16}>
                                            <Col className="gutter-row" span={6}>
                                                <div>
                                                    <Form.Item
                                                        name="name"
                                                        label={t("project-name")}
                                                        rules={[{ required: true, message: `${t("project-message-required-name")}` }]}
                                                    >
                                                        <Input placeholder={t("project-placeholder")} className="inputLayout" />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col className="gutter-row" span={6}>
                                                <Form.Item
                                                    name="category"
                                                    label={t("category")}
                                                    rules={[{ required: true, message: "Please select category" }]}
                                                >
                                                    <Select
                                                        className="text-center"
                                                        showSearch
                                                        placeholder={t("select-category")}
                                                        optionFilterProp="children"
                                                        // onChange={onChange}
                                                        // onSearch={onSearch}
                                                        filterOption={(input, option) =>
                                                            (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                                                        }
                                                    >
                                                        {categories.map((item: any) => (
                                                            <Option key={item.id} className="text-center" value={item.name}>
                                                                {item.name}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col className="gutter-row" span={6}>
                                                <div>
                                                    <Form.Item
                                                        name="investor"
                                                        label={t("investor")}
                                                        rules={[{ required: true, message: `${t("investor-required-name")}` }]}
                                                    >
                                                        <Select
                                                            className="text-center"
                                                            showSearch
                                                            placeholder={t("select-investor")}
                                                            optionFilterProp="children"
                                                            // onChange={onChange}
                                                            // onSearch={onSearch}
                                                            filterOption={(input, option) =>
                                                                (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                                                            }
                                                        >
                                                            {investor.map((item: any) => (
                                                                <Option key={item.id} className="text-center" value={item.id}>
                                                                    {item.name}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col className="gutter-row" span={6}>
                                                <div>
                                                    <Form.Item
                                                        name="status"
                                                        label={t("status")}
                                                        rules={[{ required: true, message: `${t("status-select-required")}` }]}
                                                    >
                                                        <Select
                                                            showSearch
                                                            placeholder={t("status-placeholder")}
                                                            optionFilterProp="children"
                                                            // onChange={onChange}
                                                            // onSearch={onSearch}
                                                            filterOption={(input, option) =>
                                                                (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                                                            }
                                                        >
                                                            <Option value="APPROVED">{t("approved")}</Option>
                                                            <Option value="PENDING">{t("pending")}</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Form.Item className="required-label" label={t("address")} name="location">
                                            <Row>
                                                <Col span={24}>
                                                    <Input.Group compact>
                                                        <Form.Item
                                                            name={["address", "selections"]}
                                                            noStyle
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: `${t("address-required")}`,
                                                                },
                                                            ]}
                                                        >
                                                            <Cascader
                                                                style={{ width: "100%" }}
                                                                options={options}
                                                                loadData={loadData}
                                                                placeholder={t("address-placeholder")}
                                                                changeOnSelect
                                                                showSearch={{
                                                                    // @ts-ignore
                                                                    cascaderFilter,
                                                                }}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            name={["address", "detail"]}
                                                            noStyle
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: `${t("address-detail-required")}`,
                                                                },
                                                            ]}
                                                        >
                                                            <Input className="mt-1" placeholder={t("address-detail")} />
                                                        </Form.Item>
                                                    </Input.Group>
                                                </Col>
                                            </Row>
                                        </Form.Item>

                                        <Row gutter={16}>
                                            <Col className="gutter-row" span={12}>
                                                <div>
                                                    <Form.Item
                                                        name="startDate"
                                                        label={t("project-start-time-selling")}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "Start date is required",
                                                            },
                                                            {
                                                                validator: (rule: any, value: any, callback: any) => {
                                                                    if (value && value > moment(Date.now()).format("YYYY-MM-DD")) {
                                                                        callback("Start date must be in the past");
                                                                    } else {
                                                                        callback();
                                                                    }
                                                                },
                                                            },
                                                        ]}
                                                    >
                                                        <DatePicker showTime style={{ width: "100%" }} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                            <Col className="gutter-row" span={12}>
                                                <div>
                                                    <Form.Item
                                                        name="endDate"
                                                        label={t("project-end-time-selling")}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "End date is required",
                                                            },
                                                            {
                                                                validator: (rule: any, value: any, callback: any) => {
                                                                    if (value && value < form.getFieldValue("startDate")) {
                                                                        callback("End date must be after start date");
                                                                    } else {
                                                                        callback();
                                                                    }
                                                                },
                                                            },
                                                        ]}
                                                    >
                                                        <DatePicker showTime style={{ width: "100%" }} />
                                                    </Form.Item>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            name="description"
                                            label={t("description")}
                                            rules={[{ required: true, message: `${t("description-placeholder-required")}` }]}
                                        >
                                            <TextArea showCount maxLength={2000} style={{ height: 120 }} placeholder={t("description-placeholder")} />
                                        </Form.Item>
                                        <Form.Item
                                            name="moreInfo"
                                            label={t("more-info")}
                                            rules={[{ required: true, message: `${t("more-info-placeholder-required")}` }]}
                                        >
                                            <TextArea showCount maxLength={700} style={{ height: 120 }} placeholder={t("more-info-placeholder")} />
                                        </Form.Item>
                                        <hr />
                                        <Title level={4} className="mb-4">
                                            {t("project-detail")}
                                        </Title>

                                        <ImageUploader isReset={isReset} defaultImages={projectImages} />

                                        <Divider orientation="left" style={{ fontSize: 14 }}>
                                            {t("media")}
                                        </Divider>
                                        <Form.Item name="youtubeLink" label={t("youtube-link")}>
                                            <Input placeholder="https://www.youtube.com/watch?v=cxkJgHovdMU" />
                                        </Form.Item>

                                        <Form.Item name="streetView" label={t("street-view")}>
                                            <Input placeholder="https://www.google.com/maps/@21.010852,105.827539,14z" />
                                        </Form.Item>

                                        <Form.Item name="link3dview" label={t("link3dview")}>
                                            <Input placeholder="https://my.matterport.com/show/?m=DYvDJrHBxW1aA" />
                                        </Form.Item>

                                        <Divider orientation="left" style={{ fontSize: 14 }}>
                                            {t("area-price-start-time-info")}
                                        </Divider>
                                        <Row gutter={16}>
                                            <Col className="gutter-row" span={12}>
                                                <div>
                                                    {/* <Form.Item
                                                        name="timeStart"
                                                        label={t("project-start-time-construction")}
                                                        rules={[{ required: true, message: `${t("project-start-time-construction-required")}` }]}
                                                    >
                                                        <DatePicker showTime style={{ width: "100%" }} placeholder={t("select-date")} />
                                                    </Form.Item> */}
                                                    <Row gutter={16}>
                                                        <Col className="gutter-row" span={12}>
                                                            <div>
                                                                <Form.Item
                                                                    name="timeStart"
                                                                    label={t("project-start-time-construction")}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: "Start date is required",
                                                                        },
                                                                        {
                                                                            validator: (rule: any, value: any, callback: any) => {
                                                                                if (value && value > moment(Date.now()).format("YYYY-MM-DD")) {
                                                                                    callback("Start date must be in the past");
                                                                                } else {
                                                                                    callback();
                                                                                }
                                                                            },
                                                                        },
                                                                    ]}
                                                                >
                                                                    <DatePicker showTime style={{ width: "100%" }} />
                                                                </Form.Item>
                                                            </div>
                                                        </Col>
                                                        <Col className="gutter-row" span={12}>
                                                            <div>
                                                                <Form.Item
                                                                    name="timeComplete"
                                                                    label={t("project-end-time-construction")}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: "End date is required",
                                                                        },
                                                                        {
                                                                            validator: (rule: any, value: any, callback: any) => {
                                                                                if (value && value < form.getFieldValue("timeStart")) {
                                                                                    callback("End date must be after start date");
                                                                                } else {
                                                                                    callback();
                                                                                }
                                                                            },
                                                                        },
                                                                    ]}
                                                                >
                                                                    <DatePicker showTime style={{ width: "100%" }} />
                                                                </Form.Item>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Form.Item
                                                        name="buildingNumber"
                                                        label={t("project-building-number")}
                                                        rules={[{ required: true, message: `${t("project-building-number-required")}` }]}
                                                    >
                                                        <Input
                                                            placeholder={t("project-building-number-placeholder")}
                                                            className="inputLayout"
                                                            onChange={(e) => handlePriceInputChange(e, "buildingNumber")}
                                                            onKeyPress={(e: any) =>
                                                                !isNaN(e.key) ? handlePriceInputChange(e, "buildingNumber") : e.preventDefault()
                                                            }
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        name="productNumber"
                                                        label={t("project-product-number")}
                                                        rules={[{ required: true, message: `${t("project-product-number-required")}` }]}
                                                    >
                                                        <Input
                                                            placeholder={t("project-product-number-placeholder")}
                                                            className="inputLayout"
                                                            onChange={(e) => handlePriceInputChange(e, "productNumber")}
                                                            onKeyPress={(e: any) =>
                                                                !isNaN(e.key) ? handlePriceInputChange(e, "productNumber") : e.preventDefault()
                                                            }
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        className={`required-label ${isDescriptionFieldError ? "react-quill-error" : ""}`}
                                                        rules={[{ required: true, message: "Please input project time start!" }]}
                                                        style={{ width: "fit-content", textAlign: "center" }}
                                                    >
                                                        <Input.Group compact className="d-flex required-label">
                                                            <Form.Item
                                                                name="priceFrom"
                                                                label={t("minimum-price")}
                                                                rules={[
                                                                    { required: true, message: `${t("minimum-price-required")}` },
                                                                    {
                                                                        validator: (rule, value) => {
                                                                            const newValue = Number(value.replaceAll(",", ""));
                                                                            const priceTo = Number(form.getFieldValue("priceTo").replaceAll(",", ""));
                                                                            if (newValue > priceTo) {
                                                                                return Promise.reject(`${t("minimum-price-validate")}`);
                                                                            } else {
                                                                                return Promise.resolve();
                                                                            }
                                                                        },
                                                                    },
                                                                ]}
                                                                className="d-flex"
                                                                style={{ width: "39%", textAlign: "center" }}
                                                            >
                                                                <Input
                                                                    min={0}
                                                                    placeholder={t("minimum-price-placeholder")}
                                                                    onChange={(e) => handlePriceInputChange(e, "priceFrom")}
                                                                    onKeyPress={(e: any) =>
                                                                        !isNaN(e.key) ? handlePriceInputChange(e, "priceFrom") : e.preventDefault()
                                                                    }
                                                                    onKeyUp={
                                                                        form.getFieldError("priceFrom")
                                                                            ? () => {
                                                                                  form.validateFields(["priceFrom"]);
                                                                              }
                                                                            : () => {}
                                                                    }
                                                                />
                                                            </Form.Item>
                                                            <Input
                                                                className="site-input-split required-label d-flex align-items-end"
                                                                style={{
                                                                    width: "7%",
                                                                    // height: "100%",
                                                                    border: "none",
                                                                    background: "transparent",
                                                                }}
                                                                placeholder="~"
                                                                disabled
                                                            />
                                                            <Form.Item
                                                                name="priceTo"
                                                                label={t("maximum-price")}
                                                                rules={[
                                                                    { required: true, message: `${t("maximum-price-required")}` },
                                                                    {
                                                                        validator: (rule, value) => {
                                                                            const newValue = Number(value.replaceAll(",", ""));
                                                                            const priceFrom = Number(form.getFieldValue("priceFrom").replaceAll(",", ""));
                                                                            if (newValue < priceFrom) {
                                                                                return Promise.reject(`${t("maximum-price-validate")}`);
                                                                            } else {
                                                                                return Promise.resolve();
                                                                            }
                                                                        },
                                                                    },
                                                                ]}
                                                                className="d-flex"
                                                                style={{ width: "39%", textAlign: "center" }}
                                                            >
                                                                <Input
                                                                    min={0}
                                                                    className="site-input-right required-label"
                                                                    style={{
                                                                        width: "100%",
                                                                        textAlign: "center",
                                                                    }}
                                                                    placeholder={t("maximum-price-placeholder")}
                                                                    onChange={(e) => handlePriceInputChange(e, "priceTo")}
                                                                    onKeyPress={(e: any) =>
                                                                        !isNaN(e.key) ? handlePriceInputChange(e, "priceTo") : e.preventDefault()
                                                                    }
                                                                    onKeyUp={
                                                                        form.getFieldError("priceTo")
                                                                            ? () => {
                                                                                  form.validateFields(["priceTo"]);
                                                                              }
                                                                            : () => {}
                                                                    }
                                                                />
                                                            </Form.Item>
                                                            <Form.Item name="priceUnit" label={t("unit-price")} style={{ width: "14%", textAlign: "center" }}>
                                                                <Select style={{ width: "100%", textAlign: "center" }}>
                                                                    <Option value="VND">VND</Option>
                                                                    {/* <Option value="USD">USD</Option> */}
                                                                </Select>
                                                            </Form.Item>
                                                        </Input.Group>
                                                    </Form.Item>
                                                </div>
                                            </Col>

                                            <Col className="gutter-row" span={12}>
                                                <Form.Item
                                                    name="area"
                                                    label={t("total-area")}
                                                    rules={[
                                                        { required: true, message: `{${t("total-area-required")}}` },
                                                        {
                                                            validator: (rule, value) => {
                                                                const newValue = Number(value.replaceAll(",", ""));
                                                                const a = Number(form.getFieldValue("constructionArea").replaceAll(",", ""));
                                                                if (newValue < a) {
                                                                    return Promise.reject(`{t("project-total-area-edit-valitdate")}`);
                                                                } else {
                                                                    return Promise.resolve();
                                                                }
                                                            },
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        // type={"number"}
                                                        min={0}
                                                        placeholder={t("total-area-placeholder")}
                                                        className="inputLayout"
                                                        onChange={(e) => handleAreaInputChange(e, "area")}
                                                        onKeyPress={(e: any) => (!isNaN(e.key) ? handleAreaInputChange(e, "area") : e.preventDefault())}
                                                        onKeyUp={
                                                            form.getFieldError("area")
                                                                ? () => {
                                                                      form.validateFields(["area"]);
                                                                  }
                                                                : () => {}
                                                        }
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name="constructionArea"
                                                    label={t("construction-area")}
                                                    rules={[
                                                        { required: true, message: "Please input construction area" },
                                                        {
                                                            validator: (rule, value) => {
                                                                const newValue = Number(value.replaceAll(",", ""));
                                                                const a = Number(form.getFieldValue("area").replaceAll(",", ""));
                                                                if (newValue > a) {
                                                                    return Promise.reject(`{t("project-construction-area-edit-valitdate")}`);
                                                                } else {
                                                                    return Promise.resolve();
                                                                }
                                                            },
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        // type={"number"}
                                                        min={0}
                                                        placeholder={t("construction-area-placeholder")}
                                                        className="inputLayout"
                                                        onChange={(e) => handleAreaInputChange(e, "constructionArea")}
                                                        onKeyPress={(e: any) =>
                                                            !isNaN(e.key) ? handleAreaInputChange(e, "constructionArea") : e.preventDefault()
                                                        }
                                                        onKeyUp={
                                                            form.getFieldError("constructionArea")
                                                                ? () => {
                                                                      form.validateFields(["constructionArea"]);
                                                                  }
                                                                : () => {}
                                                        }
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name="areaType"
                                                    label={t("area-type")}
                                                    rules={[{ required: true, message: `${t("area-type-required")}` }]}
                                                >
                                                    <Input placeholder={t("area-type-placeholder")} className="inputLayout" />
                                                </Form.Item>
                                                <Form.Item
                                                    name="areaUnit"
                                                    label={t("unit-area")}
                                                    rules={[{ required: true, message: `${t("unit-area-required")}` }]}
                                                >
                                                    <Select className="text-center">
                                                        <Option className="text-center" value="M2">
                                                            m<sup>2</sup>
                                                        </Option>
                                                        <Option className="text-center" value="ACRES">
                                                            Acres
                                                        </Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Divider orientation="left" style={{ fontSize: 14 }}>
                                            {t("utilities")}
                                        </Divider>
                                        <Form.Item name="utilities">
                                            <Row>
                                                <Col span={24}>
                                                    <Form.Item
                                                        name="infrastructure"
                                                        label={t("infrastructure")}
                                                        rules={[{ required: true, message: `${t("infrastructure-required")}` }]}
                                                    >
                                                        <Checkbox.Group style={{ width: "100%" }} onChange={onCheckboxUtilities}>
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
                                                        rules={[{ required: true, message: `${t("security-and-hygiene-required")}` }]}
                                                    >
                                                        <Checkbox.Group style={{ width: "100%" }} onChange={onCheckboxUtilities}>
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
                                                        rules={[{ required: true, message: `${t("education-and-medical-required")}` }]}
                                                        className="mb-0"
                                                    >
                                                        <Checkbox.Group style={{ width: "100%" }} onChange={onCheckboxUtilities}>
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
                                                        rules={[{ required: true, message: `${t("entertainment-required")}` }]}
                                                        className="mb-0"
                                                    >
                                                        <Checkbox.Group style={{ width: "100%" }} onChange={onCheckboxUtilities}>
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
                                                        rules={[{ required: true, message: `${t("consumption-and-cuisine-required")}` }]}
                                                        className="mb-0"
                                                    >
                                                        <Checkbox.Group style={{ width: "100%" }} onChange={onCheckboxUtilities}>
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
                                                        rules={[{ required: true, message: `${t("sport-area-required")}` }]}
                                                    >
                                                        <Checkbox.Group style={{ width: "100%" }} onChange={onCheckboxUtilities}>
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
                                                        className={`required-label ${isDescriptionFieldError ? "react-quill-error" : ""}`}
                                                        name={"detailUtility"}
                                                        label={t("utilities-details")}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: `${t("utilities-details-required")}`,
                                                            },
                                                        ]}
                                                    >
                                                        <BraftEditor
                                                            className={`required-label ${isDescriptionFieldError ? "react-quill-error" : ""}`}
                                                            language="en"
                                                            style={{ border: "1px solid #ccc" }}
                                                            media={{ uploadFn: myUploadFn }}
                                                            placeholder={t("utilities-details-placeholder")}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Form.Item>
                                        <hr />
                                        <Divider orientation="left" style={{ fontSize: 14 }}>
                                            {t("detail-location")}
                                        </Divider>
                                        <Form.Item
                                            className={`required-label ${isDescriptionFieldError ? "react-quill-error" : ""}`}
                                            name="detailLocation"
                                            label={t("detail-location")}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("detail-location-required")}`,
                                                },
                                            ]}
                                        >
                                            <BraftEditor
                                                language="en"
                                                style={{ border: "1px solid #ccc" }}
                                                media={{ uploadFn: myUploadFn }}
                                                placeholder={t("detail-location-placeholder")}
                                            />
                                        </Form.Item>
                                        <Divider orientation="left" style={{ fontSize: 14 }}>
                                            {t("project-ground")}
                                        </Divider>
                                        <Form.Item
                                            className={`required-label ${isDescriptionFieldError ? "react-quill-error" : ""}`}
                                            name="ground"
                                            label={t("project-ground")}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("project-ground-required")}`,
                                                },
                                            ]}
                                        >
                                            <BraftEditor
                                                language="en"
                                                style={{ border: "1px solid #ccc" }}
                                                media={{ uploadFn: myUploadFn }}
                                                placeholder={t("project-ground-placeholder")}
                                            />
                                        </Form.Item>

                                        <Divider orientation="left" style={{ fontSize: 14 }}>
                                            {t("reasons-to-invest")}
                                        </Divider>
                                        <Form.Item
                                            className={`required-label ${isDescriptionFieldError ? "react-quill-error" : ""}`}
                                            name={"reasonsToInvest"}
                                            label={t("reasons-to-invest")}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: `${t("reasons-to-invest-required")}`,
                                                },
                                            ]}
                                        >
                                            <BraftEditor
                                                language="en"
                                                style={{ border: "1px solid #ccc" }}
                                                media={{ uploadFn: myUploadFn }}
                                                placeholder={t("reasons-to-invest-placeholder")}
                                            />
                                        </Form.Item>
                                        <hr />
                                        <Row>
                                            <Col span={24} className="d-flex justify-content-around mt-3">
                                                <Form.Item>
                                                    <Space>
                                                        <Button className="btnCreate" type="primary" htmlType="submit">
                                                            <div className="btnContent">
                                                                <PlusCircleOutlined className="me-2" />
                                                                {t("save-changes")}
                                                            </div>
                                                        </Button>
                                                        <Button className="btnSaveDraft" htmlType="button" onClick={handleSaveDraft}>
                                                            <div className="btnContent">
                                                                <SaveOutlined className="me-2" />
                                                                {t("save-draft")}
                                                            </div>
                                                        </Button>
                                                        <Button className="btnReset" danger htmlType="button" onClick={onReset}>
                                                            <div className="btnContent">
                                                                <ReloadOutlined className="me-2" />
                                                                {t("reset")}
                                                            </div>
                                                        </Button>
                                                    </Space>
                                                </Form.Item>
                                            </Col>
                                            {/* <Col span={24} className="d-flex justify-content-around mt-3">
                                                <Form.Item>
                                                    <Space>
                                                        <Button type="primary" htmlType="submit" style={{ width: "fit-content" }}>
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <SaveOutlined className="me-2" />
                                                                Save Change
                                                            </div>
                                                        </Button>
                                                        <Button
                                                            htmlType="button"
                                                            onClick={onReset}
                                                            style={{ width: "fit-content", color: "red", borderColor: "red" }}
                                                        >
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <ReloadOutlined className="me-2" />
                                                                Reset
                                                            </div>
                                                        </Button>
                                                        <Button
                                                            htmlType="button"
                                                            // onClick={saveDraft}
                                                            style={{ width: "fit-content", color: "red", borderColor: "red" }}
                                                        >
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <SaveOutlined className="me-2" />
                                                                Save Draft
                                                            </div>
                                                        </Button>
                                                    </Space>
                                                </Form.Item>
                                            </Col> */}
                                        </Row>
                                    </Form>
                                </Spin>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Spin>
        </>
    );
}

export default EditProject;
