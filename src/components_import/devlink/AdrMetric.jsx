"use client";
import React from "react";
import _styles from "./css/classes.module.css";
import * as _utils from "./webflow_modules/utils";
import Block from "./webflow_modules/Basic/components/Block";

export function AdrMetric({ text1 = "ADR", text2 = "$0.00", text3 = "$0.00" }) {
  return (
    <Block
      className={_utils.cx(
        _styles,
        "metric-wrapper",
        "is-horizontal",
        "is-gap-col_1rem"
      )}
      tag={"div"}
    >
      <Block
        className={_utils.cx(_styles, "metric-label", "is-align-top")}
        tag={"div"}
      >
        {text1}
      </Block>
      <Block className={_utils.cx(_styles, "metric-wrapper")} tag={"div"}>
        <Block
          className={_utils.cx(_styles, "metric-value", "is-currency-2dp")}
          tag={"div"}
        >
          {text2}
        </Block>
        <Block
          className={_utils.cx(
            _styles,
            "metric-value",
            "is-currency-2dp",
            "is-var"
          )}
          tag={"div"}
        >
          {text3}
        </Block>
      </Block>
    </Block>
  );
}
