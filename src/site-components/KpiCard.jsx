"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function KpiCard(
    {
        as: _Component = _Builtin.BlockContainer,
        primaryMetricPrimaryMetricLabelTag = "h1",
        primaryMetricPrimaryMetricLabel = "Budget",
        primaryMetricPrimaryMetricLabelRuntimeProps = {},
        primaryMetricPrimaryMetricLabelSlot,
        primaryMetricPrimaryMetricText = "$0",
        primaryMetricPrimaryMetricRuntimeProps = {},
        metric1SubMetricLabel = <>{"Occupancy"}<br /></>,
        metric1SubMetricText = "$0",
        metric1SubMetricRuntimeProps = {},
        metric1SubMetricSlot,
        metric2SubMetricLabel = "Rooms",
        metric2SubMetricText = "$0",
        metric3SecondaryMetricLabel = "ADR",
        metric3SubMetricText = "$0",
        metric4SecondaryMetricLabel = "REVPAR",
        metric3SubMetricVarRuntimeProps = {},
        metric4SubMetricLabel,
        metric4MetricVarSlot,
        metric2SubMetricSlot,
        metric2SubMetricRuntimeProps = {},
        metric4SubMetricVarSlot = "+/- $0",
        metric4SubMetricSlot,
        metric2SubMetricVarRuntimeProps = {},
        metric4MetricVarText = "+/- $0",
        metric4SubMetricRuntimeProps = {},
        metric4SubMetricVarRuntimeProps = "$0",
        metric4MetricVarRuntimeProps = {},
        primaryMetricPrimaryMetricSlot,
        primaryMetricPrimaryMetricVarText = "+/- $0",
        primaryMetricPrimaryMetricVarRuntimeProps = {},
        primaryMetricPrimaryMetricVarSlot,
        metric1SubMetricVarText = "+/- $0",
        metric1MetricVarRuntimeProps = {},
        metric1SubMetricVarSlot,
        metric2SubMetricVarSlot,
        metric3SubMetricVarText = "+/- $0",
        metric3SubMetricRuntimeProps = {},
        metric3SubMetricVarSlot,
        chart1ChartSlot,
        chart1ChartRuntimeProps = {},
        chart2ChartRuntimeProps = {},
        chart2ChartSlot
    }
) {
    return (
        <_Component
            className="container"
            tag="div"
            grid={{
                type: "container"
            }}><_Builtin.HFlex className="kpi-card" tag="div"><_Builtin.VFlex className="kpi-card_left" tag="div"><_Builtin.HFlex className="kpi-card_top" tag="div"><_Builtin.Block className="kpi-card_sub-metric" tag="div"><_Builtin.Block className="kpi-card_label is-secondary" tag="div">{metric1SubMetricLabel}</_Builtin.Block><_Builtin.Block className="kpi-card_metric-wrapper" tag="div"><_Builtin.Block
                                    className="kpi-card_metric is-secondary"
                                    tag="div"
                                    {...metric1SubMetricRuntimeProps}>{metric1SubMetricSlot ?? metric1SubMetricText}</_Builtin.Block><_Builtin.Block className="kpi-card_delta" tag="div" {...metric1MetricVarRuntimeProps}>{metric1SubMetricVarSlot ?? metric1SubMetricVarText}</_Builtin.Block></_Builtin.Block></_Builtin.Block><_Builtin.Block className="kpi-card_sub-metric" tag="div"><_Builtin.Block className="kpi-card_label is-secondary" tag="div">{metric2SubMetricLabel}</_Builtin.Block><_Builtin.Block className="kpi-card_metric-wrapper" tag="div"><_Builtin.Block
                                    className="kpi-card_metric is-secondary"
                                    tag="div"
                                    {...metric2SubMetricRuntimeProps}>{metric2SubMetricSlot ?? metric2SubMetricText}</_Builtin.Block><_Builtin.Block className="kpi-card_delta" tag="div" {...metric2SubMetricVarRuntimeProps}>{metric2SubMetricVarSlot ?? metric4SubMetricVarSlot}</_Builtin.Block></_Builtin.Block></_Builtin.Block></_Builtin.HFlex><_Builtin.Block className="kpi-card_middle" tag="div"><_Builtin.Block className="kpi-card_primary-metric" tag="div"><_Builtin.VFlex className="flex-block" tag="div"><_Builtin.Heading
                                    className="kpi-card_label is-primary"
                                    tag={primaryMetricPrimaryMetricLabelTag}
                                    {...primaryMetricPrimaryMetricLabelRuntimeProps}>{primaryMetricPrimaryMetricLabelSlot ?? primaryMetricPrimaryMetricLabel}</_Builtin.Heading></_Builtin.VFlex><_Builtin.Block className="kpi-card_metric-wrapper" tag="div"><_Builtin.Block
                                    className="kpi-card_metric is-primary"
                                    tag="div"
                                    {...primaryMetricPrimaryMetricRuntimeProps}>{primaryMetricPrimaryMetricSlot ?? primaryMetricPrimaryMetricText}</_Builtin.Block><_Builtin.Block
                                    className="kpi-card_delta"
                                    tag="div"
                                    {...primaryMetricPrimaryMetricVarRuntimeProps}>{primaryMetricPrimaryMetricVarSlot ?? primaryMetricPrimaryMetricVarText}</_Builtin.Block></_Builtin.Block></_Builtin.Block></_Builtin.Block><_Builtin.HFlex className="kpi-card_bottom" tag="div"><_Builtin.Block className="kpi-card_sub-metric" tag="div"><_Builtin.Block className="kpi-card_label is-secondary" tag="div">{metric3SecondaryMetricLabel}</_Builtin.Block><_Builtin.Block className="kpi-card_metric-wrapper" tag="div"><_Builtin.Block
                                    className="kpi-card_metric is-secondary"
                                    tag="div"
                                    {...metric3SubMetricRuntimeProps}>{metric4SubMetricLabel ?? metric3SubMetricText}</_Builtin.Block><_Builtin.Block className="kpi-card_delta" tag="div" {...metric3SubMetricVarRuntimeProps}>{metric3SubMetricVarSlot ?? metric3SubMetricVarText}</_Builtin.Block></_Builtin.Block></_Builtin.Block><_Builtin.Block className="kpi-card_sub-metric" tag="div"><_Builtin.Block className="kpi-card_label is-secondary" tag="div">{metric4SecondaryMetricLabel}</_Builtin.Block><_Builtin.Block className="kpi-card_metric-wrapper" tag="div"><_Builtin.Block
                                    className="kpi-card_metric is-secondary"
                                    tag="div"
                                    {...metric4SubMetricRuntimeProps}>{metric4SubMetricSlot ?? metric4SubMetricVarRuntimeProps}</_Builtin.Block><_Builtin.Block className="kpi-card_delta" tag="div" {...metric4MetricVarRuntimeProps}>{metric4MetricVarSlot ?? metric4MetricVarText}</_Builtin.Block></_Builtin.Block></_Builtin.Block></_Builtin.HFlex></_Builtin.VFlex><_Builtin.VFlex className="kpi-card_rght" tag="div"><_Builtin.Block className="kpi-card_chart-wrapper is-chart-1" tag="div"><_Builtin.Block className="kpi-card_chart" tag="div" {...chart1ChartRuntimeProps}>{chart1ChartSlot}</_Builtin.Block></_Builtin.Block><_Builtin.Block className="kpi-card_chart-wrapper is-chart-2" tag="div"><_Builtin.Block className="kpi-card_chart" tag="div" {...chart2ChartRuntimeProps}>{chart2ChartSlot}</_Builtin.Block></_Builtin.Block></_Builtin.VFlex></_Builtin.HFlex></_Component>
    );
}