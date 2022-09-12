import { executeJsonFetch, executeTextFetch } from "../../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "../config";

const path = "/api/v2/admin/investor";

const fetchGetInvestors = (filters: any, setLoading: any) => {
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
    return executeJsonFetch(`${pindiasDomain}${path}/all?${params}`, options, setLoading, "fetchGetInvestors");
};

const fetchCreateNewInvestor = (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeTextFetch(`${pindiasDomain}${path}`, options, setLoading, "fetchCreateNewInvestor");
}

const fetchGetInvestorById = (id: any, setLoading: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/${id}`, options, setLoading, "fetchGetInvestorById");
}

const fetchEditInvestor = (id: any, values: any, setLoading: any) => {
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeTextFetch(`${pindiasDomain}${path}/${id}`, options, setLoading, "fetchEditInvestor");
}

const fetchDeleteInvestorById = (id: any, setLoading: any) => {
    const options: any = {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeTextFetch(`${pindiasDomain}${path}/${id}`, options, setLoading, "fetchDeleteInvestorById");
}

const fetchChangeInvestorStatus = async (investorsIdArray: any, status: string, setLoading: any) => {
    const body = JSON.stringify({
        "ids": investorsIdArray,
        "status": status
    })
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body
    }
    return executeTextFetch(`${pindiasDomain}${path}/edit-entities`, options, setLoading, 'fetchChangeInvestorStatus')
}

export { fetchGetInvestors, fetchCreateNewInvestor, fetchGetInvestorById, fetchEditInvestor, fetchDeleteInvestorById, fetchChangeInvestorStatus };
