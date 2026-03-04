import * as React from "react";
import * as Types from "./types";

declare function ColorNavcard(
    props: {
        as?: React.ElementType;
        colorNavCardLink?: Types.Basic.Link;
        colorNavCardHeadlineTag?: Types.Basic.HeadingTag;
        colorNavCardHeadlineText?: React.ReactNode;
        colorNavCardText?: React.ReactNode;
        colorNavCardTagSlot?: Types.Devlink.Slot;
        colorNavCardTagSlotRuntimeProps?: Types.Devlink.RuntimeProps;
        colorNavCardIconSlot?: Types.Devlink.Slot;
        colorNavCardIconRuntimeProps?: Types.Devlink.RuntimeProps;
        colorNavCardImageSlot?: Types.Devlink.Slot;
        colorNavCardImageSlotRuntimeProps?: Types.Devlink.RuntimeProps;
    }
): React.JSX.Element