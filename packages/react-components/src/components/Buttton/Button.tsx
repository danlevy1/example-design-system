import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { ButtonStyles } from "@x3r5e/component-styles";

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
        <button
            {...rest}
            className={classnames(ButtonStyles.button, className)}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};
