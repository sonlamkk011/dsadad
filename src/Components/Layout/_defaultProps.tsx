import {
    CompassOutlined,
    DeploymentUnitOutlined,
    UserSwitchOutlined,
    FundProjectionScreenOutlined,
    GlobalOutlined,
    UnorderedListOutlined,
    HighlightOutlined,
    PlusSquareOutlined,
    HomeOutlined,
    CloudOutlined,
    DatabaseOutlined,
} from '@ant-design/icons'
import { t } from 'i18next'

export default {
    route: {
        path: '/',
        routes: [
            {
                // path: '/project',
                name: 'Project manager',
                icon: <FundProjectionScreenOutlined />,
                routes: [
                    {
                        path: "/project/all",
                        name: "All projects",
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: '/project/categories',
                        name: 'Project Categories',
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: "/project/create",
                        name: 'Create project',
                        icon: <PlusSquareOutlined />,
                    },
                    {
                        path: '/project/drafts',
                        name: 'Drafts',
                        icon: <HighlightOutlined />,
                    },
                ],
            },
            {
                // path: '/investors',
                name: 'Investor manager',
                icon: <UserSwitchOutlined />,
                routes: [
                    {
                        path: '/investor/list',
                        name: 'Investor List',
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: '/investor/create',
                        name: 'Create New Investor',
                        icon: <PlusSquareOutlined />,
                    },
                ],
            },
            {
                // path: '/real-estate',
                name: 'Real Estate manager',
                icon: <HomeOutlined />,
                routes: [
                    {
                        path: "/real-estate/all",
                        name: "All Real Estates",
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: "/real-estate/categories",
                        name: 'Real Estate Categories',
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: "/real-estate/create",
                        name: 'Create Real Estate',
                        icon: <PlusSquareOutlined />,
                    },
                    {
                        path: '/real-estate/drafts',
                        name: 'Drafts',
                        icon: <HighlightOutlined />,
                    },
                ],
            },
            {
                // path: '/news',
                name: 'News',
                icon: <GlobalOutlined />,
                routes: [
                    {
                        path: '/news/list',
                        name: 'News List',
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: '/news/categories',
                        name: 'News Categories',
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: '/news/create',
                        name: 'Create New News',
                        icon: <PlusSquareOutlined />,
                    },
                    {
                        path: '/news/drafts',
                        name: 'Drafts',
                        icon: <HighlightOutlined />,
                    },
                ],
            },
            {
                // path: "/posts",
                name: "Social Posts",
                icon: <DeploymentUnitOutlined />,
                routes: [
                    {
                        path: "/posts/list",
                        name: "Social Posts List",
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: '/posts/categories',
                        name: 'Social Posts Categories',
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: '/posts/create',
                        name: 'Create New Post',
                        icon: <PlusSquareOutlined />,
                    },
                    {
                        path: "/posts/drafts",
                        name: 'Drafts',
                        icon: <HighlightOutlined />,
                    },
                ],
            },
            {
                // path: '/sources',
                name: "Source Crawler",
                icon: <DeploymentUnitOutlined />,
                routes: [
                    {
                        path: "/sources",
                        name: "Source List",
                        icon: <UnorderedListOutlined />,
                    },
                    {
                        path: "/sources/create",
                        name: 'Create New Source Crawler',
                        icon: <PlusSquareOutlined />,
                    },
                    {
                        path: "/sources/drafts",
                        name: 'Drafts',
                        icon: <HighlightOutlined />,
                    },
                ],
            },
            {
                path: '/seo-management',
                name: "SEO",
                icon: <DatabaseOutlined />,
                routes: [
                    {
                        path: "/SEO",
                        name: "SEO Data",
                        icon: <UnorderedListOutlined />,
                        routes: [
                            {
                                path: "/SEO/data/all",
                                name: "SEO Data List",
                                icon: <UnorderedListOutlined />,
                            }
                        ]
                    },
                    {
                        path: "/JSON-LD",
                        name: "JSON LD",
                        icon: <UnorderedListOutlined />,
                        routes: [
                            {
                                path: "/SEO/json-ld/all",
                                name: "JSON LD List",
                                icon: <UnorderedListOutlined />,
                            }
                        ]
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
            {
                path: 'https://pindias.com/',
                name: 'Pindias Website',
                icon: <CompassOutlined />,
            },
        ],
    },
    location: {
        pathname: '/',
    },
}
