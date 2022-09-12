import { useEffect, useRef, useState } from 'react'
import { Breadcrumb, Button, message, Table, Tooltip, Typography, Image, Dropdown, Space, Modal, Menu } from 'antd';
import { DownOutlined, ExclamationCircleOutlined, PlusCircleOutlined, DeleteOutlined, PlusOutlined, EllipsisOutlined } from "@ant-design/icons";
import { Link, useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { fetchChangePostsStatus, fetchDeletePost, fetchGetPostsByStatus } from '../../../service/SocialPosts/SocialPosts';
import moment from 'moment';
import { ActionType, PageContainer, ProTable } from '@ant-design/pro-components';

const { Title } = Typography;
const { confirm } = Modal;

function PostDrafts() {
    const actionRef = useRef<ActionType>();
    const navigate = useNavigate();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);

    // For pagination
    const [currentPage, setcurrentPage] = useState<any>(1);
    const [pageSize, setpageSize] = useState<any>(10);
    const [totalPostDrafts, settotalPostDrafts] = useState(0);

    // For row selecting
    const [keyStoreArray, setkeyStoreArray] = useState<any>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // For dropdown menu
    const [dropdownLoading, setdropdownLoading] = useState(false);

    useEffect(() => {
        getPostDraftList()
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

    const getPostDraftList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize }
        const response = await fetchGetPostsByStatus(filters, "DRAFT", settableLoading)
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content
                settotalPostDrafts(response.data.totalElements);
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

    // For dropdowns
    const onSelectChange = (newSelectedRowKeys: React.Key[], e: any, name: any) => {
        if (name.type === "none") {
            setkeyStoreArray([]);
        } else {
            const newArray = [...keyStoreArray];
            newArray[currentPage - 1] = newSelectedRowKeys;
            setkeyStoreArray(newArray);
        }
    };

    const rowSelection: any = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_NONE,
        ],
    };

    const hasSelected = selectedRowKeys.length > 0;

    const handleDropdownActions = async (fetchModifyNews: any, status: string, action: any = null) => {
        setdropdownLoading(true);
        const response = await fetchModifyNews(selectedRowKeys, status, setdropdownLoading);
        if (response) {
            if (response.status === 200) {
                message.success(`${action} ${t("successfully")}`);
                setkeyStoreArray([]);
                getPostDraftList();
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${action} ${t("failed")}`);
        }
    };

    const deleteMultipleDraftsConfirm = () => {
        confirm({
            title: t("multiple-drafts-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: "danger",
            cancelText: t("no"),
            width: 500,
            onOk() {
                handleDropdownActions(fetchChangePostsStatus, "DELETED", t("deleted"));
            },
        });
    };

    const deleteSingleDraftConfirm = (id: any) => {
        confirm({
            title: t("single-draft-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: "danger",
            cancelText: t("no"),
            width: 500,
            async onOk() {
                settableLoading(true);
                const response = await fetchDeletePost(id, settableLoading)
                if (response) {
                    if (response.status === 200) {
                        message.success(`${t("deleted")} ${t("successfully")}`);
                        getPostDraftList();
                    } else {
                        message.error(response.data);
                    }
                } else {
                    message.error(`${t("deleted")} ${t("failed")}`);
                }
            },
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    label: <span onClick={deleteMultipleDraftsConfirm}>{t("Delete draft")}</span>,
                    key: "delete",
                },
            ]}
        />
    );

    // For table
    const columns: any = [
        {
            title: "ID",
            dataIndex: "id",
            width: "10%",
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={"Preview post"}>
                        <Link to={`/posts/preview/${id}`}>{id}</Link>
                    </Tooltip>
                );
            },
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
            responsive: ["lg", "xl", "xxl"]
        },
        {
            title: t("title"),
            dataIndex: "title",
            width: "20%",
            ellipsis: true,
            render: (title: any, row: any) => {
                return (
                    <Tooltip placement="topLeft" title={title}>
                        <Link to={`/posts/preview/${row.id}`}>{title}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("description"),
            dataIndex: "description",
            width: "20%",
            ellipsis: true,
            // responsive: ["lg", "xl", "xxl"]
        },
        {
            title: t("category"),
            dataIndex: "categoryName",
            width: "20%",
            render: (categoryId: string) => {
                return <div>{categoryId ? categoryId : "N/A"}</div>;
            },
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
            title: t('operate'),
            render: (_: any, row: any) => {
                return (
                    <Button onClick={() => deleteSingleDraftConfirm(row.id)} className='d-flex align-items-center'>
                        <DeleteOutlined />
                    </Button>
                )
            }
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
                total: totalPostDrafts,
                showSizeChanger: true,
            }}
            dateFormatter="string"
            headerTitle="Drafts"
            toolBarRender={() => [
                <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => navigate("/posts/create")}>
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

export default PostDrafts