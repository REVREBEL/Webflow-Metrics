import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function MetricType(props: {
  abbreviatedMetric?: Types.Boolean.Boolean;
  iconTrendIndicatorRuntimeProps?: Types.Devlink.RuntimeProps;
  iconTrendIndicatorSlot?: Types.Devlink.Slot;
  iconTrendVisibility?: Types.Boolean.Boolean;
  layout?:
    | "Base"
    | "Stacked 1col"
    | "Stacked 2col"
    | "Horizontal 1row"
    | "Horizontal 2row";
  metricRuntimeProps?: Types.Devlink.RuntimeProps;
  metricSlot?: Types.Devlink.Slot;
  metricType?:
    | "Base"
    | "Occupancy"
    | "Rooms"
    | "ADR"
    | "Revenue"
    | "RevPar"
    | "Nights"
    | "Reservations"
    | "Guests";
  varianceLabelVisibility?: Types.Boolean.Boolean;
  varianceMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  varianceMetricSlot?: Types.Devlink.Slot;
  varianceMetricVisibility?: Types.Boolean.Boolean;
  varianceType?:
    | "Base"
    | "to book"
    | "%chg"
    | "var"
    | "var STLY"
    | "var PY"
    | "var WOW";
}): React.JSX.Element;
