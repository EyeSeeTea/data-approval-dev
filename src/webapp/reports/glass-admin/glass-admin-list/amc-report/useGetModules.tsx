import { useEffect, useState } from "react";
import { CompositionRoot } from "../../../../../compositionRoot";
import { Config } from "../../../../../domain/common/entities/Config";
import { GLASSModule } from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";

interface GetModulesState {
    userModules: GLASSModule[];
}

export function useGetModules(compositionRoot: CompositionRoot, config: Config): GetModulesState {
    const [userModules, setUserModules] = useState<GLASSModule[]>([]);

    useEffect(() => {
        compositionRoot.glassAdmin.getModules(config).then(modules => setUserModules(modules));
    }, [compositionRoot.glassAdmin, config]);

    return { userModules };
}
