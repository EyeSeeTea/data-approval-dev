import _ from "lodash";
import { Navigate, RouterProvider } from "react-router";
import { createHashRouter, RouteObject } from "react-router-dom";
import { Config } from "../../domain/common/entities/Config";
import { AddDataSetSettingsPage } from "../pages/AddDataSetSettingsPage";
import { DataSetSettingsPage } from "../pages/DataSetSettingsPage";
import { DataSetSettingsRootPage } from "../pages/DataSetSettingsRootPage";
import MalDataApprovalStatusReport from "./mal-data-approval/MalDataApprovalReport";

function generateRoutes(config: Config) {
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

    const routes = _([
        {
            path: "/",
            element: <MalDataApprovalStatusReport />,
        },
        config.currentUser.isAdmin ? dataSetSettingsRoutes : undefined,
    ])
        .compact()
        .value();

    return createHashRouter(routes);
}

function Reports(props: { config: Config }) {
    const routes = generateRoutes(props.config);
    return <RouterProvider router={routes} />;
}

export default Reports;
