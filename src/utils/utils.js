const cleanDhis2Url = (baseUrl, path) => [baseUrl.replace(/\/$/, ""), path.replace(/^\//, "")].join("/");

export const goToDhis2Url = (baseUrl, path) => {
    if (baseUrl && path) window.location = cleanDhis2Url(baseUrl, path);
};
