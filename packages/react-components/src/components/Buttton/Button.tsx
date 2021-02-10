import React from "react";
import PropTypes from "prop-types";

type ButtonProps = {
    title: string;
    [prop: string]: any;
};

const Button: React.FunctionComponent<ButtonProps> = ({ title, ...rest }) => {
    return <button {...rest}>{title}</button>;
};

Button.propTypes = {
    title: PropTypes.string.isRequired,
};

export default Button;
