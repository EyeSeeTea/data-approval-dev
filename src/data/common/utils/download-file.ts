export async function downloadFile(buffer: string, filename: string, mimeType: string): Promise<void> {
    const blob = new Blob([buffer], { type: mimeType });
    const element = document.querySelector<HTMLAnchorElement>("#download") || document.createElement("a");
    element.id = "download-file";
    element.href = window.URL.createObjectURL(blob);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
}
