
import React, { useEffect, useRef, useState } from "react";
import { Breadcrumb, Button, Checkbox, Dropdown, Input, InputRef, Menu, message, Modal, Space, Table, Image, Tooltip, Typography } from "antd";
import { ExclamationCircleOutlined, DownOutlined, SearchOutlined, PlusCircleOutlined, EyeOutlined, FilterFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { fetchChangePostsStatus, fetchGetAllPosts } from "../../../service/SocialPosts/SocialPosts";
import moment from "moment";
import { handleStatusName } from "../../../Hooks/NameHandler";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";
import { fetchGetCategories } from "../../../service/Categories/Categories";

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;

function AllSocialPosts() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);
    const [dropdownLoading, setdropdownLoading] = useState(false)
    const [categories, setcategories] = useState<any>([]);

    // For customized table filter
    const [selectedOption, setselectedOption] = useState<any>([]);

    // For table searching
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const [tableFilter, settableFilter] = useState<any>({});
    const searchInput = useRef<InputRef>(null);

    // For pagination
    const [currentPage, setcurrentPage] = useState<any>(1);
    const [pageSize, setpageSize] = useState<any>(10);
    const [totalSocialPosts, settotalSocialPosts] = useState(0);

    // For row selecting
    const [keyStoreArray, setkeyStoreArray] = useState<any>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        getPostsList();
    }, [currentPage, pageSize, tableFilter]);

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

    const getCategories = async () => {
        const filters = { size: 100, type: "COMMUNITY", status: "ACTIVE", }
        const response = await fetchGetCategories(filters);
        if (response) {
            if (response.status === 200) {
                const newArray: any = []
                response.data.content.forEach((category: any) => {
                    newArray.push({
                        text: category.name,
                        value: category.id,
                    })
                })
                setcategories(newArray);
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t("Get categories list failed"));
        }
    }

    const getPostsList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize, ...tableFilter };
        const response = await fetchGetAllPosts(filters, settableLoading);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content
                settotalSocialPosts(response.data.totalElements)
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
            message.error(t("Get post list failed"));
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
    const handleDropdownActions = async (changePostsStatus: any, status: string, action: any = null) => {
        setdropdownLoading(true);
        const response = await changePostsStatus(selectedRowKeys, status, setdropdownLoading);
        if (response) {
            if (response.status === 200) {
                message.success(`${action} ${t("successfully")}`);
                setkeyStoreArray([]);
                getPostsList();
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${action} ${t("failed")}`);
        }
    };

    const showPromiseConfirm = () => {
        confirm({
            title: t("multiple-posts-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: "danger",
            cancelText: t("no"),
            onOk() {
                handleDropdownActions(fetchChangePostsStatus, "DELETED", t("deleted"));
            },
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    label: <span onClick={() => handleDropdownActions(fetchChangePostsStatus, "ACTIVE", t("Activate post"))}>{t("Activate post")}</span>,
                    key: "activate",
                },
                {
                    label: <span onClick={() => handleDropdownActions(fetchChangePostsStatus, "DEACTIVE", t("Deactivate post"))}>{t("Deactivate post")}</span>,
                    key: "deactivate",
                },
                {
                    label: <span onClick={showPromiseConfirm}>{t("Delete post")}</span>,
                    key: "delete",
                },
            ]}
        />
    );

    // For table searching
    const handleSearch = (selectedKeys: string[], confirm: (param?: any) => void, dataIndex: any) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void, confirm: (param?: any) => void) => {
        clearFilters();
        setSearchText("");
        confirm();
    };

    const filterOptionsReturner = (dataIndex: string) => {
        const filterOptions = categories.map((category: any) => {
            return category.text
        })
        return filterOptions;
    }

    const handleOptionsChange = (newCheckedKeysArray: any, setSelectedKeys: any) => {
        const filteredArray = newCheckedKeysArray.filter((value: any) => !selectedOption.includes(value));
        setselectedOption(filteredArray);
        setSelectedKeys(filteredArray);
    }

    const getColumnSearchProps = (dataIndex: any): any => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div className='customize-filter'>
                <Checkbox.Group
                    options={filterOptionsReturner(dataIndex)}
                    value={selectedKeys}
                    onChange={(checkedValues) => {
                        handleOptionsChange(checkedValues, setSelectedKeys);
                    }}
                />
                <div
                    className={`d-flex justify-content-between`}
                    style={{ padding: '8px' }}
                >
                    <Button
                        className='me-4'
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        {t("search")}
                    </Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
                        {t("reset")}
                    </Button>
                </div>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value: any, record: any) =>
            record[dataIndex],
        render: (text: any) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '6%',
            render: (id: any) => {
                return (
                    <Tooltip placement="topLeft" title={"Preview post"}>
                        <Link to={`/posts/preview/${id}`}>{id}</Link>
                    </Tooltip>
                )
            }
        },
        {
            title: t("thumbnail"),
            dataIndex: "thumbnail",
            width: "8%",
            render: (thumbnail: string) => {
                return <Image
                    width={50}
                    height={50}
                    src={thumbnail}
                    alt="Thumbnail"
                    fallback="data:image/png;base64,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"
                />;
            },
            responsive: ['xl'],
        },
        {
            title: t('title'),
            dataIndex: 'title',
            ellipsis: true,
            render: (title: any, row: any) => {
                return (
                    <Tooltip placement="topLeft" title={title}>
                        <Link to={`/posts/preview/${row.id}`}>{title}</Link>
                    </Tooltip>
                )
            }
        },
        {
            title: 'View post',
            width: '9%',
            render: (_: any, row: any) => {
                return (
                    <Tooltip placement="topLeft" title={"View post"}>
                        <Button style={{ borderRadius: "5px" }}>
                            <a className='d-flex align-items-center' href={`https://pindias.com/posts/detail/${row.id}`} target="_blank">
                                <EyeOutlined />
                            </a>
                        </Button>
                    </Tooltip>
                )
            }
        },
        {
            title: t('description'),
            dataIndex: 'description',
            ellipsis: true,
            render: (description: any) => {
                return (
                    <Tooltip placement="topLeft" title={description}>
                        <span>{description}</span>
                    </Tooltip>
                )
            },
            responsive: ['xl'],
        },
        {
            title: t('category'),
            dataIndex: 'categoryName',
            ...getColumnSearchProps('categoryName'),
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            responsive: ['xl'],
            render: (date: any) => {
                return (
                    <Tooltip title={moment(date).format("HH:mm:ss DD/MM/YYYY")}>
                        <span>{moment(date).format("DD-MM-YYYY")}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Author',
            dataIndex: 'authorName',
        },
        {
            title: t('status'),
            dataIndex: 'status',
            render: (status: string) => {
                return (
                    <span>{handleStatusName(status)}</span>
                )
            }
        },
    ];

    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const { current, pageSize } = pagination;
        setcurrentPage(current);
        setpageSize(pageSize);

        let filter = {};
        Object.keys(filters).forEach((key) => {
            if (filters[key] != undefined) {
                if (key === "title" || key === "content") {
                    filter = { ...filter, keyword: filters[key][0] };
                } else if (key === "categoryName") {
                    filter = { ...filter, categoryId: findCategoryIdByName(filters[key][0]) };
                } else {
                    filter = { ...filter, [key]: filters[key][0] };
                }
            }
        });
        settableFilter(filter);
    };

    const findCategoryIdByName = (name: string) => {
        const category = categories.find((category: any) => category.text === name);
        return category.value;
    }

    const handleKeywordSearch = (value: string) => {
        settableFilter((prev: any) => {
            return { ...prev, keyword: value };
        });
    };

    return (
        <div id="all-social-posts">
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("social-post-all")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("social-post")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("social-post-all")}</Breadcrumb.Item>
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
                    <span className="d-flex align-items-center">
                        <Dropdown overlay={menu} trigger={["click"]} disabled={!hasSelected} placement="bottom">
                            <Button type="primary" disabled={!hasSelected} loading={dropdownLoading}>
                                <Space>
                                    {t("action")}
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>
                        <span style={{ margin: "0 8px", whiteSpace: "nowrap" }}>
                            {hasSelected ? `${t("Selected")} ${selectedRowKeys.length > 1 ? `${selectedRowKeys.length} ${t("items")}` : `${selectedRowKeys.length} ${t("item")}`}` : ""}
                        </span>
                        <Search placeholder={t("Search posts by keyword")} allowClear onSearch={handleKeywordSearch} />
                    </span>
                    <span>
                        <Button className="me-2" type="primary" onClick={() => navigate("/posts/create")}>
                            <div className="d-flex align-items-center justify-content-between">
                                <PlusCircleOutlined className="me-2" />
                                {t("social-post-create-new")}
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
                    scroll={{ x: 1100 }}
                    pagination={{
                        current: currentPage,
                        defaultPageSize: 10,
                        pageSize: pageSize,
                        total: totalSocialPosts,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                />
            </div>
        </div>
    );
}

export default AllSocialPosts;
