import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import styles from "@x3r5e/component-styles/dist/components/Button/Button.module.css";

export type ButtonProps = {
    className?: string;
    children?: React.ReactNode;
    [prop: string]: any;
};

export const Button: React.FunctionComponent<ButtonProps> = ({
    className,
    children,
    ...rest
}) => {
    return (
        <button {...rest} className={classnames(styles.button, className)}>
            {children}
        </button>
    );
};

Button.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};
