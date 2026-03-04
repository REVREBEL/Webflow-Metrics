import * as React from "react";
import * as Types from "./types";

declare function CardMetaItem(
    props: {
        as?: React.ElementType;
        category?: Types.Builtin.Text;
        categoryLink?: Types.Basic.Link;
        date?: Types.Builtin.Text;
        metaText?: Types.Builtin.Text;
        variant?: "t1" | "t2" | "t3" | "t4" | "t5" | "t6";
        colorVariant?: "dark" | "light" | "green" | "light-green" | "light-blue" | "smokey";
    }
): React.JSX.Element