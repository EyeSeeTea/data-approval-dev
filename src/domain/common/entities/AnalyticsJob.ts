import { Struct } from "../../generic/Struct";
import { Id } from "./Base";

type AnalyticsJobAttrs = {
    id: Id;
    name: string;
};

/** A background job that drops and rebuilds the tables the SQL views read. */
export class AnalyticsJob extends Struct<AnalyticsJobAttrs>() {}
