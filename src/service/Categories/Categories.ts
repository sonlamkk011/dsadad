import { executeJsonFetch, executeTextFetch } from "../../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "../config";

const path = "/api/v2/admin/category";

const fetchGetCategories = (filters: any, setLoading: any = false) => {
    let params = ''
    for (const key in filters) {
        if (filters[key] || filters[key] === 0 || filters[key] === false) {
            params += `${key}=${filters[key]}&`
        }
    }
    // if last character is &, remove it
    if (params.charAt(params.length - 1) === '&') {
        params = params.slice(0, params.length - 1)
    }
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}?${params}`, options, setLoading, "fetchGetCategories");
};

const fetchCreateNewCategory = (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeJsonFetch(`${pindiasDomain}${path}`, options, setLoading, "fetchCreateNewCategory");
}

const fetchDeleteCategoryById = (id: any, setLoading: any = false) => {
    const options: any = {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeTextFetch(`${pindiasDomain}${path}/${id}`, options, setLoading, "fetchDeleteCategoryById");
}

const fetchEditCategory = (values: any, setLoading: any) => {
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeTextFetch(`${pindiasDomain}${path}`, options, setLoading, "fetchEditCategory");
}

export { fetchGetCategories, fetchCreateNewCategory, fetchDeleteCategoryById, fetchEditCategory };
