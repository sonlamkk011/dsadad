import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Dropdown, Input, Menu, message, Image, Space, Table, Tooltip, Typography, Modal, Spin } from "antd";
import { SearchOutlined, CalendarOutlined, UserAddOutlined, FilterFilled, DownOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { fetchChangeInvestorStatus, fetchGetInvestors } from "../../../service/Investors/investors";
import { Trans, useTranslation } from "react-i18next";
import { handlePurpose, handleStatusName } from "../../../Hooks/NameHandler";
import { PageContainer, ProTable } from "@ant-design/pro-components";

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
            key: "id",
            dataIndex: "id",
            align: 'center',
            width: 50,
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={t("view-investor-details")}>
                        <Link to={`/investor/details/${id}`}>{id}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Thumbnail',
            dataIndex: 'thumbnail',
            width: 90,
            responsive: ["lg"],
            valueType: 'image',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
            ellipsis: true,
            render: (name: string, row: any) => {
                return (
                    <Link to={`/investor/details/${row.id}`}>{name}</Link>
                );
            },
        },
        {
            title: t("phone"),
            dataIndex: "phone",
            width: 130,
            align: 'center',
            key: "phone",
            responsive: ['xl'],
        },
        {
            title: t("location"),
            dataIndex: "location",
            key: "location",
            ellipsis: true,
            responsive: ['xl'],
            render: (location: string) => {
                return (
                    <span>{location}</span>
                );
            },
        },
        {
            title: t("website"),
            dataIndex: "website",
            key: "website",
            width: 170,
            ellipsis: true,
            responsive: ['xl'],
            render: (website: string) => {
                return (
                    <a href={website} target="_blank">
                        {website}
                    </a>
                );
            },
        },
        {
            title: t("field"),
            dataIndex: "field",
            key: "field",
            ellipsis: true,
            align: 'center',
            width: 100,
            render: (field: string) => {
                return (
                    <span>{handlePurpose(field)}</span>
                );
            },
        },
        {
            title: t("charteredCapital"),
            dataIndex: "charteredCapital",
            key: "charteredCapital",
            width: 170,
            ellipsis: true,
            responsive: ['xl'],
            valueType: "digit",
        },
        {
            title: t("establishDate"),
            dataIndex: "createdYear",
            width: 170,
            align: 'center',
            key: "establishDate",
            responsive: ['xl'],
            valueType: 'dateTime',
        },
        {
            title: t("status"),
            dataIndex: "status",
            align: 'center',
            key: "status",
            width: 100,
            ellipsis: true
        },
    ];

    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const { current, pageSize } = pagination;
        setcurrentPage(current);
        setpageSize(pageSize);
    };

    const content = (
        <ProTable<any>
            rowKey="id"
            dataSource={tableData}
            columns={columns}
            rowSelection={rowSelection}
            onChange={handleTableChange}
            cardBordered
            loading={tableLoading}
            scroll={{ x: 400 }}
            // onSubmit={(filters: any) => {
            //     handleTableSearch(filters);
            // }}
            // onReset={() => {
            //     settableFilters({});
            // }}
            columnsState={{
                persistenceKey: 'pro-table-singe-demos',
                persistenceType: 'localStorage',
            }}
            options={{
                reload: false,
                setting: {
                    listsHeight: 400,
                },
            }}
            form={{
                // Due to the configuration of transform, the submitted participation is different from the definition, which needs to be transformed here
                syncToUrl: (values, type) => {
                    if (type === 'get') {
                        return {
                            ...values,
                            created_at: [values.startTime, values.endTime],
                        };
                    }
                    return values;
                },
            }}
            pagination={{
                pageSize: pageSize,
                current: currentPage,
                total: totalInvestors,
                showSizeChanger: true,
            }}
            dateFormatter="string"
            headerTitle={t("social-post-all")}
            toolBarRender={() => [
                <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => navigate("/investor/create")}>
                    New
                </Button>,
                <Spin spinning={dropdownLoading}>
                    <Dropdown key="menu" overlay={menu}>
                        <Button>
                            {t("action")}
                            <DownOutlined />
                        </Button>
                    </Dropdown>
                </Spin>,
            ]}
        />
    )

    return (
        <PageContainer
            style={{ padding: 24, paddingBottom: 0 }}
            content={content}
        />
    );
}

export default InvestorsList;
