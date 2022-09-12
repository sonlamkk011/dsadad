import { t } from "i18next";

const ProjectStatusMenu = () => {
    const statusOptions = [
        { label: t("pending"), value: "PENDING" },
        { label: t("approved"), value: "APPROVED" },
        { label: t("finished"), value: "FINISHED" },
    ];
    return statusOptions;
};

const RealEstateStatusMenu = () => {
    const statusOptions = [
        { label: t("pending"), value: "PENDING" },
        { label: t("approved"), value: "APPROVED" },
        { label: t("opening"), value: "OPENING" },
        { label: t("finished"), value: "FINISHED" },
    ];
    return statusOptions;
};

const PurposeStatusMenu = () => {
    const purposeOptions = [
        { label: t("sell"), value: "SELL" },
        { label: t("rent"), value: "RENT" },
    ];
    return purposeOptions;
};

const userBotOptions = [
    { label: "USER", value: "false" },
    { label: "BOT", value: "true" },
];

export { userBotOptions, ProjectStatusMenu, RealEstateStatusMenu, PurposeStatusMenu };
