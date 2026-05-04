"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";

export function AdrMetric({ text1 = "ADR", text2 = "$0.00", text3 = "$0.00" }) {
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
          id={"w-node-_7f83337e-e4e7-87aa-0f6e-219010f89298-10f89297"}
          tag={"div"}
        >
          {text1}
        </Block>
        <Block
          className={"metric-wrapper"}
          id={"w-node-_7f83337e-e4e7-87aa-0f6e-219010f8929a-10f89297"}
          tag={"div"}
        >
          <Block
            className={"metric-value is-currency-2dp"}
            id={"w-node-_7f83337e-e4e7-87aa-0f6e-219010f8929b-10f89297"}
            tag={"div"}
          >
            {text2}
          </Block>
          <Block
            className={"metric-value is-currency-2dp is-var"}
            id={"w-node-_7f83337e-e4e7-87aa-0f6e-219010f8929d-10f89297"}
            tag={"div"}
          >
            {text3}
          </Block>
        </Block>
      </Block>
    </div>
  );
}
