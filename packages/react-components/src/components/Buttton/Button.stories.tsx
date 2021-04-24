import React from "react";
import { Meta } from "@storybook/react/types-6-0";
import { Button, ButtonProps } from "./Button";

export const Primary: React.FC<ButtonProps> = () => (
    <Button size="large" label="Button" />
);

export default {
    title: "Components/Button",
    component: Button,
} as Meta;
