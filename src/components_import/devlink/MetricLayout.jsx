"use client";
import React from "react";
import _styles from "./css/classes.module.css";
import * as _utils from "./webflow_modules/utils";
import Block from "./webflow_modules/Basic/components/Block";
import { VarianceMetric } from "./VarianceMetric";
import { applyPredicate } from "./webflow_modules/Conditions/helpers/applyPredicate";
import { textEquals } from "./webflow_modules/ListOfElements/helpers/textEquals";

export function MetricLayout({
  iconTrendRuntimeProps = {},
  iconTrendSlot = "",
  iconTrendVisibility = true,
  layoutVariant = "Base",
  metricFormat = "",
  metricRuntimeProps = {},
  metricSlot = "",
  metricType = "Metric",
  metricVarRuntimeProps = {},
  metricVarSlot = "",
  varianceFormat = "",
  varianceLabel = "",
  varianceLabelVisibility = true,
  varianceType = "Base",
  varianceVisibility = true,
}) {
  const _styleVariantMap = {
    Base: "",
    "Stacked 1col": "w-variant-cab6023c-c17b-7b7d-d1e8-f96d3208cef3",
    "Stacked 2col": "w-variant-a2d9e3e0-ad04-56a5-9081-8511abd31f89",
    "Horizontal 1row": "w-variant-a51da88e-539d-cb36-dadf-9db9304e7240",
    "Horizontal 2row": "w-variant-ec6d0ee7-c91c-f4fd-4924-f609fda4338f",
  };

  const _activeStyleVariant = _styleVariantMap[layoutVariant];

  return (
    <Block
      className={_utils.cx(
        _styles,
        "variant_metric-container",
        _activeStyleVariant
      )}
      fontSize={
        applyPredicate(metricType)(
          textEquals({
            text: "",
            caseSensitive: false,
          })
        )
          ? ""
          : ""
      }
      tag={"div"}
    >
      <Block
        className={_utils.cx(
          _styles,
          "variant_metric-label",
          _activeStyleVariant
        )}
        metric-type={
          applyPredicate(metricType)(
            textEquals({
              text: "Occp",
              caseSensitive: false,
            })
          )
            ? "0.0%"
            : applyPredicate(metricType)(
                textEquals({
                  text: "Rooms",
                  caseSensitive: false,
                })
              ) ||
              applyPredicate(metricType)(
                textEquals({
                  text: "Nights",
                  caseSensitive: false,
                })
              ) ||
              applyPredicate(metricType)(
                textEquals({
                  text: "Resvn",
                  caseSensitive: false,
                })
              ) ||
              applyPredicate(metricType)(
                textEquals({
                  text: "Guests",
                  caseSensitive: false,
                })
              )
            ? "0,000"
            : applyPredicate(metricType)(
                textEquals({
                  text: "ADR",
                  caseSensitive: false,
                })
              ) &&
              applyPredicate(metricType)(
                textEquals({
                  text: "RevPar",
                  caseSensitive: false,
                })
              )
            ? "$0,000.00"
            : applyPredicate(metricType)(
                textEquals({
                  text: "Revenue",
                  caseSensitive: false,
                })
              )
            ? "$0,000"
            : ""
        }
        tag={"div"}
      >
        {metricType}
      </Block>
      <Block
        className={_utils.cx(
          _styles,
          "variant_metric-wrapper",
          "is-gap-col_1-2rem",
          _activeStyleVariant
        )}
        tag={"div"}
      >
        <Block
          className={_utils.cx(
            _styles,
            "metric-value",
            "add-front-padding",
            _activeStyleVariant
          )}
          metric-format={metricFormat}
          tag={"div"}
        >
          {"0.00"}
        </Block>
        <VarianceMetric
          iconTrendIRuntimeProps={iconTrendRuntimeProps}
          iconTrendISlot={""}
          iconTrendVisibility={iconTrendVisibility}
          metricVarRuntimeProps={metricVarRuntimeProps}
          metricVarSlot={""}
          varianceFormat={varianceFormat}
          varianceLabel={varianceLabel}
          varianceLabelVisibility={varianceLabelVisibility}
          varianceType={varianceType}
          varianceVisibility={varianceVisibility}
        />
      </Block>
    </Block>
  );
}
