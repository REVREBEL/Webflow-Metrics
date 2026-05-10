"use client";
import React from "react";
import _styles from "./css/classes.module.css";
import * as _utils from "./webflow_modules/utils";
import Block from "./webflow_modules/Basic/components/Block";
import { MetricLayout } from "./MetricLayout";
import { applyPredicate } from "./webflow_modules/Conditions/helpers/applyPredicate";
import { styleVariantIsAny } from "./webflow_modules/Basic/helpers/styleVariantIsAny";

export function MetricType({
  abbreviatedMetric = false,
  iconTrendIndicatorRuntimeProps = {},
  iconTrendIndicatorSlot = "",
  iconTrendVisibility = true,
  layout = "Horizontal 2row",
  metricRuntimeProps = {},
  metricSlot = "",
  metricType = "Base",
  varianceLabelVisibility = true,
  varianceMetricRuntimeProps = {},
  varianceMetricSlot = "",
  varianceMetricVisibility = true,
  varianceType = "Base",
}) {
  const _styleVariantMap = {
    Base: "",
    Occupancy: "w-variant-840e49f9-c7e1-c99f-20ad-590baef4b13f",
    Rooms: "w-variant-dfb3022a-7e3d-78d2-88e5-e7225577a541",
    ADR: "w-variant-452a1012-a794-3482-1f24-c0d146b9f2df",
    Revenue: "w-variant-466d4594-9b99-6ec0-5480-0bbe181b5285",
    RevPar: "w-variant-31ee03ce-538e-d645-bc5f-e3f564b7a7c9",
    Nights: "w-variant-737a8317-d602-a65c-ba99-d8642d5c3810",
    Reservations: "w-variant-d01044fd-794c-3a94-7ae5-0e8e2b975ac3",
    Guests: "w-variant-3c73d169-68b8-88d7-7ca8-bfde87b648c6",
  };

  const _activeStyleVariant = _styleVariantMap[metricType];

  return (
    <Block
      className={_utils.cx(_styles, "metric-container", _activeStyleVariant)}
      tag={"div"}
    >
      <MetricLayout
        iconTrendRuntimeProps={iconTrendIndicatorRuntimeProps}
        iconTrendSlot={iconTrendIndicatorSlot}
        iconTrendVisibility={iconTrendVisibility}
        layoutVariant={layout}
        metricFormat={
          applyPredicate(metricType)(styleVariantIsAny(["Occupancy"]))
            ? "0.0%"
            : applyPredicate(metricType)(
                styleVariantIsAny(["Rooms", "Nights", "Reservations", "Guests"])
              )
            ? "0,000"
            : applyPredicate(metricType)(styleVariantIsAny(["ADR", "RevPar"]))
            ? "$0,000.00"
            : applyPredicate(metricType)(styleVariantIsAny(["Revenue"]))
            ? "$0,000"
            : "0.00"
        }
        metricRuntimeProps={metricRuntimeProps}
        metricSlot={metricSlot}
        metricType={
          abbreviatedMetric &&
          applyPredicate(metricType)(styleVariantIsAny(["Occupancy"]))
            ? ["Occp"]
            : !abbreviatedMetric &&
              applyPredicate(metricType)(styleVariantIsAny(["Occupancy"]))
            ? ["Occupancy"]
            : applyPredicate(metricType)(styleVariantIsAny(["ADR"]))
            ? ["ADR"]
            : abbreviatedMetric &&
              applyPredicate(metricType)(styleVariantIsAny(["Revenue"]))
            ? ["Rev"]
            : !abbreviatedMetric &&
              applyPredicate(metricType)(styleVariantIsAny(["Revenue"]))
            ? ["Revenue"]
            : applyPredicate(metricType)(styleVariantIsAny(["RevPar"]))
            ? ["RevPar"]
            : abbreviatedMetric &&
              applyPredicate(metricType)(styleVariantIsAny(["Reservations"]))
            ? ["Resvn"]
            : !abbreviatedMetric &&
              applyPredicate(metricType)(styleVariantIsAny(["Reservations"]))
            ? ["Reservations"]
            : abbreviatedMetric &&
              applyPredicate(metricType)(styleVariantIsAny(["Nights"]))
            ? ["Nts"]
            : !abbreviatedMetric &&
              applyPredicate(metricType)(styleVariantIsAny(["Nights"]))
            ? ["Nights"]
            : applyPredicate(metricType)(styleVariantIsAny(["Guests"]))
            ? ["Guests"]
            : ["Metric"]
        }
        metricVarRuntimeProps={varianceMetricRuntimeProps}
        metricVarSlot={varianceMetricSlot}
        varianceFormat={
          applyPredicate(varianceType)(styleVariantIsAny(["%chg"])) &&
          applyPredicate(metricType)(
            styleVariantIsAny([
              "Occupancy",
              "Rooms",
              "ADR",
              "Revenue",
              "RevPar",
              "Nights",
              "Reservations",
              "Guests",
            ])
          )
            ? "+/- 0.0%"
            : applyPredicate(varianceType)(
                styleVariantIsAny(["var", "var STLY", "var PY", "var WOW"])
              ) && applyPredicate(metricType)(styleVariantIsAny(["Occupancy"]))
            ? "+/- 0.0%"
            : applyPredicate(varianceType)(
                styleVariantIsAny([
                  "var",
                  "var STLY",
                  "var PY",
                  "var WOW",
                  "to book",
                ])
              ) &&
              applyPredicate(metricType)(
                styleVariantIsAny(["Rooms", "Nights", "Reservations", "Guests"])
              )
            ? "+/- 0,000"
            : applyPredicate(varianceType)(
                styleVariantIsAny([
                  "var",
                  "to book",
                  "var STLY",
                  "var PY",
                  "var WOW",
                ])
              ) &&
              applyPredicate(metricType)(styleVariantIsAny(["ADR", "RevPar"]))
            ? "+/- $0,000.00"
            : applyPredicate(varianceType)(
                styleVariantIsAny([
                  "var",
                  "var STLY",
                  "to book",
                  "var PY",
                  "var WOW",
                ])
              ) && applyPredicate(metricType)(styleVariantIsAny(["Revenue"]))
            ? "+/- $0,000"
            : "0.00"
        }
        varianceLabel={
          applyPredicate(varianceType)(styleVariantIsAny(["to book"]))
            ? ["to book"]
            : applyPredicate(varianceType)(styleVariantIsAny(["%chg"]))
            ? ["%chg"]
            : applyPredicate(varianceType)(styleVariantIsAny(["var"]))
            ? ["var"]
            : applyPredicate(varianceType)(styleVariantIsAny(["var STLY"]))
            ? ["var STLY"]
            : applyPredicate(varianceType)(styleVariantIsAny(["var PY"]))
            ? ["var PY"]
            : applyPredicate(varianceType)(styleVariantIsAny(["var WOW"]))
            ? ["var WOW"]
            : ["var"]
        }
        varianceLabelVisibility={varianceLabelVisibility}
        varianceType={varianceType}
        varianceVisibility={true}
      />
    </Block>
  );
}
