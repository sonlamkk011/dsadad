import { t } from "i18next";

export const convertTimestamp = (timestamp: number) => {
    const now = new Date().getTime(); // in milliseconds
    const difference = now - timestamp; // in milliseconds
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (seconds < 60) {
        return `${seconds} ${t("seconds")} ${t("ago")}`;
    } else if (minutes < 60) {
        return `${minutes} ${t("minutes")} ${t("ago")}`;
    } else if (hours < 24) {
        return `${hours} ${t("hours")} ${t("ago")}`;
    } else if (days < 7) {
        return `${days} ${t("days")} ${t("ago")}`;
    } else if (weeks < 4) {
        return `${weeks} ${t("weeks")} ${t("ago")}`;
    } else if (months < 12) {
        return `${months} ${t("months")} ${t("ago")}`;
    } else {
        return `${years} ${t("years")} ${t("ago")}`;
    }
}

export const convertDateStringToDate = (dateString: string) => {
    const timestamp = new Date(dateString).getTime()
    return convertTimestampToDateAndTime(timestamp)
}

export const convertDateStringToTimesAgo = (dateString: string) => {
    const timestamp = new Date(dateString).getTime()
    return convertTimestamp(timestamp)
}

export const convertTimestampToDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toUTCString()
}

export const convertTimestampToDateAndTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const time = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    return `${year}-${month >= 10 ? month : '0' + month}-${day < 10 ? '0' + day : day}, ${time}`
}

export const convertDateStringToYearMonthDay = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}