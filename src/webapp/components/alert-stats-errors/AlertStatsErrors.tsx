import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Button } from "@material-ui/core";
import { OrgUnit } from "../../../domain/common/entities/OrgUnit";
import { Stats } from "../../../domain/common/entities/Stats";
import { Alert } from "../alert/Alert";

type AlertStatsErrorsProps = { errors?: Stats["errorMessages"]; onCleanError: () => void; orgUnits: OrgUnit[] };

function replaceOrgUnitIdByName(message: string, orgUnits: OrgUnit[]): string {
    if (orgUnits.length === 0) return message;
    const regex = /organisation unit:\s*`([^`]+)`/;
    const match = message.match(regex);
    if (match) {
        const orgUnitId = _(match).nth(1);
        if (!orgUnitId) return message;
        const orgUnit = orgUnits.find(orgUnit => orgUnit.id === orgUnitId);
        if (!orgUnit) return message;
        return message.replace(orgUnitId, orgUnit.name);
    } else {
        return message;
    }
}

export const AlertStatsErrors: React.FC<AlertStatsErrorsProps> = props => {
    const { errors, onCleanError, orgUnits } = props;

    if (!errors) return null;

    return (
        <>
            <Button variant="contained" color="secondary" size="small" onClick={() => onCleanError()}>
                Clear Errors
            </Button>
            <AlertContainer>
                {errors.map((error, index) => {
                    return <Alert key={index} message={replaceOrgUnitIdByName(error.message, orgUnits)} />;
                })}
            </AlertContainer>
        </>
    );
};

const AlertContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 0.5em 0;
`;
