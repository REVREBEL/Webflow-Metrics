import * as React from "react";
import * as Types from "./types";

declare function WhiteNavcard(
    props: {
        as?: React.ElementType;
        navCardIcon?: Types.Asset.Image;
        navCardIconAltText?: Types.Basic.AltText;
        navCardParagraph?: React.ReactNode;
        tagSlot?: Types.Devlink.Slot;
        tagRuntimeProps?: Types.Devlink.RuntimeProps;
        whiteNavCardIconSlot?: Types.Devlink.Slot;
        whiteNavCardHeadlineTag?: Types.Basic.HeadingTag;
        whiteNavCardHeadlineText?: React.ReactNode;
        whiteNavCardLink?: Types.Basic.Link;
        iconRuntimeProps?: Types.Devlink.RuntimeProps;
    }
): React.JSX.Element