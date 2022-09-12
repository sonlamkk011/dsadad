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
    Tooltip,
} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import moment from "moment";

import { SearchOutlined, CalendarOutlined, DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import ImgError from "../../../public/img/img-error.png";
import { Link, useParams } from "react-router-dom";

import type { FilterConfirmProps } from "antd/es/table/interface";
import { fetchGetAllRealEstateOfProjects } from "../../../service/projects";
import { updateRealEstateStatus } from "../../../service/config";

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
    purpose: string;
    status: string;
}

function RealEstateOfProject() {
    const { params } = useParams();
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
    const searchInput = useRef<InputRef>(null);

    // For filtering
    const [tableFilters, settableFilters] = useState({});

    useEffect(() => {
        getAllProjects();
    }, [tableFilters, currentPage, pageSize]);

    useEffect(() => {
        if (projectData.length > 0) {
            setLoading(true);
            const data: any = projectData.map((item: any) => {
                return {
                    key: item.id,
                    id: item.id,
                    name: item.name,
                    thumbnail: item.thumbnail,
                    purpose: item.purpose,
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
        const searchItems = { ...tableFilters, projectId: params, page: currentPage - 1, size: pageSize };

        const response = await fetchGetAllRealEstateOfProjects(searchItems, setLoading);
        if (response) {
            if (response.status === 200) {
                setProjectData(response.data.content);
                setTotalElement(response.data.totalElements);
                setLoading(true);
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Get all projects failed");
        }
        setTimeout(function () {
            setLoading(false);
        }, 2000);
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
                ) : (
                    <Input
                        ref={searchInput}
                        placeholder={`Search ${
                            dataIndex === "name" ? "name" : dataIndex === "location" ? "location" : dataIndex === "investorName" ? "investor name" : ""
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
            ) : (
                <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
        onFilter: (value: any, record: any) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
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

    const columns: ColumnsType<DataType> = [
        {
            title: "ID",
            dataIndex: "id",
            render: (id, row) => (
                <Link className="border-line" to={`/project/overview/${row.id}`}>
                    {id}
                </Link>
            ),
            sorter: (a, b) => a.id - b.id,
            width: "3%",
            responsive: ["md", "lg", "xl", "lg", "xl", "xxl"],
        },
        {
            title: "Thumbnail",
            dataIndex: "thumbnail",
            render: (name, row) => (
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
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },
        {
            title: "Name",
            dataIndex: "name",
            ...getColumnSearchProps("name"),
            render: (name, row) => (
                // <Link className="border-line" to={`/project/real-estate-list-of-${row.name}/${row.id}`}>
                <Link className="border-line" to={`/project/overview/${row.id}`}>
                    <strong className="text-capitalize">{name}</strong>
                </Link>
            ),
            width: "20%",
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },

        {
            title: "Purpose",
            dataIndex: "purpose",
            key: "purpose",
            width: "10%",
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
            filters: [
                { text: "SELL", value: "SELL" },
                { text: "RENT", value: "RENT" },
            ],
            filterMultiple: true,
            onFilter: (value: any, record: any) => record.purpose.indexOf(value) === 0,
            render: (purpose, record) => {
                return (
                    <>
                        {purpose === "SELL" ? (
                            <Tag color="blue" style={{ width: 50 }} className="text-center">
                                <span className="text-uppercase">{purpose}</span>
                            </Tag>
                        ) : (
                            <Tag color="purple" style={{ width: 50 }} className="text-center">
                                <span className="text-uppercase">{purpose}</span>
                            </Tag>
                        )}
                    </>
                );
            },
        },
        {
            title: "Location",
            dataIndex: "location",
            ...getColumnSearchProps("location"),
            render: (address) => (
                <Tooltip placement="topLeft" title={address} className="text-capitalize">
                    <span className="text-capitalize">{address}</span>
                </Tooltip>
            ),
            width: "22%",
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },
        {
            title: "Start Date",
            dataIndex: "startDate",
            ...getColumnSearchProps("startDate"),
            // render(startDate) {
            //     return moment(startDate).format("DD/MM/YYYY");
            // },
            width: "10%",
        },
        {
            title: "End Date",
            dataIndex: "endDate",
            ...getColumnSearchProps("endDate"),
            // render(endDate, row) {
            //     return moment(row.endDate).format("LLLL");
            // },
            width: "10%",
            responsive: ["sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },
        {
            title: "Status",
            dataIndex: "status",
            // ...getColumnSearchProps("status"),
            filters: [
                {
                    text: "APPROVED",
                    value: "approved",
                },
                {
                    text: "PENDING",
                    value: "pending",
                },
                {
                    text: "FINISHED",
                    value: "stopped",
                },
                {
                    text: "REJECTED",
                    value: "deleted",
                },
            ],
            render: (status: string, index: any) => {
                return (
                    <div key={index}>
                        {status === "APPROVED" ? (
                            <Tag color="#5BD8A6" style={{ width: "50%" }} className="text-center">
                                <span className="text-uppercase">{status}</span>
                            </Tag>
                        ) : status === "PENDING" ? (
                            <Tag color="#FF9900" style={{ width: "50%" }} className="text-center">
                                <span className="text-uppercase">{status}</span>
                            </Tag>
                        ) : status === "FINISHED" ? (
                            <Tag color="#089fbd" style={{ width: "50%" }} className="text-center">
                                <span className="text-uppercase">{status}</span>
                            </Tag>
                        ) : status === "REJECTED" ? (
                            <Tag color="#FF0000" style={{ width: "50%" }} className="text-center">
                                <span className="text-uppercase">{status}</span>
                            </Tag>
                        ) : (
                            ""
                        )}
                    </div>
                );
            },
            onFilter: (value: any, record: any) => {
                return record.status === value;
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
    const handleDropdownActions = async (fetchModifyAccounts: any, status: string, action: any = null) => {
        setDropdownLoading(true);
        const response = await fetchModifyAccounts(selectedRowKeys, status, setDropdownLoading);
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
        const { id, name, startDate, endDate, location, investor, status } = filters;
        const filter = {
            id: id && id.length > 0 ? id[0] : "",
            name: name && name.length > 0 ? name[0] : "",
            startDate: startDate && startDate.length > 0 ? startDate[0] : "",
            endDate: endDate && endDate.length > 0 ? endDate[0] : "",
            location: location && location.length > 0 ? location[0] : "",
            investor: investor && investor.length > 0 ? investor[0] : "",
            status: status && status.length > 0 ? status[0] : "",
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
                handleDropdownActions(updateRealEstateStatus, "rejected", "Dejected");
            },
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    label: (
                        <span onClick={() => handleDropdownActions(updateRealEstateStatus, "approved", "Approved")}>
                            Approve Project{selectedRowKeys.length > 1 && "s"}
                        </span>
                    ),
                    key: "approved",
                },
                {
                    label: (
                        <span onClick={() => handleDropdownActions(updateRealEstateStatus, "pending", "Pending")}>
                            Pending Project{selectedRowKeys.length > 1 && "s"}
                        </span>
                    ),
                    key: "pending",
                },
                {
                    label: <span onClick={showPromiseConfirm}>Delete Project{selectedRowKeys.length > 1 && "s"}</span>,
                    key: "deleted",
                },
                {
                    label: (
                        <span onClick={() => handleDropdownActions(updateRealEstateStatus, "stopped", "Stopped")}>
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
                        {/* <Button href="/project/create">
                            <div className="d-flex align-items-center justify-content-between">
                                <UserAddOutlined className="me-2" />
                                Create New Project
                            </div>
                        </Button> */}
                    </span>
                </div>
                <Table
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
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                />
            </div>
        </>
    );
}
export default RealEstateOfProject;
