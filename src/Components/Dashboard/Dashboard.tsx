import { Breadcrumb, Typography } from "antd";
import { Trans, useTranslation } from "react-i18next";

const { Title } = Typography;

function Dashboard() {
    const { t } = useTranslation();

    return (
        <Trans i18nKey={'dashboard'}>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>Dashboard</Title>
                <Breadcrumb >
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                Dashboard
            </div>
        </Trans>
    )
}

export default Dashboard