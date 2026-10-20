import { D2Api } from "../../types/d2-api";

/* The axios mock adapter of d2-api only works with the "xhr" backend */
export function getApiReturning(endpoint: string, response: unknown): D2Api {
    const api = new D2Api({ baseUrl: "http://localhost:8080", backend: "xhr" });
    api.getMockAdapter().onGet(endpoint).reply(200, response);
    return api;
}
