import React, { useEffect, useRef, useState } from 'react'
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Button, Dropdown, Menu, message, Modal, Spin, Table, Tooltip } from 'antd'
import { PlusOutlined, DownOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom';
import { fetchGetCategories } from '../../../service/Categories/Categories';
import { t } from 'i18next';
import { fetchChangePostsStatus, fetchGetAllPosts } from '../../../service/SocialPosts/SocialPosts';

const { confirm } = Modal;

function SocialPostList() {
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
    const [totalPosts, settotalPosts] = useState(0);

    // For row selecting
    const [keyStoreArray, setkeyStoreArray] = useState<any>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        getPostCategories()
    }, []);

    useEffect(() => {
        getPostsList();
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

    const getPostsList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize };
        let response: any
        response = await fetchGetAllPosts(filters, settableLoading);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                settotalPosts(response.data.totalElements);
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

    const getPostCategories = async () => {
        settableLoading(true);
        const filters = { size: 100, type: "COMMUNITY", status: "ACTIVE" };
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
            message.error(t("Get categories list failed"));
        }
    };

    const columns: any = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '8%',
            hideInSearch: true,
            hideInForm: true,
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={"Preview post"}>
                        <Link to={`/posts/preview/${id}`}>{id}</Link>
                    </Tooltip>
                )
            },
        },
        {
            title: t("thumbnail"),
            dataIndex: 'thumbnail',
            width: '10%',
            ellipsis: true,
            responsive: ["lg"],
            valueType: 'image',
            hideInSearch: true,
        },
        {
            title: t('title'),
            dataIndex: 'title',
            ellipsis: true,
        },
        {
            title: 'View post',
            ellipsis: true,
            hideInSearch: true,
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
            },
        },
        {
            title: t('description'),
            dataIndex: 'description',
            hideInSearch: true,
            ellipsis: true,
            responsive: ["lg"],
            valueType: 'string',
        },
        {
            title: t('category'),
            key: 'categoryName',
            dataIndex: 'categoryName',
            ellipsis: true,
            valueType: 'select',
            valueEnum: { ...categoriesObj },
            hideInSearch: true,
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'showTime',
            valueType: 'dateTime',
            hideInSearch: true,
            responsive: ['xl'],
        },
        {
            title: t("Author Name"),
            dataIndex: 'authorName',
            responsive: ['xl'],
            hideInSearch: true,
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            valueType: 'checkbox',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: t("Keyword"),
            hideInTable: true,
        },
    ];

    // For dropdowns
    const handleDropdownActions = async (fetchModifyPosts: any, status: string, action: any = null) => {
        setdropdownLoading(true);
        const response = await fetchModifyPosts(selectedRowKeys, status, setdropdownLoading);
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
            width: 450,
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
            search={true}
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
                total: totalPosts,
                showSizeChanger: true,
            }}
            dateFormatter="string"
            headerTitle={t("social-post-all")}
            toolBarRender={() => [
                <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => navigate("/posts/create")}>
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

export default SocialPostList