import { Breadcrumb, Button, Dropdown, Input, Menu, message, Modal, Select, Space, Table, Tooltip, Typography } from "antd";
import {
    SearchOutlined,
    CalendarOutlined,
    UserAddOutlined,
    FilterFilled,
    DownOutlined,
    ExclamationCircleOutlined,
    PlusCircleOutlined,
    StarTwoTone,
} from "@ant-design/icons";
import type { TableRowSelection } from "antd/lib/table/interface";
import React, { useEffect, useState } from "react";
import { ColumnsType, TableProps } from "antd/es/table";
import { fetchChangeSourcesStatus, fetchGetAllSources } from "../../../service/Sources/sources";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { handleStatusName } from "../../../Hooks/NameHandler";
import infinity from "../../../public/img/infinity.png";
import { ProTable } from "@ant-design/pro-components";

const { Title } = Typography;
const { confirm } = Modal;

interface DataType {
    key: React.Key;
    id: number;
    email: string;
    name: string;
    phoneNumber: string;
    isActive: string;
    role: string;
    signUpDate: string;
    status: string;
}

function AllSources() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);
    const [dropdownLoading, setdropdownLoading] = useState(false);

    // For pagination
    const [currentPage, setcurrentPage] = useState<any>(1);
    const [pageSize, setpageSize] = useState<any>(10);
    const [totalSources, settotalSources] = useState(0);

    // For row selecting
    const [keyStoreArray, setkeyStoreArray] = useState<any>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        getSourcesList();
    }, [currentPage, pageSize]);

    useEffect(() => {
        const newArray: any = [];
        keyStoreArray.forEach((array: any) => {
            // add every element of array to newArray
            if (array && array.length > 0) {
                array.forEach((element: any) => {
                    newArray.push(element);
                });
            }
        });
        setSelectedRowKeys(newArray);
    }, [keyStoreArray]);

    const getSourcesList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize };
        const response = await fetchGetAllSources(filters, settableLoading);
        if (response) {
            if (response.status === 200) {
                settotalSources(response.data.totalElements);
                const contents = response.data.content;
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
            message.error(t("Get source list failed"));
        }
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[], e: any, name: any) => {
        if (name.type === "none") {
            setkeyStoreArray([]);
        } else {
            const newArray = [...keyStoreArray];
            newArray[currentPage - 1] = newSelectedRowKeys;
            setkeyStoreArray(newArray);
        }
    };

    const rowSelection: TableRowSelection<DataType> = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_NONE,
        ],
    };

    const hasSelected = selectedRowKeys.length > 0;

    // For dropdowns
    const handleDropdownActions = async (fetchModifyNews: any, status: string, action: any = null) => {
        setdropdownLoading(true);
        const response = await fetchModifyNews(selectedRowKeys, status, setdropdownLoading);
        if (response) {
            if (response.status === 200) {
                message.success(`${action} ${t("successfully")}`);
                setkeyStoreArray([]);
                getSourcesList();
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${action} ${t("failed")}`);
        }
    };

    const showPromiseConfirm = () => {
        confirm({
            title: t("multiple-sources-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: "danger",
            cancelText: t("no"),
            width: 500,
            onOk() {
                handleDropdownActions(fetchChangeSourcesStatus, "DELETED", t("deleted"));
            },
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    label: (
                        <span onClick={() => handleDropdownActions(fetchChangeSourcesStatus, "ACTIVE", t("Activate sources"))}>{t("Activate sources")}</span>
                    ),
                    key: "activate",
                },
                {
                    label: (
                        <span onClick={() => handleDropdownActions(fetchChangeSourcesStatus, "DEACTIVE", t("Deactivate sources"))}>{t("Deactivate sources")}</span>
                    ),
                    key: "deactivate",
                },
                {
                    label: <span onClick={showPromiseConfirm}>{t("Delete sources")}</span>,
                    key: "delete",
                },
            ]}
        />
    );

    const columns: any = [
        {
            title: "ID",
            dataIndex: "id",
            width: "5%",
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={t("view-source-details")}>
                        <Link to={`/sources/details/${id}`}>{id}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("domain"),
            dataIndex: "linkHomepage",
            ellipsis: true,
            render: (domain: any) => {
                return (
                    <Tooltip placement="topLeft" title={`${t("go-to")} ${domain}`}>
                        <a href={domain} target="_blank">
                            {domain}
                        </a>
                    </Tooltip>
                );
            },
        },
        {
            title: t("path"),
            dataIndex: "path",
            ellipsis: true,
        },
        {
            title: t("name"),
            dataIndex: "name",
            ellipsis: true,
            render: (name: string, row: any) => {
                return (
                    <Tooltip placement="topLeft" title={t("view-source-details")}>
                        <Link to={`/sources/details/${row.id}`}>{name}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("category"),
            dataIndex: "categoryName",
            ellipsis: true,
            width: "12%",
        },
        {
            title: t("Crawl Time"),
            dataIndex: "crawlTime",
            ellipsis: true,
            width: "13%",
        },
        {
            title: t("status"),
            dataIndex: "status",
            width: "13%",
            render: (status: string, row: any) => {
                return (
                    <span className="d-flex align-items-center">
                        {handleStatusName(status)}
                        {
                            row.infinityCrawl &&
                            <img src={infinity} className="ms-2" width={18} />
                        }
                    </span>
                )
            },
        },
    ];

    const handleTableChange: TableProps<DataType>["onChange"] = (pagination, filters, sorter, extra) => {
        const { current, pageSize } = pagination;
        setcurrentPage(current);
        setpageSize(pageSize);
    };

    return (
        <div id="sources=list">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("sources-all")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("sources")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("list")}</Breadcrumb.Item>
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
                    <span>
                        <Dropdown overlay={menu} trigger={["click"]} disabled={!hasSelected} placement="bottom">
                            <Button type="primary" disabled={!hasSelected} loading={dropdownLoading}>
                                <Space>
                                    {t("action")}
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>
                        <span style={{ marginLeft: 8 }}>
                            {hasSelected ? `${t("Selected")} ${selectedRowKeys.length > 1 ? `${selectedRowKeys.length} ${t("items")}` : `${selectedRowKeys.length} ${t("item")}`}` : ""}
                        </span>
                    </span>
                    <span>
                        <Button className="me-2" type="primary" onClick={() => navigate("/sources/create")}>
                            <div className="d-flex align-items-center justify-content-between">
                                <PlusCircleOutlined className="me-2" />
                                {t("sources-create-new")}
                            </div>
                        </Button>
                        {/* <Button className="me-2" type="primary">
                            <div className="d-flex align-items-center justify-content-between">
                                <SettingOutlined className="me-2" />
                                {t("sources-run-url")}
                            </div>
                        </Button>
                        <Button type="primary">
                            <div className="d-flex align-items-center justify-content-between">
                                <SettingOutlined className="me-2" />
                                {t("sources-run-content")}
                            </div>
                        </Button> */}
                    </span>
                </div>
                <ProTable<any>
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={tableData}
                    loading={tableLoading}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: currentPage,
                        defaultPageSize: 10,
                        pageSize: pageSize,
                        total: totalSources,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                />
            </div>
        </div>
    );
}

export default AllSources;
