// csv-writer (only its in-memory stringifier is used) runs `promisify(fs.writeFile)` when it is loaded,
// but the browser build has no `fs` (vite-plugin-node-polyfills leaves it null). Provide a stub so the bundle boots.
const unavailable = () => {
    throw new Error("fs is not available in the browser");
};

export const writeFile = unavailable;
export default { writeFile };
