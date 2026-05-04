import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function MetricLayout(props: {
  iconTrendRuntimeProps?: Types.Devlink.RuntimeProps;
  iconTrendSlot?: Types.Devlink.Slot;
  iconTrendVisibility?: Types.Boolean.Boolean;
  layoutVariant?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  metricFormat?: string;
  metricRuntimeProps?: Types.Devlink.RuntimeProps;
  metricSlot?: Types.Devlink.Slot;
  metricType?: React.ReactNode;
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
