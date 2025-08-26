import { useBooleanState } from "../../../../utils/use-boolean";

export function useATCUpload() {
    const [isPatchModalOpen, { enable: openPatchModal, disable: closePatchModal }] = useBooleanState(false);
    const [isUploadATCModalOpen, { enable: openUploadATCModal, disable: closeUploadATCModal }] = useBooleanState(false);
    const [isRecalculateLogicModalOpen, { enable: openRecalculateLogicModal, disable: closeRecalculateLogicModal }] =
        useBooleanState(false);

    return {
        isPatchModalOpen,
        isUploadATCModalOpen,
        isRecalculateLogicModalOpen,
        closePatchModal,
        closeUploadATCModal,
        openPatchModal,
        openUploadATCModal,
        openRecalculateLogicModal,
        closeRecalculateLogicModal,
    };
}
