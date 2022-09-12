export const numberFormat = (value: any) =>
    new Intl.NumberFormat("vn-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);

export function convertToInternationalCurrencySystem(labelValue: any) {
    if (labelValue < 1e3) return labelValue;
    if (labelValue >= 1e3 && labelValue < 1e6) return Number((labelValue / 1e3).toFixed(2)).toLocaleString() + "K";
    if (labelValue >= 1e6 && labelValue < 1e9) return Number((labelValue / 1e6).toFixed(2)).toLocaleString() + " Triệu";
    if (labelValue >= 1e9 && labelValue < 1e12) return Number((labelValue / 1e9).toFixed(2)).toLocaleString() + " Tỷ";
    if (labelValue >= 1e12) return Number((labelValue / 1e9).toFixed(2)).toLocaleString() + "Tỷ";
}
