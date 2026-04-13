import { Id } from "../common/entities/Base";

export type UserSharing = {
    users: Array<{ id: Id; name: string; username: string }>;
    userGroups: Array<{ id: Id; name: string; code: string }>;
};
