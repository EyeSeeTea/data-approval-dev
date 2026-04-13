import { Outlet, useMatch, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import PageHeader from "../components/page-header/PageHeader";
import i18n from "../../locales";

const settingsListPath = "/datasets-settings/list";

export const DataSetSettingsRootPage = () => {
    const navigate = useNavigate();
    const params = useParams();
    const match = useMatch(settingsListPath);

    const goToList = () => {
        navigate(match ? "/" : settingsListPath);
    };

    const isEdit = Boolean(params.id);
    const formTitle = isEdit ? i18n.t("Edit Configuration") : i18n.t("Add Configuration");

    const title = match ? i18n.t("DataSet Configurations") : formTitle;

    return (
        <Container>
            <PageHeader title={title} onBackClick={goToList} />

            <Outlet />
        </Container>
    );
};

const Container = styled.section`
    padding: 1em;
`;
