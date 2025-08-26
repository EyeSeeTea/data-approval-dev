import { D2Api } from "@eyeseetea/d2-api/2.34";
import { getMockApiFromClass } from "@eyeseetea/d2-api";
export { CancelableResponse } from "@eyeseetea/d2-api/repositories/CancelableResponse";

export * from "@eyeseetea/d2-api/2.34";
export const getMockApi = getMockApiFromClass(D2Api);
