import { Tab, Tabs } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import i18n from "../../../locales";

interface TabHeaderProps {
    labels: string[];
    tabIndex: number;
    onChange(event: React.ChangeEvent<{}>, value: any): void;
}

export const TabHeader: React.FC<TabHeaderProps> = React.memo(props => {
    const { labels, onChange, tabIndex } = props;

    return (
        <StyledTabs indicatorColor="primary" value={tabIndex} onChange={onChange}>
            {labels.map(label => {
                return <Tab key={label} label={i18n.t(label)} />;
            })}
        </StyledTabs>
    );
});

const StyledTabs = styled(Tabs)`
    margin-top: 1rem;
`;
