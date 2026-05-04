"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";
import BlockContainer from "./webflow_modules/Layout/components/BlockContainer";
import Heading from "./webflow_modules/Basic/components/Heading";
import HFlex from "./webflow_modules/Layout/components/HFlex";
import VFlex from "./webflow_modules/Layout/components/VFlex";

export function KpiCard({
  chart1DonutChartRuntimeProps = {},
  chart1DonutChartSlot = "",
  chart2HorizontalBarChartRuntimeProps = {},
  chart2HorizontalBarChartSlot = "",
  metric1MetricVarRuntimeProps = {},
  metric1SubMetricRuntimeProps = {},
  metric1SubMetricSlot = "",
  metric1SubMetricVarSlot = "",
  metric1VarianceIconSlot = "",
  metric2SubMetricRuntimeProps = {},
  metric2SubMetricSlot = "",
  metric2SubMetricVarRuntimeProps = {},
  metric2SubMetricVarSlot = "",
  metric2VarianceIconSlot = "",
  metric3SubMetricRuntimeProps = {},
  metric3SubMetricSlot = "",
  metric3SubMetricVarRuntimeProps = {},
  metric3SubMetricVarSlot = "",
  metric3VarianceIconSlot = "",
  metric4SubMetricRuntimeProps = {},
  metric4SubMetricSlot = "",
  metric4SubMetricVarRuntimeProps = {},
  metric4SubMetricVarSlot = "",
  metric4VarianceIconSlot = "",
  primaryMetricArrowIconSlot = "",
  primaryMetricPrimaryMetricRuntimeProps = {},
  primaryMetricPrimaryMetricSlot = "",
  primaryMetricPrimaryMetricVarRuntimeProps = {},
  primaryMetricPrimaryMetricVarSlot = "",
  primaryMetricVarianceIconSlot = "",
}) {
  return (
    <div
      className={DEVLINK_SCOPE_CLASS}
      style={{
        display: "contents",
      }}
    >
      <BlockContainer
        className={"metric-container"}
        grid={{
          type: "container",
        }}
        tag={"div"}
      >
        <HFlex className={"kpi-card add-shadow"} tag={"div"}>
          <VFlex className={"kpi-card_left"} tag={"div"}>
            <HFlex className={"kpi-card_top"} tag={"div"}>
              <Block className={"kpi-card_sub-metric"} tag={"div"}>
                <Block className={"kpi-card_label is-secondary"} tag={"div"}>
                  {"Occp"}
                  <br />
                </Block>
                <Block className={"kpi-card_metric-wrapper"} tag={"div"}>
                  <Block
                    className={"kpi-card_metric is-secondary"}
                    tag={"div"}
                    {...metric1SubMetricRuntimeProps}
                  >
                    {metric1SubMetricSlot ?? "$0"}
                  </Block>
                  <Block className={"kpi-card_var-wrapper"} tag={"div"}>
                    <Block
                      className={"kpi-card_delta"}
                      tag={"div"}
                      {...metric1MetricVarRuntimeProps}
                    >
                      {metric1SubMetricVarSlot ?? "$0"}
                    </Block>
                    <Block className={"arrow-icon"} tag={"div"}>
                      {metric1VarianceIconSlot}
                    </Block>
                  </Block>
                </Block>
              </Block>
              <Block className={"kpi-card_sub-metric"} tag={"div"}>
                <Block className={"kpi-card_label is-secondary"} tag={"div"}>
                  {"Rooms"}
                </Block>
                <Block className={"kpi-card_metric-wrapper"} tag={"div"}>
                  <Block
                    className={"kpi-card_metric is-secondary"}
                    tag={"div"}
                    {...metric2SubMetricRuntimeProps}
                  >
                    {metric2SubMetricSlot ?? "$0"}
                  </Block>
                  <Block className={"kpi-card_var-wrapper"} tag={"div"}>
                    <Block
                      className={"kpi-card_delta"}
                      tag={"div"}
                      {...metric2SubMetricVarRuntimeProps}
                    >
                      {metric2SubMetricVarSlot ?? "$0"}
                    </Block>
                    <Block className={"arrow-icon"} tag={"div"}>
                      {metric2VarianceIconSlot}
                    </Block>
                  </Block>
                </Block>
              </Block>
            </HFlex>
            <Block className={"kpi-card_middle"} tag={"div"}>
              <Block className={"kpi-card_primary-metric"} tag={"div"}>
                <VFlex className={"flex-block"} tag={"div"}>
                  <Heading className={"kpi-card_label is-primary"} tag={"h1"}>
                    {"Budget"}
                  </Heading>
                </VFlex>
                <Block className={"kpi-card_metric-wrapper"} tag={"div"}>
                  <Block
                    className={"kpi-card_metric is-primary"}
                    tag={"div"}
                    {...primaryMetricPrimaryMetricRuntimeProps}
                  >
                    {primaryMetricPrimaryMetricSlot ?? "$0"}
                  </Block>
                  <Block className={"kpi-card_var-wrapper"} tag={"div"}>
                    <Block
                      className={"kpi-card_delta"}
                      tag={"div"}
                      {...primaryMetricPrimaryMetricVarRuntimeProps}
                    >
                      {primaryMetricPrimaryMetricVarSlot ?? "+/- $0"}
                    </Block>
                    <Block className={"arrow-icon"} tag={"div"}>
                      {primaryMetricVarianceIconSlot}
                    </Block>
                  </Block>
                </Block>
              </Block>
            </Block>
            <HFlex className={"kpi-card_bottom"} tag={"div"}>
              <Block className={"kpi-card_sub-metric"} tag={"div"}>
                <Block className={"kpi-card_label is-secondary"} tag={"div"}>
                  {"ADR"}
                </Block>
                <Block className={"kpi-card_metric-wrapper"} tag={"div"}>
                  <Block
                    className={"kpi-card_metric is-secondary"}
                    tag={"div"}
                    {...metric3SubMetricRuntimeProps}
                  >
                    {metric3SubMetricSlot ?? "$0"}
                  </Block>
                  <Block className={"kpi-card_var-wrapper"} tag={"div"}>
                    <Block
                      className={"kpi-card_delta"}
                      tag={"div"}
                      {...metric3SubMetricVarRuntimeProps}
                    >
                      {metric3SubMetricVarSlot ?? "$0"}
                    </Block>
                    <Block className={"arrow-icon"} tag={"div"}>
                      {metric3VarianceIconSlot}
                    </Block>
                  </Block>
                </Block>
              </Block>
              <Block className={"kpi-card_sub-metric"} tag={"div"}>
                <Block className={"kpi-card_label is-secondary"} tag={"div"}>
                  {"REVPAR"}
                </Block>
                <Block className={"kpi-card_metric-wrapper"} tag={"div"}>
                  <Block
                    className={"kpi-card_metric is-secondary"}
                    tag={"div"}
                    {...metric4SubMetricRuntimeProps}
                  >
                    {metric4SubMetricSlot ?? "$0"}
                  </Block>
                  <Block className={"kpi-card_var-wrapper"} tag={"div"}>
                    <Block
                      className={"kpi-card_delta"}
                      tag={"div"}
                      {...metric4SubMetricVarRuntimeProps}
                    >
                      {metric4SubMetricVarSlot ?? "$0"}
                    </Block>
                    <Block className={"arrow-icon"} tag={"div"}>
                      {metric4VarianceIconSlot}
                    </Block>
                  </Block>
                </Block>
              </Block>
            </HFlex>
          </VFlex>
          <VFlex className={"kpi-card_right"} tag={"div"}>
            <Block className={"kpi-card_chart-wrapper is-chart-1"} tag={"div"}>
              <Block
                className={"kpi-card_chart is-donut-chart"}
                tag={"div"}
                {...chart1DonutChartRuntimeProps}
              >
                {chart1DonutChartSlot}
              </Block>
            </Block>
            <Block className={"kpi-card_chart-wrapper is-chart-2"} tag={"div"}>
              <Block
                className={"kpi-card_chart is-bar-chart"}
                tag={"div"}
                {...chart2HorizontalBarChartRuntimeProps}
              >
                {chart2HorizontalBarChartSlot}
              </Block>
            </Block>
          </VFlex>
        </HFlex>
        <Block className={"variable-classes"} tag={"div"}>
          <Block className={"is-positive"} tag={"div"} />
          <Block className={"is-negative"} tag={"div"} />
        </Block>
      </BlockContainer>
    </div>
  );
}
