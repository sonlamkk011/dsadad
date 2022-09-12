import { executeJsonFetch, executeTextFetch } from "../Hooks/fetchHandler";
import {
    pindiasDomain,
    accessToken,
    getProjectListApi,
    searchFilterProjectApi,
    realEstateOfProjectApi,
    projectDetail,
    updateProject,
    updateProjectStatus,
} from "./config";

const path = "/api/v2/project";

const fetchGetAllProjects = (searchItems: any, setLoading: any, firstCall: boolean) => {
    console.log("searchItems", searchItems);

    setLoading(true);
    let params = "";
    for (const key in searchItems) {
        if (searchItems[key] || searchItems[key] === 0) {
            params += `${key}=${searchItems[key]}&`;
        }
    }
    // if last character is &, remove it
    if (params.charAt(params.length - 1) === "&") {
        params = params.slice(0, params.length - 1);
    }
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    if (firstCall === true) {
        return executeJsonFetch(`${pindiasDomain}${getProjectListApi}?${params}`, options, false, "fetchGetAllProjects");
    } else {
        return executeJsonFetch(`${pindiasDomain}${searchFilterProjectApi}?${params}`, options, false, "fetchGetAllProjects");
    }
};

const fetchGetAllRealEstateOfProjects = (searchItems: any, setLoading: any) => {
    setLoading(true);
    let params = "";
    for (const key in searchItems) {
        if (searchItems[key] || searchItems[key] === 0) {
            params += `${key}=${searchItems[key]}&`;
        }
    }
    // if last character is &, remove it
    if (params.charAt(params.length - 1) === "&") {
        params = params.slice(0, params.length - 1);
    }
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${realEstateOfProjectApi}?${params}`, options, false, "fetchGetAllProjects");
};

const fetchGetProjectDetails = (projectId: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${projectDetail}/${projectId}`, options, false, "fetchGetProjectDetails");
};

const fetchUpdateProject = (projectDetail: any, projectId: any, setLoading: any) => {
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(projectDetail),
    };
    return executeTextFetch(`${pindiasDomain}/${updateProject}/${projectId}`, options, false, "fetchGetProjectDetails");
};

const fetchChangeProjectStatus = async (userIdArray: any, status: string, setLoading: any) => {
    const body = JSON.stringify({
        ids: userIdArray,
        status: status,
    });
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body,
    };
    return executeTextFetch(`${pindiasDomain}${updateProjectStatus}`, options, setLoading, "fetchChangeProjectStatus");
};

const fetchDeleteProject = (projectId: any, setLoading: any) => {
    const options: any = {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeTextFetch(`${pindiasDomain}${projectDetail}/${projectId}`, options, setLoading, "fetchDeleteProject");
};

export { fetchGetAllProjects, fetchGetProjectDetails, fetchUpdateProject, fetchChangeProjectStatus, fetchGetAllRealEstateOfProjects, fetchDeleteProject };
