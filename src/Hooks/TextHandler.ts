import { t } from "i18next";
import { useTranslation } from "react-i18next";

const handleUtilities = (key: any) => {
    switch (key) {
        case "square":
            return "Square";
        case "parkingArea":
            return "Parking Area";
        case "motorcycleParkingArea":
            return "Motorcycle Parking Area";
        case "greenCampus":
            return "Green Campus";
        case "eventArea":
            return "Event Area";
        case "park":
            return "Park";
        case "seaside":
            return "Seaside";
        case "lake":
            return "Lake";

        case "securityGuard":
            return "Security Guard";
        case "surveillanceCamera":
            return "Surveillance Camera";
        case "fireProtectionSystem":
            return "Fire Protection System";

        case "hospitalsClinics":
            return "Hospitals & Clinics";
        case "childrenPlayArea":
            return "Children's Play Area";
        case "beautySpa":
            return "Beauty Spa";
        case "bar":
            return "Bar";

        case "restaurant":
            return "Restaurant";
        case "coffeeShop":
            return "Coffee Shop";
        case "shoppingMall":
            return "Shopping Mall";
        case "supermarket":
            return "Supermarket";
        case "fourSeasonsSwimmingPool":
            return "fourSeasonsSwimmingPool";
        case "outdoorPool":
            return "outdoorPool";
        case "fitness":
            return "fitness";
    }
};

const handleUtilitiesName = (utilityName: string) => {
    const { t } = useTranslation();
    // if (utilityName === "childrenPlayArea") {
    //     const name = t("childrenPlayArea");
    //     return name;
    // } else {
    //     const tranText = t(utilityName);
    //     return tranText;
    // }
    const tranText = t(utilityName);
    return tranText;
};

const handleProjectName = (projectName: string) => {
    switch (projectName) {
        case "villa":
            return t("project-villa");
        case "luxury apartment":
            return t("project-luxury-apartment");
        case "private house":
            return t("project-private-house");
        case "shop house":
            return t("project-shop-house");
        case "office building":
            return t("project-office-building");
        case "street house":
            return t("project-street-house");
    }
};

export { handleUtilities, handleUtilitiesName, handleProjectName };
