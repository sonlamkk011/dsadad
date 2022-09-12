import { accessToken, pindiasDomain, allInvestorApi } from "./config";

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
        // console.log(error, `catch ${functionName} error`);
        console.log(error);
    } finally {
        if (setLoading) setLoading(false);
    }
};

const fetchAllInvestor = async () => {
    const options: any = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `${accessToken}`,
        },
    };
    return fetchFunction(`${pindiasDomain}${allInvestorApi}?page=0&row=1000`, options, null, "fetchAllInvestor");
};

export { fetchAllInvestor };
