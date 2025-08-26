import React from "react";

interface TabPanelProps {
    children: React.ReactNode;
    index: number;
    value: number;
}

export const TabPanel: React.FC<TabPanelProps> = React.memo(props => {
    const { children, value, index } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`}>
            {value === index && <div>{children}</div>}
        </div>
    );
});
