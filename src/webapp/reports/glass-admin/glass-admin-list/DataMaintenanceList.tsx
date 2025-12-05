import React, { useState } from "react";
import { Filter, Filters } from "./amc-report/Filter";
import { TabPanel } from "../../../components/tabs/TabPanel";
import { TabHeader } from "../../../components/tabs/TabHeader";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import { ATCClassificationList } from "./atc-classification/ATCClassificationList";
import { AMCReport } from "./amc-report/AMCReport";
import { useFiles } from "./amc-report/useFiles";
import { useGetModules } from "./amc-report/useGetModules";
import { useAppContext } from "../../../contexts/app-context";

export const DataMaintenanceList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [tabIndex, setTabIndex] = useState<number>(0);
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter());
    const { isDeleteModalOpen } = useFiles(filters);

    const { userModules } = useGetModules(compositionRoot, config);

    const amcModule = userModules.find(module => module.name === AMC_MODULE)?.id;
    const isAMCModule = filters.module === amcModule;

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <React.Fragment>
            <Filters values={filters} onChange={setFilters} />

            {filters.module && (
                <>
                    {isAMCModule && <TabHeader labels={amcReportTabs} tabIndex={tabIndex} onChange={handleChange} />}

                    <TabPanel value={tabIndex} index={0}>
                        <AMCReport filters={filters} />
                    </TabPanel>

                    <TabPanel value={tabIndex} index={1}>
                        <ATCClassificationList />
                    </TabPanel>

                    <LoadingScreen isOpen={isDeleteModalOpen} />
                </>
            )}
        </React.Fragment>
    );
});

const AMC_MODULE = "AMC";
const amcReportTabs = ["AMC Report", "ATC Classification"];

function getEmptyDataValuesFilter(): Filter {
    return {
        module: undefined,
    };
}
