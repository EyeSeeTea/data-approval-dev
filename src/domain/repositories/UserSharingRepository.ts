import { UserSharing } from "../entities/UserSharing";
import { FutureData } from "../generic/Future";

export interface UserSharingRepository {
    get(query: string): FutureData<UserSharing>;
}
