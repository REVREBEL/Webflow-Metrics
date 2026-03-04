import * as React from "react";
import * as Types from "../types";

declare function ComponentTagSizeVariants2(
    props: {
        as?: React.ElementType;
        buttonButtonText?: React.ReactNode;
        iconsTurnIconVisibilityOn?: Types.Visibility.VisibilityConditions;
        iconsJackIcon?: Types.Visibility.VisibilityConditions;
        iconsArrowIcon?: Types.Visibility.VisibilityConditions;
        iconsStarIcon?: Types.Visibility.VisibilityConditions;
        iconsImageIcon?: Types.Visibility.VisibilityConditions;
        iconsIconImage?: Types.Asset.Image;
        iconsIconImageAltText?: Types.Basic.AltText;
        optionsButtonSizeVariants?: "XS" | "SM" | "RG" | "MD" | "LG" | "XL";
    }
): React.JSX.Element