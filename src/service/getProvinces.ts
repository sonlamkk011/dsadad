import { executeJsonFetch } from "../Hooks/fetchHandler";

const provinceDomain = "https://provinces.open-api.vn/api/";

const fetchCities = async () => {
    return executeJsonFetch(provinceDomain, {}, false, 'fetchCities');
}

const fetchDistricts = async (cityCode: any) => {
    return executeJsonFetch(`${provinceDomain}p/${cityCode}?depth=2`, {}, false, 'fetchDistricts');
}

const fetchWards = async (districtCode: any) => {
    return executeJsonFetch(`${provinceDomain}d/${districtCode}?depth=2`, {}, false, 'fetchWards');
}

export { fetchCities, fetchDistricts, fetchWards }; 