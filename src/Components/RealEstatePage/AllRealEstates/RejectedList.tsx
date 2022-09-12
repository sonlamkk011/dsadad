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
    Row,
    Col,
    Form,
    Checkbox,
} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import moment from "moment";

import { SearchOutlined, CalendarOutlined, DownOutlined, PlusCircleOutlined, EyeOutlined, ExclamationCircleOutlined, FilterFilled } from "@ant-design/icons";
import ImgError from "../../../public/img/img-error.png";
import { Link, useParams } from "react-router-dom";

import type { FilterConfirmProps } from "antd/es/table/interface";
import { fetchChangeRealEstateStatus, getAllNewsRealEstate, getAllNewsRealEstateSearchFilter } from "../../../service/real-estate-all";
import { useTranslation } from "react-i18next";

import isBot from "../../../public/img/bot.png";
import isHuman from "../../../public/img/isHuman.png";
import { PurposeStatusMenu, RealEstateStatusMenu, userBotOptions } from "../../../Hooks/DropdownMenu";
import { fetchGetRealEstatesByStatus } from "../../../service/RealEstates/realEstate";
import { ProTable } from "@ant-design/pro-components";

// samplr data for table

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { TextArea } = Input;

interface DataType {
    key: React.Key;
    id: number;
    name: string;
    thumbnail: string;
    startDate: string;
    endDate: string;
    location: any[];
    purpose: string;
    status: string;
}

function RejectedList() {
    const { t } = useTranslation();
    const { params } = useParams();
    const [actionForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [projectData, setProjectData] = useState<any>([]);
    const [realEstateData, setRealEstateData] = useState<any>([]);
    const [tableData, setTableData] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [dropdownLoading, setDropdownLoading] = useState(false);
    const [keyStoreArray, setKeyStoreArray] = useState<any>([]);
    const [actionVisible, setActionVisible] = useState(false);
    const [actionType, setActionType] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [searchFilter, setSearchFilter] = useState(false);

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
    const [selectedOption, setselectedOption] = useState<any>([]);

    useEffect(() => {
        getAllRealEstate();
    }, [tableFilters, currentPage, pageSize]);

    useEffect(() => {
        if (realEstateData.length > 0) {
            setLoading(true);
            const data: any = realEstateData.map((item: any) => {
                return {
                    key: item.id,
                    id: item.id,
                    name: item.name,
                    thumbnail: item.thumbnail,
                    purpose: item.purpose,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    location: [item.location],
                    district: [item.district[0]] || ["Không xác định"],
                    province: [item.province[0]] || ["Không xác định"],
                    ward: [item.ward[0]] || ["Không xác định"],
                    investorName: item.investorName,
                    status: item.status,
                    isBot: item.isBot,
                    contact: item.contact,
                };
            });
            setLoading(false);
            setTableData(data);
        }
    }, [realEstateData]);

    const getAllRealEstate = async () => {
        setLoading(true);
        const searchItems = { ...tableFilters, page: currentPage - 1, size: pageSize, projectId: params === undefined ? "" : params };
        const response = await fetchGetRealEstatesByStatus(searchItems, "REJECTED", setLoading);
        if (response) {
            if (response.status === 200) {
                const newData: any = [];
                response.data.content.forEach((element: any) => {
                    const detail = JSON.parse(element.detail);
                    newData.push({
                        key: element.id,
                        id: element.id,
                        name: element.name,
                        thumbnail: element.thumbnail,
                        purpose: element.purpose,
                        startDate: element.startDate,
                        endDate: element.endDate,
                        location: [element.location] || [" Không xác định"],
                        district: [element.district] || [" Không xác định"],
                        province: [element.province] || [" Không xác định"],
                        ward: [element.ward],
                        investorName: element.investorName,
                        status: element.status,
                        isBot: element.isBot,
                        contact: detail.contact.name,
                    });
                });
                if (newData.length > 0) {
                    setLoading(false);
                    setRealEstateData(newData);
                }
                console.log("newData", newData);

                setRealEstateData(newData);
                setTotalElement(response.data.totalElements);
                setLoading(true);
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Get all real estate failed");
        }
        setLoading(false);
        return;
    };

    const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: any) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
        setSearchFilter(true);
    };

    const handleOptionsChange = (newCheckedKeysArray: any, setSelectedKeys: any) => {
        const filteredArray = newCheckedKeysArray.filter((value: any) => !selectedOption.includes(value));
        setselectedOption(filteredArray);
        setSelectedKeys(filteredArray);
    };

    const getColumnSearchProps = (dataIndex: any): ColumnType<DataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div id="list-all-data-table" style={{ padding: 8 }}>
                {dataIndex === "startDate" || dataIndex === "endDate" ? (
                    <DatePicker.RangePicker
                        onChange={(e: any) => {
                            setSelectedKeys(e.length ? [e] : []);
                        }}
                        placeholder={["Start", "End"]}
                        value={selectedKeys[0]}
                        format="YYYY-MM-DD"
                        style={{ marginBottom: 8 }}
                    />
                ) : dataIndex === "isBot" ? (
                    <div
                        className="customize-filter"
                        style={{
                            width: 150,
                            marginBottom: 8,
                        }}
                    >
                        <Checkbox.Group
                            options={userBotOptions}
                            value={selectedKeys}
                            onChange={(checkedValues) => {
                                handleOptionsChange(checkedValues, setSelectedKeys);
                            }}
                        />
                    </div>
                ) : dataIndex === "status" ? (
                    <div
                        className="customize-filter"
                        style={{
                            width: 150,
                            marginBottom: 8,
                        }}
                    >
                        <Checkbox.Group
                            options={RealEstateStatusMenu()}
                            value={selectedKeys}
                            onChange={(checkedValues) => {
                                setSelectedKeys(checkedValues);
                                // handleOptionsChange(checkedValues, setSelectedKeys);
                            }}
                        />
                    </div>
                ) : dataIndex === "purpose" ? (
                    <div
                        className="customize-filter"
                        style={{
                            width: 150,
                            marginBottom: 8,
                        }}
                    >
                        <Checkbox.Group
                            options={PurposeStatusMenu()}
                            value={selectedKeys}
                            onChange={(checkedValues) => {
                                handleOptionsChange(checkedValues, setSelectedKeys);
                            }}
                        />
                    </div>
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
                            setSearchFilter(false);
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
            ) : dataIndex === "isBot" || dataIndex === "status" || dataIndex === "purpose" ? (
                <FilterFilled style={{ color: filtered ? "#1890ff" : undefined }} />
            ) : (
                <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
        onFilter: (value: any, record: any) =>
            dataIndex === "startDate" || dataIndex === "endDate"
                ? record[dataIndex]
                : record[dataIndex]
                      .toString()
                      .toLowerCase()
                      .includes((value as string).toLowerCase()),

        // dataIndex === "startDate" || dataIndex === "endDate"
        //     ? record[dataIndex]
        //     : dataIndex === "isBot" || dataIndex === "status" || dataIndex === "purpose"
        //     ? record[dataIndex] === value || value.includes(record[dataIndex]) || record[dataIndex] === value[0]
        //     : record[dataIndex] === value,
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

    const columns: any = [
        {
            key: "id",
            title: "ID",
            dataIndex: "id",
            render: (id: any, row: any) => (
                <Link className="border-line" to={`/real-estate/demo-view/${row.id}`}>
                    {id}
                </Link>
            ),
            sorter: (a: any, b: any) => a.id - b.id,
            width: "3%",
        },
        {
            key: "thumbnail",
            title: t("thumbnail"),
            dataIndex: "thumbnail",
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
            responsive: ["lg", "xl", "lg", "xl", "xxl"],
        },
        {
            key: "name",
            title: t("name"),
            dataIndex: "name",
            ...getColumnSearchProps("name"),
            render: (name: any, row: any) => (
                <Link className="border-line" to={`/real-estate/demo-view/${row.id}`}>
                    <span className="text-capitalize fw-bold">{name}</span>
                </Link>
            ),
            width: "15%",
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },
        {
            title: t("view-on-page"),
            render: (_: any, row: any) => {
                return (
                    <span>
                        {row.status === "APPROVED" ? (
                            <Tooltip placement="topLeft" title={t("view-on-tooltip")}>
                                <Button style={{ borderRadius: "5px" }}>
                                    <a className="d-flex align-items-center" href={`https://v2.pindias.com/real-estate/detail/${row.id}`} target="_blank">
                                        <EyeOutlined />
                                    </a>
                                </Button>
                            </Tooltip>
                        ) : (
                            <Tooltip placement="topLeft" title={t("view-on-tooltip-pending")}>
                                <Button style={{ borderRadius: "5px" }} disabled>
                                    <a className="d-flex align-items-center" href={"#"} target="_blank">
                                        <EyeOutlined />
                                    </a>
                                </Button>
                            </Tooltip>
                        )}
                    </span>
                );
            },
            responsive: ["lg", "xl", "lg", "xl", "xxl"],
        },
        {
            key: "purpose",
            title: t("purpose"),
            dataIndex: "purpose",
            ...getColumnSearchProps("purpose"),
            width: "8%",
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
            render: (status: string, index: any) => {
                return (
                    <div key={index}>
                        {status === "SELL" ? (
                            <Tag color="blue" className="text-center">
                                <span className="text-uppercase">{status}</span>
                            </Tag>
                        ) : status === "RENT" ? (
                            <Tag color="purple" className="text-center">
                                <span className="text-uppercase">{status}</span>
                            </Tag>
                        ) : (
                            t("updating")
                        )}
                    </div>
                );
            },
        },
        {
            key: "location",
            title: t("location"),
            dataIndex: ["location", "province", "district", "ward"] as any,
            ...getColumnSearchProps("location"),
            render: (address: any, row: any) => (
                <Tooltip placement="topLeft" title={address} className="text-capitalize">
                    <span className="text-capitalize">{`${row?.location}, ${row.ward[0]?.nameWithType}, ${row.district[0]?.nameWithType}, ${row.province[0]?.nameWithType},`}</span>
                </Tooltip>
            ),
            width: "22%",
            responsive: ["xs", "sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },

        {
            key: "startDate",
            title: t("start-date"),
            dataIndex: "startDate",
            ...getColumnSearchProps("startDate"),
            render: (startDate: any, row: any) => (
                <Tooltip placement="topLeft" title={startDate} className="text-capitalize">
                    <span className="text-capitalize">{moment(startDate).format("YYYY-MM-DD HH:mm:ss")}</span>
                </Tooltip>
            ),
            width: "10%",
        },
        {
            key: "endDate",
            title: t("end-date"),
            dataIndex: "endDate",
            ...getColumnSearchProps("endDate"),
            render: (endDate: any, row: any) => (
                <Tooltip placement="topLeft" title={endDate} className="text-capitalize">
                    <span className="text-capitalize">{moment(endDate).format("YYYY-MM-DD HH:mm:ss")}</span>
                </Tooltip>
            ),

            width: "10%",
            responsive: ["lg", "xl", "lg", "xl", "xxl"],
        },
        {
            key: "status",
            title: t("status"),
            dataIndex: "status",
            ...getColumnSearchProps("status"),
            render: (status: string, index: any) => {
                return (
                    <div id="real-estate-status" key={index}>
                        {status === "REJECTED" ? (
                            <Tag color="#FF0000">
                                <span className="text-uppercase status-tag">{status}</span>
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
        {
            key: "isBot",
            title: t("creator"),
            dataIndex: "isBot",
            ...getColumnSearchProps("isBot"),
            render: (item: any, row: any) => (
                <div>
                    {row.isBot === true ? (
                        <Image preview={false} width={30} src={isBot} />
                    ) : (
                        <div>
                            <Image preview={false} width={30} src={isHuman} />
                            {row.contact}
                        </div>
                    )}
                </div>
            ),
            width: "5%",
            responsive: ["sm", "md", "lg", "xl", "lg", "xl", "xxl"],
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<DataType> = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            // Table.SELECTION_ALL,
            Table.SELECTION_NONE,
            // {
            //     key: "odd",
            //     text: "Select Odd Row",
            //     onSelect: (changableRowKeys) => {
            //         let newSelectedRowKeys = [];
            //         newSelectedRowKeys = changableRowKeys.filter((_, index) => {
            //             if (index % 2 !== 0) {
            //                 return false;
            //             }
            //             return true;
            //         });
            //         setSelectedRowKeys(newSelectedRowKeys);
            //     },
            // },
            // {
            //     key: "even",
            //     text: "Select Even Row",
            //     onSelect: (changableRowKeys) => {
            //         let newSelectedRowKeys = [];
            //         newSelectedRowKeys = changableRowKeys.filter((_, index) => {
            //             if (index % 2 !== 0) {
            //                 return true;
            //             }
            //             return false;
            //         });
            //         setSelectedRowKeys(newSelectedRowKeys);
            //     },
            // },
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

    const onChange: TableProps<DataType>["onChange"] = (pagination, filters, sorter, extra) => {
        const { current, pageSize } = pagination;

        setCurrentPage(current);
        setPageSize(pageSize);
        const { id, name, startDate, endDate, location, purpose, status, isBot }: any = filters;
        const filter = {
            id: id && id.length > 0 ? id[0] : "",
            name: name && name.length > 0 ? name[0] : "",
            // startDate: startDate && startDate.length > 0 ? startDate[0] : "",
            // endDate: endDate && endDate.length > 0 ? endDate[0] : "",
            location: location && location.length > 0 ? location[0] : "",
            purpose: purpose && purpose.length > 0 ? purpose : "",
            status: status && status.length > 0 ? status : "",
            startFrom: startDate ? moment(startDate[0][0]._d).format("YYYY-MM-DD") : "",
            startTo: startDate ? moment(startDate[0][1]._d).format("YYYY-MM-DD") : "",
            endFrom: endDate ? moment(endDate[0][0]._d).format("YYYY-MM-DD") : "",
            endTo: endDate ? moment(endDate[0][1]._d).format("YYYY-MM-DD") : "",
            bots: isBot && isBot.length > 0 ? isBot[0] : "",
        };
        settableFilters(filter);
    };

    const showPromiseConfirm = () => {
        confirm({
            title: `Are you sure you want to ${actionType === "DELETED" ? "DELETE" : "REJECT"} ${
                selectedRowKeys.length > 1 ? "these real estate" : "this real estate"
            }?`,
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                onChangeStatus();
            },
        });
    };

    const showModal = (status: any) => {
        setActionType(status);
        setActionVisible(true);
    };

    const onChangeStatus = () => {
        actionForm
            .validateFields()
            .then(async (values) => {
                setDropdownLoading(true);
                const response = await fetchChangeRealEstateStatus(selectedRowKeys, actionType, actionMessage, setDropdownLoading);
                if (response) {
                    if (response.status === 200) {
                        message.success(
                            "Change status successfully! " +
                                (actionType === "DELETED" ? "Deleted" : "Rejected") +
                                " " +
                                selectedRowKeys.length +
                                " real estate(s)"
                        );
                        setSelectedRowKeys([]);
                        setActionVisible(false);
                        actionForm.resetFields();
                        getAllRealEstate();
                    } else {
                        message.error(response.data === "Invalid status" ? "Cannot change Approved status to Pending!" : "response.data");
                        setActionVisible(false);
                    }
                } else {
                    console.log("error");
                    message.error(`${actionType} ${selectedRowKeys.length > 1 ? "real estate" : "real estate"} failed`);
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const handleOk = () => {
        if (actionType === "DELETED" || actionType === "REJECTED") {
            showPromiseConfirm();
        } else {
            onChangeStatus();
        }
    };

    const handleCancel = () => {
        setActionVisible(false);
        actionForm.resetFields();
    };

    const menu = (
        <Menu
            items={[
                {
                    label: <span onClick={() => showModal("APPROVED")}>Approve Real Estate{selectedRowKeys.length > 1 && "s"}</span>,
                    key: "APPROVED",
                },
                {
                    label: <span onClick={() => showModal("PENDING")}>Pending Real Estate{selectedRowKeys.length > 1 && "s"}</span>,
                    key: "PENDING",
                },
                {
                    label: <span onClick={() => showModal("REJECTED")}>Reject Real Estate{selectedRowKeys.length > 1 && "s"}</span>,
                    key: "REJECTED",
                },
                {
                    label: <span onClick={() => showModal("OPENING")}>Opening Real Estate{selectedRowKeys.length > 1 && "s"}</span>,
                    key: "OPENING",
                },
                {
                    label: <span onClick={() => showModal("FINISHED")}>Finish Real Estate{selectedRowKeys.length > 1 && "s"}</span>,
                    key: "FINISHED",
                },
                {
                    label: <span onClick={() => showModal("DELETED")}>Delete Real Estate{selectedRowKeys.length > 1 && "s"}</span>,
                    key: "DELETED",
                },
            ]}
        />
    );

    return (
        <>
            <Modal
                visible={actionVisible}
                title="Censorship Real Estate Status"
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <div key={1} className="d-flex justify-content-center">
                        <Button key="submit" type="primary" onClick={handleOk} loading={loading}>
                            Save Change
                        </Button>
                        <Button key="back" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>,
                ]}
            >
                <Row>
                    <Col span={24}>
                        <p style={{ fontSize: 14 }}>
                            {/* <h6>ID Real estate: {selectedRowKeys}</h6> */}
                            Confirm status change to:&emsp;
                            {actionType === "APPROVED" ? (
                                <Tag color="#5BD8A6" style={{ width: "60% !important" }}>
                                    <span className="text-uppercase d-flex justify-content-center">{actionType}</span>
                                </Tag>
                            ) : actionType === "PENDING" ? (
                                <Tag color="#FF9900" style={{ width: "50%" }} className="text-center">
                                    <span className="text-uppercase">{actionType}</span>
                                </Tag>
                            ) : actionType === "FINISHED" ? (
                                <Tag color="#868e96" style={{ width: "50%" }} className="text-center">
                                    <span className="text-uppercase">{actionType}</span>
                                </Tag>
                            ) : actionType === "REJECTED" ? (
                                <Tag color="#FF0000" style={{ width: "50%" }} className="text-center">
                                    <span className="text-uppercase">{actionType}</span>
                                </Tag>
                            ) : actionType === "OPENING" ? (
                                <Tag color="#15aabf" style={{ width: "50%" }} className="text-center">
                                    <span className="text-uppercase">{actionType}</span>
                                </Tag>
                            ) : actionType === "DELETED" ? (
                                <Tag color="#FF0000" style={{ width: "50%" }} className="text-center">
                                    <span className="text-uppercase">{actionType}</span>
                                </Tag>
                            ) : (
                                ""
                            )}
                        </p>
                    </Col>
                    <Col span={24}>
                        <Form form={actionForm}>
                            <Form.Item name="actionMessage" label="Message" rules={[{ required: true, message: "Please input message!" }]}>
                                <Input.TextArea
                                    onChange={(e: any) => setActionMessage(e.target.value)}
                                    rows={4}
                                    placeholder="Enter message"
                                    maxLength={100}
                                    showCount
                                />
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Modal>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
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
                            {" "}
                            {hasSelected ? `Selected ${selectedRowKeys.length > 1 ? `${selectedRowKeys.length} items` : `${selectedRowKeys.length} item`}` : ""}
                        </span>
                    </span>
                    <span>
                        <Button href="/real-estate/create">
                            <div className="d-flex align-items-center justify-content-between">
                                <PlusCircleOutlined className="me-2" />
                                {t("real-estate-create-new")}
                            </div>
                        </Button>
                    </span>
                </div>
                <ProTable<any>
                    scroll={{
                        x: "fit-content",
                    }}
                    rowSelection={rowSelection}
                    loading={loading}
                    columns={columns}
                    dataSource={tableData === [] ? [] : tableData.map((item: any) => ({ ...item, key: item.id }))}
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
export default RejectedList;
