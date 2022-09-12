import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, message, Table, Typography, Modal, Spin, Dropdown } from "antd";
import { ExclamationCircleOutlined, DeleteOutlined, PlusOutlined, DownOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import CreateNewCategory from "./CreateNewCategory";
import { fetchDeleteCategoryById, fetchGetCategories } from "../../service/Categories/Categories";
import EditCategory from "./EditCategory";
import { t } from "i18next";
import { handleStatusName } from "../../Hooks/NameHandler";
import { PageContainer, ProTable } from "@ant-design/pro-components";

const { confirm } = Modal;

function CategoriesList({ categoryType }: any) {
    const location = useLocation();
    const [tableLoading, settableLoading] = useState(false);
    const [tableData, settableData] = useState([]);

    // For pagination
    const [currentPage, setcurrentPage] = useState<any>(1);
    const [pageSize, setpageSize] = useState<any>(10);
    const [totalCategories, settotalCategories] = useState(0);

    useEffect(() => {
        getCategoriesList();
    }, [location.pathname, currentPage, pageSize]);

    const getCategoriesList = async () => {
        settableLoading(true);
        const filters = { page: currentPage - 1, size: pageSize, type: categoryType, status: "ACTIVE" };
        const response = await fetchGetCategories(filters, settableLoading);
        if (response) {
            if (response.status === 200) {
                const contents = response.data.content;
                settotalCategories(response.data.totalElements);
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
            message.error(t("Get categories list failed"));
        }
    };

    const columns: any = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: t("name"),
            dataIndex: "name",
        },
        {
            title: t("status"),
            dataIndex: "status",
            render: (status: string) => {
                return (
                    <div>
                        {handleStatusName(status)}
                    </div>
                )
            }
        },
        {
            title: t("action"),
            render: (_: any, row: any) => {
                return (
                    <div className="d-flex">
                        <EditCategory rowDetail={row} reloadTableData={getCategoriesList} />
                        <Button danger className="ms-2 d-flex align-items-center" onClick={() => showDeleteSingleCategoryConfirm(row.id)}>
                            <DeleteOutlined />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        const { current, pageSize } = pagination;
        setcurrentPage(current);
        setpageSize(pageSize);
    };

    const showDeleteSingleCategoryConfirm = (id: any) => {
        confirm({
            title: t("delete-category-confirm"),
            icon: <ExclamationCircleOutlined />,
            okText: t("yes"),
            okType: "danger",
            cancelText: t("no"),
            onOk() {
                return new Promise((resolve, reject) => {
                    executeDeleteSingleCategory(id, resolve, reject);
                }).catch(() => console.log(`${t("Delete category failed")}!`));
            },
        });
    };

    const executeDeleteSingleCategory = async (id: any, resolve: any, reject: any) => {
        const response = await fetchDeleteCategoryById(id);
        if (response) {
            if (response.status === 200) {
                message.success(t("Category deleted successfully"));
                resolve();
                getCategoriesList();
            } else {
                message.error(response.data);
            }
        } else {
            reject();
            message.error(t("Delete category failed"));
        }
    };
    const content = (
        <ProTable<any>
            rowKey="id"
            dataSource={tableData}
            columns={columns}
            onChange={handleTableChange}
            cardBordered
            loading={tableLoading}
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
                total: totalCategories,
                showSizeChanger: true,
            }}
            dateFormatter="string"
            headerTitle="News List"
            toolBarRender={() => [
                <CreateNewCategory getCategoriesList={getCategoriesList} categoryType={categoryType} />,
            ]}
        />
    )

    return (
        // <div id="all-news">
        //     <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
        //         <Title level={4}>{t("category-list")}</Title>
        //         <Breadcrumb>
        //             <Breadcrumb.Item>{t("category-title")}</Breadcrumb.Item>
        //             <Breadcrumb.Item>{t("category-list")}</Breadcrumb.Item>
        //         </Breadcrumb>
        //     </div>
        //     <div
        //         className="site-layout-background"
        //         style={{
        //             padding: 24,
        //             minHeight: 360,
        //         }}
        //     >
        //         <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 16 }}>
        //             <span>
        //             </span>
        //             <CreateNewCategory getCategoriesList={getCategoriesList} categoryType={categoryType} />
        //         </div>
        //         <Table
        //             columns={columns}
        //             dataSource={tableData}
        //             loading={tableLoading}
        //             onChange={handleTableChange}
        //             pagination={{
        //                 current: currentPage,
        //                 defaultPageSize: 10,
        //                 pageSize: pageSize,
        //                 total: totalCategories,
        //                 showSizeChanger: true,
        //                 pageSizeOptions: ["10", "20", "50", "100"],
        //             }}
        //         />
        //     </div>
        // </div>
        <PageContainer
            style={{ padding: 24, paddingBottom: 0 }}
            content={content}
        />
    );
}

export default CategoriesList;
