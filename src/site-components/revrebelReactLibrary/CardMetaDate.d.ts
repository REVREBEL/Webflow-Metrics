import * as React from "react";
import * as Types from "../types";

declare function CardMetaDate(
    props: {
        as?: React.ElementType;
        date?: Types.Builtin.Text;
        text?: Types.Builtin.Text;
        textColor?: "default" | "light";
    }
): React.JSX.Element