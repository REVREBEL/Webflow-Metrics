import * as React from "react";
import * as Types from "./types";

declare function KpiCard(
    props: {
        as?: React.ElementType;
        primaryMetricPrimaryMetricLabelTag?: Types.Basic.HeadingTag;
        primaryMetricPrimaryMetricLabel?: React.ReactNode;
        primaryMetricPrimaryMetricLabelRuntimeProps?: Types.Devlink.RuntimeProps;
        primaryMetricPrimaryMetricLabelSlot?: Types.Devlink.Slot;
        primaryMetricPrimaryMetricText?: React.ReactNode;
        primaryMetricPrimaryMetricRuntimeProps?: Types.Devlink.RuntimeProps;
        metric1SubMetricLabel?: React.ReactNode;
        metric1SubMetricText?: React.ReactNode;
        metric1SubMetricRuntimeProps?: Types.Devlink.RuntimeProps;
        metric1SubMetricSlot?: Types.Devlink.Slot;
        metric2SubMetricLabel?: React.ReactNode;
        metric2SubMetricText?: React.ReactNode;
        metric3SecondaryMetricLabel?: React.ReactNode;
        metric3SubMetricText?: React.ReactNode;
        metric4SecondaryMetricLabel?: React.ReactNode;
        metric3SubMetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
        metric4SubMetricLabel?: Types.Devlink.Slot;
        metric4MetricVarSlot?: Types.Devlink.Slot;
        metric2SubMetricSlot?: Types.Devlink.Slot;
        metric2SubMetricRuntimeProps?: Types.Devlink.RuntimeProps;
        metric4SubMetricVarSlot?: React.ReactNode;
        metric4SubMetricSlot?: Types.Devlink.Slot;
        metric2SubMetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
        metric4MetricVarText?: React.ReactNode;
        metric4SubMetricRuntimeProps?: Types.Devlink.RuntimeProps;
        metric4SubMetricVarRuntimeProps?: React.ReactNode;
        metric4MetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
        primaryMetricPrimaryMetricSlot?: Types.Devlink.Slot;
        primaryMetricPrimaryMetricVarText?: React.ReactNode;
        primaryMetricPrimaryMetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
        primaryMetricPrimaryMetricVarSlot?: Types.Devlink.Slot;
        metric1SubMetricVarText?: React.ReactNode;
        metric1MetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
        metric1SubMetricVarSlot?: Types.Devlink.Slot;
        metric2SubMetricVarSlot?: Types.Devlink.Slot;
        metric3SubMetricVarText?: React.ReactNode;
        metric3SubMetricRuntimeProps?: Types.Devlink.RuntimeProps;
        metric3SubMetricVarSlot?: Types.Devlink.Slot;
        chart1ChartSlot?: Types.Devlink.Slot;
        chart1ChartRuntimeProps?: Types.Devlink.RuntimeProps;
        chart2ChartRuntimeProps?: Types.Devlink.RuntimeProps;
        chart2ChartSlot?: Types.Devlink.Slot;
    }
): React.JSX.Element