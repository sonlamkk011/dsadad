import { pindiasDomain, categoriesApi, accessToken } from "./config";

const fetchFunction = async (link: string, options: any, setLoading: any, functionName: string) => {
    try {
        const response = await fetch(link, options);
        const data = await response.json();
        if (response.status === 200) {
            return {
                status: response.status,
                data,
            };
        } else {
            return {
                status: response.status,
                data: data.message,
            };
        }
    } catch (error) {
        console.log(error);
        
        // console.log(error, `catch ${functionName} error`);
    } finally {
        if (setLoading) setLoading(false);
    }
};

const fetchAllCategory = async () => {
    const options: any = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `${accessToken}`,
        },
    };
    return fetchFunction(`${pindiasDomain}${categoriesApi}?type=PROJECT`, options, null, "fetchAllCategory");
};

export { fetchAllCategory };
