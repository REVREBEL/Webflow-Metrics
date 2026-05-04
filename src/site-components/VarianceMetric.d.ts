import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function VarianceMetric(props: {
  iconTrendIRuntimeProps?: Types.Devlink.RuntimeProps;
  iconTrendISlot?: Types.Devlink.Slot;
  iconTrendVisibility?: Types.Boolean.Boolean;
  metricVarRuntimeProps?: Types.Devlink.RuntimeProps;
  metricVarSlot?: Types.Devlink.Slot;
  varianceFormat?: string;
  varianceLabel?: React.ReactNode;
  varianceLabelVisibility?: Types.Boolean.Boolean;
  varianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
  varianceVisibility?: Types.Boolean.Boolean;
}): React.JSX.Element;
