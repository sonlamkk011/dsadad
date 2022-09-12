import React from "react";
import { AutoComplete, Card, Col, Input, Row, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

function SearchBar() {
    const [loading, setLoading] = React.useState(false);

    const handleSearch = (element: any) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };
    return (
        <>
            <Card>
                <Row>
                    <Col span={8}>
                        {/* <Search
                            placeholder="Search..."
                            enterButton="Search"
                            size="large"
                            loading={loading}
                            style={{ width: "70%" }}
                            prefix={<i className="fas fa-search me-2"></i>}
                            onSearch={(value) => handleSearch(value)}
                        /> */}
                        <form className="form-inline my-2 my-lg-0 d-flex">
                            <Input size="large" placeholder="Search..." prefix={<SearchOutlined />} style={{ borderRadius: 5 }} />
                            {/* <input className="form-control mr-sm-2" type="search" placeholder="Search..." aria-label="Search" /> */}
                            <button className="btn btn-outline-primary mx-2 my-2 my-sm-0" style={{ borderRadius: 5 }} type="submit">
                                Search
                            </button>
                        </form>
                    </Col>
                    <Col span={24}></Col>
                </Row>
            </Card>
        </>
    );
}

export default SearchBar;
