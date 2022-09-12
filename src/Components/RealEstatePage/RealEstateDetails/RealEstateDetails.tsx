import { useEffect, useRef, useState } from 'react'
import { Breadcrumb, Typography, Button, Form, Input, Select, Radio, Row, Col, message, Cascader, DatePicker, Switch, Upload, Carousel, Card, Tooltip } from "antd";
import { CheckCircleOutlined, ExpandOutlined, CompassOutlined } from "@ant-design/icons";
import { Link, useNavigate } from 'react-router-dom';
import GoogleMapComponent from './GoogleMapComponent';
import moment from 'moment';
import { handleUtilitiesName } from '../../../Hooks/NameHandler';
import { fetchGetRealEstateDetails } from '../../../service/RealEstates/realEstate';
import { t } from 'i18next';

const { Text, Title } = Typography;

const googleMapSize = {
    width: '100%',
    height: '450px'
};

const initIsHiddenProps = {
    description: true,
    location: true,
    ground: true,
    utilities: true,
    reasonsToInvest: true,
}

function RealEstateDetails() {
    const navigate = useNavigate();
    const realEstateId = window.location.pathname.split('/')[3];
    const [realEstateDetails, setrealEstateDetails] = useState<any>();
    const [parsedDetail, setparsedDetail] = useState<any>();
    const [center, setcenter] = useState<any>();
    const [isHiddenProperties, setisHiddenProperties] = useState(initIsHiddenProps);
    const descriptionRef: any = useRef(null)
    const locationRef: any = useRef(null)
    const groundRef: any = useRef(null)
    const utilitiesRef: any = useRef(null)
    const reasonsToInvestRef: any = useRef(null)

    // For price per area unit
    const [pricePerAreaUnit, setpricePerAreaUnit] = useState("");

    useEffect(() => {
        getRealEstateDetails()
    }, []);

    useEffect(() => {
        if (realEstateDetails) {
            handlepricePerAreaUnit(realEstateDetails.price)
        }
    }, [realEstateDetails]);

    const getRealEstateDetails = async () => {
        const response = await fetchGetRealEstateDetails(realEstateId);
        if (response) {
            if (response.status === 200) {
                const center = {
                    lat: Number(response.data.latitude),
                    lng: Number(response.data.longitude)
                }
                setcenter(center);
                const parsedDetail = JSON.parse(response.data.detail)
                setparsedDetail(parsedDetail);
                const realEstateDetails = response.data
                setrealEstateDetails(realEstateDetails);
            } else {
                message.error(response.data);
            }
        } else {
            message.error('Get real estate details failed');
        }
    }

    const handleBoxViewButton = (propertyKey: string) => {
        setisHiddenProperties((prevState: any) => ({ ...prevState, [propertyKey]: !prevState[propertyKey] }));
    }

    const handlepricePerAreaUnit = (currentPriceValue: number) => {
        const currentArea = realEstateDetails.area
        if (currentArea) {
            const pricePerArea = currentPriceValue / currentArea
            const isDecimal = pricePerArea % 1 !== 0
            const stringifiedPricePerArea = (isDecimal ? "~" : "") + Number(pricePerArea.toFixed(0)).toLocaleString()
            const currentAreaUnit = realEstateDetails.areaUnit === "M2" ? "m²" : realEstateDetails.areaUnit
            const pricePerAreaUnit = `${stringifiedPricePerArea} / ${currentAreaUnit}`
            setpricePerAreaUnit(pricePerAreaUnit)
        } else {
            setpricePerAreaUnit("")
        }
    }

    return (
        <div id='demo-view'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("Demo view")}</Title>
                <Breadcrumb >
                    <Breadcrumb.Item>{t("real-estate-manager")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("Demo view")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                <div className='d-flex justify-content-center'>
                    <div style={{ width: '1227px' }}>
                        {/* Carousel */}
                        <section>
                            <div className='border'>
                                <div id="carouselExampleIndicators" className="carousel slide border" data-bs-ride="carousel">
                                    <div className="carousel-indicators">
                                        {
                                            parsedDetail?.images.map((imageLink: string, index: any) => {
                                                return (
                                                    index === 0 ?
                                                        <button key={index} type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" aria-label="Slide 1" className="active" aria-current="true"></button>
                                                        :
                                                        <button key={index} type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to={`${index}`} aria-label={`Slide ${index + 1}`}></button>
                                                )
                                            })
                                        }
                                    </div>
                                    <div className="carousel-inner">
                                        {
                                            parsedDetail?.images.map((imageLink: string, index: any) =>
                                                <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                                    <img src={imageLink} className="d-block w-100" style={{ height: '650px' }} />
                                                </div>
                                            )
                                        }
                                    </div>
                                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Previous</span>
                                    </button>
                                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Next</span>
                                    </button>
                                </div>
                                <div className='d-flex p-2' style={{ overflowX: 'auto' }}>
                                    {
                                        parsedDetail?.images.map((imageLink: string, index: any) =>
                                            <img
                                                key={index}
                                                src={imageLink}
                                                role='button'
                                                data-bs-target="#carouselExampleIndicators"
                                                data-bs-slide-to={`${index}`}
                                                aria-label={`Slide ${index + 1}`}
                                                width={170.8}
                                                style={{ marginLeft: `${index === 0 ? '0' : '10px'}`, maxHeight: '127.77px' }}
                                            />
                                        )
                                    }
                                </div>
                            </div>
                        </section>

                        {/* Title and general details */}
                        <section>
                            <p className='mt-4'><strong>{t("Real estate ID")}:</strong> {realEstateId}</p>
                            <h4 className='mt-3 title textHasUnderline'>{realEstateDetails?.name}</h4>
                            <div className="d-flex align-items-center">
                                <div className='me-5'>
                                    <span className="price price-format fs-5 lh-1 fw-bold">{realEstateDetails?.price.toLocaleString()} {realEstateDetails?.currency}</span>
                                </div>
                                <div className='me-5'>{t("Price per area")}: {pricePerAreaUnit}</div>
                                {
                                    realEstateDetails?.isBot &&
                                    <>
                                        <Tooltip placement="topLeft" title={`${t("go-to")} ${realEstateDetails?.source}`}>
                                            <a href={realEstateDetails?.source} target="_blank">{t("Source")}</a>
                                        </Tooltip>
                                    </>
                                }
                            </div>
                            <div className="my-3"><span style={{ fontWeight: '600' }}>{t("address")}: </span>{[realEstateDetails?.location, realEstateDetails?.ward?.nameWithType, realEstateDetails?.district?.nameWithType, realEstateDetails?.province?.nameWithType].join(", ")}</div>
                            <div className="basicInfo py-2" style={{ borderTop: '1px solid rgb(188, 190, 192)', borderBottom: '1px solid rgb(188, 190, 192)' }}>
                                <div className="row g-0 fw-600">
                                    <div className="col-md-2 col-6 item">
                                        <div className="mb-1">{t("bedrooms")}</div>
                                        <div className="d-flex align-items-center"><i className="las la-bed icon"></i>{realEstateDetails?.beds}</div>
                                    </div>
                                    <div className="col-md-2 col-6 item">
                                        <div className="mb-1">{t("bathrooms")}</div>
                                        <div className="d-flex align-items-center"><i className="las la-bath icon"></i>{realEstateDetails?.baths}</div>
                                    </div>
                                    <div className="col-md-2 col-6 item">
                                        <div className="mb-1">{t("area")}</div>
                                        <div className="d-flex align-items-center">
                                            <ExpandOutlined className="me-1" />{realEstateDetails?.area} {realEstateDetails?.areaUnit}
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-6 item">
                                        <div className="mb-1">{t("direction")}</div>
                                        <div className="d-flex align-items-center"><CompassOutlined className="me-1" />{realEstateDetails?.direction}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* OVERVIEW */}
                        <section className='mt-4'>
                            <h4 className='mt-3 title textHasUnderline'>{t("Overview")}</h4>
                            <div className='border p-3'>
                                <div ref={descriptionRef} className={descriptionRef?.current?.clientHeight >= 200 && isHiddenProperties.description ? "box-body" : ""}>
                                    <div className='d-flex justify-content-center'>
                                        <img className='w-100' src={realEstateDetails?.thumbnail} alt="" />
                                    </div>
                                    <div className='text-center mt-2 fst-italic'>
                                        {t("Introduction photo of")} {realEstateDetails?.name}
                                    </div>
                                    <div
                                        className='mt-3 mb-4'
                                        dangerouslySetInnerHTML={{ __html: parsedDetail?.description }}
                                    />
                                </div>
                                {
                                    descriptionRef?.current?.clientHeight >= 200 &&
                                    <div className='d-flex justify-content-center mt-3'>
                                        <Button className='view-more-button' onClick={() => handleBoxViewButton("description")}>{isHiddenProperties.description ? t("Show more") : t("Show less")}</Button>
                                    </div>
                                }
                            </div>
                        </section>

                        {/* Real estate details */}
                        <section className='mt-4'>
                            <h4 className='mt-3 title textHasUnderline'>{t("Real estate details")}</h4>
                            <div className="row">
                                <div className="col-md-6">
                                    <table className="table table-bordered sm table-overview">
                                        <tbody>
                                            <tr>
                                                <th>{t("bedrooms")}</th>
                                                <td className="text-end">{realEstateDetails?.beds}</td>
                                            </tr>
                                            <tr>
                                                <th>{t("length")}</th>
                                                <td className="text-end">{parsedDetail?.length || "-"}</td>
                                            </tr>
                                            <tr>
                                                <th>{t("ground area")}</th>
                                                <td className="text-end">{realEstateDetails?.area} {realEstateDetails?.areaUnit}</td>
                                            </tr>
                                            <tr>
                                                <th>{t("direction")}</th>
                                                <td className="text-end">{realEstateDetails?.direction}</td>
                                            </tr>
                                            <tr>
                                                <th>{t("condition")}</th>
                                                <td className="text-end">{parsedDetail?.condition || "-"}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-6">
                                    <table className="table table-bordered sm table-overview">
                                        <tbody>
                                            <tr>
                                                <th>{t("bathrooms")}</th>
                                                <td className="text-end">{realEstateDetails?.baths}</td>
                                            </tr>
                                            <tr>
                                                <th>{t("width")}</th>
                                                <td className="text-end">{parsedDetail?.width || "-"}</td>
                                            </tr>
                                            <tr>
                                                <th>{t("usage area")}</th>
                                                <td className="text-end">{parsedDetail?.usageArea || "-"}</td>
                                            </tr>
                                            <tr>
                                                <th>{t("facade")}</th>
                                                <td className="text-end">{parsedDetail?.facade || "-"}</td>
                                            </tr>
                                            <tr>
                                                <th>{t("juridical")}</th>
                                                <td className="text-end text-uppercase fw-bold">
                                                    {realEstateDetails?.juridical === "" && <span className="fw-normal">-</span>}
                                                    {realEstateDetails?.juridical === "NONE" && <span className="">{t("None")}</span>}
                                                    {realEstateDetails?.juridical === "House Ownership Certificate" && <span style={{ color: "#ed0c6e" }}>{t("House Ownership Certificate")}</span>}
                                                    {realEstateDetails?.juridical === "Land Use Rights Certificate" && <span className="text-danger">{t("Land Use Rights Certificate")}</span>}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Utilities */}
                        {
                            (parsedDetail && parsedDetail.utilities && Object.keys(parsedDetail.utilities).length > 0) && (
                                <section className='mt-4'>
                                    <h4 className='mt-3 title textHasUnderline'>{t("utilities")}</h4>
                                    <div className='border p-3'>
                                        <div ref={utilitiesRef} className={utilitiesRef?.current?.clientHeight >= 200 && isHiddenProperties.utilities ? "box-body" : ""}>
                                            <Row>
                                                <Col span={12}>
                                                    {
                                                        parsedDetail.utilities.infrastructure &&
                                                        <div>
                                                            <div className='title-utilities fw-bold'>{t("infrastructure")}</div>
                                                            <Row className='my-2'>
                                                                {
                                                                    parsedDetail.utilities.infrastructure.map((utilityName: string) => (
                                                                        <Col key={utilityName} className='d-flex align-items-center' span={12}>
                                                                            <CheckCircleOutlined className='me-2 my-2' /> {handleUtilitiesName(utilityName)}
                                                                        </Col>
                                                                    ))
                                                                }
                                                            </Row>
                                                        </div>
                                                    }
                                                    {
                                                        parsedDetail.utilities.securityAndHygiene &&
                                                        <div>
                                                            <div className='title-utilities fw-bold'>{t("securityAndHygiene")}</div>
                                                            <Row className='my-2'>
                                                                {
                                                                    parsedDetail.utilities.securityAndHygiene.map((utilityName: string) => (
                                                                        <Col key={utilityName} className='d-flex align-items-center' span={12}>
                                                                            <CheckCircleOutlined className='me-2 my-2' /> {handleUtilitiesName(utilityName)}
                                                                        </Col>
                                                                    ))
                                                                }
                                                            </Row>
                                                        </div>
                                                    }
                                                    {
                                                        parsedDetail.utilities.educationAndMedical &&
                                                        <div>
                                                            <div className='title-utilities fw-bold'>{t("educationAndMedical")}</div>
                                                            <Row className='my-2'>
                                                                {
                                                                    parsedDetail.utilities.educationAndMedical.map((utilityName: string) => (
                                                                        <Col key={utilityName} className='d-flex align-items-center' span={12}>
                                                                            <CheckCircleOutlined className='me-2 my-2' /> {handleUtilitiesName(utilityName)}
                                                                        </Col>
                                                                    ))
                                                                }
                                                            </Row>
                                                        </div>
                                                    }
                                                </Col>
                                                <Col span={12}>
                                                    {
                                                        parsedDetail.utilities.entertainment &&
                                                        <div>
                                                            <div className='title-utilities fw-bold'>{t("entertainment")}</div>
                                                            <Row className='my-2'>
                                                                {
                                                                    parsedDetail.utilities.entertainment.map((utilityName: string) => (
                                                                        <Col key={utilityName} className='d-flex align-items-center' span={12}>
                                                                            <CheckCircleOutlined className='me-2 my-2' /> {handleUtilitiesName(utilityName)}
                                                                        </Col>
                                                                    ))
                                                                }
                                                            </Row>
                                                        </div>
                                                    }
                                                    {
                                                        parsedDetail.utilities.consumptionAndCuisine &&
                                                        <div>
                                                            <div className='title-utilities fw-bold'>{t("consumptionAndCuisine")}</div>
                                                            <Row className='my-2'>
                                                                {
                                                                    parsedDetail.utilities.consumptionAndCuisine.map((utilityName: string) => (
                                                                        <Col key={utilityName} className='d-flex align-items-center' span={12}>
                                                                            <CheckCircleOutlined className='me-2 my-2' /> {handleUtilitiesName(utilityName)}
                                                                        </Col>
                                                                    ))
                                                                }
                                                            </Row>
                                                        </div>
                                                    }
                                                    {
                                                        parsedDetail.utilities.sport &&
                                                        <div>
                                                            <div className='title-utilities fw-bold'>{t("sportArea")}</div>
                                                            <Row className='my-2'>
                                                                {
                                                                    parsedDetail.utilities.sport.map((utilityName: string) => (
                                                                        <Col key={utilityName} className='d-flex align-items-center' span={12}>
                                                                            <CheckCircleOutlined className='me-2 my-2' /> {handleUtilitiesName(utilityName)}
                                                                        </Col>
                                                                    ))
                                                                }
                                                            </Row>
                                                        </div>
                                                    }
                                                </Col>
                                            </Row>
                                            {
                                                parsedDetail?.utilities.detailUtility &&
                                                <div
                                                    className='mt-3 mb-4'
                                                    style={{ overflowX: 'auto' }}
                                                    dangerouslySetInnerHTML={{ __html: parsedDetail?.utilities.detailUtility }}
                                                />
                                            }
                                        </div>
                                        {
                                            utilitiesRef?.current?.clientHeight >= 200 &&
                                            <div className='d-flex justify-content-center mt-3'>
                                                <Button className='view-more-button' onClick={() => handleBoxViewButton("utilities")}>{isHiddenProperties.utilities ? t("Show more") : t("Show less")}</Button>
                                            </div>
                                        }
                                    </div>
                                </section>
                            )
                        }

                        {/* Location */}
                        <section className='mt-4'>
                            <h4 className='mt-3 title textHasUnderline'>{t("Real estate location")}</h4>
                            <div className='border p-3'>
                                <div ref={locationRef} className={locationRef?.current?.clientHeight >= 200 && isHiddenProperties.location ? "box-body" : ""}>
                                    <div className='d-flex justify-content-center'>
                                        {
                                            center &&
                                            <GoogleMapComponent center={center} googleMapSize={googleMapSize} />
                                        }
                                    </div>
                                    <div
                                        className='mt-3 mb-4'
                                        style={{ overflowX: 'auto' }}
                                        dangerouslySetInnerHTML={{ __html: parsedDetail?.locationDetail }}
                                    />
                                </div>
                                {
                                    locationRef?.current?.clientHeight >= 200 &&
                                    <div className='d-flex justify-content-center mt-3'>
                                        <Button className='view-more-button' onClick={() => handleBoxViewButton("location")}>{isHiddenProperties.location ? t("Show more") : t("Show less")}</Button>
                                    </div>
                                }
                            </div>
                        </section>

                        {/* Ground */}
                        {
                            parsedDetail && parsedDetail.ground && (
                                <section className='mt-4'>
                                    <h4 className='mt-3 title textHasUnderline'>{t("ground")}</h4>
                                    <div className='border p-3'>
                                        <div ref={groundRef} className={groundRef?.current?.clientHeight >= 200 && isHiddenProperties.ground ? "box-body" : ""}>
                                            <div
                                                className='mt-3 mb-4'
                                                style={{ overflowX: 'auto' }}
                                                dangerouslySetInnerHTML={{ __html: parsedDetail?.ground }}
                                            />
                                        </div>
                                        {
                                            groundRef?.current?.clientHeight >= 200 &&
                                            <div className='d-flex justify-content-center mt-3'>
                                                <Button className='view-more-button' onClick={() => handleBoxViewButton("ground")}>{isHiddenProperties.ground ? t("Show more") : t("Show less")}</Button>
                                            </div>
                                        }
                                    </div>
                                </section>
                            )
                        }

                        {/* Reasons to invest */}
                        {
                            parsedDetail && parsedDetail.reasonsToInvest && (
                                <section className='mt-4'>
                                    <h4 className='mt-3 title textHasUnderline'>{t("reasons-to-invest")}</h4>
                                    <div className='border p-3'>
                                        <div ref={reasonsToInvestRef} className={reasonsToInvestRef?.current?.clientHeight >= 200 && isHiddenProperties.reasonsToInvest ? "box-body" : ""}>
                                            <div
                                                className='mt-3 mb-4'
                                                style={{ overflowX: 'auto' }}
                                                dangerouslySetInnerHTML={{ __html: parsedDetail?.reasonsToInvest }}
                                            />
                                        </div>
                                        {
                                            reasonsToInvestRef?.current?.clientHeight >= 200 &&
                                            <div className='d-flex justify-content-center mt-3'>
                                                <Button className='view-more-button' onClick={() => handleBoxViewButton("reasonsToInvest")}>{isHiddenProperties.reasonsToInvest ? t("Show more") : t("Show less")}</Button>
                                            </div>
                                        }
                                    </div>
                                </section>
                            )
                        }

                        <div className='mt-4'>
                            <button className='bottom-button me-3' onClick={() => navigate(`/real-estate/edit/${realEstateId}`)}>{t("Edit")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default RealEstateDetails