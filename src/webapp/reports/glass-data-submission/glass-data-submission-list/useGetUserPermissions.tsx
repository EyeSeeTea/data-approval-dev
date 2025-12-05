import { useEffect, useMemo, useState } from "react";
import { GLASSDataSubmissionModule } from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { CompositionRoot } from "../../../../compositionRoot";
import { Config } from "../../../../domain/common/entities/Config";
import { Filter } from "./Filters";
import _ from "lodash";

export function useGetUserPermissions(compositionRoot: CompositionRoot, config: Config, filters: Filter) {
    const [userModules, setUserModules] = useState<GLASSDataSubmissionModule[]>([]);

    useEffect(() => {
        compositionRoot.glassDataSubmission.getModules(config).then(modules => setUserModules(modules));
    }, [compositionRoot.glassDataSubmission, config]);

    const isEARModule = useMemo(() => {
        const earModule = userModules.find(userModule => userModule.name === "EAR")?.id;

        return (
            (earModule && filters.module === earModule) ||
            (userModules.length === 1 && _.first(userModules)?.name === "EAR")
        );
    }, [filters.module, userModules]);

    const isEGASPUser = !!userModules.find(module => module.name === "EGASP");

    return { isEARModule, isEGASPUser, userModules };
}
