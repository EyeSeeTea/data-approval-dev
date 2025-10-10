import { useCallback, useMemo } from "react";
import { DataApprovalViewModel } from "../../DataApprovalViewModel";
import { format } from "date-fns";
import i18n from "../../../../../locales";
import { TableColumn } from "@eyeseetea/d2-ui-components";

export function useDataApprovalListColumns() {
    const getColumnValues = useCallback((row: DataApprovalViewModel) => {
        return {
            completed: row.completed ? "Completed" : "Not completed",
            lastDateOfApproval: row.lastDateOfApproval ? format(row.lastDateOfApproval, dateFormat) : "Never approved",
            lastDateOfSubmission: row.lastDateOfSubmission
                ? format(row.lastDateOfSubmission, dateFormat)
                : "Never submitted",
            lastUpdatedValue: row.lastUpdatedValue ? format(row.lastUpdatedValue, dateFormat) : "No data",
            validated: row.validated ? "Submitted" : row.completed ? "Ready for submission" : "Not submitted",
        };
    }, []);

    const columns: TableColumn<DataApprovalViewModel>[] = useMemo(() => {
        return [
            { name: "dataSet", text: i18n.t("Data set"), sortable: false, hidden: false },
            { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: false },
            { name: "period", text: i18n.t("Period"), sortable: false },
            { name: "attribute", text: i18n.t("Attribute"), sortable: false, hidden: true },
            {
                name: "completed",
                text: i18n.t("Completion status"),
                sortable: false,
                getValue: row => getColumnValues(row).completed,
            },
            {
                name: "validated",
                text: i18n.t("Submission status"),
                sortable: false,
                getValue: row => getColumnValues(row).validated,
            },
            {
                name: "approved",
                text: i18n.t("Approval status"),
                sortable: false,
                getValue: row => (row.lastDateOfApproval ? i18n.t("Approved") : i18n.t("Not approved")),
            },
            { name: "modificationCount", text: i18n.t("Modification Count"), sortable: false },
            {
                name: "lastUpdatedValue",
                text: i18n.t("Last modification date"),
                sortable: false,
                getValue: row => getColumnValues(row).lastUpdatedValue,
            },
            {
                name: "lastDateOfSubmission",
                text: i18n.t("Last date of submission"),
                sortable: false,
                getValue: row => getColumnValues(row).lastDateOfSubmission,
            },
            {
                name: "lastDateOfApproval",
                text: i18n.t("Last date of approval"),
                sortable: false,
                getValue: row => getColumnValues(row).lastDateOfApproval,
            },
        ];
    }, [getColumnValues]);

    return {
        columns: columns,
    };
}

const dateFormat = "yyyy-MM-dd' 'HH:mm:ss";
