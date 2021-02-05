import React from "react";
import PropTypes from "prop-types";

const Link = ({ title, ...rest }) => {
    return <a {...rest}>{title}</a>;
};

Link.propTypes = {
    title: PropTypes.string.isRequired,
};

export default Link;
