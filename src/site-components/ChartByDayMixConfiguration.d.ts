import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function ChartByDayMixConfiguration(props: {
  cardHeadline?: React.ReactNode;
  customTriggerButtonGroupName?: string;
  customTriggerButtonLabel?: string;
  customTriggerButtonTriggerId?: string;
  metric1ConfigMetricSlot?: React.ReactNode;
  metric1Metric1WeekdayColor?: React.ReactNode;
  metric1Metric1WeekendColor?: React.ReactNode;
  metric1MetricLabel?: React.ReactNode;
  metric2ConfigMetricSlot?: React.ReactNode;
  metric2Metric2WeekdayColor?: React.ReactNode;
  metric2Metric2WeekendColor?: React.ReactNode;
  metric2MetricLabel?: React.ReactNode;
  monthToggleButtonGroupName?: string;
  monthToggleButtonLabel?: string;
  periodSelected?: string;
  quarterToggleButtonGroupName?: string;
  quarterToggleButtonLabel?: string;
  toggleGroupDirection?: "Horizontal" | "Vertical";
  toggleGroupGroupName?: string;
  toggleGroupNumberOfButtons?: "2" | "3" | "4" | "5" | "6" | "7" | "8";
  weekToggleButtonGroupName?: string;
  weekToggleButtonLabel?: string;
  yearToggleButtonGroupName?: string;
  yearToggleButtonLabel?: string;
}): React.JSX.Element;
