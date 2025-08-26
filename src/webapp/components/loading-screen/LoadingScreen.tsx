import { Backdrop, CircularProgress } from "@material-ui/core";
import React from "react";
import styled from "styled-components";

interface LoadingScreenProps {
    isOpen: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isOpen }) => {
    return (
        <StyledBackdrop open={isOpen}>
            <CircularProgress color="inherit" />
        </StyledBackdrop>
    );
};

const StyledBackdrop = styled(Backdrop)`
    z-index: 50;
    color: #fff;
`;

export default React.memo(LoadingScreen);
