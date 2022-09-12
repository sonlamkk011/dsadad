import Cookies from "universal-cookie";

const cookies = new Cookies();
const token = cookies.get("accessToken");
const accessToken = "Bearer " + token;

export const local = window.location.href.includes("localhost:");

// const pindiasDomain = local ? "http://localhost:8888" : "https://v2.pindias.com";
const pindiasDomain = "https://v2.pindias.com";
const authorizationDomain = "https://accounts.metawayholdings.vn";

// API Category
const categoriesApi = "/api/v2/admin/category";

// API Investor
const allInvestorApi = "/api/v2/investor/all";

// API Project
const getProjectListApi = "/api/v2/admin/project/all";
const searchFilterProjectApi = "/api/v2/admin/project/search";
const realEstateOfProjectApi = "/api/v2/admin/real-estate/search";
const projectDetail = "/api/v2/admin/project";
const createNewProject = "/api/v2/admin/project";
const updateProject = "api/v2/admin/project";
const updateProjectStatus = "/api/v2/admin/project/edit-entities"; 

// API Real Estate
const allNewsRealEstate = "/api/v2/admin/real-estate";
const updateRealEstateStatus = "/api/v2/admin/real-estate/update-status";
const searchFilterRealEstate = "/api/v2/admin/real-estate/search";
const uploadImage = "/api/v2/image/upload";

// API for user roles
const userRolesAllRealEstateApi = "/api/v2/real-estate/me";

export {
    pindiasDomain,
    accessToken,
    getProjectListApi,
    categoriesApi,
    allInvestorApi,
    searchFilterProjectApi,
    realEstateOfProjectApi,
    projectDetail,
    createNewProject,
    updateProject,
    updateProjectStatus,
    allNewsRealEstate,
    updateRealEstateStatus,
    authorizationDomain,
    uploadImage,
    searchFilterRealEstate,
    userRolesAllRealEstateApi,
};
