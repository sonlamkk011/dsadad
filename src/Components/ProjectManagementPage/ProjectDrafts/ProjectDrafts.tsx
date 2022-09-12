import { useEffect, useState } from "react";
import { Breadcrumb, Button, message, Modal, notification, Table, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";

import { Link, useNavigate } from "react-router-dom";
import { fetchGetProjectByStatus } from "../../../service/Projects/projects";
import draftDefaultImg from "../../../public/img/default-img.png";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { fetchDeleteProject } from "../../../service/projects";
import { ProTable } from "@ant-design/pro-components";

const { Title } = Typography;

interface DataType {
    id: number;
    name: string;
    thumbnail: string;
    location: any[];
    investorName: string;
    status: string;
}

function ProjectDrafts() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);

    // For pagination
    const [currentPage, setCurrentPage] = useState<any>(1);
    const [pageSize, setPageSize] = useState<any>(10);
    const [totalProjectDrafts, setTotalProjectDrafts] = useState(0);

    useEffect(() => {
        getRealEstateDraftList();
    }, [currentPage, pageSize]);

    const getRealEstateDraftList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, row: pageSize };
        const response = await fetchGetProjectByStatus("DRAFT", filters, settableLoading);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                setTotalProjectDrafts(response.data.totalElements);
                if (contents.length > 0) {
                    const data = contents.map((content: any) => {
                        return { ...content, key: content.id };
                    });
                    settableData(data);
                } else {
                    settableData([]);
                }
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Get real estate draft list failed");
        }
    };

    const onDeleteDraft = async (id: number) => {
        settableLoading(true);
        const response = await fetchDeleteProject(id, settableLoading);
        if (response) {
            if (response.status === 200) {
                notification.success({
                    message: t("Delete project draft successfully"),
                    placement: "topRight",
                });
                getRealEstateDraftList();
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Delete real estate draft failed");
        }
    };

    const columns: any = [
        {
            title: "ID",
            dataIndex: "id",
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={"View draft details"}>
                        <Link to={`/project/edit/${id}`}>{id}</Link>
                    </Tooltip>
                );
            },
            width: "3%",
        },
        {
            title: t("thumbnail"),
            dataIndex: "thumbnail",
            search: false,
            render: (thumbnail: string) => {
                if (thumbnail) {
                    return <img src={thumbnail} alt="thumbnail" width={100} height={70} />;
                } else {
                    return <img src={draftDefaultImg} alt="thumbnail" width={100} height={70} />;
                }
            },
            width: "10%",
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },
        {
            title: t("name"),
            dataIndex: "name",
            render: (name: any, row: any) => (
                <Tooltip placement="topLeft" title={"View draft details"}>
                    <Link className="border-line" to={`/project/edit/${row.id}`}>
                        <strong className="text-capitalize">{name}</strong>
                    </Link>
                </Tooltip>
            ),
            width: "10%",
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },
        {
            title: t("status"),
            dataIndex: "status",
            render: (status: string, index: any) => {
                return (
                    <div id="project-status" key={index}>
                        <Tag color="#726e6e">
                            <span className="text-uppercase status-tag">{status ? t("draft-status-text") : ""}</span>
                        </Tag>
                    </div>
                );
            },
            onFilter: (value: any, record: any) => {
                return record.status === value;
            },
            width: "10%",
        },
        {
            title: t("action"),
            render: (text: any, row: any) => {
                return (
                    <div className="d-flex justify-content-around">
                        <Tooltip placement="topLeft" title={"Continue editing drafts"}>
                            <Button type="primary" className="ms-2 d-flex align-items-center" href={`/project/edit/${row.id}`}>
                                <EditOutlined />
                            </Button>
                        </Tooltip>

                        <Button danger className="ms-2 d-flex align-items-center" onClick={() => showDeleteConfirm(row.id)}>
                            <DeleteOutlined />
                        </Button>
                    </div>
                );
            },
            width: "10%",
        },
    ];

    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const { current, pageSize } = pagination;
        setCurrentPage(current);
        setPageSize(pageSize);
    };

    const showDeleteConfirm = (id: any) => {
        Modal.confirm({
            title: t("draft-delete-text"),
            content: t("draft-delete-text-content"),
            okText: t("draft-delete-confirm"),
            okType: "danger",
            cancelText: t("draft-delete-cancel"),
            onOk() {
                onDeleteDraft(id);
            },
            onCancel() {
                console.log("Cancel");
            },
        });
    };

    return (
        <div id="project-draft-list">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>Draft list</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>Project manager</Breadcrumb.Item>
                    <Breadcrumb.Item>Drafts</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div
                className="site-layout-background"
                style={{
                    padding: 24,
                    minHeight: 360,
                }}
            >
                <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 16 }}>
                    <span></span>
                    <span>
                        <Button className="me-2" type="primary" onClick={() => navigate("/project/create")}>
                            <div className="d-flex align-items-center justify-content-between">
                                <PlusCircleOutlined className="me-2" />
                                {t("project-create-new")}
                            </div>
                        </Button>
                    </span>
                </div>
                <ProTable
                    columns={columns}
                    dataSource={tableData}
                    loading={tableLoading}
                    onChange={handleTableChange}
                    scroll={{ x: 100 }}
                    pagination={{
                        current: currentPage,
                        defaultPageSize: 10,
                        pageSize: pageSize,
                        total: totalProjectDrafts,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                />
            </div>
        </div>
    );
}

export default ProjectDrafts;
