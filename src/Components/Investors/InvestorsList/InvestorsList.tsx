import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Dropdown, Input, Menu, message, Image, Space, Table, Tooltip, Typography, Modal } from "antd";
import { SearchOutlined, CalendarOutlined, UserAddOutlined, FilterFilled, DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { fetchChangeInvestorStatus, fetchGetInvestors } from "../../../service/Investors/investors";
import { Trans, useTranslation } from "react-i18next";
import { handlePurpose, handleStatusName } from "../../../Hooks/NameHandler";
import { ProTable } from "@ant-design/pro-components";

const { Title } = Typography;
const { confirm } = Modal;

function InvestorsList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);
    const [dropdownLoading, setdropdownLoading] = useState(false);

    // For pagination
    const [currentPage, setcurrentPage] = useState<any>(1);
    const [pageSize, setpageSize] = useState<any>(10);
    const [totalInvestors, settotalInvestors] = useState(0);

    // For row selecting
    const [keyStoreArray, setkeyStoreArray] = useState<any>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        getInvestorsList();
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

    const getInvestorsList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize };
        const response = await fetchGetInvestors(filters, settableLoading);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                settotalInvestors(response.data.totalElements);
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
            message.error(t("get-investors-list-error"));
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

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            // Table.SELECTION_ALL,
            // Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
        ],
    };

    const hasSelected = selectedRowKeys.length > 0;

    // For dropdowns
    const handleDropdownActions = async (fetchModifyInvestors: any, status: string, action: any = null) => {
        setdropdownLoading(true);
        const response = await fetchModifyInvestors(selectedRowKeys, status, setdropdownLoading);
        if (response) {
            if (response.status === 200) {
                message.success(`${action} ${t("successfully")}`);
                setkeyStoreArray([]);
                getInvestorsList();
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${action} ${t("failed")}`);
        }
    };

    const showPromiseConfirm = () => {
        confirm({
            title: t("investor-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: "danger",
            cancelText: t("no"),
            onOk() {
                handleDropdownActions(fetchChangeInvestorStatus, "DELETED", t("deleted"));
            },
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    label: (
                        <Trans i18nKey={'Activate-investor'}>
                            <span onClick={() => handleDropdownActions(fetchChangeInvestorStatus, "NORMAL", t("activated"))}>
                                Activate investor{selectedRowKeys.length > 1 && "s"}
                            </span>
                        </Trans>
                    ),
                    key: "activate",
                },
                {
                    label: (
                        <Trans i18nKey={'Delete-investor'}>
                            <span onClick={showPromiseConfirm}>Delete investor{selectedRowKeys.length > 1 && "s"}</span>
                        </Trans>
                    ),
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
            serch: 'true',
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={t("view-investor-details")}>
                        <Link to={`/investor/details/${id}`}>{id}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("name"),
            dataIndex: "name",
            ellipsis: true,
            hideInSearch: false,
            render: (name: string, row: any) => {
                return (
                    <Tooltip placement="topLeft" title={name}>
                        <Link to={`/investor/details/${row.id}`}>{name}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("phone"),
            dataIndex: "phone",
            width: "10%",
        },
        {
            title: t("location"),
            dataIndex: "location",
            ellipsis: true,
            render: (location: string) => {
                return (
                    <Tooltip placement="topLeft" title={location}>
                        <span>{location}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: t("website"),
            dataIndex: "website",
            ellipsis: true,
            render: (website: string) => {
                return (
                    <Tooltip placement="topLeft" title={`${t("go-to")} ${website}`}>
                        <a href={website} target="_blank">
                            {website}
                        </a>
                    </Tooltip>
                );
            },
        },
        {
            title: t("field"),
            dataIndex: "field",
            ellipsis: true,
            width: "9%",
            render: (field: string) => {
                return (
                    <span>{handlePurpose(field)}</span>
                );
            },
        },
        {
            title: t("charteredCapital"),
            dataIndex: "charteredCapital",
            ellipsis: true,
            render: (charteredCapital: string) => {
                return (
                    <Tooltip placement="topLeft" title={charteredCapital.toLocaleString()}>
                        <span>{charteredCapital.toLocaleString()}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: t("establishDate"),
            dataIndex: "createdYear",
            render: (createdAt: string) => {
                return (
                    <Tooltip title={moment(createdAt).format("HH:mm:ss DD/MM/YYYY")}>
                        <span>{moment(createdAt).format("DD-MM-YYYY")}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: t("status"),
            dataIndex: "status",
            render: (status: string) => {
                return (
                    <Tooltip placement="topLeft" title={status}>
                        <span>{handleStatusName(status)}</span>
                    </Tooltip>
                );
            }
        },
    ];

    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const { current, pageSize } = pagination;
        setcurrentPage(current);
        setpageSize(pageSize);
    };

    return (
        <div id="investors-list">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("investor-list")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("investor-manager")}</Breadcrumb.Item>
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
                        <Button className="me-2" type="primary" onClick={() => navigate("/investor/create")}>
                            <div className="d-flex align-items-center justify-content-between">
                                <UserAddOutlined className="me-2" />
                                {t("create-new")}
                            </div>
                        </Button>
                    </span>
                </div>
                <ProTable<any>
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={tableData}
                    loading={tableLoading}
                    scroll={{ x: 1350 }}
                    onChange={handleTableChange}
                    pagination={{
                        current: currentPage,
                        defaultPageSize: 10,
                        pageSize: pageSize,
                        total: totalInvestors,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                />
            </div>
        </div>
    );
}

export default InvestorsList;
