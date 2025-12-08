import _ from "lodash";
import { Navigate, RouterProvider } from "react-router";
import { createHashRouter, RouteObject } from "react-router-dom";
import { CompositionRoot } from "../../compositionRoot";
import { Config } from "../../domain/common/entities/Config";
import { DataSetWithConfigPermissions } from "../../domain/usecases/GetApprovalConfigurationsUseCase";
import { AddDataSetSettingsPage } from "../pages/AddDataSetSettingsPage";
import { DataSetSettingsPage } from "../pages/DataSetSettingsPage";
import { DataSetSettingsRootPage } from "../pages/DataSetSettingsRootPage";
import MalDataApprovalStatusReport from "./mal-data-approval/MalDataApprovalReport";

function generateRoutes(options: { config: Config; compositionRoot: CompositionRoot }) {
    const { config, compositionRoot } = options;
    const dataSetSettingsRoutes: RouteObject = {
        path: "/datasets-settings",
        element: <DataSetSettingsRootPage />,
        children: [
            {
                index: true,
                element: <Navigate to="list" replace />,
            },
            {
                element: <DataSetSettingsPage />,
                path: "list",
            },
            {
                path: "add",
                element: <AddDataSetSettingsPage />,
            },
            {
                path: ":id/edit",
                element: <AddDataSetSettingsPage />,
            },
        ],
    };

    const routes: RouteObject[] = _([
        {
            path: "/",
            element: <MalDataApprovalStatusReport />,
            loader: () => {
                return getDataSetConfigurations(compositionRoot);
            },
            errorElement: <div>Failed to load report</div>,
        },
        config.currentUser.isAdmin ? dataSetSettingsRoutes : undefined,
    ])
        .compact()
        .value();

    return createHashRouter(routes);
}

function Reports(props: { config: Config; compositionRoot: CompositionRoot }) {
    const routes = generateRoutes(props);
    return <RouterProvider router={routes} />;
}

export default Reports;

export function getDataSetConfigurations(compositionRoot: CompositionRoot): Promise<DataSetConfigLoader> {
    // get configs and build dataSets combo
    // and available org units
    //
    return compositionRoot.dataSetConfig.getDataSets
        .execute()
        .toPromise()
        .then(dataSetsConfig => {
            return { dataSetsConfig };
        });
}

export type DataSetConfigLoader = { dataSetsConfig: DataSetWithConfigPermissions[] };
