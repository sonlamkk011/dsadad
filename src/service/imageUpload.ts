import { pindiasDomain, uploadImage, accessToken } from "./config";

export async function onUploadImage(filterRaw: any) {
    const formData = new FormData();
    formData.append("file", filterRaw);

    const options: any = {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data", Authorization: accessToken },
        body: formData,
    };
    try {
        const result = await fetch(`${pindiasDomain}${uploadImage}`, options);
        const data = await result.json();
        return data;
    } catch (error) {
        console.log(error, "Upload error");
    }
}
