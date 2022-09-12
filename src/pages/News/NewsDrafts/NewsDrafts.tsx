import React, { useEffect, useRef, useState } from 'react'
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable, TableDropdown } from '@ant-design/pro-components'
import { Button, Dropdown, InputRef, Menu, message, Space, Table, Tag, Tooltip } from 'antd'
import { PlusOutlined, EllipsisOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom';
import { fetchGetAllNews, fetchGetNewsByStatus, fetchSearchNews } from '../../../service/News/news';
import { fetchGetCategories } from '../../../service/Categories/Categories';
import { t } from 'i18next';

function NewsDrafts() {
    const actionRef = useRef<ActionType>();
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
    const [totalNewsDrafts, settotalNewsDrafts] = useState(0);

    // For row selecting
    const [keyStoreArray, setkeyStoreArray] = useState<any>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // Test
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        getNewsCategories()
    }, []);

    useEffect(() => {
        getNewsDraftList()
    }, [currentPage, pageSize]);

    const getNewsDraftList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize }
        const response = await fetchGetNewsByStatus(filters, "DRAFT", settableLoading)
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content
                settotalNewsDrafts(response.data.totalElements);
                if (contents.length > 0) {
                    const data = contents.map((content: any) => {
                        return { ...content, key: content.id }
                    })
                    settableData(data);
                } else {
                    settableData([]);
                }
            } else {
                message.error(response.data)
            }
        } else {
            message.error(t("Get draft list failed"))
        }
    }

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
            title: 'Description',
            dataIndex: 'subtitle',
            onFilter: true,
            ellipsis: true,
            responsive: ["lg"],
            valueType: 'string',
            hideInSearch: true,
        },
        {
            title: 'Category',
            key: 'categoryName',
            dataIndex: 'categoryName',
            width: "20%",
            ellipsis: true,
            valueType: 'select',
        },
    ];

    const menu = (
        <Menu
            items={[
                {
                    label: '1st item',
                    key: '1',
                },
                {
                    label: '2nd item',
                    key: '2',
                },
                {
                    label: '3rd item',
                    key: '3',
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

    const content = (
        <ProTable<any>
            rowKey="id"
            dataSource={tableData}
            columns={columns}
            actionRef={actionRef}
            rowSelection={rowSelection}
            onChange={handleTableChange}
            cardBordered
            scroll={{ x: 400 }}
            columnsState={{
                persistenceKey: 'pro-table-singe-demos',
                persistenceType: 'localStorage',
            }}
            search={true}
            options={{
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
                total: totalNewsDrafts,
                showSizeChanger: true,
            }}
            dateFormatter="string"
            headerTitle="Drafts"
            toolBarRender={() => [
                <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => navigate("/news/create")}>
                    New
                </Button>,
                <Dropdown key="menu" overlay={menu}>
                    <Button>
                        <EllipsisOutlined />
                    </Button>
                </Dropdown>,
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

export default NewsDrafts