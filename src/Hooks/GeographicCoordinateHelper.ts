import { message } from "antd";
const googleMapApiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY as string;

export const getLatitudeLongitude = async (address: string) => {
    // example address: 'trang tien plaza';
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googleMapApiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.error_message) return message.error(data.error_message);
    if (data.results.length > 0) {
        return {
            latitude: data.results[0].geometry.location.lat,
            longitude: data.results[0].geometry.location.lng,
        };
    } else {
        return message.error("Can not find location");
    }
};
