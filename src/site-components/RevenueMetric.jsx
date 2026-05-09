"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";

export function RevenueMetric({
  text1 = "Revenue",
  text2 = "$0,000",
  text3 = "$0,000",
}) {
  return (
    <div
      className={DEVLINK_SCOPE_CLASS}
      style={{
        display: "contents",
      }}
    >
      <Block
        className={"metric-wrapper is-horizontal is-gap-col_1rem"}
        tag={"div"}
      >
        <Block className={"metric-label is-align-top"} tag={"div"}>
          {text1}
        </Block>
        <Block className={"metric-wrapper"} tag={"div"}>
          <Block className={"metric-value is-current-0dp"} tag={"div"}>
            {text2}
          </Block>
          <Block className={"metric-value is-current-0dp is-var"} tag={"div"}>
            {text3}
          </Block>
        </Block>
      </Block>
    </div>
  );
}
