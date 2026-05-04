"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";
import Heading from "./webflow_modules/Basic/components/Heading";
import { MetricType } from "./MetricType";

export function PerformanceCardToolTip({
  adrAdrVarBudgetRuntimeProps = {},
  adrAdrVarBudgetSlot = "",
  adrTotalAdrotbRuntimeProps = {},
  adrTotalAdrotbSlot = "",
  adrTrnTotalAdrotbRuntimeProps = {},
  adrTrnTotalAdrotbSlot = "",
  revenueRevenueVarBudgetSlot = {},
  revenueRevenueVarBudgetSlot2 = "",
  revenueTrnRevenueVarBudgetRuntimeProps = "",
  revenueTrnRevenueVarBudgetSlot = {},
  revenueTrnTotalRevenueOtbMetricSlot = "",
  revenueTrnTotalRevenueOtbRuntimeProps = {},
  roomsRoomsVarBudgetRuntimeProps = {},
  roomsRoomsVarBudgetSlot = "",
  roomsTotalRoomsOtbRuntimeProps = {},
  roomsTotalRoomsOtbSlot = "",
  roomsTrnTotalRoomsOtbSlot = "",
  totalRevenueOtbRuntimeProps = {},
  totalRevenueOtbSlot = "",
  trnTotalRoomsOtbRuntimeProps = {},
}) {
  return (
    <div
      className={DEVLINK_SCOPE_CLASS}
      style={{
        display: "contents",
      }}
    >
      <Block className={"performance-card_tool-tip-wrapper"} tag={"div"}>
        <Block tag={"div"}>
          <Heading className={"tool-tip_headline is-underline"} tag={"h1"}>
            {"Budget Reach "}
          </Heading>
          <Block className={"tool-tip_wrapper padding-bottom-sm"} tag={"div"}>
            <Block className={"group-wrapper text-color-primary"} tag={"div"}>
              <MetricType layout={"Horizontal 1row"} metricType={"Occupancy"} />
              <MetricType layout={"Horizontal 1row"} metricType={"ADR"} />
              <MetricType
                layout={"Horizontal 1row"}
                metricType={"RevPar"}
                varianceType={"var"}
              />
            </Block>
          </Block>
        </Block>
      </Block>
    </div>
  );
}
