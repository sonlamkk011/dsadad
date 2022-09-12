import { useEffect, useState } from "react";
import { Breadcrumb, Typography, Input, Select, Row, Col, message, Modal, Button, Space, Spin, Tabs } from "antd";
import { CompassOutlined, FileTextOutlined, OrderedListOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { convertDateStringToYearMonthDay } from "../../../Hooks/TimestampConverter";
import { fetchGetProjectDetails } from "../../../service/projects";
import { convertToInternationalCurrencySystem } from "../../../Hooks/CurrencyFormat";
import GoogleMapComponent from "../../RealEstatePage/RealEstateDetails/GoogleMapComponent";
import EditProject from "../EditProject/EditProject";
import ProjectDetails from "./ProjectDetails";
import RealEstateOfProject from "../AllRealEstateProject/RealEstateOfProject";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const googleMapSize = {
    width: "100%",
    height: "450px",
};

function ProjectOverview() {
    const navigate = useNavigate();
    let { params } = useParams();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [projectId, setProjectId] = useState<any>(params);
    const [projectDetails, setProjectDetails] = useState<any>([]);
    const [metaData, setMetaData] = useState<any>([]);
    const [projectImages, setProjectImages] = useState<any>([]);
    const [center, setCenter] = useState<any>();

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
                    setMetaData(metadata.content);
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
                        <Title level={4}>Project Overview</Title>
                        <Breadcrumb>
                            <Breadcrumb.Item>Project Management</Breadcrumb.Item>
                            <Breadcrumb.Item>Project overview</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                        <div className="d-flex justify-content-center">
                            <div className="">
                                {/* <ProjectDetails /> */}
                            </div>
                        </div>
                    </div>
                </div>
                {/* <EditProject visible={visible} setVisible={setVisible} projectDetails={projectDetails} /> */}
            </Spin>
        </>
    );
}

export default ProjectOverview;
