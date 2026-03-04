import * as React from "react";
import * as Types from "../types";

declare function ComponentButtonColorVariants(
    props: {
        as?: React.ElementType;
        optionsButtonColorVariants?: "Base" | "Color Primary" | "Color Primary Inverse" | "Color Primary Outline" | "Light" | "Light Outline" | "Color 1" | "Color 1 Outline" | "Color 1 Outline Inverse" | "Color 2" | "Color 2 Outline" | "Color 2 Outline Inverse" | "Color 4" | "Color 5" | "Color 5 Outline" | "Color 5 Outline Inverse" | "Color 6" | "Color 6 Outline" | "Color 7" | "Color 8" | "Color 8 Outline" | "Color 8 Inverse" | "Color 9" | "Color 9 Outline" | "Alert" | "Alert Outline" | "Disabled";
        sotButtonSizeVariants?: Types.Devlink.Slot;
        slotButtonSizeRuntimeProps?: Types.Devlink.RuntimeProps;
    }
): React.JSX.Element