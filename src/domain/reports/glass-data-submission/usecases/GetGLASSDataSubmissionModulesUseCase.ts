import { Config } from "../../../common/entities/Config";
import { GLASSDataSubmissionModule } from "../entities/GLASSDataSubmissionItem";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class GetGLASSDataSubmissionModulesUseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(config: Config): Promise<GLASSDataSubmissionModule[]> {
        return this.submissionRepository.getUserModules(config);
    }
}
