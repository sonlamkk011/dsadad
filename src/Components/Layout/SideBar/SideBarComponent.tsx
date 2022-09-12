import React, { useEffect, useState } from "react";
import {
    UnorderedListOutlined,
    FundProjectionScreenOutlined,
    ProjectOutlined,
    HighlightOutlined,
    CloudOutlined,
    DatabaseOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    GlobalOutlined,
    PlusSquareOutlined,
    UserSwitchOutlined,
    HomeOutlined,
    DeploymentUnitOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu } from "antd";
import { Link, NavLink, useLocation } from "react-router-dom";
import pindiasSquareLogo from "../../../public/img/Pindias-square-logo.png";
import pindiasFullLogo from "../../../public/img/Pindias-full-logo.png";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { isAdminSelector } from "../../../Features/selectors";

const { Sider } = Layout;

function SideBarComponent({ collapsed, setCollapsed }: any) {
    let location = useLocation();
    const isAdmin = useSelector(isAdminSelector);
    const { t } = useTranslation();
    const [selectedKey, setselectedKey] = useState("");
    const [openKey, setopenedKey] = useState<any>([]);

    useEffect(() => {
        if (isAdmin) setCollapsed(false)
    }, [isAdmin]);

    const items = [
        // {
        //     key: "dashboard",
        //     icon: <ControlOutlined />,
        //     title: "Dashboard",
        //     link: "/",
        // },
        {
            key: "projectManagement",
            title: t("project-manager"),
            icon: <FundProjectionScreenOutlined />,
            children: [
                {
                    key: "allProject",
                    icon: <ProjectOutlined />,
                    title: t("project-all"),
                    link: "/project/all",
                },
                {
                    key: "projectCategories",
                    icon: <UnorderedListOutlined />,
                    title: t("project-category"),
                    link: "/project/categories",
                },
                {
                    key: "createNewProject",
                    icon: <PlusSquareOutlined />,
                    title: t("project-create-new"),
                    link: "/project/create",
                },
                {
                    key: "projectDrafts",
                    icon: <HighlightOutlined />,
                    title: "Drafts",
                    link: "/project/drafts",
                },
            ],
        },
        {
            key: "investorManagement",
            title: t("investor-manager"),
            icon: <UserSwitchOutlined />,
            children: [
                {
                    key: "allInvestor",
                    icon: <UnorderedListOutlined />,
                    title: t("investor-list"),
                    link: "/investor",
                },
                // {
                //     key: "investorCategories",
                //     icon: <UnorderedListOutlined />,
                //     title: t("investor-category"),
                //     link: "/investor/categories",
                // },
                {
                    key: "createNewInvestor",
                    icon: <PlusSquareOutlined />,
                    title: t("investor-create-new"),
                    link: "/investor/create",
                },
            ],
        },
        {
            key: "realEstateManagement",
            title: t("real-estate-manager"),
            icon: <HomeOutlined />,
            children: [
                {
                    key: "allRealEstate",
                    icon: <UnorderedListOutlined />,
                    title: t("real-estate-all"),
                    link: "/real-estate/all",
                },
                {
                    key: "realEstateCategories",
                    icon: <UnorderedListOutlined />,
                    title: t("real-estate-category"),
                    link: "/real-estate/categories",
                },
                {
                    key: "createNewRealEstate",
                    icon: <PlusSquareOutlined />,
                    title: t("real-estate-create-new"),
                    link: "/real-estate/create",
                },
                {
                    key: "realEstateDrafts",
                    icon: <HighlightOutlined />,
                    title: "Drafts",
                    link: "/real-estate/drafts",
                },
            ],
        },
        {
            key: "news",
            icon: <GlobalOutlined />,
            title: t("news"),
            children: [
                {
                    key: "allNews",
                    icon: <UnorderedListOutlined />,
                    title: t("news-all"),
                    link: "/news",
                },
                {
                    key: "newsCategories",
                    icon: <UnorderedListOutlined />,
                    title: t("news-category"),
                    link: "/news/categories",
                },
                {
                    key: "createNewNews",
                    icon: <PlusSquareOutlined />,
                    title: t("news-create-new"),
                    link: "/news/create",
                },
                {
                    key: "newsDrafts",
                    icon: <HighlightOutlined />,
                    title: "Drafts",
                    link: "/news/drafts",
                },
            ],
        },
        {
            key: "social",
            icon: <DeploymentUnitOutlined />,
            title: t("social-post"),
            children: [
                {
                    key: "allSocial",
                    icon: <UnorderedListOutlined />,
                    title: t("social-post-all"),
                    link: "/posts",
                },
                {
                    key: "postCategories",
                    icon: <UnorderedListOutlined />,
                    title: t("social-post-category"),
                    link: "/posts/categories",
                },
                {
                    key: "createNewPost",
                    icon: <PlusSquareOutlined />,
                    title: "Create New Post",
                    link: "/posts/create",
                },
                {
                    key: "postDrafts",
                    icon: <HighlightOutlined />,
                    title: "Drafts",
                    link: "/posts/drafts",
                },
            ],
        },
        {
            key: "sources",
            icon: <CloudOutlined />,
            title: t("sources"),
            children: [
                {
                    key: "allSources",
                    icon: <UnorderedListOutlined />,
                    title: t("sources-all"),
                    link: "/sources",
                },
                // {
                //     key: "sourcesCategories",
                //     icon: <UnorderedListOutlined />,
                //     title: t("sources-category"),
                //     link: "/sources/categories",
                // },
                {
                    key: "createNewSource",
                    icon: <PlusSquareOutlined />,
                    title: t("sources-create-new"),
                    link: "/sources/create",
                },
                {
                    key: "sourceDrafts",
                    icon: <HighlightOutlined />,
                    title: "Drafts",
                    link: "/sources/drafts",
                },
            ],
        },
        {
            key: "SEO",
            title: t("seo-manager"),
            icon: <DatabaseOutlined />,
            children: [
                {
                    key: "seoData",
                    icon: <UnorderedListOutlined />,
                    title: t("seo-data"),
                    children: [
                        {
                            key: "allDataSEO",
                            icon: <UnorderedListOutlined />,
                            title: t("seo-data-list"),
                            link: "/SEO/data/all",
                        },
                        // {
                        //     key: "createNewDataSEO",
                        //     icon: <UnorderedListOutlined />,
                        //     title: "Create New Data SEO",
                        //     link: "/SEO/data/create",
                        // },
                    ],
                },
                {
                    key: "jsonLdSeo",
                    icon: <UnorderedListOutlined />,
                    title: t("seo-json-data"),
                    children: [
                        {
                            key: "jsonLdSeoDataAll",
                            icon: <UnorderedListOutlined />,
                            title: t("seo-json-data-list"),
                            link: "/SEO/json-ld/all",
                        },
                        // {
                        //     key: "jsonLdSeoDataCreate",
                        //     icon: <FolderAddOutlined />,
                        //     title: "Create New JSON LD",
                        //     link: "/SEO/json-ld/create",
                        // }
                    ],
                },
            ],
        },
    ];

    useEffect(() => {
        const matchKey: any = items.find((item: any) => {
            if (!item.children) {
                return item.link === window.location.pathname;
            } else {
                return item.children.find((child: any) => {
                    if (!child.children) {
                        return child.link === window.location.pathname;
                    } else {
                        return child.children.find((grandChild: any) => {
                            return grandChild.link === window.location.pathname;
                        });
                    }
                });
            }
        });
        if (matchKey) {
            if (matchKey.children) {
                const selectedChild = matchKey.children.find((child: any) => {
                    if (!child.children) {
                        return child.link === window.location.pathname;
                    } else {
                        return child.children.find((grandChild: any) => {
                            return grandChild.link === window.location.pathname;
                        });
                    }
                });
                if (selectedChild) {
                    if (!selectedChild.children) {
                        setselectedKey(selectedChild ? selectedChild.key : "");
                        setopenedKey([matchKey.key]);
                    } else {
                        const selectedGrandChild = selectedChild.children.find((grandChild: any) => {
                            return grandChild.link === window.location.pathname;
                        });
                        setselectedKey(selectedGrandChild ? selectedGrandChild.key : "");
                        setopenedKey([matchKey.key, selectedChild.key]);
                    }
                }
            } else {
                setselectedKey(matchKey.key);
            }
        }
    }, [location.pathname]);

    const handleMenuSelect = (e: any) => {
        setselectedKey(e.key);
    };

    const handleMenuOpenChange = (e: any) => {
        setopenedKey(e);
    };

    return (
        <Sider
            id="side-bar"
            className={!collapsed ? `d-block` : "d-none"}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
        >
            <div className={`logo ${collapsed && "h-50"} d-flex justify-content-center align-items-center`}>
                <a href="/">
                    {collapsed ? <img src={pindiasSquareLogo} alt="" width={30} /> : <img src={pindiasFullLogo} alt="pindiasLogo" width={170} />}
                </a>
            </div>
            {
                isAdmin &&
                <Menu
                    theme="light"
                    mode="inline"
                    openKeys={[...openKey]}
                    selectedKeys={[selectedKey]}
                    onSelect={handleMenuSelect}
                    onOpenChange={handleMenuOpenChange}
                >
                    <Menu.Item key="home">
                        <a href="https://v2.pindias.com/" target={"_blank"} className="d-flex align-items-center">
                            <HomeOutlined />
                            <span>{t("home-page")}</span>
                        </a>
                    </Menu.Item>
                    {
                        items.map((item: any) =>
                            // if item doesn't have submenu
                            !item.children ? (
                                <Menu.Item key={item.key}>
                                    <NavLink className="d-flex align-items-center" to={item.link}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </NavLink>
                                </Menu.Item>
                            ) : (
                                // if item has submenu
                                <Menu.SubMenu title={item.title} key={item.key} icon={item.icon}>
                                    {item.children.map((child: any) =>
                                        // if item's submenu doesn't have submenu
                                        !child.children ? (
                                            <Menu.Item key={child.key}>
                                                <NavLink className="d-flex align-items-center" to={child.link}>
                                                    {child.icon}
                                                    <span>{child.title}</span>
                                                </NavLink>
                                            </Menu.Item>
                                        ) : (
                                            // if item's submenu has submenu
                                            <Menu.SubMenu title={child.title} key={child.key} icon={item.icon}>
                                                {child.children.map((child: any) => (
                                                    <Menu.Item key={child.key}>
                                                        <NavLink className="d-flex align-items-center" to={child.link}>
                                                            {child.icon}
                                                            <span>{child.title}</span>
                                                        </NavLink>
                                                    </Menu.Item>
                                                ))}
                                            </Menu.SubMenu>
                                        )
                                    )}
                                </Menu.SubMenu>
                            ))
                    }
                </Menu>
            }
        </Sider>
    );
}

export default SideBarComponent;
