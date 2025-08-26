import React from "react";
import _ from "lodash";
import { IconButton } from "material-ui";
import { FilterList } from "@material-ui/icons";
import { Filters, DataValuesFiltersProps } from "./Filters";
import { useBooleanState } from "../../../utils/use-boolean";
import i18n from "../../../../locales";

export interface FiltersBoxProps extends DataValuesFiltersProps {
    showToggleButton: boolean;
}

export const FiltersBox: React.FC<FiltersBoxProps> = React.memo(props => {
    const { showToggleButton = true, ...otherProps } = props;
    const areFiltersApplied = !_(props.values).values().every(_.isEmpty);
    const [isFilterBoxVisible, { toggle: toggleFilterBoxVisibility }] = useBooleanState(false);
    const filterIconColor = areFiltersApplied ? "#ff9800" : undefined;
    const filterButtonColor = isFilterBoxVisible ? { backgroundColor: "#cdcdcd" } : undefined;
    const areFiltersVisible = !showToggleButton || isFilterBoxVisible;
    const filtersStyle = areFiltersVisible ? styles.filters.visible : styles.filters.hidden;

    return (
        <React.Fragment>
            {showToggleButton && (
                <IconButton
                    onClick={toggleFilterBoxVisibility}
                    title={i18n.t("Toggle filters")}
                    style={filterButtonColor}
                >
                    <FilterList style={{ color: filterIconColor }} />
                </IconButton>
            )}

            <div style={filtersStyle}>
                <Filters {...otherProps} />
            </div>
        </React.Fragment>
    );
});

const styles = {
    filters: {
        visible: {},
        hidden: { display: "none" },
    },
};
