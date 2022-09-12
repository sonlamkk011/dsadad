import React, { Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Cookies from "universal-cookie";
import { useTranslation, Trans } from "react-i18next";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ProLayout, ProSettings } from "@ant-design/pro-components";
import { Avatar, Layout, message, Space, Spin } from "antd";
import { UserOutlined } from '@ant-design/icons'

import "braft-editor/dist/index.css";
import "antd/dist/antd.css";
import "./App.css";

import defaultProps from './Components/Layout/_defaultProps'
import SideBarComponent from "./Components/Layout/SideBar/SideBarComponent";
import HeaderComponent from "./Components/Layout/Header/HeaderComponent";
import FooterComponent from "./Components/Layout/Footer/FooterComponent";
import Dashboard from "./Components/Dashboard/Dashboard";
import AllRealEstates from "./Components/RealEstatePage/AllRealEstates/AllRealEstates";
import CreateNew from "./Components/RealEstatePage/CreateNew/CreateNew";
import Test from "./Components/RealEstatePage/AllRealEstates/Test";
import RealEstateDetails from "./Components/RealEstatePage/RealEstateDetails/RealEstateDetails";
import AllProject from "./Components/ProjectManagementPage/AllRealEstateProject/AllProject";
import CreateNewProject from "./Components/ProjectManagementPage/CreateNewProject/CreateNewProject";
import SEOAllData from "./Components/SEO/SEOData/SEOAllData";
import JSONAll from "./Components/SEO/SEOJSON/JSONAll";
import AllSources from "./Components/Sources/AllSources/AllSources";
import CreateNewSource from "./Components/Sources/CreateNew/CreateNewSource";
import ProjectDetails from "./Components/ProjectManagementPage/ProjectDetails/ProjectDetails";
import SourceDetails from "./Components/Sources/SourceDetails/SourceDetails";
import AllNews from "./Components/News/AllNews/AllNews";
import AllSocialPosts from "./Components/SocialPosts/AllSocialPosts/AllSocialPosts";
import NewsDetails from "./Components/News/NewsDetails/NewsDetails";
import RealEstateOfProject from "./Components/ProjectManagementPage/AllRealEstateProject/RealEstateOfProject";

import EditRealEstateInfo from "./Components/RealEstatePage/EditRealEstateInfo/EditRealEstateInfo";
import ProjectOverview from "./Components/ProjectManagementPage/ProjectDetails/ProjectOverview";

import EditProject from "./Components/ProjectManagementPage/EditProject/EditProject";

import RealEstateDrafts from "./Components/RealEstatePage/RealEstateDrafts/RealEstateDrafts";
import ProjectDrafts from "./Components/ProjectManagementPage/ProjectDrafts/ProjectDrafts";
import SourceDrafts from "./Components/Sources/SourceDrafts/SourceDrafts";
import { local } from "./service/config";
import ErrorPage from "./Components/ErrorPage/NotFound";
import ListAllRealEstate from "./Components/RealEstatePage/AllRealEstates/ListAllRealEstate";
import GetUserInfo from "./Components/GetUserInfo/GetUserInfo";
import NewsList from "./pages/News/NewsList/NewsList";
import Home from "./pages/Home";
import About from "./pages/About";
import NewsDrafts from "./pages/News/NewsDrafts/NewsDrafts";
import CategoriesList from "./pages/Categories/CategoriesList";
import EditNews from "./pages/News/EditNews/EditNews";
import SocialPostList from "./pages/SocialPosts/AllSocialPosts/SocialPostList";
import CreateNewPost from "./pages/SocialPosts/CreateNewPost/CreateNewPost";
import PostDrafts from "./pages/SocialPosts/PostDrafts/PostDrafts";
import NotFound from "./pages/NotFound";
import PreviewPost from "./pages/SocialPosts/PreviewPost/PreviewPost";
import EditPost from "./pages/SocialPosts/EditPost/EditPost";
import CreateNewNews from "./pages/News/CreateNewNews/CreateNewNews";
import InvestorsList from "./pages/Investors/InvestorsList/InvestorsList";
import InvestorDetails from "./pages/Investors/InvestorDetails/InvestorDetails";
import CreateNewInvestor from "./pages/Investors/CreateNewInvestor/CreateNewInvestor";
import AvatarComponent from "./Components/Layout/Header/AvatarComponent";

// Hooks
import { tokenExpiredHandler } from "./Hooks/fetchHandler";
import { isAdminSelector } from "./Features/selectors";
import { usePageVisibility } from "./Hooks/TabChangeHelper";

// Images
import pindiasLogo from './public/img/Pindias-square-logo.png';

function App() {
    const [settings, setSetting] = useState<Partial<ProSettings> | undefined>({ fixSiderbar: true })
    const [pathname, setPathname] = useState('/welcome')
    const cookies = new Cookies();
    const [isLogin, setIsLogin] = useState(false);
    const isAdmin = useSelector(isAdminSelector);
    const isBrowserTabChanged = usePageVisibility();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token: any = params.get("token");
        const continueUrl: any = params.get("continue");
        if (token) {
            const currentTime = new Date().getTime();
            // get 7 days later
            const sevenDaysLater = new Date(currentTime + 7 * 24 * 60 * 60 * 1000);
            if (local) {
                cookies.set("accessToken", token, { path: "/", expires: sevenDaysLater });
            } else {
                cookies.set("accessToken", token, { path: "/", domain: ".pindias.com", expires: sevenDaysLater });
            }
            cookies.set("showLoggedInMessage", "1stTrue", { path: "/" });
            if (continueUrl) {
                window.location.href = continueUrl;
            } else {
                // move to home page
                window.location.href = "/";
            }
        }
    }, []);

    useEffect(() => {
        const accessToken = cookies.get("accessToken");
        if (accessToken && accessToken != "undefined") {
            // Logged in
            setIsLogin(true);
        } else {
            // if not logged in, redirect to login url
            tokenExpiredHandler();
        }
    }, [isBrowserTabChanged]);

    useEffect(() => {
        const showLoggedInMessage = cookies.get("showLoggedInMessage");
        if (showLoggedInMessage === "1stTrue") {
            cookies.set("showLoggedInMessage", "2ndTrue", { path: "/" });
        } else if (showLoggedInMessage === "2ndTrue") {
            message.success("You are logged in!");
            cookies.set("showLoggedInMessage", "false", { path: "/" });
        }
    }, []);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {
                isLogin &&
                <>
                    <GetUserInfo />
                    <BrowserRouter>
                        <div
                            id="test-pro-layout"
                            style={{
                                height: '100vh',
                            }}
                        >
                            <ProLayout
                                {...defaultProps}
                                navTheme="light"
                                location={{
                                    pathname,
                                }}
                                logo={pindiasLogo}
                                title="Pindias"
                                menuHeaderRender={(logo, title) => (
                                    <div
                                        id="customize_menu_header"
                                        onClick={() => {
                                            window.location.href = "/";
                                            // window.open('https://pindias.com/');
                                        }}
                                    >
                                        <span>
                                            {logo}
                                        </span>
                                        <span>
                                            {title}
                                        </span>
                                    </div>
                                )}
                                onMenuHeaderClick={() => { }}
                                menuItemRender={(item, dom) => (
                                    <span
                                        onClick={() => {
                                            setPathname(item.path ? item.path : '/welcome')
                                        }}

                                    >
                                        {
                                            item.path?.includes('https') ? (
                                                <a href={item.path} target={'_blank'}>{dom}</a>
                                            ) : (
                                                <Link to={`${item.path}`} >{dom}</Link>
                                            )
                                        }
                                    </span>
                                )}
                                rightContentRender={() => (
                                    <div>
                                        <AvatarComponent />
                                    </div>
                                )}
                                {...settings}
                            >
                                <Routes>
                                    <Route path='/' element={<Home />} />
                                    <Route path='/welcome' element={<Home />} />
                                    <Route path='/about' element={<About />} />
                                    {/* ============= projects ============= */}
                                    <Route path="/project/all" element={<AllProject />} />
                                    <Route path="/project/create" element={<CreateNewProject />} />
                                    <Route path="/project/detail/:params" element={<ProjectDetails />} />
                                    <Route path="/project/edit/:params" element={<EditProject />} />
                                    <Route path="/project/categories" element={<CategoriesList categoryType={"PROJECT"} />} />
                                    <Route path="/project/drafts" element={<ProjectDrafts />} />

                                    {/* ============= sources ============= */}
                                    <Route path="/sources" element={<AllSources />} />
                                    <Route path="/sources/create" element={<CreateNewSource />} />
                                    <Route path="/sources/details/:id" element={<SourceDetails />} />
                                    {/* <Route path="/sources/categories" element={<CategoriesList categoryType={"SOURCE_CRAWL"} />} /> */}
                                    <Route path="/sources/drafts" element={<SourceDrafts />} />

                                    {/* ============= real estate ============= */}
                                    <Route path="/real-estate/all" element={<ListAllRealEstate />} />
                                    <Route path="/real-estate/all/:params" element={<AllRealEstates />} />
                                    <Route path="/real-estate/create" element={<CreateNew />} />
                                    <Route path="/real-estate/demo-view/:id" element={<RealEstateDetails />} />
                                    <Route path="/real-estate/edit/:id" element={<EditRealEstateInfo />} />
                                    <Route path="/real-estate/categories" element={<CategoriesList categoryType={"REAL_ESTATE"} />} />
                                    <Route path="/real-estate/drafts" element={<RealEstateDrafts />} />

                                    {/* ============= SEO ============= */}
                                    <Route path="/SEO/data/all" element={<SEOAllData />} />
                                    <Route path="/SEO/json-ld/all" element={<JSONAll />} />
                                    <Route path="*" element={<ErrorPage />} />

                                    {/* ========================== PRO ========================== */}
                                    {/* ============= investors ============= */}
                                    <Route path="/investor/list" element={<InvestorsList />} />
                                    <Route path="/investor/create" element={<CreateNewInvestor />} />
                                    <Route path="/investor/details/:id" element={<InvestorDetails />} />

                                    {/* ============= news ============= */}
                                    <Route path='/news/list' element={<NewsList />} />
                                    <Route path="/news/create" element={<CreateNewNews />} />
                                    <Route path="/news/drafts" element={<NewsDrafts />} />
                                    <Route path="/news/categories" element={<CategoriesList categoryType={"NEWS"} />} />
                                    <Route path="/news/edit/:id" element={<EditNews />} />

                                    {/* ============= social posts ============= */}
                                    <Route path="/posts/list" element={<SocialPostList />} />
                                    <Route path="/posts/categories" element={<CategoriesList categoryType={"COMMUNITY"} />} />
                                    <Route path="/posts/create" element={<CreateNewPost />} />
                                    <Route path="/posts/edit/:id" element={<EditPost />} />
                                    <Route path="/posts/drafts" element={<PostDrafts />} />
                                    {/* not done yet */}
                                    <Route path="/posts/preview/:id" element={<PreviewPost />} />

                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </ProLayout>
                        </div>
                    </BrowserRouter>
                </>
            }
        </Suspense>
    );
}

export default App;