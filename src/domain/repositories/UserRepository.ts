import { User } from "../entities/User";
import { FutureData } from "../generic/Future";

export interface UserRepository {
    getCurrent(): FutureData<User>;
    getByUsernames(usernames: string[]): FutureData<User[]>;
}
