import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import styles from "./Button.module.scss";

export type ButtonProps = {
    kind?: "primary" | "secondary" | "tertiary";
    size?: "small" | "medium" | "large";
    label?: React.ReactNode;
};

export const Button: React.FunctionComponent<ButtonProps> = ({
    kind = "primary",
    size = "medium",
    label,
}) => {
    return (
        <button
            type="button"
            className={classnames(styles.button, styles[size], {
                [styles.secondary]: kind === "secondary",
                [styles.tertiary]: kind === "tertiary",
            })}
            data-turbo-component-name="Button"
        >
            <span className={classnames(styles.label)}>{label}</span>
        </button>
    );
};

Button.propTypes = {
    kind: PropTypes.oneOf(["primary", "secondary", "tertiary"]),
    size: PropTypes.oneOf(["small", "medium", "large"]),
    label: PropTypes.string,
};
