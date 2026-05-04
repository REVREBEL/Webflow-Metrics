import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function KpiCard(props: {
  /** Donut chart the includes a fill for current revenue OTB with the full amount as the total budget. In the center of the donut, it should include two row, the first with the total revenue remaining to book in order to reach budget with the label underneath.*/
  chart1DonutChartRuntimeProps?: Types.Devlink.RuntimeProps;
  /** This is a multi-layer concentric radial donut chart composed of three circular progress rings centered around a KPI label. Three equally centered donut rings stacked concentrically. Hollow center used as a metric callout.*/
  chart1DonutChartSlot?: Types.Devlink.Slot;
  chart2HorizontalBarChartRuntimeProps?: Types.Devlink.RuntimeProps;
  /** a vertical bar chart representing each day of the month. The Bar representing the budget revenue for the day with the fill represents revenue on the books revenue with a hover card that show the detailed revenue amounts.*/
  chart2HorizontalBarChartSlot?: Types.Devlink.Slot;
  /** Current Occupancy Variance to Budget. Format +/- 0.0%*/
  metric1MetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
  /** Current Occupancy On the Books. . Format 0.0%*/
  metric1SubMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  metric1SubMetricSlot?: Types.Devlink.Slot;
  metric1SubMetricVarSlot?: Types.Devlink.Slot;
  /** Insert the up arrow when positive or down arrow when negative.

        vars:
        var(--_apps---charts--positive)

        var(--_apps---charts--negative)

        icon:
        <FoundationIcon name="fi-arrow-up" | fi-arrow-down/>*/
  metric1VarianceIconSlot?: Types.Devlink.Slot;
  /** Current Rooms On the Books*/
  metric2SubMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  metric2SubMetricSlot?: Types.Devlink.Slot;
  /** Current Rooms Variance to Budget. Format +/- $0*/
  metric2SubMetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
  metric2SubMetricVarSlot?: Types.Devlink.Slot;
  /** Insert the up arrow when positive or down arrow when negative.

        vars:
        var(--_apps---charts--positive)

        var(--_apps---charts--negative)

        icon:
        <FoundationIcon name="fi-arrow-up" | fi-arrow-down/>*/
  metric2VarianceIconSlot?: Types.Devlink.Slot;
  /** Current ADR On the Books. Format $0.00*/
  metric3SubMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  metric3SubMetricSlot?: Types.Devlink.Slot;
  /** Current ADR Variance to Budget Format +/- $0.00*/
  metric3SubMetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
  metric3SubMetricVarSlot?: Types.Devlink.Slot;
  /** Insert the up arrow when positive or down arrow when negative.

        vars:
        var(--_apps---charts--positive)

        var(--_apps---charts--negative)

        icon:
        <FoundationIcon name="fi-arrow-up" | fi-arrow-down/>*/
  metric3VarianceIconSlot?: Types.Devlink.Slot;
  /** Current REVPAR On the Books. Format $0.00*/
  metric4SubMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  metric4SubMetricSlot?: Types.Devlink.Slot;
  /** Current REVPAR Variance to Budget Format +/- $0.00*/
  metric4SubMetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
  metric4SubMetricVarSlot?: Types.Devlink.Slot;
  /** Insert the up arrow when positive or down arrow when negative.

        vars:
        var(--_apps---charts--positive)

        var(--_apps---charts--negative)

        icon:
        <FoundationIcon name="fi-arrow-up" | fi-arrow-down/>*/
  metric4VarianceIconSlot?: Types.Devlink.Slot;
  /** Insert the up arrow when positive or down arrow when negative.

        vars:
        var(--_apps---charts--positive)

        var(--_apps---charts--negative)

        icon:
        <FoundationIcon name="fi-arrow-up" | fi-arrow-down/>*/
  primaryMetricArrowIconSlot?: Types.Devlink.Slot;
  /** Current Revenue On the Books. Format $0*/
  primaryMetricPrimaryMetricRuntimeProps?: Types.Devlink.RuntimeProps;
  primaryMetricPrimaryMetricSlot?: Types.Devlink.Slot;
  /** Current Revenue Variance to Budget. Format +/- $0*/
  primaryMetricPrimaryMetricVarRuntimeProps?: Types.Devlink.RuntimeProps;
  primaryMetricPrimaryMetricVarSlot?: Types.Devlink.Slot;
  /** Insert the up arrow when positive or down arrow when negative.

        vars:
        var(--_apps---charts--positive)

        var(--_apps---charts--negative)

        icon:
        <FoundationIcon name="fi-arrow-up" | fi-arrow-down/>*/
  primaryMetricVarianceIconSlot?: Types.Devlink.Slot;
}): React.JSX.Element;
