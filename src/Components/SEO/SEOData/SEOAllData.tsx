import { ProTable } from "@ant-design/pro-components";
import { Table, message, Breadcrumb, Typography, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchSEOGetAllData } from "../../../service/SEO/SEO";
import EditSEODataModal from "./EditSEODataModal";

const { Title } = Typography;

function SEOAllData() {
    const { t } = useTranslation();
    const [SEOData, setSEOData] = useState();
    const [loading, setLoading] = useState(false);
    const [selectedRowData, setselectedRowData] = useState<any>({});

    // For modal
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        getAllSEOData();
    }, []);

    const getAllSEOData = async () => {
        setLoading(true);
        const response = await fetchSEOGetAllData(setLoading);
        if (response) {
            if (response.status === 200) {
                const dataWithKey: any = [];
                response.data.forEach((element: any) => {
                    dataWithKey.push({
                        ...element,
                        key: element.id,
                    });
                });
                setSEOData(dataWithKey);
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Get all SEO data failed");
        }
    };

    const handleEditButton = (rowData: any) => {
        setVisible(true);
        setselectedRowData(rowData);
    };

    const columns: any = [
        {
            title: "Id",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Image SEO",
            dataIndex: "imageSEO",
            key: "imageSEO",
            render: (_: any, record: any) => (
                <Tooltip placement="top" overlayStyle={{ maxWidth: "300px" }} title={`<meta property="og:image" content="${record.imageSEO}">`}>
                    <img src={record.imageSEO} alt="imageSEO" width="100" height="100" />
                </Tooltip>
            ),
            responsive: ["lg", "xl", "xxl"]
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (_: any, record: any) => (
                <Tooltip placement="top" title={`Page ${record.name}`}>
                    <span>{record.name}</span>
                </Tooltip>
            ),
        },
        {
            title: "Title SEO",
            dataIndex: "titleSEO",
            key: "titleSEO",
            render: (_: any, record: any) => (
                <Tooltip
                    placement="top"
                    overlayStyle={{ maxWidth: "600px" }}
                    title={`<title>${record.titleSEO}</title>\n<meta name="title" content="${record.titleSEO}">\n<meta property="og:title" content="Pindias - Siêu nền tảng quản lý và đầu tư bất động sản số">`}
                >
                    <span>{record.titleSEO}</span>
                </Tooltip>
            ),
        },
        {
            title: "Description SEO",
            dataIndex: "descriptionSEO",
            key: "descriptionSEO",
            render: (_: any, record: any) => (
                <Tooltip
                    placement="top"
                    overlayStyle={{ maxWidth: "450px" }}
                    title={`<meta name="description" content="${record.descriptionSEO}">\n<meta property="og:description" content="${record.descriptionSEO}">`}
                >
                    <span style={{ whiteSpace: "pre-line" }}>{record.descriptionSEO}</span>
                </Tooltip>
            ),
            responsive: ["lg", "xl", "xxl"]
        },
        {
            title: "Key words SEO",
            dataIndex: "keywordsSEO",
            key: "keywordsSEO",
            render: (_: any, record: any) => (
                <Tooltip placement="top" overlayStyle={{ maxWidth: "400px" }} title={`<meta name="keywords" content="${record.keywordsSEO}">`}>
                    <span>{record.keywordsSEO}</span>
                </Tooltip>
            ),
            responsive: ["lg", "xl", "xxl"]
        },
        {
            title: "URL SEO",
            dataIndex: "urlSEO",
            key: "urlSEO",
            render: (_: any, record: any) => (
                <Tooltip placement="top" title={`<meta property="og:url" content="${record.urlSEO}">`}>
                    <span>{record.urlSEO}</span>
                </Tooltip>
            ),
        },
        {
            title: "Edit",
            dataIndex: "edit",
            key: "edit",
            render: (_: any, row: any) => (
                <button className="edit-button" onClick={() => handleEditButton(row)}>
                    Edit
                </button>
            ),
        },
        // {
        //   title: 'Content SEO',
        //   dataIndex: 'contentSEO',
        //   key: 'contentSEO',
        // },
        // {
        //   title: 'Active',
        //   dataIndex: 'active',
        //   key: 'active',
        //   render: (_: any, record: any) => (
        //     <span>
        //       {record.active ? 'Active' : 'Inactive'}
        //     </span>
        //   ),
        // },
    ];

    return (
        <div id="SEO-all-data">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("seo-data-list")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("seo-data")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("seo-data-list")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="site-layout-background" style={{ padding: 24 }}>
                <ProTable loading={loading} columns={columns} dataSource={SEOData} scroll={{ x: 200 }}/>
            </div>
            <EditSEODataModal visible={visible} setVisible={setVisible} selectedRowData={selectedRowData} getAllSEOData={getAllSEOData} />
        </div>
    );
}

export default SEOAllData;
