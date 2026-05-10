"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";

export function ChartByDayMix({
  chartTitle = "TRANSIENTVSGROUP OTB BYDAY",
  horizontalAxis,
  stackedBarChartSlot,
  text1 = "capactity",
  text2 = "0102030405060708 091011121314151617 1819202122232425 2627282930",
}) {
  return (
    <div
      className={DEVLINK_SCOPE_CLASS}
      style={{
        display: "contents",
      }}
    >
      <Block className={"bar-mix-card add-shadow"} tag={"div"}>
        <Block className={"bar-mix-card_plot-area"} tag={"div"}>
          <Block className={"chart-container"} tag={"div"}>
            {stackedBarChartSlot}
            {horizontalAxis}
          </Block>
        </Block>
        <Block className={"flex_vertical"} tag={"div"}>
          <Block className={"kpi-card_label is-secondary"} tag={"div"}>
            {chartTitle}
          </Block>
        </Block>
      </Block>
    </div>
  );
}
