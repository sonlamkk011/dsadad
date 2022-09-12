import { t } from "i18next";

const handleRoleName = (role: any) => {
    switch (role) {
        case 'USER':
            return 'Người dùng';
        case 'ADMIN':
            return 'Quản trị viên';
        case 'Người dùng':
            return 'USER';
        case 'Quản trị viên':
            return 'ADMIN';
        default:
            return role;
    }
}

const handleStatusName = (status: any) => {
    switch (status) {
        case 'ACTIVE':
            return t("active");
        case 'DEACTIVE':
            return t("inactive");
        case 'LOCKED':
            return t("locked");
        case 'BANNED':
            return t("banned");
        case 'NORMAL':
            return t("normal");
        case 'DELETED':
            return t("deleted");
        case t("active"):
            return 'ACTIVE';
        case t("inactive"):
            return 'DEACTIVE';
        case t("locked"):
            return 'LOCKED';
        case t("banned"):
            return 'BANNED';
        case t("normal"):
            return 'NORMAL';
        case 0:
            return t("inactive");
        case 1:
            return t("active");
        case 2:
            return t("deleted");
        default:
            return status;
    }
}

const handlePurpose = (purpose: any) => {
    switch (purpose) {
        case "RENT":
            return t("rent");
        case "SELL":
            return t("sell");
        case t("rent"):
            return 'RENT';
        case t("sell"):
            return 'SELL';
        default:
            return purpose;
    }
}

const handleIsActive = (isActive: any) => {
    switch (isActive) {
        case true:
            return 'Đã kích hoạt';
        case false:
            return 'Chưa kích hoạt';
        case 'Đã kích hoạt':
            return true;
        case 'Chưa kích hoạt':
            return false;
        default:
            return isActive;
    }
}

const handleUtilitiesName = (utilityName: string) => {
    if (utilityName === 'childrenPlayArea') {
        return "Children's Play Area"
    } else {
        const addedSpace = utilityName.replace(/([A-Z])/g, ' $1').trim()
        const capitalizeFirstLetter = addedSpace.charAt(0).toUpperCase() + addedSpace.slice(1)
        return capitalizeFirstLetter;
    }
}

const handleSelectorPreviewData = (data: any) => {
    switch (data) {
        case "UNKNOW":
            return t("Unknown");
        case "Invalid date":
            return t("Invalid date");
        default:
            return data;
    }
}

export { handleRoleName, handleStatusName, handleIsActive, handleUtilitiesName, handlePurpose, handleSelectorPreviewData }