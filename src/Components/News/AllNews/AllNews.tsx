import React, { useEffect, useRef, useState } from "react";
import { Breadcrumb, Button, Dropdown, Input, Menu, message, Image, Space, Table, Tooltip, Typography, Modal, InputRef, Checkbox } from "antd";
import { SearchOutlined, FilterFilled, DownOutlined, ExclamationCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { fetchChangeNewsStatus, fetchGetAllNews, fetchSearchNews } from "../../../service/News/news";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { handleStatusName } from "../../../Hooks/NameHandler";
import { fetchGetCategories } from "../../../service/Categories/Categories";

const { Title } = Typography;
const { confirm } = Modal;

function AllNews() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);
    const [dropdownLoading, setdropdownLoading] = useState(false);
    const [categories, setcategories] = useState<any>();

    // For filtering
    const [tableFilters, settableFilters] = useState<any>({});
    const searchInput = useRef<InputRef>(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

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

    const getNewsCategories = async () => {
        settableLoading(true);
        const filters = { size: 100, type: "NEWS", status: "ACTIVE" };
        const response = await fetchGetCategories(filters, settableLoading);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                setcategories(contents);
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t("Get categories list failed"));
        }
    };

    const getNewsList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize };
        let response: any
        if (tableFilters === {}) {
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
            message.error(t("Get news list failed"));
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

    const filterOptionsReturner = (dataIndex: string) => {
        const filterOptions = [categories.map((category: any) => category.name), [t('active'), t('inactive')]];
        if (dataIndex === 'categoryName') {
            return filterOptions[0]
        } else if (dataIndex === 'status') {
            return filterOptions[1]
        }
    }

    // =============================== HTML ===============================
    const searcher = (filterType: string, dataIndex: string, setSelectedKeys: any, selectedKeys: any, confirm: any) => {
        if (filterType === 'checkbox') {
            return (
                <Checkbox.Group
                    options={filterOptionsReturner(dataIndex)}
                    value={selectedKeys}
                    onChange={(checkedValues) => { setSelectedKeys(checkedValues) }}
                />
            )
        } else if (filterType === 'inputSearch') {
            return (
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={confirm}
                    style={{ marginBottom: 8 }}
                />
            )
        }
    }

    const footerButtons = (filterType: string, dataIndex: string, setSelectedKeys: any, confirm: any, clearFilters: any) => {
        return (
            <div
                className={`d-flex ${filterType === "checkbox" ? "justify-content-between" : "justify-content-center"}`}
                style={filterType === "checkbox" ? { padding: '8px' } : {}}
            >
                <Button
                    className='me-4'
                    type="primary"
                    onClick={() => {
                        confirm({ closeDropdown: true });
                    }}
                    size="small"
                    style={filterType === 'checkbox' ? {} : { width: 90 }}
                >
                    {
                        filterType === 'checkbox' ?
                            "OK" :
                            <div className='d-flex justify-content-around align-items-center'>
                                <SearchOutlined /> {t("search")}
                            </div>
                    }
                </Button>
                <Button
                    onClick={() => {
                        clearFilters();
                        setSelectedKeys([]);
                        confirm();
                    }}
                    size="small"
                    style={{ border: 'none', backgroundColor: 'transparent' }}
                >
                    {t("reset")}
                </Button>
            </div>
        )
    }

    const getColumnFilterProps = (dataIndex: any, filterType: string) => {
        return ({
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
                <div className='customize-filter' style={filterType === "checkbox" ? {} : { width: '250px', padding: '8px' }}>
                    {
                        searcher(filterType, dataIndex, setSelectedKeys, selectedKeys, confirm)
                    }
                    {
                        footerButtons(filterType, dataIndex, setSelectedKeys, confirm, clearFilters)
                    }
                </div>
            ),
            filterIcon: (filtered: boolean) => {
                if (filterType === 'checkbox') {
                    <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />
                } else {
                    return <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
                }
            }
            ,
            onFilter: (value: any, record: any) =>
            (
                record[dataIndex]
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        })
    };

    const columns: any = [
        {
            title: "ID",
            dataIndex: "id",
            width: "6%",
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={t("View news details")}>
                        <Link to={`/news/details/${id}`}>{id}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("thumbnail"),
            dataIndex: "thumbnail",
            width: "11%",
            render: (thumbnail: string) => {
                return <Image width={100} src={thumbnail} />;
            },
        },
        {
            title: t("title"),
            dataIndex: "title",
            width: "18%",
            ellipsis: true,
            // ...getColumnFilterProps('title', 'inputSearch'),
            render: (title: any, row: any) => {
                return (
                    <Tooltip placement="topLeft" title={title}>
                        <Link to={`/news/details/${row.id}`}>{title}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("description"),
            dataIndex: "subtitle",
            ellipsis: true,
            render: (subtitle: any) => {
                return (
                    <Tooltip placement="topLeft" title={subtitle}>
                        <span>{subtitle}</span>
                    </Tooltip>
                )
            },
        },
        {
            title: t("category"),
            dataIndex: "categoryName",
            width: "12%",
            ellipsis: true,
            // ...getColumnFilterProps('categoryName', 'checkbox'),
            render: (categoryId: string) => {
                return <div>{categoryId ? categoryId : "N/A"}</div>;
            },
        },
        {
            title: t("Updated Date"),
            dataIndex: "updatedAt",
            width: "11%",
            render: (updatedAt: string) => {
                return (
                    <Tooltip title={moment(updatedAt).format("HH:mm:ss DD/MM/YYYY")}>
                        <span>{moment(updatedAt).format("DD-MM-YYYY")}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: t("status"),
            dataIndex: "status",
            width: "13%",
            // ...getColumnFilterProps('status', 'checkbox'),
            render: (status: string) => {
                return <span>{handleStatusName(status)}</span>;
            },
        },
    ];

    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const { current, pageSize } = pagination;
        setcurrentPage(current);
        setpageSize(pageSize);
        const { title, status, categoryName }: any = filters;
        const filter: any = {
            title: title ? title[0] : null,
            status: status ? status.map((e: any) => e === t("inactive") ? "DEACTIVE" : "ACTIVE") : null,
            categoryName: categoryName ? categoryName[0] : null,
        }
        const newFilter: any = {};
        for (const key in filter) {
            if (filter[key] != null || filter[key] == "") {
                newFilter[key] = filter[key];
            }
        }
        // console.log(newFilter);
        settableFilters((prev: any) => ({ ...newFilter }));
    };

    return (
        <div id="all-news">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("news-list-all")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("news")}</Breadcrumb.Item>
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
                        <Button className="me-2" type="primary" onClick={() => navigate("/news/create")}>
                            <div className="d-flex align-items-center justify-content-between">
                                <PlusCircleOutlined className="me-2" />
                                {t("news-create-new")}
                            </div>
                        </Button>
                    </span>
                </div>
                <Table
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
                        total: totalNews,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                />
            </div>
        </div>
    );
}

export default AllNews;
