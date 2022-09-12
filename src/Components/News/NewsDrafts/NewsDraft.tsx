import { useEffect, useState } from 'react'
import { Breadcrumb, Button, message, Table, Tooltip, Typography, Image, Dropdown, Space, Modal, Menu } from 'antd';
import { DownOutlined, ExclamationCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from 'react-router-dom';
import { fetchChangeNewsStatus, fetchGetNewsByStatus } from '../../../service/News/news';
import { t } from 'i18next';
import { ProTable } from '@ant-design/pro-components';

const { Title } = Typography;
const { confirm } = Modal;

function NewsDrafts() {
    const navigate = useNavigate();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);

    // For pagination
    const [currentPage, setcurrentPage] = useState<any>(1);
    const [pageSize, setpageSize] = useState<any>(10);
    const [totalNewsDrafts, settotalNewsDrafts] = useState(0);

    // For row selecting
    const [keyStoreArray, setkeyStoreArray] = useState<any>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // For dropdown menu
    const [dropdownLoading, setdropdownLoading] = useState(false);

    useEffect(() => {
        getRealEstateDraftList()
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

    const getRealEstateDraftList = async () => {
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
                getRealEstateDraftList();
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${action} ${t("failed")}`);
        }
    };

    const showPromiseConfirm = () => {
        confirm({
            title: t("multiple-drafts-delete-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: "danger",
            cancelText: t("no"),
            width: 500,
            onOk() {
                handleDropdownActions(fetchChangeNewsStatus, "DELETED", t("deleted"));
            },
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    label: <span onClick={showPromiseConfirm}>{t("Delete draft")}</span>,
                    key: "delete",
                },
            ]}
        />
    );

    // For table
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            width: "4%",
            render: (id: string) => {
                return (
                    <Tooltip placement="topLeft" title={"View news details"}>
                        <Link to={`/news/details/${id}`}>{id}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("thumbnail"),
            dataIndex: "thumbnail",
            width: "10%",
            render: (thumbnail: string) => {
                return <Image width={100} src={thumbnail} />;
            },
        },
        {
            title: t("title"),
            dataIndex: "title",
            width: "12%",
            ellipsis: true,
            render: (title: any, row: any) => {
                return (
                    <Tooltip placement="topLeft" title={title}>
                        <Link to={`/news/details/${row.id}`}>{title}</Link>
                    </Tooltip>
                );
            },
        },
        {
            title: t("subtitle"),
            dataIndex: "subtitle",
            width: "30%",
        },
        {
            title: t("category"),
            dataIndex: "categoryName",
            render: (categoryId: string) => {
                return <div>{categoryId ? categoryId : "N/A"}</div>;
            },
        },
    ];

    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const { current, pageSize } = pagination;
        setcurrentPage(current);
        setpageSize(pageSize);
    };

    return (
        <div id='news-draft-list'>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: '16px 0' }}>
                <Title level={4}>{t("drafts")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("news")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("drafts")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div
                className="site-layout-background"
                style={{
                    padding: 24,
                    minHeight: 360
                }}
            >
                <div className='d-flex align-items-center justify-content-between' style={{ marginBottom: 16 }}>
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
                        <Button className='me-2' type='primary' onClick={() => navigate('/news/create')}>
                            <div className='d-flex align-items-center justify-content-between'>
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
                    scroll={{ x: 1300 }}
                    pagination={{
                        current: currentPage,
                        defaultPageSize: 10,
                        pageSize: pageSize,
                        total: totalNewsDrafts,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100']
                    }}
                />
            </div>
        </div>
    )
}

export default NewsDrafts