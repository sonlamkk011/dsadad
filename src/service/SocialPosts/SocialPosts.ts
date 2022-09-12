import { executeJsonFetch, executeTextFetch } from "../../Hooks/fetchHandler";
import { accessToken, pindiasDomain } from "../config";

const path = "/api/v2/admin/social-posts";

const fetchGetAllPosts = (filters: any, setLoading: any) => {
    let params = ''
    for (const key in filters) {
        if (filters[key] || filters[key] === 0 || filters[key] === false) {
            if (key === "status") {
                filters[key].forEach((status: any) => {
                    params += `${key}=${status}&`
                })
            } else {
                params += `${key}=${filters[key]}&`
            }
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
    return executeJsonFetch(`${pindiasDomain}${path}?${params}`, options, setLoading, "fetchGetAllPosts");
};

const fetchChangePostsStatus = async (postIdArray: any, status: string, setLoading: any) => {
    const body = JSON.stringify({
        "ids": postIdArray,
        "status": status
    })
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body
    }
    return executeTextFetch(`${pindiasDomain}${path}/change-status`, options, setLoading, 'fetchChangePostsStatus')
}

const fetchEditPost = async (postId: any, values: string, setLoading: any) => {
    const body = JSON.stringify(values)
    const options: any = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body
    }
    return executeTextFetch(`${pindiasDomain}${path}/${postId}`, options, setLoading, 'fetchEditPost')
}

const fetchDeletePost = async (postId: any, setLoading: any) => {
    const options: any = {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    }
    return executeTextFetch(`${pindiasDomain}${path}/${postId}`, options, setLoading, 'fetchDeletePost')
}

const fetchCreateNewPost = (values: any, setLoading: any) => {
    const options: any = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
        body: JSON.stringify(values),
    };
    return executeTextFetch(`${pindiasDomain}${path}`, options, setLoading, "fetchCreateNewPost");
}

const fetchGetPostById = (id: any, setLoading: any) => {
    const options: any = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: accessToken },
    };
    return executeJsonFetch(`${pindiasDomain}${path}/${id}`, options, setLoading, "fetchGetPostById");
}

const fetchGetPostsByStatus = (filters: any, status: string, setLoading: any) => {
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
    return executeJsonFetch(`${pindiasDomain}${path}/list-by-status/${status}?${params}`, options, setLoading, "fetchGetPostsByStatus");
};

export { fetchGetAllPosts, fetchCreateNewPost, fetchGetPostById, fetchGetPostsByStatus, fetchChangePostsStatus, fetchDeletePost, fetchEditPost };
