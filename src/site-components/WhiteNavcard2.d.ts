import * as React from "react";
import * as Types from "./types";

declare function WhiteNavcard2(
    props: {
        as?: React.ElementType;
        navCardIcon?: Types.Asset.Image;
        navCardIconAltText?: Types.Basic.AltText;
        navCardHeadlineTag?: Types.Basic.HeadingTag;
        navCardHeadlineText?: React.ReactNode;
        navCardParagraph?: React.ReactNode;
        tagSlot?: React.ReactNode;
        navCardLink?: Types.Basic.Link;
    }
): React.JSX.Element