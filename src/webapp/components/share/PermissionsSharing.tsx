import React from "react";
import { Sharing } from "@eyeseetea/d2-ui-components";
import { Button, Dialog, DialogActions, DialogContent } from "@material-ui/core";
import { User } from "../../../domain/entities/User";
import { useAppContext } from "../../contexts/app-context";
import i18n from "../../../locales";

type PermissionsSharingProps = {
    usernames: string[];
    userGroupCodes: string[];
    onChange: (params: { usernames: string[]; userGroupCodes: string[] }) => void;
    onClose: () => void;
    visible: boolean;
    title?: string;
};

export const PermissionsSharing: React.FC<PermissionsSharingProps> = props => {
    const { compositionRoot } = useAppContext();
    const { title, onClose, usernames, userGroupCodes, onChange, visible } = props;
    const [usersWithAccess, setUsersWithAccess] = React.useState<UserAccess[]>([]);
    const [groupsWithAccess, setGroupsWithAccess] = React.useState<UserGroupAccess[]>([]);

    React.useEffect(() => {
        compositionRoot.users.getByUsernames.execute(usernames).run((users: User[]) => {
            setUsersWithAccess(
                usernames.length > 0
                    ? users.map(user => ({
                          id: user.username,
                          name: user.name,
                          username: user.username,
                      }))
                    : []
            );
        }, console.error);
    }, [compositionRoot, usernames]);

    React.useEffect(() => {
        return compositionRoot.userGroups.getByCodes.execute(userGroupCodes).run(userGroups => {
            setGroupsWithAccess(
                userGroups.map(group => ({
                    id: group.code,
                    code: group.code,
                    name: group.name,
                }))
            );
        }, console.error);
    }, [compositionRoot, userGroupCodes]);

    const closeModal = React.useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Dialog open={visible} fullWidth onClose={closeModal}>
            <DialogContent>
                <Sharing
                    subtitle={title}
                    showOptions={{
                        title: false,
                        externalSharing: false,
                        dataSharing: false,
                        permissionPicker: false,
                        publicSharing: false,
                    }}
                    meta={{
                        object: {
                            id: "",
                            userAccesses: usersWithAccess.map(user => ({
                                access: "",
                                displayName: user.name,
                                id: user.username,
                            })),
                            userGroupAccesses: groupsWithAccess.map(group => ({
                                access: "",
                                displayName: group.name,
                                id: group.code,
                            })),
                        },
                    }}
                    onChange={args => {
                        const newUsernames = args.userAccesses ? args.userAccesses.map(user => user.id) : usernames;
                        const newUserGroupCodes = args.userGroupAccesses
                            ? args.userGroupAccesses.map(group => group.id)
                            : userGroupCodes;

                        onChange({ usernames: newUsernames, userGroupCodes: newUserGroupCodes });

                        return Promise.resolve();
                    }}
                    onSearch={query => {
                        return compositionRoot.sharing.search
                            .execute(query)
                            .toPromise()
                            .then(results => {
                                return {
                                    users: results.users.map(user => ({
                                        id: user.username,
                                        displayName: user.name,
                                    })),
                                    userGroups: results.userGroups
                                        .filter(userGroup => Boolean(userGroup.code))
                                        .map(userGroup => ({
                                            id: userGroup.code,
                                            displayName: userGroup.name,
                                        })),
                                };
                            });
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={closeModal}>
                    {i18n.t("Close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

type UserAccess = { id: string; name: string; username: string };
type UserGroupAccess = { id: string; code: string; name: string };
