import React from "react";
import styled from "styled-components";
//@ts-ignore
import { HeaderBar as D2HeaderBar } from "@dhis2/ui";

type HeaderBarProps = {
    appName: string;
};

// DHIS2 2.42+ global shell already renders its own header bar around the app iframe,
// so only render this app's header bar when running outside of that shell (2.41 and older).
// https://developers.dhis2.org/docs/references/global-shell/#header-bars
export const HeaderBar: React.FC<HeaderBarProps> = ({ appName }) => {
    const shouldRenderHeaderBar = window.self === window.top;
    return shouldRenderHeaderBar ? <StyledHeaderBar appName={appName} /> : null;
};

const StyledHeaderBar = styled(D2HeaderBar)`
    /* The d2 header bar renders a div that overflows its container without this */
    div:first-of-type {
        box-sizing: border-box;
    }
`;
