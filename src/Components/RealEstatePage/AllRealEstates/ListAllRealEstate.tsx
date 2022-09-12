import React from "react";
import { Breadcrumb, Tabs, Typography } from "antd";
import { useTranslation } from "react-i18next";
import RejectedList from "./RejectedList";
import AllRealEstates from "./AllRealEstates";

const { TabPane } = Tabs;
const { Title } = Typography;

const onChange = (key: string) => {
    console.log(key);
};

function ListAllRealEstate() {
    const { t } = useTranslation();
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("real-estate-list-all")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("real-estate-manager")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("real-estate-list-all")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <Tabs defaultActiveKey="1" onChange={onChange} className="real-estate-tab-list">
                <TabPane tab={t("project-general-list")} key="1">
                    <AllRealEstates />
                </TabPane>
                <TabPane tab={t("project-rejected-list")} key="2">
                    <RejectedList />
                </TabPane>
            </Tabs>
        </div>
    );
}

export default ListAllRealEstate;
