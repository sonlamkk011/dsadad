import { executeJsonFetch, executeTextFetch } from "../../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "../config";

const path = "/api/v2/admin/real-estate";

const fetchGetRealEstatesByStatus = (filters: any, status: string, setLoading: any) => {
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
    return executeJsonFetch(`${pindiasDomain}${path}/list-by-status/${status}?${params}`, options, setLoading, "fetchGetRealEstatesByStatus");
};

const fetchGetRealEstateDetails = (realEstateId: any, setformLoading: any = false) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/${realEstateId}`, options, setformLoading, "fetchGetRealEstateDetails");
};

export { fetchGetRealEstatesByStatus, fetchGetRealEstateDetails };
