import { D2Api } from "../../types/d2-api";

/* The axios mock adapter of d2-api only works with the "xhr" backend */
export function getApiReturning(responses: Record<string, unknown>): D2Api {
    const api = new D2Api({ baseUrl: "http://localhost:8080", backend: "xhr" });
    const mock = api.getMockAdapter();
    Object.entries(responses).forEach(([endpoint, response]) => mock.onGet(endpoint).reply(200, response));
    return api;
}
