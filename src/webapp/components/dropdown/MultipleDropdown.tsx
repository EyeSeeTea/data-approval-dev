import { MenuItem, Select } from "@material-ui/core";
import _ from "lodash";
import React, { useCallback } from "react";
import i18n from "../../../locales";
import DropdownForm from "./DropdownForm";

type Value = string;

interface MultipleDropdownProps {
    className?: string;
    items: Array<{ value: Value; text: string }>;
    onChange: (values: Value[]) => void;
    label: string;
    values: Value[];
    multiple?: boolean;
    hideEmpty?: boolean;
}

const MultipleDropdown: React.FC<MultipleDropdownProps> = props => {
    const { items, values, onChange, label, className, multiple = true, hideEmpty } = props;
    const notifyChange = useCallback(
        ev => {
            const items = _.flatten([ev.target.value || undefined]);
            const clear = multiple && items.includes("");
            onChange(clear ? [] : items);
        },
        [onChange, multiple]
    );

    return (
        <DropdownForm label={label} className={className}>
            <Select
                multiple={multiple}
                data-test-multiple-dropdown={label}
                value={values}
                onChange={notifyChange}
                MenuProps={menuPropsBottomLeft}
            >
                {!hideEmpty && <MenuItem value={""}>{i18n.t("")}</MenuItem>}
                {items.map(item => (
                    <MenuItem key={item.value} value={item.value}>
                        {item.text}
                    </MenuItem>
                ))}
            </Select>
        </DropdownForm>
    );
};

const menuPropsBottomLeft = {
    getContentAnchorEl: null,
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
} as const;

export default React.memo(MultipleDropdown);
