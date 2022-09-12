import { executeJsonFetch, executeTextFetch } from "../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "./config";

const path = '/api/v2/admin/real-estate'

const fetchCreateNewRealEstate = async (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values)
    }
    return executeJsonFetch(`${pindiasDomain}${path}`, options, setLoading, 'fetchCreateNewRealEstate')
}

const fetchEditNewRealEstate = async (values: any, setLoading: any) => {
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values)
    }
    return executeTextFetch(`${pindiasDomain}${path}`, options, setLoading, 'fetchEditNewRealEstate')
}

export { fetchCreateNewRealEstate, fetchEditNewRealEstate }