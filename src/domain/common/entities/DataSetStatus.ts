import { Struct } from "../../generic/Struct";

type DataSetStatusAttrs = {
    isSubmitted: boolean;
    isCompleted: boolean;
};

export class DataSetStatus extends Struct<DataSetStatusAttrs>() {}
