import { executeJsonFetch } from "../Hooks/fetchHandler";
import { accessToken, authorizationDomain } from "./config";

const fetchUserInformation = async () => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    }
    return executeJsonFetch(`${authorizationDomain}/api/account/information`, options, false, 'fetchUserInformation')
}

export { fetchUserInformation }