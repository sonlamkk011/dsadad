import { useEffect, useState } from "react";
import { Typography, Row, Col, Spin, Image, List, Card, Button, Space, Form, Input, Breadcrumb, Tag } from "antd";
import { EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { convertDateStringToYearMonthDay } from "../../../Hooks/TimestampConverter";
import { fetchGetProjectDetails } from "../../../service/projects";
import { convertToInternationalCurrencySystem } from "../../../Hooks/CurrencyFormat";
import GoogleMapComponent from "../../RealEstatePage/RealEstateDetails/GoogleMapComponent";
import EditProject from "../EditProject/EditProject";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { handleUtilities, handleUtilitiesName } from "../../../Hooks/TextHandler";

const { Text, Title } = Typography;

const googleMapSize = {
    width: "100%",
    height: "450px",
};

function ProjectDetails() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    let { params } = useParams();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [projectId, setProjectId] = useState<any>(params);
    const [projectDetails, setProjectDetails] = useState<any>([]);
    const [metaData, setMetaData] = useState<any>([]);
    const [projectImages, setProjectImages] = useState<any>([]);
    const [center, setCenter] = useState<any>();
    const [consumptionAndCuisine, setConsumptionAndCuisine] = useState<any>([]);
    const [educationAndMedical, setEducationAndMedical] = useState<any>([]);
    const [entertainment, setEntertainment] = useState<any>([]);
    const [infrastructure, setInfrastructure] = useState<any>([]);
    const [securityAndHygiene, setSecurityAndHygiene] = useState<any>([]);
    const [sports, setSports] = useState<any>([]);

    useEffect(() => {
        getProjectDetails();
    }, []);

    const getProjectDetails = () => {
        setLoading(true);
        const response = fetchGetProjectDetails(projectId)
            .then((res: any) => {
                setLoading(true);
                if (res.status === 200) {
                    setProjectDetails(res.data);
                    const metadata = JSON.parse(res.data.metaData);
                    setMetaData(metadata);
                    setConsumptionAndCuisine(metadata.utilities.consumptionAndCuisine);
                    setEducationAndMedical(metadata.utilities.educationAndMedical);
                    setEntertainment(metadata.utilities.entertainment);
                    setInfrastructure(metadata.utilities.infrastructure);
                    setSecurityAndHygiene(metadata.utilities.securityAndHygiene);
                    setSports(metadata.utilities.sport);
                    const center = {
                        lat: Number(res.data.latitude),
                        lng: Number(res.data.longitude),
                    };
                    const imageArray = JSON.parse(res.data.images);
                    setProjectImages(imageArray);
                    setCenter(center);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
        setLoading(false);
    };
    return (
        <>
            <Spin spinning={loading} tip="Loading...">
                <div id="demo-view" className="projectOverview">
                    <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                        <Title level={4}>{t("project-detail")}</Title>
                        <Breadcrumb>
                            <Breadcrumb.Item>{t("project-manager")}</Breadcrumb.Item>
                            <Breadcrumb.Item>{t("project-detail")}</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                        <div className="d-flex justify-content-center">
                            <div className="">
                                <div className="d-flex align-items-center justify-content-end" style={{ marginBottom: 16 }}>
                                    <Space>
                                        <span>
                                            <Button href={`/real-estate/all/${params}`}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <EyeOutlined className="me-2" />
                                                    {t("all-real-estate-of-project")}
                                                </div>
                                            </Button>
                                        </span>
                                        <span>
                                            <Button href={`https://v2.pindias.com/project/detail/${params}`} target={"_blank"}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <EyeOutlined className="me-2" />
                                                    {t("view-on-page")}
                                                </div>
                                            </Button>
                                        </span>
                                    </Space>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <div style={{ padding: "20px", width: "80%" }}>
                                        <section>
                                            <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                                                <div className="carousel-indicators">
                                                    {projectImages.map((imageLink: string, index: any) => {
                                                        return index === 0 ? (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                data-bs-target="#carouselExampleIndicators"
                                                                data-bs-slide-to="0"
                                                                aria-label="Slide 1"
                                                                className="active"
                                                                aria-current="true"
                                                            ></button>
                                                        ) : (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                data-bs-target="#carouselExampleIndicators"
                                                                data-bs-slide-to={`${index}`}
                                                                aria-label={`Slide ${index + 1}`}
                                                            ></button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="carousel-inner">
                                                    {projectImages.map((imageLink: string, index: any) => (
                                                        <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                                            <img src={imageLink} className="d-block w-100" style={{ height: "480px" }} />
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    className="carousel-control-prev"
                                                    type="button"
                                                    data-bs-target="#carouselExampleIndicators"
                                                    data-bs-slide="prev"
                                                >
                                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                                    <span className="visually-hidden">Previous</span>
                                                </button>
                                                <button
                                                    className="carousel-control-next"
                                                    type="button"
                                                    data-bs-target="#carouselExampleIndicators"
                                                    data-bs-slide="next"
                                                >
                                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                                    <span className="visually-hidden">Next</span>
                                                </button>
                                            </div>
                                            <div className="d-flex mt-3" style={{ overflowX: "auto" }}>
                                                {projectImages.map((imageLink: string, index: any) => (
                                                    <img
                                                        key={index}
                                                        src={imageLink}
                                                        role="button"
                                                        data-bs-target="#carouselExampleIndicators"
                                                        data-bs-slide-to={`${index}`}
                                                        aria-label={`Slide ${index + 1}`}
                                                        width={170.8}
                                                        style={{ marginLeft: `${index === 0 ? "0" : "10px"}`, maxHeight: "127.77px" }}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                        {/* Title and details */}
                                        <section className="mt-4">
                                            <Row>
                                                <div className="mt-2 title text-uppercase">
                                                    <span className="text-title">{t("project-overview")}</span>
                                                </div>
                                                <Col span={24}>
                                                    <table className="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("project-name")}</td>
                                                                <td>{projectDetails.name}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("price")}</td>
                                                                <td>
                                                                    {Number(metaData.priceFrom).toLocaleString()} ~ {Number(metaData.priceTo).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("investor")}</td>
                                                                <td>{projectDetails.investorName}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("project-start-time-construction")}</td>
                                                                <td>{moment.utc(metaData.timeStart).local().format("YYYY-MM-DD")}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("project-building-number")}</td>
                                                                <td>{metaData.buildingNumber}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("area-type")}</td>
                                                                <td>{metaData.areaType}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("category-type")}</td>
                                                                <td>{projectDetails.category}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("address")}</td>
                                                                <td className="text-capitalize">
                                                                    {projectDetails.location !== undefined
                                                                        ? `${projectDetails.location.address}, ${projectDetails.location.wards}, ${projectDetails.location.district},  ${projectDetails.location.province},  ${projectDetails.location.country}`
                                                                        : ""}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("total-area")}</td>
                                                                <td>
                                                                    {Number(metaData.area).toLocaleString()} {metaData.areaUnit === "M2" ? "m2" : ""}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("construction-area")}</td>
                                                                <td>
                                                                    {Number(metaData.constructionArea).toLocaleString()}{" "}
                                                                    {metaData.areaUnit === "M2" ? "m2" : ""}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("project-complete-time")}</td>
                                                                <td>
                                                                    {metaData.timeComplete
                                                                        ? moment.utc(metaData.timeComplete).local().format("YYYY-MM-DD")
                                                                        : "Updating..."}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("project-product-number")}</td>
                                                                <td>{metaData.productNumber ? metaData.productNumber : "Updating..."}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("status")}</td>
                                                                <td>
                                                                    {projectDetails.status === "APPROVED" ? (
                                                                        <Tag color="#5BD8A6">
                                                                            <span className="text-uppercase status-tag">{t("approved")}</span>
                                                                        </Tag>
                                                                    ) : projectDetails.status === "PENDING" ? (
                                                                        <Tag color="#FF9900">
                                                                            <span className="text-uppercase status-tag">{t("pending")}</span>
                                                                        </Tag>
                                                                    ) : projectDetails.status === "DRAFT" ? (
                                                                        <Tag color="#726e6e">
                                                                            <span className="text-uppercase status-tag">{t("draft-status-text")}</span>
                                                                        </Tag>
                                                                    ) : (
                                                                        "Updating..."
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </Col>
                                                <Col span={24}>
                                                    <div className="mt-2 text-capitalize">
                                                        {metaData.youtubeLink ? (
                                                            <Row>
                                                                <Col span={24}>
                                                                    <label>{t("youtube-link")}</label>
                                                                </Col>
                                                                <Col span={24} className="media-link">
                                                                    <span>
                                                                        <Link to={`${metaData.youtubeLink}`}>{metaData.youtubeLink}</Link>
                                                                    </span>
                                                                </Col>
                                                            </Row>
                                                        ) : (
                                                            <></>
                                                        )}

                                                        {metaData.streetView ? (
                                                            <Row>
                                                                <Col span={24}>
                                                                    <label>{t("street-view")}</label>
                                                                </Col>
                                                                <Col span={24} className="media-link">
                                                                    <span>
                                                                        <Link to={`${metaData.streetView}`}>{metaData.streetView}</Link>
                                                                    </span>
                                                                </Col>
                                                            </Row>
                                                        ) : (
                                                            <></>
                                                        )}

                                                        {metaData.link3dview ? (
                                                            <Row>
                                                                <Col span={24}>
                                                                    <label>{t("link3dview")}VR VIew (3D-360&#186;)</label>
                                                                </Col>
                                                                <Col span={24} className="media-link">
                                                                    <span>
                                                                        <Link to={`${metaData.link3dview}`}>{metaData.link3dview}</Link>
                                                                    </span>
                                                                </Col>
                                                            </Row>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col span={24}>
                                                    <div className="mt-3 mb-4 sectionDetails p-3">
                                                        <div className="mt-3 mb-4" dangerouslySetInnerHTML={{ __html: projectDetails.description }} />

                                                        <Image width={"100%"} height={480} src={projectDetails.thumbnail} />
                                                        <span className="d-flex justify-content-center font-italic">
                                                            {t("project-intro-photo")} {projectDetails.name}
                                                        </span>
                                                        <div>
                                                            <Row>
                                                                <Col span={12} className="p-3">
                                                                    <table className="table table-borderless">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style={{ width: "30%", fontWeight: 500 }} className="pt-0">
                                                                                    {t("project-name")}:
                                                                                </td>
                                                                                <td className="pt-0">{projectDetails.name}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("project-location")}:</td>
                                                                                <td>
                                                                                    {projectDetails.location !== undefined
                                                                                        ? `${projectDetails.location.address}, ${projectDetails.location.wards}, ${projectDetails.location.district},  ${projectDetails.location.province},  ${projectDetails.location.country}`
                                                                                        : ""}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("investor")}:</td>
                                                                                <td>{projectDetails.investorName}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ width: "30%", fontWeight: 500 }}>{t("project-scale")}:</td>
                                                                                <td>
                                                                                    {metaData.area} {metaData.areaUnit === "M2" ? "m2" : ""}
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </Col>
                                                                <Col span={12} className="p-3">
                                                                    <span>{metaData.moreInfo}</span>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </section>

                                        <section className="mt-4">
                                            <div className="mt-2 title text-uppercase">
                                                <span className="text-title">{t("project-location")}</span>
                                            </div>
                                            <div className="sectionDetails p-3">
                                                <span>{center && <GoogleMapComponent center={center} googleMapSize={googleMapSize} />}</span>

                                                <div className="p-3">
                                                    <div className="mt-3 mb-4" dangerouslySetInnerHTML={{ __html: metaData.detailLocation }} />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="mt-4">
                                            <div className="mt-2 title text-uppercase">
                                                <span className="text-title">{t("project-ground")}</span>
                                            </div>
                                            <div className="mt-3 mb-4 sectionDetails p-3">
                                                <div dangerouslySetInnerHTML={{ __html: metaData.ground }} />
                                            </div>
                                        </section>
                                        <section className="mt-4">
                                            <div className="mt-2 title text-uppercase">
                                                <span className="text-title">{t("utilities")}</span>
                                            </div>
                                            <div className="sectionDetails p-3">
                                                <Row>
                                                    <Col span={12} className="p-3">
                                                        {infrastructure && infrastructure.length > 0 ? (
                                                            <Title level={5} className="text-capitalize">
                                                                {t("infrastructure")}
                                                            </Title>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {infrastructure && infrastructure.length > 0 && (
                                                            <List
                                                                grid={{
                                                                    gutter: 16,
                                                                    xs: 1,
                                                                    sm: 2,
                                                                    md: 4,
                                                                    lg: 4,
                                                                    xl: 6,
                                                                    xxl: 3,
                                                                }}
                                                                dataSource={infrastructure}
                                                                renderItem={(item: any, index: any) => (
                                                                    <List.Item>
                                                                        <span className="text-capitalize d-flex align-items-center">
                                                                            <CheckCircleOutlined className="me-2 my-2" />
                                                                            {handleUtilitiesName(item)}
                                                                        </span>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        )}
                                                    </Col>
                                                    <Col span={12} className="p-3">
                                                        {entertainment && entertainment.length > 0 ? (
                                                            <Title level={5} className="text-capitalize">
                                                                {t("entertainment")}
                                                            </Title>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {entertainment && entertainment.length > 0 && (
                                                            <List
                                                                grid={{
                                                                    gutter: 16,
                                                                    xs: 1,
                                                                    sm: 2,
                                                                    md: 4,
                                                                    lg: 4,
                                                                    xl: 6,
                                                                    xxl: 3,
                                                                }}
                                                                dataSource={entertainment}
                                                                renderItem={(item: any, index: any) => (
                                                                    <List.Item>
                                                                        <span className="text-capitalize d-flex align-items-center">
                                                                            <CheckCircleOutlined className="me-2 my-2" />
                                                                            {handleUtilitiesName(item)}
                                                                        </span>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        )}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col span={12} className="p-3">
                                                        {securityAndHygiene && securityAndHygiene.length > 0 ? (
                                                            <Title level={5} className="text-capitalize">
                                                                {t("securityAndHygiene")}
                                                            </Title>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {securityAndHygiene && securityAndHygiene.length > 0 && (
                                                            <List
                                                                grid={{
                                                                    gutter: 16,
                                                                    xs: 1,
                                                                    sm: 2,
                                                                    md: 4,
                                                                    lg: 4,
                                                                    xl: 6,
                                                                    xxl: 3,
                                                                }}
                                                                dataSource={securityAndHygiene}
                                                                renderItem={(item: any, index: any) => (
                                                                    <List.Item>
                                                                        <span className="text-capitalize d-flex align-items-center">
                                                                            <CheckCircleOutlined className="me-2 my-2" />
                                                                            {handleUtilitiesName(item)}
                                                                        </span>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        )}
                                                    </Col>
                                                    <Col span={12} className="p-3">
                                                        {consumptionAndCuisine && consumptionAndCuisine.length > 0 ? (
                                                            <Title level={5} className="text-capitalize">
                                                                {t("consumptionAndCuisine")}
                                                            </Title>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {consumptionAndCuisine && consumptionAndCuisine.length > 0 && (
                                                            <List
                                                                grid={{
                                                                    gutter: 16,
                                                                    xs: 1,
                                                                    sm: 2,
                                                                    md: 4,
                                                                    lg: 4,
                                                                    xl: 6,
                                                                    xxl: 3,
                                                                }}
                                                                dataSource={consumptionAndCuisine}
                                                                renderItem={(item: any, index: any) => (
                                                                    <List.Item>
                                                                        <span className="text-capitalize d-flex align-items-center">
                                                                            <CheckCircleOutlined className="me-2 my-2" />
                                                                            {handleUtilitiesName(item)}
                                                                        </span>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        )}
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col span={12} className="p-3">
                                                        {educationAndMedical && educationAndMedical.length > 0 ? (
                                                            <Title level={5} className="text-capitalize">
                                                                {t("educationAndMedical")}
                                                            </Title>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {educationAndMedical && educationAndMedical.length > 0 && (
                                                            <List
                                                                grid={{
                                                                    xs: 1,
                                                                    sm: 2,
                                                                    md: 4,
                                                                    lg: 4,
                                                                    xl: 6,
                                                                    xxl: 3,
                                                                }}
                                                                dataSource={educationAndMedical}
                                                                renderItem={(item: any, index: any) => (
                                                                    <List.Item>
                                                                        <span className="text-capitalize d-flex align-items-center">
                                                                            <CheckCircleOutlined className="me-2 my-2" />
                                                                            {handleUtilitiesName(item)}
                                                                        </span>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        )}
                                                    </Col>
                                                    <Col span={12} className="p-3">
                                                        {sports && sports.length > 0 ? (
                                                            <Title level={5} className="text-capitalize">
                                                                {t("sportArea")}
                                                            </Title>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {sports && sports.length > 0 && (
                                                            <List
                                                                grid={{
                                                                    gutter: 16,
                                                                    xs: 1,
                                                                    sm: 2,
                                                                    md: 4,
                                                                    lg: 4,
                                                                    xl: 6,
                                                                    xxl: 3,
                                                                }}
                                                                dataSource={sports}
                                                                renderItem={(item: any, index: any) => (
                                                                    <List.Item>
                                                                        <span className="text-capitalize d-flex align-items-center">
                                                                            <CheckCircleOutlined className="me-2 my-2" />
                                                                            {handleUtilitiesName(item)}
                                                                        </span>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        )}
                                                    </Col>
                                                </Row>

                                                <div>
                                                    <span></span>
                                                    <span>
                                                        {/* {metaData.utilities.consumptionAndCuisine
                                                ? metaData.utilities.consumptionAndCuisine.map((item: any, index: any) => {
                                                      return (
                                                          <div key={index} className="d-flex align-items-center">
                                                              <span>{item}</span>
                                                              
                                                          </div>
                                                      );
                                                  })
                                                : ""} */}
                                                    </span>
                                                    {/* <span>{metaData.utilities.detailUtility.toHTML()}</span> */}
                                                    <span
                                                        className="mt-3 mb-4 p-3"
                                                        // dangerouslySetInnerHTML={{
                                                        //     __html: metaData.utilities.detailUtility,
                                                        // }}
                                                    />
                                                </div>

                                                {/* <span>detailLocation</span> */}
                                            </div>
                                        </section>

                                        <section className="mt-4">
                                            <div className="mt-2 title text-uppercase">
                                                <span className="text-title">Reasons to invest</span>
                                            </div>
                                            <div className="mt-3 mb-4 p-3 sectionDetails" dangerouslySetInnerHTML={{ __html: metaData.reasonsToInvest }} />
                                        </section>
                                        <div className="mt-4">
                                            <Button className="bottom-button" href={`/project/edit/${params}`}>
                                                Edit Project
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        </>
    );
}

export default ProjectDetails;
