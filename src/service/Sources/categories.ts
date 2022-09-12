import { executeJsonFetch } from "../../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "../config";

const path = "/api/v2/admin";

const fetchGetCategories = () => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/category?page=0&size=100&status=ACTIVE&type=REAL_ESTATE`, options, false, "fetchGetCategories");
};

export { fetchGetCategories };
