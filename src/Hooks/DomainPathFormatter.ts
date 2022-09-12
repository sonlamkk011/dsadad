export const formatDomainPath = (text: string = "", type: string) => {
    if (type === "domain") {
        if (text.includes("http://") || text.includes("https://")) {
            // if last character is a slash, remove it
            if (text.slice(-1) === "/") {
                return text.slice(0, -1);
            } else {
                return text
            }
        } else {
            // if last character is a slash, remove it
            if (text.slice(-1) === "/") {
                return "http://" + text.slice(0, -1);
            } else {
                return "http://" + text
            }
        }
    } else if (type === "path") {
        if (text[0] === "/") {
            return text
        } else {
            return `/${text}`
        }
    }
}
