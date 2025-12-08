import { User } from "../entities/User";
import { FutureData } from "../generic/Future";
import { UserRepository } from "../repositories/UserRepository";

export class GetUsersByUsernameUseCase {
    constructor(private options: { userRepository: UserRepository }) {}

    public execute(usernames: string[]): FutureData<User[]> {
        return this.options.userRepository.getByUsernames(usernames);
    }
}
