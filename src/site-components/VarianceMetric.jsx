"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";

export function VarianceMetric({
  iconTrendIRuntimeProps = {},
  iconTrendISlot = "",
  iconTrendVisibility = true,
  metricVarRuntimeProps = {},
  metricVarSlot = "",
  varianceFormat = "",
  varianceLabel = "var",
  varianceLabelVisibility = true,
  varianceType = "Base",
  varianceVisibility = true,
}) {
  const _styleVariantMap = {
    Base: "",
    "to book": "w-variant-5a208db1-adb0-5415-f462-a9f23d8d06a3",
    "%chg": "w-variant-16fa5099-487d-73c7-7798-152461567107",
    var: "w-variant-55e9aca6-2b1c-5de3-ba3a-18938ab2661f",
    "var STLY": "w-variant-495572c8-ad31-9ce2-be19-3b503ecb11e9",
    "var PY": "w-variant-f8900bb6-67b5-ad07-be87-4fcb77d764c9",
    "var WOW": "w-variant-9f73190f-f31f-dc92-ccc5-5e12cda25509",
  };

  const _activeStyleVariant = _styleVariantMap[varianceType];

  return (
    <div
      className={DEVLINK_SCOPE_CLASS}
      style={{
        display: "contents",
      }}
    >
      <Block
        className={`variant_metric-var-wrapper ${_activeStyleVariant}`}
        tag={"div"}
      >
        {iconTrendVisibility ? (
          <Block
            className={`icon-trend-indicator ${_activeStyleVariant}`}
            tag={"div"}
            {...iconTrendIRuntimeProps}
          >
            {iconTrendISlot}
          </Block>
        ) : null}
        {varianceVisibility ? (
          <Block
            className={`metric-value is-var ${_activeStyleVariant}`}
            tag={"div"}
            variance-format={varianceFormat}
            {...metricVarRuntimeProps}
          >
            {metricVarSlot ?? "0.0%"}
          </Block>
        ) : null}
        {varianceLabelVisibility ? (
          <Block
            className={`metric-var-label ${_activeStyleVariant}`}
            tag={"div"}
            variance-format={varianceFormat}
          >
            {varianceLabel}
          </Block>
        ) : null}
      </Block>
    </div>
  );
}
