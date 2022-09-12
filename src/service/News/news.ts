import { executeJsonFetch, executeTextFetch } from "../../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "../config";

const path = "/api/admin/news";

const fetchGetAllNews = (filters: any, setLoading: any) => {
    let params = ''
    for (const key in filters) {
        if (filters[key] || filters[key] === 0 || filters[key] === false) {
            if (key === "status") {
                filters[key].forEach((status: any) => {
                    params += `${key}=${status}&`
                })
            } else {
                params += `${key}=${filters[key]}&`
            }
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
    return executeJsonFetch(`${pindiasDomain}${path}/all?${params}`, options, setLoading, "fetchGetAllNews");
};

const fetchSearchNews = (filters: any, setLoading: any) => {
    let params = ''
    for (const key in filters) {
        if (filters[key] || filters[key] === 0 || filters[key] === false) {
            if (key === "status") {
                filters[key].forEach((status: any) => {
                    params += `${key}=${status}&`
                })
            } else {
                params += `${key}=${filters[key]}&`
            }
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
    return executeJsonFetch(`${pindiasDomain}${path}/search?${params}`, options, setLoading, "fetchSearchNews");
};

const fetchCreateNewNews = (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeJsonFetch(`${pindiasDomain}${path}/create`, options, setLoading, "fetchCreateNewNews");
}

const fetchGetNewsById = (id: any, setLoading: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/detail/${id}`, options, setLoading, "fetchGetNewsById");
}

const fetchEditNews = (values: any, setLoading: any) => {
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeTextFetch(`${pindiasDomain}${path}/edit`, options, setLoading, "fetchEditNews");
}

const fetchDeleteNewsById = (id: any, setLoading: any) => {
    const options: any = {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeTextFetch(`${pindiasDomain}${path}/delete/${id}`, options, setLoading, "fetchDeleteNewsById");
}

const fetchChangeNewsStatus = async (newsIdArray: any, status: string, setLoading: any) => {
    const body = JSON.stringify({
        ids: newsIdArray,
        status: status
    })
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body
    }
    return executeTextFetch(`${pindiasDomain}${path}/edit-entities`, options, setLoading, 'fetchChangeNewsStatus')
}

const fetchGetNewsByStatus = (filters: any, status: string, setLoading: any) => {
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
    return executeJsonFetch(`${pindiasDomain}${path}/list-by-status/${status}?${params}`, options, setLoading, "fetchGetNewsByStatus");
};

export { fetchGetAllNews, fetchSearchNews, fetchCreateNewNews, fetchGetNewsById, fetchEditNews, fetchDeleteNewsById, fetchChangeNewsStatus, fetchGetNewsByStatus };
