import { Id } from "../common/entities/Base";
import { Struct } from "../generic/Struct";

type MetadataEntityAttrs = {
    id: Id;
    name: string;
    code: string;
};

export class MetadataEntity extends Struct<MetadataEntityAttrs>() {}
