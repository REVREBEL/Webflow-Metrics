import * as React from "react";
import * as Types from "../types";

declare function ComponentButtonSizeVariants2(
    props: {
        as?: React.ElementType;
        buttonLink?: Types.Basic.Link;
        buttonButtonText?: React.ReactNode;
        iconsTurnIconVisibilityOn?: Types.Visibility.VisibilityConditions;
        iconsJackIcon?: Types.Visibility.VisibilityConditions;
        iconsArrowIcon?: Types.Visibility.VisibilityConditions;
        iconsStarIcon?: Types.Visibility.VisibilityConditions;
        iconsImageIcon?: Types.Visibility.VisibilityConditions;
        iconsIconImage?: Types.Asset.Image;
        iconsIconImageAltText?: Types.Basic.AltText;
        buttonId?: Types.Basic.IdTextInput;
        buttonVisibility?: Types.Visibility.VisibilityConditions;
        optionsButtonSizeVariants?: "XS" | "SM" | "Base" | "MD" | "LG" | "XL";
    }
): React.JSX.Element