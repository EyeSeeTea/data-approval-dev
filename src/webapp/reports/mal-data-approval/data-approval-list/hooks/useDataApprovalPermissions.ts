import { useAppContext } from "../../../../contexts/app-context";

type DataApprovalUserPermissionsState = {
    isMalAdmin: boolean;
    isMalCountryApprover: boolean;
};

export function useDataApprovalPermissions(): DataApprovalUserPermissionsState {
    const {
        config: { currentUser },
    } = useAppContext();

    return { isMalAdmin: currentUser.isAdmin, isMalCountryApprover: currentUser.isAdmin };
}
