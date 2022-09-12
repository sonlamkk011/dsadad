import { executeJsonFetch, executeTextFetch } from "../../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "../config";

const path = "/api/v2/admin/source-crawl";

const fetchGetAllSources = (filters: any, setLoading: any) => {
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
    return executeJsonFetch(`${pindiasDomain}${path}?${params}`, options, setLoading, "fetchGetAllSources");
};

const fetchCreateNewSource = (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeJsonFetch(`${pindiasDomain}${path}`, options, setLoading, "fetchCreateNewSource");
}

const fetchGetSourcesAndPaths = () => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/get-source-and-path`, options, false, "fetchGetSourcesAndPaths");
}

const fetchEditSource = (values: any, setLoading: any) => {
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeTextFetch(`${pindiasDomain}${path}`, options, setLoading, "fetchEditSource");
}

const fetchGetSourceById = (id: any, setLoading: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/${id}`, options, setLoading, "fetchGetSourceById");
}

const fetchDeleteSourceById = (id: any, setLoading: any) => {
    const options: any = {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeTextFetch(`${pindiasDomain}${path}/${id}`, options, setLoading, "fetchDeleteSourceById");
}

const fetchRunCronJobManually = (id: any, setLoading: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeTextFetch(`${pindiasDomain}${path}/run-cron/${id}`, options, setLoading, "fetchRunCronJobManually");
}

const fetchPreviewCrawlLinks = (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeJsonFetch(`${pindiasDomain}${path}/check-crawl-links`, options, setLoading, "fetchPreviewCrawlLinks");
}

const fetchInfinitePreviewCrawlLinks = (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeJsonFetch(`${pindiasDomain}${path}/check-crawl-links-next-page`, options, setLoading, "fetchInfinitePreviewCrawlLinks");
}

const fetchPreviewCrawlDetails = (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeJsonFetch(`${pindiasDomain}${path}/check-crawl-detail`, options, setLoading, "fetchPreviewCrawlDetails");
}

const fetchChangeSourcesStatus = async (userIdArray: any, status: string, setLoading: any) => {
    const body = JSON.stringify({
        "ids": userIdArray,
        "status": status
    })
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body
    }
    return executeTextFetch(`${pindiasDomain}${path}/edit-entities`, options, setLoading, 'fetchChangeSourcesStatus')
}

const fetchGetSourcesByStatus = (filters: any, status: string, setLoading: any) => {
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
    return executeJsonFetch(`${pindiasDomain}${path}/list-by-status/${status}?${params}`, options, setLoading, "fetchGetSourcesByStatus");
};

export { fetchGetAllSources, fetchCreateNewSource, fetchGetSourcesAndPaths, fetchEditSource, fetchGetSourceById, fetchDeleteSourceById, fetchRunCronJobManually, fetchPreviewCrawlLinks, fetchInfinitePreviewCrawlLinks, fetchPreviewCrawlDetails, fetchChangeSourcesStatus, fetchGetSourcesByStatus };