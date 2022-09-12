import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";
import i18next, { t } from "i18next";
import { Avatar, Button, Col, Divider, Dropdown, Menu, message, Row, Image } from "antd";
import { UserOutlined, LogoutOutlined, GlobalOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

import { accountInfoSelector } from "../../../Features/selectors";
import { local } from "../../../service/config";

import avatar from "../../../public/img/purple-user-avatar.png";
import vietnamFlag from "../../../public/img/vietnam-flag.png";
import englishFlag from "../../../public/img/united-kingdom-flag.png";

function AvatarComponent() {
    const cookies = new Cookies();
    const [userName, setuserName] = useState("Name not updated");
    const [userEmail, setuserEmail] = useState("");
    const userInfo: any = useSelector(accountInfoSelector)

    const lngs: any = {
        vi: { nativeName: t("vietnamese"), flag: vietnamFlag },
        en: { nativeName: t("english"), flag: englishFlag },
    };

    useEffect(() => {
        console.log('user info', userInfo);
        
        if (userInfo) {
            const nameArray = [];
            if (userInfo.firstName) nameArray.push(userInfo.firstName);
            if (userInfo.lastName) nameArray.push(userInfo.lastName);
            setuserName(nameArray.join(" "));
            if (userInfo.email) setuserEmail(userInfo.email);
        }
    }, [userInfo]);

    const handleLogout = () => {
        if (local) {
            cookies.remove("accessToken", { path: "/" });
        } else {
            cookies.remove("accessToken", { path: "/", domain: ".pindias.com" });
        }
        message
            .loading(t("Logging out..."), 1)
            .then(() => {
                message.success(t("You are logged out"), 1)
                window.location.href = "/"
            })
            // .then(() => (window.location.href = "/"));
    };

    const menu = (
        <Menu id="header-menu-dropdown">
            <Menu.Item key={1}>
                <div>
                    <Row justify="center">
                        <Col>
                            <div className="my-3">
                                <Button style={{ border: "none" }} className="avatarBtn">
                                    <Avatar size={80} src={userInfo.imageUrl ? userInfo.imageUrl : avatar} icon={<UserOutlined />} className="avatarIcon" />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
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
                                <Button href="https://myaccount.metawayholdings.vn/" className="fw-bold account-manager">
                                    {t("Manage your Metaworld account")}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Divider className="my-4" />
                </div>
            </Menu.Item>

            <Menu.Item key={4}>
                <div className="d-flex justify-content-center">
                    <Button className="fw-bold btn-logout" onClick={handleLogout}>
                        <LogoutOutlined />
                        <span>Đăng Xuất</span>
                    </Button>
                </div>
            </Menu.Item>
            <Menu.Item key={5}>
                <div>
                    <Row>
                        <Divider className="my-4" />
                        <Col span={24}>
                            <div className="d-flex justify-content-between mx-2 my-3">
                                <Link className="fw-normal" to={"/"}>
                                    Chính sách quyền riêng tư
                                </Link>
                                <Link className="fw-normal" to={"/"}>
                                    Điều khoản dịch vụ
                                </Link>
                            </div>
                        </Col>
                    </Row>
                </div>
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
        <>
            <Dropdown className="mx-3" overlay={locale} trigger={["click"]} autoFocus={lngs.vn} placement="bottom" arrow>
                <Link to="/">
                    <GlobalOutlined style={{ fontSize: "25px" }} className="global-translate-icon" />
                </Link>
            </Dropdown>
            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                <Button style={{ border: "none" }} className="avatarBtn">
                    <Avatar size="large" src={userInfo.imageUrl ? userInfo.imageUrl : avatar} icon={<UserOutlined />} className="avatarIcon" />
                </Button>
            </Dropdown>
        </>
    );
}

export default AvatarComponent;
