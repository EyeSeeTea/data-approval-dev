import { SubnationalCorrectOptions, SubnationalCorrectWithPaging } from "../entities/SubnationalCorrect";

export interface SubnationalCorrectRepository {
    get(options: SubnationalCorrectOptions): Promise<SubnationalCorrectWithPaging>;
}
