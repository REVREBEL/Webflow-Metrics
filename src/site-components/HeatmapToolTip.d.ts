import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function HeatmapToolTip(props: {
  adrLabelRuntimeProps?: Types.Devlink.RuntimeProps;
  adrLabelSlot?: Types.Devlink.Slot;
  adrMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  adrMetricSlot?: Types.Devlink.Slot;
  dateLabelRuntimeProps?: Types.Devlink.RuntimeProps;
  dateLabelSlot?: Types.Devlink.Slot;
  metricLabelRuntimeProps?: Types.Devlink.RuntimeProps;
  metricLabelSlot?: Types.Devlink.Slot;
  revenueLabelRuntimeProps?: Types.Devlink.RuntimeProps;
  revenueLabelSlot?: Types.Devlink.Slot;
  revenueMetric?: React.ReactNode;
  revenueMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  revenueMetricSlot?: Types.Devlink.Slot;
  roomsLabelRuntimeProps?: Types.Devlink.RuntimeProps;
  roomsLabelSlot?: Types.Devlink.Slot;
  roomsMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  roomsMetricSlot?: Types.Devlink.Slot;
  title1?: React.ReactNode;
}): React.JSX.Element;
