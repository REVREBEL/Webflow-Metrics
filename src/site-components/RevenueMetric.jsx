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
        <Block
          className={"metric-label is-align-top"}
          id={"w-node-_0fe37f4e-7fd7-7fc6-89c9-4040519d9e4d-519d9e4c"}
          tag={"div"}
        >
          {text1}
        </Block>
        <Block
          className={"metric-wrapper"}
          id={"w-node-_0fe37f4e-7fd7-7fc6-89c9-4040519d9e4f-519d9e4c"}
          tag={"div"}
        >
          <Block
            className={"metric-value is-current-0dp"}
            id={"w-node-_0fe37f4e-7fd7-7fc6-89c9-4040519d9e50-519d9e4c"}
            tag={"div"}
          >
            {text2}
          </Block>
          <Block
            className={"metric-value is-current-0dp is-var"}
            id={"w-node-_0fe37f4e-7fd7-7fc6-89c9-4040519d9e52-519d9e4c"}
            tag={"div"}
          >
            {text3}
          </Block>
        </Block>
      </Block>
    </div>
  );
}
