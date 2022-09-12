import React, { useEffect, useRef, useState } from 'react'
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable, TableDropdown } from '@ant-design/pro-components'
import { Button, Dropdown, InputRef, Menu, message, Modal, Space, Spin, Table, Tag, Tooltip } from 'antd'
import { PlusOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom';
import { fetchChangeNewsStatus, fetchGetAllNews, fetchSearchNews } from '../../../service/News/news';
import { fetchGetCategories } from '../../../service/Categories/Categories';
import { t } from 'i18next';

const { confirm } = Modal;

function NewsList() {
    const actionRef = useRef<ActionType>();
    const navigate = useNavigate();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);
    const [dropdownLoading, setdropdownLoading] = useState(false);
    const [categories, setcategories] = useState<any>();
    const [categoriesObj, setcategoriesObj] = useState<any>();

    // For filtering
    const [tableFilters, settableFilters] = useState<any>({});

    // For pagination
    const [currentPage, setcurrentPage] = useState<any>(1);
    const [pageSize, setpageSize] = useState<any>(10);
    const [totalNews, settotalNews] = useState(0);

    // For row selecting
    const [keyStoreArray, setkeyStoreArray] = useState<any>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        getNewsCategories()
    }, []);

    useEffect(() => {
        getNewsList();
    }, [tableFilters, currentPage, pageSize]);

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

    const getNewsList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize };
        let response: any
        // if tableFilters is empty, get all news
        if (tableFilters && Object.keys(tableFilters).length === 0 && Object.getPrototypeOf(tableFilters) === Object.prototype) {
            response = await fetchGetAllNews(filters, settableLoading);
        } else {
            response = await fetchSearchNews({ ...tableFilters, ...filters }, settableLoading);
        }
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                settotalNews(response.data.totalElements);
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
            message.error("Get news list failed");
        }
    };

    const getNewsCategories = async () => {
        settableLoading(true);
        const filters = { size: 100, type: "NEWS", status: "ACTIVE" };
        const response = await fetchGetCategories(filters, settableLoading);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                const categoriesObj = contents.reduce((obj: any, category: any) => {
                    obj[category.name] = { text: category.name };
                    return obj;
                }, {});
                setcategoriesObj(categoriesObj);
                setcategories(contents);
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Get categories list failed");
        }
    };

    const columns: any = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: "8%",
            hideInSearch: true,
            hideInForm: true,
            editable: false,
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={t("View news details")}>
                        <Link to={`/news/edit/${id}`}>{id}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Thumbnail',
            dataIndex: 'thumbnail',
            width: "9%",
            responsive: ["lg"],
            valueType: 'image',
            hideInSearch: true,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            ellipsis: true,
        },
        {
            title: 'Subtitle',
            dataIndex: 'subtitle',
            hideInSearch: true,
            ellipsis: true,
            responsive: ["lg"],
            valueType: 'string',
        },
        {
            title: 'Category',
            key: 'categoryName',
            dataIndex: 'categoryName',
            width: "20%",
            ellipsis: true,
            valueType: 'select',
            valueEnum: { ...categoriesObj },
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            valueType: 'checkbox',
            ellipsis: true,
            width: "15%",
            valueEnum: {
                ACTIVE: { text: t("active") },
                DEACTIVE: { text: t("inactive") },
            },
        },
    ];

    // For dropdowns
    const handleDropdownActions = async (fetchModifyNews: any, status: string, action: any = null) => {
        setdropdownLoading(true);
        const response = await fetchModifyNews(selectedRowKeys, status, setdropdownLoading);
        if (response) {
            if (response.status === 200) {
                message.success(`${action} ${t("successfully")}`);
                setkeyStoreArray([]);
                getNewsList();
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${action} ${t("failed")}`);
        }
    };

    const showPromiseConfirm = () => {
        confirm({
            title: t("multiple-news-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: "danger",
            cancelText: t("no"),
            width: 450,
            onOk() {
                handleDropdownActions(fetchChangeNewsStatus, "DELETED", t("deleted"));
            },
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    label: <span onClick={() => handleDropdownActions(fetchChangeNewsStatus, "ACTIVE", t("Activate news"))}>{t("Activate news")}</span>,
                    key: "activate",
                },
                {
                    label: <span onClick={() => handleDropdownActions(fetchChangeNewsStatus, "DEACTIVE", t("Deactivate news"))}>{t("Deactivate news")}</span>,
                    key: "deactivate",
                },
                {
                    label: <span onClick={showPromiseConfirm}>{t("Delete news")}</span>,
                    key: "delete",
                },
            ]}
        />
    );

    // For row selecting
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
            Table.SELECTION_NONE,
        ],
    };

    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const { current, pageSize } = pagination;
        setcurrentPage(current);
        setpageSize(pageSize);
    };

    const handleTableSearch = (filters: any) => {
        const filter: any = {
            ...filters,
            category: filters.categoryName,
        }
        const newFilter: any = {};
        for (const key in filter) {
            if (filter[key] != null || filter[key] == "") {
                newFilter[key] = filter[key];
            }
        }
        // console.log(newFilter);
        settableFilters((prev: any) => ({ ...newFilter }));
    }

    const content = (
        <ProTable<any>
            rowKey="id"
            dataSource={tableData}
            columns={columns}
            actionRef={actionRef}
            rowSelection={rowSelection}
            onChange={handleTableChange}
            cardBordered
            loading={tableLoading}
            scroll={{ x: 400 }}
            onSubmit={(filters: any) => {
                handleTableSearch(filters);
            }}
            onReset={() => {
                settableFilters({});
            }}
            columnsState={{
                persistenceKey: 'pro-table-singe-demos',
                persistenceType: 'localStorage',
            }}
            search={{
                labelWidth: 'auto',
                searchText: "Search",
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
                total: totalNews,
                showSizeChanger: true,
            }}
            dateFormatter="string"
            headerTitle="News List"
            toolBarRender={() => [
                <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => navigate("/news/create")}>
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
    )

}

export default NewsList