import {
    Breadcrumb,
    Button,
    Image,
    Input,
    InputRef,
    Table,
    TableProps,
    Tag,
    Typography,
    DatePicker,
    message,
    Dropdown,
    Space,
    Menu,
    Modal,
    Checkbox,
    Tooltip,
} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import moment from "moment";

import { SearchOutlined, CalendarOutlined, PlusCircleOutlined, DownOutlined, ExclamationCircleOutlined, FilterFilled, EyeOutlined } from "@ant-design/icons";
import ImgError from "../../../public/img/img-error.png";
import { Link } from "react-router-dom";

import type { FilterConfirmProps } from "antd/es/table/interface";

// samplr data for table
import { fetchChangeProjectStatus, fetchGetAllProjects } from "../../../service/projects";
import SearchBar from "../../Search/SearchBar";
import { useTranslation } from "react-i18next";
import { ProjectStatusMenu } from "../../../Hooks/DropdownMenu";
import { ProTable } from "@ant-design/pro-components";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

interface DataType {
    id: number;
    name: string;
    thumbnail: string;
    startDate: string;
    endDate: string;
    location: any[];
    investorName: string;
    status: string;
}

function AllProject() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [projectData, setProjectData] = useState<any>([]);
    const [tableData, setTableData] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [dropdownLoading, setDropdownLoading] = useState(false);
    const [keyStoreArray, setKeyStoreArray] = useState<any>([]);

    // For pagination
    const [currentPage, setCurrentPage] = useState<any>(1);
    const [pageSize, setPageSize] = useState<any>(10);
    const [totalElement, setTotalElement] = useState(0);

    // For search
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const [firstCall, setFirstCall] = useState(true);
    const searchInput = useRef<InputRef>(null);

    // For filtering
    const [tableFilters, settableFilters] = useState({});

    useEffect(() => {
        getAllProjects();
    }, [tableFilters, currentPage, pageSize]);

    useEffect(() => {
        if (projectData.length > 0) {
            setLoading(true);
            const data: any = projectData.map((item: DataType) => {
                return {
                    key: item.id,
                    id: item.id,
                    name: item.name,
                    thumbnail: item.thumbnail,
                    startDate: moment.utc(item.startDate).local().format("YYYY-MM-DD HH:mm:ss"),
                    endDate: moment.utc(item.endDate).local().format("YYYY-MM-DD HH:mm:ss"),
                    location: [item.location],
                    investorName: item.investorName,
                    status: item.status,
                };
            });
            setLoading(false);
            setTableData(data);
        }
    }, [projectData]);

    const getAllProjects = async () => {
        setLoading(true);
        const searchItems = { ...tableFilters, page: currentPage - 1, size: pageSize };
        const response = await fetchGetAllProjects(searchItems, setLoading, firstCall);
        if (response) {
            if (response.status === 200) {
                console.log("response", response);

                setProjectData(response.data.content);
                setTotalElement(response.data.totalElements);
                setLoading(true);
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Get all projects failed");
        }
        setLoading(false);
    };

    const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: any) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const getColumnSearchProps = (dataIndex: any): ColumnType<DataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div id="list-all-data-table" style={{ padding: 8 }}>
                {dataIndex === "startDate" || dataIndex === "endDate" ? (
                    // @ts-ignore
                    <RangePicker
                        onChange={(e: any) => {
                            setSelectedKeys(e.length ? [e] : []);
                        }}
                        placeholder={["From date", "To date"]}
                        inputReadOnly={true}
                        value={selectedKeys[0]}
                        format="YYYY-MM-DD"
                        style={{ width: "100%", marginBottom: 8, display: "flex" }}
                        renderExtraFooter={() => (
                            <div style={{ textAlign: "center" }}>
                                <Button
                                    onClick={() => {
                                        clearFilters();
                                    }}
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        confirm();
                                    }}
                                >
                                    Confirm
                                </Button>
                            </div>
                        )}
                    />
                ) : dataIndex === "status" ? (
                    <div
                        className="customize-filter"
                        style={{
                            width: 150,
                            marginBottom: 8,
                        }}
                    >
                        <Checkbox.Group
                            options={ProjectStatusMenu()}
                            value={selectedKeys}
                            onChange={(checkedValues) => {
                                setSelectedKeys(checkedValues);
                            }}
                        />
                    </div>
                ) : (
                    <Input
                        ref={searchInput}
                        placeholder={`Search ${dataIndex === "name" ? "name" : dataIndex === "location" ? "location" : dataIndex === "investorName" ? "investor name" : ""
                            }`}
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        style={{ marginBottom: 8, display: "block" }}
                    />
                )}

                <div className="d-flex justify-content-between">
                    <Button
                        className="table-btn-search"
                        type="primary"
                        onClick={() => {
                            handleSearch(selectedKeys as string[], confirm, dataIndex);
                            setFirstCall(false);
                            setLoading(true);
                            setTimeout(() => {
                                setLoading(false);
                            }, 1000);
                        }}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: "48%" }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters();
                            confirm();
                            setLoading(true);
                            setFirstCall(true);
                            setTimeout(() => {
                                setLoading(false);
                            }, 1000);
                            setSearchText("");
                        }}
                        size="small"
                        style={{ width: "48%" }}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: (filtered: boolean) =>
            dataIndex === "startDate" || dataIndex === "endDate" ? (
                <CalendarOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
            ) : dataIndex === "status" ? (
                <FilterFilled style={{ color: filtered ? "#1890ff" : undefined }} />
            ) : (
                <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
        onFilter: (value: any, record: any) =>
            // dataIndex === "startDate" || dataIndex === "endDate"
            //     ? record[dataIndex]
            //     : dataIndex === "status"
            //     ? record[dataIndex] === value || value.includes(record[dataIndex]) || record[dataIndex] === value[0]
            //     : record[dataIndex] === value,
            dataIndex === "startDate" || dataIndex === "endDate"
                ? record[dataIndex]
                : record[dataIndex]
                    .toString()
                    .toLowerCase()
                    .includes((value as string).toLowerCase()),

        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        // render: (text) =>
        //     dataIndex === "name" || dataIndex === "location" ? (
        //         <Highlighter
        //             highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
        //             searchWords={[searchText]}
        //             autoEscape
        //             textToHighlight={text ? text.toString() : ""}
        //         />
        //     ) : (
        //         text
        //     ),
    });

    const columns: any = [
        {
            title: "ID",
            dataIndex: "id",
            render: (id: any, row: any) => (
                <Link className="border-line" to={`/project/detail/${row.id}`}>
                    {id}
                </Link>
            ),
            sorter: (a: any, b: any) => a.id - b.id,
            width: "3%",
        },
        {
            title: t("thumbnail"),
            dataIndex: "thumbnail",
            search: false,
            render: (name: any, row: any) => (
                <div key={row.id}>
                    <Image
                        width={100}
                        height={70}
                        src={name}
                        onError={(event) => {
                            (event.target as any).src = { ImgError };
                        }}
                        fallback={ImgError}
                        />
                </div>
            ),
            width: "10%",
            responsive: ["lg", "xl", "xxl"],
        },
        {
            title: t("name"),
            dataIndex: "name",
            ...getColumnSearchProps("name"),
            render: (name: any, row: any) => (
                <Link className="border-line" to={`/project/detail/${row.id}`}>
                    <strong className="text-capitalize">{name}</strong>
                </Link>
            ),
            width: "10%",
            responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
        },
        {
            title: t("view-on-page"),
            search: false,
            render: (_: any, row: any) => {
                return (
                    <span>
                        {row.status === "APPROVED" ? (
                            <Tooltip placement="topLeft" title={t("view-on-tooltip")}>
                                <Button style={{ borderRadius: "5px" }}>
                                    <a className="d-flex align-items-center" href={`https://v2.pindias.com/project/detail/${row.id}`} target="_blank">
                                        <EyeOutlined />
                                    </a>
                                </Button>
                            </Tooltip>
                        ) : (
                            <Tooltip placement="topLeft" title={t("view-on-tooltip-pending")}>
                                <Button style={{ borderRadius: "5px" }} disabled>
                                    <a className="d-flex align-items-center" href={`https://v2.pindias.com/project/detail/${row.id}`} target="_blank">
                                        <EyeOutlined />
                                    </a>
                                </Button>
                            </Tooltip>
                        )}
                    </span>
                );
            },
        },
        {
            title: t("location"),
            dataIndex: "location",
            // ...getColumnSearchProps("location"),
            render: (name: any, row: any) => (
                <>
                    {row.location.map((e: any, i: any) => (
                        <span key={i} className="text-capitalize">
                            {e.address}, {e.wards}, {e.district}, {e.province}
                        </span>
                    ))}
                </>
            ),
            width: "22%",
            responsive: ["xs", "sm", "md", "lg", "xl", "xxl"],
        },
        {
            title: t("investor"),
            dataIndex: "investorName",
            // ...getColumnSearchProps("investorName"),
            render: (investorName: any, row: any) => <div className="text-capitalize">{investorName}</div>,
            width: "15%",
            responsive: ["lg", "xl", "xxl"],
        },
        {
            title: t("start-date-selling"),
            dataIndex: "startDate",
            ...getColumnSearchProps("startDate"),
            width: "10%",
        },
        {
            title: t("end-date"),
            dataIndex: "endDate",
            ...getColumnSearchProps("endDate"),
            width: "10%",
            responsive: ["sm", "md", "lg", "xl", "xxl"],
        },

        {
            title: t("status"),
            dataIndex: "status",
            ...getColumnSearchProps("status"),
            render: (status: string, index: any) => {
                return (
                    <div id="project-status" key={index}>
                        {status === "APPROVED" ? (
                            <Tag color="#5BD8A6">
                                <span className="text-uppercase status-tag">{status ? t("approved") : ""}</span>
                            </Tag>
                        ) : status === "PENDING" ? (
                            <Tag color="#FF9900">
                                <span className="text-uppercase status-tag">{status ? t("pending") : ""}</span>
                            </Tag>
                        ) : status === "STOPPED" ? (
                            <Tag color="#726e6e">
                                <span className="text-uppercase status-tag">{status ? t("stopped") : ""}</span>
                            </Tag>
                        ) : (
                            ""
                        )}
                    </div>
                );
            },

            width: "10%",
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<DataType> = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_NONE,
            {
                key: "odd",
                text: "Select Odd Row",
                onSelect: (changableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((_, index) => {
                        if (index % 2 !== 0) {
                            return false;
                        }
                        return true;
                    });
                    setSelectedRowKeys(newSelectedRowKeys);
                },
            },
            {
                key: "even",
                text: "Select Even Row",
                onSelect: (changableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((_, index) => {
                        if (index % 2 !== 0) {
                            return true;
                        }
                        return false;
                    });
                    setSelectedRowKeys(newSelectedRowKeys);
                },
            },
        ],
    };

    const hasSelected = selectedRowKeys.length > 0;

    const start = () => {
        setLoading(true);
        setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
        }, 1000);
    };

    // For dropdowns
    const handleDropdownActions = async (fetchModifyProject: any, status: string, action: any = null) => {
        setDropdownLoading(true);
        const response = await fetchModifyProject(selectedRowKeys, status, setDropdownLoading);
        if (response) {
            if (response.status === 200) {
                message.success(`${action} ${selectedRowKeys.length > 1 ? "project with ids:" : "project with id"} ${selectedRowKeys.join(", ")} successfully`);
                setSelectedRowKeys([]);
                getAllProjects();
            } else {
                message.error(response.data);
            }
        } else {
            message.error(`${action} ${selectedRowKeys.length > 1 ? "projects" : "project"} failed`);
        }
    };

    const onChange: TableProps<DataType>["onChange"] = (pagination, filters, sorter, extra) => {
        const { current, pageSize } = pagination;
        setCurrentPage(current);
        setPageSize(pageSize);
        // const { id, name, startDate, endDate, location, investor, status } = filters;
        const { id, name, startDate, endDate, location, investor, status }: any = filters;
        const filter = {
            id: id && id.length > 0 ? id[0] : "",
            name: name && name.length > 0 ? name[0] : "",
            location: location && location.length > 0 ? location[0] : "",
            investor: investor && investor.length > 0 ? investor[0] : "",
            startFrom: startDate ? moment(startDate[0][0]._d).format("YYYY-MM-DD") : "",
            startTo: startDate ? moment(startDate[0][1]._d).format("YYYY-MM-DD") : "",
            endFrom: endDate ? moment(endDate[0][0]._d).format("YYYY-MM-DD") : "",
            endTo: endDate ? moment(endDate[0][1]._d).format("YYYY-MM-DD") : "",
            status: status && status.length > 0 ? status : "",
        };
        settableFilters(filter);
    };

    const showPromiseConfirm = () => {
        confirm({
            title: `Are you sure you want to reject ${selectedRowKeys.length > 1 ? "these project" : "this project"}?`,
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                handleDropdownActions(fetchChangeProjectStatus, "rejected", "Dejected");
            },
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    label: (
                        <span onClick={() => handleDropdownActions(fetchChangeProjectStatus, "APPROVED", "Approved")}>
                            Approve Project{selectedRowKeys.length > 1 && "s"}
                        </span>
                    ),
                    key: "approved",
                },
                {
                    label: (
                        <span onClick={() => handleDropdownActions(fetchChangeProjectStatus, "PENDING", "Pending")}>
                            Pending Project{selectedRowKeys.length > 1 && "s"}
                        </span>
                    ),
                    key: "pending",
                },
                // {
                //     label: <span onClick={showPromiseConfirm}>Delete Project{selectedRowKeys.length > 1 && "s"}</span>,
                //     key: "DELETED",
                // },
                {
                    label: (
                        <span onClick={() => handleDropdownActions(fetchChangeProjectStatus, "STOPPED", "Stopped")}>
                            Stop Project{selectedRowKeys.length > 1 && "s"}
                        </span>
                    ),
                    key: "stopped",
                },
            ]}
        />
    );

    return (
        <>
            <div className="d-flex justify-content-between align-items-center" style={{ margin: "16px 0" }}>
                <Title level={4}>{t("project-list-all")}</Title>
                <Breadcrumb>
                    <Breadcrumb.Item>{t("project-manager")}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t("project-list-all")}</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            {/* <SearchBar /> */}
            <br />
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 16 }}>
                    <span>
                        <Dropdown overlay={menu} trigger={["click"]} disabled={!hasSelected} placement="bottom">
                            <Button type="primary" disabled={!hasSelected} loading={dropdownLoading}>
                                <Space>
                                    Actions
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>
                        <span style={{ marginLeft: 8 }}>{hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}</span>
                    </span>
                    <span>
                        <Button href="/project/create">
                            <div className="d-flex align-items-center justify-content-between">
                                <PlusCircleOutlined className="me-2" />
                                {t("project-create-new")}
                            </div>
                        </Button>
                    </span>
                </div>

                <ProTable
                    scroll={{
                        x: "fit-content",
                    }}
                    rowSelection={rowSelection}
                    loading={loading}
                    columns={columns}
                    dataSource={tableData}
                    onChange={onChange}
                    pagination={{
                        current: currentPage,
                        defaultPageSize: 1,
                        pageSize: pageSize,
                        total: totalElement,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        responsive: true,
                        showTotal(total, range) {
                            return `${range[0]}-${range[1]} of ${total} items`;
                        },
                    }}
                />
            </div>
        </>
    );
}
export default AllProject;
