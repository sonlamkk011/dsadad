import React, { useEffect, useState } from "react";
import { Avatar, Badge, Button, Card, Col, Divider, Dropdown, Layout, Menu, message, Row, Space, Image } from "antd";
import { LogoutOutlined, GlobalOutlined, MenuUnfoldOutlined, MenuFoldOutlined, } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import { fetchUserInformation } from "../../../service/userInformation";
import { useDispatch } from "react-redux";
import { setAccountInfo, setIsAdmin } from "../../../Features/connectionSlice";
import i18next, { t } from "i18next";
import vietnamFlag from "../../../public/img/vietnam-flag.png";
import englishFlag from "../../../public/img/united-kingdom-flag.png";
import { useTranslation } from "react-i18next";
import avatar from "../../../public/img/purple-user-avatar.png";
import { local } from "../../../service/config";
import pindiasSquareLogo from "../../../public/img/Pindias-square-logo.png";

const { Header } = Layout;

function HeaderComponent({ collapsed, setCollapsed }: any) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const [userName, setuserName] = useState<any>(t("Name not updated"));
    const [userEmail, setuserEmail] = useState("");
    const [userPhone, setuserPhone] = useState("");
    const [userRole, setuserRole] = useState("User");

    const lngs: any = {
        vi: { nativeName: t("vietnamese"), flag: vietnamFlag },
        en: { nativeName: t("english"), flag: englishFlag },
    };

    useEffect(() => {
        getUserInformation();
    }, []);

    const getUserInformation = async () => {
        const response = await fetchUserInformation();
        if (response) {
            if (response.status === 200) {
                dispatch(setAccountInfo(response.data));
                const name = `${response.data.firstName && response.data.firstName + " "}${response.data.lastName && response.data.lastName}`;
                if (name) setuserName(name);
                if (response.data.email) setuserEmail(response.data.email);
                if (response.data.phone) setuserPhone(response.data.phone);
                if (response.data.accountRole === "ADMIN") {
                    dispatch(setIsAdmin(true));
                    setuserRole("Admin");
                } else {
                    location.assign("https://agent.pindias.com/");
                }
            } else {
                message.error(response.data);
            }
        } else {
            message.error(t("Get user information failed"));
        }
    };

    const handleLogout = () => {
        if (local) {
            cookies.remove("accessToken", { path: "/" });
        } else {
            cookies.remove("accessToken", { path: "/", domain: ".pindias.com" });
        }
        message
            .loading(t("Logging out..."), 1)
            .then(() => message.success(t("You are logged out"), 1))
            .then(() => (window.location.href = "/"));
    };

    const menu = (
        <Menu id="header-menu-dropdown">
            <Menu.Item key={1}>
                <div>
                    <Row justify="center">
                        <Col>
                            <div className="my-3">
                                <Avatar className="avatarIcon" src={avatar} size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 80 }} />
                            </div>
                        </Col>
                    </Row>
                </div>{" "}
            </Menu.Item>
            <Menu.Item key={2}>
                <div>
                    <Row>
                        <Col span={24}>
                            <div className="d-flex justify-content-center mt-4">
                                <h5>{userName}</h5>
                            </div>
                            <div className="d-flex justify-content-center">
                                <span>{userEmail}</span>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Menu.Item>
            <Menu.Item key={3}>
                <div>
                    <Row>
                        <Col span={24}>
                            <div className="d-flex justify-content-center">
                                <Button href="https://myaccount.metawayholdings.vn/" className="fw-bold account-manager" target={"_blank"}>
                                    {t("Manage your Metaway account")}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Divider className="my-4" />
                </div>{" "}
            </Menu.Item>

            <Menu.Item key={4}>
                <div className="d-flex justify-content-center">
                    <Button className="fw-bold btn-logout" onClick={handleLogout}>
                        <LogoutOutlined />
                        <span>{t("Sign out")}</span>
                    </Button>
                </div>{" "}
            </Menu.Item>
            <Menu.Item key={5}>
                <div>
                    <Row>
                        <Divider className="my-4" />
                        <Col span={24}>
                            <div className="d-flex justify-content-between mx-2 my-3">
                                <Link className="fw-normal" to={"/"}>
                                    {t("Privacy policy")}
                                </Link>
                                <Link className="fw-normal" to={"/"}>
                                    {t("Terms of service")}
                                </Link>
                            </div>
                        </Col>
                    </Row>
                </div>{" "}
            </Menu.Item>
        </Menu>
    );

    const locale = (
        <Menu>
            {Object.keys(lngs).map((lng, index) => (
                <Menu.Item key={index} style={i18next.language === lng ? { background: "#e6f7ff" } : { background: "none" }}>
                    <Image src={lngs[lng].flag} width={19} />
                    <a
                        type="submit"
                        key={lng}
                        onClick={() => {
                            // reload page
                            window.location.reload();
                            i18next.changeLanguage(lng);
                        }}
                        className="mx-2"
                    >
                        {lngs[lng].nativeName}
                    </a>
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <Header id="header-layout">
            <Row>
                <Col span={12}>
                    {
                        // Show mini logo when sidebar is collapsed
                        collapsed &&
                        <img className="me-2" src={pindiasSquareLogo} alt="" width={30} />
                    }
                    <Button
                        onClick={() => setCollapsed((prev: boolean) => !prev)}
                        style={{ marginBottom: 16 }}
                    >
                        <span className="d-flex">
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </span>
                    </Button>
                </Col>
                <Col span={12}>
                    <Row className={collapsed ? "" : `d-none d-sm-flex`} justify="end">
                        <Space>
                            <Dropdown className="mx-3" overlay={locale} trigger={["click"]} autoFocus={lngs.vn} placement="bottom" arrow>
                                <Link to="/">
                                    <GlobalOutlined style={{ fontSize: "25px" }} className="global-translate-icon" />
                                </Link>
                            </Dropdown>
                            {/* <div className="mx-2">
                                <Badge count={2}>
                                    <BellOutlined style={{ fontSize: "20px" }} />
                                </Badge>
                            </div> */}
                            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                                <Avatar
                                    className="avatarIcon"
                                    src={avatar}
                                    size={{ xs: 30, sm: 30, md: 30, lg: 30, xl: 40, xxl: 40 }}
                                    style={{ cursor: "pointer" }}
                                />
                            </Dropdown>
                        </Space>
                    </Row>
                </Col>
            </Row>
        </Header>
    );
}

export default HeaderComponent;
