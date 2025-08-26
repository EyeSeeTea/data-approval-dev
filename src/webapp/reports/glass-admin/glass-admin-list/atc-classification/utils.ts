import JSZip from "jszip";

export async function extractJsonDataFromZIP(file: File): Promise<Record<string, unknown[]>[]> {
    const zip = new JSZip();
    const jsonPromises: Promise<Record<string, unknown[]>>[] = [];
    const contents = await zip.loadAsync(file);

    contents.forEach((relativePath, file) => {
        if (file.dir) {
            return;
        }

        // Check if the file has a .json extension
        if (/\.(json)$/i.test(relativePath)) {
            const jsonPromise = file.async("string").then(content => {
                try {
                    return JSON.parse(content) as Record<string, unknown[]>;
                } catch (error) {
                    console.error(`Error parsing JSON from ${relativePath}: ${error}`);
                    throw error;
                }
            });

            jsonPromises.push(jsonPromise);
        }
    });
    const jsons = await Promise.all(jsonPromises);

    return jsons;
}
