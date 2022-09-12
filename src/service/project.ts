import { executeJsonFetch, executeTextFetch } from "../Hooks/fetchHandler";
import { pindiasDomain, getProjectListApi, searchFilterProjectApi, createNewProject, accessToken, projectDetail } from "./config";

const getAllRealEstateProject = (filterRaw: any, setLoading: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${getProjectListApi}`, options, false, "getAllRealEstateProject");
};

const fetchCreateNewProject = (filterRaw: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(filterRaw),
    };
    return executeTextFetch(`${pindiasDomain}${createNewProject}`, options, false, "fetchCreateNewProject");
};

export { getAllRealEstateProject, fetchCreateNewProject };
