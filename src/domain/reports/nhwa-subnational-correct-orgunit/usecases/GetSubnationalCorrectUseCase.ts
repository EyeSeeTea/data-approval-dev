import _ from "lodash";
import { SubnationalCorrectOptions, SubnationalCorrectWithPaging } from "../entities/SubnationalCorrect";
import { SubnationalCorrectRepository } from "../repositories/SubnationalCorrectRepository";

export class GetSubnationalCorrectUseCase {
    constructor(private subnationalCorrectRepository: SubnationalCorrectRepository) {}

    async execute(options: SubnationalCorrectOptions): Promise<SubnationalCorrectWithPaging> {
        const subnationalCorrectValues = await this.subnationalCorrectRepository.get(options);

        return {
            ...subnationalCorrectValues,
            rows: _(subnationalCorrectValues.rows)
                .orderBy(this.getSortField(options.sortingField), options.sortingOrder)
                .value(),
        };
    }

    private getSortField(fieldName: string) {
        if (fieldName === "orgUnit") {
            return "orgUnit.name";
        } else if (fieldName === "orgUnitParent") {
            return "orgUnitParent.name";
        }
        return fieldName;
    }
}
