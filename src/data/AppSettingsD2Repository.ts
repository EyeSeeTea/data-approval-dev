import { AppSettings } from "../domain/common/entities/AppSettings";
import { AppSettingsRepository } from "../domain/common/repositories/AppSettingsRepository";
import { D2ApprovalReport } from "./D2ApprovalReport";

export class AppSettingsD2Repository implements AppSettingsRepository {
    private d2ApprovalReport: D2ApprovalReport;

    constructor() {
        this.d2ApprovalReport = new D2ApprovalReport();
    }

    get(): Promise<AppSettings> {
        return Promise.resolve(this.d2ApprovalReport.get());
    }
}
