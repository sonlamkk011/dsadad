import { executeJsonFetch, executeTextFetch } from "../../Hooks/fetchHandler";
import { pindiasDomain } from "../config";

const path = "/api/v2/address";

const fetchGetProvinces = () => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/provinces`, options, false, "fetchGetProvinces");
}

const fetchGetDistrictsByProvinceId = (provinceId: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/province/${provinceId}/districts`, options, false, "fetchGetDistrictsByProvinceId");
}

const fetchGetWardsByDistrictId = (districtId: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/district/${districtId}/wards`, options, false, "fetchGetWardsByDistrictId");
}

export { fetchGetProvinces, fetchGetDistrictsByProvinceId, fetchGetWardsByDistrictId };
