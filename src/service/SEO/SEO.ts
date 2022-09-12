import { executeJsonFetch } from "../../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "../config";

const path = "/api/v2/admin";

const fetchSEOGetAllData = async (setLoading: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/data-seo`, options, setLoading, "fetchSEOGetAllData");
};

const fetchEditSEOData = async (values: any, setLoading: any) => {
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeJsonFetch(`${pindiasDomain}${path}/data-seo`, options, setLoading, "fetchEditSEOData");
};

export { fetchSEOGetAllData, fetchEditSEOData };
