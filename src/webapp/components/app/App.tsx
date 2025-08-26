//@ts-ignore
import { useConfig } from "@dhis2/app-runtime";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { SnackbarProvider, LoadingProvider } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React from "react";
import { appConfig } from "../../../app-config";
import { getCompositionRoot } from "../../../compositionRoot";
import { Config } from "../../../domain/common/entities/Config";
import { D2Api } from "../../../types/d2-api";
import { AppContext, AppContextState } from "../../contexts/app-context";
import Report from "../../reports/Reports";
import Share from "../share/Share";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";

type D2 = object;

declare global {
    interface Window {
        app: { config: Config };
    }
}

const App = ({ api, d2 }: { api: D2Api; d2: D2 }) => {
    const { baseUrl } = useConfig();

    const [showShareButton, setShowShareButton] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [appContext, setAppContext] = React.useState<AppContextState | null>(null);

    React.useEffect(() => {
        async function setup() {
            const compositionRoot = getCompositionRoot(api);
            const config = await compositionRoot.config.get();
            window.app = { config };

            setAppContext({ api, config, compositionRoot });
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            setLoading(false);
        }
        setup();
    }, [d2, api, baseUrl]);

    if (loading) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                <LoadingProvider>
                    <SnackbarProvider>
                        <div id="app" className="content">
                            <AppContext.Provider value={appContext}>
                                <Report />
                            </AppContext.Provider>
                        </div>

                        <Share visible={showShareButton} />
                    </SnackbarProvider>
                </LoadingProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );
};

export interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback?: {
        token: string[];
        createIssue: boolean;
        sendToDhis2UserGroups: string[];
        issues: {
            repository: string;
            title: string;
            body: string;
        };
        snapshots: {
            repository: string;
            branch: string;
        };
        feedbackOptions: object;
    };
}

export default React.memo(App);
