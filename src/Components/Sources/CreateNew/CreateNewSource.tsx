import { Breadcrumb, Col, message, Row, Typography } from 'antd';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react'
import { fetchGetCategories } from '../../../service/Categories/Categories';
import ConfigureSourceTab from './ConfigureSourceTab/ConfigureSourceTab';
import EditActivateSource from './EditActivateSourceTab';

const { Title } = Typography;

function CreateNewSource() {
    const [categories, setcategories] = useState<any>([]);

    useEffect(() => {
        getCategories()
    }, []);

    const getCategories = async () => {
        const response = await fetchGetCategories({ size: 100, type: 'REAL_ESTATE', status: 'ACTIVE' })
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content
                setcategories(contents);
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t('Get categories list failed'))
        }
    }

    return (
        <div id="create-new-source">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("create-new")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("sources")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("create-new")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360, backgroundColor: '#fff' }}>
                <Row justify="center" >
                    <Col span={16}>
                        <nav>
                            <div className="nav nav-tabs d-flex justify-content-center" id="nav-tab" role="tablist">
                                <button className="nav-link active" id="nav-edit-activate-source-tab" data-bs-toggle="tab" data-bs-target="#nav-edit-activate-source" type="button" role="tab" aria-controls="nav-edit-activate-source" aria-selected="true">{t("Edit & Activate source")}</button>
                                <button className="nav-link" id="nav-advance-tab" data-bs-toggle="tab" data-bs-target="#nav-advance" type="button" role="tab" aria-controls="nav-advance" aria-selected="false">{t("Advance")}</button>
                            </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent">
                            <div className="tab-pane fade show active" id="nav-edit-activate-source" role="tabpanel" aria-labelledby="nav-edit-activate-source-tab">
                                <EditActivateSource categories={categories} getCategories={getCategories} />
                            </div>
                            <div className="tab-pane fade" id="nav-advance" role="tabpanel" aria-labelledby="nav-advance-tab">
                                <ConfigureSourceTab categories={categories} getCategories={getCategories} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default CreateNewSource